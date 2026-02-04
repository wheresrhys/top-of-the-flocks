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
import { Database } from '../types/supabase.types';

type SpeciesInsert = Database['public']['Tables']['Species']['Insert'];
type BirdsInsert = Database['public']['Tables']['Birds']['Insert'];
type EncountersInsert = Database['public']['Tables']['Encounters']['Insert'];
type SessionsInsert = Database['public']['Tables']['Sessions']['Insert'];
// Environment variables are loaded via 1Password CLI when running with npm run import

// CSV Import Type Definitions
// Extract all table names from the database schema
type TableNames = keyof Database['public']['Tables'];


// Extract all unique property names from all tables
type AllTableProperties = {
  [K in TableNames]: keyof Database['public']['Tables'][K]['Row'] | "age"
}[TableNames];

// Create a type for CSV row data that can contain any property from any table
// All properties are optional since a CSV row might not contain all columns
type CsvRowData = {
  [K in AllTableProperties]?: string | number | boolean | null;
};

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
}

async function importCSV(options: ImportOptions): Promise<void> {
  const { csvFilePath } = options;

  if (!fs.existsSync(csvFilePath)) {
    console.error(`Error: File not found: ${csvFilePath}`);
    process.exit(1);
  }

  console.log(`Starting import from ${csvFilePath}...`);

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
      try {
        // 1. Upsert Species (create if doesn't exist) and get ID
        const speciesData: SpeciesInsert = {
          species_name: row.species_name as string
        };
        const { data: speciesResult, error: speciesError } = await supabase
          .from('Species')
          .upsert(speciesData, {
            onConflict: 'species_name',
            ignoreDuplicates: false
          })
          .select('id')
          .single();

        if (speciesError) throw speciesError;
        const speciesId = speciesResult.id;

        // 2. Upsert Bird (create if doesn't exist) and get ID
        const birdData: BirdsInsert = {
          ring_no: row.ring_no as string,
          species_id: speciesId
        };
        const { data: birdResult, error: birdError } = await supabase
          .from('Birds')
          .upsert(birdData, {
            onConflict: 'ring_no',
            ignoreDuplicates: false
          })
          .select('id')
          .single();

        if (birdError) throw birdError;
        const birdId = birdResult.id;

        // 3. Upsert Session (create if doesn't exist) and get ID
        const visitDate = convertDateFormat(row.visit_date as string);
        const sessionData: SessionsInsert = {
          visit_date: visitDate
        };

        const { data: sessionResult, error: sessionError } = await supabase
          .from('Sessions')
          .upsert(sessionData, {
            onConflict: 'visit_date',
            ignoreDuplicates: false
          })
          .select('id')
          .single();

        if (sessionError) throw sessionError;
        const sessionId = sessionResult.id;

        // 4. Insert Encounter (always create new)
        const age_code: number = Number(String(row.age).replace('J', ''));

        const encounterData: EncountersInsert = {
          age_code,
          minimum_years: Math.max(0, Math.floor((age_code/2) -1)),
          breeding_condition: row.breeding_condition as string | null,
          capture_time: row.capture_time as string,
          extra_text: row.extra_text as string | null,
          is_juv: String(row.age).endsWith('J') as boolean,
          moult_code: row.moult_code as string | null,
          old_greater_coverts: row.old_greater_coverts as number | null,
          record_type: row.record_type as string,
          bird_id: birdId,
          session_id: sessionId,
          scheme: row.scheme as string,
          sex: row.sex as string,
          sexing_method: row.sexing_method as string | null,
          weight: row.weight as number | null,
          wing_length: row.wing_length as number | null
        };
        const { data: encounterResult, error: encounterError } = await supabase
          .from('Encounters')
          .upsert(encounterData, {
            onConflict: 'bird_id,session_id',
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
