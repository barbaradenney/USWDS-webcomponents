import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './index.ts';
import type { USABanner } from './usa-banner.js';

const meta: Meta<USABanner> = {
  title: 'Feedback/Banner',
  component: 'usa-banner',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
The Banner component provides website information and security notices. It helps users understand website authenticity and security features.

The banner is collapsible, allowing users to expand it to read detailed information about domains and HTTPS security features.
        `,
      },
    },
  },
  argTypes: {
    flagImageSrc: {
      control: 'text',
      description: 'Source URL for the U.S. flag image',
    },
    flagImageAlt: {
      control: 'text',
      description: 'Alt text for the flag image',
    },
    dotGovIconSrc: {
      control: 'text',
      description: 'Source URL for the .gov icon',
    },
    httpsIconSrc: {
      control: 'text',
      description: 'Source URL for the HTTPS/lock icon',
    },
    headerText: {
      control: 'text',
      description: 'Main banner header text',
    },
    actionText: {
      control: 'text',
      description: 'Action text for toggle button',
    },
    expanded: {
      control: 'boolean',
      description: 'Whether banner content is expanded',
    },
  },
};

export default meta;
type Story = StoryObj<USABanner>;

export const Default: Story = {
  args: {
    flagImageSrc: '/img/us_flag_small.png',
    flagImageAlt: 'U.S. flag',
    dotGovIconSrc: '/img/icon-dot-gov.svg',
    httpsIconSrc: '/img/icon-https.svg',
    headerText: 'An official website of the United States government',
    actionText: "Here's how you know",
    expanded: false,
  },
};

export const Expanded: Story = {
  args: {
    ...Default.args,
    expanded: true,
  },
};

export const CustomHeaderText: Story = {
  args: {
    ...Default.args,
    headerText: 'This is an official U.S. government website',
    actionText: 'Learn more about government websites',
  },
};

export const CustomImages: Story = {
  args: {
    ...Default.args,
    flagImageSrc: '/img/us_flag_small.png',
    dotGovIconSrc: '/img/icon-dot-gov.svg',
    httpsIconSrc: '/img/icon-https.svg',
  },
  render: (args) => html`
    <usa-banner
      .flagImageSrc=${args.flagImageSrc}
      .flagImageAlt=${args.flagImageAlt}
      .dotGovIconSrc=${args.dotGovIconSrc}
      .httpsIconSrc=${args.httpsIconSrc}
      .headerText=${args.headerText}
      .actionText=${args.actionText}
      ?expanded=${args.expanded}
    ></usa-banner>
    <div class="margin-top-1 padding-1 bg-base-lightest radius-md">
      <p>
        <strong>Note:</strong> This story demonstrates using local image paths. The images are
        served from the public/img directory via Storybook's static files configuration.
      </p>
    </div>
  `,
};

export const DifferentLanguage: Story = {
  args: {
    flagImageSrc: '/img/us_flag_small.png',
    flagImageAlt: 'Bandera de EE.UU.',
    dotGovIconSrc: '/img/icon-dot-gov.svg',
    httpsIconSrc: '/img/icon-https.svg',
    headerText: 'Un sitio web oficial del gobierno de Estados Unidos',
    actionText: 'Así es como usted puede verificarlo',
    expanded: false,
  },
};

export const AlwaysExpanded: Story = {
  args: {
    ...Default.args,
    expanded: true,
  },
  render: (args) => html`
    <usa-banner
      .flagImageSrc=${args.flagImageSrc}
      .flagImageAlt=${args.flagImageAlt}
      .dotGovIconSrc=${args.dotGovIconSrc}
      .httpsIconSrc=${args.httpsIconSrc}
      .headerText=${args.headerText}
      .actionText=${args.actionText}
      ?expanded=${args.expanded}
    ></usa-banner>
    <div class="margin-top-1 padding-1 bg-base-lightest radius-md">
      <p>
        <strong>Note:</strong> This story shows the banner in its expanded state to demonstrate the
        full content.
      </p>
    </div>
  `,
};

export const InteractiveDemo: Story = {
  args: {
    ...Default.args,
  },
  render: (args) => html`
    <usa-banner
      .flagImageSrc=${args.flagImageSrc}
      .flagImageAlt=${args.flagImageAlt}
      .dotGovIconSrc=${args.dotGovIconSrc}
      .httpsIconSrc=${args.httpsIconSrc}
      .headerText=${args.headerText}
      .actionText=${args.actionText}
      ?expanded=${args.expanded}
      @banner-toggle=${(e: CustomEvent) => {
        console.log('Banner toggled:', e.detail);
        const status = document.getElementById('banner-status');
        if (status) {
          status.textContent = `Banner is now ${e.detail.expanded ? 'expanded' : 'collapsed'}`;
          setTimeout(() => {
            if (status) status.textContent = '';
          }, 3000);
        }
      }}
    ></usa-banner>

    <div class="margin-top-4 padding-2 bg-primary-lighter radius-md">
      <h3>Government Banner Testing Guide</h3>
      <p><strong id="banner-status"></strong></p>

      <h4>Banner Features:</h4>
      <ul>
        <li>Helps users identify website authenticity</li>
        <li>Explains domain and HTTPS security features</li>
        <li>Builds user trust in digital services</li>
        <li>Provides clear security information</li>
      </ul>

      <h4>Accessibility Features:</h4>
      <ul>
        <li>Screen reader compatible with proper ARIA attributes</li>
        <li>Keyboard navigation support (Tab, Enter, Space)</li>
        <li>High contrast design for visual accessibility</li>
        <li>Semantic HTML structure for assistive technologies</li>
      </ul>

      <h4>Interactive Testing:</h4>
      <ul>
        <li>Click "Here's how you know" to toggle content</li>
        <li>Use keyboard navigation (Tab to button, Enter/Space to toggle)</li>
        <li>Test with screen readers</li>
        <li>Verify all images have proper alt text</li>
        <li>Check banner content for government requirements</li>
      </ul>
    </div>
  `,
};

export const MobileFriendly: Story = {
  args: {
    ...Default.args,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  render: (args) => html`
    <usa-banner
      .flagImageSrc=${args.flagImageSrc}
      .flagImageAlt=${args.flagImageAlt}
      .dotGovIconSrc=${args.dotGovIconSrc}
      .httpsIconSrc=${args.httpsIconSrc}
      .headerText=${args.headerText}
      .actionText=${args.actionText}
      ?expanded=${args.expanded}
    ></usa-banner>

    <div class="margin-top-1 padding-1 bg-base-lightest radius-md font-body-xs">
      <p>
        <strong>Mobile View:</strong> The banner adapts to smaller screens while maintaining all
        required information and functionality.
      </p>
      <p>Test the toggle functionality and ensure all text remains readable on mobile devices.</p>
    </div>
  `,
};

export const KeyboardNavigation: Story = {
  args: {
    ...Default.args,
  },
  render: (args) => html`
    <div class="margin-bottom-1 padding-1 bg-warning-lighter radius-md">
      <h4 class="margin-top-0 text-warning-dark">Keyboard Navigation Demo</h4>
      <p><strong>Instructions:</strong></p>
      <ol>
        <li>Press <kbd>Tab</kbd> to focus the toggle button</li>
        <li>Press <kbd>Enter</kbd> or <kbd>Space</kbd> to expand/collapse</li>
        <li>Use <kbd>Tab</kbd> to continue navigation after the banner</li>
      </ol>
    </div>

    <usa-banner
      .flagImageSrc=${args.flagImageSrc}
      .flagImageAlt=${args.flagImageAlt}
      .dotGovIconSrc=${args.dotGovIconSrc}
      .httpsIconSrc=${args.httpsIconSrc}
      .headerText=${args.headerText}
      .actionText=${args.actionText}
      ?expanded=${args.expanded}
    ></usa-banner>

    <div class="margin-top-2">
      <button class="padding-y-05 padding-x-1">Next Focusable Element</button>
      <p>This button helps test Tab order and keyboard navigation flow.</p>
    </div>
  `,
};

export const CustomStylingExample: Story = {
  args: {
    ...Default.args,
  },
  render: (args) => html`
    <style>
      .custom-banner .usa-banner {
        border-bottom: 3px solid #005ea2;
      }

      .custom-banner .usa-banner__header-text {
        font-weight: 600;
      }

      .custom-banner .usa-banner__button:focus {
        outline: 3px solid #ffbe2e;
        outline-offset: 2px;
      }
    </style>

    <div class="custom-banner">
      <usa-banner
        .flagImageSrc=${args.flagImageSrc}
        .flagImageAlt=${args.flagImageAlt}
        .dotGovIconSrc=${args.dotGovIconSrc}
        .httpsIconSrc=${args.httpsIconSrc}
        .headerText=${args.headerText}
        .actionText=${args.actionText}
        ?expanded=${args.expanded}
      ></usa-banner>
    </div>

    <div class="margin-top-1 padding-1 bg-base-lightest radius-md">
      <h4>Custom Styling Example</h4>
      <p>
        This example shows how you can customize the banner appearance while maintaining USWDS
        compliance:
      </p>
      <ul>
        <li>Added colored bottom border</li>
        <li>Enhanced header text font weight</li>
        <li>Custom focus indicator styling</li>
      </ul>
      <p><strong>Note:</strong> Always ensure customizations maintain accessibility guidelines.</p>
    </div>
  `,
};
