import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { Composer } from './Composer';
import { render } from '../test/utils';

describe('Composer', () => {
  it('renders textarea with placeholder', () => {
    render(() => <Composer onSend={() => {}} placeholder="Type here..." />);

    const textarea = screen.getByPlaceholderText('Type here...');
    expect(textarea).toBeInTheDocument();
  });

  it('uses default placeholder when none provided', () => {
    render(() => <Composer onSend={() => {}} />);

    expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
  });

  it('renders send button', () => {
    render(() => <Composer onSend={() => {}} />);

    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('calls onSend when form is submitted with valid input', async () => {
    const handleSend = vi.fn();
    const user = userEvent.setup();

    render(() => <Composer onSend={handleSend} />);

    const textarea = screen.getByPlaceholderText('Type a message...');
    await user.type(textarea, 'Hello world');

    const button = screen.getByRole('button', { name: /send/i });
    await user.click(button);

    expect(handleSend).toHaveBeenCalledWith('Hello world');
  });

  it('clears input after sending message', async () => {
    const user = userEvent.setup();

    render(() => <Composer onSend={() => {}} />);

    const textarea = screen.getByPlaceholderText('Type a message...') as HTMLTextAreaElement;
    await user.type(textarea, 'Test message');

    const button = screen.getByRole('button', { name: /send/i });
    await user.click(button);

    expect(textarea.value).toBe('');
  });

  it('does not call onSend with empty or whitespace-only input', async () => {
    const handleSend = vi.fn();
    const user = userEvent.setup();

    render(() => <Composer onSend={handleSend} />);

    const button = screen.getByRole('button', { name: /send/i });
    await user.click(button);

    expect(handleSend).not.toHaveBeenCalled();

    const textarea = screen.getByPlaceholderText('Type a message...');
    await user.type(textarea, '   ');
    await user.click(button);

    expect(handleSend).not.toHaveBeenCalled();
  });

  it('sends message when Enter is pressed', async () => {
    const handleSend = vi.fn();
    const user = userEvent.setup();

    render(() => <Composer onSend={handleSend} />);

    const textarea = screen.getByPlaceholderText('Type a message...');
    await user.type(textarea, 'Test message{Enter}');

    expect(handleSend).toHaveBeenCalledWith('Test message');
  });

  it('does not send message when Shift+Enter is pressed', async () => {
    const handleSend = vi.fn();
    const user = userEvent.setup();

    render(() => <Composer onSend={handleSend} />);

    const textarea = screen.getByPlaceholderText('Type a message...');
    await user.type(textarea, 'Line 1{Shift>}{Enter}{/Shift}Line 2');

    expect(handleSend).not.toHaveBeenCalled();
  });

  it('disables textarea and button when isDisabled is true', () => {
    render(() => <Composer onSend={() => {}} isDisabled={true} />);

    const textarea = screen.getByPlaceholderText('Type a message...');
    const button = screen.getByRole('button');

    expect(textarea).toBeDisabled();
    expect(button).toBeDisabled();
  });

  it('shows loading indicator when disabled', () => {
    render(() => <Composer onSend={() => {}} isDisabled={true} />);

    expect(screen.getByText('...')).toBeInTheDocument();
  });

  it('disables send button when input is empty', () => {
    render(() => <Composer onSend={() => {}} />);

    const button = screen.getByRole('button', { name: /send/i });
    expect(button).toBeDisabled();
  });

  it('enables send button when input has content', async () => {
    const user = userEvent.setup();

    render(() => <Composer onSend={() => {}} />);

    const textarea = screen.getByPlaceholderText('Type a message...');
    const button = screen.getByRole('button', { name: /send/i });

    expect(button).toBeDisabled();

    await user.type(textarea, 'Hello');

    expect(button).not.toBeDisabled();
  });

  it('displays character count when maxLength is provided', async () => {
    const user = userEvent.setup();

    render(() => <Composer onSend={() => {}} maxLength={100} />);

    expect(screen.getByText('0 / 100')).toBeInTheDocument();

    const textarea = screen.getByPlaceholderText('Type a message...');
    await user.type(textarea, 'Hello');

    expect(screen.getByText('5 / 100')).toBeInTheDocument();
  });

  it('warns when approaching character limit', async () => {
    const user = userEvent.setup();

    render(() => <Composer onSend={() => {}} maxLength={20} />);

    const textarea = screen.getByPlaceholderText('Type a message...');
    await user.type(textarea, 'This is nineteen ch'); // 19 chars, > 90% of 20 (18)

    const counter = screen.getByText('19 / 20');
    expect(counter.className).toContain('text-yellow-600');
  });

  it('shows error when exceeding character limit', async () => {
    const user = userEvent.setup();

    render(() => <Composer onSend={() => {}} maxLength={5} />);

    const textarea = screen.getByPlaceholderText('Type a message...');
    await user.type(textarea, 'Hello World'); // > 5 chars

    const counter = screen.getByText(/11 \/ 5/);
    expect(counter.className).toContain('text-red-600');
  });

  it('disables send button when over character limit', async () => {
    const user = userEvent.setup();

    render(() => <Composer onSend={() => {}} maxLength={5} />);

    const textarea = screen.getByPlaceholderText('Type a message...');
    await user.type(textarea, 'Too long');

    const button = screen.getByRole('button', { name: /send/i });
    expect(button).toBeDisabled();
  });

  it('applies custom className', () => {
    const { container } = render(() =>
      <Composer onSend={() => {}} class="custom-composer" />
    );

    expect(container.querySelector('.custom-composer')).toBeInTheDocument();
  });

  it('shows focus ring when textarea is focused', async () => {
    const user = userEvent.setup();
    const { container } = render(() => <Composer onSend={() => {}} />);

    const textarea = screen.getByPlaceholderText('Type a message...');
    await user.click(textarea);

    const borderContainer = container.querySelector('.border-blue-500');
    expect(borderContainer).toBeInTheDocument();
  });
});
