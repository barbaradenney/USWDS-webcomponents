# USWDS Tooltip Behavior Contract

**Purpose**: This document defines the exact behavioral contract that our tooltip component MUST match with USWDS.

**Source**: `@uswds/uswds/packages/usa-tooltip/src/index.js` (USWDS 3.x)

**Status**: MANDATORY - All implementations must pass automated validation against this contract.

**Complexity**: HIGH

**Last Updated**: 2025-10-09

---

## Overview

The Tooltip component mirrors USWDS JavaScript behavior exactly to maintain 100% behavioral parity.

**Implementation Files**:
- `src/components/tooltip/usa-tooltip-behavior.ts` - USWDS behavior mirror
- `src/components/tooltip/usa-tooltip.ts` - Web component wrapper

**Validation**:
- `src/components/tooltip/usa-tooltip-behavior.test.ts` - Behavioral tests

---

## Core Behaviors (MANDATORY)

### 1. Tooltip positioning

**USWDS Source**: Lines [TBD] in `index.js`

**Required Behavior**:
- ✅ [Describe expected behavior based on USWDS source]
- ✅ [Additional behavior requirement]
- ✅ [Additional behavior requirement]

**Validation Test**:
```typescript
it('should tooltip positioning', async () => {
  // TODO: Implement test based on USWDS behavior
  const element = document.createElement('usa-tooltip');
  document.body.appendChild(element);
  await element.updateComplete;

  // Test implementation here
  expect(true).toBe(true);
});
```

---

### 2. Hover/focus events

**USWDS Source**: Lines [TBD] in `index.js`

**Required Behavior**:
- ✅ [Describe expected behavior based on USWDS source]
- ✅ [Additional behavior requirement]
- ✅ [Additional behavior requirement]

**Validation Test**:
```typescript
it('should hover/focus events', async () => {
  // TODO: Implement test based on USWDS behavior
  const element = document.createElement('usa-tooltip');
  document.body.appendChild(element);
  await element.updateComplete;

  // Test implementation here
  expect(true).toBe(true);
});
```

---

### 3. Wrapper element creation

**USWDS Source**: Lines [TBD] in `index.js`

**Required Behavior**:
- ✅ [Describe expected behavior based on USWDS source]
- ✅ [Additional behavior requirement]
- ✅ [Additional behavior requirement]

**Validation Test**:
```typescript
it('should wrapper element creation', async () => {
  // TODO: Implement test based on USWDS behavior
  const element = document.createElement('usa-tooltip');
  document.body.appendChild(element);
  await element.updateComplete;

  // Test implementation here
  expect(true).toBe(true);
});
```

---

### 4. Position adjustment

**USWDS Source**: Lines [TBD] in `index.js`

**Required Behavior**:
- ✅ [Describe expected behavior based on USWDS source]
- ✅ [Additional behavior requirement]
- ✅ [Additional behavior requirement]

**Validation Test**:
```typescript
it('should position adjustment', async () => {
  // TODO: Implement test based on USWDS behavior
  const element = document.createElement('usa-tooltip');
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

- **`keymap()`** - Line 2
  ```javascript
  const keymap = require("receptor/keymap");
  ```

- **`selectOrMatches()`** - Line 3
  ```javascript
  const selectOrMatches = require("../../uswds-core/src/js/utils/select-or-matches");
  ```

- **`behavior()`** - Line 4
  ```javascript
  const behavior = require("../../uswds-core/src/js/utils/behavior");
  ```

- **`isElementInViewport()`** - Line 6
  ```javascript
  const isElementInViewport = require("../../uswds-core/src/js/utils/is-in-viewport");
  ```

- **`BODY()`** - Line 8
  ```javascript
  const BODY = "body";
  ```

- **`TOOLTIP()`** - Line 9
  ```javascript
  const TOOLTIP = `.${PREFIX}-tooltip`;
  ```

- **`TOOLTIP_TRIGGER()`** - Line 10
  ```javascript
  const TOOLTIP_TRIGGER = `.${PREFIX}-tooltip__trigger`;
  ```

- **`TOOLTIP_TRIGGER_CLASS()`** - Line 11
  ```javascript
  const TOOLTIP_TRIGGER_CLASS = `${PREFIX}-tooltip__trigger`;
  ```

- **`TOOLTIP_CLASS()`** - Line 12
  ```javascript
  const TOOLTIP_CLASS = `${PREFIX}-tooltip`;
  ```

- **`TOOLTIP_BODY_CLASS()`** - Line 13
  ```javascript
  const TOOLTIP_BODY_CLASS = `${PREFIX}-tooltip__body`;
  ```


*...and 10 more functions*


---

## USWDS Source References

- **Package**: [@uswds/uswds/packages/usa-tooltip](https://github.com/uswds/uswds/tree/develop/packages/usa-tooltip)
- **Main File**: [index.js](https://github.com/uswds/uswds/blob/develop/packages/usa-tooltip/src/index.js)
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
npm test -- usa-tooltip-behavior.test.ts
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
