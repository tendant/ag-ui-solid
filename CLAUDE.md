# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ag-ui-solid is a SolidJS component library for building AI chat interfaces with TailwindCSS, Kobalte, and lucide-solid. It provides pre-built, accessible components (ChatContainer, Message, Composer, ToolResult) and a state management hook (useChatStream) for creating chat applications.

### Key Technologies
- **SolidJS**: Reactive UI library
- **TailwindCSS**: Utility-first CSS framework
- **Kobalte**: Accessible component primitives for SolidJS
- **lucide-solid**: Icon library with 1000+ icons

## Build and Development Commands

### Development
```bash
npm run dev                 # Start Vite dev server with example app
npm run build:watch         # Build library in watch mode for active development
npm run dev:watch           # Helper script for development workflow
```

### Building
```bash
npm run build              # TypeScript compilation + Vite build (outputs to dist/)
```

### Testing
```bash
npm test                   # Run tests with Vitest
npm run test:ui            # Run tests with Vitest UI
npm run test:coverage      # Run tests with coverage report
npm test -- --watch        # Run tests in watch mode
```

### Local Development
```bash
npm run link:local         # Link library for local use (runs ./scripts/link-local.sh)
npm run unlink:local       # Unlink library (runs ./scripts/unlink-local.sh)
```

For using this library in other apps without publishing to npm, use `npm link` workflow:
```bash
# In ag-ui-solid directory
npm run build
npm link

# In consuming app
npm link ag-ui-solid
```

## Architecture

### Library Structure
- **src/components/**: Self-contained UI components with co-located tests
  - ChatContainer: Main container combining messages + composer
  - Message: Single message display with role-based styling, uses lucide icons (User, Bot, Settings)
  - Composer: Text input built with Kobalte TextField, uses lucide Send icon, includes keyboard shortcuts
  - ToolResult: AI tool execution result display, uses lucide status icons (CheckCircle, XCircle, Loader, Circle)

- **src/hooks/**: State management and side effects
  - useChatStream: Hook for managing chat state and API streaming

- **src/types.ts**: Centralized TypeScript type definitions (Message, ToolResult, ChatStreamState, ChatStreamActions)

- **src/index.tsx**: Library entry point - exports all components, hooks, and types

### Build Configuration
- **vite.config.ts**: Library build config (ES module output, externalizes solid-js, @kobalte/core, lucide-solid)
- **vitest.config.ts**: Test configuration (jsdom environment, coverage setup)
- Library builds to ES module format only (consumers need modern bundlers)
- Peer dependencies (must be provided by consuming app):
  - solid-js ^1.8.0
  - @kobalte/core ^0.13.0
  - lucide-solid ^0.545.0

### Component Architecture
Components follow SolidJS patterns:
- Use signals and effects for reactivity
- Props are accessed as functions (e.g., `props.messages()`)
- Built with Kobalte primitives for accessibility (ARIA attributes, keyboard navigation)
- Icons from lucide-solid for consistent visual design
- Tests use @solidjs/testing-library
- All components styled with TailwindCSS utility classes

### State Management
useChatStream hook returns `[state, actions]`:
- State: messages, isStreaming, error
- Actions: sendMessage, addMessage, clearMessages, setError
- Communicates with backend via POST to configurable apiEndpoint
- Handles streaming responses and JSON responses with toolResults

## Testing Strategy

- Tests live next to components (*.test.tsx)
- Test setup in src/test/setup.ts
- Uses Vitest + @solidjs/testing-library + jsdom
- Coverage excludes: node_modules/, src/test/, src/example/, config files, dist/
- Run specific test: `npm test -- Message.test.tsx`

## Key Implementation Details

### Backend Integration
The library expects backends to:
1. Accept POST requests with messages array
2. Return either streaming text or JSON with `{content, toolResults?}`
3. See examples/backend-express/ for reference implementation

### Export Strategy
src/index.tsx exports:
- All components with their Props types
- useChatStream hook with its types
- Core types (MessageType, ToolResultType, ChatStreamState, ChatStreamActions)
- Styles are auto-imported

### Build Output
The dist/ folder (git-ignored) contains:
- index.js: Compiled library code
- index.d.ts: TypeScript type definitions
- styles.css: Bundled styles (includes Tailwind utilities used by components)

## Important Files

- **package.json**: Scripts, peer dependencies (solid-js, @kobalte/core, lucide-solid)
- **tsconfig.json**: TypeScript configuration for library build
- **tailwind.config.js**: TailwindCSS configuration
- **PROJECT_STRUCTURE.md**: Detailed architecture documentation
- **TESTING.md**: Comprehensive testing guide
- **LOCAL_DEVELOPMENT.md**: Guide for using library locally without npm publish

## Common Workflows

### Adding a New Component
1. Create component file in src/components/ (e.g., NewComponent.tsx)
2. Create test file (NewComponent.test.tsx)
3. Export from src/index.tsx
4. Add to PROJECT_STRUCTURE.md documentation
5. Run tests: `npm test`
6. Build: `npm run build`

### Modifying Existing Components
1. Make changes to component source
2. Update corresponding test file
3. Run tests: `npm test`
4. Test in example app: `npm run dev`
5. Build and verify: `npm run build`

### Working with Consuming Apps
For active development on both library and consuming app:
```bash
# Terminal 1: Library (auto-rebuild on changes)
npm run build:watch

# Terminal 2: Consuming app
npm link ag-ui-solid
npm run dev
```

### Before Publishing
1. Run full test suite: `npm test`
2. Run coverage check: `npm run test:coverage`
3. Build library: `npm run build`
4. Test in example app: `npm run dev`
5. Verify dist/ output is correct
