import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './index.ts';
import type { USALanguageSelector, LanguageOption } from './usa-language-selector.js';

const meta: Meta<USALanguageSelector> = {
  title: 'Navigation/Language Selector',
  component: 'usa-language-selector',
  decorators: [
    (story) => html`
      <style>
        /* Override USWDS .usa-nav__secondary absolute positioning for Storybook */
        usa-language-selector .usa-nav__secondary {
          position: static !important;
          right: auto !important;
          top: auto !important;
        }
      </style>
      ${story()}
    `,
  ],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# USA Language Selector

The Language Selector component provides multilingual support for websites, enabling users to access content in their preferred language. Essential for accessibility and compliance with language access requirements.

## Usage Guidelines

- Use dropdown variant for 3+ languages
- Include native language names (e.g., "Español" for Spanish)
- Provide language-specific URLs when possible
- Consider local demographics for language selection
- Test with screen readers and keyboard navigation
        `,
      },
    },
  },
  argTypes: {
    currentLanguage: {
      control: 'select',
      options: ['en', 'es', 'fr', 'de', 'zh-Hans', 'ar', 'hi', 'ko', 'ru', 'vi', 'tl'],
      description: 'Currently selected language code (ISO 639-1)',
    },
    variant: {
      control: 'select',
      options: ['two-languages', 'dropdown', 'unstyled'],
      description: 'Display variant based on number of languages',
    },
    buttonText: {
      control: 'text',
      description: 'Text for dropdown toggle button',
    },
    small: {
      control: 'boolean',
      description: 'Compact size for limited space (dropdown only)',
    },
  },
  args: {
    currentLanguage: 'en',
    variant: 'two-languages',
    buttonText: 'Languages',
    small: false,
  },
};

export default meta;
type Story = StoryObj<USALanguageSelector>;

// Common language sets
const commonLanguages: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'zh-Hans', name: 'Chinese (Simplified)', nativeName: '简体中文' },
  { code: 'tl', name: 'Tagalog', nativeName: 'Tagalog' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
];

export const Default: Story = {
  args: {
    variant: 'two-languages',
    currentLanguage: 'en',
    languages: [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'es', name: 'Spanish', nativeName: 'Español' },
    ],
  },
  render: (args) => html`
    <usa-language-selector
      .variant=${args.variant}
      .currentLanguage=${args.currentLanguage}
      .languages=${args.languages}
      .buttonText=${args.buttonText}
      ?small=${args.small}
    ></usa-language-selector>
  `,
};

export const Dropdown: Story = {
  args: {
    variant: 'dropdown',
    currentLanguage: 'en',
    buttonText: 'Language',
    languages: commonLanguages.slice(0, 5),
  },
  render: (args) => html`
    <usa-language-selector
      .variant=${args.variant}
      .currentLanguage=${args.currentLanguage}
      .languages=${args.languages}
      .buttonText=${args.buttonText}
      ?small=${args.small}
    ></usa-language-selector>
  `,
};

export const SmallDropdown: Story = {
  args: {
    variant: 'dropdown',
    small: true,
    buttonText: 'Lang',
    languages: commonLanguages.slice(0, 4),
  },
  render: (args) => html`
    <usa-language-selector
      .variant=${args.variant}
      .currentLanguage=${args.currentLanguage}
      .languages=${args.languages}
      .buttonText=${args.buttonText}
      ?small=${args.small}
    ></usa-language-selector>
  `,
};

export const UnstyledLinks: Story = {
  args: {
    variant: 'unstyled',
    languages: [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'es', name: 'Spanish', nativeName: 'Español' },
      { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
    ],
  },
  render: (args) => html`
    <usa-language-selector
      .variant=${args.variant}
      .currentLanguage=${args.currentLanguage}
      .languages=${args.languages}
      .buttonText=${args.buttonText}
      ?small=${args.small}
    ></usa-language-selector>
  `,
};

export const AccessibilityShowcase: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div class="maxw-desktop padding-1 border border-base-lighter radius-md">
      <h3>Accessibility Compliance Demonstration</h3>
      <p class="margin-bottom-205 text-base-dark">
        This example demonstrates WCAG 2.1 AA compliance features: proper lang attributes, keyboard
        navigation, and screen reader support.
      </p>

      <div class="display-grid grid-row grid-gap-2 margin-bottom-2">
        <div>
          <h4>Two-Language Toggle</h4>
          <p class="font-body-xs margin-bottom-1">
            Keyboard: Tab to focus, Space/Enter to activate
          </p>
          <usa-language-selector
            variant="two-languages"
            current-language="en"
            .languages=${[
              { code: 'en', name: 'English', nativeName: 'English' },
              { code: 'es', name: 'Spanish', nativeName: 'Español' },
            ]}
          ></usa-language-selector>
        </div>

        <div>
          <h4>Dropdown Navigation</h4>
          <p class="font-body-xs margin-bottom-1">
            Keyboard: Tab to button, Space to open, Arrow keys to navigate
          </p>
          <usa-language-selector
            variant="dropdown"
            current-language="en"
            button-text="Choose Language"
            .languages=${commonLanguages.slice(0, 4)}
          ></usa-language-selector>
        </div>
      </div>

      <div>
        <h4>Screen Reader Testing</h4>
        <p class="font-body-xs margin-bottom-1">
          Test with screen readers: NVDA, JAWS, VoiceOver. Each language option includes:
        </p>
        <ul class="font-body-xs margin-bottom-205">
          <li><code>lang</code> and <code>xml:lang</code> attributes for proper pronunciation</li>
          <li>Current selection indicated with <code>usa-current</code> class</li>
          <li>ARIA expanded states for dropdown interactions</li>
          <li>Semantic HTML structure with proper roles</li>
        </ul>

        <usa-language-selector
          variant="unstyled"
          current-language="ar"
          .languages=${[
            { code: 'en', name: 'English', nativeName: 'English' },
            { code: 'es', name: 'Spanish', nativeName: 'Español' },
            { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
            { code: 'zh-Hans', name: 'Chinese (Simplified)', nativeName: '简体中文' },
          ]}
          @language-select=${(e: CustomEvent) => {
            const feedback = document.getElementById('a11y-feedback');
            if (feedback) {
              feedback.innerHTML = `
                <strong>Selection:</strong> ${e.detail.language.nativeName} (${e.detail.language.name})<br>
                <strong>Language Code:</strong> ${e.detail.code}<br>
                <strong>Previous:</strong> ${e.detail.previousCode}<br>
                <strong>Screen Reader:</strong> Should announce language change
              `;
            }
          }}
        ></usa-language-selector>
      </div>

      <div
        id="a11y-feedback"
        class="margin-top-1 padding-1 bg-base-lightest radius-md minh-6"
      >
        <strong>Accessibility Feedback:</strong> Select a language to see accessibility information
      </div>
    </div>
  `,
};

