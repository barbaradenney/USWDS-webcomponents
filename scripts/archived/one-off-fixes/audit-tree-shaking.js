#!/usr/bin/env node

/**
 * Tree-Shaking Compliance Audit Script
 *
 * This script audits all components for tree-shaking compliance
 * and identifies components that need to be migrated.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Interactive components that MUST use tree-shaking
const INTERACTIVE_COMPONENTS = [
  'accordion', 'modal', 'date-picker', 'date-range-picker', 'combo-box',
  'file-input', 'navigation', 'header', 'footer', 'in-page-navigation',
  'search', 'table', 'time-picker', 'tooltip', 'character-count'
];

// Presentational components (no JavaScript required)
const PRESENTATIONAL_COMPONENTS = [
  'card', 'alert', 'banner', 'breadcrumb', 'button', 'icon', 'tag',
  'step-indicator', 'summary-box', 'identifier', 'process-list'
];

class TreeShakingAuditor {
  constructor() {
    this.componentsDir = path.join(__dirname, '../../src/components');
    this.results = {
      compliant: [],
      nonCompliant: [],
      needsMigration: [],
      presentational: []
    };
  }

  async audit() {
    console.log('🔍 Starting Tree-Shaking Compliance Audit...\n');

    const componentDirs = fs.readdirSync(this.componentsDir)
      .filter(dir => fs.statSync(path.join(this.componentsDir, dir)).isDirectory());

    for (const componentDir of componentDirs) {
      await this.auditComponent(componentDir);
    }

    this.generateReport();
    this.generateMigrationPlan();
  }

  async auditComponent(componentName) {
    const componentPath = path.join(this.componentsDir, componentName);
    const tsFiles = fs.readdirSync(componentPath)
      .filter(file => file.endsWith('.ts') && !file.includes('.test.') && !file.includes('.stories.'));

    for (const tsFile of tsFiles) {
      const filePath = path.join(componentPath, tsFile);
      const content = fs.readFileSync(filePath, 'utf8');

      const analysis = this.analyzeComponent(componentName, content, filePath);
      this.categorizeComponent(componentName, analysis);
    }
  }

  analyzeComponent(componentName, content, filePath) {
    const analysis = {
      componentName,
      filePath,
      hasTreeShakingImport: false,
      hasFullUSWDSImport: false,
      hasDirectImport: false,
      hasFallback: false,
      isInteractive: false,
      isPresentational: false,
      uswdsImports: [],
      issues: []
    };

    // Check component type
    analysis.isInteractive = INTERACTIVE_COMPONENTS.some(comp =>
      componentName.includes(comp) || content.includes(`usa-${comp}`)
    );
    analysis.isPresentational = PRESENTATIONAL_COMPONENTS.some(comp =>
      componentName.includes(comp) || content.includes(`usa-${comp}`)
    );

    // Check for tree-shaking patterns
    const treeShakingPattern = /@uswds\/uswds\/js\/usa-[\w-]+/;
    if (treeShakingPattern.test(content)) {
      analysis.hasTreeShakingImport = true;
      const matches = content.match(/@uswds\/uswds\/js\/(usa-[\w-]+)/g);
      analysis.uswdsImports = matches || [];
    }

    // Check for full USWDS imports (forbidden)
    const fullImportPatterns = [
      /import.*from ['"]@uswds\/uswds['"]/,
      /import ['"]@uswds\/uswds['"]/,
      /require\(['"]@uswds\/uswds['"]\)/
    ];

    for (const pattern of fullImportPatterns) {
      if (pattern.test(content)) {
        analysis.hasFullUSWDSImport = true;
        analysis.issues.push('Uses full USWDS import (forbidden)');
      }
    }

    // Check for dynamic imports
    if (content.includes('import(') && content.includes('@uswds/uswds/js/')) {
      analysis.hasDirectImport = true;
    }

    // Check for fallback implementation
    if (content.includes('loadFullUSWDSLibrary') || content.includes('fallback')) {
      analysis.hasFallback = true;
    }

    // Check for missing tree-shaking in interactive components
    if (analysis.isInteractive && !analysis.hasTreeShakingImport) {
      analysis.issues.push('Interactive component missing tree-shaking import');
    }

    return analysis;
  }

  categorizeComponent(componentName, analysis) {
    if (analysis.isPresentational) {
      this.results.presentational.push(analysis);
    } else if (analysis.isInteractive) {
      if (analysis.hasTreeShakingImport && !analysis.hasFullUSWDSImport && analysis.hasFallback) {
        this.results.compliant.push(analysis);
      } else {
        this.results.needsMigration.push(analysis);
      }
    } else if (analysis.hasFullUSWDSImport || analysis.issues.length > 0) {
      this.results.nonCompliant.push(analysis);
    } else {
      // Component doesn't seem to use USWDS JavaScript
      this.results.presentational.push(analysis);
    }
  }

  generateReport() {
    console.log('📊 Tree-Shaking Compliance Report');
    console.log('==================================\n');

    console.log(`✅ Compliant Components: ${this.results.compliant.length}`);
    this.results.compliant.forEach(comp => {
      console.log(`   - ${comp.componentName} (${comp.uswdsImports.join(', ')})`);
    });

    console.log(`\n⚠️  Components Needing Migration: ${this.results.needsMigration.length}`);
    this.results.needsMigration.forEach(comp => {
      console.log(`   - ${comp.componentName}`);
      comp.issues.forEach(issue => console.log(`     └─ ${issue}`));
    });

    console.log(`\n❌ Non-Compliant Components: ${this.results.nonCompliant.length}`);
    this.results.nonCompliant.forEach(comp => {
      console.log(`   - ${comp.componentName}`);
      comp.issues.forEach(issue => console.log(`     └─ ${issue}`));
    });

    console.log(`\n📄 Presentational Components: ${this.results.presentational.length}`);
    this.results.presentational.forEach(comp => {
      console.log(`   - ${comp.componentName} (no JavaScript required)`);
    });

    // Calculate compliance percentage
    const totalInteractive = this.results.compliant.length + this.results.needsMigration.length + this.results.nonCompliant.length;
    const complianceRate = totalInteractive > 0 ? Math.round((this.results.compliant.length / totalInteractive) * 100) : 100;

    console.log(`\n🎯 Compliance Rate: ${complianceRate}% (${this.results.compliant.length}/${totalInteractive} interactive components)`);
  }

  generateMigrationPlan() {
    console.log('\n📋 Migration Plan');
    console.log('=================\n');

    const migrationNeeded = [...this.results.needsMigration, ...this.results.nonCompliant];

    if (migrationNeeded.length === 0) {
      console.log('🎉 All components are compliant! No migration needed.');
      return;
    }

    console.log('Components to migrate (in priority order):\n');

    migrationNeeded
      .sort((a, b) => a.issues.length - b.issues.length) // Fewer issues = easier migration
      .forEach((comp, index) => {
        console.log(`${index + 1}. ${comp.componentName}`);
        console.log(`   Path: ${comp.filePath}`);
        console.log(`   Issues: ${comp.issues.join(', ')}`);
        console.log(`   Action: ${this.getMigrationAction(comp)}`);
        console.log('');
      });

    // Generate migration commands
    console.log('🔧 Suggested Migration Commands:\n');
    console.log('# Fix all components automatically:');
    console.log('npm run migrate:tree-shaking\n');
    console.log('# Fix individual components:');
    migrationNeeded.slice(0, 3).forEach(comp => {
      console.log(`npm run migrate:tree-shaking -- --component=${comp.componentName}`);
    });
  }

  getMigrationAction(comp) {
    if (comp.hasFullUSWDSImport) {
      return 'Replace full USWDS import with tree-shaking pattern';
    }
    if (comp.isInteractive && !comp.hasTreeShakingImport) {
      return 'Add tree-shaking import and fallback mechanism';
    }
    if (!comp.hasFallback) {
      return 'Add graceful fallback to full USWDS library';
    }
    return 'Review and fix compliance issues';
  }
}

// Run the audit
const auditor = new TreeShakingAuditor();
auditor.audit().catch(console.error);