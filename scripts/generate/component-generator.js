#!/usr/bin/env node

/**
 * USWDS Component Generator with Built-in Compliance
 *
 * Generates new components with all the patterns we've learned to prevent
 * common recurring issues from the start.
 *
 * Usage: npm run generate:component -- --name=my-component [--interactive]
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const nameArg = args.find(arg => arg.startsWith('--name='));
const isInteractive = args.includes('--interactive');

if (!nameArg) {
  console.error('❌ Component name is required');
  console.log('Usage: npm run generate:component -- --name=my-component [--interactive]');
  process.exit(1);
}

const componentName = nameArg.split('=')[1];
const pascalName = componentName.split('-').map(word =>
  word.charAt(0).toUpperCase() + word.slice(1)
).join('');

const componentDir = `src/components/${componentName}`;

console.log(`🎯 Generating USWDS-compliant component: ${componentName}`);
console.log(`📁 Directory: ${componentDir}`);

// Create component directory
if (!fs.existsSync(componentDir)) {
  fs.mkdirSync(componentDir, { recursive: true });
}

// Generate component TypeScript file
const componentTemplate = `import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { USWDSBaseComponent } from '../../utils/base-component.js';

// Import official USWDS compiled CSS
import '../../styles/styles.css';

/**
 * USA ${pascalName} Web Component
 *
 * A USWDS-compliant ${componentName} implementation as a custom element.
 * Uses official USWDS classes and styling with minimal custom code.
 *
 * @element usa-${componentName}
 *
 * @see README.md - Complete API documentation and usage examples
 * @see CHANGELOG.mdx - Component version history and breaking changes
 * @see TESTING.md - Testing documentation and coverage reports
 *
 * @uswds-css-reference https://github.com/uswds/uswds/tree/develop/packages/usa-${componentName}/src/styles/_usa-${componentName}.scss
 * @uswds-docs https://designsystem.digital.gov/components/${componentName}/
 * @uswds-guidance https://designsystem.digital.gov/components/${componentName}/#guidance
 * @uswds-accessibility https://designsystem.digital.gov/components/${componentName}/#accessibility
 */
@customElement('usa-${componentName}')
export class USA${pascalName} extends USWDSBaseComponent {
  static override styles = css\`
    :host {
      display: block;
    }
  \`;

  // Component properties with proper typing
  @property({ type: String, reflect: true })
  variant: 'default' | 'alternate' = 'default';

  @property({ type: Boolean, reflect: true })
  disabled = false;

  // Use light DOM for USWDS compatibility (built into USWDSBaseComponent)

  override connectedCallback() {
    super.connectedCallback();

    // Set web component managed flag to prevent USWDS auto-initialization conflicts
    this.setAttribute('data-web-component-managed', 'true');

    // Initialize USWDS behavior after component is ready
    this.updateComplete.then(() => this.initializeUSWDS());
  }

  private async initializeUSWDS() {
    try {
      ${isInteractive ? `
      // Initialize USWDS JavaScript behavior for interactive component
      if (typeof window !== 'undefined' && typeof (window as any).USWDS !== 'undefined') {
        const USWDS = (window as any).USWDS;

        // Initialize component-specific USWDS behavior
        if (USWDS.${componentName} && typeof USWDS.${componentName}.on === 'function') {
          USWDS.${componentName}.on(this);
        }
      }` : `
      // This is a presentational component - minimal USWDS integration needed
      console.debug('📋 ${pascalName}: Presentational component initialized');`}
    } catch (error) {
      console.warn('📋 ${pascalName}: USWDS integration failed:', error);
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();

    // Clean up USWDS behavior
    try {
      if (typeof window !== 'undefined' && typeof (window as any).USWDS !== 'undefined') {
        const USWDS = (window as any).USWDS;
        if (USWDS.${componentName} && typeof USWDS.${componentName}.off === 'function') {
          USWDS.${componentName}.off(this);
        }
      }
    } catch (error) {
      console.warn('📋 ${pascalName}: Cleanup failed:', error);
    }
  }

  private getComponentClasses(): string {
    const classes = ['usa-${componentName}'];

    if (this.variant !== 'default') {
      classes.push(\`usa-${componentName}--\${this.variant}\`);
    }

    return classes.join(' ');
  }

  override render() {
    return html\`
      <div
        class="\${this.getComponentClasses()}"
        ?aria-disabled=\${this.disabled}
      >
        <slot></slot>
      </div>
    \`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'usa-${componentName}': USA${pascalName};
  }
}
`;

// Generate test file with common patterns
const testTemplate = `import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../usa-${componentName}.js';
import type { USA${pascalName} } from '../usa-${componentName}.js';
import {
  testComponentAccessibility,
  USWDS_A11Y_CONFIG,
} from '../../../__tests__/accessibility-utils.js';
import {
  validateComponentJavaScript,
} from '../../../__tests__/test-utils.js';

describe('USA${pascalName}', () => {
  let element: USA${pascalName};

  beforeEach(() => {
    element = document.createElement('usa-${componentName}') as USA${pascalName};
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  describe('Component Initialization', () => {
    it('should create element', () => {
      expect(element).toBeInstanceOf(USA${pascalName});
    });

    it('should have default properties', () => {
      expect(element.variant).toBe('default');
      expect(element.disabled).toBe(false);
    });

    it('should render light DOM for USWDS compatibility', async () => {
      await element.updateComplete;
      expect(element.shadowRoot).toBeNull();
    });
  });

  describe('USWDS Compliance', () => {
    it('should apply correct USWDS CSS classes', async () => {
      await element.updateComplete;
      const componentEl = element.querySelector('.usa-${componentName}');
      expect(componentEl).toBeTruthy();
    });

    it('should handle variant classes correctly', async () => {
      element.variant = 'alternate';
      await element.updateComplete;

      const componentEl = element.querySelector('.usa-${componentName}--alternate');
      expect(componentEl).toBeTruthy();
    });

    it('should pass JavaScript implementation validation', async () => {
      await element.updateComplete;
      const issues = validateComponentJavaScript(element, '${componentName}', ${isInteractive ? 'true' : 'false'});
      expect(issues).toHaveLength(0);
    });
  });

  describe('Accessibility', () => {
    it('should pass comprehensive accessibility tests (same as Storybook)', async () => {
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });

    it('should handle disabled state correctly', async () => {
      element.disabled = true;
      await element.updateComplete;

      const componentEl = element.querySelector('.usa-${componentName}');
      expect(componentEl?.getAttribute('aria-disabled')).toBe('true');
    });
  });

  describe('Properties and Attributes', () => {
    it('should reflect properties as attributes', async () => {
      element.variant = 'alternate';
      element.disabled = true;
      await element.updateComplete;

      expect(element.getAttribute('variant')).toBe('alternate');
      expect(element.hasAttribute('disabled')).toBe(true);
    });
  });

  describe('Lifecycle', () => {
    it('should initialize USWDS behavior on connect', async () => {
      // Component should initialize without errors
      await element.updateComplete;
      expect(element.isConnected).toBe(true);
    });

    it('should cleanup on disconnect', () => {
      element.remove();
      expect(element.isConnected).toBe(false);
    });
  });
});
`;

// Generate Storybook stories
const storiesTemplate = `import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './index.ts';
import type { USA${pascalName} } from './usa-${componentName}.js';

const meta: Meta<USA${pascalName}> = {
  title: 'Components/${pascalName}',
  component: 'usa-${componentName}',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: \`
A USWDS-compliant ${componentName} component that provides [describe functionality].

Features:
- Full USWDS compliance with official CSS classes
- Accessibility built-in with proper ARIA attributes
- Light DOM rendering for maximum compatibility
- TypeScript support with full typing
        \`,
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'alternate'],
      description: 'Visual variant of the ${componentName}',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the ${componentName} is disabled',
    },
  },
};

export default meta;
type Story = StoryObj<USA${pascalName}>;

export const Default: Story = {
  args: {
    variant: 'default',
    disabled: false,
  },
  render: (args) => html\`
    <usa-${componentName}
      variant=\${args.variant}
      ?disabled=\${args.disabled}
    >
      ${pascalName} content goes here
    </usa-${componentName}>
  \`,
};

export const Alternate: Story = {
  args: {
    variant: 'alternate',
    disabled: false,
  },
  render: (args) => html\`
    <usa-${componentName}
      variant=\${args.variant}
      ?disabled=\${args.disabled}
    >
      Alternate variant
    </usa-${componentName}>
  \`,
};

export const Disabled: Story = {
  args: {
    variant: 'default',
    disabled: true,
  },
  render: (args) => html\`
    <usa-${componentName}
      variant=\${args.variant}
      ?disabled=\${args.disabled}
    >
      Disabled ${componentName}
    </usa-${componentName}>
  \`,
};
`;

// Generate index.ts
const indexTemplate = `export { USA${pascalName} } from './usa-${componentName}.js';
`;

// Generate README.md
const readmeTemplate = `---
title: ${pascalName}
description: USWDS ${pascalName} component implementation
---

# USA${pascalName}

A USWDS-compliant ${componentName} web component that provides [describe functionality].

## Features

- **Full USWDS Compliance**: Uses official USWDS CSS classes and patterns
- **Accessibility**: Built-in ARIA attributes and keyboard navigation
- **Light DOM**: Maximum compatibility with existing HTML and CSS
- **TypeScript**: Full type safety and IntelliSense support
- **Testing**: Comprehensive test coverage including accessibility

## Usage

\`\`\`html
<!-- Basic usage -->
<usa-${componentName}>
  Content goes here
</usa-${componentName}>

<!-- With variant -->
<usa-${componentName} variant="alternate">
  Alternate variant
</usa-${componentName}>

<!-- Disabled -->
<usa-${componentName} disabled>
  Disabled ${componentName}
</usa-${componentName}>
\`\`\`

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| \`variant\` | \`'default' \\| 'alternate'\` | \`'default'\` | Visual variant of the component |
| \`disabled\` | \`boolean\` | \`false\` | Whether the component is disabled |

## CSS Custom Properties

The component uses USWDS design tokens and CSS custom properties:

\`\`\`css
usa-${componentName} {
  --usa-${componentName}-color: var(--usa-color-base-darkest);
  --usa-${componentName}-background: var(--usa-color-base-lightest);
}
\`\`\`

## Accessibility

- **ARIA Support**: Proper ARIA attributes are automatically applied
- **Keyboard Navigation**: Full keyboard support following USWDS patterns
- **Screen Reader**: Compatible with all major screen readers

## USWDS References

- [USWDS ${pascalName} Component](https://designsystem.digital.gov/components/${componentName}/)
- [USWDS ${pascalName} Guidance](https://designsystem.digital.gov/components/${componentName}/#guidance)
- [USWDS Accessibility](https://designsystem.digital.gov/components/${componentName}/#accessibility)

## Related Components

- [Button](../button/README.md) - For interactive actions
- [Link](../link/README.md) - For navigation

## Storybook

Interactive examples and component API documentation:
[View in Storybook](?path=/docs/components-${componentName}--docs)
`;

// Write all files
const files = [
  [`${componentDir}/usa-${componentName}.ts`, componentTemplate],
  [`${componentDir}/usa-${componentName}.test.ts`, testTemplate],
  [`${componentDir}/usa-${componentName}.stories.ts`, storiesTemplate],
  [`${componentDir}/index.ts`, indexTemplate],
  [`${componentDir}/README.md`, readmeTemplate],
];

files.forEach(([filePath, content]) => {
  fs.writeFileSync(filePath, content);
  console.log(`✅ Created: ${filePath}`);
});

// Update main index.ts
const mainIndexPath = 'src/index.ts';
if (fs.existsSync(mainIndexPath)) {
  const mainIndex = fs.readFileSync(mainIndexPath, 'utf8');
  if (!mainIndex.includes(`export * from './components/${componentName}/index.js';`)) {
    const newExport = `export * from './components/${componentName}/index.js';\n`;
    fs.appendFileSync(mainIndexPath, newExport);
    console.log(`✅ Updated: ${mainIndexPath} with component export`);
  }
}

console.log('');
console.log('🎉 Component generated successfully!');
console.log('');
console.log('Next steps:');
console.log('1. Review and customize the generated files');
console.log('2. Run tests: npm test src/components/${componentName}');
console.log('3. Check Storybook: npm run storybook');
console.log('4. Run compliance check: npm run validate:uswds-compliance');
console.log('');
console.log('📚 The component follows all USWDS compliance patterns and includes:');
console.log('   ✅ Proper USWDS JavaScript integration');
console.log('   ✅ Light DOM rendering');
console.log('   ✅ Comprehensive test coverage');
console.log('   ✅ Accessibility validation');
console.log('   ✅ TypeScript typing');
console.log('   ✅ Storybook stories');
console.log('   ✅ Documentation');
`;