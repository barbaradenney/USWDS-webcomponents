# USWDS Accordion Behavior Contract

**Purpose**: This document defines the exact behavioral contract that our accordion component MUST match with USWDS.

**Source**: `@uswds/uswds/packages/usa-accordion/src/index.js` (USWDS 3.x)

**Status**: MANDATORY - All implementations must pass automated validation against this contract.

---

## Core Behaviors (MANDATORY)

### 1. Button Click Toggle

**USWDS Source**: Lines 72-81 in `index.js`

```javascript
[CLICK]: {
  [BUTTON]() {
    toggleButton(this);

    if (this.getAttribute(EXPANDED) === "true") {
      if (!isElementInViewport(this)) this.scrollIntoView();
    }
  },
}
```

**Required Behavior**:
- ✅ Clicking button toggles its `aria-expanded` state
- ✅ Clicking button toggles `hidden` attribute on controlled content
- ✅ If expanded and not in viewport, scroll button into view

**Validation Test**:
```typescript
it('should toggle aria-expanded on button click', async () => {
  const button = element.querySelector('.usa-accordion__button');
  expect(button.getAttribute('aria-expanded')).toBe('false');

  button.click();
  await element.updateComplete;

  expect(button.getAttribute('aria-expanded')).toBe('true');
});
```

### 2. Toggle Function

**USWDS Source**: Lines 5-27 in `toggle.js`

```javascript
module.exports = (button, expanded) => {
  let safeExpanded = expanded;

  if (typeof safeExpanded !== "boolean") {
    safeExpanded = button.getAttribute(EXPANDED) === "false";
  }

  button.setAttribute(EXPANDED, safeExpanded);

  const id = button.getAttribute(CONTROLS);
  const controls = document.getElementById(id);
  if (!controls) {
    throw new Error(`No toggle target found with id: "${id}"`);
  }

  if (safeExpanded) {
    controls.removeAttribute(HIDDEN);
  } else {
    controls.setAttribute(HIDDEN, "");
  }

  return safeExpanded;
};
```

**Required Behavior**:
- ✅ If `expanded` is undefined, toggle current state (false → true, true → false)
- ✅ Set `aria-expanded` attribute on button to boolean string ("true"/"false")
- ✅ Find controlled element via `aria-controls` → `getElementById()`
- ✅ Throw error if controlled element not found
- ✅ Remove `hidden` attribute when expanding
- ✅ Set `hidden=""` attribute when collapsing
- ✅ Return resulting boolean state

**Validation Test**:
```typescript
it('should control content visibility via hidden attribute', async () => {
  const button = element.querySelector('.usa-accordion__button');
  const contentId = button.getAttribute('aria-controls');
  const content = element.querySelector(`#${contentId}`);

  expect(content.hasAttribute('hidden')).toBe(true);

  button.click();
  await element.updateComplete;

  expect(content.hasAttribute('hidden')).toBe(false);
});
```

### 3. Single-Select Mode (data-allow-multiple NOT present)

**USWDS Source**: Lines 46-54 in `index.js`

```javascript
const multiselectable = accordion.hasAttribute(MULTISELECTABLE);

if (safeExpanded && !multiselectable) {
  getAccordionButtons(accordion).forEach((other) => {
    if (other !== button) {
      toggle(other, false);
    }
  });
}
```

**Required Behavior**:
- ✅ Check `data-allow-multiple` attribute on accordion container
- ✅ If NOT multiselectable AND expanding a button:
  - Close ALL other buttons in the same accordion
  - Only the clicked button remains expanded
- ✅ If collapsing, do NOT close other buttons

**Validation Test**:
```typescript
it('should close other items when opening in single-select mode', async () => {
  element.multiselectable = false;
  await element.updateComplete;

  const buttons = element.querySelectorAll('.usa-accordion__button');

  // Open first item
  buttons[0].click();
  await element.updateComplete;
  expect(buttons[0].getAttribute('aria-expanded')).toBe('true');

  // Open second item - should close first
  buttons[1].click();
  await element.updateComplete;
  expect(buttons[0].getAttribute('aria-expanded')).toBe('false');
  expect(buttons[1].getAttribute('aria-expanded')).toBe('true');
});
```

### 4. Multi-Select Mode (data-allow-multiple present)

**USWDS Source**: Lines 46-54 in `index.js` (inverse logic)

**Required Behavior**:
- ✅ Check `data-allow-multiple` attribute on accordion container
- ✅ If multiselectable:
  - Multiple buttons can be expanded simultaneously
  - Opening one does NOT close others
  - Each button toggles independently

**Validation Test**:
```typescript
it('should allow multiple items open in multi-select mode', async () => {
  element.multiselectable = true;
  await element.updateComplete;

  const buttons = element.querySelectorAll('.usa-accordion__button');

  // Open first item
  buttons[0].click();
  await element.updateComplete;
  expect(buttons[0].getAttribute('aria-expanded')).toBe('true');

  // Open second item - first should stay open
  buttons[1].click();
  await element.updateComplete;
  expect(buttons[0].getAttribute('aria-expanded')).toBe('true');
  expect(buttons[1].getAttribute('aria-expanded')).toBe('true');
});
```

### 5. Initialization

**USWDS Source**: Lines 85-90 in `index.js`

```javascript
init(root) {
  select(BUTTON, root).forEach((button) => {
    const expanded = button.getAttribute(EXPANDED) === "true";
    toggleButton(button, expanded);
  });
}
```

**Required Behavior**:
- ✅ Read initial `aria-expanded` attribute from HTML
- ✅ Set initial `hidden` state on content based on button's `aria-expanded`
- ✅ Ensure content visibility matches button state

**Validation Test**:
```typescript
it('should initialize content visibility from aria-expanded', async () => {
  const item = { id: 'test', title: 'Test', content: '<p>Test</p>', expanded: true };
  element.items = [item];
  await element.updateComplete;

  const button = element.querySelector('.usa-accordion__button');
  const content = element.querySelector(`#${item.id}-content`);

  expect(button.getAttribute('aria-expanded')).toBe('true');
  expect(content.hasAttribute('hidden')).toBe(false);
});
```

### 6. Button Scope

**USWDS Source**: Lines 20-24 in `index.js`

```javascript
const getAccordionButtons = (accordion) => {
  const buttons = select(BUTTON, accordion);

  return buttons.filter((button) => button.closest(ACCORDION) === accordion);
};
```

**Required Behavior**:
- ✅ Only buttons directly belonging to the accordion are affected
- ✅ Nested accordions are NOT affected by parent accordion
- ✅ Use `.closest(ACCORDION)` to verify button ownership

**Validation Test**:
```typescript
it('should only control buttons in own accordion (not nested)', async () => {
  // This test ensures nested accordions work independently
  // Implementation detail: verify button.closest('.usa-accordion') === this accordion
});
```

---

## HTML Structure Requirements (MANDATORY)

### Button Structure
```html
<button
  type="button"
  class="usa-accordion__button"
  aria-expanded="false"
  aria-controls="item-id-content"
>
  Title
</button>
```

**Required Attributes**:
- ✅ `class="usa-accordion__button"`
- ✅ `aria-expanded="true"` or `"false"` (string boolean)
- ✅ `aria-controls` matching content `id`

### Content Structure
```html
<div
  id="item-id-content"
  class="usa-accordion__content usa-prose"
  hidden
>
  Content
</div>
```

**Required Attributes**:
- ✅ `id` matching button's `aria-controls`
- ✅ `class="usa-accordion__content usa-prose"`
- ✅ `hidden` attribute (no value) when collapsed

### Container Structure
```html
<div class="usa-accordion" data-allow-multiple>
  <!-- Items -->
</div>
```

**Required Attributes**:
- ✅ `class="usa-accordion"` (or `usa-accordion--bordered`)
- ✅ `data-allow-multiple` attribute (no value) for multi-select mode
- ✅ NO attribute for single-select mode

---

## Prohibited Behaviors (MUST NOT IMPLEMENT)

❌ **DO NOT** use `display: none` for hiding content (use `hidden` attribute)
❌ **DO NOT** use custom events instead of USWDS patterns
❌ **DO NOT** change aria-expanded to use boolean instead of string
❌ **DO NOT** add transitions/animations (USWDS CSS handles this)
❌ **DO NOT** modify button/content class names
❌ **DO NOT** use Shadow DOM (breaks getElementById lookup)

---

## Validation Enforcement

### Automated Tests

All behaviors must have corresponding tests in:
- `src/components/accordion/usa-accordion.test.ts` (unit tests)
- `src/components/accordion/usa-accordion.component.cy.ts` (integration tests)

### Pre-commit Hook

The pre-commit hook MUST verify:
1. All behavioral tests pass
2. HTML structure matches USWDS
3. Attribute names/values match USWDS exactly
4. No prohibited patterns are used

### Visual Regression

Cypress visual regression tests MUST verify:
- Accordion renders identically to USWDS reference
- Expanded/collapsed states match USWDS CSS
- Animations match USWDS timing

---

## Update Protocol

When USWDS releases a new version:

1. **Review USWDS changelog** for accordion changes
2. **Update this contract** if behaviors changed
3. **Update tests** to match new contract
4. **Update implementation** to pass tests
5. **Run full validation suite** before merge

---

## References

- **USWDS Source**: `node_modules/@uswds/uswds/packages/usa-accordion/src/index.js`
- **USWDS Toggle Utility**: `node_modules/@uswds/uswds/packages/uswds-core/src/js/utils/toggle.js`
- **USWDS Documentation**: https://designsystem.digital.gov/components/accordion/
- **USWDS GitHub**: https://github.com/uswds/uswds/tree/develop/packages/usa-accordion

---

**Last Updated**: 2025-10-05
**USWDS Version**: 3.x
**Contract Status**: ACTIVE - All implementations must comply
