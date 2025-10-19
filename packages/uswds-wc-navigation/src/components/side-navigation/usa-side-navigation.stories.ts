import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './index.ts';
import type { USASideNavigation } from './usa-side-navigation.js';

const meta: Meta<USASideNavigation> = {
  title: 'Navigation/Side Navigation',
  component: 'usa-side-navigation',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
The side navigation component provides a way to display a hierarchical, vertical navigation menu using the USWDS design system.

It supports:
- Single and multi-level navigation structures
- Current page indication with ARIA attributes
- Click event handling
- Keyboard navigation and screen reader accessibility
        `,
      },
    },
  },
  argTypes: {
    items: {
      control: 'object',
      description: 'Array of navigation items with optional subnav',
    },
    ariaLabel: {
      control: 'text',
      description: 'ARIA label for the navigation element',
    },
  },
};

export default meta;
type Story = StoryObj<USASideNavigation>;

// Basic side navigation examples
export const Default: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'About us', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ],
  },
};

export const WithCurrentPage: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'About us', href: '/about', current: true },
      { label: 'Contact', href: '/contact' },
    ],
  },
};

export const WithSubnavigation: Story = {
  args: {
    items: [
      {
        label: 'About us',
        href: '/about',
        subnav: [
          { label: 'Our mission', href: '/about/mission' },
          { label: 'Our history', href: '/about/history' },
          { label: 'Leadership', href: '/about/leadership' },
        ],
      },
      { label: 'Services', href: '/services' },
      { label: 'Contact', href: '/contact' },
    ],
  },
};

export const WithCurrentSubitem: Story = {
  args: {
    items: [
      {
        label: 'About us',
        href: '/about',
        subnav: [
          { label: 'Our mission', href: '/about/mission' },
          { label: 'Our history', href: '/about/history', current: true },
          { label: 'Leadership', href: '/about/leadership' },
        ],
      },
      { label: 'Services', href: '/services' },
      { label: 'Contact', href: '/contact' },
    ],
  },
};

export const DeepNesting: Story = {
  args: {
    items: [
      {
        label: 'Services',
        href: '/services',
        subnav: [
          {
            label: 'Digital services',
            href: '/services/digital',
            subnav: [
              { label: 'Web development', href: '/services/digital/web' },
              { label: 'Mobile apps', href: '/services/digital/mobile' },
              { label: 'Data analytics', href: '/services/digital/data' },
            ],
          },
          { label: 'Consulting', href: '/services/consulting' },
        ],
      },
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ],
  },
};

export const MixedCurrentStates: Story = {
  args: {
    items: [
      {
        label: 'Parent Section',
        href: '/parent',
        current: true,
        subnav: [
          { label: 'Child 1', href: '/parent/child1' },
          { label: 'Child 2', href: '/parent/child2', current: true },
          { label: 'Child 3', href: '/parent/child3' },
        ],
      },
      { label: 'Other Section', href: '/other' },
    ],
  },
};

export const CustomAriaLabel: Story = {
  args: {
    ariaLabel: 'Main site navigation',
    items: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Reports', href: '/reports' },
      { label: 'Settings', href: '/settings' },
    ],
  },
};

export const NoHrefItems: Story = {
  args: {
    items: [
      { label: 'Category header (no link)' },
      {
        label: 'Services',
        subnav: [
          { label: 'Service 1', href: '/services/1' },
          { label: 'Service 2', href: '/services/2' },
        ],
      },
      { label: 'Regular link', href: '/link' },
    ],
  },
};

// Interactive demo
export const InteractiveDemo: Story = {
  args: {
    ariaLabel: 'Interactive demo navigation',
    items: [
      {
        label: 'Features',
        href: '/features',
        subnav: [
          { label: 'Component library', href: '/features/components' },
          { label: 'Design system', href: '/features/design' },
          { label: 'Accessibility', href: '/features/a11y' },
        ],
      },
      { label: 'Documentation', href: '/docs', current: true },
      { label: 'Examples', href: '/examples' },
    ],
  },
  render: (args) => html`
    <div>
      <usa-side-navigation
        .items=${args.items}
        .ariaLabel=${args.ariaLabel}
        @sidenav-click=${(e: CustomEvent) => {
          console.log('Navigation clicked:', e.detail);
          alert(`Clicked: ${e.detail.label}${e.detail.href ? ' (' + e.detail.href + ')' : ''}`);
        }}
      ></usa-side-navigation>

      <div class="margin-top-4 padding-2 bg-base-lightest radius-md">
        <p><strong>Try clicking the navigation items!</strong></p>
        <p>Open the console to see event details, or click items to see alerts.</p>
      </div>
    </div>
  `,
};

// Accessibility demonstration
export const AccessibilityDemo: Story = {
  args: {
    ariaLabel: 'Accessibility demonstration',
    items: [
      { label: 'Home', href: '/', current: true },
      {
        label: 'Accessibility features',
        href: '/accessibility',
        subnav: [
          { label: 'Screen reader support', href: '/accessibility/screen-readers' },
          { label: 'Keyboard navigation', href: '/accessibility/keyboard' },
          { label: 'ARIA attributes', href: '/accessibility/aria' },
        ],
      },
      { label: 'Compliance', href: '/compliance' },
    ],
  },
  render: (args) => html`
    <div>
      <div class="margin-bottom-2 padding-2 bg-primary-lighter radius-md">
        <h4 class="margin-bottom-1">Accessibility Features:</h4>
        <ul class="margin-0 padding-left-3">
          <li>Navigate with Tab and Enter keys</li>
          <li>Current page marked with <code>aria-current="page"</code></li>
          <li>Screen reader friendly with proper ARIA labels</li>
          <li>Semantic HTML structure with proper nesting</li>
        </ul>
      </div>

      <usa-side-navigation .items=${args.items} .ariaLabel=${args.ariaLabel}></usa-side-navigation>
    </div>
  `,
};

// Empty state
export const EmptyState: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div>
      <usa-side-navigation .items=${[]}></usa-side-navigation>
      <div class="margin-top-2 padding-2 bg-base-lightest radius-md">
        <p>
          <strong>Note:</strong> When no items are provided, the component renders a slot for custom
          content.
        </p>
        <p>You can provide your own navigation HTML structure if needed.</p>
      </div>
    </div>
  `,
};

