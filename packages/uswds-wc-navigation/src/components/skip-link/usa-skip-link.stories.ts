import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './index.ts';
import type { USASkipLink } from './usa-skip-link.js';

const meta: Meta<USASkipLink> = {
  title: 'Navigation/Skip Link',
  component: 'usa-skip-link',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
The Skip Link component provides accessible navigation functionality for keyboard and screen reader users, allowing them to quickly jump to main content or other important page sections.

Key accessibility features:
- Hidden until focused with Tab key
- Keyboard accessible navigation
- Screen reader friendly
- USWDS compliant styling and behavior
        `,
      },
    },
  },
  argTypes: {
    href: {
      control: 'text',
      description: 'Target element ID or URL fragment',
    },
    text: {
      control: 'text',
      description: 'Display text for the skip link',
    },
    multiple: {
      control: 'boolean',
      description: 'Whether this is part of multiple skip links',
    },
  },
};

export default meta;
type Story = StoryObj<USASkipLink>;

// Basic skip link examples
export const Default: Story = {
  args: {
    href: '#main-content',
    text: 'Skip to main content',
    multiple: false,
  },
  render: (args) => html`
    <div class="position-relative minh-card">
      <p class="margin-bottom-2 padding-2 bg-base-lightest radius-md">
        <strong>Press Tab to see the skip link appear!</strong><br />
        The skip link is hidden until focused with the keyboard.
      </p>

      <usa-skip-link
        .href=${args.href}
        .text=${args.text}
        .multiple=${args.multiple}
      ></usa-skip-link>

      <div id="main-content" class="margin-top-4 padding-2 border-2px border-primary radius-md">
        <h3>Main Content</h3>
        <p>This is the main content area that users can skip to.</p>
        <p>Notice how the skip link focuses this element when activated.</p>
      </div>
    </div>
  `,
};

export const CustomTarget: Story = {
  args: {
    href: '#navigation',
    text: 'Skip to navigation',
    multiple: false,
  },
  render: (args) => html`
    <div class="position-relative minh-card">
      <p class="margin-bottom-2 padding-2 bg-base-lightest radius-md">
        <strong>Tab to focus, then press Enter to skip to navigation.</strong>
      </p>

      <usa-skip-link
        .href=${args.href}
        .text=${args.text}
        .multiple=${args.multiple}
      ></usa-skip-link>

      <nav id="navigation" class="margin-top-4 padding-2 border-2px border-primary-dark radius-md">
        <h3>Navigation</h3>
        <ul>
          <li><a href="#home">Home</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#services">Services</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>
    </div>
  `,
};

export const MultipleSkipLinks: Story = {
  args: {
    multiple: true,
  },
  render: (args) => html`
    <div class="position-relative minh-card-lg">
      <p class="margin-bottom-2 padding-2 bg-base-lightest radius-md">
        <strong>Multiple skip links for complex page layouts.</strong><br />
        Tab through to see all available skip options.
      </p>

      <usa-skip-link
        href="#main-content"
        text="Skip to main content"
        .multiple=${args.multiple}
      ></usa-skip-link>

      <usa-skip-link
        href="#navigation"
        text="Skip to navigation"
        .multiple=${args.multiple}
      ></usa-skip-link>

      <usa-skip-link
        href="#sidebar"
        text="Skip to sidebar"
        .multiple=${args.multiple}
      ></usa-skip-link>

      <usa-skip-link
        href="#footer"
        text="Skip to footer"
        .multiple=${args.multiple}
      ></usa-skip-link>

      <nav id="navigation" class="margin-top-4 padding-2 border-2px border-primary-dark radius-md">
        <h3>Navigation</h3>
        <ul>
          <li><a href="#home">Home</a></li>
          <li><a href="#about">About</a></li>
        </ul>
      </nav>

      <div class="display-flex gap-2 margin-top-2">
        <main id="main-content" class="flex-2 padding-2 border-2px border-primary radius-md">
          <h3>Main Content</h3>
          <p>Primary page content goes here.</p>
        </main>

        <aside id="sidebar" class="flex-1 padding-2 border-2px border-secondary-dark radius-md">
          <h3>Sidebar</h3>
          <p>Secondary content or navigation.</p>
        </aside>
      </div>

      <footer id="footer" class="margin-top-2 padding-2 border-2px border-base-dark radius-md">
        <h3>Footer</h3>
        <p>Footer content and links.</p>
      </footer>
    </div>
  `,
};

// Complex website examples
export const ComplexWebsite: Story = {
  args: {
    multiple: true,
  },
  render: (args) => html`
    <div class="position-relative minh-mobile">
      <p class="margin-bottom-2 padding-2 bg-base-lightest radius-md">
        <strong>Complex website skip navigation pattern.</strong><br />
        Comprehensive skip links for multi-section site structure.
      </p>

      <!-- Skip Links -->
      <usa-skip-link
        href="#main-content"
        text="Skip to main content"
        .multiple=${args.multiple}
      ></usa-skip-link>

      <usa-skip-link
        href="#site-nav"
        text="Skip to site navigation"
        .multiple=${args.multiple}
      ></usa-skip-link>

      <usa-skip-link
        href="#services"
        text="Skip to services"
        .multiple=${args.multiple}
      ></usa-skip-link>

      <usa-skip-link
        href="#search"
        text="Skip to search"
        .multiple=${args.multiple}
      ></usa-skip-link>

      <usa-skip-link
        href="#contact"
        text="Skip to contact information"
        .multiple=${args.multiple}
      ></usa-skip-link>

      <!-- Page Structure -->
      <header class="margin-top-4 padding-2 bg-primary-dark text-white radius-md">
        <h1>Example Organization</h1>
      </header>

      <nav id="site-nav" class="margin-top-2 padding-2 border-2px border-primary-dark radius-md">
        <h2>Site Navigation</h2>
        <ul>
          <li><a href="#about">About Us</a></li>
          <li><a href="#programs">Programs & Services</a></li>
          <li><a href="#resources">Resources</a></li>
          <li><a href="#news">News & Updates</a></li>
        </ul>
      </nav>

      <div class="display-flex gap-2 margin-top-2">
        <main id="main-content" class="flex-2 padding-2 border-2px border-primary radius-md">
          <h2>Main Content</h2>
          <p>
            Welcome to Example Organization. We provide essential services and solutions to our
            customers and partners.
          </p>

          <section id="services" class="margin-top-2 padding-2 bg-base-lightest radius-md">
            <h3>Our Services</h3>
            <ul>
              <li>Customer programs and solutions</li>
              <li>Business consulting services</li>
              <li>Information and resources</li>
              <li>Research and analytics</li>
            </ul>
          </section>
        </main>

        <aside class="flex-1 padding-2 border-2px border-secondary-dark radius-md">
          <div id="search" class="margin-bottom-2 padding-2 bg-base-lightest radius-md">
            <h3>Search</h3>
            <input
              type="search"
              placeholder="Search our site..."
              class="width-full padding-1 border-1px border-base-lighter radius-md"
            />
          </div>

          <div class="margin-bottom-2">
            <h3>Quick Links</h3>
            <ul>
              <li><a href="#forms">Forms & Documents</a></li>
              <li><a href="#faq">Frequently Asked Questions</a></li>
              <li><a href="#help">Get Help</a></li>
            </ul>
          </div>
        </aside>
      </div>

      <footer id="contact" class="margin-top-2 padding-2 bg-base-dark text-white radius-md">
        <h2>Contact Information</h2>
        <p>Phone: (555) 123-4567 | Email: info@example.com</p>
        <p>123 Example Street, City, State 12345</p>
      </footer>
    </div>
  `,
};

export const AccessibilityDemo: Story = {
  args: {
    href: '#accessible-content',
    text: 'Skip to accessible content',
    multiple: false,
  },
  render: (args) => html`
    <div class="position-relative minh-card-lg">
      <div class="margin-bottom-2 padding-2 bg-primary-lighter radius-md">
        <h3 class="margin-bottom-1">Accessibility Features Demonstration</h3>
        <ul class="margin-0 padding-left-3">
          <li><strong>Keyboard Navigation:</strong> Press Tab to focus the skip link</li>
          <li><strong>Screen Reader:</strong> Announces "Skip to accessible content, link"</li>
          <li><strong>Focus Management:</strong> Automatically focuses target when activated</li>
          <li><strong>Visual Feedback:</strong> High contrast colors and focus indicators</li>
        </ul>
      </div>

      <usa-skip-link
        .href=${args.href}
        .text=${args.text}
        .multiple=${args.multiple}
        @skip-link-click=${(e: CustomEvent) => {
          console.log('Skip link activated:', e.detail);
          // Announce to screen readers using insertAdjacentHTML
          const announcementHtml = `<div role="status" aria-live="polite" class="position-absolute left-neg-9">Navigated to ${e.detail.text}</div>`;
          document.body.insertAdjacentHTML('beforeend', announcementHtml);
          const announcement = document.body.lastElementChild as HTMLElement;
          setTimeout(() => announcement?.remove(), 1000);
        }}
      ></usa-skip-link>

      <div class="margin-top-4 padding-2 bg-base-lightest border-1px border-base-lighter radius-md">
        <p><em>Simulated page header and navigation content...</em></p>
        <p>This represents content that users might want to skip over.</p>
      </div>

      <section
        id="accessible-content"
        class="margin-top-2 padding-2 border-05 border-success radius-md"
      >
        <h2>Accessible Content</h2>
        <p>This content becomes focused when the skip link is activated.</p>
        <p>Notice how:</p>
        <ul>
          <li>The browser scrolls to this section</li>
          <li>This element receives keyboard focus</li>
          <li>Screen readers announce the focus change</li>
          <li>Users can continue navigation from here</li>
        </ul>
      </section>
    </div>
  `,
};

export const InteractiveDemo: Story = {
  args: {
    href: '#interactive-target',
    text: 'Skip to interactive content',
    multiple: false,
  },
  render: (args) => html`
    <div class="position-relative minh-card-lg">
      <div
        class="margin-bottom-2 padding-2 bg-warning-lighter border-1px border-warning-light radius-md"
      >
        <p>
          <strong>Try it out:</strong> Press Tab to focus the skip link, then Enter to activate!
        </p>
        <p>Watch the console for event details and observe the focus behavior.</p>
      </div>

      <usa-skip-link
        .href=${args.href}
        .text=${args.text}
        .multiple=${args.multiple}
        @skip-link-click=${(e: CustomEvent) => {
          console.log('Skip link event:', e.detail);
          alert(`Skip link activated!\nTarget: ${e.detail.href}\nText: ${e.detail.text}`);
        }}
      ></usa-skip-link>

      <div class="margin-top-4 padding-4 bg-base-lightest radius-md text-center">
        <p>📝 This content would normally be skipped...</p>
        <p>🧭 Header navigation, breadcrumbs, sidebar links, etc.</p>
      </div>

      <div
        id="interactive-target"
        class="margin-top-1 padding-1 border-3px border-primary border-dashed radius-md bg-primary-lighter"
      >
        <h2>🎯 Interactive Target Content</h2>
        <p>You've successfully skipped to the main content!</p>
        <p>This element now has focus and you can continue navigating from here.</p>

        <div class="margin-top-2 padding-2 bg-white radius-md">
          <h3>Interactive Elements:</h3>
          <button
            class="margin-right-05 padding-y-05 padding-x-1 border border-primary bg-primary text-white radius-md"
          >
            Button 1
          </button>
          <button
            class="margin-right-05 padding-y-05 padding-x-1 border border-success bg-success text-white radius-md"
          >
            Button 2
          </button>
          <input
            type="text"
            placeholder="Focus continues here..."
            class="margin-left-05 padding-05 border border-base-lighter radius-md"
          />
        </div>
      </div>
    </div>
  `,
};

// Edge cases and testing
export const CustomStyling: Story = {
  args: {
    href: '#styled-content',
    text: 'Skip to styled content',
    multiple: false,
  },
  render: (args) => html`
    <style>
      .custom-skip-demo usa-skip-link .usa-skip-link {
        background-color: #54278f !important;
        font-size: 1.125rem !important;
        padding: 1.25rem 2rem !important;
        border-radius: 0.5rem !important;
      }

      .custom-skip-demo usa-skip-link .usa-skip-link:focus {
        outline: 0.25rem solid #fd0 !important;
        outline-offset: 0.5rem !important;
        transform: translateY(0) scale(1.05) !important;
        transition: all 0.2s ease-in-out !important;
      }
    </style>

    <div class="custom-skip-demo" class="position-relative minh-card-lg">
      <p class="margin-bottom-2 padding-2 bg-base-lightest radius-md">
        <strong>Custom styled skip link example.</strong><br />
        The skip link uses custom colors, sizing, and focus effects while maintaining accessibility.
      </p>

      <usa-skip-link
        .href=${args.href}
        .text=${args.text}
        .multiple=${args.multiple}
      ></usa-skip-link>

      <div class="margin-top-4 padding-4 bg-base-lightest radius-md">
        <p>Content to skip over...</p>
      </div>

      <div
        id="styled-content"
        class="margin-top-2 padding-2 border-05 border-secondary-dark radius-md"
      >
        <h2>Styled Target Content</h2>
        <p>The skip link successfully navigated here with custom styling.</p>
      </div>
    </div>
  `,
};

export const ErrorHandling: Story = {
  args: {
    href: '#non-existent-target',
    text: 'Skip to non-existent target',
    multiple: false,
  },
  render: (args) => html`
    <div class="position-relative minh-card-lg">
      <div
        class="margin-bottom-2 padding-2 bg-error-lighter border-1px border-error-light radius-md"
      >
        <p><strong>Error handling demonstration:</strong></p>
        <p>
          This skip link points to a target that doesn't exist. The component handles this
          gracefully without throwing errors.
        </p>
      </div>

      <usa-skip-link
        .href=${args.href}
        .text=${args.text}
        .multiple=${args.multiple}
        @skip-link-click=${(e: CustomEvent) => {
          console.warn('Skip link attempted navigation to non-existent target:', e.detail);
          const announcementHtml = `<div role="alert" class="position-absolute left-neg-9">Target not found - navigation failed gracefully</div>`;
          document.body.insertAdjacentHTML('beforeend', announcementHtml);
          const announcement = document.body.lastElementChild as HTMLElement;
          setTimeout(() => announcement?.remove(), 3000);
        }}
      ></usa-skip-link>

      <div class="margin-top-4 padding-2 bg-base-lightest radius-md">
        <p>Notice that activating the skip link above:</p>
        <ul>
          <li>✅ Doesn't cause JavaScript errors</li>
          <li>✅ Still fires the custom event</li>
          <li>✅ Maintains component functionality</li>
          <li>⚠️ Doesn't change focus (target not found)</li>
        </ul>
      </div>
    </div>
  `,
};

export const RealWorldExample: Story = {
  args: {
    multiple: true,
  },
  render: (args) => html`
    <div class="position-relative">
      <style>
        .real-world-demo {
          font-family:
            'Source Sans Pro',
            -apple-system,
            BlinkMacSystemFont,
            'Segoe UI',
            Roboto,
            Helvetica,
            Arial,
            sans-serif;
          line-height: 1.5;
        }
        .real-world-demo .usa-banner {
          background: #f0f0f0;
          padding: 0.5rem 1rem;
          border-bottom: 1px solid #ddd;
          font-size: 0.875rem;
        }
        .real-world-demo .usa-header {
          background: #1a4480;
          color: white;
          padding: 1rem;
        }
        .real-world-demo .usa-nav {
          background: #f8f9fa;
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #ddd;
        }
        .real-world-demo .usa-nav ul {
          margin: 0;
          padding: 0;
          list-style: none;
          display: flex;
          gap: 2rem;
        }
        .real-world-demo .usa-main {
          display: flex;
          gap: 2rem;
          margin: 2rem 0;
        }
        .real-world-demo .usa-main main {
          flex: 3;
        }
        .real-world-demo .usa-main aside {
          flex: 1;
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 4px;
        }
        .real-world-demo .usa-footer {
          background: #565c65;
          color: white;
          padding: 2rem 1rem;
          margin-top: 2rem;
        }
      </style>

      <div class="real-world-demo">
        <!-- Skip Links -->
        <usa-skip-link
          href="#main-content"
          text="Skip to main content"
          .multiple=${args.multiple}
        ></usa-skip-link>

        <usa-skip-link
          href="#primary-nav"
          text="Skip to primary navigation"
          .multiple=${args.multiple}
        ></usa-skip-link>

        <usa-skip-link
          href="#search"
          text="Skip to search"
          .multiple=${args.multiple}
        ></usa-skip-link>

        <usa-skip-link
          href="#footer"
          text="Skip to footer"
          .multiple=${args.multiple}
        ></usa-skip-link>

        <!-- Page Structure -->
        <div class="usa-banner">🇺🇸 An official website of the United States government</div>

        <header class="usa-header">
          <h1 class="margin-0">U.S. Department of Example</h1>
        </header>

        <nav class="usa-nav" id="primary-nav">
          <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#services">Services</a></li>
            <li><a href="#resources">Resources</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </nav>

        <div class="usa-main">
          <main id="main-content">
            <h2>Welcome to Our Agency</h2>
            <p>
              We serve the American people by providing essential government services and
              information.
            </p>

            <h3>Latest News</h3>
            <ul>
              <li>New service portal launch - streamlined access to benefits</li>
              <li>Updated accessibility standards implementation</li>
              <li>Public comment period open for new regulations</li>
            </ul>

            <h3>How to Get Help</h3>
            <p>Contact us through multiple channels to receive the assistance you need:</p>
            <ul>
              <li>Online service portal</li>
              <li>Phone: 1-800-EXAMPLE</li>
              <li>In-person at local offices</li>
              <li>Email support</li>
            </ul>
          </main>

          <aside>
            <div id="search">
              <h3>Search</h3>
              <input
                type="search"
                placeholder="Search our site"
                class="width-full padding-1 margin-bottom-2 border-1px border-base-lighter radius-md"
              />
            </div>

            <h3>Quick Links</h3>
            <ul class="margin-0 padding-0 list-unstyled">
              <li class="margin-bottom-1"><a href="#benefits">Apply for Benefits</a></li>
              <li class="margin-bottom-1"><a href="#forms">Forms & Documents</a></li>
              <li class="margin-bottom-1"><a href="#faq">FAQs</a></li>
              <li class="margin-bottom-1"><a href="#help">Get Help</a></li>
            </ul>

            <h3>Popular Services</h3>
            <ul class="margin-0 padding-0 list-unstyled">
              <li class="margin-bottom-1">• Service Application</li>
              <li class="margin-bottom-1">• Status Check</li>
              <li class="margin-bottom-1">• Document Upload</li>
              <li class="margin-bottom-1">• Account Management</li>
            </ul>
          </aside>
        </div>

        <footer class="usa-footer" id="footer">
          <h2 class="margin-top-0">Contact Information</h2>
          <div class="display-grid grid-col grid-gap-2">
            <div>
              <h3>Headquarters</h3>
              <p>1600 Example Street<br />Washington, DC 20500<br />Phone: (202) 555-0100</p>
            </div>
            <div>
              <h3>Customer Service</h3>
              <p>Toll-free: 1-800-EXAMPLE<br />TTY: 1-800-555-0199<br />Hours: M-F 8am-8pm ET</p>
            </div>
            <div>
              <h3>Online</h3>
              <p>Email: info@example.gov<br />Website: www.example.gov<br />Social: @ExampleGov</p>
            </div>
          </div>
        </footer>
      </div>

      <div class="margin-top-2 padding-1 bg-info-lighter radius-md">
        <p>
          <strong>Instructions:</strong> Press Tab multiple times to see all skip links, then use
          Enter to navigate to different sections.
        </p>
        <p>
          <strong>Accessibility note:</strong> This demonstrates a complete government website skip
          navigation pattern.
        </p>
      </div>
    </div>
  `,
};
