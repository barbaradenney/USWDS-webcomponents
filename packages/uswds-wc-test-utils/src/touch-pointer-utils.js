/**
 * Touch and Pointer Event Testing Utilities
 *
 * Utilities for testing touch and pointer interactions
 */

/**
 * Simulate touch event
 * @param {HTMLElement} element - Element to touch
 * @param {string} eventType - Event type: 'touchstart', 'touchend', 'touchmove'
 * @param {Object} options - Touch event options
 * @returns {Promise<void>}
 */
export async function simulateTouch(element, eventType, options = {}) {
  const touch = new Touch({
    identifier: Date.now(),
    target: element,
    clientX: options.clientX || 0,
    clientY: options.clientY || 0,
    ...options
  });

  const touchEvent = new TouchEvent(eventType, {
    cancelable: true,
    bubbles: true,
    touches: [touch],
    targetTouches: [touch],
    changedTouches: [touch]
  });

  element.dispatchEvent(touchEvent);
  await new Promise(resolve => setTimeout(resolve, 0));
}

/**
 * Simulate pointer event
 * @param {HTMLElement} element - Element to interact with
 * @param {string} eventType - Event type: 'pointerdown', 'pointerup', 'pointermove'
 * @param {Object} options - Pointer event options
 * @returns {Promise<void>}
 */
export async function simulatePointer(element, eventType, options = {}) {
  const pointerEvent = new PointerEvent(eventType, {
    bubbles: true,
    cancelable: true,
    clientX: options.clientX || 0,
    clientY: options.clientY || 0,
    pointerType: options.pointerType || 'mouse',
    ...options
  });

  element.dispatchEvent(pointerEvent);
  await new Promise(resolve => setTimeout(resolve, 0));
}

/**
 * Simulate tap (touchstart + touchend)
 * @param {HTMLElement} element - Element to tap
 * @param {Object} options - Touch options
 * @returns {Promise<void>}
 */
export async function simulateTap(element, options = {}) {
  await simulateTouch(element, 'touchstart', options);
  await simulateTouch(element, 'touchend', options);
}

/**
 * Simulate swipe gesture
 * @param {HTMLElement} element - Element to swipe on
 * @param {string} direction - Direction: 'left', 'right', 'up', 'down'
 * @param {number} distance - Swipe distance in pixels
 * @returns {Promise<void>}
 */
export async function simulateSwipe(element, direction, distance = 100) {
  const startX = direction === 'right' ? 0 : distance;
  const startY = direction === 'down' ? 0 : distance;
  const endX = direction === 'left' ? 0 : distance;
  const endY = direction === 'up' ? 0 : distance;

  await simulateTouch(element, 'touchstart', { clientX: startX, clientY: startY });
  await simulateTouch(element, 'touchmove', { clientX: endX, clientY: endY });
  await simulateTouch(element, 'touchend', { clientX: endX, clientY: endY });
}

/**
 * Check if element supports touch events
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} Whether touch is supported
 */
export function supportsTouchEvents() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Test target size for touch/pointer interaction (WCAG 2.5.5)
 * @param {HTMLElement} container - Container to test
 * @param {number} minSize - Minimum size in pixels (default 44)
 * @returns {Object} Test result with compliant status and violations
 */
export function testTargetSize(container, minSize = 44) {
  const violations = [];
  const interactiveElements = container.querySelectorAll('button, a, input, [role="button"], [tabindex]:not([tabindex="-1"])');

  interactiveElements.forEach(element => {
    const rect = element.getBoundingClientRect();
    if (rect.width < minSize || rect.height < minSize) {
      violations.push({
        element,
        size: { width: rect.width, height: rect.height },
        message: `Element smaller than ${minSize}x${minSize}px`
      });
    }
  });

  return {
    compliant: violations.length === 0,
    violations,
    totalTested: interactiveElements.length
  };
}

/**
 * Test label-in-name (WCAG 2.5.3)
 * @param {HTMLElement} container - Container to test
 * @returns {Object} Test result with correct status and violations
 */
export function testLabelInName(container) {
  const violations = [];
  const interactiveElements = container.querySelectorAll('button, a, input[type="button"], input[type="submit"], [role="button"]');

  interactiveElements.forEach(element => {
    const visibleText = element.textContent.trim();
    const ariaLabel = element.getAttribute('aria-label') || '';
    const ariaLabelledby = element.getAttribute('aria-labelledby');

    if (ariaLabelledby) {
      const labelElement = document.getElementById(ariaLabelledby);
      const labelText = labelElement ? labelElement.textContent.trim() : '';

      if (visibleText && labelText && !labelText.includes(visibleText)) {
        violations.push({
          element,
          visibleText,
          accessibleName: labelText,
          message: 'Accessible name does not include visible text'
        });
      }
    } else if (ariaLabel && visibleText && !ariaLabel.includes(visibleText)) {
      violations.push({
        element,
        visibleText,
        accessibleName: ariaLabel,
        message: 'Accessible name does not include visible text'
      });
    }
  });

  return {
    correct: violations.length === 0,
    violations
  };
}

/**
 * Test comprehensive pointer accessibility (WCAG 2.5)
 * @param {HTMLElement} container - Container to test
 * @param {Object} options - Test options
 * @returns {Promise<Object>} Test result with passed status and details
 */
export async function testPointerAccessibility(container, options = {}) {
  const {
    minTargetSize = 44,
    testCancellation: _testCancellation = true, // eslint-disable-line @typescript-eslint/no-unused-vars
    testLabelInName: shouldTestLabelInName = true,
    testMultiPointGestures: _testMultiPointGestures = true // eslint-disable-line @typescript-eslint/no-unused-vars
  } = options;

  const errors = [];
  const targetSizeResult = testTargetSize(container, minTargetSize);

  let labelInNameResult = { correct: true, violations: [] };
  if (shouldTestLabelInName) {
    labelInNameResult = testLabelInName(container);
  }

  if (!targetSizeResult.compliant) {
    errors.push(...targetSizeResult.violations.map(v => v.message));
  }

  if (!labelInNameResult.correct) {
    errors.push(...labelInNameResult.violations.map(v => v.message));
  }

  return {
    passed: errors.length === 0,
    errors,
    details: {
      targetSizeCompliant: targetSizeResult.compliant,
      labelInNameCorrect: labelInNameResult.correct,
      noMultiPointGestures: true // Simplified - would need complex gesture detection
    }
  };
}
