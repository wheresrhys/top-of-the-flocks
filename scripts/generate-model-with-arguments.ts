#!/usr/bin/env tsx
/**
 * Generate Model configuration with arguments mapping for native operation collections
 * This script reads the introspected schema and creates/updates Models with proper argument mapping
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, basename } from 'path';

interface CollectionArgument {
  name: string;
  type: string;
  description?: string;
}

interface CollectionInfo {
  name: string;
  arguments: CollectionArgument[];
  returnType: string;
}

function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function snakeToPascal(str: string): string {
  return str
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

function camelToPascal(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function pgScalarTypeToHasuraType(pgScalarType: string): string {
  const normalized = pgScalarType.toLowerCase();
  const mapping: Record<string, string> = {
    'text': 'String_1',
    'varchar': 'String_1',
    'int4': 'Int64',  // PostgreSQL int4 maps to Int64 in Hasura DDN
    'int8': 'Int64',
    'bigint': 'Int64',
    'int2': 'Int16',
    'smallint': 'Int16',
    'float4': 'Float32',
    'real': 'Float32',
    'float8': 'Float64',
    'double precision': 'Float64',
    'numeric': 'Bigdecimal',
    'decimal': 'Bigdecimal',
    'date': 'Date',
    'timestamp': 'Date',
    'timestamptz': 'Date',
    'boolean': 'Boolean1',
    'bool': 'Boolean1',
  };

  return mapping[normalized] || 'String_1';
}

function parseCollectionFromTotfHml(totfHmlPath: string, collectionName: string): CollectionInfo | null {
  const content = readFileSync(totfHmlPath, 'utf-8');

  // Find the collection definition - look for the collection name first, then find the arguments block immediately before it
  // This ensures we match the correct arguments block for this specific collection
  const collectionNamePattern = new RegExp(
    `name:\\s+${collectionName}\\s*\\n\\s+type:\\s+(\\w+)`,
    'm'
  );

  const nameMatch = content.match(collectionNamePattern);
  if (!nameMatch) return null;

  const returnType = nameMatch[1];

  // Find the position of the collection name
  const nameIndex = content.indexOf(`name: ${collectionName}`);
  if (nameIndex === -1) return null;

  // Look backwards from the collection name to find the immediately preceding arguments block
  // Find the last occurrence of "- arguments:" before the collection name
  const beforeName = content.substring(0, nameIndex);
  const argsStartPattern = /-\s+arguments:/g;
  let lastArgsStartIndex = -1;
  let match;

  // Find all "- arguments:" occurrences before the collection name
  while ((match = argsStartPattern.exec(beforeName)) !== null) {
    lastArgsStartIndex = match.index;
  }

  if (lastArgsStartIndex === -1) return null;

  // Extract the arguments section from the last "- arguments:" until just before "name: ${collectionName}"
  const argsSection = beforeName.substring(lastArgsStartIndex).replace(/^-\s+arguments:\s*/, '');

  // Parse arguments from YAML format
  // Format: arg_name:\n              description: |\n                Default: 5\n              type:\n                type: nullable\n                underlying_type:\n                  name: int4
  const args: CollectionArgument[] = [];

  // Match each argument block
  const argBlockPattern = /(\w+):\s*\n\s+description:\s*(?:\|\s*\n\s+)?([\s\S]*?)\s+type:\s*\n\s+type:\s+nullable\s*\n\s+underlying_type:\s*\n\s+name:\s+(\w+)/g;
  let argMatch;

  while ((argMatch = argBlockPattern.exec(argsSection)) !== null) {
    const argName = argMatch[1];
    const description = argMatch[2].trim().replace(/\n\s*/g, ' ').trim();
    const pgType = argMatch[3];

    args.push({
      name: argName,
      type: pgType,
      description: description || undefined,
    });
  }

  return {
    name: collectionName,
    arguments: args,
    returnType,
  };
}

function generateModelHml(collectionInfo: CollectionInfo, returnTypePascal: string): string {
  // Collection name is already in camelCase (e.g., topSessionsByMetric)
  // Convert to PascalCase for Model name
  const modelName = camelToPascal(collectionInfo.name);
  const camelCaseName = collectionInfo.name; // Already in camelCase

  // Generate arguments section
  const argumentsSection = collectionInfo.arguments.map(arg => {
    const hasuraType = pgScalarTypeToHasuraType(arg.type);
    const camelArgName = snakeToCamel(arg.name);
    const description = arg.description ? `description: "${arg.description}"` : '';

    return `    - name: ${camelArgName}
      type: ${hasuraType}
      ${description}`;
  }).join('\n');

  // Generate argument mapping
  const argumentMapping = collectionInfo.arguments.map(arg => {
    const camelArgName = snakeToCamel(arg.name);
    return `      ${camelArgName}: ${arg.name}`;
  }).join('\n');

  return `---
kind: Model
version: v2
definition:
  name: ${modelName}
  objectType: ${returnTypePascal}
  arguments:
${argumentsSection}
  source:
    dataConnectorName: totf
    collection: ${collectionInfo.name}
    argumentMapping:
${argumentMapping}
  filterExpressionType: ${returnTypePascal}BoolExp
  aggregateExpression: ${returnTypePascal}AggExp
  orderByExpression: ${returnTypePascal}OrderByExp
  graphql:
    selectMany:
      queryRootField: ${camelCaseName}
      subscription:
        rootField: ${camelCaseName}
    selectUniques: []
    argumentsInputType: ${modelName}Arguments
    filterInputTypeName: ${returnTypePascal}FilterInput
    aggregate:
      queryRootField: ${camelCaseName}Aggregate
      subscription:
        rootField: ${camelCaseName}Aggregate

---
kind: ModelPermissions
version: v1
definition:
  modelName: ${modelName}
  permissions:
    - role: admin
      select:
        filter: null
        allowSubscriptions: true
`;
}

function main() {
  const collectionName = process.argv[2];
  const returnTableName = process.argv[3];

  if (!collectionName || !returnTableName) {
    console.error('Usage: tsx scripts/generate-model-with-arguments.ts <collection_name> <return_table_name>');
    console.error('');
    console.error('Example:');
    console.error('  tsx scripts/generate-model-with-arguments.ts topSessionsByMetric top_sessions_result');
    process.exit(1);
  }

  // Find project root
  let projectRoot = process.cwd();
  if (basename(projectRoot) === 'hasura') {
    projectRoot = join(projectRoot, '..');
  }

  const totfHmlPath = join(projectRoot, 'hasura', 'app', 'metadata', 'totf.hml');

  if (!existsSync(totfHmlPath)) {
    console.error(`totf.hml not found at: ${totfHmlPath}`);
    console.error('Please run introspection first: cd hasura && ddn connector introspect totf');
    process.exit(1);
  }

  // Parse collection info from totf.hml
  const collectionInfo = parseCollectionFromTotfHml(totfHmlPath, collectionName);

  if (!collectionInfo) {
    console.error(`Collection ${collectionName} not found in totf.hml`);
    console.error('Make sure you have run: cd hasura && ddn connector introspect totf');
    process.exit(1);
  }

  if (collectionInfo.arguments.length === 0) {
    console.log(`Collection ${collectionName} has no arguments`);
    console.log('This collection will be handled by standard Model generation');
    process.exit(0);
  }

  console.log(`Found collection ${collectionName} with ${collectionInfo.arguments.length} argument(s)`);
  collectionInfo.arguments.forEach(arg => {
    console.log(`  - ${arg.name}: ${arg.type}${arg.description ? ` (${arg.description})` : ''}`);
  });

  // Generate Model HML
  const returnTypePascal = snakeToPascal(returnTableName);
  const modelHml = generateModelHml(collectionInfo, returnTypePascal);
  const modelName = snakeToPascal(collectionName);
  const hmlPath = join(projectRoot, 'hasura', 'app', 'metadata', `${modelName}.hml`);

  // Write the Model file
  writeFileSync(hmlPath, modelHml, 'utf-8');
  console.log(`\n✓ Generated Model file: ${hmlPath}`);
  console.log('\nNext steps:');
  console.log('  1. Review the generated Model file');
  console.log('  2. Run: cd hasura && ddn supergraph build local');
  console.log('  3. Run: npm run hasura:types');
}

main();
