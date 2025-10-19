#!/bin/bash

# Load environment variables from 1Password vault
# This script uses op run to inject secrets from 1Password into the environment

echo "Loading environment variables from 1Password vault TOTF..."

# Verify 1Password CLI is installed and authenticated
if ! command -v op &> /dev/null; then
    echo "Error: 1Password CLI (op) is not installed"
    echo "Install it from: https://developer.1password.com/docs/cli/get-started/#install"
    exit 1
fi

# Check if user is signed in
if ! op whoami > /dev/null 2>&1; then
    echo "Error: Not signed in to 1Password CLI"
    echo "Run: op signin"
    exit 1
fi

# Export the environment variables using op run
echo "Injecting secrets from vault TOTF..."
exec op run --env-file=".env.1password" -- "$@"
