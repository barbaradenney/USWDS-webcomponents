#!/usr/bin/env node

/**
 * Component Usage Analytics
 *
 * Analyzes component usage across the codebase to identify:
 * - Most/least used components
 * - Import patterns
 * - Unused components
 * - Component complexity
 *
 * Usage:
 *   npm run analytics:components
 *   npm run analytics:components -- --json
 */

const fs = require('fs');
const path = require('path');

// ANSI colors
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const CYAN = '\x1b[36m';

const args = process.argv.slice(2);
const outputJson = args.includes('--json');

console.log('\n' + BOLD + BLUE + '📊 Component Usage Analytics' + RESET);
console.log(BLUE + '═'.repeat(80) + RESET + '\n');

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. Discover All Components
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const componentsDir = 'src/components';
const components = [];

function discoverComponents() {
  const dirs = fs.readdirSync(componentsDir, { withFileTypes: true });

  for (const dir of dirs) {
    if (dir.isDirectory()) {
      const componentPath = path.join(componentsDir, dir.name);
      const componentFile = path.join(componentPath, `usa-${dir.name}.ts`);

      if (fs.existsSync(componentFile)) {
        const stats = fs.statSync(componentFile);
        const content = fs.readFileSync(componentFile, 'utf8');

        components.push({
          name: dir.name,
          tagName: `usa-${dir.name}`,
          path: componentFile,
          size: stats.size,
          lines: content.split('\n').length,
          imports: 0,
          usages: [],
          hasTests: fs.existsSync(path.join(componentPath, `usa-${dir.name}.test.ts`)),
          hasStories: fs.existsSync(path.join(componentPath, `usa-${dir.name}.stories.ts`)),
          hasCypress: fs.existsSync(path.join(componentPath, `usa-${dir.name}.component.cy.ts`)),
          hasReadme: fs.existsSync(path.join(componentPath, 'README.mdx'))
        });
      }
    }
  }

  return components;
}

console.log(BOLD + '1. Discovering components...' + RESET + '\n');
discoverComponents();
console.log(GREEN + `✅ Found ${components.length} components` + RESET + '\n');

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. Analyze Usage Patterns
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

console.log(BOLD + '2. Analyzing usage patterns...' + RESET + '\n');

function analyzeUsage(dir, isStorybook = false) {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
      analyzeUsage(fullPath, fullPath.includes('.storybook') || fullPath.includes('.stories'));
    } else if (file.isFile() && /\.(ts|tsx|js|jsx|html)$/.test(file.name)) {
      const content = fs.readFileSync(fullPath, 'utf8');

      // Check for imports
      components.forEach(comp => {
        // Check for import statements
        const importRegex = new RegExp(`from\\s+['"].*${comp.name}.*['"]`, 'g');
        const tagRegex = new RegExp(`<${comp.tagName}[\\s>]`, 'gi');

        const importMatches = content.match(importRegex);
        const tagMatches = content.match(tagRegex);

        if (importMatches || tagMatches) {
          comp.imports += (importMatches?.length || 0);
          comp.usages.push({
            file: fullPath,
            imports: importMatches?.length || 0,
            tags: tagMatches?.length || 0,
            isStorybook
          });
        }
      });
    }
  }
}

// Analyze src directory
analyzeUsage('src');

// Analyze Storybook stories
if (fs.existsSync('.storybook')) {
  analyzeUsage('.storybook', true);
}

console.log(GREEN + '✅ Usage analysis complete' + RESET + '\n');

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. Calculate Statistics
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

console.log(BOLD + '3. Calculating statistics...' + RESET + '\n');

// Calculate complexity score (size + imports + usage)
components.forEach(comp => {
  comp.realUsageCount = comp.usages.filter(u => !u.isStorybook).length;
  comp.storybookUsageCount = comp.usages.filter(u => u.isStorybook).length;
  comp.totalUsageCount = comp.usages.length;

  comp.complexity = Math.round((comp.lines / 100) + (comp.imports / 10));
  comp.completeness = [
    comp.hasTests,
    comp.hasStories,
    comp.hasCypress,
    comp.hasReadme
  ].filter(Boolean).length / 4;
});

// Sort by usage
const byUsage = [...components].sort((a, b) => b.realUsageCount - a.realUsageCount);
const unused = components.filter(c => c.realUsageCount === 0);
const mostUsed = byUsage.slice(0, 10);

// Sort by complexity
const byComplexity = [...components].sort((a, b) => b.complexity - a.complexity);
const mostComplex = byComplexity.slice(0, 10);

// Sort by completeness
const byCompleteness = [...components].sort((a, b) => a.completeness - b.completeness);
const needsWork = byCompleteness.filter(c => c.completeness < 1);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 4. Output Results
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

if (outputJson) {
  const output = {
    summary: {
      totalComponents: components.length,
      unused: unused.length,
      averageComplexity: Math.round(components.reduce((sum, c) => sum + c.complexity, 0) / components.length),
      averageCompleteness: Math.round((components.reduce((sum, c) => sum + c.completeness, 0) / components.length) * 100)
    },
    mostUsed,
    unused,
    mostComplex,
    needsWork,
    allComponents: components
  };

  console.log(JSON.stringify(output, null, 2));
} else {
  // Human-readable output
  console.log(BLUE + '═'.repeat(80) + RESET);
  console.log(BOLD + 'Summary Statistics:' + RESET);
  console.log(`  Total Components: ${components.length}`);
  console.log(`  Average Complexity: ${Math.round(components.reduce((sum, c) => sum + c.complexity, 0) / components.length)}`);
  console.log(`  Average Completeness: ${Math.round((components.reduce((sum, c) => sum + c.completeness, 0) / components.length) * 100)}%`);

  // Most Used Components
  console.log('\n' + BOLD + GREEN + '🏆 Top 10 Most Used Components:' + RESET);
  mostUsed.forEach((comp, i) => {
    console.log(`  ${i + 1}. ${comp.tagName} - ${comp.realUsageCount} usage(s) (${comp.storybookUsageCount} in Storybook)`);
  });

  // Unused Components
  if (unused.length > 0) {
    console.log('\n' + BOLD + YELLOW + '⚠️  Unused Components (consider removing or documenting):' + RESET);
    unused.forEach(comp => {
      console.log(`  - ${comp.tagName}`);
    });
  } else {
    console.log('\n' + BOLD + GREEN + '✅ All components are being used!' + RESET);
  }

  // Most Complex Components
  console.log('\n' + BOLD + CYAN + '🧩 Top 10 Most Complex Components:' + RESET);
  mostComplex.forEach((comp, i) => {
    console.log(`  ${i + 1}. ${comp.tagName} - Complexity: ${comp.complexity} (${comp.lines} lines)`);
  });

  // Components Needing Work
  if (needsWork.length > 0) {
    console.log('\n' + BOLD + YELLOW + '📋 Components Needing Documentation/Testing:' + RESET);
    needsWork.forEach(comp => {
      const missing = [];
      if (!comp.hasTests) missing.push('tests');
      if (!comp.hasStories) missing.push('stories');
      if (!comp.hasCypress) missing.push('cypress');
      if (!comp.hasReadme) missing.push('readme');

      console.log(`  - ${comp.tagName} (${Math.round(comp.completeness * 100)}% complete) - Missing: ${missing.join(', ')}`);
    });
  } else {
    console.log('\n' + BOLD + GREEN + '✅ All components have complete documentation and tests!' + RESET);
  }

  // Import Analysis
  console.log('\n' + BOLD + BLUE + '📦 Import Patterns:' + RESET);
  const categoryImports = {
    forms: 0,
    navigation: 0,
    'data-display': 0,
    feedback: 0,
    actions: 0,
    layout: 0,
    structure: 0
  };

  // Categorize components
  const categories = {
    forms: ['text-input', 'textarea', 'select', 'checkbox', 'radio', 'file-input', 'date-picker', 'date-range-picker', 'time-picker', 'combo-box', 'character-count', 'memorable-date', 'input-prefix-suffix', 'range-slider'],
    navigation: ['header', 'footer', 'breadcrumb', 'side-navigation', 'in-page-navigation', 'step-indicator', 'pagination'],
    'data-display': ['table', 'list', 'card', 'collection', 'tag', 'icon'],
    feedback: ['alert', 'banner', 'site-alert', 'tooltip', 'validation'],
    actions: ['button', 'button-group', 'link', 'search'],
    layout: ['section', 'prose'],
    structure: ['accordion', 'modal', 'menu', 'identifier', 'summary-box', 'process-list', 'language-selector', 'skip-link']
  };

  components.forEach(comp => {
    for (const [cat, comps] of Object.entries(categories)) {
      if (comps.includes(comp.name)) {
        categoryImports[cat] += comp.imports;
        break;
      }
    }
  });

  Object.entries(categoryImports).forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count} imports`);
  });

  console.log('\n' + BLUE + '═'.repeat(80) + RESET);
  console.log(BOLD + '💡 Recommendations:' + RESET);

  if (unused.length > 0) {
    console.log(`  1. Consider documenting or removing ${unused.length} unused component(s)`);
  }

  if (needsWork.length > 0) {
    console.log(`  2. Complete documentation/testing for ${needsWork.length} component(s)`);
  }

  console.log(`  3. Most complex components may benefit from refactoring`);
  console.log(`  4. Focus testing efforts on most-used components`);

  console.log(BLUE + '═'.repeat(80) + RESET + '\n');
}

// Save report
const reportPath = 'test-reports/component-usage-analytics.json';
fs.mkdirSync(path.dirname(reportPath), { recursive: true });

fs.writeFileSync(reportPath, JSON.stringify({
  timestamp: new Date().toISOString(),
  summary: {
    totalComponents: components.length,
    unused: unused.length,
    averageComplexity: Math.round(components.reduce((sum, c) => sum + c.complexity, 0) / components.length),
    averageCompleteness: Math.round((components.reduce((sum, c) => sum + c.completeness, 0) / components.length) * 100)
  },
  mostUsed: mostUsed.slice(0, 10),
  unused,
  mostComplex: mostComplex.slice(0, 10),
  needsWork,
  components
}, null, 2));

console.log(GREEN + `📄 Report saved to ${reportPath}` + RESET + '\n');
