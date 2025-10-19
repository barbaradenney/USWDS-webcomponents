import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './index.ts';
import type { USAButton } from './usa-button.js';

const meta: Meta<USAButton> = {
  title: 'Actions/Button',
  component: 'usa-button',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# USA Button

The USA Button component provides consistent styling and behavior for buttons across applications.
Based on the USWDS Button component, it supports multiple variants, sizes, and states.

## Usage Guidelines

- Use primary buttons for the most important actions
- Use secondary buttons for less important actions
- Use outline buttons for alternative actions
- Always provide clear, descriptive button text
- Ensure buttons have appropriate contrast and focus states

## Accessibility

- Buttons automatically include proper ARIA attributes
- Focus management is handled automatically
- Screen reader support is built-in
- Keyboard navigation works out of the box
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'accent-cool', 'accent-warm', 'base', 'outline', 'inverse'],
      description: 'Button style variant',
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'big'],
      description: 'Button size',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the button is disabled',
    },
    type: {
      control: { type: 'select' },
      options: ['button', 'submit', 'reset'],
      description: 'Button type attribute',
    },
    ariaLabel: {
      control: { type: 'text' },
      description: 'ARIA label for accessibility',
    },
    ariaPressed: {
      control: { type: 'select' },
      options: [null, 'true', 'false'],
      description: 'ARIA pressed state for toggle buttons',
    },
    onclick: { action: 'clicked' },
    onfocus: { action: 'focused' },
    onblur: { action: 'blurred' },
  },
  args: {
    variant: 'primary',
    size: 'medium',
    disabled: false,
    type: 'button',
  },
};

export default meta;
type Story = StoryObj<USAButton>;

export const Default: Story = {
  args: {
    variant: 'primary',
  },
  render: (args) => html`
    <usa-button
      variant="${args.variant}"
      size="${args.size}"
      type="${args.type}"
      ?disabled=${args.disabled}
    >
      Primary Button
    </usa-button>
  `,
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
  },
  render: (args) => html`
    <usa-button
      variant="${args.variant}"
      size="${args.size}"
      type="${args.type}"
      ?disabled=${args.disabled}
    >
      Secondary Button
    </usa-button>
  `,
};

export const Outline: Story = {
  args: {
    variant: 'outline',
  },
  render: (args) => html`
    <usa-button
      variant="${args.variant}"
      size="${args.size}"
      type="${args.type}"
      ?disabled=${args.disabled}
    >
      Outline Button
    </usa-button>
  `,
};

export const Sizes: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div class="display-flex gap-2 flex-align-center">
      <usa-button size="small">Small</usa-button>
      <usa-button size="medium">Medium</usa-button>
      <usa-button size="big">Big</usa-button>
    </div>
  `,
};

export const AllVariants: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div class="display-flex flex-wrap gap-1">
      <usa-button variant="primary">Primary</usa-button>
      <usa-button variant="secondary">Secondary</usa-button>
      <usa-button variant="accent-cool">Accent Cool</usa-button>
      <usa-button variant="accent-warm">Accent Warm</usa-button>
      <usa-button variant="base">Base</usa-button>
      <usa-button variant="outline">Outline</usa-button>
    </div>
  `,
};

export const Disabled: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div class="display-flex gap-2">
      <usa-button disabled>Disabled Primary</usa-button>
      <usa-button variant="secondary" disabled>Disabled Secondary</usa-button>
      <usa-button variant="outline" disabled>Disabled Outline</usa-button>
    </div>
  `,
};

export const AccessibilityFeatures: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div class="display-flex flex-column gap-2 maxw-tablet">
      <div>
        <h3>ARIA Labels</h3>
        <div class="display-flex gap-2">
          <usa-button aria-label="Close dialog">×</usa-button>
          <usa-button aria-label="Save document" variant="secondary">Save</usa-button>
        </div>
      </div>

      <div>
        <h3>Form Integration</h3>
        <form class="border border-base-lighter padding-1 radius-md">
          <p>Try the keyboard (Tab, Space, Enter) and form submission:</p>
          <div class="display-flex gap-1 margin-y-1">
            <usa-button type="submit">Submit Form</usa-button>
            <usa-button type="reset" variant="outline">Reset Form</usa-button>
            <usa-button type="button" variant="secondary">Regular Button</usa-button>
          </div>
          <input
            type="text"
            placeholder="Test form input"
            class="margin-top-1 padding-05"
          />
        </form>
      </div>

      <div>
        <h3>Keyboard Navigation</h3>
        <p>Use Tab to navigate, Space or Enter to activate:</p>
        <div class="display-flex gap-2">
          <usa-button>Focus me with Tab</usa-button>
          <usa-button variant="outline">Then this one</usa-button>
          <usa-button disabled>Can't focus (disabled)</usa-button>
        </div>
      </div>
    </div>
  `,
};

export const FormExample: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <form
      class="border border-base-lighter padding-2 radius-md maxw-card"
      @submit=${(e: Event) => {
        e.preventDefault();
        alert('Form submitted!');
      }}
      @reset=${() => {
        alert('Form reset!');
      }}
    >
      <h3>Form with USWDS Buttons</h3>
      <div class="margin-y-1">
        <label for="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          class="display-block width-full margin-top-05 padding-05"
        />
      </div>
      <div class="margin-y-1">
        <label for="message">Message:</label>
        <textarea
          id="message"
          name="message"
          class="display-block width-full margin-top-05 padding-05 height-card"
        ></textarea>
      </div>
      <div class="display-flex gap-1 margin-top-205">
        <usa-button type="submit">Submit</usa-button>
        <usa-button type="reset" variant="outline">Reset</usa-button>
      </div>
    </form>
  `,
};

// Interactive Demo Stories

export const InteractiveDemo: Story = {
  parameters: {
    controls: { disable: true }, // Complex demo - uses action handlers for interaction
    actions: {
      handles: ['click', 'focus', 'blur', 'mousedown', 'mouseup'],
    },
  },
  render: () => html`
    <div class="maxw-tablet padding-1 border border-base-lighter radius-md">
      <h3>Actions Panel Testing</h3>
      <p>Click buttons below to test Actions panel functionality</p>

      <div
        id="demo-output"
        class="bg-base-lightest padding-1 margin-y-1 radius-md minh-6"
      >
        <strong>Output:</strong> Click any button - check both console and Actions panel below.
      </div>

      <!-- Comprehensive test cases for Actions panel -->
      <div class="margin-y-1 padding-1 border border-base-lightest radius-md">
        <h4>HTML Button Tests</h4>
        <button onclick="console.log('HTML onclick clicked')">HTML onclick</button>
        <button onclick="alert('HTML alert')">HTML Alert</button>
        <input type="button" value="Input Button" onclick="console.log('Input button clicked')" />
      </div>

      <div class="margin-y-1 padding-1 border border-base-lightest radius-md">
        <h4>Lit Template Tests</h4>
        <button @click=${() => console.log('Lit @click handler')}>Lit @click</button>
        <button
          @click=${(e: Event) => {
            console.log('Lit click with event:', e);
            const target = e.target as HTMLElement;
            target.style.background = target.style.background === 'green' ? '' : 'green';
          }}
        >
          Lit Click + Style
        </button>
      </div>

      <div class="margin-y-1 padding-1 border border-base-lightest radius-md">
        <h4>USA Button Components</h4>
        <div class="display-flex gap-1 flex-wrap">
          <usa-button variant="primary">Primary</usa-button>
          <usa-button variant="secondary">Secondary</usa-button>
          <usa-button variant="outline">Outline</usa-button>
        </div>
      </div>
    </div>
  `,
};
