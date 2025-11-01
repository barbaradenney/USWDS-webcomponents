import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

// Import official USWDS compiled CSS
import '@uswds-wc/core/styles.css';

export interface ButtonGroupItem {
  text: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'base';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onclick?: () => void;
}

/**
 * USA Button Group Web Component
 *
 * A simple, accessible USWDS button group implementation as a custom element.
 * Uses official USWDS classes and styling with minimal custom code.
 *
 * @element usa-button-group
 *
 * @see README.mdx - Complete API documentation, usage examples, and implementation notes
 * @see CHANGELOG.mdx - Component version history and breaking changes
 * @see TESTING.mdx - Testing documentation and coverage reports
 *
 * @uswds-css-reference https://github.com/uswds/uswds/tree/develop/packages/usa-button-group/src/styles/_usa-button-group.scss
 * @uswds-docs https://designsystem.digital.gov/components/button-group/
 * @uswds-guidance https://designsystem.digital.gov/components/button-group/#guidance
 * @uswds-accessibility https://designsystem.digital.gov/components/button-group/#accessibility
 */
@customElement('usa-button-group')
export class USAButtonGroup extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }
  `;

  @property({ type: String })
  type: 'default' | 'segmented' = 'default';

  @property({ type: Array })
  buttons: ButtonGroupItem[] = [];

  @property({ type: Number })
  activeIndex = 0; // Track which button is active in segmented mode

  private slottedContent: string = '';

  // Use light DOM for USWDS compatibility
  protected override createRenderRoot(): HTMLElement {
    return this as any;
  }

  override connectedCallback() {
    super.connectedCallback();

    // Set web component managed flag to prevent USWDS auto-initialization conflicts
    this.setAttribute('data-web-component-managed', 'true');

    // Capture any initial light DOM content before render to prevent duplication
    if (this.childNodes.length > 0) {
      this.slottedContent = this.innerHTML;
      this.innerHTML = '';
    }
  }

  override updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);
    this.applySlottedContent();
  }

  private applySlottedContent() {
    if (this.slottedContent && this.buttons.length === 0) {
      const slotElement = this.querySelector('slot');
      if (slotElement) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = this.slottedContent;
        slotElement.replaceWith(...Array.from(tempDiv.childNodes));
      }
    }
  }

  private handleButtonClick(button: ButtonGroupItem, index: number) {
    // For segmented groups, update the active index
    if (this.type === 'segmented') {
      this.activeIndex = index;
    }

    if (button.onclick) {
      button.onclick();
    }

    // Dispatch custom event
    this.dispatchEvent(
      new CustomEvent('button-click', {
        detail: { button, index, active: this.type === 'segmented' && this.activeIndex === index },
        bubbles: true,
        composed: true,
      })
    );
  }

  private getButtonClasses(button: ButtonGroupItem, index: number): string {
    const classes = ['usa-button'];

    // For segmented groups, use activeIndex to determine variant
    if (this.type === 'segmented') {
      // Active button gets primary (filled) style, others get outline
      if (index === this.activeIndex) {
        // Primary button (default filled state) - no additional class needed
      } else {
        classes.push('usa-button--outline');
      }
    } else {
      // For default groups, use the button's specified variant
      if (button.variant) {
        switch (button.variant) {
          case 'secondary':
            classes.push('usa-button--secondary');
            break;
          case 'outline':
            classes.push('usa-button--outline');
            break;
          case 'base':
            classes.push('usa-button--base');
            break;
          // 'primary' is the default, no additional class needed
        }
      }
    }

    return classes.join(' ');
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    // Clean up USWDS behavior
    try {
      if (typeof window !== 'undefined' && typeof (window as any).USWDS !== 'undefined') {
        // USWDS variable removed (unused)
        const USWDS = (window as any).USWDS;
        if (USWDS.buttonGroup && typeof USWDS.buttonGroup.off === 'function') {
          USWDS.buttonGroup.off(this);
        }
      }
    } catch (error) {
      console.warn('📋 ButtonGroup: Cleanup failed:', error);
    }
    // Additional cleanup for event listeners would go here
  }
  private renderButtonItem(button: ButtonGroupItem, index: number) {
    return html`
      <li class="usa-button-group__item">
        <button
          type="${button.type || 'button'}"
          class="${this.getButtonClasses(button, index)}"
          ?disabled=${button.disabled}
          @click="${() => this.handleButtonClick(button, index)}"
        >
          ${button.text}
        </button>
      </li>
    `;
  }

  override render() {
    const groupClasses = [
      'usa-button-group',
      this.type === 'segmented' ? 'usa-button-group--segmented' : '',
    ]
      .filter(Boolean)
      .join(' ');

    // If buttons array is provided, render programmatically
    if (this.buttons.length > 0) {
      return html`
        <ul class="${groupClasses}">
          ${this.buttons.map((button, index) => this.renderButtonItem(button, index))}
        </ul>
      `;
    }

    // Otherwise, use slotted content
    return html`
      <ul class="${groupClasses}">
        <slot></slot>
      </ul>
    `;
  }
}
