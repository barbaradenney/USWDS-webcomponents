# JavaScript Integration Strategy

**Last Updated**: 2025-10-05
**Status**: ACTIVE - Hybrid Approach

## Overview

This project uses a **hybrid approach** for USWDS JavaScript integration with THREE patterns:

1. **USWDS-Mirrored Behavior** - Components with behavioral conflicts use replicated USWDS source code
2. **Direct USWDS Integration** - Stable components use standard `USWDS.[component].on()` integration
3. **CSS-Only Components** - Simple components with no JavaScript needs

This strategy balances **effort** (not refactoring everything) with **reliability** (fixing problematic components) and **maintainability** (automatic USWDS updates where possible).

---

## Strategy Decision Matrix

### When to Use USWDS-Mirrored Behavior

Create a separate `usa-[component]-behavior.ts` file when component exhibits:

- ✅ **Storybook Navigation Issues** - Works initially, breaks after story navigation
- ✅ **Module Caching Conflicts** - Alternating success/failure between property changes
- ✅ **Duplicate Event Listener Issues** - USWDS global script interferes with component behavior
- ✅ **Complex State Management** - Lit's reactive rendering conflicts with USWDS DOM manipulation

### When to Use Direct USWDS Integration

Use standard `USWDS.[component].on(this)` pattern when:

- ✅ **Component Works Reliably** - No reported issues or conflicts
- ✅ **Simple Integration** - `.on()` method works without problems
- ✅ **USWDS Handles Behavior** - Let USWDS manage the JavaScript enhancement
- ✅ **Auto-Updates Desired** - Want automatic USWDS behavior updates

### When to Use CSS-Only

No JavaScript integration when:

- ✅ **Pure Presentation** - Component is purely visual (button, alert, card, etc.)
- ✅ **No Behavior Needed** - No interactive functionality required
- ✅ **Native HTML** - Uses standard HTML elements (select, input, etc.)

---

## Component Classification

### Pattern 1: USWDS-Mirrored Behavior (15 Components)

| Component | Reason for Mirroring | Validation | Behavior File |
|-----------|---------------------|------------|---------------|
| **Accordion** | Storybook navigation issues, module caching conflicts | ✅ 22 behavioral tests<br>✅ Contract validation | `usa-accordion-behavior.ts` |
| **Banner** | Button toggle state management | ✅ Behavioral tests | `usa-banner-behavior.ts` |
| **Character Count** | Dynamic status updates, character tracking | ✅ Behavioral tests | `usa-character-count-behavior.ts` |
| **Combo Box** | Typeahead state conflicts, complex filtering logic | ✅ Behavioral tests<br>✅ List management | `usa-combo-box-behavior.ts` |
| **Date Picker** | Complex calendar UI, date selection logic | ✅ Behavioral tests | `usa-date-picker-behavior.ts` |
| **File Input** | Drag/drop handling, preview management | ✅ Behavioral tests | `usa-file-input-behavior.ts` |
| **Footer** | Collapsible footer sections | ✅ Behavioral tests | `usa-footer-behavior.ts` |
| **Header** | Mobile navigation, focus trap | ✅ Behavioral tests | `usa-header-behavior.ts` |
| **In-Page Navigation** | Scroll spy, active section tracking | ✅ Behavioral tests | `usa-in-page-navigation-behavior.ts` |
| **Language Selector** | Dropdown state management | ✅ Behavioral tests | `usa-language-selector-behavior.ts` |
| **Modal** | Complex wrapper management, DOM manipulation conflicts | ✅ Behavioral tests<br>✅ Focus trap integration | `usa-modal-behavior.ts` |
| **Search** | Button toggle, search expansion | ✅ Behavioral tests | `usa-search-behavior.ts` |
| **Table** | Sortable columns, sort state management | ✅ Behavioral tests | `usa-table-behavior.ts` |
| **Time Picker** | Time selection UI, validation | ✅ Behavioral tests | `usa-time-picker-behavior.ts` |
| **Tooltip** | Positioning logic, show/hide management | ✅ Behavioral tests | `usa-tooltip-behavior.ts` |

**Note**: All these components use replicated USWDS source code to maintain 100% behavior parity. This approach was chosen to handle complex state management and avoid conflicts with Lit's reactive rendering.

### Pattern 2: Direct USWDS Integration (20+ Components)

| Component | USWDS Module | Status | Integration Method |
|-----------|--------------|--------|-------------------|
| **Range Slider** | `range` | ✅ Stable | `USWDS.range.on(this)` |
| **Pagination** | `pagination` | ✅ Stable | `USWDS.pagination.on(this)` |
| **Skip Link** | `skipnav` | ✅ Stable | `USWDS.skipnav.on(this)` |
| **Date Range Picker** | `date-range-picker` | ✅ Stable | `USWDS.dateRangePicker.on(this)` |
| **Step Indicator** | `step-indicator` | ✅ Stable | `USWDS.stepIndicator.on(this)` |
| **Menu** | `menu` | ✅ Stable | `USWDS.menu.on(this)` |
| **Checkbox** | `checkbox` | ✅ Stable | `USWDS.checkbox.on(this)` |
| **Radio** | `radio` | ✅ Stable | `USWDS.radio.on(this)` |
| **Collection** | `collection` | ✅ Stable | `USWDS.collection.on(this)` |
| *...and 11+ more* | | | |

**Note**: These components use standard `USWDS.[component].on(this)` integration and receive automatic USWDS behavior updates.

### CSS-Only Components (No JavaScript)

| Component | Notes |
|-----------|-------|
| **Button** | Pure CSS, no behavior needed |
| **Alert** | Pure CSS, no behavior needed |
| **Card** | Pure CSS, no behavior needed |
| **Breadcrumb** | Pure CSS, no behavior needed |
| **Tag** | Pure CSS, no behavior needed |
| **Link** | Pure CSS, no behavior needed |
| **Prose** | Pure CSS, no behavior needed |
| **Section** | Pure CSS, no behavior needed |
| **Summary Box** | Pure CSS, no behavior needed |
| **Select** | Native HTML, no enhancement needed |

---

## Refactoring Process

When refactoring a component from USWDS modules to vanilla JS:

### 1. Create Behavioral Contract

Document exact USWDS behavior in `docs/USWDS_[COMPONENT]_BEHAVIOR_CONTRACT.md`:

```markdown
# USWDS [Component] Behavior Contract

**Source**: @uswds/uswds/packages/usa-[component]/src/index.js

## Core Behaviors (MANDATORY)

### 1. [Behavior Name]
**USWDS Source**: Lines X-Y in index.js
**Required Behavior**: ...
**Validation Test**: ...
```

### 2. Create Behavioral Tests

Create `src/components/[component]/usa-[component]-behavior.test.ts`:

```typescript
/**
 * USWDS [Component] Behavior Contract Tests
 *
 * DO NOT modify these tests to make implementation pass.
 * ONLY modify implementation to match USWDS behavior.
 */
describe('USWDS [Component] Behavior Contract', () => {
  // Comprehensive tests matching contract
});
```

### 3. Implement Vanilla JS

Extract USWDS source and adapt for web components:

```typescript
/**
 * USA [Component] Web Component - Pure Vanilla JS Implementation
 *
 * VALIDATION: All behavior validated against USWDS source in:
 * - usa-[component]-behavior.test.ts (automated tests)
 * - docs/USWDS_[COMPONENT]_BEHAVIOR_CONTRACT.md (behavioral contract)
 *
 * @uswds-source https://github.com/uswds/uswds/tree/develop/packages/usa-[component]/src/index.js
 */
```

**Key Patterns**:
- ✅ Use event delegation on container elements
- ✅ Use `event.stopPropagation()` to prevent USWDS global script interference
- ✅ Use arrow functions for event handlers to preserve `this` context
- ✅ Call setup on both `firstUpdated()` and `updated()`
- ✅ Reference USWDS source line numbers in comments

### 4. Validate Compliance

Run behavioral tests to ensure 100% USWDS compliance:

```bash
npm test -- usa-[component]-behavior.test.ts
```

All tests MUST pass before considering refactoring complete.

---

## USWDS Global Script

The USWDS global script is loaded in `.storybook/preview-head.html`:

```javascript
// Script Tag Pattern (MANDATORY for module-based components)
const script = document.createElement('script');
script.src = 'https://unpkg.com/@uswds/uswds@latest/dist/js/uswds.min.js';
document.head.appendChild(script);
```

**Why it's still needed**:
- ✅ Modal requires `window.USWDS.modal.init()` for wrapper creation
- ✅ 37 components still use USWDS module loading
- ✅ Provides `window.USWDS` global object

**Preventing Conflicts**:

Vanilla JS components prevent USWDS global script interference using:

1. **Event propagation control**:
```typescript
event.stopPropagation(); // Prevent USWDS handlers from seeing the event
event.preventDefault();  // Prevent default browser behavior
```

2. **Web component managed flag**:
```typescript
accordion.setAttribute('data-web-component-managed', 'true');
```

---

## Future Refactoring Candidates

Components to consider refactoring if issues arise:

### High Priority (If Issues Occur)
- **Modal** - Complex wrapper management, potential conflicts
- **Combo Box** - Complex typeahead logic, potential state issues
- **Date Picker** - Complex calendar UI, potential conflicts

### Medium Priority (If Issues Occur)
- **Tooltip** - Positioning logic, potential conflicts
- **Header** - Focus trap, resize handlers
- **Table** - Sortable columns, potential state issues

### Low Priority (Keep USWDS Unless Problems)
- All other module-based components

---

## Benefits of Hybrid Approach

### Effort Savings
- ✅ **Mirrored**: 15 components with complex behavior (accordion, modal, combo-box, etc.)
- ✅ **Direct Integration**: 20+ stable components using `USWDS.[component].on()`
- ✅ **CSS-Only**: 10+ components with no JavaScript
- ✅ **Automatic updates**: 20+ components get USWDS behavior updates automatically

### Risk Reduction
- ✅ Only mirror components with actual problems (proven conflicts)
- ✅ Direct Integration components get automatic USWDS updates
- ✅ Mirrored components insulated from USWDS breaking changes

### Maintainability
- ✅ Clear decision criteria for which pattern to use
- ✅ Behavioral contracts prevent drift in mirrored components
- ✅ Automated tests validate compliance
- ✅ Most components benefit from USWDS improvements automatically

---

## Decision Log

| Date | Component | Decision | Reason |
|------|-----------|----------|--------|
| 2025-10-05 | Accordion | Mirror USWDS Behavior | Storybook navigation issues, module caching conflicts |
| 2025-10-07 | Modal | Mirror USWDS Behavior | Complex wrapper management, DOM manipulation conflicts |
| 2025-10-07 | Combo Box | Mirror USWDS Behavior | Typeahead state conflicts, complex filtering logic |
| 2025-10-11 | Range Slider | Direct USWDS Integration | Simple value slider, no conflicts, works reliably |

---

## References

- **Accordion Behavioral Contract**: `docs/USWDS_ACCORDION_BEHAVIOR_CONTRACT.md`
- **Accordion Behavioral Tests**: `src/components/accordion/usa-accordion-behavior.test.ts`
- **USWDS Loader Utility**: `src/utils/uswds-loader.ts`
- **Storybook USWDS Integration**: `.storybook/preview-head.html`

---

## Questions?

**When should I refactor a component?**
Only when it has actual problems (navigation issues, conflicts, bugs). Don't refactor working components.

**How do I know if a component needs refactoring?**
Watch for: works initially but breaks on navigation, alternating success/failure, duplicate event issues.

**What if USWDS releases an update?**
Module-based components get updates automatically. Vanilla JS components need manual review against new USWDS source.

**Can I mix patterns in one component?**
No - each component should use ONE pattern (vanilla JS OR USWDS modules, not both).
