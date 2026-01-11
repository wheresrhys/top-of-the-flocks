#!/usr/bin/env tsx
/**
 * Script to auto-generate Hasura HML metadata files from Postgres functions/views
 * This reduces boilerplate when exposing custom Postgres functions in Hasura DDN
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join, basename } from 'path';

interface FieldInfo {
  name: string;
  type: string;
  nullable: boolean;
}

interface FunctionInfo {
  name: string;
  returnType: string;
  returnTable?: string;
  fields: FieldInfo[];
  argumentsArray: Array<{ name: string; type: string; default?: string }>;
}

interface ViewInfo {
  name: string;
  fields: FieldInfo[];
}

// Postgres to Hasura type mapping
const TYPE_MAPPING: Record<string, string> = {
  'bigint': 'Int64',
  'int8': 'Int64',
  'integer': 'Int64',
  'int4': 'Int64',
  'smallint': 'Int16',
  'int2': 'Int16',
  'real': 'Float32',
  'float4': 'Float32',
  'double precision': 'Float64',
  'float8': 'Float64',
  'numeric': 'Bigdecimal',
  'decimal': 'Bigdecimal',
  'text': 'String_1',
  'varchar': 'String_1',
  'date': 'Date',
  'timestamp': 'Date',
  'timestamptz': 'Date',
  'boolean': 'Boolean1',
  'json': 'Json',
  'jsonb': 'Json',
};

// Postgres to Hasura boolean expression mapping
const BOOL_EXP_MAPPING: Record<string, string> = {
  'Int64': 'Int8BoolExp',
  'Int16': 'Int2BoolExp',
  'Float32': 'Float4BoolExp',
  'Float64': 'Float8BoolExp',
  'Bigdecimal': 'NumericBoolExp',
  'String_1': 'TextBoolExp',
  'Date': 'DateBoolExp',
  'Boolean1': 'Boolean1BoolExp',
};

// Postgres to Hasura aggregate expression mapping
const AGG_EXP_MAPPING: Record<string, string> = {
  'Int64': 'Int8AggExp',
  'Int16': 'Int2AggExp',
  'Float32': 'Float4AggExp',
  'Float64': 'Float8AggExp',
  'Bigdecimal': 'NumericAggExp',
  'String_1': 'TextAggExp',
  'Date': 'DateAggExp',
  'Boolean1': 'Boolean1AggExp',
};

// Postgres to Hasura order by expression mapping
const ORDER_BY_EXP_MAPPING: Record<string, string> = {
  'Int64': 'Int64OrderByExp',
  'Int16': 'Int16OrderByExp',
  'Float32': 'Float32OrderByExp',
  'Float64': 'Float64OrderByExp',
  'Bigdecimal': 'BigdecimalOrderByExp',
  'String_1': 'String1OrderByExp',
  'Date': 'DateOrderByExp',
  'Boolean1': 'Boolean1OrderByExp',
};

function snakeToPascal(str: string): string {
  return str
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

function camelToPascal(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function parsePostgresType(pgType: string): { hasuraType: string; nullable: boolean } {
  const trimmed = pgType.trim().toLowerCase();
  const nullable = trimmed.includes('nullable') || !trimmed.includes('not null');

  // Extract base type
  let baseType = trimmed.replace(/nullable|not null/gi, '').trim();

  // Handle array types
  if (baseType.includes('[]')) {
    baseType = baseType.replace('[]', '');
  }

  const hasuraType = TYPE_MAPPING[baseType] || 'String_1';
  return { hasuraType, nullable };
}

function parseFunction(sql: string, filename: string): FunctionInfo | null {
  // Match CREATE OR REPLACE FUNCTION ... RETURNS SETOF
  const functionMatch = sql.match(
    /CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+(\w+)\s*\(([^)]*)\)\s*RETURNS\s+SETOF\s+(\w+)/i
  );

  if (!functionMatch) return null;

  const [, funcName, argsStr, returnTable] = functionMatch;

  // Parse arguments
  const argumentsArray: Array<{ name: string; type: string; default?: string }> = [];
  if (argsStr.trim()) {
    const argMatches = argsStr.matchAll(/(\w+)\s+(\w+)(?:\s+DEFAULT\s+([^,]+))?/gi);
    for (const match of argMatches) {
      argumentsArray.push({
        name: match[1],
        type: match[2],
        default: match[3],
      });
    }
  }

  // Try to find the return table definition
  const tableMatch = sql.match(
    new RegExp(`CREATE\\s+TABLE\\s+(?:IF\\s+NOT\\s+EXISTS\\s+)?${returnTable}\\s*\\(([^)]+)\\)`, 'i')
  );

  const fields: FieldInfo[] = [];
  if (tableMatch) {
    const fieldsStr = tableMatch[1];
    const fieldMatches = fieldsStr.matchAll(/(\w+)\s+(\w+(?:\s*\(\d+\))?)/gi);
    for (const match of fieldMatches) {
      const { hasuraType } = parsePostgresType(match[2]);
      fields.push({
        name: match[1],
        type: hasuraType,
        nullable: true, // Assume nullable unless we parse more carefully
      });
    }
  }

  return {
    name: funcName,
    returnType: returnTable,
    returnTable,
    fields,
    argumentsArray,
  };
}

function parseView(sql: string, filename: string): ViewInfo | null {
  const viewMatch = sql.match(/CREATE\s+(?:OR\s+REPLACE\s+)?VIEW\s+(\w+)\s+AS/i);
  if (!viewMatch) return null;

  const viewName = viewMatch[1];

  // Try to extract field names from SELECT
  const selectMatch = sql.match(/SELECT\s+([\s\S]+?)\s+FROM/i);
  const fields: FieldInfo[] = [];

  if (selectMatch) {
    const selectFields = selectMatch[1];
    // Match field definitions like "column_name AS alias" or just "column_name"
    const fieldMatches = selectFields.matchAll(/(?:(\w+)\.)?(\w+)(?:\s+AS\s+(\w+))?/gi);
    for (const match of fieldMatches) {
      // Skip common SQL keywords
      if (['from', 'where', 'group', 'order', 'limit'].includes(match[0].toLowerCase())) break;

      const fieldName = match[3] || match[2];
      if (fieldName && !['select', 'distinct', 'count', 'max', 'min', 'avg', 'sum'].includes(fieldName.toLowerCase())) {
        fields.push({
          name: fieldName,
          type: 'String_1', // Default, will be introspected by Hasura
          nullable: true,
        });
      }
    }
  }

  return {
    name: viewName,
    fields,
  };
}

function generateObjectType(name: string, fields: FieldInfo[]): string {
  const fieldDefs = fields.map(field => {
    const fieldName = snakeToPascal(field.name);
    return `    - name: ${fieldName}
      type: ${field.type}`;
  }).join('\n');

  const fieldMappings = fields.map(field => {
    const fieldName = snakeToPascal(field.name);
    return `        ${fieldName}:
          column:
            name: ${field.name}`;
  }).join('\n');

  return `---
kind: ObjectType
version: v1
definition:
  name: ${name}
  fields:
${fieldDefs}
  graphql:
    typeName: ${name}
    inputTypeName: ${name}Input
  dataConnectorTypeMapping:
    - dataConnectorName: totf
      dataConnectorObjectType: ${name.charAt(0).toLowerCase() + name.slice(1).replace(/([A-Z])/g, '_$1').toLowerCase()}
      fieldMapping:
${fieldMappings}
`;
}

function generateBooleanExpression(name: string, fields: FieldInfo[]): string {
  const comparableFields = fields.map(field => {
    const fieldName = snakeToPascal(field.name);
    const boolExpType = BOOL_EXP_MAPPING[field.type] || 'TextBoolExp';
    return `        - fieldName: ${fieldName}
          booleanExpressionType: ${boolExpType}`;
  }).join('\n');

  return `---
kind: BooleanExpressionType
version: v1
definition:
  name: ${name}BoolExp
  operand:
    object:
      type: ${name}
      comparableFields:
${comparableFields}
      comparableRelationships: []
  logicalOperators:
    enable: true
  isNull:
    enable: true
  graphql:
    typeName: ${name}BoolExp
`;
}

function generateAggregateExpression(name: string, fields: FieldInfo[]): string {
  const aggregatableFields = fields.map(field => {
    const fieldName = snakeToPascal(field.name);
    const aggExpType = AGG_EXP_MAPPING[field.type] || 'TextAggExp';
    return `        - fieldName: ${fieldName}
          aggregateExpression: ${aggExpType}`;
  }).join('\n');

  return `---
kind: AggregateExpression
version: v1
definition:
  name: ${name}AggExp
  operand:
    object:
      aggregatedType: ${name}
      aggregatableFields:
${aggregatableFields}
  count:
    enable: true
    returnType: Int64
  graphql:
    selectTypeName: ${name}AggExp
`;
}

function generateOrderByExpression(name: string, fields: FieldInfo[]): string {
  const orderableFields = fields.map(field => {
    const fieldName = snakeToPascal(field.name);
    const orderByExpType = ORDER_BY_EXP_MAPPING[field.type] || 'String1OrderByExp';
    return `        - fieldName: ${fieldName}
          orderByExpression: ${orderByExpType}`;
  }).join('\n');

  return `---
kind: OrderByExpression
version: v1
definition:
  name: ${name}OrderByExp
  operand:
    object:
      orderedType: ${name}
      orderableFields:
${orderableFields}
      orderableRelationships: []
  graphql:
    expressionTypeName: ${name}OrderByExp
`;
}

function generateModel(name: string, collectionName: string): string {
  const queryRootField = name.charAt(0).toLowerCase() + name.slice(1);

  return `---
kind: Model
version: v2
definition:
  name: ${name}
  objectType: ${name}
  source:
    dataConnectorName: totf
    collection: ${collectionName}
  filterExpressionType: ${name}BoolExp
  aggregateExpression: ${name}AggExp
  orderByExpression: ${name}OrderByExp
  graphql:
    selectMany:
      queryRootField: ${queryRootField}
      subscription:
        rootField: ${queryRootField}
    selectUniques: []
    filterInputTypeName: ${name}FilterInput
    aggregate:
      queryRootField: ${queryRootField}Aggregate
      subscription:
        rootField: ${queryRootField}Aggregate
`;
}

function generatePermissions(name: string): string {
  return `---
kind: ModelPermissions
version: v1
definition:
  modelName: ${name}
  permissions:
    - role: admin
      select:
        filter: null
        allowSubscriptions: true

---
kind: TypePermissions
version: v1
definition:
  typeName: ${name}
  permissions:
    - role: admin
      output:
        allowedFields:
          - ALL_FIELDS
`;
}

function generateHMLFile(info: FunctionInfo | ViewInfo, isFunction: boolean): string {
  const name = snakeToPascal(isFunction ? (info as FunctionInfo).returnTable || info.name : info.name);
  const collectionName = isFunction
    ? (info as FunctionInfo).name
    : (info as ViewInfo).name;

  const parts = [
    generateObjectType(name, info.fields),
    generateBooleanExpression(name, info.fields),
    generateAggregateExpression(name, info.fields),
    generateOrderByExpression(name, info.fields),
    generateModel(name, collectionName),
    generatePermissions(name),
  ];

  return parts.join('\n');
}

function main() {
  const viewsDir = join(process.cwd(), 'supabase', 'views');
  const metadataDir = join(process.cwd(), 'hasura', 'app', 'metadata');

  if (!existsSync(viewsDir)) {
    console.error(`Views directory not found: ${viewsDir}`);
    process.exit(1);
  }

  const sqlFiles = readdirSync(viewsDir).filter(f => f.endsWith('.sql'));

  console.log(`Found ${sqlFiles.length} SQL file(s) to process...\n`);

  for (const sqlFile of sqlFiles) {
    const sqlPath = join(viewsDir, sqlFile);
    const sql = readFileSync(sqlPath, 'utf-8');
    const filename = basename(sqlFile, '.sql');

    console.log(`Processing ${sqlFile}...`);

    // Try to parse as function first
    let info: FunctionInfo | ViewInfo | null = parseFunction(sql, filename);
    let isFunction = true;

    if (!info) {
      // Try to parse as view
      info = parseView(sql, filename);
      isFunction = false;
    }

    if (!info) {
      console.log(`  ⚠️  Could not parse ${sqlFile} as function or view, skipping...`);
      continue;
    }

    // For functions, we need the return table name
    if (isFunction && (info as FunctionInfo).returnTable) {
      const returnTableName = (info as FunctionInfo).returnTable!;
      const hmlName = snakeToPascal(returnTableName);
      const hmlPath = join(metadataDir, `${hmlName}.hml`);

      // Generate HML content
      const hmlContent = generateHMLFile(info, isFunction);
      writeFileSync(hmlPath, hmlContent);

      console.log(`  ✅ Generated ${hmlName}.hml`);
      console.log(`     Note: You may need to run 'ddn connector introspect totf' to get accurate field types`);
    } else if (!isFunction) {
      const hmlName = snakeToPascal((info as ViewInfo).name);
      const hmlPath = join(metadataDir, `${hmlName}.hml`);

      const hmlContent = generateHMLFile(info, isFunction);
      writeFileSync(hmlPath, hmlContent);

      console.log(`  ✅ Generated ${hmlName}.hml`);
      console.log(`     Note: You may need to run 'ddn connector introspect totf' to get accurate field types`);
    }
  }

  console.log('\n✅ Metadata generation complete!');
  console.log('Next steps:');
  console.log('  1. Run: cd hasura && ddn connector introspect totf');
  console.log('  2. Review generated HML files and adjust field types if needed');
  console.log('  3. Run: ddn supergraph build local');
}

main();
