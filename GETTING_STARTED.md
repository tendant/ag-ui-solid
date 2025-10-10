# Getting Started with AG UI Solid

This guide will walk you through setting up ag-ui-solid in your application from scratch.

## Quick Start (5 minutes)

### 1. Create a New SolidJS Project

```bash
# Using degit with the SolidJS template
npx degit solidjs/templates/ts my-chat-app
cd my-chat-app
npm install
```

### 2. Install AG UI Solid and Dependencies

```bash
npm install ag-ui-solid solid-js
npm install -D tailwindcss postcss autoprefixer
```

### 3. Configure TailwindCSS

Initialize Tailwind:

```bash
npx tailwindcss init -p
```

Update `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Create `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 4. Create Your Chat Component

Create `src/App.tsx`:

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

Update `src/index.tsx`:

```tsx
import { render } from 'solid-js/web';
import './index.css';
import App from './App';

render(() => <App />, document.getElementById('root')!);
```

### 5. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000 to see your chat interface!

## Full Tutorial

### Step 1: Understanding the Architecture

AG UI Solid follows a simple architecture:

```
┌─────────────────┐
│  ChatContainer  │  ← Main wrapper component
├─────────────────┤
│   Messages      │  ← Message display area
│   - Message     │     (individual message components)
│   - ToolResult  │     (tool execution results)
├─────────────────┤
│   Composer      │  ← Input area
└─────────────────┘

useChatStream()      ← State management hook
      ↓
   Your API          ← Backend endpoint
```

### Step 2: Component Breakdown

#### ChatContainer

The main container that orchestrates everything:

```tsx
<ChatContainer
  messages={state.messages}           // Array of messages
  onSendMessage={actions.sendMessage} // Send handler
  isStreaming={state.isStreaming}    // Loading state
  error={state.error}                // Error message
  placeholder="Type here..."         // Input placeholder
  showComposer={true}                // Show/hide input
  autoScroll={true}                  // Auto-scroll to bottom
/>
```

#### useChatStream Hook

Manages chat state and API communication:

```tsx
const [state, actions] = useChatStream({
  apiEndpoint: '/api/chat',           // Your API endpoint
  onMessage: (msg) => { /* ... */ },  // Message callback
  onError: (err) => { /* ... */ },    // Error callback
  headers: { /* ... */ }              // Custom headers
});

// State
state.messages    // Array of messages
state.isStreaming // Boolean
state.error       // String | null

// Actions
actions.sendMessage(content)    // Send a message
actions.addMessage(message)     // Add manually
actions.clearMessages()         // Clear all
actions.setError(error)         // Set error
```

### Step 3: Setting Up the Backend

You need a backend API that handles chat requests. Here's a minimal example:

#### Option A: Mock API (for testing)

```tsx
// Create a mock endpoint
const mockSendMessage = async (content: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`You said: ${content}`);
    }, 1000);
  });
};

// Use it in your component
const App = () => {
  const [messages, setMessages] = createSignal([]);
  const [isStreaming, setIsStreaming] = createSignal(false);

  const handleSend = async (content: string) => {
    // Add user message
    const userMsg = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);

    // Get response
    setIsStreaming(true);
    const response = await mockSendMessage(content);
    setIsStreaming(false);

    // Add assistant message
    const assistantMsg = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: response,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, assistantMsg]);
  };

  return (
    <ChatContainer
      messages={messages()}
      onSendMessage={handleSend}
      isStreaming={isStreaming()}
    />
  );
};
```

#### Option B: Real API with Express

See `examples/backend-express` for a complete backend implementation.

Quick setup:

```bash
cd examples/backend-express
npm install
cp .env.example .env
# Add your OPENAI_API_KEY to .env
npm run dev
```

### Step 4: Customization

#### Custom Styling

```tsx
<ChatContainer
  class="bg-gray-50 rounded-lg shadow-xl"
  messages={messages}
  onSendMessage={handleSend}
/>
```

#### Custom Placeholder

```tsx
<ChatContainer
  placeholder="Ask me anything about SolidJS..."
  messages={messages}
  onSendMessage={handleSend}
/>
```

#### With Character Limit

```tsx
<Composer
  onSend={handleSend}
  maxLength={500}
  placeholder="Max 500 characters"
/>
```

### Step 5: Advanced Features

#### Persistent Chat History

```tsx
import { createEffect } from 'solid-js';

const App = () => {
  const [state, actions] = useChatStream({ /* ... */ });

  // Load from localStorage on mount
  createEffect(() => {
    const saved = localStorage.getItem('messages');
    if (saved) {
      JSON.parse(saved).forEach(msg => {
        actions.addMessage({
          ...msg,
          timestamp: new Date(msg.timestamp)
        });
      });
    }
  });

  // Save to localStorage on change
  createEffect(() => {
    if (state.messages.length > 0) {
      localStorage.setItem('messages', JSON.stringify(state.messages));
    }
  });

  return <ChatContainer {...state} onSendMessage={actions.sendMessage} />;
};
```

#### Custom Error Handling

```tsx
const [state, actions] = useChatStream({
  apiEndpoint: '/api/chat',
  onError: (error) => {
    if (error.message.includes('429')) {
      actions.setError('Too many requests. Please wait.');
    } else if (error.message.includes('401')) {
      actions.setError('Please log in to continue.');
    } else {
      actions.setError('Something went wrong. Please try again.');
    }
  }
});
```

#### Tool Results

```tsx
const messageWithTools = {
  id: crypto.randomUUID(),
  role: 'assistant',
  content: 'I searched for that information.',
  timestamp: new Date(),
  toolResults: [
    {
      id: crypto.randomUUID(),
      toolName: 'web_search',
      input: { query: 'SolidJS' },
      output: 'Found 10 results about SolidJS...',
      status: 'success',
      timestamp: new Date()
    }
  ]
};

actions.addMessage(messageWithTools);
```

### Step 6: Production Deployment

#### Build Optimization

Update your `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  build: {
    target: 'esnext',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['solid-js'],
          'chat': ['ag-ui-solid']
        }
      }
    }
  }
});
```

#### Build and Deploy

```bash
npm run build
```

The `dist` folder contains your production-ready app.

## Troubleshooting

### Issue: Styles not applying

**Solution:** Make sure you're importing Tailwind CSS:

```tsx
// In your main entry file
import './index.css';
```

And your `index.css` has:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Issue: API requests failing

**Solution:** Check CORS configuration on your backend:

```typescript
import cors from 'cors';
app.use(cors());
```

### Issue: Messages not persisting

**Solution:** Implement localStorage or a database:

```tsx
createEffect(() => {
  localStorage.setItem('messages', JSON.stringify(state.messages));
});
```

### Issue: TypeScript errors

**Solution:** Make sure you have the correct types:

```tsx
import type { Message, ToolResult } from 'ag-ui-solid';
```

## Next Steps

- Read the [Usage Guide](./USAGE.md) for more examples
- Check out the [API Documentation](./README.md)
- See [Testing Guide](./TESTING.md) for testing your integration
- Explore the [examples](./examples) folder

## Getting Help

- GitHub Issues: https://github.com/yourusername/ag-ui-solid/issues
- Documentation: See README.md, USAGE.md, TESTING.md
- Examples: See `examples/` directory

## Resources

- [SolidJS Documentation](https://www.solidjs.com/)
- [TailwindCSS Documentation](https://tailwindcss.com/)
- [Vite Documentation](https://vitejs.dev/)
