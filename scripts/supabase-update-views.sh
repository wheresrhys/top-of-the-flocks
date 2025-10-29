#!/bin/bash

# Script to create and apply Supabase migrations from view files
# This script should be run from the project root

set -e

echo "Updating Supabase views..."
npx supabase migration fetch --yes
# Iterate over all SQL files in the supabase/views directory
for sql_file in supabase/views/*.sql; do
    if [ -f "$sql_file" ]; then
        echo "Processing: $sql_file"
        # Create new migration and capture the output
        migration_output=$(npx supabase migration new species_league_table)
        echo "$migration_output"

        # Extract the migration file path from the output
        migration_file=$(echo "$migration_output" | grep -o 'supabase/migrations/[^[:space:]]*\.sql')

        if [ -n "$migration_file" ]; then
            echo "Writing contents of $sql_file to $migration_file"
            cat "$sql_file" > "$migration_file"
            echo "✓ Successfully wrote SQL to migration file: $migration_file"
        else
            echo "✗ Failed to extract migration file path from output"
            exit 1
        fi
    else
        echo "No SQL files found in supabase/views/"
    fi
done

echo "Applying migrations to linked database..."
npx supabase migration up --linked

echo "✓ All Supabase migrations completed successfully!"

echo "Cleaning up migration files..."
rm -rf supabase/migrations

echo "✓ All views updated successfully!"
