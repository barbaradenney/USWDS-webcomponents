#!/usr/bin/env node

/**
 * Vite USWDS Configuration Validator
 *
 * This script ensures that the critical Vite configuration for USWDS module
 * resolution is maintained and hasn't regressed.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function validateViteConfig() {
  console.log('🔍 Validating Vite USWDS Configuration...');

  // Check main vite.config.ts
  const viteConfigPath = path.join(process.cwd(), 'vite.config.ts');
  if (!fs.existsSync(viteConfigPath)) {
    console.error('❌ vite.config.ts not found');
    process.exit(1);
  }

  const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');

  // Required optimizeDeps configuration
  const requiredOptimizeDeps = [
    '@uswds/uswds/js/usa-accordion',
    '@uswds/uswds/js/usa-modal',
    '@uswds/uswds/js/usa-date-picker',
    '@uswds/uswds/js/usa-combo-box',
    '@uswds/uswds/js/usa-header',
    '@uswds/uswds/js/usa-time-picker'
  ];

  requiredOptimizeDeps.forEach(dep => {
    if (!viteConfig.includes(dep)) {
      console.error(`❌ Missing optimizeDeps entry: ${dep}`);
      process.exit(1);
    }
  });

  console.log('✅ Main vite.config.ts has required optimizeDeps');

  // Check Storybook configuration
  const storybookConfigPath = path.join(process.cwd(), '.storybook/main.ts');
  if (!fs.existsSync(storybookConfigPath)) {
    console.error('❌ .storybook/main.ts not found');
    process.exit(1);
  }

  const storybookConfig = fs.readFileSync(storybookConfigPath, 'utf8');

  // Required Storybook Vite configuration
  const requiredStorybookConfig = [
    'optimizeDeps.include.push(',
    'config.define.global = \'globalThis\'',
    'config.build.commonjsOptions.include'
  ];

  requiredStorybookConfig.forEach(config => {
    if (!storybookConfig.includes(config)) {
      console.error(`❌ Missing Storybook config: ${config}`);
      process.exit(1);
    }
  });

  console.log('✅ Storybook main.ts has required Vite configuration');

  // Check preview-head.html
  const previewHeadPath = path.join(process.cwd(), '.storybook/preview-head.html');
  if (!fs.existsSync(previewHeadPath)) {
    console.error('❌ .storybook/preview-head.html not found');
    process.exit(1);
  }

  const previewHead = fs.readFileSync(previewHeadPath, 'utf8');

  const requiredPreviewHead = [
    'window.__USWDS_MODULES__',
    '/node_modules/.vite/deps/@uswds_uswds_js_usa-accordion.js',
    'Pre-loaded USWDS'
  ];

  requiredPreviewHead.forEach(config => {
    if (!previewHead.includes(config)) {
      console.error(`❌ Missing preview-head config: ${config}`);
      process.exit(1);
    }
  });

  console.log('✅ Storybook preview-head.html has required module pre-loading');

  // Check USWDS loader fallback
  const uswdsLoaderPath = path.join(process.cwd(), 'src/utils/uswds-loader.ts');
  if (!fs.existsSync(uswdsLoaderPath)) {
    console.error('❌ src/utils/uswds-loader.ts not found');
    process.exit(1);
  }

  const uswdsLoader = fs.readFileSync(uswdsLoaderPath, 'utf8');

  const requiredLoaderFeatures = [
    '__USWDS_MODULES__',
    'Using pre-loaded USWDS',
    'from Storybook'
  ];

  requiredLoaderFeatures.forEach(feature => {
    if (!uswdsLoader.includes(feature)) {
      console.error(`❌ Missing USWDS loader feature: ${feature}`);
      process.exit(1);
    }
  });

  console.log('✅ USWDS loader has required fallback system');
  console.log('🎉 All Vite USWDS configurations are valid');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  validateViteConfig();
}

export { validateViteConfig };