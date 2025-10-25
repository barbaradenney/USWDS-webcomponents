/**
 * USWDS Time Picker Behavior
 *
 * Mirrors official USWDS time picker JavaScript behavior exactly
 *
 * @uswds-source https://github.com/uswds/uswds/blob/develop/packages/usa-time-picker/src/index.js
 * @uswds-version 3.8.0
 * @last-synced 2025-10-05
 * @sync-status ✅ UP TO DATE
 *
 * CRITICAL: This file replicates USWDS source code to maintain 100% behavior parity.
 * DO NOT add custom logic. ALL changes must come from USWDS source updates.
 */

import { selectOrMatches } from '@uswds-wc/core';
import { initializeComboBox, COMBO_BOX_CLASS } from '../combo-box/usa-combo-box-behavior.js';

/**
 * Constants from USWDS
 *
 * SOURCE: index.js (Lines 9-22)
 */
const PREFIX = 'usa';
const TIME_PICKER_CLASS = `${PREFIX}-time-picker`;
const TIME_PICKER = `.${TIME_PICKER_CLASS}`;
const MAX_TIME = 60 * 24 - 1;
const MIN_TIME = 0;
const DEFAULT_STEP = 30;
const MIN_STEP = 1;

const FILTER_DATASET = {
  filter: '0?{{ hourQueryFilter }}:{{minuteQueryFilter}}.*{{ apQueryFilter }}m?',
  apQueryFilter: '([ap])',
  hourQueryFilter: '([1-9][0-2]?)',
  minuteQueryFilter: '[\\d]+:([0-9]{0,2})',
};

/**
 * Parse a string of hh:mm into minutes
 *
 * SOURCE: index.js (Lines 30-47)
 *
 * @param timeStr - The time string to parse
 * @returns The number of minutes
 */
const parseTimeString = (timeStr: string): number | undefined => {
  let minutes;

  if (timeStr) {
    const [hours, mins] = timeStr.split(':').map((str) => {
      let value;
      const parsed = parseInt(str, 10);
      if (!Number.isNaN(parsed)) value = parsed;
      return value;
    });

    if (hours != null && mins != null) {
      minutes = hours * 60 + mins;
    }
  }

  return minutes;
};

/**
 * Enhance an input with the time picker elements
 *
 * SOURCE: index.js (Lines 54-133)
 *
 * @param el - The initial wrapping element of the time picker component
 */
const transformTimePicker = (el: HTMLElement) => {
  const timePickerEl = el.closest(TIME_PICKER) as HTMLElement;

  // Guard against double transformation
  if (timePickerEl.dataset.transformed === 'true') return;

  const initialInputEl = timePickerEl.querySelector(`input`) as HTMLInputElement;

  if (!initialInputEl) {
    throw new Error(`${TIME_PICKER} is missing inner input`);
  }

  const selectEl = document.createElement('select');

  [
    'id',
    'name',
    'required',
    'aria-label',
    'aria-labelledby',
    'disabled',
    'aria-disabled',
  ].forEach((name) => {
    if (initialInputEl.hasAttribute(name)) {
      const value = initialInputEl.getAttribute(name);
      selectEl.setAttribute(name, value!);
      initialInputEl.removeAttribute(name);
    }
  });

  const padZeros = (value: number, length: number) => `0000${value}`.slice(-length);

  const getTimeContext = (minutes: number) => {
    const minute = minutes % 60;
    const hour24 = Math.floor(minutes / 60);
    const hour12 = hour24 % 12 || 12;
    const ampm = hour24 < 12 ? 'am' : 'pm';

    return {
      minute,
      hour24,
      hour12,
      ampm,
    };
  };

  const minTime = Math.max(MIN_TIME, parseTimeString(timePickerEl.dataset.minTime || '') || MIN_TIME);
  const maxTime = Math.min(MAX_TIME, parseTimeString(timePickerEl.dataset.maxTime || '') || MAX_TIME);
  const step = Math.floor(
    Math.max(MIN_STEP, parseInt(timePickerEl.dataset.step || String(DEFAULT_STEP), 10))
  );

  let defaultValue;
  for (let time = minTime; time <= maxTime; time += step) {
    const { minute, hour24, hour12, ampm } = getTimeContext(time);

    const option = document.createElement('option');
    option.value = `${padZeros(hour24, 2)}:${padZeros(minute, 2)}`;
    option.text = `${hour12}:${padZeros(minute, 2)}${ampm}`;
    if (option.text === initialInputEl.value) {
      defaultValue = option.value;
    }
    selectEl.appendChild(option);
  }

  timePickerEl.classList.add(COMBO_BOX_CLASS);

  // combo box properties
  Object.keys(FILTER_DATASET).forEach((key) => {
    (timePickerEl.dataset as any)[key] = (FILTER_DATASET as any)[key];
  });
  timePickerEl.dataset.disableFiltering = 'true';
  timePickerEl.dataset.defaultValue = defaultValue;

  timePickerEl.appendChild(selectEl);
  initialInputEl.remove();

  // Mark as transformed to prevent double transformation
  timePickerEl.dataset.transformed = 'true';
};

/**
 * Initialize time picker behavior
 *
 * SOURCE: index.js (Lines 135-146)
 *
 * @param root - Root element or document
 * @returns Cleanup function
 */
export function initializeTimePicker(root: HTMLElement | Document = document): () => void {
  selectOrMatches(TIME_PICKER, root).forEach((timePickerEl) => {
    transformTimePicker(timePickerEl as HTMLElement);
  });

  // Check if we've already initialized combo box for this root
  const rootEl = root === document ? document.body : (root as HTMLElement);
  if ((rootEl as any).__timePickerComboBoxInitialized) {
    return () => {}; // Return empty cleanup - combo box already initialized
  }
  (rootEl as any).__timePickerComboBoxInitialized = true;

  // CRITICAL: initializeComboBox calls enhanceComboBox internally + attaches event listeners
  // DO NOT call enhanceComboBox separately - it will be called by initializeComboBox
  const comboBoxCleanup = initializeComboBox(root);

  return () => {
    comboBoxCleanup();
    delete (rootEl as any).__timePickerComboBoxInitialized;
  };
}

export { FILTER_DATASET };
