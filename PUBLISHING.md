# Publishing to NPM

This guide explains how to publish ag-ui-solid to npm.

## Prerequisites

Before publishing, ensure you have:

1. ✅ npm account (you're logged in as `tendant`)
2. ✅ Access to publish to the `@tendant` scope
3. ✅ Clean git working directory
4. ✅ All tests passing
5. ✅ Library built successfully

## Pre-Publication Checklist

Before publishing a new version, complete this checklist:

### 1. Update Package Metadata (if needed)

Edit `package.json` to add/update:

```json
{
  "author": "Your Name <your.email@example.com>",
  "repository": {
    "type": "git",
    "url": "https://github.com/tendant/ag-ui-solid.git"
  },
  "bugs": {
    "url": "https://github.com/tendant/ag-ui-solid/issues"
  },
  "homepage": "https://github.com/tendant/ag-ui-solid#readme"
}
```

### 2. Verify Package Contents

Check what will be published:

```bash
npm pack --dry-run
```

This shows all files that will be included in the package. Verify that:
- ✅ `dist/` folder is included
- ✅ `README.md` is included
- ✅ `I18N_GUIDE.md` is included (if you want it)
- ❌ Source files (`src/`) are NOT included (they shouldn't be)
- ❌ `node_modules/` is NOT included

### 3. Run Tests

```bash
npm test
```

### 4. Build the Library

```bash
npm run build
```

Verify the build output in `dist/`:
- `dist/index.js` - Main library file
- `dist/index.d.ts` - TypeScript definitions
- `dist/style.css` - Component styles

## Publishing Process

### For First-Time Publication (v0.1.0)

If this is the first time publishing:

```bash
# 1. Verify you're logged in
npm whoami

# 2. Check package name is available
npm search @tendant/ag-ui-solid

# 3. Build the library
npm run build

# 4. Publish (with public access for scoped packages)
npm publish --access public
```

### For Subsequent Releases

#### Option 1: Using npm version (Recommended)

npm automatically updates version, creates git tag, and commits:

```bash
# For patch release (0.1.0 -> 0.1.1) - Bug fixes
npm version patch

# For minor release (0.1.0 -> 0.2.0) - New features, backward compatible
npm version minor

# For major release (0.1.0 -> 1.0.0) - Breaking changes
npm version major
```

Then build and publish:

```bash
npm run build
npm publish
```

#### Option 2: Manual Version Update

```bash
# 1. Manually edit version in package.json
# Change "version": "0.1.0" to "version": "0.2.0"

# 2. Build the library
npm run build

# 3. Commit the version change
git add package.json
git commit -m "Bump version to 0.2.0"
git tag v0.2.0
git push && git push --tags

# 4. Publish to npm
npm publish
```

## Version Guidelines (Semantic Versioning)

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0 -> 2.0.0): Breaking changes
  - Removing exported functions/components
  - Changing component APIs in incompatible ways
  - Renaming props or exports

- **MINOR** (0.1.0 -> 0.2.0): New features, backward compatible
  - Adding new components
  - Adding new props to existing components
  - Adding new translations

- **PATCH** (0.1.0 -> 0.1.1): Bug fixes, backward compatible
  - Fixing bugs
  - Updating documentation
  - Performance improvements

## Release Workflow

### Complete Release Process

```bash
# 1. Ensure clean working directory
git status

# 2. Pull latest changes
git pull origin main

# 3. Run tests
npm test

# 4. Update version (choose one: patch, minor, major)
npm version minor -m "Release v%s: Add i18n support"

# 5. Build the library
npm run build

# 6. Publish to npm
npm publish

# 7. Push git changes and tags
git push && git push --tags

# 8. Create GitHub release (optional but recommended)
# Go to GitHub -> Releases -> Create new release
# Use the tag you just created (e.g., v0.2.0)
# Add release notes describing changes
```

## Post-Publication

### 1. Verify Package on npm

Visit: https://www.npmjs.com/package/@tendant/ag-ui-solid

Check that:
- ✅ Version number is correct
- ✅ README is displaying properly
- ✅ Dependencies are correct
- ✅ File count looks reasonable

### 2. Test Installation

In a separate project, test installing the package:

```bash
npm install @tendant/ag-ui-solid
# or
npm install @tendant/ag-ui-solid@0.2.0
```

### 3. Update Documentation

If you have external documentation, update it with:
- New version number
- New features
- Migration guide (for breaking changes)

## Unpublishing (Emergency Only)

⚠️ **Warning**: Unpublishing can break projects that depend on your package!

You can only unpublish within 72 hours of publishing:

```bash
# Unpublish a specific version
npm unpublish @tendant/ag-ui-solid@0.1.0

# Unpublish entire package (use with extreme caution!)
npm unpublish @tendant/ag-ui-solid --force
```

Better alternative: Publish a new patch version with the fix.

## Deprecating Old Versions

If you want to discourage use of an old version:

```bash
npm deprecate @tendant/ag-ui-solid@0.1.0 "Please upgrade to 0.2.0 for i18n support"
```

## npm Scripts for Publishing

You can add these helper scripts to `package.json`:

```json
{
  "scripts": {
    "prepublishOnly": "npm test && npm run build",
    "version": "npm run build && git add -A dist",
    "postversion": "git push && git push --tags",
    "release:patch": "npm version patch && npm publish",
    "release:minor": "npm version minor && npm publish",
    "release:major": "npm version major && npm publish"
  }
}
```

Then you can simply run:

```bash
npm run release:minor
```

## Troubleshooting

### Error: "You do not have permission to publish"

Make sure you're logged in and have access to the `@tendant` scope:

```bash
npm whoami
npm access ls-packages
```

### Error: "Version already exists"

You're trying to publish a version that already exists. Update the version:

```bash
npm version patch
```

### Error: "Package name too similar to existing package"

If publishing for the first time, npm might flag similar package names. Contact npm support or choose a different name.

### Files Missing in Published Package

Check your `package.json` `files` array:

```json
{
  "files": [
    "dist",
    "README.md",
    "I18N_GUIDE.md"
  ]
}
```

## Best Practices

1. **Always test before publishing**: Run `npm test` and `npm run build`
2. **Use semantic versioning**: Follow MAJOR.MINOR.PATCH correctly
3. **Write good release notes**: Document what changed in each version
4. **Keep dependencies updated**: Regularly update peer dependencies
5. **Test the published package**: Install it in a test project
6. **Tag releases in git**: Use `git tag` for version tracking
7. **Create GitHub releases**: Add release notes on GitHub
8. **Update changelog**: Maintain a CHANGELOG.md file

## Quick Reference

```bash
# Check login status
npm whoami

# Dry run to see what will be published
npm pack --dry-run

# Build
npm run build

# Publish (first time)
npm publish --access public

# Update version and publish (subsequent releases)
npm version patch  # or minor, or major
npm run build
npm publish

# Push git changes
git push && git push --tags
```

## Example Release

Here's a complete example of publishing version 0.2.0 with i18n support:

```bash
# 1. Ensure everything is ready
git status
npm test
npm run build

# 2. Update version
npm version minor -m "Release v%s: Add internationalization support"
# This creates commit and tag automatically

# 3. Publish
npm publish

# 4. Push to git
git push origin main
git push --tags

# 5. Create GitHub release
# Go to https://github.com/tendant/ag-ui-solid/releases/new
# Select tag: v0.2.0
# Title: "v0.2.0 - Internationalization Support"
# Description:
# ## New Features
# - Added i18n support with English and Chinese translations
# - Added I18nProvider and useI18n hook
# - Updated all components to support localization
#
# ## Breaking Changes
# None
#
# ## Installation
# ```bash
# npm install @tendant/ag-ui-solid@0.2.0
# ```
```

Done! Your package is now published to npm! 🎉
