# USWDS Language Selector Behavior Contract

**Purpose**: This document defines the exact behavioral contract that our language-selector component MUST match with USWDS.

**Source**: `@uswds/uswds/packages/usa-language-selector/src/index.js` (USWDS 3.x)

**Status**: MANDATORY - All implementations must pass automated validation against this contract.

**Complexity**: LOW

**Last Updated**: 2025-10-09

---

## Overview

The Language Selector component mirrors USWDS JavaScript behavior exactly to maintain 100% behavioral parity.

**Implementation Files**:

- `src/components/language-selector/usa-language-selector-behavior.ts` - USWDS behavior mirror
- `src/components/language-selector/usa-language-selector.ts` - Web component wrapper

**Validation**:

- `src/components/language-selector/usa-language-selector-behavior.test.ts` - Behavioral tests

---

## Core Behaviors (MANDATORY)

### 1. Dropdown toggle

**USWDS Source**: Lines [TBD] in `index.js`

**Required Behavior**:

- ✅ [Describe expected behavior based on USWDS source]
- ✅ [Additional behavior requirement]
- ✅ [Additional behavior requirement]

**Validation Test**:

```typescript
it('should dropdown toggle', async () => {
  // TODO: Implement test based on USWDS behavior
  const element = document.createElement('usa-language-selector');
  document.body.appendChild(element);
  await element.updateComplete;

  // Test implementation here
  expect(true).toBe(true);
});
```

---

### 2. Language selection

**USWDS Source**: Lines [TBD] in `index.js`

**Required Behavior**:

- ✅ [Describe expected behavior based on USWDS source]
- ✅ [Additional behavior requirement]
- ✅ [Additional behavior requirement]

**Validation Test**:

```typescript
it('should language selection', async () => {
  // TODO: Implement test based on USWDS behavior
  const element = document.createElement('usa-language-selector');
  document.body.appendChild(element);
  await element.updateComplete;

  // Test implementation here
  expect(true).toBe(true);
});
```

---

### 3. Button state management

**USWDS Source**: Lines [TBD] in `index.js`

**Required Behavior**:

- ✅ [Describe expected behavior based on USWDS source]
- ✅ [Additional behavior requirement]
- ✅ [Additional behavior requirement]

**Validation Test**:

```typescript
it('should button state management', async () => {
  // TODO: Implement test based on USWDS behavior
  const element = document.createElement('usa-language-selector');
  document.body.appendChild(element);
  await element.updateComplete;

  // Test implementation here
  expect(true).toBe(true);
});
```

---

## Validation Requirements

- ✅ All behavioral tests must pass (100%)
- ✅ Component must match USWDS DOM structure exactly
- ✅ Component must replicate USWDS event handling patterns
- ✅ Component must maintain USWDS accessibility features (ARIA, keyboard)
- ✅ Component must handle edge cases identical to USWDS

---

## USWDS Source Functions

Key functions from USWDS source (for reference during implementation):

- **`keymap()`** - Line 1

  ```javascript
  const keymap = require('receptor/keymap');
  ```

- **`behavior()`** - Line 2

  ```javascript
  const behavior = require('../../uswds-core/src/js/utils/behavior');
  ```

- **`toggle()`** - Line 3

  ```javascript
  const toggle = require('../../uswds-core/src/js/utils/toggle');
  ```

- **`FocusTrap()`** - Line 4

  ```javascript
  const FocusTrap = require('../../uswds-core/src/js/utils/focus-trap');
  ```

- **`accordion()`** - Line 5

  ```javascript
  const accordion = require('../../usa-accordion/src/index');
  ```

- **`BODY()`** - Line 10

  ```javascript
  const BODY = 'body';
  ```

- **`LANGUAGE()`** - Line 11

  ```javascript
  const LANGUAGE = `.${PREFIX}-language`;
  ```

- **`LANGUAGE_SUB()`** - Line 12

  ```javascript
  const LANGUAGE_SUB = `.${PREFIX}-language__submenu`;
  ```

- **`LANGUAGE_PRIMARY()`** - Line 13

  ```javascript
  const LANGUAGE_PRIMARY = `.${PREFIX}-language__primary`;
  ```

- **`LANGUAGE_PRIMARY_ITEM()`** - Line 14
  ```javascript
  const LANGUAGE_PRIMARY_ITEM = `.${PREFIX}-language__primary-item`;
  ```

_...and 6 more functions_

---

## USWDS Source References

- **Package**: [@uswds/uswds/packages/usa-language-selector](https://github.com/uswds/uswds/tree/develop/packages/usa-language-selector)
- **Main File**: [index.js](https://github.com/uswds/uswds/blob/develop/packages/usa-language-selector/src/index.js)
- **USWDS Version**: 3.x
- **Last Synced**: 2025-10-09

---

## Maintenance Notes

**When to Update**:

- 🔄 USWDS version upgrade
- 🐛 USWDS source code changes
- 🧪 New behavioral requirements discovered

**Update Process**:

1. Review USWDS source changes
2. Update behavior implementation
3. Update this contract document
4. Run all validation tests
5. Update `Last Synced` date

**Validation Command**:

```bash
npm test -- usa-language-selector-behavior.test.ts
```

---

## Notes

> **⚠️ CRITICAL**: This component uses vanilla JS behavior mirroring.
> DO NOT add custom logic - ALL changes must come from USWDS source updates.

**Why Vanilla JS?**

- Component behavior requires USWDS source mirroring
- Ensures 100% behavioral parity with USWDS
- Prevents Storybook navigation issues and module caching conflicts

**Related Documentation**:

- [JavaScript Integration Strategy](../../../docs/JAVASCRIPT_INTEGRATION_STRATEGY.md)
- [Component README](./README.mdx)
