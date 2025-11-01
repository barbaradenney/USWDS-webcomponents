#!/usr/bin/env node

/**
 * Playwright Story Path Validator
 *
 * Validates that all story paths referenced in Playwright tests exist in Storybook.
 * Prevents issues like the one fixed in commit 9201d5838 where tests referenced
 * old story paths after monorepo restructure.
 *
 * Usage:
 *   node scripts/validate/validate-playwright-story-paths.cjs
 *   pnpm validate:playwright-story-paths
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

/**
 * Extract story paths from Playwright test files
 */
function extractStoryPathsFromTests() {
  const testFiles = glob.sync('tests/playwright/**/*.spec.ts');
  const storyPaths = new Map(); // Map<storyPath, Set<testFile>>

  // Patterns to match story paths in tests
  const patterns = [
    /goto\(['"]([^'"]*\/iframe\.html\?id=([^'"&]+))['"]\)/g,  // page.goto('/iframe.html?id=...')
    /goto\(['"]([^'"]*\/\?path=\/story\/([^'"&]+))['"]\)/g,   // page.goto('/?path=/story/...')
    /story:\s*['"]([^'"]+)['"]/g,                              // story: '...'
  ];

  testFiles.forEach(testFile => {
    const content = fs.readFileSync(testFile, 'utf-8');

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        // Extract the story ID from the match
        let storyId;
        if (match[2]) {
          // Captured group 2 contains the story ID
          storyId = match[2];
        } else if (match[1]) {
          // For 'story: ...' pattern
          storyId = match[1];
        }

        if (storyId) {
          if (!storyPaths.has(storyId)) {
            storyPaths.set(storyId, new Set());
          }
          storyPaths.get(storyId).add(testFile);
        }
      }
    });
  });

  return storyPaths;
}

/**
 * Extract all story IDs from Storybook story files
 */
function extractStoryIdsFromStorybook() {
  const storyFiles = glob.sync('packages/*/src/components/**/*.stories.ts');
  const storyIds = new Map(); // Map<storyId, storyFile>

  storyFiles.forEach(storyFile => {
    const content = fs.readFileSync(storyFile, 'utf-8');

    // Extract title from meta
    const titleMatch = content.match(/title:\s*['"]([^'"]+)['"]/);
    if (!titleMatch) return;

    const title = titleMatch[1];

    // Convert title to story ID format
    // Example: 'Actions/Button' -> 'actions-button'
    const baseId = title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/\//g, '-');

    // Extract all story exports
    const storyExports = content.match(/export const (\w+):/g);
    if (storyExports) {
      storyExports.forEach(exportMatch => {
        const storyName = exportMatch.match(/export const (\w+):/)[1];

        // Convert story name to kebab-case
        const storySlug = storyName
          .replace(/([A-Z])/g, '-$1')
          .toLowerCase()
          .replace(/^-/, '');

        const storyId = `${baseId}--${storySlug}`;
        storyIds.set(storyId, storyFile);
      });
    }

    // Also add the base story ID (for default exports)
    storyIds.set(`${baseId}--default`, storyFile);
  });

  return storyIds;
}

/**
 * Validate that test story paths exist in Storybook
 */
function validateStoryPaths() {
  console.log(`${colors.bold}${colors.cyan}🔍 Validating Playwright Story Paths...${colors.reset}\n`);

  const testStoryPaths = extractStoryPathsFromTests();
  const storybookStoryIds = extractStoryIdsFromStorybook();

  console.log(`${colors.blue}📊 Found:${colors.reset}`);
  console.log(`   ${testStoryPaths.size} unique story paths in Playwright tests`);
  console.log(`   ${storybookStoryIds.size} story IDs in Storybook`);
  console.log('');

  const errors = [];
  const warnings = [];

  // Check each test story path
  testStoryPaths.forEach((testFiles, storyPath) => {
    if (!storybookStoryIds.has(storyPath)) {
      errors.push({
        storyPath,
        testFiles: Array.from(testFiles),
        suggestion: suggestCorrectPath(storyPath, storybookStoryIds),
      });
    }
  });

  // Report results
  if (errors.length > 0) {
    console.log(`${colors.bold}${colors.red}❌ Found ${errors.length} invalid story path(s):${colors.reset}\n`);

    errors.forEach((error, index) => {
      console.log(`${colors.bold}${index + 1}. Story path not found: ${colors.red}${error.storyPath}${colors.reset}`);
      console.log(`   ${colors.yellow}Referenced in:${colors.reset}`);
      error.testFiles.forEach(file => {
        console.log(`   - ${file}`);
      });

      if (error.suggestion) {
        console.log(`   ${colors.green}💡 Did you mean: ${colors.bold}${error.suggestion}${colors.reset}${colors.green}?${colors.reset}`);
      }
      console.log('');
    });

    console.log(`${colors.bold}${colors.yellow}📚 Tip:${colors.reset} Story IDs follow this format:`);
    console.log(`   Category/Component → category-component--story-name`);
    console.log(`   Example: 'Actions/Button' → 'actions-button--default'`);
    console.log('');

    return false;
  }

  console.log(`${colors.bold}${colors.green}✅ All Playwright story paths are valid!${colors.reset}\n`);
  return true;
}

/**
 * Suggest the closest matching story path
 */
function suggestCorrectPath(invalidPath, validStoryIds) {
  const validPaths = Array.from(validStoryIds.keys());

  // Try to find similar paths
  const similarity = validPaths.map(validPath => ({
    path: validPath,
    score: calculateSimilarity(invalidPath, validPath),
  }));

  similarity.sort((a, b) => b.score - a.score);

  // Return the best match if similarity is reasonable
  if (similarity[0] && similarity[0].score > 0.5) {
    return similarity[0].path;
  }

  return null;
}

/**
 * Calculate string similarity (simple algorithm)
 */
function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1, str2) {
  const matrix = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

// Run validation
const isValid = validateStoryPaths();
process.exit(isValid ? 0 : 1);
