#!/usr/bin/env node

/**
 * USWDS Critical Components Validator
 *
 * Validates USWDS compliance for all critical interactive components
 * that have complex JavaScript behavior and calendar/modal/dropdown functionality
 */

import fs from 'fs';
import path from 'path';
import { validateUSWDSCompliance, generateComplianceReport } from './validate-uswds-compliance.js';

// Critical components that require USWDS alignment validation
const CRITICAL_COMPONENTS = [
  'date-picker',
  'combo-box',
  'accordion',
  'modal',
  'time-picker',
  'character-count',
  'file-input',
  'pagination',
  'table'
];

/**
 * Validate all critical components
 */
export async function validateCriticalComponents() {
  console.log(`🔍 USWDS Critical Components Validator`);
  console.log(`Validating ${CRITICAL_COMPONENTS.length} critical components...\n`);

  const results = [];
  let totalPassed = 0;
  let totalFailed = 0;
  let totalWarnings = 0;

  for (const component of CRITICAL_COMPONENTS) {
    const filePath = `src/components/${component}/usa-${component}.ts`;

    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Skipping ${component}: Component file not found`);
      continue;
    }

    console.log(`\n📋 Validating: ${component}`);
    console.log(`=====================================`);

    const result = validateUSWDSCompliance(filePath, component);
    const isCompliant = generateComplianceReport(result);

    results.push({
      component,
      filePath,
      ...result,
      isCompliant
    });

    totalPassed += result.passed;
    totalFailed += result.failed;
    totalWarnings += result.warningCount;
  }

  // Generate summary report
  console.log(`\n\n📊 Critical Components Summary Report`);
  console.log(`=====================================`);

  const compliantComponents = results.filter(r => r.isCompliant);
  const nonCompliantComponents = results.filter(r => !r.isCompliant);

  console.log(`✅ Compliant Components: ${compliantComponents.length}/${results.length}`);
  console.log(`❌ Non-Compliant Components: ${nonCompliantComponents.length}/${results.length}`);
  console.log(`📈 Overall Pass Rate: ${Math.round((totalPassed / (totalPassed + totalFailed + totalWarnings)) * 100)}%`);

  if (compliantComponents.length > 0) {
    console.log(`\n🏆 Compliant Components:`);
    compliantComponents.forEach(comp => {
      const passRate = Math.round((comp.passed / (comp.passed + comp.failed + comp.warningCount)) * 100);
      console.log(`  ✅ ${comp.component} (${passRate}%)`);
    });
  }

  if (nonCompliantComponents.length > 0) {
    console.log(`\n⚠️  Non-Compliant Components:`);
    nonCompliantComponents.forEach(comp => {
      const passRate = Math.round((comp.passed / (comp.passed + comp.failed + comp.warningCount)) * 100);
      console.log(`  ❌ ${comp.component} (${passRate}%) - ${comp.failed} errors, ${comp.warningCount} warnings`);
    });

    console.log(`\n💡 To fix non-compliant components:`);
    nonCompliantComponents.forEach(comp => {
      console.log(`  🔧 npm run uswds:validate-alignment ${comp.filePath}`);
    });
  }

  // Component-specific recommendations
  console.log(`\n🎯 Component-Specific Guidelines:`);
  console.log(`  📅 Date Picker: Must include calendar popup with month navigation`);
  console.log(`  🔽 Combo Box: Must support filtering and keyboard navigation`);
  console.log(`  📁 Accordion: Must handle expand/collapse with proper ARIA states`);
  console.log(`  🪟 Modal: Must trap focus and handle Escape key`);
  console.log(`  ⏰ Time Picker: Must validate time format and support AM/PM`);

  // Return results instead of calling process.exit when imported
  const overallPassRate = Math.round((totalPassed / (totalPassed + totalFailed + totalWarnings)) * 100);

  return {
    passRate: overallPassRate,
    criticalIssues: nonCompliantComponents.length,
    compliantComponents: compliantComponents.length,
    totalComponents: results.length,
    results
  };
}

// Only run when called directly, not when imported
if (import.meta.url === `file://${process.argv[1]}`) {
  validateCriticalComponents().then(result => {
    if (result.criticalIssues > 0) {
      console.log(`\n💥 CRITICAL: ${result.criticalIssues} components are not USWDS compliant!`);
      console.log(`All critical components must maintain 100% USWDS alignment.`);
      process.exit(1);
    } else {
      console.log(`\n🎉 All critical components are USWDS compliant!`);
      process.exit(0);
    }
  }).catch(error => {
    console.error('❌ Critical components validation failed:', error);
    process.exit(1);
  });
}