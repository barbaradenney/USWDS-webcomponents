import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { USWDSBaseComponent } from '../../utils/base-component.js';
import { initializeTimePicker } from './usa-time-picker-behavior.js';

// Import official USWDS compiled CSS
import '../../styles/styles.css';

export interface TimeChangeDetail {
  value: string;
  displayValue: string;
}

/**
 * USA Time Picker Web Component
 *
 * Minimal wrapper around USWDS time picker functionality.
 * All time option generation, filtering, and dropdown behavior is managed by USWDS JavaScript.
 *
 * @element usa-time-picker
 * @fires time-change - Dispatched when time value changes (via USWDS)
 *
 * @see README.mdx - Complete API documentation, usage examples, and implementation notes
 * @see CHANGELOG.mdx - Component version history and breaking changes
 * @see TESTING.mdx - Testing documentation and coverage reports
 *
 * @uswds-js-reference https://github.com/uswds/uswds/tree/develop/packages/usa-time-picker/src/index.js
 * @uswds-css-reference https://github.com/uswds/uswds/tree/develop/packages/usa-time-picker/src/styles/_usa-time-picker.scss
 * @uswds-docs https://designsystem.digital.gov/components/time-picker/
 * @uswds-guidance https://designsystem.digital.gov/components/time-picker/#guidance
 * @uswds-accessibility https://designsystem.digital.gov/components/time-picker/#accessibility
 */
@customElement('usa-time-picker')
export class USATimePicker extends USWDSBaseComponent {
  static override styles = css`
    :host {
      display: block;
    }
    :host([hidden]) {
      display: none;
    }
  `;

  @property({ type: String })
  value = '';

  @property({ type: String })
  name = 'time-picker';

  @property({ type: String, attribute: 'input-id' })
  inputId = 'time-picker-input';

  @property({ type: String })
  listId = 'time-picker-list';

  @property({ type: String })
  label = 'Appointment time';

  @property({ type: String })
  hint = '';

  @property({ type: String })
  placeholder = 'hh:mm am';

  @property({ type: Boolean })
  disabled = false;

  @property({ type: Boolean })
  required = false;

  @property({ type: String })
  minTime = '';

  @property({ type: String, attribute: 'max-time' })
  maxTime = '';

  @property({ type: String })
  step = '30'; // minutes

  @property({ type: String })
  error = '';

  @property({ type: Boolean })
  errorState = false;

  // Store cleanup function from behavior
  private cleanup?: () => void;

  override connectedCallback() {
    super.connectedCallback();

    // Set web component managed flag to prevent USWDS auto-initialization conflicts
    this.setAttribute('data-web-component-managed', 'true');
  }

  override async firstUpdated(changedProperties: Map<string, any>) {
    // ARCHITECTURE: Script Tag Pattern
    // USWDS is loaded globally via script tag in .storybook/preview-head.html
    // Components just render HTML - USWDS enhances automatically via window.USWDS

    // ARCHITECTURE: USWDS-Mirrored Behavior Pattern
    // Uses dedicated behavior file (usa-time-picker-behavior.ts) that replicates USWDS source exactly

    super.firstUpdated?.(changedProperties);

    // Wait for DOM to be fully rendered
    await this.updateComplete;
    await new Promise(resolve => requestAnimationFrame(() => resolve(undefined)));

    // Initialize using mirrored USWDS behavior
    this.cleanup = initializeTimePicker(this);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.cleanup?.();
  }


  /**
   * Format time value for display (convert 24-hour to 12-hour with AM/PM if needed)
   * USWDS time-picker expects 12-hour format like "2:30pm"
   */
  private formatTimeForDisplay(value: string): string {
    if (!value) return '';

    // If already has AM/PM, return as-is
    if (/[ap]m/i.test(value)) return value;

    // Parse 24-hour format (HH:MM or H:MM)
    const match = value.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return value;

    const hours24 = parseInt(match[1], 10);
    const minutes = match[2];

    // Convert to 12-hour format
    const hours12 = hours24 % 12 || 12;
    const ampm = hours24 < 12 ? 'am' : 'pm';

    return `${hours12}:${minutes}${ampm}`;
  }

  private handleTimeChange(e: Event) {
    const input = e.target as HTMLInputElement;
    this.value = input.value;

    this.dispatchEvent(
      new CustomEvent('time-change', {
        detail: {
          value: this.value,
          displayValue: input.value,
        } as TimeChangeDetail,
        bubbles: true,
        composed: true,
      })
    );
  }

  private renderError() {
    if (!this.error) return '';
    return html`
      <div class="usa-error-message" id="${this.inputId}-error" role="alert">
        <span class="usa-sr-only">Error:</span> ${this.error}
      </div>
    `;
  }

  private renderRequiredIndicator() {
    if (!this.required) return '';
    return html`<abbr title="required" class="usa-hint usa-hint--required">*</abbr>`;
  }

  private renderHint() {
    if (!this.hint) return '';
    return html`<div class="usa-hint" id="${this.inputId}-hint">${this.hint}</div>`;
  }

  private renderInput(inputClasses: string, ariaDescribedBy: string) {
    const formattedValue = this.formatTimeForDisplay(this.value);
    return html`
      <input
        class="${inputClasses}"
        id="${this.inputId}"
        name="${this.name}"
        type="text"
        value="${formattedValue}"
        data-default-value="${this.value || ''}"
        placeholder="${this.placeholder}"
        ?disabled=${this.disabled}
        ?required=${this.required}
        aria-describedby="${ariaDescribedBy || undefined}"
        @change="${this.handleTimeChange}"
      />
    `;
  }

  override render() {
    const formGroupClasses = [
      'usa-form-group',
      this.error || this.errorState ? 'usa-form-group--error' : '',
      this.required ? 'usa-form-group--required' : '',
    ]
      .filter(Boolean)
      .join(' ');

    const inputClasses = ['usa-input', this.error || this.errorState ? 'usa-input--error' : '']
      .filter(Boolean)
      .join(' ');

    const ariaDescribedBy = [
      this.hint ? `${this.inputId}-hint` : '',
      this.error ? `${this.inputId}-error` : '',
    ]
      .filter(Boolean)
      .join(' ');

    // Provide EXACTLY what USWDS time-picker expects (from official template):
    // Label OUTSIDE, only input directly inside .usa-time-picker container
    // USWDS will transform this into a full combo-box
    return html`
      <div class="${formGroupClasses}">
        ${this.renderError()}
        <label class="usa-label" for="${this.inputId}">
          ${this.label}
          ${this.renderRequiredIndicator()}
        </label>
        ${this.renderHint()}
        <div
          class="usa-time-picker"
          data-min-time="${this.minTime || ''}"
          data-max-time="${this.maxTime || ''}"
          data-step="${this.step || '30'}"
          data-enhanced="false"
        >
          ${this.renderInput(inputClasses, ariaDescribedBy)}
        </div>
      </div>
    `;
  }

  // Public API methods for imperative control
  show() {
    console.log('Time Picker: Show triggered - delegating to USWDS');
    // USWDS time picker will handle dropdown showing via its event listeners
  }

  hide() {
    console.log('Time Picker: Hide triggered - delegating to USWDS');
    // USWDS time picker will handle dropdown hiding via its event listeners
  }

  updateOptions() {
    console.log('Time Picker: Update options triggered - delegating to USWDS');
    // USWDS time picker will handle option generation automatically
  }
}
