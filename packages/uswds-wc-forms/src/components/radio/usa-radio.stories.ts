import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './index.ts';
import type { USARadio } from './usa-radio.js';

const meta: Meta<USARadio> = {
  title: 'Forms/Radio',
  component: 'usa-radio',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# USA Radio

The USA Radio component provides accessible radio button selection using official USWDS styling.
This component wraps the standard HTML radio input element with USWDS classes and accessibility features.

## Features
- Default and tile variants
- Optional descriptions for tile variant
- Full accessibility support with ARIA attributes
- Native form validation
- Single selection within a group

## Usage Guidelines

- Only one radio button can be selected in a group
- Use vertical listing for better readability
- Avoid setting default values without user research
- Ensure adequate spacing for touch screens
- Group related radio buttons with fieldset/legend

## Accessibility

- Labels are properly associated with radio buttons
- Fieldset and legend for grouped radio buttons
- Required fields clearly marked
- Supports keyboard navigation
- Screen reader announcements for state changes
        `,
      },
    },
  },
  argTypes: {
    label: {
      control: { type: 'text' },
      description: 'Label text for the radio button',
    },
    value: {
      control: { type: 'text' },
      description: 'Radio button value',
    },
    checked: {
      control: { type: 'boolean' },
      description: 'Whether the radio button is checked',
    },
    description: {
      control: { type: 'text' },
      description: 'Description text (only shown for tile variant)',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the radio button is disabled',
    },
    required: {
      control: { type: 'boolean' },
      description: 'Whether the radio button group is required',
    },
    tile: {
      control: { type: 'boolean' },
      description: 'Whether to use the tile variant',
    },
  },
  args: {
    label: 'Radio button label',
    value: 'radio-value',
    checked: false,
    description: '',
    disabled: false,
    required: false,
    tile: false,
  },
};

export default meta;
type Story = StoryObj<USARadio>;

export const Default: Story = {
  render: (args) => html`
    <usa-radio
      label="${args.label}"
      value="${args.value}"
      description="${args.description}"
      ?checked=${args.checked}
      ?disabled=${args.disabled}
      ?required=${args.required}
      ?tile=${args.tile}
    ></usa-radio>
  `,
};

export const Checked: Story = {
  args: {
    label: 'Selected option',
    checked: true,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled option',
    disabled: true,
  },
};

export const TileVariant: Story = {
  args: {
    label: 'Email notifications',
    description: 'Receive important updates and announcements via email.',
    tile: true,
  },
};

export const RadioGroup: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <fieldset class="usa-fieldset">
      <legend class="usa-legend">Select your preferred contact method</legend>
      <usa-radio name="contact" value="email" label="Email" checked></usa-radio>
      <usa-radio name="contact" value="phone" label="Phone"></usa-radio>
      <usa-radio name="contact" value="mail" label="Postal mail"></usa-radio>
      <usa-radio name="contact" value="none" label="Do not contact me" disabled></usa-radio>
    </fieldset>
  `,
};

export const TileGroup: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <fieldset class="usa-fieldset">
      <legend class="usa-legend">Choose your subscription plan</legend>
      <usa-radio
        name="plan"
        value="basic"
        label="Basic Plan"
        description="Essential features for individuals and small teams."
        tile
        checked
      ></usa-radio>
      <usa-radio
        name="plan"
        value="pro"
        label="Professional Plan"
        description="Advanced features and priority support for growing businesses."
        tile
      ></usa-radio>
      <usa-radio
        name="plan"
        value="enterprise"
        label="Enterprise Plan"
        description="Full feature set with custom integrations and dedicated support."
        tile
      ></usa-radio>
    </fieldset>
  `,
};

export const FormExample: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <form
      class="maxw-mobile-lg"
      @submit=${(e: Event) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        const radioValue = Object.fromEntries(formData);
        console.log('Form data:', radioValue);
        alert('Form submitted! Check console for data.');
      }}
    >
      <fieldset class="usa-fieldset">
        <legend class="usa-legend">Delivery method</legend>

        <usa-radio
          name="delivery"
          value="standard"
          label="Standard shipping (5-7 business days)"
          required
        ></usa-radio>

        <usa-radio
          name="delivery"
          value="expedited"
          label="Expedited shipping (2-3 business days)"
          required
        ></usa-radio>

        <usa-radio
          name="delivery"
          value="overnight"
          label="Overnight shipping"
          required
        ></usa-radio>
      </fieldset>

      <div class="margin-top-3">
        <usa-button type="submit">Continue</usa-button>
      </div>
    </form>
  `,
};

export const ValidationStates: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div class="display-flex flex-column gap-2 maxw-mobile-lg">
      <fieldset class="usa-fieldset">
        <legend class="usa-legend">Default radio group</legend>

        <usa-radio name="default-group" value="option1" label="Default state"></usa-radio>

        <usa-radio name="default-group" value="option2" label="Selected state" checked></usa-radio>

        <usa-radio name="default-group" value="option3" label="Another option"></usa-radio>
      </fieldset>

      <fieldset class="usa-fieldset">
        <legend class="usa-legend">Disabled options</legend>

        <usa-radio name="disabled-group" value="option1" label="Available option"></usa-radio>

        <usa-radio
          name="disabled-group"
          value="option2"
          label="Disabled option"
          disabled
        ></usa-radio>

        <usa-radio
          name="disabled-group"
          value="option3"
          label="Disabled and selected"
          checked
          disabled
        ></usa-radio>
      </fieldset>

      <fieldset class="usa-fieldset">
        <legend class="usa-legend">Required selection *</legend>

        <usa-radio name="required-group" value="option1" label="First option" required></usa-radio>

        <usa-radio name="required-group" value="option2" label="Second option" required></usa-radio>
      </fieldset>
    </div>
  `,
};

export const AccessibilityFeatures: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div class="maxw-mobile-lg">
      <h3>Accessibility Features Demo</h3>
      <p>This demo shows various accessibility features of the radio button component.</p>

      <fieldset class="usa-fieldset">
        <legend class="usa-legend">Accessible radio button group</legend>

        <usa-radio
          id="accessible-radio1"
          name="accessibleExample"
          value="feature1"
          label="Feature with full accessibility support"
          required
        ></usa-radio>

        <usa-radio
          name="accessibleExample"
          value="feature2"
          label="Tile variant with description"
          tile
          description="This tile variant includes a detailed description for better user understanding."
          required
        ></usa-radio>

        <usa-radio
          name="accessibleExample"
          value="feature3"
          label="Another accessible feature"
          required
        ></usa-radio>
      </fieldset>

      <div class="margin-top-1 padding-1 bg-base-lightest radius-md">
        <h4>Features demonstrated:</h4>
        <ul>
          <li>Labels properly associated with radio buttons</li>
          <li>Fieldset and legend for grouped radio buttons</li>
          <li>Required group clearly indicated</li>
          <li>Keyboard navigation support (arrow keys within group)</li>
          <li>Screen reader state announcements</li>
          <li>Single selection enforcement within group</li>
          <li>Tile descriptions for enhanced context</li>
        </ul>
      </div>
    </div>
  `,
};
