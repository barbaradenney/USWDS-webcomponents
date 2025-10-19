import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { USWDSBaseComponent } from '../../utils/base-component.js';

// Import official USWDS compiled CSS
import '../../styles/styles.css';

/**
 * USA Text Input Web Component
 *
 * Simple, accessible USWDS text input implementation as a custom element.
 * Uses official USWDS classes and styling. Text input is a presentational
 * component that requires no JavaScript enhancement.
 *
 * @element usa-text-input
 * @fires input - Dispatched when the input value changes
 * @fires change - Dispatched when the input loses focus after value change
 *
 * @see README.mdx - Complete API documentation, usage examples, and implementation notes
 * @see CHANGELOG.mdx - Component version history and breaking changes
 * @see TESTING.mdx - Testing documentation and coverage reports
 *
 * @uswds-css-reference https://github.com/uswds/uswds/tree/develop/packages/usa-input/src/styles/_usa-input.scss
 * @uswds-docs https://designsystem.digital.gov/components/text-input/
 * @uswds-guidance https://designsystem.digital.gov/components/text-input/#guidance
 * @uswds-accessibility https://designsystem.digital.gov/components/text-input/#accessibility
 */
@customElement('usa-text-input')
export class USATextInput extends USWDSBaseComponent {
  static override styles = css`
    :host {
      display: block;
    }
    :host([hidden]) {
      display: none;
    }
  `;

  @property({ type: String })
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' = 'text';

  @property({ type: String })
  name = '';

  @property({ type: String })
  value = '';

  @property({ type: String })
  placeholder = '';

  @property({ type: String })
  label = '';

  @property({ type: String })
  hint = '';

  @property({ type: String })
  error = '';

  @property({ type: String })
  width: '' | '2xs' | 'xs' | 'sm' | 'small' | 'md' | 'medium' | 'lg' | 'xl' | '2xl' = '';

  @property({ type: Boolean })
  disabled = false;

  @property({ type: Boolean })
  required = false;

  @property({ type: Boolean })
  readonly = false;

  @property({ type: String })
  autocomplete = '';

  @property({ type: String })
  pattern = '';

  @property({ type: Number })
  maxlength: number | null = null;

  @property({ type: Number })
  minlength: number | null = null;

  private _inputId?: string;

  override connectedCallback() {
    super.connectedCallback();

    // Set web component managed flag to prevent USWDS auto-initialization conflicts
    this.setAttribute('data-web-component-managed', 'true');
    console.log(
      '📝 Text Input: Initialized as presentational component (no USWDS JavaScript required)'
    );
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    console.log('📝 Text Input: Cleanup complete (no USWDS JavaScript required)');
  }

  private handleInput(e: Event) {
    const input = e.target as HTMLInputElement;
    this.value = input.value;

    this.dispatchEvent(
      new CustomEvent('input', {
        detail: {
          value: this.value,
          name: this.name,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  private handleChange(e: Event) {
    const input = e.target as HTMLInputElement;
    this.value = input.value;

    this.dispatchEvent(
      new CustomEvent('change', {
        detail: {
          value: this.value,
          name: this.name,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  private get inputId() {
    if (this.id) {
      return this.id;
    }
    if (!this._inputId) {
      this._inputId = `input-${Math.random().toString(36).substring(2, 11)}`;
    }
    return this._inputId;
  }

  private getInputClasses(): string {
    const classes = ['usa-input'];

    if (this.error) {
      classes.push('usa-input--error');
    }

    if (this.width) {
      classes.push(`usa-input--${this.width}`);
    }

    return classes.join(' ');
  }

  private getFormGroupClasses(): string {
    const classes = ['usa-form-group'];

    if (this.error) {
      classes.push('usa-form-group--error');
    }

    return classes.join(' ');
  }

  private getLabelClasses(): string {
    const classes = ['usa-label'];

    if (this.error) {
      classes.push('usa-label--error');
    }

    return classes.join(' ');
  }

  private renderRequiredIndicator() {
    if (!this.required) return '';
    return html`<abbr title="required" class="usa-hint usa-hint--required">*</abbr>`;
  }

  private renderLabel(inputId: string) {
    if (!this.label) return '';

    return html`
      <label class="${this.getLabelClasses()}" for="${inputId}">
        ${this.label}
        ${this.renderRequiredIndicator()}
      </label>
    `;
  }

  private renderHint(inputId: string) {
    if (!this.hint) return '';
    return html`<span class="usa-hint" id="${inputId}-hint">${this.hint}</span>`;
  }

  private renderError(inputId: string) {
    if (!this.error) return '';

    return html`
      <span class="usa-error-message" id="${inputId}-error" role="alert">
        <span class="usa-sr-only">Error:</span> ${this.error}
      </span>
    `;
  }


  // Use light DOM for USWDS compatibility
  protected override createRenderRoot(): HTMLElement {
    return this as any;
  }

    override render() {
    const inputId = this.inputId;

    const ariaDescribedBy = [
      this.hint ? `${inputId}-hint` : '',
      this.error ? `${inputId}-error` : '',
    ]
      .filter(Boolean)
      .join(' ');

    return html`
      <div class="${this.getFormGroupClasses()}">
        ${this.renderLabel(inputId)}
        ${this.renderHint(inputId)}
        ${this.renderError(inputId)}
        <input
          class="${this.getInputClasses()}"
          id="${inputId}"
          type="${this.type}"
          name="${this.name}"
          .value="${this.value}"
          placeholder="${this.placeholder}"
          ?disabled=${this.disabled}
          ?required=${this.required}
          ?readonly=${this.readonly}
          autocomplete="${this.autocomplete}"
          pattern="${this.pattern}"
          maxlength="${this.maxlength || ''}"
          minlength="${this.minlength || ''}"
          aria-describedby="${ariaDescribedBy}"
          aria-invalid="${this.error ? 'true' : 'false'}"
          @input="${this.handleInput}"
          @change="${this.handleChange}"
        />
      </div>
    `;
  }
}
