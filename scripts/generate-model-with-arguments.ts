#!/usr/bin/env tsx
/**
 * Generate Model configuration with arguments mapping for native operation collections
 * This script reads the introspected schema and creates/updates Models with proper argument mapping
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, basename } from 'path';
import { parseDocument } from 'yaml';

interface CollectionArgument {
  name: string;
  type: string;
  description?: string;
  isArray?: boolean;
  elementType?: string;
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

/**
 * Extract type information from HML type structure
 * Handles nullable wrappers, array types, and scalar types
 */
function extractTypeFromHmlType(typeObj: any): { scalarType: string; isArray: boolean; elementType?: string } {
  if (!typeObj || typeof typeObj !== 'object') {
    return { scalarType: 'text', isArray: false };
  }

  // Handle nullable wrapper
  if (typeObj.type === 'nullable' && typeObj.underlying_type) {
    return extractTypeFromHmlType(typeObj.underlying_type);
  }

  // Handle array type
  if (typeObj.type === 'array' && typeObj.element_type) {
    const elementInfo = extractTypeFromHmlType(typeObj.element_type);
    return {
      scalarType: elementInfo.scalarType,
      isArray: true,
      elementType: elementInfo.scalarType,
    };
  }

  // Handle named scalar type
  if (typeObj.type === 'named' && typeObj.name) {
    return {
      scalarType: typeObj.name,
      isArray: false,
    };
  }

  // Fallback: try to find name directly
  if (typeObj.name && typeObj.type === 'named') {
    return {
      scalarType: typeObj.name,
      isArray: false,
    };
  }

  // Default fallback
  return { scalarType: 'text', isArray: false };
}

function parseCollectionFromTotfHml(totfHmlPath: string, collectionName: string): CollectionInfo | null {
  const content = readFileSync(totfHmlPath, 'utf-8');

  // Parse the YAML document
  // The file contains a single document with kind: DataConnectorLink
  const doc = parseDocument(content);
  const data = doc.toJS();

  // Navigate to collections: definition.schema.schema.collections[]
  const collections = data?.definition?.schema?.schema?.collections;
  if (!Array.isArray(collections)) {
    return null;
  }

  // Find the collection by name
  const collection = collections.find((col: any) => col.name === collectionName);
  if (!collection) {
    return null;
  }

  // Extract return type
  const returnType = collection.type;

  // Extract arguments
  const args: CollectionArgument[] = [];
  const argumentsObj = collection.arguments;

  if (argumentsObj && typeof argumentsObj === 'object') {
    for (const [argName, argData] of Object.entries(argumentsObj)) {
      if (argData && typeof argData === 'object' && 'type' in argData) {
        const typeInfo = extractTypeFromHmlType(argData.type);

        // Extract description - handle both string and multiline formats
        let description: string | undefined;
        if ('description' in argData) {
          const desc = argData.description;
          if (typeof desc === 'string') {
            // Clean up multiline strings - replace newlines with spaces, trim
            description = desc.replace(/\n\s*/g, ' ').trim();
          }
        }

        args.push({
          name: argName,
          type: typeInfo.scalarType,
          description: description || undefined,
          isArray: typeInfo.isArray,
          elementType: typeInfo.elementType,
        });
      }
    }
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
    const baseHasuraType = pgScalarTypeToHasuraType(arg.type);
    // For array types, wrap in brackets and quote to prevent YAML parsing as array literal
    // YAML will parse [String_1] as an array, so we need "[String_1]" as a string
    const hasuraType = arg.isArray ? `"[${baseHasuraType}]"` : baseHasuraType;
    const camelArgName = snakeToCamel(arg.name);

    // Description should already be clean from YAML parsing, but normalize whitespace
    let cleanDescription = arg.description;
    if (cleanDescription) {
      // Normalize whitespace - replace multiple spaces/newlines with single space
      cleanDescription = cleanDescription.replace(/\s+/g, ' ').trim();
    }
    const description = cleanDescription ? `description: "${cleanDescription}"` : '';

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
    const typeDisplay = arg.isArray ? `${arg.type}[]` : arg.type;
    console.log(`  - ${arg.name}: ${typeDisplay}${arg.description ? ` (${arg.description})` : ''}`);
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
