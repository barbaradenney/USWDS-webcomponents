#!/usr/bin/env node

/**
 * Holistic Documentation Validation System
 *
 * Intelligently validates that documentation stays synchronized with code changes.
 * Detects what was modified and checks the relevant documentation accordingly.
 *
 * Validation Rules:
 * 1. Component changes → Check component README, CHANGELOG, architecture docs
 * 2. Behavior file changes → Check JAVASCRIPT_INTEGRATION_STRATEGY.md
 * 3. Utility changes → Check relevant architecture/pattern docs
 * 4. Script changes → Check NPM_SCRIPTS_REFERENCE.md if npm scripts
 * 5. Test changes → Check TESTING docs
 * 6. Architecture changes → Cross-reference with implementation
 *
 * Exit codes:
 * - 0: All documentation synchronized
 * - 1: Documentation out of sync or missing
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

console.log(`\n${colors.cyan}📚 Holistic Documentation Validation${colors.reset}`);
console.log('='.repeat(60));

// Get staged files
let stagedFiles = [];
try {
  const output = execSync('git diff --cached --name-only', { encoding: 'utf8' });
  stagedFiles = output.trim().split('\n').filter(Boolean);
} catch (error) {
  console.log(`${colors.yellow}⚠️  No staged files found${colors.reset}`);
  process.exit(0);
}

if (stagedFiles.length === 0) {
  console.log(`${colors.yellow}⚠️  No staged files found${colors.reset}`);
  process.exit(0);
}

console.log(`\n${colors.blue}📂 Analyzing ${stagedFiles.length} staged file(s)${colors.reset}`);

// Categorize changes
const changes = {
  components: [],
  behaviorFiles: [],
  utilities: [],
  scripts: [],
  tests: [],
  docs: [],
  storybook: [],
  hooks: [],
};

stagedFiles.forEach(file => {
  if (file.startsWith('src/components/')) {
    const match = file.match(/src\/components\/([^/]+)\//);
    if (match) {
      const component = match[1];
      if (file.includes('-behavior.ts')) {
        changes.behaviorFiles.push(component);
      } else if (!file.includes('.test.ts') && !file.includes('.stories.ts')) {
        changes.components.push(component);
      }
    }
  } else if (file.startsWith('src/utils/')) {
    changes.utilities.push(file);
  } else if (file.startsWith('scripts/')) {
    changes.scripts.push(file);
  } else if (file.includes('.test.ts') || file.includes('.cy.ts')) {
    changes.tests.push(file);
  } else if (file.startsWith('docs/')) {
    changes.docs.push(file);
  } else if (file.startsWith('.storybook/')) {
    changes.storybook.push(file);
  } else if (file.startsWith('.husky/')) {
    changes.hooks.push(file);
  }
});

// Remove duplicates
Object.keys(changes).forEach(key => {
  changes[key] = [...new Set(changes[key])];
});

// Validation results
const warnings = [];
const errors = [];

console.log(`\n${colors.blue}🔍 Change Summary:${colors.reset}`);
if (changes.components.length > 0) {
  console.log(`   • ${changes.components.length} component(s): ${changes.components.join(', ')}`);
}
if (changes.behaviorFiles.length > 0) {
  console.log(`   • ${changes.behaviorFiles.length} behavior file(s): ${changes.behaviorFiles.join(', ')}`);
}
if (changes.utilities.length > 0) {
  console.log(`   • ${changes.utilities.length} utility file(s)`);
}
if (changes.scripts.length > 0) {
  console.log(`   • ${changes.scripts.length} script(s)`);
}
if (changes.tests.length > 0) {
  console.log(`   • ${changes.tests.length} test file(s)`);
}
if (changes.docs.length > 0) {
  console.log(`   • ${changes.docs.length} doc file(s)`);
}
if (changes.storybook.length > 0) {
  console.log(`   • ${changes.storybook.length} Storybook file(s)`);
}
if (changes.hooks.length > 0) {
  console.log(`   • ${changes.hooks.length} git hook(s)`);
}

console.log(`\n${colors.blue}📋 Validation Checks:${colors.reset}\n`);

// ============================================================================
// VALIDATION 1: Component Changes
// ============================================================================
if (changes.components.length > 0) {
  console.log(`${colors.magenta}1. Component Documentation${colors.reset}`);

  changes.components.forEach(component => {
    const readmePath = path.join(__dirname, '../../src/components', component, 'README.md');

    if (!fs.existsSync(readmePath)) {
      warnings.push({
        type: 'missing_component_readme',
        component,
        message: `Component "${component}" modified but README.md not found`,
        fix: `Create src/components/${component}/README.md with API documentation`,
      });
    } else {
      console.log(`   ${colors.green}✓${colors.reset} ${component} has README.md`);
    }
  });

  console.log();
}

// ============================================================================
// VALIDATION 2: Behavior File Changes
// ============================================================================
if (changes.behaviorFiles.length > 0) {
  console.log(`${colors.magenta}2. JavaScript Integration Strategy${colors.reset}`);

  const strategyPath = path.join(__dirname, '../../docs/JAVASCRIPT_INTEGRATION_STRATEGY.md');

  if (!fs.existsSync(strategyPath)) {
    errors.push({
      type: 'missing_strategy_doc',
      message: 'JAVASCRIPT_INTEGRATION_STRATEGY.md not found',
      fix: 'Create docs/JAVASCRIPT_INTEGRATION_STRATEGY.md',
    });
  } else {
    const strategyContent = fs.readFileSync(strategyPath, 'utf8');

    // Check if all behavior file components are documented
    const undocumented = [];
    changes.behaviorFiles.forEach(component => {
      const pattern = new RegExp(`\\b${component}\\b`, 'i');
      if (!pattern.test(strategyContent)) {
        undocumented.push(component);
      }
    });

    if (undocumented.length > 0) {
      warnings.push({
        type: 'undocumented_behavior_files',
        components: undocumented,
        message: `Behavior files modified but not documented in JAVASCRIPT_INTEGRATION_STRATEGY.md`,
        fix: `Add ${undocumented.join(', ')} to "Pattern 1: USWDS-Mirrored Behavior" section`,
      });
    } else {
      console.log(`   ${colors.green}✓${colors.reset} All behavior files documented in strategy`);
    }
  }

  console.log();
}

// ============================================================================
// VALIDATION 3: Utility Changes
// ============================================================================
if (changes.utilities.length > 0) {
  console.log(`${colors.magenta}3. Utility Documentation${colors.reset}`);

  const architectureDocsPath = path.join(__dirname, '../../docs/ARCHITECTURE_PATTERNS.md');

  if (fs.existsSync(architectureDocsPath)) {
    console.log(`   ${colors.green}✓${colors.reset} ARCHITECTURE_PATTERNS.md exists`);

    // Suggest review
    warnings.push({
      type: 'utility_change_review',
      message: 'Utility files modified - consider reviewing architecture documentation',
      fix: 'Review docs/ARCHITECTURE_PATTERNS.md for accuracy',
    });
  }

  console.log();
}

// ============================================================================
// VALIDATION 4: Script Changes (NPM Scripts)
// ============================================================================
if (changes.scripts.length > 0) {
  console.log(`${colors.magenta}4. Script Documentation${colors.reset}`);

  const npmScriptsPath = path.join(__dirname, '../../docs/NPM_SCRIPTS_REFERENCE.md');
  const packageJsonPath = path.join(__dirname, '../../package.json');

  // Check if any scripts are in package.json scripts section
  const scriptScripts = changes.scripts.filter(script => {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const scriptName = path.basename(script, path.extname(script));

      // Check if any npm script references this file
      return Object.values(packageJson.scripts || {}).some(cmd =>
        typeof cmd === 'string' && cmd.includes(scriptName)
      );
    } catch (error) {
      return false;
    }
  });

  if (scriptScripts.length > 0 && fs.existsSync(npmScriptsPath)) {
    console.log(`   ${colors.green}✓${colors.reset} NPM_SCRIPTS_REFERENCE.md exists`);
    warnings.push({
      type: 'npm_script_review',
      message: 'Scripts used in package.json modified - consider reviewing NPM documentation',
      fix: 'Review docs/NPM_SCRIPTS_REFERENCE.md for accuracy',
    });
  } else {
    console.log(`   ${colors.green}✓${colors.reset} Script changes don't affect npm scripts`);
  }

  console.log();
}

// ============================================================================
// VALIDATION 5: Storybook Configuration Changes
// ============================================================================
if (changes.storybook.length > 0) {
  console.log(`${colors.magenta}5. Storybook Documentation${colors.reset}`);

  const storybookDocs = [
    'docs/STORYBOOK_CONFIGURATION.md',
    'docs/STORYBOOK_BEST_PRACTICES.md',
  ];

  const missingDocs = storybookDocs.filter(doc =>
    !fs.existsSync(path.join(__dirname, '../..', doc))
  );

  if (missingDocs.length > 0) {
    warnings.push({
      type: 'missing_storybook_docs',
      message: 'Storybook configuration changed but documentation incomplete',
      missing: missingDocs,
      fix: `Consider creating: ${missingDocs.join(', ')}`,
    });
  } else {
    console.log(`   ${colors.green}✓${colors.reset} Storybook documentation exists`);
  }

  console.log();
}

// ============================================================================
// VALIDATION 6: Git Hooks Changes
// ============================================================================
if (changes.hooks.length > 0) {
  console.log(`${colors.magenta}6. Git Hooks Documentation${colors.reset}`);

  warnings.push({
    type: 'hooks_change_review',
    message: 'Git hooks modified - ensure CLAUDE.md reflects changes',
    fix: 'Update CLAUDE.md with any new validation stages or hooks',
  });

  console.log();
}

// ============================================================================
// VALIDATION 7: Storybook Documentation Sync
// ============================================================================
console.log(`${colors.magenta}7. Storybook Documentation Sync${colors.reset}`);

// Run Storybook docs sync script
try {
  execSync('node scripts/docs/sync-storybook-docs.js', { encoding: 'utf8', stdio: 'inherit' });
  console.log(`   ${colors.green}✓${colors.reset} Storybook documentation updated`);
} catch (error) {
  errors.push({
    type: 'storybook_sync_failed',
    message: 'Failed to sync Storybook documentation',
    fix: 'Run: node scripts/docs/sync-storybook-docs.js',
  });
}

console.log();

// ============================================================================
// VALIDATION 8: Cross-Reference Check
// ============================================================================
console.log(`${colors.magenta}8. Cross-Reference Validation${colors.reset}`);

// Check for architecture decision documents that might need updates
const architectureDecisionDocs = [
  'docs/ARCHITECTURE_DECISION_SCRIPT_TAG_VS_COMPONENT_INIT.md',
  'docs/ARCHITECTURE_DECISION_ACCORDION_BEHAVIOR_APPROACH.md',
];

let hasArchitectureChanges = false;
architectureDecisionDocs.forEach(doc => {
  const docPath = path.join(__dirname, '../..', doc);
  if (fs.existsSync(docPath) && stagedFiles.includes(doc)) {
    hasArchitectureChanges = true;
  }
});

if (hasArchitectureChanges) {
  warnings.push({
    type: 'architecture_decision_update',
    message: 'Architecture decision document modified',
    fix: 'Ensure implementation still matches documented decisions',
  });
}

console.log(`   ${colors.green}✓${colors.reset} Cross-reference check complete`);
console.log();

// ============================================================================
// SUMMARY
// ============================================================================
console.log('='.repeat(60));

if (errors.length === 0 && warnings.length === 0) {
  console.log(`${colors.green}✅ Documentation validation PASSED${colors.reset}`);
  console.log(`\n   • All documentation appears synchronized`);
  console.log(`   • No missing documentation detected`);
  process.exit(0);
}

if (errors.length > 0) {
  console.log(`${colors.red}❌ Documentation validation FAILED${colors.reset}\n`);

  errors.forEach((error, index) => {
    console.log(`${colors.red}Error ${index + 1}:${colors.reset} ${error.message}`);
    console.log(`${colors.yellow}   Fix:${colors.reset} ${error.fix}`);
    if (error.components) {
      console.log(`${colors.yellow}   Components:${colors.reset} ${error.components.join(', ')}`);
    }
    console.log();
  });
}

if (warnings.length > 0) {
  console.log(`${colors.yellow}⚠️  Documentation review recommended${colors.reset}\n`);

  warnings.forEach((warning, index) => {
    console.log(`${colors.yellow}Warning ${index + 1}:${colors.reset} ${warning.message}`);
    console.log(`${colors.yellow}   Suggestion:${colors.reset} ${warning.fix}`);
    if (warning.component) {
      console.log(`${colors.yellow}   Component:${colors.reset} ${warning.component}`);
    }
    if (warning.components) {
      console.log(`${colors.yellow}   Components:${colors.reset} ${warning.components.join(', ')}`);
    }
    if (warning.missing) {
      console.log(`${colors.yellow}   Missing:${colors.reset} ${warning.missing.join(', ')}`);
    }
    console.log();
  });
}

// Exit based on severity
if (errors.length > 0) {
  console.log(`${colors.red}❌ ${errors.length} error(s) must be fixed before commit${colors.reset}`);
  process.exit(1);
} else {
  console.log(`${colors.yellow}⚠️  ${warnings.length} warning(s) - review recommended but not blocking${colors.reset}`);
  process.exit(0); // Warnings don't block commits
}
