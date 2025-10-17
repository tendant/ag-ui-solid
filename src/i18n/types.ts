export type SupportedLocale = 'en' | 'zh' | 'es' | 'fr' | 'de' | 'ja' | 'ko';

export interface TranslationDict {
  composer: {
    placeholder: string;
    send: string;
    sending: string;
  };
  message: {
    user: string;
    assistant: string;
    system: string;
    error: string;
  };
  toolResult: {
    success: string;
    error: string;
    pending: string;
    input: string;
    output: string;
  };
  chat: {
    errorOccurred: string;
    retry: string;
    typing: string;
    noMessages: string;
  };
}

export type TranslationKey = string;
export type TranslationParams = Record<string, string | number>;
