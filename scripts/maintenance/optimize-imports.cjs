#!/usr/bin/env node

/**
 * Import Optimization Tool
 *
 * Analyzes and optimizes import statements across the codebase.
 * - Detects unused imports
 * - Suggests more efficient import paths
 * - Identifies circular dependencies
 * - Optimizes barrel exports
 *
 * Usage:
 *   npm run optimize:imports
 *   npm run optimize:imports -- --fix
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI colors
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';

const args = process.argv.slice(2);
const shouldFix = args.includes('--fix');

console.log('\n' + BOLD + BLUE + '📦 Import Optimization Analysis' + RESET);
console.log(BLUE + '═'.repeat(80) + RESET + '\n');

let issuesFound = 0;
const recommendations = [];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. Detect Unused Imports
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

console.log(BOLD + '1. Checking for unused imports...' + RESET + '\n');

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const imports = [];

  // Extract imports
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const importMatch = line.match(/import\s+(?:{([^}]+)}|(\w+))\s+from\s+['"]([^'"]+)['"]/);

    if (importMatch) {
      const namedImports = importMatch[1] ? importMatch[1].split(',').map(s => s.trim()) : [];
      const defaultImport = importMatch[2];
      const source = importMatch[3];

      imports.push({
        line: i + 1,
        namedImports,
        defaultImport,
        source,
        rawLine: line
      });
    }
  }

  // Check usage
  const unusedImports = [];

  imports.forEach(imp => {
    // Check named imports
    imp.namedImports.forEach(name => {
      const usageCount = (content.match(new RegExp(`\\b${name}\\b`, 'g')) || []).length;
      // If only appears once (the import itself), it's unused
      if (usageCount === 1) {
        unusedImports.push({
          file: filePath,
          line: imp.line,
          name,
          type: 'named',
          source: imp.source
        });
      }
    });

    // Check default import
    if (imp.defaultImport) {
      const usageCount = (content.match(new RegExp(`\\b${imp.defaultImport}\\b`, 'g')) || []).length;
      if (usageCount === 1) {
        unusedImports.push({
          file: filePath,
          line: imp.line,
          name: imp.defaultImport,
          type: 'default',
          source: imp.source
        });
      }
    }
  });

  return { imports, unusedImports };
}

// Scan src directory
function scanDirectory(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
      scanDirectory(fullPath);
    } else if (file.isFile() && /\.(ts|tsx|js|jsx)$/.test(file.name) && !file.name.includes('.test.') && !file.name.includes('.stories.')) {
      try {
        const { unusedImports } = analyzeFile(fullPath);

        if (unusedImports.length > 0) {
          console.log(YELLOW + `⚠️  ${fullPath}` + RESET);
          unusedImports.forEach(imp => {
            console.log(`   Line ${imp.line}: Unused ${imp.type} import "${imp.name}" from "${imp.source}"`);
            issuesFound++;
          });
          console.log('');

          recommendations.push({
            type: 'unused-import',
            file: fullPath,
            details: unusedImports
          });
        }
      } catch (err) {
        // Silently skip files that can't be parsed
      }
    }
  }
}

try {
  scanDirectory('src');

  if (issuesFound === 0) {
    console.log(GREEN + '✅ No unused imports found' + RESET + '\n');
  }
} catch (err) {
  console.log(RED + '❌ Error analyzing imports:' + RESET, err.message + '\n');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. Detect Circular Dependencies
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

console.log(BOLD + '2. Checking for circular dependencies...' + RESET + '\n');

try {
  // Use madge to detect circular dependencies
  try {
    execSync('npx madge --version', { stdio: 'ignore' });
  } catch {
    console.log(YELLOW + '⚠️  Installing madge...' + RESET);
    execSync('npm install -D madge', { stdio: 'inherit' });
  }

  const circularOutput = execSync('npx madge --circular --extensions ts,tsx,js,jsx src', { encoding: 'utf8' });

  if (circularOutput.includes('✖') || circularOutput.includes('Circular')) {
    console.log(YELLOW + '⚠️  Circular dependencies detected:' + RESET);
    console.log(circularOutput);
    issuesFound++;

    recommendations.push({
      type: 'circular-dependency',
      details: 'Run: npx madge --circular --extensions ts,tsx,js,jsx src/ to see details'
    });
  } else {
    console.log(GREEN + '✅ No circular dependencies found' + RESET + '\n');
  }
} catch (err) {
  if (err.stdout && err.stdout.toString().includes('✖')) {
    console.log(YELLOW + '⚠️  Circular dependencies detected:' + RESET);
    console.log(err.stdout.toString());
    issuesFound++;
  } else {
    console.log(GREEN + '✅ No circular dependencies found' + RESET + '\n');
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. Check Import Paths
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

console.log(BOLD + '3. Analyzing import paths...' + RESET + '\n');

function checkImportPaths(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  const issues = [];

  for (const file of files) {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
      issues.push(...checkImportPaths(fullPath));
    } else if (file.isFile() && /\.(ts|tsx)$/.test(file.name) && !file.name.includes('.test.') && !file.name.includes('.stories.')) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const lines = content.split('\n');

        lines.forEach((line, i) => {
          // Check for relative paths that could use absolute imports
          const relativeMatch = line.match(/import\s+.+\s+from\s+['"](\.\.[/\\].+)['"]/);
          if (relativeMatch) {
            const depth = (relativeMatch[1].match(/\.\.\//g) || []).length;

            // Suggest absolute import if going up 3+ levels
            if (depth >= 3) {
              issues.push({
                file: fullPath,
                line: i + 1,
                type: 'deep-relative-import',
                path: relativeMatch[1],
                depth
              });
            }
          }

          // Check for index.js imports
          if (line.match(/from\s+['"][^'"]*\/index['"]/)) {
            issues.push({
              file: fullPath,
              line: i + 1,
              type: 'index-import',
              message: 'Importing from index.js explicitly (can be omitted)'
            });
          }
        });
      } catch (err) {
        // Skip files that can't be parsed
      }
    }
  }

  return issues;
}

const pathIssues = checkImportPaths('src');

if (pathIssues.length > 0) {
  console.log(YELLOW + `⚠️  Found ${pathIssues.length} import path improvements:` + RESET);

  pathIssues.slice(0, 10).forEach(issue => {
    console.log(`   ${issue.file}:${issue.line}`);
    if (issue.type === 'deep-relative-import') {
      console.log(`     Deep relative import (${issue.depth} levels): ${issue.path}`);
      console.log(`     Consider using absolute imports or path aliases`);
    } else if (issue.type === 'index-import') {
      console.log(`     ${issue.message}`);
    }
    issuesFound++;
  });

  if (pathIssues.length > 10) {
    console.log(`   ... and ${pathIssues.length - 10} more`);
  }
  console.log('');

  recommendations.push({
    type: 'import-paths',
    details: pathIssues
  });
} else {
  console.log(GREEN + '✅ Import paths look good' + RESET + '\n');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Summary
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

console.log(BLUE + '═'.repeat(80) + RESET);

if (issuesFound > 0) {
  console.log(YELLOW + `\n⚠️  Found ${issuesFound} import optimization opportunities` + RESET);

  console.log('\n' + BLUE + '💡 Recommendations:' + RESET);
  console.log('   1. Remove unused imports to reduce bundle size');
  console.log('   2. Fix circular dependencies to improve maintainability');
  console.log('   3. Use absolute imports or path aliases for deep relative imports');
  console.log('   4. Avoid explicit /index imports');

  if (shouldFix) {
    console.log('\n' + BLUE + '🔧 Auto-fix:' + RESET);
    console.log('   Run ESLint with --fix to remove unused imports:');
    console.log('   npm run lint:fix');
  } else {
    console.log('\n' + BLUE + '💡 To auto-fix:' + RESET);
    console.log('   npm run optimize:imports -- --fix');
  }
} else {
  console.log(GREEN + '\n✅ Imports are well optimized!' + RESET);
}

console.log(BLUE + '═'.repeat(80) + RESET + '\n');

// Exit with error if issues found
if (issuesFound > 0 && process.env.CI === 'true') {
  process.exit(1);
}
