#!/bin/bash

# Script to run ag-ui-solid in watch mode for development
# Usage: ./scripts/dev-watch.sh

echo "👀 Starting ag-ui-solid in watch mode..."
echo ""
echo "Files will automatically rebuild when changed."
echo "Press Ctrl+C to stop."
echo ""

npm run build:watch
