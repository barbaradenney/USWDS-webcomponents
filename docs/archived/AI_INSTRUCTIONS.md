# AI/LLM Instructions for USWDS Web Components

## 🎯 Project Mission

You are working on a web component library that creates **thin wrappers** around the official U.S. Web Design System (USWDS). The goal is **maximum maintainability** with **minimum custom code**.

## ⚠️ Critical Rules

### ALWAYS Do:
1. ✅ Use official USWDS CSS classes directly
2. ✅ Import `../../styles/styles.css` (the compiled USWDS CSS)
3. ✅ Use light DOM (automatic with USWDSBaseComponent)
4. ✅ Extend `USWDSBaseComponent` (preferred) or `LitElement` directly
5. ✅ Write comprehensive unit tests (MANDATORY)
6. ✅ Run `npm run test`, `npm run typecheck`, `npm run lint` - ALL MUST PASS
7. ✅ Use the component generator: `npm run generate:component`
8. ✅ Keep components simple and minimal
9. ✅ Let USWDS handle ALL styling

### NEVER Do:
1. ❌ Create custom CSS styles for USWDS components
2. ❌ Recreate or duplicate USWDS styles
3. ❌ Create complex base classes or mixins
4. ❌ Use Shadow DOM
5. ❌ Override or "improve" USWDS styles
6. ❌ Add unnecessary abstractions
7. ❌ Create utility classes or helpers
8. ❌ Commit code without tests or with failing tests

## 📝 Component Template

When creating a new component, follow this EXACT pattern:

```typescript
import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { USWDSBaseComponent } from '../../utils/base-component.js';

// ALWAYS import the compiled USWDS CSS
import '../../styles/styles.css';

@customElement('usa-[component-name]')
export class USA[ComponentName] extends USWDSBaseComponent {
  // ONLY host display styles - nothing else
  static styles = css`
    :host {
      display: block; // or inline-block
    }
    :host([hidden]) {
      display: none;
    }
  `;

  // Properties for USWDS variants
  @property({ type: String }) variant = 'primary';
  @property({ type: Boolean, reflect: true }) disabled = false;

  // ALWAYS use light DOM
  protected createRenderRoot(): HTMLElement {
    return this as any;
  }

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', '[appropriate-aria-role]');
    this.setupEventHandlers();
  }

  updated(_changedProperties: Map<string, any>) {
    this.updateClasses();
    this.updateAttributes();
  }

  private setupEventHandlers() {
    // Only if interactive
    this.addEventListener('click', this.handleClick.bind(this));
    
    this.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (!this.disabled) {
          this.handleClick();
        }
      }
    });
  }

  private handleClick() {
    if (this.disabled) return;
    
    // Component-specific behavior
    
    this.dispatchEvent(new CustomEvent('change', {
      bubbles: true,
      cancelable: true
    }));
  }

  private updateClasses() {
    // DIRECTLY apply USWDS classes - no custom styles
    const classes = [
      'usa-[component-name]',
      this.variant !== 'primary' ? `usa-[component-name]--${this.variant}` : '',
      // Add other USWDS modifiers as needed
    ].filter(Boolean).join(' ');

    this.className = classes;
  }

  private updateAttributes() {
    this.setAttribute('tabindex', this.disabled ? '-1' : '0');
    this.setAttribute('aria-disabled', this.disabled.toString());
  }

  render() {
    return html`<slot></slot>`;
  }
}
```

## 🧪 MANDATORY Testing Requirements

### **CRITICAL**: All components MUST have comprehensive tests

**⚠️ NEVER COMMIT** code without tests or with failing tests.

### Required Testing Commands

```bash
# All of these MUST PASS before committing:
npm run test              # Unit tests must pass
npm run typecheck         # TypeScript must compile  
npm run lint             # No linting errors allowed
npm run test:coverage     # Check coverage (aim >80%)
```

### Unit Test Template

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../src/components/[component]/usa-[component].ts';
import type { USA[Component] } from '../src/components/[component]/usa-[component].js';

describe('USA[Component]', () => {
  let element: USA[Component];

  beforeEach(() => {
    element = document.createElement('usa-[component]') as USA[Component];
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should have default properties', () => {
    expect(element.variant).toBe('primary');
    expect(element.disabled).toBe(false);
  });

  it('should update when properties change', async () => {
    element.variant = 'secondary';
    await element.updateComplete;
    
    expect(element.variant).toBe('secondary');
  });

  it('should emit custom events', async () => {
    let eventFired = false;
    element.addEventListener('my-event', () => {
      eventFired = true;
    });

    // Trigger event and test
    element.click();
    expect(eventFired).toBe(true);
  });

  it('should handle accessibility', async () => {
    element.disabled = true;
    await element.updateComplete;
    
    expect(element.getAttribute('aria-disabled')).toBe('true');
    expect(element.getAttribute('tabindex')).toBe('-1');
  });
});
```

### Testing Checklist

- [ ] **Unit tests written** for all properties, methods, events
- [ ] **Accessibility tested** - ARIA attributes, keyboard navigation
- [ ] **All tests pass** - `npm run test` succeeds
- [ ] **TypeScript clean** - `npm run typecheck` passes  
- [ ] **Linting clean** - `npm run lint` passes
- [ ] **Coverage adequate** - >80% test coverage achieved

## 🛠️ Common Tasks

### Adding a New Component

1. **Check USWDS Documentation First**
   ```
   https://designsystem.digital.gov/components/[component-name]/
   ```

2. **Use the Generator**
   ```bash
   npm run generate:component [name] [type]
   ```

3. **Implement Component**
   - Look at USWDS HTML examples
   - Use the exact same classes
   - Don't create custom styles
   - Extend USWDSBaseComponent

4. **Write Tests (MANDATORY)**
   ```bash
   # Create test file: __tests__/usa-[component].test.ts
   # Test all properties, methods, events, accessibility
   npm run test -- --run  # Verify tests pass
   ```

5. **Quality Check (MUST PASS)**
   ```bash
   npm run test              # Unit tests
   npm run typecheck         # TypeScript compilation
   npm run lint             # Code quality
   ```

### Updating USWDS

```bash
# Update package
npm update @uswds/uswds

# Recompile CSS
npm run uswds:compile

# Test
npm run storybook
```

### Component Types

The generator supports three types:
- `input` - Form inputs (text, email, etc.)
- `button` - Interactive buttons
- `alert` - Notification/status components

## 🚫 Anti-Patterns to Avoid

### ❌ BAD: Creating custom styles
```typescript
// DON'T DO THIS
static styles = css`
  .usa-button {
    background-color: blue; /* NO! */
    padding: 10px; /* NO! */
  }
`;
```

### ❌ BAD: Complex base classes
```typescript
// DON'T DO THIS
export class USWDSBaseComponent extends LitElement {
  // Unnecessary abstraction
}

export class MyComponent extends USWDSBaseComponent {
  // Too complex
}
```

### ❌ BAD: Shadow DOM
```typescript
// DON'T DO THIS
// Just use light DOM - no createRenderRoot override
```

### ✅ GOOD: Direct USWDS classes
```typescript
// DO THIS
private updateClasses() {
  this.className = 'usa-button usa-button--primary';
}
```

## 📋 Checklist for Every Component

Before considering a component complete:

- [ ] Uses official USWDS CSS classes only
- [ ] Imports `../../styles/styles.css`
- [ ] Extends `LitElement` directly
- [ ] Uses light DOM
- [ ] Has proper ARIA attributes
- [ ] Keyboard navigation works
- [ ] No custom styles (except host display)
- [ ] Minimal code - only what's needed
- [ ] Storybook stories created
- [ ] TypeScript compilation passes

## 🔍 How to Verify You're Doing It Right

1. **Check the button component** (`src/components/button/usa-button.ts`) - it's the reference implementation
2. **Run TypeScript check**: `npm run typecheck`
3. **Build the project**: `npm run build`
4. **Test in Storybook**: `npm run storybook`

## 📖 Key Files to Reference

- `README.md` - Overall project philosophy
- `docs/COMPONENT_DEVELOPMENT_GUIDE.md` - Development patterns
- `docs/COMPONENT_CHECKLIST.md` - Quality checklist
- `src/components/button/usa-button.ts` - Reference implementation
- `scripts/generate-component.js` - Component generator

## 🎓 Philosophy

Remember: This is NOT a framework. It's a thin wrapper that:
- Makes USWDS components work as web components
- Adds minimal behavior (properties, events)
- Uses official USWDS styles without modification
- Maintains maximum compatibility with USWDS updates

**When in doubt**: Keep it simple, use USWDS classes directly, and don't add custom styles.

## 🆘 Common Fixes

### "Styles not applying"
- Check that `../../styles/styles.css` is imported
- Run `npm run uswds:compile`
- Verify light DOM is being used

### "Component not working"
- Compare with button component implementation
- Check that you're extending `LitElement` directly
- Verify USWDS classes are being applied

### "TypeScript errors"
- Run `npm run typecheck` for details
- Check property decorators syntax
- Verify imports are correct

---

**Final Reminder**: The entire point of this project is to be a THIN wrapper around USWDS. Don't make it complicated. Use USWDS classes directly, keep the code minimal, and let USWDS do the heavy lifting.