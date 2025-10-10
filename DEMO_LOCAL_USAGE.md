# Demo: Using ag-ui-solid Locally

Step-by-step demo showing how to use ag-ui-solid in another app without publishing.

## Scenario: You want to test ag-ui-solid in your chat app

### Step 1: Prepare ag-ui-solid

```bash
cd /Users/lei/workspace/gen-ai/ag-ui-solid

# Build the library
npm run build

# Output should show:
# ✓ built in XXXms
# dist/
# ├── index.js
# ├── index.d.ts
# └── styles.css
```

### Step 2: Link it globally

```bash
# Still in ag-ui-solid directory
npm run link:local

# You'll see:
# 🔗 Setting up ag-ui-solid for local development...
# 📦 Building ag-ui-solid...
# ✅ Build successful
# 🔗 Creating global npm link...
# ✅ ag-ui-solid is now linked globally!
```

### Step 3: Create or use your app

Let's say you have an app at `~/projects/my-chat-app`:

```bash
cd ~/projects/my-chat-app

# Link ag-ui-solid
npm link ag-ui-solid

# You'll see:
# /path/to/my-chat-app/node_modules/ag-ui-solid -> 
# /usr/local/lib/node_modules/ag-ui-solid -> 
# /Users/lei/workspace/gen-ai/ag-ui-solid
```

### Step 4: Use it in your app

**src/App.tsx:**
```tsx
import { Component } from 'solid-js';
import { ChatContainer, useChatStream } from 'ag-ui-solid';

const App: Component = () => {
  const [state, actions] = useChatStream({
    apiEndpoint: '/api/chat'
  });

  return (
    <div class="h-screen">
      <ChatContainer
        messages={state.messages}
        onSendMessage={actions.sendMessage}
        isStreaming={state.isStreaming}
        error={state.error}
      />
    </div>
  );
};

export default App;
```

### Step 5: Start development

```bash
# In your app directory
npm run dev

# Open http://localhost:3000
# Your app now uses the local ag-ui-solid!
```

### Step 6: Make changes with hot reload

Open two terminals:

**Terminal 1 (ag-ui-solid):**
```bash
cd /Users/lei/workspace/gen-ai/ag-ui-solid
npm run build:watch

# Output:
# watching for file changes...
```

**Terminal 2 (your app):**
```bash
cd ~/projects/my-chat-app
npm run dev

# App is running...
```

Now when you edit files in ag-ui-solid:
1. Terminal 1 will auto-rebuild
2. Refresh your browser
3. Changes appear instantly!

### Step 7: Testing a change

**Edit ag-ui-solid/src/components/Message.tsx:**

```tsx
// Change the user message color
case 'user':
  return 'bg-purple-600 text-white ml-auto'; // Changed from blue to purple
```

Watch Terminal 1 rebuild, then refresh your browser. User messages are now purple!

### Step 8: When you're done

**Unlink from your app:**
```bash
cd ~/projects/my-chat-app
npm unlink ag-ui-solid
```

**Unlink globally:**
```bash
cd /Users/lei/workspace/gen-ai/ag-ui-solid
npm run unlink:local
```

Or just install the published version:
```bash
cd ~/projects/my-chat-app
npm install ag-ui-solid
```

## Real-World Workflow

### Daily Development

```bash
# Morning: Set up
cd /Users/lei/workspace/gen-ai/ag-ui-solid
npm run build:watch  # Leave running

# In another terminal
cd ~/projects/my-chat-app
npm run dev  # Leave running

# Now just code!
# ag-ui-solid changes auto-rebuild
# Your app shows changes on refresh
```

### Testing a Feature

```bash
# 1. Create feature branch
cd /Users/lei/workspace/gen-ai/ag-ui-solid
git checkout -b feature/new-composer

# 2. Make changes
vim src/components/Composer.tsx

# 3. Build and link (if not already)
npm run build
npm link

# 4. Test in your app
cd ~/projects/my-chat-app
npm link ag-ui-solid
npm run dev

# 5. Verify it works
# Test in browser

# 6. Commit and push
cd /Users/lei/workspace/gen-ai/ag-ui-solid
git add .
git commit -m "feat: improve composer"
git push
```

### Sharing with Team

**Option 1: Monorepo (Recommended)**
```bash
# Create monorepo structure
mkdir chat-project
cd chat-project

# Move both projects
mv /Users/lei/workspace/gen-ai/ag-ui-solid ./packages/
mv ~/projects/my-chat-app ./packages/

# Set up workspace
cat > package.json << 'JSON'
{
  "name": "chat-project",
  "private": true,
  "workspaces": ["packages/*"]
}
JSON

# Install (automatically links)
npm install

# Team members just:
git clone <repo>
npm install
# Everything works!
```

**Option 2: Git Submodule**
```bash
# In your app repo
git submodule add <ag-ui-solid-repo-url> lib/ag-ui-solid

# In package.json
"dependencies": {
  "ag-ui-solid": "file:./lib/ag-ui-solid"
}

# Team members:
git clone --recursive <your-app-repo>
npm install
```

## Troubleshooting Demo

### Problem: Module not found

```bash
# Check if ag-ui-solid is built
ls /Users/lei/workspace/gen-ai/ag-ui-solid/dist/

# Should show: index.js, index.d.ts, styles.css
# If empty:
cd /Users/lei/workspace/gen-ai/ag-ui-solid
npm run build
```

### Problem: Changes not appearing

```bash
# Rebuild
cd /Users/lei/workspace/gen-ai/ag-ui-solid
npm run build

# Hard refresh browser
# Mac: Cmd + Shift + R
# Windows: Ctrl + Shift + R
```

### Problem: Type errors

```bash
# Make sure types are rebuilt
cd /Users/lei/workspace/gen-ai/ag-ui-solid
npm run build

# Restart TypeScript server in your editor
# VSCode: Cmd+Shift+P → "TypeScript: Restart TS Server"
```

## Success Indicators

You know it's working when:

✅ `npm link ag-ui-solid` shows symlink path
✅ Your app imports work: `import { ChatContainer } from 'ag-ui-solid'`
✅ TypeScript doesn't complain
✅ Components render in browser
✅ Changes in ag-ui-solid appear after rebuild + refresh

## Next Steps

- See [LOCAL_DEVELOPMENT.md](./LOCAL_DEVELOPMENT.md) for all methods
- See [USAGE.md](./USAGE.md) for integration patterns
- See [examples/](./examples/) for complete examples
