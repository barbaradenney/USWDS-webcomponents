#!/usr/bin/env node

/**
 * USWDS Pattern Field Completeness Validator
 *
 * Validates that pattern components include ALL fields specified in the official USWDS patterns.
 * Prevents missing fields that should be present per USWDS specification.
 *
 * This validator checks against the official USWDS patterns documentation:
 * https://designsystem.digital.gov/patterns/
 *
 * Checks:
 * - Address pattern has all required fields (including Google Plus Code)
 * - Phone pattern has all required fields (including extension, type)
 * - Name pattern has all required fields
 * - Other patterns have complete field sets
 *
 * Exit codes:
 * 0 - All patterns have complete field sets
 * 1 - One or more patterns missing required fields
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const PATTERNS_DIR = path.join(__dirname, '../../packages/uswds-wc-patterns/src/patterns');

/**
 * USWDS Pattern Field Requirements
 * Based on official USWDS documentation
 */
const PATTERN_FIELD_REQUIREMENTS = {
  address: {
    description: 'Address Pattern',
    url: 'https://designsystem.digital.gov/patterns/create-a-user-profile/address/',
    requiredFields: [
      {
        name: 'street1',
        label: 'Street address',
        type: 'usa-text-input',
      },
      {
        name: 'street2',
        label: 'Street address line 2',
        type: 'usa-text-input',
        optional: true,
      },
      {
        name: 'city',
        label: 'City',
        type: 'usa-text-input',
      },
      {
        name: 'state',
        label: 'State, territory, or military post',
        type: 'usa-select',
      },
      {
        name: 'zipCode',
        label: 'ZIP code',
        type: 'usa-text-input',
      },
      {
        name: 'urbanization',
        label: 'Urbanization',
        type: 'usa-text-input',
        optional: true,
      },
      {
        name: 'plusCode',
        label: 'Google Plus Code',
        type: 'usa-text-input',
        optional: true,
      },
    ],
  },
  'phone-number': {
    description: 'Phone Number Pattern',
    url: 'https://designsystem.digital.gov/patterns/create-a-user-profile/phone-number/',
    requiredFields: [
      {
        name: 'phoneType',
        label: 'Phone type',
        type: 'usa-select',
        optional: true,
      },
      {
        name: 'phoneNumber',
        label: 'Phone number',
        type: 'usa-text-input',
      },
      {
        name: 'extension',
        label: 'Extension',
        type: 'usa-text-input',
        optional: true,
      },
    ],
  },
  name: {
    description: 'Name Pattern',
    url: 'https://designsystem.digital.gov/patterns/create-a-user-profile/name/',
    requiredFields: [
      {
        name: 'fullName',
        label: 'Full name',
        type: 'usa-text-input',
      },
      {
        name: 'givenName',
        label: 'Given name (First name)',
        type: 'usa-text-input',
      },
      {
        name: 'middleName',
        label: 'Middle name',
        type: 'usa-text-input',
        optional: true,
      },
      {
        name: 'familyName',
        label: 'Family name (Last name)',
        type: 'usa-text-input',
      },
      {
        name: 'suffix',
        label: 'Suffix',
        type: 'usa-select',
        optional: true,
      },
      {
        name: 'preferredName',
        label: 'Preferred name',
        type: 'usa-text-input',
        optional: true,
      },
    ],
  },
  'email-address': {
    description: 'Email Address Pattern',
    url: 'https://designsystem.digital.gov/patterns/create-a-user-profile/email-address/',
    requiredFields: [
      {
        name: 'email',
        label: 'Email address',
        type: 'usa-text-input',
      },
      {
        name: 'sensitiveInfoConsent',
        label: 'Sensitive information consent',
        type: 'usa-radio',
        optional: true,
      },
    ],
  },
  'date-of-birth': {
    description: 'Date of Birth Pattern',
    url: 'https://designsystem.digital.gov/patterns/create-a-user-profile/date-of-birth/',
    requiredFields: [
      {
        name: 'date_of_birth_month',
        label: 'Month',
        type: 'usa-select',
      },
      {
        name: 'date_of_birth_day',
        label: 'Day',
        type: 'usa-text-input',
      },
      {
        name: 'date_of_birth_year',
        label: 'Year',
        type: 'usa-text-input',
      },
    ],
  },
  sex: {
    description: 'Sex Pattern',
    url: 'https://designsystem.digital.gov/patterns/create-a-user-profile/sex/',
    requiredFields: [
      {
        name: 'sex',
        label: 'Sex',
        type: 'usa-radio',
      },
    ],
  },
  ssn: {
    description: 'Social Security Number Pattern',
    url: 'https://designsystem.digital.gov/patterns/create-a-user-profile/social-security-number/',
    requiredFields: [
      {
        name: 'social-security-no',
        label: 'Social Security Number',
        type: 'usa-text-input',
      },
    ],
  },
  'race-ethnicity': {
    description: 'Race and Ethnicity Pattern',
    url: 'https://designsystem.digital.gov/patterns/create-a-user-profile/race-and-ethnicity/',
    requiredFields: [
      {
        name: 'race',
        label: 'Race',
        type: 'usa-checkbox',
      },
      {
        name: 'ethnicity',
        label: 'Ethnicity',
        type: 'usa-text-input',
        optional: true,
      },
      {
        name: 'preferNotToShare',
        label: 'Prefer not to share',
        type: 'usa-checkbox',
        optional: true,
      },
    ],
  },
};

/**
 * Get all pattern TypeScript files
 */
function getPatternFiles() {
  const pattern = path.join(PATTERNS_DIR, '**', 'usa-*-pattern.ts');
  return glob.sync(pattern, {
    ignore: ['**/*.test.ts', '**/*.stories.ts', '**/*.cy.ts'],
  });
}

/**
 * Extract pattern name from file path
 */
function getPatternName(filePath) {
  const match = filePath.match(/usa-(.+?)-pattern\.ts$/);
  if (match) {
    return match[1];
  }
  return null;
}

/**
 * Check if field exists in pattern file
 */
function hasField(content, fieldName) {
  // Check for name attribute in template
  const namePattern = new RegExp(`name=["']${fieldName}["']`);
  return namePattern.test(content);
}

/**
 * Validate a single pattern file
 */
function validatePatternFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);
  const patternName = getPatternName(filePath);
  const errors = [];
  const warnings = [];

  // Skip if no field requirements defined for this pattern
  if (!patternName || !PATTERN_FIELD_REQUIREMENTS[patternName]) {
    return { errors, warnings, skipped: true };
  }

  const requirements = PATTERN_FIELD_REQUIREMENTS[patternName];

  // Check each required field
  for (const field of requirements.requiredFields) {
    if (!hasField(content, field.name)) {
      if (field.optional) {
        warnings.push({
          file: fileName,
          pattern: patternName,
          field: field.name,
          message: `Optional field '${field.name}' (${field.label}) not found`,
          description: `Per USWDS, this field should be available (even if hidden by default)`,
          url: requirements.url,
        });
      } else {
        errors.push({
          file: fileName,
          pattern: patternName,
          field: field.name,
          message: `Required field '${field.name}' (${field.label}) not found`,
          description: `Per USWDS ${requirements.description}, this field is required`,
          url: requirements.url,
        });
      }
    }
  }

  return { errors, warnings, skipped: false };
}

/**
 * Main validation function
 */
function validatePatternFieldCompleteness() {
  console.log('📋 Validating USWDS Pattern Field Completeness...\n');

  const patternFiles = getPatternFiles();
  console.log(`Found ${patternFiles.length} pattern files to validate\n`);

  let totalErrors = 0;
  let totalWarnings = 0;
  let skippedFiles = 0;
  let checkedFiles = 0;

  const results = patternFiles.map((filePath) => {
    const result = validatePatternFile(filePath);
    if (result.skipped) {
      skippedFiles++;
    } else {
      checkedFiles++;
    }
    totalErrors += result.errors.length;
    totalWarnings += result.warnings.length;
    return { filePath, ...result };
  });

  // Print errors
  const filesWithErrors = results.filter((r) => r.errors.length > 0);
  if (filesWithErrors.length > 0) {
    console.log('❌ ERRORS:\n');
    filesWithErrors.forEach(({ filePath, errors }) => {
      console.log(`  ${path.basename(filePath)}:`);
      errors.forEach((error) => {
        console.log(`    ❌ ${error.field}: ${error.message}`);
        console.log(`       ${error.description}`);
        console.log(`       Reference: ${error.url}`);
      });
      console.log('');
    });
  }

  // Print warnings
  const filesWithWarnings = results.filter((r) => r.warnings.length > 0);
  if (filesWithWarnings.length > 0) {
    console.log('⚠️  WARNINGS:\n');
    filesWithWarnings.forEach(({ filePath, warnings }) => {
      console.log(`  ${path.basename(filePath)}:`);
      warnings.forEach((warning) => {
        console.log(`    ⚠️  ${warning.field}: ${warning.message}`);
        console.log(`       ${warning.description}`);
        console.log(`       Reference: ${warning.url}`);
      });
      console.log('');
    });
  }

  // Print summary
  console.log('═══════════════════════════════════════════════');
  console.log('SUMMARY:');
  console.log(`  Total files found: ${patternFiles.length}`);
  console.log(`  Files checked: ${checkedFiles}`);
  console.log(`  Skipped (no requirements): ${skippedFiles}`);
  console.log(`  Errors: ${totalErrors}`);
  console.log(`  Warnings: ${totalWarnings}`);
  console.log('═══════════════════════════════════════════════\n');

  if (totalErrors > 0) {
    console.log('❌ Pattern field completeness validation FAILED');
    console.log('\nTo fix:');
    console.log('  1. Add missing fields to pattern templates');
    console.log('  2. Reference official USWDS pattern documentation');
    console.log('  3. Ensure all fields match USWDS specifications\n');
    process.exit(1);
  }

  if (totalWarnings > 0) {
    console.log('⚠️  Pattern field completeness validation completed with warnings');
    console.log('   (Warnings do not fail the build)');
    console.log('   Consider adding optional fields for complete USWDS parity\n');
  } else {
    console.log('✅ All patterns have complete field sets matching USWDS!\n');
  }

  process.exit(0);
}

// Run validation
if (require.main === module) {
  validatePatternFieldCompleteness();
}

module.exports = { validatePatternFieldCompleteness };
