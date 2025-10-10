# AG UI Solid - Project Structure

Complete overview of the project structure and how other apps can use this library.

## Directory Structure

```
ag-ui-solid/
├── src/                          # Source code
│   ├── components/               # UI Components
│   │   ├── ChatContainer.tsx     # Main container component
│   │   ├── ChatContainer.test.tsx
│   │   ├── Composer.tsx          # Message input component
│   │   ├── Composer.test.tsx
│   │   ├── Message.tsx           # Message display component
│   │   ├── Message.test.tsx
│   │   ├── ToolResult.tsx        # Tool result display
│   │   └── ToolResult.test.tsx
│   │
│   ├── hooks/                    # React-like hooks
│   │   ├── useChatStream.tsx     # Main state management hook
│   │   └── useChatStream.test.tsx
│   │
│   ├── test/                     # Test utilities
│   │   ├── setup.ts              # Test configuration
│   │   └── utils.tsx             # Test helpers
│   │
│   ├── example/                  # Example app
│   │   ├── App.tsx
│   │   └── index.tsx
│   │
│   ├── types.ts                  # TypeScript types
│   ├── styles.css                # Global styles
│   └── index.tsx                 # Library entry point
│
├── examples/                     # Integration examples
│   ├── vite-solidjs/             # Vite + SolidJS example
│   │   ├── src/
│   │   │   ├── App.tsx
│   │   │   ├── main.tsx
│   │   │   └── index.css
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.js
│   │   └── package.json
│   │
│   └── backend-express/          # Express.js backend
│       ├── src/
│       │   └── server.ts
│       ├── .env.example
│       ├── tsconfig.json
│       └── package.json
│
├── dist/                         # Build output (generated)
│   ├── index.js
│   ├── index.d.ts
│   └── styles.css
│
├── Documentation Files
├── README.md                     # API reference
├── USAGE.md                      # Usage examples
├── GETTING_STARTED.md           # Step-by-step tutorial
├── TESTING.md                   # Testing guide
│
├── Configuration Files
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── tailwind.config.js
└── postcss.config.js
```

## How to Use This Library

### For Application Developers

#### 1. Install the Package

```bash
npm install ag-ui-solid solid-js
```

#### 2. Import and Use

**Full Chat Interface:**
```tsx
import { ChatContainer, useChatStream } from 'ag-ui-solid';

const App = () => {
  const [state, actions] = useChatStream({ apiEndpoint: '/api/chat' });
  return <ChatContainer {...state} onSendMessage={actions.sendMessage} />;
};
```

**Individual Components:**
```tsx
import { Message, Composer, ToolResult } from 'ag-ui-solid';

// Use separately in your own layout
```

**Types Only:**
```tsx
import type { Message, ToolResult, ChatStreamState } from 'ag-ui-solid';
```

### For Library Contributors

#### Development Setup

```bash
# Clone the repository
git clone <repo-url>
cd ag-ui-solid

# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build library
npm run build
```

#### Project Structure Explained

**Components (`src/components/`):**
- Self-contained UI components
- Each component has co-located tests
- Fully typed with TypeScript
- Styled with TailwindCSS

**Hooks (`src/hooks/`):**
- State management and side effects
- Reusable logic extraction
- Tested separately from components

**Types (`src/types.ts`):**
- Centralized type definitions
- Exported for consumer use
- Ensures type safety across library

**Tests (`src/test/`):**
- Setup files and utilities
- Shared test helpers
- Mock data factories

## Integration Patterns

### Pattern 1: Drop-in Solution

Use `ChatContainer` + `useChatStream` for instant chat:

```tsx
import { ChatContainer, useChatStream } from 'ag-ui-solid';

const App = () => {
  const [state, actions] = useChatStream({ apiEndpoint: '/api/chat' });
  return <ChatContainer {...state} onSendMessage={actions.sendMessage} />;
};
```

**Best for:**
- Quick prototypes
- Standard chat interfaces
- Minimal customization needed

### Pattern 2: Component Composition

Mix and match components:

```tsx
import { Message, Composer } from 'ag-ui-solid';
import { For } from 'solid-js';

const CustomChat = () => {
  const [messages, setMessages] = createSignal([]);
  
  return (
    <div class="my-layout">
      <div class="messages">
        <For each={messages()}>
          {msg => <Message message={msg} />}
        </For>
      </div>
      <Composer onSend={handleSend} />
    </div>
  );
};
```

**Best for:**
- Custom layouts
- Unique UX requirements
- Integration with existing designs

### Pattern 3: Headless Hook

Use just the hook for complete control:

```tsx
import { useChatStream } from 'ag-ui-solid';

const App = () => {
  const [state, actions] = useChatStream({ apiEndpoint: '/api/chat' });
  
  // Build your own UI
  return (
    <YourCustomUI
      messages={state.messages}
      onSend={actions.sendMessage}
      loading={state.isStreaming}
    />
  );
};
```

**Best for:**
- Complete UI customization
- Platform-specific designs
- Non-standard chat UIs

### Pattern 4: Stateless Components

Use components with your own state:

```tsx
import { ChatContainer } from 'ag-ui-solid';
import { myStore } from './store';

const App = () => {
  const messages = myStore.messages;
  const handleSend = myStore.send;
  
  return (
    <ChatContainer
      messages={messages()}
      onSendMessage={handleSend}
      isStreaming={myStore.loading()}
    />
  );
};
```

**Best for:**
- Existing state management
- Complex app architectures
- Multiple data sources

## Backend Integration

The library expects a backend API that:

1. Accepts POST requests with message history
2. Returns either:
   - Streaming text (for `useChatStream`)
   - JSON with `content` and optional `toolResults`

### Example Request Format

```typescript
POST /api/chat
Content-Type: application/json

{
  "messages": [
    {
      "id": "uuid",
      "role": "user",
      "content": "Hello!",
      "timestamp": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

### Example Response (Streaming)

```
Content-Type: text/plain
Transfer-Encoding: chunked

Hello! How can I help you today?
```

### Example Response (JSON with Tools)

```json
{
  "content": "I found the weather for you.",
  "toolResults": [
    {
      "id": "uuid",
      "toolName": "get_weather",
      "input": { "location": "SF" },
      "output": "Sunny, 72°F",
      "status": "success",
      "timestamp": "2024-01-15T10:00:01.000Z"
    }
  ]
}
```

See `examples/backend-express` for complete implementations.

## Publishing Workflow

### For Maintainers

1. **Update Version:**
```bash
npm version patch|minor|major
```

2. **Build:**
```bash
npm run build
```

3. **Test:**
```bash
npm test
```

4. **Publish:**
```bash
npm publish
```

### Package Contents

What gets published (see `package.json` `files` field):
- `dist/` - Compiled JavaScript and types
- `README.md` - Documentation
- `package.json` - Package metadata

What consumers receive:
```
node_modules/ag-ui-solid/
├── dist/
│   ├── index.js        # Compiled components
│   ├── index.d.ts      # Type definitions
│   └── styles.css      # Styles
├── README.md
└── package.json
```

## Resources

- **Documentation:**
  - [README.md](./README.md) - API Reference
  - [USAGE.md](./USAGE.md) - Usage Examples  
  - [GETTING_STARTED.md](./GETTING_STARTED.md) - Tutorial
  - [TESTING.md](./TESTING.md) - Testing Guide

- **Examples:**
  - [Vite Example](./examples/vite-solidjs/)
  - [Backend Example](./examples/backend-express/)
  - [Demo App](./src/example/)

- **Development:**
  - Run `npm test` for tests
  - Run `npm run dev` for development
  - Run `npm run build` to compile
