#!/usr/bin/env node

/**
 * Pattern Usage Analytics
 *
 * Analyzes pattern usage across the codebase to provide insights:
 * - Which patterns are most/least used
 * - Where patterns are being used (tests, stories, examples)
 * - Pattern composition (which patterns use other patterns)
 * - Property usage statistics
 * - Event listener patterns
 *
 * Exit codes:
 * 0 - Analysis complete
 */

const fs = require('fs');
const path = require('path');

const PATTERNS_DIR = path.join(__dirname, '../../packages/uswds-wc-patterns/src/patterns');
const PACKAGES_DIR = path.join(__dirname, '../../packages');

const PATTERNS = [
  'address',
  'phone-number',
  'name',
  'contact-preferences',
  'language-selection',
  'form-summary',
  'multi-step-form',
];

// Pattern tag names
const PATTERN_TAGS = {
  'address': 'usa-address-pattern',
  'phone-number': 'usa-phone-number-pattern',
  'name': 'usa-name-pattern',
  'contact-preferences': 'usa-contact-preferences-pattern',
  'language-selection': 'usa-language-selector-pattern',
  'form-summary': 'usa-form-summary-pattern',
  'multi-step-form': 'usa-multi-step-form-pattern',
};

class PatternAnalytics {
  constructor() {
    this.results = {
      patterns: {},
      summary: {
        totalPatterns: PATTERNS.length,
        totalUsages: 0,
        mostUsed: null,
        leastUsed: null,
      },
    };

    PATTERNS.forEach((pattern) => {
      this.results.patterns[pattern] = {
        tagName: PATTERN_TAGS[pattern],
        usages: {
          tests: 0,
          stories: 0,
          examples: 0,
          documentation: 0,
          other: 0,
        },
        locations: [],
        imports: [],
        properties: {},
        events: {},
        composition: [], // Other patterns this pattern uses
      };
    });
  }

  /**
   * Search for pattern usage in files
   */
  searchPatternUsage(pattern, tagName) {
    const data = this.results.patterns[pattern];

    // Search in all TypeScript and JavaScript files
    this.searchDirectory(PACKAGES_DIR, (filePath, content) => {
      // Skip the pattern's own implementation file
      const patternName = pattern === 'language-selection' ? 'language-selector' : pattern;
      if (filePath.includes(`${pattern}/usa-${patternName}-pattern.ts`)) {
        return;
      }

      // Check for tag usage
      const tagRegex = new RegExp(`<${tagName}[\\s>]`, 'g');
      const tagMatches = content.match(tagRegex);

      if (tagMatches) {
        const count = tagMatches.length;

        // Categorize usage
        if (filePath.includes('.test.ts')) {
          data.usages.tests += count;
        } else if (filePath.includes('.stories.ts')) {
          data.usages.stories += count;
        } else if (filePath.includes('examples/') || filePath.includes('demo/')) {
          data.usages.examples += count;
        } else if (filePath.includes('.mdx') || filePath.includes('.md')) {
          data.usages.documentation += count;
        } else {
          data.usages.other += count;
        }

        data.locations.push({
          file: filePath.replace(PACKAGES_DIR, ''),
          count,
        });
      }

      // Check for imports
      const importRegex = new RegExp(
        `import.*from.*['"].*${pattern}.*['"]|import.*['"].*${pattern}.*['"]`,
        'g'
      );
      const importMatches = content.match(importRegex);

      if (importMatches) {
        data.imports.push({
          file: filePath.replace(PACKAGES_DIR, ''),
          imports: importMatches,
        });
      }

      // Analyze property usage
      this.analyzePropertyUsage(pattern, tagName, content, data);

      // Analyze event listeners
      this.analyzeEventListeners(pattern, content, data);
    });
  }

  /**
   * Analyze which properties are being used
   */
  analyzePropertyUsage(pattern, tagName, content, data) {
    // Match property bindings in the pattern's tag
    const propertyRegex = new RegExp(
      `<${tagName}[^>]*?\\s+(\\w+(?:-\\w+)*)=`,
      'g'
    );

    let match;
    while ((match = propertyRegex.exec(content)) !== null) {
      const propName = match[1];
      if (!data.properties[propName]) {
        data.properties[propName] = 0;
      }
      data.properties[propName]++;
    }
  }

  /**
   * Analyze event listener patterns
   */
  analyzeEventListeners(pattern, content, data) {
    // Match addEventListener or @event-name patterns
    const patternPrefix = pattern.replace(/-/g, '');
    const eventRegex = new RegExp(
      `addEventListener\\(['"]([\\w-]+)['"]|@([\\w-]+)=`,
      'g'
    );

    let match;
    while ((match = eventRegex.exec(content)) !== null) {
      const eventName = match[1] || match[2];
      // Only count if it looks like a pattern event
      if (
        eventName &&
        (eventName.includes('pattern') ||
          eventName.includes(pattern) ||
          eventName.includes('change') ||
          eventName.includes('ready'))
      ) {
        if (!data.events[eventName]) {
          data.events[eventName] = 0;
        }
        data.events[eventName]++;
      }
    }
  }

  /**
   * Analyze pattern composition (which patterns use other patterns)
   */
  analyzeComposition() {
    PATTERNS.forEach((pattern) => {
      const patternName = pattern === 'language-selection' ? 'language-selector' : pattern;
      const patternFile = path.join(
        PATTERNS_DIR,
        pattern,
        `usa-${patternName}-pattern.ts`
      );

      if (fs.existsSync(patternFile)) {
        const content = fs.readFileSync(patternFile, 'utf-8');

        // Check if this pattern uses other patterns
        PATTERNS.forEach((otherPattern) => {
          if (otherPattern === pattern) return;

          const otherTag = PATTERN_TAGS[otherPattern];
          if (content.includes(`<${otherTag}`)) {
            this.results.patterns[pattern].composition.push(otherPattern);
          }
        });
      }
    });
  }

  /**
   * Recursively search directory for files
   */
  searchDirectory(dir, callback) {
    if (!fs.existsSync(dir)) return;

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    entries.forEach((entry) => {
      const fullPath = path.join(dir, entry.name);

      // Skip node_modules and dist directories
      if (entry.name === 'node_modules' || entry.name === 'dist') {
        return;
      }

      if (entry.isDirectory()) {
        this.searchDirectory(fullPath, callback);
      } else if (
        entry.isFile() &&
        (entry.name.endsWith('.ts') ||
          entry.name.endsWith('.js') ||
          entry.name.endsWith('.mdx') ||
          entry.name.endsWith('.md'))
      ) {
        try {
          const content = fs.readFileSync(fullPath, 'utf-8');
          callback(fullPath, content);
        } catch (error) {
          // Skip files that can't be read
        }
      }
    });
  }

  /**
   * Calculate summary statistics
   */
  calculateSummary() {
    let maxUsages = 0;
    let minUsages = Infinity;
    let mostUsedPattern = null;
    let leastUsedPattern = null;
    let totalUsages = 0;

    Object.entries(this.results.patterns).forEach(([pattern, data]) => {
      const totalPatternUsages = Object.values(data.usages).reduce((a, b) => a + b, 0);
      totalUsages += totalPatternUsages;

      if (totalPatternUsages > maxUsages) {
        maxUsages = totalPatternUsages;
        mostUsedPattern = pattern;
      }

      if (totalPatternUsages < minUsages) {
        minUsages = totalPatternUsages;
        leastUsedPattern = pattern;
      }
    });

    this.results.summary.totalUsages = totalUsages;
    this.results.summary.mostUsed = { pattern: mostUsedPattern, count: maxUsages };
    this.results.summary.leastUsed = { pattern: leastUsedPattern, count: minUsages };
  }

  /**
   * Generate analytics report
   */
  generateReport() {
    console.log('📊 Pattern Usage Analytics Report\n');
    console.log('='.repeat(80));
    console.log('');

    // Summary
    console.log('📈 Summary Statistics\n');
    console.log(`Total Patterns: ${this.results.summary.totalPatterns}`);
    console.log(`Total Usages: ${this.results.summary.totalUsages}`);
    console.log(
      `Average Usage per Pattern: ${(
        this.results.summary.totalUsages / this.results.summary.totalPatterns
      ).toFixed(1)}`
    );
    console.log('');

    if (this.results.summary.mostUsed) {
      console.log(
        `Most Used: ${this.results.summary.mostUsed.pattern} (${this.results.summary.mostUsed.count} usages)`
      );
    }
    if (this.results.summary.leastUsed) {
      console.log(
        `Least Used: ${this.results.summary.leastUsed.pattern} (${this.results.summary.leastUsed.count} usages)`
      );
    }
    console.log('');

    // Pattern-by-pattern breakdown
    console.log('='.repeat(80));
    console.log('');
    console.log('🔍 Pattern Details\n');

    Object.entries(this.results.patterns)
      .sort((a, b) => {
        const totalA = Object.values(a[1].usages).reduce((sum, val) => sum + val, 0);
        const totalB = Object.values(b[1].usages).reduce((sum, val) => sum + val, 0);
        return totalB - totalA;
      })
      .forEach(([pattern, data]) => {
        const totalUsages = Object.values(data.usages).reduce((sum, val) => sum + val, 0);

        console.log(`📦 ${pattern} (${data.tagName})`);
        console.log(`   Total Usages: ${totalUsages}`);
        console.log('');

        console.log('   Usage Breakdown:');
        console.log(`   • Tests: ${data.usages.tests}`);
        console.log(`   • Stories: ${data.usages.stories}`);
        console.log(`   • Examples: ${data.usages.examples}`);
        console.log(`   • Documentation: ${data.usages.documentation}`);
        console.log(`   • Other: ${data.usages.other}`);
        console.log('');

        // Most used properties
        const topProperties = Object.entries(data.properties)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);

        if (topProperties.length > 0) {
          console.log('   Most Used Properties:');
          topProperties.forEach(([prop, count]) => {
            console.log(`   • ${prop}: ${count} times`);
          });
          console.log('');
        }

        // Events
        const topEvents = Object.entries(data.events)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);

        if (topEvents.length > 0) {
          console.log('   Event Listeners:');
          topEvents.forEach(([event, count]) => {
            console.log(`   • ${event}: ${count} times`);
          });
          console.log('');
        }

        // Composition
        if (data.composition.length > 0) {
          console.log('   Uses Patterns:');
          data.composition.forEach((otherPattern) => {
            console.log(`   • ${otherPattern}`);
          });
          console.log('');
        }

        console.log('');
      });

    // Recommendations
    console.log('='.repeat(80));
    console.log('');
    console.log('💡 Recommendations\n');

    const unusedPatterns = Object.entries(this.results.patterns).filter(
      ([, data]) => Object.values(data.usages).reduce((a, b) => a + b, 0) === 0
    );

    if (unusedPatterns.length > 0) {
      console.log('⚠️  Unused Patterns (consider adding examples):');
      unusedPatterns.forEach(([pattern]) => {
        console.log(`   • ${pattern}`);
      });
      console.log('');
    }

    const underTestedPatterns = Object.entries(this.results.patterns).filter(
      ([, data]) => data.usages.tests < 3
    );

    if (underTestedPatterns.length > 0) {
      console.log('🧪 Patterns with Low Test Coverage:');
      underTestedPatterns.forEach(([pattern, data]) => {
        console.log(`   • ${pattern}: ${data.usages.tests} test file(s)`);
      });
      console.log('');
    }

    const noStoryPatterns = Object.entries(this.results.patterns).filter(
      ([, data]) => data.usages.stories === 0
    );

    if (noStoryPatterns.length > 0) {
      console.log('📚 Patterns without Storybook Stories:');
      noStoryPatterns.forEach(([pattern]) => {
        console.log(`   • ${pattern}`);
      });
      console.log('');
    }

    console.log('='.repeat(80));
    console.log('');
  }

  /**
   * Export analytics data to JSON
   */
  exportToJSON() {
    const outputPath = path.join(__dirname, '../../.analytics/pattern-usage.json');
    const outputDir = path.dirname(outputPath);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(this.results, null, 2));
    console.log(`📁 Detailed analytics exported to: ${outputPath}`);
    console.log('');
  }

  /**
   * Run full analysis
   */
  analyze() {
    console.log('🔍 Analyzing pattern usage across codebase...\n');

    // Search for each pattern
    PATTERNS.forEach((pattern) => {
      const tagName = PATTERN_TAGS[pattern];
      this.searchPatternUsage(pattern, tagName);
    });

    // Analyze composition
    this.analyzeComposition();

    // Calculate summary
    this.calculateSummary();

    // Generate report
    this.generateReport();

    // Export to JSON
    this.exportToJSON();
  }
}

function main() {
  const analytics = new PatternAnalytics();
  analytics.analyze();

  console.log('✅ Pattern usage analysis complete!\n');
  process.exit(0);
}

// Allow running directly or importing for testing
if (require.main === module) {
  main();
}

module.exports = { PatternAnalytics };
