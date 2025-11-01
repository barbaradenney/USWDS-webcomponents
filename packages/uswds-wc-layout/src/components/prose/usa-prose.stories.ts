import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './index.js';
import type { USAProse } from './usa-prose.js';

const meta: Meta<USAProse> = {
  title: 'Layout/Prose',
  component: 'usa-prose',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
The USA Prose component provides USWDS-styled content blocks for rich text and document formatting. 
It applies consistent typography, spacing, and styling to various content types, making it perfect for 
documentation, articles, and formatted text content.

## Features
- Multiple variant options (default, condensed, expanded)
- Width control (default, narrow, wide)
- HTML content support via property or slot
- Light DOM for USWDS CSS compatibility
- Consistent typography and spacing
- Accessibility-compliant semantic HTML
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'condensed', 'expanded'],
      description: 'Typography variant affecting line height and spacing',
    },
    width: {
      control: 'select',
      options: ['default', 'narrow', 'wide'],
      description: 'Content width variant',
    },
    content: {
      control: 'text',
      description: 'HTML content to display (alternative to slot content)',
    },
  },
};

export default meta;
type Story = StoryObj<USAProse>;

export const Default: Story = {
  args: {
    variant: 'default',
    width: 'default',
  },
  render: (args) => html`
    <usa-prose variant="${args.variant}" width="${args.width}">
      <h2>Content Formatting Overview</h2>
      <p>
        The prose component provides consistent formatting for various types of content including
        articles, documentation, and structured text.
      </p>
      <h3>Supported Content Types</h3>
      <ul>
        <li>Articles and blog posts</li>
        <li>Documentation pages</li>
        <li>Policy documents</li>
        <li>Technical specifications</li>
        <li>User guides</li>
      </ul>
      <blockquote>
        <p>
          "Well-formatted content improves readability and user experience across all platforms."
        </p>
      </blockquote>
    </usa-prose>
  `,
};

export const AllVariants: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div class="display-grid grid-gap-2">
      <div>
        <h3 class="margin-bottom-2">Default Spacing</h3>
        <usa-prose variant="default">
          <h4>Application Process</h4>
          <p>
            The application process has been streamlined to provide better service to users. Our
            digital-first approach ensures faster processing times and improved accessibility.
          </p>
          <ul>
            <li>Online application submission</li>
            <li>Document upload portal</li>
            <li>Real-time status tracking</li>
          </ul>
        </usa-prose>
      </div>

      <div>
        <h3 class="margin-bottom-2">Condensed Spacing</h3>
        <usa-prose variant="condensed">
          <h4>Application Process</h4>
          <p>
            The application process has been streamlined to provide better service to users. Our
            digital-first approach ensures faster processing times and improved accessibility.
          </p>
          <ul>
            <li>Online application submission</li>
            <li>Document upload portal</li>
            <li>Real-time status tracking</li>
          </ul>
        </usa-prose>
      </div>

      <div>
        <h3 class="margin-bottom-2">Expanded Spacing</h3>
        <usa-prose variant="expanded">
          <h4>Application Process</h4>
          <p>
            The application process has been streamlined to provide better service to users. Our
            digital-first approach ensures faster processing times and improved accessibility.
          </p>
          <ul>
            <li>Online application submission</li>
            <li>Document upload portal</li>
            <li>Real-time status tracking</li>
          </ul>
        </usa-prose>
      </div>
    </div>
  `,
};

export const AllWidths: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div class="display-grid grid-gap-2">
      <div>
        <h3 class="margin-bottom-2">Narrow Width (45ex)</h3>
        <usa-prose width="narrow">
          <p>
            This content is displayed in a narrow column, ideal for focused reading and
            mobile-friendly layouts. The reduced line length improves readability and comprehension
            for detailed information.
          </p>
        </usa-prose>
      </div>

      <div>
        <h3 class="margin-bottom-2">Default Width (68ex)</h3>
        <usa-prose width="default">
          <p>
            This content uses the standard reading width, optimized for most content and
            documentation. It provides a balanced approach between readability and efficient use of
            screen space.
          </p>
        </usa-prose>
      </div>

      <div>
        <h3 class="margin-bottom-2">Wide Width (85ex)</h3>
        <usa-prose width="wide">
          <p>
            This content spans a wider column, suitable for detailed technical documentation, data
            tables, or content that benefits from additional horizontal space. Use this width when
            displaying complex information or when screen real estate allows.
          </p>
        </usa-prose>
      </div>
    </div>
  `,
};

export const WithHTMLContent: Story = {
  args: {
    content: `
      <h2>Content via Property</h2>
      <p>This content is set via the <code>content</code> property rather than using slot content. This approach is useful when content is dynamically generated or comes from a content management system.</p>
      <h3>Benefits of Property-Based Content</h3>
      <ul>
        <li>Dynamic content updates</li>
        <li>CMS integration</li>
        <li>Programmatic content generation</li>
      </ul>
      <blockquote>
        <p>Both slot-based and property-based content approaches are supported for maximum flexibility.</p>
      </blockquote>
    `,
  },
};

export const MixedContent: Story = {
  args: {
    content:
      '<p><strong>Property content:</strong> This content was set via the content property.</p>',
  },
  render: (args) => html`
    <usa-prose content="${args.content}">
      <p><strong>Slot content:</strong> This content was provided via the slot.</p>
      <p>Both types of content can be used together, with slot content appearing first.</p>
    </usa-prose>
  `,
};

export const CustomContent: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Demonstrates using the default slot for custom content.',
      },
    },
  },
  render: () => html`
    <usa-prose>
      <p>This is custom slotted content.</p>
      <p>Slots allow you to provide your own HTML content to the component.</p>
    </usa-prose>
  `,
};
