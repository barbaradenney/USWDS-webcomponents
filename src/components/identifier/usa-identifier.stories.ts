import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './index.ts';
import type { USAIdentifier } from './usa-identifier.js';

const meta: Meta<USAIdentifier> = {
  title: 'Components/Identifier',
  component: 'usa-identifier',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
The USA Identifier component displays organizational identification with required links and logos. It provides a standardized footer for websites that includes organization information, legal links, and partner organization logos.

Based on the USWDS Identifier component with enhanced web component functionality.
        `,
      },
    },
  },
  argTypes: {
    domain: {
      control: 'text',
      description: 'The website domain (e.g., "company.com")',
    },
    agency: {
      control: 'text',
      description: 'The organization name',
    },
    description: {
      control: 'text',
      description: 'Optional description of the organization',
    },
    parentAgency: {
      control: 'text',
      description: 'The parent organization name',
    },
    parentAgencyHref: {
      control: 'text',
      description: 'URL for the parent organization link',
    },
    showLogos: {
      control: 'boolean',
      description: 'Whether to show the logos section',
    },
    showRequiredLinks: {
      control: 'boolean',
      description: 'Whether to show the required links section',
    },
    mastheadLogoSrc: {
      control: 'text',
      description: 'Source URL for the masthead logo',
    },
    mastheadLogoAlt: {
      control: 'text',
      description: 'Alt text for the masthead logo',
    },
  },
};

export default meta;
type Story = StoryObj<USAIdentifier>;

// Basic Stories
export const Default: Story = {
  args: {
    domain: 'example.com',
    agency: 'Example Organization',
    description: '',
    parentAgency: 'Example Corporation',
    parentAgencyHref: '',
    showLogos: false,
    showRequiredLinks: true,
    mastheadLogoAlt: '',
  },
};

export const WithParentOrganizationLink: Story = {
  args: {
    ...Default.args,
    domain: 'healthcare.example.com',
    agency: 'Healthcare Division',
    parentAgency: 'Example Healthcare Corp',
    parentAgencyHref: 'https://example.com',
    mastheadLogoAlt: 'Example Healthcare logo',
  },
  parameters: {
    docs: {
      description: {
        story: 'Identifier with a linked parent organization for better navigation.',
      },
    },
  },
};

export const MinimalConfiguration: Story = {
  args: {
    ...Default.args,
    domain: 'simple.com',
    agency: 'Simple Organization',
    parentAgency: '',
    showLogos: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Minimal identifier configuration with only required elements.',
      },
    },
  },
};

export const NoRequiredLinks: Story = {
  args: {
    ...Default.args,
    domain: 'basic.com',
    showRequiredLinks: false,
    showLogos: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Identifier without required links section, showing only masthead.',
      },
    },
  },
};

// Interactive Examples
export const WithEventHandlers: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
    docs: {
      description: {
        story:
          'Interactive example showing link-click event handling. Check browser console for event details.',
      },
    },
  },
  render: () => html`
    <div>
      <usa-identifier
        domain="interactive.example.com"
        agency="Interactive Organization"
        parent-agency="Example Corporation"
        @link-click="${(e: CustomEvent) => {
          console.log('Link clicked:', e.detail);
          alert(`Link clicked: ${e.detail.text} (${e.detail.href})`);
        }}"
      ></usa-identifier>
      <p class="margin-top-1 text-base-dark font-body-xs">
        Click any link to see event handling. Check browser console for event details.
      </p>
    </div>
  `,
};

export const DynamicContentManagement: Story = {
  args: {
    domain: 'dynamic.example.com',
    agency: 'Dynamic Content Organization',
    parentAgency: 'Example Corporation',
    requiredLinks: [
      { href: '/about', text: 'About' },
      { href: '/privacy', text: 'Privacy' },
    ],
  },
};

// Accessibility Example
export const AccessibilityDemo: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
    docs: {
      description: {
        story:
          'Accessibility demonstration showing ARIA labels, semantic structure, and screen reader support.',
      },
    },
  },
  render: () => html`
    <div>
      <usa-identifier
        domain="accessible.example.com"
        agency="Accessibility Demonstration Organization"
        parent-agency="Example Accessibility Corp"
        parent-agency-href="https://example.com"
        masthead-logo-alt="Accessibility compliance logo"
      ></usa-identifier>

      <div class="margin-top-2 padding-2 bg-base-lightest radius-md">
        <h4>Accessibility Features Demonstrated:</h4>
        <ul class="margin-y-05">
          <li><strong>ARIA labels:</strong> Each section has descriptive aria-label attributes</li>
          <li><strong>Image alt text:</strong> All logos have meaningful alternative text</li>
          <li>
            <strong>Semantic structure:</strong> Uses proper heading hierarchy and list elements
          </li>
          <li><strong>Keyboard navigation:</strong> All links are keyboard accessible</li>
          <li>
            <strong>Screen reader support:</strong> Content is properly structured for assistive
            technology
          </li>
        </ul>
      </div>
    </div>
  `,
};

