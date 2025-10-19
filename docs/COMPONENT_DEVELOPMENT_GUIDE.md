# USWDS Web Components Development Guide

This guide provides instructions for developing simple, maintainable USWDS web components using the official USWDS 3.0 design system with minimal custom code.

## 🏆 **100% USWDS Compliance Achieved**

**This library maintains perfect USWDS compliance with zero custom CSS.** All 46 components use only official USWDS classes and follow USWDS specifications exactly.

### ✅ **Compliance Standards**

- **Single CSS Import**: All components use `import '../../styles/styles.css'`
- **No Custom CSS**: Only essential `:host` display styles permitted
- **Official Classes Only**: Direct application of USWDS classes via `updateClasses()`
- **Light DOM Only**: Maximum USWDS compatibility
- **USWDS Structure**: HTML structure matches USWDS specifications exactly

### 🤖 **Automated Compliance Validation**

Every component is automatically validated for USWDS compliance:

```bash
# Validate any component during development
npm run uswds:validate-alignment src/components/your-component/usa-your-component.ts

# Validate all critical components
npm run uswds:validate-critical
```

**Git hooks automatically prevent non-compliant commits**, ensuring 100% USWDS alignment is maintained. See `docs/USWDS_COMPLIANCE_AUTOMATION.md` for complete automation system details.

## Philosophy

Our approach prioritizes:

- **Perfect USWDS Compliance**: Use official USWDS CSS without any modifications
- **Zero Custom Styling**: Thin web component wrappers with no custom CSS
- **Automatic USWDS Updates**: Recompile CSS to get latest design system
- **Simplified Maintenance**: No custom styles to maintain or debug

## Quick Start

### Generate a New Component

```bash
# Generate different component types
npm run generate:component text-input input
npm run generate:component my-button button
npm run generate:component status-alert alert
```

### Update USWDS Styles

```bash
# Recompile USWDS CSS when the design system updates
npm run uswds:compile
```

## Project Structure

### USWDS Integration

```
gulpfile.cjs              # Official USWDS compile configuration
sass/uswds/               # USWDS theme and settings (created by init)
src/styles/styles.css     # Compiled USWDS CSS (auto-generated)
assets/uswds/             # USWDS fonts, images, JS (auto-generated)
```

### Components

```
src/components/[name]/
├── usa-[name].ts         # Web component implementation
├── usa-[name].stories.ts # Storybook stories
├── usa-[name].test.ts    # Component tests
└── index.ts             # Export file

stories/
└── [Name].stories.ts    # Storybook documentation
```

## Component Architecture

### Documentation Requirements

**All components must include comprehensive JSDoc documentation linking to USWDS references and local documentation.**

Follow the USWDS Documentation Standards (see `docs/USWDS_JAVASCRIPT_REFERENCES.md`):

```typescript
/**
 * USA [Component] Web Component
 *
 * [Brief description of component functionality and behavior]
 *
 * @element usa-[component]
 * @fires [event-name] - [Event description]
 *
 * @see README.mdx - Complete API documentation, usage examples, and implementation notes
 * @see CHANGELOG.mdx - Component version history and breaking changes
 * @see TESTING.mdx - Testing documentation and coverage reports
 *
 * @uswds-js-reference https://github.com/uswds/uswds/tree/develop/packages/usa-[component]/src/index.js
 * @uswds-css-reference https://github.com/uswds/uswds/tree/develop/packages/usa-[component]/src/styles/_usa-[component].scss
 * @uswds-docs https://designsystem.digital.gov/components/[component]/
 * @uswds-guidance https://designsystem.digital.gov/components/[component]/#guidance
 * @uswds-accessibility https://designsystem.digital.gov/components/[component]/#accessibility
 */
```

### Basic Component Template

```typescript
import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { USWDSBaseComponent } from '../../utils/base-component.js';

// Import official USWDS compiled CSS
import '../../styles/styles.css';

/**
 * USA My Component Web Component
 *
 * Brief description of the component functionality.
 *
 * @element usa-my-component
 * @fires click - Dispatched when component is clicked
 *
 * @see README.mdx - Complete API documentation, usage examples, and implementation notes
 * @see CHANGELOG.mdx - Component version history and breaking changes
 * @see TESTING.mdx - Testing documentation and coverage reports
 *
 * @uswds-js-reference https://github.com/uswds/uswds/tree/develop/packages/usa-my-component/src/index.js
 * @uswds-css-reference https://github.com/uswds/uswds/tree/develop/packages/usa-my-component/src/styles/_usa-my-component.scss
 * @uswds-docs https://designsystem.digital.gov/components/my-component/
 * @uswds-guidance https://designsystem.digital.gov/components/my-component/#guidance
 * @uswds-accessibility https://designsystem.digital.gov/components/my-component/#accessibility
 */
@customElement('usa-my-component')
export class USAMyComponent extends USWDSBaseComponent {
  static styles = css`
    :host {
      display: inline-block;
    }
  `;

  @property({ type: String })
  variant: 'primary' | 'secondary' = 'primary';

  @property({ type: Boolean, reflect: true })
  disabled = false;

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'button');
    this.setupEventHandlers();
    this.debug('Component connected', { variant: this.variant });
  }

  updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);
    this.updateClasses();
    this.updateAttributes();
  }

  private setupEventHandlers() {
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

    this.dispatchEvent(
      new CustomEvent('click', {
        bubbles: true,
        cancelable: true,
      })
    );
  }

  private updateClasses() {
    // Apply USWDS classes directly - let USWDS handle all styling
    const classes = [
      'usa-my-component',
      this.variant !== 'primary' ? `usa-my-component--${this.variant}` : '',
    ]
      .filter(Boolean)
      .join(' ');

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

## Key Principles

### 1. Light DOM Only

Always use light DOM to ensure USWDS CSS applies correctly:

```typescript
protected createRenderRoot(): HTMLElement {
  return this as any;
}
```

### 2. Direct USWDS Class Application

Apply USWDS classes directly in `updateClasses()`:

```typescript
private updateClasses() {
  const classes = [
    'usa-button',
    this.variant !== 'primary' ? `usa-button--${this.variant}` : '',
    this.size === 'small' ? 'usa-button--small' : '',
    this.size === 'big' ? 'usa-button--big' : ''
  ].filter(Boolean).join(' ');

  this.className = classes;
}
```

### 3. USWDS JavaScript Pattern Integration

Follow official USWDS JavaScript patterns for interactive components. Reference the USWDS source implementation and adapt patterns to web components:

```typescript
// USWDS-style component methods
// Based on: https://github.com/uswds/uswds/blob/develop/packages/usa-component/src/index.js
private getComponentButtons() {
  return Array.from(this.querySelectorAll('.usa-component__button')) as HTMLElement[];
}

private showButton(button: HTMLElement) {
  button.setAttribute('aria-expanded', 'true');
  const contentId = button.getAttribute('aria-controls');
  if (contentId) {
    const content = document.getElementById(contentId);
    if (content) {
      content.removeAttribute('hidden');
    }
  }
}

private hideButton(button: HTMLElement) {
  button.setAttribute('aria-expanded', 'false');
  const contentId = button.getAttribute('aria-controls');
  if (contentId) {
    const content = document.getElementById(contentId);
    if (content) {
      content.setAttribute('hidden', '');
    }
  }
}

private toggle(button: HTMLElement, expanded?: boolean) {
  const isExpanded = button.getAttribute('aria-expanded') === 'true';
  const safeExpanded = expanded !== undefined ? expanded : !isExpanded;

  if (safeExpanded) {
    this.showButton(button);
  } else {
    this.hideButton(button);
  }

  return safeExpanded;
}
```

### 4. Standard Accessibility Patterns

Include basic accessibility without complex abstractions:

```typescript
connectedCallback() {
  super.connectedCallback();
  this.setAttribute('role', 'button');
  this.setAttribute('tabindex', '0');
  this.setupEventHandlers();
}
```

### 5. Minimal Host Styles

Only include essential display styles for web component behavior:

```css
static styles = css`
  :host {
    display: inline-block;  /* or block, or contents */
  }
`;
```

**⚠️ CRITICAL**: Never add custom CSS beyond essential `:host` display styles. All styling must come from official USWDS classes.

## USWDS Integration

### Initial Setup (Done Once)

```bash
npm install @uswds/uswds @uswds/compile --save-dev
npm run uswds:init  # Creates theme files and compiles CSS
```

### Regular Maintenance

```bash
# Update USWDS package
npm update @uswds/uswds

# Recompile CSS with new version
npm run uswds:compile
```

### Customizing USWDS (Optional)

Edit theme files in `sass/uswds/` then recompile:

```bash
# Edit sass/uswds/_uswds-theme.scss for customizations
npm run uswds:compile
```

## Form Integration

For form-associated components, add form behavior:

```typescript
private handleClick() {
  if (this.disabled) return;

  // Handle form integration
  if (this.type === 'submit') {
    const form = this.closest('form');
    if (form) {
      const tempButton = document.createElement('button');
      tempButton.type = 'submit';
      tempButton.style.display = 'none';
      form.appendChild(tempButton);
      tempButton.click();
      form.removeChild(tempButton);
    }
  }

  // Dispatch custom events
  this.dispatchEvent(new CustomEvent('click', {
    bubbles: true,
    cancelable: true
  }));
}
```

## Storybook Documentation

### Required Stories

Each component should include:

1. **Default** - Basic component usage
2. **Disabled** - Disabled state demonstration
3. **All Variants** - Showcase different variants (if applicable)

### Story Structure

```typescript
export const Default: Story = {
  render: (args) => html`
    <usa-my-component variant="${args.variant}" ?disabled="${args.disabled}">
      Component Content
    </usa-my-component>
  `,
};
```

## Testing Approach

### **MANDATORY Testing Requirements**

**All components must include comprehensive tests before being committed.**

### Automated Testing Strategy

```bash
# Run all tests (MUST PASS)
npm run test

# Run tests with coverage
npm run test:coverage

# Interactive test runner
npm run test:ui

# TypeScript compilation (MUST PASS)
npm run typecheck

# Code quality checks (MUST PASS)
npm run lint
```

### Unit Test Structure

Create test files in `__tests__/` directory:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../src/components/my-component/usa-my-component.ts';
import type { USAMyComponent } from '../src/components/my-component/usa-my-component.js';

describe('USAMyComponent', () => {
  let element: USAMyComponent;

  beforeEach(() => {
    element = document.createElement('usa-my-component') as USAMyComponent;
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

    // Trigger event
    element.handleClick();
    expect(eventFired).toBe(true);
  });

  it('should handle accessibility attributes', async () => {
    element.disabled = true;
    await element.updateComplete;

    expect(element.getAttribute('aria-disabled')).toBe('true');
    expect(element.getAttribute('tabindex')).toBe('-1');
  });
});
```

### Testing Requirements

1. **Unit Tests** - Test component logic, properties, events, methods
2. **Integration Tests** - Test component interactions and form behavior
3. **Accessibility Tests** - Verify ARIA attributes and keyboard navigation
4. **Coverage** - Aim for >80% test coverage

### Manual Testing Checklist

- [ ] Component renders with correct USWDS classes
- [ ] All variants display proper USWDS styles
- [ ] Keyboard navigation works (Tab, Space, Enter)
- [ ] Screen reader announces component correctly
- [ ] Disabled state prevents interaction
- [ ] Form integration works (if applicable)
- [ ] Debug mode shows component lifecycle logs

### Debug Testing

Enable debug mode to troubleshoot issues:

```bash
# Add ?debug=true to Storybook URL
# Or run in console:
localStorage.setItem('uswds-debug', 'true');
```

### **Pre-Commit Requirements**

**⚠️ DO NOT COMMIT** if any of these fail:

```bash
npm run test              # All tests must pass
npm run typecheck         # TypeScript must compile
npm run lint             # No linting errors
```

## Available Component Types

### Input Components

- Text inputs, selects, textareas
- Form validation integration
- ARIA form attributes

### Button Components

- Primary, secondary, outline variants
- Small, medium, big sizes
- Form submit/reset integration

### Alert Components

- Info, warning, error, success types
- Dismissible functionality
- Screen reader announcements

## Migration from Complex Systems

If migrating from systems with custom base classes:

1. Remove inheritance chains
2. Apply USWDS classes directly in `updateClasses()`
3. Add only necessary accessibility patterns
4. Use standard LitElement lifecycle methods
5. Test thoroughly with official USWDS CSS

## Troubleshooting

### Styles Not Applying

- Verify `src/styles/styles.css` exists and is imported
- Run `npm run uswds:compile` to regenerate CSS
- Check browser dev tools for applied classes

### TypeScript Errors

- Run `npm run typecheck` to identify issues
- Ensure all properties have correct types
- Verify imports are correct

### Component Not Rendering

- Check custom element registration
- Verify light DOM setup with `createRenderRoot()`
- Ensure TypeScript compilation succeeded

## USWDS Documentation Standards

All components must follow the comprehensive documentation standards established in `docs/USWDS_JAVASCRIPT_REFERENCES.md`:

### Required Documentation

1. **JSDoc Headers**: All components must include comprehensive JSDoc documentation with USWDS references
2. **README.mdx Files**: Complete API documentation with USWDS links and usage examples
3. **CHANGELOG.mdx Files**: Version history and breaking changes tracking
4. **TESTING.mdx Files**: Testing documentation and coverage reports

### USWDS Reference Standards

- **JavaScript References**: Link to official USWDS source implementations
- **CSS References**: Link to USWDS SCSS source files
- **Documentation References**: Link to official design system documentation
- **Guidance References**: Link to USWDS usage guidance
- **Accessibility References**: Link to USWDS accessibility documentation

### Implementation Pattern

When implementing interactive components, always:

1. **Study USWDS Source First**: Read the official JavaScript implementation
2. **Follow USWDS Patterns**: Use proven patterns like `toggle`, `show`, `hide`
3. **Reference Documentation**: Include comprehensive JSDoc with all required links
4. **Maintain Consistency**: Ensure behavior matches official USWDS implementations

This simplified approach ensures your components stay aligned with USWDS updates while maintaining minimal maintenance overhead and comprehensive documentation standards.
