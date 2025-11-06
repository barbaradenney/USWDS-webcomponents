# PATTERNS_GUIDE.md

Comprehensive guide to USWDS patterns in the web components library.

## Table of Contents

1. [Overview](#overview)
2. [Patterns vs Components](#patterns-vs-components)
3. [Official USWDS Patterns](#official-uswds-patterns)
4. [Pattern Architecture](#pattern-architecture)
5. [Pattern Development Guidelines](#pattern-development-guidelines)
6. [Testing Patterns](#testing-patterns)
7. [Pattern Composition Best Practices](#pattern-composition-best-practices)

## Overview

**Patterns** are higher-level user workflows that orchestrate multiple USWDS web components to solve common user tasks. They sit above components but below full page templates in the design system hierarchy.

### Design System Hierarchy

```
Templates (Full Pages)
    ↓ uses
Patterns (Multi-component Workflows)
    ↓ uses
Components (Atomic UI Elements)
    ↓ uses
Core (Utilities, CSS, Base Classes)
```

## Patterns vs Components

### Components
- **Atomic**: Single-purpose UI elements
- **Reusable**: Used across multiple contexts
- **Stateless** (mostly): Minimal internal state
- **Examples**: Button, Input, Card, Alert

### Patterns
- **Workflows**: Multi-step user tasks
- **Stateful**: Manage workflow state
- **Orchestration**: Coordinate multiple components
- **Context-specific**: Solve specific user needs
- **Examples**: Language Selection, Complex Form, User Profile

### Key Differences

| Aspect | Components | Patterns |
|--------|-----------|----------|
| Purpose | Atomic UI element | Multi-component workflow |
| Scope | Single interaction | Complete user task |
| State | Minimal | Workflow state management |
| Dependencies | Few or none | Multiple components |
| Reusability | High (across patterns) | Medium (specific use cases) |
| Complexity | Low-Medium | Medium-High |

## Official USWDS Patterns

The USWDS design system defines **3 official patterns**:

### 1. Language Selection Pattern
**Purpose**: Help users select their preferred language

**Components Used**:
- `usa-language-selector` (navigation)
- Links and buttons (actions)

**Use Cases**:
- Multilingual websites
- Government services
- International applications

**USWDS Reference**: https://designsystem.digital.gov/patterns/select-a-language/

### 2. Complex Form Pattern
**Purpose**: Guide users through multi-step form submissions

**Components Used**:
- Form inputs (forms)
- Buttons (actions)
- Progress indicators (layout)
- Validation messages (feedback)

**Use Cases**:
- Multi-step applications
- Registration workflows
- Data collection forms

**USWDS Reference**: https://designsystem.digital.gov/patterns/complete-a-complex-form/

### 3. User Profile Pattern
**Purpose**: Create and manage user profiles

**Components Used**:
- Form inputs (forms)
- File upload (forms)
- Buttons (actions)
- Alerts (feedback)

**Sub-patterns**:
- Enter an address
- Enter an email address
- Enter a phone number
- Enter a social security number
- Enter a name
- Enter a date of birth
- Upload a file
- Create a username and password
- Confirm an action

**USWDS Reference**: https://designsystem.digital.gov/patterns/create-a-user-profile/

## Pattern Architecture

### Core Principles

#### 1. Thin Orchestration Layer
Patterns coordinate existing components without reimplementing functionality.

**Good Example**:
```typescript
import { USAButton } from '@uswds-wc/actions';
import { USATextInput } from '@uswds-wc/forms';

@customElement('usa-language-selector-pattern')
export class USALanguageSelectorPattern extends LitElement {
  render() {
    return html`
      <usa-language-selector
        @language-change="${this.handleLanguageChange}"
      ></usa-language-selector>
    `;
  }
}
```

**Bad Example**:
```typescript
// DON'T: Reimplementing component functionality
render() {
  return html`
    <div class="usa-language-selector">
      <button class="usa-button">English</button>
    </div>
  `;
}
```

#### 2. Component Composition
Use actual web components via imports, not inline HTML.

**Good Example**:
```typescript
import '../../../uswds-wc-actions/src/components/button/index.js';
import '../../../uswds-wc-forms/src/components/text-input/index.js';

render() {
  return html`
    <usa-text-input
      label="Email"
      @input="${this.handleEmailInput}"
    ></usa-text-input>
    <usa-button @click="${this.handleSubmit}">Submit</usa-button>
  `;
}
```

**Bad Example**:
```typescript
// DON'T: Inline HTML duplication
render() {
  return html`
    <input type="text" class="usa-input" />
    <button class="usa-button">Submit</button>
  `;
}
```

#### 3. State Management
Patterns manage workflow state and coordinate component interactions.

```typescript
@customElement('usa-complex-form-pattern')
export class USAComplexFormPattern extends LitElement {
  @state() currentStep = 1;
  @state() formData = {};

  handleNext() {
    this.currentStep++;
  }

  handleBack() {
    this.currentStep--;
  }

  render() {
    return html`
      <usa-step-indicator current="${this.currentStep}">
      </usa-step-indicator>

      ${this.currentStep === 1 ? this.renderStep1() : ''}
      ${this.currentStep === 2 ? this.renderStep2() : ''}

      <usa-button-group>
        ${this.currentStep > 1 ? html`
          <usa-button @click="${this.handleBack}" secondary>
            Back
          </usa-button>
        ` : ''}
        <usa-button @click="${this.handleNext}">Next</usa-button>
      </usa-button-group>
    `;
  }
}
```

#### 4. Accessibility First
Patterns ensure proper ARIA relationships and keyboard navigation.

```typescript
render() {
  return html`
    <section
      aria-labelledby="pattern-heading"
      role="region"
    >
      <h2 id="pattern-heading">Complete Your Profile</h2>

      <usa-form
        aria-label="User profile form"
        @submit="${this.handleSubmit}"
      >
        <!-- Form steps -->
      </usa-form>
    </section>
  `;
}
```

## Pattern Development Guidelines

### 1. Directory Structure

Each pattern follows this structure:

```
packages/uswds-wc-patterns/src/patterns/[pattern-name]/
├── usa-[pattern-name]-pattern.ts       # Pattern implementation
├── usa-[pattern-name]-pattern.stories.ts   # Storybook stories
├── usa-[pattern-name]-pattern.test.ts      # Unit tests
├── usa-[pattern-name]-pattern.cy.ts        # E2E tests (optional)
├── README.mdx                              # Documentation
└── index.ts                                # Exports
```

### 2. Naming Conventions

- **File name**: `usa-[pattern-name]-pattern.ts`
- **Class name**: `USA[PatternName]Pattern`
- **Custom element**: `usa-[pattern-name]-pattern`
- **Examples**:
  - `usa-language-selector-pattern.ts`
  - `USALanguageSelectorPattern`
  - `<usa-language-selector-pattern>`

### 3. Pattern Template

```typescript
import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import '@uswds-wc/core/styles.css';

// Import required components
import '@uswds-wc/actions';
import '@uswds-wc/forms';

/**
 * USA[PatternName]Pattern
 *
 * [Pattern description from USWDS documentation]
 *
 * @element usa-[pattern-name]-pattern
 *
 * @fires {CustomEvent} pattern-complete - Fired when pattern workflow completes
 * @fires {CustomEvent} pattern-cancel - Fired when user cancels workflow
 *
 * @cssprop --pattern-max-width - Maximum width of pattern container
 *
 * @example
 * ```html
 * <usa-[pattern-name]-pattern></usa-[pattern-name]-pattern>
 * ```
 */
@customElement('usa-[pattern-name]-pattern')
export class USA[PatternName]Pattern extends LitElement {
  /**
   * Pattern state properties
   */
  @state() private currentStep = 1;

  /**
   * Public API properties
   */
  @property({ type: Boolean }) disabled = false;

  /**
   * Lifecycle: Render pattern UI
   */
  render() {
    return html`
      <!-- Pattern markup using USWDS components -->
    `;
  }

  /**
   * Event handlers
   */
  private handleNext() {
    // Handle workflow progression
  }

  /**
   * Helper methods
   */
  private isStepValid(): boolean {
    // Validation logic
    return true;
  }
}
```

### 4. Documentation Requirements

Each pattern must include:

1. **README.mdx**:
   - USWDS pattern link
   - When to use / When not to use
   - Component dependencies
   - Usage examples
   - Accessibility considerations

2. **Storybook Stories**:
   - Default story (happy path)
   - Stories for each workflow state
   - Interactive controls for testing
   - Documentation of properties/events

3. **Tests**:
   - Unit tests for state management
   - E2E tests for complete workflows
   - Accessibility validation
   - Component integration tests

## Testing Patterns

### Unit Testing Strategy

Focus on workflow logic and state management:

```typescript
import { expect, describe, it } from 'vitest';
import { fixture, html } from '@uswds-wc/test-utils';
import './usa-complex-form-pattern.js';

describe('usa-complex-form-pattern', () => {
  it('initializes at step 1', async () => {
    const el = await fixture(html`
      <usa-complex-form-pattern></usa-complex-form-pattern>
    `);

    expect(el.currentStep).toBe(1);
  });

  it('progresses to next step when valid', async () => {
    const el = await fixture(html`
      <usa-complex-form-pattern></usa-complex-form-pattern>
    `);

    el.formData = { name: 'John Doe' };
    await el.updateComplete;

    const nextButton = el.shadowRoot.querySelector('usa-button');
    nextButton.click();
    await el.updateComplete;

    expect(el.currentStep).toBe(2);
  });

  it('emits pattern-complete event when finished', async () => {
    const el = await fixture(html`
      <usa-complex-form-pattern></usa-complex-form-pattern>
    `);

    let eventFired = false;
    el.addEventListener('pattern-complete', () => {
      eventFired = true;
    });

    // Complete all steps
    el.currentStep = 3;
    el.handleComplete();

    expect(eventFired).toBe(true);
  });
});
```

### E2E Testing Strategy

Test complete user workflows:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Language Selection Pattern', () => {
  test('completes language selection workflow', async ({ page }) => {
    await page.goto('/patterns/language-selection');

    // Select language
    await page.click('usa-language-selector');
    await page.click('[lang="es"]');

    // Verify language changed
    const currentLanguage = await page.getAttribute(
      'html',
      'lang'
    );
    expect(currentLanguage).toBe('es');
  });
});
```

### Accessibility Testing

Ensure patterns are accessible:

```typescript
import { expect, test } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('Pattern Accessibility', () => {
  test('pattern has no accessibility violations', async ({ page }) => {
    await page.goto('/patterns/language-selection');
    await injectAxe(page);
    await checkA11y(page);
  });

  test('keyboard navigation works', async ({ page }) => {
    await page.goto('/patterns/language-selection');

    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Activate with keyboard
    await page.keyboard.press('Enter');

    // Verify action completed
    const result = await page.evaluate(() => {
      return document.activeElement.textContent;
    });
    expect(result).toBeTruthy();
  });
});
```

## Pattern Composition Best Practices

### 1. Use Package Imports

Import components from their packages:

```typescript
import '@uswds-wc/actions'; // Imports all action components
import '@uswds-wc/forms';   // Imports all form components

// Or import specific components:
import { USAButton } from '@uswds-wc/actions';
import { USATextInput } from '@uswds-wc/forms';
```

### 2. Leverage Component Events

Use component events for coordination:

```typescript
render() {
  return html`
    <usa-text-input
      @input="${this.handleInput}"
      @blur="${this.handleBlur}"
    ></usa-text-input>

    <usa-button
      @click="${this.handleSubmit}"
      ?disabled="${!this.isValid}"
    >
      Submit
    </usa-button>
  `;
}
```

### 3. Pass Data Through Properties

Use component properties for configuration:

```typescript
render() {
  return html`
    <usa-alert
      status="${this.alertStatus}"
      heading="${this.alertHeading}"
    >
      ${this.alertMessage}
    </usa-alert>
  `;
}
```

### 4. Maintain Single Source of Truth

Patterns manage state, components render it:

```typescript
@state() private formData = {
  email: '',
  name: '',
  phone: ''
};

private handleEmailChange(e: CustomEvent) {
  this.formData = {
    ...this.formData,
    email: e.detail.value
  };
}

render() {
  return html`
    <usa-text-input
      label="Email"
      value="${this.formData.email}"
      @input="${this.handleEmailChange}"
    ></usa-text-input>
  `;
}
```

### 5. Document Component Dependencies

In README.mdx, list all component dependencies:

```markdown
## Component Dependencies

This pattern uses the following USWDS web components:

- `@uswds-wc/actions`:
  - `usa-button`
  - `usa-button-group`
- `@uswds-wc/forms`:
  - `usa-text-input`
  - `usa-select`
  - `usa-checkbox`
- `@uswds-wc/feedback`:
  - `usa-alert`
- `@uswds-wc/layout`:
  - `usa-step-indicator`
```

## Pattern Workflow Examples

### Language Selection Pattern

```typescript
@customElement('usa-language-selector-pattern')
export class USALanguageSelectorPattern extends LitElement {
  @property({ type: String }) currentLanguage = 'en';
  @property({ type: Array }) availableLanguages = ['en', 'es', 'fr'];

  render() {
    return html`
      <usa-language-selector
        .languages="${this.availableLanguages}"
        .current="${this.currentLanguage}"
        @language-change="${this.handleLanguageChange}"
      ></usa-language-selector>
    `;
  }

  private handleLanguageChange(e: CustomEvent) {
    this.currentLanguage = e.detail.language;

    // Update document language
    document.documentElement.lang = this.currentLanguage;

    // Emit pattern completion event
    this.dispatchEvent(new CustomEvent('pattern-complete', {
      detail: { language: this.currentLanguage }
    }));
  }
}
```

### Complex Form Pattern

```typescript
@customElement('usa-complex-form-pattern')
export class USAComplexFormPattern extends LitElement {
  @state() private currentStep = 1;
  @state() private formData = {};
  @property({ type: Number }) totalSteps = 3;

  render() {
    return html`
      <usa-step-indicator
        .current="${this.currentStep}"
        .total="${this.totalSteps}"
      ></usa-step-indicator>

      ${this.renderCurrentStep()}

      <usa-button-group>
        ${this.currentStep > 1 ? html`
          <usa-button @click="${this.handleBack}" secondary>
            Back
          </usa-button>
        ` : ''}

        <usa-button
          @click="${this.handleNext}"
          ?disabled="${!this.isStepValid()}"
        >
          ${this.currentStep === this.totalSteps ? 'Submit' : 'Next'}
        </usa-button>
      </usa-button-group>
    `;
  }

  private renderCurrentStep() {
    switch (this.currentStep) {
      case 1:
        return this.renderPersonalInfo();
      case 2:
        return this.renderContactInfo();
      case 3:
        return this.renderReview();
      default:
        return html``;
    }
  }

  private handleNext() {
    if (this.currentStep === this.totalSteps) {
      this.handleSubmit();
    } else {
      this.currentStep++;
    }
  }

  private handleBack() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  private async handleSubmit() {
    // Submit form data
    const response = await this.submitData(this.formData);

    // Emit completion event
    this.dispatchEvent(new CustomEvent('pattern-complete', {
      detail: { formData: this.formData, response }
    }));
  }
}
```

## Summary

**Patterns orchestrate components to solve complete user workflows.**

### Key Takeaways

1. **Patterns ≠ Components**: Patterns are higher-level workflows
2. **Thin Orchestration**: Coordinate, don't reimplement
3. **Component Composition**: Use actual web components
4. **State Management**: Patterns manage workflow state
5. **Accessibility First**: Ensure proper ARIA and keyboard navigation
6. **Test Workflows**: Unit test logic, E2E test workflows
7. **Document Thoroughly**: USWDS links, usage, dependencies

### Next Steps

1. Review [Official USWDS Patterns](https://designsystem.digital.gov/patterns/)
2. Explore `packages/uswds-wc-patterns/src/patterns/` for examples
3. Read component READMEs for composition guidance
4. Follow the pattern template for new patterns
5. Write comprehensive tests for workflows

---

**Questions?** Check the [USWDS Design System](https://designsystem.digital.gov/) or component READMEs in `packages/uswds-wc-[category]/src/components/`.
