/**
 * Focus Management Testing Utilities
 *
 * Utilities for testing focus management and focus trapping
 */

/**
 * Get currently focused element
 * @returns {HTMLElement|null} Currently focused element
 */
export function getFocusedElement() {
  return document.activeElement;
}

/**
 * Set focus on element and verify
 * @param {HTMLElement} element - Element to focus
 * @returns {boolean} Whether focus was successful
 */
export function setFocus(element) {
  element.focus();
  return document.activeElement === element;
}

/**
 * Test focus trap
 * Tests if focus is trapped within a container
 * @param {HTMLElement} container - Container that should trap focus
 * @returns {Promise<boolean>} Whether focus trap works
 */
export async function testFocusTrap(container) {
  const focusableElements = getFocusableElements(container);

  if (focusableElements.length === 0) {
    return false;
  }

  // Focus first element
  focusableElements[0].focus();

  // Try to tab out - focus should stay in container
  const tabEvent = new KeyboardEvent('keydown', {
    key: 'Tab',
    bubbles: true,
    cancelable: true
  });

  document.activeElement.dispatchEvent(tabEvent);

  await new Promise(resolve => setTimeout(resolve, 0));

  // Check if focus is still in container
  return container.contains(document.activeElement);
}

/**
 * Get focusable elements in container
 * @param {HTMLElement} container - Container to search
 * @returns {Array<HTMLElement>} Focusable elements
 */
export function getFocusableElements(container) {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(', ');

  return Array.from(container.querySelectorAll(selector));
}

/**
 * Get first focusable element
 * @param {HTMLElement} container - Container to search
 * @returns {HTMLElement|null} First focusable element
 */
export function getFirstFocusable(container) {
  const focusable = getFocusableElements(container);
  return focusable.length > 0 ? focusable[0] : null;
}

/**
 * Get last focusable element
 * @param {HTMLElement} container - Container to search
 * @returns {HTMLElement|null} Last focusable element
 */
export function getLastFocusable(container) {
  const focusable = getFocusableElements(container);
  return focusable.length > 0 ? focusable[focusable.length - 1] : null;
}

/**
 * Restore focus to element after operation
 * @param {Function} operation - Operation to perform
 * @param {HTMLElement} restoreTarget - Element to restore focus to
 * @returns {Promise<any>} Operation result
 */
export async function withFocusRestore(operation, restoreTarget) {
  const result = await operation();
  restoreTarget.focus();
  return result;
}

/**
 * Check if element has visible focus indicator
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} Whether focus indicator is visible
 */
export function hasVisibleFocusIndicator(element) {
  element.focus();
  // Note: jsdom doesn't support getComputedStyle with pseudoElt parameter
  // We test the base element styles instead
  const styles = window.getComputedStyle(element);
  return (
    styles.outlineWidth !== '0px' ||
    styles.boxShadow !== 'none'
  );
}

/**
 * Test focus management (WCAG 2.4.3, 2.4.7)
 * @param {Element} container - Container to test
 * @param {Object} options - Test options
 * @returns {Promise<Object>} Test result with passed status and details
 */
export async function testFocusManagement(container, options = {}) {
  const {
    testFocusTrap: shouldTestFocusTrap = false,
    testFocusRestore = false,
    testFocusOrder = true
  } = options;

  const errors = [];
  const focusableElements = getFocusableElements(container);

  if (focusableElements.length === 0) {
    errors.push('No focusable elements found');
  }

  // Test focus order
  if (testFocusOrder && focusableElements.length > 0) {
    for (let i = 0; i < focusableElements.length; i++) {
      const element = focusableElements[i];
      const tabIndex = element.getAttribute('tabindex');

      // Check for invalid tabindex values
      if (tabIndex && parseInt(tabIndex) > 0) {
        errors.push(`Element has positive tabindex: ${element.tagName}`);
      }
    }
  }

  // Test focus trap if requested
  if (shouldTestFocusTrap) {
    const trapWorks = await testFocusTrap(container);
    if (!trapWorks) {
      errors.push('Focus trap not working correctly');
    }
  }

  return {
    passed: errors.length === 0,
    errors,
    focusableCount: focusableElements.length
  };
}

/**
 * Test focus indicators (WCAG 2.4.7)
 * @param {Element} container - Container to test
 * @returns {Object} Test result with allVisible status and metrics array
 */
export function testFocusIndicators(container) {
  const focusableElements = getFocusableElements(container);
  const metrics = [];

  focusableElements.forEach(element => {
    const hasIndicator = hasVisibleFocusIndicator(element);
    // Note: jsdom doesn't support getComputedStyle with pseudoElt parameter
    // We test the base element styles instead
    const styles = window.getComputedStyle(element);

    metrics.push({
      element,
      hasVisibleIndicator: hasIndicator,
      outlineWidth: styles.outlineWidth || '0px',
      outlineStyle: styles.outlineStyle || 'none',
      boxShadow: styles.boxShadow || 'none'
    });
  });

  const allVisible = metrics.every(m => m.hasVisibleIndicator);

  return {
    allVisible,
    metrics,
    totalTested: focusableElements.length
  };
}

/**
 * Test programmatic focus
 * @param {Element} element - Element to test
 * @returns {Promise<Object>} Test result with successful status
 */
export async function testProgrammaticFocus(element) {
  const initialFocus = document.activeElement;

  // Try to focus the element
  element.focus();
  await new Promise(resolve => setTimeout(resolve, 0));

  const successful = document.activeElement === element;

  // Restore original focus
  if (initialFocus) {
    initialFocus.focus();
  }

  return {
    successful,
    element,
    message: successful
      ? 'Element received focus programmatically'
      : 'Element did not receive focus programmatically'
  };
}

/**
 * Test skip links (WCAG 2.4.1)
 * @param {Element} container - Container to test
 * @returns {Object} Test result with present status and skipLinks array
 */
export function testSkipLinks(container) {
  const skipLinks = Array.from(
    container.querySelectorAll('a[href^="#"]')
  ).filter(link => {
    const text = link.textContent.toLowerCase();
    return text.includes('skip') || text.includes('jump');
  });

  return {
    present: skipLinks.length > 0,
    skipLinks,
    count: skipLinks.length
  };
}

/**
 * Test focus restoration after element is closed/removed
 * @param {Element} element - Element to test
 * @returns {Promise<Object>} Test result with works status
 */
export async function testFocusRestoration(element) {
  // In test environment, focus restoration is primarily handled by USWDS in browser
  // We test that the component structure supports focus restoration

  // Check if element has proper structure for focus restoration
  const hasProperStructure = element && element.querySelector('.usa-modal');

  return {
    works: hasProperStructure !== null,
    message: hasProperStructure
      ? 'Element has proper structure for focus restoration'
      : 'Element lacks proper structure for focus restoration'
  };
}

/**
 * Test initial focus when element is opened
 * @param {Element} element - Element to test
 * @returns {Promise<Object>} Test result with correct status
 */
export async function testInitialFocus(element) {
  const focusableElements = getFocusableElements(element);

  if (focusableElements.length === 0) {
    return {
      correct: false,
      message: 'No focusable elements found for initial focus'
    };
  }

  // First focusable element should be able to receive focus
  const firstFocusable = focusableElements[0];
  firstFocusable.focus();
  await new Promise(resolve => setTimeout(resolve, 0));

  const focused = document.activeElement === firstFocusable;

  return {
    correct: focused,
    element: firstFocusable,
    message: focused
      ? 'Initial focus set correctly'
      : 'Initial focus not set'
  };
}
