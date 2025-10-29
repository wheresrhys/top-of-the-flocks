#!/bin/bash

# Script to restart the Hasura Docker service
# This script should be run from the project root

set -e

echo "Restarting Hasura Docker container..."

cd hasura

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

echo "✓ Hasura service restart completed successfully!"
