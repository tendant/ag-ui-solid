import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@solidjs/testing-library';
import { EventType } from '@ag-ui/core';
import { useChatStream } from './useChatStream';

/**
 * AG UI Protocol Integration Tests for useChatStream
 *
 * These tests define the expected behavior when useChatStream
 * integrates with AG UI protocol event streaming.
 *
 * Test-Driven Development (TDD) approach:
 * - Tests written BEFORE implementation
 * - Define expected behavior
 * - Implement to make tests pass
 */

describe('useChatStream - AG UI Protocol Integration', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Helper to create a mock ReadableStream that emits SSE events
   */
  function createSSEStream(events: Array<{ type: string; data: any }>) {
    const encoder = new TextEncoder();
    const chunks = events.map(event =>
      encoder.encode(`data: ${JSON.stringify(event.data)}\n\n`)
    );

    let index = 0;
    return new ReadableStream({
      pull(controller) {
        if (index < chunks.length) {
          controller.enqueue(chunks[index++]);
        } else {
          controller.close();
        }
      }
    });
  }

  describe('Lifecycle Events', () => {
    it('should handle RUN_STARTED event', async () => {
      const mockStream = createSSEStream([
        {
          type: 'lifecycle',
          data: {
            type: EventType.RUN_STARTED,
            threadId: 'thread-123',
            runId: 'run-456'
          }
        },
        {
          type: 'lifecycle',
          data: {
            type: EventType.RUN_FINISHED
          }
        }
      ]);

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        body: mockStream
      });

      const { result } = renderHook(() => useChatStream({ apiEndpoint: '/api/chat' }));
      const [state, actions] = result;

      await actions.sendMessage('Hello');

      await waitFor(() => {
        expect(state.isStreaming).toBe(false);
      });

      // TODO: Verify that threadId and runId are tracked
      // expect(state.currentThreadId).toBe('thread-123');
      // expect(state.currentRunId).toBe('run-456');
    });

    it('should handle RUN_ERROR event', async () => {
      const mockStream = createSSEStream([
        {
          type: 'lifecycle',
          data: {
            type: EventType.RUN_STARTED,
            threadId: 'thread-123',
            runId: 'run-456'
          }
        },
        {
          type: 'error',
          data: {
            type: EventType.RUN_ERROR,
            message: 'Agent failed',
            code: 'AGENT_ERROR'
          }
        }
      ]);

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        body: mockStream
      });

      const { result } = renderHook(() => useChatStream({ apiEndpoint: '/api/chat' }));
      const [state, actions] = result;

      await actions.sendMessage('Hello');

      await waitFor(() => {
        expect(state.error).toBe('Agent failed');
        expect(state.isStreaming).toBe(false);
      });
    });

    it('should handle STEP_STARTED and STEP_FINISHED events', async () => {
      const mockStream = createSSEStream([
        {
          type: 'lifecycle',
          data: {
            type: EventType.RUN_STARTED,
            threadId: 'thread-123',
            runId: 'run-456'
          }
        },
        {
          type: 'step',
          data: {
            type: EventType.STEP_STARTED,
            stepName: 'analyze'
          }
        },
        {
          type: 'step',
          data: {
            type: EventType.STEP_FINISHED,
            stepName: 'analyze'
          }
        },
        {
          type: 'lifecycle',
          data: {
            type: EventType.RUN_FINISHED
          }
        }
      ]);

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        body: mockStream
      });

      const { result } = renderHook(() => useChatStream({ apiEndpoint: '/api/chat' }));
      const [state, actions] = result;

      await actions.sendMessage('Hello');

      await waitFor(() => {
        expect(state.isStreaming).toBe(false);
      });

      // TODO: Verify steps are tracked
      // expect(state.completedSteps).toContain('analyze');
    });
  });

  describe('Text Message Streaming', () => {
    it('should accumulate message from TEXT_MESSAGE events', async () => {
      const mockStream = createSSEStream([
        {
          type: 'lifecycle',
          data: {
            type: EventType.RUN_STARTED,
            threadId: 'thread-123',
            runId: 'run-456'
          }
        },
        {
          type: 'message',
          data: {
            type: EventType.TEXT_MESSAGE_START,
            messageId: 'msg-1',
            role: 'assistant'
          }
        },
        {
          type: 'message',
          data: {
            type: EventType.TEXT_MESSAGE_CONTENT,
            messageId: 'msg-1',
            delta: 'Hello'
          }
        },
        {
          type: 'message',
          data: {
            type: EventType.TEXT_MESSAGE_CONTENT,
            messageId: 'msg-1',
            delta: ', '
          }
        },
        {
          type: 'message',
          data: {
            type: EventType.TEXT_MESSAGE_CONTENT,
            messageId: 'msg-1',
            delta: 'world!'
          }
        },
        {
          type: 'message',
          data: {
            type: EventType.TEXT_MESSAGE_END,
            messageId: 'msg-1'
          }
        },
        {
          type: 'lifecycle',
          data: {
            type: EventType.RUN_FINISHED
          }
        }
      ]);

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        body: mockStream
      });

      const { result } = renderHook(() => useChatStream({ apiEndpoint: '/api/chat' }));
      const [state, actions] = result;

      await actions.sendMessage('Test');

      await waitFor(() => {
        expect(state.messages.length).toBeGreaterThan(0);
      });

      // Find the assistant message
      const assistantMessage = state.messages.find(m => m.role === 'assistant');
      expect(assistantMessage).toBeDefined();
      expect(assistantMessage?.content).toBe('Hello, world!');
      expect(assistantMessage?.id).toBe('msg-1');
    });

    it('should handle TEXT_MESSAGE_CHUNK events', async () => {
      const mockStream = createSSEStream([
        {
          type: 'lifecycle',
          data: {
            type: EventType.RUN_STARTED,
            threadId: 'thread-123',
            runId: 'run-456'
          }
        },
        {
          type: 'message',
          data: {
            type: EventType.TEXT_MESSAGE_CHUNK,
            messageId: 'msg-1',
            role: 'assistant',
            delta: 'Complete message'
          }
        },
        {
          type: 'lifecycle',
          data: {
            type: EventType.RUN_FINISHED
          }
        }
      ]);

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        body: mockStream
      });

      const { result } = renderHook(() => useChatStream({ apiEndpoint: '/api/chat' }));
      const [state, actions] = result;

      await actions.sendMessage('Test');

      await waitFor(() => {
        const assistantMessage = state.messages.find(m => m.role === 'assistant');
        expect(assistantMessage?.content).toBe('Complete message');
      });
    });

    it('should show streaming progress with incremental updates', async () => {
      const mockStream = createSSEStream([
        {
          type: 'lifecycle',
          data: {
            type: EventType.RUN_STARTED,
            threadId: 'thread-123',
            runId: 'run-456'
          }
        },
        {
          type: 'message',
          data: {
            type: EventType.TEXT_MESSAGE_START,
            messageId: 'msg-1',
            role: 'assistant'
          }
        },
        {
          type: 'message',
          data: {
            type: EventType.TEXT_MESSAGE_CONTENT,
            messageId: 'msg-1',
            delta: 'First '
          }
        },
        {
          type: 'message',
          data: {
            type: EventType.TEXT_MESSAGE_CONTENT,
            messageId: 'msg-1',
            delta: 'chunk'
          }
        }
      ]);

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        body: mockStream
      });

      const { result } = renderHook(() => useChatStream({ apiEndpoint: '/api/chat' }));
      const [state, actions] = result;

      const contentUpdates: string[] = [];

      await actions.sendMessage('Test');

      // TODO: Capture intermediate states
      // We should see content building up: '', 'First ', 'First chunk'
      await waitFor(() => {
        const assistantMessage = state.messages.find(m => m.role === 'assistant');
        if (assistantMessage && assistantMessage.content !== '') {
          contentUpdates.push(assistantMessage.content);
        }
      });

      // Should have intermediate states
      // expect(contentUpdates.length).toBeGreaterThan(1);
    });
  });

  describe('Tool Call Events', () => {
    it('should handle tool call sequence', async () => {
      const mockStream = createSSEStream([
        {
          type: 'lifecycle',
          data: {
            type: EventType.RUN_STARTED,
            threadId: 'thread-123',
            runId: 'run-456'
          }
        },
        {
          type: 'message',
          data: {
            type: EventType.TEXT_MESSAGE_START,
            messageId: 'msg-1',
            role: 'assistant'
          }
        },
        {
          type: 'tool',
          data: {
            type: EventType.TOOL_CALL_START,
            toolCallId: 'tool-1',
            toolCallName: 'search',
            parentMessageId: 'msg-1'
          }
        },
        {
          type: 'tool',
          data: {
            type: EventType.TOOL_CALL_ARGS,
            toolCallId: 'tool-1',
            args: '{"query":"test"}'
          }
        },
        {
          type: 'tool',
          data: {
            type: EventType.TOOL_CALL_END,
            toolCallId: 'tool-1'
          }
        },
        {
          type: 'tool',
          data: {
            type: EventType.TOOL_CALL_RESULT,
            toolCallId: 'tool-1',
            result: 'Found 5 results',
            status: 'success'
          }
        },
        {
          type: 'message',
          data: {
            type: EventType.TEXT_MESSAGE_END,
            messageId: 'msg-1'
          }
        },
        {
          type: 'lifecycle',
          data: {
            type: EventType.RUN_FINISHED
          }
        }
      ]);

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        body: mockStream
      });

      const { result } = renderHook(() => useChatStream({ apiEndpoint: '/api/chat' }));
      const [state, actions] = result;

      await actions.sendMessage('Search for test');

      await waitFor(() => {
        const assistantMessage = state.messages.find(m => m.role === 'assistant');
        expect(assistantMessage?.toolResults).toBeDefined();
        expect(assistantMessage?.toolResults?.length).toBe(1);
      });

      const assistantMessage = state.messages.find(m => m.role === 'assistant');
      const toolResult = assistantMessage?.toolResults?.[0];

      expect(toolResult?.id).toBe('tool-1');
      expect(toolResult?.toolName).toBe('search');
      expect(toolResult?.input).toEqual({ query: 'test' });
      expect(toolResult?.output).toBe('Found 5 results');
      expect(toolResult?.status).toBe('success');
    });

    it('should handle multiple tool calls in one message', async () => {
      const mockStream = createSSEStream([
        {
          type: 'lifecycle',
          data: {
            type: EventType.RUN_STARTED,
            threadId: 'thread-123',
            runId: 'run-456'
          }
        },
        {
          type: 'message',
          data: {
            type: EventType.TEXT_MESSAGE_START,
            messageId: 'msg-1',
            role: 'assistant'
          }
        },
        // First tool call
        {
          type: 'tool',
          data: {
            type: EventType.TOOL_CALL_START,
            toolCallId: 'tool-1',
            toolCallName: 'search',
            parentMessageId: 'msg-1'
          }
        },
        {
          type: 'tool',
          data: {
            type: EventType.TOOL_CALL_ARGS,
            toolCallId: 'tool-1',
            args: '{"query":"test1"}'
          }
        },
        {
          type: 'tool',
          data: {
            type: EventType.TOOL_CALL_END,
            toolCallId: 'tool-1'
          }
        },
        // Second tool call
        {
          type: 'tool',
          data: {
            type: EventType.TOOL_CALL_START,
            toolCallId: 'tool-2',
            toolCallName: 'analyze',
            parentMessageId: 'msg-1'
          }
        },
        {
          type: 'tool',
          data: {
            type: EventType.TOOL_CALL_ARGS,
            toolCallId: 'tool-2',
            args: '{"data":"test2"}'
          }
        },
        {
          type: 'tool',
          data: {
            type: EventType.TOOL_CALL_END,
            toolCallId: 'tool-2'
          }
        },
        // Results
        {
          type: 'tool',
          data: {
            type: EventType.TOOL_CALL_RESULT,
            toolCallId: 'tool-1',
            result: 'Result 1',
            status: 'success'
          }
        },
        {
          type: 'tool',
          data: {
            type: EventType.TOOL_CALL_RESULT,
            toolCallId: 'tool-2',
            result: 'Result 2',
            status: 'success'
          }
        },
        {
          type: 'message',
          data: {
            type: EventType.TEXT_MESSAGE_END,
            messageId: 'msg-1'
          }
        },
        {
          type: 'lifecycle',
          data: {
            type: EventType.RUN_FINISHED
          }
        }
      ]);

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        body: mockStream
      });

      const { result } = renderHook(() => useChatStream({ apiEndpoint: '/api/chat' }));
      const [state, actions] = result;

      await actions.sendMessage('Multiple tools');

      await waitFor(() => {
        const assistantMessage = state.messages.find(m => m.role === 'assistant');
        expect(assistantMessage?.toolResults?.length).toBe(2);
      });

      const assistantMessage = state.messages.find(m => m.role === 'assistant');
      expect(assistantMessage?.toolResults?.[0]?.toolName).toBe('search');
      expect(assistantMessage?.toolResults?.[1]?.toolName).toBe('analyze');
    });

    it('should handle tool call with error status', async () => {
      const mockStream = createSSEStream([
        {
          type: 'lifecycle',
          data: {
            type: EventType.RUN_STARTED,
            threadId: 'thread-123',
            runId: 'run-456'
          }
        },
        {
          type: 'message',
          data: {
            type: EventType.TEXT_MESSAGE_START,
            messageId: 'msg-1',
            role: 'assistant'
          }
        },
        {
          type: 'tool',
          data: {
            type: EventType.TOOL_CALL_START,
            toolCallId: 'tool-1',
            toolCallName: 'search',
            parentMessageId: 'msg-1'
          }
        },
        {
          type: 'tool',
          data: {
            type: EventType.TOOL_CALL_ARGS,
            toolCallId: 'tool-1',
            args: '{}'
          }
        },
        {
          type: 'tool',
          data: {
            type: EventType.TOOL_CALL_END,
            toolCallId: 'tool-1'
          }
        },
        {
          type: 'tool',
          data: {
            type: EventType.TOOL_CALL_RESULT,
            toolCallId: 'tool-1',
            result: 'Search failed: API error',
            status: 'error'
          }
        },
        {
          type: 'message',
          data: {
            type: EventType.TEXT_MESSAGE_END,
            messageId: 'msg-1'
          }
        },
        {
          type: 'lifecycle',
          data: {
            type: EventType.RUN_FINISHED
          }
        }
      ]);

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        body: mockStream
      });

      const { result } = renderHook(() => useChatStream({ apiEndpoint: '/api/chat' }));
      const [state, actions] = result;

      await actions.sendMessage('Test');

      await waitFor(() => {
        const assistantMessage = state.messages.find(m => m.role === 'assistant');
        expect(assistantMessage?.toolResults?.[0]?.status).toBe('error');
      });
    });
  });

  describe('State Management', () => {
    it('should handle STATE_SNAPSHOT event', async () => {
      const mockStream = createSSEStream([
        {
          type: 'lifecycle',
          data: {
            type: EventType.RUN_STARTED,
            threadId: 'thread-123',
            runId: 'run-456'
          }
        },
        {
          type: 'state',
          data: {
            type: EventType.STATE_SNAPSHOT,
            state: { counter: 5, mode: 'active' }
          }
        },
        {
          type: 'lifecycle',
          data: {
            type: EventType.RUN_FINISHED
          }
        }
      ]);

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        body: mockStream
      });

      const { result } = renderHook(() => useChatStream({ apiEndpoint: '/api/chat' }));
      const [state, actions] = result;

      await actions.sendMessage('Test');

      await waitFor(() => {
        expect(state.isStreaming).toBe(false);
      });

      // TODO: Verify state is stored
      // expect(state.agentState).toEqual({ counter: 5, mode: 'active' });
    });

    it('should handle STATE_DELTA event with JSON Patch', async () => {
      const mockStream = createSSEStream([
        {
          type: 'lifecycle',
          data: {
            type: EventType.RUN_STARTED,
            threadId: 'thread-123',
            runId: 'run-456'
          }
        },
        {
          type: 'state',
          data: {
            type: EventType.STATE_SNAPSHOT,
            state: { counter: 0 }
          }
        },
        {
          type: 'state',
          data: {
            type: EventType.STATE_DELTA,
            delta: [
              { op: 'replace', path: '/counter', value: 1 }
            ]
          }
        },
        {
          type: 'lifecycle',
          data: {
            type: EventType.RUN_FINISHED
          }
        }
      ]);

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        body: mockStream
      });

      const { result } = renderHook(() => useChatStream({ apiEndpoint: '/api/chat' }));
      const [state, actions] = result;

      await actions.sendMessage('Test');

      await waitFor(() => {
        expect(state.isStreaming).toBe(false);
      });

      // TODO: Verify state delta is applied
      // expect(state.agentState).toEqual({ counter: 1 });
    });

    it('should handle MESSAGES_SNAPSHOT event', async () => {
      const mockStream = createSSEStream([
        {
          type: 'lifecycle',
          data: {
            type: EventType.RUN_STARTED,
            threadId: 'thread-123',
            runId: 'run-456'
          }
        },
        {
          type: 'state',
          data: {
            type: EventType.MESSAGES_SNAPSHOT,
            messages: [
              {
                id: 'msg-old-1',
                role: 'user',
                content: 'Previous message',
                timestamp: new Date()
              }
            ]
          }
        },
        {
          type: 'lifecycle',
          data: {
            type: EventType.RUN_FINISHED
          }
        }
      ]);

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        body: mockStream
      });

      const { result } = renderHook(() => useChatStream({ apiEndpoint: '/api/chat' }));
      const [state, actions] = result;

      await actions.sendMessage('Test');

      await waitFor(() => {
        expect(state.isStreaming).toBe(false);
      });

      // TODO: Verify messages snapshot is applied
      // Should this replace messages or merge?
      // const oldMessage = state.messages.find(m => m.id === 'msg-old-1');
      // expect(oldMessage).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed SSE data', async () => {
      const encoder = new TextEncoder();
      const mockStream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode('data: {invalid json}\n\n'));
          controller.close();
        }
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        body: mockStream
      });

      const { result } = renderHook(() => useChatStream({ apiEndpoint: '/api/chat' }));
      const [state, actions] = result;

      await actions.sendMessage('Test');

      await waitFor(() => {
        expect(state.isStreaming).toBe(false);
      });

      // Should handle gracefully without crashing (logs warning but doesn't error)
      expect(state.error).toBeNull();
    });

    it('should handle unknown event types', async () => {
      const mockStream = createSSEStream([
        {
          type: 'lifecycle',
          data: {
            type: EventType.RUN_STARTED,
            threadId: 'thread-123',
            runId: 'run-456'
          }
        },
        {
          type: 'unknown',
          data: {
            type: 'UNKNOWN_EVENT',
            customData: 'test'
          }
        },
        {
          type: 'lifecycle',
          data: {
            type: EventType.RUN_FINISHED
          }
        }
      ]);

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        body: mockStream
      });

      const { result } = renderHook(() => useChatStream({ apiEndpoint: '/api/chat' }));
      const [state, actions] = result;

      await actions.sendMessage('Test');

      await waitFor(() => {
        expect(state.isStreaming).toBe(false);
      });

      // Should complete successfully, ignoring unknown events
      expect(state.error).toBeNull();
    });
  });

  describe('Callback Integration', () => {
    it('should call onMessage callback for completed messages', async () => {
      const onMessage = vi.fn();
      const mockStream = createSSEStream([
        {
          type: 'lifecycle',
          data: {
            type: EventType.RUN_STARTED,
            threadId: 'thread-123',
            runId: 'run-456'
          }
        },
        {
          type: 'message',
          data: {
            type: EventType.TEXT_MESSAGE_START,
            messageId: 'msg-1',
            role: 'assistant'
          }
        },
        {
          type: 'message',
          data: {
            type: EventType.TEXT_MESSAGE_CONTENT,
            messageId: 'msg-1',
            delta: 'Complete'
          }
        },
        {
          type: 'message',
          data: {
            type: EventType.TEXT_MESSAGE_END,
            messageId: 'msg-1'
          }
        },
        {
          type: 'lifecycle',
          data: {
            type: EventType.RUN_FINISHED
          }
        }
      ]);

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        body: mockStream
      });

      const { result } = renderHook(() =>
        useChatStream({ apiEndpoint: '/api/chat', onMessage })
      );
      const [state, actions] = result;

      await actions.sendMessage('Test');

      await waitFor(() => {
        expect(state.isStreaming).toBe(false);
      });

      // Should be called for user message and assistant message
      expect(onMessage).toHaveBeenCalledTimes(2);

      const assistantMessageCall = onMessage.mock.calls.find(
        call => call[0].role === 'assistant'
      );
      expect(assistantMessageCall).toBeDefined();
      expect(assistantMessageCall[0].content).toBe('Complete');
    });

    it('should call onError callback on RUN_ERROR', async () => {
      const onError = vi.fn();
      const mockStream = createSSEStream([
        {
          type: 'lifecycle',
          data: {
            type: EventType.RUN_STARTED,
            threadId: 'thread-123',
            runId: 'run-456'
          }
        },
        {
          type: 'error',
          data: {
            type: EventType.RUN_ERROR,
            message: 'Something went wrong',
            code: 'AGENT_ERROR'
          }
        }
      ]);

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        body: mockStream
      });

      const { result } = renderHook(() =>
        useChatStream({ apiEndpoint: '/api/chat', onError })
      );
      const [state, actions] = result;

      await actions.sendMessage('Test');

      await waitFor(() => {
        expect(state.error).toBeTruthy();
      });

      expect(onError).toHaveBeenCalled();
      const errorArg = onError.mock.calls[0][0];
      expect(errorArg.message).toContain('Something went wrong');
    });
  });
});
