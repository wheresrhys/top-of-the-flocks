#!/usr/bin/env node

/**
 * Helper script to add a new GraphQL query to the queries system
 * Usage: node scripts/add-query.js <query-name>
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const queryName = process.argv[2];

if (!queryName) {
  console.error('Usage: node scripts/add-query.js <query-name>');
  process.exit(1);
}

// Create the .graphql file template
const graphqlTemplate = `query ${toPascalCase(queryName)}Query {
  # Add your GraphQL query here
}
`;

// Update the queries.ts file to include the new query
const queriesPath = path.join(__dirname, '../lib/queries.ts');
const queriesContent = fs.readFileSync(queriesPath, 'utf-8');

// Add import for the new query type (you'll need to run codegen after)
const constantName = queryName.split('-').map(word => word.toUpperCase()).join('_');
const newQueryImport = `import ${toCamelCase(queryName)}Query from '../queries/${queryName}.graphql';

// Then in queries object:
  ${toCamelCase(queryName)}: {
    query: extractQueryString(${toCamelCase(queryName)}Query),
    type: {} as ${toPascalCase(queryName)}Query,
    variables: {} as ${toPascalCase(queryName)}QueryVariables,
  },`;

console.log(`\n🚀 To add a new query "${queryName}":`);
console.log(`1. Create queries/${queryName}.graphql with your GraphQL query`);
console.log(`2. Add the query to lib/queries.ts`);
console.log(`3. Run: npm run hasura:types`);
console.log(`4. Import and use: import { GET_${queryName.toUpperCase()}, type ${toPascalCase(queryName)}Query } from '../lib/queries'`);

function toPascalCase(str) {
  return str.replace(/(^\w|-\w)/g, (match) => match.replace('-', '').toUpperCase());
}

function toCamelCase(str) {
  return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
}
