import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './index.ts';
import type { USACharacterCount } from './usa-character-count.js';

const meta: Meta<USACharacterCount> = {
  title: 'Forms/Character Count',
  component: 'usa-character-count',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
The Character Count component provides real-time feedback to users about the number of characters entered in a text field, helping them stay within specified limits. Essential for government forms requiring concise responses and regulatory compliance.

**Features:**
- Real-time character counting with visual feedback
- Support for both text inputs and textareas
- Accessibility-compliant with screen reader support
- Visual indicators for approaching and exceeding limits
- Government-ready form patterns

**Government Usage:**
- Regulatory filing forms with character limits
- Public comment submission systems
- Grant application forms
- Survey and feedback collection
- Emergency alert systems requiring brevity
        `,
      },
    },
  },
  argTypes: {
    value: {
      control: 'text',
      description: 'Current value of the input field',
    },
    maxlength: {
      control: { type: 'number', min: 0, max: 1000 },
      description: 'Maximum character limit (0 means no limit)',
    },
    label: {
      control: 'text',
      description: 'Label text for the input field',
    },
    hint: {
      control: 'text',
      description: 'Hint text to provide additional guidance',
    },
    name: {
      control: 'text',
      description: 'Name attribute for form submission',
    },
    inputType: {
      control: 'radio',
      options: ['input', 'textarea'],
      description: 'Type of input element to render',
    },
    rows: {
      control: { type: 'number', min: 1, max: 20 },
      description: 'Number of rows for textarea (when inputType is textarea)',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the input',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the input field',
    },
    required: {
      control: 'boolean',
      description: 'Mark field as required',
    },
    readonly: {
      control: 'boolean',
      description: 'Make field read-only',
    },
  },
};

export default meta;
type Story = StoryObj<USACharacterCount>;

export const Default: Story = {
  args: {
    label: 'Comments',
    hint: 'Please provide your feedback',
    maxlength: 200,
    name: 'comments',
  },
  render: (args) => html`
    <usa-character-count
      .label=${args.label}
      .hint=${args.hint}
      .maxlength=${args.maxlength}
      .name=${args.name}
      .value=${args.value || ''}
      .inputType=${args.inputType || 'textarea'}
      .rows=${args.rows || 5}
      .placeholder=${args.placeholder || ''}
      .disabled=${args.disabled || false}
      .required=${args.required || false}
      .readonly=${args.readonly || false}
    ></usa-character-count>
  `,
};

export const TextInput: Story = {
  args: {
    label: 'Title',
    inputType: 'input',
    maxlength: 100,
    name: 'title',
    placeholder: 'Enter a brief title',
  },
  render: (args) => html`
    <usa-character-count
      .label=${args.label}
      .inputType=${args.inputType}
      .maxlength=${args.maxlength}
      .name=${args.name}
      .placeholder=${args.placeholder}
    ></usa-character-count>
  `,
};

export const TextArea: Story = {
  args: {
    label: 'Description',
    inputType: 'textarea',
    rows: 4,
    maxlength: 500,
    name: 'description',
    placeholder: 'Provide a detailed description',
  },
  render: (args) => html`
    <usa-character-count
      .label=${args.label}
      .inputType=${args.inputType}
      .rows=${args.rows}
      .maxlength=${args.maxlength}
      .name=${args.name}
      .placeholder=${args.placeholder}
    ></usa-character-count>
  `,
};

export const NoLimit: Story = {
  args: {
    label: 'Unlimited Text',
    hint: 'No character limit enforced',
    maxlength: 0,
    name: 'unlimited',
    value: 'This field has no character limit and will simply count characters',
  },
  render: (args) => html`
    <usa-character-count
      .label=${args.label}
      .hint=${args.hint}
      .maxlength=${args.maxlength}
      .name=${args.name}
      .value=${args.value}
    ></usa-character-count>
  `,
};

export const Required: Story = {
  args: {
    label: 'Required Field',
    hint: 'This field is required',
    required: true,
    maxlength: 150,
    name: 'required-field',
  },
  render: (args) => html`
    <usa-character-count
      .label=${args.label}
      .hint=${args.hint}
      ?required=${args.required}
      .maxlength=${args.maxlength}
      .name=${args.name}
    ></usa-character-count>
  `,
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Field',
    hint: 'This field is disabled',
    disabled: true,
    maxlength: 100,
    name: 'disabled-field',
    value: 'This content cannot be edited',
  },
  render: (args) => html`
    <usa-character-count
      .label=${args.label}
      .hint=${args.hint}
      ?disabled=${args.disabled}
      .maxlength=${args.maxlength}
      .name=${args.name}
      .value=${args.value}
    ></usa-character-count>
  `,
};

export const ReadOnly: Story = {
  args: {
    label: 'Read-Only Field',
    hint: 'This field is read-only',
    readonly: true,
    maxlength: 200,
    name: 'readonly-field',
    value: 'This is read-only content that shows character counting',
  },
  render: (args) => html`
    <usa-character-count
      .label=${args.label}
      .hint=${args.hint}
      .readonly=${args.readonly}
      .maxlength=${args.maxlength}
      .name=${args.name}
      .value=${args.value}
    ></usa-character-count>
  `,
};

export const NearLimit: Story = {
  args: {
    label: 'Near Limit Example',
    hint: 'This demonstrates the near-limit state',
    maxlength: 50,
    name: 'near-limit',
    value: 'This text is approaching the character limit',
  },
  render: (args) => html`
    <usa-character-count
      .label=${args.label}
      .hint=${args.hint}
      .maxlength=${args.maxlength}
      .name=${args.name}
      .value=${args.value}
    ></usa-character-count>
  `,
};

export const OverLimit: Story = {
  args: {
    label: 'Over Limit Example',
    hint: 'This demonstrates the over-limit error state',
    maxlength: 30,
    name: 'over-limit',
    value: 'This text exceeds the maximum character limit and shows error styling',
  },
  render: (args) => html`
    <usa-character-count
      .label=${args.label}
      .hint=${args.hint}
      .maxlength=${args.maxlength}
      .name=${args.name}
      .value=${args.value}
    ></usa-character-count>
  `,
};

export const ShortLimit: Story = {
  args: {
    label: 'Short Tweet-like Limit',
    hint: 'Perfect for brief social media style posts',
    inputType: 'textarea',
    maxlength: 140,
    name: 'tweet',
    rows: 3,
    placeholder: 'Share a brief update...',
  },
  render: (args) => html`
    <usa-character-count
      .label=${args.label}
      .hint=${args.hint}
      .inputType=${args.inputType}
      .maxlength=${args.maxlength}
      .name=${args.name}
      .rows=${args.rows}
      .placeholder=${args.placeholder}
    ></usa-character-count>
  `,
};

// Alias stories for Cypress tests that expect specific names
export const Error: Story = {
  ...OverLimit,
  parameters: {
    docs: {
      description: {
        story:
          'Alias for OverLimit story - demonstrates error state when character limit is exceeded.',
      },
    },
  },
};

export const Textarea: Story = {
  ...TextArea,
  parameters: {
    docs: {
      description: {
        story: 'Alias for TextArea story - demonstrates textarea variant with character counting.',
      },
    },
  },
};

export const Input: Story = {
  ...TextInput,
  parameters: {
    docs: {
      description: {
        story:
          'Alias for TextInput story - demonstrates text input variant with character counting.',
      },
    },
  },
};

// Interactive demonstration story
export const InteractiveDemo: Story = {
  args: {
    label: 'Interactive Character Count Demo',
    hint: 'Type to see real-time character counting and state changes',
    inputType: 'textarea',
    maxlength: 100,
    name: 'demo',
    rows: 4,
    placeholder: 'Start typing to see character count updates...',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive demonstration showing real-time character counting, near-limit warnings, and over-limit error states. Try typing to see the different visual states.',
      },
    },
  },
  render: (args) => html`
    <usa-character-count
      .label=${args.label}
      .hint=${args.hint}
      .inputType=${args.inputType}
      .maxlength=${args.maxlength}
      .name=${args.name}
      .rows=${args.rows}
      .placeholder=${args.placeholder}
    ></usa-character-count>
  `,
  play: async ({ canvasElement }) => {
    // This story is meant for manual interaction
    const characterCount = canvasElement.querySelector('usa-character-count');
    if (characterCount) {
      // Add event listener to show state changes in action tab
      characterCount.addEventListener('character-count-change', (e: any) => {
        console.log('Character count changed:', e.detail);
      });
    }
  },
};
