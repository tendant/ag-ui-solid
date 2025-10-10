export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  toolResults?: ToolResult[];
}

export interface ToolResult {
  id: string;
  toolName: string;
  input: Record<string, unknown>;
  output: string;
  status: 'success' | 'error' | 'pending';
  timestamp: Date;
}

export interface ChatStreamState {
  messages: Message[];
  isStreaming: boolean;
  error: string | null;
}

export interface ChatStreamActions {
  sendMessage: (content: string) => Promise<void>;
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  setError: (error: string | null) => void;
}

export type UseChatStreamReturn = [
  ChatStreamState,
  ChatStreamActions
];
