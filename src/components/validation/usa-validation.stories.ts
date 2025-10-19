import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './index.js';
import type { USAValidation } from './usa-validation.js';

const meta: Meta<USAValidation> = {
  title: 'Components/Validation',
  component: 'usa-validation',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
The USA Validation component provides comprehensive form field validation with real-time feedback. 
It supports multiple validation rules, custom validators, and follows USWDS design patterns for error states.

## Features
- Multiple input types (text, textarea, select)
- Built-in validation rules (required, email, URL, pattern, length, numeric)
- Custom validation functions
- Real-time validation on input and blur
- Accessible error messages with ARIA support
- Visual success and error states
- Common validation patterns
        `,
      },
    },
  },
  argTypes: {
    value: {
      control: 'text',
      description: 'Current input value',
    },
    label: {
      control: 'text',
      description: 'Field label text',
    },
    hint: {
      control: 'text',
      description: 'Helper text for the field',
    },
    name: {
      control: 'text',
      description: 'Field name and ID',
    },
    inputType: {
      control: 'select',
      options: ['input', 'textarea', 'select'],
      description: 'Type of input control',
    },
    type: {
      control: 'text',
      description: 'HTML input type (text, email, password, etc.)',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the input field',
    },
    readonly: {
      control: 'boolean',
      description: 'Make the input read-only',
    },
    validateOnInput: {
      control: 'boolean',
      description: 'Validate while typing',
    },
    validateOnBlur: {
      control: 'boolean',
      description: 'Validate when field loses focus',
    },
    showSuccessState: {
      control: 'boolean',
      description: 'Show green success state for valid fields',
    },
  },
};

export default meta;
type Story = StoryObj<USAValidation>;

export const Default: Story = {
  args: {
    label: 'Text input',
    hint: 'Enter your text here',
    placeholder: 'Type something...',
  },
};

export const Required: Story = {
  args: {
    label: 'Required field',
    hint: 'This field is required',
    rules: [{ type: 'required', message: 'This field is required' }],
  },
};

export const EmailValidation: Story = {
  args: {
    label: 'Email address',
    hint: 'Enter a valid email address',
    type: 'email',
    placeholder: 'name@example.com',
    rules: [
      { type: 'required', message: 'Email is required' },
      { type: 'email', message: 'Please enter a valid email address' },
    ],
  },
};

export const PasswordStrength: Story = {
  args: {
    label: 'Password',
    hint: 'Must be at least 8 characters with uppercase, lowercase, and numbers',
    type: 'password',
    placeholder: 'Enter password',
    rules: [
      { type: 'required', message: 'Password is required' },
      { type: 'minlength', value: 8, message: 'Password must be at least 8 characters' },
      {
        type: 'custom',
        message: 'Password must contain uppercase, lowercase, and numbers',
        validator: (value: string) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(value),
      },
    ],
  },
};

export const TextareaValidation: Story = {
  args: {
    label: 'Comments',
    hint: 'Please provide detailed comments (minimum 20 characters)',
    inputType: 'textarea',
    rows: 5,
    placeholder: 'Enter your comments here...',
    rules: [
      { type: 'required', message: 'Comments are required' },
      { type: 'minlength', value: 20, message: 'Comments must be at least 20 characters' },
      { type: 'maxlength', value: 500, message: 'Comments cannot exceed 500 characters' },
    ],
  },
};

export const SelectValidation: Story = {
  args: {
    label: 'State',
    hint: 'Select your state of residence',
    inputType: 'select',
    options: [
      { value: 'AL', text: 'Alabama' },
      { value: 'CA', text: 'California' },
      { value: 'FL', text: 'Florida' },
      { value: 'NY', text: 'New York' },
      { value: 'TX', text: 'Texas' },
    ],
    rules: [{ type: 'required', message: 'Please select your state' }],
  },
};

export const NumericValidation: Story = {
  args: {
    label: 'Age',
    hint: 'Must be between 18 and 120 years old',
    type: 'number',
    placeholder: 'Enter your age',
    rules: [
      { type: 'required', message: 'Age is required' },
      { type: 'min', value: 18, message: 'Must be at least 18 years old' },
      { type: 'max', value: 120, message: 'Must be no more than 120 years old' },
    ],
  },
};

// Common validation pattern examples
export const PersonalIDValidation: Story = {
  args: {
    label: 'Personal ID Number',
    hint: 'Format: XXX-XX-XXXX',
    placeholder: '123-45-6789',
    rules: [
      { type: 'required', message: 'Personal ID is required' },
      {
        type: 'pattern',
        value: '^\\d{3}-\\d{2}-\\d{4}$',
        message: 'Personal ID must be in format: XXX-XX-XXXX',
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Personal identification number validation for forms.',
      },
    },
  },
};

export const EmployeeID: Story = {
  args: {
    label: 'Employee ID',
    hint: 'Two letters followed by 8 numbers (e.g., AB12345678)',
    placeholder: 'AB12345678',
    rules: [
      { type: 'required', message: 'Employee ID is required' },
      {
        type: 'pattern',
        value: '^[A-Z]{2}\\d{8}$',
        message: 'Employee ID must be 2 letters followed by 8 numbers',
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Employee identification number validation.',
      },
    },
  },
};

export const BusinessEmail: Story = {
  args: {
    label: 'Business Email',
    hint: 'Enter your business email address',
    type: 'email',
    placeholder: 'name@company.com',
    rules: [
      { type: 'required', message: 'Business email is required' },
      { type: 'email', message: 'Please enter a valid email address' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Validation for business email addresses.',
      },
    },
  },
};

export const ZIPCodeValidation: Story = {
  args: {
    label: 'ZIP Code',
    hint: 'Enter 5-digit ZIP or ZIP+4 format',
    placeholder: '12345 or 12345-6789',
    rules: [
      { type: 'required', message: 'ZIP code is required' },
      {
        type: 'pattern',
        value: '^\\d{5}(-\\d{4})?$',
        message: 'ZIP code must be 5 digits or ZIP+4 format (12345 or 12345-6789)',
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'U.S. ZIP code validation with optional +4 extension.',
      },
    },
  },
};

export const BusinessIDValidation: Story = {
  args: {
    label: 'Business ID Number',
    hint: 'Format: XX-XXXXXXX',
    placeholder: '12-3456789',
    rules: [
      { type: 'required', message: 'Business ID is required' },
      {
        type: 'pattern',
        value: '^\\d{2}-\\d{7}$',
        message: 'Business ID must be in format: XX-XXXXXXX',
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Business identification number validation for business forms.',
      },
    },
  },
};

export const AccessLevel: Story = {
  args: {
    label: 'Access Level',
    hint: 'Select your current access level',
    inputType: 'select',
    options: [
      { value: 'basic', text: 'Basic Access' },
      { value: 'standard', text: 'Standard Access' },
      { value: 'elevated', text: 'Elevated Access' },
      { value: 'admin', text: 'Administrator' },
      { value: 'super-admin', text: 'Super Administrator' },
    ],
    rules: [{ type: 'required', message: 'Access level is required' }],
  },
  parameters: {
    docs: {
      description: {
        story: 'Access level selection for system permissions.',
      },
    },
  },
};

export const NumericIDValidation: Story = {
  args: {
    label: 'Document Number',
    hint: 'Enter your 9-digit document number',
    placeholder: '123456789',
    rules: [
      { type: 'required', message: 'Document number is required' },
      {
        type: 'pattern',
        value: '^\\d{9}$',
        message: 'Document number must be exactly 9 digits',
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Numeric document ID validation for various identification documents.',
      },
    },
  },
};

export const ComplexForm: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <form id="application-form" class="maxw-tablet">
      <h3>Application Form</h3>

      <usa-validation
        label="Full Name"
        hint="Enter your full legal name"
        name="full-name"
        placeholder="First Last"
        .rules=${[{ type: 'required', message: 'Full name is required' }]}
      ></usa-validation>

      <usa-validation
        label="Business Email"
        hint="Enter your business email address"
        name="business-email"
        type="email"
        placeholder="name@company.com"
        .rules=${[
          { type: 'required', message: 'Business email is required' },
          { type: 'email', message: 'Please enter a valid email address' },
        ]}
      ></usa-validation>

      <usa-validation
        label="Department"
        hint="Select your department"
        name="department"
        inputType="select"
        .options=${[
          { value: 'hr', text: 'Human Resources' },
          { value: 'it', text: 'Information Technology' },
          { value: 'finance', text: 'Finance' },
          { value: 'marketing', text: 'Marketing' },
          { value: 'operations', text: 'Operations' },
        ]}
        .rules=${[{ type: 'required', message: 'Please select your department' }]}
      ></usa-validation>

      <usa-validation
        label="Additional Information"
        hint="Provide any additional relevant information (optional)"
        name="additional-info"
        inputType="textarea"
        .rows=${4}
        placeholder="Enter additional information..."
        .rules=${[{ type: 'maxlength', value: 1000, message: 'Cannot exceed 1000 characters' }]}
      ></usa-validation>

      <div class="margin-top-4">
        <button type="submit" class="usa-button">Submit Application</button>
        <button type="button" class="usa-button usa-button--outline" id="validate-all">
          Validate All Fields
        </button>
      </div>
    </form>

    <script>
      (function () {
        const form = document.getElementById('application-form');
        const validateBtn = document.getElementById('validate-all');

        validateBtn?.addEventListener('click', () => {
          const fields = form?.querySelectorAll('usa-validation');
          let allValid = true;

          fields?.forEach((field) => {
            const result = field.validate();
            if (!result.isValid) {
              allValid = false;
            }
          });

          if (allValid) {
            alert('All fields are valid!');
          } else {
            alert('Please fix validation errors before submitting.');
          }
        });

        form?.addEventListener('submit', (e) => {
          e.preventDefault();

          const fields = form.querySelectorAll('usa-validation');
          let allValid = true;
          const formData = {};

          fields.forEach((field) => {
            const result = field.validate();
            if (!result.isValid) {
              allValid = false;
            } else {
              formData[field.name] = field.value;
            }
          });

          if (allValid) {
            alert('Form submitted successfully!\\n\\nData: ' + JSON.stringify(formData, null, 2));
          } else {
            alert('Please fix all validation errors before submitting.');
          }
        });
      })();
    </script>
  `,
};

export const InteractiveDemo: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div>
      <usa-validation
        id="demo-field"
        label="Demo Field"
        hint="Try different values to see validation in action"
        name="demo"
        placeholder="Test validation rules..."
        .rules=${[
          { type: 'required', message: 'This field is required' },
          { type: 'minlength', value: 3, message: 'Must be at least 3 characters' },
          { type: 'pattern', value: '^[A-Za-z\\s]+$', message: 'Only letters and spaces allowed' },
        ]}
      ></usa-validation>

      <div class="margin-top-4 padding-2 bg-base-lightest radius-md">
        <h4>Validation Status:</h4>
        <div id="validation-output">Enter text to see validation results</div>
      </div>

      <div class="margin-top-2">
        <button type="button" class="usa-button usa-button--outline" id="add-rule">
          Add Email Rule
        </button>
        <button type="button" class="usa-button usa-button--outline" id="remove-rule">
          Remove Pattern Rule
        </button>
        <button type="button" class="usa-button usa-button--outline" id="toggle-success">
          Toggle Success State
        </button>
      </div>
    </div>

    <script>
      (function () {
        const field = document.getElementById('demo-field');
        const output = document.getElementById('validation-output');
        const addBtn = document.getElementById('add-rule');
        const removeBtn = document.getElementById('remove-rule');
        const toggleBtn = document.getElementById('toggle-success');

        field?.addEventListener('validation-change', (e) => {
          const detail = e.detail;
          output.innerHTML = \`
            <strong>Value:</strong> "\${detail.value}"<br>
            <strong>Valid:</strong> \${detail.isValid ? '✅' : '❌'}<br>
            <strong>Errors:</strong> \${detail.errors.length ? detail.errors.join(', ') : 'None'}<br>
            <strong>Has Been Validated:</strong> \${detail.hasBeenValidated ? 'Yes' : 'No'}
          \`;
        });

        addBtn?.addEventListener('click', () => {
          field?.addRule({ type: 'email', message: 'Must be a valid email' });
          addBtn.textContent = 'Email Rule Added';
          addBtn.disabled = true;
        });

        removeBtn?.addEventListener('click', () => {
          field?.removeRule('pattern');
          removeBtn.textContent = 'Pattern Rule Removed';
          removeBtn.disabled = true;
        });

        toggleBtn?.addEventListener('click', () => {
          field.showSuccessState = !field.showSuccessState;
          toggleBtn.textContent = field.showSuccessState
            ? 'Hide Success State'
            : 'Show Success State';
          if (field.isValid()) {
            field.validate(); // Re-validate to show/hide success state
          }
        });
      })();
    </script>
  `,
};
