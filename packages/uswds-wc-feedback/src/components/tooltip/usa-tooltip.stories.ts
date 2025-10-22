import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './index.ts';
import '@uswds-wc/data-display/icon';
import type { USATooltip } from './usa-tooltip.js';

const meta: Meta<USATooltip> = {
  title: 'Feedback/Tooltip',
  component: 'usa-tooltip',
  parameters: {
    layout: 'padded',
    // Improve tooltip positioning in Storybook iframe
    viewport: {
      defaultViewport: 'large',
    },
    backgrounds: {
      default: 'light',
    },
    docs: {
      description: {
        component: `
# USA Tooltip

The USA Tooltip component uses official USWDS styling and behavior.
This component provides contextual help text that appears on hover and focus, following USWDS patterns.

## Usage Guidelines

- Follow USWDS design system guidelines
- Component uses official USWDS CSS classes
- Accessibility features are built-in
- Supports four positions: top, bottom, left, right
- Triggers on mouseover and focus events

## Events

- \`tooltip-show\` - Dispatched when tooltip is shown
- \`tooltip-hide\` - Dispatched when tooltip is hidden

## Accessibility

- Uses proper ARIA roles and attributes (tooltip, aria-describedby)
- Keyboard navigation support (Escape to close)
- Screen reader compatible
- Focus management for keyboard users
- Follows USWDS accessibility patterns
        `,
      },
    },
  },
  argTypes: {
    text: {
      control: { type: 'text' },
      description: 'Tooltip text content',
    },
    position: {
      control: { type: 'select' },
      options: ['top', 'bottom', 'left', 'right'],
      description: 'Position of the tooltip relative to the trigger element',
    },
  },
  args: {
    text: 'This is a helpful tooltip',
    position: 'top',
  },
};

export default meta;
type Story = StoryObj<USATooltip>;

export const Default: Story = {
  render: (args) => html`
    <div class="margin-4 padding-2 display-flex flex-justify-center">
      <usa-tooltip
        text="${args.text}"
        position="${args.position}"
        @tooltip-show="${() => console.log('Tooltip shown')}"
        @tooltip-hide="${() => console.log('Tooltip hidden')}"
      >
        <button type="button" class="usa-button">Hover for tooltip</button>
      </usa-tooltip>
    </div>
  `,
};

export const OnLink: Story = {
  args: {
    text: 'This link opens in a new window',
    position: 'top',
  },
  render: (args) => html`
    <p>
      Visit our
      <usa-tooltip
        text="${args.text}"
        position="${args.position}"
        @tooltip-show="${() => console.log('Tooltip shown')}"
        @tooltip-hide="${() => console.log('Tooltip hidden')}"
      >
        <a href="#">documentation site</a>
      </usa-tooltip>
      for more information.
    </p>
  `,
};

export const OnIconButton: Story = {
  args: {
    text: 'Get help with this form',
    position: 'right',
  },
  render: (args) => html`
    <div class="display-flex flex-align-center gap-1">
      <label for="sample-input">Email address</label>
      <usa-tooltip
        text="${args.text}"
        position="${args.position}"
        @tooltip-show="${() => console.log('Tooltip shown')}"
        @tooltip-hide="${() => console.log('Tooltip hidden')}"
      >
        <button type="button" class="usa-button usa-button--unstyled padding-105 text-center" aria-label="Help">
          <usa-icon name="help" decorative="true"></usa-icon>
        </button>
      </usa-tooltip>
      <input type="email" id="sample-input" class="usa-input" />
    </div>
  `,
};

export const TopPosition: Story = {
  args: {
    text: 'This tooltip appears above the trigger',
    position: 'top',
  },
  render: (args) => html`
    <div class="margin-4 padding-2 display-flex flex-justify-center">
      <usa-tooltip
        text="${args.text}"
        position="${args.position}"
        @tooltip-show="${() => console.log('Tooltip shown')}"
        @tooltip-hide="${() => console.log('Tooltip hidden')}"
      >
        <button type="button" class="usa-button">Top tooltip</button>
      </usa-tooltip>
    </div>
  `,
};

export const BottomPosition: Story = {
  args: {
    text: 'This tooltip appears below the trigger',
    position: 'bottom',
  },
  render: (args) => html`
    <div class="margin-4 padding-2 display-flex flex-justify-center">
      <usa-tooltip
        text="${args.text}"
        position="${args.position}"
        @tooltip-show="${() => console.log('Tooltip shown')}"
        @tooltip-hide="${() => console.log('Tooltip hidden')}"
      >
        <button type="button" class="usa-button usa-button--outline">Bottom tooltip</button>
      </usa-tooltip>
    </div>
  `,
};

export const LeftPosition: Story = {
  args: {
    text: 'This tooltip appears to the left',
    position: 'left',
  },
  render: (args) => html`
    <div class="margin-left-205">
      <usa-tooltip
        text="${args.text}"
        position="${args.position}"
        @tooltip-show="${() => console.log('Tooltip shown')}"
        @tooltip-hide="${() => console.log('Tooltip hidden')}"
      >
        <button type="button" class="usa-button usa-button--secondary">Left tooltip</button>
      </usa-tooltip>
    </div>
  `,
};

export const RightPosition: Story = {
  args: {
    text: 'This tooltip appears to the right',
    position: 'right',
  },
  render: (args) => html`
    <div class="margin-4 padding-2 display-flex flex-justify-center">
      <usa-tooltip
        text="${args.text}"
        position="${args.position}"
        @tooltip-show="${() => console.log('Tooltip shown')}"
        @tooltip-hide="${() => console.log('Tooltip hidden')}"
      >
        <button type="button" class="usa-button usa-button--accent-warm">Right tooltip</button>
      </usa-tooltip>
    </div>
  `,
};

export const WithUtilityClass: Story = {
  args: {
    text: 'This tooltip has additional styling classes',
    position: 'top',
  },
  render: (args) => html`
    <usa-tooltip
      text="${args.text}"
      position="${args.position}"
      @tooltip-show="${() => console.log('Tooltip shown')}"
      @tooltip-hide="${() => console.log('Tooltip hidden')}"
    >
      <button type="button" class="usa-button">Tooltip with classes</button>
    </usa-tooltip>
  `,
};

export const OnInput: Story = {
  args: {
    text: 'This tooltip appears when the input receives focus or hover',
    position: 'top',
  },
  render: (args) => html`
    <usa-tooltip
      text="${args.text}"
      position="${args.position}"
      @tooltip-show="${() => console.log('Tooltip shown')}"
      @tooltip-hide="${() => console.log('Tooltip hidden')}"
    >
      <input type="text" class="usa-input" placeholder="Focus or hover me" />
    </usa-tooltip>
  `,
};

export const LongText: Story = {
  args: {
    text: 'This is a much longer tooltip text that demonstrates how tooltips handle longer content. It provides detailed information that might be helpful to users but would clutter the interface if always visible.',
    position: 'top',
  },
  render: (args) => html`
    <usa-tooltip
      text="${args.text}"
      position="${args.position}"
      @tooltip-show="${() => console.log('Tooltip shown')}"
      @tooltip-hide="${() => console.log('Tooltip hidden')}"
    >
      <button type="button" class="usa-button">Long tooltip text</button>
    </usa-tooltip>
  `,
};

export const MultipleTooltips: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div class="display-flex gap-1 flex-wrap">
      <usa-tooltip
        text="First tooltip"
        position="top"
        @tooltip-show="${() => console.log('First tooltip shown')}"
        @tooltip-hide="${() => console.log('First tooltip hidden')}"
      >
        <button type="button" class="usa-button">First</button>
      </usa-tooltip>

      <usa-tooltip
        text="Second tooltip"
        position="bottom"
        @tooltip-show="${() => console.log('Second tooltip shown')}"
        @tooltip-hide="${() => console.log('Second tooltip hidden')}"
      >
        <button type="button" class="usa-button usa-button--outline">Second</button>
      </usa-tooltip>

      <usa-tooltip
        text="Third tooltip"
        position="left"
        @tooltip-show="${() => console.log('Third tooltip shown')}"
        @tooltip-hide="${() => console.log('Third tooltip hidden')}"
      >
        <button type="button" class="usa-button usa-button--secondary">Third</button>
      </usa-tooltip>
    </div>
  `,
};

export const FormHelp: Story = {
  args: {
    text: 'Your tax ID is used to verify your identity and eligibility. This information is protected under privacy policies.',
    position: 'right',
  },
  render: (args) => html`
    <div class="maxw-card">
      <label class="usa-label" for="tax-id-input">
        Tax ID Number <span class="usa-hint">(Required)</span>
        <usa-tooltip
          text="${args.text}"
          position="${args.position}"
          @tooltip-show="${() => console.log('Tax ID help tooltip shown')}"
          @tooltip-hide="${() => console.log('Tax ID help tooltip hidden')}"
        >
          <button
            type="button"
            class="usa-button usa-button--unstyled padding-105 text-center"
            aria-label="More information about tax ID requirement"
          >
            <svg
              class="usa-icon usa-icon--size-3"
              aria-hidden="true"
              focusable="false"
              role="img"
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" />
              <path
                d="M9,9h0a3,3,0,0,1,6,0c0,2-3,3-3,3"
                stroke="currentColor"
                stroke-width="2"
                fill="none"
              />
              <circle cx="12" cy="17" r="1" fill="currentColor" />
            </svg>
          </button>
        </usa-tooltip>
      </label>
      <input type="text" id="tax-id-input" class="usa-input" placeholder="XXX-XX-XXXX" />
    </div>
  `,
};

export const AccessLevelInfo: Story = {
  args: {
    text: 'Access level determines permissions to system resources. Contact your administrator for access updates.',
    position: 'bottom',
  },
  render: (args) => html`
    <div class="border border-base-lighter padding-1 radius-md bg-base-lightest">
      <h3 class="margin-0 margin-bottom-1">Personnel Information</h3>
      <div class="display-flex flex-align-center gap-1">
        <span><strong>Access Level:</strong> Standard</span>
        <usa-tooltip
          text="${args.text}"
          position="${args.position}"
          @tooltip-show="${() => console.log('Access info tooltip shown')}"
          @tooltip-hide="${() => console.log('Access info tooltip hidden')}"
        >
          <span tabindex="0" class="cursor-help text-primary text-underline">
            ℹ️ More info
          </span>
        </usa-tooltip>
      </div>
    </div>
  `,
};

export const BudgetAllocationHelp: Story = {
  args: {
    text: 'Budget allocations must align with approved spending categories. Transfers between categories require supervisor approval.',
    position: 'top',
  },
  render: (args) => html`
    <div class="border border-base-lighter padding-1 radius-md">
      <div class="display-flex flex-align-center gap-05 margin-bottom-1">
        <h4 class="margin-0">2024 Budget Allocation</h4>
        <usa-tooltip
          text="${args.text}"
          position="${args.position}"
          @tooltip-show="${() => console.log('Budget help tooltip shown')}"
          @tooltip-hide="${() => console.log('Budget help tooltip hidden')}"
        >
          <button
            type="button"
            class="usa-button usa-button--unstyled padding-105 text-center"
            aria-label="Budget allocation help"
          >
            <svg
              class="usa-icon"
              aria-hidden="true"
              focusable="false"
              role="img"
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" />
              <path
                d="M9,9h0a3,3,0,0,1,6,0c0,2-3,3-3,3"
                stroke="currentColor"
                stroke-width="2"
                fill="none"
              />
              <circle cx="12" cy="17" r="1" fill="currentColor" />
            </svg>
          </button>
        </usa-tooltip>
      </div>
      <div class="grid-row grid-gap-2">
        <div class="grid-col-6"><strong>Personnel:</strong> $2,500,000</div>
        <div class="grid-col-6"><strong>Operations:</strong> $750,000</div>
        <div class="grid-col-6"><strong>Equipment:</strong> $1,200,000</div>
        <div class="grid-col-6"><strong>Travel:</strong> $150,000</div>
      </div>
    </div>
  `,
};

export const AccessibilityHelp: Story = {
  args: {
    text: 'This form meets WCAG accessibility standards. Use Tab to navigate, Enter to activate controls, and Escape to close dialogs.',
    position: 'top',
  },
  render: (args) => html`
    <div class="border-2px border-primary padding-1 radius-md bg-primary-lighter">
      <div class="display-flex flex-align-center gap-05 margin-bottom-1">
        <h4 class="margin-0">Accessible Form</h4>
        <usa-tooltip
          text="${args.text}"
          position="${args.position}"
          @tooltip-show="${() => console.log('Accessibility help tooltip shown')}"
          @tooltip-hide="${() => console.log('Accessibility help tooltip hidden')}"
        >
          <span
            tabindex="0"
            role="button"
            class="cursor-help font-sans-lg"
            aria-label="Accessibility information"
          >
            ♿
          </span>
        </usa-tooltip>
      </div>
      <p class="margin-0">
        All form controls are keyboard accessible and screen reader compatible.
      </p>
    </div>
  `,
};

export const DataPrivacyNotice: Story = {
  args: {
    text: 'Personal information is collected to process your application and may be used as permitted by applicable privacy laws.',
    position: 'right',
  },
  render: (args) => html`
    <div class="bg-warning-lighter border border-warning padding-1 radius-md">
      <div class="display-flex flex-align-start gap-05">
        <span class="font-body-xl">🔒</span>
        <div>
          <div class="display-flex flex-align-center gap-1">
            <strong>Privacy Notice</strong>
            <usa-tooltip
              text="${args.text}"
              position="${args.position}"
              @tooltip-show="${() => console.log('Privacy notice tooltip shown')}"
              @tooltip-hide="${() => console.log('Privacy notice tooltip hidden')}"
            >
              <button
                type="button"
                class="usa-button usa-button--unstyled padding-105 text-center"
                aria-label="View full privacy notice"
              >
                <small class="text-underline text-primary">Read full notice</small>
              </button>
            </usa-tooltip>
          </div>
          <p class="margin-top-05 margin-bottom-0 font-body-xs">
            Your personal information is protected under privacy laws.
          </p>
        </div>
      </div>
    </div>
  `,
};

export const EmergencyContactInfo: Story = {
  args: {
    text: 'Emergency contact information is used only in case of workplace emergencies or critical situations. Contact HR to update this information.',
    position: 'bottom',
  },
  render: (args) => html`
    <div class="maxw-card-lg">
      <fieldset class="usa-fieldset">
        <legend class="usa-legend">Emergency Contact Information</legend>

        <div class="grid-row grid-gap-05 flex-align-center margin-bottom-1">
          <label class="usa-label grid-col-fill" for="emergency-name">Contact Name</label>
          <usa-tooltip
            text="${args.text}"
            position="${args.position}"
            @tooltip-show="${() => console.log('Emergency contact tooltip shown')}"
            @tooltip-hide="${() => console.log('Emergency contact tooltip hidden')}"
            class="grid-col-auto"
          >
            <button
              type="button"
              class="usa-button usa-button--unstyled padding-105 text-center"
              aria-label="Emergency contact information help"
            >
              <svg
                class="usa-icon"
                aria-hidden="true"
                focusable="false"
                role="img"
              >
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" />
                <path
                  d="M9,9h0a3,3,0,0,1,6,0c0,2-3,3-3,3"
                  stroke="currentColor"
                  stroke-width="2"
                  fill="none"
                />
                <circle cx="12" cy="17" r="1" fill="currentColor" />
              </svg>
            </button>
          </usa-tooltip>
        </div>

        <input type="text" id="emergency-name" class="usa-input" />

        <label class="usa-label margin-top-2" for="emergency-phone">Contact Phone</label>
        <input type="tel" id="emergency-phone" class="usa-input" />
      </fieldset>
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
    <usa-tooltip>
      <p>This is custom slotted content.</p>
      <p>Slots allow you to provide your own HTML content to the component.</p>
    </usa-tooltip>
  `,
};
