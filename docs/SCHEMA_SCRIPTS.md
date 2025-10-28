# Scripts


## Individual Scripts

### Supabase Scripts
- **`supabase:update-views`** (`scripts/supabase-migrate.sh`)
  - Creates Supabase migrations from view files in `supabase/views/`
  - Applies migrations to the linked database
  - Removes temporary migration files after processing
  - Run from project root

### Hasura Scripts
- **`hasura:update-graph`** (`scripts/hasura-introspect.sh`)
  - Introspects the database connector to detect schema changes
  - Adds GraphQL models for all database views
  - Builds the Hasura supergraph
  - Run from project root (changes to hasura directory internally)

- **`hasura:restart`** (`scripts/hasura-restart.sh`)
  - Restarts the Hasura Docker service and waits for it to be ready
  - Run from project root (changes to hasura directory internally)

- **`hasura:types`**
  - Regenerates typescript types from the hasura GraphQL API and any queries used in the project

- **`hasura:sync`**

This runs the following sequence:
1. `npm run supabase:update-views` - Create and apply database migrations
2. `npm run hasura:update-graph` - Introspect database changes
3. `npm run hasura::restart` - Restart service
4. `npm run hasura:types` - Generate TypeScript types

