# USWDS Date Picker Behavior Contract

**Purpose**: This document defines the exact behavioral contract that our date-picker component MUST match with USWDS.

**Source**: `@uswds/uswds/packages/usa-date-picker/src/index.js` (USWDS 3.x)

**Status**: MANDATORY - All implementations must pass automated validation against this contract.

**Complexity**: HIGH

**Last Updated**: 2025-10-09

---

## Overview

The Date Picker component mirrors USWDS JavaScript behavior exactly to maintain 100% behavioral parity.

**Implementation Files**:
- `src/components/date-picker/usa-date-picker-behavior.ts` - USWDS behavior mirror
- `src/components/date-picker/usa-date-picker.ts` - Web component wrapper

**Validation**:
- `src/components/date-picker/usa-date-picker-behavior.test.ts` - Behavioral tests

---

## Core Behaviors (MANDATORY)

### 1. Calendar rendering

**USWDS Source**: Lines [TBD] in `index.js`

**Required Behavior**:
- ✅ [Describe expected behavior based on USWDS source]
- ✅ [Additional behavior requirement]
- ✅ [Additional behavior requirement]

**Validation Test**:
```typescript
it('should calendar rendering', async () => {
  // TODO: Implement test based on USWDS behavior
  const element = document.createElement('usa-date-picker');
  document.body.appendChild(element);
  await element.updateComplete;

  // Test implementation here
  expect(true).toBe(true);
});
```

---

### 2. Date selection

**USWDS Source**: Lines [TBD] in `index.js`

**Required Behavior**:
- ✅ [Describe expected behavior based on USWDS source]
- ✅ [Additional behavior requirement]
- ✅ [Additional behavior requirement]

**Validation Test**:
```typescript
it('should date selection', async () => {
  // TODO: Implement test based on USWDS behavior
  const element = document.createElement('usa-date-picker');
  document.body.appendChild(element);
  await element.updateComplete;

  // Test implementation here
  expect(true).toBe(true);
});
```

---

### 3. Keyboard navigation

**USWDS Source**: Lines [TBD] in `index.js`

**Required Behavior**:
- ✅ [Describe expected behavior based on USWDS source]
- ✅ [Additional behavior requirement]
- ✅ [Additional behavior requirement]

**Validation Test**:
```typescript
it('should keyboard navigation', async () => {
  // TODO: Implement test based on USWDS behavior
  const element = document.createElement('usa-date-picker');
  document.body.appendChild(element);
  await element.updateComplete;

  // Test implementation here
  expect(true).toBe(true);
});
```

---

### 4. Min/max date validation

**USWDS Source**: Lines [TBD] in `index.js`

**Required Behavior**:
- ✅ [Describe expected behavior based on USWDS source]
- ✅ [Additional behavior requirement]
- ✅ [Additional behavior requirement]

**Validation Test**:
```typescript
it('should min/max date validation', async () => {
  // TODO: Implement test based on USWDS behavior
  const element = document.createElement('usa-date-picker');
  document.body.appendChild(element);
  await element.updateComplete;

  // Test implementation here
  expect(true).toBe(true);
});
```

---

### 5. Input formatting

**USWDS Source**: Lines [TBD] in `index.js`

**Required Behavior**:
- ✅ [Describe expected behavior based on USWDS source]
- ✅ [Additional behavior requirement]
- ✅ [Additional behavior requirement]

**Validation Test**:
```typescript
it('should input formatting', async () => {
  // TODO: Implement test based on USWDS behavior
  const element = document.createElement('usa-date-picker');
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
  const keymap = require("receptor/keymap");
  ```

- **`behavior()`** - Line 2
  ```javascript
  const behavior = require("../../uswds-core/src/js/utils/behavior");
  ```

- **`select()`** - Line 3
  ```javascript
  const select = require("../../uswds-core/src/js/utils/select");
  ```

- **`selectOrMatches()`** - Line 4
  ```javascript
  const selectOrMatches = require("../../uswds-core/src/js/utils/select-or-matches");
  ```

- **`activeElement()`** - Line 7
  ```javascript
  const activeElement = require("../../uswds-core/src/js/utils/active-element");
  ```

- **`isIosDevice()`** - Line 8
  ```javascript
  const isIosDevice = require("../../uswds-core/src/js/utils/is-ios-device");
  ```

- **`Sanitizer()`** - Line 9
  ```javascript
  const Sanitizer = require("../../uswds-core/src/js/utils/sanitizer");
  ```

- **`DATE_PICKER_CLASS()`** - Line 11
  ```javascript
  const DATE_PICKER_CLASS = `${PREFIX}-date-picker`;
  ```

- **`DATE_PICKER_WRAPPER_CLASS()`** - Line 12
  ```javascript
  const DATE_PICKER_WRAPPER_CLASS = `${DATE_PICKER_CLASS}__wrapper`;
  ```

- **`DATE_PICKER_INITIALIZED_CLASS()`** - Line 13
  ```javascript
  const DATE_PICKER_INITIALIZED_CLASS = `${DATE_PICKER_CLASS}--initialized`;
  ```


*...and 171 more functions*


---

## USWDS Source References

- **Package**: [@uswds/uswds/packages/usa-date-picker](https://github.com/uswds/uswds/tree/develop/packages/usa-date-picker)
- **Main File**: [index.js](https://github.com/uswds/uswds/blob/develop/packages/usa-date-picker/src/index.js)
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
npm test -- usa-date-picker-behavior.test.ts
```

---

## Notes

> **⚠️ CRITICAL**: This component uses vanilla JS behavior mirroring.
> DO NOT add custom logic - ALL changes must come from USWDS source updates.

**Why Vanilla JS?**
- Complex behavior requiring direct USWDS source replication
- Ensures 100% behavioral parity with USWDS
- Prevents Storybook navigation issues and module caching conflicts

**Related Documentation**:
- [JavaScript Integration Strategy](../../../docs/JAVASCRIPT_INTEGRATION_STRATEGY.md)
- [Component README](./README.mdx)
