/**
 * Form Error Testing Utilities
 *
 * Utilities for testing form validation and error handling
 */

/**
 * Get form error messages
 * @param {HTMLElement} container - Container to search
 * @returns {Array<string>} Array of error messages
 */
export function getFormErrors(container) {
  const errorElements = container.querySelectorAll('.usa-error-message');
  return Array.from(errorElements).map((el) => el.textContent.trim());
}

/**
 * Assert form has error
 * @param {HTMLElement} form - Form element
 * @param {string} expectedError - Expected error message
 */
export function assertFormHasError(form, expectedError) {
  const errors = getFormErrors(form);
  if (!errors.some((error) => error.includes(expectedError))) {
    throw new Error(`Expected form to have error: "${expectedError}"`);
  }
}

/**
 * Assert form has no errors
 * @param {HTMLElement} form - Form element
 */
export function assertFormHasNoErrors(form) {
  const errors = getFormErrors(form);
  if (errors.length > 0) {
    throw new Error(`Expected no errors, but found: ${errors.join(', ')}`);
  }
}

/**
 * Assert input has error state
 * @param {HTMLInputElement} input - Input element
 */
export function assertInputHasError(input) {
  const hasErrorClass = input.classList.contains('usa-input--error');
  const hasAriaInvalid = input.getAttribute('aria-invalid') === 'true';

  if (!hasErrorClass && !hasAriaInvalid) {
    throw new Error('Expected input to have error state');
  }
}

/**
 * Assert input is valid
 * @param {HTMLInputElement} input - Input element
 */
export function assertInputIsValid(input) {
  const hasErrorClass = input.classList.contains('usa-input--error');
  const hasAriaInvalid = input.getAttribute('aria-invalid') === 'true';

  if (hasErrorClass || hasAriaInvalid) {
    throw new Error('Expected input to be valid');
  }
}

/**
 * Trigger form validation
 * @param {HTMLFormElement} form - Form to validate
 * @returns {boolean} Whether form is valid
 */
export function validateForm(form) {
  return form.checkValidity();
}

/**
 * Get validation message for input
 * @param {HTMLInputElement} input - Input element
 * @returns {string} Validation message
 */
export function getValidationMessage(input) {
  return input.validationMessage || '';
}

/**
 * Check if form field is required
 * @param {HTMLInputElement} input - Input element
 * @returns {boolean} Whether field is required
 */
export function isRequired(input) {
  return input.hasAttribute('required') || input.getAttribute('aria-required') === 'true';
}

/**
 * Test if error message provides helpful suggestions (WCAG 3.3.3)
 * @param {Element} input - Input element to check
 * @returns {Object} Test result with hasSuggestion status and suggestions array
 */
export function testErrorSuggestion(input) {
  const suggestions = [];

  // Get error message via aria-describedby
  const describedBy = input.getAttribute('aria-describedby');
  if (describedBy) {
    const errorIds = describedBy.split(/\s+/);

    for (const id of errorIds) {
      const errorElement = document.getElementById(id);
      if (errorElement && errorElement.classList.contains('usa-error-message')) {
        const errorText = errorElement.textContent || '';

        // Look for suggestion patterns in error text
        const suggestionPatterns = [
          /format:\s*([^.]+)/i,
          /example:\s*([^.]+)/i,
          /should be\s+([^.]+)/i,
          /must be\s+([^.]+)/i,
          /try\s+([^.]+)/i,
          /use\s+([^.]+)/i,
          /like\s+([^.]+)/i,
          /such as\s+([^.]+)/i,
        ];

        for (const pattern of suggestionPatterns) {
          const match = errorText.match(pattern);
          if (match && match[1]) {
            suggestions.push(match[1].trim());
          }
        }

        // Also check if the entire message contains helpful guidance
        if (
          errorText.includes(':') ||
          errorText.includes('format') ||
          errorText.includes('example')
        ) {
          // Message likely contains a suggestion even if we didn't extract it
          if (suggestions.length === 0) {
            suggestions.push(errorText.trim());
          }
        }
      }
    }
  }

  // Also check for nearby error messages (sibling or parent sibling)
  const formGroup = input.closest('.usa-form-group');
  if (formGroup) {
    const errorMessages = formGroup.querySelectorAll('.usa-error-message');
    errorMessages.forEach((errorElement) => {
      const errorText = errorElement.textContent || '';
      if (errorText && !suggestions.includes(errorText.trim())) {
        // Check for suggestion patterns
        if (
          errorText.includes(':') ||
          errorText.includes('format') ||
          errorText.includes('example')
        ) {
          suggestions.push(errorText.trim());
        }
      }
    });
  }

  return {
    hasSuggestion: suggestions.length > 0,
    suggestions,
  };
}

/**
 * Test if input has proper labels or instructions (WCAG 3.3.2)
 * @param {Element} input - Input element to check
 * @returns {Object} Test result with compliant status and errors array
 */
export function testLabelsOrInstructions(input) {
  const errors = [];

  // Check for associated label
  const inputId = input.getAttribute('id');
  if (!inputId) {
    errors.push('Input does not have an id attribute');
  } else {
    const label = document.querySelector(`label[for="${inputId}"]`);
    if (!label) {
      errors.push('Input does not have an associated label element');
    } else if (!label.textContent.trim()) {
      errors.push('Label element is empty');
    }
  }

  // Check for aria-label or aria-labelledby as fallback
  const hasAriaLabel = input.hasAttribute('aria-label');
  const hasAriaLabelledby = input.hasAttribute('aria-labelledby');

  if (errors.length > 0 && !hasAriaLabel && !hasAriaLabelledby) {
    errors.push('Input has no fallback ARIA labeling');
  }

  return {
    compliant: errors.length === 0,
    errors,
  };
}

/**
 * Test if input has proper error identification (WCAG 3.3.1)
 * @param {Element} input - Input element to check
 * @returns {Object} Test result with details object containing error identification info
 */
export function testErrorIdentification(input) {
  const hasAriaInvalid = input.getAttribute('aria-invalid') === 'true';
  const hasAriaDescribedby = input.hasAttribute('aria-describedby');

  let hasErrorMessage = false;
  let errorMessages = [];

  // Check for error messages via aria-describedby
  if (hasAriaDescribedby) {
    const describedBy = input.getAttribute('aria-describedby');
    const errorIds = describedBy.split(/\s+/);

    for (const id of errorIds) {
      const errorElement = document.getElementById(id);
      if (errorElement && errorElement.classList.contains('usa-error-message')) {
        hasErrorMessage = true;
        errorMessages.push(errorElement.textContent.trim());
      }
    }
  }

  // Also check for nearby error messages
  if (!hasErrorMessage) {
    const formGroup = input.closest('.usa-form-group');
    if (formGroup) {
      const errorElements = formGroup.querySelectorAll('.usa-error-message');
      if (errorElements.length > 0) {
        hasErrorMessage = true;
        errorElements.forEach((el) => {
          errorMessages.push(el.textContent.trim());
        });
      }
    }
  }

  return {
    details: {
      hasAriaInvalid,
      hasAriaDescribedby,
      hasErrorMessage,
      errorMessages,
    },
  };
}

/**
 * Test comprehensive form error accessibility (WCAG 3.3)
 * @param {Element} input - Input element to check
 * @returns {Object} Test result with details object containing all error accessibility checks
 */
export function testFormErrorAccessibility(input) {
  const labelsResult = testLabelsOrInstructions(input);
  const errorResult = testErrorIdentification(input);
  const suggestionResult = testErrorSuggestion(input);

  return {
    details: {
      labelsProvided: labelsResult.compliant,
      labelErrors: labelsResult.errors,
      errorIdentification: errorResult.details,
      errorSuggestions: suggestionResult,
    },
  };
}
