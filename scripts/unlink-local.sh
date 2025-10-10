#!/bin/bash

# Script to unlink ag-ui-solid from local development
# Usage: ./scripts/unlink-local.sh

set -e

echo "🔓 Unlinking ag-ui-solid..."
echo ""

# Remove global link
npm unlink

echo "✅ ag-ui-solid has been unlinked"
echo ""
echo "📝 Don't forget to also unlink in your application:"
echo "   cd /path/to/your-app"
echo "   npm unlink ag-ui-solid"
echo "   npm install ag-ui-solid  # Install from npm instead"
echo ""
