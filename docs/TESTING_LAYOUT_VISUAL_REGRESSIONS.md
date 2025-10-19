# Testing Layout and Visual Regressions

**Created**: 2025-10-18
**Purpose**: Document testing strategies to catch CSS/layout issues like the header search cutoff problem

---

## Problem Statement

### What Happened

The header component had a visual/layout bug where the search was cut off at the top of the page. This was caused by:

1. **Incorrect HTML structure** - Search was nested in `<ul><li>` instead of directly in `usa-nav__secondary`
2. **Wrong display style** - usa-search had `display: block` instead of `inline-block`
3. **Extra wrapper element** - Added `<section>` wrapper that wasn't in USWDS spec

### What Our Tests Missed

**Existing unit tests checked:**
- ✅ Search form exists in DOM
- ✅ Search input has correct placeholder
- ✅ Search button is present
- ✅ Search event dispatches correctly

**What tests DIDN'T check:**
- ❌ Search is visually rendered (not cut off)
- ❌ HTML structure matches USWDS exactly
- ❌ usa-search has correct CSS display property
- ❌ No extra wrapper elements present
- ❌ Search positioning within header layout

---

## Testing Strategies to Prevent This

### 1. DOM Structure Validation Tests

**Purpose**: Validate exact HTML structure matches USWDS specification

#### Example Test

```typescript
describe('USWDS Structure Compliance', () => {
  it('should have search directly in usa-nav__secondary (not in list item)', async () => {
    element.showSearch = true;
    await waitForUpdate(element);

    // Get search element
    const search = element.querySelector('usa-search');
    expect(search).toBeTruthy();

    // Check parent is usa-nav__secondary (not a list item)
    const parent = search?.parentElement;
    expect(parent?.classList.contains('usa-nav__secondary')).toBe(true);

    // Ensure NOT in a list structure
    const listParent = search?.closest('ul');
    expect(listParent).toBeNull();
  });

  it('should NOT have extra wrapper elements around search', async () => {
    element.showSearch = true;
    await waitForUpdate(element);

    const search = element.querySelector('usa-search');
    const parent = search?.parentElement;

    // Parent should be usa-nav__secondary, not a section or other wrapper
    expect(parent?.tagName.toLowerCase()).not.toBe('section');
    expect(parent?.classList.contains('usa-nav__secondary')).toBe(true);
  });

  it('should match USWDS reference HTML structure for search in header', async () => {
    element.showSearch = true;
    await waitForUpdate(element);

    // Expected structure:
    // <div class="usa-nav__secondary">
    //   <ul class="usa-nav__secondary-links"></ul>
    //   <usa-search>...</usa-search>
    // </div>

    const secondary = element.querySelector('.usa-nav__secondary');
    expect(secondary).toBeTruthy();

    const secondaryLinks = secondary?.querySelector('.usa-nav__secondary-links');
    expect(secondaryLinks).toBeTruthy();

    const search = secondary?.querySelector('usa-search');
    expect(search).toBeTruthy();

    // usa-search should be sibling of usa-nav__secondary-links
    const children = Array.from(secondary?.children || []);
    const linksIndex = children.findIndex(el => el.classList.contains('usa-nav__secondary-links'));
    const searchIndex = children.findIndex(el => el.tagName.toLowerCase() === 'usa-search');

    expect(searchIndex).toBe(linksIndex + 1); // search comes after links
  });
});
```

### 2. CSS Display Property Tests

**Purpose**: Validate component host styles are correct

#### Example Test

```typescript
describe('CSS Display Properties', () => {
  it('should have inline-block display on usa-search', async () => {
    element.showSearch = true;
    await waitForUpdate(element);

    const search = element.querySelector('usa-search') as HTMLElement;
    const styles = window.getComputedStyle(search);

    expect(styles.display).toBe('inline-block');
    expect(styles.width).toBe('100%'); // USWDS applies width: 100%
  });

  it('should not have block display that breaks layout', async () => {
    element.showSearch = true;
    await waitForUpdate(element);

    const search = element.querySelector('usa-search') as HTMLElement;
    const styles = window.getComputedStyle(search);

    // Block display would break USWDS flexbox layout
    expect(styles.display).not.toBe('block');
  });
});
```

### 3. Visual Rendering Tests (Cypress Component Tests)

**Purpose**: Verify components are actually visible in browser

#### Example Test

```typescript
// cypress/component/header-visual.cy.ts
describe('Header Visual Rendering', () => {
  it('should render search without cutoff at top of page', () => {
    cy.mount(`
      <usa-header
        logo-text="Test Agency"
        show-search="true"
        search-placeholder="Search"
      ></usa-header>
    `);

    // Search should be visible
    cy.get('usa-search').should('be.visible');

    // Check search is not cut off (has reasonable height)
    cy.get('usa-search').then(($search) => {
      const height = $search.height();
      expect(height).to.be.greaterThan(30); // Reasonable minimum height
    });

    // Check search input is visible and clickable
    cy.get('.usa-search__input').should('be.visible').and('not.be.disabled');

    // Check search button is visible
    cy.get('.usa-search__submit').should('be.visible');
  });

  it('should have search properly positioned in header layout', () => {
    cy.mount(`
      <usa-header
        logo-text="Test Agency"
        show-search="true"
        extended="true"
      ></usa-header>
    `);

    // On desktop, usa-nav__secondary should be absolutely positioned
    cy.viewport(1024, 768);

    cy.get('.usa-nav__secondary').then(($secondary) => {
      const styles = window.getComputedStyle($secondary[0]);

      // Should be absolutely positioned (USWDS desktop layout)
      expect(styles.position).to.equal('absolute');

      // Should have bottom and right positioning
      expect(styles.bottom).to.not.equal('auto');
      expect(styles.right).to.not.equal('auto');
    });

    // Search within should still be visible
    cy.get('usa-search').should('be.visible');
  });
});
```

### 4. Component Composition Tests

**Purpose**: Verify correct use of web components vs inline HTML

#### Example Test

```typescript
describe('Component Composition', () => {
  it('should use usa-search web component (not inline HTML)', async () => {
    element.showSearch = true;
    await waitForUpdate(element);

    // Should have usa-search custom element
    const searchComponent = element.querySelector('usa-search');
    expect(searchComponent).toBeTruthy();
    expect(searchComponent?.tagName.toLowerCase()).toBe('usa-search');

    // Should NOT have inline search form with usa-search class
    const inlineSearchForms = element.querySelectorAll('form.usa-search');
    expect(inlineSearchForms.length).toBe(0); // usa-search component has the form inside it
  });

  it('should import usa-search component dependency', () => {
    // Check component file imports search
    const componentSource = readFileSync(
      join(__dirname, 'usa-header.ts'),
      'utf-8'
    );

    expect(componentSource).toContain("import '../search/index.js'");
  });
});
```

### 5. USWDS Reference Comparison Tests

**Purpose**: Compare our structure against official USWDS HTML

#### Example Test

```typescript
describe('USWDS HTML Reference Compliance', () => {
  it('should match official USWDS header with search structure', async () => {
    element.logoText = 'Agency';
    element.showSearch = true;
    element.navItems = [{ label: 'Home', href: '/' }];
    await waitForUpdate(element);

    // Official USWDS structure:
    // <header class="usa-header usa-header--basic">
    //   <div class="usa-nav-container">
    //     <div class="usa-navbar">...</div>
    //     <nav class="usa-nav">
    //       <div class="usa-nav__inner">
    //         <ul class="usa-nav__primary">...</ul>
    //         <div class="usa-nav__secondary">
    //           <ul class="usa-nav__secondary-links"></ul>
    //           <!-- search goes here, NOT in a list -->
    //         </div>
    //       </div>
    //     </nav>
    //   </div>
    // </header>

    const header = element.querySelector('.usa-header');
    const navContainer = element.querySelector('.usa-nav-container');
    const navbar = element.querySelector('.usa-navbar');
    const nav = element.querySelector('.usa-nav');
    const navInner = element.querySelector('.usa-nav__inner');
    const secondary = element.querySelector('.usa-nav__secondary');
    const secondaryLinks = element.querySelector('.usa-nav__secondary-links');

    expect(header).toBeTruthy();
    expect(navContainer).toBeTruthy();
    expect(navbar).toBeTruthy();
    expect(nav).toBeTruthy();
    expect(navInner).toBeTruthy();
    expect(secondary).toBeTruthy();
    expect(secondaryLinks).toBeTruthy();

    // Verify nesting
    expect(navContainer?.contains(navbar)).toBe(true);
    expect(navContainer?.contains(nav)).toBe(true);
    expect(nav?.contains(navInner)).toBe(true);
    expect(navInner?.contains(secondary)).toBe(true);
    expect(secondary?.contains(secondaryLinks)).toBe(true);
  });
});
```

---

## Recommended Testing Additions

### For usa-header Component

Add to `src/components/header/usa-header.test.ts`:

```typescript
describe('Layout and Structure Validation', () => {
  // Add DOM structure tests
  // Add CSS display property tests
  // Add USWDS reference comparison tests
  // Add component composition tests
});
```

Add to `cypress/component/usa-header.cy.ts`:

```typescript
describe('Visual Rendering Tests', () => {
  // Add visual visibility tests
  // Add positioning tests
  // Add responsive layout tests
});
```

### For usa-search Component

Add to `src/components/search/usa-search.test.ts`:

```typescript
describe('CSS Host Styles', () => {
  it('should have inline-block display', () => {
    const search = document.createElement('usa-search') as USASearch;
    document.body.appendChild(search);

    const styles = window.getComputedStyle(search);
    expect(styles.display).toBe('inline-block');
    expect(styles.width).toBe('100%');

    search.remove();
  });
});
```

### General Pattern for All Components

1. **DOM Structure Tests** - Validate exact USWDS HTML structure
2. **CSS Property Tests** - Check host styles and computed styles
3. **Visual Tests** - Cypress tests for actual rendering
4. **Component Composition** - Verify use of web components
5. **USWDS Reference** - Compare against official USWDS

---

## Automation Opportunities

### 1. Visual Regression Testing

Use Chromatic (already integrated with Storybook) to catch visual changes:

```bash
npm run chromatic
```

This would catch:
- Search cutoff issues
- Layout breakage
- CSS changes

### 2. Automated USWDS Structure Validation

Extend `validate-all-components-compliance.js` to check:
- Component composition (using web components)
- Forbidden wrapper elements
- CSS display properties

Already implemented:
- ✅ `shouldUseComponents` - Checks for web component usage
- ✅ `forbiddenClasses` - Checks for architectural violations

### 3. Screenshot Testing

Add screenshot tests in Cypress:

```typescript
it('should match reference screenshot', () => {
  cy.mount(`<usa-header show-search="true"></usa-header>`);
  cy.matchImageSnapshot('header-with-search');
});
```

---

## Testing Checklist

Before committing header (or any layout-heavy component):

- [ ] Unit tests check DOM structure exactly matches USWDS
- [ ] Unit tests verify CSS display properties
- [ ] Unit tests verify no extra wrapper elements
- [ ] Unit tests verify component composition (uses web components)
- [ ] Cypress tests verify visual rendering (not cut off)
- [ ] Cypress tests verify responsive layout
- [ ] Storybook visual regression (Chromatic) passes
- [ ] Manual browser testing at different viewport sizes

---

## Key Takeaways

1. **DOM structure tests aren't enough** - Need to check visual rendering too
2. **CSS matters** - Test computed styles, not just class presence
3. **USWDS compliance** - Compare exact structure against reference
4. **Component composition** - Validate use of web components
5. **Visual regression** - Use tools like Chromatic to catch layout changes
6. **Multi-layer testing** - Unit + Cypress + Visual = comprehensive coverage

---

## Related Documentation

- **ARCHITECTURE_PATTERNS.md** - Component Composition Pattern
- **TESTING_GUIDE.md** - Complete testing documentation
- **docs/BEHAVIORAL_TESTING_METHODOLOGY.md** - Visual behavior testing
- **USWDS_INTEGRATION_GUIDE.md** - USWDS patterns and structure
