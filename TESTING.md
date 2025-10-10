# Testing Guide for AG UI Solid

This document provides comprehensive guidance on testing the AG UI Solid component library.

## Table of Contents

- [Setup](#setup)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Testing Components](#testing-components)
- [Testing Hooks](#testing-hooks)
- [Test Utilities](#test-utilities)
- [Best Practices](#best-practices)

## Setup

The project uses the following testing stack:

- **Vitest**: Fast unit test framework
- **@solidjs/testing-library**: Testing utilities for SolidJS
- **@testing-library/user-event**: User interaction simulation
- **@testing-library/jest-dom**: Custom matchers for DOM testing
- **jsdom**: DOM implementation for Node.js

### Installation

All testing dependencies are included in `devDependencies`. Install them with:

```bash
npm install
```

## Running Tests

### Run all tests

```bash
npm test
```

### Run tests in watch mode

```bash
npm test -- --watch
```

### Run tests with UI

```bash
npm run test:ui
```

### Run tests with coverage

```bash
npm run test:coverage
```

### Run specific test file

```bash
npm test src/components/Message.test.tsx
```

### Run tests matching a pattern

```bash
npm test -- --grep "renders message"
```

## Test Structure

Tests are located alongside the files they test:

```
src/
├── components/
│   ├── ChatContainer.tsx
│   ├── ChatContainer.test.tsx
│   ├── Composer.tsx
│   ├── Composer.test.tsx
│   ├── Message.tsx
│   ├── Message.test.tsx
│   ├── ToolResult.tsx
│   └── ToolResult.test.tsx
├── hooks/
│   ├── useChatStream.tsx
│   └── useChatStream.test.tsx
└── test/
    ├── setup.ts
    └── utils.tsx
```

## Testing Components

### Basic Component Test

```tsx
import { describe, it, expect } from 'vitest';
import { screen } from '@solidjs/testing-library';
import { Message } from './Message';
import { render, createMockMessage } from '../test/utils';

describe('Message', () => {
  it('renders message content', () => {
    const message = createMockMessage({
      content: 'Hello, world!'
    });

    render(() => <Message message={message} />);

    expect(screen.getByText('Hello, world!')).toBeInTheDocument();
  });
});
```

### Testing User Interactions

```tsx
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';

it('calls onSend when button is clicked', async () => {
  const handleSend = vi.fn();
  const user = userEvent.setup();

  render(() => <Composer onSend={handleSend} />);

  const textarea = screen.getByPlaceholderText('Type a message...');
  await user.type(textarea, 'Hello');

  const button = screen.getByRole('button', { name: /send/i });
  await user.click(button);

  expect(handleSend).toHaveBeenCalledWith('Hello');
});
```

### Testing Conditional Rendering

```tsx
it('shows error when provided', () => {
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
```

### Testing Styles and Classes

```tsx
it('applies success styling', () => {
  const toolResult = createMockToolResult({ status: 'success' });
  const { container } = render(() => <ToolResult toolResult={toolResult} />);

  const wrapper = container.querySelector('div');
  expect(wrapper?.className).toContain('bg-green-50');
});
```

## Testing Hooks

### Basic Hook Test

```tsx
import { renderHook } from '@solidjs/testing-library';

it('initializes with empty state', () => {
  const { result } = renderHook(() => useChatStream());
  const [state] = result;

  expect(state.messages).toEqual([]);
  expect(state.isStreaming).toBe(false);
});
```

### Testing Hook Actions

```tsx
it('adds messages', () => {
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
```

### Testing Async Operations

```tsx
import { waitFor } from '@solidjs/testing-library';

it('handles API calls', async () => {
  const mockResponse = new Response('OK', { status: 200 });
  global.fetch = vi.fn().mockResolvedValue(mockResponse);

  const { result } = renderHook(() => useChatStream());
  const [state, actions] = result;

  await actions.sendMessage('Test');

  await waitFor(() => {
    expect(state.messages.length).toBeGreaterThan(0);
  });
});
```

## Test Utilities

### Custom Render Function

Located in `src/test/utils.tsx`:

```tsx
import { render } from '../test/utils';

render(() => <YourComponent />);
```

### Mock Data Helpers

Create mock messages:

```tsx
const message = createMockMessage({
  role: 'assistant',
  content: 'Custom content'
});
```

Create mock tool results:

```tsx
const toolResult = createMockToolResult({
  status: 'error',
  output: 'Error message'
});
```

### Common Queries

```tsx
// By text
screen.getByText('Hello');

// By role
screen.getByRole('button', { name: /send/i });

// By placeholder
screen.getByPlaceholderText('Type here...');

// Query (returns null if not found)
screen.queryByText('Not found');

// Find (async)
await screen.findByText('Async content');
```

## Best Practices

### 1. Test User Behavior, Not Implementation

```tsx
// Good: Test what users see and do
it('sends message when button is clicked', async () => {
  const handleSend = vi.fn();
  render(() => <Composer onSend={handleSend} />);

  await userEvent.type(screen.getByRole('textbox'), 'Hello');
  await userEvent.click(screen.getByRole('button'));

  expect(handleSend).toHaveBeenCalled();
});

// Bad: Test internal state
it('updates state when typing', () => {
  // Testing component internals
});
```

### 2. Use Accessible Queries

```tsx
// Preferred order:
// 1. getByRole
screen.getByRole('button', { name: /send/i });

// 2. getByLabelText
screen.getByLabelText('Email');

// 3. getByPlaceholderText
screen.getByPlaceholderText('Type here...');

// 4. getByText (as last resort)
screen.getByText('Submit');
```

### 3. Clean Up After Tests

Cleanup is automatic via the setup file, but be aware:

```tsx
afterEach(() => {
  cleanup(); // Automatically called
  vi.restoreAllMocks(); // Restore mocks
});
```

### 4. Mock External Dependencies

```tsx
import { vi, beforeEach } from 'vitest';

beforeEach(() => {
  global.fetch = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
});
```

### 5. Test Edge Cases

```tsx
describe('Composer', () => {
  it('handles empty input');
  it('handles whitespace-only input');
  it('handles maximum length');
  it('handles disabled state');
  it('prevents double submission');
});
```

### 6. Use Descriptive Test Names

```tsx
// Good
it('disables send button when input is empty');
it('shows error message when API call fails');

// Bad
it('works');
it('test send');
```

### 7. Organize with describe blocks

```tsx
describe('Message', () => {
  describe('rendering', () => {
    it('renders content');
    it('renders timestamp');
  });

  describe('roles', () => {
    it('displays user role correctly');
    it('displays assistant role correctly');
  });

  describe('tool results', () => {
    it('renders tool results when present');
    it('handles multiple tool results');
  });
});
```

## Coverage Goals

Aim for:
- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

Check coverage with:

```bash
npm run test:coverage
```

## Continuous Integration

Tests run automatically on:
- Pull requests
- Commits to main branch
- Before releases

Ensure all tests pass before submitting PRs.

## Debugging Tests

### Run a single test

```bash
npm test -- --grep "specific test name"
```

### Use test.only

```tsx
it.only('runs only this test', () => {
  // ...
});
```

### Add debug output

```tsx
import { screen } from '@solidjs/testing-library';

it('debugs component', () => {
  const { debug } = render(() => <YourComponent />);
  debug(); // Prints current DOM
});
```

### Inspect queries

```tsx
screen.logTestingPlaygroundURL(); // Get debugging URL
```

## Common Issues

### Issue: Component not found

```tsx
// Use query instead of get for optional elements
expect(screen.queryByText('Optional')).not.toBeInTheDocument();
```

### Issue: Async updates not reflected

```tsx
// Use waitFor for async updates
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});
```

### Issue: User events not working

```tsx
// Always await user events
await userEvent.click(button);
await userEvent.type(input, 'text');
```

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [SolidJS Testing Library](https://github.com/solidjs/solid-testing-library)
- [User Event Documentation](https://testing-library.com/docs/user-event/intro/)
