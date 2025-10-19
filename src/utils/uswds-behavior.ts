/**
 * USWDS Behavior Integration Utilities
 *
 * This module provides utilities for integrating official USWDS JavaScript
 * behaviors with web components to ensure 100% compliance.
 */

// Import USWDS behaviors (these will be available from the USWDS package)
// Note: These imports might need adjustment based on actual USWDS package structure

export interface USWDSBehavior {
  init(el: Element): void;
  teardown?(el: Element): void;
  on?(el: Element): void;
  off?(el: Element): void;
}

/**
 * Base class for components that integrate with USWDS JavaScript behaviors
 */
export class USWDSBehaviorMixin {
  private _uswdsBehavior?: USWDSBehavior;
  private _isInitialized = false;

  /**
   * Initialize USWDS behavior on the component
   * @param behavior - The USWDS behavior to initialize
   * @param element - The element to initialize behavior on (defaults to this)
   */
  protected initUSWDSBehavior(behavior: USWDSBehavior, element?: Element): void {
    if (this._isInitialized) {
      this.teardownUSWDSBehavior();
    }

    this._uswdsBehavior = behavior;
    const targetElement = element || (this as any);

    try {
      // Initialize the USWDS behavior
      this._uswdsBehavior.init(targetElement);
      this._isInitialized = true;
    } catch (error) {
      console.warn('Failed to initialize USWDS behavior:', error);
    }
  }

  /**
   * Teardown USWDS behavior
   */
  protected teardownUSWDSBehavior(): void {
    if (this._uswdsBehavior && this._isInitialized) {
      try {
        if (this._uswdsBehavior.teardown) {
          this._uswdsBehavior.teardown(this as any);
        } else if (this._uswdsBehavior.off) {
          this._uswdsBehavior.off(this as any);
        }
      } catch (error) {
        console.warn('Failed to teardown USWDS behavior:', error);
      }
      this._isInitialized = false;
    }
  }

  /**
   * Re-initialize USWDS behavior (useful after DOM changes)
   */
  protected reinitUSWDSBehavior(): void {
    if (this._uswdsBehavior) {
      const behavior = this._uswdsBehavior;
      this.teardownUSWDSBehavior();
      this.initUSWDSBehavior(behavior);
    }
  }
}

/**
 * Load USWDS behavior dynamically
 * @param behaviorPath - Path to the USWDS behavior module
 * @returns Promise resolving to the behavior module
 */
export async function loadUSWDSBehavior(behaviorPath: string): Promise<USWDSBehavior> {
  try {
    // For now, we'll use dynamic imports
    const module = await import(behaviorPath);
    return module.default || module;
  } catch (error) {
    console.error(`Failed to load USWDS behavior from ${behaviorPath}:`, error);
    throw error;
  }
}

/**
 * Check if USWDS styles are loaded
 */
export function isUSWDSLoaded(): boolean {
  // Check if USWDS CSS classes exist
  const testEl = document.createElement('div');
  testEl.className = 'usa-combo-box';
  testEl.style.position = 'absolute';
  testEl.style.visibility = 'hidden';
  document.body.appendChild(testEl);

  const styles = window.getComputedStyle(testEl);
  const isLoaded = styles.position !== 'static' || styles.display !== 'inline';

  document.body.removeChild(testEl);
  return isLoaded;
}

/**
 * Wait for USWDS to be loaded
 */
export function waitForUSWDS(timeout = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (isUSWDSLoaded()) {
      resolve();
      return;
    }

    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      if (isUSWDSLoaded()) {
        clearInterval(checkInterval);
        resolve();
      } else if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval);
        reject(new Error('USWDS styles not loaded within timeout'));
      }
    }, 100);
  });
}
