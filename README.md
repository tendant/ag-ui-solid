# AG UI Solid

A modern SolidJS component library for building AI chat interfaces with TailwindCSS.

## Features

- **ChatContainer**: A complete chat interface with messages, composer, and auto-scrolling
- **Message**: Customizable message component with support for user, assistant, and system roles
- **Composer**: Text input component with submit button and keyboard shortcuts
- **ToolResult**: Display AI tool execution results with status indicators
- **useChatStream()**: Hook for managing chat state and streaming responses

## Installation

```bash
npm install ag-ui-solid solid-js
```

Make sure you have TailwindCSS configured in your project. See [Getting Started Guide](./GETTING_STARTED.md) for detailed setup instructions.

## Quick Start

```tsx
import { ChatContainer, useChatStream } from 'ag-ui-solid';

function App() {
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
}
```

**New to ag-ui-solid?** Check out the [Getting Started Guide](./GETTING_STARTED.md) for a step-by-step tutorial.

## Components

### ChatContainer

The main chat interface component that combines messages display and message composer.

**Props:**
- `messages`: Array of message objects
- `onSendMessage`: Callback when user sends a message
- `isStreaming?`: Whether the assistant is currently responding
- `error?`: Error message to display
- `placeholder?`: Placeholder text for the composer
- `class?`: Additional CSS classes
- `showComposer?`: Whether to show the composer (default: true)
- `autoScroll?`: Whether to auto-scroll to bottom (default: true)

### Message

Displays a single chat message with role-based styling.

**Props:**
- `message`: Message object with id, role, content, timestamp, and optional toolResults
- `class?`: Additional CSS classes

### Composer

Input component for composing and sending messages.

**Props:**
- `onSend`: Callback when message is sent
- `isDisabled?`: Whether the composer is disabled
- `placeholder?`: Placeholder text
- `class?`: Additional CSS classes
- `maxLength?`: Maximum character count

### ToolResult

Displays AI tool execution results with status indicators.

**Props:**
- `toolResult`: Tool result object with id, toolName, input, output, status, and timestamp
- `class?`: Additional CSS classes

## Hooks

### useChatStream

Hook for managing chat state and streaming responses from an API.

**Options:**
- `apiEndpoint?`: API endpoint URL (default: '/api/chat')
- `onMessage?`: Callback when a message is added
- `onError?`: Callback when an error occurs
- `headers?`: Additional HTTP headers

**Returns:** `[state, actions]`
- `state.messages`: Array of messages
- `state.isStreaming`: Whether streaming is in progress
- `state.error`: Current error message
- `actions.sendMessage(content)`: Send a message
- `actions.addMessage(message)`: Add a message manually
- `actions.clearMessages()`: Clear all messages
- `actions.setError(error)`: Set error state

## Types

```typescript
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  toolResults?: ToolResult[];
}

interface ToolResult {
  id: string;
  toolName: string;
  input: Record<string, unknown>;
  output: string;
  status: 'success' | 'error' | 'pending';
  timestamp: Date;
}
```

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build library
npm run build

# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Testing

This library comes with comprehensive tests using Vitest and SolidJS Testing Library. See [TESTING.md](./TESTING.md) for detailed testing documentation.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run with coverage report
npm run test:coverage

# Run with interactive UI
npm run test:ui
```

### Test Coverage

The library includes tests for:
- All components (ChatContainer, Message, Composer, ToolResult)
- The useChatStream hook
- User interactions and edge cases
- Error handling and loading states
- Accessibility and styling

## Documentation

- **[Getting Started Guide](./GETTING_STARTED.md)** - Step-by-step setup tutorial
- **[Usage Guide](./USAGE.md)** - Complete examples and patterns
- **[Testing Guide](./TESTING.md)** - How to test your components
- **[API Reference](#components)** - Component props and types (this file)

## Examples

### In This Repository

- **[Example App](./src/example/App.tsx)** - Basic chat interface
- **[Vite + SolidJS](./examples/vite-solidjs/)** - Complete frontend example
- **[Express Backend](./examples/backend-express/)** - Backend API server

### Quick Examples

**Simple Chat:**
```tsx
import { ChatContainer, useChatStream } from 'ag-ui-solid';

const App = () => {
  const [state, actions] = useChatStream({ apiEndpoint: '/api/chat' });
  return <ChatContainer {...state} onSendMessage={actions.sendMessage} />;
};
```

**With Custom Styling:**
```tsx
<ChatContainer
  messages={messages}
  onSendMessage={handleSend}
  class="bg-gray-50 rounded-lg shadow-xl"
  placeholder="Ask me anything..."
/>
```

**Individual Components:**
```tsx
import { Message, Composer, ToolResult } from 'ag-ui-solid';

// Use components separately for full customization
<div>
  <Message message={myMessage} />
  <Composer onSend={handleSend} maxLength={500} />
  <ToolResult toolResult={result} />
</div>
```

See [USAGE.md](./USAGE.md) for more examples including:
- Custom API integration
- Persistent chat history
- Multi-model selection
- Custom message rendering
- Backend integration patterns

## How Other Apps Use This Library

Other applications can integrate ag-ui-solid in several ways:

### 1. As a Complete Chat Interface

```bash
npm install ag-ui-solid solid-js
```

Then use `ChatContainer` with `useChatStream()` for a full-featured chat (see [Getting Started](./GETTING_STARTED.md)).

### 2. Individual Components

Import only the components you need:

```tsx
import { Message, Composer } from 'ag-ui-solid';
// Build your own layout
```

### 3. With Your Own State Management

Use the components with your existing state:

```tsx
import { ChatContainer } from 'ag-ui-solid';

const MyApp = () => {
  const [messages, setMessages] = myCustomStore();
  return <ChatContainer messages={messages} onSendMessage={handleSend} />;
};
```

### 4. Backend Integration

The library works with any backend that returns streaming text or JSON. Examples included for:
- Express.js + OpenAI (see `examples/backend-express`)
- Custom streaming endpoints
- WebSocket connections

See [USAGE.md](./USAGE.md) for complete integration examples.

## License

MIT
