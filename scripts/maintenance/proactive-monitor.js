#!/usr/bin/env node

/**
 * 🔍 Proactive Monitoring System
 *
 * Continuously monitors the project health and catches issues before they compound
 * Runs in the background during development and provides real-time alerts
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

class ProactiveMonitor {
  constructor() {
    this.monitoringInterval = 5 * 60 * 1000; // 5 minutes
    this.healthCheck = {
      typescript: { status: 'unknown', lastCheck: null, issues: [] },
      eslint: { status: 'unknown', lastCheck: null, issues: [] },
      uswds: { status: 'unknown', lastCheck: null, issues: [] },
      tests: { status: 'unknown', lastCheck: null, issues: [] },
      performance: { status: 'unknown', lastCheck: null, issues: [] },
      security: { status: 'unknown', lastCheck: null, issues: [] }
    };

    this.alertHistory = [];
    this.isMonitoring = false;
  }

  async start() {
    console.log('🔍 Starting Proactive Monitoring System...');
    console.log('🎯 Goal: Catch issues before they reach you\n');

    this.isMonitoring = true;

    // Initial health check
    await this.runHealthCheck();

    // Set up continuous monitoring
    this.setupContinuousMonitoring();

    // Set up AI-powered analysis
    this.setupAIAnalysis();

    console.log('✅ Proactive monitoring is now active');
    console.log('📊 Health status will be checked every 5 minutes');
    console.log('🤖 AI analysis will run every 30 minutes\n');

    // Keep the process running
    process.on('SIGINT', () => {
      console.log('\n🛑 Stopping proactive monitoring...');
      this.isMonitoring = false;
      process.exit(0);
    });

    return this.keepAlive();
  }

  setupContinuousMonitoring() {
    setInterval(async () => {
      if (!this.isMonitoring) return;

      console.log('\n⏰ Running scheduled health check...');
      await this.runHealthCheck();
      this.generateHealthReport();
    }, this.monitoringInterval);
  }

  setupAIAnalysis() {
    // Run AI analysis every 30 minutes
    setInterval(async () => {
      if (!this.isMonitoring) return;

      console.log('\n🤖 Running AI-powered issue analysis...');
      await this.runAIAnalysis();
    }, 30 * 60 * 1000);

    // Run smart recommendations every hour
    setInterval(async () => {
      if (!this.isMonitoring) return;

      console.log('\n💡 Generating smart test recommendations...');
      await this.runSmartRecommendations();
    }, 60 * 60 * 1000);
  }

  async runHealthCheck() {
    const checks = [
      { name: 'typescript', command: 'npm run typecheck', timeout: 30000 },
      { name: 'eslint', command: 'npm run lint', timeout: 20000 },
      { name: 'uswds', command: 'npm run uswds:compliance:static', timeout: 15000 },
      { name: 'tests', command: 'npm run test:critical', timeout: 45000 }
    ];

    for (const check of checks) {
      await this.runSingleCheck(check);
    }
  }

  async runSingleCheck({ name, command, timeout }) {
    const startTime = Date.now();

    try {
      execSync(command, {
        stdio: 'pipe',
        timeout,
        encoding: 'utf8'
      });

      // Check if status changed from failing to passing
      if (this.healthCheck[name].status === 'failing') {
        this.createAlert('resolved', name, 'Issues have been resolved');
      }

      this.healthCheck[name] = {
        status: 'passing',
        lastCheck: new Date().toISOString(),
        issues: [],
        duration: Date.now() - startTime
      };

      console.log(`✅ ${name}: Healthy (${Date.now() - startTime}ms)`);

    } catch (error) {
      const errorOutput = error.stdout || error.stderr || error.message;
      const issues = this.parseIssues(errorOutput, name);

      // Check if this is a new failure
      if (this.healthCheck[name].status !== 'failing') {
        this.createAlert('new_failure', name, `New issues detected: ${issues.length} problems`);
      }

      this.healthCheck[name] = {
        status: 'failing',
        lastCheck: new Date().toISOString(),
        issues,
        duration: Date.now() - startTime
      };

      console.log(`❌ ${name}: Issues detected (${issues.length} problems)`);

      // Show first few issues
      issues.slice(0, 3).forEach(issue => {
        console.log(`   • ${issue}`);
      });
    }
  }

  parseIssues(output, checkType) {
    const lines = output.split('\n').filter(line => line.trim());

    switch (checkType) {
      case 'typescript':
        return lines.filter(line => line.includes('error TS')).slice(0, 10);

      case 'eslint':
        return lines.filter(line =>
          line.includes('error') || line.includes('warning')
        ).slice(0, 10);

      case 'uswds':
        return lines.filter(line =>
          line.includes('USWDS') || line.includes('compliance')
        ).slice(0, 5);

      case 'tests':
        return lines.filter(line =>
          line.includes('FAIL') || line.includes('Error:')
        ).slice(0, 5);

      default:
        return lines.slice(0, 5);
    }
  }

  createAlert(type, source, message) {
    const alert = {
      type,
      source,
      message,
      timestamp: new Date().toISOString(),
      severity: this.calculateSeverity(type, source)
    };

    this.alertHistory.push(alert);

    // Keep only last 50 alerts
    if (this.alertHistory.length > 50) {
      this.alertHistory = this.alertHistory.slice(-50);
    }

    this.displayAlert(alert);
  }

  calculateSeverity(type, source) {
    if (type === 'new_failure') {
      switch (source) {
        case 'typescript':
        case 'tests':
          return 'high';
        case 'uswds':
        case 'eslint':
          return 'medium';
        default:
          return 'low';
      }
    }
    return 'low';
  }

  displayAlert(alert) {
    const severityIcon = {
      high: '🚨',
      medium: '⚠️',
      low: '💡'
    };

    const icon = severityIcon[alert.severity] || '📢';
    const time = new Date(alert.timestamp).toLocaleTimeString();

    console.log(`\n${icon} [${time}] ${alert.type.toUpperCase()}: ${alert.source}`);
    console.log(`   ${alert.message}`);

    // For high severity issues, provide immediate guidance
    if (alert.severity === 'high') {
      console.log(`   🔧 Immediate action required to prevent pre-commit failure`);
      console.log(`   💡 Run: npm run ${this.getFixCommand(alert.source)}`);
    }
  }

  getFixCommand(source) {
    const fixCommands = {
      typescript: 'typecheck',
      eslint: 'lint:fix',
      uswds: 'uswds:compliance',
      tests: 'test'
    };
    return fixCommands[source] || 'validate:all';
  }

  generateHealthReport() {
    const timestamp = new Date().toLocaleTimeString();
    const totalIssues = Object.values(this.healthCheck)
      .reduce((total, check) => total + check.issues.length, 0);

    console.log(`\n📊 Health Report [${timestamp}]`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    Object.entries(this.healthCheck).forEach(([name, status]) => {
      const icon = status.status === 'passing' ? '✅' :
                   status.status === 'failing' ? '❌' : '❓';
      const issueCount = status.issues.length;
      const duration = status.duration ? `(${status.duration}ms)` : '';

      console.log(`${icon} ${name.padEnd(12)} ${status.status.padEnd(8)} ${issueCount} issues ${duration}`);
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🎯 Overall Status: ${totalIssues === 0 ? '✅ HEALTHY' : `❌ ${totalIssues} issues detected`}`);

    if (totalIssues > 0) {
      console.log(`💡 Fix these issues now to prevent pre-commit failures`);
      console.log(`🔧 Run: npm run validate:all`);
    }

    // Save health report to file for external tools
    this.saveHealthReport();
  }

  saveHealthReport() {
    const reportDir = path.join(rootDir, 'test-reports', 'monitoring');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const report = {
      timestamp: new Date().toISOString(),
      healthCheck: this.healthCheck,
      recentAlerts: this.alertHistory.slice(-10),
      summary: {
        totalIssues: Object.values(this.healthCheck).reduce((total, check) => total + check.issues.length, 0),
        healthyChecks: Object.values(this.healthCheck).filter(check => check.status === 'passing').length,
        failingChecks: Object.values(this.healthCheck).filter(check => check.status === 'failing').length
      }
    };

    fs.writeFileSync(
      path.join(reportDir, 'latest-health-report.json'),
      JSON.stringify(report, null, 2)
    );
  }

  async runAIAnalysis() {
    try {
      console.log('🤖 Running AI-powered gap analysis...');

      execSync('npm run ai:analyze', {
        stdio: 'pipe',
        timeout: 120000
      });

      console.log('✅ AI analysis completed successfully');

      // Check if AI found high-priority issues
      const aiReportPath = path.join(rootDir, 'test-reports', 'ai-analysis', 'high-priority-issues.json');
      if (fs.existsSync(aiReportPath)) {
        const aiIssues = JSON.parse(fs.readFileSync(aiReportPath, 'utf8'));
        if (aiIssues.length > 0) {
          this.createAlert('ai_detection', 'ai_analysis', `AI detected ${aiIssues.length} high-priority issues`);
        }
      }

    } catch (error) {
      console.log('⚠️  AI analysis failed (optional feature)');
    }
  }

  async runSmartRecommendations() {
    try {
      console.log('💡 Generating smart test recommendations...');

      execSync('npm run test:recommend:comprehensive', {
        stdio: 'pipe',
        timeout: 90000
      });

      console.log('✅ Smart recommendations generated');

    } catch (error) {
      console.log('⚠️  Smart recommendations failed (optional feature)');
    }
  }

  async keepAlive() {
    return new Promise((resolve) => {
      // Keep the process alive
      const keepAliveInterval = setInterval(() => {
        if (!this.isMonitoring) {
          clearInterval(keepAliveInterval);
          resolve();
        }
      }, 1000);
    });
  }
}

// Start monitoring if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const monitor = new ProactiveMonitor();
  monitor.start().catch(console.error);
}

export default ProactiveMonitor;