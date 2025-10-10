import { Component, createSignal } from 'solid-js';
import { ChatContainer, useChatStream } from 'ag-ui-solid';

const App: Component = () => {
  const [apiKey, setApiKey] = createSignal('');
  const [isConfigured, setIsConfigured] = createSignal(false);

  const [state, actions] = useChatStream({
    // This would typically be your backend endpoint
    // For demo purposes, you might want to use a mock API
    apiEndpoint: '/api/chat',
    headers: {
      'Authorization': `Bearer ${apiKey()}`
    },
    onMessage: (message) => {
      console.log('Message received:', message);
    },
    onError: (error) => {
      console.error('Chat error:', error);
    }
  });

  if (!isConfigured()) {
    return (
      <div class="flex items-center justify-center h-screen bg-gray-50">
        <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <h1 class="text-2xl font-bold mb-4">Welcome to AG UI Solid</h1>
          <p class="text-gray-600 mb-6">
            Enter your API configuration to get started
          </p>

          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">
              API Key (optional for demo)
            </label>
            <input
              type="password"
              value={apiKey()}
              onInput={(e) => setApiKey(e.currentTarget.value)}
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="sk-..."
            />
          </div>

          <button
            onClick={() => setIsConfigured(true)}
            class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Start Chatting
          </button>

          <p class="text-sm text-gray-500 mt-4">
            Note: You'll need a backend API endpoint to handle chat requests.
            See the documentation for setup instructions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div class="flex flex-col h-screen bg-gray-50">
      <header class="bg-white border-b px-6 py-4 flex justify-between items-center">
        <div>
          <h1 class="text-xl font-bold">AG UI Solid Chat</h1>
          <p class="text-sm text-gray-600">Powered by SolidJS</p>
        </div>
        <div class="flex gap-2">
          <button
            onClick={actions.clearMessages}
            class="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
          >
            Clear Chat
          </button>
          <button
            onClick={() => setIsConfigured(false)}
            class="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Settings
          </button>
        </div>
      </header>

      <div class="flex-1 max-w-4xl w-full mx-auto">
        <ChatContainer
          messages={state.messages}
          onSendMessage={actions.sendMessage}
          isStreaming={state.isStreaming}
          error={state.error}
          placeholder="Type your message..."
        />
      </div>

      <footer class="bg-white border-t px-6 py-2 text-center text-sm text-gray-500">
        Built with ag-ui-solid • {state.messages.length} messages
      </footer>
    </div>
  );
};

export default App;
