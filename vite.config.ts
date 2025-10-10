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
      name: 'AgUiSolid',
      fileName: 'index',
      formats: ['es']
    },
    rollupOptions: {
      external: ['solid-js', 'solid-js/web', 'solid-js/store', '@kobalte/core', 'lucide-solid'],
      output: {
        globals: {
          'solid-js': 'SolidJS',
          '@kobalte/core': 'KobalteCore',
          'lucide-solid': 'LucideSolid'
        }
      }
    }
  }
});
