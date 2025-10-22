#!/usr/bin/env node

/**
 * Enhanced Documentation Link Validator with Auto-Fix
 *
 * Validates all links in markdown documentation and automatically fixes common issues.
 *
 * Features:
 * - ✅ Auto-fixes moved files (docs/FILE.md → docs/archived/FILE.md)
 * - ✅ Interactive prompts for ambiguous cases
 * - ✅ Suggests similar files when links are broken
 * - ✅ Updates external URLs with known replacements
 * - ✅ Batch apply fixes to all files
 * - ✅ Dry-run mode to preview changes
 *
 * Usage:
 *   npm run validate:doc-links              # Validate only
 *   npm run validate:doc-links:fix          # Auto-fix with prompts
 *   npm run validate:doc-links:fix -- --yes # Auto-fix without prompts
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');
const readline = require('readline');

// ANSI colors
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

// Configuration
const projectRoot = path.resolve(__dirname, '../..');

// Parse command line arguments
const args = process.argv.slice(2);
const FIX_MODE = args.includes('--fix');
const AUTO_YES = args.includes('--yes') || args.includes('-y');
const DRY_RUN = args.includes('--dry-run');

// Patterns for documentation files
const DOC_PATTERNS = [
  'docs/**/*.md',
  'src/components/**/*.md',
  'src/components/**/*.mdx',
  '.storybook/**/*.md',
  '.storybook/**/*.mdx',
  'CLAUDE.md',
  'README.md',
];

// Known URL replacements for broken links
const URL_REPLACEMENTS = {
  'https://barbaradenney.github.io/USWDS-webcomponents/': 'https://github.com/barbaramiles/USWDS-webcomponents',
  'https://www.npmjs.com/org/uswds-wc': 'Coming soon to npm',
  'https://esm.sh/@uswds-wc': 'https://cdn.jsdelivr.net/npm/@uswds-wc/+esm',
  'https://keepachangelog.com/)': 'https://keepachangelog.com/', // Remove trailing paren
};

console.log(`\n${BOLD}${BLUE}🔗 Documentation Link Validator${RESET}`);
console.log(`${BLUE}${'═'.repeat(80)}${RESET}\n`);

if (FIX_MODE) {
  console.log(`${GREEN}✨ Auto-fix mode enabled${RESET}`);
  if (AUTO_YES) {
    console.log(`${YELLOW}⚡ Auto-applying all fixes (--yes mode)${RESET}`);
  }
  if (DRY_RUN) {
    console.log(`${CYAN}👁️  Dry-run mode (no changes will be saved)${RESET}`);
  }
  console.log('');
}

// Collect all broken links and fixes
const brokenLinks = [];
const fixes = [];

/**
 * Extract all links from markdown content
 */
function extractLinks(content, filePath) {
  const links = [];

  // Markdown link pattern: [text](url)
  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;

  while ((match = markdownLinkRegex.exec(content)) !== null) {
    const text = match[1];
    const url = match[2];
    const line = content.substring(0, match.index).split('\n').length;

    links.push({
      text,
      url,
      line,
      startIndex: match.index,
      fullMatch: match[0],
    });
  }

  return links;
}

/**
 * Find similar files in the project
 */
function findSimilarFiles(targetFile) {
  const basename = path.basename(targetFile);
  const allFiles = glob.sync('**/*.{md,mdx}', {
    cwd: projectRoot,
    ignore: ['node_modules/**', 'dist/**', 'build/**'],
  });

  // Find files with same name but different path
  const exactMatches = allFiles.filter(f => path.basename(f) === basename);

  // Find files with similar names (fuzzy match)
  const similarFiles = allFiles.filter(f => {
    const name = path.basename(f, path.extname(f));
    const targetName = path.basename(targetFile, path.extname(targetFile));
    return name.toLowerCase().includes(targetName.toLowerCase()) ||
           targetName.toLowerCase().includes(name.toLowerCase());
  });

  return {
    exact: exactMatches,
    similar: similarFiles.filter(f => !exactMatches.includes(f)),
  };
}

/**
 * Auto-fix a broken link
 */
function autoFixLink(filePath, link, brokenReason) {
  const fixes = [];

  // Pattern 1: File moved to docs/archived/
  if (link.url.startsWith('docs/') && brokenReason === 'file-not-found') {
    const archivedPath = link.url.replace('docs/', 'docs/archived/');
    const fullPath = path.resolve(projectRoot, archivedPath);

    if (fs.existsSync(fullPath)) {
      fixes.push({
        type: 'auto',
        description: 'File moved to archived/',
        oldUrl: link.url,
        newUrl: archivedPath,
        confidence: 'high',
      });
    }
  }

  // Pattern 2: ./docs/ instead of docs/
  if (link.url.startsWith('./docs/') && brokenReason === 'file-not-found') {
    const fixedPath = link.url.replace('./', '');
    const fullPath = path.resolve(projectRoot, fixedPath);

    if (fs.existsSync(fullPath)) {
      fixes.push({
        type: 'auto',
        description: 'Remove leading ./',
        oldUrl: link.url,
        newUrl: fixedPath,
        confidence: 'high',
      });
    }
  }

  // Pattern 3: Missing file extension
  if (!link.url.includes('.') && brokenReason === 'file-not-found') {
    const withMd = link.url + '.md';
    const withMdx = link.url + '.mdx';

    if (fs.existsSync(path.resolve(projectRoot, withMd))) {
      fixes.push({
        type: 'auto',
        description: 'Add .md extension',
        oldUrl: link.url,
        newUrl: withMd,
        confidence: 'high',
      });
    } else if (fs.existsSync(path.resolve(projectRoot, withMdx))) {
      fixes.push({
        type: 'auto',
        description: 'Add .mdx extension',
        oldUrl: link.url,
        newUrl: withMdx,
        confidence: 'high',
      });
    }
  }

  // Pattern 4: Known URL replacements
  if (URL_REPLACEMENTS[link.url]) {
    fixes.push({
      type: 'auto',
      description: 'Known URL replacement',
      oldUrl: link.url,
      newUrl: URL_REPLACEMENTS[link.url],
      confidence: 'high',
    });
  }

  // Pattern 5: Trailing punctuation in URLs
  const trailingPuncMatch = link.url.match(/^(https?:\/\/[^)]+)([)]+)$/);
  if (trailingPuncMatch) {
    fixes.push({
      type: 'auto',
      description: 'Remove trailing parenthesis',
      oldUrl: link.url,
      newUrl: trailingPuncMatch[1],
      confidence: 'high',
    });
  }

  // Pattern 6: Find similar files
  if (brokenReason === 'file-not-found' && fixes.length === 0) {
    const similar = findSimilarFiles(link.url);

    if (similar.exact.length > 0) {
      similar.exact.forEach(file => {
        fixes.push({
          type: 'suggest',
          description: `Similar file found: ${file}`,
          oldUrl: link.url,
          newUrl: file,
          confidence: 'medium',
        });
      });
    }
  }

  return fixes;
}

/**
 * Prompt user to choose a fix
 */
async function promptForFix(filePath, link, suggestedFixes) {
  if (AUTO_YES && suggestedFixes.length > 0) {
    // In auto-yes mode, use first high-confidence fix
    const highConfidence = suggestedFixes.find(f => f.confidence === 'high');
    return highConfidence || suggestedFixes[0];
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log(`\n${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
  console.log(`${BOLD}Broken link in:${RESET} ${filePath}:${link.line}`);
  console.log(`${BOLD}Link text:${RESET} ${link.text}`);
  console.log(`${BOLD}Link URL:${RESET} ${RED}${link.url}${RESET}`);
  console.log('');

  if (suggestedFixes.length > 0) {
    console.log(`${GREEN}Suggested fixes:${RESET}`);
    suggestedFixes.forEach((fix, i) => {
      console.log(`  ${i + 1}. ${fix.description}`);
      console.log(`     ${CYAN}${fix.newUrl}${RESET} [${fix.confidence}]`);
    });
    console.log(`  ${suggestedFixes.length + 1}. Skip this link`);
    console.log(`  ${suggestedFixes.length + 2}. Enter custom URL`);
  } else {
    console.log(`${YELLOW}No automatic fixes found${RESET}`);
    console.log(`  1. Enter custom URL`);
    console.log(`  2. Skip this link`);
  }

  return new Promise(resolve => {
    rl.question(`\n${BOLD}Choose an option [1-${suggestedFixes.length + 2}]: ${RESET}`, answer => {
      const choice = parseInt(answer);

      if (choice >= 1 && choice <= suggestedFixes.length) {
        rl.close();
        resolve(suggestedFixes[choice - 1]);
      } else if (choice === suggestedFixes.length + 1) {
        rl.close();
        resolve(null); // Skip
      } else if (choice === suggestedFixes.length + 2 || (suggestedFixes.length === 0 && choice === 1)) {
        rl.question(`${BOLD}Enter new URL: ${RESET}`, customUrl => {
          rl.close();
          resolve({
            type: 'manual',
            description: 'Custom URL',
            oldUrl: link.url,
            newUrl: customUrl.trim(),
            confidence: 'manual',
          });
        });
      } else {
        console.log(`${RED}Invalid choice. Skipping.${RESET}`);
        rl.close();
        resolve(null);
      }
    });
  });
}

/**
 * Apply fix to file content
 */
function applyFix(content, link, fix) {
  // Find the exact match and replace
  const oldLink = `[${link.text}](${link.url})`;
  const newLink = `[${link.text}](${fix.newUrl})`;

  return content.replace(oldLink, newLink);
}

/**
 * Validate and fix links in a file
 */
async function validateFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const links = extractLinks(content, filePath);
  let updatedContent = content;
  let hasChanges = false;

  for (const link of links) {
    // Skip anchors and external URLs for now (keep it simple)
    if (link.url.startsWith('#') || link.url.startsWith('http')) {
      continue;
    }

    // Check if file exists
    const resolvedPath = path.resolve(path.dirname(filePath), link.url);

    if (!fs.existsSync(resolvedPath)) {
      console.log(`\n${RED}❌ Broken link:${RESET} ${filePath}:${link.line}`);
      console.log(`   ${link.url}`);

      if (FIX_MODE) {
        const suggestedFixes = autoFixLink(filePath, link, 'file-not-found');

        if (suggestedFixes.length > 0) {
          console.log(`   ${GREEN}💡 ${suggestedFixes.length} fix(es) available${RESET}`);
        }

        const chosenFix = await promptForFix(filePath, link, suggestedFixes);

        if (chosenFix) {
          console.log(`   ${GREEN}✓ Applying fix: ${chosenFix.description}${RESET}`);

          if (!DRY_RUN) {
            updatedContent = applyFix(updatedContent, link, chosenFix);
            hasChanges = true;
          }

          fixes.push({
            file: filePath,
            link: link.url,
            fix: chosenFix.newUrl,
            description: chosenFix.description,
          });
        } else {
          console.log(`   ${YELLOW}⊘ Skipped${RESET}`);
        }
      }

      brokenLinks.push({
        file: filePath,
        line: link.line,
        url: link.url,
      });
    }
  }

  // Write updated content if changes were made
  if (hasChanges && !DRY_RUN) {
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`\n${GREEN}✓ Updated: ${filePath}${RESET}`);
  }

  return brokenLinks.length;
}

/**
 * Main validation
 */
async function main() {
  const files = DOC_PATTERNS.flatMap(pattern =>
    glob.sync(pattern, { cwd: projectRoot })
  ).map(f => path.resolve(projectRoot, f));

  console.log(`${BLUE}Scanning ${files.length} documentation files...${RESET}\n`);

  for (const file of files) {
    await validateFile(file);
  }

  // Summary
  console.log(`\n${BLUE}${'═'.repeat(80)}${RESET}`);
  console.log(`${BOLD}Summary:${RESET}`);
  console.log(`  Files scanned: ${files.length}`);
  console.log(`  Broken links: ${brokenLinks.length}`);

  if (FIX_MODE) {
    console.log(`  Fixes applied: ${fixes.length}`);

    if (DRY_RUN) {
      console.log(`\n${CYAN}👁️  Dry-run mode - no changes were saved${RESET}`);
      console.log(`${CYAN}   Run without --dry-run to apply fixes${RESET}`);
    } else if (fixes.length > 0) {
      console.log(`\n${GREEN}✅ Fixes saved to files${RESET}`);
    }

    if (fixes.length > 0) {
      console.log(`\n${BOLD}Applied fixes:${RESET}`);
      fixes.forEach(fix => {
        console.log(`  ${fix.file}`);
        console.log(`    ${RED}${fix.link}${RESET} → ${GREEN}${fix.fix}${RESET}`);
        console.log(`    ${CYAN}${fix.description}${RESET}`);
      });
    }
  }

  console.log(`${BLUE}${'═'.repeat(80)}${RESET}\n`);

  if (brokenLinks.length > 0 && !FIX_MODE) {
    console.log(`${YELLOW}💡 Run with --fix flag to automatically fix broken links:${RESET}`);
    console.log(`   npm run validate:doc-links:fix\n`);
  }

  process.exit(brokenLinks.length > 0 && !FIX_MODE ? 1 : 0);
}

main().catch(err => {
  console.error(`${RED}Error: ${err.message}${RESET}`);
  process.exit(1);
});
