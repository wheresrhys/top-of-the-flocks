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
        filename=$(basename "$sql_file" .sql)
        ddn models add totf "$filename"
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

echo "Restarting Docker container..."

# Find and stop the existing ddn docker process
echo "Stopping existing DDN Docker process..."
pkill -f "ddn run docker-start" || true

# Wait a moment for the process to fully stop
sleep 2

# Start the Docker process in the background and wait for it to be ready
echo "Starting DDN Docker process..."
nohup ddn run docker-start > ddn-docker.log 2>&1 &
DDN_PID=$!

# Give it a moment to start
sleep 3

# Wait for the Docker container to be ready (you may need to adjust this check)
echo "Waiting for Docker container to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:3000/healthz > /dev/null 2>&1; then
        echo "✓ Docker container is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "✗ Timeout waiting for Docker container to start"
        kill $DDN_PID 2>/dev/null || true
        exit 1
    fi
    echo "Waiting... ($i/30)"
    sleep 2
done

echo "✓ Docker restart completed successfully"
echo "Waiting 10 seconds to ensure GraphQL API is fully up"
sleep 10
echo "Clean up migration files"
rm -rf ../supabase/migrations
