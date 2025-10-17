# Quick Release Guide

## One-Command Release

To release a new version, simply run:

```bash
# For a minor release (recommended for new features like i18n)
npm run release:minor

# For a patch release (bug fixes)
npm run release:patch

# For a major release (breaking changes)
npm run release:major
```

## What the Script Does

The release script automatically:

1. ✅ Checks you're logged into npm
2. ✅ Verifies no uncommitted changes
3. ✅ Pulls latest code from git
4. ✅ Runs all tests
5. ✅ Builds the library
6. ✅ Updates version number
7. ✅ Creates git commit and tag
8. ✅ Publishes to npm
9. ✅ Pushes to git repository

## Usage Examples

### Release a minor version (0.1.0 → 0.2.0)
```bash
npm run release:minor
```

### Release a patch version (0.1.0 → 0.1.1)
```bash
npm run release:patch
```

### Release a major version (0.1.0 → 1.0.0)
```bash
npm run release:major
```

### Direct script usage
```bash
./scripts/release.sh minor
./scripts/release.sh patch
./scripts/release.sh major
```

## Semantic Versioning Guide

- **patch** (0.1.0 → 0.1.1): Bug fixes only
- **minor** (0.1.0 → 0.2.0): New features, backward compatible
- **major** (0.1.0 → 1.0.0): Breaking changes

## First-Time Release

For the very first release (version 0.1.0):

```bash
npm publish --access public
```

## Prerequisites

- ✅ Logged into npm: `npm whoami`
- ✅ Clean git working directory
- ✅ All tests passing
- ✅ On the correct branch (usually `main`)

## After Release

The script will show you:
- Package URL: https://www.npmjs.com/package/@tendant/ag-ui-solid
- Next steps and verification commands

Test the published package:
```bash
npm view @tendant/ag-ui-solid
npm install @tendant/ag-ui-solid@latest
```

## Troubleshooting

### "Not logged into npm"
```bash
npm login
```

### "You have uncommitted changes"
```bash
git status
git add .
git commit -m "Your commit message"
```

### "Tests failed"
Fix the failing tests before releasing:
```bash
npm test
```

### Script permission denied
```bash
chmod +x scripts/release.sh
```

## Full Documentation

For complete publishing documentation, see [PUBLISHING.md](../PUBLISHING.md)
