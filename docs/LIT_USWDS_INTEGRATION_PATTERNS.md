# Lit + USWDS Integration Patterns

**Critical patterns and pitfalls when integrating USWDS with Lit web components**

This document captures lessons learned from debugging combo box, date picker, and other USWDS components.

---

## 🚨 Critical Pattern #1: `hidden` Attribute in Lit Components

### The Problem

In Lit components using light DOM, setting the JavaScript property `element.hidden = false` does **not** automatically remove the HTML `hidden` attribute.

**Why this matters**: USWDS CSS uses the `[hidden]` attribute selector, so the element remains hidden even when the property is set to `false`.

### The Bug

```typescript
// ❌ WRONG - Property change doesn't remove attribute
listEl.hidden = false;  // Element stays hidden in Lit!
```

### The Fix

```typescript
// ✅ CORRECT - Explicitly manipulate the attribute
listEl.hidden = false;
listEl.removeAttribute('hidden');  // CRITICAL for Lit components

// When hiding:
listEl.hidden = true;
listEl.setAttribute('hidden', '');  // CRITICAL for Lit components
```

### Where This Applies

Any component using USWDS behavior files that show/hide elements:
- **Combo Box** - Dropdown list visibility
- **Date Picker** - Calendar visibility
- **Time Picker** - Time selection dropdown
- **Modal** - Modal overlay
- Any other component with conditional visibility

### Related Files

- `src/components/combo-box/usa-combo-box-behavior.ts` (lines 524-525, 576-577)
- `src/components/date-picker/usa-date-picker-behavior.ts` (lines 1240-1241, 1440-1441)

---

## 🚨 Critical Pattern #2: Truthy String Check Bug

### The Problem

In JavaScript, **all non-empty strings are truthy**, including the string `"false"`.

```javascript
if ("false") {  // TRUE - This executes!
  console.log("String 'false' is truthy!");
}
```

### The Bug

```typescript
// ❌ WRONG - String "false" is truthy
if (element.dataset.enhanced) {
  return;  // Skips enhancement even when enhanced="false"!
}
```

### The Fix

```typescript
// ✅ CORRECT - Use strict equality
if (element.dataset.enhanced === 'true') {
  return;  // Only skips when truly enhanced
}
```

### Where This Applies

- Any `data-*` attribute check
- Boolean-like string attributes: `data-enhanced`, `data-initialized`, `data-active`, etc.
- Form validation: `data-valid`, `data-required`, etc.

### Related Files

- `src/components/combo-box/usa-combo-box-behavior.ts` (line 209)
- `src/components/modal/usa-modal.test.ts` (line 1144)

---

## 🚨 Critical Pattern #3: Duplicate Event Listeners

### The Problem

USWDS behavior files may be called multiple times (component updates, re-renders, Storybook navigation), causing duplicate event listeners to be attached.

### The Bug

```typescript
// ❌ WRONG - Attaches new listeners every time
export function initializeComponent(root: HTMLElement) {
  root.addEventListener('click', handleClick);
  // Called again = duplicate listener!
}
```

### The Fix

```typescript
// ✅ CORRECT - Guard against duplicate initialization
export function initializeComponent(root: HTMLElement) {
  const rootEl = root === document ? document.body : root;

  // Check if already initialized
  if ((rootEl as any).__componentInitialized) {
    return () => {}; // Return empty cleanup
  }
  (rootEl as any).__componentInitialized = true;

  // Safe to add listeners now
  rootEl.addEventListener('click', handleClick);

  return () => {
    rootEl.removeEventListener('click', handleClick);
    delete (rootEl as any).__componentInitialized;
  };
}
```

### Where This Applies

- All USWDS behavior files (`*-behavior.ts`)
- Any component with event delegation
- Components used in Storybook (frequent re-initialization)

### Related Files

- `src/components/combo-box/usa-combo-box-behavior.ts` (lines 869-873)

---

## 🚨 Critical Pattern #4: Data Attribute Type Safety

### The Problem

HTML attributes are **always strings**. Never assume they're booleans or numbers.

### The Bug

```typescript
// ❌ WRONG - Assumes boolean
element.dataset.enabled = true;  // Stores "true" as string
if (element.dataset.enabled) {  // Always true (non-empty string)!
  // ...
}

// ❌ WRONG - Type confusion
element.dataset.count = 5;  // Stores "5" as string
const count = element.dataset.count + 1;  // "51" (string concatenation)!
```

### The Fix

```typescript
// ✅ CORRECT - Always treat as strings
element.dataset.enabled = 'true';
if (element.dataset.enabled === 'true') {
  // ...
}

// ✅ CORRECT - Parse when needed
element.dataset.count = '5';
const count = parseInt(element.dataset.count || '0', 10) + 1;
```

### Where This Applies

- All `data-*` attributes
- Component state tracking
- USWDS integration flags

---

## ✅ Testing Patterns for Regression Prevention

### Required Tests for USWDS Behavior Components

Every component using a USWDS behavior file should include these regression tests:

```typescript
describe('Regression Prevention: USWDS Behavior Patterns', () => {
  it('should render correct DOM structure for USWDS behavior enhancement', async () => {
    // Validates component structure matches USWDS requirements
    const container = element.querySelector('.usa-component');
    expect(container).toBeTruthy();
    expect(container?.hasAttribute('data-enhanced')).toBe(true);
  });

  it('should maintain data-enhanced as string type', async () => {
    // Prevents truthy string bug
    const wrapper = element.querySelector('.usa-component');
    expect(typeof wrapper?.getAttribute('data-enhanced')).toBe('string');
    expect(wrapper?.hasAttribute('data-enhanced')).toBe(true);
  });

  it('should properly manage hidden attribute on dynamic elements', async () => {
    // For components with show/hide behavior
    const hiddenElement = element.querySelector('.usa-component__dropdown');
    // Test would verify explicit attribute manipulation
  });
});
```

### Examples

- `src/components/combo-box/usa-combo-box.test.ts` (lines 249-353)
- `src/components/date-picker/usa-date-picker.test.ts` (lines 1404-1464)
- `src/components/time-picker/usa-time-picker.test.ts` (lines 1187-1247)

---

## 📋 Checklist for New USWDS Behavior Files

When creating a new `usa-[component]-behavior.ts` file:

- [ ] **Hidden elements**: Use `removeAttribute('hidden')` and `setAttribute('hidden', '')`, not just property assignment
- [ ] **Data attributes**: Always use strict equality (`=== 'true'`), never truthy checks
- [ ] **Initialization guard**: Add `__componentInitialized` flag to prevent duplicate event listeners
- [ ] **Cleanup function**: Return cleanup that removes listeners and resets flags
- [ ] **String types**: Treat all data attributes as strings, parse when needed
- [ ] **Regression tests**: Add test suite covering these patterns
- [ ] **Documentation**: Add JSDoc comments explaining Lit-specific workarounds

---

## 🔍 Debugging Tips

### When Elements Won't Show

1. Check if `hidden` **attribute** exists (not just property):
   ```javascript
   console.log('Property:', element.hidden);  // May be false
   console.log('Attribute:', element.hasAttribute('hidden'));  // Still true!
   ```

2. Look for CSS using `[hidden]` selector:
   ```css
   /* USWDS often uses this pattern */
   .element[hidden] {
     display: none !important;  /* Overrides property change */
   }
   ```

### When Enhancement Doesn't Run

1. Check `data-enhanced` value:
   ```javascript
   const enhanced = element.dataset.enhanced;
   console.log('Value:', enhanced);  // "false"
   console.log('Truthy?', !!enhanced);  // true - BUG!
   console.log('Strict check:', enhanced === 'true');  // false - CORRECT
   ```

### When Events Fire Multiple Times

1. Check for duplicate listeners:
   ```javascript
   // Add counter to handler
   let clickCount = 0;
   const handleClick = () => {
     console.log('Click #', ++clickCount);
   };
   ```

2. Verify initialization guard:
   ```javascript
   console.log('Initialized?', (element as any).__componentInitialized);
   ```

---

## 📚 Related Documentation

- **USWDS Integration Strategy**: `docs/JAVASCRIPT_INTEGRATION_STRATEGY.md`
- **USWDS Debugging Protocol**: `docs/USWDS_JAVASCRIPT_DEBUGGING_PROTOCOL.md`
- **Initial Value Pattern**: `docs/USWDS_INITIAL_VALUE_PATTERN.md`
- **Script Tag Pattern**: `docs/ARCHITECTURE_DECISION_SCRIPT_TAG_VS_COMPONENT_INIT.md`

---

## 🐛 Bug History

### 2025-10-08: Combo Box Triple Bug Fix

**Components Affected**: Combo box, Date picker, Modal

**Bugs Fixed**:
1. `data-enhanced="false"` treated as truthy (prevented enhancement)
2. `hidden` property not removing HTML attribute (dropdown stayed hidden)
3. Duplicate event listeners (toggle button fired twice)

**Files Changed**:
- `src/components/combo-box/usa-combo-box-behavior.ts`
- `src/components/date-picker/usa-date-picker-behavior.ts`
- `src/components/modal/usa-modal.test.ts`

**Tests Added**: 14 regression tests across 4 components

**Reference**: This document created to prevent recurrence

---

**Last Updated**: 2025-10-08
**Author**: AI debugging session with user
**Status**: ✅ Active - Use this as reference for all USWDS behavior implementations
