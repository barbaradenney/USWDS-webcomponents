import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

// Import official USWDS compiled CSS
import '../../styles/styles.css';

type SiteAlertType = 'info' | 'emergency';

/**
 * USA Site Alert Web Component
 *
 * A simple, accessible USWDS site alert implementation as a custom element.
 * Uses official USWDS classes and styling with minimal custom code.
 *
 * @element usa-site-alert
 * @fires site-alert-close - Dispatched when alert is closed
 *
 * @see README.mdx - Complete API documentation, usage examples, and implementation notes
 * @see CHANGELOG.mdx - Component version history and breaking changes
 * @see TESTING.mdx - Testing documentation and coverage reports
 *
 * @uswds-js-reference https://github.com/uswds/uswds/tree/develop/packages/usa-site-alert/src/index.js
 * @uswds-css-reference https://github.com/uswds/uswds/tree/develop/packages/usa-site-alert/src/styles/_usa-site-alert.scss
 * @uswds-docs https://designsystem.digital.gov/components/site-alert/
 * @uswds-guidance https://designsystem.digital.gov/components/site-alert/#guidance
 * @uswds-accessibility https://designsystem.digital.gov/components/site-alert/#accessibility
 */
@customElement('usa-site-alert')
export class USASiteAlert extends LitElement {
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
  type: SiteAlertType = 'info';

  // Alias for type property
  get variant() {
    return this.type;
  }
  set variant(value: SiteAlertType) {
    this.type = value;
  }

  @property({ type: String })
  heading = '';

  @property({ type: String })
  content = '';

  @property({ type: Boolean })
  slim = false;

  @property({ type: Boolean })
  noIcon = false;

  @property({ type: Boolean })
  closable = false;

  @property({ type: Boolean })
  visible = true;

  @property({ type: String, attribute: 'close-label' })
  closeLabel = 'Close';

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

  override updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);

    // Update content via textContent when content property changes
    if (changedProperties.has('content') && this.content) {
      const textElement = this.querySelector('.usa-alert__text');
      if (textElement) {
        textElement.textContent = this.content;
      }
    }
  }

  private moveSlottedContent() {
    // In light DOM, slots don't automatically project content
    // We need to manually move slotted elements into their slot locations

    // Handle default slot (elements without slot attribute)
    const defaultSlot = this.querySelector('slot:not([name])');
    if (defaultSlot) {
      // Get all direct children that should go in the default slot
      // Exclude: elements with slot attribute, STYLE tags, and elements already inside .usa-site-alert
      const defaultSlottedElements = Array.from(this.children).filter(
        (el) =>
          !el.hasAttribute('slot') &&
          el.tagName !== 'STYLE' &&
          !el.classList.contains('usa-site-alert')
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

  override disconnectedCallback() {
    super.disconnectedCallback();
    // Clean up USWDS behavior
    try {
      if (typeof window !== 'undefined' && typeof (window as any).USWDS !== 'undefined') {
        const USWDS = (window as any).USWDS;
        if (USWDS['site-alert'] && typeof USWDS['site-alert'].off === 'function') {
          USWDS['site-alert'].off(this);
        }
      }
    } catch (error) {
      console.warn('📋 SiteAlert: Cleanup failed:', error);
    }
    // Additional cleanup for event listeners would go here
  }

  override render() {
    if (!this.visible) return html``;

    const alertClasses = [
      'usa-site-alert',
      `usa-site-alert--${this.variant}`,
      this.slim ? 'usa-site-alert--slim' : '',
      this.noIcon ? 'usa-site-alert--no-icon' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return html`
      <section class="${alertClasses}" aria-label="Site alert" role="region">
        <div class="usa-alert">
          <div class="usa-alert__body">
            <h3 class="usa-alert__heading">${this.heading}</h3>
            <div class="usa-alert__text">
              ${this.content ? this.content : html`<slot></slot>`}
            </div>
          </div>
        </div>
      </section>
    `;
  }

  // Public API methods
  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;

    this.dispatchEvent(
      new CustomEvent('site-alert-close', {
        detail: {
          type: this.type,
          heading: this.heading,
          content: this.content,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  toggle() {
    this.visible = !this.visible;
  }
}
