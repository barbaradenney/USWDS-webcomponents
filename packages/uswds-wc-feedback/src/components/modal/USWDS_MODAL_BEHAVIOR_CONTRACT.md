# USWDS Modal Behavior Contract

**Purpose**: This document defines the exact behavioral contract that our modal component MUST match with USWDS.

**Source**: `@uswds/uswds/packages/usa-modal/src/index.js` (USWDS 3.x)

**Status**: MANDATORY - All implementations must pass automated validation against this contract.

**Complexity**: HIGH

**Last Updated**: 2025-10-09

---

## Overview

The Modal component mirrors USWDS JavaScript behavior exactly to maintain 100% behavioral parity.

**Implementation Files**:

- `src/components/modal/usa-modal-behavior.ts` - USWDS behavior mirror
- `src/components/modal/usa-modal.ts` - Web component wrapper

**Validation**:

- `src/components/modal/usa-modal-behavior.test.ts` - Behavioral tests

---

## Core Behaviors (MANDATORY)

### 1. Modal open/close toggle

**USWDS Source**: Lines [TBD] in `index.js`

**Required Behavior**:

- ✅ [Describe expected behavior based on USWDS source]
- ✅ [Additional behavior requirement]
- ✅ [Additional behavior requirement]

**Validation Test**:

```typescript
it('should modal open/close toggle', async () => {
  // TODO: Implement test based on USWDS behavior
  const element = document.createElement('usa-modal');
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
  const element = document.createElement('usa-modal');
  document.body.appendChild(element);
  await element.updateComplete;

  // Test implementation here
  expect(true).toBe(true);
});
```

---

### 3. Escape key handling

**USWDS Source**: Lines [TBD] in `index.js`

**Required Behavior**:

- ✅ [Describe expected behavior based on USWDS source]
- ✅ [Additional behavior requirement]
- ✅ [Additional behavior requirement]

**Validation Test**:

```typescript
it('should escape key handling', async () => {
  // TODO: Implement test based on USWDS behavior
  const element = document.createElement('usa-modal');
  document.body.appendChild(element);
  await element.updateComplete;

  // Test implementation here
  expect(true).toBe(true);
});
```

---

### 4. Overlay click handling

**USWDS Source**: Lines [TBD] in `index.js`

**Required Behavior**:

- ✅ [Describe expected behavior based on USWDS source]
- ✅ [Additional behavior requirement]
- ✅ [Additional behavior requirement]

**Validation Test**:

```typescript
it('should overlay click handling', async () => {
  // TODO: Implement test based on USWDS behavior
  const element = document.createElement('usa-modal');
  document.body.appendChild(element);
  await element.updateComplete;

  // Test implementation here
  expect(true).toBe(true);
});
```

---

### 5. Force action variant (no close)

**USWDS Source**: Lines [TBD] in `index.js`

**Required Behavior**:

- ✅ [Describe expected behavior based on USWDS source]
- ✅ [Additional behavior requirement]
- ✅ [Additional behavior requirement]

**Validation Test**:

```typescript
it('should force action variant (no close)', async () => {
  // TODO: Implement test based on USWDS behavior
  const element = document.createElement('usa-modal');
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

- **`selectOrMatches()`** - Line 1

  ```javascript
  const selectOrMatches = require('../../uswds-core/src/js/utils/select-or-matches');
  ```

- **`FocusTrap()`** - Line 2

  ```javascript
  const FocusTrap = require('../../uswds-core/src/js/utils/focus-trap');
  ```

- **`ScrollBarWidth()`** - Line 3

  ```javascript
  const ScrollBarWidth = require('../../uswds-core/src/js/utils/scrollbar-width');
  ```

- **`behavior()`** - Line 4

  ```javascript
  const behavior = require('../../uswds-core/src/js/utils/behavior');
  ```

- **`MODAL_CLASSNAME()`** - Line 8

  ```javascript
  const MODAL_CLASSNAME = `${PREFIX}-modal`;
  ```

- **`OVERLAY_CLASSNAME()`** - Line 9

  ```javascript
  const OVERLAY_CLASSNAME = `${MODAL_CLASSNAME}-overlay`;
  ```

- **`WRAPPER_CLASSNAME()`** - Line 10

  ```javascript
  const WRAPPER_CLASSNAME = `${MODAL_CLASSNAME}-wrapper`;
  ```

- **`OPENER_ATTRIBUTE()`** - Line 11

  ```javascript
  const OPENER_ATTRIBUTE = 'data-open-modal';
  ```

- **`CLOSER_ATTRIBUTE()`** - Line 12

  ```javascript
  const CLOSER_ATTRIBUTE = 'data-close-modal';
  ```

- **`FORCE_ACTION_ATTRIBUTE()`** - Line 13
  ```javascript
  const FORCE_ACTION_ATTRIBUTE = 'data-force-action';
  ```

_...and 22 more functions_

---

## USWDS Source References

- **Package**: [@uswds/uswds/packages/usa-modal](https://github.com/uswds/uswds/tree/develop/packages/usa-modal)
- **Main File**: [index.js](https://github.com/uswds/uswds/blob/develop/packages/usa-modal/src/index.js)
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
npm test -- usa-modal-behavior.test.ts
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
