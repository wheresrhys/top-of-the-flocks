#!/bin/bash

# Script to create and apply Supabase migrations from view files
# This script should be run from the project root

set -e

echo "Updating Supabase views..."
npx supabase migration fetch --yes

# Check if there are any SQL files in the views directory
if ! ls supabase/views/*.sql 1> /dev/null 2>&1; then
    echo "No SQL files found in supabase/views/"
    exit 0
fi

# Create a single migration for all views
echo "Creating single migration for all views..."
migration_output=$(npx supabase migration new update_views)

echo "$migration_output"

# Extract the migration file path from the output
migration_file=$(echo "$migration_output" | grep -o 'supabase/migrations/[^[:space:]]*\.sql')

if [ -z "$migration_file" ]; then
    echo "✗ Failed to extract migration file path from output"
    exit 1
fi

echo "Concatenating all SQL files from supabase/views/ into $migration_file"

# Write a header comment
cat > "$migration_file" << 'EOF'
-- Migration: Update all views and functions
-- This migration combines all SQL files from supabase/views/
-- Generated automatically by supabase-update-views.sh

EOF

# Concatenate all SQL files with separators
for sql_file in supabase/views/*.sql; do
    if [ -f "$sql_file" ]; then
        echo "Adding: $sql_file"
        echo "" >> "$migration_file"
        echo "-- ============================================" >> "$migration_file"
        echo "-- File: $(basename "$sql_file")" >> "$migration_file"
        echo "-- ============================================" >> "$migration_file"
        echo "" >> "$migration_file"
        cat "$sql_file" >> "$migration_file"
        echo "" >> "$migration_file"
    fi
done

echo "✓ Successfully created combined migration file: $migration_file"
echo "Applying migrations to linked database..."
npx supabase migration up --linked --debug

echo "✓ All Supabase migrations completed successfully!"

echo "Cleaning up migration files..."
rm -rf supabase/migrations

echo "✓ All views updated successfully!"
