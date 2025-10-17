import { Component, Show, createSignal } from 'solid-js';
import { CheckCircle, XCircle, Loader, Circle, ChevronDown, ChevronUp } from 'lucide-solid';
import type { ToolResult as ToolResultType } from '../types';
import { useI18n } from '../i18n';

export interface ToolResultProps {
  toolResult: ToolResultType;
  class?: string;
  defaultExpanded?: boolean;
}

export const ToolResult: Component<ToolResultProps> = (props) => {
  const { t } = useI18n();
  const [isExpanded, setIsExpanded] = createSignal(props.defaultExpanded ?? false);

  // Convert escaped characters to actual characters for proper display
  const formatOutput = (output: string) => {
    return output
      .replace(/\\n/g, '\n')    // Convert \n to newlines
      .replace(/\\t/g, '\t')    // Convert \t to tabs
      .replace(/\\r/g, '\r');   // Convert \r to carriage returns
  };

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
      class={`rounded-lg border p-3 mt-2 ${getStatusColor()} ${props.class || ''}`}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded())}
        class="flex items-start justify-between w-full text-left hover:opacity-80 transition-opacity"
      >
        <div class="flex items-center gap-2">
          <div class="flex items-center">{getStatusIcon()}</div>
          <span class="font-mono text-sm font-medium">{props.toolResult.toolName}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs opacity-75">
            {props.toolResult.timestamp.toLocaleTimeString()}
          </span>
          {isExpanded() ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      <Show when={isExpanded()}>
        <div class="mt-3 pt-3 border-t border-current border-opacity-20">
          <Show when={Object.keys(props.toolResult.input).length > 0}>
            <div class="mb-3">
              <div class="text-xs font-semibold mb-1 opacity-75">{t('toolResult.input')}:</div>
              <pre class="text-xs bg-white bg-opacity-50 rounded p-2 overflow-x-auto">
                {JSON.stringify(props.toolResult.input, null, 2)}
              </pre>
            </div>
          </Show>

          <Show when={props.toolResult.output}>
            <div>
              <div class="text-xs font-semibold mb-1 opacity-75">{t('toolResult.output')}:</div>
              <pre class="text-xs bg-white bg-opacity-50 rounded p-2 overflow-x-auto whitespace-pre-wrap break-words">
                {formatOutput(props.toolResult.output)}
              </pre>
            </div>
          </Show>
        </div>
      </Show>
    </div>
  );
};
