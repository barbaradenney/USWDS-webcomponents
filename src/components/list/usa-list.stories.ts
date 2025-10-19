import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './index.js';
import type { USAList } from './usa-list.js';

const meta: Meta<USAList> = {
  title: 'Data Display/List',
  component: 'usa-list',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
The USA List component organizes information into discrete sequential sections using semantic HTML lists. 
It supports both ordered and unordered lists with proper accessibility features and styling.

## Features
- Semantic HTML with proper list structure
- Ordered and unordered list types
- Unstyled variant for custom layouts
- Nested list support with proper styling
- Full accessibility compliance
        `,
      },
    },
  },
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['unordered', 'ordered'],
      description: 'List type - unordered (ul) or ordered (ol)',
    },
    unstyled: {
      control: { type: 'boolean' },
      description: 'Remove default list styling',
    },
  },
};

export default meta;
type Story = StoryObj<USAList>;

export const Default: Story = {
  args: {
    type: 'unordered',
    unstyled: false,
  },
  render: (args) => html`
    <usa-list type="${args.type}" ?unstyled=${args.unstyled}>
      <li>First item in the list</li>
      <li>Second item in the list</li>
      <li>Third item in the list</li>
      <li>Fourth item in the list</li>
    </usa-list>
  `,
};

export const UnorderedList: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
    docs: {
      description: {
        story: 'Example of mixed nested lists with both ordered and unordered sub-lists.',
        },
    },
  },
  render: () => html`
    <usa-list type="unordered">
      <li>Item without specific order</li>
      <li>Another unordered item</li>
      <li>Yet another item</li>
      <li>Final unordered item</li>
    </usa-list>
  `,
};

export const OrderedList: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <usa-list type="ordered">
      <li>First step in the process</li>
      <li>Second step in the process</li>
      <li>Third step in the process</li>
      <li>Fourth step in the process</li>
    </usa-list>
  `,
};

export const UnstyledList: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <usa-list type="unordered" unstyled>
      <li>No bullet points or indentation</li>
      <li>Clean presentation without default styling</li>
      <li>Still maintains semantic structure</li>
      <li>Good for custom-styled lists</li>
    </usa-list>
  `,
};

export const NestedLists: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <usa-list type="unordered">
      <li>
        Parent item with nested content
        <ul class="usa-list">
          <li>Nested item one</li>
          <li>Nested item two</li>
          <li>Nested item three</li>
        </ul>
      </li>
      <li>
        Another parent item
        <ul class="usa-list">
          <li>Another nested item</li>
          <li>More nested content</li>
        </ul>
      </li>
      <li>Simple parent item without nesting</li>
    </usa-list>
  `,
};

export const MixedNestedLists: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <usa-list type="ordered">
      <li>
        Main process step
        <ul class="usa-list">
          <li>Sub-task A</li>
          <li>Sub-task B</li>
          <li>Sub-task C</li>
        </ul>
      </li>
      <li>
        Next main step
        <ol class="usa-list">
          <li>Ordered sub-step 1</li>
          <li>Ordered sub-step 2</li>
        </ol>
      </li>
      <li>Final main step</li>
    </usa-list>
  `,
};

export const InteractiveDemo: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
    docs: {
      description: {
        story: 'Interactive demonstration showing dynamic list manipulation and property changes.',
        },
    },
  },
  render: () => html`
    <div>
      <h3>Interactive List Demo</h3>
      <div class="margin-bottom-4">
        <label>
          <input type="radio" name="list-type" value="unordered" checked id="unordered-radio" />
          Unordered List
        </label>
        <label class="margin-left-1">
          <input type="radio" name="list-type" value="ordered" id="ordered-radio" />
          Ordered List
        </label>
        <label class="margin-left-1">
          <input type="checkbox" id="unstyled-checkbox" />
          Remove Styling
        </label>
      </div>

      <usa-list id="demo-list" type="unordered">
        <li>Dynamic list item 1</li>
        <li>Dynamic list item 2</li>
        <li>Dynamic list item 3</li>
        <li>Dynamic list item 4</li>
      </usa-list>

      <div class="margin-top-2">
        <button type="button" class="usa-button usa-button--outline" id="add-item">Add Item</button>
        <button type="button" class="usa-button usa-button--outline" id="remove-item">
          Remove Item
        </button>
      </div>
    </div>

    <script>
      (function() {
        const demoList = document.getElementById('demo-list');
        const unorderedRadio = document.getElementById('unordered-radio');
        const orderedRadio = document.getElementById('ordered-radio');
        const unstyledCheckbox = document.getElementById('unstyled-checkbox');
        const addButton = document.getElementById('add-item');
        const removeButton = document.getElementById('remove-item');
        let itemCount = 4;

        // Handle list type change
        function updateListType() {


        // Handle styling toggle
        function updateStyling() {
          if (demoList && unstyledCheckbox) {
            demoList.unstyled = unstyledCheckbox.checked;
          }
        }

        // Add new item
        function addItem() {
          itemCount++;
          const newItemHtml = \`<li>Dynamic list item \${itemCount}</li>\`;
          demoList?.insertAdjacentHTML('beforeend', newItemHtml);
        }

        // Remove last item
        function removeItem() {
          const items = demoList?.querySelectorAll('li');
          if (items && items.length > 1) {
            items[items.length - 1]?.remove();
            itemCount = Math.max(1, itemCount - 1);
          }
        }

        // Event listeners
        unorderedRadio?.addEventListener('change', updateListType);
        orderedRadio?.addEventListener('change', updateListType);
        unstyledCheckbox?.addEventListener('change', updateStyling);
        addButton?.addEventListener('click', addItem);
        removeButton?.addEventListener('click', removeItem);
      })();
    </script>
  `,
};

export const AccessibilityShowcase: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
    docs: {
      description: {
        story: 'Demonstrates accessibility features and screen reader behavior with lists.',
        },
    },
  },
  render: () => html`
    <div>
      <h3>Accessibility Features</h3>
      <p>
        Lists provide semantic structure that helps screen readers and other assistive technology:
      </p>

      <div class="padding-1 border-2px border-primary radius-md margin-y-1">
        <h4>Screen Reader Announcement:</h4>
        <p><em>"List with 4 items"</em> - announced when entering the list</p>
        <p><em>"List item 1 of 4"</em> - announced for each item</p>
      </div>

      <h4>Contact Information (Unordered)</h4>
      <usa-list type="unordered">
        <li>Phone: 1-800-555-0123</li>
        <li>Email: info@example.com</li>
        <li>Address: 1234 Main Street, City, State 12345</li>
        <li>Office Hours: Monday-Friday, 8:00 AM - 5:00 PM EST</li>
      </usa-list>

      <h4>Application Submission Steps (Ordered)</h4>
      <usa-list type="ordered">
        <li>Complete the online application form</li>
        <li>Upload required documentation</li>
        <li>Submit application before deadline</li>
        <li>Wait for confirmation email</li>
        <li>Track application status online</li>
      </usa-list>
    </div>
  `,
};



export const CustomContent: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Demonstrates using the default slot for custom content.',
      },
    },
  },
  render: () => html`
    <usa-list>
      <p>This is custom slotted content.</p>
      <p>Slots allow you to provide your own HTML content to the component.</p>
    </usa-list>
  `,
};
