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

# Get migrations using the utility script
echo "Retrieving latest migrations..."
migration_output=$(cd .. && node --import tsx scripts/get-supabase-custom-defs.ts --prefix ALL 2>&1)
if [ $? -ne 0 ]; then
    echo "✗ Failed to retrieve migrations: $migration_output"
    exit 1
fi

# Process each migration (paths are newline-separated)
# Use process substitution to avoid subshell issues with variable persistence
while IFS= read -r migration_path; do
    if [ -z "$migration_path" ]; then
        continue
    fi
    if [ -f "$migration_path" ]; then
        # Extract filename without extension for the name
        migration_file=$(basename "$migration_path")
        filename=$(echo "$migration_file" | sed -E 's/^[0-9]+_(VIEW|FUNC)_(.+)\.sql$/\2/')

        # Check if this SQL file creates a function with RETURNS SETOF
        # Extract the return type table name
        return_table=$(grep -i "RETURNS SETOF" "$migration_path" | sed -E 's/.*RETURNS SETOF[[:space:]]+([a-zA-Z_][a-zA-Z0-9_]*).*/\1/i' | head -1)

        if [ -n "$return_table" ]; then
            # This file creates a function - track the return type table
            echo "Detected function in $migration_path returning SETOF $return_table"
            table_to_track="$return_table"

            # Also extract function name for native operation
            # Match: CREATE [OR REPLACE] FUNCTION function_name(
            func_name=$(grep -iE "CREATE\s+(OR\s+REPLACE\s+)?FUNCTION\s+\w+" "$migration_path" | sed -E 's/.*FUNCTION[[:space:]]+([a-zA-Z_][a-zA-Z0-9_]*).*/\1/i' | head -1)
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

        # For functions, we need to:
        # 1. First create the return table Model (if it doesn't exist) - but don't remove it!
        # 2. Then create the function Model with arguments mapping
        if [ -n "$return_table" ] && [ -n "$func_name" ]; then
            camel_case_func=$(echo "$func_name" | awk -F'_' '{for(i=1;i<=NF;i++) if(i==1) printf "%s", $i; else printf "%s%s", toupper(substr($i,1,1)), substr($i,2);}')

            # First, ensure the return table Model exists (but don't remove it if it exists)
            echo "  Ensuring return table Model exists: $table_to_track"
            if [ -f "$hml_file" ]; then
                echo "  Return table Model already exists: $table_to_track"
            else
                echo "  Creating return table Model: $table_to_track"
                if ddn model add totf "$table_to_track" 2>&1; then
                    echo "  ✓ Successfully created return table Model for: $table_to_track"
                else
                    echo "  ⚠️  Failed to create return table Model, continuing anyway..."
                fi
            fi

            # Now create the function Model with arguments
            # Convert camelCase function name to PascalCase for Model name
            func_model_name=$(echo "$camel_case_func" | awk '{print toupper(substr($0,1,1)) substr($0,2)}')
            func_hml_file="app/metadata/${func_model_name}.hml"

            echo "  Generating Model with arguments for function collection: $camel_case_func"

            # Remove existing function Model if it exists
            if [ -f "$func_hml_file" ]; then
                echo "  Removing existing function Model: $func_model_name"
                rm "$func_hml_file"
            fi

            # Generate Model with arguments mapping
            if (cd .. && node --import tsx scripts/generate-model-with-arguments.ts "$camel_case_func" "$return_table" 2>&1); then
                echo "  ✓ Successfully generated Model with arguments for: $camel_case_func"
            else
                echo "  ⚠️  Failed to generate Model with arguments for: $camel_case_func"
                echo "  ℹ️  This might happen if the collection doesn't have arguments or introspection hasn't run yet"
            fi

            # Add return table to processed list (so we don't process it again)
            if [ -z "$processed_models" ]; then
                processed_models="$table_to_track"
            else
                processed_models="$processed_models $table_to_track"
            fi
        else
            # Standard table/view - use ddn model add
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
    fi
done < <(echo "$migration_output")

if [ -z "$processed_models" ]; then
    echo "⚠️  No migrations found with VIEW_ or FUNC_ prefix"
    echo "   Make sure your migrations follow the naming convention: YYYYMMDDHHMMSS_PREFIX_name.sql"
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


