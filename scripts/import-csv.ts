#!/usr/bin/env node

/**
 * CSV Import Script for Supabase
 * 
 * Usage: npm run import -- <csv-file-path> <table-name>
 * Example: npm run import -- data.csv bird_sightings
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser';
// Environment variables are loaded via 1Password CLI when running with npm run import

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing required environment variables');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ImportOptions {
  csvFilePath: string;
  tableName: string;
  batchSize?: number;
}

async function importCSV(options: ImportOptions): Promise<void> {
  const { csvFilePath, tableName, batchSize = 100 } = options;

  if (!fs.existsSync(csvFilePath)) {
    console.error(`Error: File not found: ${csvFilePath}`);
    process.exit(1);
  }

  console.log(`Starting import from ${csvFilePath} to ${tableName}...`);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const records: Record<string, any>[] = [];
  let totalRecords = 0;
  let successfulRecords = 0;
  let failedRecords = 0;

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csvParser())
      .on('data', (row) => {
        records.push(row);
        totalRecords++;

        // Insert in batches
        if (records.length >= batchSize) {
          processBatch();
        }
      })
      .on('end', async () => {
        // Process remaining records
        if (records.length > 0) {
          await processBatch();
        }

        console.log('\n✓ Import completed');
        console.log(`Total records: ${totalRecords}`);
        console.log(`Successful: ${successfulRecords}`);
        console.log(`Failed: ${failedRecords}`);
        resolve();
      })
      .on('error', (error) => {
        console.error('Error reading CSV file:', error);
        reject(error);
      });

    async function processBatch() {
      const batch = records.splice(0, records.length);
      
      try {
        const { error } = await supabase
          .from(tableName)
          .insert(batch);

        if (error) {
          console.error(`Error inserting batch:`, error);
          failedRecords += batch.length;
        } else {
          successfulRecords += batch.length;
          console.log(`✓ Inserted ${batch.length} records (${successfulRecords}/${totalRecords})`);
        }
      } catch (error) {
        console.error('Error processing batch:', error);
        failedRecords += batch.length;
      }
    }
  });
}

// Main execution
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('Usage: npm run import -- <csv-file-path> <table-name>');
  console.log('Example: npm run import -- data/birds.csv bird_sightings');
  process.exit(1);
}

const csvFilePath = path.resolve(args[0]);
const tableName = args[1];

importCSV({ csvFilePath, tableName })
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Import failed:', error);
    process.exit(1);
  });
