#!/bin/bash

# Helper script to add a Postgres function as a Hasura native operation
# Usage: ./scripts/add-hasura-function.sh <function_name> [return_table]
#
# This script helps reduce boilerplate when exposing Postgres functions in Hasura DDN
# It will:
# 1. Add the return table as a model (if not already added)
# 2. Create a native operation configuration (manual step - prints instructions)

set -e

FUNC_NAME="$1"
RETURN_TABLE="$2"

if [ -z "$FUNC_NAME" ]; then
    echo "Usage: $0 <function_name> [return_table]"
    echo ""
    echo "Example:"
    echo "  $0 top_sessions_by_metric top_sessions_result"
    exit 1
fi

cd "$(dirname "$0")/.."

# If return table not provided, try to extract from SQL file
if [ -z "$RETURN_TABLE" ]; then
    SQL_FILE=$(find supabase/views -name "*.sql" -exec grep -l "$FUNC_NAME" {} \; | head -1)
    if [ -n "$SQL_FILE" ]; then
        RETURN_TABLE=$(grep -i "RETURNS SETOF" "$SQL_FILE" | sed -E 's/.*RETURNS SETOF[[:space:]]+([a-zA-Z_][a-zA-Z0-9_]*).*/\1/i' | head -1)
        echo "Detected return table: $RETURN_TABLE"
    fi
fi

if [ -z "$RETURN_TABLE" ]; then
    echo "⚠️  Could not detect return table. Please provide it as second argument."
    exit 1
fi

echo "Adding Hasura model for return table: $RETURN_TABLE"
cd hasura

# Add the return table as a model
if ddn model add totf "$RETURN_TABLE" 2>&1; then
    echo "✓ Added model for $RETURN_TABLE"
else
    echo "⚠️  Model add failed (might already exist or table doesn't exist in DB)"
fi

echo ""
echo "Next steps to expose the function:"
echo ""
echo "1. The return table model has been added"
echo "2. You need to manually add a native operation in configuration.json:"
echo ""
echo "   In hasura/app/connector/totf/configuration.json, add to nativeOperations.queries:"
echo ""
echo "   \"${FUNC_NAME}\": {"
echo "     \"sql\": {"
echo "       \"inline\": \"SELECT * FROM ${FUNC_NAME}({{arg1}}, {{arg2}})\""
echo "     },"
echo "     \"columns\": {"
echo "       // Add column definitions matching your return table"
echo "     },"
echo "     \"arguments\": {"
echo "       // Add function arguments"
echo "     }"
echo "   }"
echo ""
echo "3. Then add a Model in metadata that uses this native operation:"
echo "   Run: ddn model add totf ${RETURN_TABLE} --collection ${FUNC_NAME}"
echo ""
echo "4. Run: ddn connector introspect totf"
echo "5. Run: ddn supergraph build local"
