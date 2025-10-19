# Top of the Flocks - 1Password Environment Setup

This project uses 1Password CLI for secure environment variable management.

## Prerequisites

1. Install 1Password CLI:
   ```bash
   # macOS with Homebrew
   brew install --cask 1password-cli
   
   # Or download from: https://developer.1password.com/docs/cli/get-started/#install
   ```

2. Sign in to 1Password CLI:
   ```bash
   op signin
   ```

3. Verify your setup:
   ```bash
   npm run env:check
   ```

## Environment Variables

Environment variables are stored in the **TOTF** vault in 1Password. The mapping is defined in `.env.1password`:

- `NEXT_PUBLIC_SUPABASE_URL` → `op://TOTF/Supabase/url`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → `op://TOTF/Supabase/anon_key`
- `SUPABASE_SERVICE_ROLE_KEY` → `op://TOTF/Supabase/service_role_key`
- `NEXT_PUBLIC_HASURA_ENDPOINT` → `op://TOTF/Hasura/endpoint`
- `HASURA_ADMIN_SECRET` → `op://TOTF/Hasura/admin_secret`

## Required 1Password Items

Create the following items in your **TOTF** vault:

### Supabase Item
- **Title**: `Supabase`
- **Fields**:
  - `url`: Your Supabase project URL (e.g., `https://your-project.supabase.co`)
  - `anon_key`: Your Supabase anonymous key
  - `service_role_key`: Your Supabase service role key (for imports)

### Hasura Item
- **Title**: `Hasura`
- **Fields**:
  - `endpoint`: Your Hasura GraphQL endpoint
  - `admin_secret`: Your Hasura admin secret

## Usage

All development commands now automatically load secrets from 1Password:

```bash
# Start development server
npm run dev

# Build the project
npm run build

# Import CSV data
npm run import -- data/sample.csv table_name

# Load environment variables for any command
npm run env:load -- your-command-here
```

## Manual Environment Loading

If you need to run commands manually with the environment loaded:

```bash
# Load environment and run a command
./scripts/load-env.sh your-command

# Or use op run directly
op run --env-file=".env.1password" -- your-command
```

## Security Notes

- Never commit actual secrets to version control
- The `.env.1password` file contains only references to 1Password items
- Always ensure you're signed in to 1Password CLI before running development commands
- Use `npm run env:check` to verify your authentication status
