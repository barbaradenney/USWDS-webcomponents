/**
 * ESLint Rules for USWDS Tree-Shaking Enforcement
 *
 * These rules prevent regressions and enforce tree-shaking patterns
 * across all USWDS web components.
 */

module.exports = {
  rules: {
    // Prevent full USWDS library imports
    'no-full-uswds-import': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Disallow importing the full USWDS library',
          category: 'Performance',
          recommended: true,
        },
        schema: [],
        messages: {
          noFullUSWDS: 'Importing full USWDS library is forbidden. Use tree-shaking: import("@uswds/uswds/js/usa-[component]") instead.',
        },
      },
      create(context) {
        return {
          ImportDeclaration(node) {
            if (node.source.value === '@uswds/uswds' || node.source.value === 'uswds') {
              context.report({
                node,
                messageId: 'noFullUSWDS',
              });
            }
          },
          CallExpression(node) {
            // Check for require('@uswds/uswds')
            if (
              node.callee.name === 'require' &&
              node.arguments[0] &&
              (node.arguments[0].value === '@uswds/uswds' || node.arguments[0].value === 'uswds')
            ) {
              context.report({
                node,
                messageId: 'noFullUSWDS',
              });
            }
          },
        };
      },
    },

    // Enforce tree-shaking pattern for interactive components
    'require-tree-shaking-import': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Require tree-shaking imports for interactive USWDS components',
          category: 'Performance',
          recommended: true,
        },
        schema: [],
        messages: {
          missingTreeShaking: 'Interactive USWDS component "{{componentName}}" must use tree-shaking import pattern: import("@uswds/uswds/js/usa-{{componentName}}")',
        },
      },
      create(context) {
        const INTERACTIVE_COMPONENTS = [
          'accordion', 'modal', 'date-picker', 'date-range-picker', 'combo-box',
          'file-input', 'navigation', 'header', 'footer', 'in-page-navigation',
          'search', 'table', 'time-picker', 'tooltip', 'character-count'
        ];

        let hasTreeShakingImport = false;
        let componentName = null;

        return {
          // Detect component class name
          ClassDeclaration(node) {
            if (node.id && node.id.name.startsWith('USA')) {
              // Extract component name from class name
              const className = node.id.name;
              const match = className.match(/USA(.+)/);
              if (match) {
                const extracted = match[1]
                  .replace(/([A-Z])/g, '-$1')
                  .toLowerCase()
                  .substring(1);

                if (INTERACTIVE_COMPONENTS.includes(extracted)) {
                  componentName = extracted;
                }
              }
            }
          },

          // Check for tree-shaking import pattern
          CallExpression(node) {
            if (
              node.callee.name === 'import' &&
              node.arguments[0] &&
              node.arguments[0].value &&
              node.arguments[0].value.includes('@uswds/uswds/js/')
            ) {
              hasTreeShakingImport = true;
            }
          },

          // Report if interactive component lacks tree-shaking
          'Program:exit'() {
            if (componentName && !hasTreeShakingImport) {
              context.report({
                loc: { line: 1, column: 0 },
                messageId: 'missingTreeShaking',
                data: { componentName },
              });
            }
          },
        };
      },
    },

    // Prevent CDN script loading
    'no-cdn-script-loading': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Disallow loading USWDS via CDN scripts',
          category: 'Performance',
          recommended: true,
        },
        schema: [],
        messages: {
          noCDNLoading: 'Loading USWDS via CDN scripts is forbidden. Use tree-shaking imports instead.',
        },
      },
      create(context) {
        return {
          CallExpression(node) {
            // Check for createElement('script') followed by USWDS CDN URLs
            if (
              node.callee.type === 'MemberExpression' &&
              node.callee.object.name === 'document' &&
              node.callee.property.name === 'createElement' &&
              node.arguments[0] &&
              node.arguments[0].value === 'script'
            ) {
              // Look for assignments to src with USWDS CDN
              const parent = node.parent;
              if (parent && parent.type === 'VariableDeclarator') {
                // This is a heuristic - in practice, you'd need to track the variable
                // and check for assignments to .src with USWDS URLs
                context.report({
                  node,
                  messageId: 'noCDNLoading',
                });
              }
            }
          },
        };
      },
    },
  },
};