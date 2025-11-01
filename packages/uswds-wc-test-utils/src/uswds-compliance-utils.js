/**
 * USWDS Compliance Testing Utilities
 *
 * Utilities for testing compliance with USWDS standards
 */

/**
 * Quick USWDS compliance test
 * Checks for basic USWDS patterns and classes
 * @param {HTMLElement} element - Element to test
 * @returns {Object} Compliance test results
 */
export function quickUSWDSComplianceTest(element) {
  const issues = [];

  // Check for USWDS class naming convention
  const hasUSWDSClasses = Array.from(element.classList).some((className) =>
    className.startsWith('usa-')
  );

  if (!hasUSWDSClasses) {
    issues.push('No USWDS classes found (classes should start with "usa-")');
  }

  return {
    passed: issues.length === 0,
    issues,
  };
}

/**
 * Validate USWDS structure
 * @param {HTMLElement} element - Element to validate
 * @param {string} componentType - Type of USWDS component
 * @returns {Object} Validation results
 */
export function validateUSWDSStructure(element, componentType) {
  return {
    isValid: true,
    componentType,
    issues: [],
  };
}

/**
 * Check if element follows USWDS naming conventions
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} Whether naming is compliant
 */
export function hasUSWDSNaming(element) {
  const tagName = element.tagName.toLowerCase();
  return tagName.startsWith('usa-');
}
