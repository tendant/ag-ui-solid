import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@solidjs/testing-library';
import { useChatStream } from './useChatStream';

describe('useChatStream', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with empty state', () => {
    const { result } = renderHook(() => useChatStream());
    const [state] = result;

    expect(state.messages).toEqual([]);
    expect(state.isStreaming).toBe(false);
    expect(state.error).toBeNull();
  });

  it('adds messages manually', () => {
    const { result } = renderHook(() => useChatStream());
    const [state, actions] = result;

    const message = {
      id: '1',
      role: 'user' as const,
      content: 'Hello',
      timestamp: new Date()
    };

    actions.addMessage(message);

    expect(state.messages).toHaveLength(1);
    expect(state.messages[0]).toEqual(message);
  });

  it('clears all messages', () => {
    const { result } = renderHook(() => useChatStream());
    const [state, actions] = result;

    actions.addMessage({
      id: '1',
      role: 'user',
      content: 'Test',
      timestamp: new Date()
    });

    expect(state.messages).toHaveLength(1);

    actions.clearMessages();

    expect(state.messages).toEqual([]);
    expect(state.error).toBeNull();
  });

  it('sets error state', () => {
    const { result } = renderHook(() => useChatStream());
    const [state, actions] = result;

    actions.setError('Test error');

    expect(state.error).toBe('Test error');

    actions.setError(null);

    expect(state.error).toBeNull();
  });

  it('calls onMessage callback when message is added', () => {
    const onMessage = vi.fn();
    const { result } = renderHook(() => useChatStream({ onMessage }));
    const [, actions] = result;

    const message = {
      id: '1',
      role: 'user' as const,
      content: 'Test',
      timestamp: new Date()
    };

    actions.addMessage(message);

    expect(onMessage).toHaveBeenCalledWith(message);
  });

  it('sends message and creates user message', async () => {
    const mockResponse = new Response('Assistant response', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });

    fetchMock.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useChatStream({ apiEndpoint: '/test' }));
    const [state, actions] = result;

    await actions.sendMessage('Hello');

    await waitFor(() => {
      expect(state.messages.length).toBeGreaterThan(0);
    });

    expect(state.messages[0].role).toBe('user');
    expect(state.messages[0].content).toBe('Hello');
  });

  it('does not send empty messages', async () => {
    const { result } = renderHook(() => useChatStream());
    const [, actions] = result;

    await actions.sendMessage('');

    expect(fetchMock).not.toHaveBeenCalled();

    await actions.sendMessage('   ');

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sets isStreaming during API call', async () => {
    const mockResponse = new Response('Response', {
      status: 200
    });

    fetchMock.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useChatStream());
    const [state, actions] = result;

    const sendPromise = actions.sendMessage('Test');

    // Should be streaming
    expect(state.isStreaming).toBe(true);

    await sendPromise;

    // Should be done streaming
    await waitFor(() => {
      expect(state.isStreaming).toBe(false);
    });
  });

  it('handles API errors', async () => {
    const onError = vi.fn();
    fetchMock.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useChatStream({ onError }));
    const [state, actions] = result;

    await actions.sendMessage('Test');

    await waitFor(() => {
      expect(state.error).toBe('Network error');
    });

    expect(onError).toHaveBeenCalled();
    expect(state.isStreaming).toBe(false);
  });

  it('handles HTTP error responses', async () => {
    fetchMock.mockResolvedValue(new Response('Error', { status: 500 }));

    const { result } = renderHook(() => useChatStream());
    const [state, actions] = result;

    await actions.sendMessage('Test');

    await waitFor(() => {
      expect(state.error).toContain('HTTP error');
    });
  });

  it('uses custom API endpoint', async () => {
    const mockResponse = new Response('Response', { status: 200 });
    fetchMock.mockResolvedValue(mockResponse);

    const { result } = renderHook(() =>
      useChatStream({ apiEndpoint: '/custom/endpoint' })
    );
    const [, actions] = result;

    await actions.sendMessage('Test');

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/custom/endpoint',
        expect.any(Object)
      );
    });
  });

  it('includes custom headers in requests', async () => {
    const mockResponse = new Response('Response', { status: 200 });
    fetchMock.mockResolvedValue(mockResponse);

    const customHeaders = { 'X-Custom-Header': 'test-value' };

    const { result } = renderHook(() =>
      useChatStream({ headers: customHeaders })
    );
    const [, actions] = result;

    await actions.sendMessage('Test');

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Custom-Header': 'test-value'
          })
        })
      );
    });
  });

  it('prevents sending while streaming', async () => {
    const mockResponse = new Response('Response', { status: 200 });
    fetchMock.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useChatStream());
    const [, actions] = result;

    const promise1 = actions.sendMessage('First');
    const promise2 = actions.sendMessage('Second');

    await Promise.all([promise1, promise2]);

    // Only first message should have been sent
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('clears error when sending new message', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Error'));

    const { result } = renderHook(() => useChatStream());
    const [state, actions] = result;

    await actions.sendMessage('First');

    await waitFor(() => {
      expect(state.error).toBeTruthy();
    });

    fetchMock.mockResolvedValueOnce(new Response('OK', { status: 200 }));

    await actions.sendMessage('Second');

    await waitFor(() => {
      expect(state.error).toBeNull();
    });
  });
});
