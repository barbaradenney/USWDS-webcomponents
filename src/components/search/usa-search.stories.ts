import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './index.ts';
import type { USASearch } from './usa-search.js';

const meta: Meta<USASearch> = {
  title: 'Components/Search',
  component: 'usa-search',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
The USA Search component provides accessible search functionality for websites and applications. It includes comprehensive keyboard navigation, proper ARIA attributes, and flexible sizing options to accommodate various use cases from compact header search to full-featured document search systems.

Based on the USWDS Search component with enhanced web component functionality.
        `,
      },
    },
  },
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the search input',
    },
    buttonText: {
      control: 'text',
      description: 'Text displayed on the search button',
    },
    value: {
      control: 'text',
      description: 'Current value of the search input',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'big'],
      description: 'Size variant of the search component',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the search component is disabled',
    },
    name: {
      control: 'text',
      description: 'Name attribute for the search input',
    },
    inputId: {
      control: 'text',
      description: 'ID attribute for the search input',
    },
    buttonId: {
      control: 'text',
      description: 'ID attribute for the search button',
    },
  },
};

export default meta;
type Story = StoryObj<USASearch>;

// Basic Stories
export const Default: Story = {
  args: {
    placeholder: 'Search',
    buttonText: 'Search',
    value: '',
    size: 'medium',
    disabled: false,
    name: 'search',
    inputId: 'search-field',
    buttonId: 'search-button',
  },
};

export const Small: Story = {
  args: {
    ...Default.args,
    size: 'small',
    placeholder: 'Search',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Compact search suitable for headers or sidebars. The small variant does not display button text by default.',
      },
    },
  },
};

export const Big: Story = {
  args: {
    ...Default.args,
    size: 'big',
    placeholder: 'Search for information',
    buttonText: 'Search',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Large search variant suitable for hero sections or primary search functionality on a page.',
      },
    },
  },
};

export const WithValue: Story = {
  args: {
    ...Default.args,
    value: 'project management',
    placeholder: 'Search content',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Search component with a pre-populated value, useful for showing search results or edited queries.',
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    ...Default.args,
    disabled: true,
    value: 'Search disabled',
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled state with custom styling for both input and button elements.',
      },
    },
  },
};

export const CustomPlaceholder: Story = {
  args: {
    ...Default.args,
    placeholder: 'Search documentation',
    buttonText: 'Find documents',
  },
  parameters: {
    docs: {
      description: {
        story: 'Search with custom placeholder text and button text for specific use cases.',
      },
    },
  },
};

// Interactive Examples
export const WithEventHandlers: Story = {
  args: {
    ...Default.args,
    placeholder: 'Type and press Enter or click Search',
  },
  render: (args) => html`
    <div>
      <usa-search
        placeholder="${args.placeholder}"
        button-text="${args.buttonText}"
        .value="${args.value}"
        size="${args.size}"
        ?disabled=${args.disabled}
        name="${args.name}"
        input-id="${args.inputId}"
        button-id="${args.buttonId}"
        @search-submit="${(e: CustomEvent) => {
          console.log('Search submitted:', e.detail);
          alert(`Search query: ${e.detail.query}`);
        }}"
        @search-input="${(e: CustomEvent) => {
          console.log('Search input changed:', e.detail);
        }}"
      ></usa-search>
      <p class="margin-top-1 text-base-dark font-sans-xs">
        Open browser console to see events. Submit event shows an alert.
      </p>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story:
          'Interactive example showing search-submit and search-input event handling. Check browser console for event details.',
      },
    },
  },
};

export const CustomIcon: Story = {
  args: {
    ...Default.args,
    placeholder: 'Search with custom icon',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Search component with a custom icon. Falls back to button text if icon fails to load.',
      },
    },
  },
};

export const NoIcon: Story = {
  args: {
    ...Default.args,
    placeholder: 'Search without icon',
    size: 'small',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Small search without icon shows button text as fallback, even in small size variant.',
      },
    },
  },
};

// Accessibility Examples
export const HighContrast: Story = {
  args: {
    ...Default.args,
    placeholder: 'Accessible search example',
  },
  render: (args) => html`
    <div class="bg-black padding-2 text-white">
      <h3 class="text-white margin-bottom-1">High Contrast Example</h3>
      <usa-search
        placeholder="${args.placeholder}"
        button-text="${args.buttonText}"
        .value="${args.value}"
        size="${args.size}"
        ?disabled=${args.disabled}
        name="${args.name}"
        input-id="${args.inputId}"
        button-id="${args.buttonId}"
      ></usa-search>
      <p class="text-base-lighter margin-top-1 font-sans-xs">
        Search component maintains accessibility in high contrast environments.
      </p>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story:
          'Search component in high contrast environment, demonstrating accessibility features.',
      },
    },
  },
};

export const KeyboardNavigation: Story = {
  args: {
    ...Default.args,
    placeholder: 'Tab to focus, Enter to submit',
  },
  render: (args) => html`
    <div>
      <button class="margin-bottom-1">Focus me first</button>
      <usa-search
        placeholder="${args.placeholder}"
        button-text="${args.buttonText}"
        .value="${args.value}"
        size="${args.size}"
        ?disabled=${args.disabled}
        name="${args.name}"
        input-id="${args.inputId}"
        button-id="${args.buttonId}"
        @search-submit="${(e: CustomEvent) => {
          alert(`Keyboard search: ${e.detail.query}`);
        }}"
      ></usa-search>
      <button class="margin-top-1">Tab here after search</button>
      <p class="margin-top-1 text-base-dark font-sans-xs">
        Test keyboard navigation: Tab to input, type query, press Enter to submit, Tab to continue.
      </p>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Keyboard navigation example. Use Tab to focus, type to search, Enter to submit.',
      },
    },
  },
};
