import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

// Import official USWDS compiled CSS
import '../../styles/styles.css';

/**
 * USA Tag Web Component
 *
 * A simple, accessible USWDS tag implementation as a custom element.
 * Uses official USWDS classes and styling with minimal custom code.
 *
 * @element usa-tag
 * @fires tag-remove - Dispatched when a removable tag is removed
 *
 * @see README.mdx - Complete API documentation, usage examples, and implementation notes
 * @see CHANGELOG.mdx - Component version history and breaking changes
 * @see TESTING.mdx - Testing documentation and coverage reports
 *
 * @uswds-css-reference https://github.com/uswds/uswds/tree/develop/packages/usa-tag/src/styles/_usa-tag.scss
 * @uswds-docs https://designsystem.digital.gov/components/tag/
 * @uswds-guidance https://designsystem.digital.gov/components/tag/#guidance
 * @uswds-accessibility https://designsystem.digital.gov/components/tag/#accessibility
 */
@customElement('usa-tag')
export class USATag extends LitElement {
  static override styles = css`
    :host {
      display: inline-block;
    }

    /* Hide slotted elements that appear as direct children (light DOM slot workaround) */
    :host > [slot] {
      display: none !important;
    }
  `;

  @property({ type: String })
  text = '';

  @property({ type: Boolean, reflect: true })
  big = false;

  @property({ type: Boolean, reflect: true })
  removable = false;

  @property({ type: String })
  value = '';

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
      // Exclude: elements with slot attribute, STYLE tags, and elements already inside .usa-tag
      const defaultSlottedElements = Array.from(this.children).filter(
        (el) =>
          !el.hasAttribute('slot') &&
          el.tagName !== 'STYLE' &&
          !el.classList.contains('usa-tag')
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

  private handleRemove(e: Event) {
    e.stopPropagation();

    // Dispatch remove event
    this.dispatchEvent(
      new CustomEvent('tag-remove', {
        detail: {
          text: this.text,
          value: this.value,
        },
        bubbles: true,
        composed: true,
      })
    );

    // Remove the tag from DOM
    this.remove();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    // Note: USWDS tags are purely presentational with no JavaScript behavior
    console.log('Tag: Cleanup complete (no USWDS JavaScript required)');
  }

  private renderRemoveButton() {
    if (!this.removable) return '';

    return html`<button
      type="button"
      class="usa-button usa-button--unstyled"
      aria-label="Remove tag: ${this.text}"
      @click="${this.handleRemove}"
    >✕</button>`;
  }

  override render() {
    // Determine CSS classes
    const tagClasses = [
      'usa-tag',
      this.big ? 'usa-tag--big' : '',
      this.removable ? 'usa-tag--removable' : '',
    ]
      .filter(Boolean)
      .join(' ');

    // prettier-ignore
    return html`
      <span class="${tagClasses}">
        ${this.text ? this.text : html`<slot></slot>`}
        ${this.renderRemoveButton()}
      </span>
    `;
  }
}
