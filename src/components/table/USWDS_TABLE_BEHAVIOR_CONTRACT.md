# USWDS Table Behavior Contract

**Purpose**: This document defines the exact behavioral contract that our table component MUST match with USWDS.

**Source**: `@uswds/uswds/packages/usa-table/src/index.js` (USWDS 3.x)

**Status**: MANDATORY - All implementations must pass automated validation against this contract.

**Complexity**: MEDIUM

**Last Updated**: 2025-10-09

---

## Overview

The Table component mirrors USWDS JavaScript behavior exactly to maintain 100% behavioral parity.

**Implementation Files**:
- `src/components/table/usa-table-behavior.ts` - USWDS behavior mirror
- `src/components/table/usa-table.ts` - Web component wrapper

**Validation**:
- `src/components/table/usa-table-behavior.test.ts` - Behavioral tests

---

## Core Behaviors (MANDATORY)

### 1. Sortable header clicks

**USWDS Source**: Lines [TBD] in `index.js`

**Required Behavior**:
- ✅ [Describe expected behavior based on USWDS source]
- ✅ [Additional behavior requirement]
- ✅ [Additional behavior requirement]

**Validation Test**:
```typescript
it('should sortable header clicks', async () => {
  // TODO: Implement test based on USWDS behavior
  const element = document.createElement('usa-table');
  document.body.appendChild(element);
  await element.updateComplete;

  // Test implementation here
  expect(true).toBe(true);
});
```

---

### 2. Sort direction toggle

**USWDS Source**: Lines [TBD] in `index.js`

**Required Behavior**:
- ✅ [Describe expected behavior based on USWDS source]
- ✅ [Additional behavior requirement]
- ✅ [Additional behavior requirement]

**Validation Test**:
```typescript
it('should sort direction toggle', async () => {
  // TODO: Implement test based on USWDS behavior
  const element = document.createElement('usa-table');
  document.body.appendChild(element);
  await element.updateComplete;

  // Test implementation here
  expect(true).toBe(true);
});
```

---

### 3. ARIA sort attributes

**USWDS Source**: Lines [TBD] in `index.js`

**Required Behavior**:
- ✅ [Describe expected behavior based on USWDS source]
- ✅ [Additional behavior requirement]
- ✅ [Additional behavior requirement]

**Validation Test**:
```typescript
it('should aria sort attributes', async () => {
  // TODO: Implement test based on USWDS behavior
  const element = document.createElement('usa-table');
  document.body.appendChild(element);
  await element.updateComplete;

  // Test implementation here
  expect(true).toBe(true);
});
```

---

### 4. Row reordering

**USWDS Source**: Lines [TBD] in `index.js`

**Required Behavior**:
- ✅ [Describe expected behavior based on USWDS source]
- ✅ [Additional behavior requirement]
- ✅ [Additional behavior requirement]

**Validation Test**:
```typescript
it('should row reordering', async () => {
  // TODO: Implement test based on USWDS behavior
  const element = document.createElement('usa-table');
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

- **`select()`** - Line 1
  ```javascript
  const select = require("../../uswds-core/src/js/utils/select");
  ```

- **`behavior()`** - Line 2
  ```javascript
  const behavior = require("../../uswds-core/src/js/utils/behavior");
  ```

- **`Sanitizer()`** - Line 5
  ```javascript
  const Sanitizer = require("../../uswds-core/src/js/utils/sanitizer");
  ```

- **`TABLE()`** - Line 7
  ```javascript
  const TABLE = `.${PREFIX}-table`;
  ```

- **`SORTED()`** - Line 8
  ```javascript
  const SORTED = "aria-sort";
  ```

- **`ASCENDING()`** - Line 9
  ```javascript
  const ASCENDING = "ascending";
  ```

- **`DESCENDING()`** - Line 10
  ```javascript
  const DESCENDING = "descending";
  ```

- **`SORT_OVERRIDE()`** - Line 11
  ```javascript
  const SORT_OVERRIDE = "data-sort-value";
  ```

- **`SORT_BUTTON_CLASS()`** - Line 12
  ```javascript
  const SORT_BUTTON_CLASS = `${PREFIX}-table__header__button`;
  ```

- **`SORT_BUTTON()`** - Line 13
  ```javascript
  const SORT_BUTTON = `.${SORT_BUTTON_CLASS}`;
  ```


*...and 12 more functions*


---

## USWDS Source References

- **Package**: [@uswds/uswds/packages/usa-table](https://github.com/uswds/uswds/tree/develop/packages/usa-table)
- **Main File**: [index.js](https://github.com/uswds/uswds/blob/develop/packages/usa-table/src/index.js)
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
npm test -- usa-table-behavior.test.ts
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
