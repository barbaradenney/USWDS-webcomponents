import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './index.ts';
import type { USACheckbox } from './usa-checkbox.js';

const meta: Meta<USACheckbox> = {
  title: 'Forms/Checkbox',
  component: 'usa-checkbox',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
The USA Checkbox component provides accessible checkbox selection using official USWDS styling. Perfect for government applications requiring multiple selections, feature toggles, and user preferences.

**Government Use Cases:**
- Multi-select options in federal forms
- Feature preferences and notification settings  
- Terms acceptance and compliance checkboxes
- Data collection consent forms
- Service selection in government portals
- Accessibility compliance demonstrations
        `,
      },
    },
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'Label text for the checkbox',
    },
    value: {
      control: 'text',
      description: 'Checkbox value when checked',
    },
    checked: {
      control: 'boolean',
      description: 'Whether the checkbox is checked',
    },
    description: {
      control: 'text',
      description: 'Description text (shown below label)',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the checkbox is disabled',
    },
    required: {
      control: 'boolean',
      description: 'Whether the checkbox is required',
    },
    indeterminate: {
      control: 'boolean',
      description: 'Whether the checkbox is in indeterminate state',
    },
    tile: {
      control: 'boolean',
      description: 'Whether to use the tile variant',
    },
    error: {
      control: 'text',
      description: 'Error message (shows error state)',
    },
  },
  args: {
    label: 'Checkbox label',
    value: 'checkbox-value',
    checked: false,
    description: '',
    disabled: false,
    required: false,
    indeterminate: false,
    tile: false,
    error: '',
  },
};

export default meta;
type Story = StoryObj<USACheckbox>;

// Basic Examples
export const Default: Story = {
  args: {
    label: 'Standard checkbox',
    value: 'standard',
  },
};

export const Checked: Story = {
  args: {
    label: 'Pre-selected checkbox',
    value: 'selected',
    checked: true,
  },
};

export const WithDescription: Story = {
  args: {
    label: 'Checkbox with description',
    value: 'with-desc',
    description: 'Additional context provided below the label',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled checkbox',
    value: 'disabled',
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    label: 'Disabled and checked',
    value: 'disabled-checked',
    disabled: true,
    checked: true,
  },
};

export const Indeterminate: Story = {
  args: {
    label: 'Indeterminate state',
    value: 'indeterminate',
    indeterminate: true,
  },
};

export const Required: Story = {
  args: {
    label: 'Required checkbox',
    value: 'required',
    required: true,
  },
};

export const ErrorState: Story = {
  args: {
    label: 'Checkbox with error',
    value: 'error',
    required: true,
    error: 'This field is required',
  },
};

export const TileVariant: Story = {
  args: {
    label: 'Tile Checkbox',
    value: 'tile',
    description: 'Enhanced checkbox with larger touch target and description support',
    tile: true,
  },
};

// Group examples
export const CheckboxGroup: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div class="maxw-tablet">
      <h3>Checkbox Group</h3>
      <p>Multiple checkbox selections with fieldset grouping.</p>

      <fieldset class="usa-fieldset">
        <legend class="usa-legend">Select your preferences:</legend>

        <usa-checkbox
          name="preferences[]"
          value="email"
          label="Email notifications"
          description="Receive updates via email"
          checked
        ></usa-checkbox>

        <usa-checkbox
          name="preferences[]"
          value="sms"
          label="SMS notifications"
          description="Receive updates via text message"
        ></usa-checkbox>

        <usa-checkbox
          name="preferences[]"
          value="newsletter"
          label="Newsletter subscription"
          description="Monthly newsletter with updates and tips"
        ></usa-checkbox>

        <usa-checkbox
          name="preferences[]"
          value="marketing"
          label="Marketing communications"
          description="Information about new features and services"
        ></usa-checkbox>
      </fieldset>
    </div>
  `,
};

export const TileVariantGroup: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div class="maxw-tablet">
      <h3>Service Selection (Tile Variant)</h3>
      <p>Tile checkboxes for enhanced service selection with detailed descriptions.</p>

      <fieldset class="usa-fieldset">
        <legend class="usa-legend">Select Services</legend>

        <usa-checkbox
          name="services[]"
          value="basic"
          label="Basic Plan"
          description="Essential features with standard support. Includes core functionality and email support during business hours."
          tile
        ></usa-checkbox>

        <usa-checkbox
          name="services[]"
          value="premium"
          label="Premium Plan"
          description="Advanced features with priority support. Includes all basic features plus advanced analytics and phone support."
          tile
          checked
        ></usa-checkbox>

        <usa-checkbox
          name="services[]"
          value="enterprise"
          label="Enterprise Plan"
          description="Full feature set with dedicated support. Custom integrations, dedicated account manager, and 24/7 support."
          tile
        ></usa-checkbox>
      </fieldset>
    </div>
  `,
};

export const AccessibilityDemo: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div class="maxw-tablet">
      <h3>Accessibility Features</h3>
      <p>Checkbox component meeting accessibility requirements.</p>

      <fieldset class="usa-fieldset">
        <legend class="usa-legend">Accessibility Preferences</legend>

        <usa-checkbox
          name="accessibility[]"
          value="high-contrast"
          label="High contrast mode"
          description="Enhanced color contrast for improved visibility"
        ></usa-checkbox>

        <usa-checkbox
          name="accessibility[]"
          value="large-text"
          label="Large text size"
          description="Increased font size for better readability"
        ></usa-checkbox>

        <usa-checkbox
          name="accessibility[]"
          value="keyboard-navigation"
          label="Keyboard navigation"
          description="Full functionality via keyboard"
          checked
        ></usa-checkbox>
      </fieldset>

      <div class="margin-top-205 padding-1 bg-info-lighter radius-md">
        <h4>Accessibility Features:</h4>
        <ul>
          <li><strong>Keyboard Navigation:</strong> Tab and Space key support</li>
          <li><strong>Screen Reader Support:</strong> Proper ARIA labels and announcements</li>
          <li><strong>Color Contrast:</strong> Meets contrast requirements</li>
          <li><strong>Focus Indicators:</strong> Clear visual focus indicators</li>
          <li><strong>Label Association:</strong> Proper labels and descriptions</li>
        </ul>
      </div>
    </div>
  `,
};
