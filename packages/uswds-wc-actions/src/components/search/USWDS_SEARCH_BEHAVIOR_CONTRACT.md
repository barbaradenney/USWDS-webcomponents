# USWDS Search Behavior Contract

**Purpose**: This document defines the exact behavioral contract that our search component MUST match with USWDS.

**Source**: `@uswds/uswds/packages/usa-search/src/index.js` (USWDS 3.x)

**Status**: MANDATORY - All implementations must pass automated validation against this contract.

**Complexity**: MEDIUM

**Last Updated**: 2025-10-09

---

## Overview

The Search component mirrors USWDS JavaScript behavior exactly to maintain 100% behavioral parity.

**Implementation Files**:

- `src/components/search/usa-search-behavior.ts` - USWDS behavior mirror
- `src/components/search/usa-search.ts` - Web component wrapper

**Validation**:

- `src/components/search/usa-search-behavior.test.ts` - Behavioral tests

---

## Core Behaviors (MANDATORY)

### 1. Search button toggle

**USWDS Source**: Lines [TBD] in `index.js`

**Required Behavior**:

- ✅ [Describe expected behavior based on USWDS source]
- ✅ [Additional behavior requirement]
- ✅ [Additional behavior requirement]

**Validation Test**:

```typescript
it('should search button toggle', async () => {
  // TODO: Implement test based on USWDS behavior
  const element = document.createElement('usa-search');
  document.body.appendChild(element);
  await element.updateComplete;

  // Test implementation here
  expect(true).toBe(true);
});
```

---

### 2. Big/small variant handling

**USWDS Source**: Lines [TBD] in `index.js`

**Required Behavior**:

- ✅ [Describe expected behavior based on USWDS source]
- ✅ [Additional behavior requirement]
- ✅ [Additional behavior requirement]

**Validation Test**:

```typescript
it('should big/small variant handling', async () => {
  // TODO: Implement test based on USWDS behavior
  const element = document.createElement('usa-search');
  document.body.appendChild(element);
  await element.updateComplete;

  // Test implementation here
  expect(true).toBe(true);
});
```

---

### 3. Input visibility toggle

**USWDS Source**: Lines [TBD] in `index.js`

**Required Behavior**:

- ✅ [Describe expected behavior based on USWDS source]
- ✅ [Additional behavior requirement]
- ✅ [Additional behavior requirement]

**Validation Test**:

```typescript
it('should input visibility toggle', async () => {
  // TODO: Implement test based on USWDS behavior
  const element = document.createElement('usa-search');
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

- **`ignore()`** - Line 1

  ```javascript
  const ignore = require('receptor/ignore');
  ```

- **`behavior()`** - Line 2

  ```javascript
  const behavior = require('../../uswds-core/src/js/utils/behavior');
  ```

- **`select()`** - Line 3

  ```javascript
  const select = require('../../uswds-core/src/js/utils/select');
  ```

- **`BUTTON()`** - Line 7

  ```javascript
  const BUTTON = '.js-search-button';
  ```

- **`FORM()`** - Line 8

  ```javascript
  const FORM = '.js-search-form';
  ```

- **`INPUT()`** - Line 9

  ```javascript
  const INPUT = '[type=search]';
  ```

- **`CONTEXT()`** - Line 10

  ```javascript
  const CONTEXT = 'header'; // XXX
  ```

- **`getForm()`** - Line 14

  ```javascript
  const getForm = (button) => {
  ```

- **`toggleSearch()`** - Line 19

  ```javascript
  const toggleSearch = (button, active) => {
  ```

- **`showSearch()`** - Line 60
  ```javascript
  function showSearch() {
  ```

_...and 2 more functions_

---

## USWDS Source References

- **Package**: [@uswds/uswds/packages/usa-search](https://github.com/uswds/uswds/tree/develop/packages/usa-search)
- **Main File**: [index.js](https://github.com/uswds/uswds/blob/develop/packages/usa-search/src/index.js)
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
npm test -- usa-search-behavior.test.ts
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
