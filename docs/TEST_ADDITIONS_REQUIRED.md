# Required Test Additions for Layout/Visual Validation

**Created**: 2025-10-18
**Purpose**: Specific tests that need to be added to each component to prevent layout/visual issues

---

## Executive Summary

Current tests validate **functionality** (events work, elements exist) but miss **structure and layout** (DOM hierarchy, CSS properties, visual rendering). The header search cutoff bug demonstrates this gap.

**We need to add 4 types of tests to components with complex layouts or composition:**

1. **DOM Structure Validation** - Exact parent-child relationships
2. **CSS Display Property Tests** - Computed styles match USWDS
3. **Component Composition Tests** - Using web components vs inline HTML
4. **Visual Rendering Tests** - Elements visible, proper dimensions

---

## Priority: Header Component

### Tests to Add to `src/components/header/usa-header.test.ts`

Add a new `describe` block for layout validation:

```typescript
describe('Layout and Structure Validation (Prevent Cutoff Issues)', () => {
  describe('Search Component Structure', () => {
    it('should have search directly in usa-nav__secondary (not in list item)', async () => {
      element.showSearch = true;
      await waitForUpdate(element);

      const search = element.querySelector('usa-search');
      expect(search).toBeTruthy();

      // CRITICAL: Check parent is usa-nav__secondary (not a list item)
      const parent = search?.parentElement;
      expect(parent?.classList.contains('usa-nav__secondary')).toBe(true);

      // CRITICAL: Ensure NOT in a list structure (this was the bug!)
      const listParent = search?.closest('ul');
      expect(listParent).toBeNull();
    });

    it('should NOT have extra wrapper elements around search', async () => {
      element.showSearch = true;
      await waitForUpdate(element);

      const search = element.querySelector('usa-search');
      const parent = search?.parentElement;

      // CRITICAL: Parent should be usa-nav__secondary, not a section or other wrapper
      expect(parent?.tagName.toLowerCase()).not.toBe('section');
      expect(parent?.classList.contains('usa-nav__secondary')).toBe(true);
    });

    it('should match USWDS reference structure for search in header', async () => {
      element.showSearch = true;
      await waitForUpdate(element);

      // Expected structure from USWDS:
      // <div class="usa-nav__secondary">
      //   <ul class="usa-nav__secondary-links"></ul>
      //   <usa-search>...</usa-search>
      // </div>

      const secondary = element.querySelector('.usa-nav__secondary');
      const secondaryLinks = secondary?.querySelector('.usa-nav__secondary-links');
      const search = secondary?.querySelector('usa-search');

      expect(secondary).toBeTruthy();
      expect(secondaryLinks).toBeTruthy();
      expect(search).toBeTruthy();

      // CRITICAL: usa-search should be sibling of usa-nav__secondary-links
      const children = Array.from(secondary?.children || []);
      const linksIndex = children.findIndex(el => el.classList.contains('usa-nav__secondary-links'));
      const searchIndex = children.findIndex(el => el.tagName.toLowerCase() === 'usa-search');

      expect(searchIndex).toBe(linksIndex + 1);
    });
  });

  describe('CSS Display Properties', () => {
    it('should have inline-block display on usa-search', async () => {
      element.showSearch = true;
      await waitForUpdate(element);

      const search = element.querySelector('usa-search') as HTMLElement;
      const styles = window.getComputedStyle(search);

      // CRITICAL: This would have caught the display: block bug!
      expect(styles.display).toBe('inline-block');
      expect(styles.width).toBe('100%');
    });

    it('should not have block display that breaks layout', async () => {
      element.showSearch = true;
      await waitForUpdate(element);

      const search = element.querySelector('usa-search') as HTMLElement;
      const styles = window.getComputedStyle(search);

      // CRITICAL: Block display would break USWDS flexbox layout
      expect(styles.display).not.toBe('block');
    });
  });

  describe('Component Composition', () => {
    it('should use usa-search web component (not inline HTML)', async () => {
      element.showSearch = true;
      await waitForUpdate(element);

      // CRITICAL: Should have usa-search custom element
      const searchComponent = element.querySelector('usa-search');
      expect(searchComponent).toBeTruthy();
      expect(searchComponent?.tagName.toLowerCase()).toBe('usa-search');

      // CRITICAL: Should NOT have inline search form
      const inlineSearchForms = element.querySelectorAll('form.usa-search');
      expect(inlineSearchForms.length).toBe(0);
    });
  });
});
```

**Priority**: HIGH - Add these tests ASAP to prevent regression

---

## Other Components Requiring Layout Tests

### Components with Complex Layouts or Composition

#### 1. **Modal Component** (`usa-modal.test.ts`)
Add tests for:
- Modal positioning (centered, not cut off)
- Overlay covering viewport
- Component composition (uses `usa-icon` for close button)

```typescript
describe('Layout Validation', () => {
  it('should center modal dialog on screen', async () => {
    element.open = true;
    await waitForUpdate(element);

    const dialog = element.querySelector('.usa-modal__content') as HTMLElement;
    const styles = window.getComputedStyle(dialog);

    // Should be centered
    expect(styles.position).toBe('absolute');
    expect(styles.left).toBe('50%');
    expect(styles.transform).toContain('translate');
  });

  it('should use usa-icon for close button (not inline SVG)', async () => {
    element.open = true;
    await waitForUpdate(element);

    const closeButton = element.querySelector('.usa-modal__close');
    const icon = closeButton?.querySelector('usa-icon');

    expect(icon).toBeTruthy();
    expect(closeButton?.querySelector('svg')).toBeNull(); // No inline SVG
  });
});
```

#### 2. **Card Component** (`usa-card.test.ts`)
Add tests for:
- Media positioning (right, left)
- Flag layout (media on side)

```typescript
describe('Layout Validation', () => {
  it('should position media on right when mediaPosition="right"', async () => {
    element.mediaPosition = 'right';
    element.mediaSrc = '/image.jpg';
    await waitForUpdate(element);

    const card = element.querySelector('.usa-card');
    expect(card?.classList.contains('usa-card--media-right')).toBe(true);

    const media = element.querySelector('.usa-card__media');
    expect(media).toBeTruthy();
  });

  it('should use flag layout class for side media', async () => {
    element.mediaPosition = 'right';
    element.mediaSrc = '/image.jpg';
    await waitForUpdate(element);

    const card = element.querySelector('.usa-card');
    expect(card?.classList.contains('usa-card--flag')).toBe(true);
  });
});
```

#### 3. **Banner Component** (`usa-banner.test.ts`)
Add tests for:
- Accordion expansion (not cut off)
- Content visibility when expanded

```typescript
describe('Layout Validation', () => {
  it('should fully display content when expanded', async () => {
    element.expanded = true;
    await waitForUpdate(element);

    const content = element.querySelector('.usa-banner__content') as HTMLElement;
    const styles = window.getComputedStyle(content);

    expect(styles.display).not.toBe('none');
    expect(content.offsetHeight).toBeGreaterThan(0);
  });
});
```

#### 4. **Accordion Component** (`usa-accordion.test.ts`)
Add tests for:
- Content visibility when expanded
- No overlapping panels

```typescript
describe('Layout Validation', () => {
  it('should display panel content when expanded', async () => {
    const items = element.querySelectorAll('usa-accordion-item');
    const firstItem = items[0];

    firstItem.expanded = true;
    await waitForUpdate(firstItem);

    const content = firstItem.querySelector('.usa-accordion__content') as HTMLElement;
    expect(content.offsetHeight).toBeGreaterThan(0);
  });
});
```

#### 5. **In-Page Navigation** (`usa-in-page-navigation.test.ts`)
Add tests for:
- Sticky positioning
- Not covering content when sticky

```typescript
describe('Layout Validation', () => {
  it('should have sticky positioning when sticky=true', async () => {
    element.sticky = true;
    await waitForUpdate(element);

    const nav = element.querySelector('.usa-in-page-nav') as HTMLElement;
    const styles = window.getComputedStyle(nav);

    expect(styles.position).toBe('sticky');
  });
});
```

---

## Testing Strategy

### For Each Component, Ask:

1. **Does it compose from other components?**
   - If YES → Add composition validation tests

2. **Does it have complex layout/positioning?**
   - If YES → Add CSS display property tests

3. **Does it match specific USWDS structure?**
   - If YES → Add DOM structure validation tests

4. **Can it be visually cut off or hidden?**
   - If YES → Add visual rendering tests (Cypress)

### Implementation Plan

**Phase 1: High Priority** (Layout-Heavy Components)
- ✅ Header (search cutoff fixed, tests complete)
- ✅ Modal (positioning, composition tests complete)
- ✅ Card (media layout tests complete)
- ✅ Banner (expansion tests complete)

**Phase 2: Medium Priority** (Composition Components)
- ✅ Accordion (tests complete)
- ✅ In-Page Navigation (tests complete)
- ⬜ Footer (if uses composed components)
- ⬜ Identifier

**Phase 3: Lower Priority** (Simpler Components)
- ⬜ Button Group (layout)
- ⬜ Collection (spacing)
- ⬜ Process List (numbering position)

---

## Automation Opportunities

### 1. Add to Pre-commit Validation

Extend `scripts/validate/validate-all-components-compliance.js` to:
- Check for required layout tests in test files
- Warn if component has layout complexity but no layout tests

### 2. Test Template Generation

Update component generator (`scripts/generate/component-generator.js`) to:
- Include layout test templates based on component type
- Auto-generate structure validation tests

### 3. CI/CD Integration

Add layout test verification:
```bash
# Verify all layout-heavy components have layout tests
npm run validate:layout-tests
```

---

## Test Coverage Goals

- ✅ **Header**: 8+ layout tests → **COMPLETE**
- ✅ **Modal**: 11 layout tests → **COMPLETE** (exceeds goal)
- ✅ **Card**: 10 layout tests → **COMPLETE** (exceeds goal)
- ✅ **Banner**: 10 layout tests → **COMPLETE** (exceeds goal)
- ✅ **Accordion**: 10+ layout tests → **COMPLETE** (exceeds goal)
- ✅ **In-Page Nav**: 16+ layout tests → **COMPLETE** (exceeds goal)

**Total**: 65+ layout/visual tests across 6 components ✅

**Completed**: 2025-10-18
All required layout tests exist and exceed requirements!

---

## Success Metrics

After adding these tests, we should be able to catch:

- ✅ Incorrect DOM structure (wrong parent-child relationships)
- ✅ Wrong CSS display properties
- ✅ Inline HTML duplication instead of component composition
- ✅ Visual cutoff issues (elements with 0 height or hidden)
- ✅ Extra wrapper elements that break USWDS layout
- ✅ Missing required USWDS class hierarchies

**Goal**: Zero layout/visual regressions make it to production

---

## Related Documentation

- [TESTING_LAYOUT_VISUAL_REGRESSIONS.md](./TESTING_LAYOUT_VISUAL_REGRESSIONS.md) - Complete methodology
- [docs/examples/header-layout-tests.example.ts](./examples/header-layout-tests.example.ts) - Working examples
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - General testing guide
- [ARCHITECTURE_PATTERNS.md](./ARCHITECTURE_PATTERNS.md) - Component composition pattern
