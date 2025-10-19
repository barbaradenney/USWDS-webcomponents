#!/usr/bin/env node

/**
 * Commit Message Validator - Enforces --no-verify Contract
 *
 * When --no-verify is used to bypass pre-commit validation, this enforces
 * that the commit message documents WHY validation was bypassed and WHAT
 * unrelated issues were discovered.
 *
 * Part of the "Fix All Discovered Issues" enforcement system.
 * See: CLAUDE.md - Discovered Issues Policy
 */

const { readFileSync, existsSync } = require('fs');
const { join } = require('path');

const COMMIT_MSG_FILE = join(process.cwd(), '.git', 'COMMIT_EDITMSG');

// Keywords that indicate proper documentation of --no-verify usage
const VALID_BYPASS_KEYWORDS = [
  'pre-existing',
  'unrelated',
  '--no-verify due to',
  'validation failure',
  'validation failures in',
  'discovered issue',
  'will fix next',
  'will fix in next commit'
];

function validateCommitMessage() {
  if (!existsSync(COMMIT_MSG_FILE)) {
    console.error('⚠️  Warning: Could not find commit message file');
    return; // Don't block commits if we can't read the message
  }

  const commitMsg = readFileSync(COMMIT_MSG_FILE, 'utf-8');

  // Check if this commit used --no-verify
  // We detect this by checking if the commit-msg hook is being run
  // (pre-commit was skipped but commit-msg still runs)
  const args = process.argv.slice(2);
  const isAmend = args.includes('--amend');

  // Look for indicators that --no-verify was likely used
  const hasNoVerifyIndicators =
    commitMsg.toLowerCase().includes('--no-verify') ||
    commitMsg.toLowerCase().includes('no-verify');

  if (!hasNoVerifyIndicators && !isAmend) {
    // Normal commit, no special validation needed
    return;
  }

  // If --no-verify was mentioned, ensure proper documentation
  if (hasNoVerifyIndicators) {
    const hasValidDocumentation = VALID_BYPASS_KEYWORDS.some(keyword =>
      commitMsg.toLowerCase().includes(keyword.toLowerCase())
    );

    if (!hasValidDocumentation) {
      console.error('');
      console.error('❌ COMMIT MESSAGE CONTRACT VIOLATION!');
      console.error('');
      console.error('When using --no-verify to bypass validation, you MUST document:');
      console.error('  • WHY validation was bypassed');
      console.error('  • WHAT unrelated issues were discovered');
      console.error('  • COMMITMENT to fix them next');
      console.error('');
      console.error('Required keywords (include at least one):');
      VALID_BYPASS_KEYWORDS.forEach(keyword => {
        console.error(`  - "${keyword}"`);
      });
      console.error('');
      console.error('Example commit message:');
      console.error('');
      console.error('  fix(header): add aria-label to menu button');
      console.error('  ');
      console.error('  Adds missing accessibility attribute for screen readers.');
      console.error('  ');
      console.error('  Note: Used --no-verify due to pre-existing validation failures');
      console.error('  in character-count component (missing USWDS JS integration).');
      console.error('  Will fix in next commit.');
      console.error('');
      console.error('See: CLAUDE.md - Discovered Issues Policy');
      console.error('');
      process.exit(1);
    }

    console.log('✅ Commit message properly documents --no-verify bypass');
  }
}

// Only run if called directly (not when imported)
if (require.main === module) {
  validateCommitMessage();
}

module.exports = { validateCommitMessage };
