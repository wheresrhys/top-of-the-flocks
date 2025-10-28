#!/bin/bash

# Script to introspect the database connector in Hasura
# This script should be run from the project root

set -e

echo "Introspecting Hasura database connector..."

cd hasura
ddn connector introspect totf

echo "✓ Hasura connector introspection completed successfully!"

echo "Adding Hasura models for database views..."

for sql_file in ../supabase/views/*.sql; do
    if [ -f "$sql_file" ]; then
        echo "Adding Hasura model for: $sql_file"
        filename=$(basename "$sql_file" .sql)
        ddn models add totf "$filename"
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

echo "✓ All Hasura models added successfully!"

echo "Building Hasura supergraph..."

ddn supergraph build local

echo "✓ Hasura supergraph build completed successfully!"


