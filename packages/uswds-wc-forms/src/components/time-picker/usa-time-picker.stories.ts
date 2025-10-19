import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './index.ts';
import type { USATimePicker } from './usa-time-picker.js';

const meta: Meta<USATimePicker> = {
  title: 'Forms/Time Picker',
  component: 'usa-time-picker',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# USA Time Picker

The USA Time Picker component provides accessible time selection functionality using a combo box pattern with official USWDS styling.
This component allows users to select times from a dropdown list or enter time values directly with intelligent parsing.

## Features
- Combo box-style time selection with filtering
- 12-hour and 24-hour time format support  
- Customizable time intervals (step)
- Time range constraints (min/max time)
- Keyboard navigation support
- ARIA attributes for screen readers
- Direct text input with intelligent parsing
- Form validation integration

## Usage Guidelines

- Use for time selection in forms and applications
- Provide clear labels indicating time format expectations
- Consider time range constraints for business hours
- Use appropriate step intervals (15, 30, or 60 minutes)
- Test keyboard accessibility for power users
- Ensure proper form validation integration

## Common Applications

Perfect for:
- Appointment scheduling systems
- Meeting room reservations
- Service hour specifications
- Reporting with time requirements
- Event scheduling
        `,
      },
    },
  },
  argTypes: {
    value: {
      control: 'text',
      description: 'Time value in 24-hour format (HH:mm)',
    },
    label: {
      control: 'text',
      description: 'Label text for the time picker',
    },
    hint: {
      control: 'text',
      description: 'Helper text shown below the label',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the input',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the time picker is disabled',
    },
    required: {
      control: 'boolean',
      description: 'Whether the time picker is required',
    },
    minTime: {
      control: 'text',
      description: 'Minimum allowed time in 24-hour format',
    },
    maxTime: {
      control: 'text',
      description: 'Maximum allowed time in 24-hour format',
    },
    step: {
      control: 'select',
      options: ['5', '15', '30', '60'],
      description: 'Time interval in minutes',
    },
    name: {
      control: 'text',
      description: 'Form field name',
    },
  },
};

export default meta;
type Story = StoryObj<USATimePicker>;

export const Default: Story = {
  args: {
    label: 'Appointment time',
    hint: 'Select or enter a time',
  },
};

export const WithValue: Story = {
  args: {
    label: 'Meeting time',
    value: '14:30',
    hint: 'Pre-selected time example',
  },
};

export const Required: Story = {
  args: {
    label: 'Required appointment time',
    hint: 'This field is required',
    required: true,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled time picker',
    value: '09:00',
    hint: 'This time picker is disabled',
    disabled: true,
  },
};

export const BusinessHours: Story = {
  args: {
    label: 'Business hours appointment',
    hint: 'Available times between 9 AM and 5 PM',
    minTime: '09:00',
    maxTime: '17:00',
    step: '30',
  },
};

export const FifteenMinuteIntervals: Story = {
  args: {
    label: 'Precise scheduling',
    hint: '15-minute intervals for detailed scheduling',
    step: '15',
  },
};

export const HourlyIntervals: Story = {
  args: {
    label: 'Hourly appointments',
    hint: 'Available on the hour only',
    step: '60',
  },
};

export const ExtendedHours: Story = {
  args: {
    label: '24-hour service time',
    hint: 'Select any time of day',
    minTime: '00:00',
    maxTime: '23:59',
    step: '30',
  },
};

export const MorningOnly: Story = {
  args: {
    label: 'Morning appointment',
    hint: 'Available from 6 AM to 12 PM',
    minTime: '06:00',
    maxTime: '12:00',
    step: '30',
  },
};

export const CustomPlaceholder: Story = {
  args: {
    label: 'Enter time',
    placeholder: 'Select time...',
    hint: 'Custom placeholder example',
  },
};

// Common usage examples
export const OfficeHours: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div class="display-flex flex-column gap-205 maxw-mobile-lg">
      <h2>Office Hours Scheduling</h2>
      <p>Schedule appointments during standard business hours.</p>

      <usa-time-picker
        label="Service appointment"
        hint="Available Monday-Friday, 8:00 AM to 4:30 PM"
        min-time="08:00"
        max-time="16:30"
        step="30"
        name="appointment-time"
      ></usa-time-picker>

      <div class="margin-top-1 padding-1 bg-base-lightest radius-md">
        <h4>Usage Notes:</h4>
        <ul>
          <li>Standard business hours (8:00 AM - 4:30 PM)</li>
          <li>30-minute appointment slots</li>
          <li>Excludes lunch hour (12:00 PM - 1:00 PM) - implement via backend logic</li>
          <li>Compatible with holiday scheduling systems</li>
        </ul>
      </div>
    </div>
  `,
};

export const MedicalAppointments: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div class="display-flex flex-column gap-205 maxw-mobile-lg">
      <h2>Medical Center Scheduling</h2>
      <p>Schedule medical appointments at healthcare facilities.</p>

      <usa-time-picker
        label="Primary care appointment"
        hint="Available weekdays 7:00 AM to 6:00 PM"
        min-time="07:00"
        max-time="18:00"
        step="15"
        required
        name="primary-appointment"
      ></usa-time-picker>

      <usa-time-picker
        label="Specialty consultation"
        hint="Limited availability - contact scheduling"
        min-time="08:00"
        max-time="16:00"
        step="30"
        name="specialty-appointment"
      ></usa-time-picker>

      <div class="margin-top-1 padding-1 bg-success-lighter radius-md">
        <h4>Healthcare Scheduling:</h4>
        <ul>
          <li>Integration with medical records systems</li>
          <li>Different time slots for various services</li>
          <li>Compliance with healthcare regulations</li>
          <li>Patient accessibility considerations</li>
        </ul>
      </div>
    </div>
  `,
};

export const InteractiveDemo: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div class="display-flex flex-column gap-205 maxw-tablet-lg">
      <h2>Interactive Time Picker Demo</h2>
      <p>Test time selection, formatting, and event handling with real-time feedback.</p>

      <usa-time-picker
        label="Test time selection"
        hint="Try different input formats: 9:00 am, 14:30, 3pm"
        step="15"
        name="demo-time"
        @time-change="${(e: CustomEvent) => {
          const output = document.getElementById('time-output');
          if (output) {
            const { value, displayValue } = e.detail;
            output.innerHTML = `
              <strong>Time Selected:</strong><br>
              Internal Value: ${value}<br>
              Display Value: ${displayValue}<br>
              Timestamp: ${new Date().toLocaleTimeString()}
            `;
          }
        }}"
      ></usa-time-picker>

      <div class="margin-top-1 padding-1 bg-base-lightest radius-md">
        <h4>Real-time Output:</h4>
        <div id="time-output">No time selected yet. Choose a time to see event details.</div>
      </div>

      <div class="margin-top-1 padding-1 bg-info-lighter radius-md">
        <h4>Testing Instructions:</h4>
        <ul>
          <li><strong>Dropdown:</strong> Click the dropdown arrow to see available times</li>
          <li><strong>Typing:</strong> Type directly: "9am", "2:30 pm", "14:45"</li>
          <li><strong>Keyboard:</strong> Use arrow keys to navigate, Enter to select</li>
          <li><strong>Filtering:</strong> Type partial times to filter options</li>
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
      <p>Showcasing WCAG 2.1 AA compliance and accessibility features.</p>

      <usa-time-picker
        label="Accessible time picker"
        hint="Full keyboard navigation and screen reader support"
        required
        step="30"
        name="accessible-time"
        input-id="accessible-time-input"
      ></usa-time-picker>

      <usa-time-picker
        label="High contrast example"
        hint="Works with high contrast themes"
        step="15"
        name="contrast-time"
      ></usa-time-picker>

      <div class="margin-top-1 padding-1 bg-warning-lighter radius-md">
        <h4>Accessibility Features:</h4>
        <ul>
          <li><strong>Screen Reader Support:</strong> ARIA labels, roles, and properties</li>
          <li><strong>Keyboard Navigation:</strong> Arrow keys, Enter, Escape support</li>
          <li><strong>High Contrast:</strong> Compatible with high contrast themes</li>
          <li><strong>Focus Management:</strong> Clear focus indicators and logical tab order</li>
          <li><strong>Error Handling:</strong> Accessible error messages and validation</li>
          <li><strong>Labels:</strong> Proper label association and required indicators</li>
        </ul>
      </div>

      <div class="margin-top-1 padding-1 bg-info-lighter radius-md">
        <h4>Testing with Assistive Technology:</h4>
        <ul>
          <li>Navigate using Tab key to focus elements</li>
          <li>Use arrow keys to move through time options</li>
          <li>Press Enter to select highlighted time</li>
          <li>Test with screen reader (NVDA, JAWS, VoiceOver)</li>
          <li>Verify proper announcements for state changes</li>
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
      <h2>Form Integration</h2>
      <p>Example of time picker integration in forms with validation.</p>

      <form
        @submit="${(e: Event) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          const output = document.getElementById('form-output');
          if (output) {
            output.innerHTML = `
            <strong>Form Submitted:</strong><br>
            Meeting Start: ${formData.get('meeting-start')}<br>
            Meeting End: ${formData.get('meeting-end')}<br>
            Break Time: ${formData.get('break-time') || 'Not specified'}<br>
            Submitted at: ${new Date().toLocaleString()}
          `;
          }
        }}"
      >
        <usa-time-picker
          label="Meeting start time"
          hint="Required - When does the meeting begin?"
          required
          step="15"
          min-time="08:00"
          max-time="18:00"
          name="meeting-start"
        ></usa-time-picker>

        <usa-time-picker
          label="Meeting end time"
          hint="Required - When does the meeting end?"
          required
          step="15"
          min-time="08:00"
          max-time="18:00"
          name="meeting-end"
        ></usa-time-picker>

        <usa-time-picker
          label="Break time"
          hint="Optional - Schedule a break during the meeting"
          step="15"
          name="break-time"
        ></usa-time-picker>

        <div class="margin-top-3">
          <button type="submit" class="usa-button">Submit Schedule</button>
          <button type="reset" class="usa-button usa-button--secondary">Clear Form</button>
        </div>
      </form>

      <div class="margin-top-1 padding-1 bg-base-lightest radius-md">
        <h4>Form Output:</h4>
        <div id="form-output">Submit the form to see the selected times.</div>
      </div>
    </div>
  `,
};

