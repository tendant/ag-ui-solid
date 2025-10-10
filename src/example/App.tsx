import { Component } from 'solid-js';
import { ChatContainer } from '../components/ChatContainer';
import { useChatStream } from '../hooks/useChatStream';

const App: Component = () => {
  const [state, actions] = useChatStream({
    apiEndpoint: '/api/chat',
    onMessage: (message) => {
      console.log('New message:', message);
    },
    onError: (error) => {
      console.error('Chat error:', error);
    }
  });

  return (
    <div class="w-full h-screen bg-gray-50">
      <div class="max-w-4xl mx-auto h-full flex flex-col">
        <header class="bg-white border-b border-gray-200 p-4">
          <h1 class="text-2xl font-bold text-gray-900">AG UI Solid Chat</h1>
          <p class="text-sm text-gray-600">A SolidJS chat component library</p>
        </header>

        <div class="flex-1 min-h-0 bg-white shadow-lg">
          <ChatContainer
            messages={state.messages}
            onSendMessage={actions.sendMessage}
            isStreaming={state.isStreaming}
            error={state.error}
            placeholder="Ask me anything..."
          />
        </div>
      </div>
    </div>
  );
};

export default App;
