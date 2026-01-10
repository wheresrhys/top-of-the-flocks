#!/usr/bin/env tsx
/**
 * Add dataConnectorTypeMapping entries for native operation collections
 * This ensures ObjectTypes can be used with both table collections and native operation collections
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, basename } from 'path';

interface FunctionMapping {
  returnTable: string;
  functionName: string;
  camelCaseFunctionName: string;
}

function snakeToPascal(str: string): string {
  return str
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function addMappingToHML(hmlPath: string, functionName: string): boolean {
  if (!existsSync(hmlPath)) {
    console.error(`HML file not found: ${hmlPath}`);
    return false;
  }

  const content = readFileSync(hmlPath, 'utf-8');

  // Check if mapping already exists
  if (content.includes(`dataConnectorObjectType: ${functionName}`)) {
    console.log(`  Mapping for ${functionName} already exists in ${basename(hmlPath)}`);
    return true;
  }

  // Find the dataConnectorTypeMapping section
  const mappingStart = content.indexOf('dataConnectorTypeMapping:');
  if (mappingStart === -1) {
    console.error(`Could not find dataConnectorTypeMapping section in ${basename(hmlPath)}`);
    return false;
  }

  // Find the first mapping entry to use as a template
  const firstMappingMatch = content.substring(mappingStart).match(/(\s+- dataConnectorName: totf\n\s+dataConnectorObjectType: [^\n]+\n\s+fieldMapping:\n(?:\s+[^\n]+:\n(?:\s+column:\n\s+name: [^\n]+\n)+)+)/);

  if (!firstMappingMatch) {
    console.error(`Could not extract first mapping from ${basename(hmlPath)}`);
    return false;
  }

  const firstMapping = firstMappingMatch[1];

  // Create the new mapping entry by replacing the dataConnectorObjectType
  const newMapping = firstMapping.replace(
    /dataConnectorObjectType: [^\n]+/,
    `dataConnectorObjectType: ${functionName}`
  );

  // Find where to insert - right before the closing `---` after dataConnectorTypeMapping
  // Look for the pattern: last fieldMapping entry, then newline, then `---`
  const mappingSectionEnd = content.indexOf('\n---', mappingStart);
  if (mappingSectionEnd === -1) {
    console.error(`Could not find end of dataConnectorTypeMapping section in ${basename(hmlPath)}`);
    return false;
  }

  // Insert the new mapping before the `---`
  const beforeSection = content.substring(0, mappingSectionEnd);
  const afterSection = content.substring(mappingSectionEnd);

  // Insert with proper indentation (same as existing mappings)
  const updatedContent = beforeSection + newMapping + '\n' + afterSection;

  writeFileSync(hmlPath, updatedContent, 'utf-8');
  console.log(`  ✓ Added mapping for ${functionName} to ${basename(hmlPath)}`);
  return true;
}

function main() {
  const mappingsJson = process.argv[2];

  if (!mappingsJson) {
    console.error('Usage: tsx scripts/add-function-mappings.ts <mappings_json>');
    console.error('');
    console.error('Example:');
    console.error('  tsx scripts/add-function-mappings.ts \'[{"returnTable":"top_sessions_result","functionName":"topSessionsByMetric"}]\'');
    process.exit(1);
  }

  // Find project root
  let projectRoot = process.cwd();
  if (basename(projectRoot) === 'hasura') {
    projectRoot = join(projectRoot, '..');
  }

  const mappings: FunctionMapping[] = JSON.parse(mappingsJson);

  console.log(`Adding connector mappings for ${mappings.length} function(s)...`);

  for (const mapping of mappings) {
    const pascalCaseTable = snakeToPascal(mapping.returnTable);
    const hmlPath = join(projectRoot, 'hasura', 'app', 'metadata', `${pascalCaseTable}.hml`);

    if (!addMappingToHML(hmlPath, mapping.functionName)) {
      console.error(`Failed to add mapping for ${mapping.functionName}`);
    }
  }

  console.log('✓ Function mappings added successfully');
}

main();
