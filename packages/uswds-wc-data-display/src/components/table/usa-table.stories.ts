import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './index.ts';
import '../icon/index.ts';
import type { USATable, TableRow } from './usa-table.js';

const meta: Meta<USATable> = {
  title: 'Data Display/Table',
  component: 'usa-table',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
The USA Table component provides accessible, sortable data tables using official USWDS styling. Perfect for displaying structured data with comprehensive sorting, formatting, and accessibility features.
        `,
      },
    },
  },
  argTypes: {
    caption: {
      control: 'text',
      description: 'Table caption for accessibility',
    },
    headers: {
      control: 'object',
      description: 'Array of column definitions',
    },
    data: {
      control: 'object',
      description: 'Array of data rows',
    },
    striped: {
      control: 'boolean',
      description: 'Apply striped row styling',
    },
    borderless: {
      control: 'boolean',
      description: 'Remove table borders',
    },
    compact: {
      control: 'boolean',
      description: 'Apply compact padding',
    },
    stacked: {
      control: 'boolean',
      description: 'Stack columns on mobile',
    },
    stackedHeader: {
      control: 'boolean',
      description: 'Show headers on stacked mobile view',
    },
    stickyHeader: {
      control: 'boolean',
      description: 'Make header row sticky',
    },
    scrollable: {
      control: 'boolean',
      description: 'Wrap in scrollable container',
    },
    sortColumn: {
      control: 'text',
      description: 'Currently sorted column key',
    },
    sortDirection: {
      control: 'select',
      options: ['asc', 'desc'],
      description: 'Sort direction',
    },
  },
};

export default meta;
type Story = StoryObj<USATable>;

// Sample employee data
const employeeData: TableRow[] = [
  {
    name: 'Sarah Johnson',
    title: 'Senior Analyst',
    department: 'Health Services',
    phone: '(555) 123-4567',
    email: 'sarah.johnson@company.example',
  },
  {
    name: 'Michael Chen',
    title: 'IT Administrator',
    department: 'Information Technology',
    phone: '(555) 234-5678',
    email: 'michael.chen@company.example',
  },
  {
    name: 'Emily Rodriguez',
    title: 'Financial Analyst',
    department: 'Finance Office',
    phone: '(555) 345-6789',
    email: 'emily.rodriguez@company.example',
  },
  {
    name: 'David Williams',
    title: 'Environmental Specialist',
    department: 'Environmental Services',
    phone: '(555) 456-7890',
    email: 'david.williams@company.example',
  },
];

const budgetData: TableRow[] = [
  {
    program: 'Health Services',
    fy2024: 1250000,
    fy2025: 1350000,
    change: 8.0,
    status: 'Approved',
  },
  {
    program: 'Emergency Response',
    fy2024: 850000,
    fy2025: 920000,
    change: 8.2,
    status: 'Under Review',
  },
  {
    program: 'Infrastructure Maintenance',
    fy2024: 2100000,
    fy2025: 2250000,
    change: 7.1,
    status: 'Approved',
  },
  {
    program: 'Community Outreach',
    fy2024: 450000,
    fy2025: 485000,
    change: 7.8,
    status: 'Pending',
  },
];

const contractData: TableRow[] = [
  {
    vendor: 'TechSolutions Corp',
    contract: 'IT-2024-0012',
    amount: 125000,
    startDate: '2024-01-15',
    endDate: '2024-12-31',
    status: 'Active',
  },
  {
    vendor: 'Environmental Services LLC',
    contract: 'ENV-2024-0008',
    amount: 89000,
    startDate: '2024-02-01',
    endDate: '2024-07-31',
    status: 'Completed',
  },
  {
    vendor: 'Healthcare Consulting',
    contract: 'HC-2024-0015',
    amount: 67500,
    startDate: '2024-03-01',
    endDate: '2025-02-28',
    status: 'Active',
  },
];

export const Default: Story = {
  args: {
    caption: 'Employee Directory',
    headers: [
      { key: 'name', label: 'Name', sortable: true },
      { key: 'title', label: 'Title', sortable: true },
      { key: 'department', label: 'Department', sortable: true },
      { key: 'phone', label: 'Phone' },
      { key: 'email', label: 'Email' },
    ],
    data: employeeData,
    striped: false,
    borderless: false,
    compact: false,
    stacked: false,
    stackedHeader: false,
    stickyHeader: false,
    scrollable: false,
  },
};

export const Striped: Story = {
  args: {
    ...Default.args,
    caption: 'Striped Employee Directory',
    striped: true,
  },
};

export const Compact: Story = {
  args: {
    ...Default.args,
    caption: 'Compact Employee Directory',
    compact: true,
  },
};

export const Borderless: Story = {
  args: {
    ...Default.args,
    caption: 'Borderless Employee Directory',
    borderless: true,
  },
};

export const StickyHeader: Story = {
  args: {
    ...Default.args,
    caption: 'Employee Directory with Sticky Header',
    stickyHeader: true,
    data: [...employeeData, ...employeeData, ...employeeData], // More data to show sticky effect
  },
  parameters: {
    layout: 'fullscreen',
  },
};

export const Scrollable: Story = {
  args: {
    caption: 'Scrollable Wide Table',
    headers: [
      { key: 'name', label: 'Employee Name', sortable: true, sticky: true },
      { key: 'title', label: 'Job Title', sortable: true },
      { key: 'department', label: 'Department', sortable: true },
      { key: 'phone', label: 'Phone Number' },
      { key: 'email', label: 'Email Address' },
      { key: 'location', label: 'Office Location' },
      { key: 'supervisor', label: 'Supervisor' },
      { key: 'startDate', label: 'Start Date', sortType: 'date' },
    ],
    data: [
      {
        name: 'Sarah Johnson',
        title: 'Senior Analyst',
        department: 'Health Services',
        phone: '(555) 123-4567',
        email: 'sarah.johnson@company.example',
        location: 'Washington, DC',
        supervisor: 'Dr. Robert Smith',
        startDate: '2020-03-15',
      },
      {
        name: 'Michael Chen',
        title: 'IT Systems Administrator',
        department: 'Information Technology',
        phone: '(555) 234-5678',
        email: 'michael.chen@company.example',
        location: 'Rockville, MD',
        supervisor: 'Jennifer Williams',
        startDate: '2019-07-22',
      },
    ],
    scrollable: true,
  },
};

export const BudgetTable: Story = {
  args: {
    caption: '2024-2025 Program Budget Summary',
    headers: [
      { key: 'program', label: 'Program', sortable: true },
      { key: 'fy2024', label: 'FY 2024 ($)', sortable: true, sortType: 'number' },
      { key: 'fy2025', label: 'FY 2025 ($)', sortable: true, sortType: 'number' },
      { key: 'change', label: 'Change (%)', sortable: true, sortType: 'percentage' },
      { key: 'status', label: 'Status', sortable: true },
    ],
    data: budgetData,
    striped: true,
  },
  render: (args) => html`
    <usa-table
      caption="${args.caption}"
      .headers=${args.headers}
      .data=${args.data}
      ?striped=${args.striped}
      ?borderless=${args.borderless}
      ?compact=${args.compact}
      ?stacked=${args.stacked}
      ?stacked-header=${args.stackedHeader}
      ?sticky-header=${args.stickyHeader}
      ?scrollable=${args.scrollable}
      sort-column="${args.sortColumn || ''}"
      sort-direction="${args.sortDirection || 'asc'}"
    ></usa-table>
    <div class="margin-top-2">
      <p class="text-base-darker"><strong>Budget Summary:</strong></p>
      <ul class="usa-list">
        <li>Total FY 2024: $4,650,000</li>
        <li>Total FY 2025: $5,005,000</li>
        <li>Overall Change: +7.6%</li>
      </ul>
    </div>
  `,
};

export const ContractTracking: Story = {
  args: {
    caption: 'Active Contracts',
    headers: [
      { key: 'vendor', label: 'Vendor', sortable: true },
      { key: 'contract', label: 'Contract #', sortable: true },
      { key: 'amount', label: 'Amount ($)', sortable: true, sortType: 'number' },
      { key: 'startDate', label: 'Start Date', sortable: true, sortType: 'date' },
      { key: 'endDate', label: 'End Date', sortable: true, sortType: 'date' },
      { key: 'status', label: 'Status', sortable: true },
    ],
    data: contractData,
    compact: true,
  },
};

export const SortingDemo: Story = {
  args: {
    caption: 'Sortable Data Demonstration',
    headers: [
      { key: 'name', label: 'Name', sortable: true, sortType: 'text' },
      { key: 'score', label: 'Score', sortable: true, sortType: 'number' },
      { key: 'percentage', label: 'Completion', sortable: true, sortType: 'percentage' },
      { key: 'dueDate', label: 'Due Date', sortable: true, sortType: 'date' },
    ],
    data: [
      { name: 'Project Alpha', score: 85, percentage: 92.5, dueDate: '2024-06-15' },
      { name: 'Project Beta', score: 78, percentage: 88.2, dueDate: '2024-05-22' },
      { name: 'Project Gamma', score: 91, percentage: 95.7, dueDate: '2024-07-03' },
      { name: 'Project Delta', score: 73, percentage: 81.4, dueDate: '2024-04-18' },
    ],
    striped: true,
  },
  render: (args) => html`
    <usa-table
      caption="${args.caption}"
      .headers=${args.headers}
      .data=${args.data}
      ?striped=${args.striped}
      @table-sort="${(e: CustomEvent) => {
        console.log('Table sorted:', e.detail);
        const announcement = document.getElementById('sort-announcement');
        if (announcement) {
          announcement.textContent = `Sorted by ${e.detail.column} in ${e.detail.direction} order`;
        }
      }}"
    ></usa-table>
    <usa-alert type="info" class="margin-top-2">
      <h3 slot="heading">Sorting Instructions</h3>
      Click any column header to sort the data. Click again to reverse the sort order.
      <br /><strong>Last Sort:</strong> <span id="sort-announcement">None</span>
    </usa-alert>
  `,
};

export const MobileStacked: Story = {
  args: {
    caption: 'Mobile-Responsive Stacked Table',
    headers: [
      { key: 'service', label: 'Service', sortable: true },
      { key: 'department', label: 'Department' },
      { key: 'contact', label: 'Contact Info' },
      { key: 'hours', label: 'Operating Hours' },
    ],
    data: [
      {
        service: 'Document Services',
        department: 'Administrative Services',
        contact: '(555) 123-4567',
        hours: 'M-F 8:00 AM - 5:00 PM',
      },
      {
        service: 'Financial Assistance',
        department: 'Financial Services',
        contact: '(555) 234-5678',
        hours: 'M-F 7:00 AM - 7:00 PM',
      },
      {
        service: 'Member Benefits',
        department: 'Member Services',
        contact: '(555) 345-6789',
        hours: 'M-F 8:00 AM - 8:00 PM',
      },
    ],
    stacked: true,
    stackedHeader: true,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

export const EmptyState: Story = {
  args: {
    caption: 'Table with No Data',
    headers: [
      { key: 'name', label: 'Name' },
      { key: 'status', label: 'Status' },
      { key: 'date', label: 'Date' },
    ],
    data: [],
  },
  render: (args) => html`
    <usa-table caption="${args.caption}" .headers=${args.headers} .data=${args.data}>
      <div slot="empty">
        <div class="text-center padding-2">
          <usa-icon name="assessment" size="5" class="text-base-lighter margin-bottom-1" decorative="true"></usa-icon>
          <h3 class="margin-y-1 text-base-darker">No data available</h3>
          <p class="text-base text-base">There are currently no records to display.</p>
          <button class="usa-button usa-button--outline">Add New Record</button>
        </div>
      </div>
    </usa-table>
  `,
};

export const ComplexDataTypes: Story = {
  args: {
    caption: 'Complex Data Type Formatting',
    headers: [
      { key: 'metric', label: 'Performance Metric' },
      { key: 'value', label: 'Value', sortable: true, sortType: 'number' },
      { key: 'percentage', label: 'Target %', sortable: true, sortType: 'percentage' },
      { key: 'lastUpdated', label: 'Last Updated', sortable: true, sortType: 'date' },
    ],
    data: [
      {
        metric: 'Customer Satisfaction',
        value: 4.7,
        percentage: 94.2,
        lastUpdated: '2024-01-15',
      },
      {
        metric: 'Response Time (hours)',
        value: 2.3,
        percentage: 115.0,
        lastUpdated: '2024-01-14',
      },
      {
        metric: 'Resolution Rate',
        value: 0.89,
        percentage: 89.0,
        lastUpdated: '2024-01-13',
      },
    ],
  },
};

export const AccessibilityDemo: Story = {
  args: {
    caption: 'Accessible Table Features Demonstration',
    headers: [
      { key: 'feature', label: 'Accessibility Feature' },
      { key: 'description', label: 'Description' },
      { key: 'compliance', label: 'WCAG Level' },
    ],
    data: [
      {
        feature: 'Table Caption',
        description: 'Provides context and summary of table content',
        compliance: 'AA',
      },
      {
        feature: 'Column Headers',
        description: 'Proper scope and role attributes for screen readers',
        compliance: 'AA',
      },
      {
        feature: 'Row Headers',
        description: 'First column acts as row identifier',
        compliance: 'AA',
      },
      {
        feature: 'Sort Announcements',
        description: 'Live region announces sorting changes',
        compliance: 'AAA',
      },
      {
        feature: 'Keyboard Navigation',
        description: 'All interactive elements are keyboard accessible',
        compliance: 'AA',
      },
    ],
    borderless: true,
  },
  render: (args) => html`
    <usa-table
      caption="${args.caption}"
      .headers=${args.headers}
      .data=${args.data}
      ?borderless=${args.borderless}
    ></usa-table>
    <usa-alert type="success" class="margin-top-3">
      <h3 slot="heading">Accessibility Testing</h3>
      This table demonstrates WCAG 2.1 compliance:
      <ul class="usa-list">
        <li>Use Tab key to navigate sortable headers</li>
        <li>Press Enter or Space to sort columns</li>
        <li>Listen for screen reader announcements</li>
        <li>Check proper table semantics with developer tools</li>
      </ul>
    </usa-alert>
  `,
};

export const LargeDataset: Story = {
  args: {
    caption: 'Large Dataset Performance Test',
    headers: [
      { key: 'id', label: 'ID', sortable: true, sortType: 'number' },
      { key: 'name', label: 'Name', sortable: true },
      { key: 'department', label: 'Department', sortable: true },
      { key: 'salary', label: 'Salary', sortable: true, sortType: 'number' },
      { key: 'startDate', label: 'Start Date', sortType: 'date' },
    ],
    data: Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      name: `Employee ${i + 1}`,
      department: ['IT', 'HR', 'Finance', 'Operations', 'Legal'][i % 5],
      salary: Math.floor(Math.random() * 50000) + 40000,
      startDate: new Date(
        2015 + Math.floor(Math.random() * 9),
        Math.floor(Math.random() * 12),
        Math.floor(Math.random() * 28) + 1
      )
        .toISOString()
        .split('T')[0],
    })),
    striped: true,
    stickyHeader: true,
    scrollable: true,
  },
  parameters: {
    layout: 'fullscreen',
  },
};

export const InteractiveControls: Story = {
  args: {
    caption: 'Interactive Table Controls',
    headers: [
      { key: 'program', label: 'Program', sortable: true },
      { key: 'participants', label: 'Participants', sortable: true, sortType: 'number' },
      { key: 'budget', label: 'Budget', sortable: true, sortType: 'number' },
      { key: 'completion', label: 'Completion', sortable: true, sortType: 'percentage' },
    ],
    data: [
      { program: 'Job Training', participants: 245, budget: 125000, completion: 78.5 },
      { program: 'Health Screening', participants: 892, budget: 89000, completion: 92.1 },
      { program: 'Education Support', participants: 156, budget: 67000, completion: 85.3 },
    ],
    striped: true,
  },
  render: (args) => html`
    <div class="margin-bottom-2">
      <label class="usa-label" for="table-controls">Table Display Options:</label>
      <div class="display-flex flex-wrap gap-1 margin-top-1" id="table-controls">
        <label class="usa-checkbox">
          <input
            class="usa-checkbox__input"
            id="toggle-striped"
            type="checkbox"
            ?checked=${args.striped}
            @change="${(e: Event) => {
              const table = document.querySelector('usa-table') as any;
              if (table) table.striped = (e.target as HTMLInputElement).checked;
            }}"
          />
          <span class="usa-checkbox__label">Striped rows</span>
        </label>
        <label class="usa-checkbox">
          <input
            class="usa-checkbox__input"
            id="toggle-compact"
            type="checkbox"
            ?checked=${args.compact}
            @change="${(e: Event) => {
              const table = document.querySelector('usa-table') as any;
              if (table) table.compact = (e.target as HTMLInputElement).checked;
            }}"
          />
          <span class="usa-checkbox__label">Compact spacing</span>
        </label>
        <label class="usa-checkbox">
          <input
            class="usa-checkbox__input"
            id="toggle-borderless"
            type="checkbox"
            ?checked=${args.borderless}
            @change="${(e: Event) => {
              const table = document.querySelector('usa-table') as any;
              if (table) table.borderless = (e.target as HTMLInputElement).checked;
            }}"
          />
          <span class="usa-checkbox__label">Borderless</span>
        </label>
      </div>
    </div>

    <usa-table
      caption="${args.caption}"
      .headers=${args.headers}
      .data=${args.data}
      ?striped=${args.striped}
      ?borderless=${args.borderless}
      ?compact=${args.compact}
    ></usa-table>
  `,
};
