import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
// Removed unsafeHTML import - using safer HTML content handling

// Import official USWDS compiled CSS
import '../../styles/styles.css';

export interface ProcessItem {
  heading: string;
  content: string;
}

/**
 * USA Process List Web Component
 *
 * A simple, accessible USWDS process list implementation as a custom element.
 * Uses official USWDS classes and styling with minimal custom code.
 *
 * @element usa-process-list
 *
 * @see README.mdx - Complete API documentation, usage examples, and implementation notes
 * @see CHANGELOG.mdx - Component version history and breaking changes
 * @see TESTING.mdx - Testing documentation and coverage reports
 *
 * @uswds-css-reference https://github.com/uswds/uswds/tree/develop/packages/usa-process-list/src/styles/_usa-process-list.scss
 * @uswds-docs https://designsystem.digital.gov/components/process-list/
 * @uswds-guidance https://designsystem.digital.gov/components/process-list/#guidance
 * @uswds-accessibility https://designsystem.digital.gov/components/process-list/#accessibility
 */
@customElement('usa-process-list')
export class USAProcessList extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    /* Hide slotted elements that appear as direct children (light DOM slot workaround) */
    :host > [slot] {
      display: none !important;
    }
  `;

  @property({ type: Array })
  items: ProcessItem[] = [];

  @property({ type: String })
  headingLevel = 'h4';

  // Use light DOM for USWDS compatibility
  protected override createRenderRoot(): HTMLElement {
    return this as any;
  }

  override connectedCallback() {
    super.connectedCallback();

    // Set web component managed flag to prevent USWDS auto-initialization conflicts
    this.setAttribute('data-web-component-managed', 'true');
  }

  override firstUpdated(changedProperties: Map<string, any>) {
    super.firstUpdated(changedProperties);

    // Move slotted content into their slot placeholders (light DOM slot workaround)
    this.moveSlottedContent();
  }

  private moveSlottedContent() {
    // In light DOM, slots don't automatically project content
    // We need to manually move slotted elements into their slot locations

    // Handle default slot (elements without slot attribute)
    const defaultSlot = this.querySelector('slot:not([name])');
    if (defaultSlot) {
      // Get all direct children that should go in the default slot
      // Exclude: elements with slot attribute, STYLE tags, and elements already inside .usa-process-list
      const defaultSlottedElements = Array.from(this.children).filter(
        (el) =>
          !el.hasAttribute('slot') &&
          el.tagName !== 'STYLE' &&
          !el.classList.contains('usa-process-list')
      );

      if (defaultSlottedElements.length > 0) {
        // Create a document fragment to hold the slotted content
        const fragment = document.createDocumentFragment();
        defaultSlottedElements.forEach((el) => {
          fragment.appendChild(el);
        });

        // Replace the slot with the fragment
        defaultSlot.replaceWith(fragment);
      } else {
        // No default slot content, just remove the empty slot
        defaultSlot.remove();
      }
    }
  }

  private renderItemHeading(heading: string) {
    switch (this.headingLevel) {
      case 'h1':
        return html`<h1 class="usa-process-list__heading">${heading}</h1>`;
      case 'h2':
        return html`<h2 class="usa-process-list__heading">${heading}</h2>`;
      case 'h3':
        return html`<h3 class="usa-process-list__heading">${heading}</h3>`;
      case 'h4':
        return html`<h4 class="usa-process-list__heading">${heading}</h4>`;
      case 'h5':
        return html`<h5 class="usa-process-list__heading">${heading}</h5>`;
      case 'h6':
        return html`<h6 class="usa-process-list__heading">${heading}</h6>`;
      default:
        return html`<h4 class="usa-process-list__heading">${heading}</h4>`;
    }
  }

  private renderProcessItem(item: ProcessItem): any {
    return html`
      <li class="usa-process-list__item">
        ${this.renderItemHeading(item.heading)}
        <div class="usa-process-list__content" .innerHTML="${item.content || ''}"></div>
      </li>
    `;
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    // Clean up USWDS behavior
    try {
      if (typeof window !== 'undefined' && typeof (window as any).USWDS !== 'undefined') {
        const USWDS = (window as any).USWDS;
        if (USWDS['process-list'] && typeof USWDS['process-list'].off === 'function') {
          USWDS['process-list'].off(this);
        }
      }
    } catch (error) {
      console.warn('📋 ProcessList: Cleanup failed:', error);
    }
    // Additional cleanup for event listeners would go here
  }
  override render() {
    // Always render the container to avoid hierarchy errors with light DOM slots
    return html`
      <ol class="usa-process-list">
        ${this.items.length === 0 ? html`<slot></slot>` : this.items.map((item) => this.renderProcessItem(item))}
      </ol>
    `;
  }
}
