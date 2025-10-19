#!/usr/bin/env node

/**
 * USWDS Component Issue Prevention System Setup
 *
 * Sets up comprehensive prevention systems:
 * 1. ESLint rules for real-time detection
 * 2. Pre-commit hooks for blocking problematic commits
 * 3. Component templates with built-in guards
 * 4. Development workflow integration
 */

import fs from 'fs';
import path from 'path';

class PreventionSystemSetup {
  constructor() {
    this.changes = [];
    this.errors = [];
  }

  log(message, color = 'reset') {
    const colors = {
      red: '\x1b[31m',
      yellow: '\x1b[33m',
      green: '\x1b[32m',
      blue: '\x1b[34m',
      cyan: '\x1b[36m',
      reset: '\x1b[0m',
      bold: '\x1b[1m'
    };
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  async setupPreventionSystem() {
    this.log('\n🛡️  USWDS Component Issue Prevention System Setup', 'cyan');

    try {
      await this.updateESLintConfig();
      await this.updatePackageJsonScripts();
      await this.setupPreCommitHooks();
      await this.createComponentTemplate();
      await this.createDevelopmentGuide();

      this.generateReport();
    } catch (error) {
      this.log(`❌ Setup failed: ${error.message}`, 'red');
      process.exit(1);
    }
  }

  async updateESLintConfig() {
    this.log('\n🔧 Updating ESLint configuration...', 'blue');

    const eslintConfigPath = '.eslintrc.json';
    let config = {};

    // Read existing config
    if (fs.existsSync(eslintConfigPath)) {
      const configContent = fs.readFileSync(eslintConfigPath, 'utf8');
      try {
        config = JSON.parse(configContent);
      } catch (error) {
        this.log(`Warning: Could not parse existing ESLint config: ${error.message}`, 'yellow');
        return;
      }
    }

    // Check if our rules are already added
    if (config.rules && config.rules['local/prevent-uswds-issues']) {
      this.log('ESLint rules already configured', 'green');
      return;
    }

    // Add our custom rule
    if (!config.rules) config.rules = {};
    config.rules['local/prevent-uswds-issues'] = 'error';

    // Add local plugins if not exists
    if (!config.plugins) config.plugins = [];
    if (!config.plugins.includes('local')) {
      config.plugins.push('local');
    }

    // Add rule path for ESLint flat config compatibility
    if (!config.rulesDirectory) {
      config.rulesDirectory = ['./eslint-rules'];
    } else if (!config.rulesDirectory.includes('./eslint-rules')) {
      config.rulesDirectory.push('./eslint-rules');
    }

    try {
      fs.writeFileSync(eslintConfigPath, JSON.stringify(config, null, 2));
      this.changes.push('Updated ESLint configuration with USWDS issue prevention rules');
    } catch (error) {
      this.log(`Warning: Could not update ESLint config: ${error.message}`, 'yellow');
      this.log('Please add the following rule manually:', 'blue');
      this.log('"local/prevent-uswds-issues": "error"', 'cyan');
    }
  }

  async updatePackageJsonScripts() {
    this.log('\n📦 Adding prevention scripts to package.json...', 'blue');

    const packagePath = 'package.json';
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

    // Add new scripts without overwriting existing ones
    const newScripts = {
      'detect:initialization-issues': 'node scripts/detect-initialization-issues.js',
      'fix:initialization:guards': 'node scripts/fix-initialization-guards.js',
      'fix:initialization:guards:dry-run': 'node scripts/fix-initialization-guards.js --dry-run',
      'setup:initialization:prevention': 'node scripts/setup-initialization-prevention.js',
      'validate:uswds-patterns': 'npm run detect:initialization-issues && npm run lint',
      'pre-commit:initialization': 'npm run detect:initialization-issues && npm run fix:initialization:guards:dry-run'
    };

    Object.entries(newScripts).forEach(([key, value]) => {
      if (!packageJson.scripts[key]) {
        packageJson.scripts[key] = value;
        this.changes.push(`Added script: ${key}`);
      }
    });

    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  }

  async setupPreCommitHooks() {
    this.log('\n🪝 Setting up pre-commit hooks...', 'blue');

    // Create husky pre-commit hook
    const huskyDir = '.husky';
    const preCommitPath = path.join(huskyDir, 'pre-commit');

    if (!fs.existsSync(huskyDir)) {
      fs.mkdirSync(huskyDir, { recursive: true });
    }

    const preCommitScript = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# USWDS Component Issue Prevention
echo "🛡️  Checking for USWDS component issues..."

# Run detection script
npm run detect:initialization-issues

# If issues found, suggest fixes
if [ $? -ne 0 ]; then
  echo "⚠️  USWDS component issues detected!"
  echo "Run 'npm run fix:initialization:guards' to fix automatically"
  echo "Or use 'git commit --no-verify' to skip this check"
  exit 1
fi

# Run linting with USWDS rules
npm run lint

echo "✅ USWDS component checks passed!"
`;

    fs.writeFileSync(preCommitPath, preCommitScript);
    fs.chmodSync(preCommitPath, '755');

    this.changes.push('Created pre-commit hook with USWDS issue detection');
  }

  async createComponentTemplate() {
    this.log('\n📄 Creating component template with built-in guards...', 'blue');

    const templatePath = 'templates/uswds-component-safe.ts';
    const templateDir = path.dirname(templatePath);

    if (!fs.existsSync(templateDir)) {
      fs.mkdirSync(templateDir, { recursive: true });
    }

    const componentTemplate = `import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { USWDSBaseComponent } from '../utils/base-component.js';

// Import official USWDS compiled CSS
import '../styles/styles.css';

/**
 * USA {{ComponentName}} Web Component
 *
 * USWDS-aligned implementation with built-in initialization safety.
 *
 * @element usa-{{component-name}}
 * @fires {{component-name}}-change - Dispatched when component state changes
 *
 * @see README.mdx - Complete API documentation
 * @uswds-js-reference https://github.com/uswds/uswds/tree/develop/packages/usa-{{component-name}}/src/index.js
 * @uswds-css-reference https://github.com/uswds/uswds/tree/develop/packages/usa-{{component-name}}/src/styles/_usa-{{component-name}}.scss
 * @uswds-docs https://designsystem.digital.gov/components/{{component-name}}/
 */
@customElement('usa-{{component-name}}')
export class USA{{ComponentName}} extends USWDSBaseComponent {
  static override styles = css\`
    :host {
      display: block;
    }
  \`;

  // Component properties
  @property({ type: String })
  value = '';

  @property({ type: Boolean })
  disabled = false;

  // CRITICAL: Initialization guard to prevent duplicate USWDS calls
  private usingUSWDSEnhancement = false;

  // Store USWDS module for cleanup
  private uswdsModule: any = null;

  override connectedCallback() {
    super.connectedCallback();
    console.log('🎯 {{ComponentName}}: Initializing with USWDS pattern');
    this.initializeUSWDS{{ComponentName}}();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.cleanupUSWDS();
  }

  private async initializeUSWDS{{ComponentName}}() {
    // CRITICAL: Always check for duplicate initialization first
    if (this.usingUSWDSEnhancement) {
      console.log(\`⚠️ {{ComponentName}}: Already initialized, skipping duplicate initialization\`);
      return;
    }

    console.log(\`🎯 {{ComponentName}}: Initializing with tree-shaking optimization\`);

    try {
      // Import specific USWDS module (not full bundle)
      const {{componentName}}Module = await import('@uswds/uswds/js/usa-{{component-name}}');
      this.uswdsModule = {{componentName}}Module.default;

      // Initialize the USWDS component
      if (this.uswdsModule && typeof this.uswdsModule.on === 'function') {
        this.uswdsModule.on(this);
        this.usingUSWDSEnhancement = true; // CRITICAL: Set flag after success
        console.log(\`✅ USWDS {{component-name}} initialized successfully\`);
        return;
      } else {
        console.warn(\`⚠️ {{ComponentName}}: Module doesn't have expected initialization methods\`);
        console.log(\`🔍 Available methods:\`, Object.keys(this.uswdsModule || {}));
        this.setupFallbackBehavior();
      }
    } catch (error) {
      console.warn(\`⚠️ USWDS {{component-name}} initialization failed:\`, error);
      await this.loadFullUSWDSLibrary();
    }
  }

  private async loadFullUSWDSLibrary() {
    try {
      if (typeof (window as any).USWDS === 'undefined') {
        console.warn('⚠️ Full USWDS library not available, using fallback behavior');
        this.setupFallbackBehavior();
        return;
      }
      await this.initializeWithGlobalUSWDS();
    } catch (error) {
      console.warn('⚠️ Full USWDS initialization failed:', error);
      this.setupFallbackBehavior();
    }
  }

  private async initializeWithGlobalUSWDS() {
    const USWDS = (window as any).USWDS;
    if (USWDS && USWDS.{{componentName}} && typeof USWDS.{{componentName}}.on === 'function') {
      USWDS.{{componentName}}.on(this);
      this.usingUSWDSEnhancement = true; // CRITICAL: Set flag after success
      console.log('✅ Global USWDS {{component-name}} initialized successfully');
    } else {
      console.warn('⚠️ Global USWDS {{component-name}} not available');
      this.setupFallbackBehavior();
    }
  }

  private setupFallbackBehavior() {
    console.log('🚀 Setting up fallback {{component-name}} behavior');
    // Component functionality without USWDS enhancement
  }

  private cleanupUSWDS() {
    try {
      if (this.uswdsModule && typeof this.uswdsModule.off === 'function') {
        this.uswdsModule.off(this);
        console.log('✅ USWDS {{component-name}} cleaned up');
      } else if (typeof window !== 'undefined' && typeof (window as any).USWDS !== 'undefined') {
        const USWDS = (window as any).USWDS;
        if (USWDS.{{componentName}} && typeof USWDS.{{componentName}}.off === 'function') {
          USWDS.{{componentName}}.off(this);
          console.log('✅ Global USWDS {{component-name}} cleaned up');
        }
      }
    } catch (error) {
      console.warn('⚠️ USWDS cleanup failed:', error);
    }

    // CRITICAL: Reset enhancement flag to allow reinitialization
    this.usingUSWDSEnhancement = false;
    this.uswdsModule = null;
  }

  override render() {
    return html\`
      <div class="usa-{{component-name}}">
        <slot></slot>
      </div>
    \`;
  }

  // Public API methods
  override focus() {
    // Component-specific focus implementation
  }

  public setValue(value: string) {
    this.value = value;
  }

  public getValue(): string {
    return this.value;
  }
}
`;

    fs.writeFileSync(templatePath, componentTemplate);
    this.changes.push('Created safe component template with built-in initialization guards');
  }

  async createDevelopmentGuide() {
    this.log('\n📚 Creating development guide...', 'blue');

    const guidePath = 'docs/USWDS_INITIALIZATION_SAFETY.md';
    const guideDir = path.dirname(guidePath);

    if (!fs.existsSync(guideDir)) {
      fs.mkdirSync(guideDir, { recursive: true });
    }

    const guide = `# USWDS Component Initialization Safety Guide

## 🛡️ Prevention System Overview

This guide outlines the comprehensive prevention system for USWDS component initialization issues.

## 🚨 Common Issues Prevented

1. **Duplicate Initialization**: Multiple USWDS.component.on(this) calls causing infinite loops
2. **Import Problems**: Using full USWDS bundle instead of specific modules
3. **Lit Directive Errors**: unsafeHTML and other directives causing initialization failures
4. **Missing Cleanup**: Components not properly cleaning up USWDS instances

## 🔧 Prevention Tools

### 1. Detection Script
\`\`\`bash
npm run detect:initialization-issues
\`\`\`
Scans all components for potential issues.

### 2. Auto-Fix Script
\`\`\`bash
npm run fix:initialization:guards
npm run fix:initialization:guards:dry-run  # Preview changes
\`\`\`
Automatically adds initialization guards to components.

### 3. ESLint Rules
Real-time detection in your editor with auto-fix capabilities.

### 4. Pre-commit Hooks
Blocks commits with initialization issues.

## 📋 Safe Component Pattern

### Required Elements

1. **Initialization Guard**:
\`\`\`typescript
private usingUSWDSEnhancement = false;

private async initializeUSWDS() {
  if (this.usingUSWDSEnhancement) {
    console.log('⚠️ Already initialized, skipping duplicate');
    return;
  }
  // ... initialization code
  this.usingUSWDSEnhancement = true; // Set after success
}
\`\`\`

2. **Specific Module Imports**:
\`\`\`typescript
// ✅ Good
const module = await import('@uswds/uswds/js/usa-accordion');

// ❌ Bad
const module = await import('@uswds/uswds');
\`\`\`

3. **Proper Cleanup**:
\`\`\`typescript
private cleanupUSWDS() {
  if (this.uswdsModule?.off) {
    this.uswdsModule.off(this);
  }
  this.usingUSWDSEnhancement = false; // Reset flag
}
\`\`\`

4. **Error Handling**:
\`\`\`typescript
try {
  // USWDS initialization
} catch (error) {
  console.warn('USWDS init failed:', error);
  this.setupFallbackBehavior();
}
\`\`\`

## 🚀 Development Workflow

### For New Components
1. Use the safe template: \`templates/uswds-component-safe.ts\`
2. Replace placeholders with your component details
3. Run \`npm run lint\` to check for issues

### For Existing Components
1. Run \`npm run detect:initialization-issues\`
2. Fix issues with \`npm run fix:initialization:guards\`
3. Test components in Storybook
4. Commit changes (pre-commit hooks will validate)

### Before Committing
- \`npm run detect:initialization-issues\` - Check for issues
- \`npm run typecheck\` - Verify TypeScript
- \`npm run lint\` - Check ESLint rules
- \`npm run test\` - Run component tests

## 🎯 Best Practices

1. **Always use initialization guards** for USWDS components
2. **Import specific modules** not the full bundle
3. **Handle errors gracefully** with fallback behavior
4. **Clean up properly** on component destruction
5. **Test components thoroughly** in Storybook
6. **Follow the safe template** for new components

## 🔍 Troubleshooting

### Component Not Visible
1. Check console for initialization errors
2. Verify USWDS module imports correctly
3. Ensure guard isn't blocking necessary initialization

### Infinite Loops/Reloads
1. Missing initialization guard
2. Run auto-fix: \`npm run fix:initialization:guards\`

### ESLint Errors
1. Follow error messages for auto-fixes
2. Use \`npm run lint --fix\` for automatic corrections

## 📞 Getting Help

1. Check this guide first
2. Run detection script for specific issues
3. Review component template for patterns
4. Check console logs for USWDS initialization messages

---

This prevention system ensures robust, reliable USWDS components with minimal maintenance overhead.
`;

    fs.writeFileSync(guidePath, guide);
    this.changes.push('Created comprehensive development guide');
  }

  generateReport() {
    this.log('\n📊 PREVENTION SYSTEM SETUP REPORT', 'cyan');

    this.log(`\n✅ Changes made: ${this.changes.length}`, 'green');
    this.changes.forEach(change => {
      this.log(`   • ${change}`, 'green');
    });

    if (this.errors.length > 0) {
      this.log(`\n❌ Errors: ${this.errors.length}`, 'red');
      this.errors.forEach(error => {
        this.log(`   • ${error}`, 'red');
      });
    }

    this.log('\n🎉 PREVENTION SYSTEM READY!', 'green');

    this.log('\n🚀 Next Steps:', 'blue');
    this.log('1. Run: npm run detect:initialization-issues', 'yellow');
    this.log('2. Fix any issues: npm run fix:initialization:guards', 'yellow');
    this.log('3. Test components: npm run storybook', 'yellow');
    this.log('4. Commit changes (hooks will validate)', 'yellow');

    this.log('\n📚 Documentation:', 'blue');
    this.log('• Read: docs/USWDS_INITIALIZATION_SAFETY.md', 'yellow');
    this.log('• Use template: templates/uswds-component-safe.ts', 'yellow');
  }
}

// Self-executing setup
const setup = new PreventionSystemSetup();
setup.setupPreventionSystem().catch(error => {
  console.error('Setup failed:', error);
  process.exit(1);
});

export default PreventionSystemSetup;