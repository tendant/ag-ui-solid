# AG UI Solid - Vite + SolidJS Example

This is a complete example of integrating ag-ui-solid into a Vite + SolidJS application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open http://localhost:3000 in your browser

## Features Demonstrated

- Basic chat interface setup
- API configuration handling
- Message state management
- Error handling
- Clear chat functionality
- Responsive layout
- TailwindCSS integration

## Backend Setup

This example expects a backend API at `/api/chat`. You can:

1. Use the example backend in `examples/backend-express`
2. Configure the proxy in `vite.config.ts` to point to your API
3. Or modify `src/App.tsx` to use a different endpoint

## Building for Production

```bash
npm run build
npm run preview
```
