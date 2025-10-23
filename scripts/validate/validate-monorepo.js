#!/usr/bin/env node

/**
 * Monorepo Validation Script
 *
 * Validates the health and consistency of the monorepo structure.
 * Checks:
 * - Package consistency (manypkg)
 * - Dependency consistency (syncpack)
 * - Circular dependencies
 * - Workspace protocol usage
 * - Package.json consistency
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '../..');

let hasErrors = false;
let hasWarnings = false;

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',    // cyan
    success: '\x1b[32m', // green
    warning: '\x1b[33m', // yellow
    error: '\x1b[31m',   // red
    reset: '\x1b[0m'
  };

  const symbols = {
    info: 'ℹ',
    success: '✓',
    warning: '⚠',
    error: '✘'
  };

  console.log(`${colors[type]}${symbols[type]} ${message}${colors.reset}`);
}

function section(title) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${title}`);
  console.log(`${'='.repeat(60)}\n`);
}

// Check 1: Workspace packages exist
function checkWorkspacePackages() {
  section('Checking Workspace Packages');

  try {
    const rootPkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));

    if (!rootPkg.packageManager) {
      log('Missing packageManager field in root package.json', 'error');
      hasErrors = true;
    } else {
      log(`Package manager: ${rootPkg.packageManager}`, 'success');
    }

    const workspaceFile = join(ROOT, 'pnpm-workspace.yaml');
    if (!existsSync(workspaceFile)) {
      log('pnpm-workspace.yaml not found', 'error');
      hasErrors = true;
      return;
    }

    const packageDirs = readdirSync(join(ROOT, 'packages'), { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => `packages/${dirent.name}/package.json`)
      .filter(pkgPath => existsSync(join(ROOT, pkgPath)));
    log(`Found ${packageDirs.length} workspace packages`, 'success');

    packageDirs.forEach(pkgPath => {
      const pkg = JSON.parse(readFileSync(join(ROOT, pkgPath), 'utf8'));
      log(`  - ${pkg.name} (v${pkg.version})`, 'info');
    });

  } catch (error) {
    log(`Error reading workspace: ${error.message}`, 'error');
    hasErrors = true;
  }
}

// Check 2: Run manypkg check
function checkManypkg() {
  section('Running manypkg validation');

  try {
    execSync('pnpm run monorepo:check', {
      cwd: ROOT,
      stdio: 'inherit'
    });
    log('manypkg validation passed', 'success');
  } catch (error) {
    log('manypkg validation failed', 'error');
    hasErrors = true;
  }
}

// Check 3: Run syncpack check
function checkSyncpack() {
  section('Running syncpack validation');

  try {
    execSync('pnpm run deps:check', {
      cwd: ROOT,
      stdio: 'inherit'
    });
    log('syncpack validation passed', 'success');
  } catch (error) {
    log('syncpack found dependency mismatches', 'error');
    hasErrors = true;
  }
}

// Check 4: Check for circular dependencies
function checkCircularDependencies() {
  section('Checking for Circular Dependencies');

  try {
    const packageDirs = readdirSync(join(ROOT, 'packages'), { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => `packages/${dirent.name}/package.json`)
      .filter(pkgPath => existsSync(join(ROOT, pkgPath)));
    const depGraph = new Map();

    // Build dependency graph
    packageDirs.forEach(pkgPath => {
      const pkg = JSON.parse(readFileSync(join(ROOT, pkgPath), 'utf8'));
      const deps = {
        ...pkg.dependencies,
        ...pkg.devDependencies
      };

      const internalDeps = Object.keys(deps).filter(d => d.startsWith('@uswds-wc/'));
      depGraph.set(pkg.name, internalDeps);
    });

    // Simple circular dependency check
    let foundCircular = false;
    depGraph.forEach((deps, pkgName) => {
      deps.forEach(dep => {
        const depDeps = depGraph.get(dep) || [];
        if (depDeps.includes(pkgName)) {
          log(`Circular dependency: ${pkgName} ↔ ${dep}`, 'error');
          foundCircular = true;
          hasErrors = true;
        }
      });
    });

    if (!foundCircular) {
      log('No circular dependencies found', 'success');
    }

  } catch (error) {
    log(`Error checking circular dependencies: ${error.message}`, 'error');
    hasErrors = true;
  }
}

// Check 5: Validate workspace protocol usage
function checkWorkspaceProtocol() {
  section('Checking Workspace Protocol Usage');

  try {
    const packageDirs = readdirSync(join(ROOT, 'packages'), { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => `packages/${dirent.name}/package.json`)
      .filter(pkgPath => existsSync(join(ROOT, pkgPath)));
    let violations = 0;

    packageDirs.forEach(pkgPath => {
      const pkg = JSON.parse(readFileSync(join(ROOT, pkgPath), 'utf8'));
      const deps = pkg.dependencies || {};

      Object.entries(deps).forEach(([name, version]) => {
        if (name.startsWith('@uswds-wc/') && !version.startsWith('workspace:')) {
          log(`${pkg.name}: ${name} should use workspace protocol (currently: ${version})`, 'error');
          violations++;
          hasErrors = true;
        }
      });
    });

    if (violations === 0) {
      log('All internal dependencies use workspace protocol', 'success');
    } else {
      log(`Found ${violations} workspace protocol violations`, 'error');
    }

  } catch (error) {
    log(`Error checking workspace protocol: ${error.message}`, 'error');
    hasErrors = true;
  }
}

// Check 6: Package.json consistency
function checkPackageJsonConsistency() {
  section('Checking package.json Consistency');

  try {
    const packageDirs = readdirSync(join(ROOT, 'packages'), { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => `packages/${dirent.name}/package.json`)
      .filter(pkgPath => existsSync(join(ROOT, pkgPath)));
    const fields = ['author', 'license', 'repository'];
    const rootPkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));

    let inconsistencies = 0;

    packageDirs.forEach(pkgPath => {
      const pkg = JSON.parse(readFileSync(join(ROOT, pkgPath), 'utf8'));

      fields.forEach(field => {
        if (field === 'repository') {
          if (!pkg.repository?.url?.includes(rootPkg.repository?.url || '')) {
            log(`${pkg.name}: repository URL inconsistent`, 'warning');
            hasWarnings = true;
            inconsistencies++;
          }
        } else if (pkg[field] !== rootPkg[field]) {
          log(`${pkg.name}: ${field} differs from root`, 'warning');
          hasWarnings = true;
          inconsistencies++;
        }
      });
    });

    if (inconsistencies === 0) {
      log('All packages have consistent metadata', 'success');
    } else {
      log(`Found ${inconsistencies} metadata inconsistencies`, 'warning');
    }

  } catch (error) {
    log(`Error checking package consistency: ${error.message}`, 'error');
    hasErrors = true;
  }
}

// Check 7: Turbo configuration
function checkTurboConfig() {
  section('Checking Turbo Configuration');

  const turboPath = join(ROOT, 'turbo.json');
  if (!existsSync(turboPath)) {
    log('turbo.json not found', 'warning');
    hasWarnings = true;
    return;
  }

  try {
    const turboConfig = JSON.parse(readFileSync(turboPath, 'utf8'));

    if (!turboConfig.tasks && !turboConfig.pipeline) {
      log('turbo.json missing tasks/pipeline configuration', 'error');
      hasErrors = true;
    } else {
      const tasks = turboConfig.tasks || turboConfig.pipeline;
      log(`Turbo configured with ${Object.keys(tasks).length} tasks`, 'success');
    }

  } catch (error) {
    log(`Error reading turbo.json: ${error.message}`, 'error');
    hasErrors = true;
  }
}

// Main execution
async function main() {
  console.log('\n🔍 Monorepo Validation\n');

  checkWorkspacePackages();
  checkManypkg();
  checkSyncpack();
  checkCircularDependencies();
  checkWorkspaceProtocol();
  checkPackageJsonConsistency();
  checkTurboConfig();

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('  Validation Summary');
  console.log('='.repeat(60) + '\n');

  if (hasErrors) {
    log('Validation failed with errors', 'error');
    process.exit(1);
  } else if (hasWarnings) {
    log('Validation passed with warnings', 'warning');
    process.exit(0);
  } else {
    log('All validations passed!', 'success');
    process.exit(0);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
