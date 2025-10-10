import { describe, it, expect } from 'vitest';
import { screen } from '@solidjs/testing-library';
import { ToolResult } from './ToolResult';
import { render, createMockToolResult } from '../test/utils';

describe('ToolResult', () => {
  it('renders tool name and status', () => {
    const toolResult = createMockToolResult({
      toolName: 'search-tool',
      status: 'success'
    });

    const { container } = render(() => <ToolResult toolResult={toolResult} />);

    expect(screen.getByText('search-tool')).toBeInTheDocument();
    // Check for SVG icon (lucide icon)
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('displays success status with correct styling', () => {
    const toolResult = createMockToolResult({ status: 'success' });
    const { container } = render(() => <ToolResult toolResult={toolResult} />);

    const wrapper = container.querySelector('div');
    expect(wrapper?.className).toContain('bg-green-50');
  });

  it('displays error status with correct styling', () => {
    const toolResult = createMockToolResult({ status: 'error' });
    const { container } = render(() => <ToolResult toolResult={toolResult} />);

    const wrapper = container.querySelector('div');
    expect(wrapper?.className).toContain('bg-red-50');
    // Check for SVG icon (lucide icon)
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('displays pending status with correct styling', () => {
    const toolResult = createMockToolResult({ status: 'pending' });
    const { container } = render(() => <ToolResult toolResult={toolResult} />);

    const wrapper = container.querySelector('div');
    expect(wrapper?.className).toContain('bg-yellow-50');
    // Check for SVG icon (lucide icon with animation)
    const icon = container.querySelector('svg.animate-spin');
    expect(icon).toBeInTheDocument();
  });

  it('renders input when provided', () => {
    const toolResult = createMockToolResult({
      input: { query: 'test query', limit: 10 }
    });

    render(() => <ToolResult toolResult={toolResult} />);

    expect(screen.getByText('Input:')).toBeInTheDocument();
    expect(screen.getByText(/"query": "test query"/)).toBeInTheDocument();
  });

  it('renders output when provided', () => {
    const toolResult = createMockToolResult({
      output: 'Search results: 5 items found'
    });

    render(() => <ToolResult toolResult={toolResult} />);

    expect(screen.getByText('Output:')).toBeInTheDocument();
    expect(screen.getByText('Search results: 5 items found')).toBeInTheDocument();
  });

  it('does not render input section when input is empty', () => {
    const toolResult = createMockToolResult({
      input: {}
    });

    render(() => <ToolResult toolResult={toolResult} />);

    expect(screen.queryByText('Input:')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const toolResult = createMockToolResult();
    const { container } = render(() =>
      <ToolResult toolResult={toolResult} class="custom-class" />
    );

    const wrapper = container.querySelector('div');
    expect(wrapper?.className).toContain('custom-class');
  });

  it('displays timestamp in correct format', () => {
    const timestamp = new Date('2024-01-15T10:30:00');
    const toolResult = createMockToolResult({ timestamp });

    render(() => <ToolResult toolResult={toolResult} />);

    expect(screen.getByText(timestamp.toLocaleTimeString())).toBeInTheDocument();
  });
});
