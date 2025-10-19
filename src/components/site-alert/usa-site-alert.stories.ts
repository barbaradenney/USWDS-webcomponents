import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './index.js';
import type { USASiteAlert } from './usa-site-alert.js';

const meta: Meta<USASiteAlert> = {
  title: 'Components/Site Alert',
  component: 'usa-site-alert',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
The USA Site Alert component provides prominent site-wide notifications for websites.
It supports both informational and emergency alerts with USWDS styling and accessibility features.
Perfect for system maintenance notices, policy updates, emergency communications, and important announcements.

## Features
- Two alert types: info and emergency
- Closable alerts with keyboard support
- Slim and no-icon variants
- Support for both property and slot content
- Light DOM for USWDS CSS compatibility
- Consistent styling and accessibility
        `,
      },
    },
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['info', 'emergency'],
      description: 'Type of site alert (info or emergency)',
    },
    heading: {
      control: 'text',
      description: 'Alert heading text',
    },
    content: {
      control: 'text',
      description: 'HTML content to display (alternative to slot content)',
    },
    slim: {
      control: 'boolean',
      description: 'Use slim variant with reduced padding',
    },
    noIcon: {
      control: 'boolean',
      description: 'Remove the alert icon',
    },
    closable: {
      control: 'boolean',
      description: 'Allow users to close the alert',
    },
    visible: {
      control: 'boolean',
      description: 'Control alert visibility',
    },
    closeLabel: {
      control: 'text',
      description: 'Accessible label for close button',
    },
  },
};

export default meta;
type Story = StoryObj<USASiteAlert>;

export const Default: Story = {
  args: {
    type: 'info',
    heading: 'System Maintenance Notice',
    visible: true,
  },
  render: (args) => html`
    <usa-site-alert
      type="${args.type}"
      heading="${args.heading}"
      ?slim=${args.slim}
      ?no-icon=${args.noIcon}
      ?closable=${args.closable}
      ?visible=${args.visible}
      close-label="${args.closeLabel}"
    >
      <p>
        The system will be unavailable for routine maintenance on Saturday, March 30 from 11:00 PM
        to 5:00 AM EST.
      </p>
      <p>
        <strong>Alternative services:</strong> Call 1-800-555-0123 for urgent matters during the
        maintenance window.
      </p>
    </usa-site-alert>
  `,
};

export const AllVariants: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => html`
    <div class="display-grid grid-gap-2">
      <div>
        <h3 class="margin-bottom-2">Info Alert (Default)</h3>
        <usa-site-alert type="info" heading="Policy Update">
          <p>
            New cybersecurity requirements are now in effect for all organizations.
            <a href="#guidance">View implementation guidance</a>.
          </p>
        </usa-site-alert>
      </div>

      <div>
        <h3 class="margin-bottom-2">Emergency Alert</h3>
        <usa-site-alert type="emergency" heading="Building Emergency">
          <p>
            <strong>URGENT:</strong> Offices are closed due to severe weather conditions. Essential
            personnel should follow emergency protocols.
          </p>
        </usa-site-alert>
      </div>

      <div>
        <h3 class="margin-bottom-2">Slim Variant</h3>
        <usa-site-alert type="info" heading="Brief Notice" slim>
          <p>System deadline extended to April 18, 2024. <a href="#details">More details</a>.</p>
        </usa-site-alert>
      </div>

      <div>
        <h3 class="margin-bottom-2">No Icon Variant</h3>
        <usa-site-alert type="info" heading="Clean Alert Style" no-icon>
          <p>
            This alert uses the no-icon variant for a cleaner appearance when icons are not needed.
          </p>
        </usa-site-alert>
      </div>

      <div>
        <h3 class="margin-bottom-2">Closable Alert</h3>
        <usa-site-alert type="info" heading="Dismissible Notification" closable>
          <p>
            This alert can be closed by users. Try clicking the close button or pressing Escape when
            focused.
          </p>
        </usa-site-alert>
      </div>
    </div>
  `,
};

export const CustomContent: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Demonstrates using the default slot for custom content.',
      },
    },
  },
  render: () => html`
    <usa-site-alert type="info" heading="Custom Content Example" closable>
      <p>This is custom slotted content demonstrating flexible content options.</p>
      <p>Slots allow you to provide your own HTML content to the component.</p>
      <ul>
        <li>Full control over content structure</li>
        <li>Rich HTML formatting support</li>
        <li>Flexible layout options</li>
      </ul>
    </usa-site-alert>
  `,
};
