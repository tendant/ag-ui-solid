import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    solidPlugin(),
    dts({
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**/*', 'src/example/**/*'],
      insertTypesEntry: true
    })
  ],
  build: {
    lib: {
      entry: './src/index.tsx',
      name: '@tendant/ag-ui-solid',
      fileName: 'index',
      formats: ['es']
    },
    cssCodeSplit: false, // Keep CSS in a single file
    rollupOptions: {
      external: ['solid-js', 'solid-js/web', 'solid-js/store', '@kobalte/core', 'lucide-solid'],
      output: {
        globals: {
          'solid-js': 'SolidJS',
          '@kobalte/core': 'KobalteCore',
          'lucide-solid': 'LucideSolid'
        },
        // Inject CSS import into the bundle
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'style.css';
          return assetInfo.name || 'assets/[name][extname]';
        }
      }
    }
  }
});
