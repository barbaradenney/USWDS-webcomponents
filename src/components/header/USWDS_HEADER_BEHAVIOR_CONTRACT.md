# USWDS Header Behavior Contract

**Purpose**: This document defines the exact behavioral contract that our header component MUST match with USWDS.

**Source**: `@uswds/uswds/packages/usa-header/src/index.js` (USWDS 3.x)

**Status**: MANDATORY - All implementations must pass automated validation against this contract.

**Complexity**: HIGH

**Last Updated**: 2025-10-09

---

## Overview

The Header component mirrors USWDS JavaScript behavior exactly to maintain 100% behavioral parity.

**Implementation Files**:
- `src/components/header/usa-header-behavior.ts` - USWDS behavior mirror
- `src/components/header/usa-header.ts` - Web component wrapper

**Validation**:
- `src/components/header/usa-header-behavior.test.ts` - Behavioral tests

---

## Core Behaviors (MANDATORY)

### 1. Navigation menu toggle

**USWDS Source**: Lines [TBD] in `index.js`

**Required Behavior**:
- ✅ [Describe expected behavior based on USWDS source]
- ✅ [Additional behavior requirement]
- ✅ [Additional behavior requirement]

**Validation Test**:
```typescript
it('should navigation menu toggle', async () => {
  // TODO: Implement test based on USWDS behavior
  const element = document.createElement('usa-header');
  document.body.appendChild(element);
  await element.updateComplete;

  // Test implementation here
  expect(true).toBe(true);
});
```

---

### 2. Focus trap management

**USWDS Source**: Lines [TBD] in `index.js`

**Required Behavior**:
- ✅ [Describe expected behavior based on USWDS source]
- ✅ [Additional behavior requirement]
- ✅ [Additional behavior requirement]

**Validation Test**:
```typescript
it('should focus trap management', async () => {
  // TODO: Implement test based on USWDS behavior
  const element = document.createElement('usa-header');
  document.body.appendChild(element);
  await element.updateComplete;

  // Test implementation here
  expect(true).toBe(true);
});
```

---

### 3. Resize event handling

**USWDS Source**: Lines [TBD] in `index.js`

**Required Behavior**:
- ✅ [Describe expected behavior based on USWDS source]
- ✅ [Additional behavior requirement]
- ✅ [Additional behavior requirement]

**Validation Test**:
```typescript
it('should resize event handling', async () => {
  // TODO: Implement test based on USWDS behavior
  const element = document.createElement('usa-header');
  document.body.appendChild(element);
  await element.updateComplete;

  // Test implementation here
  expect(true).toBe(true);
});
```

---

### 4. Menu collapse/expand

**USWDS Source**: Lines [TBD] in `index.js`

**Required Behavior**:
- ✅ [Describe expected behavior based on USWDS source]
- ✅ [Additional behavior requirement]
- ✅ [Additional behavior requirement]

**Validation Test**:
```typescript
it('should menu collapse/expand', async () => {
  // TODO: Implement test based on USWDS behavior
  const element = document.createElement('usa-header');
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

- **`toggle()`** - Line 4
  ```javascript
  const toggle = require("../../uswds-core/src/js/utils/toggle");
  ```

- **`FocusTrap()`** - Line 5
  ```javascript
  const FocusTrap = require("../../uswds-core/src/js/utils/focus-trap");
  ```

- **`accordion()`** - Line 6
  ```javascript
  const accordion = require("../../usa-accordion/src/index");
  ```

- **`ScrollBarWidth()`** - Line 7
  ```javascript
  const ScrollBarWidth = require("../../uswds-core/src/js/utils/scrollbar-width");
  ```

- **`BODY()`** - Line 12
  ```javascript
  const BODY = "body";
  ```

- **`HEADER()`** - Line 13
  ```javascript
  const HEADER = `.${PREFIX}-header`;
  ```

- **`NAV()`** - Line 14
  ```javascript
  const NAV = `.${PREFIX}-nav`;
  ```


*...and 31 more functions*


---

## USWDS Source References

- **Package**: [@uswds/uswds/packages/usa-header](https://github.com/uswds/uswds/tree/develop/packages/usa-header)
- **Main File**: [index.js](https://github.com/uswds/uswds/blob/develop/packages/usa-header/src/index.js)
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
npm test -- usa-header-behavior.test.ts
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
