import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './index.ts';
import type { USAStepIndicator } from './usa-step-indicator.js';

const meta: Meta<USAStepIndicator> = {
  title: 'Components/Step Indicator',
  component: 'usa-step-indicator',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
The USA Step Indicator component displays progress through multi-step processes. It provides clear visual feedback about completed, current, and upcoming steps.

## Key Features

- **Visual Progress Tracking**: Shows completed, current, and upcoming steps
- **Flexible Configuration**: Support for labels, counters, and various layouts
- **Keyboard Navigation**: Full accessibility support with screen reader compatibility
- **Public API**: Programmatic control for dynamic step management

## When to Use

- Multi-step processes with more than 2 steps
- Applications requiring progress indication
- Complex workflows
- When users need to understand their position in a process

## When Not to Use

- Single-step processes
- Simple form submissions
- When step order is not important
        `,
      },
    },
  },
  argTypes: {
    steps: {
      control: { type: 'object' },
      description: 'Array of step objects with label and status properties',
    },
    currentStep: {
      control: { type: 'number', min: 1, step: 1 },
      description: 'Current step number (1-indexed)',
    },
    showLabels: {
      control: 'boolean',
      description: 'Whether to show step labels',
    },
    counters: {
      control: 'boolean',
      description: 'Whether to show step counters (only with labels)',
    },
    center: {
      control: 'boolean',
      description: 'Whether to center the step indicator',
    },
    ariaLabel: {
      control: 'text',
      description: 'ARIA label for the step indicator container',
    },
  },
};

export default meta;
type Story = StoryObj<USAStepIndicator>;

const basicApplicationSteps = [
  { label: 'Personal Information', status: 'complete' as const },
  { label: 'Review Details', status: 'complete' as const },
  { label: 'Document Upload', status: 'current' as const },
  { label: 'Review Application', status: 'incomplete' as const },
  { label: 'Submit Application', status: 'incomplete' as const },
];

const simpleProcessSteps = [
  { label: 'Initial Information', status: 'complete' as const },
  { label: 'Additional Details', status: 'complete' as const },
  { label: 'Review & Continue', status: 'current' as const },
  { label: 'Final Options', status: 'incomplete' as const },
];

export const Default: Story = {
  args: {
    steps: basicApplicationSteps,
    currentStep: 3,
    showLabels: true,
    counters: false,
    center: false,
    ariaLabel: 'Application progress',
  },
};

export const WithCounters: Story = {
  args: {
    steps: simpleProcessSteps,
    currentStep: 3,
    showLabels: true,
    counters: true,
    center: false,
    ariaLabel: 'Process progress with step numbers',
  },
};

export const NoLabels: Story = {
  args: {
    steps: basicApplicationSteps,
    currentStep: 2,
    showLabels: false,
    counters: false,
    center: false,
    ariaLabel: 'Application progress indicator',
  },
};

export const Centered: Story = {
  args: {
    steps: simpleProcessSteps,
    currentStep: 2,
    showLabels: true,
    counters: false,
    center: true,
    ariaLabel: 'Centered step indicator',
  },
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
    <usa-step-indicator
      .steps=${[
        { label: 'Getting Started', status: 'complete' as const },
        { label: 'In Progress', status: 'current' as const },
        { label: 'Final Steps', status: 'incomplete' as const },
      ]}
      .currentStep=${2}
      .showLabels=${true}
    >
      <usa-alert variant="info" slim class="margin-top-2">
        <p class="margin-0">
          This is custom slotted content that appears after the step indicator.
          You can add any HTML content here including alerts, notes, or instructions.
        </p>
      </usa-alert>
    </usa-step-indicator>
  `,
};
