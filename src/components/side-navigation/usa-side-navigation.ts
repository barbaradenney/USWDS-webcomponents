import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';

// Import official USWDS compiled CSS
import '../../styles/styles.css';

export interface SideNavItem {
  label: string;
  href?: string;
  current?: boolean;
  subnav?: SideNavItem[];
}

/**
 * USA Side Navigation Web Component
 *
 * A simple, accessible USWDS side navigation implementation as a custom element.
 * Uses official USWDS classes and styling with minimal custom code.
 *
 * @element usa-side-navigation
 * @fires sidenav-click - Dispatched when navigation item is clicked
 *
 * @see README.mdx - Complete API documentation, usage examples, and implementation notes
 * @see CHANGELOG.mdx - Component version history and breaking changes
 * @see TESTING.mdx - Testing documentation and coverage reports
 *
 * @uswds-css-reference https://github.com/uswds/uswds/tree/develop/packages/usa-nav/src/styles/_usa-nav.scss
 * @uswds-docs https://designsystem.digital.gov/components/sidenav/
 * @uswds-guidance https://designsystem.digital.gov/components/sidenav/#guidance
 * @uswds-accessibility https://designsystem.digital.gov/components/sidenav/#accessibility
 */
@customElement('usa-side-navigation')
export class USASideNavigation extends LitElement {
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
  items: SideNavItem[] = [];

  @property({ type: String, attribute: 'aria-label' })
  override ariaLabel = 'Secondary navigation';

  private uswdsInitialized = false;

  // Use light DOM for USWDS compatibility
  protected override createRenderRoot(): HTMLElement {
    return this as any;
  }

  override connectedCallback() {
    super.connectedCallback();

    // Set web component managed flag to prevent USWDS auto-initialization conflicts
    this.setAttribute('data-web-component-managed', 'true');

    this.initializeUSWDSSideNavigation();
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
      // Exclude: elements with slot attribute, STYLE tags, and navigation elements
      const defaultSlottedElements = Array.from(this.children).filter(
        (el) =>
          !el.hasAttribute('slot') &&
          el.tagName !== 'STYLE' &&
          el.tagName !== 'NAV'
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

  private handleItemClick(item: SideNavItem, e: Event) {
    // Don't prevent default if this is a real link
    if (!item.href) {
      e.preventDefault();
    }

    this.dispatchEvent(
      new CustomEvent('sidenav-click', {
        detail: {
          item: item,
          label: item.label,
          href: item.href,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  private renderNavItem(item: SideNavItem): any {
    const itemClasses = 'usa-sidenav__item';
    const linkClasses = item.current ? 'usa-current' : '';

    return html`
      <li class="${itemClasses}">
        <a
          href="${item.href || 'javascript:void(0);'}"
          class="${linkClasses}"
          aria-current="${ifDefined(item.current ? 'page' : undefined)}"
          @click="${(e: Event) => this.handleItemClick(item, e)}"
        >
          ${item.label}
        </a>
        ${this.renderSubnav(item.subnav)}
      </li>
    `;
  }

  private initializeUSWDSSideNavigation() {
    if (this.uswdsInitialized) {
      return;
    }

    // Note: USWDS side navigation is purely presentational with no JavaScript behavior
    console.log(
      '📋 SideNavigation: Initialized as presentational component (no USWDS JavaScript required)'
    );
    this.uswdsInitialized = true;
  }

  private renderSubnav(subnav?: SideNavItem[]) {
    if (!subnav || subnav.length === 0) return '';

    return html`
      <ul class="usa-sidenav__sublist">
        ${subnav.map((subItem: SideNavItem) => this.renderNavItem(subItem))}
      </ul>
    `;
  }

  private renderNavItems() {
    return this.items.map((item) => this.renderNavItem(item));
  }
  override render() {
    // Always render the container to avoid hierarchy errors with light DOM slots
    return html`
      <nav aria-label="${this.ariaLabel}">
        ${this.items.length === 0
          ? html`<slot></slot>`
          : html`
            <ul class="usa-sidenav usa-sidenav__list">
              ${this.renderNavItems()}
            </ul>
          `
        }
      </nav>
    `;
  }
}
