#!/usr/bin/env tsx
/**
 * Utility to retrieve Supabase migration files with VIEW_ or FUNC_ prefixes
 * Can be used as a library or CLI tool
 */

import { readdirSync, existsSync } from 'fs';
import { join, basename } from 'path';

export interface MigrationInfo {
  file: string;        // Full filename: "20260123092627_VIEW_species_league_table.sql"
  path: string;        // Full path: "supabase/migrations/20260123092627_VIEW_species_league_table.sql"
  timestamp: string;   // "20260123092627"
  prefix: string;      // "VIEW" or "FUNC"
  name: string;        // "species_league_table"
}

/**
 * Get migration files from the migrations directory
 * Filters by prefix and selects the latest timestamp for each name
 */
export function getMigrations(
  prefix: 'VIEW' | 'FUNC' | 'ALL' = 'ALL',
  migrationsDir?: string
): MigrationInfo[] {
  // Find project root by looking for package.json
  let projectRoot = process.cwd();

  // If we're in hasura directory, go up to project root
  if (basename(projectRoot) === 'hasura') {
    projectRoot = join(projectRoot, '..');
  }

  // Verify we're in the right place by checking for package.json
  const packageJsonPath = join(projectRoot, 'package.json');
  if (!existsSync(packageJsonPath)) {
    throw new Error(`Could not find project root. Looking for package.json in: ${projectRoot}`);
  }

  // Use provided migrationsDir or default
  const migrationsPath = migrationsDir || join(projectRoot, 'supabase', 'migrations');

  if (!existsSync(migrationsPath)) {
    throw new Error(`Migrations directory not found: ${migrationsPath}`);
  }

  // Read all migration files
  const files = readdirSync(migrationsPath).filter((f: string) => f.endsWith('.sql'));

  // Parse migration files matching the pattern: YYYYMMDDHHMMSS_PREFIX_name.sql
  const migrations: MigrationInfo[] = [];

  for (const file of files) {
    // Match pattern: timestamp_PREFIX_name.sql
    const match = file.match(/^(\d+)_(VIEW|FUNC)_(.+)\.sql$/);
    if (match) {
      const [, timestamp, prefix, name] = match;
      migrations.push({
        file,
        path: join(migrationsPath, file),
        timestamp,
        prefix,
        name,
      });
    }
  }

  // Filter by prefix if specified
  const filtered = prefix === 'ALL'
    ? migrations
    : migrations.filter(m => m.prefix === prefix);

  // Group by name, select latest timestamp for each
  const latestMap: Record<string, MigrationInfo> = {};
  for (const migration of filtered) {
    const existing = latestMap[migration.name];
    if (!existing || migration.timestamp > existing.timestamp) {
      latestMap[migration.name] = migration;
    }
  }

  return Object.values(latestMap);
}

/**
 * CLI interface
 */
function main() {
  // Parse command line arguments
  let prefix: 'VIEW' | 'FUNC' | 'ALL' = 'ALL';
  let outputJson = false;
  const args = process.argv.slice(2);

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--prefix' && i + 1 < args.length) {
      const prefixArg = args[i + 1].toUpperCase();
      if (prefixArg === 'VIEW' || prefixArg === 'FUNC' || prefixArg === 'ALL') {
        prefix = prefixArg as 'VIEW' | 'FUNC' | 'ALL';
      } else {
        console.error(`Invalid prefix: ${prefixArg}. Must be VIEW, FUNC, or ALL`);
        process.exit(1);
      }
      i++; // Skip the next argument as we've consumed it
    } else if (args[i] === '--json') {
      outputJson = true;
    } else if (args[i] === '--help' || args[i] === '-h') {
      console.log('Usage: tsx scripts/get-supabase-custom-defs.ts [--prefix VIEW|FUNC|ALL] [--json]');
      console.log('');
      console.log('Options:');
      console.log('  --prefix VIEW|FUNC|ALL  Filter migrations by prefix (default: ALL)');
      console.log('  --json                 Output JSON array instead of paths (default: paths)');
      console.log('  --help, -h              Show this help message');
      console.log('');
      console.log('By default, outputs migration paths one per line.');
      console.log('Use --json to output full migration info as JSON array.');
      process.exit(0);
    }
  }

  try {
    const migrations = getMigrations(prefix);
    if (outputJson) {
      console.log(JSON.stringify(migrations, null, 2));
    } else {
      // Output paths one per line for easy bash processing
      migrations.forEach(m => console.log(m.path));
    }
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

// Run as CLI if executed directly
// Check if this file is being run directly (not imported)
if (process.argv[1] && process.argv[1].endsWith('get-supabase-custom-defs.ts')) {
  main();
}
