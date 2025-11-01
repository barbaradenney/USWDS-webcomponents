/**
 * Iframe Event Delegation Mixin
 *
 * Provides a standard pattern for fixing USWDS event delegation issues
 * in iframe environments like Storybook.
 *
 * This prevents the combo-box toggle button issue from recurring
 * across all interactive USWDS components.
 */

export interface IframeEventDelegationOptions {
  /** CSS selector for elements that should have event handlers */
  interactiveSelector: string;
  /** Delay before checking/fixing event delegation (ms) */
  checkDelay?: number;
  /** Whether to log debug information */
  debug?: boolean;
}

/**
 * Mixin that adds iframe event delegation fixing capability to USWDS components
 */
export function IframeEventDelegationMixin<T extends new (...args: any[]) => any>(Base: T) {
  return class extends Base {
    /**
     * Fixes USWDS event delegation in iframe environments (like Storybook)
     * @public For TypeScript declaration compatibility in mixins
     */
    fixIframeEventDelegation(options: IframeEventDelegationOptions): void {
      const { interactiveSelector, checkDelay = 50, debug = false } = options;

      setTimeout(() => {
        const interactiveElements = this.querySelectorAll(interactiveSelector);

        if (debug) {
          console.log(`🔍 Checking iframe event delegation for ${interactiveSelector}:`, {
            found: interactiveElements.length,
            isIframe: this.isInIframe(),
          });
        }

        // Only fix if we're in an iframe (Storybook) and elements lack event handlers
        if (this.isInIframe()) {
          interactiveElements.forEach((element: Element) => {
            const hasEventHandler = this.hasEventHandler(element);

            if (!hasEventHandler) {
              if (debug) {
                console.log(`🔧 Fixing event delegation for:`, element);
              }
              this.reestablishUSWDSEventDelegation(element);
            }
          });
        }
      }, checkDelay);
    }

    /**
     * Checks if the component is running in an iframe (like Storybook)
     * @public For TypeScript declaration compatibility in mixins
     */
    isInIframe(): boolean {
      return typeof window !== 'undefined' && window.document !== window.parent?.document;
    }

    /**
     * Checks if an element has USWDS event handlers attached
     * @public For TypeScript declaration compatibility in mixins
     */
    hasEventHandler(element: Element): boolean {
      const htmlElement = element as HTMLElement;
      return !!(
        htmlElement.onclick ||
        htmlElement.getAttribute('aria-expanded') !== null ||
        htmlElement.getAttribute('data-uswds-initialized') === 'true'
      );
    }

    /**
     * Re-establishes USWDS event delegation for a specific element
     * Override this method in component implementations
     * @public For TypeScript declaration compatibility in mixins
     */
    reestablishUSWDSEventDelegation(_element: Element): void {
      // Default implementation - call USWDS module's .on() method if available
      const uswdsModule = (this as any).uswdsModule || (this as any).comboBoxModule;
      if (uswdsModule?.on) {
        try {
          uswdsModule.on(this);
        } catch (error) {
          // Silent failure is expected in some environments
        }
      }
    }

    /**
     * Standard pattern for USWDS ID restoration
     * Many USWDS components clear IDs during transformation
     * @public For TypeScript declaration compatibility in mixins
     */
    restoreUSWDSElementId(): void {
      const selectElement = this.querySelector('select');
      const labelElement = this.querySelector('label');
      const labelFor = labelElement?.getAttribute('for');

      if (!selectElement?.id && labelFor) {
        selectElement.id = labelFor;
      }
    }
  };
}

/**
 * Decorator for easy application of iframe event delegation
 */
export function FixIframeEventDelegation(options: IframeEventDelegationOptions) {
  return function <T extends new (...args: any[]) => any>(constructor: T) {
    return class extends IframeEventDelegationMixin(constructor) {
      connectedCallback() {
        super.connectedCallback();
        // Apply the fix after USWDS initialization
        setTimeout(() => {
          this.restoreUSWDSElementId();
          this.fixIframeEventDelegation(options);
        }, 150);
      }
    };
  };
}
