import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './index.ts';
import type { USATextarea } from './usa-textarea.js';

const meta: Meta<USATextarea> = {
  title: 'Forms/Textarea',
  component: 'usa-textarea',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# USA Textarea

The USA Textarea component provides multi-line text input using official USWDS styling.
This component wraps the standard HTML textarea element with USWDS classes and accessibility features.

## Features
- Multi-line text input with configurable rows and columns
- Character count limits (min/max length)
- Error and success states
- Helper text and labels
- Full accessibility support with ARIA attributes
- Autocomplete support
- Form integration with name attribute

## Usage Guidelines

- Use for longer text inputs that require multiple lines
- Provide clear labels and helper text
- Set appropriate row height for expected content
- Use character limits to guide users
- Consider placeholder text for context
- Validate input and show helpful error messages

## Accessibility

- Labels are properly associated with textareas
- Error messages use role="alert"
- Success messages use role="status"  
- Helper text connected via aria-describedby
- Required fields clearly marked
- Character limits announced to screen readers
- Supports keyboard navigation
        `,
      },
    },
  },
  argTypes: {
    label: {
      control: { type: 'text' },
      description: 'Label text for the textarea',
    },
    value: {
      control: { type: 'text' },
      description: 'Current textarea value',
    },
    placeholder: {
      control: { type: 'text' },
      description: 'Placeholder text shown when empty',
    },
    hint: {
      control: { type: 'text' },
      description: 'Helper text shown below the label',
    },
    error: {
      control: { type: 'text' },
      description: 'Error message text',
    },
    success: {
      control: { type: 'text' },
      description: 'Success message text',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the textarea is disabled',
    },
    readonly: {
      control: { type: 'boolean' },
      description: 'Whether the textarea is read-only',
    },
    required: {
      control: { type: 'boolean' },
      description: 'Whether the textarea is required',
    },
    rows: {
      control: { type: 'number' },
      description: 'Number of visible text rows',
    },
    cols: {
      control: { type: 'number' },
      description: 'Number of visible character columns',
    },
    maxlength: {
      control: { type: 'number' },
      description: 'Maximum character limit',
    },
    minlength: {
      control: { type: 'number' },
      description: 'Minimum character limit',
    },
  },
  args: {
    label: 'Textarea label',
    value: '',
    placeholder: 'Enter your text here...',
    hint: '',
    error: '',
    success: '',
    disabled: false,
    readonly: false,
    required: false,
    rows: 4,
    cols: null,
    maxlength: null,
    minlength: null,
  },
};

export default meta;
type Story = StoryObj<USATextarea>;

export const Default: Story = {
  render: (args) => html`
    <usa-textarea
      label="${args.label}"
      value="${args.value}"
      placeholder="${args.placeholder}"
      hint="${args.hint}"
      error="${args.error}"
      success="${args.success}"
      rows="${args.rows}"
      ?disabled=${args.disabled}
      ?readonly=${args.readonly}
      ?required=${args.required}
    ></usa-textarea>
  `,
};

export const WithHelperText: Story = {
  args: {
    label: 'Additional comments',
    hint: 'Please provide any additional information that might be helpful',
    placeholder: 'Type your comments here...',
  },
  render: (args) => html`
    <usa-textarea
      label="${args.label}"
      value="${args.value}"
      placeholder="${args.placeholder}"
      hint="${args.hint}"
      error="${args.error}"
      success="${args.success}"
      rows="${args.rows}"
      ?disabled=${args.disabled}
      ?readonly=${args.readonly}
      ?required=${args.required}
    ></usa-textarea>
  `,
};

export const Required: Story = {
  args: {
    label: 'Message',
    required: true,
    placeholder: 'Please enter your message...',
    hint: 'This field is required',
  },
  render: (args) => html`
    <usa-textarea
      label="${args.label}"
      value="${args.value}"
      placeholder="${args.placeholder}"
      hint="${args.hint}"
      error="${args.error}"
      success="${args.success}"
      rows="${args.rows}"
      ?disabled=${args.disabled}
      ?readonly=${args.readonly}
      ?required=${args.required}
    ></usa-textarea>
  `,
};

export const ErrorState: Story = {
  args: {
    label: 'Description',
    value: 'Too short',
    error: 'Description must be at least 10 characters long',
    placeholder: 'Please provide a detailed description...',
  },
  render: (args) => html`
    <usa-textarea
      label="${args.label}"
      value="${args.value}"
      placeholder="${args.placeholder}"
      hint="${args.hint}"
      error="${args.error}"
      success="${args.success}"
      rows="${args.rows}"
      ?disabled=${args.disabled}
      ?readonly=${args.readonly}
      ?required=${args.required}
    ></usa-textarea>
  `,
};

export const SuccessState: Story = {
  args: {
    label: 'Feedback',
    value:
      'This is an excellent product! I highly recommend it to anyone looking for quality and value.',
    success: 'Thank you for your detailed feedback',
  },
  render: (args) => html`
    <usa-textarea
      label="${args.label}"
      value="${args.value}"
      placeholder="${args.placeholder}"
      hint="${args.hint}"
      error="${args.error}"
      success="${args.success}"
      rows="${args.rows}"
      ?disabled=${args.disabled}
      ?readonly=${args.readonly}
      ?required=${args.required}
    ></usa-textarea>
  `,
};

export const WithCharacterLimit: Story = {
  args: {
    label: 'Tweet',
    hint: 'Maximum 280 characters',
    placeholder: "What's happening?",
    maxlength: 280,
    rows: 3,
  },
  render: (args) => html`
    <usa-textarea
      label="${args.label}"
      value="${args.value}"
      placeholder="${args.placeholder}"
      hint="${args.hint}"
      error="${args.error}"
      success="${args.success}"
      rows="${args.rows}"
      maxlength="${args.maxlength}"
      ?disabled=${args.disabled}
      ?readonly=${args.readonly}
      ?required=${args.required}
    ></usa-textarea>
  `,
};

export const Disabled: Story = {
  args: {
    label: 'Disabled textarea',
    value: 'This textarea is disabled and cannot be edited',
    disabled: true,
  },
  render: (args) => html`
    <usa-textarea
      label="${args.label}"
      value="${args.value}"
      placeholder="${args.placeholder}"
      hint="${args.hint}"
      error="${args.error}"
      success="${args.success}"
      rows="${args.rows}"
      ?disabled=${args.disabled}
      ?readonly=${args.readonly}
      ?required=${args.required}
    ></usa-textarea>
  `,
};

export const ReadOnly: Story = {
  args: {
    label: 'Terms and conditions',
    value:
      'By using this service, you agree to our terms and conditions. This text is read-only and cannot be modified.',
    readonly: true,
    rows: 3,
  },
  render: (args) => html`
    <usa-textarea
      label="${args.label}"
      value="${args.value}"
      placeholder="${args.placeholder}"
      hint="${args.hint}"
      error="${args.error}"
      success="${args.success}"
      rows="${args.rows}"
      ?disabled=${args.disabled}
      ?readonly=${args.readonly}
      ?required=${args.required}
    ></usa-textarea>
  `,
};

export const LargeTextarea: Story = {
  args: {
    label: 'Detailed description',
    hint: 'Please provide a comprehensive description',
    placeholder: 'Enter detailed information here...',
    rows: 8,
    cols: 80,
  },
  render: (args) => html`
    <usa-textarea
      label="${args.label}"
      value="${args.value}"
      placeholder="${args.placeholder}"
      hint="${args.hint}"
      error="${args.error}"
      success="${args.success}"
      rows="${args.rows}"
      cols="${args.cols}"
      ?disabled=${args.disabled}
      ?readonly=${args.readonly}
      ?required=${args.required}
    ></usa-textarea>
  `,
};

export const FormExample: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <form
      class="maxw-tablet"
      @submit=${(e: Event) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        console.log('Form data:', Object.fromEntries(formData));
        alert('Form submitted! Check console for data.');
      }}
    >
      <usa-textarea
        name="comments"
        label="Additional Comments"
        hint="Please provide any additional feedback or suggestions"
        placeholder="Enter your comments here..."
        rows="5"
        required
      ></usa-textarea>

      <usa-textarea
        name="experience"
        label="Previous Experience"
        hint="Describe your relevant experience (optional)"
        placeholder="Tell us about your background..."
        rows="4"
      ></usa-textarea>

      <div class="margin-top-3">
        <usa-button type="submit">Submit</usa-button>
      </div>
    </form>
  `,
};

export const ValidationStates: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div class="display-flex flex-column gap-1 maxw-tablet">
      <usa-textarea label="Default state" placeholder="Normal textarea" rows="3"></usa-textarea>

      <usa-textarea
        label="With helper text"
        hint="This provides additional context"
        placeholder="Textarea with hint"
        rows="3"
      ></usa-textarea>

      <usa-textarea
        label="Error state"
        value="Invalid input"
        error="This input contains invalid characters"
        rows="3"
      ></usa-textarea>

      <usa-textarea
        label="Success state"
        value="This is a well-written response that meets all requirements."
        success="Excellent response!"
        rows="3"
      ></usa-textarea>

      <usa-textarea
        label="Required field"
        required
        hint="This field is required"
        placeholder="Must be filled out"
        rows="3"
      ></usa-textarea>
    </div>
  `,
};

export const AccessibilityFeatures: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div class="maxw-tablet">
      <h3>Accessibility Features Demo</h3>
      <p>This demo shows various accessibility features of the textarea component.</p>

      <usa-textarea
        id="accessible-textarea"
        name="accessibleExample"
        label="Accessible textarea with all features"
        hint="This helper text is connected via aria-describedby"
        placeholder="Type your message here..."
        required
        maxlength="500"
        rows="4"
      ></usa-textarea>

      <div class="margin-top-1 padding-1 bg-base-lightest radius-md">
        <h4>Features demonstrated:</h4>
        <ul>
          <li>Label properly associated with textarea</li>
          <li>Helper text connected via aria-describedby</li>
          <li>Required field marked with asterisk</li>
          <li>Character limit enforced (maxlength)</li>
          <li>Native keyboard navigation</li>
          <li>Screen reader announcements</li>
          <li>Semantic HTML structure</li>
          <li>Form integration support</li>
        </ul>
      </div>
    </div>
  `,
};
