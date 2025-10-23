#!/usr/bin/env node

/**
 * CSV Import Script for Supabase
 *
 * Usage: npm run import -- <csv-file-path>
 * Example: npm run import -- data.csv
 */
import { pRateLimit } from 'p-ratelimit';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser';
import { Database, Tables } from '../types/supabase';

type SpeciesInsert = Database['public']['Tables']['Species']['Insert'];
type BirdsInsert = Database['public']['Tables']['Birds']['Insert'];
type EncountersInsert = Database['public']['Tables']['Encounters']['Insert'];
// Environment variables are loaded via 1Password CLI when running with npm run import

// CSV Import Type Definitions
// Extract all table names from the database schema
type TableNames = keyof Database['public']['Tables'];

// Create a union of all table row types
type AllTableRows<T extends TableNames = TableNames> = T extends TableNames
  ? Database['public']['Tables'][T]['Row']
  : never;

// Extract all unique property names from all tables
type AllTableProperties = {
  [K in TableNames]: keyof Database['public']['Tables'][K]['Row']
}[TableNames];

// Create a type that represents all possible CSV columns
// This is a union of all property names from Birds, Encounters, and Species tables
type CsvColumnName = AllTableProperties;

// Create a type for CSV row data that can contain any property from any table
// All properties are optional since a CSV row might not contain all columns
type CsvRowData = {
  [K in AllTableProperties]?: string | number | boolean | null;
};

// Individual table row types for typed access
type BirdsRow = Tables<'Birds'>;
type EncountersRow = Tables<'Encounters'>;
type SpeciesRow = Tables<'Species'>;

// Helper type to get the expected type for a specific column
type CsvColumnType<T extends CsvColumnName> = T extends keyof BirdsRow
  ? BirdsRow[T]
  : T extends keyof EncountersRow
  ? EncountersRow[T]
  : T extends keyof SpeciesRow
  ? SpeciesRow[T]
  : never;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing required environment variables');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// create a rate limiter that allows up to 30 API calls per second,
// with max concurrency of 10
const limit = pRateLimit({
    interval: 1000,             // 1000 ms == 1 second
    rate: 30,                   // 30 API calls per interval
    concurrency: 30            // no more than 10 running at once
    // maxDelay: 2000              // an API call delayed > 2 sec is rejected
}) as <T>(fn: () => Promise<T>) => Promise<T>;


// const limit = (fn => fn()) as <T>(fn: () => Promise<T>) => Promise<T>;

// Helper function to transform empty strings to null
function transformEmptyStringsToNull(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      // Handle string values
      if (typeof value === 'string') {
        const trimmed = value.trim();
        return [key, trimmed === '' ? null : trimmed];
      }
      // Return non-string values as-is
      return [key, value];
    })
  );
}

// Helper function to convert DD/MM/YYYY to YYYY-MM-DD
function convertDateFormat(dateString: string): string {
  return dateString.split('/').reverse().join('-');
}

interface ImportOptions {
  csvFilePath: string;
  batchSize?: number;
}

async function importCSV(options: ImportOptions): Promise<void> {
  const { csvFilePath, batchSize = 100 } = options;

  if (!fs.existsSync(csvFilePath)) {
    console.error(`Error: File not found: ${csvFilePath}`);
    process.exit(1);
  }

  console.log(`Starting import from ${csvFilePath}...`);

  const records: CsvRowData[] = [];
  let totalRecords = 0;
  let successfulRecords = 0;
  let failedRecords = 0;
  const pendingRows: (Promise<void> | null)[] = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csvParser())
      .on('data', (row) => {
        const rowIndex = totalRecords;
        totalRecords++;
        const promise = limit(() => createEncounterWithRelatedData(row).then(() => successfulRecords++, (err) => {
          console.log(err)
          failedRecords++
        }).then(() => {
          pendingRows[rowIndex] = null
        }));
        pendingRows[rowIndex] = promise

      })
      .on('end', async () => {
        await Promise.all(pendingRows.filter(p => Boolean(p)))
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

    async function createEncounterWithRelatedData(row: CsvRowData) {
      row = transformEmptyStringsToNull(row);
      if (!row.ring_no) {
        throw new Error('Casualty encounters are not to be imported')
      }
      const speciesData: SpeciesInsert = {
        species_name: row.species_name as string
      };
      const birdData: BirdsInsert = {
        species_name: row.species_name as string,
        ring_no: row.ring_no as string
      };
      const encounterData: EncountersInsert = {
        age: Number(String(row.age).replace('J', '')),
        breeding_condition: row.breeding_condition as string | null,
        capture_time: row.capture_time as string,
        extra_text: row.extra_text as string | null,
        is_juv: String(row.age).endsWith('J') as boolean,
        moult_code: row.moult_code as string | null,
        old_greater_coverts: row.old_greater_coverts as number | null,
        record_type: row.record_type as string,
        ring_no: row.ring_no as string,
        scheme: row.scheme as string,
        sex: row.sex as string,
        sexing_method: row.sexing_method as string | null,
        visit_date: convertDateFormat(row.visit_date as string),
        weight: row.weight as number | null,
        wing_length: row.wing_length as number | null
      };
      try {
        // 1. Upsert Species (create if doesn't exist)
        const { error: speciesError } = await supabase
          .from('Species')
          .upsert(speciesData, {
            onConflict: 'species_name',
            ignoreDuplicates: true
          });

        if (speciesError) throw speciesError;

        // 2. Upsert Bird (create if doesn't exist)
        const { error: birdError } = await supabase
          .from('Birds')
          .upsert(birdData, {
            onConflict: 'ring_no',
            ignoreDuplicates: true
          });

        if (birdError) throw birdError;

        // 3. Insert Encounter (always create new)
        const { data: encounterResult, error: encounterError } = await supabase
          .from('Encounters')
          .upsert(encounterData, {
            onConflict: 'ring_no,visit_date',
            ignoreDuplicates: true
          })
          .select();

        if (encounterError) throw encounterError;

        return encounterResult;
      } catch (error) {
        console.error('Error creating encounter with related data:', error);
        throw error;
      }
    }


  });
}

// Main execution
const args = process.argv.slice(2);

if (args.length < 1) {
  console.log('Usage: npm run import -- <csv-file-path> <table-name>');
  console.log('Example: npm run import -- data/birds.csv bird_sightings');
  process.exit(1);
}

const csvFilePath = path.resolve(args[0]);
importCSV({ csvFilePath })
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Import failed:', error);
    process.exit(1);
  });
