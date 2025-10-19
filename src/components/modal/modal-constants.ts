/**
 * Modal Component Constants
 *
 * Centralized constants for modal component to avoid magic numbers
 * and improve maintainability.
 */

/**
 * CSS Selectors
 */
export const SELECTORS = {
  PRIMARY_BUTTON: '.usa-modal__footer .usa-button:not(.usa-button--unstyled)',
  SECONDARY_BUTTON: '.usa-modal__footer .usa-button--unstyled',
  CLOSE_BUTTON: '.usa-modal__close',
  MODAL_WRAPPER_VISIBLE: '.usa-modal-wrapper.is-visible',
  MODAL_TRIGGER: '[data-open-modal]',
  CLOSE_MODAL_TRIGGER: '[data-close-modal]',
  SLOT: 'slot',
  NAMED_SLOT: (name: string) => `slot[name="${name}"]`,
  SLOT_WITHOUT_NAME: 'slot:not([name])',
} as const;

/**
 * Timing Constants (in milliseconds)
 */
export const TIMING = {
  /** Wait for next animation frame to ensure DOM is ready */
  ANIMATION_FRAME_DELAY: () => new Promise<void>(resolve =>
    requestAnimationFrame(() => resolve())
  ),
} as const;

/**
 * CSS Classes
 */
export const CLASSES = {
  MODAL_OPEN: 'usa-modal--open',
  MODAL_LARGE: 'usa-modal--lg',
  MODAL_BASE: 'usa-modal',
} as const;

/**
 * Attributes
 */
export const ATTRIBUTES = {
  FORCE_ACTION: 'data-force-action',
  WEB_COMPONENT_MANAGED: 'data-web-component-managed',
  ARIA_CONTROLS: 'aria-controls',
  ARIA_LABELLEDBY: 'aria-labelledby',
  ARIA_DESCRIBEDBY: 'aria-describedby',
  ARIA_MODAL: 'aria-modal',
  SLOT: 'slot',
  DATA_OPENER: 'data-opener',
} as const;
