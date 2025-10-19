/**
 * ESLint rules to prevent DOM reference safety issues
 *
 * Add these rules to your main .eslintrc.js to catch dangerous patterns
 */

module.exports = {
  rules: {
    // Prevent DOM element cloning patterns
    'no-restricted-syntax': [
      'error',
      {
        selector:
          "CallExpression[callee.property.name='cloneNode'] ~ CallExpression[callee.property.name='replaceChild']",
        message:
          "❌ DOM SAFETY: Don't clone and replace DOM elements - this breaks component references. Use event listener management instead.",
      },
      {
        selector: "CallExpression[callee.property.name='replaceChild']",
        message:
          '⚠️ DOM SAFETY: Replacing DOM elements can break component references. Consider alternatives like event listener management.',
      },
    ],

    // Warn about potential reactivity issues
    'prefer-const': [
      'error',
      {
        destructuring: 'any',
        ignoreReadBeforeAssign: false,
      },
    ],
  },

  overrides: [
    {
      files: ['public/uswds-wrapper.js', '**/uswds-*.js'],
      rules: {
        'no-restricted-syntax': [
          'error',
          {
            selector:
              "CallExpression[callee.property.name='cloneNode'] ~ CallExpression[callee.property.name='replaceChild']",
            message:
              '🚨 CRITICAL: DOM cloning in USWDS wrapper breaks Lit component references. Use this.removeAccordionButtonListeners() and this.addAccordionButtonListeners() instead.',
          },
        ],
      },
    },

    {
      files: ['src/components/**/*.ts'],
      rules: {
        'no-restricted-syntax': [
          'error',
          {
            selector:
              "AssignmentExpression[left.type='MemberExpression'][right.type='ObjectExpression'] > ObjectExpression > SpreadElement",
            message:
              '⚠️ REACTIVITY: Object spread in array assignment may trigger unnecessary re-renders. Consider direct property assignment: this.items[index].prop = value',
          },
        ],
      },
    },
  ],
};
