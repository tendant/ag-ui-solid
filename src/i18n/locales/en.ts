import type { TranslationDict } from '../types';

export const en: TranslationDict = {
  composer: {
    placeholder: 'Type a message...',
    send: 'Send',
    sending: 'Sending...',
  },
  message: {
    user: 'User',
    assistant: 'Assistant',
    system: 'System',
    error: 'Error',
  },
  toolResult: {
    success: 'Success',
    error: 'Error',
    pending: 'Pending',
    input: 'Input',
    output: 'Output',
  },
  chat: {
    errorOccurred: 'An error occurred',
    retry: 'Retry',
    typing: 'Typing...',
    noMessages: 'No messages yet. Start a conversation!',
  },
};
