#!/usr/bin/env node

/**
 * Component Layout Validation Script
 * Runs layout tests to prevent positioning/structure regressions
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Layout test patterns for validation
// const LAYOUT_TEST_PATTERNS = [
//   'src/**/*.layout.test.ts',
//   '__tests__/**/layout*.test.ts'
// ];

console.log('🎨 Layout Validation: Checking component structure and positioning...');

// Check if layout test files exist
const layoutTestFiles = [];
const componentsDir = './src/components';

if (fs.existsSync(componentsDir)) {
  const components = fs.readdirSync(componentsDir);
  components.forEach(component => {
    const layoutTestFile = path.join(componentsDir, component, `usa-${component}.layout.test.ts`);
    if (fs.existsSync(layoutTestFile)) {
      layoutTestFiles.push(layoutTestFile);
    }
  });
}

if (layoutTestFiles.length === 0) {
  console.log('📝 No layout test files found. Layout tests are optional but recommended for components with interactive elements.');
  process.exit(0);
}

console.log(`🔍 Found ${layoutTestFiles.length} layout test files`);

try {
  // Run layout-specific tests directly using found files
  const testCommand = `npm run test -- ${layoutTestFiles.join(' ')} --run --reporter=dot`;
  console.log(`📋 Running: ${testCommand}`);

  execSync(testCommand, {
    stdio: 'inherit',
    cwd: process.cwd(),
    timeout: 120000 // 2 minute timeout
  });

  console.log('✅ Layout validation passed!');

} catch (error) {
  if (error.status === 124) {
    console.error('❌ Layout validation timed out after 2 minutes');
  } else {
    console.error('❌ Layout validation failed!');
  }
  console.error('');
  console.error('Common layout issues to check:');
  console.error('  • Buttons positioned below inputs instead of inside/adjacent');
  console.error('  • Missing icons in toggle/clear buttons');
  console.error('  • Incorrect USWDS CSS class structure');
  console.error('  • Missing wrapper elements for proper positioning');
  console.error('');
  console.error('Run this command to debug specific component:');
  console.error('  npm test src/components/[component]/[component].layout.test.ts');

  process.exit(1);
}