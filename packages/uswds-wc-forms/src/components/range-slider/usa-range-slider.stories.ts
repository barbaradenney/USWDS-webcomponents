import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './index.ts';
import type { USARangeSlider } from './usa-range-slider.js';

const meta: Meta<USARangeSlider> = {
  title: 'Forms/Range Slider',
  component: 'usa-range-slider',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# USA Range Slider

The USA Range Slider component provides accessible numeric value selection using a visual slider interface with official USWDS styling.
This component allows users to select values within a specified range using mouse, keyboard, or touch interaction.

## Features
- Numeric range selection with min/max constraints
- Visual progress indicator showing current selection
- Enhanced keyboard navigation (Home, End, PageUp, PageDown)
- Customizable step intervals for precise control
- Optional unit display for context (%, $, etc.)
- Min/max value display options
- Current value display options
- Form validation integration
- ARIA attributes for screen readers

## Usage Guidelines

- Use for numeric value selection within a defined range
- Provide clear labels indicating what the slider controls
- Consider appropriate step intervals for the use case
- Use units when context is helpful (temperature, percentage, currency)
- Enable min/max display for user guidance
- Test keyboard accessibility for power users

## Applications

Perfect for:
- Budget allocation controls
- Assessment scales
- Service level agreements
- Performance target setting
- Threshold configuration
- Resource allocation planning
        `,
      },
    },
  },
  argTypes: {
    value: {
      control: 'number',
      description: 'Current value of the slider',
    },
    min: {
      control: 'number',
      description: 'Minimum allowed value',
    },
    max: {
      control: 'number',
      description: 'Maximum allowed value',
    },
    step: {
      control: 'number',
      description: 'Step increment for value changes',
    },
    label: {
      control: 'text',
      description: 'Label text for the slider',
    },
    hint: {
      control: 'text',
      description: 'Helper text shown below the label',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the slider is disabled',
    },
    required: {
      control: 'boolean',
      description: 'Whether the slider is required',
    },
    unit: {
      control: 'text',
      description: 'Unit to display with values (%, $, etc.)',
    },
    showValue: {
      control: 'boolean',
      description: 'Whether to show the current value',
    },
    showMinMax: {
      control: 'boolean',
      description: 'Whether to show min/max values',
    },
    name: {
      control: 'text',
      description: 'Form field name',
    },
  },
};

export default meta;
type Story = StoryObj<USARangeSlider>;

export const Default: Story = {
  args: {
    label: 'Select value',
    hint: 'Choose a value within the range',
    value: 50,
    min: 0,
    max: 100,
    step: 1,
    showValue: true,
    showMinMax: true,
    name: 'range-slider',
  },
  render: (args) => html`
    <usa-range-slider
      .label=${args.label}
      .hint=${args.hint}
      .value=${args.value}
      .min=${args.min}
      .max=${args.max}
      .step=${args.step}
      .unit=${args.unit}
      .name=${args.name}
      ?disabled=${args.disabled}
      ?required=${args.required}
      ?showValue=${args.showValue}
      ?showMinMax=${args.showMinMax}
    ></usa-range-slider>
  `,
};

export const WithValue: Story = {
  args: {
    label: 'Pre-selected value',
    value: 75,
    min: 0,
    max: 100,
    step: 1,
    hint: 'Slider with initial value set',
    showValue: true,
    showMinMax: true,
    name: 'range-slider-with-value',
  },
  render: (args) => html`
    <usa-range-slider
      .label=${args.label}
      .hint=${args.hint}
      .value=${args.value}
      .min=${args.min}
      .max=${args.max}
      .step=${args.step}
      .unit=${args.unit}
      .name=${args.name}
      ?disabled=${args.disabled}
      ?required=${args.required}
      ?showValue=${args.showValue}
      ?showMinMax=${args.showMinMax}
    ></usa-range-slider>
  `,
};

export const Required: Story = {
  args: {
    label: 'Required slider',
    hint: 'This field is required',
    value: 50,
    min: 0,
    max: 100,
    step: 1,
    required: true,
    showValue: true,
    showMinMax: true,
    name: 'range-slider-required',
  },
  render: (args) => html`
    <usa-range-slider
      .label=${args.label}
      .hint=${args.hint}
      .value=${args.value}
      .min=${args.min}
      .max=${args.max}
      .step=${args.step}
      .unit=${args.unit}
      .name=${args.name}
      ?disabled=${args.disabled}
      ?required=${args.required}
      ?showValue=${args.showValue}
      ?showMinMax=${args.showMinMax}
    ></usa-range-slider>
  `,
};

export const Disabled: Story = {
  args: {
    label: 'Disabled slider',
    value: 60,
    min: 0,
    max: 100,
    step: 1,
    hint: 'This slider is disabled',
    disabled: true,
    showValue: true,
    showMinMax: true,
    name: 'range-slider-disabled',
  },
  render: (args) => html`
    <usa-range-slider
      .label=${args.label}
      .hint=${args.hint}
      .value=${args.value}
      .min=${args.min}
      .max=${args.max}
      .step=${args.step}
      .unit=${args.unit}
      .name=${args.name}
      ?disabled=${args.disabled}
      ?required=${args.required}
      ?showValue=${args.showValue}
      ?showMinMax=${args.showMinMax}
    ></usa-range-slider>
  `,
};

export const WithUnits: Story = {
  args: {
    label: 'Temperature setting',
    value: 72,
    min: 60,
    max: 80,
    step: 1,
    unit: '°F',
    hint: 'Set your preferred temperature',
    showValue: true,
    showMinMax: true,
    name: 'range-slider-temperature',
  },
  render: (args) => html`
    <usa-range-slider
      .label=${args.label}
      .hint=${args.hint}
      .value=${args.value}
      .min=${args.min}
      .max=${args.max}
      .step=${args.step}
      .unit=${args.unit}
      .name=${args.name}
      ?disabled=${args.disabled}
      ?required=${args.required}
      ?showValue=${args.showValue}
      ?showMinMax=${args.showMinMax}
    ></usa-range-slider>
  `,
};

export const Percentage: Story = {
  args: {
    label: 'Completion percentage',
    value: 65,
    min: 0,
    max: 100,
    step: 1,
    unit: '%',
    hint: 'Track project completion',
    showValue: true,
    showMinMax: true,
    name: 'range-slider-percentage',
  },
  render: (args) => html`
    <usa-range-slider
      .label=${args.label}
      .hint=${args.hint}
      .value=${args.value}
      .min=${args.min}
      .max=${args.max}
      .step=${args.step}
      .unit=${args.unit}
      .name=${args.name}
      ?disabled=${args.disabled}
      ?required=${args.required}
      ?showValue=${args.showValue}
      ?showMinMax=${args.showMinMax}
    ></usa-range-slider>
  `,
};

export const Currency: Story = {
  args: {
    label: 'Budget allocation',
    value: 2500,
    min: 0,
    max: 10000,
    step: 100,
    unit: '$',
    hint: 'Set budget amount in dollars',
    showValue: true,
    showMinMax: true,
    name: 'range-slider-currency',
  },
  render: (args) => html`
    <usa-range-slider
      .label=${args.label}
      .hint=${args.hint}
      .value=${args.value}
      .min=${args.min}
      .max=${args.max}
      .step=${args.step}
      .unit=${args.unit}
      .name=${args.name}
      ?disabled=${args.disabled}
      ?required=${args.required}
      ?showValue=${args.showValue}
      ?showMinMax=${args.showMinMax}
    ></usa-range-slider>
  `,
};

export const CustomRange: Story = {
  args: {
    label: 'Custom range (10-90)',
    value: 45,
    min: 10,
    max: 90,
    step: 5,
    hint: 'Slider with custom min/max values',
    showValue: true,
    showMinMax: true,
    name: 'range-slider-custom',
  },
  render: (args) => html`
    <usa-range-slider
      .label=${args.label}
      .hint=${args.hint}
      .value=${args.value}
      .min=${args.min}
      .max=${args.max}
      .step=${args.step}
      .unit=${args.unit}
      .name=${args.name}
      ?disabled=${args.disabled}
      ?required=${args.required}
      ?showValue=${args.showValue}
      ?showMinMax=${args.showMinMax}
    ></usa-range-slider>
  `,
};

export const FineGrained: Story = {
  args: {
    label: 'Precision control',
    value: 2.5,
    min: 0,
    max: 5,
    step: 0.1,
    unit: 'x',
    hint: 'Fine-grained decimal control',
    showValue: true,
    showMinMax: true,
    name: 'range-slider-precision',
  },
  render: (args) => html`
    <usa-range-slider
      .label=${args.label}
      .hint=${args.hint}
      .value=${args.value}
      .min=${args.min}
      .max=${args.max}
      .step=${args.step}
      .unit=${args.unit}
      .name=${args.name}
      ?disabled=${args.disabled}
      ?required=${args.required}
      ?showValue=${args.showValue}
      ?showMinMax=${args.showMinMax}
    ></usa-range-slider>
  `,
};

export const HiddenMinMax: Story = {
  args: {
    label: 'Clean interface',
    value: 30,
    min: 0,
    max: 100,
    step: 1,
    showMinMax: false,
    showValue: true,
    hint: 'Slider without min/max display',
    name: 'range-slider-no-minmax',
  },
  render: (args) => html`
    <usa-range-slider
      .label=${args.label}
      .hint=${args.hint}
      .value=${args.value}
      .min=${args.min}
      .max=${args.max}
      .step=${args.step}
      .unit=${args.unit}
      .name=${args.name}
      ?disabled=${args.disabled}
      ?required=${args.required}
      ?showValue=${args.showValue}
      ?showMinMax=${args.showMinMax}
    ></usa-range-slider>
  `,
};

export const HiddenValue: Story = {
  args: {
    label: 'No value display',
    value: 40,
    min: 0,
    max: 100,
    step: 1,
    showValue: false,
    showMinMax: true,
    hint: 'Slider without current value display',
    name: 'range-slider-no-value',
  },
  render: (args) => html`
    <usa-range-slider
      .label=${args.label}
      .hint=${args.hint}
      .value=${args.value}
      .min=${args.min}
      .max=${args.max}
      .step=${args.step}
      .unit=${args.unit}
      .name=${args.name}
      ?disabled=${args.disabled}
      ?required=${args.required}
      ?showValue=${args.showValue}
      ?showMinMax=${args.showMinMax}
    ></usa-range-slider>
  `,
};

export const Minimal: Story = {
  args: {
    label: 'Minimal slider',
    value: 25,
    min: 0,
    max: 100,
    step: 1,
    showValue: false,
    showMinMax: false,
    hint: 'Clean, minimal interface',
    name: 'range-slider-minimal',
  },
  render: (args) => html`
    <usa-range-slider
      .label=${args.label}
      .hint=${args.hint}
      .value=${args.value}
      .min=${args.min}
      .max=${args.max}
      .step=${args.step}
      .unit=${args.unit}
      .name=${args.name}
      ?disabled=${args.disabled}
      ?required=${args.required}
      ?showValue=${args.showValue}
      ?showMinMax=${args.showMinMax}
    ></usa-range-slider>
  `,
};

export const InteractiveDemo: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div class="display-flex flex-column gap-205 maxw-tablet-lg">
      <h2>Interactive Range Slider Demo</h2>
      <p>
        Test slider interactions, keyboard navigation, and event handling with real-time feedback.
      </p>

      <usa-range-slider
        label="Test slider"
        hint="Try mouse, keyboard, and touch interactions"
        value="50"
        min="0"
        max="100"
        step="1"
        unit="%"
        name="demo-slider"
        @range-change="${(e: CustomEvent) => {
          const output = document.getElementById('slider-output');
          if (output) {
            const { value, formattedValue, percentage } = e.detail;
            output.innerHTML = `
              <strong>Slider Value Changed:</strong><br>
              Raw Value: ${value}<br>
              Formatted Value: ${formattedValue}<br>
              Percentage: ${percentage.toFixed(1)}%<br>
              Timestamp: ${new Date().toLocaleTimeString()}
            `;
          }
        }}"
      ></usa-range-slider>

      <div class="margin-top-1 padding-1 bg-base-lightest radius-md">
        <h4>Real-time Output:</h4>
        <div id="slider-output">No changes yet. Move the slider to see event details.</div>
      </div>

      <div class="margin-top-1 padding-1 bg-info-lighter radius-md">
        <h4>Testing Instructions:</h4>
        <ul>
          <li><strong>Mouse:</strong> Click and drag the slider handle</li>
          <li><strong>Keyboard:</strong> Tab to focus, use arrow keys to adjust</li>
          <li>
            <strong>Enhanced Navigation:</strong> Home (min), End (max), PageUp/PageDown (large
            steps)
          </li>
          <li><strong>Touch:</strong> Tap and drag on touch devices</li>
          <li><strong>Precision:</strong> Use arrow keys for single-step adjustments</li>
        </ul>
      </div>
    </div>
  `,
};

export const AccessibilityShowcase: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div class="display-flex flex-column gap-205 maxw-tablet-lg">
      <h2>Accessibility Features Demonstration</h2>
      <p>Showcasing WCAG 2.1 AA compliance and Section 508 accessibility features.</p>

      <usa-range-slider
        label="Accessible range slider"
        hint="Full keyboard navigation and screen reader support"
        value="60"
        min="0"
        max="100"
        unit="%"
        required
        name="accessible-slider"
      ></usa-range-slider>

      <usa-range-slider
        label="High contrast compatible"
        hint="Works with high contrast themes and screen readers"
        value="3.5"
        min="1"
        max="5"
        step="0.1"
        unit="/5"
        name="contrast-slider"
      ></usa-range-slider>

      <div class="margin-top-1 padding-1 bg-warning-lighter radius-md">
        <h4>Accessibility Features:</h4>
        <ul>
          <li><strong>Screen Reader Support:</strong> ARIA labels, roles, and live regions</li>
          <li><strong>Keyboard Navigation:</strong> Arrow keys, Home, End, PageUp, PageDown</li>
          <li><strong>High Contrast:</strong> Compatible with high contrast themes</li>
          <li><strong>Focus Management:</strong> Clear focus indicators and logical tab order</li>
          <li><strong>Value Announcement:</strong> Screen readers announce current values</li>
          <li><strong>Semantic HTML:</strong> Proper form labels and associations</li>
        </ul>
      </div>

      <div class="margin-top-1 padding-1 bg-primary-lighter radius-md">
        <h4>Testing with Assistive Technology:</h4>
        <ul>
          <li>Navigate using Tab key to focus sliders</li>
          <li>Use arrow keys for single-step value changes</li>
          <li>Press Home/End for minimum/maximum values</li>
          <li>Use PageUp/PageDown for large value jumps</li>
          <li>Test with screen reader (NVDA, JAWS, VoiceOver)</li>
          <li>Verify proper value announcements</li>
        </ul>
      </div>
    </div>
  `,
};

export const FormIntegration: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div class="display-flex flex-column gap-205 maxw-tablet">
      <h2>Form Integration Example</h2>
      <p>Example of range slider integration in forms with validation.</p>

      <form
        @submit="${(e: Event) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          const output = document.getElementById('form-slider-output');
          if (output) {
            output.innerHTML = `
            <strong>Form Submitted:</strong><br>
            Budget Priority: ${formData.get('budget-priority')}%<br>
            Risk Level: ${formData.get('risk-level')}/10<br>
            Confidence: ${formData.get('confidence-level') || 'Not specified'}%<br>
            Submitted at: ${new Date().toLocaleString()}
          `;
          }
        }}"
      >
        <usa-range-slider
          label="Budget priority level"
          hint="Required - Set budget priority percentage"
          value="50"
          min="0"
          max="100"
          step="5"
          unit="%"
          name="budget-priority"
          required
        ></usa-range-slider>

        <usa-range-slider
          label="Risk assessment score"
          hint="Required - Rate risk level on 1-10 scale"
          value="5"
          min="1"
          max="10"
          step="1"
          unit="/10"
          name="risk-level"
          required
        ></usa-range-slider>

        <usa-range-slider
          label="Confidence level"
          hint="Optional - How confident are you in this assessment?"
          value="75"
          min="0"
          max="100"
          step="5"
          unit="%"
          name="confidence-level"
        ></usa-range-slider>

        <div class="margin-top-3">
          <button type="submit" class="usa-button">Submit Assessment</button>
          <button type="reset" class="usa-button usa-button--secondary">Clear Form</button>
        </div>
      </form>

      <div class="margin-top-1 padding-1 bg-base-lightest radius-md">
        <h4>Form Output:</h4>
        <div id="form-slider-output">Submit the form to see the selected values.</div>
      </div>
    </div>
  `,
};
