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

Make sure you have TailwindCSS configured in your project.

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
```

## Example

See `src/example/App.tsx` for a complete example implementation.

## License

MIT
