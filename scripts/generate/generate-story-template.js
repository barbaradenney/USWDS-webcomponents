#!/usr/bin/env node

/**
 * Generate proper Storybook story template
 * Usage: node scripts/generate-story-template.js <component-name>
 */

const fs = require('fs');
const path = require('path');

function generateStoryTemplate(componentName) {
  const pascalCase = componentName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  const kebabCase = componentName.toLowerCase();

  const template = `import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './index.ts';
import type { USA${pascalCase} } from './usa-${kebabCase}.js';

const meta: Meta<USA${pascalCase}> = {
  title: 'Components/${pascalCase}',
  component: 'usa-${kebabCase}',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: \`
Brief component description with usage guidelines.
        \`,
      },
    },
  },
  argTypes: {
    // Define component properties with proper controls
    label: {
      control: 'text',
      description: 'Label text for the component',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the component is disabled',
    },
    // For array/object properties, use these patterns:
    // options: {
    //   control: 'object',
    //   description: 'Array of options with value/label properties',
    // },
  },
};

export default meta;
type Story = StoryObj<USA${pascalCase}>;

// ✅ CORRECT PATTERN: Use Lit html template with proper property binding
export const Default: Story = {
  render: (args) => html\`
    <usa-${kebabCase}
      label="\${args.label}"
      ?disabled=\${args.disabled}
      ?required=\${args.required}
    ></usa-${kebabCase}>
  \`,
  args: {
    label: 'Default Label',
    disabled: false,
    required: false,
  },
};

// For components with array/object properties:
// export const WithOptions: Story = {
//   render: (args) => html\`
//     <usa-${kebabCase}
//       label="\${args.label}"
//       .options=\${args.options}
//       ?disabled=\${args.disabled}
//     ></usa-${kebabCase}>
//   \`,
//   args: {
//     label: 'Component with Options',
//     options: [
//       { value: 'option1', label: 'Option 1' },
//       { value: 'option2', label: 'Option 2' },
//     ],
//     disabled: false,
//   },
// };

// ❌ WRONG PATTERNS TO AVOID:
//
// DON'T use string templates:
// render: (args) => \`<usa-${kebabCase} label="\${args.label}"></usa-${kebabCase}>\`
//
// DON'T use JSON.stringify for properties:
// render: (args) => html\`<usa-${kebabCase} .options='\${JSON.stringify(args.options)}'></usa-${kebabCase}>\`
//
// DON'T forget html import:
// Missing: import { html } from 'lit';
`;

  return template;
}

function main() {
  const componentName = process.argv[2];

  if (!componentName) {
    console.error('Usage: node scripts/generate-story-template.js <component-name>');
    console.error('Example: node scripts/generate-story-template.js my-component');
    process.exit(1);
  }

  const template = generateStoryTemplate(componentName);
  const kebabCase = componentName.toLowerCase();
  const outputPath = path.join('src', 'components', kebabCase, `usa-${kebabCase}.stories.ts`);

  // Ensure directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, template);

  console.log(`✅ Generated story template: ${outputPath}`);
  console.log('');
  console.log('📋 Remember to:');
  console.log('1. Update component description and argTypes');
  console.log('2. Add proper property controls for your component');
  console.log('3. Create additional story variants as needed');
  console.log('4. Use .property=\${value} for object/array properties');
  console.log('5. Use ?attribute=\${boolean} for boolean attributes');
}

if (require.main === module) {
  main();
}

module.exports = { generateStoryTemplate };