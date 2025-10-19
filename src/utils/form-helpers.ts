/**
 * USWDS Form Integration Helpers
 *
 * Provides standardized form association, validation, and submission patterns
 * for USWDS components following HTML form standards.
 */

export interface USWDSFormValue {
  value: string | string[] | boolean | number | null;
  name: string;
  required: boolean;
  disabled: boolean;
  readonly: boolean;
}

export interface USWDSFormValidation {
  valid: boolean;
  message: string;
  type: 'error' | 'success' | 'warning' | 'info' | null;
}

export type USWDSFormElementType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'search'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'textarea'
  | 'date'
  | 'time'
  | 'datetime-local';

/**
 * Form Association Mixin
 * Provides standard form integration capabilities for USWDS components
 */
export class USWDSFormMixin {
  private _form: HTMLFormElement | null = null;
  private _internals?: ElementInternals;

  constructor(private element: HTMLElement) {
    // Set up form internals if supported
    if ('attachInternals' in element && typeof (element as any).attachInternals === 'function') {
      try {
        this._internals = (element as any).attachInternals();
      } catch (error) {
        console.debug('Form internals not supported or already attached');
      }
    }
  }

  /**
   * Associate this component with its containing form
   */
  associateWithForm(): HTMLFormElement | null {
    if (!this._form) {
      this._form = this.element.closest('form');
    }
    return this._form;
  }

  /**
   * Get the current form value
   */
  getFormValue(): USWDSFormValue {
    const nameAttr = this.element.getAttribute('name') || '';
    const requiredAttr = this.element.hasAttribute('required');
    const disabledAttr = this.element.hasAttribute('disabled');
    const readonlyAttr = this.element.hasAttribute('readonly');

    return {
      value: this.extractValue(),
      name: nameAttr,
      required: requiredAttr,
      disabled: disabledAttr,
      readonly: readonlyAttr,
    };
  }

  /**
   * Set form value (used by forms and validation)
   */
  setFormValue(value: string | string[] | boolean | number | null): void {
    this.applyValue(value);

    // Update form internals if available
    if (this._internals) {
      const formData = new FormData();
      const formValue = this.getFormValue();
      if (formValue.name && formValue.value !== null) {
        if (Array.isArray(formValue.value)) {
          formValue.value.forEach((val) => formData.append(formValue.name, String(val)));
        } else {
          formData.set(formValue.name, String(formValue.value));
        }
        this._internals.setFormValue(formData);
      }
    }
  }

  /**
   * Validate the current form value
   */
  validate(): USWDSFormValidation {
    const formValue = this.getFormValue();

    // Required validation
    if (formValue.required && !formValue.disabled && !formValue.readonly) {
      if (
        formValue.value === null ||
        formValue.value === '' ||
        (Array.isArray(formValue.value) && formValue.value.length === 0)
      ) {
        return {
          valid: false,
          message: 'This field is required.',
          type: 'error',
        };
      }
    }

    // Custom validation (override in subclasses)
    return this.customValidation(formValue);
  }

  /**
   * Set validation state on the component
   */
  setValidationState(validation: USWDSFormValidation): void {
    // Update form internals validation
    if (this._internals) {
      if (validation.valid) {
        this._internals.setValidity({});
      } else {
        const anchor = this.getValidationAnchor();
        if (anchor && anchor instanceof HTMLElement) {
          this._internals.setValidity({ customError: true }, validation.message, anchor);
        } else {
          this._internals.setValidity({ customError: true }, validation.message);
        }
      }
    }

    // Update component visual state
    this.applyValidationVisuals(validation);
  }

  /**
   * Submit the form (trigger form submission)
   */
  submitForm(): boolean {
    const form = this.associateWithForm();
    if (form) {
      const validation = this.validate();
      if (validation.valid) {
        // Create a temporary submit button to trigger native form submission
        const submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.style.display = 'none';
        form.appendChild(submitButton);
        submitButton.click();
        form.removeChild(submitButton);
        return true;
      } else {
        this.setValidationState(validation);
        return false;
      }
    }
    return false;
  }

  /**
   * Reset the component to its initial state
   */
  reset(): void {
    const defaultValue =
      this.element.getAttribute('value') || this.element.getAttribute('data-default-value') || '';
    this.setFormValue(defaultValue);
    this.setValidationState({ valid: true, message: '', type: null });
  }

  /**
   * Handle form reset event
   */
  onFormReset(): void {
    this.reset();
  }

  /**
   * Handle form submit event
   */
  onFormSubmit(event: Event): boolean {
    const validation = this.validate();
    this.setValidationState(validation);

    if (!validation.valid) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  // Protected methods for subclasses to override

  protected extractValue(): string | string[] | boolean | number | null {
    // Override in subclasses to extract the actual component value
    return this.element.getAttribute('value') || '';
  }

  protected applyValue(value: string | string[] | boolean | number | null): void {
    // Override in subclasses to apply value to the component
    if (typeof value === 'string') {
      this.element.setAttribute('value', value);
    }
  }

  protected customValidation(_formValue: USWDSFormValue): USWDSFormValidation {
    // Override in subclasses for custom validation logic
    return { valid: true, message: '', type: null };
  }

  protected applyValidationVisuals(validation: USWDSFormValidation): void {
    // Override in subclasses to apply visual validation state
    const errorClass = 'usa-input--error';
    const successClass = 'usa-input--success';

    this.element.classList.remove(errorClass, successClass);

    if (validation.type === 'error') {
      this.element.classList.add(errorClass);
    } else if (validation.type === 'success') {
      this.element.classList.add(successClass);
    }
  }

  protected getValidationAnchor(): Element | null {
    // Override in subclasses to specify validation focus target
    return this.element.querySelector('input, select, textarea') || this.element;
  }
}

/**
 * Form Integration Utilities
 */
export class USWDSFormUtils {
  /**
   * Set up automatic form integration for a component
   */
  static setupFormIntegration(element: HTMLElement): USWDSFormMixin {
    const mixin = new USWDSFormMixin(element);

    // Set up form event listeners
    const form = mixin.associateWithForm();
    if (form) {
      // Form reset handling
      form.addEventListener('reset', () => mixin.onFormReset());

      // Form submit handling
      form.addEventListener('submit', (event) => mixin.onFormSubmit(event));
    }

    return mixin;
  }

  /**
   * Create a form data entry from component value
   */
  static createFormDataEntry(name: string, value: USWDSFormValue['value']): [string, string][] {
    const entries: [string, string][] = [];

    if (value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach((val) => entries.push([name, String(val)]));
      } else {
        entries.push([name, String(value)]);
      }
    }

    return entries;
  }

  /**
   * Extract all USWDS component values from a form
   */
  static extractFormValues(form: HTMLFormElement): Record<string, USWDSFormValue['value']> {
    const values: Record<string, USWDSFormValue['value']> = {};

    // Find all USWDS components in the form
    const uswdsElements = form.querySelectorAll(
      '[class*="usa-"]:not([class*="usa-form"]):not([class*="usa-label"]):not([class*="usa-hint"])'
    );

    uswdsElements.forEach((element) => {
      if (element instanceof HTMLElement) {
        const name = element.getAttribute('name');
        if (name) {
          // Try to get value from the element
          const value =
            (element as any).value ||
            element.getAttribute('value') ||
            element.getAttribute('data-value');
          values[name] = value;
        }
      }
    });

    return values;
  }

  /**
   * Validate all USWDS components in a form
   */
  static validateForm(form: HTMLFormElement): {
    valid: boolean;
    errors: Array<{ element: Element; validation: USWDSFormValidation }>;
  } {
    const errors: Array<{ element: Element; validation: USWDSFormValidation }> = [];

    // Find all USWDS form components
    const uswdsElements = form.querySelectorAll(
      '[class*="usa-"]:not([class*="usa-form"]):not([class*="usa-label"]):not([class*="usa-hint"])'
    );

    uswdsElements.forEach((element) => {
      if (element instanceof HTMLElement && (element as any).validate) {
        const validation = (element as any).validate();
        if (!validation.valid) {
          errors.push({ element, validation });
        }
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

/**
 * Common form validation patterns
 */
export class USWDSValidationPatterns {
  static email(value: string): USWDSFormValidation {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!value) {
      return { valid: true, message: '', type: null }; // Let required validation handle empty
    }

    if (!emailRegex.test(value)) {
      return {
        valid: false,
        message: 'Please enter a valid email address.',
        type: 'error',
      };
    }

    return { valid: true, message: '', type: null };
  }

  static phone(value: string): USWDSFormValidation {
    const phoneRegex = /^[+]?[1-9]\d{0,15}$/; // Basic international phone format

    if (!value) {
      return { valid: true, message: '', type: null };
    }

    // Strip common formatting characters for validation
    const cleanPhone = value.replace(/[\s-().]/g, '');

    if (!phoneRegex.test(cleanPhone)) {
      return {
        valid: false,
        message: 'Please enter a valid phone number.',
        type: 'error',
      };
    }

    return { valid: true, message: '', type: null };
  }

  static minLength(value: string, min: number): USWDSFormValidation {
    if (!value) {
      return { valid: true, message: '', type: null };
    }

    if (value.length < min) {
      return {
        valid: false,
        message: `Please enter at least ${min} characters.`,
        type: 'error',
      };
    }

    return { valid: true, message: '', type: null };
  }

  static maxLength(value: string, max: number): USWDSFormValidation {
    if (!value) {
      return { valid: true, message: '', type: null };
    }

    if (value.length > max) {
      return {
        valid: false,
        message: `Please enter no more than ${max} characters.`,
        type: 'error',
      };
    }

    return { valid: true, message: '', type: null };
  }

  static pattern(value: string, pattern: RegExp, message: string): USWDSFormValidation {
    if (!value) {
      return { valid: true, message: '', type: null };
    }

    if (!pattern.test(value)) {
      return {
        valid: false,
        message,
        type: 'error',
      };
    }

    return { valid: true, message: '', type: null };
  }
}
