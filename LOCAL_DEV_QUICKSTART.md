# Local Development Quick Start

Quick reference for using ag-ui-solid locally without publishing to npm.

## 🚀 Quick Start (2 minutes)

### Method 1: npm link (Recommended)

**In ag-ui-solid directory:**
```bash
npm run link:local
```

**In your app directory:**
```bash
npm link ag-ui-solid
npm run dev
```

Done! Your app now uses the local version.

---

## 📋 All Methods at a Glance

### 1. npm link (Best for development)
```bash
# ag-ui-solid
npm run link:local

# your-app
npm link ag-ui-solid
```

### 2. File Path (Simple)
```json
// your-app/package.json
{
  "dependencies": {
    "ag-ui-solid": "file:../ag-ui-solid"
  }
}
```

### 3. Monorepo (Professional)
```
project/
├── packages/
│   ├── ag-ui-solid/
│   └── your-app/
└── package.json  (with "workspaces")
```

---

## 🔧 Common Commands

### In ag-ui-solid directory

```bash
# Build once
npm run build

# Build and watch for changes
npm run build:watch

# Link for local development
npm run link:local

# Unlink
npm run unlink:local

# Run tests
npm test
```

### In your app directory

```bash
# Link ag-ui-solid
npm link ag-ui-solid

# Unlink ag-ui-solid
npm unlink ag-ui-solid

# Install from npm instead
npm install ag-ui-solid
```

---

## 💡 Development Workflow

### Quick Test (No hot reload)
```bash
# Terminal 1: ag-ui-solid
npm run build
npm link

# Terminal 2: your-app
npm link ag-ui-solid
npm run dev

# Make changes → rebuild → refresh browser
```

### Active Development (With hot reload)
```bash
# Terminal 1: ag-ui-solid
npm run build:watch

# Terminal 2: your-app
npm link ag-ui-solid
npm run dev

# Changes auto-rebuild!
```

---

## 🐛 Troubleshooting

### "Cannot find module 'ag-ui-solid'"
```bash
cd ag-ui-solid
npm run build
npm link
```

### Changes not showing
```bash
# Rebuild
cd ag-ui-solid
npm run build

# Hard refresh browser: Cmd+Shift+R
```

### Multiple SolidJS versions
```bash
# Remove SolidJS from ag-ui-solid
cd ag-ui-solid
npm uninstall solid-js

# It's a peer dependency, your app provides it
```

---

## 📁 File Locations

```bash
# Your setup might look like:
~/projects/
├── ag-ui-solid/          # This library
└── my-chat-app/          # Your app using it

# Or in a monorepo:
~/projects/my-monorepo/
└── packages/
    ├── ag-ui-solid/
    └── my-chat-app/
```

---

## 📊 Method Comparison

| Method | Setup Time | Hot Reload | Best For |
|--------|-----------|------------|----------|
| npm link | 30 sec | With watch | Most cases |
| File path | 1 min | No | Simple projects |
| Monorepo | 5 min | No | Teams |

---

## 🎯 Real-World Examples

### Example 1: Testing a Bug Fix
```bash
# 1. Make changes in ag-ui-solid
vim src/components/Message.tsx

# 2. Rebuild
npm run build

# 3. Test in your app (already linked)
# Just refresh the browser!
```

### Example 2: Developing New Feature
```bash
# Start watch mode
cd ag-ui-solid
npm run build:watch  # Leave this running

# In another terminal
cd your-app
npm run dev

# Now edit ag-ui-solid files
# They'll auto-rebuild and update!
```

### Example 3: Switching Between Local and npm
```bash
# Use local version
npm link ag-ui-solid

# Switch back to npm version
npm unlink ag-ui-solid
npm install ag-ui-solid
```

---

## 📚 Full Documentation

For detailed information, see:
- [LOCAL_DEVELOPMENT.md](./LOCAL_DEVELOPMENT.md) - Complete guide
- [GETTING_STARTED.md](./GETTING_STARTED.md) - Usage tutorial
- [USAGE.md](./USAGE.md) - Integration examples

---

## 🆘 Need Help?

**Issue not listed?** Check [LOCAL_DEVELOPMENT.md](./LOCAL_DEVELOPMENT.md) for:
- Detailed troubleshooting
- Advanced configurations
- Alternative methods
- Best practices

**Still stuck?** See the [examples/](./examples/) directory for working setups.
