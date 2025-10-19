/**
 * Check if element is in viewport
 *
 * SOURCE: uswds-core/src/js/utils/is-in-viewport.js
 * Reference: https://stackoverflow.com/a/7557433
 */
export function isElementInViewport(
  el: HTMLElement,
  win: Window = window,
  docEl: HTMLElement = document.documentElement
): boolean {
  const rect = el.getBoundingClientRect();

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (win.innerHeight || docEl.clientHeight) &&
    rect.right <= (win.innerWidth || docEl.clientWidth)
  );
}
