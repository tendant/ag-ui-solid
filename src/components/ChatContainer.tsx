import { Component, Index, Show, onMount, createEffect } from 'solid-js';
import type { Message as MessageType } from '../types';
import { Message } from './Message';
import { Composer } from './Composer';

export interface ChatContainerProps {
  messages: MessageType[];
  onSendMessage: (message: string) => void;
  isStreaming?: boolean;
  error?: string | null;
  placeholder?: string;
  class?: string;
  showComposer?: boolean;
  autoScroll?: boolean;
}

export const ChatContainer: Component<ChatContainerProps> = (props) => {
  let messagesEndRef: HTMLDivElement | undefined;
  let containerRef: HTMLDivElement | undefined;

  // Debug logging
  console.log('[ChatContainer] Rendering with messages count:', props.messages?.length);

  const scrollToBottom = () => {
    if (props.autoScroll !== false && messagesEndRef) {
      messagesEndRef.scrollIntoView({ behavior: 'smooth' });
    }
  };

  onMount(() => {
    scrollToBottom();
  });

  createEffect(() => {
    // Trigger scroll when messages change
    props.messages.length;
    scrollToBottom();
  });

  return (
    <div class={`flex flex-col h-full min-h-0 ${props.class || ''}`}>
      {/* Messages Area */}
      <div
        ref={containerRef}
        class="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 custom-scrollbar"
      >
        <Index each={props.messages}>
          {(message, index) => {
            console.log('[ChatContainer] Rendering message at index:', index, 'id:', message().id);
            return <Message message={message()} />;
          }}
        </Index>
        <Show when={props.messages.length === 0}>
          <div class="flex items-center justify-center h-full text-gray-400">
            <div class="text-center">
              <div class="text-4xl mb-2">💬</div>
              <p class="text-sm">No messages yet. Start a conversation!</p>
            </div>
          </div>
        </Show>
        <div ref={messagesEndRef} />

        <Show when={props.isStreaming}>
          <div class="flex items-center gap-2 text-gray-500 text-sm">
            <div class="flex gap-1">
              <span class="animate-bounce" style={{ "animation-delay": "0ms" }}>●</span>
              <span class="animate-bounce" style={{ "animation-delay": "150ms" }}>●</span>
              <span class="animate-bounce" style={{ "animation-delay": "300ms" }}>●</span>
            </div>
            <span>Assistant is typing...</span>
          </div>
        </Show>
      </div>

      {/* Error Display */}
      <Show when={props.error}>
        <div class="px-4 py-2 bg-red-50 border-t border-red-200 text-red-800 text-sm">
          <div class="flex items-center gap-2">
            <span class="font-semibold">Error:</span>
            <span>{props.error}</span>
          </div>
        </div>
      </Show>

      {/* Composer Area */}
      <Show when={props.showComposer !== false}>
        <div class="border-t border-gray-200 p-4 bg-white">
          <Composer
            onSend={props.onSendMessage}
            isDisabled={props.isStreaming}
            placeholder={props.placeholder}
          />
        </div>
      </Show>
    </div>
  );
};
