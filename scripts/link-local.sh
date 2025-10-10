#!/bin/bash

# Script to link ag-ui-solid for local development
# Usage: ./scripts/link-local.sh

set -e

echo "🔗 Setting up ag-ui-solid for local development..."
echo ""

# Build the library
echo "📦 Building ag-ui-solid..."
npm run build

# Check if build was successful
if [ ! -f "dist/index.js" ]; then
    echo "❌ Build failed - dist/index.js not found"
    exit 1
fi

echo "✅ Build successful"
echo ""

# Create global link
echo "🔗 Creating global npm link..."
npm link

echo ""
echo "✅ ag-ui-solid is now linked globally!"
echo ""
echo "📝 Next steps:"
echo "   1. Go to your application directory:"
echo "      cd /path/to/your-app"
echo ""
echo "   2. Link ag-ui-solid:"
echo "      npm link ag-ui-solid"
echo ""
echo "   3. Start development:"
echo "      npm run dev"
echo ""
echo "   4. For hot reloading, run this in another terminal:"
echo "      npm run build:watch"
echo ""
