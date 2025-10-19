/**
 * USWDS Class Builder Utility
 *
 * Provides a fluent, standardized API for building USWDS CSS class strings
 * with proper conflict resolution and variant management.
 *
 * @example
 * ```typescript
 * const classes = new USWDSClassBuilder()
 *   .base('usa-button')
 *   .variant(this.variant, 'usa-button')
 *   .modifier(this.disabled, 'usa-button--disabled')
 *   .modifier(this.outline, 'usa-button--outline')
 *   .size(this.size, 'usa-button')
 *   .build();
 * ```
 */

export type USWDSVariant = string | null | undefined;
export type USWDSSize = 'small' | 'medium' | 'large' | 'xl' | null | undefined;
export type USWDSState = 'error' | 'success' | 'warning' | 'info' | null | undefined;

export class USWDSClassBuilder {
  private classes: Set<string> = new Set();
  private baseClass?: string;

  /**
   * Set the base USWDS class (e.g., 'usa-button', 'usa-input')
   */
  base(className: string): USWDSClassBuilder {
    this.baseClass = className;
    this.classes.add(className);
    return this;
  }

  /**
   * Add a variant class if variant is provided and not default
   */
  variant(variant: USWDSVariant, baseClass?: string): USWDSClassBuilder {
    if (variant && variant !== 'default' && variant !== 'primary') {
      const base = baseClass || this.baseClass;
      if (base) {
        // Remove any existing variant classes for this base
        this.removeVariantClasses(base);
        this.classes.add(`${base}--${variant}`);
      }
    }
    return this;
  }

  /**
   * Add a size modifier class
   */
  size(size: USWDSSize, baseClass?: string): USWDSClassBuilder {
    if (size && size !== 'medium') {
      // medium is usually default
      const base = baseClass || this.baseClass;
      if (base) {
        // Remove any existing size classes
        this.removeSizeClasses(base);
        this.classes.add(`${base}--${size}`);
      }
    }
    return this;
  }

  /**
   * Add a state modifier class (error, success, etc.)
   */
  state(state: USWDSState, baseClass?: string): USWDSClassBuilder {
    if (state) {
      const base = baseClass || this.baseClass;
      if (base) {
        // Remove any existing state classes
        this.removeStateClasses(base);
        this.classes.add(`${base}--${state}`);
      }
    }
    return this;
  }

  /**
   * Conditionally add a modifier class
   */
  modifier(condition: boolean, className: string): USWDSClassBuilder {
    if (condition) {
      this.classes.add(className);
    } else {
      this.classes.delete(className);
    }
    return this;
  }

  /**
   * Add a class unconditionally
   */
  add(className: string): USWDSClassBuilder {
    this.classes.add(className);
    return this;
  }

  /**
   * Remove a class
   */
  remove(className: string): USWDSClassBuilder {
    this.classes.delete(className);
    return this;
  }

  /**
   * Add multiple classes from an array
   */
  addMany(classNames: string[]): USWDSClassBuilder {
    classNames.forEach((className) => {
      if (className) {
        this.classes.add(className);
      }
    });
    return this;
  }

  /**
   * Add classes from another element (for copying patterns)
   */
  copyFrom(element: Element, filter?: (className: string) => boolean): USWDSClassBuilder {
    Array.from(element.classList).forEach((className) => {
      if (!filter || filter(className)) {
        this.classes.add(className);
      }
    });
    return this;
  }

  /**
   * Build the final class string
   */
  build(): string {
    return Array.from(this.classes)
      .filter(Boolean)
      .sort() // Consistent ordering
      .join(' ');
  }

  /**
   * Apply classes directly to an element
   */
  applyTo(element: Element): void {
    element.className = this.build();
  }

  /**
   * Get classes as an array
   */
  toArray(): string[] {
    return Array.from(this.classes).filter(Boolean).sort();
  }

  /**
   * Check if a class is present
   */
  has(className: string): boolean {
    return this.classes.has(className);
  }

  /**
   * Clear all classes and start fresh
   */
  clear(): USWDSClassBuilder {
    this.classes.clear();
    this.baseClass = undefined;
    return this;
  }

  /**
   * Clone this builder (for reusing patterns)
   */
  clone(): USWDSClassBuilder {
    const clone = new USWDSClassBuilder();
    clone.classes = new Set(this.classes);
    clone.baseClass = this.baseClass;
    return clone;
  }

  // Private helper methods

  private removeVariantClasses(baseClass: string): void {
    const variantPattern = new RegExp(`^${baseClass}--(\\w+)$`);
    Array.from(this.classes).forEach((className) => {
      if (variantPattern.test(className)) {
        this.classes.delete(className);
      }
    });
  }

  private removeSizeClasses(baseClass: string): void {
    const sizePattern = new RegExp(`^${baseClass}--(small|medium|large|xl)$`);
    Array.from(this.classes).forEach((className) => {
      if (sizePattern.test(className)) {
        this.classes.delete(className);
      }
    });
  }

  private removeStateClasses(baseClass: string): void {
    const statePattern = new RegExp(`^${baseClass}--(error|success|warning|info)$`);
    Array.from(this.classes).forEach((className) => {
      if (statePattern.test(className)) {
        this.classes.delete(className);
      }
    });
  }
}

/**
 * Factory function for creating a new USWDS class builder
 */
export function uswdsClasses(baseClass?: string): USWDSClassBuilder {
  const builder = new USWDSClassBuilder();
  if (baseClass) {
    builder.base(baseClass);
  }
  return builder;
}

/**
 * Common USWDS class patterns as utilities
 */
export class USWDSClassPatterns {
  /**
   * Build button classes with all variants
   */
  static button(options: {
    variant?: string;
    size?: USWDSSize;
    outline?: boolean;
    unstyled?: boolean;
    disabled?: boolean;
    [key: string]: any;
  }): string {
    return uswdsClasses('usa-button')
      .variant(options.variant)
      .size(options.size)
      .modifier(!!options.outline, 'usa-button--outline')
      .modifier(!!options.unstyled, 'usa-button--unstyled')
      .modifier(!!options.disabled, 'usa-button--disabled')
      .build();
  }

  /**
   * Build input classes with states and variants
   */
  static input(options: {
    state?: USWDSState;
    size?: USWDSSize;
    disabled?: boolean;
    readonly?: boolean;
    [key: string]: any;
  }): string {
    return uswdsClasses('usa-input')
      .state(options.state)
      .size(options.size)
      .modifier(!!options.disabled, 'usa-input--disabled')
      .modifier(!!options.readonly, 'usa-input--readonly')
      .build();
  }

  /**
   * Build form group classes with states
   */
  static formGroup(options: {
    state?: USWDSState;
    required?: boolean;
    disabled?: boolean;
    [key: string]: any;
  }): string {
    return uswdsClasses('usa-form-group')
      .state(options.state, 'usa-form-group')
      .modifier(!!options.required, 'usa-form-group--required')
      .modifier(!!options.disabled, 'usa-form-group--disabled')
      .build();
  }

  /**
   * Build label classes
   */
  static label(options: {
    required?: boolean;
    disabled?: boolean;
    size?: USWDSSize;
    [key: string]: any;
  }): string {
    return uswdsClasses('usa-label')
      .modifier(!!options.required, 'usa-label--required')
      .modifier(!!options.disabled, 'usa-label--disabled')
      .size(options.size, 'usa-label')
      .build();
  }
}
