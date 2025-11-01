import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './index.ts';
import type { USATag } from './usa-tag.js';

const meta: Meta<USATag> = {
  title: 'Data Display/Tag',
  component: 'usa-tag',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
The USA Tag component provides accessible, interactive labels for categorizing and organizing content using official USWDS styling. Perfect for applications requiring content classification and user interaction.
        `,
      },
    },
  },
  argTypes: {
    text: {
      control: 'text',
      description: 'Text content displayed in the tag',
    },
    big: {
      control: 'boolean',
      description: 'Apply larger tag styling',
    },
    removable: {
      control: 'boolean',
      description: 'Make the tag removable with close button',
    },
    value: {
      control: 'text',
      description: 'Internal value for data tracking (used in events)',
    },
  },
};

export default meta;
type Story = StoryObj<USATag>;

export const Default: Story = {
  args: {
    text: 'Sample Tag',
    big: false,
    removable: false,
    value: '',
  },
};

export const Big: Story = {
  args: {
    text: 'Large Tag',
    big: true,
    removable: false,
    value: '',
  },
};

export const Removable: Story = {
  args: {
    text: 'Removable Tag',
    big: false,
    removable: true,
    value: 'removable-tag',
  },
  render: (args) => html`
    <usa-tag
      text="${args.text}"
      ?big=${args.big}
      ?removable=${args.removable}
      value="${args.value || ''}"
      @tag-remove="${(e: CustomEvent) => {
        console.log('Tag removed:', e.detail);
        const announcement = document.getElementById('removal-announcement');
        if (announcement) {
          announcement.textContent = `Removed tag: ${e.detail.text} (value: ${e.detail.value})`;
        }
      }}"
    ></usa-tag>
    <div class="margin-top-2">
      <p class="text-base-darker"><strong>Removal Status:</strong></p>
      <p id="removal-announcement" class="text-base">Click the X to remove the tag above</p>
    </div>
  `,
};

export const BigRemovable: Story = {
  args: {
    text: 'Large Removable',
    big: true,
    removable: true,
    value: 'big-removable',
  },
};

export const TopicCategories: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div>
      <h3 class="margin-bottom-2">Topic Categories</h3>
      <div class="display-flex flex-wrap gap-1">
        <usa-tag
          text="Healthcare"
          removable
          value="healthcare"
          @tag-remove="${handleTagRemove}"
        ></usa-tag>
        <usa-tag
          text="Education"
          removable
          value="education"
          @tag-remove="${handleTagRemove}"
        ></usa-tag>
        <usa-tag
          text="Infrastructure"
          removable
          value="infrastructure"
          @tag-remove="${handleTagRemove}"
        ></usa-tag>
        <usa-tag
          text="Environment"
          removable
          value="environment"
          @tag-remove="${handleTagRemove}"
        ></usa-tag>
        <usa-tag
          text="Business"
          removable
          value="business"
          @tag-remove="${handleTagRemove}"
        ></usa-tag>
        <usa-tag
          text="Technology"
          removable
          big
          value="technology"
          @tag-remove="${handleTagRemove}"
        ></usa-tag>
        <usa-tag
          text="Innovation"
          removable
          value="innovation"
          @tag-remove="${handleTagRemove}"
        ></usa-tag>
        <usa-tag
          text="Community"
          removable
          value="community"
          @tag-remove="${handleTagRemove}"
        ></usa-tag>
      </div>
      <usa-alert type="info" class="margin-top-2">
        <h4 slot="heading">Interactive Topic Tags</h4>
        These tags represent different topic areas. Click the X button to remove tags and filter
        content. In a real application, this would update search results or content filters.
        <div id="policy-removal-log" class="margin-top-1 text-base-dark"></div>
      </usa-alert>
    </div>
  `,
};

export const ServiceStatus: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div>
      <h3 class="margin-bottom-2">Service Status</h3>
      <div class="grid-row grid-gap-2">
        <div class="tablet:grid-col-6">
          <h4 class="margin-bottom-1">Available Services</h4>
          <div class="display-flex flex-wrap gap-1">
            <usa-tag text="Online" value="online"></usa-tag>
            <usa-tag text="In-Person" value="in-person"></usa-tag>
            <usa-tag text="Phone Support" value="phone"></usa-tag>
            <usa-tag text="24/7 Available" big value="24-7"></usa-tag>
          </div>
        </div>
        <div class="tablet:grid-col-6">
          <h4 class="margin-bottom-1">Service Limitations</h4>
          <div class="display-flex flex-wrap gap-1">
            <usa-tag text="Appointment Required" value="appointment"></usa-tag>
            <usa-tag text="Limited Hours" value="limited"></usa-tag>
            <usa-tag text="Maintenance" big value="maintenance"></usa-tag>
          </div>
        </div>
      </div>
    </div>
  `,
};

export const EmergencyCategories: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div>
      <h3 class="margin-bottom-2">Emergency Response Categories</h3>
      <div class="display-flex flex-column gap-2">
        <div>
          <h4 class="margin-bottom-1">Priority Levels</h4>
          <div class="display-flex flex-wrap gap-1">
            <usa-tag text="Critical" big value="critical"></usa-tag>
            <usa-tag text="High Priority" big value="high"></usa-tag>
            <usa-tag text="Medium Priority" value="medium"></usa-tag>
            <usa-tag text="Low Priority" value="low"></usa-tag>
          </div>
        </div>
        <div>
          <h4 class="margin-bottom-1">Emergency Types</h4>
          <div class="display-flex flex-wrap gap-1">
            <usa-tag
              text="Natural Disaster"
              removable
              value="natural"
              @tag-remove="${handleTagRemove}"
            ></usa-tag>
            <usa-tag
              text="Public Health"
              removable
              value="health"
              @tag-remove="${handleTagRemove}"
            ></usa-tag>
            <usa-tag
              text="Infrastructure"
              removable
              value="infrastructure"
              @tag-remove="${handleTagRemove}"
            ></usa-tag>
            <usa-tag
              text="Cybersecurity"
              removable
              big
              value="cyber"
              @tag-remove="${handleTagRemove}"
            ></usa-tag>
            <usa-tag
              text="Transportation"
              removable
              value="transport"
              @tag-remove="${handleTagRemove}"
            ></usa-tag>
          </div>
        </div>
      </div>
    </div>
  `,
};

export const ComplianceStatus: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div>
      <h3 class="margin-bottom-2">Regulatory Compliance Status</h3>
      <div class="grid-row grid-gap-2">
        <div class="tablet:grid-col-4">
          <h4 class="text-green margin-bottom-1">Compliant</h4>
          <div class="display-flex flex-wrap gap-1">
            <usa-tag text="Section 508" value="508"></usa-tag>
            <usa-tag text="FISMA" value="fisma"></usa-tag>
            <usa-tag text="Privacy Act" value="privacy"></usa-tag>
            <usa-tag text="FOIA Ready" value="foia"></usa-tag>
          </div>
        </div>
        <div class="tablet:grid-col-4">
          <h4 class="text-gold margin-bottom-1">In Progress</h4>
          <div class="display-flex flex-wrap gap-1">
            <usa-tag text="ADA Review" big value="ada"></usa-tag>
            <usa-tag text="Security Audit" big value="security"></usa-tag>
          </div>
        </div>
        <div class="tablet:grid-col-4">
          <h4 class="text-red margin-bottom-1">Needs Attention</h4>
          <div class="display-flex flex-wrap gap-1">
            <usa-tag
              text="Data Retention"
              removable
              big
              value="retention"
              @tag-remove="${handleTagRemove}"
            ></usa-tag>
            <usa-tag
              text="Access Control"
              removable
              big
              value="access"
              @tag-remove="${handleTagRemove}"
            ></usa-tag>
          </div>
        </div>
      </div>
      <p class="margin-top-2 text-base-dark">
        Compliance tags help track regulatory requirements across government systems and processes.
      </p>
    </div>
  `,
};

export const UserGenerated: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div>
      <h3 class="margin-bottom-2">User Feedback Categories</h3>
      <div class="display-flex flex-wrap gap-1 margin-bottom-2">
        <usa-tag
          text="Service Quality"
          removable
          value="service"
          @tag-remove="${handleTagRemove}"
        ></usa-tag>
        <usa-tag
          text="Website Issue"
          removable
          value="website"
          @tag-remove="${handleTagRemove}"
        ></usa-tag>
        <usa-tag
          text="Process Improvement"
          removable
          value="process"
          @tag-remove="${handleTagRemove}"
        ></usa-tag>
        <usa-tag
          text="Accessibility"
          removable
          big
          value="accessibility"
          @tag-remove="${handleTagRemove}"
        ></usa-tag>
        <usa-tag
          text="Language Support"
          removable
          value="language"
          @tag-remove="${handleTagRemove}"
        ></usa-tag>
        <usa-tag
          text="Mobile Experience"
          removable
          value="mobile"
          @tag-remove="${handleTagRemove}"
        ></usa-tag>
        <usa-tag
          text="Documentation"
          removable
          value="docs"
          @tag-remove="${handleTagRemove}"
        ></usa-tag>
      </div>

      <div class="usa-form-group">
        <label class="usa-label" for="add-tag">Add New Category:</label>
        <div class="display-flex">
          <input class="usa-input" id="add-tag" type="text" placeholder="Enter category name" />
          <button class="usa-button margin-left-1" onclick="addNewTag()">Add Tag</button>
        </div>
      </div>

      <usa-alert type="success" class="margin-top-2">
        <h4 slot="heading">Dynamic Tag Management</h4>
        Users can add feedback categories that help organizations organize and respond to input.
        Remove tags by clicking the X button.
      </usa-alert>
    </div>

    <script>
      function addNewTag() {
        const input = document.getElementById('add-tag');
        const tagText = input.value.trim();
        if (tagText) {
          const container = input.parentElement.parentElement.previousElementSibling;
          const value = tagText.toLowerCase().replace(/\\s+/g, '-');
          const newTagHtml =
            '<usa-tag text="' + tagText + '" value="' + value + '" removable></usa-tag>';
          container.insertAdjacentHTML('beforeend', newTagHtml);
          const newTag = container.lastElementChild;
          newTag.addEventListener('tag-remove', handleTagRemove);
          input.value = '';
        }
      }
    </script>
  `,
};

export const CustomContent: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div>
      <h3 class="margin-bottom-2">Custom Tag Content</h3>
      <div class="display-flex flex-wrap gap-2 margin-bottom-2">
        <usa-tag>
          <span class="usa-icon-before usa-icon--flag">Important</span>
        </usa-tag>
        <usa-tag big>
          <span class="usa-icon-before usa-icon--public">Featured</span>
        </usa-tag>
        <usa-tag removable value="custom" @tag-remove="${handleTagRemove}">
          <strong>Priority:</strong> High
        </usa-tag>
        <usa-tag big removable value="complex" @tag-remove="${handleTagRemove}">
          <span class="usa-icon-before usa-icon--security">Protected</span>
        </usa-tag>
      </div>
      <p class="text-base-dark">
        Tags can contain custom HTML content including icons, formatting, and complex layouts. When
        using custom content, the <code>text</code> property is ignored.
      </p>
    </div>
  `,
};

export const AccessibilityDemo: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div>
      <h3 class="margin-bottom-2">Accessibility Features Demo</h3>
      <div class="display-flex flex-wrap gap-1 margin-bottom-2">
        <usa-tag text="Screen Reader Friendly" value="sr"></usa-tag>
        <usa-tag
          text="Keyboard Accessible"
          removable
          value="keyboard"
          @tag-remove="${handleTagRemove}"
        ></usa-tag>
        <usa-tag text="ARIA Compliant" big value="aria"></usa-tag>
        <usa-tag
          text="Focus Indicators"
          big
          removable
          value="focus"
          @tag-remove="${handleTagRemove}"
        ></usa-tag>
      </div>

      <usa-alert type="info">
        <h4 slot="heading">Accessibility Features</h4>
        <ul class="usa-list">
          <li>
            <strong>Keyboard Navigation:</strong> Tab to removable tags, Enter/Space to remove
          </li>
          <li><strong>Screen Reader Support:</strong> Descriptive ARIA labels on remove buttons</li>
          <li><strong>Focus Management:</strong> Clear visual focus indicators</li>
          <li><strong>Semantic HTML:</strong> Proper button elements for interactive features</li>
          <li><strong>Color Independence:</strong> Information not conveyed by color alone</li>
        </ul>
        <p class="margin-top-2">
          <strong>Try it:</strong> Use Tab to navigate to removable tags, then press Enter or Space
          to remove them.
        </p>
      </usa-alert>
    </div>
  `,
};

export const InteractiveDemo: Story = {
  args: {
    text: 'Interactive Tag',
    big: false,
    removable: false,
    value: 'interactive',
  },
  render: (args) => html`
    <div>
      <h3 class="margin-bottom-2">Interactive Tag Demo</h3>

      <usa-tag
        text="${args.text}"
        ?big=${args.big}
        ?removable=${args.removable}
        value="${args.value || ''}"
        @tag-remove="${(e: CustomEvent) => {
          console.log('Tag removed:', e.detail);
          const status = document.getElementById('interaction-status');
          if (status) {
            status.innerHTML = `
              <strong>Tag Removed!</strong><br>
              Text: ${e.detail.text}<br>
              Value: ${e.detail.value}<br>
              Time: ${new Date().toLocaleTimeString()}
            `;
          }
        }}"
      ></usa-tag>

      <div class="usa-form-group margin-top-2">
        <label class="usa-label" for="tag-text">Tag Text:</label>
        <input
          class="usa-input"
          id="tag-text"
          type="text"
          .value="${args.text}"
          @input="${(e: CustomEvent) => {
            const target = e.target as HTMLInputElement;
            const tag = document.querySelector('usa-tag') as any;
            if (tag) tag.text = target.value;
          }}"
        />
      </div>

      <div class="usa-form-group">
        <label class="usa-label" for="tag-value">Tag Value:</label>
        <input
          class="usa-input"
          id="tag-value"
          type="text"
          .value="${args.value}"
          @input="${(e: CustomEvent) => {
            const target = e.target as HTMLInputElement;
            const tag = document.querySelector('usa-tag') as any;
            if (tag) tag.value = target.value;
          }}"
        />
      </div>

      <fieldset class="usa-fieldset margin-top-2">
        <legend class="usa-legend">Tag Options</legend>
        <div class="usa-checkbox">
          <input
            class="usa-checkbox__input"
            id="big-option"
            type="checkbox"
            ?checked=${args.big}
            @change="${(e: Event) => {
              const target = e.target as HTMLInputElement;
              const tag = document.querySelector('usa-tag') as any;
              if (tag) tag.big = target.checked;
            }}"
          />
          <label class="usa-checkbox__label" for="big-option">Big size</label>
        </div>
        <div class="usa-checkbox">
          <input
            class="usa-checkbox__input"
            id="removable-option"
            type="checkbox"
            ?checked=${args.removable}
            @change="${(e: Event) => {
              const target = e.target as HTMLInputElement;
              const tag = document.querySelector('usa-tag') as any;
              if (tag) tag.removable = target.checked;
            }}"
          />
          <label class="usa-checkbox__label" for="removable-option">Removable</label>
        </div>
      </fieldset>

      <usa-alert type="success" class="margin-top-2">
        <h4 slot="heading">Real-time Controls</h4>
        Use the controls above to modify the tag properties in real-time. Changes are reflected
        immediately.
        <div id="interaction-status" class="margin-top-1 text-base-dark">
          Status: Ready for interaction
        </div>
      </usa-alert>
    </div>
  `,
};

// Shared event handler for stories
function handleTagRemove(e: CustomEvent) {
  console.log('Tag removed:', e.detail);

  // Update policy removal log if it exists
  const policyLog = document.getElementById('policy-removal-log');
  if (policyLog) {
    const logEntryHtml = `<div class="margin-bottom-05"><strong>Removed:</strong> ${e.detail.text} (${e.detail.value}) at ${new Date().toLocaleTimeString()}</div>`;
    policyLog.insertAdjacentHTML('beforeend', logEntryHtml);
  }

  // Show removal notification
  const notificationHtml = `
    <usa-alert type="success" class="margin-top-1">
      Removed tag: <strong>${e.detail.text}</strong> (value: ${e.detail.value})
    </usa-alert>
  `;

  // Insert notification after the removed tag's container
  const container = (e.target as Element)?.parentElement;
  if (container) {
    container.insertAdjacentHTML('beforeend', notificationHtml);

    // Remove notification after 3 seconds
    const addedNotification = container.lastElementChild as HTMLElement;
    setTimeout(() => {
      addedNotification?.remove();
    }, 3000);
  }
}
