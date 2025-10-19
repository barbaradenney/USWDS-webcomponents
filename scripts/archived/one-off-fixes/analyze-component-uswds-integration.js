#!/usr/bin/env node

/**
 * Component USWDS Integration Analysis
 *
 * This script analyzes all components to determine their current USWDS integration
 * status and prioritizes them for Vite module migration and interaction testing.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');
const componentsDir = path.join(projectRoot, 'src/components');

// Components that typically have JavaScript interactions in USWDS
const INTERACTIVE_USWDS_COMPONENTS = [
  'accordion', 'banner', 'combo-box', 'date-picker', 'date-range-picker',
  'file-input', 'footer', 'header', 'in-page-navigation', 'language-selector',
  'menu', 'modal', 'pagination', 'search', 'step-indicator', 'table',
  'time-picker', 'tooltip', 'character-count'
];

// Components that are primarily presentational
const PRESENTATIONAL_COMPONENTS = [
  'alert', 'breadcrumb', 'button', 'button-group', 'card', 'checkbox',
  'collection', 'fieldset', 'form-group', 'icon', 'input', 'label',
  'link', 'list', 'memorable-date', 'prose', 'radio', 'select',
  'sidenav', 'summary-box', 'tag', 'text-input', 'textarea', 'validation'
];

async function analyzeComponent(componentName) {
  const componentDir = path.join(componentsDir, componentName);
  const componentFile = path.join(componentDir, `usa-${componentName}.ts`);

  if (!fs.existsSync(componentFile)) {
    return null;
  }

  const componentContent = fs.readFileSync(componentFile, 'utf8');

  // Analyze USWDS integration patterns
  const analysis = {
    name: componentName,
    hasUSWDSImport: componentContent.includes('uswds-loader') || componentContent.includes('@uswds/uswds/js/'),
    hasInitializeUSWDS: componentContent.includes('initializeUSWDS') || componentContent.includes('initializeUSWDSComponent'),
    hasUSWDSModule: componentContent.includes('uswdsModule'),
    hasClickHandlers: componentContent.includes('@click') || componentContent.includes('addEventListener'),
    hasKeyboardHandlers: componentContent.includes('@keydown') || componentContent.includes('@keyup'),
    hasEventDispatching: componentContent.includes('dispatchEvent'),
    isInteractive: INTERACTIVE_USWDS_COMPONENTS.includes(componentName),
    isPresentational: PRESENTATIONAL_COMPONENTS.includes(componentName),

    // Check for specific patterns
    hasViteImportPattern: componentContent.includes("import('@uswds/uswds/js/"),
    hasPreloadedModuleCheck: componentContent.includes('__USWDS_MODULES__'),
    hasStandardizedLoader: componentContent.includes('loadUSWDSModule') || componentContent.includes('initializeUSWDSComponent'),

    // Testing coverage
    hasInteractionTests: false,
    hasStorybookInteractionStories: false,
    hasCypressComponentTests: false,

    // File paths for reference
    componentPath: componentFile,
    testPath: path.join(projectRoot, '__tests__', `${componentName}-interaction.test.ts`),
    cypressPath: path.join(projectRoot, 'cypress/component', `${componentName}-interaction.cy.ts`),
    storiesPath: path.join(componentDir, `usa-${componentName}.interaction.stories.ts`)
  };

  // Check for existing interaction tests
  analysis.hasInteractionTests = fs.existsSync(analysis.testPath);
  analysis.hasStorybookInteractionStories = fs.existsSync(analysis.storiesPath);
  analysis.hasCypressComponentTests = fs.existsSync(analysis.cypressPath);

  // Determine migration priority
  analysis.migrationPriority = calculateMigrationPriority(analysis);
  analysis.recommendedActions = getRecommendedActions(analysis);

  return analysis;
}

function calculateMigrationPriority(analysis) {
  let priority = 0;

  // High priority for interactive components without proper USWDS integration
  if (analysis.isInteractive && !analysis.hasStandardizedLoader) {
    priority += 10;
  }

  // Medium priority for components with click handlers but no USWDS integration
  if (analysis.hasClickHandlers && !analysis.hasUSWDSImport) {
    priority += 7;
  }

  // Add points for missing testing
  if (analysis.isInteractive && !analysis.hasInteractionTests) {
    priority += 5;
  }

  // Boost priority for components with existing event handlers (potential conflicts)
  if (analysis.hasClickHandlers && analysis.hasUSWDSImport) {
    priority += 3; // Like the accordion issue we just fixed
  }

  // Lower priority for presentational components
  if (analysis.isPresentational) {
    priority = Math.max(priority - 5, 0);
  }

  return priority;
}

function getRecommendedActions(analysis) {
  const actions = [];

  if (analysis.isInteractive && !analysis.hasStandardizedLoader) {
    actions.push('🔧 Migrate to standardized USWDS loader pattern');
  }

  if (analysis.hasClickHandlers && analysis.hasUSWDSImport && !analysis.hasPreloadedModuleCheck) {
    actions.push('⚠️ Check for event handler conflicts (like accordion issue)');
  }

  if (!analysis.hasViteImportPattern && analysis.hasUSWDSImport) {
    actions.push('📦 Convert to Vite-compatible USWDS imports');
  }

  if (analysis.isInteractive && !analysis.hasInteractionTests) {
    actions.push('🧪 Add interaction testing');
  }

  if (analysis.isInteractive && !analysis.hasStorybookInteractionStories) {
    actions.push('📖 Create Storybook interaction stories');
  }

  if (analysis.isInteractive && !analysis.hasCypressComponentTests) {
    actions.push('🌐 Add Cypress component tests');
  }

  if (!analysis.hasPreloadedModuleCheck && analysis.hasUSWDSImport) {
    actions.push('🎭 Add Storybook compatibility pattern');
  }

  return actions;
}

async function generateMigrationPlan(analyses) {
  const interactive = analyses.filter(a => a.isInteractive);
  const needsMigration = analyses.filter(a => a.migrationPriority > 5);
  const hasConflicts = analyses.filter(a =>
    a.hasClickHandlers && a.hasUSWDSImport && !a.hasPreloadedModuleCheck
  );

  return {
    summary: {
      totalComponents: analyses.length,
      interactiveComponents: interactive.length,
      componentsNeedingMigration: needsMigration.length,
      potentialConflicts: hasConflicts.length,
      alreadyMigrated: analyses.filter(a => a.hasStandardizedLoader).length
    },
    phases: {
      phase1: {
        title: 'Critical Issues (Potential Accordion-like Problems)',
        components: hasConflicts.sort((a, b) => b.migrationPriority - a.migrationPriority),
        description: 'Components with potential event handler conflicts'
      },
      phase2: {
        title: 'High-Priority Interactive Components',
        components: needsMigration
          .filter(a => a.isInteractive && !hasConflicts.includes(a))
          .sort((a, b) => b.migrationPriority - a.migrationPriority),
        description: 'Interactive components without proper USWDS integration'
      },
      phase3: {
        title: 'Testing Coverage Expansion',
        components: interactive.filter(a => !a.hasInteractionTests),
        description: 'Add interaction testing to remaining interactive components'
      },
      phase4: {
        title: 'Presentational Components',
        components: analyses
          .filter(a => a.isPresentational && a.migrationPriority > 0)
          .sort((a, b) => b.migrationPriority - a.migrationPriority),
        description: 'Lower priority presentational components'
      }
    },
    recommendations: generateRecommendations(analyses)
  };
}

function generateRecommendations(analyses) {
  const recommendations = [];

  // Critical issues
  const conflicts = analyses.filter(a =>
    a.hasClickHandlers && a.hasUSWDSImport && !a.hasPreloadedModuleCheck
  );

  if (conflicts.length > 0) {
    recommendations.push({
      priority: 'CRITICAL',
      title: 'Potential Event Handler Conflicts Detected',
      description: `${conflicts.length} components may have the same issue as accordion`,
      components: conflicts.map(c => c.name),
      action: 'Audit event handlers and USWDS integration patterns immediately'
    });
  }

  // Missing standardized patterns
  const needsLoader = analyses.filter(a => a.isInteractive && !a.hasStandardizedLoader);
  if (needsLoader.length > 0) {
    recommendations.push({
      priority: 'HIGH',
      title: 'Standardize USWDS Loading Patterns',
      description: `${needsLoader.length} interactive components need migration`,
      components: needsLoader.map(c => c.name),
      action: 'Migrate to standardized uswds-loader pattern'
    });
  }

  // Missing testing
  const needsTesting = analyses.filter(a => a.isInteractive && !a.hasInteractionTests);
  if (needsTesting.length > 0) {
    recommendations.push({
      priority: 'MEDIUM',
      title: 'Expand Interaction Testing Coverage',
      description: `${needsTesting.length} interactive components lack interaction tests`,
      components: needsTesting.map(c => c.name),
      action: 'Implement comprehensive interaction testing'
    });
  }

  return recommendations;
}

async function main() {
  console.log('🔍 Analyzing Component USWDS Integration Status');
  console.log('===============================================');

  // Get all component directories
  const componentDirs = fs.readdirSync(componentsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  console.log(`📁 Found ${componentDirs.length} components`);

  // Analyze each component
  const analyses = [];
  for (const componentName of componentDirs) {
    const analysis = await analyzeComponent(componentName);
    if (analysis) {
      analyses.push(analysis);
    }
  }

  console.log(`✅ Analyzed ${analyses.length} components`);

  // Generate migration plan
  const migrationPlan = await generateMigrationPlan(analyses);

  // Display results
  console.log('\\n📊 Integration Status Summary');
  console.log('============================');
  console.log(`📦 Total Components: ${migrationPlan.summary.totalComponents}`);
  console.log(`🔧 Interactive Components: ${migrationPlan.summary.interactiveComponents}`);
  console.log(`✅ Already Migrated: ${migrationPlan.summary.alreadyMigrated}`);
  console.log(`⚠️  Need Migration: ${migrationPlan.summary.componentsNeedingMigration}`);
  console.log(`🚨 Potential Conflicts: ${migrationPlan.summary.potentialConflicts}`);

  // Display recommendations
  console.log('\\n🎯 Critical Recommendations');
  console.log('===========================');
  migrationPlan.recommendations.forEach((rec, index) => {
    console.log(`\\n${index + 1}. [${rec.priority}] ${rec.title}`);
    console.log(`   📝 ${rec.description}`);
    console.log(`   🎯 Components: ${rec.components.join(', ')}`);
    console.log(`   ⚡ Action: ${rec.action}`);
  });

  // Display migration phases
  console.log('\\n📋 Migration Plan Phases');
  console.log('========================');

  Object.entries(migrationPlan.phases).forEach(([phaseKey, phase]) => {
    if (phase.components.length > 0) {
      console.log(`\\n🏷️  ${phase.title}`);
      console.log(`   📖 ${phase.description}`);
      console.log(`   📊 Components (${phase.components.length}): ${phase.components.map(c => c.name).join(', ')}`);

      // Show top recommendations for this phase
      phase.components.slice(0, 3).forEach(component => {
        console.log(`\\n   🔧 ${component.name} (Priority: ${component.migrationPriority})`);
        component.recommendedActions.forEach(action => {
          console.log(`      • ${action}`);
        });
      });
    }
  });

  // Save detailed analysis
  const outputPath = path.join(projectRoot, 'component-integration-analysis.json');
  fs.writeFileSync(outputPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: migrationPlan.summary,
    recommendations: migrationPlan.recommendations,
    phases: migrationPlan.phases,
    detailedAnalysis: analyses
  }, null, 2));

  console.log(`\\n💾 Detailed analysis saved to: ${outputPath}`);
  console.log('\\n🚀 Next Steps:');
  console.log('   1. Review critical recommendations above');
  console.log('   2. Start with Phase 1 components (potential conflicts)');
  console.log('   3. Use migration scripts for automated conversion');
  console.log('   4. Run interaction tests after each migration');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Analysis failed:', error);
    process.exit(1);
  });
}

export { main as analyzeComponentIntegration };