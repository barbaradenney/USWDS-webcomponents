#!/usr/bin/env node

/**
 * Documentation Placeholder Validator
 *
 * Ensures documentation files don't contain placeholder text.
 * This enforces that .project-metadata.json is populated with real values.
 *
 * Checks:
 * - No [INSERT EMAIL] or [UPDATE THIS] markers
 * - No example.com email addresses
 * - No remaining template syntax {{...}}
 *
 * Exit codes:
 * - 0: No placeholders found
 * - 1: Placeholders found (blocking)
 * - 2: Template source files found (informational)
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '../..');

// Files to check for placeholders
const FILES_TO_CHECK = [
  'CONTRIBUTING.md',
  'SECURITY.md',
  'CODE_OF_CONDUCT.md'  // Future file
];

// Placeholder patterns to detect
const PLACEHOLDER_PATTERNS = [
  {
    pattern: /\[INSERT EMAIL\]/gi,
    description: 'Generic email placeholder',
    severity: 'error'
  },
  {
    pattern: /\[UPDATE THIS\]/gi,
    description: 'Update marker',
    severity: 'error'
  },
  {
    pattern: /security@example\.com/gi,
    description: 'Example security email',
    severity: 'error'
  },
  {
    pattern: /conduct@example\.com/gi,
    description: 'Example conduct email',
    severity: 'error'
  },
  {
    pattern: /contact@example\.com/gi,
    description: 'Example contact email',
    severity: 'error'
  },
  {
    pattern: /\{\{[^\}]+\}\}/g,
    description: 'Template syntax not processed',
    severity: 'error'
  }
];

/**
 * Check a file for placeholders
 */
function checkFile(filePath) {
  const relativePath = path.relative(PROJECT_ROOT, filePath);
  const content = fs.readFileSync(filePath, 'utf8');
  const violations = [];

  PLACEHOLDER_PATTERNS.forEach(({ pattern, description, severity }) => {
    const matches = content.match(pattern);
    if (matches) {
      const uniqueMatches = [...new Set(matches)];
      violations.push({
        file: relativePath,
        pattern: pattern.source,
        description,
        severity,
        matches: uniqueMatches,
        count: matches.length
      });
    }
  });

  return violations;
}

/**
 * Check if template source files exist
 */
function checkTemplateSourceExists() {
  const templateDir = path.join(PROJECT_ROOT, '.templates');
  if (!fs.existsSync(templateDir)) {
    return { exists: false };
  }

  const templates = fs.readdirSync(templateDir)
    .filter(f => f.endsWith('.template.md'));

  return {
    exists: true,
    count: templates.length,
    files: templates
  };
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  const isVerbose = args.includes('--verbose') || args.includes('-v');

  if (isVerbose) {
    console.log('📝 Documentation Placeholder Validator\n');
  }

  // Check for template sources
  const templateInfo = checkTemplateSourceExists();
  if (!templateInfo.exists && isVerbose) {
    console.log('ℹ️  No .templates/ directory found - skipping validation');
    console.log('   (This validation only applies when using template-based docs)\n');
    process.exit(0);
  }

  if (isVerbose && templateInfo.exists) {
    console.log(`📂 Found ${templateInfo.count} template(s):`);
    templateInfo.files.forEach(f => console.log(`   • ${f}`));
    console.log('');
  }

  // Check each documentation file
  let allViolations = [];
  let filesChecked = 0;
  let filesWithPlaceholders = 0;

  FILES_TO_CHECK.forEach(fileName => {
    const filePath = path.join(PROJECT_ROOT, fileName);

    if (!fs.existsSync(filePath)) {
      if (isVerbose) {
        console.log(`⏭️  ${fileName} - not found (skipped)`);
      }
      return;
    }

    filesChecked++;
    const violations = checkFile(filePath);

    if (violations.length > 0) {
      filesWithPlaceholders++;
      allViolations = allViolations.concat(violations);

      if (isVerbose) {
        console.log(`❌ ${fileName} - ${violations.length} placeholder(s) found`);
        violations.forEach(v => {
          console.log(`   • ${v.description}: ${v.matches.join(', ')}`);
        });
      }
    } else {
      if (isVerbose) {
        console.log(`✅ ${fileName} - clean`);
      }
    }
  });

  // Report results
  if (allViolations.length === 0) {
    if (isVerbose) {
      console.log(`\n✅ All documentation files clean (${filesChecked} checked)`);
    }
    process.exit(0);
  } else {
    console.log('');
    console.log('❌ Documentation Placeholder Violations Detected\n');

    // Group violations by file
    const violationsByFile = {};
    allViolations.forEach(v => {
      if (!violationsByFile[v.file]) {
        violationsByFile[v.file] = [];
      }
      violationsByFile[v.file].push(v);
    });

    Object.entries(violationsByFile).forEach(([file, violations]) => {
      console.log(`📄 ${file}:`);
      violations.forEach(v => {
        console.log(`   • ${v.description}`);
        v.matches.forEach(m => console.log(`     - "${m}"`));
      });
      console.log('');
    });

    console.log('💡 Fix:');
    console.log('   1. Update .project-metadata.json with real contact information:');
    console.log('      - contact.security.email (replace "security@example.com")');
    console.log('      - contact.codeOfConduct.email (replace "conduct@example.com")');
    console.log('');
    console.log('   2. Regenerate documentation:');
    console.log('      npm run docs:templates');
    console.log('');
    console.log('   3. Review and commit the changes');
    console.log('');

    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

module.exports = { checkFile, PLACEHOLDER_PATTERNS };
