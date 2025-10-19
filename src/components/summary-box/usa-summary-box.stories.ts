import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './index.js';
import type { USASummaryBox } from './usa-summary-box.js';

const meta: Meta<USASummaryBox> = {
  title: 'Components/Summary Box',
  component: 'usa-summary-box',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
The USA Summary Box component provides a prominent way to highlight key information, important announcements, 
or critical summaries. It follows USWDS design patterns with proper semantic 
structure and accessibility features.

## Features
- Semantic heading elements (h1-h6)
- Support for both property and slot content
- HTML content rendering with unsafeHTML
- Light DOM for USWDS CSS compatibility
- Accessibility-compliant implementation
        `,
      },
    },
  },
  argTypes: {
    heading: {
      control: 'text',
      description: 'Main heading text for the summary box',
    },
    headingLevel: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      description: 'Semantic heading level for accessibility',
    },
    content: {
      control: 'text',
      description: 'HTML content to display (alternative to slot content)',
    },
  },
};

export default meta;
type Story = StoryObj<USASummaryBox>;

export const Default: Story = {
  args: {
    heading: 'Important Information',
    headingLevel: 'h3',
  },
  render: (args) => html`
    <usa-summary-box 
      heading="${args.heading}" 
      heading-level="${args.headingLevel}"
    >
      <p>This is the default summary box with slot content. Use summary boxes to highlight key information that users need to know.</p>
    </usa-summary-box>
  `,
};

export const AllHeadingLevels: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div class="display-grid grid-gap-205">
      <usa-summary-box heading="H1 Summary Box" heading-level="h1">
        <p>This summary box uses an H1 heading, typically for page-level summaries.</p>
      </usa-summary-box>
      
      <usa-summary-box heading="H2 Summary Box" heading-level="h2">
        <p>This summary box uses an H2 heading, typically for major section summaries.</p>
      </usa-summary-box>
      
      <usa-summary-box heading="H3 Summary Box" heading-level="h3">
        <p>This summary box uses an H3 heading (default), typically for subsection summaries.</p>
      </usa-summary-box>
      
      <usa-summary-box heading="H4 Summary Box" heading-level="h4">
        <p>This summary box uses an H4 heading, typically for minor section summaries.</p>
      </usa-summary-box>
      
      <usa-summary-box heading="H5 Summary Box" heading-level="h5">
        <p>This summary box uses an H5 heading, typically for detailed subsection summaries.</p>
      </usa-summary-box>
      
      <usa-summary-box heading="H6 Summary Box" heading-level="h6">
        <p>This summary box uses an H6 heading, typically for the most detailed summary level.</p>
      </usa-summary-box>
    </div>
  `,
};

export const WithHTMLContent: Story = {
  args: {
    heading: 'Benefits Summary',
    headingLevel: 'h2',
    content: `
      <p><strong>Nutrition Assistance Program</strong> helps eligible families purchase nutritious food.</p>
      <ul>
        <li>Average monthly benefit: $234 per person</li>
        <li>Available nationwide</li>
        <li>Online application available at <a href="#benefits">website.com</a></li>
      </ul>
      <p><em>Income limits and eligibility requirements apply.</em></p>
    `,
  },
};








export const WithSlotContent: Story = {
  args: {
    heading: 'Small Business Resources',
    headingLevel: 'h3',
  },
  render: (args) => html`
    <usa-summary-box 
      heading="${args.heading}" 
      heading-level="${args.headingLevel}"
    >
      <p>The Business Support Center provides resources for entrepreneurs and small business owners.</p>
      
      <h4>Available Programs:</h4>
      <ul>
        <li><strong>Business Loans:</strong> Low-interest financing for business expansion and working capital</li>
        <li><strong>Mentorship Programs:</strong> Free business mentoring and workshops</li>
        <li><strong>Innovation Funding:</strong> Research and development funding for innovative businesses</li>
        <li><strong>Contracting Opportunities:</strong> Networking and contract opportunities</li>
      </ul>
      
      <div class="bg-info-lighter padding-1 margin-y-1 radius-md">
        <p><strong>Support Available:</strong> Financial assistance programs available for eligible businesses.</p>
      </div>
      
      <p><strong>Find Local Help:</strong> Contact your nearest <a href="#local-office">District Office</a> or <a href="#resource-partners">Resource Partner</a></p>
      
      <p><a href="#loan-programs">Explore Loan Programs</a> | <a href="#find-mentor">Find a Mentor</a> | <a href="#contracting">Business Contracting</a></p>
    </usa-summary-box>
  `,
};

export const MixedContent: Story = {
  args: {
    heading: 'Content Flexibility Demo',
    headingLevel: 'h3',
    content: '<p><strong>This content comes from the content property.</strong> It will override any slot content.</p>',
  },
  render: (args) => html`
    <usa-summary-box 
      heading="${args.heading}" 
      heading-level="${args.headingLevel}"
      content="${args.content}"
    >
      <p>This slot content will not be displayed when the content property has a value.</p>
      <p>Toggle the content property in the controls to see slot content.</p>
    </usa-summary-box>
  `,
};

export const WithoutHeading: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <usa-summary-box>
      <p>This summary box has no heading - just content. This might be useful for simpler announcements or when the heading is part of the content itself.</p>
      <h4>Self-Contained Content</h4>
      <p>The content includes its own heading structure and formatting.</p>
    </usa-summary-box>
  `,
};

export const AccessibilityShowcase: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div class="display-grid grid-gap-2">
      <div>
        <h2>Proper Heading Hierarchy</h2>
        <p>Summary boxes maintain semantic heading structure for screen readers:</p>
        
        <usa-summary-box heading="Main Section Summary" heading-level="h3">
          <p>This summary uses H3, following the page's H2 above.</p>
        </usa-summary-box>
        
        <usa-summary-box heading="Subsection Summary" heading-level="h4">
          <p>This summary uses H4, creating proper hierarchy.</p>
        </usa-summary-box>
      </div>
      
      <div>
        <h2>Accessibility Features</h2>
        <usa-summary-box heading="WCAG Compliance" heading-level="h3">
          <ul>
            <li><strong>Semantic HTML:</strong> Uses proper heading elements (h1-h6)</li>
            <li><strong>Screen Reader Support:</strong> Content is announced in logical order</li>
            <li><strong>Keyboard Navigation:</strong> All interactive elements are focusable</li>
            <li><strong>Color Independence:</strong> Information is not conveyed by color alone</li>
            <li><strong>Focus Management:</strong> Clear focus indicators for all interactive elements</li>
          </ul>
          
          <p>Test with keyboard navigation: <a href="#test">Test Link</a></p>
          <button type="button" class="margin-top-1">Test Button</button>
        </usa-summary-box>
      </div>
    </div>
  `,
};

export const InteractiveDemo: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div class="display-grid grid-gap-205">
      <div class="bg-base-lightest padding-1 radius-md">
        <h3>Interactive Summary Box Demo</h3>
        <p>Use the Storybook controls panel to modify the summary box properties in real-time:</p>
        <ul>
          <li><strong>heading:</strong> Change the summary box title</li>
          <li><strong>headingLevel:</strong> Test different semantic heading levels</li>
          <li><strong>content:</strong> Add HTML content (overrides slot content)</li>
        </ul>
      </div>
      
      <usa-summary-box 
        heading="Interactive Summary Box" 
        heading-level="h2"
      >
        <p>This is the default slot content. It will be replaced if you add content via the property control.</p>
        <p><strong>Try it:</strong> Use the controls panel to modify this summary box's properties!</p>
      </usa-summary-box>
    </div>
  `,
};


