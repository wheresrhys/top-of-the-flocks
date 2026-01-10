#!/bin/bash

# Script to introspect the database connector in Hasura
# This script should be run from the project root

set -e

echo "Introspecting Hasura database connector..."

cd hasura
ddn connector introspect totf

echo "✓ Hasura connector introspection completed successfully!"

echo "Adding/updating Hasura models for database views and functions..."

for sql_file in ../supabase/views/*.sql; do
    if [ -f "$sql_file" ]; then
        filename=$(basename "$sql_file" .sql)

        # Check if this SQL file creates a function with RETURNS SETOF
        # Extract the return type table name
        return_table=$(grep -i "RETURNS SETOF" "$sql_file" | sed -E 's/.*RETURNS SETOF[[:space:]]+([a-zA-Z_][a-zA-Z0-9_]*).*/\1/i' | head -1)

        if [ -n "$return_table" ]; then
            # This file creates a function - track the return type table instead
            echo "Detected function in $sql_file returning SETOF $return_table"
            table_to_track="$return_table"
        else
            # This file creates a view or table - use the filename
            table_to_track="$filename"
        fi

        # Convert snake_case to PascalCase for HML filename
        # e.g., top_sessions_result -> TopSessionsResult
        hml_filename=$(echo "$table_to_track" | awk -F'_' '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) substr($i,2); print}' OFS='')
        hml_file="app/metadata/${hml_filename}.hml"
        if [ -f "$hml_file" ]; then
            rm $hml_file
            echo "✓ Successfully removed Hasura model for: $table_to_track"
        fi

        echo "Adding Hasura model for table/view: $table_to_track (from file: $filename)"
        ddn model add totf "$table_to_track"
        if [ $? -eq 0 ]; then
            echo "✓ Successfully added GraphQL model for: $table_to_track"
        else
            echo "✗ Failed to add GraphQL model for: $table_to_track"
            exit 1
        fi
    else
        echo "No views found in supabase/views/"
        exit 1
    fi
done

echo "✓ All Hasura models added/updated successfully!"

echo "Building Hasura supergraph..."

ddn supergraph build local

echo "✓ Hasura supergraph build completed successfully!"


