# USWDS Footer Behavior Contract

**Purpose**: This document defines the exact behavioral contract that our footer component MUST match with USWDS.

**Source**: `@uswds/uswds/packages/usa-footer/src/index.js` (USWDS 3.x)

**Status**: MANDATORY - All implementations must pass automated validation against this contract.

**Complexity**: MEDIUM

**Last Updated**: 2025-10-09

---

## Overview

The Footer component mirrors USWDS JavaScript behavior exactly to maintain 100% behavioral parity.

**Implementation Files**:

- `src/components/footer/usa-footer-behavior.ts` - USWDS behavior mirror
- `src/components/footer/usa-footer.ts` - Web component wrapper

**Validation**:

- `src/components/footer/usa-footer-behavior.test.ts` - Behavioral tests

---

## Core Behaviors (MANDATORY)

### 1. Navigation collapse toggle

**USWDS Source**: Lines [TBD] in `index.js`

**Required Behavior**:

- ✅ [Describe expected behavior based on USWDS source]
- ✅ [Additional behavior requirement]
- ✅ [Additional behavior requirement]

**Validation Test**:

```typescript
it('should navigation collapse toggle', async () => {
  // TODO: Implement test based on USWDS behavior
  const element = document.createElement('usa-footer');
  document.body.appendChild(element);
  await element.updateComplete;

  // Test implementation here
  expect(true).toBe(true);
});
```

---

### 2. Accordion behavior

**USWDS Source**: Lines [TBD] in `index.js`

**Required Behavior**:

- ✅ [Describe expected behavior based on USWDS source]
- ✅ [Additional behavior requirement]
- ✅ [Additional behavior requirement]

**Validation Test**:

```typescript
it('should accordion behavior', async () => {
  // TODO: Implement test based on USWDS behavior
  const element = document.createElement('usa-footer');
  document.body.appendChild(element);
  await element.updateComplete;

  // Test implementation here
  expect(true).toBe(true);
});
```

---

### 3. Button expanded state

**USWDS Source**: Lines [TBD] in `index.js`

**Required Behavior**:

- ✅ [Describe expected behavior based on USWDS source]
- ✅ [Additional behavior requirement]
- ✅ [Additional behavior requirement]

**Validation Test**:

```typescript
it('should button expanded state', async () => {
  // TODO: Implement test based on USWDS behavior
  const element = document.createElement('usa-footer');
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

- **`SCOPE()`** - Line 5

  ```javascript
  const SCOPE = `.${PREFIX}-footer--big`;
  ```

- **`NAV()`** - Line 6

  ```javascript
  const NAV = `${SCOPE} nav`;
  ```

- **`BUTTON()`** - Line 7

  ```javascript
  const BUTTON = `${NAV} .${PREFIX}-footer__primary-link`;
  ```

- **`HIDE_MAX_WIDTH()`** - Line 8

  ```javascript
  const HIDE_MAX_WIDTH = 480;
  ```

- **`showPanel()`** - Line 13

  ```javascript
  function showPanel() {
  ```

- **`toggleHtmlTag()`** - Line 33

  ```javascript
  function toggleHtmlTag(isMobile) {
  ```

- **`resize()`** - Line 76
  ```javascript
  const resize = (event) => {
  ```

---

## USWDS Source References

- **Package**: [@uswds/uswds/packages/usa-footer](https://github.com/uswds/uswds/tree/develop/packages/usa-footer)
- **Main File**: [index.js](https://github.com/uswds/uswds/blob/develop/packages/usa-footer/src/index.js)
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
npm test -- usa-footer-behavior.test.ts
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
