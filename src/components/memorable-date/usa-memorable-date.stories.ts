import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './index.js';
import type { USAMemorableDate } from './usa-memorable-date.js';

const meta: Meta<USAMemorableDate> = {
  title: 'Components/Memorable Date',
  component: 'usa-memorable-date',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
The USA Memorable Date component provides a three-field date input (month/day/year) that's more accessible and user-friendly than a single date field. 
This pattern helps users enter dates more accurately and reduces input errors.

## Features
- Three separate fields for month, day, and year
- Month dropdown with named months for clarity
- Numeric validation for day and year fields
- Automatic date validation
- ISO date conversion for form submission
- Accessible labels and hints
- Support for required and disabled states
        `,
      },
    },
  },
  argTypes: {
    month: {
      control: 'text',
      description: 'Selected month (01-12)',
    },
    day: {
      control: 'text',
      description: 'Selected day (1-31)',
    },
    year: {
      control: 'text',
      description: 'Selected year (4 digits)',
    },
    name: {
      control: 'text',
      description: 'Base name for form fields',
    },
    label: {
      control: 'text',
      description: 'Fieldset legend label',
    },
    hint: {
      control: 'text',
      description: 'Helper text for the date fields',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable all date fields',
    },
    required: {
      control: 'boolean',
      description: 'Mark fields as required',
    },
  },
};

export default meta;
type Story = StoryObj<USAMemorableDate>;

export const Default: Story = {
  args: {
    label: 'Date of birth',
    name: 'birth-date',
  },
  render: (args) => html`
    <usa-memorable-date
      .label=${args.label}
      .name=${args.name}
      .hint=${args.hint}
      .month=${args.month}
      .day=${args.day}
      .year=${args.year}
      ?disabled=${args.disabled}
      ?required=${args.required}
    ></usa-memorable-date>
  `,
};

export const WithHint: Story = {
  args: {
    label: 'Date of birth',
    name: 'birth-date',
    hint: 'For example: 4 28 1986',
  },
  render: (args) => html`
    <usa-memorable-date
      .label=${args.label}
      .name=${args.name}
      .hint=${args.hint}
      .month=${args.month}
      .day=${args.day}
      .year=${args.year}
      ?disabled=${args.disabled}
      ?required=${args.required}
    ></usa-memorable-date>
  `,
};

export const Required: Story = {
  args: {
    label: 'Date of birth',
    name: 'birth-date',
    hint: 'For example: 4 28 1986',
    required: true,
  },
  render: (args) => html`
    <usa-memorable-date
      .label=${args.label}
      .name=${args.name}
      .hint=${args.hint}
      .month=${args.month}
      .day=${args.day}
      .year=${args.year}
      ?disabled=${args.disabled}
      ?required=${args.required}
    ></usa-memorable-date>
  `,
};

export const Prefilled: Story = {
  args: {
    label: 'Date of birth',
    name: 'birth-date',
    month: '07',
    day: '04',
    year: '1776',
  },
  render: (args) => html`
    <usa-memorable-date
      .label=${args.label}
      .name=${args.name}
      .hint=${args.hint}
      .month=${args.month}
      .day=${args.day}
      .year=${args.year}
      ?disabled=${args.disabled}
      ?required=${args.required}
    ></usa-memorable-date>
  `,
};

export const Disabled: Story = {
  args: {
    label: 'Date of birth',
    name: 'birth-date',
    month: '12',
    day: '25',
    year: '2000',
    disabled: true,
  },
  render: (args) => html`
    <usa-memorable-date
      .label=${args.label}
      .name=${args.name}
      .hint=${args.hint}
      .month=${args.month}
      .day=${args.day}
      .year=${args.year}
      ?disabled=${args.disabled}
      ?required=${args.required}
    ></usa-memorable-date>
  `,
};

export const InteractiveExample: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
    docs: {
      description: {
        story: 'Interactive demonstration showing real-time date validation and event handling.',
        },
    },
  },
  render: () => html`
    <div>
      <usa-memorable-date
        id="interactive-date"
        label="Select a date"
        name="interactive"
        hint="Try entering different dates"
      ></usa-memorable-date>

      <div class="margin-top-4 padding-2 bg-base-lightest radius-md">
        <h4>Date Information:</h4>
        <div id="date-output">No date selected</div>
      </div>
    </div>

    <script>
      (function () {
        const dateInput = document.getElementById('interactive-date');
        const output = document.getElementById('date-output');

        if (dateInput) {
          dateInput.addEventListener('date-change', (e) => {
            const detail = e.detail;
            if (detail.isComplete) {
              if (detail.isValid) {
                output.innerHTML = \`
                  <strong>Valid Date Selected!</strong><br>
                  Month: \${detail.month}<br>
                  Day: \${detail.day}<br>
                  Year: \${detail.year}<br>
                  ISO Date: \${detail.isoDate}<br>
                  Status: ✅ Complete and Valid
                \`;
              } else {
                output.innerHTML = \`
                  <strong>Invalid Date</strong><br>
                  Month: \${detail.month}<br>
                  Day: \${detail.day}<br>
                  Year: \${detail.year}<br>
                  Status: ⚠️ Complete but Invalid (check day for selected month)
                \`;
              }
            } else {
              output.innerHTML = \`
                <strong>Incomplete Date</strong><br>
                Month: \${detail.month || '(empty)'}<br>
                Day: \${detail.day || '(empty)'}<br>
                Year: \${detail.year || '(empty)'}<br>
                Status: ⏳ Waiting for complete date
              \`;
            }
          });
        }
      })();
    </script>
  `,
};

export const FormIntegration: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
    docs: {
      description: {
        story: 'Example of memorable date component integrated with form controls and validation.',
        },
    },
  },
  render: () => html`
    <form id="date-form" class="maxw-tablet">
      <usa-memorable-date
        label="Date of birth"
        name="dob"
        hint="Required for identity verification"
        required
      ></usa-memorable-date>

      <div class="margin-top-4">
        <button type="submit" class="usa-button">Submit</button>
        <button type="button" class="usa-button usa-button--outline" id="clear-btn">Clear</button>
        <button type="button" class="usa-button usa-button--outline" id="set-btn">Set Today</button>
      </div>

      <div id="form-output" class="margin-top-2"></div>
    </form>

    <script>
      (function() {

        });

        clearBtn?.addEventListener('click', () => {
          dateInput?.clear();
          output.innerHTML = '';
        });

        setBtn?.addEventListener('click', () => {
          const today = new Date();
          const month = String(today.getMonth() + 1).padStart(2, '0');
          const day = String(today.getDate()).padStart(2, '0');
          const year = String(today.getFullYear());
          dateInput?.setValue(month, day, year);
        });
      })();
    </script>
  `,
};

export const AccessibilityDemo: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
    docs: {
      description: {
        story: 'Demonstrates the accessibility features built into the memorable date component.',
        },
    },
  },
  render: () => html`
    <div class="padding-2 border-2px border-primary radius-md">
      <h3>Accessibility Features Demo</h3>
      <p>This memorable date component includes:</p>
      <ul>
        <li>Proper fieldset/legend structure for screen readers</li>
        <li>Associated labels for each input field</li>
        <li>aria-describedby linking hints to all fields</li>
        <li>Numeric input mode for mobile keyboards</li>
        <li>Clear visual indication of required fields</li>
      </ul>

      <usa-memorable-date
        label="Accessible date input"
        name="a11y-date"
        hint="All fields are properly labeled and described for assistive technology"
        required
      ></usa-memorable-date>

      <div class="margin-top-1 padding-1 bg-info-lighter">
        <strong>Try with a screen reader:</strong> The fieldset groups the three fields together,
        and each field announces its purpose (Month, Day, Year) along with the helper text.
      </div>
    </div>
  `,
};

