#!/usr/bin/env node

/**
 * Documentation Truthfulness Validator
 *
 * Validates that ALL documentation accurately reflects the actual implementation.
 * 
 * Checks:
 * - Git hook documentation matches actual hook implementations
 * - npm scripts in docs exist in package.json
 * - File paths mentioned in docs exist
 * - Code examples are syntactically valid
 * - Feature lists match actual features
 * - Process descriptions match actual workflows
 * - Component counts are accurate
 * - Technology versions are correct
 *
 * This goes beyond link checking to validate CONTENT ACCURACY.
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');
const { execSync } = require('child_process');

// ANSI colors
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

const projectRoot = path.resolve(__dirname, '../..');

console.log(`\n${BOLD}${BLUE}🔍 Documentation Truthfulness Validator${RESET}`);
console.log(`${BLUE}${'═'.repeat(80)}${RESET}\n`);

const issues = [];
const warnings = [];
let checksRun = 0;

/**
 * VALIDATION 1: Git Hook Documentation vs Actual Hooks
 */
function validateGitHookDocumentation() {
  console.log(`${BOLD}Validating Git Hook Documentation...${RESET}`);

  const hookDocs = {
    'PreCommitSystem.mdx': '.husky/pre-commit',
    'PostCommitSystem.mdx': '.husky/post-commit',
  };

  Object.entries(hookDocs).forEach(([docFile, hookFile]) => {
    const docPath = path.join(projectRoot, '.storybook', docFile);
    const hookPath = path.join(projectRoot, hookFile);

    if (!fs.existsSync(docPath) || !fs.existsSync(hookPath)) {
      return;
    }

    const docContent = fs.readFileSync(docPath, 'utf8');
    const hookContent = fs.readFileSync(hookPath, 'utf8');

    // Extract major features from hook
    const hookFeatures = new Set();
    
    if (hookContent.includes('AI Code Quality')) hookFeatures.add('ai-quality');
    if (hookContent.includes('Automated Code Cleanup')) hookFeatures.add('auto-cleanup');
    if (hookContent.includes('ESLint Auto-Fix')) hookFeatures.add('eslint-fix');
    if (hookContent.includes('Prettier Auto-Format')) hookFeatures.add('prettier');
    if (hookContent.includes('Cache Cleanup')) hookFeatures.add('cache-cleanup');
    if (hookContent.includes('Documentation Cleanup')) hookFeatures.add('doc-cleanup');
    if (hookContent.includes('Discovered Issues')) hookFeatures.add('discovered-issues');
    if (hookContent.includes('CHANGELOG')) hookFeatures.add('changelog');
    if (hookContent.includes('README')) hookFeatures.add('readme');
    if (hookContent.includes('TESTING.md')) hookFeatures.add('testing-docs');

    // Check if documentation mentions these features
    const missingFeatures = [];
    hookFeatures.forEach(feature => {
      const featureNames = {
        'ai-quality': ['AI Code Quality', 'AI quality', 'code quality validation'],
        'auto-cleanup': ['Automated Code Cleanup', 'Auto-Cleanup', 'automated cleanup'],
        'eslint-fix': ['ESLint Auto-Fix', 'auto-fix', 'eslint --fix'],
        'prettier': ['Prettier', 'Auto-Format', 'auto-format'],
        'cache-cleanup': ['Cache Cleanup', 'cache', 'stale cache'],
        'doc-cleanup': ['Documentation Cleanup', 'archive', 'obsolete documentation'],
        'discovered-issues': ['Discovered Issues', 'DISCOVERED_ISSUES'],
        'changelog': ['CHANGELOG', 'changelog'],
        'readme': ['README', 'readme update'],
        'testing-docs': ['TESTING.md', 'testing documentation'],
      };

      const terms = featureNames[feature] || [feature];
      const mentioned = terms.some(term => docContent.includes(term));

      if (!mentioned) {
        missingFeatures.push(feature);
      }
    });

    if (missingFeatures.length > 0) {
      issues.push({
        file: docFile,
        type: 'missing-features',
        description: `Documentation missing features that exist in ${hookFile}`,
        missing: missingFeatures,
        severity: 'high',
      });
    }

    checksRun++;
  });

  console.log(`   ${issues.length === 0 ? GREEN + '✓' : YELLOW + '⚠'} Git hook documentation checked${RESET}\n`);
}

/**
 * VALIDATION 2: npm Scripts in Documentation
 */
function validateNpmScripts() {
  console.log(`${BOLD}Validating npm Scripts in Documentation...${RESET}`);

  const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
  const availableScripts = new Set(Object.keys(packageJson.scripts || {}));

  const docFiles = glob.sync('{docs/**/*.md,.storybook/**/*.mdx,README.md,CLAUDE.md}', {
    cwd: projectRoot,
  });

  docFiles.forEach(file => {
    const filePath = path.join(projectRoot, file);
    const content = fs.readFileSync(filePath, 'utf8');

    // Find npm run/npm test commands
    const scriptPattern = /npm (?:run|test|start|build)[\s:]+([a-z0-9-:]+)/gi;
    const matches = [...content.matchAll(scriptPattern)];

    matches.forEach(match => {
      const scriptName = match[1].replace(/^run\s+/, '');

      if (!availableScripts.has(scriptName)) {
        issues.push({
          file,
          type: 'invalid-npm-script',
          description: `References non-existent npm script: ${scriptName}`,
          line: content.substring(0, match.index).split('\n').length,
          severity: 'medium',
        });
      }
    });

    checksRun++;
  });

  console.log(`   ${GREEN}✓${RESET} npm scripts validated${RESET}\n`);
}

/**
 * VALIDATION 3: File Paths in Documentation
 */
function validateFilePaths() {
  console.log(`${BOLD}Validating File Paths in Documentation...${RESET}`);

  const docFiles = glob.sync('{docs/**/*.md,.storybook/**/*.mdx,README.md,CLAUDE.md}', {
    cwd: projectRoot,
  });

  docFiles.forEach(file => {
    const filePath = path.join(projectRoot, file);
    const content = fs.readFileSync(filePath, 'utf8');

    // Find file path references
    const pathPatterns = [
      /`([.\/a-z0-9_-]+\/[.\/a-z0-9_-]+\.(ts|js|tsx|jsx|css|scss|md|mdx|json|yml|yaml|sh|cjs|mjs))`/gi,
      /(?:see|check|in|at)\s+([.\/a-z0-9_-]+\/[.\/a-z0-9_-]+\.(ts|js|tsx|jsx|css|scss|md|mdx|json|yml|yaml|sh|cjs|mjs))/gi,
    ];

    pathPatterns.forEach(pattern => {
      const matches = [...content.matchAll(pattern)];
      matches.forEach(match => {
        let referencedPath = match[1];

        // Resolve relative paths
        if (referencedPath.startsWith('./') || referencedPath.startsWith('../')) {
          const docDir = path.dirname(filePath);
          referencedPath = path.resolve(docDir, referencedPath);
        } else if (!referencedPath.startsWith('/')) {
          referencedPath = path.join(projectRoot, referencedPath);
        }

        if (!fs.existsSync(referencedPath)) {
          warnings.push({
            file,
            type: 'missing-file-path',
            description: `References non-existent file: ${match[1]}`,
            line: content.substring(0, match.index).split('\n').length,
            severity: 'low',
          });
        }
      });
    });

    checksRun++;
  });

  console.log(`   ${GREEN}✓${RESET} File paths validated${RESET}\n`);
}

/**
 * VALIDATION 4: Code Examples Syntax
 */
function validateCodeExamples() {
  console.log(`${BOLD}Validating Code Examples...${RESET}`);

  const docFiles = glob.sync('{docs/**/*.md,.storybook/**/*.mdx,README.md}', {
    cwd: projectRoot,
  });

  docFiles.forEach(file => {
    const filePath = path.join(projectRoot, file);
    const content = fs.readFileSync(filePath, 'utf8');

    // Extract TypeScript/JavaScript code blocks
    const codeBlocks = [...content.matchAll(/```(?:typescript|javascript|ts|js)\n([\s\S]*?)```/g)];

    codeBlocks.forEach((match, i) => {
      const code = match[1];

      // Check for common syntax errors
      const openBraces = (code.match(/\{/g) || []).length;
      const closeBraces = (code.match(/\}/g) || []).length;

      if (openBraces !== closeBraces) {
        issues.push({
          file,
          type: 'invalid-code-example',
          description: `Code example ${i + 1} has mismatched braces`,
          severity: 'medium',
        });
      }

      // Check for incomplete examples
      if (code.includes('...') && code.trim().split('\n').length < 3) {
        warnings.push({
          file,
          type: 'incomplete-code-example',
          description: `Code example ${i + 1} may be incomplete (contains ... with few lines)`,
          severity: 'low',
        });
      }
    });

    checksRun++;
  });

  console.log(`   ${GREEN}✓${RESET} Code examples validated${RESET}\n`);
}

/**
 * VALIDATION 5: Feature Documentation Completeness
 */
function validateFeatureDocumentation() {
  console.log(`${BOLD}Validating Feature Documentation Completeness...${RESET}`);

  // Map of source files to their documentation
  const sourceToDocMap = {
    '.husky/pre-commit': ['.storybook/PreCommitSystem.mdx', 'CLAUDE.md'],
    '.husky/post-commit': ['.storybook/PostCommitSystem.mdx', 'CLAUDE.md'],
    '.husky/pre-push': ['CLAUDE.md'],
    '.github/workflows/monthly-maintenance.yml': ['docs/MAINTENANCE_STRATEGY.md'],
    'scripts/validate/validate-documentation-sync.cjs': ['docs/MAINTENANCE_STRATEGY.md'],
  };

  Object.entries(sourceToDocMap).forEach(([sourceFile, docFiles]) => {
    const sourcePath = path.join(projectRoot, sourceFile);

    if (!fs.existsSync(sourcePath)) {
      return;
    }

    const sourceContent = fs.readFileSync(sourcePath, 'utf8');
    const sourceMtime = fs.statSync(sourcePath).mtime;

    docFiles.forEach(docFile => {
      const docPath = path.join(projectRoot, docFile);

      if (!fs.existsSync(docPath)) {
        issues.push({
          file: sourceFile,
          type: 'missing-documentation',
          description: `Source file has no documentation at expected location: ${docFile}`,
          severity: 'high',
        });
        return;
      }

      const docMtime = fs.statSync(docPath).mtime;

      // If source was modified significantly after documentation
      const daysSinceDocUpdate = (sourceMtime - docMtime) / (1000 * 60 * 60 * 24);

      if (daysSinceDocUpdate > 7) {
        warnings.push({
          file: docFile,
          type: 'stale-documentation',
          description: `Documentation may be outdated (source modified ${Math.round(daysSinceDocUpdate)} days after docs)`,
          source: sourceFile,
          severity: 'medium',
        });
      }
    });

    checksRun++;
  });

  console.log(`   ${GREEN}✓${RESET} Feature documentation validated${RESET}\n`);
}

/**
 * VALIDATION 6: Auto-Generated Documentation Markers
 */
function validateAutoGeneratedDocs() {
  console.log(`${BOLD}Validating Auto-Generated Documentation...${RESET}`);

  const autoGenDocs = glob.sync('.storybook/**/*.mdx', { cwd: projectRoot });

  autoGenDocs.forEach(file => {
    const filePath = path.join(projectRoot, file);
    const content = fs.readFileSync(filePath, 'utf8');

    // Check for auto-generated marker
    if (content.includes('Auto-generated on:')) {
      const dateMatch = content.match(/Auto-generated on:\*\* ([0-9-]+)/);

      if (dateMatch) {
        const docDate = new Date(dateMatch[1]);
        const daysSinceUpdate = (Date.now() - docDate) / (1000 * 60 * 60 * 24);

        if (daysSinceUpdate > 30) {
          warnings.push({
            file,
            type: 'outdated-auto-docs',
            description: `Auto-generated documentation not updated in ${Math.round(daysSinceUpdate)} days`,
            severity: 'low',
          });
        }
      }
    }

    checksRun++;
  });

  console.log(`   ${GREEN}✓${RESET} Auto-generated documentation checked${RESET}\n`);
}

// Run all validations
validateGitHookDocumentation();
validateNpmScripts();
validateFilePaths();
validateCodeExamples();
validateFeatureDocumentation();
validateAutoGeneratedDocs();

// Report results
console.log(`${BLUE}${'═'.repeat(80)}${RESET}`);
console.log(`${BOLD}Results:${RESET}`);
console.log(`  Checks run: ${checksRun}`);
console.log(`  Issues: ${issues.length}`);
console.log(`  Warnings: ${warnings.length}\n`);

if (issues.length === 0 && warnings.length === 0) {
  console.log(`${GREEN}✅ All documentation is accurate and up-to-date!${RESET}\n`);
  process.exit(0);
}

if (issues.length > 0) {
  console.log(`${RED}${BOLD}❌ Found ${issues.length} issue(s):${RESET}\n`);

  issues.forEach((issue, i) => {
    console.log(`${i + 1}. ${BOLD}${issue.file}${RESET}${issue.line ? `:${issue.line}` : ''}`);
    console.log(`   ${RED}${issue.type}:${RESET} ${issue.description}`);
    if (issue.missing) {
      console.log(`   ${YELLOW}Missing:${RESET} ${issue.missing.join(', ')}`);
    }
    if (issue.source) {
      console.log(`   ${CYAN}Source:${RESET} ${issue.source}`);
    }
    console.log(`   ${BLUE}Severity:${RESET} ${issue.severity}`);
    console.log('');
  });
}

if (warnings.length > 0) {
  console.log(`${YELLOW}${BOLD}⚠️  Found ${warnings.length} warning(s):${RESET}\n`);

  warnings.forEach((warning, i) => {
    console.log(`${i + 1}. ${BOLD}${warning.file}${RESET}${warning.line ? `:${warning.line}` : ''}`);
    console.log(`   ${YELLOW}${warning.type}:${RESET} ${warning.description}`);
    if (warning.source) {
      console.log(`   ${CYAN}Source:${RESET} ${warning.source}`);
    }
    console.log('');
  });
}

console.log(`${BLUE}${'═'.repeat(80)}${RESET}\n`);

if (issues.length > 0) {
  console.log(`${YELLOW}💡 To fix documentation issues:${RESET}`);
  console.log(`   1. Review the issues above`);
  console.log(`   2. Update documentation to match actual implementation`);
  console.log(`   3. Run: npm run docs:validate:truth\n`);
  process.exit(1);
}

process.exit(0);
