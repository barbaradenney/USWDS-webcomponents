import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readdirSync } from 'fs';
import viteImagemin from 'vite-plugin-imagemin';

// Dynamically generate component entries
const componentsDir = resolve(__dirname, 'src/components');
const componentEntries = readdirSync(componentsDir)
  .filter((dir) => !dir.startsWith('.'))
  .reduce(
    (entries, componentName) => {
      entries[`components/${componentName}`] = resolve(componentsDir, componentName, 'index.ts');
      return entries;
    },
    {} as Record<string, string>
  );

export default defineConfig({
  plugins: [
    // Optimize images automatically
    viteImagemin({
      gifsicle: {
        optimizationLevel: 7,
        interlaced: false,
      },
      mozjpeg: {
        quality: 80,
      },
      pngquant: {
        quality: [0.65, 0.8],
        speed: 4,
      },
      svgo: {
        plugins: [
          {
            name: 'removeViewBox',
            active: false,
          },
          {
            name: 'removeEmptyAttrs',
            active: false,
          },
        ],
      },
    }),
  ],
  build: {
    lib: {
      entry: {
        // Main bundle (can be tree-shaken)
        index: resolve(__dirname, 'src/index.ts'),
        // Individual component entries for selective imports
        ...componentEntries,
        // Utility bundles
        'utils/base-component': resolve(__dirname, 'src/utils/base-component.ts'),
        'utils/form-helpers': resolve(__dirname, 'src/utils/form-helpers.ts'),
        'utils/event-helpers': resolve(__dirname, 'src/utils/event-helpers.ts'),
        'utils/performance-helpers': resolve(__dirname, 'src/utils/performance-helpers.ts'),
        'utils/uswds-class-builder': resolve(__dirname, 'src/utils/uswds-class-builder.ts'),
      },
      name: 'USWDSWebComponents',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['lit', '@lit/reactive-element', 'lit-element', 'lit-html'],
      output: {
        globals: {
          lit: 'Lit',
          '@lit/reactive-element': 'LitReactiveElement',
        },
        // Tree-shaking optimizations
        experimentalMinChunkSize: 1000,
      },
      // Tree-shaking optimizations
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      },
    },
    // Minification and optimization
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug'],
        passes: 2,
      },
      mangle: {
        properties: {
          regex: /^_/,
        },
      },
      format: {
        comments: false,
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 50,
    sourcemap: true,
    // CSS code splitting
    cssCodeSplit: true,
    // Asset inlining threshold
    assetsInlineLimit: 4096,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/components': resolve(__dirname, 'src/components'),
      '@/styles': resolve(__dirname, 'src/styles'),
      '@/utils': resolve(__dirname, 'src/utils'),
      '@/types': resolve(__dirname, 'src/types'),
      // Force all lit packages to use same instance
      lit: resolve(__dirname, 'node_modules/lit'),
      '@lit/reactive-element': resolve(__dirname, 'node_modules/@lit/reactive-element'),
      'lit-html': resolve(__dirname, 'node_modules/lit-html'),
      'lit-element': resolve(__dirname, 'node_modules/lit-element'),
    },
    dedupe: [
      'lit',
      '@lit/reactive-element',
      'lit-element',
      'lit-html',
      'lit/decorators.js',
      'lit/directive.js',
      'lit/directives/unsafe-html.js',
    ],
  },
  css: {
    preprocessorOptions: {
      scss: {
        includePaths: [
          'node_modules/@uswds/uswds/scss',
          'node_modules/@uswds/uswds/packages',
          'node_modules',
          'src/styles',
        ],
        // additionalData: `@use "src/styles/_uswds-theme" as settings;`,
      },
    },
    // Enable PostCSS processing for CSS optimization
    postcss: './postcss.config.cjs',
  },
  optimizeDeps: {
    include: ['lit', 'lit/decorators.js', '@lit/reactive-element'],
    exclude: ['@uswds/uswds'],
  },
  // Production optimizations
  esbuild: {
    legalComments: 'none',
    target: 'es2020',
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
