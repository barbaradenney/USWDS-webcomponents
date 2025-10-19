import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './index.ts';
import type { USAComboBox } from './usa-combo-box.js';

const meta: Meta<USAComboBox> = {
  title: 'Components/Combo Box',
  component: 'usa-combo-box',
  decorators: [
    (story) => html`
      <div class="position-relative overflow-visible">
        ${story()}
      </div>
    `,
  ],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
The Combo Box component is a USWDS-compliant form element built on top of a native select element with JavaScript enhancement. It follows the progressive enhancement pattern - works as a basic select without JavaScript, enhanced to a filterable combo box with JavaScript.

**USWDS Compliance Features:**
- Built on native select element for accessibility
- Progressive enhancement - works without JavaScript
- Official USWDS HTML structure and CSS classes
- Native form validation and submission
- Proper ARIA attributes and keyboard navigation

**Best Practices:**
- Use for lists with 15+ options where filtering is beneficial
- Ensure options are meaningful and searchable
- Include clear placeholder text
- Test with real data from your application
        `,
      },
    },
  },
  argTypes: {
    options: {
      control: 'object',
      description: 'Array of options with value and label properties',
    },
    value: {
      control: 'text',
      description: 'Currently selected value',
    },
    name: {
      control: 'text',
      description: 'Name attribute for form submission',
    },
    label: {
      control: 'text',
      description: 'Label text for the combo box',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text shown as first option',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the combo box is disabled',
    },
    required: {
      control: 'boolean',
      description: 'Whether selection is required',
    },
  },
};

export default meta;
type Story = StoryObj<USAComboBox>;

// Common fruit options from USWDS examples
const fruitOptions = [
  { value: 'apple', label: 'Apple' },
  { value: 'apricot', label: 'Apricot' },
  { value: 'avocado', label: 'Avocado' },
  { value: 'banana', label: 'Banana' },
  { value: 'blackberry', label: 'Blackberry' },
  { value: 'blood-orange', label: 'Blood orange' },
  { value: 'blueberry', label: 'Blueberry' },
  { value: 'boysenberry', label: 'Boysenberry' },
  { value: 'breadfruit', label: 'Breadfruit' },
  { value: 'buddhas-hand-citron', label: "Buddha's hand citron" },
  { value: 'cantaloupe', label: 'Cantaloupe' },
  { value: 'clementine', label: 'Clementine' },
  { value: 'crab-apple', label: 'Crab apple' },
  { value: 'currant', label: 'Currant' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'custard-apple', label: 'Custard apple' },
  { value: 'coconut', label: 'Coconut' },
  { value: 'cranberry', label: 'Cranberry' },
  { value: 'date', label: 'Date' },
  { value: 'dragonfruit', label: 'Dragonfruit' },
  { value: 'durian', label: 'Durian' },
  { value: 'elderberry', label: 'Elderberry' },
  { value: 'fig', label: 'Fig' },
  { value: 'gooseberry', label: 'Gooseberry' },
  { value: 'grape', label: 'Grape' },
  { value: 'grapefruit', label: 'Grapefruit' },
  { value: 'guava', label: 'Guava' },
  { value: 'honeydew-melon', label: 'Honeydew melon' },
  { value: 'jackfruit', label: 'Jackfruit' },
  { value: 'kiwifruit', label: 'Kiwifruit' },
  { value: 'kumquat', label: 'Kumquat' },
  { value: 'lemon', label: 'Lemon' },
  { value: 'lime', label: 'Lime' },
  { value: 'lychee', label: 'Lychee' },
  { value: 'mandarine', label: 'Mandarine' },
  { value: 'mango', label: 'Mango' },
  { value: 'mangosteen', label: 'Mangosteen' },
  { value: 'marionberry', label: 'Marionberry' },
  { value: 'nectarine', label: 'Nectarine' },
  { value: 'orange', label: 'Orange' },
  { value: 'papaya', label: 'Papaya' },
  { value: 'passionfruit', label: 'Passionfruit' },
  { value: 'peach', label: 'Peach' },
  { value: 'pear', label: 'Pear' },
  { value: 'persimmon', label: 'Persimmon' },
  { value: 'plantain', label: 'Plantain' },
  { value: 'plum', label: 'Plum' },
  { value: 'pineapple', label: 'Pineapple' },
  { value: 'pluot', label: 'Pluot' },
  { value: 'pomegranate', label: 'Pomegranate' },
  { value: 'pomelo', label: 'Pomelo' },
  { value: 'quince', label: 'Quince' },
  { value: 'raspberry', label: 'Raspberry' },
  { value: 'rambutan', label: 'Rambutan' },
  { value: 'soursop', label: 'Soursop' },
  { value: 'starfruit', label: 'Starfruit' },
  { value: 'strawberry', label: 'Strawberry' },
  { value: 'tamarind', label: 'Tamarind' },
  { value: 'tangelo', label: 'Tangelo' },
  { value: 'tangerine', label: 'Tangerine' },
  { value: 'ugli-fruit', label: 'Ugli fruit' },
  { value: 'watermelon', label: 'Watermelon' },
  { value: 'white-currant', label: 'White currant' },
  { value: 'yuzu', label: 'Yuzu' },
];

export const Default: Story = {
  render: (args) => html`
    <usa-combo-box
      label="${args.label}"
      name="${args.name}"
      placeholder="${args.placeholder}"
      value="${args.value || ''}"
      data-default-value="${args.value || ''}"
      ?disabled=${args.disabled}
      ?required=${args.required}
      .options=${args.options}
    ></usa-combo-box>
  `,
  args: {
    label: 'Select a fruit',
    name: 'fruit',
    placeholder: 'Select a fruit',
    options: fruitOptions,
  },
};

export const WithDefaultValue: Story = {
  render: (args) => html`
    <usa-combo-box
      label="${args.label}"
      name="${args.name}"
      placeholder="${args.placeholder}"
      value="${args.value || ''}"
      data-default-value="${args.value || ''}"
      ?disabled=${args.disabled}
      ?required=${args.required}
      .options=${args.options}
    ></usa-combo-box>
  `,
  args: {
    label: 'Favorite fruit',
    name: 'favorite-fruit',
    placeholder: 'Select a fruit',
    value: 'apple',
    options: fruitOptions,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Combo box with a pre-selected default value using USWDS data-default-value attribute.',
      },
    },
  },
};

export const Required: Story = {
  render: (args) => html`
    <usa-combo-box
      label="${args.label}"
      name="${args.name}"
      placeholder="${args.placeholder}"
      value="${args.value || ''}"
      data-default-value="${args.value || ''}"
      ?disabled=${args.disabled}
      ?required=${args.required}
      .options=${args.options}
    ></usa-combo-box>
  `,
  args: {
    label: 'Favorite fruit (required)',
    name: 'required-fruit',
    placeholder: 'Select a fruit',
    required: true,
    options: fruitOptions,
  },
  parameters: {
    docs: {
      description: {
        story: 'Required combo box that participates in native form validation.',
      },
    },
  },
};

export const Disabled: Story = {
  render: (args) => html`
    <usa-combo-box
      label="${args.label}"
      name="${args.name}"
      placeholder="${args.placeholder}"
      value="${args.value || ''}"
      data-default-value="${args.value || ''}"
      ?disabled=${args.disabled}
      ?required=${args.required}
      .options=${args.options}
    ></usa-combo-box>
  `,
  args: {
    label: 'Disabled combo box',
    name: 'disabled-fruit',
    value: 'apple',
    disabled: true,
    options: fruitOptions,
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled combo box state.',
      },
    },
  },
};

