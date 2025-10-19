import { defineConfig } from 'vite';
import { resolve } from 'path';

/**
 * Vite configuration for @uswds-wc meta package
 *
 * This package re-exports all category packages, providing a single entry point
 * for users who want all USWDS components.
 */
export default defineConfig({
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
      name: 'USWDSWebComponents',
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: [
        'lit',
        '@lit/reactive-element',
        'lit-element',
        'lit-html',
        'lit/decorators.js',
        'lit/directive.js',
        'lit/directives/unsafe-html.js',
        '@uswds-wc/core',
        '@uswds-wc/forms',
        '@uswds-wc/navigation',
        '@uswds-wc/data-display',
        '@uswds-wc/feedback',
        '@uswds-wc/actions',
        '@uswds-wc/layout',
        '@uswds-wc/structure',
      ],
      output: {
        globals: {
          lit: 'Lit',
          '@lit/reactive-element': 'LitReactiveElement',
        },
      },
    },
    sourcemap: true,
    minify: false, // Don't minify library builds
    outDir: 'dist',
    emptyOutDir: true,
  },
});
