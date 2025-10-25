import { createSignal } from 'solid-js';
import { EventType } from '@ag-ui/core';
import type { Message, ChatStreamState, ChatStreamActions, UseChatStreamReturn } from '../types';
import {
  parseSSEChunk,
  MessageAccumulator,
  ToolCallAccumulator,
  applyStateDelta,
  type AGUIEvent
} from '../utils/eventParser';

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
  const [currentThreadId, setCurrentThreadId] = createSignal<string | undefined>(undefined);
  const [currentRunId, setCurrentRunId] = createSignal<string | undefined>(undefined);
  const [agentState, setAgentState] = createSignal<Record<string, unknown> | undefined>(undefined);
  const [completedSteps, setCompletedSteps] = createSignal<string[]>([]);

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
          messages: messages(),  // Already includes userMessage from addMessage above
          threadId: currentThreadId(),
          runId: currentRunId()
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

      // AG UI protocol: event accumulators
      const messageAccumulator = new MessageAccumulator();
      const toolCallAccumulator = new ToolCallAccumulator();
      let sseBuffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        // Parse SSE events from chunk
        const { events, buffer } = parseSSEChunk(sseBuffer, chunk);
        sseBuffer = buffer;

        // Process each event
        for (const event of events) {
          await handleAGUIEvent(event, messageAccumulator, toolCallAccumulator);
        }
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setIsStreaming(false);
    }
  };

  /**
   * Handle a single AG UI protocol event
   */
  async function handleAGUIEvent(
    event: AGUIEvent,
    messageAccumulator: MessageAccumulator,
    toolCallAccumulator: ToolCallAccumulator
  ): Promise<void> {
    switch (event.type) {
      // ============================================
      // Lifecycle Events
      // ============================================
      case EventType.RUN_STARTED:
        setCurrentThreadId(event.threadId);
        setCurrentRunId(event.runId);
        break;

      case EventType.RUN_FINISHED:
        // Run completed successfully
        break;

      case EventType.RUN_ERROR:
        setError(event.message || 'Agent error');
        if (onError) {
          onError(new Error(event.message || 'Agent error'));
        }
        break;

      case EventType.STEP_STARTED:
        // Optional: track current step
        break;

      case EventType.STEP_FINISHED:
        setCompletedSteps(prev => [...prev, event.stepName]);
        break;

      // ============================================
      // Text Message Events
      // ============================================
      case EventType.TEXT_MESSAGE_START: {
        const partialMessage = messageAccumulator.handleEvent(event);
        if (partialMessage && partialMessage.id) {
          const messageId = partialMessage.id;
          // Add initial empty message to show streaming started
          setMessages(prev => {
            const existing = prev.find(m => m.id === messageId);
            if (existing) return prev;

            return [...prev, {
              id: messageId,
              role: partialMessage.role || 'assistant',
              content: partialMessage.content || '',
              timestamp: partialMessage.timestamp || new Date(),
              toolResults: []
            }];
          });
        }
        break;
      }

      case EventType.TEXT_MESSAGE_CONTENT: {
        const partialMessage = messageAccumulator.handleEvent(event);
        if (partialMessage && partialMessage.id) {
          const messageId = partialMessage.id;
          // Update message content with delta
          setMessages(prev => {
            const index = prev.findIndex(m => m.id === messageId);
            if (index === -1) {
              // Message doesn't exist yet, create it
              return [...prev, {
                id: messageId,
                role: partialMessage.role || 'assistant',
                content: partialMessage.content || '',
                timestamp: partialMessage.timestamp || new Date(),
                toolResults: partialMessage.toolResults || []
              }];
            }

            // Update existing message
            const updated = [...prev];
            updated[index] = {
              ...updated[index],
              content: partialMessage.content || ''
            };
            return updated;
          });
        }
        break;
      }

      case EventType.TEXT_MESSAGE_END: {
        const partialMessage = messageAccumulator.handleEvent(event);
        if (partialMessage && partialMessage.id) {
          // Finalize message
          setMessages(prev => {
            const message = prev.find(m => m.id === partialMessage.id);
            if (message) {
              // Call onMessage callback for completed message
              if (onMessage) {
                onMessage(message);
              }
            }
            return prev;
          });
        }
        break;
      }

      case EventType.TEXT_MESSAGE_CHUNK: {
        const partialMessage = messageAccumulator.handleEvent(event);
        if (partialMessage && partialMessage.id) {
          const messageId = partialMessage.id;
          setMessages(prev => {
            const index = prev.findIndex(m => m.id === messageId);
            if (index === -1) {
              return [...prev, {
                id: messageId,
                role: partialMessage.role || 'assistant',
                content: partialMessage.content || '',
                timestamp: partialMessage.timestamp || new Date(),
                toolResults: []
              }];
            }

            const updated = [...prev];
            updated[index] = {
              ...updated[index],
              content: partialMessage.content || ''
            };
            return updated;
          });
        }
        break;
      }

      // ============================================
      // Tool Call Events
      // ============================================
      case EventType.TOOL_CALL_START: {
        const partialToolCall = toolCallAccumulator.handleEvent(event);
        if (partialToolCall && partialToolCall.id) {
          const toolCallId = partialToolCall.id;
          const parentMessageId = toolCallAccumulator.getParentMessageId(event);

          if (parentMessageId) {
            // Add pending tool result to parent message
            setMessages(prev => {
              const index = prev.findIndex(m => m.id === parentMessageId);
              if (index === -1) return prev;

              const updated = [...prev];
              const message = { ...updated[index] };

              if (!message.toolResults) {
                message.toolResults = [];
              }

              message.toolResults = [...message.toolResults, {
                id: toolCallId,
                toolName: partialToolCall.toolName || '',
                input: partialToolCall.input || {},
                output: partialToolCall.output || '',
                status: 'pending' as const,
                timestamp: partialToolCall.timestamp || new Date()
              }];

              updated[index] = message;
              return updated;
            });
          }
        }
        break;
      }

      case EventType.TOOL_CALL_ARGS: {
        const partialToolCall = toolCallAccumulator.handleEvent(event);
        if (partialToolCall && partialToolCall.id) {
          // Update tool call input
          setMessages(prev => {
            return prev.map(message => {
              const toolIndex = message.toolResults?.findIndex(t => t.id === partialToolCall.id);
              if (toolIndex !== undefined && toolIndex !== -1 && message.toolResults) {
                const updatedToolResults = [...message.toolResults];
                updatedToolResults[toolIndex] = {
                  ...updatedToolResults[toolIndex],
                  input: partialToolCall.input || {}
                };
                return { ...message, toolResults: updatedToolResults };
              }
              return message;
            });
          });
        }
        break;
      }

      case EventType.TOOL_CALL_END:
        // Tool call arguments complete, waiting for result
        break;

      case EventType.TOOL_CALL_RESULT: {
        const partialToolCall = toolCallAccumulator.handleEvent(event);
        if (partialToolCall && partialToolCall.id) {
          // Update tool call with result
          setMessages(prev => {
            return prev.map(message => {
              const toolIndex = message.toolResults?.findIndex(t => t.id === partialToolCall.id);
              if (toolIndex !== undefined && toolIndex !== -1 && message.toolResults) {
                const updatedToolResults = [...message.toolResults];
                updatedToolResults[toolIndex] = {
                  ...updatedToolResults[toolIndex],
                  output: partialToolCall.output || '',
                  status: partialToolCall.status || 'success'
                };
                return { ...message, toolResults: updatedToolResults };
              }
              return message;
            });
          });
        }
        break;
      }

      // ============================================
      // State Management Events
      // ============================================
      case EventType.STATE_SNAPSHOT:
        setAgentState(event.state || {});
        break;

      case EventType.STATE_DELTA:
        setAgentState(prev => {
          if (!prev) return event.delta;
          return applyStateDelta(prev, event.delta);
        });
        break;

      case EventType.MESSAGES_SNAPSHOT:
        // Optionally replace or merge messages
        // For now, we'll skip to avoid overwriting current messages
        break;

      // ============================================
      // Special Events
      // ============================================
      case EventType.RAW:
      case EventType.CUSTOM:
        // Custom handling can be added here
        console.log('[AG UI] Received special event:', event.type, event);
        break;

      default:
        console.warn('[AG UI] Unknown event type:', event.type);
    }
  }

  const clearMessages = () => {
    setMessages([]);
    setError(null);
    setCompletedSteps([]);
  };

  const state: ChatStreamState = {
    get messages() { return messages(); },
    get isStreaming() { return isStreaming(); },
    get error() { return error(); },
    get currentThreadId() { return currentThreadId(); },
    get currentRunId() { return currentRunId(); },
    get agentState() { return agentState(); },
    get completedSteps() { return completedSteps(); }
  };

  const actions: ChatStreamActions = {
    sendMessage,
    addMessage,
    clearMessages,
    setError: (err) => setError(err)
  };

  return [state, actions];
}
