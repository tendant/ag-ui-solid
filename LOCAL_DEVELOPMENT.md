# Local Development - Using @tendant/ag-ui-solid Without Publishing to npm

This guide shows how to use @tendant/ag-ui-solid in other applications during local development without publishing to npm.

## Table of Contents

- [Method 1: npm link (Recommended)](#method-1-npm-link-recommended)
- [Method 2: Local File Path](#method-2-local-file-path)
- [Method 3: Workspace/Monorepo](#method-3-workspacemonorepo)
- [Method 4: Build and Copy](#method-4-build-and-copy)
- [Hot Reloading Setup](#hot-reloading-setup)
- [Troubleshooting](#troubleshooting)

## Method 1: npm link (Recommended)

The `npm link` command creates a symbolic link, making the library available globally and then linking it to your project.

### Step-by-Step

**1. In the @tendant/ag-ui-solid directory:**

```bash
cd /Users/lei/workspace/fi/ag-ui-solid

# Build the library first
npm run build

# Create a global symlink
npm link
```

**2. In your application directory:**

```bash
cd /path/to/your-app

# Link the @tendant/ag-ui-solid package
npm link @tendant/ag-ui-solid
```

**3. Use it in your app:**

```tsx
import { ChatContainer, useChatStream } from '@tendant/ag-ui-solid';

const App = () => {
  const [state, actions] = useChatStream({ apiEndpoint: '/api/chat' });
  return <ChatContainer {...state} onSendMessage={actions.sendMessage} />;
};
```

### Advantages
- ✅ Works like a real npm package
- ✅ Easy to set up
- ✅ Can link to multiple projects
- ✅ Changes reflected after rebuild

### Development Workflow

```bash
# In ag-ui-solid directory
# Make changes to source code
npm run build

# Changes are now available in linked apps
# Just refresh your app
```

### Unlinking

When you're done:

```bash
# In your application
npm unlink @tendant/ag-ui-solid

# In @tendant/ag-ui-solid directory
npm unlink
```

## Method 2: Local File Path

Install the library directly from the file system.

### Setup

**In your application's package.json:**

```json
{
  "dependencies": {
    "@tendant/ag-ui-solid": "file:../ag-ui-solid",
    "solid-js": "^1.8.11"
  }
}
```

Then install:

```bash
npm install
```

### Advantages
- ✅ Simple and straightforward
- ✅ Works with npm/yarn/pnpm
- ✅ No global linking needed

### Disadvantages
- ❌ Copies files (not symlink)
- ❌ Need to reinstall after changes

### Development Workflow

```bash
# 1. Make changes in @tendant/ag-ui-solid
cd /Users/lei/workspace/fi/ag-ui-solid
npm run build

# 2. Reinstall in your app
cd /path/to/your-app
npm install
```

### Updating

After making changes:

```bash
# Force reinstall
npm install --force
# or
rm -rf node_modules/@tendant/ag-ui-solid
npm install
```

## Method 3: Workspace/Monorepo

Best for managing multiple related packages.

### Setup with npm Workspaces

Create a workspace structure:

```
my-project/
├── packages/
│   ├── ag-ui-solid/          # The library (@tendant/ag-ui-solid)
│   └── my-app/               # Your application
└── package.json              # Root package.json
```

**Root package.json:**

```json
{
  "name": "my-monorepo",
  "private": true,
  "workspaces": [
    "packages/*"
  ]
}
```

**my-app/package.json:**

```json
{
  "name": "my-app",
  "dependencies": {
    "@tendant/ag-ui-solid": "*",
    "solid-js": "^1.8.11"
  }
}
```

**Install from root:**

```bash
# From root directory
npm install
```

### Advantages
- ✅ Auto-linked between packages
- ✅ Shared dependencies
- ✅ Easy to manage
- ✅ Professional setup

### Using pnpm Workspaces

**pnpm-workspace.yaml:**

```yaml
packages:
  - 'packages/*'
```

**Root package.json:**

```json
{
  "name": "my-monorepo",
  "private": true
}
```

Then:

```bash
pnpm install
```

## Method 4: Build and Copy

Manually copy the built library to your project.

### Setup

**1. Build @tendant/ag-ui-solid:**

```bash
cd /Users/lei/workspace/fi/ag-ui-solid
npm run build
```

**2. Copy to your project:**

```bash
# Create a local directory for the library
cd /path/to/your-app
mkdir -p local-packages/ag-ui-solid

# Copy the built files
cp -r /Users/lei/workspace/fi/ag-ui-solid/dist local-packages/ag-ui-solid/
cp /Users/lei/workspace/fi/ag-ui-solid/package.json local-packages/ag-ui-solid/
```

**3. Install from local directory:**

```json
{
  "dependencies": {
    "@tendant/ag-ui-solid": "file:./local-packages/ag-ui-solid"
  }
}
```

### Advantages
- ✅ Full control
- ✅ No symbolic links
- ✅ Can version locally

### Disadvantages
- ❌ Manual process
- ❌ Need to copy after changes

## Hot Reloading Setup

For real-time development without rebuilding.

### Option 1: Watch Mode with npm link

**1. In @tendant/ag-ui-solid, add watch script to package.json:**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "build:watch": "vite build --watch"
  }
}
```

**2. Run in watch mode:**

```bash
cd /Users/lei/workspace/fi/ag-ui-solid
npm link
npm run build:watch
```

**3. In your app:**

```bash
npm link @tendant/ag-ui-solid
npm run dev
```

Now changes in @tendant/ag-ui-solid will automatically rebuild and update in your app!

### Option 2: Direct Source Import (Advanced)

Configure your app to import the source directly (requires matching build setup).

**vite.config.ts in your app:**

```typescript
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import path from 'path';

export default defineConfig({
  plugins: [solidPlugin()],
  resolve: {
    alias: {
      '@tendant/ag-ui-solid': path.resolve(__dirname, '../ag-ui-solid/src')
    }
  }
});
```

**Import directly:**

```tsx
import { ChatContainer } from '@tendant/ag-ui-solid/index.tsx';
```

**Advantages:**
- ✅ Instant updates
- ✅ No rebuild needed
- ✅ Best developer experience

**Disadvantages:**
- ❌ Complex setup
- ❌ Build configs must match

## Practical Examples

### Example 1: Quick Test Setup

```bash
# Terminal 1: @tendant/ag-ui-solid
cd /Users/lei/workspace/fi/ag-ui-solid
npm run build
npm link

# Terminal 2: your app
cd ~/projects/my-chat-app
npm link @tendant/ag-ui-solid
npm run dev

# Make changes, rebuild, refresh browser
```

### Example 2: Active Development

```bash
# Terminal 1: @tendant/ag-ui-solid (watch mode)
cd /Users/lei/workspace/fi/ag-ui-solid
npm run build:watch

# Terminal 2: your app
cd ~/projects/my-chat-app
npm link @tendant/ag-ui-solid
npm run dev

# Changes auto-rebuild and update!
```

### Example 3: Monorepo Setup

```bash
# Create structure
mkdir my-project
cd my-project

# Move or clone @tendant/ag-ui-solid
mv /Users/lei/workspace/fi/ag-ui-solid ./packages/

# Create app
mkdir -p packages/my-app

# Setup workspace
cat > package.json << 'EOF'
{
  "name": "my-project",
  "private": true,
  "workspaces": ["packages/*"]
}
EOF

# Install everything
npm install

# Now @tendant/ag-ui-solid is automatically linked!
cd packages/my-app
npm run dev
```

## Troubleshooting

### Issue: "Cannot find module '@tendant/ag-ui-solid'"

**Solution:**

```bash
# Rebuild the library
cd /Users/lei/workspace/fi/ag-ui-solid
npm run build

# Relink
npm link

# In your app
cd /path/to/your-app
npm link @tendant/ag-ui-solid
```

### Issue: "Module not found" after linking

**Solution:** Check that the library is built:

```bash
ls /Users/lei/workspace/fi/ag-ui-solid/dist
# Should show: index.js, index.d.ts, styles.css
```

If empty, run `npm run build`.

### Issue: Changes not reflecting

**Solution:**

```bash
# 1. Rebuild the library
cd /Users/lei/workspace/fi/ag-ui-solid
npm run build

# 2. Hard refresh your app
# In browser: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

# 3. Or restart dev server
cd /path/to/your-app
# Ctrl+C to stop
npm run dev
```

### Issue: Multiple versions of SolidJS

**Solution:** Use peer dependencies and ensure SolidJS is only installed once:

```bash
# In your app
npm list solid-js

# Should show only one version
# If multiple, remove duplicates
cd /Users/lei/workspace/fi/ag-ui-solid
npm uninstall solid-js
```

### Issue: TypeScript can't find types

**Solution:**

```bash
# Make sure types are built
cd /Users/lei/workspace/fi/ag-ui-solid
npm run build

# Check dist folder
ls dist/index.d.ts  # Should exist
```

### Issue: Styles not loading

**Solution:** Import styles in your app:

```tsx
// In your main entry file
import '@tendant/ag-ui-solid/dist/styles.css';
```

Or with file path:

```tsx
import '../path/to/ag-ui-solid/dist/styles.css';
```

## Best Practices

### 1. Always Build Before Linking

```bash
cd /Users/lei/workspace/fi/ag-ui-solid
npm run build
npm link
```

### 2. Use Watch Mode for Active Development

```bash
npm run build:watch
```

### 3. Version Your Changes

Even during local development, commit your changes:

```bash
git commit -m "feat: add new feature"
```

This helps track what version your app is using.

### 4. Document Local Setup

In your app's README:

```markdown
## Local Development with @tendant/ag-ui-solid

This project uses a local version of @tendant/ag-ui-solid:

\`\`\`bash
cd ../ag-ui-solid
npm run build
npm link

cd ../my-app
npm link @tendant/ag-ui-solid
\`\`\`
```

### 5. Use .env for Paths

For file-based installs:

```bash
# .env
AG_UI_SOLID_PATH=../ag-ui-solid
```

```json
{
  "dependencies": {
    "@tendant/ag-ui-solid": "file:${AG_UI_SOLID_PATH}"
  }
}
```

## Comparison Table

| Method | Setup | Updates | Hot Reload | Multiple Apps | Complexity |
|--------|-------|---------|------------|---------------|------------|
| npm link | Easy | Manual rebuild | With watch | Yes | Low |
| File path | Easy | Reinstall | No | No | Low |
| Workspace | Medium | Automatic | No | Yes | Medium |
| Build/Copy | Manual | Manual | No | No | Low |
| Direct source | Hard | Instant | Yes | Yes | High |

## Recommended Workflow

**For casual testing:**
```bash
npm link  # Quick and easy
```

**For active development:**
```bash
npm run build:watch  # Automatic rebuilds
npm link
```

**For team projects:**
```bash
# Use monorepo with workspaces
# Most professional and maintainable
```

## When to Publish to npm

Consider publishing when:
- ✅ Library is stable
- ✅ Multiple teams need it
- ✅ You want version control
- ✅ Need semantic versioning
- ✅ Want public distribution

During development, local methods are faster and more flexible!

## Next Steps

- See [GETTING_STARTED.md](./GETTING_STARTED.md) for usage examples
- See [USAGE.md](./USAGE.md) for integration patterns
- See [examples/](./examples/) for complete working examples
