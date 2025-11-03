/**
 * Storybook Story Validation Utilities
 *
 * Utilities for validating Storybook stories
 */

/**
 * Validate story structure
 * @param {Object} story - Storybook story object
 * @returns {Object} Validation result
 */
export function validateStory(story) {
  const issues = [];

  if (!story) {
    issues.push('Story is undefined');
    return { isValid: false, issues };
  }

  if (!story.render && !story.component) {
    issues.push('Story must have render function or component');
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}

/**
 * Validate story args
 * @param {Object} args - Story args
 * @param {Array<string>} requiredArgs - Required arg names
 * @returns {Object} Validation result
 */
export function validateStoryArgs(args, requiredArgs = []) {
  const issues = [];

  for (const requiredArg of requiredArgs) {
    if (!(requiredArg in args)) {
      issues.push(`Missing required arg: ${requiredArg}`);
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
    args,
  };
}

/**
 * Check if story has proper documentation
 * @param {Object} story - Story object
 * @returns {boolean} Whether story has documentation
 */
export function hasDocumentation(story) {
  return !!(story.parameters && story.parameters.docs);
}

/**
 * Validate story accessibility
 * @param {Object} story - Story object
 * @returns {boolean} Whether story has a11y configuration
 */
export function hasA11yConfig(story) {
  return !!(story.parameters && story.parameters.a11y);
}

/**
 * Validate navigation targets exist in content
 * @param {Array<Object>} navItems - Navigation items with id/href properties
 * @param {string} contentHTML - HTML content to validate against
 * @returns {Object} Validation result with isValid, missingTargets, brokenLinks, warnings, and suggestions
 */
export function validateNavigationTargets(navItems, contentHTML) {
  const missingTargets = [];
  const brokenLinks = [];
  const warnings = [];
  const suggestions = [];

  // Parse the HTML content
  const parser = new DOMParser();
  const doc = parser.parseFromString(contentHTML, 'text/html');

  /**
   * Recursively validate navigation items and their children
   * @param {Array<Object>} items - Navigation items to validate
   */
  function validateItems(items) {
    for (const item of items) {
      const targetId = item.id || item.href?.replace('#', '');

      if (targetId) {
        const targetElement = doc.getElementById(targetId);

        if (!targetElement) {
          missingTargets.push(targetId);
          brokenLinks.push(item.href || `#${targetId}`);
          warnings.push(
            `Missing target element for navigation item: ${item.text} (id="${targetId}")`
          );

          // Provide a helpful suggestion
          const level = item.level || 2;
          const headingTag = `h${level}`;
          suggestions.push(
            `Add this section to your content:\n` +
              `<section id="${targetId}">\n` +
              `  <${headingTag}>${item.text}</${headingTag}>\n` +
              `  <p>Content for ${item.text}</p>\n` +
              `</section>`
          );
        }
      }

      // Validate children recursively
      if (item.children && item.children.length > 0) {
        validateItems(item.children);
      }
    }
  }

  validateItems(navItems);

  return {
    isValid: missingTargets.length === 0,
    missingTargets,
    brokenLinks,
    warnings,
    suggestions,
  };
}

/**
 * Validate heading selector format
 * @param {string} selector - Heading selector string
 * @returns {Object} Validation result with isValid and error
 */
export function validateHeadingSelector(selector) {
  // USWDS expects space-separated selectors (e.g., "h2 h3")
  // NOT comma-separated selectors (e.g., "h2, h3")

  if (selector.includes(',')) {
    return {
      isValid: false,
      error: `Invalid heading selector format: "${selector}". USWDS expects space-separated selectors (e.g., "h2 h3"), not comma-separated.`,
    };
  }

  // Check that it only contains valid heading tags
  const parts = selector.trim().split(/\s+/);
  const validHeadings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

  for (const part of parts) {
    if (!validHeadings.includes(part.toLowerCase())) {
      return {
        isValid: false,
        error: `Invalid heading tag in selector: "${part}". Expected one of: ${validHeadings.join(', ')}`,
      };
    }
  }

  return {
    isValid: true,
    selector,
  };
}

/**
 * Generate validation report
 * @param {Object} validationResult - Result from validateNavigationTargets
 * @returns {string} Human-readable validation report
 */
export function generateValidationReport(validationResult) {
  const { isValid, missingTargets, brokenLinks, warnings, suggestions } = validationResult;

  if (isValid) {
    return '✅ All navigation targets validated successfully!';
  }

  let report = '❌ Navigation validation failed:\n\n';

  if (warnings.length > 0) {
    report += '⚠️  Warnings:\n';
    warnings.forEach((warning, index) => {
      report += `  ${index + 1}. ${warning}\n`;
    });
    report += '\n';
  }

  if (missingTargets.length > 0) {
    report += `📝 Missing Targets (${missingTargets.length}):\n`;
    missingTargets.forEach((target, index) => {
      report += `  ${index + 1}. #${target}\n`;
    });
    report += '\n';
  }

  if (brokenLinks.length > 0) {
    report += `🔗 Broken Links (${brokenLinks.length}):\n`;
    brokenLinks.forEach((link, index) => {
      report += `  ${index + 1}. ${link}\n`;
    });
    report += '\n';
  }

  if (suggestions.length > 0) {
    report += '💡 Suggestions:\n';
    suggestions.forEach((suggestion, index) => {
      report += `  ${index + 1}. ${suggestion}\n`;
    });
  }

  return report;
}
