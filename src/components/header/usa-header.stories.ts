import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './index.ts';
import type { USAHeader, NavItem } from './usa-header.js';

const meta: Meta<USAHeader> = {
  title: 'Navigation/Header',
  component: 'usa-header',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
The USWDS header provides a consistent navigation experience across websites. It includes logo/organization name, primary navigation, search functionality, and mobile-responsive design.

This web component implementation maintains full USWDS compatibility while providing a modern custom element API. It supports both basic and extended header layouts, hierarchical navigation with submenus, integrated search, and comprehensive accessibility features.
        `,
      },
    },
  },
  argTypes: {
    logoText: {
      control: 'text',
      description: 'Text displayed as the site logo/organization name',
    },
    logoHref: {
      control: 'text',
      description: 'URL for the logo link (defaults to "/")',
    },
    logoImageSrc: {
      control: 'text',
      description: 'Source URL for logo image (when provided, replaces text)',
    },
    logoImageAlt: {
      control: 'text',
      description: 'Alt text for logo image',
    },
    extended: {
      control: 'boolean',
      description: 'Use extended header layout for larger sites',
    },
    showSearch: {
      control: 'boolean',
      description: 'Display search functionality in header',
    },
    searchPlaceholder: {
      control: 'text',
      description: 'Placeholder text for search input',
    },
    navItems: {
      control: 'object',
      description: 'Array of navigation items with optional submenus or megamenus',
    },
    secondaryLinks: {
      control: 'object',
      description: 'Array of secondary links (call-to-action links like "Log in", "Sign up")',
    },
  },
};

export default meta;
type Story = StoryObj<USAHeader>;

// Sample navigation data for stories
const basicNavItems: NavItem[] = [
  { label: 'Home', href: '/', current: true },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Contact', href: '/contact' },
];

const complexNavItems: NavItem[] = [
  { label: 'Home', href: '/', current: true },
  {
    label: 'About',
    submenu: [
      { label: 'Our Mission', href: '/about/mission' },
      { label: 'Leadership', href: '/about/leadership' },
      { label: 'History', href: '/about/history' },
    ],
  },
  {
    label: 'Services',
    submenu: [
      { label: 'Digital Services', href: '/services/digital' },
      { label: 'Consulting', href: '/services/consulting' },
      { label: 'Training', href: '/services/training' },
    ],
  },
  { label: 'News', href: '/news' },
  { label: 'Contact', href: '/contact' },
];

export const Default: Story = {
  args: {
    logoText: 'Organization Name',
    logoHref: '/',
    extended: false,
    showSearch: false,
    navItems: basicNavItems,
  },
};

export const Extended: Story = {
  args: {
    logoText: 'Example Web Services Inc',
    logoHref: '/',
    extended: true,
    showSearch: true,
    searchPlaceholder: 'Search our site',
    navItems: complexNavItems,
  },
};

export const WithLogo: Story = {
  args: {
    logoImageSrc: '/img/circle-124.png',
    logoImageAlt: 'Company Logo',
    logoHref: '/',
    extended: false,
    showSearch: true,
    navItems: basicNavItems,
  },
};

export const ComplexNavigation: Story = {
  args: {
    logoText: 'Complex Organization',
    logoHref: '/',
    extended: true,
    showSearch: true,
    searchPlaceholder: 'Search',
    navItems: complexNavItems,
  },
};

export const BasicMinimal: Story = {
  args: {
    logoText: 'Simple Site',
    logoHref: '/',
    extended: false,
    showSearch: false,
    navItems: [],
  },
};

export const MobileMenuOpen: Story = {
  args: {
    logoText: 'Mobile Test',
    logoHref: '/',
    extended: false,
    showSearch: true,
    navItems: complexNavItems,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

export const LongOrganizationName: Story = {
  args: {
    logoText: 'Really Long Organization Names That Might Wrap in Headers',
    logoHref: '/',
    extended: true,
    showSearch: true,
    searchPlaceholder: 'Search our comprehensive site',
    navItems: complexNavItems,
  },
};

export const NoNavigation: Story = {
  args: {
    logoText: 'Simple Header',
    logoHref: '/',
    extended: false,
    showSearch: true,
    searchPlaceholder: 'Search',
    navItems: [],
  },
};

export const InteractiveDemo: Story = {
  args: {
    logoText: 'Interactive Demo',
    logoHref: '/',
    extended: false,
    showSearch: true,
    searchPlaceholder: 'Try searching...',
    navItems: complexNavItems,
  },
  render: (args) => html`
    <usa-header
      .logoText=${args.logoText}
      .logoHref=${args.logoHref}
      .logoImageSrc=${args.logoImageSrc}
      .logoImageAlt=${args.logoImageAlt}
      ?extended=${args.extended}
      ?showSearch=${args.showSearch}
      .searchPlaceholder=${args.searchPlaceholder}
      .navItems=${args.navItems}
      @nav-click=${(e: CustomEvent) => {
        console.log('Navigation clicked:', e.detail);
        alert(`Navigated to: ${e.detail.label} (${e.detail.href})`);
      }}
      @mobile-menu-toggle=${(e: CustomEvent) => {
        console.log('Mobile menu toggled:', e.detail);
      }}
      @header-search=${(e: CustomEvent) => {
        console.log('Search submitted:', e.detail);
        alert(`Search query: "${e.detail.query}"`);
      }}
    >
      <div slot="secondary">
        <span class="text-base-dark font-body-xs"> Custom secondary content slot </span>
      </div>
    </usa-header>

    <div class="margin-top-4 padding-2 bg-base-lightest radius-md">
      <h3 id="main-content">Main Content Area</h3>
      <p>
        This simulates the main content that follows the header. The skip navigation link targets
        this area.
      </p>
      <p>Try the following interactions:</p>
      <ul>
        <li>Click navigation items to see custom events</li>
        <li>Toggle the mobile menu button</li>
        <li>Submit a search query</li>
        <li>Use keyboard navigation (Tab, Enter, Space)</li>
        <li>Test with screen readers</li>
      </ul>
    </div>
  `,
};

// Business organization navigation data
const businessNavItems: NavItem[] = [
  { label: 'Home', href: '/', current: true },
  {
    label: 'About Us',
    submenu: [
      { label: 'Mission & Vision', href: '/about/mission' },
      { label: 'Leadership', href: '/about/leadership' },
      { label: 'Performance & Reports', href: '/about/reports' },
      { label: 'Company History', href: '/about/history' },
      { label: 'Strategic Plan', href: '/about/strategy' },
    ],
  },
  {
    label: 'Products & Services',
    submenu: [
      { label: 'Consumer Services', href: '/services/consumer' },
      { label: 'Business Solutions', href: '/services/business' },
      { label: 'Support Programs', href: '/services/support' },
      { label: 'Training Programs', href: '/services/training' },
      { label: 'Career Opportunities', href: '/services/careers' },
    ],
  },
  {
    label: 'Resources',
    submenu: [
      { label: 'Documentation', href: '/resources/docs' },
      { label: 'Data & Analytics', href: '/resources/data' },
      { label: 'Policies & Guidelines', href: '/resources/policies' },
      { label: 'Forms & Applications', href: '/resources/forms' },
      { label: 'Knowledge Base', href: '/resources/kb' },
    ],
  },
  { label: 'News & Updates', href: '/news' },
  { label: 'Contact Us', href: '/contact' },
];

/* const ecommerceNavItems: NavItem[] = [
  { label: 'Products', href: '/products', current: true },
  {
    label: 'Categories',
    submenu: [
      { label: 'Electronics', href: '/categories/electronics' },
      { label: 'Clothing', href: '/categories/clothing' },
      { label: 'Home & Garden', href: '/categories/home' },
      { label: 'Sports & Outdoors', href: '/categories/sports' }
    ]
  },
  {
    label: 'Customer Service',
    submenu: [
      { label: 'Order Status', href: '/service/orders' },
      { label: 'Returns & Exchanges', href: '/service/returns' },
      { label: 'Shipping Info', href: '/service/shipping' },
      { label: 'Customer Support', href: '/service/support' }
    ]
  },
  { label: 'Special Offers', href: '/offers' },
  { label: 'My Account', href: '/account' }
]; */

export const BusinessOrganization: Story = {
  name: 'Business Organization',
  args: {
    logoText: 'Example Business Corporation',
    logoHref: '/',
    extended: true,
    showSearch: true,
    searchPlaceholder: 'Search our services',
    navItems: businessNavItems,
  },
};

export const TechnologyCompany: Story = {
  name: 'Technology Company',
  args: {
    logoText: 'TechCorp Solutions',
    logoImageSrc: '/img/circle-124.png',
    logoImageAlt: 'TechCorp Solutions',
    logoHref: '/',
    extended: true,
    showSearch: true,
    searchPlaceholder: 'Search TechCorp',
    navItems: [
      { label: 'Home', href: '/', current: true },
      {
        label: 'Solutions',
        submenu: [
          { label: 'Cloud Services', href: '/solutions/cloud' },
          { label: 'Software Development', href: '/solutions/software' },
          { label: 'Data Analytics', href: '/solutions/analytics' },
          { label: 'Security Solutions', href: '/solutions/security' },
          { label: 'AI & Machine Learning', href: '/solutions/ai' },
        ],
      },
      {
        label: 'Industries',
        submenu: [
          { label: 'Healthcare', href: '/industries/healthcare' },
          { label: 'Financial Services', href: '/industries/finance' },
          { label: 'Education', href: '/industries/education' },
          { label: 'Manufacturing', href: '/industries/manufacturing' },
          { label: 'Retail', href: '/industries/retail' },
        ],
      },
      { label: 'Resources', href: '/resources' },
      { label: 'Careers', href: '/careers' },
    ],
  },
};

export const HealthcareOrganization: Story = {
  name: 'Healthcare Organization',
  args: {
    logoText: 'Regional Health Network',
    logoHref: '/',
    extended: true,
    showSearch: true,
    searchPlaceholder: 'Search health resources',
    navItems: [
      { label: 'Home', href: '/', current: true },
      {
        label: 'Services',
        submenu: [
          { label: 'Primary Care', href: '/services/primary' },
          { label: 'Specialty Care', href: '/services/specialty' },
          { label: 'Emergency Services', href: '/services/emergency' },
          { label: 'Preventive Care', href: '/services/preventive' },
        ],
      },
      {
        label: 'Patient Resources',
        submenu: [
          { label: 'Appointment Scheduling', href: '/patients/appointments' },
          { label: 'Medical Records', href: '/patients/records' },
          { label: 'Insurance Information', href: '/patients/insurance' },
        ],
      },
      { label: 'Locations', href: '/locations' },
      { label: 'About Us', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ],
  },
};

export const MultilingualOrganization: Story = {
  name: 'Multilingual Organization',
  args: {
    logoText: 'International Services Corp',
    logoHref: '/',
    extended: true,
    showSearch: true,
    searchPlaceholder: 'Search our services',
    navItems: [
      { label: 'Home', href: '/', current: true },
      {
        label: 'Services',
        submenu: [
          { label: 'Translation Services', href: '/services/translation' },
          { label: 'Cultural Consulting', href: '/services/consulting' },
          { label: 'Language Training', href: '/services/training' },
          { label: 'Document Services', href: '/services/documents' },
        ],
      },
      {
        label: 'Support',
        submenu: [
          { label: 'Client Portal', href: '/support/portal' },
          { label: 'Project Status', href: '/support/status' },
          { label: 'Service Requests', href: '/support/requests' },
        ],
      },
      { label: 'Languages', href: '/languages' },
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  render: (args) => html`
    <usa-header
      .logoText=${args.logoText}
      .logoHref=${args.logoHref}
      ?extended=${args.extended}
      ?showSearch=${args.showSearch}
      .searchPlaceholder=${args.searchPlaceholder}
      .navItems=${args.navItems}
    >
      <div slot="secondary">
        <usa-language-selector
          variant="dropdown"
          .buttonText=${'Languages'}
          .currentLanguage=${'en'}
          .languages=${[
            { code: 'en', name: 'English', nativeName: 'English' },
            { code: 'es', name: 'Spanish', nativeName: 'Español' },
            { code: 'zh', name: 'Chinese', nativeName: '中文' },
            { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
            { code: 'ko', name: 'Korean', nativeName: '한국어' },
          ]}
          @language-select=${(e: CustomEvent) => {
            console.log('Language changed:', e.detail);
          }}
        ></usa-language-selector>
      </div>
    </usa-header>
  `,
};

export const AccessibilityShowcase: Story = {
  name: 'Accessibility Features Demo',
  args: {
    logoText: 'Accessibility Solutions Inc',
    logoHref: '/',
    extended: false,
    showSearch: true,
    searchPlaceholder: 'Search accessibility resources',
    navItems: [
      { label: 'Home', href: '/', current: true },
      { label: 'Accessibility Services', href: '/services' },
      { label: 'WCAG Guidelines', href: '/wcag' },
      { label: 'Testing & Auditing', href: '/testing' },
      { label: 'Training & Resources', href: '/training' },
    ],
  },
  render: (args) => html`
    <usa-header
      .logoText=${args.logoText}
      .logoHref=${args.logoHref}
      ?extended=${args.extended}
      ?showSearch=${args.showSearch}
      .searchPlaceholder=${args.searchPlaceholder}
      .navItems=${args.navItems}
    ></usa-header>

    <div
      class="margin-top-2 padding-205 bg-base-lightest border-left-05 border-primary"
    >
      <h3 id="main-content">WCAG 2.1 AA Compliance Features</h3>
      <div class="display-grid grid-row grid-gap-2 margin-top-1">
        <div>
          <h4>Keyboard Navigation</h4>
          <ul>
            <li><kbd>Tab</kbd> - Navigate through interactive elements</li>
            <li><kbd>Enter</kbd> / <kbd>Space</kbd> - Activate buttons and links</li>
            <li><kbd>Escape</kbd> - Close menus (future enhancement)</li>
            <li><kbd>Arrow keys</kbd> - Navigate within menus (future enhancement)</li>
          </ul>

          <h4>Screen Reader Features</h4>
          <ul>
            <li>Skip navigation link for efficient browsing</li>
            <li>Proper heading structure and landmarks</li>
            <li>Descriptive link text and button labels</li>
            <li>ARIA attributes for menu states and relationships</li>
          </ul>
        </div>
        <div>
          <h4>ARIA Attributes</h4>
          <ul>
            <li><code>role="banner"</code> - Header landmark</li>
            <li><code>aria-label="Primary navigation"</code> - Navigation region</li>
            <li><code>aria-expanded</code> - Submenu and mobile menu state</li>
            <li><code>aria-current="page"</code> - Current page indication</li>
            <li><code>aria-controls</code> - Menu button associations</li>
          </ul>

          <h4>Visual Design</h4>
          <ul>
            <li>High contrast ratios meeting WCAG AA standards</li>
            <li>Focus indicators visible and consistent</li>
            <li>Text alternatives for all images and icons</li>
            <li>Responsive design for mobile accessibility</li>
          </ul>
        </div>
      </div>

      <div class="margin-top-2 padding-1 bg-white radius-md">
        <h4>Testing Instructions</h4>
        <p>Try these accessibility features:</p>
        <ol>
          <li>Use <kbd>Tab</kbd> to navigate through all interactive elements</li>
          <li>Try the skip navigation link (press <kbd>Tab</kbd> first, then <kbd>Enter</kbd>)</li>
          <li>Use <kbd>Enter</kbd> and <kbd>Space</kbd> to activate navigation items</li>
          <li>Test with a screen reader (NVDA, JAWS, VoiceOver)</li>
          <li>Check contrast and readability at different zoom levels</li>
        </ol>
      </div>
    </div>
  `,
};

// NEW FEATURE DEMOS

export const WithSecondaryLinks: Story = {
  name: 'With Secondary Links (Call to Action)',
  args: {
    logoText: 'Example Organization',
    logoHref: '/',
    extended: true,
    showSearch: true,
    searchPlaceholder: 'Search',
    navItems: complexNavItems,
    secondaryLinks: [
      { label: 'Log in', href: '/login' },
      { label: 'Sign up', href: '/signup' },
    ],
  },
};

export const WithMegamenu: Story = {
  name: 'With Megamenu (Multi-column Dropdown)',
  args: {
    logoText: 'Large Organization',
    logoHref: '/',
    extended: true,
    showSearch: true,
    searchPlaceholder: 'Search our site',
    navItems: [
      { label: 'Home', href: '/', current: true },
      {
        label: 'Products & Services',
        megamenu: [
          {
            links: [
              { label: 'Cloud Solutions', href: '/products/cloud' },
              { label: 'Data Analytics', href: '/products/analytics' },
              { label: 'Security Services', href: '/products/security' },
              { label: 'Consulting', href: '/products/consulting' },
            ],
          },
          {
            links: [
              { label: 'Training Programs', href: '/services/training' },
              { label: 'Technical Support', href: '/services/support' },
              { label: 'Professional Services', href: '/services/professional' },
              { label: 'Managed Services', href: '/services/managed' },
            ],
          },
          {
            links: [
              { label: 'Industry Solutions', href: '/industries' },
              { label: 'Case Studies', href: '/case-studies' },
              { label: 'Partners', href: '/partners' },
              { label: 'Resources', href: '/resources' },
            ],
          },
        ],
      },
      {
        label: 'Company',
        submenu: [
          { label: 'About Us', href: '/about' },
          { label: 'Careers', href: '/careers' },
          { label: 'News', href: '/news' },
        ],
      },
      { label: 'Contact', href: '/contact' },
    ],
    secondaryLinks: [
      { label: 'Support', href: '/support' },
      { label: 'Log in', href: '/login' },
    ],
  },
};

export const MegamenuShowcase: Story = {
  name: 'Megamenu Showcase (Large Navigation)',
  args: {
    logoText: 'Enterprise Solutions Inc',
    logoHref: '/',
    extended: true,
    showSearch: true,
    searchPlaceholder: 'Search our services',
    navItems: [
      { label: 'Home', href: '/', current: true },
      {
        label: 'Solutions',
        megamenu: [
          {
            links: [
              { label: 'Cloud Infrastructure', href: '/solutions/cloud' },
              { label: 'Data Management', href: '/solutions/data' },
              { label: 'AI & Machine Learning', href: '/solutions/ai' },
              { label: 'Cybersecurity', href: '/solutions/security' },
              { label: 'DevOps Tools', href: '/solutions/devops' },
            ],
          },
          {
            links: [
              { label: 'Enterprise Software', href: '/solutions/enterprise' },
              { label: 'Mobile Development', href: '/solutions/mobile' },
              { label: 'Web Applications', href: '/solutions/web' },
              { label: 'API Integration', href: '/solutions/api' },
              { label: 'Legacy Modernization', href: '/solutions/legacy' },
            ],
          },
          {
            links: [
              { label: 'Consulting Services', href: '/solutions/consulting' },
              { label: 'Training & Education', href: '/solutions/training' },
              { label: 'Support & Maintenance', href: '/solutions/support' },
              { label: 'Custom Development', href: '/solutions/custom' },
              { label: 'Strategic Planning', href: '/solutions/strategy' },
            ],
          },
        ],
      },
      {
        label: 'Industries',
        megamenu: [
          {
            links: [
              { label: 'Healthcare', href: '/industries/healthcare' },
              { label: 'Financial Services', href: '/industries/finance' },
              { label: 'Education', href: '/industries/education' },
              { label: 'Government', href: '/industries/government' },
            ],
          },
          {
            links: [
              { label: 'Retail & E-commerce', href: '/industries/retail' },
              { label: 'Manufacturing', href: '/industries/manufacturing' },
              { label: 'Transportation', href: '/industries/transportation' },
              { label: 'Energy & Utilities', href: '/industries/energy' },
            ],
          },
        ],
      },
      {
        label: 'Resources',
        submenu: [
          { label: 'Documentation', href: '/resources/docs' },
          { label: 'Blog', href: '/resources/blog' },
          { label: 'Case Studies', href: '/resources/cases' },
          { label: 'Webinars', href: '/resources/webinars' },
        ],
      },
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ],
    secondaryLinks: [
      { label: 'Support Portal', href: '/support' },
      { label: 'Customer Login', href: '/login' },
    ],
  },
};
