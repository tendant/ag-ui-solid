import { Component, Show } from 'solid-js';
import { CheckCircle, XCircle, Loader, Circle } from 'lucide-solid';
import type { ToolResult as ToolResultType } from '../types';

export interface ToolResultProps {
  toolResult: ToolResultType;
  class?: string;
}

export const ToolResult: Component<ToolResultProps> = (props) => {
  const getStatusColor = () => {
    switch (props.toolResult.status) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'pending':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getStatusIcon = () => {
    const iconProps = { size: 18, class: "inline-block" };
    switch (props.toolResult.status) {
      case 'success':
        return <CheckCircle {...iconProps} />;
      case 'error':
        return <XCircle {...iconProps} />;
      case 'pending':
        return <Loader {...iconProps} class="inline-block animate-spin" />;
      default:
        return <Circle {...iconProps} />;
    }
  };

  return (
    <div
      class={`rounded-lg border p-4 mt-2 ${getStatusColor()} ${props.class || ''}`}
    >
      <div class="flex items-start justify-between mb-2">
        <div class="flex items-center gap-2">
          <div class="flex items-center">{getStatusIcon()}</div>
          <span class="font-mono text-sm font-medium">{props.toolResult.toolName}</span>
        </div>
        <span class="text-xs opacity-75">
          {props.toolResult.timestamp.toLocaleTimeString()}
        </span>
      </div>

      <Show when={Object.keys(props.toolResult.input).length > 0}>
        <div class="mb-3">
          <div class="text-xs font-semibold mb-1 opacity-75">Input:</div>
          <pre class="text-xs bg-white bg-opacity-50 rounded p-2 overflow-x-auto">
            {JSON.stringify(props.toolResult.input, null, 2)}
          </pre>
        </div>
      </Show>

      <Show when={props.toolResult.output}>
        <div>
          <div class="text-xs font-semibold mb-1 opacity-75">Output:</div>
          <pre class="text-xs bg-white bg-opacity-50 rounded p-2 overflow-x-auto whitespace-pre-wrap break-words">
            {props.toolResult.output}
          </pre>
        </div>
      </Show>
    </div>
  );
};
