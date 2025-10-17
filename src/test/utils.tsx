import { render as solidRender } from '@solidjs/testing-library';
import type { JSX } from 'solid-js';
import { I18nProvider } from '../i18n';

/**
 * Custom render function that wraps the component with any necessary providers
 */
export function render(ui: () => JSX.Element, options = {}) {
  const Wrapper = () => (
    <I18nProvider locale="en">
      {ui()}
    </I18nProvider>
  );

  const result = solidRender(Wrapper, {
    ...options,
    // Ensure each test gets a fresh container
    container: document.body.appendChild(document.createElement('div'))
  });
  return result;
}

/**
 * Helper to create mock messages for testing
 */
export function createMockMessage(overrides = {}) {
  return {
    id: crypto.randomUUID(),
    role: 'user' as const,
    content: 'Test message',
    timestamp: new Date(),
    ...overrides
  };
}

/**
 * Helper to create mock tool results for testing
 */
export function createMockToolResult(overrides = {}) {
  return {
    id: crypto.randomUUID(),
    toolName: 'test-tool',
    input: { param: 'value' },
    output: 'Test output',
    status: 'success' as const,
    timestamp: new Date(),
    ...overrides
  };
}

/**
 * Wait for async updates
 */
export const waitFor = (callback: () => void, options = {}) => {
  return new Promise<void>((resolve) => {
    const timeout = setTimeout(() => {
      callback();
      resolve();
    }, 0);
  });
};
