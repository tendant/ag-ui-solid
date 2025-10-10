import { Component, createSignal, Show } from 'solid-js';
import { TextField } from '@kobalte/core/text-field';
import { Send } from 'lucide-solid';

export interface ComposerProps {
  onSend: (message: string) => void;
  isDisabled?: boolean;
  placeholder?: string;
  class?: string;
  maxLength?: number;
}

export const Composer: Component<ComposerProps> = (props) => {
  const [inputValue, setInputValue] = createSignal('');
  const [isFocused, setIsFocused] = createSignal(false);
  let textareaRef: HTMLTextAreaElement | undefined;

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    const message = inputValue().trim();

    if (message && !props.isDisabled) {
      props.onSend(message);
      setInputValue('');
      // Refocus the textarea after sending
      setTimeout(() => {
        textareaRef?.focus();
      }, 0);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const characterCount = () => inputValue().length;
  const isNearLimit = () => props.maxLength ? characterCount() > props.maxLength * 0.9 : false;
  const isOverLimit = () => props.maxLength ? characterCount() > props.maxLength : false;

  return (
    <form
      onSubmit={handleSubmit}
      class={`flex flex-col gap-2 ${props.class || ''}`}
    >
      <TextField
        value={inputValue()}
        onChange={setInputValue}
        disabled={props.isDisabled}
      >
        <div
          class={`flex items-start gap-2 border rounded-lg p-2 transition-colors ${
            isFocused()
              ? 'border-blue-500 ring-2 ring-blue-200'
              : 'border-gray-300'
          } ${props.isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <TextField.TextArea
            ref={textareaRef}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={props.placeholder || 'Type a message...'}
            class="flex-1 resize-none bg-transparent outline-none min-h-[40px] max-h-[200px] text-sm"
            rows={1}
            autoResize
          />
          <button
            type="submit"
            disabled={props.isDisabled || !inputValue().trim() || isOverLimit()}
            class={`px-4 py-2 rounded-md font-medium text-sm transition-colors flex items-center gap-2 ${
              props.isDisabled || !inputValue().trim() || isOverLimit()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
            }`}
          >
            <Show when={props.isDisabled} fallback={
              <>
                <Send size={16} />
                <span>Send</span>
              </>
            }>
              <span class="animate-pulse">...</span>
            </Show>
          </button>
        </div>
      </TextField>

      <Show when={props.maxLength}>
        <div class={`text-xs text-right ${
          isOverLimit()
            ? 'text-red-600 font-semibold'
            : isNearLimit()
            ? 'text-yellow-600'
            : 'text-gray-500'
        }`}>
          {characterCount()} / {props.maxLength}
        </div>
      </Show>
    </form>
  );
};
