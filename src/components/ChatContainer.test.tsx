import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { ChatContainer } from './ChatContainer';
import { render, createMockMessage } from '../test/utils';

describe('ChatContainer', () => {
  it('renders empty state when no messages', () => {
    render(() => (
      <ChatContainer
        messages={[]}
        onSendMessage={() => {}}
      />
    ));

    expect(screen.getByText('No messages yet. Start a conversation!')).toBeInTheDocument();
    expect(screen.getByText('💬')).toBeInTheDocument();
  });

  it('renders messages when provided', () => {
    const messages = [
      createMockMessage({ content: 'First message' }),
      createMockMessage({ content: 'Second message' })
    ];

    render(() => (
      <ChatContainer
        messages={messages}
        onSendMessage={() => {}}
      />
    ));

    expect(screen.getByText('First message')).toBeInTheDocument();
    expect(screen.getByText('Second message')).toBeInTheDocument();
  });

  it('renders composer by default', () => {
    render(() => (
      <ChatContainer
        messages={[]}
        onSendMessage={() => {}}
      />
    ));

    expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
  });

  it('hides composer when showComposer is false', () => {
    render(() => (
      <ChatContainer
        messages={[]}
        onSendMessage={() => {}}
        showComposer={false}
      />
    ));

    expect(screen.queryByPlaceholderText('Type a message...')).not.toBeInTheDocument();
  });

  it('calls onSendMessage when message is sent', async () => {
    const handleSend = vi.fn();
    const user = userEvent.setup();

    render(() => (
      <ChatContainer
        messages={[]}
        onSendMessage={handleSend}
      />
    ));

    const textarea = screen.getByPlaceholderText('Type a message...');
    await user.type(textarea, 'Hello world');

    const button = screen.getByRole('button', { name: /send/i });
    await user.click(button);

    expect(handleSend).toHaveBeenCalledWith('Hello world');
  });

  it('shows streaming indicator when isStreaming is true', () => {
    render(() => (
      <ChatContainer
        messages={[]}
        onSendMessage={() => {}}
        isStreaming={true}
      />
    ));

    expect(screen.getByText('Assistant is typing...')).toBeInTheDocument();
  });

  it('disables composer when streaming', () => {
    render(() => (
      <ChatContainer
        messages={[]}
        onSendMessage={() => {}}
        isStreaming={true}
      />
    ));

    const textarea = screen.getByPlaceholderText('Type a message...');
    expect(textarea).toBeDisabled();
  });

  it('displays error message when error is provided', () => {
    render(() => (
      <ChatContainer
        messages={[]}
        onSendMessage={() => {}}
        error="Something went wrong"
      />
    ));

    expect(screen.getByText('Error:')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('does not display error when error is null', () => {
    render(() => (
      <ChatContainer
        messages={[]}
        onSendMessage={() => {}}
        error={null}
      />
    ));

    expect(screen.queryByText('Error:')).not.toBeInTheDocument();
  });

  it('uses custom placeholder', () => {
    render(() => (
      <ChatContainer
        messages={[]}
        onSendMessage={() => {}}
        placeholder="Custom placeholder..."
      />
    ));

    expect(screen.getByPlaceholderText('Custom placeholder...')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(() => (
      <ChatContainer
        messages={[]}
        onSendMessage={() => {}}
        class="custom-container"
      />
    ));

    const wrapper = container.querySelector('.custom-container');
    expect(wrapper).toBeInTheDocument();
  });

  it('renders multiple messages in order', () => {
    const messages = [
      createMockMessage({ id: '1', content: 'Message 1', timestamp: new Date('2024-01-01T10:00:00') }),
      createMockMessage({ id: '2', content: 'Message 2', timestamp: new Date('2024-01-01T10:01:00') }),
      createMockMessage({ id: '3', content: 'Message 3', timestamp: new Date('2024-01-01T10:02:00') })
    ];

    render(() => (
      <ChatContainer
        messages={messages}
        onSendMessage={() => {}}
      />
    ));

    const messageElements = screen.getAllByText(/Message \d/);
    expect(messageElements).toHaveLength(3);
    expect(messageElements[0]).toHaveTextContent('Message 1');
    expect(messageElements[1]).toHaveTextContent('Message 2');
    expect(messageElements[2]).toHaveTextContent('Message 3');
  });

  it('has scrollable message area', () => {
    const messages = Array.from({ length: 50 }, (_, i) =>
      createMockMessage({ id: `${i}`, content: `Message ${i}` })
    );

    const { container } = render(() => (
      <ChatContainer
        messages={messages}
        onSendMessage={() => {}}
      />
    ));

    const messagesArea = container.querySelector('.overflow-y-auto');
    expect(messagesArea).toBeInTheDocument();
  });

  it('shows streaming indicator with animated dots', () => {
    const { container } = render(() => (
      <ChatContainer
        messages={[]}
        onSendMessage={() => {}}
        isStreaming={true}
      />
    ));

    const animatedElements = container.querySelectorAll('.animate-bounce');
    expect(animatedElements.length).toBe(3); // Three animated dots
  });

  it('shows error with correct styling', () => {
    const { container } = render(() => (
      <ChatContainer
        messages={[]}
        onSendMessage={() => {}}
        error="Test error"
      />
    ));

    const errorBanner = container.querySelector('.bg-red-50');
    expect(errorBanner).toBeInTheDocument();
  });

  it('maintains message display while streaming', () => {
    const messages = [
      createMockMessage({ content: 'Existing message' })
    ];

    render(() => (
      <ChatContainer
        messages={messages}
        onSendMessage={() => {}}
        isStreaming={true}
      />
    ));

    expect(screen.getByText('Existing message')).toBeInTheDocument();
    expect(screen.getByText('Assistant is typing...')).toBeInTheDocument();
  });

  it('renders with both error and streaming state', () => {
    render(() => (
      <ChatContainer
        messages={[]}
        onSendMessage={() => {}}
        isStreaming={true}
        error="Previous error"
      />
    ));

    expect(screen.getByText('Previous error')).toBeInTheDocument();
    expect(screen.getByText('Assistant is typing...')).toBeInTheDocument();
  });
});
