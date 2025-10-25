import { EventType } from '@ag-ui/core';
import type { Message, ToolResult } from '../types';

/**
 * AG UI Protocol Event Parser
 *
 * Utilities for parsing and handling AG UI protocol events from Server-Sent Events (SSE).
 * Reference: https://docs.ag-ui.com/concepts/events
 */

export interface AGUIEvent {
  type: EventType;
  timestamp?: number;
  rawEvent?: any;
  [key: string]: any;
}

/**
 * Parse Server-Sent Events (SSE) data into AG UI events
 *
 * SSE format:
 * data: {"type":"RUN_STARTED","threadId":"t1","runId":"r1"}
 *
 * data: {"type":"TEXT_MESSAGE_CONTENT","messageId":"m1","delta":"Hello"}
 *
 */
export function parseSSE(sseData: string): AGUIEvent[] {
  const events: AGUIEvent[] = [];
  const lines = sseData.split('\n');

  for (const line of lines) {
    // SSE events start with "data: "
    if (line.startsWith('data: ')) {
      const jsonData = line.slice(6).trim(); // Remove "data: " prefix

      if (jsonData) {
        try {
          const event = JSON.parse(jsonData);

          // Validate it has a type field
          if (event && typeof event.type === 'string') {
            events.push(event as AGUIEvent);
          }
        } catch (error) {
          // Ignore malformed JSON
          console.warn('[AG UI] Failed to parse SSE event:', error);
        }
      }
    }
  }

  return events;
}

/**
 * Parse a single SSE chunk (may be incomplete)
 * Returns parsed events and remaining buffer
 */
export function parseSSEChunk(buffer: string, chunk: string): { events: AGUIEvent[]; buffer: string } {
  const combined = buffer + chunk;
  const lines = combined.split('\n');

  // Keep the last line as buffer if it doesn't end with newline
  const hasTrailingNewline = combined.endsWith('\n');
  const newBuffer = hasTrailingNewline ? '' : (lines.pop() || '');

  const events: AGUIEvent[] = [];

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const jsonData = line.slice(6).trim();

      if (jsonData) {
        try {
          const event = JSON.parse(jsonData);
          if (event && typeof event.type === 'string') {
            events.push(event as AGUIEvent);
          }
        } catch (error) {
          console.warn('[AG UI] Failed to parse SSE event:', error);
        }
      }
    }
  }

  return { events, buffer: newBuffer };
}

/**
 * Validate an AG UI event has required fields
 */
export function validateEvent(event: any): event is AGUIEvent {
  return event && typeof event.type === 'string' && Object.values(EventType).includes(event.type);
}

/**
 * Message accumulator for tracking streaming message construction
 */
export class MessageAccumulator {
  private messages: Map<string, Partial<Message>> = new Map();

  /**
   * Handle a message-related event
   */
  handleEvent(event: AGUIEvent): Partial<Message> | null {
    switch (event.type) {
      case EventType.TEXT_MESSAGE_START:
        return this.handleStart(event);

      case EventType.TEXT_MESSAGE_CONTENT:
        return this.handleContent(event);

      case EventType.TEXT_MESSAGE_END:
        return this.handleEnd(event);

      case EventType.TEXT_MESSAGE_CHUNK:
        return this.handleChunk(event);

      default:
        return null;
    }
  }

  private handleStart(event: AGUIEvent): Partial<Message> {
    const message: Partial<Message> = {
      id: event.messageId,
      role: event.role || 'assistant',
      content: '',
      timestamp: new Date(event.timestamp || Date.now()),
      toolResults: []
    };

    this.messages.set(event.messageId, message);
    return message;
  }

  private handleContent(event: AGUIEvent): Partial<Message> | null {
    const message = this.messages.get(event.messageId);

    if (message) {
      message.content = (message.content || '') + event.delta;
      return message;
    }

    return null;
  }

  private handleEnd(event: AGUIEvent): Partial<Message> | null {
    const message = this.messages.get(event.messageId);

    if (message) {
      // Mark as complete
      return message;
    }

    return null;
  }

  private handleChunk(event: AGUIEvent): Partial<Message> {
    const messageId = event.messageId || crypto.randomUUID();
    let message = this.messages.get(messageId);

    if (!message) {
      message = {
        id: messageId,
        role: event.role || 'assistant',
        content: '',
        timestamp: new Date(event.timestamp || Date.now()),
        toolResults: []
      };
      this.messages.set(messageId, message);
    }

    if (event.delta) {
      message.content = (message.content || '') + event.delta;
    }

    return message;
  }

  /**
   * Get a message by ID
   */
  getMessage(messageId: string): Partial<Message> | undefined {
    return this.messages.get(messageId);
  }

  /**
   * Add a tool result to a message
   */
  addToolResult(messageId: string, toolResult: ToolResult): void {
    const message = this.messages.get(messageId);
    if (message) {
      if (!message.toolResults) {
        message.toolResults = [];
      }
      message.toolResults.push(toolResult);
    }
  }
}

/**
 * Tool call accumulator for tracking tool execution
 */
export class ToolCallAccumulator {
  private toolCalls: Map<string, Partial<ToolResult>> = new Map();

  /**
   * Handle a tool-related event
   */
  handleEvent(event: AGUIEvent): Partial<ToolResult> | null {
    switch (event.type) {
      case EventType.TOOL_CALL_START:
        return this.handleStart(event);

      case EventType.TOOL_CALL_ARGS:
        return this.handleArgs(event);

      case EventType.TOOL_CALL_END:
        return this.handleEnd(event);

      case EventType.TOOL_CALL_RESULT:
        return this.handleResult(event);

      default:
        return null;
    }
  }

  private handleStart(event: AGUIEvent): Partial<ToolResult> {
    const toolCall: Partial<ToolResult> = {
      id: event.toolCallId,
      toolName: event.toolCallName,
      input: {},
      output: '',
      status: 'pending',
      timestamp: new Date(event.timestamp || Date.now())
    };

    this.toolCalls.set(event.toolCallId, toolCall);
    return toolCall;
  }

  private handleArgs(event: AGUIEvent): Partial<ToolResult> | null {
    const toolCall = this.toolCalls.get(event.toolCallId);

    if (toolCall) {
      try {
        // Accumulate JSON args (may come in chunks)
        const currentArgs = toolCall.input || {};
        const newArgs = JSON.parse(event.args);
        toolCall.input = { ...currentArgs, ...newArgs };
      } catch (error) {
        // If JSON is incomplete, store as string temporarily
        console.warn('[AG UI] Failed to parse tool args:', error);
      }

      return toolCall;
    }

    return null;
  }

  private handleEnd(event: AGUIEvent): Partial<ToolResult> | null {
    const toolCall = this.toolCalls.get(event.toolCallId);
    return toolCall || null;
  }

  private handleResult(event: AGUIEvent): Partial<ToolResult> | null {
    const toolCall = this.toolCalls.get(event.toolCallId);

    if (toolCall) {
      toolCall.output = event.result;
      toolCall.status = event.status || 'success';
      return toolCall;
    }

    return null;
  }

  /**
   * Get a tool call by ID
   */
  getToolCall(toolCallId: string): Partial<ToolResult> | undefined {
    return this.toolCalls.get(toolCallId);
  }

  /**
   * Get parent message ID for a tool call (from event)
   */
  getParentMessageId(event: AGUIEvent): string | undefined {
    return event.parentMessageId;
  }
}

/**
 * Apply JSON Patch (RFC 6902) delta to state
 */
export function applyStateDelta(state: any, delta: Array<{
  op: 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test';
  path: string;
  value?: any;
  from?: string;
}>): any {
  const newState = JSON.parse(JSON.stringify(state)); // Deep clone

  for (const operation of delta) {
    const pathParts = operation.path.split('/').filter(p => p !== '');

    switch (operation.op) {
      case 'replace':
      case 'add': {
        let current = newState;
        for (let i = 0; i < pathParts.length - 1; i++) {
          const part = pathParts[i];
          if (!(part in current)) {
            current[part] = {};
          }
          current = current[part];
        }
        const lastPart = pathParts[pathParts.length - 1];
        current[lastPart] = operation.value;
        break;
      }

      case 'remove': {
        let current = newState;
        for (let i = 0; i < pathParts.length - 1; i++) {
          current = current[pathParts[i]];
        }
        const lastPart = pathParts[pathParts.length - 1];
        delete current[lastPart];
        break;
      }

      // TODO: Implement move, copy, test operations if needed
      default:
        console.warn('[AG UI] Unsupported JSON Patch operation:', operation.op);
    }
  }

  return newState;
}

/**
 * Validate event sequence follows AG UI protocol
 */
export function validateEventSequence(events: AGUIEvent[]): boolean {
  if (events.length === 0) return true;

  // First event must be RUN_STARTED
  if (events[0].type !== EventType.RUN_STARTED) {
    throw new Error('Missing RUN_STARTED');
  }

  // Last event must be RUN_FINISHED or RUN_ERROR
  const lastEvent = events[events.length - 1];
  if (lastEvent.type !== EventType.RUN_FINISHED && lastEvent.type !== EventType.RUN_ERROR) {
    throw new Error('Missing RUN_FINISHED or RUN_ERROR');
  }

  return true;
}

/**
 * Accumulate a complete message from events
 */
export function accumulateMessage(events: AGUIEvent[]): Message {
  const accumulator = new MessageAccumulator();
  let message: Partial<Message> | null = null;

  for (const event of events) {
    const result = accumulator.handleEvent(event);
    if (result) {
      message = result;
    }
  }

  if (!message || !message.id || !message.role || message.content === undefined) {
    throw new Error('Invalid message events');
  }

  return message as Message;
}

/**
 * Accumulate a complete tool call from events
 */
export function accumulateToolCall(events: AGUIEvent[]): ToolResult {
  const accumulator = new ToolCallAccumulator();
  let toolCall: Partial<ToolResult> | null = null;

  for (const event of events) {
    const result = accumulator.handleEvent(event);
    if (result) {
      toolCall = result;
    }
  }

  if (!toolCall || !toolCall.id || !toolCall.toolName) {
    throw new Error('Invalid tool call events');
  }

  return toolCall as ToolResult;
}
