import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './index.ts';
import type { USAButtonGroup } from './usa-button-group.js';

const meta: Meta<USAButtonGroup> = {
  title: 'Actions/Button Group',
  component: 'usa-button-group',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
The Button Group component groups related actions together with consistent spacing and styling. It supports both programmatic button configuration and slotted content for maximum flexibility.

Features:
- Multiple button variants (primary, secondary, outline, base)
- Support for different button types (button, submit, reset)
- Segmented group styling option
- Individual button state management (disabled)
- Custom event handling for user interactions
- Form integration support
        `,
      },
    },
  },
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['default', 'segmented'],
      description: 'Button group layout style',
    },
    buttons: {
      control: 'object',
      description: 'Array of button configurations',
    },
  },
};

export default meta;
type Story = StoryObj<USAButtonGroup>;

// Basic button group examples
export const Default: Story = {
  args: {
    type: 'default',
    buttons: [
      { text: 'Primary Action', variant: 'primary', type: 'button' },
      { text: 'Secondary Action', variant: 'secondary', type: 'button' },
      { text: 'Cancel', variant: 'outline', type: 'button' },
    ],
  },
};

export const Segmented: Story = {
  args: {
    type: 'segmented',
    activeIndex: 0,
    buttons: [
      { text: 'View', type: 'button' },
      { text: 'Edit', type: 'button' },
      { text: 'Delete', type: 'button' },
    ],
  },
  render: (args) => html`
    <div>
      <usa-alert variant="info" slim class="margin-bottom-2">
        <h3 class="usa-alert__heading margin-top-0 margin-bottom-1">Interactive Segmented Button Group</h3>
        <p class="margin-0 font-body-xs">
          Click buttons to switch between modes. The active button shows in filled style (primary),
          while inactive buttons show in outline style.
        </p>
      </usa-alert>

      <usa-button-group
        .type=${args.type}
        .activeIndex=${args.activeIndex}
        .buttons=${args.buttons}
        @button-click=${(e: CustomEvent) => {
          const { button, index } = e.detail;
          console.log(`Switched to: ${button.text} (index: ${index})`);
        }}
      ></usa-button-group>

      <usa-alert variant="info" slim class="margin-top-3">
        <h4 class="usa-alert__heading margin-top-0 margin-bottom-1">How It Works:</h4>
        <ul class="usa-list margin-y-1 padding-left-3 font-body-xs">
          <li>Click any button to activate it</li>
          <li>Active button displays in <strong>filled (primary)</strong> style</li>
          <li>Other buttons display in <strong>outline</strong> style</li>
          <li>Only one button can be active at a time</li>
          <li>Perfect for view switchers, tabs, or mode selectors</li>
        </ul>
      </usa-alert>
    </div>
  `,
};

export const AllVariants: Story = {
  args: {
    type: 'default',
    buttons: [
      { text: 'Primary', variant: 'primary', type: 'button' },
      { text: 'Secondary', variant: 'secondary', type: 'button' },
      { text: 'Outline', variant: 'outline', type: 'button' },
      { text: 'Base', variant: 'base', type: 'button' },
    ],
  },
};

export const WithDisabled: Story = {
  args: {
    type: 'default',
    buttons: [
      { text: 'Save', variant: 'primary', type: 'button' },
      { text: 'Save Draft', variant: 'secondary', type: 'button' },
      { text: 'Preview', variant: 'outline', type: 'button', disabled: true },
      { text: 'Cancel', variant: 'base', type: 'button' },
    ],
  },
};

// Form integration example
export const FormActions: Story = {
  args: {
    type: 'default',
    buttons: [
      { text: 'Submit', variant: 'primary', type: 'submit' },
      { text: 'Save Draft', variant: 'secondary', type: 'button' },
      { text: 'Clear Form', variant: 'outline', type: 'reset' },
    ],
  },
  render: (args) => html`
    <div>
      <form class="usa-form padding-2 border-1px border-base-lighter radius-md margin-bottom-2">
        <h3 class="margin-top-0">Sample Form</h3>
        <div class="margin-bottom-2">
          <label class="usa-label text-bold" for="name">Name:</label>
          <input class="usa-input maxw-mobile-lg" id="name" type="text" />
        </div>
        <div class="margin-bottom-2">
          <label class="usa-label text-bold" for="email">Email:</label>
          <input class="usa-input maxw-mobile-lg" id="email" type="email" />
        </div>

        <usa-button-group
          .type=${args.type}
          .buttons=${args.buttons}
          @button-click=${(e: CustomEvent) => {
            const { button } = e.detail;
            console.log('Form action:', button.text, 'Type:', button.type);

            if (button.type === 'submit') {
              e.preventDefault(); // Prevent actual form submission for demo
              alert('Form submitted! (Demo mode)');
            } else if (button.type === 'reset') {
              if (confirm('Are you sure you want to clear the form?')) {
                alert('Form cleared');
              } else {
                e.preventDefault();
              }
            } else {
              alert(`${button.text} clicked`);
            }
          }}
        ></usa-button-group>
      </form>

      <usa-alert variant="info" slim>
        <p class="margin-0">
          <strong>Form Integration:</strong> This example shows how button groups work within forms
          with submit, reset, and save draft functionality.
        </p>
      </usa-alert>
    </div>
  `,
};

// Layout and styling examples
export const LayoutComparison: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div>
      <div class="margin-bottom-4">
        <h3>Default Layout</h3>
        <usa-button-group
          type="default"
          .buttons=${[
            { text: 'Save', variant: 'primary' },
            { text: 'Cancel', variant: 'secondary' },
            { text: 'Help', variant: 'outline' },
          ]}
        ></usa-button-group>
      </div>

      <div class="margin-bottom-4">
        <h3>Segmented Layout</h3>
        <usa-button-group
          type="segmented"
          .buttons=${[
            { text: 'Save', variant: 'primary' },
            { text: 'Cancel', variant: 'outline' },
            { text: 'Help', variant: 'outline' },
          ]}
        ></usa-button-group>
      </div>

      <usa-alert variant="info" slim>
        <h4 class="usa-alert__heading">Layout Differences:</h4>
        <ul class="usa-list margin-y-1">
          <li><strong>Default:</strong> Standard spacing between buttons</li>
          <li><strong>Segmented:</strong> Connected buttons with shared borders</li>
        </ul>
      </usa-alert>
    </div>
  `,
};

export const InteractiveDemo: Story = {
  args: {
    type: 'default',
    buttons: [
      { text: 'Action 1', variant: 'primary', type: 'button' },
      { text: 'Action 2', variant: 'secondary', type: 'button' },
      { text: 'Action 3', variant: 'outline', type: 'button' },
      { text: 'Disabled', variant: 'base', type: 'button', disabled: true },
    ],
  },
  render: (args) => html`
    <div>
      <usa-alert variant="info" slim class="margin-bottom-2">
        <p class="margin-0">
          <strong>Try clicking the buttons!</strong> Each button dispatches a custom event with
          details about the clicked button.
        </p>
      </usa-alert>

      <usa-button-group
        .type=${args.type}
        .buttons=${args.buttons}
        @button-click=${(e: CustomEvent) => {
          const { button, index } = e.detail;
          console.log('Button clicked:', { button, index });

          if (button.disabled) {
            alert('This button is disabled');
            return;
          }

          alert(
            `Clicked: "${button.text}" (Index: ${index}, Variant: ${button.variant}, Type: ${button.type})`
          );
        }}
      ></usa-button-group>

      <usa-alert variant="info" slim class="margin-top-4">
        <h4 class="usa-alert__heading">Event Details:</h4>
        <p>Each button click fires a <code>button-click</code> event with:</p>
        <ul class="usa-list">
          <li><code>button</code>: Complete button configuration object</li>
          <li><code>index</code>: Button position in the array</li>
        </ul>
        <p>Check the browser console for full event data.</p>
      </usa-alert>
    </div>
  `,
};

export const CustomContent: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div>
      <h3 class="margin-bottom-2">Using Custom Content</h3>
      <usa-button-group type="default">
        <li class="usa-button-group__item">
          <button class="usa-button" type="button">Custom Primary</button>
        </li>
        <li class="usa-button-group__item">
          <button class="usa-button usa-button--secondary" type="button">Custom Secondary</button>
        </li>
        <li class="usa-button-group__item">
          <button class="usa-button usa-button--outline" type="button">Custom Outline</button>
        </li>
      </usa-button-group>

      <usa-alert variant="info" slim class="margin-top-4">
        <h4 class="usa-alert__heading">Custom Content vs Programmatic:</h4>
        <p>The button group supports both approaches:</p>
        <ul class="usa-list">
          <li>
            <strong>Programmatic:</strong> Use the <code>buttons</code> property for data-driven
            buttons
          </li>
          <li>
            <strong>Custom Content:</strong> Use the default slot for complete control over HTML structure
          </li>
        </ul>
        <p><strong>Note:</strong> Programmatic buttons take precedence when both are present.</p>
      </usa-alert>
    </div>
  `,
};

export const AccessibilityDemo: Story = {
  args: {
    type: 'default',
    buttons: [
      { text: 'Accessible Action', variant: 'primary', type: 'button' },
      { text: 'Secondary Action', variant: 'secondary', type: 'button' },
      { text: 'Disabled Action', variant: 'outline', type: 'button', disabled: true },
    ],
  },
  render: (args) => html`
    <div>
      <usa-alert variant="info" slim class="margin-bottom-2">
        <h3 class="usa-alert__heading margin-top-0 margin-bottom-1">Accessibility Features:</h3>
        <ul class="usa-list margin-0">
          <li><strong>Semantic Structure:</strong> Uses proper list markup with button elements</li>
          <li>
            <strong>Keyboard Navigation:</strong> Tab through buttons, Space/Enter to activate
          </li>
          <li>
            <strong>Screen Reader Support:</strong> Proper button semantics and disabled state
          </li>
          <li><strong>Focus Management:</strong> Clear visual focus indicators</li>
        </ul>
      </usa-alert>

      <usa-button-group .type=${args.type} .buttons=${args.buttons}></usa-button-group>

      <usa-alert variant="success" slim class="margin-top-2">
        <p class="margin-0">
          <strong>Test:</strong> Use Tab key to navigate between buttons, then Space or Enter to
          activate.
        </p>
      </usa-alert>
    </div>
  `,
};

export const ComplexConfiguration: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div>
      <h3>Complex Button Configuration</h3>
      <usa-button-group
        type="default"
        .buttons=${[
          {
            text: 'Submit',
            variant: 'primary',
            type: 'submit',
            onclick: () => console.log('Custom click handler for submit'),
          },
          {
            text: 'Save Draft',
            variant: 'secondary',
            type: 'button',
            onclick: () => console.log('Custom click handler for draft'),
          },
          {
            text: 'Preview',
            variant: 'outline',
            type: 'button',
            disabled: true,
          },
          {
            text: 'Cancel',
            variant: 'base',
            type: 'button',
            onclick: () => console.log('Custom click handler for cancel'),
          },
        ]}
        @button-click=${(e: CustomEvent) => {
          const { button, index } = e.detail;
          console.log(`Global handler: ${button.text} at index ${index}`);
        }}
      ></usa-button-group>

      <usa-alert variant="warning" slim class="margin-top-4">
        <h4 class="usa-alert__heading">Advanced Features Demonstrated:</h4>
        <ul class="usa-list">
          <li>Multiple button types (submit, button)</li>
          <li>All button variants (primary, secondary, outline, base)</li>
          <li>Individual onclick handlers + global event handler</li>
          <li>Mixed enabled/disabled states</li>
        </ul>
        <p class="margin-bottom-0">
          <strong>Note:</strong> Both individual onclick handlers and global button-click events are
          fired.
        </p>
      </usa-alert>
    </div>
  `,
};

export const MobileFriendly: Story = {
  args: {
    type: 'default',
    buttons: [
      { text: 'Submit', variant: 'primary', type: 'button' },
      { text: 'Save', variant: 'secondary', type: 'button' },
      { text: 'Cancel', variant: 'outline', type: 'button' },
    ],
  },
  render: (args) => html`
    <div class="maxw-mobile margin-x-auto border-2px border-dashed border-base-light padding-2">
      <h4 class="text-center margin-top-0">Mobile Device Simulation</h4>
      <p class="font-body-xs text-base-dark text-center">
        Button groups adapt to mobile layouts
      </p>

      <usa-button-group .type=${args.type} .buttons=${args.buttons}></usa-button-group>

      <usa-alert variant="info" slim class="margin-top-2 font-body-2xs">
        <p class="margin-0"><strong>Mobile Considerations:</strong></p>
        <ul class="usa-list margin-y-1 padding-left-205">
          <li>Touch-friendly button sizes</li>
          <li>Adequate spacing for finger taps</li>
          <li>Responsive button text</li>
        </ul>
      </usa-alert>
    </div>
  `,
};
