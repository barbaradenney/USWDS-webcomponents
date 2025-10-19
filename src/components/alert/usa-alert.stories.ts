import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './index.ts';
import type { USAAlert } from './usa-alert.js';

const meta: Meta<USAAlert> = {
  title: 'Components/Alert',
  component: 'usa-alert',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
The **Alert** component communicates system status messages to users. It provides feedback about the results of user actions or system processes. This implementation matches USWDS specification exactly.

## Features
- **Multiple Types**: Info, warning, error, success, and emergency variants
- **Accessible**: Proper ARIA roles and screen reader support  
- **Flexible Content**: Supports headings and custom HTML content via slots
- **Styling Options**: Slim variant and no-icon option
- **USWDS Compliant**: Uses official USWDS classes and structure

## Usage Guidelines
Use alerts to:
- Notify users of successful actions
- Warn about potential issues
- Display error messages
- Provide important system information
- Communicate urgent updates

Note: This component follows USWDS specification and does not include dismissible functionality.
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['info', 'warning', 'error', 'success', 'emergency'],
      description: 'Type of alert that determines color and icon',
    },
    heading: {
      control: 'text',
      description: 'Optional heading for the alert',
    },
    slim: {
      control: 'boolean',
      description: 'Use slim styling for less prominent alerts',
    },
    noIcon: {
      control: 'boolean',
      description: 'Remove the default icon',
    },
  },
};

export default meta;

type Story = StoryObj<USAAlert>;

// Default story
export const Default: Story = {
  args: {
    variant: 'info',
    heading: 'Information',
  },
  render: (args) => html`
    <usa-alert variant="${args.variant}" heading="${args.heading}">
      This is an informational message for users.
    </usa-alert>
  `,
};

// All alert types
export const Info: Story = {
  args: {
    variant: 'info',
    heading: 'Information',
  },
  render: (args) => html`
    <usa-alert variant="${args.variant}" heading="${args.heading}">
      This is useful information that may help users understand what they need to do next.
    </usa-alert>
  `,
};

export const Success: Story = {
  args: {
    variant: 'success',
    heading: 'Success',
  },
  render: (args) => html`
    <usa-alert variant="${args.variant}" heading="${args.heading}">
      Your action was completed successfully.
    </usa-alert>
  `,
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    heading: 'Warning',
  },
  render: (args) => html`
    <usa-alert variant="${args.variant}" heading="${args.heading}">
      Please review the information below carefully.
    </usa-alert>
  `,
};

export const Error: Story = {
  args: {
    variant: 'error',
    heading: 'Error',
  },
  render: (args) => html`
    <usa-alert variant="${args.variant}" heading="${args.heading}">
      There was an error processing your request.
    </usa-alert>
  `,
};

export const Emergency: Story = {
  args: {
    variant: 'emergency',
    heading: 'Emergency Alert',
  },
  render: (args) => html`
    <usa-alert variant="${args.variant}" heading="${args.heading}">
      This is an urgent notification requiring immediate attention.
    </usa-alert>
  `,
};

// Variations
export const SlimAlert: Story = {
  name: 'Slim Alert',
  args: {
    variant: 'info',
    slim: true,
  },
  render: (args) => html`
    <usa-alert variant="${args.variant}" ?slim=${args.slim}>
      This is a slim alert for less prominent notifications.
    </usa-alert>
  `,
};

export const NoIcon: Story = {
  name: 'No Icon',
  args: {
    variant: 'success',
    heading: 'Success (No Icon)',
    noIcon: true,
  },
  render: (args) => html`
    <usa-alert variant="${args.variant}" heading="${args.heading}" ?no-icon=${args.noIcon}>
      This alert has no icon.
    </usa-alert>
  `,
};

// Message only (no heading)
export const MessageOnly: Story = {
  name: 'Message Only',
  args: {
    variant: 'info',
  },
  render: (args) => html`
    <usa-alert variant="${args.variant}">
      This alert has only a message with no heading.
    </usa-alert>
  `,
};

// Heading only (no message)
export const HeadingOnly: Story = {
  name: 'Heading Only',
  args: {
    variant: 'success',
    heading: 'Operation Complete',
  },
  render: (args) => html`
    <usa-alert variant="${args.variant}" heading="${args.heading}"> </usa-alert>
  `,
};

// Custom content via slot
export const CustomContent: Story = {
  name: 'Custom Content',
  args: {
    variant: 'info',
    heading: 'Custom Content',
  },
  render: (args) => html`
    <usa-alert variant="${args.variant}" heading="${args.heading}">
      <p>This alert contains custom HTML content including:</p>
      <ul>
        <li>A bulleted list</li>
        <li>A <a href="#" class="usa-link">link</a></li>
        <li><strong>Bold text</strong></li>
      </ul>
      <p>You can put any HTML content in the slot.</p>
    </usa-alert>
  `,
};

// Multiple alerts - Static demo showing multiple alerts together
export const MultipleAlerts: Story = {
  name: 'Multiple Alerts',
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div class="display-flex flex-column gap-2">
      <usa-alert variant="success" heading="Success"> Your changes have been saved. </usa-alert>

      <usa-alert variant="warning" heading="Warning" slim>
        Please review your input before continuing.
      </usa-alert>

      <usa-alert variant="info" slim no-icon>
        New features are available in your account.
      </usa-alert>
    </div>
  `,
};

// Form validation example - Static demo showing form validation pattern
export const FormValidation: Story = {
  name: 'Form Validation',
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div class="maxw-tablet">
      <usa-alert variant="error" heading="Please correct the following errors:">
        <ul class="usa-list">
          <li>Email address is required</li>
          <li>Password must be at least 8 characters</li>
          <li>Phone number format is invalid</li>
        </ul>
      </usa-alert>

      <div class="margin-top-4">
        <usa-alert variant="success"> Form submitted successfully! </usa-alert>
      </div>
    </div>
  `,
};

// Interactive Demo - Complex interactive example with buttons
export const InteractiveDemo: Story = {
  name: 'Interactive Demo',
  parameters: {
    controls: { disable: true }, // Complex demo - uses custom buttons for interaction
  },
  render: () => html`
    <div>
      <h3>Alert Demo</h3>
      <p>Click buttons below to see different alert types:</p>

      <button
        @click="${() => {
          const container = document.getElementById('demo-container');
          if (container) {
            container.innerHTML = `<usa-alert variant="success" heading="Success!">Your action was completed successfully.</usa-alert>`;
          }
        }}"
      >
        Show Success Alert
      </button>

      <button
        @click="${() => {
          const container = document.getElementById('demo-container');
          if (container) {
            container.innerHTML = `<usa-alert variant="error" heading="Error">Something went wrong. Please try again.</usa-alert>`;
          }
        }}"
      >
        Show Error Alert
      </button>

      <button
        @click="${() => {
          const container = document.getElementById('demo-container');
          if (container) {
            container.innerHTML = `<usa-alert variant="warning" heading="Warning">Please be aware of this important information.</usa-alert>`;
          }
        }}"
      >
        Show Warning Alert
      </button>

      <button
        @click="${() => {
          const container = document.getElementById('demo-container');
          if (container) {
            container.innerHTML = '';
          }
        }}"
      >
        Clear Alerts
      </button>

      <div id="demo-container" class="margin-top-2 minw-card"></div>
    </div>
  `,
};
