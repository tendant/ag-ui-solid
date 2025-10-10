import { Component, For, Show } from 'solid-js';
import type { Message as MessageType } from '../types';
import { ToolResult } from './ToolResult';

export interface MessageProps {
  message: MessageType;
  class?: string;
}

export const Message: Component<MessageProps> = (props) => {
  const getRoleStyles = () => {
    switch (props.message.role) {
      case 'user':
        return 'bg-blue-600 text-white ml-auto';
      case 'assistant':
        return 'bg-gray-100 text-gray-900 mr-auto';
      case 'system':
        return 'bg-purple-100 text-purple-900 mx-auto';
      default:
        return 'bg-gray-100 text-gray-900';
    }
  };

  const getRoleIcon = () => {
    switch (props.message.role) {
      case 'user':
        return '👤';
      case 'assistant':
        return '🤖';
      case 'system':
        return '⚙️';
      default:
        return '•';
    }
  };

  return (
    <div class={`flex flex-col gap-2 ${props.class || ''}`}>
      <div class={`flex ${props.message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
        <div class={`rounded-lg px-4 py-3 max-w-[80%] ${getRoleStyles()}`}>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-sm">{getRoleIcon()}</span>
            <span class="text-xs font-semibold capitalize opacity-90">
              {props.message.role}
            </span>
            <span class="text-xs opacity-75 ml-auto">
              {props.message.timestamp.toLocaleTimeString()}
            </span>
          </div>
          <div class="text-sm whitespace-pre-wrap break-words">
            {props.message.content}
          </div>
        </div>
      </div>

      <Show when={props.message.toolResults && props.message.toolResults.length > 0}>
        <div class="ml-4 mr-4">
          <For each={props.message.toolResults}>
            {(toolResult) => <ToolResult toolResult={toolResult} />}
          </For>
        </div>
      </Show>
    </div>
  );
};
