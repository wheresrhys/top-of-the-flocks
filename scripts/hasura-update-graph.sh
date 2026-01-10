#!/bin/bash

# Script to introspect the database connector in Hasura and auto-add models
# This script should be run from the project root

# Use set -e but handle errors gracefully for non-critical steps
set -e

echo "Introspecting Hasura database connector..."

cd hasura
ddn connector introspect totf

echo "✓ Hasura connector introspection completed successfully!"

echo ""
echo "Adding/updating Hasura models for database views and functions..."

# Track which models we've processed to avoid duplicates
# Use a simple array instead of associative array for compatibility
processed_models=""

# Track function mappings to add connector mappings later
function_mappings=""

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
            # Match: CREATE [OR REPLACE] FUNCTION function_name(
            func_name=$(grep -iE "CREATE\s+(OR\s+REPLACE\s+)?FUNCTION\s+\w+" "$sql_file" | sed -E 's/.*FUNCTION[[:space:]]+([a-zA-Z_][a-zA-Z0-9_]*).*/\1/i' | head -1)
            echo "  Function name: $func_name"

            # Automatically add native operation to configuration.json
            if [ -n "$func_name" ]; then
                echo "  Adding native operation for function: $func_name"
                # Run from project root (we're currently in hasura directory)
                # Use node --import tsx to avoid IPC permission issues with tsx
                if (cd .. && node --import tsx scripts/add-native-operation.ts "$func_name" 2>&1); then
                    echo "  ✓ Successfully added native operation for $func_name"
                    # Track this function mapping for later connector mapping addition
                    # Convert function name to camelCase for native operation collection name
                    # Use awk to convert snake_case to camelCase
                    camel_case_func=$(echo "$func_name" | awk -F'_' '{for(i=1;i<=NF;i++) if(i==1) printf "%s", $i; else printf "%s%s", toupper(substr($i,1,1)), substr($i,2);}')
                    if [ -z "$function_mappings" ]; then
                        function_mappings="{\"returnTable\":\"$return_table\",\"functionName\":\"$camel_case_func\"}"
                    else
                        function_mappings="$function_mappings,{\"returnTable\":\"$return_table\",\"functionName\":\"$camel_case_func\"}"
                    fi
                else
                    exit_code=$?
                    echo "  ⚠️  Failed to add native operation for $func_name (exit code: $exit_code)"
                    # Don't fail the whole script if native op addition fails
                fi
            fi
        else
            # This file creates a view or table - use the filename
            table_to_track="$filename"
        fi

        # Skip if we've already processed this model
        # Use string matching instead of associative array for bash 3 compatibility
        case " $processed_models " in
            *" $table_to_track "*)
                echo "  ⚠️  Skipping $table_to_track (already processed)"
                continue
                ;;
        esac

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
            # Add to processed list (space-separated string)
            if [ -z "$processed_models" ]; then
                processed_models="$table_to_track"
            else
                processed_models="$processed_models $table_to_track"
            fi
        else
            model_exit=$?
            echo "  ✗ Failed to add GraphQL model for: $table_to_track (exit code: $model_exit)"
            echo "  ℹ️  This might be expected if the table/view doesn't exist yet"
            echo "  ℹ️  Make sure your SQL migrations have been applied to the database"
            # Don't exit - continue processing other models
        fi
    fi
done

if [ -z "$processed_models" ]; then
    echo "⚠️  No SQL files found in supabase/views/"
    echo "   Make sure your views/functions are in supabase/views/*.sql"
fi

# Add connector mappings for functions after all models are added
if [ -n "$function_mappings" ]; then
    echo ""
    echo "Adding connector mappings for native operations..."
    # Build JSON array from function mappings
    mappings_json="[$function_mappings]"
    if (cd .. && node --import tsx scripts/add-function-mappings.ts "$mappings_json" 2>&1); then
        echo "✓ Connector mappings added successfully"
    else
        echo "⚠️  Failed to add connector mappings (this may cause validation errors)"
    fi
fi

echo ""
echo "Building Hasura supergraph..."

# Temporarily disable exit on error for supergraph build
set +e
ddn supergraph build local 2>&1
build_result=$?
set -e

if [ $build_result -eq 0 ]; then
    echo "✓ Hasura supergraph build completed successfully!"
else
    echo "⚠️  Hasura supergraph build failed (exit code: $build_result)"
    echo "   This might be due to configuration issues or missing dependencies"
    echo "   Check the error messages above for details"
fi
echo ""
echo "Next steps:"
echo "  1. Review generated HML files in hasura/app/metadata/"
echo "  2. Run 'npm run hasura:types' to regenerate TypeScript types"
echo ""
echo "Note: Native operations for functions have been automatically added to configuration.json"


