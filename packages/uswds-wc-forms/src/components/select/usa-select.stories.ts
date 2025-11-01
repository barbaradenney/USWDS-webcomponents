import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './index.ts';
import type { USASelect } from './usa-select.js';

const meta: Meta<USASelect> = {
  title: 'Forms/Select',
  component: 'usa-select',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# USA Select

The USA Select component provides accessible dropdown selection using official USWDS styling.
This component wraps the standard HTML select element with USWDS classes and accessibility features.

## Features
- Programmatic options or slotted content
- Error and success states
- Helper text and labels
- Full accessibility support with ARIA attributes
- Native form validation

## Usage Guidelines

- Use sparingly (7-15 options)
- Prefer radio buttons for fewer than 7 options  
- Use combo box for more than 15 options
- Always include a label for accessibility
- Provide a meaningful default option
- Avoid auto-submission

## Accessibility

- Labels are properly associated with selects
- Error messages use role="alert"
- Helper text connected via aria-describedby
- Required fields clearly marked
- Supports keyboard navigation
        `,
      },
    },
  },
  argTypes: {
    label: {
      control: { type: 'text' },
      description: 'Label text for the select',
    },
    value: {
      control: { type: 'text' },
      description: 'Selected value',
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
      description: 'Success state indicator',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the select is disabled',
    },
    required: {
      control: { type: 'boolean' },
      description: 'Whether the select is required',
    },
    defaultOption: {
      control: { type: 'text' },
      description: 'Default/placeholder option text',
    },
  },
  args: {
    label: 'Select label',
    value: '',
    hint: '',
    error: '',
    success: '',
    disabled: false,
    required: false,
    defaultOption: '- Select -',
  },
};

export default meta;
type Story = StoryObj<USASelect>;

export const Default: Story = {
  args: {
    label: 'Dropdown label',
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Select your state',
    hint: 'This is optional helper text',
  },
  parameters: {
    docs: {
      description: {
        story: 'Select with helper text to provide additional context.',
      },
    },
  },
};

export const Required: Story = {
  args: {
    label: 'Required dropdown',
    hint: 'This field is required',
    required: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Select marked as required with native browser validation.',
      },
    },
  },
};

export const WithError: Story = {
  args: {
    label: 'Dropdown with error',
    error: 'Please select a valid option',
    required: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Select showing an error state with error message.',
      },
    },
  },
};

export const WithSuccess: Story = {
  args: {
    label: 'Dropdown with success',
    success: 'Great choice!',
    value: 'option2',
  },
  parameters: {
    docs: {
      description: {
        story: 'Select showing a success state after valid selection.',
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled dropdown',
    disabled: true,
    value: 'option1',
  },
  parameters: {
    docs: {
      description: {
        story: 'Select in disabled state.',
      },
    },
  },
};

export const WithPreselected: Story = {
  args: {
    label: 'Preselected option',
    hint: 'An option has been pre-selected',
    value: 'option3',
  },
  parameters: {
    docs: {
      description: {
        story: 'Select with a pre-selected value.',
      },
    },
  },
};

export const CustomDefaultOption: Story = {
  args: {
    label: 'Custom placeholder',
    defaultOption: 'Choose your option...',
  },
  parameters: {
    docs: {
      description: {
        story: 'Select with custom placeholder/default option text.',
      },
    },
  },
};

export const FormIntegration: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Select integrated within a form demonstrating validation and submission.',
      },
    },
  },
  render: () => html`
    <form id="select-form" class="maxw-card">
      <usa-select label="Department" name="department" hint="Select your department" required>
        <option value="">- Select -</option>
        <option value="hr">Human Resources</option>
        <option value="it">Information Technology</option>
        <option value="finance">Finance</option>
        <option value="marketing">Marketing</option>
        <option value="sales">Sales</option>
      </usa-select>

      <div class="margin-top-2">
        <button type="submit" class="usa-button">Submit</button>
        <button type="button" class="usa-button usa-button--outline" id="reset-select">
          Reset
        </button>
      </div>

      <div id="select-output" class="margin-top-2"></div>
    </form>

    <script>
      (function () {
        const form = document.getElementById('select-form');
        const selectElement = form?.querySelector('usa-select');
        const output = document.getElementById('select-output');
        const resetBtn = document.getElementById('reset-select');

        form?.addEventListener('submit', (e) => {
          e.preventDefault();
          const formData = new FormData(form);
          const selectedValue = formData.get('department');

          if (output) {
            output.innerHTML = \`
              <div class="padding-1 bg-info-lighter radius-md">
                <strong>Form submitted!</strong><br>
                Selected: \${selectedValue || '(none)'}
              </div>
            \`;
          }
        });

        resetBtn?.addEventListener('click', () => {
          if (selectElement) {
            selectElement.value = '';
            if (output) output.innerHTML = '';
          }
        });
      })();
    </script>
  `,
};

export const InteractiveDemo: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Interactive demonstration showing real-time selection changes and events.',
      },
    },
  },
  render: () => html`
    <div>
      <usa-select
        id="demo-select"
        label="Interactive select"
        hint="Change the selection to see events"
      >
        <option value="">- Select an option -</option>
        <option value="option1">Option 1</option>
        <option value="option2">Option 2</option>
        <option value="option3">Option 3</option>
        <option value="option4">Option 4</option>
        <option value="option5">Option 5</option>
      </usa-select>

      <div class="margin-top-4 padding-2 bg-base-lightest radius-md">
        <h4>Selection Status:</h4>
        <div id="select-demo-output">No selection made</div>
      </div>

      <div class="margin-top-2">
        <button type="button" class="usa-button usa-button--outline" id="toggle-error">
          Toggle Error
        </button>
        <button type="button" class="usa-button usa-button--outline" id="toggle-success">
          Toggle Success
        </button>
        <button type="button" class="usa-button usa-button--outline" id="toggle-disabled">
          Toggle Disabled
        </button>
      </div>
    </div>

    <script>
      (function () {
        const select = document.getElementById('demo-select');
        const output = document.getElementById('select-demo-output');
        const errorBtn = document.getElementById('toggle-error');
        const successBtn = document.getElementById('toggle-success');
        const disabledBtn = document.getElementById('toggle-disabled');

        select?.addEventListener('change', (e) => {
          const value = e.target.value;
          if (output) {
            output.innerHTML = \`
              <strong>Value changed:</strong> "\${value}"<br>
              <strong>Event type:</strong> change<br>
              <strong>Timestamp:</strong> \${new Date().toLocaleTimeString()}
            \`;
          }
        });

        errorBtn?.addEventListener('click', () => {
          if (select) {
            select.error = select.error ? '' : 'This is an error message';
            select.success = '';
          }
        });

        successBtn?.addEventListener('click', () => {
          if (select) {
            select.success = select.success ? '' : 'Valid selection!';
            select.error = '';
          }
        });

        disabledBtn?.addEventListener('click', () => {
          if (select) {
            select.disabled = !select.disabled;
          }
        });
      })();
    </script>
  `,
};

export const AccessibilityDemo: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Demonstrates accessibility features including labels, ARIA attributes, and keyboard navigation.',
      },
    },
  },
  render: () => html`
    <div class="padding-2 border-2px border-primary radius-md">
      <h3>Accessibility Features</h3>
      <p>This select component includes:</p>
      <ul>
        <li>Properly associated labels via the label element</li>
        <li>Helper text linked with aria-describedby</li>
        <li>Error messages with role="alert"</li>
        <li>Required field indication</li>
        <li>Full keyboard navigation support</li>
      </ul>

      <usa-select
        label="Accessible select field"
        hint="This select demonstrates all accessibility features"
        required
      >
        <option value="">- Select an option -</option>
        <option value="option1">First option</option>
        <option value="option2">Second option</option>
        <option value="option3">Third option</option>
      </usa-select>

      <div class="margin-top-1 padding-1 bg-info-lighter">
        <strong>Keyboard navigation:</strong>
        <ul>
          <li>Tab - Focus the select</li>
          <li>Enter/Space - Open dropdown</li>
          <li>Arrow keys - Navigate options</li>
          <li>Enter - Select option</li>
          <li>Esc - Close dropdown</li>
        </ul>
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
    <usa-select>
      <p>This is custom slotted content.</p>
      <p>Slots allow you to provide your own HTML content to the component.</p>
    </usa-select>
  `,
};
