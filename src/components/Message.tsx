import { Component, For, Show, createMemo } from 'solid-js';
import { marked } from 'marked';
import { User, Bot, Settings } from 'lucide-solid';
import type { Message as MessageType } from '../types';
import { ToolResult } from './ToolResult';
import { useI18n } from '../i18n';

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
  const { t } = useI18n();

  // Debug logging
  console.log('[Message] Rendering message:', props.message.id, 'role:', props.message.role, 'content length:', props.message.content?.length);

  const getRoleStyles = () => {
    switch (props.message.role) {
      case 'user':
        return 'bg-blue-50 text-blue-600 ml-auto';
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

    // Unescape quotes and escape sequences
    cleaned = cleaned.replace(/\\"/g, '"');
    cleaned = cleaned.replace(/\\'/g, "'");
    cleaned = cleaned.replace(/\\n/g, '\n');
    cleaned = cleaned.replace(/\\t/g, '\t');
    cleaned = cleaned.replace(/\\r/g, '\r');

    // Remove multiple newlines
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

    return cleaned.trim();
  };

  // Track content changes explicitly for streaming updates
  const content = () => props.message.content;

  // Render markdown content
  const markdownHtml = createMemo(() => {
    const cleaned = cleanContent(content());
    return marked(cleaned) as string;
  });

  return (
    <div class={`flex flex-col gap-2 ${props.class || ''}`}>
      {/* Tool results FIRST */}
      <Show when={props.message.toolResults && props.message.toolResults.length > 0}>
        <div class="ml-4 mr-4">
          <For each={props.message.toolResults}>
            {(toolResult) => <ToolResult toolResult={toolResult} />}
          </For>
        </div>
      </Show>

      {/* Message content SECOND */}
      <div class={`flex ${props.message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
        <div class={`rounded-lg px-4 py-3 max-w-[80%] ${getRoleStyles()}`}>
          <div class="flex items-center gap-2 mb-1">
            <div class="flex items-center">{getRoleIcon()}</div>
            <span class="text-xs font-semibold capitalize opacity-90">
              {t(`message.${props.message.role}` as any, {}, props.message.role)}
            </span>
            <span class="text-xs opacity-75 ml-auto">
              {props.message.timestamp instanceof Date
                ? props.message.timestamp.toLocaleTimeString()
                : new Date(props.message.timestamp).toLocaleTimeString()}
            </span>
          </div>
          <div
            class="text-sm break-words prose prose-sm max-w-none"
            innerHTML={markdownHtml()}
          />
        </div>
      </div>
    </div>
  );
};
