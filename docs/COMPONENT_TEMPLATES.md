# Component Templates

This document contains reusable templates for creating USWDS web components.

## Component Template

```typescript
import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { USWDSBaseComponent } from '../../utils/base-component.js';
import '../../styles/styles.css';

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
      const { initializeUSWDSComponent } = await import('../../utils/uswds-loader.js');

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
import '../src/components/component/usa-component.ts';
import type { USAComponent } from '../src/components/component/usa-component.js';
import { testComponentAccessibility, USWDS_A11Y_CONFIG } from '../__tests__/accessibility-utils.js';

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
npm run generate:component -- --name=my-component
npm run generate:component -- --interactive
```

The generator creates:
- Component TypeScript file with USWDS patterns
- Unit test file with accessibility tests
- Storybook story file
- Component README with documentation
- All required boilerplate following best practices
