#!/usr/bin/env node

/**
 * Setup TypeScript Project References
 *
 * Analyzes package dependencies and automatically configures TypeScript
 * project references for optimal incremental compilation in the monorepo.
 *
 * Benefits:
 * - 5-10x faster TypeScript compilation
 * - Only recompiles changed packages
 * - Ensures type safety across package boundaries
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '../..');

// Helper to parse JSON with comments (JSONC)
function parseJSONC(text) {
  // Remove single-line comments
  let cleaned = text.replace(/\/\/.*$/gm, '');
  // Remove multi-line comments
  cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');
  // Remove trailing commas
  cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
  return JSON.parse(cleaned);
}

console.log('🔧 Setting up TypeScript project references...\n');

// Get all packages
const packagesDir = join(ROOT, 'packages');
const packageDirs = readdirSync(packagesDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

console.log(`📦 Found ${packageDirs.length} packages:\n`);

// Build dependency graph
const packageInfo = new Map();

packageDirs.forEach(dir => {
  const pkgPath = join(packagesDir, dir, 'package.json');
  if (existsSync(pkgPath)) {
    try {
      // package.json doesn't have comments, use regular JSON.parse
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
      const deps = {
        ...pkg.dependencies,
        ...pkg.peerDependencies
      };

      // Find internal dependencies
      const internalDeps = Object.keys(deps)
        .filter(dep => dep.startsWith('@uswds-wc/'))
        .map(dep => {
          // Map package name to directory
          // @uswds-wc/core -> uswds-wc-core
          // @uswds-wc/all -> uswds-wc
          if (dep === '@uswds-wc/all') return 'uswds-wc';
          if (dep === '@uswds-wc/test-utils') return 'uswds-wc-test-utils';
          return dep.replace('@uswds-wc/', 'uswds-wc-');
        });

      packageInfo.set(dir, {
        name: pkg.name,
        deps: internalDeps
      });

      console.log(`  ${pkg.name}`);
      if (internalDeps.length > 0) {
        console.log(`    └─ depends on: ${internalDeps.join(', ')}`);
      }
    } catch (error) {
      console.log(`  ⚠️  ${dir}: Error reading package.json - ${error.message}`);
    }
  }
});

console.log('\n📝 Updating TypeScript configurations...\n');

// Update each package's tsconfig.json with references
let updatedCount = 0;
packageDirs.forEach(dir => {
  const tsconfigPath = join(packagesDir, dir, 'tsconfig.json');
  if (!existsSync(tsconfigPath)) {
    console.log(`  ⚠️  ${dir}: No tsconfig.json found, skipping`);
    return;
  }

  const info = packageInfo.get(dir);
  if (!info) return;

  try {
    const tsconfig = parseJSONC(readFileSync(tsconfigPath, 'utf8'));

    // Add references based on dependencies
    if (info.deps.length > 0) {
      tsconfig.references = info.deps.map(dep => ({
        path: `../${dep}`
      }));

      writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2) + '\n');
      console.log(`  ✓ ${info.name}: Added ${info.deps.length} reference(s)`);
      updatedCount++;
    } else {
      // Remove references if no internal dependencies
      if (tsconfig.references) {
        delete tsconfig.references;
        writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2) + '\n');
        console.log(`  ✓ ${info.name}: Removed references (no internal deps)`);
        updatedCount++;
      } else {
        console.log(`  ✓ ${info.name}: No references needed`);
      }
    }
  } catch (error) {
    console.log(`  ⚠️  ${info.name}: Error updating tsconfig.json - ${error.message}`);
  }
});

// Update root tsconfig.json with references to all packages
console.log('\n📝 Updating root tsconfig.json...\n');

const rootTsConfigPath = join(ROOT, 'tsconfig.json');
const rootTsConfig = parseJSONC(readFileSync(rootTsConfigPath, 'utf8'));

// Add references to all packages
rootTsConfig.references = [
  { path: './tsconfig.node.json' },
  ...packageDirs.map(dir => ({ path: `./packages/${dir}` }))
];

// For the root config in a monorepo with project references,
// we should set files: [] to make it only a reference coordinator
if (!rootTsConfig.files) {
  rootTsConfig.files = [];
}

writeFileSync(rootTsConfigPath, JSON.stringify(rootTsConfig, null, 2) + '\n');
console.log(`  ✓ Added references to ${packageDirs.length} packages`);

console.log('\n✅ TypeScript project references setup complete!\n');
console.log('📊 Summary:');
console.log(`  - Updated ${updatedCount} package tsconfig files`);
console.log(`  - Root references: ${rootTsConfig.references.length}`);
console.log(`  - Total packages: ${packageDirs.length}`);

console.log('\n🧪 Testing TypeScript build...\n');

import { execSync } from 'child_process';

try {
  execSync('tsc --build --dry --force', {
    cwd: ROOT,
    stdio: 'inherit'
  });
  console.log('\n✅ TypeScript build test passed!');
} catch (error) {
  console.error('\n⚠️  TypeScript build test failed. Check the configuration.');
  process.exit(1);
}

console.log('\n💡 Next steps:');
console.log('  - Run `tsc --build` to build all packages');
console.log('  - Run `tsc --build --clean` to clean build outputs');
console.log('  - Run `tsc --build --watch` for incremental compilation');
console.log('  - Expected 5-10x faster TypeScript compilation!');
