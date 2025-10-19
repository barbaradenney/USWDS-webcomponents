#!/usr/bin/env node

/**
 * Discovered Issues Generator
 *
 * Runs validation and extracts discovered issues into a structured format.
 * Creates .git/DISCOVERED_ISSUES.json to track issues that MUST be fixed
 * before new work can begin.
 *
 * Part of the "Fix All Discovered Issues" enforcement system.
 * See: CLAUDE.md - Discovered Issues Policy
 */

const { execSync } = require('child_process');
const { writeFileSync, readFileSync } = require('fs');
const { join } = require('path');

const DISCOVERED_ISSUES_FILE = join(process.cwd(), '.git', 'DISCOVERED_ISSUES.json');

function getCurrentCommitInfo() {
  try {
    const commitHash = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
    const commitMsg = execSync('git log -1 --pretty=%B', { encoding: 'utf-8' }).trim();
    return { commitHash, commitMsg };
  } catch (error) {
    return { commitHash: 'unknown', commitMsg: 'unknown' };
  }
}

function extractIssuesFromValidation() {
  const issues = [];

  try {
    // Run USWDS compliance validation
    execSync('npm run validate:uswds-compliance', { encoding: 'utf-8', stdio: 'pipe' });
  } catch (error) {
    const output = error.stdout || error.stderr || '';

    // Parse validation output for component issues
    const componentIssuePattern = /📦\s+(\S+)\s+\((\d+)%\)/g;
    const criticalIssuePattern = /❌\s+(.+)/g;

    let match;
    let currentComponent = null;

    // Extract components with scores < 100%
    while ((match = componentIssuePattern.exec(output)) !== null) {
      const [, component, score] = match;
      if (parseInt(score) < 100) {
        currentComponent = component;
        issues.push({
          component,
          score: parseInt(score),
          type: 'uswds-compliance',
          issues: []
        });
      }
    }

    // Extract critical issues
    while ((match = criticalIssuePattern.exec(output)) !== null) {
      const issue = match[1].trim();
      if (currentComponent && issues.length > 0) {
        issues[issues.length - 1].issues.push(issue);
      }
    }
  }

  // Also check for other validation failures
  try {
    execSync('npm run lint', { encoding: 'utf-8', stdio: 'pipe' });
  } catch (error) {
    if (error.stdout || error.stderr) {
      issues.push({
        component: 'lint',
        type: 'linting',
        issues: ['Linting errors detected - run: npm run lint']
      });
    }
  }

  try {
    execSync('npm run typecheck', { encoding: 'utf-8', stdio: 'pipe' });
  } catch (error) {
    if (error.stdout || error.stderr) {
      issues.push({
        component: 'typescript',
        type: 'type-errors',
        issues: ['TypeScript errors detected - run: npm run typecheck']
      });
    }
  }

  return issues;
}

function generateDiscoveredIssuesFile() {
  console.log('🔍 Scanning for discovered issues...');
  console.log('');

  const { commitHash, commitMsg } = getCurrentCommitInfo();
  const issues = extractIssuesFromValidation();

  if (issues.length === 0) {
    console.log('✅ No validation issues discovered!');
    console.log('   You are free to continue with new work.');
    return;
  }

  const discoveredIssues = {
    commit: commitHash,
    commitMessage: commitMsg.split('\n')[0], // First line only
    timestamp: new Date().toISOString(),
    mustFixBeforeNewWork: true,
    issues: issues.map(issue => ({
      component: issue.component,
      type: issue.type,
      score: issue.score,
      description: issue.issues.join(', ')
    }))
  };

  writeFileSync(DISCOVERED_ISSUES_FILE, JSON.stringify(discoveredIssues, null, 2));

  console.log('🚨 DISCOVERED ISSUES TRACKER CREATED');
  console.log('');
  console.log(`   File: .git/DISCOVERED_ISSUES.json`);
  console.log(`   Commit: ${commitHash.substring(0, 8)}`);
  console.log(`   Issues: ${issues.length} component(s) need attention`);
  console.log('');
  console.log('📋 Issues Summary:');
  issues.forEach(issue => {
    console.log(`   • ${issue.component} (${issue.type})`);
    if (issue.score) {
      console.log(`     Score: ${issue.score}%`);
    }
    issue.issues.forEach(desc => {
      console.log(`     - ${desc}`);
    });
  });
  console.log('');
  console.log('⚠️  REQUIRED ACTIONS:');
  console.log('   1. Fix all discovered issues');
  console.log('   2. Commit fixes');
  console.log('   3. Tracker will auto-delete on successful validation');
  console.log('');
  console.log('❌ BLOCKED UNTIL FIXED:');
  console.log('   • Cannot start new work');
  console.log('   • Pre-commit hook will check for this file');
  console.log('');
  console.log('💡 Helpful commands:');
  console.log('   npm run validate              - See all validation errors');
  console.log('   npm run validate:uswds-compliance  - USWDS compliance details');
  console.log('   npm run lint                  - Linting details');
  console.log('   npm run typecheck             - TypeScript details');
  console.log('');
}

// Run if called directly
if (require.main === module) {
  generateDiscoveredIssuesFile();
}

module.exports = { generateDiscoveredIssuesFile, extractIssuesFromValidation };
