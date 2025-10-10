import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  build: {
    lib: {
      entry: './src/index.tsx',
      name: 'AgUiSolid',
      fileName: 'index',
      formats: ['es']
    },
    rollupOptions: {
      external: ['solid-js', 'solid-js/web', 'solid-js/store'],
      output: {
        globals: {
          'solid-js': 'SolidJS'
        }
      }
    }
  }
});
