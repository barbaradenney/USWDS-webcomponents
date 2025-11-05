#!/usr/bin/env node

/**
 * Update Pattern Changelog
 *
 * Interactive script for adding changelog entries to patterns.
 * Follows Keep a Changelog format with semantic versioning.
 *
 * Usage:
 *   node update-pattern-changelog.cjs
 *   node update-pattern-changelog.cjs --pattern=address
 *   node update-pattern-changelog.cjs --auto
 *
 * Exit codes:
 * 0 - Changelog updated successfully
 * 1 - Update failed
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const PATTERNS_DIR = path.join(__dirname, '../../packages/uswds-wc-patterns/src/patterns');

const PATTERNS = [
  'address',
  'phone-number',
  'name',
  'contact-preferences',
  'language-selection',
  'form-summary',
  'multi-step-form',
];

const CHANGE_TYPES = {
  added: '✨ Added',
  changed: '🔄 Changed',
  deprecated: '⚠️  Deprecated',
  removed: '🗑️  Removed',
  fixed: '🐛 Fixed',
  security: '🔒 Security',
};

const VERSION_TYPES = {
  major: 'Major version (breaking changes)',
  minor: 'Minor version (new features)',
  patch: 'Patch version (bug fixes)',
};

class ChangelogUpdater {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  /**
   * Prompt user for input
   */
  async prompt(question) {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  /**
   * Select pattern interactively
   */
  async selectPattern() {
    console.log('\n📦 Select Pattern:\n');
    PATTERNS.forEach((pattern, index) => {
      console.log(`${index + 1}. ${pattern}`);
    });
    console.log('');

    const answer = await this.prompt('Enter pattern number (or name): ');
    const num = parseInt(answer);

    if (num && num >= 1 && num <= PATTERNS.length) {
      return PATTERNS[num - 1];
    }

    if (PATTERNS.includes(answer)) {
      return answer;
    }

    console.log('❌ Invalid selection');
    return null;
  }

  /**
   * Select change type
   */
  async selectChangeType() {
    console.log('\n📝 Select Change Type:\n');
    Object.entries(CHANGE_TYPES).forEach(([key, label], index) => {
      console.log(`${index + 1}. ${label} (${key})`);
    });
    console.log('');

    const answer = await this.prompt('Enter change type number (or key): ');
    const num = parseInt(answer);

    const keys = Object.keys(CHANGE_TYPES);
    if (num && num >= 1 && num <= keys.length) {
      return keys[num - 1];
    }

    if (keys.includes(answer)) {
      return answer;
    }

    console.log('❌ Invalid selection');
    return null;
  }

  /**
   * Select version bump type
   */
  async selectVersionType() {
    console.log('\n🔢 Select Version Bump:\n');
    Object.entries(VERSION_TYPES).forEach(([key, label], index) => {
      console.log(`${index + 1}. ${label} (${key})`);
    });
    console.log('');

    const answer = await this.prompt('Enter version type number (or key): ');
    const num = parseInt(answer);

    const keys = Object.keys(VERSION_TYPES);
    if (num && num >= 1 && num <= keys.length) {
      return keys[num - 1];
    }

    if (keys.includes(answer)) {
      return answer;
    }

    console.log('❌ Invalid selection');
    return null;
  }

  /**
   * Parse current version from changelog
   */
  parseCurrentVersion(changelogPath) {
    if (!fs.existsSync(changelogPath)) {
      return '1.0.0';
    }

    const content = fs.readFileSync(changelogPath, 'utf-8');
    const versionMatch = content.match(/##\s+\[(\d+\.\d+\.\d+)\]/);

    return versionMatch ? versionMatch[1] : '1.0.0';
  }

  /**
   * Bump version based on type
   */
  bumpVersion(version, type) {
    const [major, minor, patch] = version.split('.').map(Number);

    if (type === 'major') {
      return `${major + 1}.0.0`;
    } else if (type === 'minor') {
      return `${major}.${minor + 1}.0`;
    } else {
      return `${major}.${minor}.${patch + 1}`;
    }
  }

  /**
   * Add entry to changelog
   */
  async addChangelogEntry(pattern, changeType, description, versionType) {
    const changelogPath = path.join(PATTERNS_DIR, pattern, 'CHANGELOG.md');

    if (!fs.existsSync(changelogPath)) {
      console.log(`❌ Changelog not found for ${pattern}`);
      console.log(`   Run: node scripts/changelog/init-pattern-changelogs.cjs`);
      return false;
    }

    // Read existing changelog
    let content = fs.readFileSync(changelogPath, 'utf-8');

    // Parse current version
    const currentVersion = this.parseCurrentVersion(changelogPath);
    const newVersion = this.bumpVersion(currentVersion, versionType);
    const today = new Date().toISOString().split('T')[0];

    // Check if unreleased section exists
    const unreleasedMatch = content.match(/##\s+\[Unreleased\]/);
    const changeTypeLabel = CHANGE_TYPES[changeType];

    if (unreleasedMatch) {
      // Add to unreleased section
      const changeTypeSection = `### ${changeTypeLabel}`;
      const changeTypeSectionMatch = content.match(new RegExp(`${changeTypeSection.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\n`));

      if (changeTypeSectionMatch) {
        // Add to existing change type section
        const insertIndex = changeTypeSectionMatch.index + changeTypeSectionMatch[0].length;
        content = content.slice(0, insertIndex) + `- ${description}\n` + content.slice(insertIndex);
      } else {
        // Create new change type section
        const unreleasedIndex = content.indexOf('[Unreleased]');
        const nextSectionIndex = content.indexOf('\n## ', unreleasedIndex);
        const insertIndex = nextSectionIndex !== -1 ? nextSectionIndex : content.length;

        content =
          content.slice(0, insertIndex) +
          `\n${changeTypeSection}\n\n- ${description}\n` +
          content.slice(insertIndex);
      }
    } else {
      // Create unreleased section
      const firstVersionIndex = content.indexOf('\n## [');
      const insertIndex = firstVersionIndex !== -1 ? firstVersionIndex : content.length;

      const unreleasedSection =
        `\n## [Unreleased]\n\n` +
        `### ${changeTypeLabel}\n\n` +
        `- ${description}\n`;

      content = content.slice(0, insertIndex) + unreleasedSection + content.slice(insertIndex);
    }

    // Write updated changelog
    fs.writeFileSync(changelogPath, content);

    console.log(`\n✅ Added to ${pattern} changelog:`);
    console.log(`   ${changeTypeLabel}: ${description}`);
    console.log(`   Version: ${newVersion} (${versionType})`);

    return true;
  }

  /**
   * Release unreleased changes
   */
  async releaseChanges(pattern) {
    const changelogPath = path.join(PATTERNS_DIR, pattern, 'CHANGELOG.md');

    if (!fs.existsSync(changelogPath)) {
      console.log(`❌ Changelog not found for ${pattern}`);
      return false;
    }

    let content = fs.readFileSync(changelogPath, 'utf-8');

    // Check for unreleased section
    if (!content.includes('[Unreleased]')) {
      console.log('ℹ️  No unreleased changes to release');
      return false;
    }

    // Get version type
    const versionType = await this.selectVersionType();
    if (!versionType) return false;

    // Calculate new version
    const currentVersion = this.parseCurrentVersion(changelogPath);
    const newVersion = this.bumpVersion(currentVersion, versionType);
    const today = new Date().toISOString().split('T')[0];

    // Replace [Unreleased] with version
    content = content.replace('[Unreleased]', `[${newVersion}] - ${today}`);

    // Write updated changelog
    fs.writeFileSync(changelogPath, content);

    console.log(`\n✅ Released ${pattern} version ${newVersion}`);

    return true;
  }

  /**
   * Interactive update flow
   */
  async interactiveUpdate() {
    console.log('📋 Pattern Changelog Updater\n');
    console.log('='.repeat(80));

    // Select pattern
    const pattern = await this.selectPattern();
    if (!pattern) {
      this.rl.close();
      process.exit(1);
    }

    console.log(`\n✅ Selected: ${pattern}`);

    // Ask for action
    console.log('\n🔧 Action:\n');
    console.log('1. Add new change');
    console.log('2. Release unreleased changes');
    console.log('');

    const action = await this.prompt('Enter action (1 or 2): ');

    if (action === '2') {
      await this.releaseChanges(pattern);
      this.rl.close();
      return;
    }

    // Select change type
    const changeType = await this.selectChangeType();
    if (!changeType) {
      this.rl.close();
      process.exit(1);
    }

    // Get description
    const description = await this.prompt('\n📝 Description: ');
    if (!description) {
      console.log('❌ Description required');
      this.rl.close();
      process.exit(1);
    }

    // Get version type
    const versionType = await this.selectVersionType();
    if (!versionType) {
      this.rl.close();
      process.exit(1);
    }

    // Add entry
    await this.addChangelogEntry(pattern, changeType, description, versionType);

    this.rl.close();
  }

  /**
   * Validate changelogs exist
   */
  validateChangelogs() {
    console.log('🔍 Validating pattern changelogs...\n');

    let missing = 0;

    PATTERNS.forEach((pattern) => {
      const changelogPath = path.join(PATTERNS_DIR, pattern, 'CHANGELOG.md');

      if (!fs.existsSync(changelogPath)) {
        console.log(`   ❌ ${pattern}: Missing CHANGELOG.md`);
        missing++;
      } else {
        console.log(`   ✅ ${pattern}: CHANGELOG.md exists`);
      }
    });

    console.log('');

    if (missing > 0) {
      console.log(`❌ ${missing} patterns missing changelogs`);
      console.log(`   Run: node scripts/changelog/init-pattern-changelogs.cjs`);
      return false;
    }

    console.log('✅ All patterns have changelogs');
    return true;
  }
}

async function main() {
  const args = process.argv.slice(2);

  const updater = new ChangelogUpdater();

  // Check for --validate flag
  if (args.includes('--validate')) {
    const valid = updater.validateChangelogs();
    process.exit(valid ? 0 : 1);
  }

  // Interactive mode
  await updater.interactiveUpdate();
  process.exit(0);
}

// Allow running directly or importing for testing
if (require.main === module) {
  main().catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
}

module.exports = { ChangelogUpdater };
