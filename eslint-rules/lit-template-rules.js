/**
 * Custom ESLint Rules for Lit Template Validation
 *
 * These rules help prevent common Lit directive syntax errors during development.
 */

module.exports = {
  'lit-directive-syntax': {
    meta: {
      type: 'problem',
      docs: {
        description: 'Prevent incorrect Lit directive syntax',
        category: 'Possible Errors',
      },
      fixable: 'code',
      schema: [],
    },
    create(context) {
      return {
        TemplateLiteral(node) {
          if (node.parent && node.parent.tag && node.parent.tag.name === 'html') {
            const sourceCode = context.getSourceCode();
            const templateContent = sourceCode.getText(node);

            // Check for quoted boolean directive attributes
            const quotedBooleanPattern = /\?[\w-]+\s*=\s*["`][^"`]*\$\{[^}]*\}[^"`]*["`]/g;
            let match;

            while ((match = quotedBooleanPattern.exec(templateContent)) !== null) {
              const start = node.range[0] + match.index;
              const end = start + match[0].length;

              context.report({
                node,
                loc: {
                  start: sourceCode.getLocFromIndex(start),
                  end: sourceCode.getLocFromIndex(end),
                },
                message: 'Boolean directive attributes should not be quoted. Use ?attr=${expression} instead of ?attr="${expression}"',
                fix(fixer) {
                  // Auto-fix by removing quotes around the directive
                  const fixed = match[0].replace(/([?][\w-]+\s*=\s*)["`](\$\{[^}]*\})["`]/, '$1$2');
                  return fixer.replaceTextRange([start, end], fixed);
                },
              });
            }

            // Check for missing directive imports
            const directiveUsage = {
              unsafeHTML: /unsafeHTML\s*\(/g,
              ifDefined: /ifDefined\s*\(/g,
              when: /when\s*\(/g,
              until: /until\s*\(/g,
              repeat: /repeat\s*\(/g,
              live: /live\s*\(/g,
              styleMap: /styleMap\s*\(/g,
              classMap: /classMap\s*\(/g,
              guard: /guard\s*\(/g,
            };

            Object.entries(directiveUsage).forEach(([directive, pattern]) => {
              if (pattern.test(templateContent)) {
                // Check if this directive is imported
                const program = context.getScope().childScopes[0]?.block || context.getScope().block;
                const hasImport = context.getSourceCode().getAllComments().some(comment =>
                  comment.value.includes(`import`) && comment.value.includes(directive)
                ) || context.getSourceCode().getText().includes(`import { ${directive} }`);

                if (!hasImport) {
                  context.report({
                    node,
                    message: `Directive '${directive}' is used but not imported. Add: import { ${directive} } from 'lit/directives/${directive.toLowerCase().replace(/([A-Z])/g, '-$1').toLowerCase()}.js';`,
                  });
                }
              }
            });
          }
        },
      };
    },
  },
};