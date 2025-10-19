/**
 * Sanitizer Utility
 *
 * Mirrors official USWDS HTML sanitization utility
 *
 * SOURCE: uswds-core/src/js/utils/sanitizer.js (Lines 1-101)
 * @uswds-source https://github.com/uswds/uswds/blob/develop/packages/uswds-core/src/js/utils/sanitizer.js
 * @uswds-version 3.8.0
 * @last-synced 2025-10-05
 * @sync-status ✅ UP TO DATE
 *
 * CRITICAL: This file replicates USWDS source code to maintain 100% behavior parity.
 * DO NOT add custom logic. ALL changes must come from USWDS source updates.
 */

/**
 * Safe HTML object
 */
interface SafeHTML {
  __html: string;
  toString: () => string;
  info: string;
}

/**
 * HTML entities for escaping
 *
 * SOURCE: sanitizer.js (Lines 23-32)
 */
const ENTITY_REGEX = /[&<>"'/]/g;

const ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
  '/': '&#x2F;',
};

/**
 * Get entity replacement
 *
 * SOURCE: sanitizer.js (Lines 34-36)
 *
 * @param s - Character to escape
 * @returns Escaped entity
 */
function getEntity(s: string): string {
  return ENTITIES[s];
}

/**
 * Escape HTML for all values in a tagged template string
 *
 * SOURCE: sanitizer.js (Lines 41-56)
 *
 * @param strings - Template strings
 * @param values - Template values
 * @returns Escaped HTML string
 */
function escapeHTML(strings: TemplateStringsArray | string[], ...values: any[]): string {
  let result = '';

  for (let i = 0; i < strings.length; i++) {
    result += strings[i];
    if (i + 1 < strings.length + values.length) {
      const value = values[i] || '';
      result += String(value).replace(ENTITY_REGEX, getEntity);
    }
  }

  return result;
}

/**
 * Escape HTML and return a wrapped object to be used during DOM insertion
 *
 * SOURCE: sanitizer.js (Lines 60-80)
 *
 * @param strings - Template strings
 * @param values - Template values
 * @returns Safe HTML object
 */
function createSafeHTML(strings: TemplateStringsArray | string[], ...values: any[]): SafeHTML {
  const escaped = escapeHTML(strings, ...values);
  return {
    __html: escaped,
    toString: () => '[object WrappedHTMLObject]',
    info:
      'This is a wrapped HTML object. See https://developer.mozilla.or' +
      'g/en-US/Firefox_OS/Security/Security_Automation for more.',
  };
}

/**
 * Unwrap safe HTML created by createSafeHTML
 *
 * SOURCE: sanitizer.js (Lines 85-96)
 *
 * @param htmlObjects - Safe HTML objects
 * @returns Unwrapped HTML string
 */
function unwrapSafeHTML(...htmlObjects: SafeHTML[]): string {
  const markupList = htmlObjects.map((obj) => obj.__html);
  return markupList.join('');
}

/**
 * Sanitizer object
 *
 * SOURCE: sanitizer.js (Lines 22-97)
 */
export const Sanitizer = {
  _entity: ENTITY_REGEX,
  _entities: ENTITIES,
  getEntity,
  escapeHTML,
  createSafeHTML,
  unwrapSafeHTML,
};

export default Sanitizer;
