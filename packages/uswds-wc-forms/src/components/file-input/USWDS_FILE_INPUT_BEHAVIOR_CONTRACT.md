# USWDS File Input Behavior Contract

**Purpose**: This document defines the exact behavioral contract that our file-input component MUST match with USWDS.

**Source**: `@uswds/uswds/packages/usa-file-input/src/index.js` (USWDS 3.x)

**Status**: MANDATORY - All implementations must pass automated validation against this contract.

**Complexity**: MEDIUM

**Last Updated**: 2025-10-09

---

## Overview

The File Input component mirrors USWDS JavaScript behavior exactly to maintain 100% behavioral parity.

**Implementation Files**:

- `src/components/file-input/usa-file-input-behavior.ts` - USWDS behavior mirror
- `src/components/file-input/usa-file-input.ts` - Web component wrapper

**Validation**:

- `src/components/file-input/usa-file-input-behavior.test.ts` - Behavioral tests

---

## Core Behaviors (MANDATORY)

### 1. Drag and drop handling

**USWDS Source**: Lines [TBD] in `index.js`

**Required Behavior**:

- ✅ [Describe expected behavior based on USWDS source]
- ✅ [Additional behavior requirement]
- ✅ [Additional behavior requirement]

**Validation Test**:

```typescript
it('should drag and drop handling', async () => {
  // TODO: Implement test based on USWDS behavior
  const element = document.createElement('usa-file-input');
  document.body.appendChild(element);
  await element.updateComplete;

  // Test implementation here
  expect(true).toBe(true);
});
```

---

### 2. File preview generation

**USWDS Source**: Lines [TBD] in `index.js`

**Required Behavior**:

- ✅ [Describe expected behavior based on USWDS source]
- ✅ [Additional behavior requirement]
- ✅ [Additional behavior requirement]

**Validation Test**:

```typescript
it('should file preview generation', async () => {
  // TODO: Implement test based on USWDS behavior
  const element = document.createElement('usa-file-input');
  document.body.appendChild(element);
  await element.updateComplete;

  // Test implementation here
  expect(true).toBe(true);
});
```

---

### 3. Multiple file support

**USWDS Source**: Lines [TBD] in `index.js`

**Required Behavior**:

- ✅ [Describe expected behavior based on USWDS source]
- ✅ [Additional behavior requirement]
- ✅ [Additional behavior requirement]

**Validation Test**:

```typescript
it('should multiple file support', async () => {
  // TODO: Implement test based on USWDS behavior
  const element = document.createElement('usa-file-input');
  document.body.appendChild(element);
  await element.updateComplete;

  // Test implementation here
  expect(true).toBe(true);
});
```

---

### 4. File validation

**USWDS Source**: Lines [TBD] in `index.js`

**Required Behavior**:

- ✅ [Describe expected behavior based on USWDS source]
- ✅ [Additional behavior requirement]
- ✅ [Additional behavior requirement]

**Validation Test**:

```typescript
it('should file validation', async () => {
  // TODO: Implement test based on USWDS behavior
  const element = document.createElement('usa-file-input');
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

- **`behavior()`** - Line 2

  ```javascript
  const behavior = require('../../uswds-core/src/js/utils/behavior');
  ```

- **`Sanitizer()`** - Line 3

  ```javascript
  const Sanitizer = require('../../uswds-core/src/js/utils/sanitizer');
  ```

- **`DROPZONE_CLASS()`** - Line 6

  ```javascript
  const DROPZONE_CLASS = `${PREFIX}-file-input`;
  ```

- **`DROPZONE()`** - Line 7

  ```javascript
  const DROPZONE = `.${DROPZONE_CLASS}`;
  ```

- **`INPUT_CLASS()`** - Line 8

  ```javascript
  const INPUT_CLASS = `${PREFIX}-file-input__input`;
  ```

- **`TARGET_CLASS()`** - Line 9

  ```javascript
  const TARGET_CLASS = `${PREFIX}-file-input__target`;
  ```

- **`INPUT()`** - Line 10

  ```javascript
  const INPUT = `.${INPUT_CLASS}`;
  ```

- **`BOX_CLASS()`** - Line 11

  ```javascript
  const BOX_CLASS = `${PREFIX}-file-input__box`;
  ```

- **`INSTRUCTIONS_CLASS()`** - Line 12
  ```javascript
  const INSTRUCTIONS_CLASS = `${PREFIX}-file-input__instructions`;
  ```

_...and 38 more functions_

---

## USWDS Source References

- **Package**: [@uswds/uswds/packages/usa-file-input](https://github.com/uswds/uswds/tree/develop/packages/usa-file-input)
- **Main File**: [index.js](https://github.com/uswds/uswds/blob/develop/packages/usa-file-input/src/index.js)
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
npm test -- usa-file-input-behavior.test.ts
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
