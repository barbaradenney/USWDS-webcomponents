# Component Templates

This document contains reusable templates for creating USWDS web components in the monorepo structure.

## Monorepo Context

All components are located in category-based packages under `packages/`:

```
packages/
├── uswds-wc-actions/           # Buttons, links, search
├── uswds-wc-forms/             # Form controls
├── uswds-wc-navigation/        # Headers, menus, breadcrumbs
├── uswds-wc-data-display/      # Tables, cards, lists, icons
├── uswds-wc-feedback/          # Alerts, modals, tooltips
├── uswds-wc-layout/            # Content structure
├── uswds-wc-structure/         # Page sections (accordion)
└── uswds-wc-core/              # Shared base classes and utilities
```

**Component File Location Example:**
```
packages/uswds-wc-forms/src/components/text-input/
├── usa-text-input.ts              # Component implementation
├── usa-text-input.test.ts         # Unit tests
├── usa-text-input.layout.test.ts  # Layout tests
├── usa-text-input.stories.ts      # Storybook stories
├── README.mdx                      # Component documentation
└── index.ts                        # Barrel export
```

**Important:** These templates use `@uswds-wc/core` imports which work correctly when used inside a package (e.g., `packages/uswds-wc-forms/`). The templates are designed for co-located files within a component directory.

## Component Template

```typescript
import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { USWDSBaseComponent } from '@uswds-wc/core';
import '@uswds-wc/core/styles.css';

/**
 * USA Component Web Component
 *
 * @element usa-component
 * @see README.mdx - Complete API documentation and usage examples
 */
@customElement('usa-component')
export class USAComponent extends USWDSBaseComponent {
  static override styles = css`:host { display: block; }`;

  @property({ type: String }) variant = 'primary';
  @property({ type: Boolean, reflect: true }) disabled = false;

  // Use light DOM for USWDS compatibility
  protected override createRenderRoot(): HTMLElement {
    return this as any;
  }

  override connectedCallback() {
    super.connectedCallback();

    // Set web component managed flag to prevent USWDS auto-initialization conflicts
    this.setAttribute('data-web-component-managed', 'true');
  }

  override firstUpdated(changedProperties: Map<string, any>) {
    // ARCHITECTURE: Script Tag Pattern
    // USWDS is loaded globally via script tag in .storybook/preview-head.html
    // Components just render HTML - USWDS enhances automatically via window.USWDS

    super.firstUpdated(changedProperties);
    this.initializeUSWDSComponent();
  }

  private async initializeUSWDSComponent() {
    try {
      // Use standardized USWDS loader utility for consistency
      const { initializeUSWDSComponent } = await import('@uswds-wc/core');

      await this.updateComplete;
      const element = this.querySelector('.usa-component');

      if (!element) {
        console.warn('Component element not found');
        return;
      }

      // Let USWDS handle the component using standard loader
      await initializeUSWDSComponent(element, 'component');
      console.log('✅ USWDS component initialized successfully');
    } catch (error) {
      console.warn('🔧 Component: USWDS integration failed:', error);
    }
  }

  override render() {
    return html`
      <div class="usa-component">
        <slot></slot>
      </div>
    `;
  }
}
```

## Unit Test Template

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import './usa-component.ts';
import type { USAComponent } from './usa-component.js';
import { testComponentAccessibility, USWDS_A11Y_CONFIG } from '@uswds-wc/core/testing';

describe('USAComponent', () => {
  let element: USAComponent;

  beforeEach(() => {
    element = document.createElement('usa-component') as USAComponent;
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should have default properties', () => {
    expect(element.variant).toBe('primary');
    expect(element.disabled).toBe(false);
  });

  it('should pass accessibility tests', async () => {
    await element.updateComplete;
    await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
  });
});
```

## Storybook Story Template

```typescript
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './index.ts';
import type { USAComponent } from './usa-component.js';

const meta: Meta<USAComponent> = {
  title: 'Components/ComponentName',
  component: 'usa-component',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Brief component description with usage guidelines.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'accent'],
      description: 'Component variant',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the component',
    },
  },
};

export default meta;
type Story = StoryObj<USAComponent>;

export const Default: Story = {
  args: {
    variant: 'primary',
    disabled: false,
  },
  render: (args) => html`
    <usa-component
      .variant=${args.variant}
      ?disabled=${args.disabled}
    >
      Component content
    </usa-component>
  `,
};
```

## USWDS-Mirrored Behavior Template

For components requiring custom behavior mirroring USWDS:

```typescript
/**
 * USWDS [Component] Behavior
 *
 * Mirrors official USWDS JavaScript behavior exactly
 *
 * @uswds-source https://github.com/uswds/uswds/blob/develop/packages/usa-[component]/src/index.js
 * @uswds-version 3.8.0
 * @last-synced 2025-10-18
 * @sync-status ✅ UP TO DATE
 *
 * CRITICAL: This file replicates USWDS source code to maintain 100% behavior parity.
 * DO NOT add custom logic. ALL changes must come from USWDS source updates.
 */

// Copy USWDS constants, selectors, and functions EXACTLY from source
const PREFIX = 'usa';
const COMPONENT = `.${PREFIX}-component`;

/**
 * [Function name]
 *
 * SOURCE: [USWDS file path] (Lines X-Y)
 *
 * @param {type} param - Description
 */
export function mainFunction(param: Type): ReturnType {
  // EXACT USWDS LOGIC - DO NOT MODIFY
  // Copy implementation line-by-line from USWDS source
}

/**
 * Initialize component behavior
 *
 * SOURCE: usa-[component]/src/index.js (Lines X-Y)
 */
export function initializeComponent(root: HTMLElement | Document = document): () => void {
  // Event delegation pattern from USWDS
  const handleEvent = (event: Event) => {
    // USWDS event handling logic
  };

  root.addEventListener('click', handleEvent);

  // Return cleanup function
  return () => {
    root.removeEventListener('click', handleEvent);
  };
}
```

## Component README Template

```markdown
# USA Component

> USWDS [Component] web component implementation

## Overview

[Brief description of the component and its purpose]

## USWDS Documentation

- [Component Page](https://designsystem.digital.gov/components/component/)
- [Guidance](https://designsystem.digital.gov/components/component/#guidance)
- [Accessibility](https://designsystem.digital.gov/components/component/#accessibility)

## Usage

\`\`\`html
<usa-component variant="primary">
  Component content
</usa-component>
\`\`\`

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| variant | string | 'primary' | Component variant |
| disabled | boolean | false | Disable the component |

## Events

| Event | Description | Detail |
|-------|-------------|--------|
| component-change | Fired when component state changes | { value: string } |

## Accessibility

- Keyboard navigation: [describe keyboard interactions]
- Screen reader support: [describe ARIA attributes]
- Focus management: [describe focus behavior]

## Examples

See [Storybook](http://localhost:6006) for interactive examples.
```

## Using the Component Generator

Instead of manually creating files, use the automated generator:

```bash
# Interactive mode (recommended)
pnpm run generate:component -- --interactive

# Or specify component name
pnpm run generate:component -- --name=my-component
```

The generator will:
1. **Prompt for package selection** - Choose which category package (forms, actions, etc.)
2. **Create component files** in the correct package location
3. **Generate all boilerplate** following monorepo patterns:
   - Component TypeScript file with `@uswds-wc/core` imports
   - Unit test file with accessibility tests
   - Layout test file with DOM structure validation
   - Storybook story file
   - Component README.mdx with documentation
   - Barrel export in `index.ts`

**Example workflow:**
```bash
# 1. Generate new form component
pnpm run generate:component -- --interactive
# Select: @uswds-wc/forms
# Name: text-input

# 2. Build the package
pnpm --filter @uswds-wc/forms build

# 3. Test the package
pnpm --filter @uswds-wc/forms test

# 4. View in Storybook
pnpm run storybook
```

All generated code follows monorepo best practices and uses correct `@uswds-wc/core` imports.
