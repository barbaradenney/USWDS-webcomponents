import { defineConfig, UserConfig } from 'vite';
import { resolve } from 'path';

/**
 * Base Vite configuration for USWDS Web Components packages
 *
 * This config is extended by individual packages to ensure consistent build settings.
 */
export function createPackageConfig(packageName: string, packageDir: string): UserConfig {
  return {
    resolve: {
      alias: {
        '@': resolve(packageDir, 'src'),
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
        entry: resolve(packageDir, 'src/index.ts'),
        name: packageName,
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
          '@uswds-wc/actions', // For navigation package dependency
        ],
        output: {
          globals: {
            lit: 'Lit',
            '@lit/reactive-element': 'LitReactiveElement',
            '@uswds-wc/core': 'USWDSCore',
          },
          // Preserve directory structure
          preserveModules: true,
          preserveModulesRoot: 'src',
        },
      },
      sourcemap: true,
      minify: false, // Don't minify library builds
      outDir: 'dist',
      emptyOutDir: true,
    },
  };
}

export default defineConfig({});
