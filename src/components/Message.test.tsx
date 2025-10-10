import { describe, it, expect } from 'vitest';
import { screen } from '@solidjs/testing-library';
import { Message } from './Message';
import { render, createMockMessage, createMockToolResult } from '../test/utils';

describe('Message', () => {
  it('renders message content', () => {
    const message = createMockMessage({
      content: 'Hello, world!'
    });

    render(() => <Message message={message} />);

    expect(screen.getByText('Hello, world!')).toBeInTheDocument();
  });

  it('displays user role with correct styling', () => {
    const message = createMockMessage({ role: 'user' });
    const { container } = render(() => <Message message={message} />);

    const messageBox = container.querySelector('.bg-blue-600');
    expect(messageBox).toBeInTheDocument();
    expect(screen.getByText('user')).toBeInTheDocument();
    expect(screen.getByText('👤')).toBeInTheDocument();
  });

  it('displays assistant role with correct styling', () => {
    const message = createMockMessage({ role: 'assistant' });
    const { container } = render(() => <Message message={message} />);

    const messageBox = container.querySelector('.bg-gray-100');
    expect(messageBox).toBeInTheDocument();
    expect(screen.getByText('assistant')).toBeInTheDocument();
    expect(screen.getByText('🤖')).toBeInTheDocument();
  });

  it('displays system role with correct styling', () => {
    const message = createMockMessage({ role: 'system' });
    const { container } = render(() => <Message message={message} />);

    expect(screen.getByText('system')).toBeInTheDocument();
    expect(screen.getByText('⚙️')).toBeInTheDocument();
  });

  it('displays timestamp', () => {
    const timestamp = new Date('2024-01-15T14:30:00');
    const message = createMockMessage({ timestamp });

    render(() => <Message message={message} />);

    expect(screen.getByText(timestamp.toLocaleTimeString())).toBeInTheDocument();
  });

  it('renders tool results when present', () => {
    const toolResult = createMockToolResult({
      toolName: 'search-tool',
      output: 'Search completed'
    });

    const message = createMockMessage({
      role: 'assistant',
      toolResults: [toolResult]
    });

    render(() => <Message message={message} />);

    expect(screen.getByText('search-tool')).toBeInTheDocument();
    expect(screen.getByText('Search completed')).toBeInTheDocument();
  });

  it('renders multiple tool results', () => {
    const toolResults = [
      createMockToolResult({ toolName: 'tool-1', output: 'Result 1' }),
      createMockToolResult({ toolName: 'tool-2', output: 'Result 2' })
    ];

    const message = createMockMessage({
      role: 'assistant',
      toolResults
    });

    render(() => <Message message={message} />);

    expect(screen.getByText('tool-1')).toBeInTheDocument();
    expect(screen.getByText('tool-2')).toBeInTheDocument();
    expect(screen.getByText('Result 1')).toBeInTheDocument();
    expect(screen.getByText('Result 2')).toBeInTheDocument();
  });

  it('does not render tool results section when none provided', () => {
    const message = createMockMessage({
      toolResults: undefined
    });

    render(() => <Message message={message} />);

    expect(screen.queryByText('Input:')).not.toBeInTheDocument();
    expect(screen.queryByText('Output:')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const message = createMockMessage();
    const { container } = render(() =>
      <Message message={message} class="custom-message" />
    );

    const wrapper = container.querySelector('.custom-message');
    expect(wrapper).toBeInTheDocument();
  });

  it('preserves whitespace in message content', () => {
    const message = createMockMessage({
      content: 'Line 1\nLine 2\n  Indented'
    });

    render(() => <Message message={message} />);

    const contentElement = screen.getByText(/Line 1/);
    expect(contentElement.className).toContain('whitespace-pre-wrap');
  });

  it('aligns user messages to the right', () => {
    const message = createMockMessage({ role: 'user' });
    const { container } = render(() => <Message message={message} />);

    const alignmentContainer = container.querySelector('.justify-end');
    expect(alignmentContainer).toBeInTheDocument();
  });

  it('aligns assistant messages to the left', () => {
    const message = createMockMessage({ role: 'assistant' });
    const { container } = render(() => <Message message={message} />);

    const alignmentContainer = container.querySelector('.justify-start');
    expect(alignmentContainer).toBeInTheDocument();
  });
});
