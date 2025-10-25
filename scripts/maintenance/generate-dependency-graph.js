#!/usr/bin/env node

/**
 * Generate visual dependency graph for monorepo packages
 * Creates both SVG and Mermaid diagram formats
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '../..');
const packagesDir = join(rootDir, 'packages');

console.log('📊 Generating dependency graph...\n');

// Get all package directories
const packageDirs = readdirSync(packagesDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

// Build package dependency map
const packageInfo = new Map();

packageDirs.forEach(dir => {
  const pkgPath = join(packagesDir, dir, 'package.json');
  if (!existsSync(pkgPath)) return;

  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };

  const internalDeps = Object.keys(deps)
    .filter(dep => dep.startsWith('@uswds-wc/'))
    .map(dep => {
      // Map package name to directory name
      if (dep === '@uswds-wc/all') return 'uswds-wc';
      if (dep === '@uswds-wc/test-utils') return 'uswds-wc-test-utils';
      return dep.replace('@uswds-wc/', 'uswds-wc-');
    });

  packageInfo.set(dir, {
    name: pkg.name,
    version: pkg.version,
    private: pkg.private || false,
    dependencies: internalDeps,
    componentCount: countComponents(dir),
  });
});

function countComponents(packageDir) {
  const componentsPath = join(packagesDir, packageDir, 'src/components');
  if (!existsSync(componentsPath)) return 0;

  return readdirSync(componentsPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .length;
}

// Generate Mermaid diagram
function generateMermaidDiagram() {
  let mermaid = `graph TD\n`;
  mermaid += `  classDef core fill:#4a90e2,stroke:#2c5aa0,stroke-width:3px,color:#fff\n`;
  mermaid += `  classDef category fill:#50c878,stroke:#2d7a4a,stroke-width:2px,color:#fff\n`;
  mermaid += `  classDef aggregate fill:#ff6b6b,stroke:#c92a2a,stroke-width:2px,color:#fff\n`;
  mermaid += `  classDef private fill:#868e96,stroke:#495057,stroke-width:1px,color:#fff\n\n`;

  // Add nodes
  packageInfo.forEach((info, dir) => {
    const label = info.private
      ? `${info.name.replace('@uswds-wc/', '')}\\n(private)`
      : `${info.name.replace('@uswds-wc/', '')}\\n${info.componentCount} components`;

    mermaid += `  ${dir}["${label}"]\n`;
  });

  mermaid += `\n`;

  // Add edges
  packageInfo.forEach((info, dir) => {
    info.dependencies.forEach(dep => {
      mermaid += `  ${dir} --> ${dep}\n`;
    });
  });

  mermaid += `\n`;

  // Apply styles
  packageInfo.forEach((info, dir) => {
    if (dir === 'uswds-wc-core') {
      mermaid += `  class ${dir} core\n`;
    } else if (dir === 'uswds-wc') {
      mermaid += `  class ${dir} aggregate\n`;
    } else if (info.private) {
      mermaid += `  class ${dir} private\n`;
    } else {
      mermaid += `  class ${dir} category\n`;
    }
  });

  return mermaid;
}

// Generate ASCII tree
function generateASCIITree() {
  let tree = `USWDS Web Components - Dependency Tree\n`;
  tree += `${'='.repeat(50)}\n\n`;

  // Start with core
  tree += `@uswds-wc/core (foundation)\n`;

  // Get all packages that depend on core
  const coreDependents = [];
  packageInfo.forEach((info, dir) => {
    if (info.dependencies.includes('uswds-wc-core') && dir !== 'uswds-wc-core') {
      coreDependents.push({ dir, info });
    }
  });

  coreDependents.forEach(({ dir, info }, index) => {
    const isLast = index === coreDependents.length - 1;
    const prefix = isLast ? '└─' : '├─';
    const componentText = info.componentCount > 0 ? ` (${info.componentCount} components)` : '';

    tree += `${prefix} ${info.name}${componentText}\n`;

    // Show dependencies beyond core
    const otherDeps = info.dependencies.filter(d => d !== 'uswds-wc-core');
    otherDeps.forEach((dep, depIndex) => {
      const depInfo = packageInfo.get(dep);
      const depPrefix = isLast ? '  ' : '│ ';
      const depConnector = depIndex === otherDeps.length - 1 ? '└─' : '├─';
      tree += `${depPrefix}${depConnector} depends on: ${depInfo.name}\n`;
    });
  });

  // Show aggregate package
  const aggregateInfo = packageInfo.get('uswds-wc');
  if (aggregateInfo) {
    tree += `\n@uswds-wc/all (complete bundle)\n`;
    aggregateInfo.dependencies.forEach((dep, index) => {
      const isLast = index === aggregateInfo.dependencies.length - 1;
      const prefix = isLast ? '└─' : '├─';
      const depInfo = packageInfo.get(dep);
      tree += `${prefix} ${depInfo.name}\n`;
    });
  }

  return tree;
}

// Generate Markdown table
function generateMarkdownTable() {
  let md = `# Package Dependency Matrix\n\n`;
  md += `| Package | Dependencies | Component Count | Version |\n`;
  md += `|---------|--------------|-----------------|----------|\n`;

  const sortedPackages = Array.from(packageInfo.entries())
    .filter(([, info]) => !info.private)
    .sort((a, b) => {
      // Core first
      if (a[0] === 'uswds-wc-core') return -1;
      if (b[0] === 'uswds-wc-core') return 1;
      // Aggregate last
      if (a[0] === 'uswds-wc') return 1;
      if (b[0] === 'uswds-wc') return -1;
      // Rest alphabetically
      return a[1].name.localeCompare(b[1].name);
    });

  sortedPackages.forEach(([dir, info]) => {
    const deps = info.dependencies.length > 0
      ? info.dependencies.map(d => {
          const depInfo = packageInfo.get(d);
          return depInfo.name.replace('@uswds-wc/', '');
        }).join(', ')
      : '✅ None';

    md += `| \`${info.name}\` | ${deps} | ${info.componentCount} | ${info.version} |\n`;
  });

  return md;
}

// Generate statistics
function generateStats() {
  const totalPackages = packageInfo.size;
  const publicPackages = Array.from(packageInfo.values()).filter(i => !i.private).length;
  const totalComponents = Array.from(packageInfo.values())
    .reduce((sum, info) => sum + info.componentCount, 0);

  const maxDeps = Math.max(...Array.from(packageInfo.values()).map(i => i.dependencies.length));
  const avgDeps = (Array.from(packageInfo.values())
    .reduce((sum, info) => sum + info.dependencies.length, 0) / totalPackages).toFixed(1);

  let stats = `📊 Monorepo Statistics\n`;
  stats += `${'='.repeat(50)}\n\n`;
  stats += `Total Packages: ${totalPackages}\n`;
  stats += `Public Packages: ${publicPackages}\n`;
  stats += `Private Packages: ${totalPackages - publicPackages}\n`;
  stats += `Total Components: ${totalComponents}\n`;
  stats += `Average Dependencies: ${avgDeps}\n`;
  stats += `Max Dependencies: ${maxDeps}\n\n`;

  // Package breakdown
  stats += `Package Breakdown:\n`;
  Array.from(packageInfo.entries())
    .sort((a, b) => b[1].componentCount - a[1].componentCount)
    .forEach(([dir, info]) => {
      const bar = '█'.repeat(Math.ceil(info.componentCount / 2));
      stats += `  ${info.name.padEnd(30)} ${info.componentCount.toString().padStart(2)} components ${bar}\n`;
    });

  return stats;
}

// Write all outputs
const mermaid = generateMermaidDiagram();
const ascii = generateASCIITree();
const markdown = generateMarkdownTable();
const stats = generateStats();

// Save files
const docsDir = join(rootDir, 'docs/generated');
import { mkdirSync } from 'fs';
try {
  mkdirSync(docsDir, { recursive: true });
} catch (e) {
  // Directory exists
}

writeFileSync(join(docsDir, 'dependency-graph.mmd'), mermaid);
writeFileSync(join(docsDir, 'dependency-tree.txt'), ascii);
writeFileSync(join(docsDir, 'dependency-matrix.md'), markdown);
writeFileSync(join(docsDir, 'package-stats.txt'), stats);

console.log('✅ Generated dependency graph files:');
console.log('   📄 docs/generated/dependency-graph.mmd (Mermaid diagram)');
console.log('   📄 docs/generated/dependency-tree.txt (ASCII tree)');
console.log('   📄 docs/generated/dependency-matrix.md (Markdown table)');
console.log('   📄 docs/generated/package-stats.txt (Statistics)\n');

// Print stats to console
console.log(stats);

// Print tree to console
console.log('\n' + ascii);

console.log('\n💡 To visualize the Mermaid diagram:');
console.log('   Visit: https://mermaid.live/');
console.log('   Or use VS Code extension: Markdown Preview Mermaid Support\n');
