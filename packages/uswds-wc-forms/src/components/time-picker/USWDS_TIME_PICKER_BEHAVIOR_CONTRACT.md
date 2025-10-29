# USWDS Time Picker Behavior Contract

**Purpose**: This document defines the exact behavioral contract that our time-picker component MUST match with USWDS.

**Source**: `@uswds/uswds/packages/usa-time-picker/src/index.js` (USWDS 3.x)

**Status**: MANDATORY - All implementations must pass automated validation against this contract.

**Complexity**: HIGH

**Last Updated**: 2025-10-09

---

## Overview

The Time Picker component mirrors USWDS JavaScript behavior exactly to maintain 100% behavioral parity.

**Implementation Files**:

- `src/components/time-picker/usa-time-picker-behavior.ts` - USWDS behavior mirror
- `src/components/time-picker/usa-time-picker.ts` - Web component wrapper

**Validation**:

- `src/components/time-picker/usa-time-picker-behavior.test.ts` - Behavioral tests

---

## Core Behaviors (MANDATORY)

### 1. Combo box transformation

**USWDS Source**: Lines [TBD] in `index.js`

**Required Behavior**:

- ✅ [Describe expected behavior based on USWDS source]
- ✅ [Additional behavior requirement]
- ✅ [Additional behavior requirement]

**Validation Test**:

```typescript
it('should combo box transformation', async () => {
  // TODO: Implement test based on USWDS behavior
  const element = document.createElement('usa-time-picker');
  document.body.appendChild(element);
  await element.updateComplete;

  // Test implementation here
  expect(true).toBe(true);
});
```

---

### 2. Time filtering

**USWDS Source**: Lines [TBD] in `index.js`

**Required Behavior**:

- ✅ [Describe expected behavior based on USWDS source]
- ✅ [Additional behavior requirement]
- ✅ [Additional behavior requirement]

**Validation Test**:

```typescript
it('should time filtering', async () => {
  // TODO: Implement test based on USWDS behavior
  const element = document.createElement('usa-time-picker');
  document.body.appendChild(element);
  await element.updateComplete;

  // Test implementation here
  expect(true).toBe(true);
});
```

---

### 3. Step increment validation

**USWDS Source**: Lines [TBD] in `index.js`

**Required Behavior**:

- ✅ [Describe expected behavior based on USWDS source]
- ✅ [Additional behavior requirement]
- ✅ [Additional behavior requirement]

**Validation Test**:

```typescript
it('should step increment validation', async () => {
  // TODO: Implement test based on USWDS behavior
  const element = document.createElement('usa-time-picker');
  document.body.appendChild(element);
  await element.updateComplete;

  // Test implementation here
  expect(true).toBe(true);
});
```

---

### 4. Input formatting

**USWDS Source**: Lines [TBD] in `index.js`

**Required Behavior**:

- ✅ [Describe expected behavior based on USWDS source]
- ✅ [Additional behavior requirement]
- ✅ [Additional behavior requirement]

**Validation Test**:

```typescript
it('should input formatting', async () => {
  // TODO: Implement test based on USWDS behavior
  const element = document.createElement('usa-time-picker');
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

- **`behavior()`** - Line 1

  ```javascript
  const behavior = require('../../uswds-core/src/js/utils/behavior');
  ```

- **`selectOrMatches()`** - Line 2

  ```javascript
  const selectOrMatches = require('../../uswds-core/src/js/utils/select-or-matches');
  ```

- **`TIME_PICKER_CLASS()`** - Line 9

  ```javascript
  const TIME_PICKER_CLASS = `${PREFIX}-time-picker`;
  ```

- **`TIME_PICKER()`** - Line 10

  ```javascript
  const TIME_PICKER = `.${TIME_PICKER_CLASS}`;
  ```

- **`MAX_TIME()`** - Line 11

  ```javascript
  const MAX_TIME = 60 * 24 - 1;
  ```

- **`MIN_TIME()`** - Line 12

  ```javascript
  const MIN_TIME = 0;
  ```

- **`DEFAULT_STEP()`** - Line 13

  ```javascript
  const DEFAULT_STEP = 30;
  ```

- **`MIN_STEP()`** - Line 14

  ```javascript
  const MIN_STEP = 1;
  ```

- **`FILTER_DATASET()`** - Line 16

  ```javascript
  const FILTER_DATASET = {
  ```

- **`parseTimeString()`** - Line 30
  ```javascript
  const parseTimeString = (timeStr) => {
  ```

_...and 2 more functions_

---

## USWDS Source References

- **Package**: [@uswds/uswds/packages/usa-time-picker](https://github.com/uswds/uswds/tree/develop/packages/usa-time-picker)
- **Main File**: [index.js](https://github.com/uswds/uswds/blob/develop/packages/usa-time-picker/src/index.js)
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
npm test -- usa-time-picker-behavior.test.ts
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
