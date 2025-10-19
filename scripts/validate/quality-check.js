import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

console.log('🔍 USWDS Web Components - Quality Check\n');

let allChecksPassed = true;
const results = {
  typescript: false,
  linting: false,
  tests: false,
  build: false,
  coverage: 0,
  components: 0,
  storiesExists: 0,
  readmeExists: 0
};

// Helper to run commands safely
function runCommand(command, description, required = true) {
  console.log(`📋 ${description}...`);
  try {
    const output = execSync(command, { 
      cwd: projectRoot, 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    console.log(`✅ ${description} - PASSED\n`);
    return { success: true, output };
  } catch (error) {
    console.log(`❌ ${description} - FAILED`);
    if (error.stdout) console.log('STDOUT:', error.stdout);
    if (error.stderr) console.log('STDERR:', error.stderr);
    console.log('');
    
    if (required) {
      allChecksPassed = false;
    }
    return { success: false, error: error.message };
  }
}

// 1. TypeScript Compilation Check (CRITICAL)
console.log('🏗️  CRITICAL CHECKS (Production Blocking)\n');
const typecheck = runCommand('npm run typecheck', 'TypeScript Compilation', true);
results.typescript = typecheck.success;

// 2. Linting Check
const lint = runCommand('npm run lint', 'ESLint Code Quality', true);
results.linting = lint.success;

// 3. Unit Tests
const tests = runCommand('npm run test', 'Unit Tests Execution', true);
results.tests = tests.success;

// 4. Build Process
const build = runCommand('npm run build', 'Production Build', true);
results.build = build.success;

console.log('📊 DOCUMENTATION & CONSISTENCY CHECKS\n');

// 5. Component Documentation Audit
function auditComponentDocumentation() {
  const componentsDir = path.join(projectRoot, 'src', 'components');
  const components = fs.readdirSync(componentsDir).filter(dir => 
    fs.statSync(path.join(componentsDir, dir)).isDirectory()
  );
  
  results.components = components.length;
  
  let storiesCount = 0;
  let readmeCount = 0;
  const missing = {
    stories: [],
    readmes: []
  };
  
  components.forEach(component => {
    const componentDir = path.join(componentsDir, component);
    
    // Check for Storybook stories
    const storyFile = path.join(componentDir, `usa-${component}.stories.ts`);
    if (fs.existsSync(storyFile)) {
      storiesCount++;
    } else {
      missing.stories.push(component);
    }
    
    // Check for README
    const readmeFile = path.join(componentDir, 'README.md');
    if (fs.existsSync(readmeFile)) {
      readmeCount++;
    } else {
      missing.readmes.push(component);
    }
  });
  
  results.storiesExists = storiesCount;
  results.readmeExists = readmeCount;
  
  console.log(`📦 Components Found: ${components.length}`);
  console.log(`📚 Storybook Stories: ${storiesCount}/${components.length} (${Math.round(storiesCount/components.length*100)}%)`);
  console.log(`📖 Component READMEs: ${readmeCount}/${components.length} (${Math.round(readmeCount/components.length*100)}%)`);
  
  if (missing.stories.length > 0) {
    console.log(`❌ Missing Stories: ${missing.stories.join(', ')}`);
  }
  if (missing.readmes.length > 0) {
    console.log(`❌ Missing READMEs: ${missing.readmes.join(', ')}`);
  }
  console.log('');
}

auditComponentDocumentation();

// 6. Test Coverage Check
const coverage = runCommand('npm run test:coverage -- --reporter=json', 'Test Coverage Analysis', false);
if (coverage.success && coverage.output) {
  try {
    // Parse coverage from output
    const coverageMatch = coverage.output.match(/All files[^\n]*\|\s*(\d+\.?\d*)/);
    if (coverageMatch) {
      results.coverage = parseFloat(coverageMatch[1]);
      console.log(`🧪 Test Coverage: ${results.coverage}%`);
    }
  } catch (e) {
    console.log('⚠️  Could not parse coverage data');
  }
}

console.log('\n📊 QUALITY REPORT SUMMARY\n');
console.log('='.repeat(50));

// Production Readiness Score
let productionScore = 0;
const maxScore = 100;

// Critical checks (60% of score)
if (results.typescript) productionScore += 20;
if (results.linting) productionScore += 15;
if (results.tests) productionScore += 15;
if (results.build) productionScore += 10;

// Quality checks (40% of score)
productionScore += Math.min(20, (results.coverage / 85) * 20); // 85% coverage = full points
productionScore += Math.min(10, (results.storiesExists / results.components) * 10);
productionScore += Math.min(10, (results.readmeExists / results.components) * 10);

console.log(`🏆 Production Readiness Score: ${Math.round(productionScore)}/${maxScore}`);
console.log('');

// Status indicators
console.log('📋 Component Status:');
console.log(`   TypeScript Compilation: ${results.typescript ? '✅ PASS' : '❌ FAIL'}`);
console.log(`   Code Quality (Linting): ${results.linting ? '✅ PASS' : '❌ FAIL'}`);
console.log(`   Unit Tests: ${results.tests ? '✅ PASS' : '❌ FAIL'}`);
console.log(`   Build Process: ${results.build ? '✅ PASS' : '❌ FAIL'}`);
console.log(`   Test Coverage: ${results.coverage}% ${results.coverage >= 85 ? '✅' : results.coverage >= 70 ? '⚠️' : '❌'}`);
console.log(`   Storybook Stories: ${results.storiesExists}/${results.components} ${results.storiesExists === results.components ? '✅' : '⚠️'}`);
console.log(`   Documentation: ${results.readmeExists}/${results.components} ${results.readmeExists === results.components ? '✅' : '⚠️'}`);

console.log('\n🎯 RECOMMENDATIONS:');

if (!results.typescript) {
  console.log('   🚨 CRITICAL: Fix TypeScript compilation errors immediately');
  console.log('      Run: npm run typecheck');
}

if (!results.linting) {
  console.log('   🚨 CRITICAL: Fix linting errors');
  console.log('      Run: npm run lint:fix');
}

if (!results.tests) {
  console.log('   🚨 CRITICAL: Fix failing unit tests');
  console.log('      Run: npm run test:ui for interactive debugging');
}

if (!results.build) {
  console.log('   🚨 CRITICAL: Fix build process');
  console.log('      Build must work for production deployment');
}

if (results.coverage < 85) {
  console.log('   ⚠️  Increase test coverage to 85%+ for production readiness');
}

if (results.storiesExists < results.components) {
  console.log('   ⚠️  Add Storybook stories for all components');
}

if (results.readmeExists < results.components) {
  console.log('   ⚠️  Add README documentation for all components');
}

if (productionScore >= 90) {
  console.log('\n🎉 EXCELLENT: Codebase is production ready!');
} else if (productionScore >= 70) {
  console.log('\n✅ GOOD: Codebase is nearly production ready');
} else if (productionScore >= 50) {
  console.log('\n⚠️  NEEDS WORK: Address critical issues before production');
} else {
  console.log('\n🚨 NOT READY: Significant work needed for production');
}

console.log('\n' + '='.repeat(50));

// Exit with error code if critical checks failed
if (!allChecksPassed) {
  console.log('\n❌ Quality checks failed. Address issues above before proceeding.');
  process.exit(1);
} else {
  console.log('\n✅ All critical quality checks passed!');
  process.exit(0);
}