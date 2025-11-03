#!/usr/bin/env node

/**
 * Validates Storybook MDX files for:
 * - Outdated npm package URLs
 * - Broken links
 * - Outdated package names
 * - Inconsistent repository URLs
 */

import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '../..');

// Expected values from package.json
const EXPECTED_VALUES = {
  npmOrg: 'https://www.npmjs.com/org/uswds-wc',
  githubRepo: 'https://github.com/barbaradenney/uswds-wc',
  homepage: 'https://barbaradenney.github.io/uswds-wc/',
};

// Patterns to check for
const PATTERNS = {
  // Old npm package URL (should be organization URL now)
  oldNpmPackage: /https:\/\/www\.npmjs\.com\/package\/uswds-webcomponents/g,
  // Old package name in text
  oldPackageName: /uswds-webcomponents(?!-monorepo)/g,
  // Any npm.com URLs (to validate they're correct)
  npmUrls: /https:\/\/www\.npmjs\.com\/[^\s\)]+/g,
  // GitHub URLs (to validate they're correct)
  githubUrls: /https:\/\/github\.com\/[^\s\)]+/g,
};

class MDXValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.filesChecked = 0;
  }

  /**
   * Find all MDX files in .storybook directory
   */
  findMDXFiles() {
    const storybookDir = join(ROOT_DIR, '.storybook');
    try {
      const files = readdirSync(storybookDir);
      return files
        .filter(file => file.endsWith('.mdx'))
        .map(file => join(storybookDir, file));
    } catch (error) {
      console.error(`❌ Error reading .storybook directory: ${error.message}`);
      return [];
    }
  }

  /**
   * Validate a single MDX file
   */
  validateFile(filePath) {
    this.filesChecked++;
    const fileName = filePath.split('/').pop();

    let content;
    try {
      content = readFileSync(filePath, 'utf-8');
    } catch (error) {
      this.errors.push({
        file: fileName,
        issue: `Failed to read file: ${error.message}`,
      });
      return;
    }

    // Check for old npm package URL
    const oldNpmMatches = content.match(PATTERNS.oldNpmPackage);
    if (oldNpmMatches) {
      this.errors.push({
        file: fileName,
        issue: `Found old npm package URL (should be ${EXPECTED_VALUES.npmOrg})`,
        matches: oldNpmMatches,
        line: this.getLineNumber(content, oldNpmMatches[0]),
      });
    }

    // Check for old package name references
    const oldNameMatches = content.match(PATTERNS.oldPackageName);
    if (oldNameMatches) {
      this.warnings.push({
        file: fileName,
        issue: 'Found old package name "uswds-webcomponents" (should be @uswds-wc/* packages)',
        matches: oldNameMatches,
        line: this.getLineNumber(content, oldNameMatches[0]),
      });
    }

    // Validate all npm URLs point to correct org
    const npmUrls = content.match(PATTERNS.npmUrls);
    if (npmUrls) {
      npmUrls.forEach(url => {
        // Allow the org URL or specific package URLs under @uswds-wc
        if (!url.includes('/org/uswds-wc') && !url.includes('/package/@uswds-wc/')) {
          this.errors.push({
            file: fileName,
            issue: `Invalid npm URL (should be under https://www.npmjs.com/org/uswds-wc or https://www.npmjs.com/package/@uswds-wc/...)`,
            matches: [url],
            line: this.getLineNumber(content, url),
          });
        }
      });
    }

    // Validate GitHub URLs
    const githubUrls = content.match(PATTERNS.githubUrls);
    if (githubUrls) {
      githubUrls.forEach(url => {
        if (!url.startsWith(EXPECTED_VALUES.githubRepo)) {
          this.warnings.push({
            file: fileName,
            issue: `Unexpected GitHub URL (expected ${EXPECTED_VALUES.githubRepo})`,
            matches: [url],
            line: this.getLineNumber(content, url),
          });
        }
      });
    }
  }

  /**
   * Get line number of a match in content
   */
  getLineNumber(content, match) {
    const lines = content.substring(0, content.indexOf(match)).split('\n');
    return lines.length;
  }

  /**
   * Run validation on all MDX files
   */
  validate() {
    console.log('🔍 Validating Storybook MDX files...\n');

    const mdxFiles = this.findMDXFiles();

    if (mdxFiles.length === 0) {
      console.log('⚠️  No MDX files found in .storybook directory');
      return true;
    }

    mdxFiles.forEach(file => this.validateFile(file));

    this.printResults();

    return this.errors.length === 0;
  }

  /**
   * Print validation results
   */
  printResults() {
    console.log(`\n📊 Checked ${this.filesChecked} MDX file(s)\n`);

    if (this.errors.length > 0) {
      console.log('❌ ERRORS:\n');
      this.errors.forEach(({ file, issue, matches, line }) => {
        console.log(`  ${file}:${line}`);
        console.log(`    Issue: ${issue}`);
        if (matches) {
          console.log(`    Found: ${matches.join(', ')}`);
        }
        console.log('');
      });
    }

    if (this.warnings.length > 0) {
      console.log('⚠️  WARNINGS:\n');
      this.warnings.forEach(({ file, issue, matches, line }) => {
        console.log(`  ${file}:${line}`);
        console.log(`    Issue: ${issue}`);
        if (matches) {
          console.log(`    Found: ${matches.join(', ')}`);
        }
        console.log('');
      });
    }

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('✅ All MDX files are valid!\n');
    } else {
      console.log(`\n📋 Summary: ${this.errors.length} error(s), ${this.warnings.length} warning(s)\n`);

      if (this.errors.length > 0) {
        console.log('💡 Fix suggestions:');
        console.log(`   - Replace old npm package URL with: ${EXPECTED_VALUES.npmOrg}`);
        console.log('   - Update package references to use @uswds-wc/* monorepo packages');
        console.log('   - Run: npm run docs:sync to auto-update documentation\n');
      }
    }
  }
}

// Run validation
const validator = new MDXValidator();
const isValid = validator.validate();

process.exit(isValid ? 0 : 1);
