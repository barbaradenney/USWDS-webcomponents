import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './index.js';
import type { USAModal } from './usa-modal.js';

const meta: Meta<USAModal> = {
  title: 'Feedback/Modal',
  component: 'usa-modal',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
The USA Modal component provides accessible dialog windows for displaying important information, confirmations,
and forms without navigating away from the current page. It includes focus trapping, keyboard navigation,
and proper ARIA attributes.

## Features
- Focus management and trapping
- Keyboard navigation (Tab, Escape)
- Backdrop click to close (configurable)
- Force action mode for critical dialogs
- Large modal variant for complex content
- Built-in or external trigger buttons
- Full USWDS compliance
        `,
      },
    },
  },
  argTypes: {
    heading: {
      control: 'text',
      description: 'Modal title/heading text',
    },
    description: {
      control: 'text',
      description: 'Description text below heading',
    },
    triggerText: {
      control: 'text',
      description: 'Text for the built-in trigger button',
    },
    showTrigger: {
      control: 'boolean',
      description: 'Whether to show the built-in trigger button',
    },
    large: {
      control: 'boolean',
      description: 'Use large modal variant',
    },
    forceAction: {
      control: 'boolean',
      description: 'Prevent closing without action (no X button, no Escape)',
    },
    primaryButtonText: {
      control: 'text',
      description: 'Text for primary action button',
    },
    secondaryButtonText: {
      control: 'text',
      description: 'Text for secondary action button',
    },
    showSecondaryButton: {
      control: 'boolean',
      description: 'Show secondary action button',
    },
  },
};

export default meta;
type Story = StoryObj<USAModal>;

export const Default: Story = {
  render: (args) => html`
    <usa-modal
      .heading=${args.heading}
      .description=${args.description}
      .triggerText=${args.triggerText}
      .primaryButtonText=${args.primaryButtonText}
      .secondaryButtonText=${args.secondaryButtonText}
      .showTrigger=${args.showTrigger}
      .large=${args.large}
      .forceAction=${args.forceAction}
      .showSecondaryButton=${args.showSecondaryButton}
    ></usa-modal>
  `,
  args: {
    heading: 'Modal Heading',
    description: 'This is a basic modal dialog with default settings.',
    triggerText: 'Open Modal',
    primaryButtonText: 'Continue',
    secondaryButtonText: 'Cancel',
    showTrigger: true,
    large: false,
    forceAction: false,
    showSecondaryButton: true,
  },
};

export const LargeModal: Story = {
  render: (args) => html`
    <usa-modal
      .heading=${args.heading}
      .description=${args.description}
      .triggerText=${args.triggerText}
      .primaryButtonText=${args.primaryButtonText || 'Continue'}
      .secondaryButtonText=${args.secondaryButtonText || 'Cancel'}
      .showTrigger=${args.showTrigger !== false}
      .large=${args.large}
      .forceAction=${args.forceAction}
      .showSecondaryButton=${args.showSecondaryButton !== false}
    ></usa-modal>
  `,
  args: {
    heading: 'Large Modal Example',
    description:
      'This modal demonstrates the large variant with more horizontal space for tables, forms, or detailed content.',
    triggerText: 'Open Large Modal',
    large: true,
    showSecondaryButton: true,
  },
};

export const ForceActionModal: Story = {
  render: (args) => html`
    <usa-modal
      .heading=${args.heading}
      .description=${args.description}
      .triggerText=${args.triggerText}
      .primaryButtonText=${args.primaryButtonText || 'Continue'}
      .secondaryButtonText=${args.secondaryButtonText || 'Cancel'}
      .showTrigger=${args.showTrigger !== false}
      .large=${args.large}
      .forceAction=${args.forceAction}
      .showSecondaryButton=${args.showSecondaryButton !== false}
    ></usa-modal>
  `,
  args: {
    heading: 'Confirm Critical Action',
    description:
      'This modal requires you to choose an action. You cannot close it by clicking outside or pressing Escape.',
    triggerText: 'Open Force Action Modal',
    forceAction: true,
    primaryButtonText: 'Confirm',
    secondaryButtonText: 'Cancel',
    showSecondaryButton: true,
  },
};

export const SingleActionModal: Story = {
  render: (args) => html`
    <usa-modal
      .heading=${args.heading}
      .description=${args.description}
      .triggerText=${args.triggerText}
      .primaryButtonText=${args.primaryButtonText || 'Continue'}
      .secondaryButtonText=${args.secondaryButtonText || 'Cancel'}
      .showTrigger=${args.showTrigger !== false}
      .large=${args.large}
      .forceAction=${args.forceAction}
      .showSecondaryButton=${args.showSecondaryButton}
    ></usa-modal>
  `,
  args: {
    heading: 'Information Notice',
    description: 'This modal has only one action button, useful for simple notifications.',
    triggerText: 'Show Notice',
    primaryButtonText: 'Got it',
    showSecondaryButton: false,
  },
};

// =============================================================================
// SLOT-BASED CUSTOMIZATION EXAMPLES
// These stories show how to use slots for advanced customization
// =============================================================================

/**
 * FORM IN MODAL
 * Real-world example: User feedback form with proper USWDS form styling
 */
export const FormExample: Story = {
  parameters: {
    docs: {
      description: {
        story: `
**Real-world example: A feedback form inside a modal**

This shows:
- Using \`slot="body"\` to add a complete form
- Proper USWDS form classes and structure
- Large modal for better form layout
- How the form appears inside the modal body
        `,
      },
    },
  },
  render: () => html`
    <usa-modal
      heading="Share Your Feedback"
      description="Help us improve by sharing your thoughts."
      trigger-text="Give Feedback"
      show-trigger
      large
      primary-button-text="Submit Feedback"
      secondary-button-text="Cancel"
    >
      <div slot="body">
        <form class="margin-top-2">
          <label class="usa-label" for="feedback-name">Your Name</label>
          <input class="usa-input" id="feedback-name" name="name" type="text" required />

          <label class="usa-label margin-top-2" for="feedback-email">Email Address</label>
          <input class="usa-input" id="feedback-email" name="email" type="email" required />

          <label class="usa-label margin-top-2" for="feedback-category">Category</label>
          <select class="usa-select" id="feedback-category" name="category">
            <option value="">- Select -</option>
            <option value="bug">Bug Report</option>
            <option value="feature">Feature Request</option>
            <option value="general">General Feedback</option>
          </select>

          <label class="usa-label margin-top-2" for="feedback-message">Your Message</label>
          <textarea
            class="usa-textarea"
            id="feedback-message"
            name="message"
            rows="5"
            required
          ></textarea>
        </form>
      </div>
    </usa-modal>
  `,
};

/**
 * CONFIRMATION WITH DETAILS
 * Real-world example: Delete confirmation with item details
 */
export const ConfirmationWithDetails: Story = {
  parameters: {
    docs: {
      description: {
        story: `
**Real-world example: Confirmation dialog with details**

This shows:
- Using \`slot="body"\` to add detailed information
- Force action mode for critical decisions
- Clear primary/secondary button labels
- Structured content with lists and emphasis
        `,
      },
    },
  },
  render: () => html`
    <usa-modal
      heading="Delete User Account?"
      description="This action cannot be undone. The following data will be permanently deleted:"
      trigger-text="Delete Account"
      show-trigger
      force-action
      primary-button-text="Yes, Delete Account"
      secondary-button-text="Cancel"
    >
      <div slot="body" class="margin-top-2">
        <ul class="usa-list">
          <li>All personal information and profile data</li>
          <li>12 saved projects and associated files</li>
          <li>Comment history (324 comments)</li>
          <li>Account settings and preferences</li>
        </ul>

        <div class="usa-alert usa-alert--warning usa-alert--slim margin-top-2" role="alert">
          <div class="usa-alert__body">
            <p class="usa-alert__text">
              <strong>Warning:</strong> This action is immediate and cannot be reversed.
            </p>
          </div>
        </div>
      </div>
    </usa-modal>
  `,
};

/**
 * MULTI-STEP ACTIONS
 * Real-world example: Custom footer with multiple action options
 */
export const MultiStepActions: Story = {
  parameters: {
    docs: {
      description: {
        story: `
**Real-world example: Save with multiple options**

This shows:
- Using \`slot="footer"\` to create custom button groups
- Multiple action buttons (Save, Save as Draft, Cancel)
- Proper USWDS button variants and styling
- Required \`data-close-modal\` attribute on all buttons
        `,
      },
    },
  },
  render: () => html`
    <usa-modal
      heading="Save Document"
      description="Choose how you want to save your changes."
      trigger-text="Save Options"
      show-trigger
    >
      <div slot="body">
        <p>You have unsaved changes to "Project Proposal - Draft 3.docx"</p>
        <p class="text-base-dark margin-top-1">Last saved: 10 minutes ago</p>
      </div>

      <ul slot="footer" class="usa-button-group">
        <li class="usa-button-group__item">
          <button type="button" class="usa-button" data-close-modal>Save & Close</button>
        </li>
        <li class="usa-button-group__item">
          <button type="button" class="usa-button usa-button--outline" data-close-modal>
            Save as Draft
          </button>
        </li>
        <li class="usa-button-group__item">
          <button
            type="button"
            class="usa-button usa-button--unstyled padding-105 text-center"
            data-close-modal
          >
            Discard Changes
          </button>
        </li>
      </ul>
    </usa-modal>
  `,
};

/**
 * RICH CONTENT DISPLAY
 * Real-world example: Terms and conditions with formatted content
 */
export const RichContentExample: Story = {
  parameters: {
    docs: {
      description: {
        story: `
**Real-world example: Terms and conditions display**

This shows:
- Using \`slot="body"\` for long-form content
- Proper USWDS prose styling
- Large modal for better readability
- Structured content with headings and lists
        `,
      },
    },
  },
  render: () => html`
    <usa-modal
      heading="Terms of Service"
      description="Please review our terms before continuing."
      trigger-text="View Terms"
      show-trigger
      large
      primary-button-text="I Accept"
      secondary-button-text="Decline"
    >
      <div slot="body" class="usa-prose margin-top-2">
        <h3>1. Acceptance of Terms</h3>
        <p>
          By accessing and using this service, you accept and agree to be bound by the terms and
          provision of this agreement.
        </p>

        <h3>2. Privacy Policy</h3>
        <p>Your use of our service is also governed by our Privacy Policy, which includes:</p>
        <ul>
          <li>How we collect and use your personal information</li>
          <li>Your rights regarding your data</li>
          <li>How we protect your information</li>
        </ul>

        <h3>3. User Responsibilities</h3>
        <p>You agree to:</p>
        <ul>
          <li>Provide accurate and complete information</li>
          <li>Maintain the security of your account</li>
          <li>Comply with all applicable laws and regulations</li>
        </ul>

        <p class="text-base-dark margin-top-2">
          <em>Last updated: January 15, 2024</em>
        </p>
      </div>
    </usa-modal>
  `,
};

/**
 * ANNOUNCEMENT WITH BRANDING
 * Real-world example: Feature announcement with custom heading
 */
export const BrandedAnnouncement: Story = {
  parameters: {
    docs: {
      description: {
        story: `
**Real-world example: Feature announcement with branding**

This shows:
- Using \`slot="heading"\` for custom heading with tags/badges
- Using \`slot="description"\` for rich formatted intro
- Using \`slot="body"\` for the main content
- Alert component nested inside modal
- Complete visual customization while maintaining USWDS structure
        `,
      },
    },
  },
  render: () => html`
    <usa-modal trigger-text="What's New" show-trigger large>
      <!-- Custom heading with badge -->
      <span slot="heading" class="display-flex flex-align-center">
        <span class="usa-tag bg-accent-cool margin-right-05">NEW</span>
        <span>Version 2.0 Released!</span>
      </span>

      <!-- Rich description -->
      <div slot="description">
        <p class="font-body-lg margin-0"><strong>We've launched major improvements!</strong></p>
        <p class="text-base-dark margin-top-1">
          Thank you for your patience. Here's what's new in version 2.0:
        </p>
      </div>

      <!-- Main content with features list -->
      <div slot="body">
        <ul class="usa-list margin-top-2">
          <li>
            <strong>🚀 Enhanced Performance:</strong>
            Pages load 50% faster with optimized code
          </li>
          <li>
            <strong>🎨 Modern Design:</strong>
            Refreshed interface with improved accessibility
          </li>
          <li>
            <strong>📊 Advanced Analytics:</strong>
            New reporting dashboard with real-time insights
          </li>
          <li>
            <strong>🔒 Better Security:</strong>
            End-to-end encryption for all data
          </li>
        </ul>

        <div class="usa-alert usa-alert--info usa-alert--slim margin-top-3" role="alert">
          <div class="usa-alert__body">
            <p class="usa-alert__text">
              Your data has been automatically migrated. No action required!
            </p>
          </div>
        </div>
      </div>
    </usa-modal>
  `,
};
