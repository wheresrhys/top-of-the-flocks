#!/bin/bash

# Script to introspect the database connector in Hasura and auto-add models
# This script should be run from the project root

set -e

echo "Introspecting Hasura database connector..."

cd hasura
ddn connector introspect totf

echo "✓ Hasura connector introspection completed successfully!"

echo ""
echo "Adding/updating Hasura models for database views and functions..."

# Track which models we've processed to avoid duplicates
declare -A processed_models

for sql_file in ../supabase/views/*.sql; do
    if [ -f "$sql_file" ]; then
        filename=$(basename "$sql_file" .sql)

        # Check if this SQL file creates a function with RETURNS SETOF
        # Extract the return type table name
        return_table=$(grep -i "RETURNS SETOF" "$sql_file" | sed -E 's/.*RETURNS SETOF[[:space:]]+([a-zA-Z_][a-zA-Z0-9_]*).*/\1/i' | head -1)

        if [ -n "$return_table" ]; then
            # This file creates a function - track the return type table
            echo "Detected function in $sql_file returning SETOF $return_table"
            table_to_track="$return_table"

            # Also extract function name for native operation
            func_name=$(grep -iE "CREATE\s+(OR\s+REPLACE\s+)?FUNCTION\s+(\w+)" "$sql_file" | sed -E 's/.*FUNCTION\s+(\w+).*/\1/i' | head -1)
            echo "  Function name: $func_name"

            # Automatically add native operation to configuration.json
            if [ -n "$func_name" ]; then
                echo "  Adding native operation for function: $func_name"
                # Run from project root (we're currently in hasura directory)
                if (cd .. && tsx scripts/add-native-operation.ts "$func_name" 2>&1); then
                    echo "  ✓ Successfully added native operation for $func_name"
                else
                    echo "  ⚠️  Failed to add native operation for $func_name (may already exist)"
                fi
            fi
        else
            # This file creates a view or table - use the filename
            table_to_track="$filename"
        fi

        # Skip if we've already processed this model
        if [ -n "${processed_models[$table_to_track]}" ]; then
            echo "  ⚠️  Skipping $table_to_track (already processed)"
            continue
        fi

        # Convert snake_case to PascalCase for HML filename
        # e.g., top_sessions_result -> TopSessionsResult
        hml_filename=$(echo "$table_to_track" | awk -F'_' '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) substr($i,2); print}' OFS='')
        hml_file="app/metadata/${hml_filename}.hml"

        # Remove existing HML file if it exists (ddn model add will regenerate it)
        if [ -f "$hml_file" ]; then
            echo "  Removing existing model: $table_to_track"
            rm "$hml_file"
        fi

        echo "  Adding Hasura model for: $table_to_track"
        if ddn model add totf "$table_to_track" 2>&1; then
            echo "  ✓ Successfully added GraphQL model for: $table_to_track"
            processed_models[$table_to_track]=1
        else
            echo "  ✗ Failed to add GraphQL model for: $table_to_track"
            echo "  ℹ️  This might be expected if the table/view doesn't exist yet"
            echo "  ℹ️  Make sure your SQL migrations have been applied to the database"
        fi
    fi
done

if [ ${#processed_models[@]} -eq 0 ]; then
    echo "⚠️  No SQL files found in supabase/views/"
    echo "   Make sure your views/functions are in supabase/views/*.sql"
fi

echo ""
echo "Building Hasura supergraph..."

ddn supergraph build local

echo "✓ Hasura supergraph build completed successfully!"
echo ""
echo "Next steps:"
echo "  1. Review generated HML files in hasura/app/metadata/"
echo "  2. Run 'npm run hasura:types' to regenerate TypeScript types"
echo ""
echo "Note: Native operations for functions have been automatically added to configuration.json"


