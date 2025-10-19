#!/usr/bin/env node

/**
 * Pre-Commit Discovered Issues Checker
 *
 * Blocks new commits when unfixed discovered issues exist.
 * Enforces the "Fix All Discovered Issues" policy by checking for
 * .git/DISCOVERED_ISSUES.json tracker file.
 *
 * Part of the "Fix All Discovered Issues" enforcement system.
 * See: CLAUDE.md - Discovered Issues Policy
 */

const { existsSync, readFileSync } = require('fs');
const { join } = require('path');

const DISCOVERED_ISSUES_FILE = join(process.cwd(), '.git', 'DISCOVERED_ISSUES.json');

function checkDiscoveredIssues() {
  // If no discovered issues file exists, allow commit
  if (!existsSync(DISCOVERED_ISSUES_FILE)) {
    return; // Success - no discovered issues blocking
  }

  // Read and parse discovered issues
  let issues;
  try {
    const content = readFileSync(DISCOVERED_ISSUES_FILE, 'utf-8');
    issues = JSON.parse(content);
  } catch (error) {
    console.error('⚠️  Warning: Could not read discovered issues file');
    console.error(`   ${error.message}`);
    return; // Don't block on read errors
  }

  // Block the commit and display helpful information
  console.error('');
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('❌ COMMIT BLOCKED - DISCOVERED ISSUES MUST BE FIXED FIRST');
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('');
  console.error(`📋 Issues discovered in commit: ${issues.commit.substring(0, 8)}`);
  console.error(`📅 Discovered at: ${new Date(issues.timestamp).toLocaleString()}`);
  console.error('');
  console.error('🚨 Components requiring fixes:');
  console.error('');

  issues.issues.forEach((issue, index) => {
    console.error(`   ${index + 1}. ${issue.component} (${issue.type})`);
    if (issue.score !== undefined) {
      console.error(`      Score: ${issue.score}%`);
    }
    if (issue.description) {
      console.error(`      Issue: ${issue.description}`);
    }
    console.error('');
  });

  console.error('📖 Required Actions:');
  console.error('   1. Fix all discovered issues listed above');
  console.error('   2. Commit your fixes');
  console.error('   3. Tracker will auto-delete when validation passes');
  console.error('');
  console.error('💡 Helpful Commands:');
  console.error('   npm run validate                    - See all validation errors');
  console.error('   npm run validate:uswds-compliance   - USWDS compliance details');
  console.error('   npm run lint                        - Linting details');
  console.error('   npm run typecheck                   - TypeScript details');
  console.error('   npm run fix:discovered              - Show discovered issues');
  console.error('');
  console.error('📖 See: CLAUDE.md - Discovered Issues Policy');
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('');

  process.exit(1);
}

// Only run if called directly
if (require.main === module) {
  checkDiscoveredIssues();
}

module.exports = { checkDiscoveredIssues };
