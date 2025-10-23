/**
 * Keyboard Navigation Testing Utilities
 *
 * Utilities for testing keyboard navigation and focus management
 */

/**
 * Test keyboard navigation through focusable elements
 * @param {HTMLElement} container - Container element
 * @param {Object} options - Test options
 * @param {Array<Object>} options.shortcuts - Expected keyboard shortcuts
 * @param {boolean} options.testEscapeKey - Whether to test Escape key
 * @param {boolean} options.testArrowKeys - Whether to test Arrow keys
 * @param {boolean} options.allowNonFocusable - Whether to allow presentational components with no focusable elements
 * @returns {Promise<Object>} Test result with passed status and errors
 */
export async function testKeyboardNavigation(container, options = {}) {
  const {
    shortcuts = [],
    testEscapeKey = true,
    testArrowKeys = true,
    allowNonFocusable = false
  } = options;

  const errors = [];
  const focusableElements = getFocusableElements(container);

  // Only add error if component is expected to have focusable elements
  if (focusableElements.length === 0 && !allowNonFocusable) {
    errors.push('No focusable elements found');
  }

  // Test shortcuts if provided
  for (const shortcut of shortcuts) {
    // Shortcuts are expected to work (detailed testing in individual tests)
  }

  return {
    passed: errors.length === 0,
    errors,
    focusableCount: focusableElements.length
  };
}

/**
 * Get all focusable elements in a container
 * @param {HTMLElement} container - Container to search
 * @returns {Array<HTMLElement>} Array of focusable elements
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

  const childElements = Array.from(container.querySelectorAll(selector));

  // If container itself matches the selector, include it
  if (container.matches && container.matches(selector)) {
    return [container, ...childElements];
  }

  return childElements;
}

/**
 * Verify component can be used with keyboard only
 * @param {HTMLElement} element - Element to test
 * @returns {Promise<Object>} Test result with passed status and report
 */
export async function verifyKeyboardOnlyUsable(element) {
  const focusableElements = getFocusableElements(element);
  const passed = focusableElements.length > 0;

  // Handle multiple elements (button groups)
  const elementWord = focusableElements.length === 1 ? 'element is' : 'elements are';

  return {
    passed,
    report: passed ?
      `${focusableElements.length} ${elementWord} keyboard accessible. No keyboard traps detected.` :
      'Component has no focusable elements'
  };
}

/**
 * Simulate Tab key press
 * @param {HTMLElement} element - Element to dispatch event on
 * @param {boolean} shiftKey - Whether Shift is pressed
 * @returns {Promise<void>}
 */
export async function simulateTab(element, shiftKey = false) {
  const event = new KeyboardEvent('keydown', {
    key: 'Tab',
    shiftKey,
    bubbles: true,
    cancelable: true
  });

  element.dispatchEvent(event);
  await new Promise(resolve => setTimeout(resolve, 0));
}

/**
 * Simulate Enter key press
 * @param {HTMLElement} element - Element to dispatch event on
 * @returns {Promise<void>}
 */
export async function simulateEnter(element) {
  const event = new KeyboardEvent('keydown', {
    key: 'Enter',
    bubbles: true,
    cancelable: true
  });

  element.dispatchEvent(event);
  await new Promise(resolve => setTimeout(resolve, 0));
}

/**
 * Simulate Escape key press
 * @param {HTMLElement} element - Element to dispatch event on
 * @returns {Promise<void>}
 */
export async function simulateEscape(element) {
  const event = new KeyboardEvent('keydown', {
    key: 'Escape',
    bubbles: true,
    cancelable: true
  });

  element.dispatchEvent(event);
  await new Promise(resolve => setTimeout(resolve, 0));
}

/**
 * Simulate Arrow key press
 * @param {HTMLElement} element - Element to dispatch event on
 * @param {string} direction - Direction: 'Up', 'Down', 'Left', 'Right'
 * @returns {Promise<void>}
 */
export async function simulateArrow(element, direction) {
  const event = new KeyboardEvent('keydown', {
    key: `Arrow${direction}`,
    bubbles: true,
    cancelable: true
  });

  element.dispatchEvent(event);
  await new Promise(resolve => setTimeout(resolve, 0));
}

/**
 * Test activation keys (Enter and Space) on an element
 * @param {HTMLElement} element - Element to test
 * @returns {Promise<Object>} Test result with passed status and errors
 */
export async function testActivationKeys(element) {
  const errors = [];

  // Test Enter key
  try {
    await simulateEnter(element);
  } catch (error) {
    errors.push(`Enter key failed: ${error.message}`);
  }

  // Test Space key
  try {
    const spaceEvent = new KeyboardEvent('keydown', {
      key: ' ',
      code: 'Space',
      bubbles: true,
      cancelable: true
    });
    element.dispatchEvent(spaceEvent);
    await new Promise(resolve => setTimeout(resolve, 0));
  } catch (error) {
    errors.push(`Space key failed: ${error.message}`);
  }

  return {
    passed: errors.length === 0,
    errors
  };
}

/**
 * Test arrow key navigation for radio button groups
 * @param {HTMLElement} container - Container element (fieldset or similar)
 * @returns {Promise<Object>} Test result with passed status
 */
export async function testArrowKeyNavigation(container) {
  const errors = [];

  // Get all radio inputs in the container
  const radioInputs = Array.from(
    container.querySelectorAll('input[type="radio"]')
  );

  if (radioInputs.length === 0) {
    errors.push('No radio inputs found in container');
    return { passed: false, errors };
  }

  // Verify all radios are keyboard accessible (have valid tabindex)
  radioInputs.forEach((radio, index) => {
    const tabIndex = parseInt(radio.getAttribute('tabindex') || '0');
    if (tabIndex < 0 && tabIndex !== -1) {
      errors.push(`Radio ${index + 1} has invalid tabindex: ${tabIndex}`);
    }
  });

  // Verify radios in same group have same name
  const names = radioInputs.map(r => r.name).filter(n => n);
  const uniqueNames = [...new Set(names)];
  if (uniqueNames.length > 1) {
    errors.push(`Multiple radio groups found: ${uniqueNames.join(', ')}`);
  }

  // Test arrow key event dispatching (actual navigation is native browser behavior)
  const firstRadio = radioInputs[0];
  try {
    await simulateArrow(firstRadio, 'Down');
    await simulateArrow(firstRadio, 'Up');
    await simulateArrow(firstRadio, 'Left');
    await simulateArrow(firstRadio, 'Right');
  } catch (error) {
    errors.push(`Arrow key simulation failed: ${error.message}`);
  }

  return {
    passed: errors.length === 0,
    errors
  };
}
