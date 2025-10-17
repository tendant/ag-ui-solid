// Components
export { ChatContainer } from './components/ChatContainer';
export type { ChatContainerProps } from './components/ChatContainer';

export { Message } from './components/Message';
export type { MessageProps } from './components/Message';

export { Composer } from './components/Composer';
export type { ComposerProps } from './components/Composer';

export { ToolResult } from './components/ToolResult';
export type { ToolResultProps } from './components/ToolResult';

// Hooks
export { useChatStream } from './hooks/useChatStream';
export type { UseChatStreamOptions } from './hooks/useChatStream';

// Types
export type {
  Message as MessageType,
  ToolResult as ToolResultType,
  ChatStreamState,
  ChatStreamActions
} from './types';

// I18n
export { I18nProvider, useI18n } from './i18n';
export type { I18nProviderProps, SupportedLocale, TranslationDict } from './i18n';
export { translations, en, zh } from './i18n';

// Styles
import './styles.css';
