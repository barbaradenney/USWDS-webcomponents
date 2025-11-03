import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './index.ts';
import type { USATextInput } from './usa-text-input.js';

const meta: Meta<USATextInput> = {
  title: 'Forms/Text Input',
  component: 'usa-text-input',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# USA Text Input

The Text Input component provides accessible form input for applications. Essential for data collection, user authentication, and service delivery systems.

## Accessibility Guidelines

- Proper label association with for/id attributes
- ARIA descriptions for hints and errors
- WCAG 2.1 AA compliant
- Screen reader announcements for validation states
- Keyboard navigation support
        `,
      },
    },
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url'],
      description: 'HTML input type',
    },
    name: {
      control: 'text',
      description: 'Form field name attribute',
    },
    value: {
      control: 'text',
      description: 'Current input value',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text shown when empty',
    },
    label: {
      control: 'text',
      description: 'Label text for the input',
    },
    hint: {
      control: 'text',
      description: 'Helpful hint text below the label',
    },
    error: {
      control: 'text',
      description: 'Error message (shows input in error state)',
    },
    width: {
      control: 'select',
      options: ['', '2xs', 'xs', 'sm', 'small', 'md', 'medium', 'lg', 'xl', '2xl'],
      description: 'Input width variant',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
    required: {
      control: 'boolean',
      description: 'Whether the field is required (shows asterisk)',
    },
    readonly: {
      control: 'boolean',
      description: 'Whether the input is read-only',
    },
    autocomplete: {
      control: 'text',
      description: 'HTML autocomplete attribute',
    },
    pattern: {
      control: 'text',
      description: 'Regular expression pattern for validation',
    },
    maxlength: {
      control: 'number',
      description: 'Maximum character length',
    },
    minlength: {
      control: 'number',
      description: 'Minimum character length',
    },
  },
  args: {
    type: 'text',
    name: '',
    value: '',
    placeholder: '',
    label: 'Input label',
    hint: '',
    error: '',
    width: '',
    disabled: false,
    required: false,
    readonly: false,
    autocomplete: '',
    pattern: '',
    maxlength: null,
    minlength: null,
  },
};

export default meta;
type Story = StoryObj<USATextInput>;

export const Default: Story = {
  args: {
    label: 'Full Name',
    hint: 'Enter your complete legal name',
  },
};

export const WithPlaceholder: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'name@example.com',
    type: 'email',
  },
};

export const Required: Story = {
  args: {
    label: 'Phone Number',
    type: 'tel',
    required: true,
    hint: 'Include area code',
  },
};

export const WithError: Story = {
  args: {
    label: 'Tax ID Number',
    value: '123-45-678',
    error: 'Please enter a complete Tax ID',
    hint: 'Format: XXX-XX-XXXX',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Account Status',
    value: 'Active',
    disabled: true,
  },
};

export const ReadOnly: Story = {
  args: {
    label: 'Employee ID',
    value: 'EMP12345678',
    readonly: true,
    hint: 'This ID is assigned by your organization',
  },
};

export const WidthVariants: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div class="display-flex flex-column gap-1">
      <usa-text-input width="2xs" label="2xs width" placeholder="Very small"></usa-text-input>
      <usa-text-input width="xs" label="xs width" placeholder="Extra small"></usa-text-input>
      <usa-text-input width="sm" label="sm width" placeholder="Small"></usa-text-input>
      <usa-text-input width="md" label="md width" placeholder="Medium"></usa-text-input>
      <usa-text-input width="lg" label="lg width" placeholder="Large"></usa-text-input>
      <usa-text-input width="xl" label="xl width" placeholder="Extra large"></usa-text-input>
      <usa-text-input
        width="2xl"
        label="2xl width"
        placeholder="Extra extra large"
      ></usa-text-input>
    </div>
  `,
};

// Common Usage Pattern Stories

export const TaxID: Story = {
  name: 'Tax ID (EIN)',
  args: {
    type: 'text',
    label: 'Tax ID (EIN)',
    hint: 'Format: XX-XXXXXXX (9 digits with hyphen)',
    placeholder: '12-3456789',
    pattern: '\\d{2}-\\d{7}',
    required: true,
    autocomplete: 'organization',
    width: 'md',
  },
};

export const TaxIdNumber: Story = {
  name: 'Tax ID Number',
  args: {
    type: 'text',
    label: 'Tax ID Number',
    hint: 'We use this information to verify your identity',
    placeholder: '123-45-6789',
    pattern: '\\d{3}-\\d{2}-\\d{4}',
    required: true,
    autocomplete: 'off',
    width: 'md',
  },
};

export const EmployeeID: Story = {
  name: 'Employee ID',
  args: {
    type: 'text',
    label: 'Employee ID',
    hint: 'Two letters followed by 8 digits (e.g., AB12345678)',
    placeholder: 'AB12345678',
    pattern: '[A-Z]{2}\\d{8}',
    maxlength: 10,
    required: true,
    width: 'md',
  },
};

export const BusinessEmail: Story = {
  name: 'Business Email Address',
  args: {
    type: 'email',
    label: 'Business Email',
    hint: 'Your organization email address',
    placeholder: 'name@company.com',
    required: true,
    autocomplete: 'email',
    width: 'lg',
  },
};

export const BusinessNumber: Story = {
  name: 'Business Number',
  args: {
    type: 'text',
    label: 'Business Number',
    hint: 'Business identifier - 9 digit number',
    placeholder: '123456789',
    pattern: '\\d{9}',
    minlength: 9,
    maxlength: 9,
    required: true,
    width: 'md',
  },
};

export const CaseNumber: Story = {
  name: 'Case Number',
  args: {
    type: 'text',
    label: 'Case Number',
    hint: 'Format: Region:Year-Type-Number (e.g., 1:24-cs-12345)',
    placeholder: '1:24-cs-12345',
    pattern: '\\d{1,2}:\\d{2}-[a-zA-Z]{2}-\\d{5}',
    required: true,
    width: 'md',
  },
};

export const ProjectNumber: Story = {
  name: 'Project Number',
  args: {
    type: 'text',
    label: 'Project Number',
    hint: 'Format: Dept-Year-ProjectNumber (e.g., IT-2024-123456)',
    placeholder: 'IT-2024-123456',
    pattern: '[A-Z]{2}-\\d{4}-\\d{6}',
    required: true,
    width: 'lg',
  },
};

export const AccessibilityDemo: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div class="maxw-desktop padding-1 border border-base-lighter radius-md">
      <h3>Text Input Accessibility Compliance</h3>
      <p class="margin-bottom-2 text-base-dark">
        This example demonstrates WCAG 2.1 AA compliance features: proper label association, ARIA
        descriptions, and error handling.
      </p>

      <div class="display-flex flex-column gap-2 margin-bottom-2">
        <div>
          <h4>Proper Label Association</h4>
          <p class="font-body-xs margin-bottom-1">
            Labels are properly associated with inputs using for/id attributes
          </p>
          <usa-text-input
            label="Full Legal Name"
            hint="As it appears on official documents"
            placeholder="Enter your complete name"
            width="lg"
          ></usa-text-input>
        </div>

        <div>
          <h4>Required Field Indication</h4>
          <p class="font-body-xs margin-bottom-1">
            Required fields show asterisk (*) and proper ARIA attributes
          </p>
          <usa-text-input
            label="Tax ID Number"
            hint="We need this to verify your identity"
            placeholder="123-45-6789"
            required="true"
            width="md"
          ></usa-text-input>
        </div>

        <div>
          <h4>Error State with ARIA</h4>
          <p class="font-body-xs margin-bottom-1">
            Errors are announced to screen readers with role="alert"
          </p>
          <usa-text-input
            label="Employee ID"
            hint="Format: Two letters followed by 8 digits"
            value="ABC123"
            error="Invalid format. Please use 2 letters followed by 8 digits (e.g., AB12345678)"
            width="md"
          ></usa-text-input>
        </div>

        <div>
          <h4>Disabled State</h4>
          <p class="font-body-xs margin-bottom-1">
            Disabled inputs are properly excluded from tab order
          </p>
          <usa-text-input
            label="Account Status"
            value="Active - Employee"
            disabled="true"
            hint="This field is automatically populated"
            width="lg"
          ></usa-text-input>
        </div>

        <div>
          <h4>Read-Only Information</h4>
          <p class="font-body-xs margin-bottom-1">
            Read-only fields allow copying but prevent editing
          </p>
          <usa-text-input
            label="Assigned Employee ID"
            value="EMP12345678"
            readonly="true"
            hint="This ID was assigned by your organization"
            width="md"
          ></usa-text-input>
        </div>
      </div>

      <div>
        <h4>Screen Reader Testing Guidelines</h4>
        <ul class="font-body-xs margin-bottom-205 line-height-sans-4">
          <li>
            <strong>Label Association:</strong> Screen readers announce label when focusing input
          </li>
          <li>
            <strong>Hint Text:</strong> Descriptive hints are read as part of input description
          </li>
          <li>
            <strong>Required Fields:</strong> Screen readers announce "required" for mandatory
            fields
          </li>
          <li>
            <strong>Error Messages:</strong> Errors are immediately announced with "Error:" prefix
          </li>
          <li>
            <strong>Input Type:</strong> Proper input types trigger appropriate virtual keyboards
          </li>
          <li>
            <strong>Validation:</strong> Pattern and length constraints work with assistive
            technology
          </li>
        </ul>

        <div class="padding-1 bg-info-lighter border border-info-light radius-md">
          <h5 class="margin-bottom-1">Testing Checklist:</h5>
          <ul class="margin-0 font-body-xs">
            <li>✓ Tab navigation through all inputs</li>
            <li>✓ Screen reader announces labels and hints</li>
            <li>✓ Required fields properly identified</li>
            <li>✓ Error states immediately announced</li>
            <li>✓ Disabled fields skipped in tab order</li>
            <li>✓ Input types trigger appropriate keyboards</li>
          </ul>
        </div>
      </div>
    </div>
  `,
};
