# top-of-the-flocks
Leaderboard for bird ringing data

## Overview

This is a Next.js application that provides a leaderboard for bird ringing data. The application uses:
- **Next.js** - React framework for production
- **Supabase** - PostgreSQL database and authentication
- **Vercel** - Hosting and deployment
- **GitHub Actions** - Continuous Integration

## Prerequisites

- Node.js 20 or higher
- npm
- A Supabase account and project

## DB management
- `npx supabase db link` to link to the totf project
- `npm run db:local` to start the db
- `npm run db:types` to generate types from the local db
- To reflect any changes made via the local supabase dashboard http://127.0.0.1:54323/project/default as a migration
  1. `npx supabase migration new {your name}`
  2. `npm run db:diff > {name of created migration file}`
- To discard changes from local delete all but the migration reflecting the state of prod, then `npm run db:sync:local`. This also regenerates some data
- To push changes to prod `npm run db:sync:prod`

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/wheresrhys/top-of-the-flocks.git
cd top-of-the-flocks
npm install
```

### 2. Configure environment variables

This project uses 1Password CLI for secure environment variable management. See [1Password Setup Guide](docs/1PASSWORD_SETUP.md) for detailed instructions.

**Quick setup:**

1. Install 1Password CLI: `brew install --cask 1password-cli`
2. Sign in: `op signin`
3. Verify setup: `npm run env:check`
4. Create the required items in your **TOTF** vault (see setup guide for details)

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Data Import

To import data from a CSV file into Supabase:

```bash
npm run import -- <path-to-csv-file> <table-name>
```

Example:
```bash
npm run import -- data/birds.csv bird_sightings
```

The import script:
- Reads CSV files and parses them
- Inserts data in batches (100 records at a time by default)
- Provides progress feedback
- Reports success/failure statistics

### CSV File Format

Ensure your CSV file has headers that match your Supabase table column names. For example:

```csv
species,location,date,ringer_id
Robin,London,2024-01-15,12345
Sparrow,Manchester,2024-01-16,12346
```

## Deployment

### Vercel (Recommended)

This project is optimized for deployment on Vercel:

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel project settings
4. Deploy

Vercel will automatically deploy your main branch and create preview deployments for pull requests.

### Environment Variables for Vercel

Add these environment variables in your Vercel project settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_HASURA_ENDPOINT`

**Note:** Do not add `SUPABASE_SERVICE_ROLE_KEY` or `HASURA_ADMIN_SECRET` to Vercel as they are only needed for the import script.

## CI/CD

GitHub Actions automatically runs on every push and pull request to the main branch:
- Installs dependencies
- Runs the linter
- Builds the project

The workflow configuration is in `.github/workflows/ci.yml`.

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── components/        # React components
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── lib/                   # Shared utilities
│   ├── supabase.ts        # Supabase client configuration
│   ├── hasura.ts          # Hasura configuration
│   └── graphql-client.ts  # GraphQL client for Hasura
├── scripts/               # Utility scripts
│   └── import-csv.ts      # CSV import script
├── data/                  # CSV files for import
│   ├── README.md          # Data import documentation
│   └── sample.csv         # Sample CSV file
├── .github/
│   └── workflows/
│       └── ci.yml         # GitHub Actions CI workflow
└── .env.example           # Example environment variables
```

## Using Supabase and Hasura

### Example Component

See `app/components/ExampleComponent.tsx` for a complete example of how to:
- Fetch data from Supabase using the Supabase client
- Fetch data from Hasura using GraphQL queries
- Handle loading and error states
- Display data in your components

To use the example component, uncomment the relevant sections and modify the queries to match your database schema.

## Setting up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from Settings > API
3. Create your database tables in the SQL Editor or Table Editor

UPdate types locally using `npm run supabase:types`

## Setting up Hasura

ddn console --local && npm run hasura:dev


## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Hasura Documentation](https://hasura.io/docs)
- [Vercel Documentation](https://vercel.com/docs)

