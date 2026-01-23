#!/usr/bin/env node

/**
 * Remove Model and ModelPermissions sections from HML files
 *
 * Usage: tsx scripts/remove-model-sections.ts <hml-file-path> <model-name>
 * Example: tsx scripts/remove-model-sections.ts hasura/app/metadata/TopPeriodsResult.hml TopPeriodsResult
 */

import { parseAllDocuments, stringify } from 'yaml';
import fs from 'fs';
import path from 'path';

function removeModelSections(hmlFilePath: string, modelName: string): void {
  if (!fs.existsSync(hmlFilePath)) {
    console.error(`Error: File not found: ${hmlFilePath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(hmlFilePath, 'utf-8');

  // Parse all YAML documents (separated by ---)
  const documents = parseAllDocuments(content);

  if (documents.length === 0) {
    console.warn(`Warning: No YAML documents found in ${hmlFilePath}`);
    return;
  }

  const filteredDocuments = [];
  let removedCount = 0;

  for (const doc of documents) {
    const obj = doc.toJS();

    // Check if this is a Model section with matching name
    if (obj?.kind === 'Model' && obj?.definition?.name === modelName) {
      console.log(`  Removing Model section: ${modelName}`);
      removedCount++;
      continue;
    }

    // Check if this is a ModelPermissions section with matching modelName
    if (obj?.kind === 'ModelPermissions' && obj?.definition?.modelName === modelName) {
      console.log(`  Removing ModelPermissions section: ${modelName}`);
      removedCount++;
      continue;
    }

    // Keep all other sections
    filteredDocuments.push(doc);
  }

  if (removedCount === 0) {
    console.log(`  No matching Model or ModelPermissions sections found for: ${modelName}`);
    return;
  }

  // Write back the filtered documents
  // The yaml library's stringify adds document separators automatically
  // We need to stringify all documents together to get proper formatting
  const output = filteredDocuments
    .map(doc => stringify(doc))
    .join('')
    .replace(/^---\n/, ''); // Remove leading separator from first document
  fs.writeFileSync(hmlFilePath, output, 'utf-8');

  console.log(`✓ Successfully removed ${removedCount} section(s) from ${hmlFilePath}`);
  console.log(`  Kept ${filteredDocuments.length} section(s)`);
}

// CLI interface
const args = process.argv.slice(2);

if (args.length !== 2) {
  console.error('Usage: tsx scripts/remove-model-sections.ts <hml-file-path> <model-name>');
  console.error('Example: tsx scripts/remove-model-sections.ts hasura/app/metadata/TopPeriodsResult.hml TopPeriodsResult');
  process.exit(1);
}

const [hmlFilePath, modelName] = args;

// Resolve relative paths from project root
const resolvedPath = path.isAbsolute(hmlFilePath)
  ? hmlFilePath
  : path.resolve(process.cwd(), hmlFilePath);

removeModelSections(resolvedPath, modelName);
