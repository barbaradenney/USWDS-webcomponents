/**
 * Global Setup for Comprehensive Testing
 *
 * This setup ensures all testing infrastructure is properly initialized
 * before any tests run.
 */

import { chromium, FullConfig } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

async function globalSetup(config: FullConfig) {
  console.log('🚀 Setting up comprehensive testing environment...');

  // Ensure test directories exist
  const testDirs = [
    './test-reports',
    './test-reports/accessibility',
    './test-reports/performance',
    './test-reports/security',
    './test-reports/visual',
    './test-reports/playwright-artifacts',
    './test-reports/coverage'
  ];

  for (const dir of testDirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  }

  // Check if Storybook is already running
  let storybookRunning = false;
  try {
    const response = await fetch('http://localhost:6006/iframe.html');
    storybookRunning = response.ok;
  } catch (error) {
    // Storybook is not running
  }

  if (!storybookRunning) {
    console.log('🔄 Starting Storybook for testing...');

    // Start Storybook in the background
    const { spawn } = require('child_process');
    const storybookProcess = spawn('npm', ['run', 'storybook'], {
      stdio: 'pipe',
      detached: true
    });

    // Store process ID for cleanup
    fs.writeFileSync('./test-reports/storybook.pid', storybookProcess.pid.toString());

    // Wait for Storybook to be ready
    let attempts = 0;
    const maxAttempts = 60; // 2 minutes timeout

    while (attempts < maxAttempts) {
      try {
        const response = await fetch('http://localhost:6006/iframe.html');
        if (response.ok) {
          console.log('✅ Storybook is ready');
          break;
        }
      } catch (error) {
        // Still starting up...
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;

      if (attempts >= maxAttempts) {
        throw new Error('Storybook failed to start within timeout period');
      }
    }
  } else {
    console.log('✅ Storybook is already running');
  }

  // Verify Playwright browsers are installed
  try {
    await execAsync('npx playwright --version');
    console.log('✅ Playwright is available');
  } catch (error) {
    console.log('📥 Installing Playwright browsers...');
    await execAsync('npx playwright install');
    console.log('✅ Playwright browsers installed');
  }

  // Create comprehensive test state file
  const testState = {
    startTime: Date.now(),
    storybookUrl: 'http://localhost:6006',
    environment: {
      node: process.version,
      platform: process.platform,
      arch: process.arch,
      ci: !!process.env.CI
    },
    configuration: {
      parallel: config.fullyParallel,
      workers: config.workers,
      retries: config.retries,
      timeout: config.timeout
    }
  };

  fs.writeFileSync('./test-reports/test-state.json', JSON.stringify(testState, null, 2));

  // Test browser accessibility
  console.log('🔍 Testing browser accessibility...');
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto('http://localhost:6006/iframe.html?id=components-button--default');
    await page.waitForSelector('usa-button', { timeout: 10000 });
    console.log('✅ Basic component accessibility verified');
  } catch (error) {
    console.error('❌ Component accessibility test failed:', error);
    throw error;
  } finally {
    await browser.close();
  }

  // Setup axe-core for accessibility testing
  console.log('🔧 Setting up accessibility testing infrastructure...');

  // Verify axe-core is available
  try {
    const axeCoreExists = fs.existsSync('./node_modules/axe-core');
    if (!axeCoreExists) {
      console.log('📥 Installing axe-core...');
      await execAsync('npm install --save-dev axe-core');
    }
    console.log('✅ Accessibility testing ready');
  } catch (error) {
    console.warn('⚠️ Failed to setup axe-core:', error);
  }

  // Setup performance monitoring
  console.log('📊 Setting up performance monitoring...');
  const performanceState = {
    baselineMetrics: {
      timestamp: Date.now(),
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime()
    }
  };

  fs.writeFileSync('./test-reports/performance-baseline.json', JSON.stringify(performanceState, null, 2));

  // Setup security testing infrastructure
  console.log('🔒 Setting up security testing infrastructure...');
  const securityState = {
    timestamp: Date.now(),
    environment: 'test',
    securityHeaders: [
      'X-Frame-Options',
      'X-Content-Type-Options',
      'X-XSS-Protection',
      'Strict-Transport-Security',
      'Content-Security-Policy'
    ]
  };

  fs.writeFileSync('./test-reports/security-config.json', JSON.stringify(securityState, null, 2));

  console.log('🎯 Comprehensive testing environment ready!');
}

export default globalSetup;