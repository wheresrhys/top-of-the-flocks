#!/usr/bin/env tsx
/**
 * Automatically add native operation configuration to Hasura configuration.json
 * This script parses Postgres functions and adds them to the nativeOperations.queries section
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join, basename } from 'path';

interface FunctionArg {
  name: string;
  type: string;
  default?: string;
}

interface FunctionInfo {
  name: string;
  args: FunctionArg[];
  returnTable: string;
  returnFields: Array<{ name: string; type: string }>;
}

function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function parseFunction(sql: string): FunctionInfo | null {
  // Match CREATE OR REPLACE FUNCTION ... RETURNS SETOF
  const funcMatch = sql.match(
    /CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+(\w+)\s*\(([^)]*)\)\s*RETURNS\s+SETOF\s+(\w+)/i
  );

  if (!funcMatch) return null;

  const [, funcName, argsStr, returnTable] = funcMatch;

  // Parse arguments
  const args: FunctionArg[] = [];
  if (argsStr.trim()) {
    // Match arguments like: arg_name TYPE DEFAULT value or arg_name TYPE
    const argPattern = /(\w+)\s+(\w+(?:\s*\(\d+\))?)(?:\s+DEFAULT\s+([^,]+))?/gi;
    let match;
    while ((match = argPattern.exec(argsStr)) !== null) {
      args.push({
        name: match[1],
        type: match[2].toLowerCase(),
        default: match[3],
      });
    }
  }

  // Try to find return table definition
  const tableMatch = sql.match(
    new RegExp(`CREATE\\s+TABLE\\s+(?:IF\\s+NOT\\s+EXISTS\\s+)?${returnTable}\\s*\\(([^)]+)\\)`, 'i')
  );

  const returnFields: Array<{ name: string; type: string }> = [];
  if (tableMatch) {
    const fieldsStr = tableMatch[1];
    const fieldPattern = /(\w+)\s+(\w+(?:\s*\(\d+\))?)/gi;
    let fieldMatch;
    while ((fieldMatch = fieldPattern.exec(fieldsStr)) !== null) {
      returnFields.push({
        name: fieldMatch[1],
        type: fieldMatch[2].toLowerCase(),
      });
    }
  }

  return {
    name: funcName,
    args,
    returnTable,
    returnFields,
  };
}

function pgTypeToHasuraScalarType(pgType: string): string {
  const normalized = pgType.toLowerCase().replace(/\s*\(\d+\)/, '');
  const mapping: Record<string, string> = {
    'text': 'text',
    'varchar': 'text',
    'integer': 'int4',
    'int4': 'int4',
    'int8': 'int8',
    'bigint': 'int8',
    'smallint': 'int2',
    'int2': 'int2',
    'real': 'float4',
    'float4': 'float4',
    'double precision': 'float8',
    'float8': 'float8',
    'numeric': 'numeric',
    'decimal': 'numeric',
    'date': 'date',
    'timestamp': 'date',
    'timestamptz': 'date',
    'boolean': 'boolean',
    'bool': 'boolean',
  };

  return mapping[normalized] || 'text';
}

function generateNativeOperationConfig(funcInfo: FunctionInfo): any {
  // Generate argument placeholders with COALESCE for defaults
  // PostgreSQL functions only use DEFAULT when arguments are omitted, not when null is passed
  // So we need to handle null values explicitly using COALESCE
  const argPlaceholders = funcInfo.args.map((arg) => {
    if (arg.default) {
      // Parse default value - handle strings vs numbers
      let defaultValue = arg.default.trim();
      // Remove surrounding quotes if present (we'll add them back if needed)
      const isQuoted = (defaultValue.startsWith("'") && defaultValue.endsWith("'")) ||
                       (defaultValue.startsWith('"') && defaultValue.endsWith('"'));
      if (isQuoted) {
        // Extract the inner value
        defaultValue = defaultValue.slice(1, -1);
        // Escape single quotes in the value
        defaultValue = defaultValue.replace(/'/g, "''");
        return `COALESCE({{${arg.name}}}, '${defaultValue}')`;
      } else if (defaultValue.match(/^\d+$/)) {
        // Numeric default
        return `COALESCE({{${arg.name}}}, ${defaultValue})`;
      } else if (defaultValue.match(/^null$/i)) {
        // Null default
        return `{{${arg.name}}}`;
      } else {
        // String default without quotes - add quotes and escape
        defaultValue = defaultValue.replace(/'/g, "''");
        return `COALESCE({{${arg.name}}}, '${defaultValue}')`;
      }
    }
    return `{{${arg.name}}}`;
  }).join(', ');

  const sqlQuery = `SELECT * FROM ${funcInfo.name}(${argPlaceholders})`;

  const columns: Record<string, any> = {};
  for (const field of funcInfo.returnFields) {
    const scalarType = pgTypeToHasuraScalarType(field.type);
    columns[field.name] = {
      name: field.name,
      type: {
        scalarType: scalarType,
      },
      nullable: 'nullable',
      description: null,
    };
  }

  const functionArgs: Record<string, any> = {};
  for (const arg of funcInfo.args) {
    const scalarType = pgTypeToHasuraScalarType(arg.type);
    functionArgs[arg.name] = {
      name: arg.name,
      type: {
        scalarType: scalarType,
      },
      nullable: 'nullable',
      description: arg.default ? `Default: ${arg.default}` : null,
    };
  }

  return {
    sql: {
      inline: sqlQuery,
    },
    columns,
    arguments: functionArgs,
    description: null,
  };
}

function main() {
  const funcName = process.argv[2];

  if (!funcName) {
    console.error('Usage: tsx scripts/add-native-operation.ts <function_name>');
    console.error('');
    console.error('Example:');
    console.error('  tsx scripts/add-native-operation.ts top_sessions_by_metric');
    process.exit(1);
  }

  // Find project root by looking for package.json
  let projectRoot = process.cwd();

  // If we're in hasura directory, go up to project root
  if (basename(projectRoot) === 'hasura') {
    projectRoot = join(projectRoot, '..');
  }

  // Verify we're in the right place by checking for package.json
  const packageJsonPath = join(projectRoot, 'package.json');
  if (!existsSync(packageJsonPath)) {
    console.error(`Could not find project root. Looking for package.json in: ${projectRoot}`);
    process.exit(1);
  }

  // Find SQL file containing the function
  const viewsDir = join(projectRoot, 'supabase', 'views');

  if (!existsSync(viewsDir)) {
    console.error(`Views directory not found: ${viewsDir}`);
    process.exit(1);
  }

  const files = readdirSync(viewsDir).filter((f: string) => f.endsWith('.sql'));

  let funcInfo: FunctionInfo | null = null;
  let sqlFile: string | null = null;

  for (const file of files) {
    const sqlPath = join(viewsDir, file);
    const sql = readFileSync(sqlPath, 'utf-8');

    if (sql.includes(funcName)) {
      funcInfo = parseFunction(sql);
      if (funcInfo && funcInfo.name === funcName) {
        sqlFile = file;
        break;
      }
    }
  }

  if (!funcInfo) {
    console.error(`Function ${funcName} not found in supabase/views/*.sql`);
    process.exit(1);
  }

  console.log(`Found function ${funcName} in ${sqlFile}`);

  // Read configuration.json
  const configPath = join(projectRoot, 'hasura', 'app', 'connector', 'totf', 'configuration.json');
  const configContent = readFileSync(configPath, 'utf-8');
  const config = JSON.parse(configContent);

  // Ensure nativeOperations.queries exists
  if (!config.metadata) {
    config.metadata = {};
  }
  if (!config.metadata.nativeOperations) {
    config.metadata.nativeOperations = { queries: {}, mutations: {} };
  }
  if (!config.metadata.nativeOperations.queries) {
    config.metadata.nativeOperations.queries = {};
  }

  // Generate native operation config
  const nativeOpConfig = generateNativeOperationConfig(funcInfo);
  const camelCaseKey = snakeToCamel(funcInfo.name);

  // Check if it already exists
  if (config.metadata.nativeOperations.queries[camelCaseKey]) {
    console.log(`⚠️  Native operation ${camelCaseKey} already exists, updating...`);
  } else {
    console.log(`✓ Adding native operation ${camelCaseKey}...`);
  }

  // Add/update the native operation
  config.metadata.nativeOperations.queries[camelCaseKey] = nativeOpConfig;

  // Write back to file with proper formatting (2 spaces indentation)
  writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n', 'utf-8');

  console.log(`✅ Successfully added/updated native operation ${camelCaseKey} in configuration.json`);
  console.log('');
  console.log('Next steps:');
  console.log('  1. Run: cd hasura && ddn connector introspect totf');
  console.log('  2. Run: ddn supergraph build local');
}

main();
