import { Component, For, Show, createMemo } from 'solid-js';
import { marked } from 'marked';
import { User, Bot, Settings } from 'lucide-solid';
import type { Message as MessageType } from '../types';
import { ToolResult } from './ToolResult';

// Configure marked for safe rendering
marked.setOptions({
  breaks: true,
  gfm: true,
});

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
    const iconProps = { size: 14, class: "inline-block" };
    switch (props.message.role) {
      case 'user':
        return <User {...iconProps} />;
      case 'assistant':
        return <Bot {...iconProps} />;
      case 'system':
        return <Settings {...iconProps} />;
      default:
        return <span>•</span>;
    }
  };

  // Clean message content by removing tool call data and debug artifacts
  const cleanContent = (content: string): string => {
    // Remove tool call sections (lines starting with tool names followed by JSON)
    let cleaned = content.replace(/\n?\/?\w+_\w+\s*\n?Input:[\s\S]*?Output:[\s\S]*?(\n\n|$)/g, '');

    // Remove AgentRunResult wrapper
    cleaned = cleaned.replace(/AgentRunResult\(output="(.+)"\)/s, '$1');
    cleaned = cleaned.replace(/AgentRunResult\(output='(.+)'\)/s, '$1');

    // Remove tool call JSON blocks
    cleaned = cleaned.replace(/\{"symbol":[^}]+\}/g, '');
    cleaned = cleaned.replace(/\{[^}]*"tool_name"[^}]*\}/g, '');

    // Unescape quotes
    cleaned = cleaned.replace(/\\"/g, '"');
    cleaned = cleaned.replace(/\\'/g, "'");

    // Remove multiple newlines
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

    return cleaned.trim();
  };

  // Render markdown content
  const markdownHtml = createMemo(() => {
    const cleaned = cleanContent(props.message.content);
    return marked(cleaned) as string;
  });

  return (
    <div class={`flex flex-col gap-2 ${props.class || ''}`}>
      <div class={`flex ${props.message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
        <div class={`rounded-lg px-4 py-3 max-w-[80%] ${getRoleStyles()}`}>
          <div class="flex items-center gap-2 mb-1">
            <div class="flex items-center">{getRoleIcon()}</div>
            <span class="text-xs font-semibold capitalize opacity-90">
              {props.message.role}
            </span>
            <span class="text-xs opacity-75 ml-auto">
              {props.message.timestamp.toLocaleTimeString()}
            </span>
          </div>
          <div
            class="text-sm break-words prose prose-sm max-w-none"
            innerHTML={markdownHtml()}
          />
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
