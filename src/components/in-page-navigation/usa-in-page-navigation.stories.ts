import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './index.ts';
import type { USAInPageNavigation } from './usa-in-page-navigation.js';

// Component now uses USWDS auto-generation - no manual items needed!

const meta: Meta<USAInPageNavigation> = {
  title: 'Components/In-Page Navigation',
  component: 'usa-in-page-navigation',
  parameters: {
    layout: 'fullscreen', // Changed from 'padded' to enable sticky positioning in scroll container
    viewport: {
      defaultViewport: 'responsive', // Ensures viewport is wide enough for tablet+ breakpoint
    },
    chromatic: {
      viewports: [1200], // Force wide viewport for visual regression testing
    },
    docs: {
      description: {
        component: `
The USA In-Page Navigation component provides a table of contents style navigation for long pages with automatic scroll tracking and smooth scrolling to sections. It improves user experience on lengthy documents and comprehensive guides by allowing quick navigation between sections.

**True USWDS Implementation**: This component uses the authentic USWDS approach where an empty \`<aside>\` element is automatically populated by USWDS JavaScript based on page headings. This ensures 100% visual consistency with the official USWDS design system.

---

## ⚠️ Important: Sticky Positioning in Storybook

**The navigation uses USWDS's native \`position: sticky\` CSS**, which works correctly in production environments. However, due to browser limitations with sticky positioning in nested iframe scrolling contexts, **the sticky behavior may not display properly in this Storybook preview**.

### Why This Happens

Storybook renders stories inside an iframe, and \`position: sticky\` has known compatibility issues with iframe scrolling contexts. This is a limitation of the browser's rendering engine, not the component itself.

### Testing Sticky Behavior

To test the full sticky positioning functionality, use one of these standalone test files:

- **\`test-in-page-nav-sticky.html\`** - Basic sticky navigation test
- **\`test-in-page-nav-sticky-complex.html\`** - Complex layout with multiple sections
- **\`test-in-page-nav-sticky-with-header.html\`** - Test with fixed header and scroll offset

Open any of these files directly in your browser to see the navigation stick to the viewport as you scroll.

### Production Usage

**The component will work perfectly in production** when users implement it in their applications. The Storybook limitation is purely a preview environment issue and does not affect real-world usage.
        `,
      },
    },
  },
  args: {
    title: 'On this page',
    titleHeadingLevel: '4',
    smoothScroll: true,
    scrollOffset: 0,
    threshold: '0.5',
    rootMargin: '0px 0px -50% 0px',
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'Title displayed at the top of the navigation',
    },
    titleHeadingLevel: {
      control: 'select',
      options: ['2', '3', '4', '5', '6'],
      description: 'Heading level for the navigation title',
    },
    rootSelector: {
      control: 'text',
      description:
        'CSS selector for the container to scan for headings (data-main-content-selector)',
    },
    headingSelector: {
      control: 'text',
      description: 'CSS selector for headings to include in navigation (data-heading-elements)',
    },
    smoothScroll: {
      control: 'boolean',
      description: 'Enable smooth scrolling when clicking navigation links',
    },
    scrollOffset: {
      control: 'number',
      description: 'Offset in pixels when scrolling to sections',
    },
    threshold: {
      control: 'text',
      description: 'Intersection observer threshold (0.0 to 1.0)',
    },
    rootMargin: {
      control: 'text',
      description: 'Intersection observer root margin for better middle section detection',
    },
  },
};

export default meta;
type Story = StoryObj<USAInPageNavigation>;

// Helper function to create content sections with enough height to scroll
const createContentSections = () => html`
  <section class="margin-bottom-6">
    <h2>Overview</h2>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
      labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
      laboris nisi ut aliquip ex ea commodo consequat.
    </p>
    <p>
      Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
      pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
      mollit anim id est laborum.
    </p>
    <p>
      Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque
      laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi
      architecto beatae vitae dicta sunt explicabo.
    </p>
  </section>
  <section class="margin-bottom-6">
    <h2>Eligibility Requirements</h2>
    <p>
      Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
      commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
      dolore eu fugiat nulla pariatur.
    </p>
    <h3>Basic Requirements</h3>
    <p>
      Details about basic requirements for eligibility. Nemo enim ipsam voluptatem quia voluptas sit
      aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem
      sequi nesciunt.
    </p>
    <p>
      Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit,
      sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat
      voluptatem.
    </p>
    <h3>Required Documentation</h3>
    <p>
      Information about required documentation. Ut enim ad minima veniam, quis nostrum
      exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur.
    </p>
    <p>
      Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae
      consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur.
    </p>
  </section>
  <section class="margin-bottom-6">
    <h2>Application Process</h2>
    <p>
      Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
      pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
      mollit anim id est laborum.
    </p>
    <p>
      At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium
      voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati
      cupiditate non provident.
    </p>
    <p>
      Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.
      Et harum quidem rerum facilis est et expedita distinctio.
    </p>
  </section>
  <section class="margin-bottom-6">
    <h2>After You Apply</h2>
    <p>
      Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim
      id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium
      doloremque laudantium.
    </p>
    <h3>Review Timeline</h3>
    <p>
      Information about the review timeline process. Nam libero tempore, cum soluta nobis est
      eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis
      voluptas assumenda est, omnis dolor repellendus.
    </p>
    <p>
      Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut
      et voluptates repudiandae sint et molestiae non recusandae.
    </p>
    <h3>Status Updates</h3>
    <p>
      Details about how you'll receive status updates. Itaque earum rerum hic tenetur a sapiente
      delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus
      asperiores repellat.
    </p>
    <p>
      Hanc ego cum teneam sententiam, quid est cur verear ne ad eam non possim accommodare Torquatos
      nostros? quos tu paulo ante cum memoriter, tum etiam erga nos amice et benivole collegisti.
    </p>
  </section>
  <section class="margin-bottom-6">
    <h2>Contact Information</h2>
    <p>
      Contact details and support information for additional assistance. On the other hand, we
      denounce with righteous indignation and dislike men who are so beguiled and demoralized by the
      charms of pleasure of the moment.
    </p>
    <p>
      So blinded by desire, that they cannot foresee the pain and trouble that are bound to ensue;
      and equal blame belongs to those who fail in their duty through weakness of will, which is the
      same as saying through shrinking from toil and pain.
    </p>
    <p>
      These cases are perfectly simple and easy to distinguish. In a free hour, when our power of
      choice is untrammelled and when nothing prevents our being able to do what we like best, every
      pleasure is to be welcomed and every pain avoided.
    </p>
  </section>
`;

// Basic Stories
export const Default: Story = {
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: `Default in-page navigation with hierarchical navigation items including nested sections. Uses USWDS container structure with navigation on the left.

**Note about Sticky Positioning:** The component uses USWDS's native \`position: sticky\` CSS, which works correctly in production environments. However, sticky positioning may not function properly in Storybook's iframe preview due to browser limitations with sticky elements in nested scrolling contexts. To test the full sticky behavior, open the standalone test file: \`test-in-page-nav-sticky.html\` in your browser.`,
      },
    },
  },

  render: (args) => html`
    <div class="grid-container padding-4">
      <div class="grid-row grid-gap">
        <usa-in-page-navigation
          class="desktop:grid-col-4"
          .title="${args.title}"
          .titleHeadingLevel="${args.titleHeadingLevel}"
          .rootSelector="${args.rootSelector || '#main-content'}"
          .headingSelector="${args.headingSelector || 'h2 h3'}"
          ?smoothScroll=${args.smoothScroll}
          .scrollOffset="${args.scrollOffset}"
          .threshold="${args.threshold}"
          .rootMargin="${args.rootMargin}"
          @section-change="${(e: CustomEvent) => console.log('Section changed:', e.detail)}"
          @nav-click="${(e: CustomEvent) => console.log('Navigation clicked:', e.detail)}"
        ></usa-in-page-navigation>
        <main id="main-content" class="usa-prose desktop:grid-col-8">${createContentSections()}</main>
      </div>
    </div>
  `,
};

export const SimpleNavigation: Story = {
  render: (args) => html`
    <div class="grid-container padding-4">
      <div class="grid-row grid-gap">
        <usa-in-page-navigation
          class="desktop:grid-col-4"
          .title="${args.title}"
          .titleHeadingLevel="${args.titleHeadingLevel}"
          .rootSelector="${args.rootSelector || '#main-content-simple'}"
          .headingSelector="${args.headingSelector || 'h2'}"
          ?smoothScroll=${args.smoothScroll}
          .scrollOffset="${args.scrollOffset}"
          @section-change="${(e: CustomEvent) => console.log('Section changed:', e.detail)}"
          @nav-click="${(e: CustomEvent) => console.log('Navigation clicked:', e.detail)}"
        ></usa-in-page-navigation>
        <main id="main-content-simple" class="usa-prose desktop:grid-col-8">
          <section class="margin-bottom-5 padding-top-4">
            <h2>Introduction</h2>
            <p>Welcome to our simple guide. This section introduces the main concepts.</p>
          </section>
          <section class="margin-bottom-5 padding-top-4">
            <h2>Process</h2>
            <p>Here we explain the step-by-step process you need to follow.</p>
          </section>
          <section class="margin-bottom-5 padding-top-4">
            <h2>Requirements</h2>
            <p>This section outlines all the requirements you must meet.</p>
          </section>
          <section class="margin-bottom-5 padding-top-4">
            <h2>Conclusion</h2>
            <p>Summary and final thoughts about the topic.</p>
          </section>
        </main>
      </div>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Simple navigation with flat structure - no nested items.',
      },
    },
  },
};

export const CustomTitle: Story = {
  args: {
    title: 'Table of Contents',
    titleHeadingLevel: '3',
  },
  render: (args) => html`
    <div class="grid-container padding-4">
      <div class="grid-row grid-gap">
        <usa-in-page-navigation
          class="desktop:grid-col-4"
          .title="${args.title}"
          .titleHeadingLevel="${args.titleHeadingLevel}"
          .rootSelector="${args.rootSelector || '#main-content-custom'}"
          .headingSelector="${args.headingSelector || 'h2 h3'}"
          ?smoothScroll=${args.smoothScroll}
          .scrollOffset="${args.scrollOffset}"
          .threshold="${args.threshold}"
          .rootMargin="${args.rootMargin}"
        ></usa-in-page-navigation>
        <main id="main-content-custom" class="usa-prose desktop:grid-col-8">
          <section class="margin-bottom-5 padding-top-4">
            <h2>Overview</h2>
            <p>Custom navigation title and heading level example.</p>
          </section>
          <section class="margin-bottom-5 padding-top-4">
            <h2>Eligibility Requirements</h2>
            <p>Information about eligibility requirements.</p>
          </section>
          <section class="margin-bottom-5 padding-top-4">
            <h2>Application Process</h2>
            <p>Step-by-step application process.</p>
          </section>
        </main>
      </div>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Navigation with custom title and heading level (h3 instead of default h4).',
      },
    },
  },
};

// Interactive Examples
export const AutoGeneration: Story = {
  args: {
    title: 'Auto-Generated Navigation',
    rootSelector: '#main-content-auto',
    headingSelector: 'h2 h3',
  },
  render: (args) => html`
    <div class="grid-container padding-4">
      <div class="grid-row grid-gap">
        <usa-in-page-navigation
          class="desktop:grid-col-4"
          .title="${args.title}"
          .titleHeadingLevel="${args.titleHeadingLevel}"
          .rootSelector="${args.rootSelector}"
          .headingSelector="${args.headingSelector}"
          ?smoothScroll=${args.smoothScroll}
          .scrollOffset="${args.scrollOffset}"
        ></usa-in-page-navigation>
        <main id="main-content-auto" class="usa-prose desktop:grid-col-8">
          <section class="margin-bottom-5 padding-top-4">
            <h2>Automatically Detected Section</h2>
            <p>This section was automatically detected by the in-page navigation component.</p>

            <h3>Subsection 1</h3>
            <p>This is a subsection that was also automatically detected.</p>
          </section>

          <section class="margin-bottom-5 padding-top-4">
            <h2>Another Main Section</h2>
            <p>The component scans for h2 and h3 elements and creates navigation items.</p>

            <h3>Subsection 2</h3>
            <p>Nested navigation items are created for h3 elements under h2 elements.</p>
          </section>

          <section class="margin-bottom-5 padding-top-4">
            <h2>Section Without ID</h2>
            <p>The component automatically generates IDs for headings that don't have them.</p>
          </section>

          <div class="margin-top-4 padding-2 bg-base-lightest radius-md">
            <h4>Auto-Generation Features:</h4>
            <ul>
              <li>Scans specified container for headings</li>
              <li>Generates IDs for headings without them</li>
              <li>Creates hierarchical navigation structure</li>
              <li>Updates automatically when content changes</li>
            </ul>
          </div>
        </main>
      </div>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story:
          'Automatically generates navigation from page headings. The component scans for h2 and h3 elements and creates the navigation structure.',
      },
    },
  },
};

export const WithEventHandlers: Story = {
  args: {
    title: 'Interactive Navigation',
  },
  render: (args) => html`
    <div class="grid-container padding-4">
      <div class="grid-row grid-gap">
        <usa-in-page-navigation
          class="desktop:grid-col-4"
          .title="${args.title}"
          .titleHeadingLevel="${args.titleHeadingLevel}"
          .rootSelector="${args.rootSelector || '#main-content-events'}"
          .headingSelector="${args.headingSelector || 'h2 h3'}"
          ?smoothScroll=${args.smoothScroll}
          .scrollOffset="${args.scrollOffset}"
          .threshold="${args.threshold}"
          .rootMargin="${args.rootMargin}"
          @section-change="${(e: CustomEvent) => {
            console.log('Section changed:', e.detail);
            const status = document.getElementById('status');
            if (status) {
              status.textContent = `Active section: ${e.detail.activeSection}`;
            }
          }}"
          @nav-click="${(e: CustomEvent) => {
            console.log('Navigation clicked:', e.detail);
            const clickLog = document.getElementById('click-log');
            if (clickLog) {
              clickLog.textContent = `Last clicked: ${e.detail.item.text}`;
            }
          }}"
        ></usa-in-page-navigation>
        <main id="main-content-events" class="usa-prose desktop:grid-col-8">
          <section class="margin-bottom-5 padding-top-4">
            <h2>Section 1</h2>
            <p>
              This is the first section. Click navigation items or scroll to see events in action.
            </p>
            <p>
              The component automatically tracks which section is currently visible and updates the
              active state accordingly.
            </p>
          </section>

          <section class="margin-bottom-5 padding-top-4">
            <h2>Section 2</h2>
            <p>
              This is the second section. As you scroll, the navigation will automatically highlight
              the current section.
            </p>
            <p>
              Events are emitted when the active section changes or when navigation items are clicked.
            </p>
          </section>

          <section class="margin-bottom-5 padding-top-4">
            <h2>Section 3</h2>
            <p>
              This is the third section. The intersection observer API is used to track section
              visibility.
            </p>
            <p>
              Both section-change and nav-click events provide detailed information about the
              interaction.
            </p>
          </section>

          <div class="margin-top-4 padding-2 bg-base-lightest radius-md font-body-xs">
            <h4 class="margin-top-0">Event Status</h4>
            <p id="status">Active section: none</p>
            <p id="click-log">Last clicked: none</p>
            <p class="margin-bottom-0 text-base-dark">
              Check console for detailed event information.
            </p>
          </div>
        </main>
      </div>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story:
          'Interactive example showing section-change and nav-click event handling. Check browser console for detailed event information.',
      },
    },
  },
};

export const CustomScrollBehavior: Story = {
  args: {
    title: 'Custom Scroll Settings',
    scrollOffset: 100, // Offset for fixed header
    smoothScroll: true,
  },
  render: (args) => html`
    <div>
      <div
        class="position-fixed top-0 left-0 right-0 bg-primary-dark text-white display-flex flex-align-center flex-justify-center z-top height-card"
      >
        <h3 class="margin-0 text-white">Fixed Header (80px height)</h3>
      </div>

      <div class="grid-container margin-top-8 padding-4">
        <div class="grid-row grid-gap">
          <usa-in-page-navigation
            class="desktop:grid-col-4"
            .title="${args.title}"
            .titleHeadingLevel="${args.titleHeadingLevel}"
            .rootSelector="${args.rootSelector || '#main-content-scroll'}"
            .headingSelector="${args.headingSelector || 'h2 h3'}"
            ?smoothScroll=${args.smoothScroll}
            .scrollOffset="${args.scrollOffset}"
          ></usa-in-page-navigation>
          <main id="main-content-scroll" class="usa-prose desktop:grid-col-8">
            <section class="margin-bottom-6 padding-top-4">
              <h2>Section 1</h2>
              <p>
                This section demonstrates custom scroll offset behavior to account for the fixed
                header.
              </p>
              <p>
                When you click a navigation link, the page scrolls to the section with a 100px offset,
                ensuring the content isn't hidden behind the fixed header.
              </p>
            </section>

            <section class="margin-bottom-6 padding-top-4">
              <h2>Section 2</h2>
              <p>
                The scroll offset setting is particularly useful for sites with fixed navigation
                headers.
              </p>
              <p>
                You can adjust the offset value to match your specific header height and desired
                spacing.
              </p>
            </section>

            <section class="margin-bottom-6 padding-top-4">
              <h2>Section 3</h2>
              <p>
                Smooth scrolling provides a better user experience by animating the scroll transition.
              </p>
              <p>This can be disabled if you prefer instant scrolling to sections.</p>
            </section>

            <div class="margin-top-4 padding-2 bg-base-lightest radius-md font-body-xs">
              <h4 class="margin-top-0">Scroll Settings</h4>
              <p><strong>Offset:</strong> 100px</p>
              <p><strong>Smooth Scroll:</strong> Enabled</p>
              <p class="margin-bottom-0">Accounts for fixed header height plus margin.</p>
            </div>
          </main>
        </div>
      </div>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates custom scroll offset and smooth scrolling behavior, useful for sites with fixed headers.',
      },
    },
  },
};
