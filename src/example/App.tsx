import { Component, createSignal, onMount, Show, For } from 'solid-js';
import { ChatContainer } from '../components/ChatContainer';
import { useChatStream } from '../hooks/useChatStream';
import { I18nProvider, useI18n } from '../i18n';
import { setupMockBackend } from './mockAGUIBackend';

const ChatApp: Component = () => {
  const { locale, setLocale } = useI18n();
  const [showDebug, setShowDebug] = createSignal(true);
  const [mockConfig, setMockConfig] = createSignal({
    delay: 50,
    simulateToolCalls: true,
    simulateSteps: true,
    simulateErrors: false
  });

  const [state, actions] = useChatStream({
    apiEndpoint: '/api/chat',
    onMessage: (message) => {
      console.log('✅ Message completed:', message);
    },
    onError: (error) => {
      console.error('❌ Chat error:', error);
    }
  });

  // Setup mock backend on mount
  onMount(() => {
    const cleanup = setupMockBackend(mockConfig());
    console.log('🚀 AG UI Demo App started with mock backend');

    return cleanup;
  });

  return (
    <div class="w-full h-screen bg-gray-50 flex">
      {/* Main Chat Area */}
      <div class="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        <header class="bg-white border-b border-gray-200 p-4">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-2xl font-bold text-gray-900">🤖 AG UI Solid Demo</h1>
              <p class="text-sm text-gray-600">SolidJS + AG UI Protocol</p>
            </div>
            <div class="flex gap-2">
              <button
                onClick={() => setShowDebug(!showDebug())}
                class="px-3 py-1 rounded bg-purple-600 text-white hover:bg-purple-700 text-sm"
              >
                {showDebug() ? '👁️ Hide Debug' : '👁️ Show Debug'}
              </button>
              <button
                onClick={() => setLocale('en')}
                class={`px-3 py-1 rounded text-sm ${
                  locale() === 'en'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLocale('zh')}
                class={`px-3 py-1 rounded text-sm ${
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

        {/* Demo Instructions */}
        <div class="bg-blue-50 border-b border-blue-200 p-3">
          <p class="text-sm text-blue-800">
            <strong>💡 Try these commands:</strong>
          </p>
          <ul class="text-xs text-blue-700 mt-1 space-y-1">
            <li>• "Hello" - Basic message streaming</li>
            <li>• "Search for AG UI" - Triggers tool call simulation</li>
            <li>• "Error test" - Simulates RUN_ERROR event</li>
          </ul>
        </div>

        <div class="flex-1 min-h-0 bg-white shadow-lg">
          <ChatContainer
            messages={state.messages}
            onSendMessage={actions.sendMessage}
            isStreaming={state.isStreaming}
            error={state.error}
            placeholder="Try: 'Search for something' or 'Hello'"
          />
        </div>
      </div>

      {/* Debug Panel */}
      <Show when={showDebug()}>
        <div class="w-96 bg-gray-900 text-gray-100 p-4 overflow-y-auto">
          <h2 class="text-lg font-bold mb-4 text-green-400">🔍 AG UI Protocol State</h2>

          {/* Streaming Status */}
          <div class="mb-4 p-3 bg-gray-800 rounded">
            <div class="text-xs font-semibold text-gray-400 mb-2">Status</div>
            <div class="flex items-center gap-2">
              <div class={`w-3 h-3 rounded-full ${state.isStreaming ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`} />
              <span class="text-sm">{state.isStreaming ? 'Streaming...' : 'Idle'}</span>
            </div>
          </div>

          {/* Thread & Run Info */}
          <div class="mb-4 p-3 bg-gray-800 rounded">
            <div class="text-xs font-semibold text-gray-400 mb-2">Lifecycle</div>
            <div class="space-y-1 text-xs font-mono">
              <div>
                <span class="text-gray-500">Thread:</span>{' '}
                <span class="text-blue-400">{state.currentThreadId || 'N/A'}</span>
              </div>
              <div>
                <span class="text-gray-500">Run:</span>{' '}
                <span class="text-blue-400">{state.currentRunId || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Completed Steps */}
          <Show when={state.completedSteps && state.completedSteps.length > 0}>
            <div class="mb-4 p-3 bg-gray-800 rounded">
              <div class="text-xs font-semibold text-gray-400 mb-2">Completed Steps</div>
              <div class="space-y-1">
                <For each={state.completedSteps}>
                  {(step) => (
                    <div class="text-xs text-green-400">✓ {step}</div>
                  )}
                </For>
              </div>
            </div>
          </Show>

          {/* Agent State */}
          <Show when={state.agentState}>
            <div class="mb-4 p-3 bg-gray-800 rounded">
              <div class="text-xs font-semibold text-gray-400 mb-2">Agent State</div>
              <pre class="text-xs text-yellow-400 overflow-x-auto">
                {JSON.stringify(state.agentState, null, 2)}
              </pre>
            </div>
          </Show>

          {/* Messages Summary */}
          <div class="mb-4 p-3 bg-gray-800 rounded">
            <div class="text-xs font-semibold text-gray-400 mb-2">Messages</div>
            <div class="space-y-2">
              <For each={state.messages}>
                {(msg) => (
                  <div class="text-xs p-2 bg-gray-700 rounded">
                    <div class="flex items-center gap-2 mb-1">
                      <span class={`px-2 py-0.5 rounded text-xs ${
                        msg.role === 'user'
                          ? 'bg-blue-600'
                          : msg.role === 'assistant'
                          ? 'bg-green-600'
                          : 'bg-purple-600'
                      }`}>
                        {msg.role}
                      </span>
                      <span class="text-gray-400 text-xs">
                        {msg.id.slice(0, 8)}...
                      </span>
                    </div>
                    <div class="text-gray-300 text-xs truncate">
                      {msg.content.slice(0, 50)}...
                    </div>
                    <Show when={msg.toolResults && msg.toolResults.length > 0}>
                      <div class="mt-1 text-yellow-400 text-xs">
                        🔧 {msg.toolResults!.length} tool call(s)
                      </div>
                    </Show>
                  </div>
                )}
              </For>
            </div>
          </div>

          {/* Error Display */}
          <Show when={state.error}>
            <div class="mb-4 p-3 bg-red-900 border border-red-700 rounded">
              <div class="text-xs font-semibold text-red-400 mb-2">Error</div>
              <div class="text-xs text-red-300">{state.error}</div>
            </div>
          </Show>

          {/* Mock Backend Config */}
          <div class="mb-4 p-3 bg-gray-800 rounded">
            <div class="text-xs font-semibold text-gray-400 mb-2">Mock Backend Config</div>
            <div class="space-y-2 text-xs">
              <label class="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={mockConfig().simulateToolCalls}
                  onChange={(e) => setMockConfig({ ...mockConfig(), simulateToolCalls: e.target.checked })}
                  class="rounded"
                />
                <span>Tool Calls</span>
              </label>
              <label class="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={mockConfig().simulateSteps}
                  onChange={(e) => setMockConfig({ ...mockConfig(), simulateSteps: e.target.checked })}
                  class="rounded"
                />
                <span>Steps</span>
              </label>
              <div class="text-gray-400">
                Delay: {mockConfig().delay}ms
                <input
                  type="range"
                  min="10"
                  max="500"
                  value={mockConfig().delay}
                  onInput={(e) => setMockConfig({ ...mockConfig(), delay: parseInt(e.target.value) })}
                  class="w-full"
                />
              </div>
            </div>
          </div>

          {/* Clear Button */}
          <button
            onClick={actions.clearMessages}
            class="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
          >
            🗑️ Clear Messages
          </button>

          {/* Protocol Info */}
          <div class="mt-4 p-3 bg-gray-800 rounded">
            <div class="text-xs font-semibold text-gray-400 mb-2">Protocol Info</div>
            <div class="text-xs text-gray-400 space-y-1">
              <div>✅ AG UI Protocol v1</div>
              <div>✅ SSE Streaming</div>
              <div>✅ Tool Call Support</div>
              <div>✅ State Management</div>
              <div>✅ Event-based Architecture</div>
            </div>
          </div>
        </div>
      </Show>
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
