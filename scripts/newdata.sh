#!/bin/bash

# Script to import CSV data and trigger production build
# Usage: npm run newdata data/oct17.csv

set -e

# Forward all arguments to supabase:import
npm run supabase:import "$@"

# Then run the production build
npm run build:prod
