# USWDS Banner Behavior Contract

**Purpose**: This document defines the exact behavioral contract that our banner component MUST match with USWDS.

**Source**: `@uswds/uswds/packages/usa-banner/src/index.js` (USWDS 3.x)

**Status**: MANDATORY - All implementations must pass automated validation against this contract.

**Complexity**: LOW

**Last Updated**: 2025-10-09

---

## Overview

The Banner component mirrors USWDS JavaScript behavior exactly to maintain 100% behavioral parity.

**Implementation Files**:
- `src/components/banner/usa-banner-behavior.ts` - USWDS behavior mirror
- `src/components/banner/usa-banner.ts` - Web component wrapper

**Validation**:
- `src/components/banner/usa-banner-behavior.test.ts` - Behavioral tests

---

## Core Behaviors (MANDATORY)

### 1. Button toggle

**USWDS Source**: Lines [TBD] in `index.js`

**Required Behavior**:
- ✅ [Describe expected behavior based on USWDS source]
- ✅ [Additional behavior requirement]
- ✅ [Additional behavior requirement]

**Validation Test**:
```typescript
it('should button toggle', async () => {
  // TODO: Implement test based on USWDS behavior
  const element = document.createElement('usa-banner');
  document.body.appendChild(element);
  await element.updateComplete;

  // Test implementation here
  expect(true).toBe(true);
});
```

---

### 2. Content expand/collapse

**USWDS Source**: Lines [TBD] in `index.js`

**Required Behavior**:
- ✅ [Describe expected behavior based on USWDS source]
- ✅ [Additional behavior requirement]
- ✅ [Additional behavior requirement]

**Validation Test**:
```typescript
it('should content expand/collapse', async () => {
  // TODO: Implement test based on USWDS behavior
  const element = document.createElement('usa-banner');
  document.body.appendChild(element);
  await element.updateComplete;

  // Test implementation here
  expect(true).toBe(true);
});
```

---

### 3. ARIA expanded state

**USWDS Source**: Lines [TBD] in `index.js`

**Required Behavior**:
- ✅ [Describe expected behavior based on USWDS source]
- ✅ [Additional behavior requirement]
- ✅ [Additional behavior requirement]

**Validation Test**:
```typescript
it('should aria expanded state', async () => {
  // TODO: Implement test based on USWDS behavior
  const element = document.createElement('usa-banner');
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
  const behavior = require("../../uswds-core/src/js/utils/behavior");
  ```

- **`select()`** - Line 2
  ```javascript
  const select = require("../../uswds-core/src/js/utils/select");
  ```

- **`toggle()`** - Line 5
  ```javascript
  const toggle = require("../../uswds-core/src/js/utils/toggle");
  ```

- **`HEADER()`** - Line 7
  ```javascript
  const HEADER = `.${PREFIX}-banner__header`;
  ```

- **`EXPANDED_CLASS()`** - Line 8
  ```javascript
  const EXPANDED_CLASS = `${PREFIX}-banner__header--expanded`;
  ```

- **`BANNER_BUTTON()`** - Line 9
  ```javascript
  const BANNER_BUTTON = `${HEADER} [aria-controls]`;
  ```

- **`toggleBanner()`** - Line 15
  ```javascript
  const toggleBanner = function toggleEl(event) {
  ```



---

## USWDS Source References

- **Package**: [@uswds/uswds/packages/usa-banner](https://github.com/uswds/uswds/tree/develop/packages/usa-banner)
- **Main File**: [index.js](https://github.com/uswds/uswds/blob/develop/packages/usa-banner/src/index.js)
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
npm test -- usa-banner-behavior.test.ts
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
