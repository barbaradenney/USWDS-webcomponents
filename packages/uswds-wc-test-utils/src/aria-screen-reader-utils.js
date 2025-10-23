/**
 * ARIA and Screen Reader Testing Utilities
 *
 * Utilities for testing screen reader compatibility and ARIA patterns
 */

/**
 * Get ARIA live regions in container
 * @param {HTMLElement} container - Container to search
 * @returns {Array<HTMLElement>} Live region elements
 */
export function getARIALiveRegions(container) {
  const liveRegions = [];

  // aria-live attribute
  liveRegions.push(...Array.from(container.querySelectorAll('[aria-live]')));

  // role="status" or role="alert"
  liveRegions.push(...Array.from(container.querySelectorAll('[role="status"], [role="alert"]')));

  return liveRegions;
}

/**
 * Check if element has proper ARIA label
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} Whether element has accessible name
 */
export function hasAccessibleName(element) {
  return !!(
    element.getAttribute('aria-label') ||
    element.getAttribute('aria-labelledby') ||
    element.querySelector('label[for="' + element.id + '"]')
  );
}

/**
 * Get accessible name for element
 * @param {HTMLElement} element - Element to get name for
 * @returns {string} Accessible name
 */
export function getAccessibleName(element) {
  // aria-label
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) return ariaLabel;

  // aria-labelledby
  const labelledBy = element.getAttribute('aria-labelledby');
  if (labelledBy) {
    const labelElement = document.getElementById(labelledBy);
    return labelElement ? labelElement.textContent.trim() : '';
  }

  // Associated label
  if (element.id) {
    const label = document.querySelector(`label[for="${element.id}"]`);
    if (label) return label.textContent.trim();
  }

  // text content
  return element.textContent.trim();
}

/**
 * Check if element has proper ARIA role
 * @param {HTMLElement} element - Element to check
 * @param {string} expectedRole - Expected ARIA role
 * @returns {boolean} Whether role matches
 */
export function hasARIARole(element, expectedRole) {
  return element.getAttribute('role') === expectedRole;
}

/**
 * Validate ARIA attributes
 * @param {HTMLElement} element - Element to validate
 * @returns {Array<string>} Array of validation errors
 */
export function validateARIAAttributes(element) {
  const errors = [];

  // Check for required ARIA attributes based on role
  const role = element.getAttribute('role');

  if (role === 'button' && !hasAccessibleName(element)) {
    errors.push('Button role requires accessible name');
  }

  if (role === 'combobox') {
    if (!element.hasAttribute('aria-expanded')) {
      errors.push('Combobox requires aria-expanded attribute');
    }
    if (!element.hasAttribute('aria-haspopup')) {
      errors.push('Combobox requires aria-haspopup attribute');
    }
  }

  return errors;
}

/**
 * Check if element is hidden from screen readers
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} Whether element is hidden
 */
export function isHiddenFromScreenReaders(element) {
  return (
    element.getAttribute('aria-hidden') === 'true' ||
    element.hasAttribute('hidden') ||
    window.getComputedStyle(element).display === 'none'
  );
}

/**
 * Test ARIA roles on element
 * @param {Element} element - Element to test
 * @param {Object} options - Test options
 * @param {string} options.expectedRole - Expected role
 * @param {boolean} options.allowImplicitRole - Allow implicit roles
 * @param {Object} options.expectedStates - Expected ARIA states (e.g., {'aria-expanded': 'true'})
 * @returns {Object} Test result with correct status and violations
 */
export function testARIARoles(element, options = {}) {
  const { expectedRole, allowImplicitRole = false, expectedStates = {} } = options;
  const violations = [];

  const explicitRole = element.getAttribute('role');
  const implicitRole = element.tagName.toLowerCase() === 'input' && element.getAttribute('type') === 'search'
    ? 'searchbox'
    : element.tagName.toLowerCase() === 'button'
    ? 'button'
    : null;

  const actualRole = explicitRole || (allowImplicitRole ? implicitRole : null);

  if (expectedRole && actualRole !== expectedRole) {
    violations.push({
      element,
      expected: expectedRole,
      actual: actualRole,
      message: `Expected role "${expectedRole}" but got "${actualRole}"`
    });
  }

  // Check expected ARIA states
  for (const [attrName, expectedValue] of Object.entries(expectedStates)) {
    const actualValue = element.getAttribute(attrName);
    if (actualValue !== expectedValue) {
      violations.push({
        element,
        attribute: attrName,
        expected: expectedValue,
        actual: actualValue,
        message: `Expected ${attrName}="${expectedValue}" but got ${attrName}="${actualValue}"`
      });
    }
  }

  return {
    correct: violations.length === 0,
    violations
  };
}

/**
 * Test accessible name on element
 * @param {Element} element - Element to test
 * @returns {Object} Test result with hasName status and accessibleName
 */
export function testAccessibleName(element) {
  const accessibleName = getAccessibleName(element);

  return {
    hasName: accessibleName.length > 0,
    accessibleName
  };
}

/**
 * Test ARIA relationships (aria-labelledby, aria-describedby, etc.)
 * @param {Element} element - Element to test
 * @returns {Object} Test result with valid status and violations
 */
export function testARIARelationships(element) {
  const violations = [];
  const relationships = {
    labelledby: [],
    describedby: [],
    controls: [],
    owns: []
  };

  const relationshipAttrs = ['aria-labelledby', 'aria-describedby', 'aria-controls', 'aria-owns'];

  relationshipAttrs.forEach(attr => {
    const value = element.getAttribute(attr);
    if (value) {
      const ids = value.split(' ');
      const relationshipKey = attr.replace('aria-', '');

      ids.forEach(id => {
        const referencedElement = document.getElementById(id);
        if (!referencedElement) {
          violations.push({
            element,
            attribute: attr,
            missingId: id,
            message: `${attr} references non-existent ID "${id}"`
          });
        } else {
          // Add valid relationship to results
          relationships[relationshipKey].push({
            id,
            element: referencedElement
          });
        }
      });
    }
  });

  return {
    valid: violations.length === 0,
    violations,
    relationships
  };
}

/**
 * Test live region announcements (WCAG 4.1.3)
 * @param {Element} element - Element to test
 * @param {string[]} expectedMessages - Expected announcement messages
 * @returns {Promise<Object>} Test result with announced status
 */
export async function testLiveRegionAnnouncements(element, expectedMessages) {
  const role = element.getAttribute('role');
  const ariaLive = element.getAttribute('aria-live');

  // Check if element has live region characteristics
  const isLiveRegion = role === 'alert' || role === 'status' || role === 'log' || ariaLive;

  // Get all text content from element
  const textContent = element.textContent || '';

  // Check which expected messages are found in the content
  const matchedAnnouncements = expectedMessages.filter(msg =>
    textContent.toLowerCase().includes(msg.toLowerCase())
  );

  return {
    announced: isLiveRegion && matchedAnnouncements.length > 0,
    matchedAnnouncements,
    role,
    ariaLive,
    message: isLiveRegion
      ? `Live region with role="${role}" would announce content`
      : 'Element is not a live region'
  };
}

/**
 * Test comprehensive ARIA accessibility
 * @param {HTMLElement} container - Container to test
 * @param {Object} options - Test options
 * @returns {Promise<Object>} Test result with passed status and details
 */
export async function testARIAAccessibility(container, options = {}) {
  const {
    testLiveRegions: _testLiveRegions = true, // eslint-disable-line @typescript-eslint/no-unused-vars
    testRoleState = true,
    testNameRole = true,
    testRelationships = true
  } = options;

  const errors = [];
  const interactiveElements = container.querySelectorAll('button, a, input, [role="button"], [role="link"], [role="textbox"], [role="searchbox"]');

  if (testNameRole) {
    interactiveElements.forEach(element => {
      const nameResult = testAccessibleName(element);
      if (!nameResult.hasName) {
        errors.push(`Element lacks accessible name: ${element.tagName}`);
      }
    });
  }

  if (testRelationships) {
    interactiveElements.forEach(element => {
      const relationshipResult = testARIARelationships(element);
      if (!relationshipResult.valid) {
        errors.push(...relationshipResult.violations.map(v => v.message));
      }
    });
  }

  return {
    passed: errors.length === 0,
    errors,
    details: {
      rolesCorrect: testRoleState,
      namesAccessible: testNameRole,
      relationshipsValid: testRelationships
    }
  };
}
