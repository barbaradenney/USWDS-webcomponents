import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './index.ts';
import type { USACard } from './usa-card.js';

const meta: Meta<USACard> = {
  title: 'Data Display/Card',
  component: 'usa-card',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
The USA Card component provides a flexible, accessible way to display structured content using official USWDS styling. Perfect for organizing information, highlighting services, and creating engaging content layouts.

**Use Cases:**
- Service highlights and feature cards
- Product or program information
- Resource and document listings
- Staff directory and contact cards
- Process step indicators
- News and announcement cards
- Interactive content containers
        `,
      },
    },
  },
  argTypes: {
    heading: {
      control: 'text',
      description: 'Card heading text',
    },
    text: {
      control: 'text',
      description: 'Card body text content',
    },
    mediaType: {
      control: 'select',
      options: ['none', 'image', 'video'],
      description: 'Type of media to display',
    },
    mediaSrc: {
      control: 'text',
      description: 'Media source URL',
    },
    mediaAlt: {
      control: 'text',
      description: 'Alt text for media',
    },
    mediaPosition: {
      control: 'select',
      options: ['inset', 'exdent', 'right'],
      description: 'Media positioning within the card',
    },
    flagLayout: {
      control: 'boolean',
      description: 'Use flag layout (media left, content right)',
    },
    headerFirst: {
      control: 'boolean',
      description: 'Display header before media',
    },
    actionable: {
      control: 'boolean',
      description: 'Make the card clickable',
    },
    href: {
      control: 'text',
      description: 'URL for actionable cards',
    },
    target: {
      control: 'select',
      options: ['', '_blank', '_self'],
      description: 'Link target for actionable cards',
    },
    footerText: {
      control: 'text',
      description: 'Footer text content',
    },
    headingLevel: {
      control: 'select',
      options: ['1', '2', '3', '4', '5', '6'],
      description: 'Heading level (h1-h6)',
    },
  },
  args: {
    heading: 'Card title',
    text: '',
    mediaType: 'none',
    mediaSrc: '',
    mediaAlt: '',
    mediaPosition: 'inset',
    flagLayout: false,
    headerFirst: false,
    actionable: false,
    href: '',
    target: '',
    footerText: '',
    headingLevel: '3',
  },
};

export default meta;
type Story = StoryObj<USACard>;

// Basic Examples
export const Default: Story = {
  args: {
    heading: 'Default Card',
    text: 'This is a basic card with a heading and some descriptive text content.',
  },
};

export const WithFooter: Story = {
  args: {
    heading: 'Card with Footer',
    text: 'This card includes footer text for additional information or context.',
    footerText: 'Updated 2 hours ago',
  },
};

export const ActionableCard: Story = {
  args: {
    heading: 'Clickable Card',
    text: 'This card is actionable - click anywhere on it to trigger the action.',
    actionable: true,
    href: '#',
  },
};

export const WithImage: Story = {
  args: {
    heading: 'Card with Image',
    text: 'This card includes an image with lazy loading and proper alt text.',
    mediaType: 'image',
    mediaSrc: 'https://picsum.photos/400/200?random=1',
    mediaAlt: 'Sample image',
  },
};

export const MediaRight: Story = {
  args: {
    heading: 'Media Right Layout',
    text: 'This card has media positioned on the right side with content on the left.',
    mediaType: 'image',
    mediaSrc: 'https://picsum.photos/200/150?random=2',
    mediaAlt: 'Sample image',
    mediaPosition: 'right',
  },
  parameters: {
    docs: {
      description: {
        story: `
**Viewport Requirement**: Media right positioning only takes effect at tablet breakpoint and above (640px/40em).
Below this breakpoint, the card will display in standard layout with media above content.

To test media right positioning:
1. Ensure browser width is at least 640px
2. Use browser dev tools to test responsive breakpoints
3. Media will appear on the right side of content at desktop sizes
        `,
      },
    },
  },
};

export const FlagLayout: Story = {
  args: {
    heading: 'Flag Layout',
    text: 'Flag layout displays media on the left with content flowing alongside on the right.',
    mediaType: 'image',
    mediaSrc: 'https://picsum.photos/150/100?random=3',
    mediaAlt: 'Sample image',
    flagLayout: true,
  },
};

export const HeaderFirst: Story = {
  args: {
    heading: 'Header First Layout',
    text: 'In this layout, the header appears before the media element.',
    mediaType: 'image',
    mediaSrc: 'https://picsum.photos/400/150?random=4',
    mediaAlt: 'Sample image',
    headerFirst: true,
  },
};

export const DifferentHeadingLevels: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div class="display-flex flex-column gap-1 maxw-tablet">
      <h2>Card Heading Levels</h2>
      <p>Cards can use different heading levels for proper document structure:</p>

      <usa-card
        heading="H1 Card Heading"
        heading-level="1"
        text="This card uses an H1 heading element."
      ></usa-card>
      <usa-card
        heading="H2 Card Heading"
        heading-level="2"
        text="This card uses an H2 heading element."
      ></usa-card>
      <usa-card
        heading="H3 Card Heading"
        heading-level="3"
        text="This card uses an H3 heading element (default)."
      ></usa-card>
      <usa-card
        heading="H4 Card Heading"
        heading-level="4"
        text="This card uses an H4 heading element."
      ></usa-card>
    </div>
  `,
};

// Grid layout examples
export const CardGrid: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div class="display-grid grid-col grid-gap-1 maxw-dedth: 1200px;">
      <h2 class="grid-col-fill">Service Cards Grid</h2>
      <p class="grid-col-fill">Example of cards arranged in a responsive grid layout.</p>

      <usa-card
        heading="Customer Support"
        text="Get help with your account, billing questions, and technical support from our experienced team."
        actionable
        href="#support"
        footer-text="Available 24/7"
      >
      </usa-card>

      <usa-card
        heading="Documentation"
        text="Comprehensive guides, tutorials, and API documentation to help you get the most out of our services."
        actionable
        href="#docs"
        footer-text="Updated weekly"
      >
      </usa-card>

      <usa-card
        heading="Community"
        text="Join our community forum to connect with other users, share tips, and get answers to your questions."
        actionable
        href="#community"
        footer-text="Join 10,000+ members"
      >
      </usa-card>

      <usa-card
        heading="Training"
        text="Access online training courses, webinars, and certification programs to enhance your skills."
        actionable
        href="#training"
        footer-text="50+ courses available"
      >
      </usa-card>
    </div>
  `,
};

// Process steps example
export const ProcessSteps: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div class="display-flex flex-column gap-1 maxw-tablet">
      <h2>Application Process</h2>
      <p>Step-by-step process cards for applications.</p>

      <usa-card
        heading="Step 1: Create Account"
        text="Start by creating your account with a valid email address and secure password. Verify your email to activate your account."
        header-first
        footer-text="Estimated time: 5 minutes"
      >
      </usa-card>

      <usa-card
        heading="Step 2: Complete Profile"
        text="Fill out your profile information including contact details, preferences, and any required verification documents."
        header-first
        footer-text="Estimated time: 15 minutes"
      >
      </usa-card>

      <usa-card
        heading="Step 3: Submit Application"
        text="Review your information carefully and submit your application. You'll receive a confirmation email with your application number."
        header-first
        footer-text="Estimated time: 10 minutes"
      >
      </usa-card>

      <usa-card
        heading="Step 4: Wait for Review"
        text="Our team will review your application and contact you if additional information is needed. Check your email regularly for updates."
        header-first
        footer-text="Processing time: 3-5 business days"
      >
      </usa-card>
    </div>
  `,
};

// News and updates
export const NewsUpdates: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div class="display-grid grid-col grid-gap-1 maxw-dedth: 1200px;">
      <h2 class="grid-col-fill">Latest News & Updates</h2>
      <p class="grid-col-fill">Stay informed with the latest news, updates, and announcements.</p>

      <usa-card
        heading="New Features Released"
        text="We've launched several new features to improve your experience, including enhanced search capabilities and improved mobile interface."
        media-type="image"
        media-src="https://picsum.photos/400/200?random=10"
        media-alt="New features illustration"
        actionable
        href="#news1"
        footer-text="March 15, 2024"
      >
      </usa-card>

      <usa-card
        heading="System Maintenance Notice"
        text="Scheduled maintenance will occur this weekend from 2 AM to 6 AM EST. Some services may be temporarily unavailable."
        media-type="image"
        media-src="https://picsum.photos/400/200?random=11"
        media-alt="Maintenance illustration"
        actionable
        href="#news2"
        footer-text="March 10, 2024"
      >
      </usa-card>

      <usa-card
        heading="Security Update"
        text="We've implemented additional security measures to protect your account and data. No action required from users."
        actionable
        href="#news3"
        footer-text="March 5, 2024"
      >
      </usa-card>
    </div>
  `,
};

// Accessibility features
export const AccessibilityDemo: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div class="maxw-desktop">
      <h2>Accessibility Features</h2>
      <p>
        The USA Card component meets accessibility standards and provides excellent user experience
        for all users.
      </p>

      <div class="display-flex flex-column gap-1">
        <usa-card
          heading="Keyboard Accessible Card"
          text="This actionable card can be navigated and activated using keyboard controls. Tab to focus, Enter or Space to activate."
          actionable
          href="#accessibility-demo"
          footer-text="Try using Tab, Enter, and Space keys"
        >
        </usa-card>

        <usa-card
          heading="Screen Reader Compatible"
          text="This card includes proper ARIA attributes, semantic HTML structure, and screen reader announcements for all interactive elements."
          media-type="image"
          media-src="https://picsum.photos/400/150?random=50"
          media-alt="Detailed alt text describes the image content for screen readers"
          actionable
          href="#screen-reader-demo"
          footer-text="Alt text and ARIA labels provided"
        >
        </usa-card>

        <usa-card
          heading="Proper Heading Structure"
          text="Cards maintain proper heading hierarchy (h1-h6) for document structure and assistive technology navigation."
          heading-level="4"
          footer-text="This card uses an H4 heading"
        >
        </usa-card>
      </div>

      <div class="margin-top-2 padding-1 bg-info-lighter radius-md">
        <h3>Accessibility Features:</h3>
        <ul>
          <li>
            <strong>Keyboard Navigation:</strong> Full keyboard access with Tab, Enter, and Space
            keys
          </li>
          <li>
            <strong>Screen Reader Support:</strong> Proper ARIA attributes and semantic HTML
            structure
          </li>
          <li><strong>Color Contrast:</strong> Meets minimum contrast ratio requirements</li>
          <li>
            <strong>Focus Indicators:</strong> Clear visual focus indicators for keyboard users
          </li>
          <li><strong>Heading Hierarchy:</strong> Configurable heading levels (h1-h6)</li>
          <li><strong>Alt Text Support:</strong> Comprehensive alt text for all media content</li>
          <li><strong>Semantic HTML:</strong> Uses proper HTML elements and USWDS classes</li>
          <li><strong>Responsive Design:</strong> Works across all device sizes</li>
        </ul>
      </div>
    </div>
  `,
};

// Interactive demo
export const InteractiveDemo: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div class="maxw-tablet">
      <h2>Interactive Card Demo</h2>
      <p>Demonstration of card interactions, events, and dynamic content updates.</p>

      <usa-card
        heading="Interactive Service Card"
        text="Click this card to see event handling and interaction feedback. Monitor the console for event details."
        actionable
        href="#interactive-demo"
        media-type="image"
        media-src="https://picsum.photos/400/150?random=60"
        media-alt="Interactive demo illustration"
        @card-click=${(e: CustomEvent) => {
          console.log('Card clicked:', e.detail);

          // Update display with interaction info
          const output = document.getElementById('interaction-output');
          if (output) {
            output.innerHTML = `
              <strong>Card Interaction Detected:</strong><br>
              Heading: ${e.detail.heading}<br>
              Href: ${e.detail.href}<br>
              Timestamp: ${new Date().toLocaleTimeString()}
            `;
          }
        }}
        footer-text="Click to trigger custom event"
      >
      </usa-card>

      <div class="margin-top-1 padding-1 bg-base-lightest radius-md">
        <h4>Interaction Information:</h4>
        <div id="interaction-output">
          No interactions yet. Click the card above to see event details.
        </div>
      </div>

      <div class="margin-top-1 padding-1 bg-info-lighter radius-md">
        <h4>Testing Instructions:</h4>
        <ul>
          <li><strong>Mouse:</strong> Click anywhere on the card</li>
          <li><strong>Keyboard:</strong> Tab to focus the card, then press Enter or Space</li>
          <li>
            <strong>Screen Reader:</strong> Card is announced as clickable with proper context
          </li>
          <li><strong>Console:</strong> Open browser console to see detailed event information</li>
        </ul>
      </div>
    </div>
  `,
};

// Custom content
export const CustomContent: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div class="maxw-tablet">
      <h2 class="margin-bottom-2">Custom Content</h2>
      <p class="margin-bottom-3">
        Cards support custom content through slots for advanced layouts and rich media.
      </p>

      <div class="margin-bottom-3">
        <usa-card heading="Card with Custom Body Content">
          <div slot="body">
            <p>This card uses custom content instead of the text property.</p>
            <ul class="usa-list">
              <li>Custom HTML markup</li>
              <li>Rich text formatting</li>
              <li>Interactive elements</li>
              <li>Multiple paragraphs and lists</li>
            </ul>
            <p><strong>Benefits:</strong> Complete control over content structure and styling.</p>
          </div>
        </usa-card>
      </div>

      <div class="margin-bottom-3">
        <usa-card heading="Application Status Card">
          <div slot="body">
            <div class="display-flex flex-justify flex-align-center margin-bottom-2">
              <span class="text-bold">Status:</span>
              <usa-tag text="APPROVED" class="bg-success text-white"></usa-tag>
            </div>
            <p><strong>Application ID:</strong> APP-2024-001234567</p>
            <p><strong>Type:</strong> Service Application</p>
            <p><strong>Submitted:</strong> March 1, 2024</p>
            <p><strong>Processing Time:</strong> 5 business days</p>
          </div>
          <div slot="footer">
            <button class="usa-button usa-button--outline margin-right-1">View Details</button>
            <button class="usa-button usa-button--secondary">Download Approval</button>
          </div>
        </usa-card>
      </div>

      <usa-card heading="Important Notice">
        <div slot="body">
          <usa-alert variant="warning" slim>
            <p class="margin-0 text-bold">⚠️ System Notice</p>
            <p class="margin-top-05 margin-bottom-0">
              Scheduled maintenance window tonight from 10 PM to 2 AM EST. Some services may be
              temporarily unavailable.
            </p>
          </usa-alert>
        </div>
        <div slot="footer">
          <p class="text-base-dark font-body-xs margin-0">
            System Administrator | Posted: Today 2:30 PM EST
          </p>
        </div>
      </usa-card>
    </div>
  `,
};
