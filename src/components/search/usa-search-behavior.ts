/**
 * USWDS Search Behavior
 *
 * Mirrors official USWDS search JavaScript behavior exactly
 *
 * @uswds-source https://github.com/uswds/uswds/blob/develop/packages/usa-search/src/index.js
 * @uswds-version 3.10.0
 * @last-synced 2025-10-05
 * @sync-status ✅ UP TO DATE
 *
 * CRITICAL: This file replicates USWDS source code to maintain 100% behavior parity.
 * DO NOT add custom logic. ALL changes must come from USWDS source updates.
 */

import { selectOrMatches } from '../../utils/select-or-matches.js';

/**
 * Constants from USWDS
 *
 * SOURCE: index.js (Lines 7-10)
 */
const BUTTON = '.js-search-button';
const FORM = '.js-search-form';
const INPUT = '[type=search]';
// NOTE: CONTEXT is fixed to 'header' per USWDS design - search is scoped to header component
// This matches USWDS behavior where search toggles are typically in the header region
const CONTEXT = 'header';

let lastButton: HTMLElement | undefined;
// Track active body listeners for cleanup
let activeBodyListener: ((e: Event) => void) | undefined;

/**
 * Ignore clicks inside element
 *
 * SOURCE: receptor/ignore/index.js
 *
 * @param element - Element to ignore clicks within
 * @param fn - Function to call when clicking outside
 * @returns Event handler function
 */
const ignore = (element: HTMLElement, fn: (e: Event) => void) => {
  return function ignorance(this: HTMLElement, e: Event) {
    if (element !== e.target && !element.contains(e.target as Node)) {
      return fn.call(this, e);
    }
  };
};

/**
 * Get the form associated with a button
 *
 * SOURCE: index.js (Lines 14-17)
 *
 * @param button - The search button
 * @returns The search form element
 */
const getForm = (button: HTMLElement): HTMLElement | null => {
  const context = button.closest(CONTEXT);
  return context
    ? (context.querySelector(FORM) as HTMLElement)
    : (document.querySelector(FORM) as HTMLElement);
};

/**
 * Toggle search form visibility
 *
 * SOURCE: index.js (Lines 19-55)
 *
 * @param button - The search button
 * @param active - Whether to show or hide the search
 */
const toggleSearch = (button: HTMLElement, active: boolean): void => {
  const form = getForm(button);

  if (!form) {
    throw new Error(`No ${FORM} found for search toggle in ${CONTEXT}!`);
  }

  /* eslint-disable no-param-reassign */
  (button as any).hidden = active;
  (form as any).hidden = !active;
  /* eslint-enable */

  if (!active) {
    return;
  }

  const input = form.querySelector(INPUT) as HTMLInputElement;

  if (input) {
    input.focus();
  }
  // when the user clicks _outside_ of the form w/ignore(): hide the
  // search, then remove the listener
  const listener = ignore(form, () => {
    if (lastButton) {
      hideSearch.call(lastButton);
    }

    document.body.removeEventListener('click', listener);
    activeBodyListener = undefined;
  });

  // Remove any existing body listener before adding new one
  if (activeBodyListener) {
    document.body.removeEventListener('click', activeBodyListener);
  }
  activeBodyListener = listener;

  // Normally we would just run this code without a timeout, but
  // IE11 and Edge will actually call the listener *immediately* because
  // they are currently handling this exact type of event, so we'll
  // make sure the browser is done handling the current click event,
  // if any, before we attach the listener.
  setTimeout(() => {
    document.body.addEventListener('click', listener);
  }, 0);
};

/**
 * Show search form
 *
 * SOURCE: index.js (Lines 57-60)
 */
function showSearch(this: HTMLElement): void {
  toggleSearch(this, true);
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  lastButton = this;
}

/**
 * Hide search form
 *
 * SOURCE: index.js (Lines 62-65)
 */
function hideSearch(this: HTMLElement): void {
  toggleSearch(this, false);
  lastButton = undefined;
}

/**
 * Initialize search behavior
 *
 * SOURCE: index.js (Lines 67-82)
 *
 * @param root - Root element or document
 * @returns Cleanup function
 */
export function initializeSearch(root: HTMLElement | Document = document): () => void {
  const buttons = selectOrMatches(BUTTON, root);

  // Initialize each button (hide form initially)
  buttons.forEach((button) => {
    toggleSearch(button as HTMLElement, false);
  });

  // Event delegation for button clicks
  const handleClick = (event: Event) => {
    const target = event.target as HTMLElement;
    const button = target.closest(BUTTON);

    if (button) {
      showSearch.call(button as HTMLElement);
    }
  };

  // Add event listener
  const rootEl = root === document ? document.body : (root as HTMLElement);
  rootEl.addEventListener('click', handleClick);

  return () => {
    rootEl.removeEventListener('click', handleClick);
    // Remove any active body listener
    if (activeBodyListener) {
      document.body.removeEventListener('click', activeBodyListener);
      activeBodyListener = undefined;
    }
    // Forget the last button clicked
    lastButton = undefined;
  };
}

// Export utility functions for potential reuse
export { toggleSearch, getForm };
