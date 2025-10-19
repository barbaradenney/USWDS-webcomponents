#!/usr/bin/env node

/**
 * Post-install Testing Health Check
 * Runs after npm install to ensure testing infrastructure remains functional
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🔍 Running post-install testing health check...\n');

// Quick health checks after dependency updates
const checks = [
  {
    name: 'TypeScript compilation',
    command: 'npx tsc --version',
    errorMessage: 'TypeScript not properly installed'
  },
  {
    name: 'Vitest availability',
    command: 'npx vitest --version',
    errorMessage: 'Vitest testing framework not available'
  },
  {
    name: 'Cypress availability',
    command: 'npx cypress verify',
    errorMessage: 'Cypress not properly installed'
  },
  {
    name: 'Critical scripts exist',
    check: () => {
      const criticalScripts = [
        'scripts/dev-time-validator.js',
        'scripts/proactive-monitor.js',
        'scripts/testing-health-monitor.js'
      ];

      for (const script of criticalScripts) {
        const scriptPath = path.join(rootDir, script);
        if (!fs.existsSync(scriptPath)) {
          return `Missing critical script: ${script}`;
        }
      }
      return null;
    }
  },
  {
    name: 'Behavioral tests exist',
    check: () => {
      const behavioralTest = path.join(
        rootDir,
        'src/components/date-picker/usa-date-picker.behavioral.cy.ts'
      );
      if (!fs.existsSync(behavioralTest)) {
        return 'Behavioral tests missing - popup visibility tests not available';
      }
      return null;
    }
  }
];

let hasErrors = false;

for (const check of checks) {
  process.stdout.write(`Checking ${check.name}... `);

  try {
    if (check.command) {
      execSync(check.command, { stdio: 'pipe' });
    } else if (check.check) {
      const error = check.check();
      if (error) {
        throw new Error(error);
      }
    }
    console.log('✅');
  } catch (error) {
    console.log('❌');
    console.log(`   ${check.errorMessage || error.message}`);
    hasErrors = true;
  }
}

if (hasErrors) {
  console.log('\n⚠️  Some testing infrastructure needs attention.');
  console.log('Run: npm run testing:health:auto to attempt auto-healing\n');
} else {
  console.log('\n✅ All testing infrastructure is healthy!\n');

  // Show available testing commands
  console.log('🎯 Key testing commands available:');
  console.log('   npm run dev:watch       - Real-time issue detection');
  console.log('   npm run dev:monitor     - Background health monitoring');
  console.log('   npm run testing:health  - Full infrastructure health check');
  console.log('   npm run validate:all    - Run all validations\n');
}