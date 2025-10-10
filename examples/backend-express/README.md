# AG UI Solid - Express Backend Example

This is an example backend server for ag-ui-solid using Express.js and OpenAI.

## Features

- ✅ Streaming chat responses
- ✅ Function/tool calling support
- ✅ Mock endpoint for testing without API key
- ✅ CORS enabled
- ✅ TypeScript support
- ✅ Error handling

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```bash
cp .env.example .env
```

3. Add your OpenAI API key to `.env`:
```
OPENAI_API_KEY=sk-...
PORT=8000
```

4. Start the development server:
```bash
npm run dev
```

The server will run on http://localhost:8000

## API Endpoints

### POST /api/chat

Streaming chat endpoint compatible with ag-ui-solid's `useChatStream` hook.

**Request:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Hello!"
    }
  ]
}
```

**Response:** Streaming text/plain

**Headers:**
- `X-Model`: Optional model selection (default: gpt-3.5-turbo)

### POST /api/chat/tools

Chat with function calling support.

**Request:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "What's the weather in San Francisco?"
    }
  ]
}
```

**Response:**
```json
{
  "content": "Let me check the weather for you.",
  "toolResults": [
    {
      "id": "call_123",
      "toolName": "get_weather",
      "input": { "location": "San Francisco, CA" },
      "output": "The weather in San Francisco is sunny and 72°F",
      "status": "success",
      "timestamp": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

### POST /api/chat/mock

Mock endpoint for testing without an API key. Returns a simple echo response.

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

## Usage with Frontend

Update your frontend app to use this backend:

```tsx
const [state, actions] = useChatStream({
  apiEndpoint: 'http://localhost:8000/api/chat'
});
```

Or use the mock endpoint for testing:

```tsx
const [state, actions] = useChatStream({
  apiEndpoint: 'http://localhost:8000/api/chat/mock'
});
```

## Production Build

```bash
npm run build
npm start
```

## Environment Variables

- `PORT` - Server port (default: 8000)
- `OPENAI_API_KEY` - Your OpenAI API key

## Adding More Tools/Functions

Edit `src/server.ts` and add your functions to the `tools` array:

```typescript
tools: [
  {
    type: 'function',
    function: {
      name: 'your_function',
      description: 'Description of what it does',
      parameters: {
        // JSON Schema for parameters
      }
    }
  }
]
```

Then handle the function call in the response:

```typescript
if (toolCall.function.name === 'your_function') {
  output = await yourFunctionImplementation(args);
}
```
