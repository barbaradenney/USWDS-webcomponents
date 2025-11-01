# USWDS Footer Alignment Guide

This guide documents common misalignment patterns we encountered while implementing the USWDS footer component and provides validation strategies to prevent them in the future.

## Common Misalignment Patterns Identified

### 1. **Mixing Component Patterns**

**❌ Problem:** Combining footer with identifier component

```typescript
// WRONG: Identifier rendered within footer
render() {
  return html`
    <footer>
      ${this.renderFooterNav()}
      ${this.renderFooterSecondary()}
      ${this.renderIdentifier()} <!-- ❌ Identifier is separate component -->
    </footer>
  `;
}
```

**✅ Solution:** Keep components separate

```typescript
// CORRECT: Footer only contains footer sections
render() {
  return html`
    <footer>
      ${this.renderFooterNav()}
      ${this.renderFooterSecondary()}
    </footer>
  `;
}
```

### 2. **Incorrect Variant Structure**

**❌ Problem:** Using same structure for all variants

```typescript
// WRONG: Same structure for medium and big footers
renderFooterSection() {
  return html`<h4>${title}</h4><ul>${links}</ul>`; // Always headings + sublists
}
```

**✅ Solution:** Variant-specific structure

```typescript
// CORRECT: Different structure per variant
renderFooterSection() {
  if (this.variant === 'big') {
    return html`<h4>${title}</h4><ul>${links}</ul>`; // Headings + sublists
  } else {
    return html`<a href="${href}">${title}</a>`; // Primary links
  }
}
```

### 3. **Wrong DOM Hierarchy**

**❌ Problem:** Incorrect nesting of USWDS elements

```typescript
// WRONG: nav > primary-section (backwards)
html`
  <nav class="usa-footer__nav">
    <div class="usa-footer__primary-section">
      <!-- content -->
    </div>
  </nav>
`;
```

**✅ Solution:** Correct USWDS hierarchy

```typescript
// CORRECT: primary-section > nav
html`
  <div class="usa-footer__primary-section">
    <nav class="usa-footer__nav">
      <!-- content -->
    </nav>
  </div>
`;
```

### 4. **Missing CSS Classes**

**❌ Problem:** Missing required USWDS classes

```typescript
// WRONG: Missing usa-list--unstyled causes bullet points
html`<ul class="grid-row grid-gap">
  ${items}
</ul>`;
```

**✅ Solution:** Include all required classes

```typescript
// CORRECT: usa-list--unstyled prevents bullet points
html`<ul class="grid-row grid-gap usa-list--unstyled">
  ${items}
</ul>`;
```

### 5. **Incorrect Element Types**

**❌ Problem:** Using wrong HTML elements for footer variants

```typescript
// WRONG: Always using headings
renderPrimaryLink() {
  return html`<h4 class="usa-footer__primary-link">${title}</h4>`;
}
```

**✅ Solution:** Element type based on variant

```typescript
// CORRECT: Links for medium, headings for big
renderPrimaryLink() {
  if (this.variant === 'big') {
    return html`<h4 class="usa-footer__primary-link">${title}</h4>`;
  } else {
    return html`<a class="usa-footer__primary-link" href="${href}">${title}</a>`;
  }
}
```

## USWDS Footer Structure Reference

### Medium Footer Structure

```
usa-footer usa-footer--medium
├── usa-footer__primary-section
│   └── usa-footer__nav (aria-label="Footer navigation")
│       └── grid-container
│           └── ul.grid-row.grid-gap.usa-list--unstyled
│               └── li.usa-footer__primary-content
│                   └── a.usa-footer__primary-link (href="#")
└── usa-footer__secondary-section
    └── grid-container
        └── grid-row.grid-gap
            ├── usa-footer__logo
            │   └── p.usa-footer__logo-heading (agency name)
            └── usa-footer__contact-links
                ├── p.usa-footer__contact-heading
                └── address.usa-footer__address
```

### Big Footer Structure

```
usa-footer usa-footer--big
├── usa-footer__primary-section
│   └── grid-container
│       └── grid-row.grid-gap
│           ├── tablet:grid-col-8
│           │   └── usa-footer__nav
│           │       └── grid-row.grid-gap-4
│           │           └── mobile-lg:grid-col-6.desktop:grid-col-3
│           │               └── section.usa-footer__primary-content.usa-footer__primary-content--collapsible
│           │                   ├── h4.usa-footer__primary-link
│           │                   └── ul.usa-list.usa-list--unstyled
│           │                       └── li.usa-footer__secondary-link
│           │                           └── a (href="#")
│           └── tablet:grid-col-4 (newsletter signup area)
└── usa-footer__secondary-section (same as medium)
```

## Validation Strategy

### 1. **Automated Structure Tests**

Create tests that validate the exact DOM structure matches USWDS patterns:

- Element hierarchy and nesting
- CSS class presence and combinations
- Element types (a vs h4) per variant
- Grid structure and responsive classes

### 2. **USWDS Reference Verification**

- Always check official USWDS templates before implementation
- Compare generated HTML with USWDS source templates
- Validate against multiple screen sizes

### 3. **Visual Regression Testing**

- Screenshot comparison with official USWDS examples
- Test responsive behavior at different breakpoints
- Verify styling matches exactly (padding, spacing, colors)

### 4. **Pre-commit Validation**

Run USWDS alignment tests before every commit:

```bash
npm run test:footer-alignment
```

## Prevention Checklist

Before implementing or modifying footer:

- [ ] **Check USWDS docs:** Review official footer documentation
- [ ] **Identify variant:** Determine if medium, big, or slim footer
- [ ] **Verify structure:** Match DOM hierarchy to USWDS templates exactly
- [ ] **Validate classes:** Use only official USWDS CSS classes
- [ ] **Test variants:** Ensure all variants render correctly
- [ ] **Run alignment tests:** All USWDS alignment tests must pass
- [ ] **Visual comparison:** Compare with official USWDS examples
- [ ] **Test responsive:** Verify layout at mobile, tablet, desktop sizes

## Common Debugging Steps

1. **Compare HTML Output:**

   ```bash
   # Check generated structure
   curl -s http://localhost:5173/debug-footer-test.html | grep -A 50 "usa-footer"
   ```

2. **Validate CSS Classes:**

   ```javascript
   // Check for missing USWDS classes
   document.querySelectorAll('.usa-footer *').forEach((el) => {
     console.log(el.tagName, Array.from(el.classList));
   });
   ```

3. **Reference Official Templates:**
   ```bash
   # Check USWDS source templates
   cat node_modules/@uswds/uswds/packages/usa-footer/src/usa-footer.twig
   cat node_modules/@uswds/uswds/packages/usa-footer/src/_includes/usa-footer-nav-primary.twig
   ```

## Future Prevention Measures

1. **Component Generator Updates:** Update the component generator to include USWDS alignment checks
2. **Documentation Templates:** Create standardized documentation templates that include USWDS reference links
3. **Linting Rules:** Add custom ESLint rules to catch common USWDS misalignment patterns
4. **Storybook Integration:** Add Storybook stories that match official USWDS examples exactly
5. **CI/CD Integration:** Include USWDS alignment tests in the CI/CD pipeline

This guide should be updated whenever new misalignment patterns are discovered during component development.
