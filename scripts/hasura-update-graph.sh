#!/bin/bash

# Script to introspect the database connector in Hasura
# This script should be run from the project root

set -e

echo "Introspecting Hasura database connector..."

cd hasura
ddn connector introspect totf

echo "✓ Hasura connector introspection completed successfully!"

echo "Adding/updating Hasura models for database views..."

for sql_file in ../supabase/views/*.sql; do
    if [ -f "$sql_file" ]; then
        filename=$(basename "$sql_file" .sql)

        # Convert snake_case to PascalCase for HML filename
        # e.g., species_league_table -> SpeciesLeagueTable
        # Using awk for portability (works on macOS BSD sed)
        hml_filename=$(echo "$filename" | awk -F'_' '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) substr($i,2); print}' OFS='')
        hml_file="app/metadata/${hml_filename}.hml"
        if [ -f "$hml_file" ]; then
            rm $hml_file
            echo "✓ Successfully removed Hasura model for: $filename"
        fi

        echo "Adding Hasura model for: $sql_file"
        ddn model add totf "$filename"
        if [ $? -eq 0 ]; then
            echo "✓ Successfully added GraphQL model for: $filename"
        else
            echo "✗ Failed to add GraphQL model for: $filename"
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


