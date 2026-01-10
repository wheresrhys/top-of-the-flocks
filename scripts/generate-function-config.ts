#!/usr/bin/env tsx
/**
 * Generate Hasura native operation configuration for Postgres functions
 * This helps reduce boilerplate when exposing functions in Hasura DDN
 */

import { readFileSync } from 'fs';
import { join } from 'path';

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

function pgTypeToHasuraType(pgType: string): string {
  const normalized = pgType.toLowerCase().replace(/\s*\(\d+\)/, '');
  const mapping: Record<string, string> = {
    'text': 'string',
    'varchar': 'string',
    'integer': 'int',
    'int4': 'int',
    'int8': 'int',
    'bigint': 'int',
    'smallint': 'int',
    'int2': 'int',
    'real': 'float',
    'float4': 'float',
    'double precision': 'float',
    'float8': 'float',
    'numeric': 'numeric',
    'decimal': 'numeric',
    'date': 'date',
    'timestamp': 'date',
    'timestamptz': 'date',
    'boolean': 'boolean',
    'bool': 'boolean',
  };

  return mapping[normalized] || 'string';
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

function generateNativeOperation(funcInfo: FunctionInfo): string {
  const argPlaceholders = funcInfo.args.map((arg, idx) => {
    // Use argument name or index-based placeholder
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

  const arguments: Record<string, any> = {};
  for (const arg of funcInfo.args) {
    const scalarType = pgTypeToHasuraScalarType(arg.type);
    arguments[arg.name] = {
      name: arg.name,
      type: {
        scalarType: scalarType,
      },
      nullable: 'nullable', // Functions can have defaults, so nullable
      description: arg.default ? `Default: ${arg.default}` : null,
    };
  }

  const config = {
    [funcInfo.name]: {
      sql: {
        inline: sqlQuery,
      },
      columns,
      arguments,
      description: null,
    },
  };

  return JSON.stringify(config, null, 2);
}

function main() {
  const funcName = process.argv[2];

  if (!funcName) {
    console.error('Usage: tsx scripts/generate-function-config.ts <function_name>');
    console.error('');
    console.error('Example:');
    console.error('  tsx scripts/generate-function-config.ts top_sessions_by_metric');
    process.exit(1);
  }

  // Find SQL file containing the function
  const viewsDir = join(process.cwd(), 'supabase', 'views');
  const fs = require('fs');
  const files = fs.readdirSync(viewsDir).filter((f: string) => f.endsWith('.sql'));

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
  console.log('');
  console.log('Add this to hasura/app/connector/totf/configuration.json');
  console.log('under nativeOperations.queries:');
  console.log('');
  console.log(generateNativeOperation(funcInfo));
  console.log('');
  console.log('After adding this, run:');
  console.log('  cd hasura && ddn connector introspect totf');
  console.log('  ddn supergraph build local');
}

main();
