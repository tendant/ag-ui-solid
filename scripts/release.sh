#!/bin/bash

# Release Script for ag-ui-solid
# Usage: ./scripts/release.sh [patch|minor|major]
# Example: ./scripts/release.sh minor

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get version type (default to minor if not specified)
VERSION_TYPE=${1:-minor}

# Validate version type
if [[ ! "$VERSION_TYPE" =~ ^(patch|minor|major)$ ]]; then
  echo -e "${RED}Error: Invalid version type '$VERSION_TYPE'${NC}"
  echo "Usage: ./scripts/release.sh [patch|minor|major]"
  echo "  patch - Bug fixes (0.1.0 -> 0.1.1)"
  echo "  minor - New features (0.1.0 -> 0.2.0)"
  echo "  major - Breaking changes (0.1.0 -> 1.0.0)"
  exit 1
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  ag-ui-solid Release Script${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Step 1: Check if logged into npm
echo -e "${YELLOW}[1/8]${NC} Checking npm login..."
if ! npm whoami &> /dev/null; then
  echo -e "${RED}Error: Not logged into npm. Please run 'npm login' first.${NC}"
  exit 1
fi
NPM_USER=$(npm whoami)
echo -e "${GREEN}✓${NC} Logged in as: ${NPM_USER}"
echo ""

# Step 2: Check for uncommitted changes
echo -e "${YELLOW}[2/8]${NC} Checking git status..."
if [[ -n $(git status --porcelain) ]]; then
  echo -e "${RED}Error: You have uncommitted changes.${NC}"
  echo "Please commit or stash them before releasing."
  git status --short
  exit 1
fi
echo -e "${GREEN}✓${NC} Working directory is clean"
echo ""

# Step 3: Pull latest changes
echo -e "${YELLOW}[3/8]${NC} Pulling latest changes..."
git pull origin $(git branch --show-current)
echo -e "${GREEN}✓${NC} Up to date with remote"
echo ""

# Step 4: Run tests
echo -e "${YELLOW}[4/8]${NC} Running tests..."
if npm test -- --run; then
  echo -e "${GREEN}✓${NC} All tests passed"
else
  echo -e "${RED}Error: Tests failed. Please fix them before releasing.${NC}"
  exit 1
fi
echo ""

# Step 5: Build the library
echo -e "${YELLOW}[5/8]${NC} Building library..."
npm run build
echo -e "${GREEN}✓${NC} Build completed"
echo ""

# Step 6: Update version
echo -e "${YELLOW}[6/8]${NC} Updating version (${VERSION_TYPE})..."
NEW_VERSION=$(npm version $VERSION_TYPE --no-git-tag-version)
echo -e "${GREEN}✓${NC} Version updated to: ${NEW_VERSION}"
echo ""

# Step 7: Commit and tag
echo -e "${YELLOW}[7/8]${NC} Creating git commit and tag..."
git add package.json package-lock.json
git commit -m "Release ${NEW_VERSION}"
git tag "${NEW_VERSION}"
echo -e "${GREEN}✓${NC} Created commit and tag: ${NEW_VERSION}"
echo ""

# Step 8: Publish to npm
echo -e "${YELLOW}[8/8]${NC} Publishing to npm..."
npm publish --access public
echo -e "${GREEN}✓${NC} Published to npm"
echo ""

# Push to git
echo -e "${YELLOW}Pushing to git...${NC}"
git push origin $(git branch --show-current)
git push --tags
echo -e "${GREEN}✓${NC} Pushed to git repository"
echo ""

# Success message
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  🎉 Release ${NEW_VERSION} successful!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Package published: https://www.npmjs.com/package/@tendant/ag-ui-solid"
echo ""
echo "Next steps:"
echo "  1. View on npm: npm view @tendant/ag-ui-solid"
echo "  2. Test installation: npm install @tendant/ag-ui-solid@${NEW_VERSION}"
echo "  3. Create GitHub release: https://github.com/yourusername/ag-ui-solid/releases/new"
echo ""
