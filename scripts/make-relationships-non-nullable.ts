#!/usr/bin/env node

/**
 * Make all relationships non-nullable in Hasura metadata HML files
 *
 * This script processes all HML files in hasura/app/metadata/ and adds
 * relationship fields to ObjectType definitions as non-nullable fields.
 *
 * Usage: tsx scripts/make-relationships-non-nullable.ts
 */

import { parseAllDocuments, stringify, parseDocument } from 'yaml';
import fs from 'fs';
import path from 'path';

interface Relationship {
  name: string;
  sourceType: string;
  targetType: string;
  relationshipType: 'Object' | 'Array';
}

function makeRelationshipsNonNullable(): void {
  const metadataDir = path.resolve(process.cwd(), 'hasura/app/metadata');

  if (!fs.existsSync(metadataDir)) {
    console.error(`Error: Metadata directory not found: ${metadataDir}`);
    process.exit(1);
  }

  // Get all HML files
  const hmlFiles = fs
    .readdirSync(metadataDir)
    .filter(file => file.endsWith('.hml'))
    .map(file => path.join(metadataDir, file));

  if (hmlFiles.length === 0) {
    console.warn('Warning: No HML files found in metadata directory');
    return;
  }

  // First pass: collect all ObjectType names (types that have models)
  const objectTypeNames = new Set<string>();

  for (const hmlFile of hmlFiles) {
    const content = fs.readFileSync(hmlFile, 'utf-8');
    const documents = parseAllDocuments(content);

    for (const doc of documents) {
      const obj = doc.toJS();

      // Collect ObjectType names
      if (obj?.kind === 'ObjectType' && obj?.definition?.name) {
        objectTypeNames.add(obj.definition.name);
      }
    }
  }

  // Second pass: collect relationships only for types that have ObjectType definitions
  const relationshipsBySourceType = new Map<string, Relationship[]>();

  for (const hmlFile of hmlFiles) {
    const content = fs.readFileSync(hmlFile, 'utf-8');
    const documents = parseAllDocuments(content);

    for (const doc of documents) {
      const obj = doc.toJS();

      if (obj?.kind === 'Relationship' && obj?.definition) {
        const def = obj.definition;
        const sourceType = def.sourceType;
        const relationshipName = def.name;
        const targetModel = def.target?.model;

        // Only process relationships where both sourceType and targetType have ObjectType definitions
        if (
          sourceType &&
          relationshipName &&
          targetModel?.name &&
          objectTypeNames.has(sourceType) &&
          objectTypeNames.has(targetModel.name)
        ) {
          const relationshipType = targetModel.relationshipType || 'Object';

          if (!relationshipsBySourceType.has(sourceType)) {
            relationshipsBySourceType.set(sourceType, []);
          }

          relationshipsBySourceType.get(sourceType)!.push({
            name: relationshipName,
            sourceType,
            targetType: targetModel.name,
            relationshipType: relationshipType as 'Object' | 'Array',
          });
        }
      }
    }
  }

  // Third pass: update ObjectType definitions with relationship fields
  let totalFilesModified = 0;
  let totalFieldsAdded = 0;

  for (const hmlFile of hmlFiles) {
    const content = fs.readFileSync(hmlFile, 'utf-8');
    const documents = parseAllDocuments(content);
    let fileModified = false;
    let fieldsAddedInFile = 0;

    const updatedDocuments = documents.map(doc => {
      const obj = doc.toJS();

      if (obj?.kind === 'ObjectType' && obj?.definition) {
        const def = obj.definition;
        const objectTypeName = def.name;
        const relationships = relationshipsBySourceType.get(objectTypeName) || [];

        if (relationships.length > 0 && def.fields) {
          // Get existing field names to avoid duplicates
          const existingFieldNames = new Set(
            def.fields.map((field: { name: string }) => field.name)
          );

          // Add missing relationship fields
          const fieldsToAdd: Array<{ name: string; type: string }> = [];

          for (const rel of relationships) {
            if (!existingFieldNames.has(rel.name)) {
              // Determine the type string based on relationship type
              let typeString: string;
              if (rel.relationshipType === 'Array') {
                // Array relationships: [Type!]!
                typeString = `[${rel.targetType}!]!`;
              } else {
                // Object relationships: Type!
                typeString = `${rel.targetType}!`;
              }

              fieldsToAdd.push({
                name: rel.name,
                type: typeString,
              });
            }
          }

          if (fieldsToAdd.length > 0) {
            // Add new fields to the fields array
            def.fields = [...def.fields, ...fieldsToAdd];
            fileModified = true;
            fieldsAddedInFile += fieldsToAdd.length;

            // Create updated object and parse as new document
            // This preserves YAML structure better
            const updatedObj = { ...obj, definition: def };
            const updatedYaml = stringify(updatedObj, {
              lineWidth: 0,
              minContentWidth: 0,
              simpleKeys: false
            });
            return parseDocument(updatedYaml);
          }
        }
      }

      return doc;
    });

    if (fileModified) {
      // Write back the modified YAML with proper document separators
      const output = updatedDocuments
        .map((doc, index) => {
          const yamlStr = stringify(doc, {
            lineWidth: 0,
            minContentWidth: 0,
            simpleKeys: false
          });
          // Add document separator except for first document
          return index === 0 ? yamlStr : '---\n' + yamlStr;
        })
        .join('');

      fs.writeFileSync(hmlFile, output, 'utf-8');
      totalFilesModified++;
      totalFieldsAdded += fieldsAddedInFile;

      const fileName = path.basename(hmlFile);
      console.log(`  ✓ ${fileName}: Added ${fieldsAddedInFile} relationship field(s)`);
    }
  }

  if (totalFilesModified === 0) {
    console.log('  No files needed modification (all relationships already defined)');
  } else {
    console.log(
      `\n✓ Successfully updated ${totalFilesModified} file(s) with ${totalFieldsAdded} relationship field(s)`
    );
  }
}

// Run the script
try {
  makeRelationshipsNonNullable();
} catch (error) {
  console.error('Error:', error);
  process.exit(1);
}
