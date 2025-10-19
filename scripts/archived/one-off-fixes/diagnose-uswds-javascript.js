#!/usr/bin/env node

/**
 * USWDS JavaScript Diagnostic Tool
 *
 * Checks if USWDS JavaScript is properly loaded and initialized
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 USWDS JavaScript Diagnostic\n');

// Check 1: USWDS script tag in Storybook
console.log('1️⃣ Checking Storybook USWDS loading...');
const previewHeadPath = path.join(process.cwd(), '.storybook/preview-head.html');
if (fs.existsSync(previewHeadPath)) {
  const previewHead = fs.readFileSync(previewHeadPath, 'utf-8');
  if (previewHead.includes('uswds.min.js') || previewHead.includes('uswds.js')) {
    console.log('   ✅ USWDS script tag found in preview-head.html');

    // Check if it's from CDN or local
    if (previewHead.includes('unpkg.com') || previewHead.includes('cdn')) {
      console.log('   📡 Loading from CDN');
    } else {
      console.log('   📦 Loading from local file');
    }
  } else {
    console.log('   ❌ USWDS script tag NOT found in preview-head.html');
  }
} else {
  console.log('   ❌ preview-head.html not found');
}

// Check 2: USWDS modules registry
console.log('\n2️⃣ Checking USWDS modules registry...');
const registryPath = path.join(process.cwd(), 'src/utils/uswds-modules-registry.ts');
if (fs.existsSync(registryPath)) {
  const registry = fs.readFileSync(registryPath, 'utf-8');
  const modules = [];

  // Extract registered modules
  const moduleMatches = registry.match(/case '([^']+)':/g);
  if (moduleMatches) {
    moduleMatches.forEach(match => {
      const moduleName = match.match(/case '([^']+)':/)[1];
      modules.push(moduleName);
    });
    console.log(`   ✅ ${modules.length} modules registered:`);
    modules.forEach(mod => console.log(`      - ${mod}`));
  }
} else {
  console.log('   ❌ uswds-modules-registry.ts not found');
}

// Check 3: Component initialization patterns
console.log('\n3️⃣ Checking component USWDS initialization...');
const componentsDir = path.join(process.cwd(), 'src/components');
const components = fs.readdirSync(componentsDir).filter(f =>
  fs.statSync(path.join(componentsDir, f)).isDirectory()
);

let withInit = 0;
let withoutInit = 0;
const problematic = [];

components.forEach(comp => {
  const componentFile = path.join(componentsDir, comp, `usa-${comp}.ts`);
  if (fs.existsSync(componentFile)) {
    const code = fs.readFileSync(componentFile, 'utf-8');

    const hasUSWDSInit = code.includes('initializeUSWDSComponent') ||
                         code.includes('USWDS.') ||
                         code.includes('.on(') ||
                         code.includes('.init(');

    if (hasUSWDSInit) {
      withInit++;
    } else {
      withoutInit++;

      // Check if this is an interactive component that should have USWDS
      const interactive = ['modal', 'accordion', 'combo-box', 'date-picker', 'file-input',
                          'time-picker', 'tooltip', 'table', 'character-count', 'header',
                          'search', 'banner'];
      if (interactive.includes(comp)) {
        problematic.push(comp);
      }
    }
  }
});

console.log(`   ✅ ${withInit} components with USWDS initialization`);
console.log(`   ℹ️  ${withoutInit} components without USWDS initialization`);

if (problematic.length > 0) {
  console.log(`   ⚠️  ${problematic.length} interactive components missing USWDS init:`);
  problematic.forEach(comp => console.log(`      - ${comp}`));
}

// Check 4: USWDS loader utility
console.log('\n4️⃣ Checking USWDS loader configuration...');
const loaderPath = path.join(process.cwd(), 'src/utils/uswds-loader.ts');
if (fs.existsSync(loaderPath)) {
  const loader = fs.readFileSync(loaderPath, 'utf-8');

  // Check for supported modules
  const supportedMatch = loader.match(/SUPPORTED_USWDS_MODULES\s*=\s*\[([\s\S]*?)\]/);
  if (supportedMatch) {
    const modules = supportedMatch[1].match(/'([^']+)'/g) || [];
    console.log(`   ✅ ${modules.length} supported USWDS modules defined`);
  }

  // Check for .init() method list
  const initModules = [];
  const initPattern = /moduleName === '([^']+)'/g;
  let match;
  while ((match = initPattern.exec(loader)) !== null) {
    initModules.push(match[1]);
  }
  console.log(`   ✅ ${initModules.length} components configured for .init() method`);

} else {
  console.log('   ❌ uswds-loader.ts not found');
}

// Summary
console.log('\n📊 Summary:');
console.log('   To test USWDS loading:');
console.log('   1. Start Storybook: npm run storybook');
console.log('   2. Open browser console');
console.log('   3. Check for: "✅ USWDS loaded globally"');
console.log('   4. Type: window.USWDS (should show object)');
console.log('   5. Add ?debug=true to URL for verbose logging');
console.log('');
console.log('   If window.USWDS is undefined:');
console.log('   - Check network tab for failed script load');
console.log('   - Check console for errors');
console.log('   - Verify CDN is accessible');
