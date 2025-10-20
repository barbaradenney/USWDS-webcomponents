import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './index.ts';
import type { USAInputPrefixSuffix } from './usa-input-prefix-suffix.js';

const meta: Meta<USAInputPrefixSuffix> = {
  title: 'Forms/Input Prefix Suffix',
  component: 'usa-input-prefix-suffix',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
The USA Input Prefix Suffix component enhances input fields with visual context through prefixes and suffixes. This pattern helps users understand the expected input format and reduces form errors.

## Key Features

- **Text Prefixes/Suffixes**: Add contextual text like currency symbols, units, or domains
- **Icon Prefixes/Suffixes**: Use icons for visual enhancement and recognition
- **Multiple Input Types**: Support for text, email, number, tel, url, password, and search
- **Full Accessibility**: ARIA attributes and screen reader support
- **Form Integration**: Compatible with form validation systems

## Common Use Cases

- **Financial Forms**: Currency inputs ($, %), rates, amounts
- **Contact Information**: Email domains, phone prefixes (+1), URLs
- **Identification**: ID formatting, reference numbers
- **Search Interfaces**: Document search, data lookups
- **Data Entry**: Units of measure, percentages, standardized formats

## When to Use

- When input context improves user understanding
- For standardized data formats
- To reduce input errors and improve data quality
- When visual cues enhance form completion

## When Not to Use

- For simple text inputs without additional context
- When prefixes/suffixes would cause confusion
- If accessibility is compromised by visual additions
        `,
      },
    },
  },
  argTypes: {
    value: {
      control: 'text',
      description: 'Current input value',
    },
    name: {
      control: 'text',
      description: 'Input name attribute',
    },
    inputId: {
      control: 'text',
      description: 'Input ID attribute',
    },
    label: {
      control: 'text',
      description: 'Input label text',
    },
    hint: {
      control: 'text',
      description: 'Hint text below label',
    },
    placeholder: {
      control: 'text',
      description: 'Input placeholder text',
    },
    prefix: {
      control: 'text',
      description: 'Text prefix before input',
    },
    suffix: {
      control: 'text',
      description: 'Text suffix after input',
    },
    prefixIcon: {
      control: 'text',
      description: 'Icon name for prefix',
    },
    suffixIcon: {
      control: 'text',
      description: 'Icon name for suffix',
    },
    type: {
      control: 'select',
      options: ['text', 'email', 'number', 'tel', 'url', 'password', 'search'],
      description: 'Input type',
    },
    autocomplete: {
      control: 'text',
      description: 'Autocomplete attribute',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether input is disabled',
    },
    required: {
      control: 'boolean',
      description: 'Whether input is required',
    },
    readonly: {
      control: 'boolean',
      description: 'Whether input is read-only',
    },
  },
};

export default meta;
type Story = StoryObj<USAInputPrefixSuffix>;

export const Default: Story = {
  args: {
    label: 'Input with Prefix',
    prefix: '$',
    placeholder: 'Enter amount',
    hint: 'Enter the dollar amount',
  },
};

export const WithSuffix: Story = {
  args: {
    label: 'Tax Rate',
    suffix: '%',
    type: 'number',
    placeholder: '0.00',
    hint: 'Enter tax rate as percentage',
  },
};

// NOTE: USWDS does not support using both prefix AND suffix simultaneously
// The component is designed for "Input Prefix OR Suffix" - use one or the other
// export const WithBothPrefixAndSuffix: Story = {
//   args: {
//     label: 'Website URL',
//     prefix: 'https://',
//     suffix: '.com',
//     type: 'url',
//     placeholder: 'example',
//     hint: 'Enter your website domain',
//   },
// };

export const WithPrefixIcon: Story = {
  args: {
    label: 'Search',
    prefixIcon: 'search',
    type: 'search',
    placeholder: 'Search documents',
    hint: 'Enter keywords to search',
  },
};

export const WithSuffixIcon: Story = {
  args: {
    label: 'Password',
    suffixIcon: 'visibility',
    type: 'password',
    placeholder: 'Enter password',
    hint: 'Click eye to toggle visibility',
  },
};

export const Required: Story = {
  args: {
    label: 'Annual Income',
    prefix: '$',
    type: 'number',
    placeholder: '0.00',
    hint: 'Enter your gross annual income',
    required: true,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Account Balance',
    prefix: '$',
    suffix: ' USD',
    value: '1,234.56',
    disabled: true,
    hint: 'This field cannot be edited',
  },
};

export const ReadOnly: Story = {
  args: {
    label: 'Transaction ID',
    prefix: 'TXN-',
    value: '2023-ABC123',
    readonly: true,
    hint: 'Transaction reference number',
  },
};

export const CurrencyInput: Story = {
  args: {
    label: 'Amount',
    prefix: '$',
    type: 'number',
    placeholder: '0.00',
    hint: 'Enter dollar amount',
    name: 'amount',
    autocomplete: 'off',
  },
};

export const PhoneNumber: Story = {
  args: {
    label: 'Phone Number',
    prefix: '+1',
    type: 'tel',
    placeholder: '(555) 123-4567',
    hint: 'Enter your phone number',
    name: 'phone',
    autocomplete: 'tel',
  },
};

export const PercentageRate: Story = {
  args: {
    label: 'Rate',
    suffix: '%',
    type: 'number',
    placeholder: '0.00',
    hint: 'Enter rate as percentage',
    name: 'rate',
  },
};

export const InteractiveDemo: Story = {
  name: 'Interactive Prefix/Suffix Demo',
  render: () => {
    const handleInputChange = (_e: any) => {
      // Event handler for demo
    };

    return html`
      <div class="display-grid grid-gap-2 maxw-tablet">
        <usa-input-prefix-suffix
          label="Currency Input"
          prefix="$"
          suffix=".00"
          type="number"
          placeholder="0"
          hint="Enter dollar amount"
          name="currency"
          @input-change=${handleInputChange}
        ></usa-input-prefix-suffix>

        <usa-input-prefix-suffix
          label="Email Address"
          suffix="@example.com"
          type="email"
          placeholder="username"
          hint="Enter email username"
          name="email"
          @input-change=${handleInputChange}
        ></usa-input-prefix-suffix>

        <usa-input-prefix-suffix
          label="Search with Icon"
          prefixIcon="search"
          type="search"
          placeholder="Search documents"
          hint="Enter search terms"
          name="search"
          @input-change=${handleInputChange}
        ></usa-input-prefix-suffix>

        <usa-input-prefix-suffix
          label="Phone Number"
          prefix="+1 "
          type="tel"
          placeholder="(555) 123-4567"
          hint="Enter phone number"
          name="phone"
          @input-change=${handleInputChange}
        ></usa-input-prefix-suffix>
      </div>

      <div
        class="margin-top-2 padding-1 bg-base-lightest radius-md"
      >
        <h4>Event Information</h4>
        <p>Open browser console to see input-change events with detailed information:</p>
        <ul>
          <li><code>detail.value</code> - Current input value</li>
          <li><code>detail.name</code> - Input name attribute</li>
          <li><code>detail.input</code> - Reference to input element</li>
        </ul>
      </div>
    `;
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive demonstration showing multiple prefix/suffix patterns with event handling.',
      },
    },
  },
};

export const AccessibilityShowcase: Story = {
  name: 'Accessibility Features Demo',
  render: () => {
    return html`
      <div class="display-grid grid-gap-2 maxw-tablet">
        <div>
          <h3>Required Field with Prefix</h3>
          <usa-input-prefix-suffix
            label="Annual Income"
            prefix="$"
            type="number"
            placeholder="0.00"
            hint="Enter your gross annual income (required)"
            name="income"
            required
          ></usa-input-prefix-suffix>
        </div>

        <div>
          <h3>Email with Domain Suffix</h3>
          <usa-input-prefix-suffix
            label="Email Address"
            suffix="@example.com"
            type="email"
            placeholder="firstname.lastname"
            hint="Your email address for communication"
            name="email"
            autocomplete="email"
          ></usa-input-prefix-suffix>
        </div>

        <div>
          <h3>Search with Icon Prefix</h3>
          <usa-input-prefix-suffix
            label="Document Search"
            prefixIcon="search"
            type="search"
            placeholder="Enter document title or number"
            hint="Search documents"
            name="document-search"
            autocomplete="off"
          ></usa-input-prefix-suffix>
        </div>
      </div>

      <div
        class="margin-top-2 padding-1 bg-primary-lighter border border-primary radius-md"
      >
        <h4>Accessibility Features</h4>
        <ul>
          <li><strong>Label Association:</strong> Each input has a properly associated label</li>
          <li><strong>Hint Text:</strong> Helper text linked via <code>aria-describedby</code></li>
          <li>
            <strong>Required Indicators:</strong> Visual and screen reader accessible required
            markers
          </li>
          <li>
            <strong>Decorative Elements:</strong> Prefixes and suffixes marked as
            <code>aria-hidden="true"</code>
          </li>
          <li>
            <strong>Icon Accessibility:</strong> Icons marked as decorative for screen readers
          </li>
          <li><strong>Keyboard Navigation:</strong> Full keyboard accessibility maintained</li>
          <li>
            <strong>Autocomplete:</strong> Proper autocomplete attributes for forms
          </li>
          <li><strong>Input Types:</strong> Semantic input types for better mobile experience</li>
        </ul>

        <h4>Testing Instructions</h4>
        <ol>
          <li>Tab through inputs to verify keyboard navigation</li>
          <li>Use screen reader to verify label and hint associations</li>
          <li>Test with high contrast mode enabled</li>
          <li>Verify focus indicators are clearly visible</li>
          <li>Check mobile keyboard behavior with different input types</li>
        </ol>
      </div>
    `;
  },
  parameters: {
    docs: {
      description: {
        story:
          'Comprehensive accessibility demonstration showing WCAG compliance and form best practices.',
      },
    },
  },
};
