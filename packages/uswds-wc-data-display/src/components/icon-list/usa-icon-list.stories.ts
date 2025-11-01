import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './index.ts';
import '../icon/index.ts';
import type { USAIconList } from './usa-icon-list.js';

const meta: Meta<USAIconList> = {
  title: 'Data Display/Icon List',
  component: 'usa-icon-list',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
The Icon List component reinforces the meaning and visibility of individual list items with a leading icon.

## Usage

Use icon lists to:
- Highlight do-and-don't lists
- Emphasize features or metadata
- Mark important tasks or requirements
- Create printable checklists

## Accessibility

- Icons are decorative and use aria-hidden="true"
- Ensure the text content conveys the primary meaning
- Icons should reinforce, not replace, textual information
        `,
      },
    },
  },
  argTypes: {
    items: {
      control: 'object',
      description: 'Array of icon list items',
    },
    color: {
      control: { type: 'select' },
      options: ['', 'primary', 'secondary', 'success', 'warning', 'error', 'info'],
      description: 'Color variant for all icons',
    },
    size: {
      control: { type: 'select' },
      options: ['', 'lg', 'xl'],
      description: 'Size variant for icons',
    },
  },
};

export default meta;
type Story = StoryObj<USAIconList>;

export const Default: Story = {
  args: {
    items: [
      { icon: 'check_circle', content: 'Item has been completed' },
      { icon: 'close', content: 'Item requires attention' },
      { icon: 'help', content: 'Item needs clarification' },
      { icon: 'flag', content: 'Item is flagged for review' },
    ],
  },
};

export const DoAndDont: Story = {
  parameters: {
    docs: {
      description: {
        story: "Use contrasting icons and colors to highlight do-and-don't lists.",
      },
    },
  },
  render: () => html`
    <div class="display-flex gap-4">
      <div class="flex-1">
        <h3 class="margin-top-0">Do</h3>
        <usa-icon-list
          .items=${[
            {
              icon: 'check_circle',
              content: 'Write clear, descriptive link text',
              iconColor: 'text-success',
            },
            {
              icon: 'check_circle',
              content: 'Use proper heading hierarchy',
              iconColor: 'text-success',
            },
            {
              icon: 'check_circle',
              content: 'Provide alt text for images',
              iconColor: 'text-success',
            },
            {
              icon: 'check_circle',
              content: 'Test with keyboard navigation',
              iconColor: 'text-success',
            },
          ]}
        ></usa-icon-list>
      </div>
      <div class="flex-1">
        <h3 class="margin-top-0">Don't</h3>
        <usa-icon-list
          .items=${[
            { icon: 'cancel', content: 'Use "click here" as link text', iconColor: 'text-error' },
            { icon: 'cancel', content: 'Skip heading levels', iconColor: 'text-error' },
            { icon: 'cancel', content: 'Use images without alt text', iconColor: 'text-error' },
            {
              icon: 'cancel',
              content: 'Rely only on color to convey meaning',
              iconColor: 'text-error',
            },
          ]}
        ></usa-icon-list>
      </div>
    </div>
  `,
};

export const Features: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Highlight product or service features with appropriate icons.',
      },
    },
  },
  args: {
    size: 'lg',
    items: [
      {
        icon: 'check_circle',
        content: 'Mobile-responsive design out of the box',
        iconColor: 'text-primary',
      },
      { icon: 'check_circle', content: 'Accessibility-first approach', iconColor: 'text-primary' },
      {
        icon: 'check_circle',
        content: 'Comprehensive component library',
        iconColor: 'text-primary',
      },
      { icon: 'check_circle', content: 'Based on USWDS standards', iconColor: 'text-primary' },
    ],
  },
};

export const Checklist: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Create task lists and checklists.',
      },
    },
  },
  render: () => html`
    <h3>Pre-launch Checklist</h3>
    <usa-icon-list
      .items=${[
        { icon: 'check_circle', content: 'Run accessibility audit', iconColor: 'text-success' },
        { icon: 'check_circle', content: 'Test on multiple browsers', iconColor: 'text-success' },
        { icon: 'warning', content: 'Performance optimization pending', iconColor: 'text-warning' },
        { icon: 'close', content: 'Security review not started', iconColor: 'text-error' },
      ]}
    ></usa-icon-list>
  `,
};

export const SizeVariants: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Icon lists support different size variants.',
      },
    },
  },
  render: () => html`
    <div class="display-flex flex-column gap-4">
      <div>
        <h4>Default Size</h4>
        <usa-icon-list
          .items=${[
            { icon: 'check_circle', content: 'Default size icon' },
            { icon: 'info', content: 'Standard list presentation' },
          ]}
        ></usa-icon-list>
      </div>
      <div>
        <h4>Large Size</h4>
        <usa-icon-list
          size="lg"
          .items=${[
            { icon: 'check_circle', content: 'Large size icon' },
            { icon: 'info', content: 'More prominent presentation' },
          ]}
        ></usa-icon-list>
      </div>
      <div>
        <h4>Extra Large Size</h4>
        <usa-icon-list
          size="xl"
          .items=${[
            { icon: 'check_circle', content: 'Extra large icon' },
            { icon: 'info', content: 'Maximum visual impact' },
          ]}
        ></usa-icon-list>
      </div>
    </div>
  `,
};

export const Requirements: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Mark important requirements or criteria.',
      },
    },
  },
  render: () => html`
    <h3>Application Requirements</h3>
    <usa-icon-list
      size="lg"
      .items=${[
        { icon: 'location_on', content: 'Must be a U.S. resident or citizen' },
        { icon: 'check_circle', content: 'Must be 18 years of age or older' },
        { icon: 'email', content: 'Valid email address required' },
        { icon: 'phone', content: 'Contact phone number required' },
      ]}
    ></usa-icon-list>
  `,
};
