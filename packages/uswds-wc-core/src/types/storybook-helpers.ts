import type { StoryObj, Meta } from '@storybook/web-components-vite';
import type { TemplateResult } from 'lit';

/**
 * Enforces that Story render functions use Lit html template literals
 * instead of string templates for proper property binding
 */
export type LitStoryRender<T = any> = (args: T) => TemplateResult;

/**
 * Enforces proper Story structure with Lit html templates
 */
export type LitStoryObj<T = any> = Omit<StoryObj<T>, 'render'> & {
  render?: LitStoryRender<T>;
};

/**
 * Meta type that enforces Lit html usage in stories
 */
export type LitMeta<T = any> = Meta<T>;

/**
 * Helper type for common component properties that require object binding
 */
export interface ComponentWithArrayProps {
  options?: Array<{ value: string; label: string; disabled?: boolean }>;
  items?: Array<any>;
  data?: Array<any>;
  headers?: Array<any>;
}

/**
 * Type guard to ensure components with array properties use proper binding
 */
export type StoryWithArrayProps<T extends ComponentWithArrayProps> = LitStoryObj<T>;

/**
 * Utility type to remind developers about proper property binding
 * Use this comment in story files as a reminder:
 *
 * @example
 * // ✅ CORRECT: Use Lit html template with property binding
 * render: (args) => html`<usa-component .options=${args.options}></usa-component>`
 *
 * // ❌ WRONG: String template with JSON.stringify
 * render: (args) => `<usa-component .options='${JSON.stringify(args.options)}'></usa-component>`
 */
export type PropertyBindingReminder = 'USE_LIT_HTML_WITH_PROPERTY_BINDING';

/**
 * Example of correct story structure
 */
export const StoryTemplate = {
  /**
   * Template for components with simple properties
   */
  simple: `
export const ExampleStory: LitStoryObj<ComponentType> = {
  render: (args) => html\`
    <usa-component
      label="\${args.label}"
      ?disabled=\${args.disabled}
      ?required=\${args.required}
    ></usa-component>
  \`,
  args: {
    label: 'Example Label',
    disabled: false,
    required: false,
  },
};`,

  /**
   * Template for components with array/object properties
   */
  withArrayProps: `
export const ExampleStory: StoryWithArrayProps<ComponentType> = {
  render: (args) => html\`
    <usa-component
      label="\${args.label}"
      .options=\${args.options}
      .items=\${args.items}
      ?disabled=\${args.disabled}
    ></usa-component>
  \`,
  args: {
    label: 'Example Label',
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
    ],
    items: [],
    disabled: false,
  },
};`,
};

/**
 * Best practices reminder
 */
export const STORYBOOK_BEST_PRACTICES = {
  IMPORT_HTML: 'Always import { html } from "lit" in story files',
  PROPERTY_BINDING: 'Use .property=${value} for object/array properties',
  BOOLEAN_BINDING: 'Use ?attribute=${boolean} for boolean attributes',
  STRING_INTERPOLATION: 'Use "${value}" for string attributes',
  AVOID_JSON_STRINGIFY: 'Never use JSON.stringify in property assignments',
  USE_LIT_TEMPLATES: 'Always use html`` template literals, not string templates',
} as const;
