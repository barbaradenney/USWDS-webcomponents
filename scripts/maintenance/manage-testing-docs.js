#!/usr/bin/env node

/**
 * Testing Documentation Manager
 * Automatically updates TESTING.md files when test files change
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COMPONENTS_DIR = path.join(__dirname, '../../src/components');

console.log('📋 Testing Documentation Manager');
console.log('=================================');
console.log('');

/**
 * Parse test file to count tests
 */
function parseTestFile(testFilePath) {
  if (!fs.existsSync(testFilePath)) {
    return { totalTests: 0 };
  }

  const content = fs.readFileSync(testFilePath, 'utf8');

  // Count 'it(' and 'test(' occurrences (common test definitions)
  const itMatches = content.match(/\bit\s*\(/g) || [];
  const testMatches = content.match(/\btest\s*\(/g) || [];

  return {
    totalTests: itMatches.length + testMatches.length,
  };
}

/**
 * Update TESTING.md file with test count
 */
function updateTestingDoc(componentName, testAnalysis) {
  const testingPath = path.join(COMPONENTS_DIR, componentName, 'TESTING.md');

  if (!fs.existsSync(testingPath)) {
    return false;
  }

  let content = fs.readFileSync(testingPath, 'utf8');
  const today = new Date().toISOString().split('T')[0];

  // Update test count (supports both formats)
  content = content.replace(
    /✅ \*\*\d+ unit tests?\*\* implemented/i,
    `✅ **${testAnalysis.totalTests} unit test${testAnalysis.totalTests !== 1 ? 's' : ''}** implemented`
  );

  // Update last updated date
  content = content.replace(
    /\*\*Last Updated\*\*: \d{4}-\d{2}-\d{2}/,
    `**Last Updated**: ${today}`
  );

  // Also update format: _Last updated: YYYY-MM-DD_
  content = content.replace(
    /_Last updated: \d{4}-\d{2}-\d{2}_/,
    `_Last updated: ${today}_`
  );

  fs.writeFileSync(testingPath, content, 'utf8');
  return true;
}

/**
 * Get components that have test file changes
 */
function getChangedTestComponents(commitHash) {
  try {
    const diffOutput = execSync(
      `git diff-tree --no-commit-id --name-only -r ${commitHash}`,
      { encoding: 'utf8' }
    );

    const changedFiles = diffOutput.split('\n').filter(Boolean);
    const componentsWithTestChanges = new Set();

    changedFiles.forEach((file) => {
      // Match test files: usa-component.test.ts, usa-component.cy.ts, usa-component.stories.ts
      const match = file.match(/^src\/components\/([^/]+)\/.*\.(test|cy|stories)\.ts$/);
      if (match) {
        componentsWithTestChanges.add(match[1]);
      }
    });

    return Array.from(componentsWithTestChanges);
  } catch (error) {
    console.warn('⚠️  Could not get changed test components from git:', error.message);
    return [];
  }
}

/**
 * Process commit and update test documentation
 */
function processCommit(commitHash, commitMessage) {
  console.log(`🔍 Processing commit: ${commitHash?.substring(0, 8)}`);
  console.log(`   Message: ${commitMessage}`);

  const changedComponents = getChangedTestComponents(commitHash);

  if (changedComponents.length === 0) {
    console.log('   No test file changes detected');
    return;
  }

  console.log(`   Components with test changes: ${changedComponents.join(', ')}`);

  let updated = 0;
  changedComponents.forEach((componentName) => {
    const testFilePath = path.join(COMPONENTS_DIR, componentName, `usa-${componentName}.test.ts`);
    const testAnalysis = parseTestFile(testFilePath);

    if (updateTestingDoc(componentName, testAnalysis)) {
      console.log(`   ✅ Updated ${componentName} (${testAnalysis.totalTests} tests)`);
      updated++;
    }
  });

  if (updated > 0) {
    console.log(`\n✅ Updated ${updated} TESTING.md file(s)`);
  }
}

/**
 * Update all testing documentation
 */
function updateAllTestingDocs() {
  console.log('🔍 Updating all component testing documentation...\n');

  const components = fs
    .readdirSync(COMPONENTS_DIR, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  let updated = 0;

  components.forEach((componentName) => {
    const testFilePath = path.join(COMPONENTS_DIR, componentName, `usa-${componentName}.test.ts`);
    const testingPath = path.join(COMPONENTS_DIR, componentName, 'TESTING.md');

    if (fs.existsSync(testFilePath) && fs.existsSync(testingPath)) {
      const testAnalysis = parseTestFile(testFilePath);
      if (updateTestingDoc(componentName, testAnalysis)) {
        console.log(`   ✅ Updated ${componentName} (${testAnalysis.totalTests} tests)`);
        updated++;
      }
    }
  });

  console.log(`\n✅ Updated testing documentation for ${updated} components`);
}

// CLI interface
const command = process.argv[2];
const commitHash = process.argv[3];
const commitMessage = process.argv[4];

if (!command) {
  console.error(
    'Usage: node manage-testing-docs.js <process-commit|update-all> [commitHash] [commitMessage]'
  );
  process.exit(1);
}

if (command === 'process-commit') {
  processCommit(commitHash, commitMessage);
} else if (command === 'update-all') {
  updateAllTestingDocs();
} else {
  console.error(`Unknown command: ${command}`);
  process.exit(1);
}
