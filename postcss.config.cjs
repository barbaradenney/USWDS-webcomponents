module.exports = {
  plugins: [
    // PurgeCSS - Only for production builds
    ...(process.env.NODE_ENV === 'production' ? [
      require('@fullhuman/postcss-purgecss').default({
      content: [
        './src/**/*.{ts,tsx,js,jsx}',
        './src/**/*.stories.ts',
        './.storybook/**/*.{ts,tsx,js,jsx}',
        './index.html',
      ],
      // Safelist for USWDS dynamic classes and patterns
      safelist: {
        // Keep all base USWDS classes
        standard: [
          /^usa-/,  // All USWDS classes
        ],
        // Keep classes that match these patterns (for dynamic class generation)
        deep: [
          /^usa-.*$/,  // All USWDS classes and modifiers
          /^aria-/,     // ARIA attributes as classes
          /^data-/,     // Data attributes as classes
        ],
        // Keep classes added dynamically by USWDS JavaScript
        greedy: [
          /^usa-combo-box__/,
          /^usa-date-picker__/,
          /^usa-time-picker__/,
          /^usa-modal/,
          /^usa-header/,
          /^usa-accordion/,
          /^usa-banner/,
          /^usa-table__header__button/,
          /^usa-nav/,
          /^usa-search/,
          /^usa-footer/,
          /^usa-tooltip/,
          /^usa-character-count/,
          /^usa-file-input/,
          /^usa-in-page-navigation/,
          /^usa-prose/,
          /^usa-list/,
          /^usa-card/,
          /^usa-identifier/,
          /^usa-summary-box/,
          /^usa-site-alert/,
          /^usa-step-indicator/,
          /^usa-process-list/,
          /^usa-collection/,
          /^usa-side-navigation/,
          /^usa-language-selector/,
          /^usa-breadcrumb/,
          /^usa-pagination/,
          /^usa-menu/,
          /^usa-checkbox/,
          /^usa-radio/,
          /^usa-input/,
          /^usa-select/,
          /^usa-textarea/,
          /^usa-range/,
          /^usa-button/,
          /^usa-alert/,
          /^usa-link/,
          /^usa-tag/,
          /^usa-badge/,
          /^usa-form/,
          /^usa-fieldset/,
          /^usa-label/,
          /^usa-legend/,
          /^usa-hint/,
          /^usa-error-message/,
          /^usa-skip-link/,
          /^usa-icon/,
          /^usa-sr-only/,
          /^usa-focus/,
          /^usa-current/,
          /^usa-unstyled/,
        ],
      },
      // Reject @font-face declarations if font files are unused
      fontFace: false,
      // Reject @keyframes if unused
      keyframes: false,
      // Variables are safe to keep
      variables: true,
      // Reject CSS within at-rules if unused (but keep media queries)
      blocklist: [],
      // Custom extractors
      defaultExtractor: content => {
        // Match class names in template literals and JSX
        const broadMatches = content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || [];
        const innerMatches = content.match(/[^<>"'`\s.()]*[^<>"'`\s.():]/g) || [];
        return broadMatches.concat(innerMatches);
      },
    })
    ] : []),
    // CSSnano for minification - runs after PurgeCSS
    require('cssnano')({
      preset: ['default', {
        discardComments: {
          removeAll: true,
        },
      }]
    })
  ]
};