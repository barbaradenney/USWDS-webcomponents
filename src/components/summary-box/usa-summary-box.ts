import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

// Import official USWDS compiled CSS
import '../../styles/styles.css';

/**
 * USA Summary Box Web Component
 *
 * A simple, accessible USWDS summary box implementation as a custom element.
 * Uses official USWDS classes and styling with minimal custom code.
 *
 * @element usa-summary-box
 *
 * @see README.mdx - Complete API documentation, usage examples, and implementation notes
 * @see CHANGELOG.mdx - Component version history and breaking changes
 * @see TESTING.mdx - Testing documentation and coverage reports
 *
 * @uswds-css-reference https://github.com/uswds/uswds/tree/develop/packages/usa-summary-box/src/styles/_usa-summary-box.scss
 * @uswds-docs https://designsystem.digital.gov/components/summary-box/
 * @uswds-guidance https://designsystem.digital.gov/components/summary-box/#guidance
 * @uswds-accessibility https://designsystem.digital.gov/components/summary-box/#accessibility
 */
@customElement('usa-summary-box')
export class USASummaryBox extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    /* Hide slotted elements that appear as direct children (light DOM slot workaround) */
    :host > [slot] {
      display: none !important;
    }
  `;

  @property({ type: String })
  heading = '';

  @property({ type: String })
  content = '';

  @property({ type: String, attribute: 'heading-level' })
  headingLevel = 'h3';

  // Track whether we're using innerHTML mode to avoid Lit marker conflicts
  private isUsingInnerHTML = false;

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
    // ARCHITECTURE: Script Tag Pattern
    // USWDS is loaded globally via script tag in .storybook/preview-head.html
    // Components just render HTML - USWDS enhances automatically via window.USWDS

    super.firstUpdated(changedProperties);

    // Move slotted content into their slot placeholders (light DOM slot workaround)
    this.moveSlottedContent();
  }

  private moveSlottedContent() {
    // In light DOM, slots don't automatically project content
    // We need to manually move slotted elements into their slot locations

    // Handle named slots first
    const slottedElements = Array.from(this.querySelectorAll('[slot]'));
    slottedElements.forEach((element) => {
      const slotName = element.getAttribute('slot');
      if (slotName) {
        const slotElement = this.querySelector(`slot[name="${slotName}"]`);
        if (slotElement) {
          // Replace the slot element with the actual slotted content
          slotElement.replaceWith(element);
        }
      }
    });

    // Handle default slot (elements without slot attribute)
    const defaultSlot = this.querySelector('slot:not([name])');
    if (defaultSlot) {
      // Get all direct children that should go in the default slot
      // Exclude: elements with slot attribute, STYLE tags, and elements already inside .usa-summary-box
      const defaultSlottedElements = Array.from(this.children).filter(
        (el) =>
          !el.hasAttribute('slot') &&
          el.tagName !== 'STYLE' &&
          !el.classList.contains('usa-summary-box')
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

  private renderHeading() {
    if (!this.heading) return '';

    switch (this.headingLevel) {
      case 'h1':
        return html`<h1 class="usa-summary-box__heading">${this.heading}</h1>`;
      case 'h2':
        return html`<h2 class="usa-summary-box__heading">${this.heading}</h2>`;
      case 'h3':
        return html`<h3 class="usa-summary-box__heading">${this.heading}</h3>`;
      case 'h4':
        return html`<h4 class="usa-summary-box__heading">${this.heading}</h4>`;
      case 'h5':
        return html`<h5 class="usa-summary-box__heading">${this.heading}</h5>`;
      case 'h6':
        return html`<h6 class="usa-summary-box__heading">${this.heading}</h6>`;
      default:
        return html`<h3 class="usa-summary-box__heading">${this.heading}</h3>`;
    }
  }

  override updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);

    // Update content via innerHTML when content property changes
    // CRITICAL: Cannot use unsafeHTML directive in Light DOM components
    // Must use innerHTML imperatively instead
    if (changedProperties.has('content')) {
      const textElement = this.querySelector('.usa-summary-box__text');
      if (textElement) {
        if (this.content) {
          // Switching to property content - use innerHTML
          textElement.innerHTML = this.content;
          this.isUsingInnerHTML = true;
        } else if (this.isUsingInnerHTML) {
          // Switching back to slot content - clear innerHTML and trigger re-render
          // This ensures Lit's slot markers are restored properly
          textElement.innerHTML = '';
          this.isUsingInnerHTML = false;
          this.requestUpdate();
        }
      }
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    // Clean up USWDS behavior
    try {
      if (typeof window !== 'undefined' && typeof (window as any).USWDS !== 'undefined') {
        const USWDS = (window as any).USWDS;
        if (USWDS['summary-box'] && typeof USWDS['summary-box'].off === 'function') {
          USWDS['summary-box'].off(this);
        }
      }
    } catch (error) {
      console.warn('📋 SummaryBox: Cleanup failed:', error);
    }
    // Additional cleanup for event listeners would go here
  }

  override render() {
    return html`
      <div class="usa-summary-box">
        <div class="usa-summary-box__body">
          ${this.renderHeading()}
          <div class="usa-summary-box__text">
            <!-- Content set via innerHTML in updated() when content property is used -->
            <!-- Otherwise slot content is used -->
            ${this.content ? '' : html`<slot></slot>`}
          </div>
        </div>
      </div>
    `;
  }
}
