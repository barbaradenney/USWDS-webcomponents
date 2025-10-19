/**
 * USWDS Initialization Registry
 *
 * Prevents duplicate USWDS component initialization across the entire application.
 * This solves the fundamental problem of multiple USWDS instances causing conflicts.
 */

interface InitializationRecord {
  componentType: string;
  elementId: string;
  timestamp: number;
  module: any;
}

class USWDSInitializationRegistry {
  private static instance: USWDSInitializationRegistry;
  private initialized = new Map<string, InitializationRecord>();

  private constructor() {}

  static getInstance(): USWDSInitializationRegistry {
    if (!USWDSInitializationRegistry.instance) {
      USWDSInitializationRegistry.instance = new USWDSInitializationRegistry();
    }
    return USWDSInitializationRegistry.instance;
  }

  /**
   * Check if a component is already initialized
   */
  isInitialized(componentType: string, elementId: string): boolean {
    const key = `${componentType}:${elementId}`;
    return this.initialized.has(key);
  }

  /**
   * Register a component as initialized
   */
  register(componentType: string, elementId: string, module: any): void {
    const key = `${componentType}:${elementId}`;

    if (this.initialized.has(key)) {
      console.warn(`⚠️ Component ${componentType}:${elementId} already initialized, skipping`);
      return;
    }

    this.initialized.set(key, {
      componentType,
      elementId,
      timestamp: Date.now(),
      module
    });

    console.log(`✅ Registered ${componentType}:${elementId} for USWDS initialization`);
  }

  /**
   * Unregister a component (when disconnected)
   */
  unregister(componentType: string, elementId: string): void {
    const key = `${componentType}:${elementId}`;
    const record = this.initialized.get(key);

    if (record) {
      // Clean up the USWDS module if it has an off method
      if (record.module && typeof record.module.off === 'function') {
        try {
          record.module.off(document.getElementById(elementId));
          console.log(`🧹 Cleaned up USWDS module for ${componentType}:${elementId}`);
        } catch (error) {
          console.warn(`⚠️ Error cleaning up USWDS module:`, error);
        }
      }

      this.initialized.delete(key);
      console.log(`🗑️ Unregistered ${componentType}:${elementId}`);
    }
  }

  /**
   * Get initialization status for debugging
   */
  getStatus(): { component: string; initialized: boolean; timestamp: number }[] {
    return Array.from(this.initialized.entries()).map(([key, record]) => ({
      component: key,
      initialized: true,
      timestamp: record.timestamp
    }));
  }

  /**
   * Clear all registrations (for testing/development)
   */
  clear(): void {
    console.log(`🔄 Clearing all USWDS initialization registrations`);

    // Clean up all modules first
    for (const [key, record] of this.initialized.entries()) {
      if (record.module && typeof record.module.off === 'function') {
        try {
          const element = document.getElementById(record.elementId);
          if (element) {
            record.module.off(element);
          }
        } catch (error) {
          console.warn(`⚠️ Error cleaning up module for ${key}:`, error);
        }
      }
    }

    this.initialized.clear();
  }
}

// Export singleton instance
export const uswdsRegistry = USWDSInitializationRegistry.getInstance();

/**
 * Utility function for components to use
 */
export function initializeUSWDSComponent(
  componentType: string,
  element: HTMLElement,
  initializationFn: () => Promise<any>
): Promise<void> {
  const elementId = element.id || `${componentType}-${Math.random().toString(36).substr(2, 9)}`;

  // Ensure element has an ID for tracking
  if (!element.id) {
    element.id = elementId;
  }

  // Check if already initialized
  if (uswdsRegistry.isInitialized(componentType, elementId)) {
    console.log(`⚠️ ${componentType}:${elementId} already initialized, skipping`);
    return Promise.resolve();
  }

  // Initialize and register
  return initializationFn().then(module => {
    uswdsRegistry.register(componentType, elementId, module);
  }).catch(error => {
    console.warn(`❌ Failed to initialize ${componentType}:${elementId}:`, error);
  });
}

/**
 * Utility function for cleanup
 */
export function cleanupUSWDSComponent(componentType: string, element: HTMLElement): void {
  const elementId = element.id;
  if (elementId) {
    uswdsRegistry.unregister(componentType, elementId);
  }
}