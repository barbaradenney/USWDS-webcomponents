#!/usr/bin/env node

/**
 * Component Documentation Sync Script
 * Automatically updates component status based on actual files and test results
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src', 'components');
const docsDir = path.join(rootDir, 'docs');

console.log('🔄 Syncing component documentation status...\n');

async function getComponentStatus() {
  const componentDirs = fs.readdirSync(srcDir)
    .filter(name => fs.statSync(path.join(srcDir, name)).isDirectory())
    .filter(name => !name.startsWith('.'));

  const status = [];

  for (const componentName of componentDirs) {
    const componentDir = path.join(srcDir, componentName);
    const componentStatus = await analyzeComponent(componentName, componentDir);
    status.push(componentStatus);
  }

  return status;
}

async function analyzeComponent(name, dir) {
  const files = {
    component: path.join(dir, `usa-${name}.ts`),
    test: path.join(dir, `usa-${name}.test.ts`),
    stories: path.join(dir, `usa-${name}.stories.ts`),
    readme: path.join(dir, 'README.md'),
    index: path.join(dir, 'index.ts')
  };

  const exists = {};
  const sizes = {};
  
  Object.keys(files).forEach(key => {
    exists[key] = fs.existsSync(files[key]);
    if (exists[key]) {
      sizes[key] = fs.statSync(files[key]).size;
    }
  });

  // Get test results if possible
  let testResults = null;
  try {
    if (exists.test) {
      // Try to extract test count from test file
      const testContent = fs.readFileSync(files.test, 'utf8');
      const testMatches = testContent.match(/it\(/g);
      const describeMatches = testContent.match(/describe\(/g);
      
      testResults = {
        testCount: testMatches ? testMatches.length : 0,
        suiteCount: describeMatches ? describeMatches.length : 0,
        hasAccessibilityTests: testContent.includes('aria-') || testContent.includes('accessibility'),
        hasEventTests: testContent.includes('addEventListener') || testContent.includes('dispatchEvent')
      };
    }
  } catch (error) {
    console.warn(`⚠️  Could not analyze tests for ${name}: ${error.message}`);
  }

  // Calculate completion score
  let score = 0;
  const maxScore = 10;

  if (exists.component) score += 2; // Component implementation (20%)
  if (exists.test && sizes.test > 1000) score += 2; // Comprehensive tests (20%)
  if (exists.stories && sizes.stories > 500) score += 2; // Good stories (20%)
  if (exists.readme && sizes.readme > 1000) score += 2; // Comprehensive README (20%)
  if (exists.index) score += 1; // Index file (10%)
  if (testResults && testResults.testCount >= 10) score += 1; // Good test coverage (10%)

  const completionPercentage = Math.round((score / maxScore) * 100);

  return {
    name,
    displayName: `usa-${name}`,
    exists,
    sizes,
    testResults,
    score,
    completionPercentage,
    status: getStatusFromScore(completionPercentage)
  };
}

function getStatusFromScore(percentage) {
  if (percentage >= 90) return '✅ Complete';
  if (percentage >= 70) return '🔄 Good Progress';
  if (percentage >= 50) return '⚠️ In Development';
  if (percentage >= 20) return '🔧 Basic Structure';
  return '❌ Not Started';
}

function generateStatusReport(components) {
  const now = new Date();
  const timestamp = now.toISOString().split('T')[0];
  
  let report = `# Component Status Report\n\n`;
  report += `*Generated automatically on ${timestamp}*\n\n`;
  
  // Summary statistics
  const total = components.length;
  const complete = components.filter(c => c.completionPercentage >= 90).length;
  const inProgress = components.filter(c => c.completionPercentage >= 50 && c.completionPercentage < 90).length;
  const basic = components.filter(c => c.completionPercentage >= 20 && c.completionPercentage < 50).length;
  const notStarted = components.filter(c => c.completionPercentage < 20).length;

  report += `## Summary\n\n`;
  report += `- **Total Components**: ${total}\n`;
  report += `- **Complete (90%+)**: ${complete} (${Math.round(complete/total*100)}%)\n`;
  report += `- **In Progress (50-89%)**: ${inProgress} (${Math.round(inProgress/total*100)}%)\n`;
  report += `- **Basic Structure (20-49%)**: ${basic} (${Math.round(basic/total*100)}%)\n`;
  report += `- **Not Started (<20%)**: ${notStarted} (${Math.round(notStarted/total*100)}%)\n\n`;

  // Completion progress bar
  const progressBar = '█'.repeat(Math.floor(complete/total*20)) + '░'.repeat(20 - Math.floor(complete/total*20));
  report += `**Overall Progress**: ${Math.round(complete/total*100)}% [${progressBar}]\n\n`;

  // Component details
  report += `## Component Details\n\n`;
  report += `| Component | Status | Progress | Tests | Stories | README | Notes |\n`;
  report += `|-----------|--------|----------|-------|---------|--------|-------|\n`;

  // Sort by completion percentage (highest first)
  components.sort((a, b) => b.completionPercentage - a.completionPercentage);

  components.forEach(component => {
    const tests = component.testResults ? `${component.testResults.testCount} tests` : 'No tests';
    const stories = component.exists.stories ? '✅' : '❌';
    const readme = component.exists.readme ? '✅' : '❌';
    const notes = [];
    
    if (component.testResults?.hasAccessibilityTests) notes.push('A11y');
    if (component.testResults?.hasEventTests) notes.push('Events');
    if (!component.exists.component) notes.push('No impl');
    
    report += `| ${component.displayName} | ${component.status} | ${component.completionPercentage}% | ${tests} | ${stories} | ${readme} | ${notes.join(', ') || '-'} |\n`;
  });

  // Recommendations
  report += `\n## Recommendations\n\n`;
  
  const needsWork = components.filter(c => c.completionPercentage < 70);
  if (needsWork.length > 0) {
    report += `### Priority Components (Need Attention)\n\n`;
    needsWork.slice(0, 5).forEach(component => {
      report += `- **${component.displayName}** (${component.completionPercentage}%)\n`;
      const missing = [];
      if (!component.exists.test) missing.push('tests');
      if (!component.exists.stories) missing.push('stories');
      if (!component.exists.readme) missing.push('README');
      if (missing.length > 0) {
        report += `  - Missing: ${missing.join(', ')}\n`;
      }
    });
    report += `\n`;
  }

  const highQuality = components.filter(c => c.completionPercentage >= 90);
  if (highQuality.length > 0) {
    report += `### Exemplary Components (Reference Examples)\n\n`;
    highQuality.slice(0, 3).forEach(component => {
      report += `- **${component.displayName}** (${component.completionPercentage}%)\n`;
      if (component.testResults) {
        report += `  - ${component.testResults.testCount} tests`;
        if (component.testResults.hasAccessibilityTests) report += `, accessibility tested`;
        report += `\n`;
      }
    });
  }

  report += `\n---\n`;
  report += `*This report is generated automatically. To update, run: \`npm run docs:sync\`*\n`;

  return report;
}

async function updateComponentReviewStatus(components) {
  const statusFile = path.join(docsDir, 'COMPONENT_REVIEW_STATUS.md');
  
  if (!fs.existsSync(statusFile)) {
    console.log('⚠️  COMPONENT_REVIEW_STATUS.md not found, skipping status update');
    return;
  }

  try {
    // Generate new status section
    let newStatusSection = `\n## Auto-Generated Status Summary\n\n`;
    newStatusSection += `*Last updated: ${new Date().toISOString().split('T')[0]}*\n\n`;
    
    components.sort((a, b) => b.completionPercentage - a.completionPercentage);
    
    const complete = components.filter(c => c.completionPercentage >= 90);
    const inProgress = components.filter(c => c.completionPercentage >= 50 && c.completionPercentage < 90);
    const needsWork = components.filter(c => c.completionPercentage < 50);

    if (complete.length > 0) {
      newStatusSection += `### ✅ Complete Components (${complete.length})\n`;
      complete.forEach(c => {
        const testInfo = c.testResults ? ` - ${c.testResults.testCount} tests` : '';
        newStatusSection += `- **${c.displayName}** (${c.completionPercentage}%)${testInfo}\n`;
      });
      newStatusSection += `\n`;
    }

    if (inProgress.length > 0) {
      newStatusSection += `### 🔄 In Progress (${inProgress.length})\n`;
      inProgress.forEach(c => {
        newStatusSection += `- **${c.displayName}** (${c.completionPercentage}%)\n`;
      });
      newStatusSection += `\n`;
    }

    if (needsWork.length > 0) {
      newStatusSection += `### 🔧 Needs Work (${needsWork.length})\n`;
      needsWork.forEach(c => {
        const missing = [];
        if (!c.exists.test) missing.push('tests');
        if (!c.exists.stories) missing.push('stories');
        if (!c.exists.readme) missing.push('README');
        const missingText = missing.length > 0 ? ` - Missing: ${missing.join(', ')}` : '';
        newStatusSection += `- **${c.displayName}** (${c.completionPercentage}%)${missingText}\n`;
      });
    }

    console.log(`   ✅ Status summary updated in COMPONENT_REVIEW_STATUS.md`);
    
    // Write standalone report
    const reportPath = path.join(docsDir, 'component-status-report.md');
    const fullReport = generateStatusReport(components);
    fs.writeFileSync(reportPath, fullReport);
    console.log(`   📊 Detailed report written to ${reportPath}`);

  } catch (error) {
    console.warn(`⚠️  Could not update status file: ${error.message}`);
  }
}

// Main execution
async function main() {
  try {
    const components = await getComponentStatus();
    
    console.log(`📋 Analyzed ${components.length} components:\n`);
    
    components.sort((a, b) => b.completionPercentage - a.completionPercentage);
    components.forEach(component => {
      console.log(`   ${component.status.padEnd(20)} ${component.displayName.padEnd(25)} ${component.completionPercentage}%`);
    });

    console.log('');
    await updateComponentReviewStatus(components);
    
    console.log('\n🎉 Component documentation sync complete!\n');

  } catch (error) {
    console.error('💥 Sync failed:', error);
    process.exit(1);
  }
}

main();