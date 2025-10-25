/**
 * Mock AG UI Backend Server
 *
 * This creates a mock backend that simulates AG UI protocol responses
 * for testing the library in the browser without a real backend.
 */

import { EventType } from '@ag-ui/core';

interface MockBackendConfig {
  delay?: number; // Delay between events in ms
  simulateToolCalls?: boolean;
  simulateSteps?: boolean;
  simulateErrors?: boolean;
}

/**
 * Simulate AG UI protocol response
 */
export async function mockAGUIResponse(
  userMessage: string,
  config: MockBackendConfig = {}
): Promise<ReadableStream<Uint8Array>> {
  const {
    delay = 100,
    simulateToolCalls = true,
    simulateSteps = false,
    simulateErrors = false
  } = config;

  const encoder = new TextEncoder();

  // Generate response based on user message
  const shouldUseToolCall = simulateToolCalls && userMessage.toLowerCase().includes('search');
  const shouldError = userMessage.toLowerCase().includes('error'); // Always trigger on "error" keyword

  return new ReadableStream({
    async start(controller) {
      try {
        // Helper to send SSE event
        const sendEvent = (data: any) => {
          const line = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(line));
        };

        const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

        // 1. RUN_STARTED
        sendEvent({
          type: EventType.RUN_STARTED,
          threadId: 'thread-' + Date.now(),
          runId: 'run-' + Date.now(),
          timestamp: Date.now()
        });
        await wait(delay);

        // Optional: STEP events
        if (simulateSteps) {
          sendEvent({
            type: EventType.STEP_STARTED,
            stepName: 'analyze',
            timestamp: Date.now()
          });
          await wait(delay);
        }

        // 2. TEXT_MESSAGE_START
        const messageId = 'msg-' + Date.now();
        sendEvent({
          type: EventType.TEXT_MESSAGE_START,
          messageId,
          role: 'assistant',
          timestamp: Date.now()
        });
        await wait(delay);

        // Handle error case
        if (shouldError) {
          sendEvent({
            type: EventType.RUN_ERROR,
            message: 'Simulated error: Something went wrong!',
            code: 'MOCK_ERROR',
            timestamp: Date.now()
          });
          controller.close();
          return;
        }

        // Tool call simulation
        if (shouldUseToolCall) {
          const toolCallId = 'tool-' + Date.now();

          // TOOL_CALL_START
          sendEvent({
            type: EventType.TOOL_CALL_START,
            toolCallId,
            toolCallName: 'search',
            parentMessageId: messageId,
            timestamp: Date.now()
          });
          await wait(delay);

          // TOOL_CALL_ARGS
          sendEvent({
            type: EventType.TOOL_CALL_ARGS,
            toolCallId,
            args: JSON.stringify({ query: userMessage }),
            timestamp: Date.now()
          });
          await wait(delay);

          // TOOL_CALL_END
          sendEvent({
            type: EventType.TOOL_CALL_END,
            toolCallId,
            timestamp: Date.now()
          });
          await wait(delay);

          // TOOL_CALL_RESULT
          sendEvent({
            type: EventType.TOOL_CALL_RESULT,
            toolCallId,
            result: `Found 3 results for "${userMessage}": Result 1, Result 2, Result 3`,
            status: 'success',
            timestamp: Date.now()
          });
          await wait(delay);

          // Add tool result explanation to message
          const toolResponse = `I found some results for you. Here's what I discovered:\n\n`;
          for (const char of toolResponse) {
            sendEvent({
              type: EventType.TEXT_MESSAGE_CONTENT,
              messageId,
              delta: char,
              timestamp: Date.now()
            });
            await wait(delay / 10);
          }
        }

        // 3. TEXT_MESSAGE_CONTENT (streaming)
        const responses = [
          "Hello! ",
          "I'm an AI assistant ",
          "powered by the AG UI protocol. ",
          shouldUseToolCall ? "I've searched for information based on your query. " : "",
          "\n\nHow can I help you today?"
        ];

        for (const chunk of responses) {
          if (chunk) {
            sendEvent({
              type: EventType.TEXT_MESSAGE_CONTENT,
              messageId,
              delta: chunk,
              timestamp: Date.now()
            });
            await wait(delay);
          }
        }

        // Optional: STEP_FINISHED
        if (simulateSteps) {
          sendEvent({
            type: EventType.STEP_FINISHED,
            stepName: 'analyze',
            timestamp: Date.now()
          });
          await wait(delay);
        }

        // Optional: STATE_SNAPSHOT
        sendEvent({
          type: EventType.STATE_SNAPSHOT,
          state: {
            conversationCount: 1,
            lastInteraction: new Date().toISOString()
          },
          timestamp: Date.now()
        });
        await wait(delay);

        // 4. TEXT_MESSAGE_END
        sendEvent({
          type: EventType.TEXT_MESSAGE_END,
          messageId,
          timestamp: Date.now()
        });
        await wait(delay);

        // 5. RUN_FINISHED
        sendEvent({
          type: EventType.RUN_FINISHED,
          result: { success: true },
          timestamp: Date.now()
        });

        controller.close();
      } catch (error) {
        controller.error(error);
      }
    }
  });
}

/**
 * Mock fetch interceptor for /api/chat
 */
export function setupMockBackend(config: MockBackendConfig = {}) {
  const originalFetch = window.fetch;

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

    // Intercept /api/chat requests
    if (url.includes('/api/chat')) {
      try {
        const body = init?.body ? JSON.parse(init.body as string) : {};
        const lastMessage = body.messages?.[body.messages.length - 1];
        const userMessage = lastMessage?.content || 'Hello';

        console.log('[Mock Backend] Received message:', userMessage);

        const stream = await mockAGUIResponse(userMessage, config);

        return new Response(stream, {
          status: 200,
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
          }
        });
      } catch (error) {
        console.error('[Mock Backend] Error:', error);
        return new Response('Internal Server Error', { status: 500 });
      }
    }

    // Pass through other requests
    return originalFetch(input, init);
  };

  console.log('[Mock Backend] AG UI mock backend initialized');

  // Return cleanup function
  return () => {
    window.fetch = originalFetch;
    console.log('[Mock Backend] Restored original fetch');
  };
}
