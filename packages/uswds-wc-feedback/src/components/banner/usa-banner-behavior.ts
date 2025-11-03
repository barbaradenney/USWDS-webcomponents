/**
 * USWDS Banner Behavior
 *
 * Mirrors official USWDS banner JavaScript behavior exactly
 *
 * @uswds-source https://github.com/uswds/uswds/blob/develop/packages/usa-banner/src/index.js
 * @uswds-version 3.10.0
 * @last-synced 2025-10-05
 * @sync-status ✅ UP TO DATE
 *
 * CRITICAL: This file replicates USWDS source code to maintain 100% behavior parity.
 * DO NOT add custom logic. ALL changes must come from USWDS source updates.
 */

import { selectOrMatches } from '@uswds-wc/core';

/**
 * Constants from USWDS
 *
 * SOURCE: index.js (Lines 6-9)
 */
const PREFIX = 'usa';
const HEADER = `.${PREFIX}-banner__header`;
const EXPANDED_CLASS = `${PREFIX}-banner__header--expanded`;
const BANNER_BUTTON = `${HEADER} [aria-controls]`;

/**
 * ARIA and visibility constants
 *
 * SOURCE: uswds-core/src/js/utils/toggle.js (Lines 1-3)
 */
const EXPANDED = 'aria-expanded';
const CONTROLS = 'aria-controls';
const HIDDEN = 'hidden';

/**
 * Toggle element visibility and ARIA attributes
 *
 * SOURCE: uswds-core/src/js/utils/toggle.js (Lines 5-26)
 *
 * MODIFICATION: Added root parameter to support custom element scoping
 * In USWDS, document.getElementById always works because elements are in document
 * In web components with light DOM, we need to search within the root element first
 *
 * @param button - The button element
 * @param expanded - Whether the target should be expanded
 * @param root - Root element to search within (falls back to document)
 * @returns The final expanded state
 */
const toggle = (
  button: HTMLElement,
  expanded?: boolean,
  root?: HTMLElement | Document
): boolean => {
  let safeExpanded = expanded;

  if (typeof safeExpanded !== 'boolean') {
    safeExpanded = button.getAttribute(EXPANDED) === 'false';
  }

  button.setAttribute(EXPANDED, String(safeExpanded));

  const id = button.getAttribute(CONTROLS);
  // Search within root first, then fall back to document.getElementById
  let controls: HTMLElement | null = null;
  if (id) {
    if (root && 'querySelector' in root) {
      controls = root.querySelector(`#${id}`);
    }
    if (!controls) {
      controls = document.getElementById(id);
    }
  }

  if (!controls) {
    throw new Error(`No toggle target found with id: "${id}"`);
  }

  if (safeExpanded) {
    controls.removeAttribute(HIDDEN);
  } else {
    controls.setAttribute(HIDDEN, '');
  }

  return safeExpanded;
};

/**
 * Toggle Banner display and class.
 *
 * SOURCE: index.js (Lines 14-21)
 *
 * MODIFICATION: Added root parameter to pass to toggle function
 *
 * @param event - Click event
 * @param root - Root element to search within
 */
const toggleBanner = function (
  this: HTMLElement,
  event: Event,
  root?: HTMLElement | Document
): void {
  event.preventDefault();
  const trigger = (event.target as HTMLElement).closest(BANNER_BUTTON) as HTMLElement;

  toggle(trigger, undefined, root);
  trigger.closest(HEADER)!.classList.toggle(EXPANDED_CLASS);
};

/**
 * Initialize banner behavior
 *
 * SOURCE: index.js (Lines 23-38)
 *
 * MODIFICATION: Pass root element to toggle and toggleBanner functions
 *
 * @param root - Root element or document
 * @returns Cleanup function
 */
export function initializeBanner(root: HTMLElement | Document = document): () => void {
  const buttons = selectOrMatches(BANNER_BUTTON, root);

  // Track handlers for cleanup
  const handlers = new Map<HTMLElement, (event: Event) => void>();

  // Initialize each button and attach click handler directly
  buttons.forEach((button) => {
    const buttonEl = button as HTMLElement;
    const expanded = buttonEl.getAttribute(EXPANDED) === 'true';
    toggle(buttonEl, expanded, root);

    // Attach click handler directly to button to ensure preventDefault fires before test listeners
    const handleClick = (event: Event) => {
      toggleBanner.call(buttonEl, event, root);
    };

    buttonEl.addEventListener('click', handleClick);
    handlers.set(buttonEl, handleClick);
  });

  return () => {
    // Cleanup: remove all handlers
    handlers.forEach((handler, button) => {
      button.removeEventListener('click', handler);
    });
    handlers.clear();
  };
}

// Export toggle utility for potential reuse
export { toggle };
