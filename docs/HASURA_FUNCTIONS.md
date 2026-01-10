# Exposing Postgres Functions in Hasura DDN

This guide explains how to expose custom Postgres functions in Hasura DDN with **zero boilerplate** - everything is fully automated!

## The Solution

We've created automated scripts that handle all the boilerplate:
1. ✅ Automatically configure native operations in `configuration.json`
2. ✅ Automatically generate HML metadata files (ObjectType, Model, BooleanExpression, AggregateExpression, OrderByExpression, Permissions)
3. ✅ Automatically add return table models
4. ✅ Automatically introspect and build the supergraph

## Fully Automated Workflow

### Step 1: Create Your Postgres Function

Create your function in `supabase/views/your_function.sql`:

```sql
CREATE TABLE IF NOT EXISTS your_return_table (
  column1 DATE,
  column2 BIGINT
);

CREATE OR REPLACE FUNCTION your_function(
  arg1 TEXT DEFAULT 'default_value',
  arg2 INTEGER DEFAULT 5
)
RETURNS SETOF your_return_table
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT ...;
END;
$$;
```

### Step 2: Apply to Database

Make sure your function is applied to the database:

```bash
npm run supabase:update-views
```

### Step 3: Run Automated Workflow

That's it! Run the automated script:

```bash
npm run hasura:update-graph
```

This single command automatically:
1. Introspects the database connector
2. Detects all functions in `supabase/views/*.sql`
3. **Automatically adds native operations to `configuration.json`**
4. Adds models for return tables
5. Builds the Hasura supergraph

### Step 4: Regenerate TypeScript Types

```bash
npm run hasura:types
```

**That's all you need to do!** The function is now exposed in your GraphQL API.

## What Gets Automated

The `hasura:update-graph` script automatically:

1. **Detects functions** - Scans `supabase/views/*.sql` for functions with `RETURNS SETOF`
2. **Adds native operations** - Automatically generates and adds native operation config to `configuration.json`
3. **Creates return table models** - Adds Hasura models for return tables (for ObjectType definitions)
4. **Creates function models with arguments** - Automatically generates Models with proper argument mapping for native operation collections
5. **Generates metadata** - Creates all required HML files (ObjectType, BooleanExpression, AggregateExpression, OrderByExpression, Permissions)
6. **Builds supergraph** - Runs introspection and builds the GraphQL schema

### Function Arguments

For functions with arguments, the script automatically:
- Maps PostgreSQL argument types to Hasura scalar types (e.g., `int4` → `Int64`, `text` → `String_1`)
- Creates Model arguments with camelCase names (e.g., `sort_by` → `sortBy`)
- Maps GraphQL argument names to collection argument names via `argumentMapping`
- Exposes arguments through the `args` field in GraphQL queries

The resulting GraphQL API will expose function arguments like:
```graphql
topSessionsByMetric(args: { sortBy: String, resultLimit: Int }, limit: Int, where: {...})
```

## Helper Scripts (Advanced Usage)

These scripts are used internally by the automated workflow, but you can also use them individually if needed:

### `scripts/add-native-operation.ts`

Automatically adds a native operation to `configuration.json` for a specific function.

**Usage:**
```bash
npm run hasura:add-native-op <function_name>
```

**Example:**
```bash
npm run hasura:add-native-op top_sessions_by_metric
```

### `scripts/generate-function-config.ts`

Generates native operation JSON config for a function (for manual inspection).

**Usage:**
```bash
npm run hasura:function-config <function_name>
```

### `scripts/add-hasura-function.sh`

Interactive helper to add a function with step-by-step instructions (legacy, use automated workflow instead).

**Usage:**
```bash
npm run hasura:add-function <function_name> [return_table]
```

### `scripts/generate-model-with-arguments.ts`

Generates Model configuration with arguments mapping for native operation collections. This is automatically called by `hasura-update-graph.sh` for functions with arguments.

**Usage:**
```bash
tsx scripts/generate-model-with-arguments.ts <collection_name> <return_table_name>
```

**Example:**
```bash
tsx scripts/generate-model-with-arguments.ts topSessionsByMetric top_sessions_result
```

### `scripts/hasura-update-graph.sh`

The main automated script that processes all views/functions.

**Usage:**
```bash
npm run hasura:update-graph
```

## Example: Adding `top_sessions_by_metric`

With the automated workflow, adding a function is now just 3 steps:

1. **Create the function** in `supabase/views/top_sessions_by_metric.sql`:
   ```sql
   CREATE TABLE IF NOT EXISTS top_sessions_result (
     visit_date DATE,
     metric_value BIGINT
   );

   CREATE OR REPLACE FUNCTION top_sessions_by_metric(
     sort_by TEXT DEFAULT 'encounters',
     result_limit INTEGER DEFAULT 5
   )
   RETURNS SETOF top_sessions_result
   LANGUAGE plpgsql
   STABLE
   AS $$ ... $$;
   ```

2. **Apply to database:**
   ```bash
   npm run supabase:update-views
   ```

3. **Run automated workflow:**
   ```bash
   npm run hasura:update-graph
   npm run hasura:types
   ```

Done! The function is now available in your GraphQL API as `topSessionsByMetric` with arguments exposed through the `args` field:

```graphql
query {
  topSessionsByMetric(args: { sortBy: "encounters", resultLimit: 10 }) {
    visitDate
    metricValue
  }
}
```

## Tips

1. **Always use `RETURNS SETOF <table_name>`** - Required for the automated workflow to work
2. **Create the return table first** - Define the table before the function in your SQL file
3. **Use descriptive names** - Makes it easier to identify functions
4. **Function names are converted to camelCase** - `top_sessions_by_metric` becomes `topSessionsByMetric` in GraphQL
5. **Run the full sync workflow** - Use `npm run supabase:sync` to update views, Hasura, and regenerate types in one command

## Troubleshooting

### Model add fails

- Make sure the table/view exists in the database
- Run `npm run supabase:update-views` first
- Check that the table name matches exactly (case-sensitive)

### Function not appearing in GraphQL

- Verify the native operation is in `configuration.json`
- Check that you've run `ddn connector introspect totf`
- Ensure the supergraph is built: `ddn supergraph build local`

### Type mismatches

- Run introspection to get accurate types
- Check `hasura/app/connector/totf/schema.json` for actual column types
- Update HML files if needed
