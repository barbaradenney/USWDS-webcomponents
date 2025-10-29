import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './index.ts';
import type { USAProcessList } from './usa-process-list.js';

const meta: Meta<USAProcessList> = {
  title: 'Layout/Process List',
  component: 'usa-process-list',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
The USA Process List component provides an accessible, numbered list for displaying step-by-step processes using official USWDS styling. Perfect for applications requiring clear procedural documentation and user guidance.

**Use Cases:**
- Application processes
- Enrollment procedures
- Registration workflows
- Emergency response procedures
- Compliance steps
- Service registration guides
- Document submission processes
        `,
      },
    },
  },
  argTypes: {
    items: {
      control: 'object',
      description: 'Array of process steps with heading and content',
    },
    headingLevel: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      description: 'Heading level for process step titles',
    },
  },
};

export default meta;
type Story = StoryObj<USAProcessList>;

export const Default: Story = {
  args: {
    items: [
      {
        heading: 'Start your application',
        content: 'Visit our website and create an account to begin the application process.',
      },
      {
        heading: 'Submit required documents',
        content: 'Upload all necessary documentation through our secure portal.',
      },
      {
        heading: 'Receive confirmation',
        content: 'You will receive an email confirmation with your application reference number.',
      },
    ],
    headingLevel: 'h4',
  },
};

export const WithCustomContent: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div>
      <h2>Emergency Evacuation Procedures</h2>
      <p>In case of emergency, follow these steps:</p>
      <usa-process-list>
        <ol class="usa-process-list">
          <li class="usa-process-list__item">
            <h4 class="usa-process-list__heading">Remain calm</h4>
            <p>Do not panic. Listen for instructions from emergency personnel.</p>
          </li>
          <li class="usa-process-list__item">
            <h4 class="usa-process-list__heading">Evacuate immediately</h4>
            <p>Leave the building using the nearest emergency exit. Do not use elevators.</p>
            <usa-alert type="warning">
              <strong>Important:</strong> Help those who need assistance but do not put yourself in
              danger.
            </usa-alert>
          </li>
          <li class="usa-process-list__item">
            <h4 class="usa-process-list__heading">Go to assembly point</h4>
            <p>Proceed to the designated emergency assembly point for your building.</p>
            <img src="https://via.placeholder.com/400x200" alt="Map showing assembly points" />
          </li>
          <li class="usa-process-list__item">
            <h4 class="usa-process-list__heading">Wait for all-clear</h4>
            <p>Remain at the assembly point until emergency personnel give the all-clear signal.</p>
          </li>
        </ol>
      </usa-process-list>
    </div>
  `,
};

export const DifferentHeadingLevels: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div>
      <h2>Heading Level Examples</h2>

      <h3>H2 Headings</h3>
      <usa-process-list
        .items=${[
          { heading: 'Step One with H2', content: 'Content for step one' },
          { heading: 'Step Two with H2', content: 'Content for step two' },
        ]}
        headingLevel="h2"
      ></usa-process-list>

      <h3>H3 Headings (Recommended for most uses)</h3>
      <usa-process-list
        .items=${[
          { heading: 'Step One with H3', content: 'Content for step one' },
          { heading: 'Step Two with H3', content: 'Content for step two' },
        ]}
        headingLevel="h3"
      ></usa-process-list>

      <h3>H5 Headings (For nested processes)</h3>
      <usa-process-list
        .items=${[
          { heading: 'Substep One with H5', content: 'Content for substep one' },
          { heading: 'Substep Two with H5', content: 'Content for substep two' },
        ]}
        headingLevel="h5"
      ></usa-process-list>
    </div>
  `,
};

export const InteractiveDemo: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div>
      <h2>Build Your Own Process List</h2>

      <div class="usa-form-group">
        <label class="usa-label" for="step-heading">Step Heading:</label>
        <input class="usa-input" id="step-heading" type="text" placeholder="Enter step heading" />
      </div>

      <div class="usa-form-group">
        <label class="usa-label" for="step-content">Step Content:</label>
        <textarea
          class="usa-input"
          id="step-content"
          rows="3"
          placeholder="Enter step content (HTML supported)"
        ></textarea>
      </div>

      <button
        class="usa-button margin-bottom-2"
        onclick="
          const heading = document.getElementById('step-heading').value;
          const content = document.getElementById('step-content').value;
          const list = document.getElementById('dynamic-process-list');
          const currentItems = list.items || [];
          list.items = [...currentItems, { heading, content }];
          document.getElementById('step-heading').value = '';
          document.getElementById('step-content').value = '';
        "
      >
        Add Step
      </button>

      <button
        class="usa-button usa-button--outline margin-bottom-2"
        onclick="document.getElementById('dynamic-process-list').items = []"
      >
        Clear All
      </button>

      <h3>Preview:</h3>
      <usa-process-list id="dynamic-process-list" headingLevel="h4" .items=${[]}></usa-process-list>

      <usa-alert type="info" class="margin-top-3">
        <h3 slot="heading">Interactive Process Builder</h3>
        Add your own process steps above to see how the component renders them. HTML content is
        supported in the content field.
      </usa-alert>
    </div>
  `,
};

export const AccessibilityDemo: Story = {
  args: {
    items: [
      {
        heading: 'Screen reader compatible',
        content:
          'The ordered list structure provides natural navigation for screen readers, announcing step numbers automatically.',
      },
      {
        heading: 'Proper heading hierarchy',
        content:
          "Configurable heading levels ensure the process list fits properly within your page's heading structure.",
      },
      {
        heading: 'Semantic HTML',
        content:
          'Uses ordered lists (<ol>) and list items (<li>) for proper document structure and accessibility.',
      },
      {
        heading: 'Keyboard navigation',
        content:
          'All content is accessible via keyboard navigation. Interactive elements within steps maintain proper focus management.',
      },
    ],
    headingLevel: 'h3',
  },
  render: (args) => html`
    <div>
      <h2>Accessibility Features</h2>
      <p class="usa-intro">
        The Process List component is designed with accessibility in mind, meeting WCAG 2.1 AA
        standards.
      </p>
      <usa-process-list .items=${args.items} headingLevel="${args.headingLevel}"></usa-process-list>
      <usa-alert type="success" class="margin-top-3">
        <h3 slot="heading">Testing Tips</h3>
        <ul class="usa-list">
          <li>Use a screen reader to navigate through the process steps</li>
          <li>Check that step numbers are announced properly</li>
          <li>Verify heading levels match your page hierarchy</li>
          <li>Test keyboard navigation through any interactive content</li>
        </ul>
      </usa-alert>
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
    <usa-process-list>
      <p>This is custom slotted content.</p>
      <p>Slots allow you to provide your own HTML content to the component.</p>
    </usa-process-list>
  `,
};
