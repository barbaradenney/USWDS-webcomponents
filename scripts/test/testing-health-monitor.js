#!/usr/bin/env node

/**
 * 🏥 Testing Infrastructure Health Monitor
 *
 * Ensures all testing systems, scripts, and automations stay current and functional
 * Detects stale scripts, broken dependencies, and outdated configurations
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

class TestingHealthMonitor {
  constructor() {
    this.criticalScripts = [
      // Early Detection System
      { path: 'scripts/dev-time-validator.js', purpose: 'Real-time validation', lastUsed: null },
      { path: 'scripts/proactive-monitor.js', purpose: 'Background monitoring', lastUsed: null },

      // AI-Powered Testing
      { path: 'scripts/ai-test-generator.js', purpose: 'AI test generation', lastUsed: null },
      { path: 'scripts/smart-test-recommendations.js', purpose: 'Test recommendations', lastUsed: null },
      { path: 'scripts/predictive-regression-tester.js', purpose: 'Predictive testing', lastUsed: null },
      { path: 'scripts/chaos-engineering-tester.js', purpose: 'Chaos testing', lastUsed: null },

      // Test Orchestration
      { path: 'scripts/test-orchestrator.js', purpose: 'Comprehensive testing', lastUsed: null },
      { path: 'scripts/intelligent-test-parallelizer.js', purpose: 'Test optimization', lastUsed: null },

      // USWDS Compliance
      { path: 'scripts/enhanced-compliance-check.js', purpose: 'USWDS validation', lastUsed: null },
      { path: 'scripts/validate-uswds-compliance.js', purpose: 'Component compliance', lastUsed: null },
    ];

    this.workflowFiles = [
      '.github/workflows/early-detection.yml',
      '.husky/pre-commit',
    ];

    this.testFiles = [
      'src/components/date-picker/usa-date-picker.behavioral.cy.ts',
      'src/components/date-picker/usa-date-picker.visual.test.ts',
    ];

    this.healthReport = {
      timestamp: new Date().toISOString(),
      scriptsHealth: {},
      workflowsHealth: {},
      dependenciesHealth: {},
      commandsHealth: {},
      recommendations: [],
      overallScore: 0
    };
  }

  async runHealthCheck() {
    console.log('🏥 Starting Testing Infrastructure Health Check...\n');

    await this.checkScriptHealth();
    await this.checkWorkflowHealth();
    await this.checkCommandHealth();
    await this.checkDependencyHealth();
    await this.checkLastExecution();
    await this.generateRecommendations();

    this.calculateOverallScore();
    this.displayHealthReport();
    this.saveHealthReport();

    return this.healthReport;
  }

  async checkScriptHealth() {
    console.log('📜 Checking script health...');

    for (const script of this.criticalScripts) {
      const fullPath = path.join(rootDir, script.path);
      const health = {
        exists: false,
        executable: false,
        syntaxValid: false,
        lastModified: null,
        daysSinceModified: null,
        hasTests: false,
        status: 'unknown'
      };

      // Check existence
      if (fs.existsSync(fullPath)) {
        health.exists = true;

        // Check last modified
        const stats = fs.statSync(fullPath);
        health.lastModified = stats.mtime;
        health.daysSinceModified = Math.floor((Date.now() - stats.mtime) / (1000 * 60 * 60 * 24));

        // Check syntax
        try {
          execSync(`node --check "${fullPath}"`, { stdio: 'pipe' });
          health.syntaxValid = true;
        } catch (error) {
          health.syntaxValid = false;
        }

        // Check if it has associated tests
        const testPath = fullPath.replace('.js', '.test.js');
        health.hasTests = fs.existsSync(testPath);

        // Determine status
        if (health.syntaxValid && health.daysSinceModified < 30) {
          health.status = 'healthy';
        } else if (health.syntaxValid && health.daysSinceModified < 60) {
          health.status = 'aging';
        } else {
          health.status = 'stale';
        }
      } else {
        health.status = 'missing';
        this.healthReport.recommendations.push(
          `❌ Critical script missing: ${script.path} - ${script.purpose}`
        );
      }

      this.healthReport.scriptsHealth[script.path] = health;
    }

    const healthyCount = Object.values(this.healthReport.scriptsHealth)
      .filter(h => h.status === 'healthy').length;

    console.log(`✅ Scripts: ${healthyCount}/${this.criticalScripts.length} healthy\n`);
  }

  async checkWorkflowHealth() {
    console.log('🔄 Checking workflow health...');

    for (const workflow of this.workflowFiles) {
      const fullPath = path.join(rootDir, workflow);
      const health = {
        exists: false,
        valid: false,
        lastModified: null,
        daysSinceModified: null,
        status: 'unknown'
      };

      if (fs.existsSync(fullPath)) {
        health.exists = true;

        const stats = fs.statSync(fullPath);
        health.lastModified = stats.mtime;
        health.daysSinceModified = Math.floor((Date.now() - stats.mtime) / (1000 * 60 * 60 * 24));

        // For YAML files, check syntax
        if (workflow.endsWith('.yml') || workflow.endsWith('.yaml')) {
          try {
            // Basic YAML validation (checks for common issues)
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('name:') && content.includes('on:')) {
              health.valid = true;
            }
          } catch (error) {
            health.valid = false;
          }
        } else {
          // For shell scripts
          health.valid = true;
        }

        health.status = health.valid && health.daysSinceModified < 60 ? 'healthy' : 'needs-review';
      } else {
        health.status = 'missing';
      }

      this.healthReport.workflowsHealth[workflow] = health;
    }

    const healthyWorkflows = Object.values(this.healthReport.workflowsHealth)
      .filter(h => h.status === 'healthy').length;

    console.log(`✅ Workflows: ${healthyWorkflows}/${this.workflowFiles.length} healthy\n`);
  }

  async checkCommandHealth() {
    console.log('⚙️ Checking npm commands health...');

    const criticalCommands = [
      'dev:watch',
      'dev:monitor',
      'validate:all',
      'detect:issues',
      'health:check',
      'test:comprehensive',
      'ai:analyze',
      'test:predict',
      'test:chaos',
      'test:recommend'
    ];

    const packageJsonPath = path.join(rootDir, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    for (const command of criticalCommands) {
      const health = {
        exists: false,
        executable: false,
        lastTested: null,
        status: 'unknown'
      };

      if (packageJson.scripts[command]) {
        health.exists = true;

        // Test if command can run (dry run)
        try {
          // Check if the command references an existing script
          const scriptCommand = packageJson.scripts[command];
          const scriptMatch = scriptCommand.match(/node\s+scripts\/([^\s]+)/);

          if (scriptMatch) {
            const scriptPath = path.join(rootDir, 'scripts', scriptMatch[1]);
            health.executable = fs.existsSync(scriptPath);
          } else {
            health.executable = true; // Assume other commands work
          }

          health.status = health.executable ? 'healthy' : 'broken';
        } catch (error) {
          health.status = 'error';
        }
      } else {
        health.status = 'missing';
        this.healthReport.recommendations.push(
          `❌ Critical command missing: npm run ${command}`
        );
      }

      this.healthReport.commandsHealth[command] = health;
    }

    const healthyCommands = Object.values(this.healthReport.commandsHealth)
      .filter(h => h.status === 'healthy').length;

    console.log(`✅ Commands: ${healthyCommands}/${criticalCommands.length} healthy\n`);
  }

  async checkDependencyHealth() {
    console.log('📦 Checking dependency health...');

    const criticalDeps = [
      '@vitest/ui',
      'cypress',
      'playwright',
      '@storybook/test-runner',
      'axe-core',
      'chromatic'
    ];

    const packageJsonPath = path.join(rootDir, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    for (const dep of criticalDeps) {
      const health = {
        installed: false,
        version: null,
        upToDate: false,
        status: 'unknown'
      };

      const version = packageJson.devDependencies[dep] || packageJson.dependencies[dep];

      if (version) {
        health.installed = true;
        health.version = version;

        // Check if installed in node_modules
        const depPath = path.join(rootDir, 'node_modules', dep);
        if (fs.existsSync(depPath)) {
          health.upToDate = true;
          health.status = 'healthy';
        } else {
          health.status = 'not-installed';
          this.healthReport.recommendations.push(
            `⚠️ Dependency not installed: ${dep} - run npm install`
          );
        }
      } else {
        health.status = 'missing';
      }

      this.healthReport.dependenciesHealth[dep] = health;
    }

    const healthyDeps = Object.values(this.healthReport.dependenciesHealth)
      .filter(h => h.status === 'healthy').length;

    console.log(`✅ Dependencies: ${healthyDeps}/${criticalDeps.length} healthy\n`);
  }

  async checkLastExecution() {
    console.log('🕐 Checking last execution times...');

    // Check for test result files to determine when tests last ran
    const testReportDirs = [
      'test-reports/monitoring',
      'test-reports/ai-analysis',
      'coverage'
    ];

    for (const dir of testReportDirs) {
      const fullPath = path.join(rootDir, dir);
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        const daysSinceRun = Math.floor((Date.now() - stats.mtime) / (1000 * 60 * 60 * 24));

        if (daysSinceRun > 7) {
          this.healthReport.recommendations.push(
            `⚠️ ${dir} hasn't been updated in ${daysSinceRun} days - tests may be stale`
          );
        }
      }
    }
  }

  generateRecommendations() {
    // Check for stale scripts
    const staleScripts = Object.entries(this.healthReport.scriptsHealth)
      .filter(([_, health]) => health.status === 'stale')
      .map(([path]) => path);

    if (staleScripts.length > 0) {
      this.healthReport.recommendations.push(
        `📝 Review stale scripts: ${staleScripts.join(', ')}`
      );
    }

    // Check for missing tests
    const scriptsWithoutTests = Object.entries(this.healthReport.scriptsHealth)
      .filter(([_, health]) => health.exists && !health.hasTests)
      .map(([path]) => path);

    if (scriptsWithoutTests.length > 0) {
      this.healthReport.recommendations.push(
        `🧪 Add tests for: ${scriptsWithoutTests.join(', ')}`
      );
    }

    // Check if early detection is set up
    if (!this.healthReport.workflowsHealth['.github/workflows/early-detection.yml']?.exists) {
      this.healthReport.recommendations.push(
        '🚨 Early detection CI/CD pipeline not configured!'
      );
    }

    // Add positive recommendations
    if (this.healthReport.recommendations.length === 0) {
      this.healthReport.recommendations.push(
        '✅ All testing infrastructure is healthy and up to date!'
      );
    }
  }

  calculateOverallScore() {
    let totalPoints = 0;
    let maxPoints = 0;

    // Scripts health (40 points)
    const scriptsHealthy = Object.values(this.healthReport.scriptsHealth)
      .filter(h => h.status === 'healthy').length;
    totalPoints += (scriptsHealthy / this.criticalScripts.length) * 40;
    maxPoints += 40;

    // Workflows health (20 points)
    const workflowsHealthy = Object.values(this.healthReport.workflowsHealth)
      .filter(h => h.status === 'healthy').length;
    totalPoints += (workflowsHealthy / this.workflowFiles.length) * 20;
    maxPoints += 20;

    // Commands health (20 points)
    const commandsHealthy = Object.values(this.healthReport.commandsHealth)
      .filter(h => h.status === 'healthy').length;
    const totalCommands = Object.keys(this.healthReport.commandsHealth).length;
    totalPoints += (commandsHealthy / totalCommands) * 20;
    maxPoints += 20;

    // Dependencies health (20 points)
    const depsHealthy = Object.values(this.healthReport.dependenciesHealth)
      .filter(h => h.status === 'healthy').length;
    const totalDeps = Object.keys(this.healthReport.dependenciesHealth).length;
    totalPoints += (depsHealthy / totalDeps) * 20;
    maxPoints += 20;

    this.healthReport.overallScore = Math.round((totalPoints / maxPoints) * 100);
  }

  displayHealthReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TESTING INFRASTRUCTURE HEALTH REPORT');
    console.log('='.repeat(60));

    const scoreEmoji = this.healthReport.overallScore >= 80 ? '🟢' :
                       this.healthReport.overallScore >= 60 ? '🟡' : '🔴';

    console.log(`\n${scoreEmoji} Overall Health Score: ${this.healthReport.overallScore}%`);

    // Show component scores
    console.log('\n📈 Component Scores:');

    const scriptsHealthy = Object.values(this.healthReport.scriptsHealth)
      .filter(h => h.status === 'healthy').length;
    console.log(`   Scripts: ${scriptsHealthy}/${this.criticalScripts.length} healthy`);

    const workflowsHealthy = Object.values(this.healthReport.workflowsHealth)
      .filter(h => h.status === 'healthy').length;
    console.log(`   Workflows: ${workflowsHealthy}/${this.workflowFiles.length} healthy`);

    const commandsHealthy = Object.values(this.healthReport.commandsHealth)
      .filter(h => h.status === 'healthy').length;
    console.log(`   Commands: ${commandsHealthy}/${Object.keys(this.healthReport.commandsHealth).length} healthy`);

    const depsHealthy = Object.values(this.healthReport.dependenciesHealth)
      .filter(h => h.status === 'healthy').length;
    console.log(`   Dependencies: ${depsHealthy}/${Object.keys(this.healthReport.dependenciesHealth).length} healthy`);

    // Show recommendations
    if (this.healthReport.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      this.healthReport.recommendations.forEach(rec => {
        console.log(`   ${rec}`);
      });
    }

    console.log('\n' + '='.repeat(60));
  }

  saveHealthReport() {
    const reportDir = path.join(rootDir, 'test-reports', 'infrastructure');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const reportPath = path.join(reportDir, 'health-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.healthReport, null, 2));

    // Also save a markdown version
    const mdReport = this.generateMarkdownReport();
    const mdPath = path.join(reportDir, 'health-report.md');
    fs.writeFileSync(mdPath, mdReport);

    console.log(`\n📁 Report saved to: ${reportPath}`);
  }

  generateMarkdownReport() {
    let md = '# Testing Infrastructure Health Report\n\n';
    md += `**Generated:** ${new Date().toLocaleString()}\n\n`;
    md += `## Overall Score: ${this.healthReport.overallScore}%\n\n`;

    md += '## Script Health\n\n';
    md += '| Script | Status | Days Since Modified | Has Tests |\n';
    md += '|--------|--------|-------------------|------------|\n';

    Object.entries(this.healthReport.scriptsHealth).forEach(([path, health]) => {
      const statusEmoji = health.status === 'healthy' ? '✅' :
                          health.status === 'aging' ? '⚠️' :
                          health.status === 'stale' ? '🔴' : '❌';
      md += `| ${path} | ${statusEmoji} ${health.status} | ${health.daysSinceModified || 'N/A'} | ${health.hasTests ? '✅' : '❌'} |\n`;
    });

    md += '\n## Recommendations\n\n';
    this.healthReport.recommendations.forEach(rec => {
      md += `- ${rec}\n`;
    });

    return md;
  }
}

// Self-healing functionality
class TestingInfrastructureHealer {
  async autoHeal(healthReport) {
    console.log('\n🔧 Attempting auto-healing...\n');

    let healed = 0;

    // Fix missing dependencies
    const missingDeps = Object.entries(healthReport.dependenciesHealth)
      .filter(([_, health]) => health.status === 'not-installed')
      .map(([dep]) => dep);

    if (missingDeps.length > 0) {
      console.log(`📦 Installing missing dependencies: ${missingDeps.join(', ')}`);
      try {
        execSync('npm install', { stdio: 'inherit' });
        healed++;
      } catch (error) {
        console.log('❌ Failed to install dependencies');
      }
    }

    // Fix syntax errors in scripts
    Object.entries(healthReport.scriptsHealth).forEach(([scriptPath, health]) => {
      if (health.exists && !health.syntaxValid) {
        console.log(`🔧 Script has syntax errors: ${scriptPath}`);
        // Log but don't auto-fix - requires manual intervention
      }
    });

    console.log(`\n✅ Auto-healing complete. Fixed ${healed} issue(s).`);
  }
}

// Run health check
if (import.meta.url === `file://${process.argv[1]}`) {
  const monitor = new TestingHealthMonitor();
  const healer = new TestingInfrastructureHealer();

  monitor.runHealthCheck().then(async (report) => {
    // Auto-heal if score is below 80%
    if (report.overallScore < 80) {
      await healer.autoHeal(report);
    }

    // Set exit code based on health
    process.exit(report.overallScore >= 60 ? 0 : 1);
  }).catch(console.error);
}

export default TestingHealthMonitor;