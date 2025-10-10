# Usage Guide

This guide shows how to integrate ag-ui-solid into your application.

## Table of Contents

- [Installation](#installation)
- [Basic Setup](#basic-setup)
- [Complete Examples](#complete-examples)
- [Backend Integration](#backend-integration)
- [Customization](#customization)
- [Advanced Usage](#advanced-usage)

## Installation

### 1. Install the Package

```bash
npm install ag-ui-solid solid-js
```

### 2. Configure TailwindCSS

If you don't have TailwindCSS set up, install it:

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init
```

Update your `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/ag-ui-solid/dist/**/*.{js,jsx}"  // Include library components
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### 3. Import Styles

In your main entry file (e.g., `src/index.tsx`):

```tsx
import 'ag-ui-solid/dist/styles.css';  // Import library styles
import './index.css';  // Your app styles
```

Make sure your `index.css` includes Tailwind directives:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## Basic Setup

### Simple Chat Interface

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

### Using Individual Components

```tsx
import { Component, createSignal } from 'solid-js';
import { Message, Composer } from 'ag-ui-solid';
import type { Message as MessageType } from 'ag-ui-solid';

const CustomChat: Component = () => {
  const [messages, setMessages] = createSignal<MessageType[]>([]);

  const handleSend = (content: string) => {
    const newMessage: MessageType = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  return (
    <div class="flex flex-col h-screen">
      <div class="flex-1 overflow-auto p-4">
        {messages().map(msg => (
          <Message message={msg} />
        ))}
      </div>
      <div class="p-4 border-t">
        <Composer onSend={handleSend} />
      </div>
    </div>
  );
};
```

## Complete Examples

### 1. Chat with Custom API Integration

```tsx
import { Component } from 'solid-js';
import { ChatContainer, useChatStream } from 'ag-ui-solid';

const ChatApp: Component = () => {
  const [state, actions] = useChatStream({
    apiEndpoint: 'https://api.example.com/v1/chat',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_API_KEY}`,
      'X-Custom-Header': 'value'
    },
    onMessage: (message) => {
      console.log('New message:', message);
      // Save to local storage, analytics, etc.
    },
    onError: (error) => {
      console.error('Chat error:', error);
      // Show notification, log to error service, etc.
    }
  });

  return (
    <div class="w-full h-screen bg-gray-50">
      <ChatContainer
        messages={state.messages}
        onSendMessage={actions.sendMessage}
        isStreaming={state.isStreaming}
        error={state.error}
        placeholder="Ask me anything..."
      />
    </div>
  );
};

export default ChatApp;
```

### 2. Chat with Conversation History

```tsx
import { Component, createEffect } from 'solid-js';
import { ChatContainer, useChatStream } from 'ag-ui-solid';

const PersistentChat: Component = () => {
  const [state, actions] = useChatStream({
    apiEndpoint: '/api/chat'
  });

  // Load messages from localStorage on mount
  createEffect(() => {
    const saved = localStorage.getItem('chatHistory');
    if (saved) {
      const messages = JSON.parse(saved);
      messages.forEach((msg: any) => {
        actions.addMessage({
          ...msg,
          timestamp: new Date(msg.timestamp)
        });
      });
    }
  });

  // Save messages to localStorage when they change
  createEffect(() => {
    if (state.messages.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(state.messages));
    }
  });

  const handleClearHistory = () => {
    actions.clearMessages();
    localStorage.removeItem('chatHistory');
  };

  return (
    <div class="flex flex-col h-screen">
      <header class="p-4 bg-white border-b flex justify-between items-center">
        <h1 class="text-xl font-bold">My Chat App</h1>
        <button
          onClick={handleClearHistory}
          class="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600"
        >
          Clear History
        </button>
      </header>

      <div class="flex-1">
        <ChatContainer
          messages={state.messages}
          onSendMessage={actions.sendMessage}
          isStreaming={state.isStreaming}
          error={state.error}
        />
      </div>
    </div>
  );
};

export default PersistentChat;
```

### 3. Multi-Model Chat Selector

```tsx
import { Component, createSignal } from 'solid-js';
import { ChatContainer, useChatStream } from 'ag-ui-solid';

const MultiModelChat: Component = () => {
  const [selectedModel, setSelectedModel] = createSignal('gpt-4');

  const [state, actions] = useChatStream({
    apiEndpoint: '/api/chat',
    headers: {
      'X-Model': selectedModel()
    }
  });

  const models = [
    { id: 'gpt-4', name: 'GPT-4' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
    { id: 'claude-3', name: 'Claude 3' }
  ];

  return (
    <div class="flex h-screen">
      {/* Sidebar */}
      <aside class="w-64 bg-gray-100 p-4 border-r">
        <h2 class="font-bold mb-4">Select Model</h2>
        <div class="space-y-2">
          {models.map(model => (
            <button
              onClick={() => setSelectedModel(model.id)}
              class={`w-full text-left px-4 py-2 rounded ${
                selectedModel() === model.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white hover:bg-gray-50'
              }`}
            >
              {model.name}
            </button>
          ))}
        </div>

        <button
          onClick={actions.clearMessages}
          class="w-full mt-6 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          New Chat
        </button>
      </aside>

      {/* Chat Area */}
      <main class="flex-1">
        <ChatContainer
          messages={state.messages}
          onSendMessage={actions.sendMessage}
          isStreaming={state.isStreaming}
          error={state.error}
          placeholder={`Chat with ${models.find(m => m.id === selectedModel())?.name}...`}
        />
      </main>
    </div>
  );
};

export default MultiModelChat;
```

### 4. Custom Message Rendering

```tsx
import { Component, For } from 'solid-js';
import { Composer, useChatStream } from 'ag-ui-solid';
import type { Message as MessageType } from 'ag-ui-solid';

// Custom message component with markdown support
const CustomMessage: Component<{ message: MessageType }> = (props) => {
  return (
    <div class={`flex ${props.message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div class={`max-w-[70%] rounded-lg p-4 ${
        props.message.role === 'user'
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 text-gray-900'
      }`}>
        {/* You could use a markdown parser here */}
        <div innerHTML={props.message.content} />
        <div class="text-xs mt-2 opacity-75">
          {props.message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

const CustomChatApp: Component = () => {
  const [state, actions] = useChatStream({
    apiEndpoint: '/api/chat'
  });

  return (
    <div class="flex flex-col h-screen max-w-4xl mx-auto">
      <div class="flex-1 overflow-auto p-4">
        <For each={state.messages}>
          {(message) => <CustomMessage message={message} />}
        </For>
      </div>

      <div class="p-4 border-t bg-white">
        <Composer
          onSend={actions.sendMessage}
          isDisabled={state.isStreaming}
          maxLength={2000}
        />
      </div>
    </div>
  );
};

export default CustomChatApp;
```

## Backend Integration

### Example Express.js Backend

```typescript
import express from 'express';
import { OpenAI } from 'openai';

const app = express();
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    // Set headers for streaming
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');

    const stream = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      stream: true
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        res.write(content);
      }
    }

    res.end();
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

### Example with Tool/Function Calling

```typescript
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      tools: [
        {
          type: 'function',
          function: {
            name: 'get_weather',
            description: 'Get the current weather',
            parameters: {
              type: 'object',
              properties: {
                location: { type: 'string' }
              }
            }
          }
        }
      ]
    });

    const message = response.choices[0].message;

    // If the model wants to call a function
    if (message.tool_calls) {
      const toolResults = await Promise.all(
        message.tool_calls.map(async (call) => ({
          id: crypto.randomUUID(),
          toolName: call.function.name,
          input: JSON.parse(call.function.arguments),
          output: await executeFunction(call.function.name, call.function.arguments),
          status: 'success' as const,
          timestamp: new Date()
        }))
      );

      res.json({
        content: message.content || 'Processing...',
        toolResults
      });
    } else {
      res.json({
        content: message.content
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

## Customization

### Custom Styling

You can customize the appearance by overriding Tailwind classes:

```tsx
<ChatContainer
  messages={messages}
  onSendMessage={handleSend}
  class="bg-gradient-to-b from-blue-50 to-white"
/>

<Composer
  onSend={handleSend}
  class="shadow-lg rounded-2xl"
  placeholder="Type your message here..."
  maxLength={500}
/>

<Message
  message={message}
  class="my-custom-message-class"
/>
```

### Custom Theme

Create a wrapper component with your theme:

```tsx
import { Component, JSX } from 'solid-js';
import { ChatContainer } from 'ag-ui-solid';
import type { ChatContainerProps } from 'ag-ui-solid';

const ThemedChat: Component<ChatContainerProps> = (props) => {
  return (
    <div class="dark-theme">
      <style>{`
        .dark-theme .bg-blue-600 { background-color: #1e40af; }
        .dark-theme .bg-gray-100 { background-color: #374151; color: white; }
        .dark-theme .border-gray-200 { border-color: #4b5563; }
      `}</style>

      <ChatContainer {...props} />
    </div>
  );
};
```

## Advanced Usage

### Programmatically Adding Messages

```tsx
const [state, actions] = useChatStream();

// Add a system message
actions.addMessage({
  id: crypto.randomUUID(),
  role: 'system',
  content: 'This is a system message',
  timestamp: new Date()
});

// Add an assistant message with tool results
actions.addMessage({
  id: crypto.randomUUID(),
  role: 'assistant',
  content: 'I searched the web for you',
  timestamp: new Date(),
  toolResults: [{
    id: crypto.randomUUID(),
    toolName: 'web_search',
    input: { query: 'SolidJS' },
    output: 'Found 10 results...',
    status: 'success',
    timestamp: new Date()
  }]
});
```

### Error Handling

```tsx
const [state, actions] = useChatStream({
  apiEndpoint: '/api/chat',
  onError: (error) => {
    // Custom error handling
    if (error.message.includes('429')) {
      actions.setError('Rate limit exceeded. Please wait a moment.');
    } else if (error.message.includes('401')) {
      actions.setError('Authentication failed. Please log in again.');
    } else {
      actions.setError('An unexpected error occurred.');
    }
  }
});
```

### Custom Fetch Configuration

```tsx
// Create a custom hook with your own fetch logic
import { createSignal } from 'solid-js';
import type { Message } from 'ag-ui-solid';

export function useCustomChat() {
  const [messages, setMessages] = createSignal<Message[]>([]);
  const [isStreaming, setIsStreaming] = createSignal(false);

  const sendMessage = async (content: string) => {
    // Your custom implementation
    const response = await fetch('/api/chat', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': getCsrfToken()
      },
      body: JSON.stringify({ content })
    });

    // Handle response...
  };

  return { messages, isStreaming, sendMessage };
}
```

## TypeScript Support

All components and hooks are fully typed:

```tsx
import type {
  Message,
  ToolResult,
  ChatStreamState,
  ChatStreamActions,
  UseChatStreamReturn,
  ChatContainerProps,
  MessageProps,
  ComposerProps,
  ToolResultProps
} from 'ag-ui-solid';

// Use these types in your application
const handleMessage = (message: Message) => {
  console.log(message.role, message.content);
};
```

## Next Steps

- Check out the [API documentation](./README.md) for complete component props
- See [TESTING.md](./TESTING.md) for testing your integration
- Review the [example app](./src/example/App.tsx) for a complete implementation
