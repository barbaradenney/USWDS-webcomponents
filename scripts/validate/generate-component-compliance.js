#!/usr/bin/env node

/**
 * Component Compliance Script Generator
 *
 * Generates component-specific compliance scripts for all USWDS components
 * to provide clear visibility into what's being monitored for each component.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ComplianceScriptGenerator {
  constructor() {
    this.srcDir = path.join(__dirname, '../../src/components');
    this.complianceDir = path.join(__dirname, '../compliance/components');
    this.reportsDir = path.join(__dirname, '../compliance/reports');

    // Ensure directories exist
    [this.complianceDir, this.reportsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    this.componentRequirements = this.getComponentRequirements();
  }

  /**
   * Generate compliance scripts for all components
   */
  async generateAllComplianceScripts() {
    console.log('🏗️  Generating component-specific compliance scripts...\n');

    const components = this.getComponentList();
    const generatedScripts = [];

    for (const component of components) {
      console.log(`📝 Generating compliance script for ${component}...`);
      await this.generateComplianceScript(component);
      generatedScripts.push(component);
    }

    // Generate index file for easy access
    this.generateComplianceIndex(generatedScripts);

    // Update package.json with new scripts
    this.updatePackageJsonScripts(generatedScripts);

    console.log(`\n✅ Generated ${generatedScripts.length} component compliance scripts`);
    console.log(`📁 Scripts location: compliance/components/`);
    console.log(`📊 Reports location: compliance/reports/`);

    return generatedScripts;
  }

  /**
   * Get list of components
   */
  getComponentList() {
    return fs.readdirSync(this.srcDir)
      .filter(item => {
        const itemPath = path.join(this.srcDir, item);
        return fs.statSync(itemPath).isDirectory();
      })
      .filter(component => {
        // Check if component has actual TypeScript file
        const componentFile = path.join(this.srcDir, component, `usa-${component}.ts`);
        return fs.existsSync(componentFile);
      });
  }

  /**
   * Generate compliance script for specific component
   */
  async generateComplianceScript(componentName) {
    const requirements = this.componentRequirements[componentName] || this.getDefaultRequirements(componentName);
    const className = this.toPascalCase(componentName) + 'Compliance';

    const scriptContent = this.generateScriptTemplate(componentName, className, requirements);

    const scriptPath = path.join(this.complianceDir, `${componentName}-compliance.js`);
    fs.writeFileSync(scriptPath, scriptContent);

    // Also generate a README for the component
    const readmePath = path.join(this.complianceDir, `${componentName}-README.md`);
    const readmeContent = this.generateComponentReadme(componentName, requirements);
    fs.writeFileSync(readmePath, readmeContent);
  }

  /**
   * Generate script template
   */
  generateScriptTemplate(componentName, className, requirements) {
    return `#!/usr/bin/env node

/**
 * ${this.toTitleCase(componentName)} Component - USWDS Compliance Script
 *
 * This script contains all compliance requirements, tests, and validation
 * specific to the usa-${componentName} component.
 *
 * Generated on: ${new Date().toISOString()}
 */

import fs from 'fs';
import path from 'path';

export class ${className} {
  constructor() {
    this.componentName = '${componentName}';
    this.componentPath = 'src/components/${componentName}';
    this.results = {
      component: this.componentName,
      timestamp: new Date().toISOString(),
      status: 'unknown',
      scores: {
        uswdsAlignment: 0,
        accessibility: 0,
        behavior: 0,
        performance: 0,
        overall: 0
      },
      tests: {
        structure: [],
        behavior: [],
        accessibility: [],
        performance: [],
        security: []
      },
      issues: [],
      warnings: [],
      requirements: this.getUSWDSRequirements()
    };
  }

  /**
   * USWDS-specific requirements for ${componentName}
   */
  getUSWDSRequirements() {
    return ${JSON.stringify(requirements, null, 6)};
  }

  /**
   * Run complete compliance validation for ${componentName}
   */
  async runCompliance() {
    console.log(\`🔍 Running \${this.toTitleCase(this.componentName)} Compliance Validation...\\n\`);

    try {
      // Structure validation
      await this.validateStructure();

      // Behavior validation
      await this.validateBehavior();

      // Accessibility validation
      await this.validateAccessibility();

      // Performance validation
      await this.validatePerformance();

      // Security validation
      await this.validateSecurity();

      // Calculate scores
      this.calculateScores();

      // Generate report
      this.generateReport();

    } catch (error) {
      this.results.status = 'error';
      this.results.issues.push(\`Critical error: \${error.message}\`);
      console.error(\`❌ \${this.toTitleCase(this.componentName)} compliance validation failed:\`, error);
    }

    return this.results;
  }

  toTitleCase(str) {
    return str.replace(/-/g, ' ').replace(/\\b\\w/g, l => l.toUpperCase());
  }

  /**
   * Validate USWDS structure requirements
   */
  async validateStructure() {
    const componentFile = path.join(this.componentPath, \`usa-\${this.componentName}.ts\`);

    if (!fs.existsSync(componentFile)) {
      this.results.issues.push('Component file not found');
      return;
    }

    const content = fs.readFileSync(componentFile, 'utf8');

    // Check required CSS classes
    for (const requiredClass of this.results.requirements.structure.required) {
      const test = {
        name: \`Required class: \${requiredClass}\`,
        type: 'structure',
        status: content.includes(requiredClass) ? 'pass' : 'fail'
      };

      if (test.status === 'fail') {
        this.results.issues.push(\`Missing required USWDS class: \${requiredClass}\`);
      }

      this.results.tests.structure.push(test);
    }

    // Check for forbidden patterns
    if (this.results.requirements.structure.forbidden) {
      for (const forbiddenPattern of this.results.requirements.structure.forbidden) {
        const test = {
          name: \`Forbidden pattern: \${forbiddenPattern}\`,
          type: 'structure',
          status: !content.includes(forbiddenPattern) ? 'pass' : 'fail'
        };

        if (test.status === 'fail') {
          this.results.issues.push(\`Contains forbidden pattern: \${forbiddenPattern}\`);
        }

        this.results.tests.structure.push(test);
      }
    }
  }

  /**
   * Validate USWDS behavior requirements
   */
  async validateBehavior() {
    const componentFile = path.join(this.componentPath, \`usa-\${this.componentName}.ts\`);
    const content = fs.readFileSync(componentFile, 'utf8');

    // Check for behavior patterns based on component requirements
    const behaviorPatterns = this.results.requirements.behavior || {};

    // Progressive enhancement check
    const hasUSWDSIntegration = content.includes('USWDS') && content.includes('.on(this)');
    const hasFallback = content.includes('fallback') || content.includes('web component behavior');

    const progressiveTest = {
      name: 'Progressive enhancement',
      type: 'behavior',
      status: (hasUSWDSIntegration && hasFallback) ? 'pass' : 'fail',
      details: \`USWDS integration: \${hasUSWDSIntegration}, Fallback: \${hasFallback}\`
    };

    if (progressiveTest.status === 'fail') {
      this.results.warnings.push('Progressive enhancement incomplete');
    }

    this.results.tests.behavior.push(progressiveTest);

    // Check for event handling
    const hasEventHandling = content.includes('addEventListener') || content.includes('@click');
    if (Object.keys(behaviorPatterns).length > 0 && !hasEventHandling) {
      this.results.warnings.push('Interactive component missing event handling');
    }
  }

  /**
   * Validate accessibility requirements
   */
  async validateAccessibility() {
    const componentFile = path.join(this.componentPath, \`usa-\${this.componentName}.ts\`);
    const content = fs.readFileSync(componentFile, 'utf8');

    // Check ARIA attributes
    const ariaChecks = [
      { name: 'aria-expanded', pattern: /aria-expanded/g },
      { name: 'aria-controls', pattern: /aria-controls/g },
      { name: 'aria-label', pattern: /aria-label/g },
      { name: 'role attributes', pattern: /role=/g }
    ];

    for (const check of ariaChecks) {
      const matches = content.match(check.pattern);
      const test = {
        name: \`ARIA: \${check.name}\`,
        type: 'accessibility',
        status: matches ? 'pass' : 'info',
        details: matches ? \`Found \${matches.length} instances\` : 'Not found'
      };

      this.results.tests.accessibility.push(test);
    }

    // Check for keyboard event handling
    const hasKeyboardHandling = content.includes('keydown') || content.includes('keyup');
    const keyboardTest = {
      name: 'Keyboard event handling',
      type: 'accessibility',
      status: hasKeyboardHandling ? 'pass' : 'info',
      details: hasKeyboardHandling ? 'Keyboard events detected' : 'No keyboard events found'
    };

    this.results.tests.accessibility.push(keyboardTest);
  }

  /**
   * Validate performance requirements
   */
  async validatePerformance() {
    const componentFile = path.join(this.componentPath, \`usa-\${this.componentName}.ts\`);
    const content = fs.readFileSync(componentFile, 'utf8');

    // Check for event listener cleanup
    const hasCleanup = content.includes('removeEventListener') || content.includes('disconnectedCallback');
    const cleanupTest = {
      name: 'Event listener cleanup',
      type: 'performance',
      status: hasCleanup ? 'pass' : 'warning',
      details: hasCleanup ? 'Cleanup methods found' : 'No cleanup detected'
    };

    if (cleanupTest.status === 'warning') {
      this.results.warnings.push('Missing event listener cleanup');
    }

    this.results.tests.performance.push(cleanupTest);

    // Check for efficient DOM queries
    const queryCount = (content.match(/querySelector/g) || []).length;
    const efficiencyTest = {
      name: 'DOM query efficiency',
      type: 'performance',
      status: queryCount < 5 ? 'pass' : 'warning',
      details: \`\${queryCount} querySelector calls found\`
    };

    if (efficiencyTest.status === 'warning') {
      this.results.warnings.push('High number of DOM queries detected');
    }

    this.results.tests.performance.push(efficiencyTest);
  }

  /**
   * Validate security requirements
   */
  async validateSecurity() {
    const componentFile = path.join(this.componentPath, \`usa-\${this.componentName}.ts\`);
    const content = fs.readFileSync(componentFile, 'utf8');

    // Check for security issues
    const securityChecks = [
      { name: 'innerHTML usage', pattern: /innerHTML\\s*=/g, severity: 'high' },
      { name: 'eval() usage', pattern: /eval\\s*\\(/g, severity: 'critical' },
      { name: 'Unsafe URL handling', pattern: /location\\.href\\s*=/g, severity: 'medium' }
    ];

    for (const check of securityChecks) {
      const matches = content.match(check.pattern);
      if (matches) {
        const test = {
          name: \`Security: \${check.name}\`,
          type: 'security',
          status: 'fail',
          severity: check.severity,
          details: \`Found \${matches.length} instances\`
        };

        if (check.severity === 'critical' || check.severity === 'high') {
          this.results.issues.push(\`Security issue: \${check.name}\`);
        } else {
          this.results.warnings.push(\`Security concern: \${check.name}\`);
        }

        this.results.tests.security.push(test);
      }
    }
  }

  /**
   * Calculate component scores
   */
  calculateScores() {
    const testTypes = ['structure', 'behavior', 'accessibility', 'performance', 'security'];
    let totalScore = 0;
    let validTypes = 0;

    for (const type of testTypes) {
      const tests = this.results.tests[type];
      if (tests.length > 0) {
        const passCount = tests.filter(test => test.status === 'pass').length;
        const typeScore = (passCount / tests.length) * 100;
        this.results.scores[type] = Math.round(typeScore);
        totalScore += typeScore;
        validTypes++;
      }
    }

    this.results.scores.overall = validTypes > 0 ? Math.round(totalScore / validTypes) : 0;

    // Set status based on issues
    if (this.results.issues.length > 0) {
      this.results.status = 'failing';
    } else if (this.results.warnings.length > 0) {
      this.results.status = 'warning';
    } else {
      this.results.status = 'passing';
    }
  }

  /**
   * Generate compliance report
   */
  generateReport() {
    console.log('============================================================');
    console.log(\`📊 \${this.toTitleCase(this.componentName).toUpperCase()} COMPONENT COMPLIANCE REPORT\`);
    console.log('============================================================\\n');

    const statusIcon = this.results.status === 'passing' ? '✅' :
                      this.results.status === 'failing' ? '❌' : '⚠️';

    console.log(\`\${statusIcon} Overall Status: \${this.results.status.toUpperCase()}\`);
    console.log(\`📊 Overall Score: \${this.results.scores.overall}%\\n\`);

    console.log('📈 Detailed Scores:');
    const testTypes = ['structure', 'behavior', 'accessibility', 'performance', 'security'];
    for (const type of testTypes) {
      if (this.results.tests[type].length > 0) {
        console.log(\`   \${type}: \${this.results.scores[type]}%\`);
      }
    }
    console.log('');

    if (this.results.issues.length > 0) {
      console.log('🚨 Critical Issues:');
      this.results.issues.forEach(issue => {
        console.log(\`   • \${issue}\`);
      });
      console.log('');
    }

    if (this.results.warnings.length > 0) {
      console.log('⚠️  Warnings:');
      this.results.warnings.slice(0, 5).forEach(warning => {
        console.log(\`   • \${warning}\`);
      });
      if (this.results.warnings.length > 5) {
        console.log(\`   • ... and \${this.results.warnings.length - 5} more warnings\`);
      }
      console.log('');
    }

    console.log('📋 Test Summary:');
    for (const type of testTypes) {
      const tests = this.results.tests[type];
      if (tests.length > 0) {
        const passing = tests.filter(test => test.status === 'pass').length;
        console.log(\`   \${type}: \${passing}/\${tests.length} tests passing\`);
      }
    }

    // Save detailed report
    const reportPath = \`./compliance/reports/\${this.componentName}-compliance-\${Date.now()}.json\`;
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(\`\\n📋 Detailed report saved: \${reportPath}\`);
  }
}

// CLI execution
if (import.meta.url === \`file://\${process.argv[1]}\`) {
  const compliance = new ${className}();
  compliance.runCompliance().then((results) => {
    if (results.status === 'failing') {
      process.exit(1);
    }
  });
}

export default ${className};`;
  }

  /**
   * Generate component README
   */
  generateComponentReadme(componentName, requirements) {
    return `# ${this.toTitleCase(componentName)} Component Compliance

## Overview
This document outlines the USWDS compliance requirements and monitoring for the **usa-${componentName}** component.

## Compliance Requirements

### Structure Requirements
${requirements.structure ? `
**Required CSS Classes:**
${requirements.structure.required.map(cls => `- \`${cls}\``).join('\n')}

${requirements.structure.forbidden ? `**Forbidden Patterns:**
${requirements.structure.forbidden.map(pattern => `- \`${pattern}\``).join('\n')}` : ''}
` : 'No specific structure requirements defined.'}

### Behavior Requirements
${requirements.behavior ? `
${Object.entries(requirements.behavior).map(([key, behaviors]) => `
**${this.toTitleCase(key)}:**
${Array.isArray(behaviors) ? behaviors.map(behavior => `- ${behavior}`).join('\n') : `- ${behaviors}`}
`).join('')}
` : 'No specific behavior requirements defined.'}

### Accessibility Requirements
${requirements.accessibility ? `
${Object.entries(requirements.accessibility).map(([key, items]) => `
**${this.toTitleCase(key)}:**
${Array.isArray(items) ? items.map(item => `- ${item}`).join('\n') : `- ${items}`}
`).join('')}
` : 'Standard accessibility requirements apply.'}

## Monitoring Commands

\`\`\`bash
# Run full compliance check for this component
npm run compliance:${componentName}

# Run with verbose output
node compliance/components/${componentName}-compliance.js

# Include in full monitoring sweep
npm run uswds:monitor
\`\`\`

## Compliance Script

- **Script**: \`compliance/components/${componentName}-compliance.js\`
- **Reports**: \`compliance/reports/${componentName}-compliance-*.json\`
- **Last Updated**: ${new Date().toISOString()}

## Component-Specific Notes

This component requires specific attention to:
${requirements.notes || '- Standard USWDS compliance patterns'}

---

*This file is auto-generated. To update requirements, modify the component compliance script.*`;
  }

  /**
   * Generate index file for easy access to all compliance scripts
   */
  generateComplianceIndex(components) {
    const indexContent = `#!/usr/bin/env node

/**
 * Component Compliance Index
 *
 * Central access point for all component-specific compliance scripts
 * Generated on: ${new Date().toISOString()}
 */

${components.map(component => {
  const className = this.toPascalCase(component) + 'Compliance';
  return `import ${className} from './${component}-compliance.js';`;
}).join('\n')}

export const complianceScripts = {
${components.map(component => {
  const className = this.toPascalCase(component) + 'Compliance';
  return `  '${component}': ${className},`;
}).join('\n')}
};

/**
 * Run compliance check for specific component
 */
export async function runComponentCompliance(componentName) {
  const ComplianceClass = complianceScripts[componentName];

  if (!ComplianceClass) {
    throw new Error(\`No compliance script found for component: \${componentName}\`);
  }

  const compliance = new ComplianceClass();
  return await compliance.runCompliance();
}

/**
 * Run compliance checks for all components
 */
export async function runAllCompliance() {
  const results = {};

  for (const [componentName, ComplianceClass] of Object.entries(complianceScripts)) {
    console.log(\`\\n🔍 Running compliance for \${componentName}...\`);
    const compliance = new ComplianceClass();
    results[componentName] = await compliance.runCompliance();
  }

  return results;
}

// CLI execution
if (import.meta.url === \`file://\${process.argv[1]}\`) {
  const componentName = process.argv[2];

  if (componentName) {
    runComponentCompliance(componentName).catch(console.error);
  } else {
    console.log('Available components:');
    Object.keys(complianceScripts).forEach(name => {
      console.log(\`  - \${name}\`);
    });
    console.log('\\nUsage: node compliance/components/index.js <component-name>');
  }
}`;

    const indexPath = path.join(this.complianceDir, 'index.js');
    fs.writeFileSync(indexPath, indexContent);
  }

  /**
   * Update package.json with component-specific scripts
   */
  updatePackageJsonScripts(components) {
    const packageJsonPath = path.join(__dirname, '../package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    // Add component-specific compliance scripts
    const complianceScripts = {};
    components.forEach(component => {
      complianceScripts[`compliance:${component}`] = `node compliance/components/${component}-compliance.js`;
    });

    // Add to scripts section
    packageJson.scripts = {
      ...packageJson.scripts,
      ...complianceScripts,
      'compliance:all': 'node compliance/components/index.js',
      'compliance:generate': 'node scripts/generate-component-compliance.js'
    };

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(`\n📦 Updated package.json with ${components.length} component-specific scripts`);
  }

  /**
   * Get component-specific requirements
   */
  getComponentRequirements() {
    return {
      'date-picker': {
        structure: {
          required: [
            '.usa-date-picker',
            '.usa-date-picker__wrapper',
            '.usa-date-picker__input',
            '.usa-date-picker__button',
            '.usa-form-group'
          ],
          forbidden: [
            'custom-calendar-widget',
            'inline-svg-icons'
          ]
        },
        behavior: {
          keyboard: [
            'Arrow keys navigate calendar dates',
            'Enter/Space selects date',
            'Escape closes calendar',
            'F4 opens calendar'
          ],
          interaction: [
            'Button click opens/closes calendar',
            'Date selection updates input value',
            'Calendar shows current month initially'
          ]
        },
        accessibility: {
          aria: [
            'aria-expanded on calendar button',
            'aria-controls linking button to calendar',
            'aria-label or aria-labelledby on input'
          ]
        },
        notes: '- Critical: Arrow key navigation must work\n- Must integrate with USWDS JavaScript'
      },
      'in-page-navigation': {
        structure: {
          required: [
            '.usa-in-page-nav',
            '.usa-in-page-nav__nav',
            '.usa-in-page-nav__list',
            '.usa-in-page-nav__item',
            '.usa-in-page-nav__link'
          ]
        },
        behavior: {
          interaction: [
            'Smooth scroll to target sections',
            'Active state updates on scroll',
            'Hash URL updates on navigation'
          ]
        },
        notes: '- Critical: Active state tracking on scroll\n- Must handle smooth scrolling'
      },
      'accordion': {
        structure: {
          required: [
            '.usa-accordion',
            '.usa-accordion__heading',
            '.usa-accordion__button',
            '.usa-accordion__content'
          ],
          forbidden: [
            'innerHTML'
          ]
        },
        behavior: {
          interaction: [
            'Panel toggles on button click',
            'ARIA expanded states update',
            'Exclusive mode in non-multiselectable'
          ]
        },
        notes: '- Critical: No innerHTML usage (security)\n- Must handle ARIA states properly'
      }
    };
  }

  /**
   * Get default requirements for components without specific ones
   */
  getDefaultRequirements(componentName) {
    return {
      structure: {
        required: [
          `.usa-${componentName}`
        ]
      },
      behavior: {
        progressive: [
          'Works with USWDS JavaScript when available',
          'Graceful degradation without JavaScript'
        ]
      },
      accessibility: {
        basic: [
          'Keyboard accessible',
          'Screen reader compatible',
          'Proper focus management'
        ]
      },
      notes: `Standard USWDS compliance requirements for ${componentName} component.`
    };
  }

  /**
   * Utility functions
   */
  toPascalCase(str) {
    return str.replace(/(^|-)(.)/g, (_, __, char) => char.toUpperCase());
  }

  toTitleCase(str) {
    return str.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const generator = new ComplianceScriptGenerator();
  generator.generateAllComplianceScripts().then((scripts) => {
    console.log(`\n🎉 Successfully generated compliance scripts for all components!`);
    console.log(`\n💡 Usage examples:`);
    console.log(`   npm run compliance:date-picker`);
    console.log(`   npm run compliance:accordion`);
    console.log(`   npm run compliance:all`);
  }).catch(console.error);
}

export default ComplianceScriptGenerator;