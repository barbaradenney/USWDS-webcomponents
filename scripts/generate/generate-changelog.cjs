#!/usr/bin/env node

/**
 * Automated Changelog Generator
 *
 * Generates CHANGELOG.md from conventional commit messages.
 * Groups commits by type (feat, fix, docs, etc.)
 * Links to GitHub issues and PRs
 *
 * Usage:
 *   npm run changelog:generate
 *   npm run changelog:generate -- --from=v1.0.0 --to=HEAD
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const fromTag = args.find(arg => arg.startsWith('--from='))?.split('=')[1] || 'HEAD~10';
const toTag = args.find(arg => arg.startsWith('--to='))?.split('=')[1] || 'HEAD';
const outputFile = args.find(arg => arg.startsWith('--output='))?.split('=')[1] || 'CHANGELOG.md';

// ANSI colors
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const BLUE = '\x1b[34m';
const YELLOW = '\x1b[33m';

console.log(BOLD + BLUE + '📋 Generating Changelog...' + RESET + '\n');

// Get commits
const commits = execSync(`git log ${fromTag}..${toTag} --pretty=format:"%H|%s|%b|%an|%ae|%ad" --date=short`)
  .toString()
  .trim()
  .split('\n')
  .filter(Boolean);

console.log(`Found ${commits.length} commits between ${fromTag} and ${toTag}\n`);

// Parse commits
const commitTypes = {
  feat: { title: '✨ Features', commits: [] },
  fix: { title: '🐛 Bug Fixes', commits: [] },
  docs: { title: '📚 Documentation', commits: [] },
  style: { title: '💎 Styles', commits: [] },
  refactor: { title: '♻️ Refactoring', commits: [] },
  perf: { title: '⚡ Performance', commits: [] },
  test: { title: '✅ Tests', commits: [] },
  build: { title: '🏗️ Build System', commits: [] },
  ci: { title: '👷 CI/CD', commits: [] },
  chore: { title: '🔧 Chores', commits: [] },
  revert: { title: '⏪ Reverts', commits: [] },
};

const conventionalCommitRegex = /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(([^)]+)\))?: (.+)$/;

commits.forEach(commit => {
  const parts = commit.split('|');
  if (parts.length < 6) return; // Skip malformed commits

  const [hash, subject, body, author, email, date] = parts;
  if (!subject) return; // Skip if no subject

  const match = subject.match(conventionalCommitRegex);

  if (match) {
    const [, type, , scope, description] = match;

    // Extract issue/PR numbers from subject and body
    const issueRegex = /#(\d+)/g;
    const issues = [...(subject + body).matchAll(issueRegex)].map(m => m[1]);
    const prRegex = /\(#(\d+)\)/g;
    const prs = [...subject.matchAll(prRegex)].map(m => m[1]);

    if (commitTypes[type]) {
      commitTypes[type].commits.push({
        hash: hash.substring(0, 7),
        scope,
        description,
        author,
        email,
        date,
        issues,
        prs,
      });
    }
  }
});

// Generate changelog content
let changelog = `# Changelog\n\n`;
changelog += `All notable changes to this project will be documented in this file.\n\n`;
changelog += `The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),\n`;
changelog += `and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).\n\n`;

// Get current version from package.json
let currentVersion = 'Unreleased';
try {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  currentVersion = pkg.version;
} catch (err) {
  // Ignore
}

const today = new Date().toISOString().split('T')[0];
changelog += `## [${currentVersion}] - ${today}\n\n`;

// Add sections for each commit type
Object.entries(commitTypes).forEach(([type, data]) => {
  if (data.commits.length > 0) {
    changelog += `### ${data.title}\n\n`;

    data.commits.forEach(commit => {
      let line = `- `;

      if (commit.scope) {
        line += `**${commit.scope}:** `;
      }

      line += commit.description;

      // Add issue/PR links
      if (commit.issues.length > 0) {
        const uniqueIssues = [...new Set(commit.issues)];
        line += ` (${uniqueIssues.map(i => `[#${i}](https://github.com/YOUR_ORG/uswds-wc/issues/${i})`).join(', ')})`;
      }

      line += ` ([${commit.hash}](https://github.com/YOUR_ORG/uswds-wc/commit/${commit.hash}))`;

      changelog += line + '\n';
    });

    changelog += '\n';
  }
});

// Check if existing changelog exists
let existingChangelog = '';
if (fs.existsSync(outputFile)) {
  existingChangelog = fs.readFileSync(outputFile, 'utf8');

  // Preserve previous versions
  const versionRegex = /## \[[\d.]+\]/;
  const match = existingChangelog.match(versionRegex);
  if (match) {
    const previousVersionsStart = existingChangelog.indexOf(match[0]);
    const previousVersions = existingChangelog.substring(previousVersionsStart);
    changelog += '---\n\n' + previousVersions;
  }
}

// Write changelog
fs.writeFileSync(outputFile, changelog);

console.log(GREEN + `✅ Changelog generated: ${outputFile}` + RESET);
console.log('\n' + YELLOW + 'Summary:' + RESET);

Object.entries(commitTypes).forEach(([type, data]) => {
  if (data.commits.length > 0) {
    console.log(`  ${data.title}: ${data.commits.length} commits`);
  }
});

console.log('\n' + BLUE + '💡 Next steps:' + RESET);
console.log('  1. Review the generated changelog');
console.log('  2. Update GitHub URLs with your org name');
console.log('  3. Commit: git add CHANGELOG.md && git commit -m "docs: update changelog"');
console.log('');
