/**
 * CSS Class Testing Utilities
 *
 * Utilities for testing CSS class manipulation
 */

/**
 * Assert element has CSS class
 * @param {HTMLElement} element - Element to check
 * @param {string} className - Expected class name
 */
export function assertHasClass(element, className) {
  if (!element.classList.contains(className)) {
    throw new Error(`Expected element to have class "${className}"`);
  }
}

/**
 * Assert element does not have CSS class
 * @param {HTMLElement} element - Element to check
 * @param {string} className - Class name that should not be present
 */
export function assertDoesNotHaveClass(element, className) {
  if (element.classList.contains(className)) {
    throw new Error(`Expected element to NOT have class "${className}"`);
  }
}

/**
 * Assert element has all specified classes
 * @param {HTMLElement} element - Element to check
 * @param {Array<string>} classNames - Array of class names
 */
export function assertHasAllClasses(element, classNames) {
  for (const className of classNames) {
    assertHasClass(element, className);
  }
}

/**
 * Get all USWDS classes on element
 * @param {HTMLElement} element - Element to check
 * @returns {Array<string>} Array of USWDS class names
 */
export function getUSWDSClasses(element) {
  return Array.from(element.classList).filter((className) => className.startsWith('usa-'));
}

/**
 * Check if element has USWDS modifier class
 * @param {HTMLElement} element - Element to check
 * @param {string} baseClass - Base USWDS class (e.g., 'usa-button')
 * @param {string} modifier - Modifier (e.g., 'primary')
 * @returns {boolean} Whether element has the modifier class
 */
export function hasUSWDSModifier(element, baseClass, modifier) {
  return element.classList.contains(`${baseClass}--${modifier}`);
}

/**
 * Validate CSS class string format (no extra spaces, proper format)
 * @param {string} classString - Class string to validate
 * @param {string} context - Context for error messages
 * @throws {Error} If class string has formatting issues
 */
export function validateCSSClassString(classString, context = 'Element') {
  if (typeof classString !== 'string') {
    throw new Error(`${context}: className must be a string, got ${typeof classString}`);
  }

  // Check for double spaces
  if (classString.includes('  ')) {
    throw new Error(`${context}: className contains double spaces: "${classString}"`);
  }

  // Check for leading space
  if (classString.startsWith(' ')) {
    throw new Error(`${context}: className has leading space: "${classString}"`);
  }

  // Check for trailing space
  if (classString.endsWith(' ')) {
    throw new Error(`${context}: className has trailing space: "${classString}"`);
  }
}

/**
 * Validate all CSS classes on an element and its descendants
 * @param {HTMLElement} element - Element to validate
 * @param {string} context - Context for error messages
 * @throws {Error} If any class string has formatting issues
 */
export function validateAllCSSClasses(element, context = 'Component') {
  // Validate root element
  if (element.className) {
    validateCSSClassString(element.className, `${context} root element`);
  }

  // Validate all descendant elements with classes
  const elementsWithClasses = element.querySelectorAll('[class]');
  for (const el of elementsWithClasses) {
    if (el.className && typeof el.className === 'string') {
      validateCSSClassString(el.className, `${context} descendant element`);
    }
  }
}

/**
 * Validate USWDS class pattern on element
 * @param {HTMLElement} element - Element to check
 * @param {string} baseClass - Base USWDS class (e.g., 'usa-button')
 * @param {Array<string>} [expectedModifiers=[]] - Expected modifier classes
 * @throws {Error} If element doesn't have proper USWDS class structure
 */
export function validateUSWDSClassPattern(element, baseClass, expectedModifiers = []) {
  // Validate base class exists
  if (!element.classList.contains(baseClass)) {
    throw new Error(`Element must have base class "${baseClass}"`);
  }

  // Validate class string format
  validateCSSClassString(element.className, 'USWDS element');

  // Validate expected modifiers are present
  for (const modifier of expectedModifiers) {
    if (!element.classList.contains(modifier)) {
      throw new Error(`Element should have modifier class "${modifier}"`);
    }

    // Validate modifier follows USWDS BEM pattern if it's a modifier
    if (modifier.includes('--') && !modifier.startsWith(baseClass.split('__')[0] + '--')) {
      throw new Error(
        `Modifier "${modifier}" doesn't follow USWDS BEM pattern for base "${baseClass}"`
      );
    }
  }
}
