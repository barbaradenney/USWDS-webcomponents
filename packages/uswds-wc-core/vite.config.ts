import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      include: ['src/**/*'],
      exclude: ['src/**/*.test.ts', 'src/**/*.cy.ts'],
      outDir: 'dist',
      insertTypesEntry: true,
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
    dedupe: [
      'lit',
      '@lit/reactive-element',
      'lit-element',
      'lit-html',
      'lit/decorators.js',
      'lit/directive.js',
    ],
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'USWDSWebComponentsCore',
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['lit', '@lit/reactive-element', 'lit-element', 'lit-html', 'lit/decorators.js', 'lit/directive.js', 'lit/directives/unsafe-html.js'],
      output: {
        globals: {
          lit: 'Lit',
          '@lit/reactive-element': 'LitReactiveElement',
        },
        // Preserve directory structure for utilities
        preserveModules: true,
        preserveModulesRoot: 'src',
      },
    },
    sourcemap: true,
    minify: false, // Don't minify library builds
    outDir: 'dist',
    emptyOutDir: true,
  },
});
