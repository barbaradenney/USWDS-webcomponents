/**
 * USWDS Integration Testing Utilities
 *
 * Utilities for testing integration with USWDS JavaScript
 */

/**
 * Check if USWDS JavaScript has enhanced the element
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} Whether USWDS has enhanced the element
 */
export function isUSWDSEnhanced(element) {
  return element.hasAttribute('data-enhanced') &&
         element.getAttribute('data-enhanced') === 'true';
}

/**
 * Wait for USWDS transformation
 * @param {HTMLElement} element - Element to wait for
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<boolean>} Whether transformation completed
 */
export async function waitForUSWDSTransformation(element, timeout = 1000) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (isUSWDSEnhanced(element)) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  return false;
}

/**
 * Check if USWDS global object is available
 * @returns {boolean} Whether window.USWDS exists
 */
export function isUSWDSLoaded() {
  return typeof window !== 'undefined' && typeof window.USWDS !== 'undefined';
}

/**
 * Get USWDS component instance
 * @param {HTMLElement} element - Element to get instance for
 * @param {string} _componentName - USWDS component name (unused - for API compatibility)
 * @returns {Object|null} USWDS component instance or null
 */
export function getUSWDSInstance(element, _componentName) {
  if (!isUSWDSLoaded()) {
    return null;
  }

  // USWDS stores component instances in element data
  return element._uswdsComponent || null;
}

/**
 * Setup USWDS integration monitoring for tests
 * This is a no-op function for test compatibility
 * @returns {void}
 */
export function setupUSWDSIntegrationMonitoring() {
  // No-op: This function exists for test compatibility
  // Individual tests handle their own USWDS integration verification
}

/**
 * USWDS test configurations
 */
export const USWDS_TEST_CONFIGS = {
  DATE_PICKER_FALLBACK_OK: {
    componentType: 'date-picker',
    expectUSWDSEnhancement: false,
    allowFallback: true,
    maxElementCounts: { buttons: 1, calendars: 1, inputs: 2 }
  }
};

/**
 * Test USWDS integration
 * @param {HTMLElement} element - Element to test
 * @param {Object} config - Test configuration
 * @returns {Promise<Object>} Test result
 */
export async function testUSWDSIntegration(element, config) {
  const result = {
    isUSWDSLoaded: isUSWDSLoaded(),
    hasCorrectInitialization: true,
    hasDoubleInitialization: false,
    elementCounts: {
      buttons: element.querySelectorAll('.usa-date-picker__button').length,
      calendars: element.querySelectorAll('.usa-date-picker__calendar').length,
      inputs: element.querySelectorAll('input').length
    },
    errors: [],
    warnings: []
  };

  // Check for double initialization
  if (result.elementCounts.buttons > config.maxElementCounts.buttons) {
    result.hasDoubleInitialization = true;
    result.errors.push(`Too many buttons: ${result.elementCounts.buttons}`);
  }

  return result;
}

/**
 * Assert USWDS integration is correct
 * @param {Object} result - Test result from testUSWDSIntegration
 * @throws {Error} If integration has errors
 */
export function assertUSWDSIntegration(result) {
  if (result.errors.length > 0) {
    throw new Error(`USWDS integration errors: ${result.errors.join(', ')}`);
  }

  if (result.hasDoubleInitialization) {
    throw new Error('Double initialization detected');
  }
}
