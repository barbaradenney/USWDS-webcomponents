import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './index.ts';
import type { USACollection } from './usa-collection.js';

const meta: Meta<USACollection> = {
  title: 'Components/Collection',
  component: 'usa-collection',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
The Collection component displays a list of items with consistent USWDS formatting including titles, descriptions, dates, authors, tags, and media. Perfect for news articles, blog posts, resources, and other content collections.

Features:
- Official USWDS HTML structure and CSS classes
- Rich content support with media, tags, and metadata
- Proper accessibility with ARIA labels and semantic HTML
- Government-ready content patterns
        `,
      },
    },
  },
  argTypes: {
    items: {
      control: 'object',
      description: 'Array of collection items to display with proper USWDS structure',
    },
  },
};

export default meta;
type Story = StoryObj<USACollection>;

// Sample data for stories
const sampleItems = [
  {
    id: 'item-1',
    title: "Gears of Government President's Award winners",
    description:
      "Today, the Administration announces the winners of the Gears of Government President's Award. This program recognizes the contributions of individuals and teams across the federal workforce who make a profound difference in the lives of the American people.",
    href: 'https://trumpadministration.archives.performance.gov/presidents-winners-press-release/',
    author: 'Sondra Ainsworth and Constance Lu',
    date: 'September 30, 2020',
    tags: ['New', 'PMA', 'OMB'],
  },
  {
    id: 'item-2',
    title: 'Women-owned small business dashboard',
    description:
      "In honor of National Women's Small Business Month, we've partnered with SBA's Office of Government Contracting and Business Development and Office of Program Performance, Analysis, and Evaluation to highlight the Women-Owned Small Businesses (WOSBs) data dashboard!",
    href: 'https://trumpadministration.archives.performance.gov/sba-wosb-dashboard/',
    author: 'Constance Lu',
    date: 'September 30, 2020',
    tags: ['SBA'],
  },
  {
    id: 'item-3',
    title: 'September 2020 updates show progress on cross-agency and agency priority goals',
    description:
      'Today, we published progress updates for both Cross-Agency Priority (CAP) Goals and Agency Priority Goals (APGs) for the third quarter of FY2020. These updates highlight recent milestones and accomplishments as well as related initiatives that support progress towards a more modern and effective government.',
    href: 'https://trumpadministration.archives.performance.gov/September-2020-Updates-Show-Progress/',
    author: 'Eric L. Miller',
    date: 'September 17, 2020',
    tags: ['Quarterly update', 'CAP goal', 'APG', 'PMA', 'Success story'],
  },
];

const mediaItems = [
  {
    id: 'media-1',
    title: "Gears of Government President's Award winners",
    description:
      "Today, the Administration announces the winners of the Gears of Government President's Award. This program recognizes the contributions of individuals and teams across the federal workforce who make a profound difference in the lives of the American people.",
    href: 'https://trumpadministration.archives.performance.gov/presidents-winners-press-release/',
    author: 'Sondra Ainsworth and Constance Lu',
    date: 'September 30, 2020',
    tags: ['New', 'PMA', 'OMB'],
    media: {
      src: 'https://trumpadministration.archives.performance.gov/img/GoG/GoG-logo.png',
      alt: "Gears of Government Awards - President's Award",
    },
  },
  {
    id: 'media-2',
    title: 'Women-owned small business dashboard',
    description:
      "In honor of National Women's Small Business Month, we've partnered with SBA's Office of Government Contracting and Business Development and Office of Program Performance, Analysis, and Evaluation to highlight the Women-Owned Small Businesses (WOSBs) data dashboard!",
    href: 'https://trumpadministration.archives.performance.gov/sba-wosb-dashboard/',
    author: 'Constance Lu',
    date: 'September 30, 2020',
    tags: ['SBA'],
    media: {
      src: 'https://www.performance.gov/img/blog/wosb1.jpg',
      alt: 'Woman Owned Small Business Federal Contracts',
    },
  },
];

const headersOnlyItems = [
  {
    id: 'header-1',
    title: 'First Amendment',
    href: 'https://constitution.congress.gov/constitution/amendment-1/',
  },
  {
    id: 'header-2',
    title: 'Second Amendment',
    href: 'https://constitution.congress.gov/constitution/amendment-2/',
  },
  {
    id: 'header-3',
    title: 'Third Amendment',
    href: 'https://constitution.congress.gov/constitution/amendment-3/',
  },
];

export const Default: Story = {
  args: {
    items: sampleItems,
  },
};

export const WithMedia: Story = {
  args: {
    items: mediaItems,
  },
  parameters: {
    docs: {
      description: {
        story: 'Collection items with images following USWDS media pattern.',
      },
    },
  },
};

export const HeadersOnly: Story = {
  args: {
    items: headersOnlyItems,
  },
  parameters: {
    docs: {
      description: {
        story: 'Simple collection with only headers and links, useful for navigation lists.',
      },
    },
  },
};

export const WithMetadata: Story = {
  args: {
    items: [
      {
        id: 'meta-1',
        title: 'Federal Contracting Report',
        description:
          'Annual report on federal contracting activities and small business participation rates.',
        href: 'https://www.sba.gov/document/report-federal-contracting-report',
        author: 'Small Business Administration',
        date: 'October 15, 2023',
        tags: ['Report', 'Contracting', 'Small Business'],
        metadata: [
          { label: 'Document Type', value: 'Annual Report' },
          { label: 'File Size', value: '2.4 MB' },
          { label: 'Pages', value: '156' },
        ],
      },
      {
        id: 'meta-2',
        title: 'Cybersecurity Framework Update',
        description:
          'Updated guidelines for federal agency cybersecurity practices and implementation.',
        href: 'https://www.nist.gov/cyberframework',
        author: 'NIST',
        date: 'September 28, 2023',
        tags: ['Security', 'Framework', 'Guidelines'],
        metadata: [
          { label: 'Version', value: '2.0' },
          { label: 'Category', value: 'Technical Standard' },
          { label: 'Compliance Level', value: 'Mandatory' },
        ],
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Collection items with additional metadata fields for detailed information.',
      },
    },
  },
};

export const EmployeeBenefits: Story = {
  args: {
    items: [
      {
        id: 'benefits-1',
        title: 'Health Insurance Plans',
        description:
          'Comprehensive guide to available health insurance plans, enrollment periods, and coverage options for employees and their families.',
        href: '#',
        author: 'Human Resources',
        date: 'Updated November 2024',
        tags: ['Benefits', 'Healthcare', 'Insurance'],
      },
      {
        id: 'benefits-2',
        title: 'Retirement Savings Program',
        description:
          'Learn about retirement savings options, employer matching contributions, and investment choices to plan for your future.',
        href: '#',
        author: 'Benefits Team',
        date: 'Updated October 2024',
        tags: ['Retirement', 'Savings', 'Financial Planning'],
      },
      {
        id: 'benefits-3',
        title: 'Professional Development Resources',
        description:
          'Access training programs, certification reimbursement, and continuing education opportunities to advance your career.',
        href: '#',
        author: 'Learning & Development',
        date: 'Updated December 2024',
        tags: ['Training', 'Career Development', 'Education'],
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Employee benefits and resources collection demonstrating organizational service content patterns.',
      },
    },
  },
};

export const EmergencyAlerts: Story = {
  args: {
    items: [
      {
        id: 'alert-1',
        title: 'Severe Weather Preparedness',
        description:
          'Essential steps to prepare for severe weather, including evacuation planning, emergency supplies, and safety procedures.',
        href: '#',
        author: 'Safety & Security Team',
        date: 'June 1, 2024',
        tags: ['Emergency', 'Weather', 'Preparedness'],
        media: {
          src: '/images/weather-icon.svg',
          alt: 'Weather warning icon',
        },
      },
      {
        id: 'alert-2',
        title: 'Cybersecurity Alert: Phishing Scams',
        description:
          'Recent increase in phishing attempts targeting employees. Learn to identify and report suspicious communications.',
        href: '#',
        author: 'Information Security',
        date: 'March 15, 2024',
        tags: ['Cybersecurity', 'Alert', 'Phishing'],
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Emergency alerts and important notices with organizational attribution.',
      },
    },
  },
};

// Interactive example with event handling
export const Interactive: Story = {
  render: (args) => html`
    <usa-collection
      .items=${args.items}
      @click="${(e: Event) => {
        console.log('Collection clicked:', e);
      }}"
    ></usa-collection>
  `,
  args: {
    items: sampleItems,
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive collection with event handling. Check the console for click events.',
      },
    },
  },
};
