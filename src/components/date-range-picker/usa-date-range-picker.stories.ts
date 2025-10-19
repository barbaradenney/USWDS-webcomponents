import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './index.ts';
import type { USADateRangePicker } from './usa-date-range-picker.js';

const meta: Meta<USADateRangePicker> = {
  title: 'Forms/Date Range Picker',
  component: 'usa-date-range-picker',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
The USA Date Range Picker provides a user-friendly interface for selecting date ranges in forms and applications. Built to meet WCAG 2.1 AA accessibility standards.

**Common Use Cases:**
- Project timelines and milestone planning
- Event scheduling and booking periods
- Reporting periods and data collection windows
- Budget planning and financial cycles
- Service availability and booking ranges
        `,
      },
    },
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'Main label for the date range picker fieldset',
    },
    startLabel: {
      control: 'text',
      description: 'Label for the start date input',
    },
    endLabel: {
      control: 'text',
      description: 'Label for the end date input',
    },
    hint: {
      control: 'text',
      description: 'Helpful guidance text for users',
    },
    startDate: {
      control: 'text',
      description: 'Initial start date (YYYY-MM-DD format)',
    },
    endDate: {
      control: 'text',
      description: 'Initial end date (YYYY-MM-DD format)',
    },
    minDate: {
      control: 'text',
      description: 'Minimum selectable date (YYYY-MM-DD format)',
    },
    maxDate: {
      control: 'text',
      description: 'Maximum selectable date (YYYY-MM-DD format)',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text for date inputs',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the entire date range picker',
    },
    required: {
      control: 'boolean',
      description: 'Mark as required field',
    },
    name: {
      control: 'text',
      description: 'Base name for form inputs',
    },
  },
};

export default meta;
type Story = StoryObj<USADateRangePicker>;

// Basic Stories
export const Default: Story = {
  args: {
    label: 'Select date range',
    startLabel: 'Start date',
    endLabel: 'End date',
    hint: 'Choose your preferred date range',
  },
};

export const WithInitialDates: Story = {
  args: {
    label: 'Project timeline',
    startLabel: 'Project start',
    endLabel: 'Project end',
    startDate: '2024-01-15',
    endDate: '2024-03-15',
    hint: 'Current project timeline',
  },
};

export const Required: Story = {
  args: {
    label: 'Required reporting period',
    startLabel: 'Period start',
    endLabel: 'Period end',
    required: true,
    hint: 'This field is required for compliance reporting',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled date range',
    startLabel: 'Start date',
    endLabel: 'End date',
    disabled: true,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    hint: 'This date range cannot be modified',
  },
};

export const WithConstraints: Story = {
  args: {
    label: 'Constrained date selection',
    startLabel: 'Available from',
    endLabel: 'Available until',
    minDate: '2024-01-01',
    maxDate: '2024-12-31',
    hint: 'Dates must be within fiscal year 2024',
  },
};

// Business Use Case Stories
export const QuarterlyReporting: Story = {
  args: {
    label: 'Q2 2024 Business Reporting Period',
    startLabel: 'Quarter start',
    endLabel: 'Quarter end',
    startDate: '2024-04-01',
    endDate: '2024-06-30',
    minDate: '2024-04-01',
    maxDate: '2024-06-30',
    hint: 'Select dates within Q2 business quarter (April 1 - June 30, 2024)',
    required: true,
    name: 'business-q2',
  },
};

export const ProjectDuration: Story = {
  args: {
    label: 'Project Timeline',
    startLabel: 'Project start date',
    endLabel: 'Project completion date',
    minDate: '2024-10-01',
    maxDate: '2026-09-30',
    hint: 'Project must start no earlier than October 1, 2024 and complete by September 30, 2026',
    required: true,
    name: 'project-duration',
  },
};

export const AnnualReportingPeriod: Story = {
  args: {
    label: 'Annual Business Reporting Period',
    startLabel: 'Reporting period start',
    endLabel: 'Reporting period end',
    startDate: '2023-10-01',
    endDate: '2024-09-30',
    minDate: '2023-10-01',
    maxDate: '2024-09-30',
    hint: 'Business fiscal year 2024 (October 1, 2023 - September 30, 2024)',
    required: true,
    name: 'annual-reporting',
  },
};

export const ConferenceEventPlanning: Story = {
  args: {
    label: 'Conference Event Dates',
    startLabel: 'Conference start',
    endLabel: 'Conference end',
    minDate: '2024-09-01',
    maxDate: '2024-12-31',
    hint: 'Plan conference dates for Q4 2024',
    required: true,
    name: 'conference-planning',
  },
};

export const AuditPeriodSelection: Story = {
  args: {
    label: 'Audit Coverage Period',
    startLabel: 'Audit period start',
    endLabel: 'Audit period end',
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    minDate: '2020-01-01',
    maxDate: '2024-12-31',
    hint: 'Select the time period to be covered by the audit (up to 5 years)',
    required: true,
    name: 'audit-period',
  },
};

export const BudgetPlanningCycle: Story = {
  args: {
    label: 'Budget Planning Period',
    startLabel: 'Planning start',
    endLabel: 'Planning end',
    startDate: '2024-03-01',
    endDate: '2024-08-31',
    minDate: '2024-03-01',
    maxDate: '2024-08-31',
    hint: '2025 budget planning cycle (March 1 - August 31, 2024)',
    required: true,
    name: 'budget-cycle',
  },
};

export const TaxReportingPeriod: Story = {
  args: {
    label: 'Tax Reporting Period',
    startLabel: 'Reporting period start',
    endLabel: 'Reporting period end',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    minDate: '2024-01-01',
    maxDate: '2024-12-31',
    hint: 'Tax year 2024 reporting period (January 1 - December 31, 2024)',
    required: true,
    name: 'tax-reporting',
  },
};

export const ContractPeriod: Story = {
  args: {
    label: 'Contract Performance Period',
    startLabel: 'Performance start',
    endLabel: 'Performance end',
    minDate: '2024-01-01',
    maxDate: '2029-12-31',
    hint: 'Select contract performance period (maximum 5 years)',
    required: true,
    name: 'contract-performance',
  },
};

export const ReviewPeriod: Story = {
  args: {
    label: 'Review Period',
    startLabel: 'Review period opens',
    endLabel: 'Review period closes',
    startDate: '2024-11-01',
    endDate: '2024-12-01',
    minDate: '2024-11-01',
    maxDate: '2024-12-01',
    hint: '30-day review period for policy updates',
    disabled: true,
    name: 'review-period',
  },
};

export const CertificationValidity: Story = {
  args: {
    label: 'Certification Validity Period',
    startLabel: 'Certification effective',
    endLabel: 'Certification expires',
    startDate: '2024-01-15',
    endDate: '2029-01-14',
    minDate: '2024-01-01',
    maxDate: '2034-12-31',
    hint: 'Professional certification valid for 5 years from effective date',
    required: true,
    name: 'certification-validity',
  },
};

// Interactive Demonstrations
export const InteractiveValidation: Story = {
  args: {
    label: 'Interactive Date Range Validation',
    startLabel: 'Start date',
    endLabel: 'End date',
    hint: 'Try selecting dates - end date will auto-adjust if before start date',
    name: 'validation-demo',
  },
  render: (args) => html`
    <usa-date-range-picker
      .label=${args.label}
      .startLabel=${args.startLabel}
      .endLabel=${args.endLabel}
      .hint=${args.hint}
      .name=${args.name}
      @date-range-change=${(e: CustomEvent) => {
        console.log('Date Range Change Event:', {
          range: e.detail.range,
          isComplete: e.detail.isComplete,
          daysDifference: e.detail.daysDifference,
        });
      }}
    ></usa-date-range-picker>
    <div class="margin-top-1 padding-1 bg-base-lightest radius-md">
      <strong>Instructions:</strong>
      <ul>
        <li>Select a start date first</li>
        <li>Then select an end date</li>
        <li>If you select an end date before the start date, it will be rejected</li>
        <li>Check browser console for event details</li>
      </ul>
    </div>
  `,
};

export const AccessibilityShowcase: Story = {
  args: {
    label: 'Accessibility Features Demo',
    startLabel: 'Start date',
    endLabel: 'End date',
    hint: 'Navigate using keyboard: Tab to move between fields, Enter to open calendar, Arrow keys to navigate dates',
    required: true,
    name: 'accessibility-demo',
  },
  render: (args) => html`
    <usa-date-range-picker
      .label=${args.label}
      .startLabel=${args.startLabel}
      .endLabel=${args.endLabel}
      .hint=${args.hint}
      ?required=${args.required}
      .name=${args.name}
    ></usa-date-range-picker>
    <div class="margin-top-1 padding-1 bg-primary-lighter radius-md">
      <strong>Accessibility Features:</strong>
      <ul>
        <li>
          <strong>Keyboard Navigation:</strong> Full keyboard support with Tab, Enter, and Arrow
          keys
        </li>
        <li><strong>Screen Reader:</strong> Proper ARIA labels and fieldset/legend structure</li>
        <li>
          <strong>Required Field:</strong> Visual and programmatic indication of required fields
        </li>
        <li><strong>Error Prevention:</strong> Invalid date ranges are prevented automatically</li>
        <li><strong>Focus Management:</strong> Logical tab order and focus indicators</li>
      </ul>
    </div>
  `,
};

// Additional Business Examples
export const SeasonalCampaign: Story = {
  args: {
    label: 'Seasonal Campaign Period',
    startLabel: 'Campaign start',
    endLabel: 'Campaign end',
    minDate: '2024-06-01',
    maxDate: '2024-11-30',
    hint: 'Summer campaign coverage period (June 1 - November 30)',
    required: true,
    name: 'seasonal-campaign',
  },
};

export const SalesMonitoringPeriod: Story = {
  args: {
    label: 'Sales Performance Monitoring Period',
    startLabel: 'Monitoring start',
    endLabel: 'Monitoring end',
    startDate: '2024-09-01',
    endDate: '2024-11-30',
    minDate: '2024-09-01',
    maxDate: '2024-11-30',
    hint: 'Q4 sales performance monitoring period (September 1 - November 30, 2024)',
    required: true,
    name: 'sales-monitoring',
  },
};

export const ApplicationProcessing: Story = {
  args: {
    label: 'Application Processing Period',
    startLabel: 'Application opened',
    endLabel: 'Target completion',
    minDate: '2024-01-01',
    maxDate: '2025-12-31',
    hint: 'Application processing timeline (maximum 24 months)',
    required: true,
    name: 'application-processing',
  },
};

export const EmploymentPeriod: Story = {
  args: {
    label: 'Employment Duration',
    startLabel: 'Employment start',
    endLabel: 'Employment end',
    maxDate: '2024-09-05',
    hint: 'Enter dates of employment for reference verification',
    required: true,
    name: 'employment-period',
  },
};

export const ComplianceMonitoringPeriod: Story = {
  args: {
    label: 'Quality Compliance Monitoring Period',
    startLabel: 'Monitoring start',
    endLabel: 'Monitoring end',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    minDate: '2023-01-01',
    maxDate: '2024-12-31',
    hint: 'Quality compliance monitoring period for business operations',
    required: true,
    name: 'compliance-monitoring',
  },
};

export const DataCollectionPeriod: Story = {
  args: {
    label: 'Market Research Data Collection Period',
    startLabel: 'Collection start',
    endLabel: 'Collection end',
    startDate: '2024-03-01',
    endDate: '2024-09-30',
    minDate: '2024-03-01',
    maxDate: '2024-09-30',
    hint: '2024 market research data collection period',
    disabled: true,
    name: 'market-research',
  },
};

export const FormValidationDemo: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div class="maxw-tablet">
      <h3>Business Form Integration Demo</h3>
      <p>Complete example showing date range picker in a business form context.</p>

      <form
        @submit=${(e: CustomEvent) => {
          e.preventDefault();
          const form = e.target as HTMLFormElement;
          const formData = new FormData(form);

          const startDate = formData.get('reporting-period-start');
          const endDate = formData.get('reporting-period-end');

          console.log('Form Data:', {
            startDate,
            endDate,
            formData: Object.fromEntries(formData),
          });

          alert('Form submitted! Check console for data.');
        }}
      >
        <usa-date-range-picker
          label="Business Reporting Period"
          start-label="Reporting period start"
          end-label="Reporting period end"
          hint="Select the date range for your annual business report"
          min-date="2024-01-01"
          max-date="2024-12-31"
          name="reporting-period"
          required
          @date-range-change=${(e: CustomEvent) => {
            const details = e.detail;
            const output = document.getElementById('range-output');
            if (output) {
              output.innerHTML = `
                <strong>Current Selection:</strong><br>
                Start: ${details.startDate || 'Not selected'}<br>
                End: ${details.endDate || 'Not selected'}<br>
                Range Complete: ${details.isComplete ? 'Yes' : 'No'}<br>
                Days: ${details.daysDifference || 'N/A'}
              `;
            }
          }}
        ></usa-date-range-picker>

        <div class="margin-top-1 padding-1 bg-base-lightest radius-md">
          <div id="range-output">
            <strong>Current Selection:</strong><br />
            Start: Not selected<br />
            End: Not selected<br />
            Range Complete: No<br />
            Days: N/A
          </div>
        </div>

        <div class="margin-top-3">
          <button type="submit" class="usa-button">Submit Business Report</button>
          <button
            type="reset"
            class="usa-button usa-button--secondary"
            class="margin-left-05"
          >
            Reset Form
          </button>
        </div>
      </form>
    </div>
  `,
};
