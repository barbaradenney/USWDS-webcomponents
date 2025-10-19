#!/usr/bin/env node

/**
 * Guidelines Freshness Checker
 *
 * Automatically checks if our over-engineering prevention guidelines
 * are still relevant and suggests updates based on:
 * - New USWDS releases
 * - New component patterns
 * - Changes in detection patterns
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class GuidelinesFreshnessChecker {
  constructor() {
    this.suggestions = [];
    this.warnings = [];
  }

  async checkFreshness() {
    console.log('🔍 Checking guidelines freshness...\n');

    await this.checkUSWDSVersionChanges();
    await this.checkNewComponentPatterns();
    await this.checkDetectionPatternRelevance();
    await this.checkDocumentationUpdates();

    this.reportResults();
  }

  /**
   * Check if USWDS version has changed and guidelines need updating
   */
  async checkUSWDSVersionChanges() {
    try {
      const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8'));
      const currentUSWDSVersion = packageJson.dependencies['@uswds/uswds'];

      // Check if version has changed recently (last 30 days)
      const packageLockPath = path.join(__dirname, '../package-lock.json');
      if (fs.existsSync(packageLockPath)) {
        const stats = fs.statSync(packageLockPath);
        const daysSinceUpdate = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);

        if (daysSinceUpdate < 30) {
          this.addSuggestion(
            'USWDS version updated recently',
            `Review USWDS ${currentUSWDSVersion} changelog for new JavaScript patterns that might need detection rules`
          );
        }
      }
    } catch (error) {
      this.addWarning('Could not check USWDS version changes', error.message);
    }
  }

  /**
   * Check if new component patterns have emerged that need guidelines
   */
  async checkNewComponentPatterns() {
    const componentsDir = path.join(__dirname, '../../src/components');
    const componentDirs = fs.readdirSync(componentsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    // Look for components with complex patterns that might need new detection rules
    const complexPatterns = [];

    for (const componentDir of componentDirs) {
      const tsFile = path.join(componentsDir, componentDir, `usa-${componentDir}.ts`);

      if (fs.existsSync(tsFile)) {
        const content = fs.readFileSync(tsFile, 'utf-8');
        const lineCount = content.split('\n').length;

        // Check for components with unusual patterns
        if (lineCount > 400) {
          complexPatterns.push({
            component: componentDir,
            lines: lineCount,
            hasCustomEvents: /addEventListener.*(?:click|scroll|key)/.test(content),
            hasCustomState: /private.*(?:state|active|current)/.test(content)
          });
        }
      }
    }

    if (complexPatterns.length > 0) {
      this.addSuggestion(
        'Complex components detected',
        `Review these components for new over-engineering patterns: ${complexPatterns.map(p => p.component).join(', ')}`
      );
    }
  }

  /**
   * Check if detection patterns are still catching violations
   */
  async checkDetectionPatternRelevance() {
    // This would ideally analyze git history to see if patterns are being caught
    const guidelinesPath = path.join(__dirname, '../CLAUDE.md');
    const content = fs.readFileSync(guidelinesPath, 'utf-8');

    // Check when guidelines were last updated
    const stats = fs.statSync(guidelinesPath);
    const daysSinceUpdate = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceUpdate > 90) {
      this.addSuggestion(
        'Guidelines not updated recently',
        `Guidelines last updated ${Math.floor(daysSinceUpdate)} days ago. Consider reviewing for relevance.`
      );
    }

    // Check for patterns that might be outdated
    const outdatedPatterns = [
      { pattern: 'setupEventHandlers', reason: 'Most components now use USWDS initialization' },
      { pattern: 'handleClick', reason: 'USWDS handles click events natively' }
    ];

    for (const pattern of outdatedPatterns) {
      if (!content.includes(pattern.pattern)) {
        this.addSuggestion(
          'Missing detection pattern',
          `Consider adding detection for "${pattern.pattern}": ${pattern.reason}`
        );
      }
    }
  }

  /**
   * Check if documentation examples are still valid
   */
  async checkDocumentationUpdates() {
    const claudePath = path.join(__dirname, '../CLAUDE.md');
    const content = fs.readFileSync(claudePath, 'utf-8');

    // Check for code examples that reference deprecated patterns
    const deprecatedExamples = [
      'addEventListener',
      'handleClick',
      'setupEventHandlers',
      'event.preventDefault'
    ];

    const foundDeprecated = deprecatedExamples.filter(pattern =>
      content.includes(`// DON'T:`) && content.includes(pattern)
    );

    if (foundDeprecated.length > 0) {
      this.addSuggestion(
        'Documentation examples found',
        `Good - guidelines include examples for: ${foundDeprecated.join(', ')}`
      );
    }

    // Check for missing modern patterns
    const modernPatterns = [
      'initializeUSWDS',
      'data-web-component-managed',
      '@uswds/uswds/js'
    ];

    const missingModern = modernPatterns.filter(pattern => !content.includes(pattern));
    if (missingModern.length > 0) {
      this.addWarning(
        'Missing modern patterns in documentation',
        `Consider adding examples for: ${missingModern.join(', ')}`
      );
    }
  }

  addSuggestion(title, message) {
    this.suggestions.push({ title, message });
  }

  addWarning(title, message) {
    this.warnings.push({ title, message });
  }

  reportResults() {
    console.log('📊 Guidelines Freshness Report\n');

    if (this.suggestions.length === 0 && this.warnings.length === 0) {
      console.log('✅ Guidelines appear fresh and up-to-date!\n');
      return;
    }

    // Report suggestions
    if (this.suggestions.length > 0) {
      console.log('💡 SUGGESTIONS for keeping guidelines fresh:');
      console.log('=' .repeat(60));
      this.suggestions.forEach(s => {
        console.log(`💡 ${s.title}: ${s.message}`);
      });
      console.log('');
    }

    // Report warnings
    if (this.warnings.length > 0) {
      console.log('⚠️  WARNINGS about guideline freshness:');
      console.log('=' .repeat(60));
      this.warnings.forEach(w => {
        console.log(`⚠️  ${w.title}: ${w.message}`);
      });
      console.log('');
    }

    // Provide guidance
    console.log('🔄 MAINTENANCE ACTIONS:');
    console.log('- Review CLAUDE.md Over-Engineering Prevention Guidelines monthly');
    console.log('- Update detection patterns when new anti-patterns emerge');
    console.log('- Add new examples based on actual violations found');
    console.log('- Check for USWDS updates that introduce new JavaScript patterns');
    console.log('- Run this check after major USWDS version updates');
    console.log('');
  }
}

// Main execution
async function main() {
  const checker = new GuidelinesFreshnessChecker();
  await checker.checkFreshness();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { GuidelinesFreshnessChecker };