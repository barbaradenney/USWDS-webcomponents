import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './index.ts';
import type { USAPagination } from './usa-pagination.js';

const meta: Meta<USAPagination> = {
  title: 'Navigation/Pagination',
  component: 'usa-pagination',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# USA Pagination

The Pagination component enables users to navigate through large datasets by breaking content into manageable pages. Essential for data display, search results, and document management systems.

## Applications

- **Search Results**: Navigate content, policies, and records
- **Data Tables**: Browse large datasets (budgets, contracts, employees)
- **Document Libraries**: Access forms, reports, and publications
- **Comments**: Review submissions and public feedback
- **Case Management**: Navigate documents and records

## Accessibility Guidelines

- Provides clear navigation structure with ARIA labels
- Supports keyboard navigation and screen readers
- Indicates current page clearly for all users
- Meets WCAG 2.1 AA standards
        `,
      },
    },
  },
  argTypes: {
    currentPage: {
      control: { type: 'number', min: 1 },
      description: 'Currently active page number',
    },
    totalPages: {
      control: { type: 'number', min: 1, max: 100 },
      description: 'Total number of pages available',
    },
    maxVisible: {
      control: { type: 'number', min: 3, max: 15 },
      description: 'Maximum number of page buttons to display',
    },
    ariaLabel: {
      control: 'text',
      description: 'ARIA label for the navigation landmark',
    },
  },
  args: {
    currentPage: 1,
    totalPages: 10,
    maxVisible: 7,
    ariaLabel: 'Pagination',
  },
};

export default meta;
type Story = StoryObj<USAPagination>;

export const Default: Story = {
  args: {
    currentPage: 1,
    totalPages: 10,
  },
  render: (args) => html`
    <usa-pagination
      current-page="${args.currentPage}"
      total-pages="${args.totalPages}"
      max-visible="${args.maxVisible}"
      aria-label="${args.ariaLabel}"
    ></usa-pagination>
  `,
};

export const FewPages: Story = {
  name: 'Few Pages (No Ellipsis)',
  args: {
    currentPage: 2,
    totalPages: 5,
  },
  render: (args) => html`
    <usa-pagination
      current-page="${args.currentPage}"
      total-pages="${args.totalPages}"
      max-visible="${args.maxVisible}"
      aria-label="${args.ariaLabel}"
    ></usa-pagination>
  `,
};

export const ManyPages: Story = {
  name: 'Many Pages (With Ellipsis)',
  args: {
    currentPage: 10,
    totalPages: 50,
    maxVisible: 7,
  },
  render: (args) => html`
    <usa-pagination
      current-page="${args.currentPage}"
      total-pages="${args.totalPages}"
      max-visible="${args.maxVisible}"
      aria-label="${args.ariaLabel}"
    ></usa-pagination>
  `,
};

export const NearBeginning: Story = {
  name: 'Near Beginning',
  args: {
    currentPage: 3,
    totalPages: 25,
    maxVisible: 7,
  },
  render: (args) => html`
    <usa-pagination
      current-page="${args.currentPage}"
      total-pages="${args.totalPages}"
      max-visible="${args.maxVisible}"
      aria-label="${args.ariaLabel}"
    ></usa-pagination>
  `,
};

export const NearEnd: Story = {
  name: 'Near End',
  args: {
    currentPage: 23,
    totalPages: 25,
    maxVisible: 7,
  },
  render: (args) => html`
    <usa-pagination
      current-page="${args.currentPage}"
      total-pages="${args.totalPages}"
      max-visible="${args.maxVisible}"
      aria-label="${args.ariaLabel}"
    ></usa-pagination>
  `,
};

export const Compact: Story = {
  name: 'Compact (5 Visible)',
  args: {
    currentPage: 15,
    totalPages: 30,
    maxVisible: 5,
  },
  render: (args) => html`
    <usa-pagination
      current-page="${args.currentPage}"
      total-pages="${args.totalPages}"
      max-visible="${args.maxVisible}"
      aria-label="${args.ariaLabel}"
    ></usa-pagination>
  `,
};

export const AccessibilityDemo: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div class="maxw-tablet padding-1 border border-base-lighter radius-md">
      <h3>Pagination Accessibility Compliance</h3>
      <p class="margin-bottom-205 text-base-dark">
        This example demonstrates WCAG 2.1 AA compliance features: ARIA navigation landmarks, clear
        current page indication, and keyboard accessibility.
      </p>

      <div class="display-flex flex-column gap-2 margin-bottom-2">
        <div>
          <h4>Small Dataset (All Pages Visible)</h4>
          <p class="font-sans-xs margin-bottom-1">
            Keyboard: Tab through page links, Space/Enter to activate
          </p>
          <usa-pagination
            current-page="3"
            total-pages="5"
            aria-label="Example pagination - all pages visible"
            @page-change=${(e: CustomEvent) => {
              const feedback1 = document.getElementById('a11y-feedback-1');
              if (feedback1) {
                feedback1.innerHTML = `<strong>Navigation:</strong> Moved to page ${e.detail.page} of ${e.detail.totalPages}. Screen readers announce current page.`;
              }
            }}
          ></usa-pagination>
          <div
            id="a11y-feedback-1"
            class="margin-top-05 padding-105 bg-base-lightest radius-md font-sans-xs"
          >
            <strong>Navigation:</strong> Page 3 of 5 is current. Use Tab key to navigate between
            pages.
          </div>
        </div>

        <div>
          <h4>Large Dataset (With Ellipsis)</h4>
          <p class="font-sans-xs margin-bottom-1">
            Test with screen readers: NVDA, JAWS, VoiceOver for proper announcements
          </p>
          <usa-pagination
            current-page="15"
            total-pages="50"
            max-visible="7"
            aria-label="Large dataset pagination with ellipsis"
            @page-change=${(e: CustomEvent) => {
              const feedback2 = document.getElementById('a11y-feedback-2');
              if (feedback2) {
                feedback2.innerHTML = `<strong>Navigation:</strong> Navigated to page ${e.detail.page} of ${e.detail.totalPages}. Ellipsis (...) indicates hidden pages.`;
              }
            }}
          ></usa-pagination>
          <div
            id="a11y-feedback-2"
            class="margin-top-05 padding-105 bg-base-lightest radius-md font-sans-xs"
          >
            <strong>Navigation:</strong> Page 15 of 50 is current. Ellipsis (...) indicates
            additional pages available.
          </div>
        </div>
      </div>

      <div>
        <h4>Screen Reader Testing Guidelines</h4>
        <ul class="font-sans-xs margin-bottom-205 line-height-sans-4">
          <li>
            <strong>Navigation Landmark:</strong> Pagination is announced as a navigation region
          </li>
          <li>
            <strong>Current Page:</strong> Screen readers announce "current page" for active page
          </li>
          <li><strong>ARIA Labels:</strong> Each page has descriptive labels (e.g., "Page 5")</li>
          <li><strong>Previous/Next:</strong> Clear labels for navigation arrows</li>
          <li>
            <strong>Total Context:</strong> Relationship between current and total pages is clear
          </li>
        </ul>

        <usa-pagination
          current-page="2"
          total-pages="8"
          aria-label="Screen reader test pagination"
          @page-change=${(e: CustomEvent) => {
            const feedback3 = document.getElementById('a11y-feedback-3');
            if (feedback3) {
              feedback3.innerHTML = `
                <strong>Screen Reader Announcement:</strong><br>
                "Navigation region: Screen reader test pagination"<br>
                "Page ${e.detail.page} of ${e.detail.totalPages}, current page"<br>
                "Previous page link" and "Next page link" available as appropriate
              `;
            }
          }}
        ></usa-pagination>

        <div
          id="a11y-feedback-3"
          class="margin-top-1 padding-1 bg-info-lighter border border-info-light radius-md font-sans-xs"
        >
          <strong>Screen Reader Announcement:</strong><br />
          "Navigation region: Screen reader test pagination"<br />
          "Page 2 of 8, current page"<br />
          "Previous page link" and "Next page link" available as appropriate
        </div>
      </div>
    </div>
  `,
};
