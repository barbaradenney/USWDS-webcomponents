import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './index.ts';
import type { USADatePicker } from './usa-date-picker.js';

const meta: Meta<USADatePicker> = {
  title: 'Forms/Date Picker',
  component: 'usa-date-picker',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# USA Date Picker

The USA Date Picker component provides an accessible date input with calendar popup using official USWDS styling and JavaScript.
This component uses a pure USWDS integration approach for guaranteed compatibility and behavior.

## Features
- **USWDS-first approach**: Uses official USWDS JavaScript for all date picker functionality
- **Full accessibility**: ARIA attributes, keyboard navigation, screen reader support
- **Progressive enhancement**: Works as basic input, enhances with USWDS calendar
- **Web component API**: Properties, events, and methods for framework integration
- **Tree-shaking optimized**: Minimal bundle size with selective imports

## Benefits
- **Guaranteed USWDS parity**: Uses real USWDS JavaScript behavior
- **Zero custom calendar logic**: USWDS handles everything
- **Authentic styling**: Real USWDS appearance and interactions
- **Future-proof**: Automatic USWDS updates
- **Framework friendly**: Full web component API

## Usage Guidelines
- Use for single date selection in forms and applications
- Provide clear labels indicating expected date format
- Consider min/max date constraints for business logic
- Use hints to clarify date requirements or format
- Test keyboard navigation and screen reader compatibility
        `,
      },
    },
  },
  argTypes: {
    label: {
      control: { type: 'text' },
      description: 'Label text for the date picker',
    },
    value: {
      control: { type: 'text' },
      description: 'Selected date value (YYYY-MM-DD format)',
    },
    hint: {
      control: { type: 'text' },
      description: 'Helper text shown below the label',
    },
    placeholder: {
      control: { type: 'text' },
      description: 'Placeholder text for the input field',
    },
    name: {
      control: { type: 'text' },
      description: 'Name attribute for form submission',
    },
    inputId: {
      control: { type: 'text' },
      description: 'ID for the input element',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the date picker is disabled',
    },
    required: {
      control: { type: 'boolean' },
      description: 'Whether the date picker is required',
    },
    readonly: {
      control: { type: 'boolean' },
      description: 'Whether the date picker is read-only',
    },
    minDate: {
      control: { type: 'text' },
      description: 'Minimum selectable date (YYYY-MM-DD format)',
    },
    maxDate: {
      control: { type: 'text' },
      description: 'Maximum selectable date (YYYY-MM-DD format)',
    },
    error: {
      control: { type: 'text' },
      description: 'Error message to display',
    },
  },
  args: {
    label: 'Date',
    value: '',
    hint: '',
    placeholder: 'mm/dd/yyyy',
    name: 'date-picker',
    inputId: 'date-picker-input',
    disabled: false,
    required: false,
    readonly: false,
    minDate: '',
    maxDate: '',
    error: '',
  },
};

export default meta;
type Story = StoryObj<USADatePicker>;

export const Default: Story = {
  render: (args) => html`
    <usa-date-picker
      label="${args.label}"
      value="${args.value}"
      hint="${args.hint}"
      placeholder="${args.placeholder}"
      name="${args.name}"
      inputId="${args.inputId}"
      ?disabled=${args.disabled}
      ?required=${args.required}
      ?readonly=${args.readonly}
      minDate="${args.minDate}"
      maxDate="${args.maxDate}"
      error="${args.error}"
    ></usa-date-picker>
  `,
};

export const WithHelperText: Story = {
  args: {
    label: 'Start Date',
    hint: 'Choose the date you want to begin',
    placeholder: 'mm/dd/yyyy',
  },
  render: (args) => html`
    <usa-date-picker
      label="${args.label}"
      value="${args.value}"
      hint="${args.hint}"
      placeholder="${args.placeholder}"
      name="${args.name}"
      inputId="${args.inputId}"
      ?disabled=${args.disabled}
      ?required=${args.required}
      ?readonly=${args.readonly}
      minDate="${args.minDate}"
      maxDate="${args.maxDate}"
      error="${args.error}"
    ></usa-date-picker>
  `,
};

export const Required: Story = {
  args: {
    label: 'Appointment Date',
    required: true,
    hint: 'This field is required',
  },
  render: (args) => html`
    <usa-date-picker
      label="${args.label}"
      value="${args.value}"
      hint="${args.hint}"
      placeholder="${args.placeholder}"
      name="${args.name}"
      inputId="${args.inputId}"
      ?disabled=${args.disabled}
      ?required=${args.required}
      ?readonly=${args.readonly}
      minDate="${args.minDate}"
      maxDate="${args.maxDate}"
      error="${args.error}"
    ></usa-date-picker>
  `,
};

export const WithValue: Story = {
  args: {
    label: 'Birth Date',
    value: '2024-01-15',
    placeholder: 'mm/dd/yyyy',
  },
  render: (args) => html`
    <usa-date-picker
      label="${args.label}"
      value="${args.value}"
      hint="${args.hint}"
      placeholder="${args.placeholder}"
      name="${args.name}"
      inputId="${args.inputId}"
      ?disabled=${args.disabled}
      ?required=${args.required}
      ?readonly=${args.readonly}
      minDate="${args.minDate}"
      maxDate="${args.maxDate}"
      error="${args.error}"
    ></usa-date-picker>
  `,
};

export const WithError: Story = {
  args: {
    label: 'Invalid Date',
    value: '2024-02-30',
    error: 'Please enter a valid date',
    hint: 'The date you entered is not valid',
  },
  render: (args) => html`
    <usa-date-picker
      label="${args.label}"
      value="${args.value}"
      hint="${args.hint}"
      placeholder="${args.placeholder}"
      name="${args.name}"
      inputId="${args.inputId}"
      ?disabled=${args.disabled}
      ?required=${args.required}
      ?readonly=${args.readonly}
      minDate="${args.minDate}"
      maxDate="${args.maxDate}"
      error="${args.error}"
    ></usa-date-picker>
  `,
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Date Picker',
    value: '2024-01-15',
    disabled: true,
  },
  render: (args) => html`
    <usa-date-picker
      label="${args.label}"
      value="${args.value}"
      hint="${args.hint}"
      placeholder="${args.placeholder}"
      name="${args.name}"
      inputId="${args.inputId}"
      ?disabled=${args.disabled}
      ?required=${args.required}
      ?readonly=${args.readonly}
      minDate="${args.minDate}"
      maxDate="${args.maxDate}"
      error="${args.error}"
    ></usa-date-picker>
  `,
};

export const ReadOnly: Story = {
  args: {
    label: 'Read-only Date Picker',
    value: '2024-01-15',
    readonly: true,
    hint: 'This date cannot be changed',
  },
  render: (args) => html`
    <usa-date-picker
      label="${args.label}"
      value="${args.value}"
      hint="${args.hint}"
      placeholder="${args.placeholder}"
      name="${args.name}"
      inputId="${args.inputId}"
      ?disabled=${args.disabled}
      ?required=${args.required}
      ?readonly=${args.readonly}
      minDate="${args.minDate}"
      maxDate="${args.maxDate}"
      error="${args.error}"
    ></usa-date-picker>
  `,
};

export const WithDateRange: Story = {
  args: {
    label: 'Event Date',
    hint: 'Select a date within the allowed range',
    minDate: '2024-01-01',
    maxDate: '2024-12-31',
  },
  render: (args) => html`
    <usa-date-picker
      label="${args.label}"
      value="${args.value}"
      hint="${args.hint}"
      placeholder="${args.placeholder}"
      name="${args.name}"
      inputId="${args.inputId}"
      ?disabled=${args.disabled}
      ?required=${args.required}
      ?readonly=${args.readonly}
      minDate="${args.minDate}"
      maxDate="${args.maxDate}"
      error="${args.error}"
    ></usa-date-picker>
  `,
};

export const TestEvents: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div class="maxw-mobile-lg">
      <h3>Event Testing</h3>
      <p>Open the console to see date-change events when you select a date.</p>

      <usa-date-picker
        label="Test Date"
        hint="Select a date to see events in console"
        @date-change=${(e: CustomEvent) => {
          console.log('📅 date-change event:', e.detail);
          const output = document.getElementById('event-output');
          if (output) {
            output.textContent = `Selected: ${e.detail.value} (${e.detail.date?.toDateString() || 'Invalid date'})`;
          }
        }}
        @input=${(e: CustomEvent) => {
          console.log('📝 input event:', e.detail);
        }}
      ></usa-date-picker>

      <div class="margin-top-1 padding-1 bg-base-lightest radius-md">
        <strong>Event Output:</strong>
        <div id="event-output">No date selected</div>
      </div>
    </div>
  `,
};

export const FormExample: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <form
      class="maxw-mobile-lg"
      @submit=${(e: Event) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        console.log('Form data:', Object.fromEntries(formData));
        alert('Form submitted! Check console for data.');
      }}
    >
      <usa-date-picker
        name="start-date"
        label="Start Date"
        hint="Select the beginning date"
        required
      ></usa-date-picker>

      <usa-date-picker
        name="end-date"
        label="End Date"
        hint="Select the ending date"
        minDate="2024-01-01"
        class="margin-top-2"
      ></usa-date-picker>

      <div class="margin-top-3">
        <button type="submit" class="usa-button">Submit</button>
      </div>
    </form>
  `,
};