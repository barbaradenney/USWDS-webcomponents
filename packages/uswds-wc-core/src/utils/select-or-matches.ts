/**
 * Select Or Matches Utility
 *
 * Mirrors official USWDS element selection and matching
 *
 * SOURCE: uswds-core/src/js/utils/select-or-matches.js (Lines 1-30)
 * SOURCE: uswds-core/src/js/utils/select.js (Lines 1-28)
 * @uswds-source https://github.com/uswds/uswds/blob/develop/packages/uswds-core/src/js/utils/select-or-matches.js
 * @uswds-version 3.8.0
 * @last-synced 2025-10-05
 * @sync-status ✅ UP TO DATE
 *
 * CRITICAL: This file replicates USWDS source code to maintain 100% behavior parity.
 * DO NOT add custom logic. ALL changes must come from USWDS source updates.
 */

/**
 * Check if value is a DOM element
 *
 * SOURCE: select.js (Lines 5-8)
 *
 * @param value - Value to check
 * @returns True if value is a DOM element
 */
const isElement = (value: any): value is Element =>
  value && typeof value === 'object' && value.nodeType === 1;

/**
 * Select elements from DOM by selector
 *
 * SOURCE: select.js (Lines 10-28)
 *
 * @param selector - CSS selector string
 * @param context - Context to search within (defaults to document)
 * @returns Array of matching elements
 */
function select(selector: string, context?: Document | Element): Element[] {
  if (typeof selector !== 'string') {
    return [];
  }

  let searchContext: Document | Element = context || window.document;

  if (!context || !isElement(context)) {
    searchContext = window.document;
  }

  const selection = searchContext.querySelectorAll(selector);
  return Array.prototype.slice.call(selection);
}

/**
 * Select elements or check if context matches selector
 *
 * Queries for elements matching the selector, and additionally checks
 * if the context element itself matches the selector.
 *
 * SOURCE: select-or-matches.js (Lines 18-30)
 *
 * @param selector - CSS selector string
 * @param context - Context to search within
 * @returns Array of matching elements (including context if it matches)
 */
export function selectOrMatches(selector: string, context?: Document | Element): Element[] {
  const selection = select(selector, context);

  if (typeof selector !== 'string') {
    return selection;
  }

  if (isElement(context) && context.matches(selector)) {
    selection.push(context);
  }

  return selection;
}
