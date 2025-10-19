import { LitElement } from 'lit';
import { USWDSClassBuilder, uswdsClasses } from './uswds-class-builder.js';

/**
 * Minimal debug utilities (inline to avoid external dependencies)
 */
const isDebugEnabled = (): boolean => {
  if (typeof window === 'undefined') return false;
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('debug') === 'true') return true;
  return localStorage.getItem('uswds-debug') === 'true';
};

const debugLog = (component: string, message: string, data?: any): void => {
  if (!isDebugEnabled()) return;
  console.log(`[USWDS Debug] ${component}:`, message, data || '');
};

/**
 * Base class for USWDS Web Components
 * Provides common functionality and debugging support
 *
 * @see CLAUDE.md - Complete development guidelines
 * @see docs/COMPONENT_DEVELOPMENT_GUIDE.md - Implementation patterns
 * @see docs/COMPONENT_CHECKLIST.md - Quality checklist
 * @see docs/TROUBLESHOOTING.md - Debug component issues
 */
export class USWDSBaseComponent extends LitElement {
  constructor() {
    super();
  }

  /**
   * Use light DOM for USWDS compatibility
   * Override in subclass if shadow DOM is needed
   */
  protected override createRenderRoot(): HTMLElement {
    return this as any;
  }

  override connectedCallback() {
    super.connectedCallback?.();
  }

  override disconnectedCallback() {
    super.disconnectedCallback?.();
  }

  override updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);

    // In debug mode, inspect DOM after update
    if (this.isDebugMode() && changedProperties.size > 0) {
      // Small delay to ensure DOM is fully updated
      setTimeout(() => {
        debugLog(this.tagName.toLowerCase(), 'DOM after update:');
        // inspectDOM(this as any); // Method not available
      }, 0);
    }
  }

  override firstUpdated(changedProperties: Map<string, any>) {
    super.firstUpdated(changedProperties);
    // this.debugger?.firstUpdated(); // Method not available
  }

  /**
   * Helper method to move child nodes into a target element
   * Useful for light DOM components that need to move content
   */
  protected moveChildrenToElement(targetSelector: string): void {
    const target = this.querySelector(targetSelector);
    if (!target) {
      debugLog(this.tagName.toLowerCase(), `Target element '${targetSelector}' not found`);
      return;
    }

    // Get all child nodes that are not the target itself
    const childNodes = Array.from(this.childNodes).filter((node) => node !== target);

    if (childNodes.length > 0) {
      debugLog(
        this.tagName.toLowerCase(),
        `Moving ${childNodes.length} child nodes to ${targetSelector}`
      );
      childNodes.forEach((node) => {
        target.appendChild(node);
      });
    }
  }

  /**
   * Check if debug mode is enabled
   */
  protected isDebugMode(): boolean {
    if (typeof window === 'undefined') return false;

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('debug') === 'true') return true;

    return localStorage.getItem('uswds-debug') === 'true';
  }

  /**
   * Log debug message (only in debug mode)
   */
  protected debug(message: string, data?: any): void {
    debugLog(this.tagName.toLowerCase(), message, data);
  }

  /**
   * Create a new USWDS class builder for this component
   * Provides a fluent API for building USWDS-compliant CSS classes
   *
   * @param baseClass - Base USWDS class (optional, can be set later)
   * @example
   * ```typescript
   * const classes = this.createClassBuilder('usa-button')
   *   .variant(this.variant)
   *   .size(this.size)
   *   .modifier(this.disabled, 'usa-button--disabled')
   *   .build();
   * this.className = classes;
   * ```
   */
  protected createClassBuilder(baseClass?: string): USWDSClassBuilder {
    return uswdsClasses(baseClass);
  }

  /**
   * Update this component's classes using USWDS class builder
   * Override this method in subclasses to define component-specific class logic
   */
  protected updateClasses(): void {
    // Default implementation - override in subclasses
    // This provides a standardized entry point for class management
    this.debug('updateClasses() called but not implemented');
  }

  /**
   * Helper method to safely update element classes using class builder
   * Handles both string selectors and direct element references
   */
  protected updateElementClasses(
    elementOrSelector: Element | string,
    classBuilderCallback: (builder: USWDSClassBuilder) => USWDSClassBuilder
  ): void {
    let element: Element | null;

    if (typeof elementOrSelector === 'string') {
      element = this.querySelector(elementOrSelector);
      if (!element) {
        this.debug(`Element not found: ${elementOrSelector}`);
        return;
      }
    } else {
      element = elementOrSelector;
    }

    const builder = new USWDSClassBuilder();
    const updatedBuilder = classBuilderCallback(builder);
    updatedBuilder.applyTo(element);
  }

  /**
   * Generate a unique ID for this component instance
   * Useful for ARIA associations and form controls
   */
  protected generateId(prefix?: string): string {
    const componentName = this.tagName.toLowerCase().replace('usa-', '');
    const basePrefix = prefix || componentName;
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `${basePrefix}-${timestamp}-${random}`;
  }

  /**
   * Set up ARIA relationships between elements
   * Simplifies common ARIA patterns like aria-describedby, aria-labelledby
   */
  protected setAriaRelationship(
    sourceElement: Element | string,
    targetElement: Element | string,
    relationship: 'describedby' | 'labelledby' | 'controls' | 'owns'
  ): void {
    const source =
      typeof sourceElement === 'string' ? this.querySelector(sourceElement) : sourceElement;
    const target =
      typeof targetElement === 'string' ? this.querySelector(targetElement) : targetElement;

    if (!source || !target) {
      this.debug(`ARIA relationship setup failed: missing element(s)`);
      return;
    }

    // Ensure target has an ID
    if (!target.id) {
      target.id = this.generateId(`${relationship}-target`);
    }

    // Set up the relationship
    const attrName = `aria-${relationship}`;
    const existingValue = source.getAttribute(attrName);

    if (existingValue && !existingValue.includes(target.id)) {
      source.setAttribute(attrName, `${existingValue} ${target.id}`);
    } else if (!existingValue) {
      source.setAttribute(attrName, target.id);
    }
  }
}
