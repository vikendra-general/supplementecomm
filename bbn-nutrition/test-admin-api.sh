#!/bin/bash

# Change to the backend directory
cd "$(dirname "$0")/backend"

# Check if the server is running
if ! nc -z localhost 5000 >/dev/null 2>&1; then
  echo "Starting the backend server..."
  # Start the server in the background
  node server.js &
  SERVER_PID=$!
  
  # Wait for the server to start
  echo "Waiting for server to start..."
  sleep 5
  
  # Set flag to indicate we started the server
  STARTED_SERVER=true
else
  echo "Backend server is already running."
  STARTED_SERVER=false
fi

# Run the test script
echo "Running admin API tests..."
node test-admin-products.js

# If we started the server, shut it down
if [ "$STARTED_SERVER" = true ]; then
  echo "Shutting down the server..."
  kill $SERVER_PID
fi

echo "Test completed."