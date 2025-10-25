/**
 * Storybook Documentation Integration Utility
 * 
 * This utility provides functions to dynamically load and integrate component
 * documentation (README, CHANGELOG, TESTING.md) into Storybook stories.
 * 
 * Usage in story files:
 * import { getComponentDocs } from '../../utils/storybook-docs.js';
 * 
 * const docs = getComponentDocs('button');
 * 
 * const meta: Meta = {
 *   parameters: {
 *     docs: {
 *       description: {
 *         component: docs.full // Includes README + changelog + testing
 *       }
 *     }
 *   }
 * }
 */

// Import statements for reading files at build time
// Note: This will work in the Storybook environment with proper Vite configuration

/**
 * Component documentation structure
 */
export interface ComponentDocs {
  readme: string;
  changelog: string;
  testing: string;
  full: string; // Combined documentation
}

/**
 * Cache for loaded documentation to avoid repeated file reads
 */
const docsCache = new Map<string, ComponentDocs>();

/**
 * Convert markdown to HTML-like format for Storybook display
 */
function formatMarkdownForStorybook(markdown: string, title: string): string {
  if (!markdown.trim()) {
    return `
## ${title}
*No ${title.toLowerCase()} documentation available.*
`;
  }

  // Simple markdown processing for Storybook
  return `
## ${title}

${markdown}

---
`;
}

/**
 * Load component documentation files dynamically
 */
export async function loadComponentDocs(componentName: string): Promise<ComponentDocs> {
  // Check cache first
  if (docsCache.has(componentName)) {
    return docsCache.get(componentName)!;
  }

  const readme = '';
  const changelog = '';
  const testing = '';

  // TODO: Re-enable dynamic documentation loading for monorepo
  // Dynamic imports with template strings don't work in monorepo structure
  // because components are in different packages (packages/*/src/components/)
  // For now, documentation is available in the component source directories
  try {
    // // Try to load README.md
    // try {
    //   const readmeModule = await import(`../components/${componentName}/README.md?raw`);
    //   readme = readmeModule.default || '';
    // } catch (error) {
    //   console.log(`No README found for ${componentName}`);
    // }

    // // Try to load CHANGELOG.md
    // try {
    //   const changelogModule = await import(`../components/${componentName}/CHANGELOG.md?raw`);
    //   changelog = changelogModule.default || '';
    // } catch (error) {
    //   console.log(`No CHANGELOG found for ${componentName}`);
    // }

    // // Try to load TESTING.md
    // try {
    //   const testingModule = await import(`../components/${componentName}/TESTING.md?raw`);
    //   testing = testingModule.default || '';
    // } catch (error) {
    //   console.log(`No TESTING.md found for ${componentName}`);
    // }
  } catch (error) {
    console.warn(`Error loading documentation for ${componentName}:`, error);
  }

  // Format the documentation for Storybook
  const formattedReadme = formatMarkdownForStorybook(readme, 'Component Documentation');
  const formattedChangelog = formatMarkdownForStorybook(changelog, 'Changelog');
  const formattedTesting = formatMarkdownForStorybook(testing, 'Testing Documentation');

  // Combine all documentation
  const full = `
${formattedReadme}
${formattedTesting}
${formattedChangelog}

---

*Documentation automatically loaded from component files*
`.trim();

  const docs: ComponentDocs = {
    readme: formattedReadme,
    changelog: formattedChangelog,
    testing: formattedTesting,
    full
  };

  // Cache the result
  docsCache.set(componentName, docs);

  return docs;
}

/**
 * Synchronous version that uses pre-loaded documentation
 * This is a fallback for cases where dynamic imports don't work
 */
export function getComponentDocs(componentName: string): ComponentDocs {
  // Return cached docs if available
  if (docsCache.has(componentName)) {
    return docsCache.get(componentName)!;
  }

  // Return placeholder documentation
  const placeholder = `
## Component Documentation

Complete documentation for the **${componentName}** component including usage examples, 
API reference, and accessibility guidelines.

---

## Testing Documentation  

Comprehensive testing coverage information including unit tests, accessibility tests,
interactive tests, and visual regression tests.

---

## Changelog

Version history and changes for this component.

---

*📝 Note: Documentation is dynamically loaded. If you're seeing this placeholder,
the documentation files may not be available in this build.*
`;

  return {
    readme: placeholder,
    changelog: placeholder,  
    testing: placeholder,
    full: placeholder
  };
}

/**
 * Create enhanced Storybook meta configuration with documentation
 */
export function createStorybookMeta(
  componentName: string, 
  title: string,
  additionalConfig: Record<string, any> = {}
): Record<string, any> {
  const docs = getComponentDocs(componentName);

  return {
    title: `Components/${title}`,
    component: `usa-${componentName}`,
    parameters: {
      layout: 'padded',
      docs: {
        description: {
          component: docs.full
        }
      }
    },
    ...additionalConfig
  };
}