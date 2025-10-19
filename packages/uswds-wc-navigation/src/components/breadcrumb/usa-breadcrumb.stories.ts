import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './index.ts';
import type { USABreadcrumb, BreadcrumbItem } from './usa-breadcrumb.js';

const meta: Meta<USABreadcrumb> = {
  title: 'Navigation/Breadcrumb',
  component: 'usa-breadcrumb',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
The USWDS Breadcrumb component provides users with navigational context by showing their current location within a website's hierarchy. It helps users understand where they are and provides links to navigate back to parent pages.

This web component implementation maintains full USWDS compliance while providing a modern custom element API. It supports automatic current page detection, custom styling options, and comprehensive accessibility features.

Breadcrumbs are essential for user experience on websites with deep information hierarchies, helping users find information efficiently.
        `,
      },
    },
  },
  argTypes: {
    items: {
      control: 'object',
      description: 'Array of breadcrumb items with labels, links, and current state',
    },
    wrap: {
      control: 'boolean',
      description: 'Allow breadcrumb items to wrap to multiple lines',
    },
  },
};

export default meta;
type Story = StoryObj<USABreadcrumb>;

// Sample breadcrumb data for stories
const basicBreadcrumbs: BreadcrumbItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Category', href: '/products/category' },
  { label: 'Current Page', current: true },
];

const shortBreadcrumbs: BreadcrumbItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Current Page', current: true },
];

const longBreadcrumbs: BreadcrumbItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Company', href: '/company' },
  { label: 'Technology', href: '/company/technology' },
  { label: 'Development', href: '/company/technology/development' },
  { label: 'Web Services', href: '/company/technology/development/web' },
  { label: 'Frontend Team', href: '/company/technology/development/web/frontend' },
  { label: 'Design System', href: '/company/technology/development/web/frontend/design' },
  { label: 'Current Documentation', current: true },
];

export const Default: Story = {
  args: {
    items: basicBreadcrumbs,
    wrap: false,
  },
};

export const ShortPath: Story = {
  args: {
    items: shortBreadcrumbs,
    wrap: false,
  },
};

export const LongPath: Story = {
  args: {
    items: longBreadcrumbs,
    wrap: false,
  },
};

export const WithWrap: Story = {
  args: {
    items: longBreadcrumbs,
    wrap: true,
  },
  render: (args) => html`
    <div class="maxw-mobile-lg border border-primary padding-1 radius-md">
      <usa-breadcrumb .items=${args.items} ?wrap=${args.wrap}></usa-breadcrumb>
    </div>

    <div class="margin-top-1 padding-1 bg-info-lighter radius-md font-body-xs">
      <p><strong>📱 Responsive Wrapping Behavior:</strong></p>
      <ul>
        <li><strong>Viewport ≥480px:</strong> Breadcrumb items wrap to multiple lines inside the constrained container</li>
        <li><strong>Viewport &lt;480px:</strong> Shows mobile condensed view with back arrow (USWDS standard)</li>
      </ul>
      <p class="margin-bottom-0"><em>Resize browser window to test both modes!</em></p>
    </div>
  `,
};

export const SingleItem: Story = {
  args: {
    items: [{ label: 'Home Page', href: '/' }],
    wrap: false,
  },
};

export const WithoutCurrentFlag: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Section', href: '/section' },
      { label: 'Last Item' }, // No current flag, but treated as current
    ],
    wrap: false,
  },
};

export const ResponsiveDemo: Story = {
  args: {
    items: longBreadcrumbs,
    wrap: true,
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    layout: 'padded',
  },
  render: (args) => html`
    <div class="maxw-tablet">
      <usa-breadcrumb .items=${args.items} ?wrap=${args.wrap}></usa-breadcrumb>
    </div>

    <div
      class="margin-top-1 padding-1 bg-base-lightest radius-md font-body-xs"
    >
      <p>
        <strong>⚠️ Important - Viewport Requirements:</strong>
      </p>
      <ul>
        <li><strong>Desktop (480px+):</strong> Wrapping works - items flow to multiple lines</li>
        <li><strong>Mobile (&lt;480px):</strong> USWDS shows condensed view with back arrow regardless of wrap setting</li>
        <li><strong>Current viewport:</strong> <span id="viewport-info"></span></li>
      </ul>
      <p>
        Resize your browser window above 480px to see the wrapping behavior in action.
      </p>
    </div>

    <script>
      document.getElementById('viewport-info').textContent =
        \`\${window.innerWidth}px \${window.innerWidth >= 480 ? '(Wrapping enabled)' : '(Mobile condensed view)'}\`;
    </script>
  `,
};

export const InteractiveDemo: Story = {
  args: {
    items: basicBreadcrumbs,
    wrap: false,
  },
  render: (args) => html`
    <usa-breadcrumb
      .items=${args.items}
      ?wrap=${args.wrap}
      @breadcrumb-click=${(e: CustomEvent) => {
        console.log('Breadcrumb clicked:', e.detail);
        alert(`Navigating to: ${e.detail.label} (${e.detail.href})`);
        e.preventDefault(); // Prevent navigation in Storybook
      }}
    ></usa-breadcrumb>

    <div class="margin-top-4 padding-2 bg-primary-lighter radius-md">
      <h3>Breadcrumb Navigation Testing Guide</h3>

      <h4>Interactive Features:</h4>
      <ul>
        <li>Click any non-current breadcrumb item to see navigation event</li>
        <li>Current page item is not clickable (properly styled)</li>
        <li>Keyboard navigation works with Tab and Enter keys</li>
        <li>Screen readers announce navigation context</li>
      </ul>

      <h4>Accessibility Testing:</h4>
      <ul>
        <li>Use keyboard navigation (Tab through items)</li>
        <li>Test with screen readers (proper navigation landmark)</li>
        <li>Verify aria-current="page" on current item</li>
        <li>Check semantic HTML structure (nav > ol > li)</li>
      </ul>

      <h4>Website Usage:</h4>
      <ul>
        <li>Essential for deep information hierarchies</li>
        <li>Helps users navigate complex site structures</li>
        <li>Provides clear context for current page location</li>
        <li>Improves SEO and discoverability</li>
      </ul>
    </div>
  `,
};

export const AccessibilityDemo: Story = {
  args: {
    items: basicBreadcrumbs,
    wrap: false,
  },
  render: (args) => html`
    <div class="margin-bottom-1 padding-1 bg-warning-lighter radius-md">
      <h4 class="margin-top-0 text-warning-dark">Accessibility Features</h4>
      <ul>
        <li><strong>Semantic Structure:</strong> Uses proper HTML5 nav and ordered list</li>
        <li><strong>ARIA Labels:</strong> Navigation landmark with descriptive label</li>
        <li><strong>Current Page:</strong> Properly marked with aria-current="page"</li>
        <li><strong>Keyboard Navigation:</strong> All links accessible via keyboard</li>
        <li><strong>Screen Reader Support:</strong> Clear navigation context</li>
      </ul>
    </div>

    <usa-breadcrumb .items=${args.items} ?wrap=${args.wrap}></usa-breadcrumb>

    <div
      class="margin-top-1 padding-1 bg-success-lighter border border-success radius-md"
    >
      <h4 class="margin-top-0 text-success-dark">✅ WCAG AA Compliance</h4>
      <ul class="margin-bottom-0">
        <li>Color contrast meets requirements</li>
        <li>Keyboard navigation fully functional</li>
        <li>Screen reader announces navigation context</li>
        <li>Focus indicators are visible and clear</li>
        <li>Semantic HTML structure for assistive technology</li>
      </ul>
    </div>
  `,
};

export const ComparisonDemo: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div class="display-grid grid-gap-2 minw-mobile-lg">
      <div>
        <h4>Standard Breadcrumb</h4>
        <usa-breadcrumb
          .items=${[
            { label: 'Home', href: '/' },
            { label: 'Section', href: '/section' },
            { label: 'Current Page', current: true },
          ]}
          ?wrap=${false}
        ></usa-breadcrumb>
      </div>

      <div class="maxw-card border border-dashed border-base-light padding-1">
        <h4>Long Breadcrumb (No Wrap) - Constrained Width</h4>
        <usa-breadcrumb .items=${longBreadcrumbs} ?wrap=${false}></usa-breadcrumb>
        <div class="font-body-xs text-base-dark margin-top-05">
          <em>Notice: Ellipsis truncation at 480px+</em>
        </div>
      </div>

      <div class="maxw-card border-2px border-primary padding-1">
        <h4>Long Breadcrumb (With Wrap) - Constrained Width</h4>
        <usa-breadcrumb .items=${longBreadcrumbs} ?wrap=${true}></usa-breadcrumb>
        <div class="font-body-xs text-primary margin-top-05">
          <em>Notice: Items wrap to multiple lines at 480px+</em>
        </div>
      </div>

      <div>
        <h4>Single Item</h4>
        <usa-breadcrumb
          .items=${[{ label: 'Standalone Page', href: '/' }]}
          ?wrap=${false}
        ></usa-breadcrumb>
      </div>
    </div>

    <div class="margin-top-2 padding-1 bg-warning-lighter border border-warning radius-md">
      <h4>🔍 Responsive Behavior (USWDS Standard):</h4>
      <ul>
        <li><strong>Mobile (&lt;480px):</strong> Shows condensed view with back arrow - wrap setting ignored</li>
        <li><strong>Desktop (≥480px):</strong>
          <ul>
            <li><strong>No Wrap:</strong> Single line with ellipsis truncation</li>
            <li><strong>With Wrap:</strong> Multiple lines, items flow naturally</li>
          </ul>
        </li>
      </ul>
      <p class="margin-0 font-body-xs"><strong>💡 Tip:</strong> Resize your browser to see the responsive behavior in action!</p>
    </div>

    <div class="margin-top-1 padding-1 bg-base-lightest radius-md">
      <h4>When to Use Different Patterns:</h4>
      <ul>
        <li><strong>Standard:</strong> Most common pattern for 2-4 level hierarchies</li>
        <li><strong>Long (No Wrap):</strong> Desktop layouts with ample horizontal space</li>
        <li><strong>Long (With Wrap):</strong> Narrow containers or when you want full breadcrumb visibility</li>
        <li><strong>Single Item:</strong> Top-level pages or simple site structures</li>
      </ul>
    </div>
  `,
};

export const CustomStylingExample: Story = {
  args: {
    items: basicBreadcrumbs,
    wrap: false,
  },
  render: (args) => html`
    <style>
      .custom-breadcrumb .usa-breadcrumb {
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 8px;
        border-left: 4px solid #005ea2;
      }

      .custom-breadcrumb .usa-breadcrumb__link {
        color: #005ea2;
        font-weight: 500;
      }

      .custom-breadcrumb .usa-breadcrumb__link:hover {
        color: #0f3460;
        text-decoration: underline;
      }

      .custom-breadcrumb .usa-current {
        font-weight: 600;
        color: #1b1b1b;
      }
    </style>

    <div class="custom-breadcrumb">
      <usa-breadcrumb .items=${args.items} ?wrap=${args.wrap}></usa-breadcrumb>
    </div>

    <div class="margin-top-1 padding-1 bg-base-lightest radius-md">
      <h4>Custom Styling Example</h4>
      <p>This example demonstrates custom styling while maintaining USWDS accessibility:</p>
      <ul>
        <li>Enhanced background and border styling</li>
        <li>Custom link colors with hover effects</li>
        <li>Emphasized current page styling</li>
        <li>Maintained focus indicators and accessibility</li>
      </ul>
      <p>
        <strong>Note:</strong> Always ensure custom styles maintain accessibility and usability
        standards.
      </p>
    </div>
  `,
};

export const EmptyState: Story = {
  args: {
    items: [],
    wrap: false,
  },
  render: (args) => html`
    <usa-breadcrumb .items=${args.items} ?wrap=${args.wrap}></usa-breadcrumb>

    <div
      class="margin-top-1 padding-1 bg-warning-lighter border border-warning radius-md"
    >
      <h4 class="margin-top-0 text-warning-dark">Empty Breadcrumb</h4>
      <p class="margin-bottom-0">
        This shows how the component handles an empty items array. The navigation structure is still
        present but contains no items.
      </p>
    </div>
  `,
};
