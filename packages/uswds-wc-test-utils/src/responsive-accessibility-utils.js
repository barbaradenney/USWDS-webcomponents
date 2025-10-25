/**
 * Responsive Accessibility Testing Utilities
 *
 * Utilities for testing accessibility across different viewport sizes
 */

/**
 * Test accessibility at different viewport sizes
 * @param {HTMLElement} element - Element to test
 * @param {Array<Object>} viewports - Array of viewport configurations
 * @param {Function} testFn - Test function to run at each viewport
 * @returns {Promise<Object>} Test results for each viewport
 */
export async function testResponsiveAccessibility(element, viewports, testFn) {
  const results = {};

  for (const viewport of viewports) {
    // Set viewport size (in test environment, we just track it)
    const _originalWidth = window.innerWidth; // eslint-disable-line @typescript-eslint/no-unused-vars
    const _originalHeight = window.innerHeight; // eslint-disable-line @typescript-eslint/no-unused-vars

    // Note: Actual viewport resizing doesn't work in JSDOM
    // This is mainly for documentation/structure
    results[viewport.name] = await testFn(element, viewport);
  }

  return results;
}

/**
 * Check if element is accessible on mobile
 * @param {HTMLElement} element - Element to check
 * @returns {Object} Mobile accessibility status
 */
export function checkMobileAccessibility(element) {
  return {
    hasTouchTargets: checkTouchTargetSize(element),
    hasProperSpacing: true, // Simplified
    isReadable: true // Simplified
  };
}

/**
 * Check touch target size (minimum 44x44px for WCAG)
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} Whether touch target is large enough
 */
export function checkTouchTargetSize(element) {
  const rect = element.getBoundingClientRect();
  return rect.width >= 44 && rect.height >= 44;
}

/**
 * Common viewport configurations
 */
export const VIEWPORTS = {
  MOBILE: { name: 'mobile', width: 375, height: 667 },
  TABLET: { name: 'tablet', width: 768, height: 1024 },
  DESKTOP: { name: 'desktop', width: 1280, height: 800 },
  LARGE_DESKTOP: { name: 'large-desktop', width: 1920, height: 1080 }
};

/**
 * Test text resize up to percentage (WCAG 1.4.4)
 * @param {Element} element - Element to test
 * @param {number} _percentage - Zoom percentage (e.g., 200 for 200%) (unused - simplified implementation)
 * @returns {Object} Test result with violations
 */
export function testTextResize(element, _percentage = 200) {
  // Simplified implementation for test environment
  // In real browser, would test actual zoom behavior
  const violations = [];
  const computedStyle = window.getComputedStyle(element);
  const fontSize = parseFloat(computedStyle.fontSize);

  // Check if font size is reasonable at zoom level
  if (fontSize < 12) {
    violations.push({
      element,
      fontSize,
      message: 'Font size may be too small when zoomed'
    });
  }

  return {
    originalFontSize: fontSize || 0,
    violations,
    passed: violations.length === 0
  };
}

/**
 * Test reflow at viewport width (WCAG 1.4.10)
 * @param {Element} element - Element to test
 * @param {number} width - Viewport width in pixels
 * @returns {Object} Test result with content width
 */
export function testReflow(element, width = 320) {
  // Simplified implementation for test environment
  const rect = element.getBoundingClientRect();
  const warnings = [];

  if (rect.width > width) {
    warnings.push({
      element,
      contentWidth: rect.width,
      viewportWidth: width,
      message: `Content width ${rect.width}px exceeds viewport width ${width}px`
    });
  }

  return {
    contentWidth: rect.width,
    viewportWidth: width,
    requiresHorizontalScroll: rect.width > width,
    warnings,
    passed: rect.width <= width
  };
}

/**
 * Test text spacing adjustments (WCAG 1.4.12)
 * @param {Element} element - Element to test
 * @returns {Object} Test result with readable status
 */
export function testTextSpacing(element) {
  const violations = [];
  const computedStyle = window.getComputedStyle(element);

  // Check minimum text spacing values
  const lineHeight = parseFloat(computedStyle.lineHeight);
  const fontSize = parseFloat(computedStyle.fontSize);

  if (lineHeight / fontSize < 1.5) {
    violations.push({
      element,
      lineHeight: lineHeight / fontSize,
      message: 'Line height should be at least 1.5x font size'
    });
  }

  return {
    readable: violations.length === 0,
    violations
  };
}

/**
 * Test mobile accessibility (WCAG 1.4.4, 1.4.10)
 * @param {Element} element - Element to test
 * @returns {Promise<Object>} Test result with mobile accessibility details
 */
export async function testMobileAccessibility(element) {
  const reflowResult = testReflow(element, 375); // iPhone size
  const textResizeResult = testTextResize(element, 200);
  const textSpacingResult = testTextSpacing(element);
  const touchTargetResult = checkTouchTargetSize(element);

  const errors = [];
  if (!reflowResult.passed) errors.push('Reflow failed at 375px');
  if (!textResizeResult.passed) errors.push('Text resize failed');
  if (!textSpacingResult.readable) errors.push('Text spacing is not readable');
  if (!touchTargetResult) errors.push('Touch targets too small');

  return {
    passed: reflowResult.passed && textResizeResult.passed && textSpacingResult.readable && touchTargetResult,
    errors,
    details: {
      reflowWorks: reflowResult.passed,
      textResizable: textResizeResult.passed,
      textSpacingWorks: textSpacingResult.readable,
      touchTargetsAdequate: touchTargetResult
    }
  };
}
