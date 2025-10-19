/**
 * Scrollbar Width Utility
 *
 * Mirrors official USWDS scrollbar width calculation
 *
 * SOURCE: uswds-core/src/js/utils/scrollbar-width.js (Lines 1-20)
 * @uswds-source https://github.com/uswds/uswds/blob/develop/packages/uswds-core/src/js/utils/scrollbar-width.js
 * @uswds-version 3.8.0
 * @last-synced 2025-10-05
 * @sync-status ✅ UP TO DATE
 *
 * CRITICAL: This file replicates USWDS source code to maintain 100% behavior parity.
 * DO NOT add custom logic. ALL changes must come from USWDS source updates.
 */

/**
 * Get scrollbar width
 *
 * Creates temporary elements to calculate the browser's scrollbar width.
 * This is used by modal to compensate for body padding when modal is open.
 *
 * SOURCE: scrollbar-width.js (Lines 1-20)
 *
 * @returns Scrollbar width in pixels (e.g., "17px")
 */
export function getScrollbarWidth(): string {
  // Creating invisible container
  const outer = document.createElement('div');
  outer.style.visibility = 'hidden';
  outer.style.overflow = 'scroll'; // forcing scrollbar to appear
  (outer.style as any).msOverflowStyle = 'scrollbar'; // needed for WinJS apps
  document.body.appendChild(outer);

  // Creating inner element and placing it in the container
  const inner = document.createElement('div');
  outer.appendChild(inner);

  // Calculating difference between container's full width and the child width
  const scrollbarWidth = `${outer.offsetWidth - inner.offsetWidth}px`;

  // Removing temporary elements from the DOM
  outer.parentNode!.removeChild(outer);

  return scrollbarWidth;
}
