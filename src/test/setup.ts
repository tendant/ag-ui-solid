import '@testing-library/jest-dom';
import { expect, afterEach, beforeAll } from 'vitest';
import { cleanup } from '@solidjs/testing-library';

// Mock DOM methods that aren't available in jsdom
beforeAll(() => {
  Element.prototype.scrollIntoView = () => {};
});

// Extend Vitest's expect with jest-dom matchers
afterEach(() => {
  cleanup();
});
