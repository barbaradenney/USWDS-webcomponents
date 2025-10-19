/**
 * USWDS Character Count Behavior
 *
 * Mirrors official USWDS character count JavaScript behavior exactly
 *
 * @uswds-source https://github.com/uswds/uswds/blob/develop/packages/usa-character-count/src/index.js
 * @uswds-version 3.10.0
 * @last-synced 2025-10-05
 * @sync-status ✅ UP TO DATE
 *
 * CRITICAL: This file replicates USWDS source code to maintain 100% behavior parity.
 * DO NOT add custom logic. ALL changes must come from USWDS source updates.
 */

import { selectOrMatches } from '../../utils/select-or-matches.js';
import { debounce } from '../../utils/debounce.js';

/**
 * Constants from USWDS
 *
 * SOURCE: index.js (Lines 5-21)
 */
const PREFIX = 'usa';
const CHARACTER_COUNT_CLASS = `${PREFIX}-character-count`;
const CHARACTER_COUNT = `.${CHARACTER_COUNT_CLASS}`;
const FORM_GROUP_CLASS = `${PREFIX}-form-group`;
const FORM_GROUP_ERROR_CLASS = `${FORM_GROUP_CLASS}--error`;
const FORM_GROUP = `.${FORM_GROUP_CLASS}`;
const LABEL_CLASS = `${PREFIX}-label`;
const LABEL_ERROR_CLASS = `${LABEL_CLASS}--error`;
const INPUT = `.${PREFIX}-character-count__field`;
const INPUT_ERROR_CLASS = `${PREFIX}-input--error`;
const MESSAGE = `.${PREFIX}-character-count__message`;
const VALIDATION_MESSAGE = 'The content is too long.';
const MESSAGE_INVALID_CLASS = `${PREFIX}-character-count__status--invalid`;
const STATUS_MESSAGE_CLASS = `${CHARACTER_COUNT_CLASS}__status`;
const STATUS_MESSAGE_SR_ONLY_CLASS = `${CHARACTER_COUNT_CLASS}__sr-status`;
const STATUS_MESSAGE = `.${STATUS_MESSAGE_CLASS}`;
const STATUS_MESSAGE_SR_ONLY = `.${STATUS_MESSAGE_SR_ONLY_CLASS}`;
const DEFAULT_STATUS_LABEL = `characters allowed`;

/**
 * Character count elements interface
 */
interface CharacterCountElements {
  characterCountEl: HTMLElement;
  formGroupEl: HTMLElement | null;
  inputID: string;
  labelEl: HTMLLabelElement | null;
  messageEl: HTMLElement;
}

/**
 * Returns the root, form group, label, and message elements for a character count input
 *
 * SOURCE: index.js (Lines 28-46)
 *
 * @param inputEl - The character count input element
 * @returns elements - The root form group, input ID, label, and message element.
 */
const getCharacterCountElements = (
  inputEl: HTMLInputElement | HTMLTextAreaElement
): CharacterCountElements => {
  const characterCountEl = inputEl.closest(CHARACTER_COUNT) as HTMLElement;

  if (!characterCountEl) {
    throw new Error(`${INPUT} is missing outer ${CHARACTER_COUNT}`);
  }

  const formGroupEl = characterCountEl.querySelector(FORM_GROUP) as HTMLElement | null;

  const inputID = inputEl.getAttribute('id') || '';
  const labelEl = document.querySelector(`label[for=${inputID}]`) as HTMLLabelElement | null;

  const messageEl = characterCountEl.querySelector(MESSAGE) as HTMLElement;

  if (!messageEl) {
    throw new Error(`${CHARACTER_COUNT} is missing inner ${MESSAGE}`);
  }

  return { characterCountEl, formGroupEl, inputID, labelEl, messageEl };
};

/**
 * Move maxlength attribute to a data attribute on usa-character-count
 *
 * SOURCE: index.js (Lines 53-63)
 *
 * @param inputEl - The character count input element
 */
const setDataLength = (inputEl: HTMLInputElement | HTMLTextAreaElement) => {
  const { characterCountEl } = getCharacterCountElements(inputEl);

  const maxlength = inputEl.getAttribute('maxlength');

  if (!maxlength) return;

  inputEl.removeAttribute('maxlength');
  characterCountEl.setAttribute('data-maxlength', maxlength);
};

/**
 * Create and append status messages for visual and screen readers
 *
 * SOURCE: index.js (Lines 70-90)
 * MODIFICATION: Check if elements already exist (Lit pre-renders them) before creating
 *
 * @param characterCountEl - Div with `.usa-character-count` class
 * @description Create two status messages for number of characters left;
 * one visual status and another for screen readers
 */
const createStatusMessages = (characterCountEl: HTMLElement) => {
  // Check if status elements already exist (pre-rendered by Lit)
  let statusMessage = characterCountEl.querySelector(STATUS_MESSAGE) as HTMLElement;
  let srStatusMessage = characterCountEl.querySelector(STATUS_MESSAGE_SR_ONLY) as HTMLElement;

  // Only create if they don't exist
  if (!statusMessage || !srStatusMessage) {
    if (!statusMessage) {
      statusMessage = document.createElement('div');
      statusMessage.classList.add(`${STATUS_MESSAGE_CLASS}`, 'usa-hint');
      statusMessage.setAttribute('aria-hidden', 'true');
      characterCountEl.appendChild(statusMessage);
    }

    if (!srStatusMessage) {
      srStatusMessage = document.createElement('div');
      srStatusMessage.classList.add(`${STATUS_MESSAGE_SR_ONLY_CLASS}`, 'usa-sr-only');
      srStatusMessage.setAttribute('aria-live', 'polite');
      characterCountEl.appendChild(srStatusMessage);
    }
  }

  // Set initial message
  const maxLength = characterCountEl.dataset.maxlength;
  const defaultMessage = `${maxLength} ${DEFAULT_STATUS_LABEL}`;
  statusMessage.textContent = defaultMessage;
  srStatusMessage.textContent = defaultMessage;
};

/**
 * Returns message with how many characters are left
 *
 * SOURCE: index.js (Lines 97-113)
 *
 * @param currentLength - The number of characters used
 * @param maxLength - The total number of characters allowed
 * @returns A string description of how many characters are left
 */
const getCountMessage = (currentLength: number, maxLength: number): string => {
  let newMessage = '';

  if (currentLength === 0) {
    newMessage = `${maxLength} ${DEFAULT_STATUS_LABEL}`;
  } else {
    const difference = Math.abs(maxLength - currentLength);
    const characters = `character${difference === 1 ? '' : 's'}`;
    const guidance = currentLength > maxLength ? 'over limit' : 'left';

    newMessage = `${difference} ${characters} ${guidance}`;
  }

  return newMessage;
};

/**
 * Updates the character count status for screen readers after a 1000ms delay.
 *
 * SOURCE: index.js (Lines 120-125)
 *
 * @param msgEl - The screen reader status message element
 * @param statusMessage - A string of the current character status
 */
const srUpdateStatus = debounce((msgEl: HTMLElement, statusMessage: string) => {
  const srStatusMessage = msgEl;
  srStatusMessage.textContent = statusMessage;
}, 1000);

/**
 * Update the character count component
 *
 * SOURCE: index.js (Lines 132-173)
 *
 * @description On input, it will update visual status, screenreader
 * status and update input validation (if over character length)
 * @param inputEl - The character count input element
 */
const updateCountMessage = (inputEl: HTMLInputElement | HTMLTextAreaElement) => {
  const { characterCountEl, labelEl, formGroupEl } = getCharacterCountElements(inputEl);
  const currentLength = inputEl.value.length;
  const maxLength = parseInt(characterCountEl.getAttribute('data-maxlength') || '0', 10);
  const statusMessage = characterCountEl.querySelector(STATUS_MESSAGE) as HTMLElement;
  const srStatusMessage = characterCountEl.querySelector(
    STATUS_MESSAGE_SR_ONLY
  ) as HTMLElement;
  const currentStatusMessage = getCountMessage(currentLength, maxLength);

  if (!maxLength) return;

  const isOverLimit = Boolean(currentLength && currentLength > maxLength);

  statusMessage.textContent = currentStatusMessage;
  srUpdateStatus(srStatusMessage, currentStatusMessage);

  if (isOverLimit && !inputEl.validationMessage) {
    inputEl.setCustomValidity(VALIDATION_MESSAGE);
  }

  if (!isOverLimit && inputEl.validationMessage === VALIDATION_MESSAGE) {
    inputEl.setCustomValidity('');
  }

  if (formGroupEl) {
    formGroupEl.classList.toggle(FORM_GROUP_ERROR_CLASS, isOverLimit);
  }

  if (labelEl) {
    labelEl.classList.toggle(LABEL_ERROR_CLASS, isOverLimit);
  }

  inputEl.classList.toggle(INPUT_ERROR_CLASS, isOverLimit);
  statusMessage.classList.toggle(MESSAGE_INVALID_CLASS, isOverLimit);
};

/**
 * Initialize component
 *
 * SOURCE: index.js (Lines 180-190)
 *
 * @description On init this function will create elements and update any
 * attributes so it can tell the user how many characters are left.
 * @param inputEl - the components input
 */
const enhanceCharacterCount = (inputEl: HTMLInputElement | HTMLTextAreaElement) => {
  const { characterCountEl, messageEl } = getCharacterCountElements(inputEl);

  // Hide hint and remove aria-live for backwards compatibility
  messageEl.classList.add('usa-sr-only');
  messageEl.removeAttribute('aria-live');

  setDataLength(inputEl);
  createStatusMessages(characterCountEl);
};

/**
 * Initialize character count behavior
 *
 * SOURCE: index.js (Lines 192-213)
 *
 * @param root - Root element or document
 * @returns Cleanup function
 */
export function initializeCharacterCount(
  root: HTMLElement | Document = document
): () => void {
  const inputs = selectOrMatches(INPUT, root);

  // Initialize each input
  inputs.forEach((input) => {
    enhanceCharacterCount(input as HTMLInputElement | HTMLTextAreaElement);
    // Update count message initially
    updateCountMessage(input as HTMLInputElement | HTMLTextAreaElement);
  });

  // Event delegation for input
  const handleInput = (event: Event) => {
    const target = event.target as HTMLElement;
    const input = target.closest(INPUT);

    if (input) {
      updateCountMessage(input as HTMLInputElement | HTMLTextAreaElement);
    }
  };

  // Add event listener
  const rootEl = root === document ? document.body : (root as HTMLElement);
  rootEl.addEventListener('input', handleInput);

  return () => {
    rootEl.removeEventListener('input', handleInput);
  };
}

// Export functions needed by other components
export {
  enhanceCharacterCount,
  getCountMessage,
  updateCountMessage,
  createStatusMessages,
  CHARACTER_COUNT_CLASS,
  FORM_GROUP_ERROR_CLASS,
  LABEL_ERROR_CLASS,
  INPUT_ERROR_CLASS,
  MESSAGE_INVALID_CLASS,
  VALIDATION_MESSAGE,
  STATUS_MESSAGE_CLASS,
  STATUS_MESSAGE_SR_ONLY_CLASS,
  DEFAULT_STATUS_LABEL,
};
