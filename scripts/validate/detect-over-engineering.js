#!/usr/bin/env node

/**
 * Over-Engineering Detection Script
 *
 * Automatically scans components for over-engineering patterns and violations
 * of the minimal wrapper principle. Runs on CI and pre-commit hooks.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration for detection patterns
const DETECTION_PATTERNS = {
  // Anti-patterns that indicate over-engineering
  antiPatterns: [
    {
      pattern: /event\.preventDefault\(\)/g,
      severity: 'warning',
      message: 'Custom event.preventDefault() detected - USWDS should handle standard interactions',
      exemptions: ['form submission handling', 'accessibility keyboard navigation']
    },
    {
      pattern: /window\.scrollTo\(/g,
      severity: 'error',
      message: 'Custom scroll behavior detected - USWDS handles all navigation scrolling'
    },
    {
      pattern: /addEventListener\(['"](?:click|scroll|keydown|keyup)/g,
      severity: 'error',
      message: 'Custom event listeners for user interactions - USWDS should handle these'
    },
    {
      pattern: /private\s+(?:handle|setup|manage)(?:Click|Scroll|Key|Navigation|Custom)/g,
      severity: 'error',
      message: 'Custom interaction handler methods detected - violates minimal wrapper principle'
    },
    {
      pattern: /offsetTop|offsetLeft|getBoundingClientRect/g,
      severity: 'warning',
      message: 'Custom position calculations - USWDS likely handles this already'
    },
    {
      pattern: /history\.pushState|history\.replaceState/g,
      severity: 'warning',
      message: 'Manual history API usage - USWDS in-page navigation handles URL management'
    },
    {
      pattern: /(?:if|switch).*(?:mode|sections?\.length|manual)/g,
      severity: 'warning',
      message: 'Mode switching logic detected - consider if USWDS can handle all modes'
    }
  ],

  // Required patterns that should be present
  requiredPatterns: [
    {
      pattern: /data-web-component-managed/,
      message: 'Missing data-web-component-managed attribute'
    },
    {
      pattern: /import.*@uswds\/uswds\/js/,
      message: 'Missing USWDS JavaScript module import for interactive component'
    }
  ],

  // File size thresholds (lines of code)
  sizeThresholds: {
    warning: 300,  // Components over 300 lines should be reviewed
    error: 500     // Components over 500 lines likely over-engineered
  }
};

class OverEngineeringDetector {
  constructor() {
    this.violations = [];
    this.warnings = [];
    this.checkedFiles = 0;
  }

  /**
   * Scan all component files for over-engineering patterns
   */
  async scanComponents() {
    const componentsDir = path.join(__dirname, '../../src/components');
    const componentDirs = fs.readdirSync(componentsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    console.log(`🔍 Scanning ${componentDirs.length} components for over-engineering patterns...\n`);

    for (const componentDir of componentDirs) {
      const componentPath = path.join(componentsDir, componentDir);
      await this.scanComponent(componentPath, componentDir);
    }

    this.reportResults();
  }

  /**
   * Scan individual component for violations
   */
  async scanComponent(componentPath, componentName) {
    const tsFile = path.join(componentPath, `usa-${componentName}.ts`);

    if (!fs.existsSync(tsFile)) {
      return; // Skip if no main TypeScript file
    }

    const content = fs.readFileSync(tsFile, 'utf-8');
    this.checkedFiles++;

    // Check file size
    const lineCount = content.split('\n').length;
    if (lineCount > DETECTION_PATTERNS.sizeThresholds.error) {
      this.addViolation('error', `${componentName}`, `Component too large (${lineCount} lines) - likely over-engineered`);
    } else if (lineCount > DETECTION_PATTERNS.sizeThresholds.warning) {
      this.addViolation('warning', `${componentName}`, `Component size concerning (${lineCount} lines) - review for complexity`);
    }

    // Check for anti-patterns
    for (const antiPattern of DETECTION_PATTERNS.antiPatterns) {
      const matches = content.match(antiPattern.pattern);
      if (matches) {
        this.addViolation(
          antiPattern.severity,
          `${componentName}`,
          `${antiPattern.message} (found ${matches.length} instances)`
        );
      }
    }

    // Check for missing required patterns (only for interactive components)
    if (this.isInteractiveComponent(content)) {
      for (const requiredPattern of DETECTION_PATTERNS.requiredPatterns) {
        if (!requiredPattern.pattern.test(content)) {
          this.addViolation('warning', `${componentName}`, requiredPattern.message);
        }
      }
    }
  }

  /**
   * Determine if component is interactive (needs USWDS JavaScript)
   */
  isInteractiveComponent(content) {
    const interactiveIndicators = [
      /accordion|modal|combo-box|date-picker|file-input|menu|in-page-navigation|time-picker/i,
      /connectedCallback.*initialize/,
      /@uswds\/uswds\/js/
    ];

    return interactiveIndicators.some(pattern => pattern.test(content));
  }

  /**
   * Add violation to tracking arrays
   */
  addViolation(severity, component, message) {
    const violation = { component, message, severity };

    if (severity === 'error') {
      this.violations.push(violation);
    } else {
      this.warnings.push(violation);
    }
  }

  /**
   * Report scan results
   */
  reportResults() {
    console.log(`📊 Scanned ${this.checkedFiles} component files\n`);

    if (this.violations.length === 0 && this.warnings.length === 0) {
      console.log('✅ No over-engineering patterns detected! Components follow minimal wrapper principle.\n');
      return;
    }

    // Report errors
    if (this.violations.length > 0) {
      console.log('🚨 OVER-ENGINEERING VIOLATIONS (must be fixed):');
      console.log('=' .repeat(60));
      this.violations.forEach(v => {
        console.log(`❌ ${v.component}: ${v.message}`);
      });
      console.log('');
    }

    // Report warnings
    if (this.warnings.length > 0) {
      console.log('⚠️  OVER-ENGINEERING WARNINGS (should be reviewed):');
      console.log('=' .repeat(60));
      this.warnings.forEach(w => {
        console.log(`⚠️  ${w.component}: ${w.message}`);
      });
      console.log('');
    }

    // Guidance
    console.log('💡 REMEDIATION GUIDANCE:');
    console.log('- Research USWDS source code for the component first');
    console.log('- Remove custom event handlers and let USWDS handle behavior');
    console.log('- Ensure components initialize USWDS regardless of mode/configuration');
    console.log('- Consider if the functionality already exists in USWDS');
    console.log('- Refer to CLAUDE.md Over-Engineering Prevention Guidelines');
    console.log('');

    // Exit with error code if violations found
    if (this.violations.length > 0) {
      console.log(`❌ Found ${this.violations.length} violations that must be fixed before merging.`);
      process.exit(1);
    }
  }
}

// Main execution
async function main() {
  const detector = new OverEngineeringDetector();
  await detector.scanComponents();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { OverEngineeringDetector };