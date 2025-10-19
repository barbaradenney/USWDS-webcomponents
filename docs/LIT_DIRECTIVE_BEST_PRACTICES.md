# Lit Directive Best Practices

This document outlines best practices for using Lit directives in USWDS web components to prevent runtime errors and ensure consistent behavior.

## 🚨 Common Issues and Solutions

### 1. Boolean Directive Syntax

**❌ Incorrect:**
```typescript
// DON'T: Quote boolean directive expressions
html`<div ?hidden="${!isVisible}"></div>`
html`<input ?disabled="${isDisabled}"></input>`
```

**✅ Correct:**
```typescript
// DO: Use unquoted boolean directive expressions
html`<div ?hidden=${!isVisible}></div>`
html`<input ?disabled=${isDisabled}></input>`
```

### 2. Conditional Attributes

**❌ Problematic:**
```typescript
// DON'T: Use boolean directives for conditional attributes
html`<div ?data-allow-multiple=${multiselectable}></div>`
```

**✅ Better Options:**
```typescript
// OPTION 1: String interpolation
html`<div${multiselectable ? ' data-allow-multiple' : ''}></div>`

// OPTION 2: ifDefined directive (with proper import)
import { ifDefined } from 'lit/directives/if-defined.js';
html`<div data-allow-multiple=${ifDefined(multiselectable ? 'true' : undefined)}></div>`

// OPTION 3: Conditional rendering
html`<div ${multiselectable ? html`data-allow-multiple` : ''}></div>`
```

### 3. Directive Imports

**✅ Always import directives you use:**
```typescript
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { when } from 'lit/directives/when.js';
import { repeat } from 'lit/directives/repeat.js';
import { styleMap } from 'lit/directives/style-map.js';
import { classMap } from 'lit/directives/class-map.js';
```

## 📋 Directive Usage Guidelines

### unsafeHTML
Use for dynamic HTML content (be careful with XSS):
```typescript
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

// ✅ Safe usage
html`<div>${unsafeHTML(sanitizedContent)}</div>`
```

### ifDefined
Use for optional attributes:
```typescript
import { ifDefined } from 'lit/directives/if-defined.js';

// ✅ Correct usage
html`<input value=${ifDefined(this.value || undefined)}>`
```

### when
Use for conditional rendering:
```typescript
import { when } from 'lit/directives/when.js';

// ✅ Conditional content
html`${when(showError, () => html`<div class="error">${errorMessage}</div>`)}`
```

### repeat
Use for efficient list rendering:
```typescript
import { repeat } from 'lit/directives/repeat.js';

// ✅ Efficient list rendering
html`${repeat(items, item => item.id, item => html`<li>${item.name}</li>`)}`
```

## 🛡️ Prevention Strategies

### 1. Automated Testing
- Run `npm test` to execute Lit template validation tests
- Tests catch common directive syntax errors before runtime

### 2. ESLint Integration
- Custom ESLint rules detect problematic directive patterns
- Auto-fix available for some common issues

### 3. Storybook Smoke Tests
- Automated tests ensure Storybook starts without directive errors
- Validates component stories load properly

### 4. Development Checks
```bash
# Run template validation
npm test -- lit-template-validation

# Check for directive issues
npm run lint

# Test Storybook startup
npm test -- storybook-smoke
```

## 🎯 USWDS-Specific Guidelines

### Prefer Simple Approaches
For USWDS components, prefer simpler template patterns:

```typescript
// ✅ Simple and reliable
html`<div class="${classes}"${this.multiselectable ? ' data-allow-multiple' : ''}>`

// ❌ More complex, potential for issues
html`<div class="${classes}" ?data-allow-multiple=${this.multiselectable}>`
```

### Minimal Directive Usage
Only use directives when necessary:
- `unsafeHTML` for dynamic HTML content
- Simple string interpolation for most cases
- Avoid complex directive combinations

### Template Structure
Keep templates simple and readable:
```typescript
render() {
  const classes = this.buildClasses();
  const attributes = this.buildAttributes();

  return html`
    <div class="${classes}" ${attributes}>
      ${this.renderContent()}
    </div>
  `;
}
```

## 🔧 Debugging Directive Issues

### Common Error Messages
1. `currentDirective._$initialize is not a function`
   - Usually caused by quoted boolean directives
   - Check for `?attr="${expression}"` patterns

2. `directive is not a function`
   - Missing import for the directive
   - Verify import statement exists

3. `Cannot read property of undefined`
   - Directive used before import
   - Check import order

### Quick Fixes
1. Remove quotes from boolean directives
2. Add missing directive imports
3. Use string interpolation instead of complex directives
4. Clear Vite cache: `rm -rf node_modules/.vite`

## 📚 Additional Resources

- [Lit Directives Documentation](https://lit.dev/docs/templates/directives/)
- [USWDS Component Guidelines](../CLAUDE.md#component-development-pattern)
- [Template Validation Tests](__tests__/lit-template-validation.test.ts)

## ✅ Checklist for New Components

- [ ] No quoted boolean directive expressions
- [ ] All used directives are properly imported
- [ ] Template validation tests pass
- [ ] ESLint checks pass
- [ ] Storybook loads without errors
- [ ] Prefer simple string interpolation when possible