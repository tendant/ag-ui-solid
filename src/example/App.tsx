import { Component, createSignal } from 'solid-js';
import { ChatContainer } from '../components/ChatContainer';
import { useChatStream } from '../hooks/useChatStream';
import { I18nProvider, useI18n, type SupportedLocale } from '../i18n';

const ChatApp: Component = () => {
  const { locale, setLocale } = useI18n();
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
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-2xl font-bold text-gray-900">AG UI Solid Chat</h1>
              <p class="text-sm text-gray-600">A SolidJS chat component library with i18n</p>
            </div>
            <div class="flex gap-2">
              <button
                onClick={() => setLocale('en')}
                class={`px-3 py-1 rounded ${
                  locale() === 'en'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLocale('zh')}
                class={`px-3 py-1 rounded ${
                  locale() === 'zh'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                中文
              </button>
            </div>
          </div>
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

const App: Component = () => {
  return (
    <I18nProvider locale="en">
      <ChatApp />
    </I18nProvider>
  );
};

export default App;
