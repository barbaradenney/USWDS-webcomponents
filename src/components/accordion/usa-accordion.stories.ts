import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './index.ts';
import type { USAAccordion, AccordionItem } from './usa-accordion.js';

const sampleItems: AccordionItem[] = [
  {
    id: 'accordion-1',
    title: 'Getting Started',
    content: `
      <p>Welcome to our platform! Here's everything you need to know to get started:</p>
      <ul>
        <li>Create your account</li>
        <li>Complete your profile</li>
        <li>Explore available features</li>
        <li>Set up your preferences</li>
        <li>Connect with team members</li>
      </ul>
    `,
    expanded: false,
  },
  {
    id: 'accordion-2',
    title: 'Account Management',
    content: `
      <p>Manage your account settings and preferences:</p>
      <ul>
        <li>Update personal information</li>
        <li>Change password</li>
        <li>Notification settings</li>
        <li>Privacy controls</li>
        <li>Billing information</li>
      </ul>
    `,
    expanded: false,
  },
  {
    id: 'accordion-3',
    title: 'Support & Help',
    content: `
      <p>Get help when you need it:</p>
      <ul>
        <li>Search our knowledge base</li>
        <li>Contact customer support</li>
        <li>Submit feature requests</li>
        <li>Report issues</li>
        <li>Access video tutorials</li>
      </ul>
    `,
    expanded: true,
  },
];

const meta: Meta<USAAccordion> = {
  title: 'Structure/Accordion',
  component: 'usa-accordion',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# USA Accordion

The USA Accordion component uses official USWDS styling and behavior.
This component allows users to show and hide sections of related content on a page.

## Usage Guidelines

- Follow USWDS design system guidelines
- Component uses official USWDS CSS classes
- Accessibility features are built-in
- Supports keyboard navigation

## Events

- \`accordion-toggle\` - Dispatched when accordion item is toggled with detail containing item, index, expanded state, and all items

## Accessibility

- Uses proper ARIA roles and attributes
- Keyboard navigation support (Enter and Space keys)
- Screen reader compatible
- Proper heading structure for content hierarchy
        `,
      },
    },
  },
  argTypes: {
    multiselectable: {
      control: { type: 'boolean' },
      description: 'Whether multiple accordion items can be open at the same time',
    },
    bordered: {
      control: { type: 'boolean' },
      description: 'Whether to show borders around accordion items',
    },
    items: {
      control: { type: 'object' },
      description: 'Array of accordion items with id, title, content, and optional expanded state',
    },
  },
  args: {
    multiselectable: false,
    bordered: false,
    items: sampleItems,
  },
};

export default meta;
type Story = StoryObj<USAAccordion>;

export const Default: Story = {
  render: (args) => html`
    <usa-accordion
      .items=${args.items}
      ?multiselectable=${args.multiselectable}
      ?bordered=${args.bordered}
      @accordion-toggle="${(e: CustomEvent) => console.log('Accordion toggled:', e.detail)}"
    ></usa-accordion>
  `,
};

export const Multiselectable: Story = {
  args: {
    multiselectable: true,
    items: sampleItems.map((item) => ({ ...item, expanded: false })),
  },
  render: (args) => html`
    <usa-accordion
      .items=${args.items}
      ?multiselectable=${args.multiselectable}
      ?bordered=${args.bordered}
      @accordion-toggle="${(e: CustomEvent) => console.log('Accordion toggled:', e.detail)}"
    ></usa-accordion>
  `,
};

export const Bordered: Story = {
  args: {
    bordered: true,
    items: sampleItems.map((item) => ({ ...item, expanded: false })),
  },
  render: (args) => html`
    <usa-accordion
      .items=${args.items}
      ?multiselectable=${args.multiselectable}
      ?bordered=${args.bordered}
      @accordion-toggle="${(e: CustomEvent) => console.log('Accordion toggled:', e.detail)}"
    ></usa-accordion>
  `,
};

export const SingleItem: Story = {
  args: {
    items: [
      {
        id: 'single-item',
        title: 'Single Accordion Item',
        content:
          '<p>This is a single accordion item with some content. You can put any HTML content here including lists, links, and other elements.</p><ul><li>List item one</li><li>List item two</li></ul>',
        expanded: false,
      },
    ],
  },
  render: (args) => html`
    <usa-accordion
      .items=${args.items}
      ?multiselectable=${args.multiselectable}
      ?bordered=${args.bordered}
      @accordion-toggle="${(e: CustomEvent) => console.log('Accordion toggled:', e.detail)}"
    ></usa-accordion>
  `,
};

export const FAQ: Story = {
  args: {
    multiselectable: true,
    items: [
      {
        id: 'faq-1',
        title: 'What are the office hours?',
        content: `
          <p>Our office hours are:</p>
          <ul>
            <li><strong>Monday - Friday:</strong> 8:00 AM - 5:00 PM</li>
            <li><strong>Saturday:</strong> 9:00 AM - 1:00 PM</li>
            <li><strong>Sunday:</strong> Closed</li>
          </ul>
          <p>We are closed on national holidays.</p>
        `,
        expanded: false,
      },
      {
        id: 'faq-2',
        title: 'How can I contact customer service?',
        content: `
          <p>You can reach our customer service team through multiple channels:</p>
          <ul>
            <li><strong>Phone:</strong> 1-800-555-0123 (Mon-Fri, 8 AM - 8 PM ET)</li>
            <li><strong>Email:</strong> <a href="mailto:support@example.com">support@example.com</a></li>
            <li><strong>Online chat:</strong> Available on our website during business hours</li>
            <li><strong>Mail:</strong> Customer Service, 123 Business Ave, Suite 100, City, State 12345</li>
          </ul>
        `,
        expanded: false,
      },
      {
        id: 'faq-3',
        title: 'Is my personal information secure?',
        content: `
          <p>Yes, we take data security very seriously. Our security measures include:</p>
          <ul>
            <li>Encryption of all data in transit and at rest</li>
            <li>Regular security audits and penetration testing</li>
            <li>Compliance with industry cybersecurity standards</li>
            <li>Limited access to personal information on a need-to-know basis</li>
            <li>Employee training on data protection protocols</li>
          </ul>
          <p>Read our complete <a href="/privacy-policy">Privacy Policy</a> for more details.</p>
        `,
        expanded: false,
      },
      {
        id: 'faq-4',
        title: 'How long does processing take?',
        content: `
          <p>Processing times vary by service type:</p>
          <table>
            <thead>
              <tr>
                <th>Service</th>
                <th>Standard Processing</th>
                <th>Expedited Processing</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Document Requests</td>
                <td>5-10 business days</td>
                <td>2-3 business days</td>
              </tr>
              <tr>
                <td>Permit Applications</td>
                <td>15-20 business days</td>
                <td>7-10 business days</td>
              </tr>
              <tr>
                <td>Background Checks</td>
                <td>30-45 business days</td>
                <td>15-20 business days</td>
              </tr>
            </tbody>
          </table>
          <p><em>Note: Processing times may be longer during peak periods.</em></p>
        `,
        expanded: false,
      },
    ],
  },
  render: (args) => html`
    <usa-accordion
      .items=${args.items}
      ?multiselectable=${args.multiselectable}
      ?bordered=${args.bordered}
      @accordion-toggle="${(e: CustomEvent) => console.log('Accordion toggled:', e.detail)}"
    ></usa-accordion>
  `,
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const CustomContent: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Demonstrates using the default slot for custom content after accordion items, including expand/collapse controls.',
      },
    },
  },
  // ESLint has trouble parsing inline onclick handlers within Lit template literals
  // These handlers are necessary for Storybook docs mode compatibility
  /* eslint-disable */
  render: () => html`
      <div id="custom-content-demo">
        <usa-accordion
          id="custom-accordion"
          multiselectable
          .items=${[
            {
              id: 'custom-1',
              title: 'Section 1: Overview',
              content: `
                <p>This section contains custom HTML content with rich formatting.</p>
                <ul>
                  <li><strong>Feature 1:</strong> Detailed description of the first feature</li>
                  <li><strong>Feature 2:</strong> Information about the second capability</li>
                  <li><strong>Feature 3:</strong> Additional functionality notes</li>
                </ul>
                <p><a href="#learn-more" class="usa-link">Learn more about this topic</a></p>
              `,
              expanded: false,
            },
            {
              id: 'custom-2',
              title: 'Section 2: Technical Details',
              content: `
                <p>Technical specifications and implementation details:</p>
                <table class="usa-table usa-table--borderless width-full">
                  <thead>
                    <tr>
                      <th>Property</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Version</td>
                      <td>3.8.0</td>
                    </tr>
                    <tr>
                      <td>Framework</td>
                      <td>Lit Element</td>
                    </tr>
                    <tr>
                      <td>CSS</td>
                      <td>USWDS Official</td>
                    </tr>
                  </tbody>
                </table>
              `,
              expanded: false,
            },
            {
              id: 'custom-3',
              title: 'Section 3: Examples',
              content: `
                <p>Here are some practical examples:</p>
                <div class="bg-base-lightest padding-2 border-left-05 border-primary margin-y-2">
                  <h4 class="margin-top-0">Example 1: Basic Usage</h4>
                  <code>const element = document.createElement('usa-accordion');</code>
                </div>
                <div class="bg-base-lightest padding-2 border-left-05 border-primary margin-y-2">
                  <h4 class="margin-top-0">Example 2: With Properties</h4>
                  <code>element.multiselectable = true;</code>
                </div>
              `,
              expanded: false,
            },
          ]}
        >
          <usa-alert variant="info" slim class="margin-top-3">
            <h4 class="usa-alert__heading margin-top-0">Accordion Controls</h4>
            <p class="margin-bottom-2">
              Use these buttons to expand or collapse all accordion sections at once:
            </p>
            <div class="display-flex gap-1 flex-wrap">
              <button
                type="button"
                class="usa-button usa-button--outline"
                onclick="document.querySelector('#custom-accordion')?.querySelectorAll('.usa-accordion__button').forEach(b => b.getAttribute('aria-expanded') === 'false' && b.click())"
              >
                Expand All Sections
              </button>
              <button
                type="button"
                class="usa-button usa-button--outline"
                onclick="document.querySelector('#custom-accordion')?.querySelectorAll('.usa-accordion__button').forEach(b => b.getAttribute('aria-expanded') === 'true' && b.click())"
              >
                Collapse All Sections
              </button>
            </div>
            <p class="margin-top-2 margin-bottom-0 font-body-xs text-base-dark">
              <strong>Note:</strong> This demonstrates using the default slot for custom content.
              You can add any HTML elements including buttons, forms, or additional information.
            </p>
          </usa-alert>
        </usa-accordion>
      </div>
    `,
  /* eslint-enable */
};
