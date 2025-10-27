#!/bin/bash

# Iterate over all SQL files in the supabase/views directory
for sql_file in supabase/views/*.sql; do
    if [ -f "$sql_file" ]; then
        echo "Executing: $sql_file"
        npx supabase db shell < "$sql_file"
        if [ $? -eq 0 ]; then
            echo "✓ Successfully executed: $sql_file"
        else
            echo "✗ Failed to execute: $sql_file"
            exit 1
        fi
    else
        echo "No SQL files found in supabase/views/"
    fi
done

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
