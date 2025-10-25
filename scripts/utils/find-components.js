/**
 * Utility to find components in monorepo structure
 *
 * Supports both old (src/components) and new (packages/STAR/src/components) structures
 */

import { readdirSync, existsSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..', '..');

/**
 * Get all component directories in the monorepo
 * @returns {string[]} Array of absolute paths to component directories
 */
export function getAllComponentPaths() {
  const components = [];

  // Check for monorepo structure (packages/*/src/components/*)
  const packagesDir = join(rootDir, 'packages');
  if (existsSync(packagesDir)) {
    const packages = readdirSync(packagesDir).filter(pkg => {
      const pkgPath = join(packagesDir, pkg);
      return statSync(pkgPath).isDirectory() && !pkg.startsWith('.');
    });

    for (const pkg of packages) {
      const componentsDir = join(packagesDir, pkg, 'src', 'components');
      if (existsSync(componentsDir)) {
        const componentNames = readdirSync(componentsDir).filter(name => {
          const componentPath = join(componentsDir, name);
          return statSync(componentPath).isDirectory() && !name.startsWith('.');
        });

        for (const name of componentNames) {
          components.push(join(componentsDir, name));
        }
      }
    }
  }

  // Fallback to old structure (src/components/*)
  const oldComponentsDir = join(rootDir, 'src', 'components');
  if (existsSync(oldComponentsDir)) {
    const componentNames = readdirSync(oldComponentsDir).filter(name => {
      const componentPath = join(oldComponentsDir, name);
      return statSync(componentPath).isDirectory() && !name.startsWith('.');
    });

    for (const name of componentNames) {
      components.push(join(oldComponentsDir, name));
    }
  }

  return components;
}

/**
 * Get all component names in the monorepo
 * @returns {string[]} Array of component names (e.g., 'button', 'alert')
 */
export function getAllComponentNames() {
  const paths = getAllComponentPaths();
  return paths.map(path => {
    const parts = path.split('/');
    return parts[parts.length - 1];
  });
}

/**
 * Get path to a specific component
 * @param {string} componentName - Name of the component
 * @returns {string|null} Absolute path to component directory, or null if not found
 */
export function getComponentPath(componentName) {
  const paths = getAllComponentPaths();
  return paths.find(path => path.endsWith(`/${componentName}`)) || null;
}

/**
 * Get all package names in the monorepo
 * @returns {string[]} Array of package names (e.g., 'uswds-wc-actions')
 */
export function getAllPackageNames() {
  const packagesDir = join(rootDir, 'packages');
  if (!existsSync(packagesDir)) return [];

  return readdirSync(packagesDir).filter(pkg => {
    const pkgPath = join(packagesDir, pkg);
    return statSync(pkgPath).isDirectory() && !pkg.startsWith('.');
  });
}

/**
 * Check if project uses monorepo structure
 * @returns {boolean}
 */
export function isMonorepo() {
  const packagesDir = join(rootDir, 'packages');
  return existsSync(packagesDir);
}

/**
 * Get the base components directory
 * @returns {string} Path to components directory (monorepo-aware)
 */
export function getComponentsBaseDir() {
  if (isMonorepo()) {
    return join(rootDir, 'packages');
  }
  return join(rootDir, 'src', 'components');
}
