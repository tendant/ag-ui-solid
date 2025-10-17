import type { TranslationDict } from '../types';
import { en } from './en';
import { zh } from './zh';

export const translations: Record<string, TranslationDict> = {
  en,
  zh,
};

export { en, zh };
