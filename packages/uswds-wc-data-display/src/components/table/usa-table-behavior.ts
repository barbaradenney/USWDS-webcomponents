/**
 * USWDS Table Behavior
 *
 * Mirrors official USWDS table JavaScript behavior exactly
 *
 * @uswds-source https://github.com/uswds/uswds/blob/develop/packages/usa-table/src/index.js
 * @uswds-version 3.10.0
 * @last-synced 2025-10-05
 * @sync-status ✅ UP TO DATE
 *
 * CRITICAL: This file replicates USWDS source code to maintain 100% behavior parity.
 * DO NOT add custom logic. ALL changes must come from USWDS source updates.
 */

import { selectOrMatches } from '@uswds-wc/core';
import { Sanitizer } from '@uswds-wc/core';

/**
 * Constants from USWDS
 *
 * SOURCE: index.js (Lines 6-13)
 */
const PREFIX = 'usa';
const TABLE = `.${PREFIX}-table`;
const SORTED = 'aria-sort';
const ASCENDING = 'ascending';
const DESCENDING = 'descending';
const SORT_OVERRIDE = 'data-sort-value';
const SORT_BUTTON_CLASS = `${PREFIX}-table__header__button`;
const SORT_BUTTON = `.${SORT_BUTTON_CLASS}`;
const SORTABLE_HEADER = `th[data-sortable]`;
const ANNOUNCEMENT_REGION = `.${PREFIX}-table__announcement-region[aria-live="polite"]`;

/**
 * Gets the data-sort-value attribute value, if provided — otherwise, gets
 * the innerText or textContent — of the child element (HTMLTableCellElement)
 * at the specified index of the given table row
 *
 * SOURCE: index.js (Lines 15-22)
 *
 * @param tr - Table row element
 * @param index - Cell index
 * @returns Cell value for sorting
 */
const getCellValue = (tr: HTMLTableRowElement, index: number): string => {
  const cell = tr.children[index] as HTMLElement;
  return cell.getAttribute(SORT_OVERRIDE) || cell.innerText || cell.textContent || '';
};

/**
 * Compares the values of two row array items at the given index, then sorts by the given direction
 *
 * SOURCE: index.js (Lines 24-42)
 *
 * @param index - Column index
 * @param isAscending - Sort direction
 * @returns Comparison function
 */
const compareFunction =
  (index: number, isAscending: boolean) =>
  (thisRow: HTMLTableRowElement, nextRow: HTMLTableRowElement): number => {
    // get values to compare from data attribute or cell content
    const value1 = getCellValue(isAscending ? thisRow : nextRow, index);
    const value2 = getCellValue(isAscending ? nextRow : thisRow, index);

    // if neither value is empty, and if both values are already numbers, compare numerically
    if (value1 && value2 && !Number.isNaN(Number(value1)) && !Number.isNaN(Number(value2))) {
      return Number(value1) - Number(value2);
    }
    // Otherwise, compare alphabetically based on current user locale
    return value1.toString().localeCompare(value2, navigator.language, {
      numeric: true,
      ignorePunctuation: true,
    });
  };

/**
 * Get an Array of column headers elements belonging directly to the given
 * table element.
 *
 * SOURCE: index.js (Lines 44-50)
 *
 * @param table - Table element
 * @returns Array of sortable header elements
 */
const getColumnHeaders = (table: HTMLTableElement): HTMLTableHeaderCellElement[] => {
  const headers = selectOrMatches(SORTABLE_HEADER, table);
  return headers.filter(
    (header) => header.closest(TABLE) === table
  ) as HTMLTableHeaderCellElement[];
};

/**
 * Update the button label within the given header element, resetting it
 * to the default state (ready to sort ascending) if it's no longer sorted
 *
 * SOURCE: index.js (Lines 52-69)
 *
 * @param header - Table header cell element
 */
const updateSortLabel = (header: HTMLTableHeaderCellElement): void => {
  const headerName = header.innerText;
  const sortedAscending = header.getAttribute(SORTED) === ASCENDING;
  const isSorted =
    header.getAttribute(SORTED) === ASCENDING ||
    header.getAttribute(SORTED) === DESCENDING ||
    false;
  const headerLabel = `${headerName}, sortable column, currently ${
    isSorted ? `${sortedAscending ? `sorted ${ASCENDING}` : `sorted ${DESCENDING}`}` : 'unsorted'
  }`;
  const headerButtonLabel = `Click to sort by ${headerName} in ${
    sortedAscending ? DESCENDING : ASCENDING
  } order.`;
  header.setAttribute('aria-label', headerLabel);
  const button = header.querySelector(SORT_BUTTON) as HTMLElement;
  if (button) {
    button.setAttribute('title', headerButtonLabel);
  }
};

/**
 * Remove the aria-sort attribute on the given header element, and reset the label and button icon
 *
 * SOURCE: index.js (Lines 71-75)
 *
 * @param header - Table header cell element
 */
const unsetSort = (header: HTMLTableHeaderCellElement): void => {
  header.removeAttribute(SORTED);
  updateSortLabel(header);
};

/**
 * Sort rows either ascending or descending, based on a given header's aria-sort attribute
 *
 * SOURCE: index.js (Lines 77-110)
 *
 * @param header - Table header cell element
 * @param isAscending - Sort direction
 * @returns true
 */
const sortRows = (header: HTMLTableHeaderCellElement, isAscending: boolean): boolean => {
  // CRITICAL: This logic is EXACTLY as in USWDS source (line 108)
  // The parameter name "isAscending" is misleading - when true, it sets DESCENDING
  // This is intentional USWDS behavior: the parameter indicates current state,
  // and the function sets the OPPOSITE state for toggling.
  header.setAttribute(SORTED, isAscending === true ? DESCENDING : ASCENDING);
  updateSortLabel(header);

  const table = header.closest(TABLE) as HTMLTableElement;
  const tbody = table.querySelector('tbody') as HTMLElement;

  // We can use Array.from() and Array.sort() instead once we drop IE11 support, likely in the summer of 2021
  //
  // Array.from(tbody.querySelectorAll('tr').sort(
  //   compareFunction(
  //     Array.from(header.parentNode.children).indexOf(header),
  //     !isAscending)
  //   )
  // .forEach(tr => tbody.appendChild(tr) );

  // [].slice.call() turns array-like sets into true arrays so that we can sort them
  const allRows = [].slice.call(tbody.querySelectorAll('tr')) as HTMLTableRowElement[];
  const allHeaders = [].slice.call((header.parentNode as HTMLElement).children) as HTMLElement[];
  const thisHeaderIndex = allHeaders.indexOf(header);
  allRows.sort(compareFunction(thisHeaderIndex, !isAscending)).forEach((tr) => {
    [].slice.call(tr.children).forEach((td: HTMLElement) => td.removeAttribute('data-sort-active'));
    (tr.children[thisHeaderIndex] as HTMLElement).setAttribute('data-sort-active', 'true');
    tbody.appendChild(tr);
  });

  return true;
};

/**
 * Update the live region immediately following the table whenever sort changes.
 *
 * SOURCE: index.js (Lines 112-127)
 *
 * @param table - Table element
 * @param sortedHeader - Sorted header element
 */
const updateLiveRegion = (
  table: HTMLTableElement,
  sortedHeader: HTMLTableHeaderCellElement
): void => {
  const captionElement = table.querySelector('caption');
  const caption = captionElement ? captionElement.innerText : '';
  const sortedAscending = sortedHeader.getAttribute(SORTED) === ASCENDING;
  const headerLabel = sortedHeader.innerText;
  const liveRegion = table.nextElementSibling as HTMLElement;
  if (liveRegion && liveRegion.matches(ANNOUNCEMENT_REGION)) {
    const sortAnnouncement = `The table named "${caption}" is now sorted by ${headerLabel} in ${
      sortedAscending ? ASCENDING : DESCENDING
    } order.`;
    liveRegion.innerText = sortAnnouncement;
  } else {
    throw new Error(
      `Table containing a sortable column header is not followed by an aria-live region.`
    );
  }
};

/**
 * Toggle a header's sort state, optionally providing a target
 * state.
 *
 * SOURCE: index.js (Lines 129-150)
 *
 * @param header - Table header cell element
 * @param isAscending - If no state is provided, the current state will be toggled
 */
const toggleSort = (header: HTMLTableHeaderCellElement, isAscending?: boolean): void => {
  const table = header.closest(TABLE) as HTMLTableElement;
  let safeAscending = isAscending;
  if (typeof safeAscending !== 'boolean') {
    safeAscending = header.getAttribute(SORTED) === ASCENDING;
  }

  if (!table) {
    throw new Error(`${SORTABLE_HEADER} is missing outer ${TABLE}`);
  }

  // Pass normalized safeAscending to ensure correct sort direction on first click
  // safeAscending is either the explicit parameter or derived from current aria-sort state
  safeAscending = sortRows(header, safeAscending!);

  if (safeAscending) {
    getColumnHeaders(table).forEach((otherHeader) => {
      if (otherHeader !== header) {
        unsetSort(otherHeader);
      }
    });
    updateLiveRegion(table, header);
  }
};

/**
 * Inserts a button with icon inside a sortable header
 *
 * SOURCE: index.js (Lines 152-171)
 *
 * @param header - Table header cell element
 */
const createHeaderButton = (header: HTMLTableHeaderCellElement): void => {
  const buttonEl = document.createElement('button');
  buttonEl.setAttribute('tabindex', '0');
  buttonEl.classList.add(SORT_BUTTON_CLASS);
  // ICON_SOURCE
  buttonEl.innerHTML = Sanitizer.escapeHTML`
  <svg class="${PREFIX}-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <g class="descending" fill="transparent">
      <path d="M17 17L15.59 15.59L12.9999 18.17V2H10.9999V18.17L8.41 15.58L7 17L11.9999 22L17 17Z" />
    </g>
    <g class="ascending" fill="transparent">
      <path transform="rotate(180, 12, 12)" d="M17 17L15.59 15.59L12.9999 18.17V2H10.9999V18.17L8.41 15.58L7 17L11.9999 22L17 17Z" />
    </g>
    <g class="unsorted" fill="transparent">
      <polygon points="15.17 15 13 17.17 13 6.83 15.17 9 16.58 7.59 12 3 7.41 7.59 8.83 9 11 6.83 11 17.17 8.83 15 7.42 16.41 12 21 16.59 16.41 15.17 15"/>
    </g>
  </svg>
  `;
  header.appendChild(buttonEl);
  updateSortLabel(header);
};

/**
 * Initialize table behavior
 *
 * SOURCE: index.js (Lines 173-199)
 *
 * @param root - Root element or document
 * @returns Cleanup function
 */
export function initializeTable(root: HTMLElement | Document = document): () => void {
  const sortableHeaders = selectOrMatches(SORTABLE_HEADER, root);
  sortableHeaders.forEach((header) => createHeaderButton(header as HTMLTableHeaderCellElement));

  const firstSorted = sortableHeaders.filter(
    (header) =>
      header.getAttribute(SORTED) === ASCENDING || header.getAttribute(SORTED) === DESCENDING
  )[0] as HTMLTableHeaderCellElement | undefined;

  if (typeof firstSorted !== 'undefined') {
    const sortDir = firstSorted.getAttribute(SORTED);
    if (sortDir === ASCENDING) {
      toggleSort(firstSorted, true);
    } else if (sortDir === DESCENDING) {
      toggleSort(firstSorted, false);
    }
  }

  // Event delegation for sort button clicks
  const handleClick = (event: Event) => {
    const target = event.target as HTMLElement;
    const button = target.closest(SORT_BUTTON);

    if (button) {
      event.preventDefault();
      const header = button.closest(SORTABLE_HEADER) as HTMLTableHeaderCellElement;
      if (header) {
        toggleSort(header, header.getAttribute(SORTED) === ASCENDING);
      }
    }
  };

  // Add event listener
  const rootEl = root === document ? document.body : (root as HTMLElement);
  rootEl.addEventListener('click', handleClick);

  return () => {
    rootEl.removeEventListener('click', handleClick);
  };
}

// Export utilities for potential reuse
export { toggleSort, createHeaderButton, updateLiveRegion };
