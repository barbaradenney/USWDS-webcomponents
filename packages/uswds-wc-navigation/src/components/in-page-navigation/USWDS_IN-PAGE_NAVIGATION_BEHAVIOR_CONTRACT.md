# USWDS In-Page Navigation Behavior Contract

**Purpose**: This document defines the exact behavioral contract that our in-page-navigation component MUST match with USWDS.

**Source**: `@uswds/uswds/packages/usa-in-page-navigation/src/index.js` (USWDS 3.x)

**Status**: MANDATORY - All implementations must pass automated validation against this contract.

**Complexity**: MEDIUM

**Last Updated**: 2025-10-09

---

## Overview

The In-Page Navigation component mirrors USWDS JavaScript behavior exactly to maintain 100% behavioral parity.

**Implementation Files**:

- `src/components/in-page-navigation/usa-in-page-navigation-behavior.ts` - USWDS behavior mirror
- `src/components/in-page-navigation/usa-in-page-navigation.ts` - Web component wrapper

**Validation**:

- `src/components/in-page-navigation/usa-in-page-navigation-behavior.test.ts` - Behavioral tests

---

## Core Behaviors (MANDATORY)

### 1. Scroll spy functionality

**USWDS Source**: Lines [TBD] in `index.js`

**Required Behavior**:

- ✅ [Describe expected behavior based on USWDS source]
- ✅ [Additional behavior requirement]
- ✅ [Additional behavior requirement]

**Validation Test**:

```typescript
it('should scroll spy functionality', async () => {
  // TODO: Implement test based on USWDS behavior
  const element = document.createElement('usa-in-page-navigation');
  document.body.appendChild(element);
  await element.updateComplete;

  // Test implementation here
  expect(true).toBe(true);
});
```

---

### 2. Active section tracking

**USWDS Source**: Lines [TBD] in `index.js`

**Required Behavior**:

- ✅ [Describe expected behavior based on USWDS source]
- ✅ [Additional behavior requirement]
- ✅ [Additional behavior requirement]

**Validation Test**:

```typescript
it('should active section tracking', async () => {
  // TODO: Implement test based on USWDS behavior
  const element = document.createElement('usa-in-page-navigation');
  document.body.appendChild(element);
  await element.updateComplete;

  // Test implementation here
  expect(true).toBe(true);
});
```

---

### 3. Smooth scrolling

**USWDS Source**: Lines [TBD] in `index.js`

**Required Behavior**:

- ✅ [Describe expected behavior based on USWDS source]
- ✅ [Additional behavior requirement]
- ✅ [Additional behavior requirement]

**Validation Test**:

```typescript
it('should smooth scrolling', async () => {
  // TODO: Implement test based on USWDS behavior
  const element = document.createElement('usa-in-page-navigation');
  document.body.appendChild(element);
  await element.updateComplete;

  // Test implementation here
  expect(true).toBe(true);
});
```

---

### 4. Threshold detection

**USWDS Source**: Lines [TBD] in `index.js`

**Required Behavior**:

- ✅ [Describe expected behavior based on USWDS source]
- ✅ [Additional behavior requirement]
- ✅ [Additional behavior requirement]

**Validation Test**:

```typescript
it('should threshold detection', async () => {
  // TODO: Implement test based on USWDS behavior
  const element = document.createElement('usa-in-page-navigation');
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

- **`once()`** - Line 1

  ```javascript
  const once = require('receptor/once');
  ```

- **`keymap()`** - Line 2

  ```javascript
  const keymap = require('receptor/keymap');
  ```

- **`selectOrMatches()`** - Line 3

  ```javascript
  const selectOrMatches = require('../../uswds-core/src/js/utils/select-or-matches');
  ```

- **`behavior()`** - Line 4

  ```javascript
  const behavior = require('../../uswds-core/src/js/utils/behavior');
  ```

- **`Sanitizer()`** - Line 7

  ```javascript
  const Sanitizer = require('../../uswds-core/src/js/utils/sanitizer');
  ```

- **`CURRENT_CLASS()`** - Line 9

  ```javascript
  const CURRENT_CLASS = `${PREFIX}-current`;
  ```

- **`IN_PAGE_NAV_HEADINGS()`** - Line 10

  ```javascript
  const IN_PAGE_NAV_HEADINGS = 'h2 h3';
  ```

- **`IN_PAGE_NAV_VALID_HEADINGS()`** - Line 11

  ```javascript
  const IN_PAGE_NAV_VALID_HEADINGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  ```

- **`IN_PAGE_NAV_TITLE_TEXT()`** - Line 12

  ```javascript
  const IN_PAGE_NAV_TITLE_TEXT = 'On this page';
  ```

- **`IN_PAGE_NAV_TITLE_HEADING_LEVEL()`** - Line 13
  ```javascript
  const IN_PAGE_NAV_TITLE_HEADING_LEVEL = 'h4';
  ```

_...and 28 more functions_

---

## USWDS Source References

- **Package**: [@uswds/uswds/packages/usa-in-page-navigation](https://github.com/uswds/uswds/tree/develop/packages/usa-in-page-navigation)
- **Main File**: [index.js](https://github.com/uswds/uswds/blob/develop/packages/usa-in-page-navigation/src/index.js)
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
npm test -- usa-in-page-navigation-behavior.test.ts
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
