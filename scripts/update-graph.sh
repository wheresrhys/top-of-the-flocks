#!/bin/bash

# Iterate over all SQL files in the supabase/views directory
for sql_file in supabase/views/*.sql; do
    if [ -f "$sql_file" ]; then
        echo "Executing: $sql_file"
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

npx supabase migration up --linked

echo "All SQL files have been executed successfully!"

cd hasura
ddn connector introspect totf

for sql_file in ../supabase/views/*.sql; do
    if [ -f "$sql_file" ]; then
        echo "Updating hasura model: $sql_file"
        ddn models add totf ${sql_file##*/}
        if [ $? -eq 0 ]; then
            echo "✓ Successfully updated GraphQL model for: $sql_file"
        else
            echo "✗ Failed to update GraphQL model for: $sql_file"
            exit 1
        fi
    else
        echo "No views found in supabase/views/"
    fi
done

ddn supergraph build local

echo "Success. Now restart the docker container"
