import { createSignal, createEffect } from 'solid-js';
import type { Message, ChatStreamState, ChatStreamActions, UseChatStreamReturn } from '../types';

export interface UseChatStreamOptions {
  apiEndpoint?: string;
  onMessage?: (message: Message) => void;
  onError?: (error: Error) => void;
  headers?: Record<string, string>;
}

export function useChatStream(options: UseChatStreamOptions = {}): UseChatStreamReturn {
  const {
    apiEndpoint = '/api/chat',
    onMessage,
    onError,
    headers = {}
  } = options;

  const [messages, setMessages] = createSignal<Message[]>([]);
  const [isStreaming, setIsStreaming] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
    onMessage?.(message);
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isStreaming()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date()
    };

    addMessage(userMessage);
    setIsStreaming(true);
    setError(null);

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify({
          messages: [...messages(), userMessage]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let assistantContent = '';
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '',
        timestamp: new Date()
      };

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value);
        assistantContent += chunk;

        // Update the assistant message content
        setMessages(prev => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg?.role === 'assistant' && lastMsg.id === assistantMessage.id) {
            return [...prev.slice(0, -1), { ...lastMsg, content: assistantContent }];
          } else {
            return [...prev, { ...assistantMessage, content: assistantContent }];
          }
        });
      }

      onMessage?.(assistantMessage);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setIsStreaming(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
    setError(null);
  };

  const state: ChatStreamState = {
    get messages() { return messages(); },
    get isStreaming() { return isStreaming(); },
    get error() { return error(); }
  };

  const actions: ChatStreamActions = {
    sendMessage,
    addMessage,
    clearMessages,
    setError: (err) => setError(err)
  };

  return [state, actions];
}
