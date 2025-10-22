import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './index.ts';
import type { USAIcon } from './usa-icon.js';

const meta: Meta<USAIcon> = {
  title: 'Data Display/Icon',
  component: 'usa-icon',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
The USA Icon component provides a simple way to include icons in your application using the USWDS design system. 
Icons can be rendered either as inline SVGs or using an external sprite file for better performance with many icons.

## Features
- Multiple size options (3-9)
- Accessibility support with ARIA labels
- Decorative icon support
- Sprite-based or inline SVG rendering
- Light DOM for USWDS CSS compatibility
        `,
      },
    },
  },
  argTypes: {
    name: {
      control: 'select',
      options: [
        'search',
        'close',
        'menu',
        'arrow_forward',
        'arrow_back',
        'arrow_upward',
        'arrow_downward',
        'check_circle',
        'error',
        'warning',
        'info',
        'help',
        'flag',
        'phone',
        'mail',
        'location_on',
        'expand_more',
        'expand_less',
        'settings',
        'file_download',
        'cancel',
      ],
      description: 'Icon name to display',
    },
    size: {
      control: 'select',
      options: ['', '3', '4', '5', '6', '7', '8', '9'],
      description: 'Icon size modifier',
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessible label for the icon',
    },
    decorative: {
      control: 'boolean',
      description: 'Whether the icon is purely decorative',
    },
    useSprite: {
      control: 'boolean',
      description: 'Use sprite file instead of inline SVG',
    },
    spriteUrl: {
      control: 'text',
      description: 'URL to the SVG sprite file',
    },
  },
};

export default meta;
type Story = StoryObj<USAIcon>;

export const Default: Story = {
  args: {
    name: 'search',
    ariaLabel: 'Search',
  },
};

export const AllSizes: Story = {
  name: 'Icon Sizes',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: `
USWDS icons support multiple size variants from size 3 (smallest) to size 9 (largest).
The default size (no size property) uses the standard icon dimensions.

Click any card to copy the size value to your clipboard.
        `,
      },
    },
  },
  render: () => html`
    <style>
      .size-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 1rem;
        padding: 1rem 0;
      }

      .size-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
        padding: 1.5rem;
        border: 1px solid #dfe1e2;
        border-radius: 0.25rem;
        transition: all 0.2s ease-in-out;
        cursor: pointer;
      }

      .size-card:hover {
        background-color: #f0f0f0;
        border-color: #71767a;
        transform: translateY(-2px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .size-label {
        font-size: 0.875rem;
        font-weight: 600;
        color: #1b1b1b;
      }

      .size-class {
        font-size: 0.75rem;
        font-family: monospace;
        color: #005ea2;
        background: #e7f6f8;
        padding: 0.25rem 0.5rem;
        border-radius: 0.125rem;
      }
    </style>

    <div class="size-grid">
      ${[
        { size: '', label: 'Default', class: 'usa-icon' },
        { size: '3', label: 'Size 3', class: 'usa-icon--size-3' },
        { size: '4', label: 'Size 4', class: 'usa-icon--size-4' },
        { size: '5', label: 'Size 5', class: 'usa-icon--size-5' },
        { size: '6', label: 'Size 6', class: 'usa-icon--size-6' },
        { size: '7', label: 'Size 7', class: 'usa-icon--size-7' },
        { size: '8', label: 'Size 8', class: 'usa-icon--size-8' },
        { size: '9', label: 'Size 9', class: 'usa-icon--size-9' },
      ].map((item) => html`
        <div
          class="size-card"
          @click=${() => {
            navigator.clipboard.writeText(item.size || 'default');
            const feedback = document.createElement('div');
            feedback.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #00a91c; color: white; padding: 0.75rem 1rem; border-radius: 0.25rem; font-weight: 600; box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 9999;';
            feedback.textContent = `Copied size="${item.size || ''}" to clipboard!`;
            document.body.appendChild(feedback);
            setTimeout(() => feedback.remove(), 2000);
          }}
          title="Click to copy size value"
        >
          <usa-icon
            name="flag"
            size="${item.size}"
            aria-label="${item.label}"
          ></usa-icon>
          <span class="size-label">${item.label}</span>
          <code class="size-class">${item.class}</code>
        </div>
      `)}
    </div>
  `,
};

export const NavigationIcons: Story = {
  name: 'Navigation Icons',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Common icons used for navigation and interface controls. Click any card to copy the icon name.',
      },
    },
  },
  render: () => html`
    <style>
      .icon-category-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 1rem;
        padding: 1rem 0;
      }

      .category-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
        padding: 1.5rem;
        border: 1px solid #dfe1e2;
        border-radius: 0.25rem;
        transition: all 0.2s ease-in-out;
        cursor: pointer;
      }

      .category-card:hover {
        background-color: #f0f0f0;
        border-color: #71767a;
        transform: translateY(-2px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .category-label {
        font-size: 0.875rem;
        font-weight: 600;
        color: #1b1b1b;
      }

      .category-name {
        font-size: 0.75rem;
        font-family: monospace;
        color: #005ea2;
      }
    </style>

    <div class="icon-category-grid">
      ${[
        { name: 'menu', label: 'Menu' },
        { name: 'close', label: 'Close' },
        { name: 'search', label: 'Search' },
        { name: 'settings', label: 'Settings' },
      ].map((icon) => html`
        <div
          class="category-card"
          @click=${() => {
            navigator.clipboard.writeText(icon.name);
            const feedback = document.createElement('div');
            feedback.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #00a91c; color: white; padding: 0.75rem 1rem; border-radius: 0.25rem; font-weight: 600; box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 9999;';
            feedback.textContent = `Copied "${icon.name}" to clipboard!`;
            document.body.appendChild(feedback);
            setTimeout(() => feedback.remove(), 2000);
          }}
          title="Click to copy icon name"
        >
          <usa-icon name="${icon.name}" size="5" aria-label="${icon.label}"></usa-icon>
          <span class="category-label">${icon.label}</span>
          <code class="category-name">${icon.name}</code>
        </div>
      `)}
    </div>
  `,
};

export const ArrowIcons: Story = {
  name: 'Arrow Icons',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Directional arrow icons for navigation and pagination. Click any card to copy the icon name.',
      },
    },
  },
  render: () => html`
    <style>
      .icon-category-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 1rem;
        padding: 1rem 0;
      }

      .category-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
        padding: 1.5rem;
        border: 1px solid #dfe1e2;
        border-radius: 0.25rem;
        transition: all 0.2s ease-in-out;
        cursor: pointer;
      }

      .category-card:hover {
        background-color: #f0f0f0;
        border-color: #71767a;
        transform: translateY(-2px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .category-label {
        font-size: 0.875rem;
        font-weight: 600;
        color: #1b1b1b;
      }

      .category-name {
        font-size: 0.75rem;
        font-family: monospace;
        color: #005ea2;
      }
    </style>

    <div class="icon-category-grid">
      ${[
        { name: 'arrow_back', label: 'Back' },
        { name: 'arrow_forward', label: 'Forward' },
        { name: 'arrow_upward', label: 'Up' },
        { name: 'arrow_downward', label: 'Down' },
      ].map((icon) => html`
        <div
          class="category-card"
          @click=${() => {
            navigator.clipboard.writeText(icon.name);
            const feedback = document.createElement('div');
            feedback.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #00a91c; color: white; padding: 0.75rem 1rem; border-radius: 0.25rem; font-weight: 600; box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 9999;';
            feedback.textContent = `Copied "${icon.name}" to clipboard!`;
            document.body.appendChild(feedback);
            setTimeout(() => feedback.remove(), 2000);
          }}
          title="Click to copy icon name"
        >
          <usa-icon name="${icon.name}" size="5" aria-label="${icon.label}"></usa-icon>
          <span class="category-label">${icon.label}</span>
          <code class="category-name">${icon.name}</code>
        </div>
      `)}
    </div>
  `,
};

export const StatusIcons: Story = {
  name: 'Status & Alert Icons',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Icons for displaying status, alerts, and feedback messages with appropriate semantic colors. Click any card to copy the icon name.',
      },
    },
  },
  render: () => html`
    <style>
      .icon-category-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 1rem;
        padding: 1rem 0;
      }

      .category-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
        padding: 1.5rem;
        border: 1px solid #dfe1e2;
        border-radius: 0.25rem;
        transition: all 0.2s ease-in-out;
        cursor: pointer;
      }

      .category-card:hover {
        background-color: #f0f0f0;
        border-color: #71767a;
        transform: translateY(-2px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .category-label {
        font-size: 0.875rem;
        font-weight: 600;
        color: #1b1b1b;
      }

      .category-name {
        font-size: 0.75rem;
        font-family: monospace;
        color: #005ea2;
      }

      .color-badge {
        font-size: 0.625rem;
        padding: 0.125rem 0.375rem;
        border-radius: 0.125rem;
        font-weight: 600;
      }
    </style>

    <div class="icon-category-grid">
      ${[
        { name: 'check_circle', label: 'Success', colorClass: 'text-success', badge: 'text-success' },
        { name: 'error', label: 'Error', colorClass: 'text-error', badge: 'text-error' },
        { name: 'warning', label: 'Warning', colorClass: 'text-warning', badge: 'text-warning' },
        { name: 'info', label: 'Info', colorClass: 'text-info-dark', badge: 'text-info-dark' },
      ].map((icon) => html`
        <div
          class="category-card"
          @click=${() => {
            navigator.clipboard.writeText(icon.name);
            const feedback = document.createElement('div');
            feedback.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #00a91c; color: white; padding: 0.75rem 1rem; border-radius: 0.25rem; font-weight: 600; box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 9999;';
            feedback.textContent = `Copied "${icon.name}" to clipboard!`;
            document.body.appendChild(feedback);
            setTimeout(() => feedback.remove(), 2000);
          }}
          title="Click to copy icon name"
        >
          <usa-icon
            name="${icon.name}"
            size="5"
            aria-label="${icon.label}"
            class="${icon.colorClass}"
          ></usa-icon>
          <span class="category-label">${icon.label}</span>
          <code class="category-name">${icon.name}</code>
          <span class="color-badge ${icon.colorClass}">${icon.badge}</span>
        </div>
      `)}
    </div>
  `,
};

export const ContactIcons: Story = {
  name: 'Contact Icons',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Icons for contact information and communication. Click any card to copy the icon name.',
      },
    },
  },
  render: () => html`
    <style>
      .icon-category-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 1rem;
        padding: 1rem 0;
      }

      .category-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
        padding: 1.5rem;
        border: 1px solid #dfe1e2;
        border-radius: 0.25rem;
        transition: all 0.2s ease-in-out;
        cursor: pointer;
      }

      .category-card:hover {
        background-color: #f0f0f0;
        border-color: #71767a;
        transform: translateY(-2px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .category-label {
        font-size: 0.875rem;
        font-weight: 600;
        color: #1b1b1b;
      }

      .category-name {
        font-size: 0.75rem;
        font-family: monospace;
        color: #005ea2;
      }
    </style>

    <div class="icon-category-grid">
      ${[
        { name: 'phone', label: 'Phone' },
        { name: 'mail', label: 'Email' },
        { name: 'location_on', label: 'Location' },
      ].map((icon) => html`
        <div
          class="category-card"
          @click=${() => {
            navigator.clipboard.writeText(icon.name);
            const feedback = document.createElement('div');
            feedback.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #00a91c; color: white; padding: 0.75rem 1rem; border-radius: 0.25rem; font-weight: 600; box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 9999;';
            feedback.textContent = `Copied "${icon.name}" to clipboard!`;
            document.body.appendChild(feedback);
            setTimeout(() => feedback.remove(), 2000);
          }}
          title="Click to copy icon name"
        >
          <usa-icon name="${icon.name}" size="5" aria-label="${icon.label}"></usa-icon>
          <span class="category-label">${icon.label}</span>
          <code class="category-name">${icon.name}</code>
        </div>
      `)}
    </div>
  `,
};

export const DecorativeIcon: Story = {
  args: {
    name: 'check_circle',
    size: '5',
    decorative: 'true',
  },
  render: (args) => html`
    <div class="display-flex flex-align-center gap-1">
      <usa-icon name="${args.name}" size="${args.size}" ?decorative=${args.decorative}></usa-icon>
      <span>Verified Organization</span>
    </div>
  `,
};

export const IconWithText: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <button class="usa-button" class="display-inline-flex flex-align-center gap-1">
      <usa-icon name="file_download" size="3" decorative></usa-icon>
      Download PDF
    </button>
  `,
};

export const ExpandCollapse: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div>
      <button class="display-flex flex-align-center gap-1 padding-1">
        Expand Section
        <usa-icon name="expand_more" size="4" aria-label="Expand"></usa-icon>
      </button>
      <button
        class="display-flex flex-align-center gap-1 padding-1 margin-top-2"
      >
        Collapse Section
        <usa-icon name="expand_less" size="4" aria-label="Collapse"></usa-icon>
      </button>
    </div>
  `,
};

export const SpriteExample: Story = {
  name: 'Using Icon Sprites',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: `
For production applications with many icons, USWDS recommends using sprite files for better performance.
The complete USWDS icon set (243 icons) is available via the official sprite file.

This example shows how to configure the component for sprite usage.
        `,
      },
    },
  },
  render: () => html`
    <style>
      .sprite-demo {
        display: grid;
        gap: 2rem;
        padding: 1rem;
      }

      .code-example {
        background: #f0f0f0;
        border: 1px solid #dfe1e2;
        border-radius: 0.25rem;
        padding: 1rem;
        font-family: monospace;
        font-size: 0.875rem;
        overflow-x: auto;
      }

      .example-section {
        border: 1px solid #dfe1e2;
        border-radius: 0.25rem;
        padding: 1.5rem;
      }

      .example-title {
        font-weight: 600;
        margin-bottom: 1rem;
        color: #1b1b1b;
      }
    </style>

    <div class="sprite-demo">
      <div class="usa-alert usa-alert--info">
        <div class="usa-alert__body">
          <p class="usa-alert__text">
            <strong>Note:</strong> This is a documentation example. The actual sprite file would need to be
            included in your project from the USWDS package or CDN.
          </p>
        </div>
      </div>

      <div class="example-section">
        <div class="example-title">1. Install USWDS and locate the sprite file:</div>
        <pre class="code-example">npm install @uswds/uswds

# Sprite file location:
node_modules/@uswds/uswds/dist/img/sprite.svg</pre>
      </div>

      <div class="example-section">
        <div class="example-title">2. Copy sprite to your public directory:</div>
        <pre class="code-example">cp node_modules/@uswds/uswds/dist/img/sprite.svg public/img/</pre>
      </div>

      <div class="example-section">
        <div class="example-title">3. Use icons with sprite file:</div>
        <pre class="code-example">&lt;usa-icon
  name="search"
  size="5"
  aria-label="Search"
  useSprite
  spriteUrl="/img/sprite.svg"
&gt;&lt;/usa-icon&gt;</pre>
      </div>

      <div class="example-section">
        <div class="example-title">4. Set global sprite URL (optional):</div>
        <pre class="code-example">// Set once for all icons in your app
const icons = document.querySelectorAll('usa-icon');
icons.forEach(icon => {
  icon.useSprite = true;
  icon.spriteUrl = '/img/sprite.svg';
});</pre>
      </div>

      <div class="example-section">
        <div class="example-title">Benefits of using sprite files:</div>
        <ul class="usa-list">
          <li><strong>Performance:</strong> Single HTTP request for all icons</li>
          <li><strong>Caching:</strong> Browser caches the sprite file</li>
          <li><strong>Complete set:</strong> Access to all 243 USWDS icons</li>
          <li><strong>Consistency:</strong> Icons always match USWDS design</li>
        </ul>
      </div>

      <div class="usa-alert usa-alert--success">
        <div class="usa-alert__body">
          <p class="usa-alert__text">
            <strong>Best Practice:</strong> Use inline SVGs (current implementation) for a few icons,
            switch to sprites when using 10+ icons on a page for optimal performance.
          </p>
        </div>
      </div>
    </div>
  `,
};

export const OrganizationBanner: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div
      class="bg-base-lightest padding-2 display-flex flex-align-center gap-1"
    >
      <usa-icon
        name="check_circle"
        size="4"
        aria-label="Verified"
        class="text-success"
      ></usa-icon>
      <div>
        <strong>Verified organization website</strong>
        <br />
        <small>Trusted and secure</small>
      </div>
    </div>
  `,
};

// Icons with built-in SVG paths (inline rendering without sprite file)
// These are the commonly used USWDS icons that work out-of-the-box
const availableIcons = [
  'search', 'close', 'menu', 'arrow_forward', 'arrow_back',
  'arrow_upward', 'arrow_downward', 'check_circle', 'error', 'warning',
  'info', 'help', 'flag', 'phone', 'mail',
  'location_on', 'expand_more', 'expand_less', 'settings', 'file_download',
  'cancel'
];

// Complete list of all 241 USWDS icons available via sprite file
const allUSWDSIcons = ['accessibility_new', 'accessible_forward', 'account_balance', 'account_box', 'account_circle', 'add', 'add_circle', 'add_circle_outline', 'alarm', 'alternate_email', 'announcement', 'api', 'arrow_back', 'arrow_downward', 'arrow_drop_down', 'arrow_drop_up', 'arrow_forward', 'arrow_upward', 'assessment', 'attach_file', 'attach_money', 'autorenew', 'backpack', 'bathtub', 'bedding', 'bookmark', 'bug_report', 'build', 'calendar_today', 'campaign', 'camping', 'cancel', 'chat', 'check', 'check_box_outline_blank', 'check_circle', 'check_circle_outline', 'checkroom', 'chevron_left', 'chevron_right', 'clean_hands', 'close', 'closed_caption', 'clothes', 'cloud', 'code', 'comment', 'connect_without_contact', 'construction', 'construction_worker', 'contact_page', 'content_copy', 'coronavirus', 'credit_card', 'deck', 'delete', 'device_thermostat', 'directions', 'directions_bike', 'directions_bus', 'directions_car', 'directions_walk', 'do_not_disturb', 'do_not_touch', 'drag_handle', 'eco', 'edit', 'electrical_services', 'emoji_events', 'error', 'error_outline', 'event', 'expand_less', 'expand_more', 'facebook', 'fast_forward', 'fast_rewind', 'favorite', 'favorite_border', 'file_download', 'file_present', 'file_upload', 'filter_alt', 'filter_list', 'fingerprint', 'first_page', 'flag', 'flickr', 'flight', 'flooding', 'folder', 'folder_open', 'format_quote', 'format_size', 'forum', 'github', 'grid_view', 'group_add', 'groups', 'hearing', 'help', 'help_outline', 'highlight_off', 'history', 'home', 'hospital', 'hotel', 'hourglass_empty', 'hurricane', 'identification', 'image', 'info', 'info_outline', 'insights', 'instagram', 'keyboard', 'label', 'language', 'last_page', 'launch', 'lightbulb', 'lightbulb_outline', 'link', 'link_off', 'list', 'local_cafe', 'local_fire_department', 'local_gas_station', 'local_grocery_store', 'local_hospital', 'local_laundry_service', 'local_library', 'local_offer', 'local_parking', 'local_pharmacy', 'local_police', 'local_taxi', 'location_city', 'location_on', 'lock', 'lock_open', 'lock_outline', 'login', 'logout', 'loop', 'mail', 'mail_outline', 'map', 'masks', 'medical_services', 'menu', 'military_tech', 'more_horiz', 'more_vert', 'my_location', 'navigate_before', 'navigate_far_before', 'navigate_far_next', 'navigate_next', 'near_me', 'notifications', 'notifications_active', 'notifications_none', 'notifications_off', 'park', 'people', 'person', 'pets', 'phone', 'photo_camera', 'print', 'priority_high', 'public', 'push_pin', 'radio_button_unchecked', 'rain', 'reduce_capacity', 'remove', 'report', 'restaurant', 'rss_feed', 'safety_divider', 'sanitizer', 'save_alt', 'schedule', 'school', 'science', 'search', 'security', 'send', 'sentiment_dissatisfied', 'sentiment_neutral', 'sentiment_satisfied', 'sentiment_satisfied_alt', 'sentiment_very_dissatisfied', 'settings', 'severe_weather', 'share', 'shield', 'shopping_basket', 'snow', 'soap', 'social_distance', 'sort_arrow', 'spellcheck', 'star', 'star_half', 'star_outline', 'store', 'support', 'support_agent', 'text_fields', 'thumb_down_alt', 'thumb_up_alt', 'timer', 'toggle_off', 'toggle_on', 'topic', 'tornado', 'translate', 'trending_down', 'trending_up', 'twitter', 'undo', 'unfold_less', 'unfold_more', 'update', 'upload_file', 'verified', 'verified_user', 'visibility', 'visibility_off', 'volume_off', 'warning', 'wash', 'wifi', 'work', 'youtube', 'zoom_in', 'zoom_out', 'zoom_out_map'];

export const IconGallery: Story = {
  name: 'All USWDS Icons',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: `
Gallery of all ${allUSWDSIcons.length} USWDS icons from the official sprite file.
Click on any icon name to copy it to your clipboard for easy use in your code.

**Note:** This gallery displays all icons using the \`useSprite\` property with the USWDS sprite file.
Only ${availableIcons.length} icons have built-in inline SVG fallbacks for offline/demo use.

See the [USWDS Icon Documentation](https://designsystem.digital.gov/components/icon/) for complete details.
        `,
      },
    },
  },
  render: () => html`
    <style>
      .icon-gallery {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 1rem;
        padding: 1rem;
      }

      .icon-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        padding: 1rem;
        border: 1px solid #dfe1e2;
        border-radius: 0.25rem;
        transition: all 0.2s ease-in-out;
        cursor: pointer;
      }

      .icon-item:hover {
        background-color: #f0f0f0;
        border-color: #71767a;
        transform: translateY(-2px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .icon-name {
        font-size: 0.75rem;
        text-align: center;
        word-break: break-word;
        color: #565c65;
        font-family: monospace;
      }

      .icon-item:hover .icon-name {
        color: #005ea2;
        font-weight: 600;
      }

      .copy-feedback {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #00a91c;
        color: white;
        padding: 0.75rem 1rem;
        border-radius: 0.25rem;
        font-weight: 600;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        animation: slideIn 0.3s ease-out;
        z-index: 9999;
      }

      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    </style>

    <div class="margin-bottom-2 padding-2 bg-base-lightest border-left-05 border-primary">
      <p class="margin-0">
        <strong>💡 Tip:</strong> Click any icon to copy its name to your clipboard.
        <br />
        <strong>Total USWDS icons:</strong> ${allUSWDSIcons.length} icons available via sprite file (shown below)
        <br />
        <strong>Built-in inline SVG fallbacks:</strong> ${availableIcons.length} common icons
      </p>
    </div>

    <div class="usa-alert usa-alert--info usa-alert--slim margin-bottom-2">
      <div class="usa-alert__body">
        <p class="usa-alert__text">
          All ${allUSWDSIcons.length} USWDS icons are displayed below using the <code>useSprite</code> property with the USWDS sprite file.
          See the <a href="https://designsystem.digital.gov/components/icon/" target="_blank" rel="noopener">USWDS Icon Documentation</a> for complete details.
        </p>
      </div>
    </div>

    <div class="icon-gallery">
      ${allUSWDSIcons.map((iconName) => html`
        <div
          class="icon-item"
          @click=${() => {
            navigator.clipboard.writeText(iconName);
            const feedback = document.createElement('div');
            feedback.className = 'copy-feedback';
            feedback.textContent = `Copied "${iconName}" to clipboard!`;
            document.body.appendChild(feedback);
            setTimeout(() => feedback.remove(), 2000);
          }}
          title="Click to copy '${iconName}'"
        >
          <usa-icon name="${iconName}" size="5" aria-label="${iconName}" use-sprite="true"></usa-icon>
          <span class="icon-name">${iconName}</span>
        </div>
      `)}
    </div>
  `,
};

