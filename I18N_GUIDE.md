# Internationalization (i18n) Guide

This guide explains how to use the internationalization features in ag-ui-solid.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Supported Languages](#supported-languages)
- [Basic Usage](#basic-usage)
- [Advanced Usage](#advanced-usage)
- [Adding New Languages](#adding-new-languages)
- [Custom Translations](#custom-translations)
- [API Reference](#api-reference)

## Overview

ag-ui-solid comes with built-in internationalization support powered by `@solid-primitives/i18n`. All UI text in the components can be translated to different languages.

### Built-in Languages

- **English (en)** - Default
- **Chinese (zh)** - Simplified Chinese

## Quick Start

### 1. Wrap Your App with I18nProvider

```tsx
import { I18nProvider } from 'ag-ui-solid';

function App() {
  return (
    <I18nProvider locale="en">
      {/* Your app components */}
    </I18nProvider>
  );
}
```

### 2. Use Components as Normal

All components will automatically use the current locale:

```tsx
import { ChatContainer, useChatStream } from 'ag-ui-solid';

function ChatApp() {
  const [state, actions] = useChatStream({
    apiEndpoint: '/api/chat'
  });

  return (
    <ChatContainer
      messages={state.messages}
      onSendMessage={actions.sendMessage}
      isStreaming={state.isStreaming}
    />
  );
}
```

## Supported Languages

Currently supported languages and their codes:

| Language | Code | Translation Status |
|----------|------|-------------------|
| English  | `en` | ✅ Complete       |
| Chinese  | `zh` | ✅ Complete       |

Additional languages can be easily added (see [Adding New Languages](#adding-new-languages)).

## Basic Usage

### Setting the Default Language

```tsx
import { I18nProvider } from 'ag-ui-solid';

// Use English
<I18nProvider locale="en">
  <App />
</I18nProvider>

// Use Chinese
<I18nProvider locale="zh">
  <App />
</I18nProvider>
```

### Switching Languages Dynamically

```tsx
import { I18nProvider, useI18n } from 'ag-ui-solid';

function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <div>
      <button onClick={() => setLocale('en')}>
        English
      </button>
      <button onClick={() => setLocale('zh')}>
        中文
      </button>
      <p>Current language: {locale()}</p>
    </div>
  );
}

function App() {
  return (
    <I18nProvider locale="en">
      <LanguageSwitcher />
      {/* Other components */}
    </I18nProvider>
  );
}
```

### Using Translation Function in Custom Components

```tsx
import { useI18n } from 'ag-ui-solid';

function CustomComponent() {
  const { t } = useI18n();

  return (
    <div>
      <h1>{t('composer.placeholder')}</h1>
      <button>{t('composer.send')}</button>
    </div>
  );
}
```

## Advanced Usage

### Detecting User's Language

```tsx
import { I18nProvider, type SupportedLocale } from 'ag-ui-solid';

function App() {
  // Detect browser language
  const browserLang = navigator.language.split('-')[0];
  const defaultLocale: SupportedLocale =
    browserLang === 'zh' ? 'zh' : 'en';

  return (
    <I18nProvider locale={defaultLocale}>
      {/* Your app */}
    </I18nProvider>
  );
}
```

### Persisting Language Preference

```tsx
import { createSignal, onMount } from 'solid-js';
import { I18nProvider, type SupportedLocale } from 'ag-ui-solid';

function App() {
  const [locale, setLocale] = createSignal<SupportedLocale>('en');

  onMount(() => {
    // Load from localStorage
    const saved = localStorage.getItem('language') as SupportedLocale;
    if (saved) {
      setLocale(saved);
    }
  });

  const handleLocaleChange = (newLocale: SupportedLocale) => {
    setLocale(newLocale);
    localStorage.setItem('language', newLocale);
  };

  return (
    <I18nProvider locale={locale()}>
      <LanguageSwitcher onLocaleChange={handleLocaleChange} />
      {/* Other components */}
    </I18nProvider>
  );
}
```

## Adding New Languages

### 1. Create Translation File

Create a new file in `src/i18n/locales/` (e.g., `es.ts` for Spanish):

```typescript
import type { TranslationDict } from '../types';

export const es: TranslationDict = {
  composer: {
    placeholder: 'Escribe un mensaje...',
    send: 'Enviar',
    sending: 'Enviando...',
  },
  message: {
    user: 'Usuario',
    assistant: 'Asistente',
    system: 'Sistema',
    error: 'Error',
  },
  toolResult: {
    success: 'Éxito',
    error: 'Error',
    pending: 'Pendiente',
    input: 'Entrada',
    output: 'Salida',
  },
  chat: {
    errorOccurred: 'Ocurrió un error',
    retry: 'Reintentar',
    typing: 'Escribiendo...',
    noMessages: '¡No hay mensajes aún. Inicia una conversación!',
  },
};
```

### 2. Update Locale Types

Update `src/i18n/types.ts`:

```typescript
export type SupportedLocale = 'en' | 'zh' | 'es'; // Add 'es'
```

### 3. Export Translation

Update `src/i18n/locales/index.ts`:

```typescript
import { es } from './es';

export const translations: Record<string, TranslationDict> = {
  en,
  zh,
  es, // Add Spanish
};

export { en, zh, es };
```

### 4. Export from Main Index

Update `src/index.tsx`:

```typescript
export { translations, en, zh, es } from './i18n';
```

## Custom Translations

You can provide your own translations or override existing ones:

```tsx
import { I18nProvider, type TranslationDict } from 'ag-ui-solid';

const customTranslations: Record<string, TranslationDict> = {
  en: {
    composer: {
      placeholder: 'What would you like to know?',
      send: 'Ask',
      sending: 'Asking...',
    },
    // ... other translations
  },
};

function App() {
  return (
    <I18nProvider
      locale="en"
      translations={customTranslations}
    >
      {/* Your app */}
    </I18nProvider>
  );
}
```

## API Reference

### I18nProvider

The context provider for internationalization.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `locale` | `SupportedLocale` | `'en'` | The active locale |
| `translations` | `Record<string, TranslationDict>` | Built-in translations | Custom translations dictionary |
| `children` | `JSX.Element` | - | Child components |

### useI18n Hook

Hook to access i18n functionality.

**Returns:**

```typescript
{
  locale: () => SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (key: string, params?: object, fallback?: string) => string;
}
```

**Methods:**

- `locale()` - Get current locale
- `setLocale(locale)` - Change the current locale
- `t(key, params, fallback)` - Translate a key

### Translation Keys

Available translation keys:

```typescript
// Composer
'composer.placeholder'
'composer.send'
'composer.sending'

// Message
'message.user'
'message.assistant'
'message.system'
'message.error'

// Tool Result
'toolResult.success'
'toolResult.error'
'toolResult.pending'
'toolResult.input'
'toolResult.output'

// Chat
'chat.errorOccurred'
'chat.retry'
'chat.typing'
'chat.noMessages'
```

### TypeScript Types

```typescript
import type {
  SupportedLocale,
  TranslationDict,
  I18nProviderProps
} from 'ag-ui-solid';

// Supported locales
type SupportedLocale = 'en' | 'zh';

// Translation dictionary structure
interface TranslationDict {
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
```

## Examples

### Complete Example with Language Switcher

```tsx
import { Component } from 'solid-js';
import {
  I18nProvider,
  useI18n,
  ChatContainer,
  useChatStream
} from 'ag-ui-solid';

const ChatApp: Component = () => {
  const { locale, setLocale } = useI18n();
  const [state, actions] = useChatStream({
    apiEndpoint: '/api/chat'
  });

  return (
    <div class="h-screen flex flex-col">
      <header class="p-4 bg-white border-b">
        <div class="flex justify-between items-center">
          <h1>My Chat App</h1>
          <div class="flex gap-2">
            <button
              onClick={() => setLocale('en')}
              class={locale() === 'en' ? 'font-bold' : ''}
            >
              English
            </button>
            <button
              onClick={() => setLocale('zh')}
              class={locale() === 'zh' ? 'font-bold' : ''}
            >
              中文
            </button>
          </div>
        </div>
      </header>

      <div class="flex-1">
        <ChatContainer
          messages={state.messages}
          onSendMessage={actions.sendMessage}
          isStreaming={state.isStreaming}
          error={state.error}
        />
      </div>
    </div>
  );
};

const App: Component = () => {
  return (
    <I18nProvider locale="en">
      <ChatApp />
    </I18nProvider>
  );
};

export default App;
```

## Best Practices

1. **Always wrap your app with I18nProvider** at the root level
2. **Use the `t()` function** for any user-facing text in custom components
3. **Provide fallback text** when using `t()` for better development experience
4. **Store user language preference** in localStorage for persistence
5. **Detect browser language** for better initial user experience
6. **Test all languages** before deploying to ensure complete translations

## Troubleshooting

### Error: "useI18n must be used within an I18nProvider"

Make sure your component tree is wrapped with `I18nProvider`:

```tsx
// ❌ Wrong
<ChatContainer {...props} />

// ✅ Correct
<I18nProvider locale="en">
  <ChatContainer {...props} />
</I18nProvider>
```

### Missing Translations

If a translation key is missing, the component will fall back to the English translation or the provided fallback text.

### TypeScript Errors with Locale

Make sure you're using the correct `SupportedLocale` type:

```tsx
import type { SupportedLocale } from 'ag-ui-solid';

const locale: SupportedLocale = 'en'; // ✅
const locale: SupportedLocale = 'fr'; // ❌ Type error
```
