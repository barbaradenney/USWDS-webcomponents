#!/usr/bin/env node

/**
 * Initialize Pattern Changelogs
 *
 * Creates CHANGELOG.md files for all patterns following Keep a Changelog format.
 * Generates initial release entries based on pattern implementation.
 *
 * Exit codes:
 * 0 - Changelogs initialized successfully
 * 1 - Initialization failed
 */

const fs = require('fs');
const path = require('path');

const PATTERNS_DIR = path.join(__dirname, '../../packages/uswds-wc-patterns/src/patterns');

const PATTERNS = [
  {
    name: 'address',
    title: 'USA Address Pattern',
    description: 'Data Collection Pattern for collecting physical or mailing addresses',
    uswdsLink: 'https://designsystem.digital.gov/patterns/create-a-user-profile/address/',
    features: [
      'US Address Support with street, city, state, and ZIP code',
      'International Address Support with country field',
      'Optional Street Line 2 for apartment/suite numbers',
      'Light DOM Architecture for USWDS style compatibility',
      'Standard Data Pattern APIs: `getAddressData()`, `setAddressData()`, `clearAddress()`, `validateAddress()`',
      'Event Emission: `address-change` and `pattern-ready` events',
      'USWDS Component Composition: Uses `usa-text-input` and `usa-select` components',
    ],
    properties: [
      '`label` - Label for the address section',
      '`required` - Whether all fields are required',
      '`showStreet2` - Whether to show street line 2',
      '`international` - Whether to support international addresses',
    ],
  },
  {
    name: 'phone-number',
    title: 'USA Phone Number Pattern',
    description: 'Data Collection Pattern for collecting phone numbers',
    uswdsLink: 'https://designsystem.digital.gov/patterns/create-a-user-profile/phone-number/',
    features: [
      'Phone Number Input with formatting',
      'Extension Support for business numbers',
      'Phone Type Selection (mobile, home, work)',
      'Light DOM Architecture for USWDS style compatibility',
      'Standard Data Pattern APIs: `getPhoneData()`, `setPhoneData()`, `clearPhoneNumber()`, `validatePhoneNumber()`',
      'Event Emission: `phone-change` and `pattern-ready` events',
      'USWDS Component Composition: Uses `usa-text-input` and `usa-select` components',
    ],
    properties: [
      '`label` - Label for the phone number section',
      '`required` - Whether the phone number is required',
      '`showExtension` - Whether to show extension field',
      '`showType` - Whether to show phone type selector',
    ],
  },
  {
    name: 'name',
    title: 'USA Name Pattern',
    description: 'Data Collection Pattern for collecting names',
    uswdsLink: 'https://designsystem.digital.gov/patterns/create-a-user-profile/name/',
    features: [
      'Multiple Name Formats (full, first-middle-last, etc.)',
      'Preferred Name Support',
      'Honorific and Suffix Support',
      'Light DOM Architecture for USWDS style compatibility',
      'Standard Data Pattern APIs: `getNameData()`, `setNameData()`, `clearName()`, `validateName()`',
      'Event Emission: `name-change` and `pattern-ready` events',
      'USWDS Component Composition: Uses `usa-text-input` components',
    ],
    properties: [
      '`label` - Label for the name section',
      '`required` - Whether the name is required',
      '`format` - Name format (full, first-middle-last, etc.)',
      '`showMiddle` - Whether to show middle name',
      '`showSuffix` - Whether to show suffix',
      '`showPreferred` - Whether to show preferred name',
    ],
  },
  {
    name: 'contact-preferences',
    title: 'USA Contact Preferences Pattern',
    description: 'Data Collection Pattern for collecting communication channel preferences',
    uswdsLink: 'https://designsystem.digital.gov/patterns/create-a-user-profile/contact-preferences/',
    features: [
      'Multiple Contact Method Selection (phone, text, email, mail)',
      'Additional Information Field for special requests',
      'Light DOM Architecture for USWDS style compatibility',
      'Standard Data Pattern APIs: `getPreferencesData()`, `setPreferencesData()`, `clearPreferences()`, `validatePreferences()`',
      'Event Emission: `preferences-change` and `pattern-ready` events',
      'USWDS Component Composition: Uses `usa-checkbox` and `usa-textarea` components',
    ],
    properties: [
      '`label` - Label for the contact preferences section',
      '`required` - Whether at least one method selection is required',
      '`hint` - Hint text explaining contact expectations',
      '`showAdditionalInfo` - Whether to show additional information textarea',
    ],
  },
  {
    name: 'language-selection',
    title: 'USA Language Selector Pattern',
    description: 'Workflow Pattern for language preference selection',
    uswdsLink: 'https://designsystem.digital.gov/components/language-selector/',
    features: [
      'Multiple Display Variants (two-languages, dropdown, unstyled)',
      'Language Persistence with localStorage',
      'Document Language Update (updates html lang attribute)',
      'Light DOM Architecture for USWDS style compatibility',
      'Specialized APIs: `setLanguages()`, `getCurrentLanguageCode()`, `changeLanguage()`, `clearPersistedPreference()`',
      'Event Emission: `language-change` and `pattern-ready` events',
      'USWDS Component Composition: Uses `usa-language-selector` component',
    ],
    properties: [
      '`variant` - Display variant (two-languages, dropdown, unstyled)',
      '`small` - Whether to use small size',
      '`buttonText` - Text for dropdown button',
      '`persistPreference` - Whether to persist language preference',
      '`storageKey` - localStorage key for persistence',
      '`updateDocumentLang` - Whether to update html lang attribute',
    ],
  },
  {
    name: 'form-summary',
    title: 'USA Form Summary Pattern',
    description: 'Workflow Pattern for reviewing and retaining submitted information',
    uswdsLink: 'https://designsystem.digital.gov/patterns/complete-a-complex-form/keep-a-record/',
    features: [
      'Organized Section Display with key-value pairs',
      'Print Functionality for record keeping',
      'Download Support for saving information',
      'Edit Capabilities for reviewed information',
      'Confirmation Messaging with USWDS alert',
      'Light DOM Architecture for USWDS style compatibility',
      'Specialized APIs: `getSummaryData()`, `setSummaryData()`, `addSection()`, `clearSummary()`, `print()`, `download()`',
      'Event Emission: `edit-field`, `print-summary`, `download-summary`, `pattern-ready` events',
      'USWDS Component Composition: Uses `usa-button` and `usa-alert` components',
    ],
    properties: [
      '`title` - Title for the summary',
      '`showConfirmation` - Whether to show confirmation message',
      '`confirmationTitle` - Confirmation message title',
      '`confirmationType` - Confirmation message type (success, info, warning, error)',
      '`showPrint` - Whether to show print button',
      '`showDownload` - Whether to show download button',
      '`showEdit` - Whether to show edit buttons',
    ],
  },
  {
    name: 'multi-step-form',
    title: 'USA Multi-Step Form Pattern',
    description: 'Workflow Pattern for navigating multi-step forms with progress tracking',
    uswdsLink: 'https://designsystem.digital.gov/patterns/complete-a-complex-form/progress-easily/',
    features: [
      'Step Navigation with next/back/skip buttons',
      'Progress Tracking across form steps',
      'State Persistence with localStorage',
      'Step Validation before progression',
      'Optional Step Support with skip functionality',
      'Light DOM Architecture for USWDS style compatibility',
      'Specialized APIs: `setSteps()`, `goToStep()`, `getCurrentStepIndex()`, `getCurrentStepData()`, `clearPersistedState()`, `reset()`',
      'Event Emission: `step-change`, `form-complete`, `pattern-ready` events',
      'USWDS Component Composition: Uses `usa-button` components',
    ],
    properties: [
      '`steps` - Array of form steps',
      '`showNavigation` - Whether to show navigation buttons',
      '`backButtonLabel` - Label for back button',
      '`nextButtonLabel` - Label for next button',
      '`skipButtonLabel` - Label for skip button',
      '`submitButtonLabel` - Label for submit button',
      '`persistState` - Whether to persist form state',
      '`storageKey` - localStorage key for state persistence',
    ],
  },
];

class ChangelogInitializer {
  constructor() {
    this.initialized = 0;
    this.skipped = 0;
  }

  /**
   * Generate changelog content for a pattern
   */
  generateChangelog(pattern) {
    const today = new Date().toISOString().split('T')[0];

    let content = `# Changelog - ${pattern.title}\n\n`;
    content += `All notable changes to the ${pattern.title} will be documented in this file.\n\n`;
    content += `The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),\n`;
    content += `and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).\n\n`;

    content += `## [2.0.0] - ${today}\n\n`;
    content += `### ✨ Initial Release\n\n`;

    // Description
    content += `#### Overview\n`;
    content += `**${pattern.description}**\n\n`;

    // Features
    content += `#### Features\n`;
    pattern.features.forEach((feature) => {
      content += `- **${feature}**\n`;
    });
    content += `\n`;

    // Properties
    content += `#### Properties\n`;
    pattern.properties.forEach((prop) => {
      content += `- ${prop}\n`;
    });
    content += `\n`;

    // Contract Compliance
    content += `#### Contract Compliance\n`;
    content += `- ✅ Custom element registration\n`;
    content += `- ✅ Light DOM architecture\n`;

    if (['address', 'phone-number', 'name', 'contact-preferences'].includes(pattern.name)) {
      content += `- ✅ Standard data pattern APIs\n`;
      content += `- ✅ Required properties (label, required)\n`;
    } else {
      content += `- ✅ Specialized workflow APIs\n`;
    }

    content += `- ✅ Event emission\n`;
    content += `- ✅ USWDS component composition\n`;
    content += `- ✅ Data immutability\n\n`;

    // USWDS Alignment
    content += `#### USWDS Alignment\n`;
    content += `- Implements [USWDS Pattern](${pattern.uswdsLink})\n`;
    content += `- Uses official USWDS components and styles\n`;
    content += `- Follows USWDS accessibility standards\n`;

    return content;
  }

  /**
   * Initialize changelogs for all patterns
   */
  initialize() {
    console.log('📋 Initializing pattern changelogs...\n');

    PATTERNS.forEach((pattern) => {
      const changelogPath = path.join(PATTERNS_DIR, pattern.name, 'CHANGELOG.md');

      if (fs.existsSync(changelogPath)) {
        console.log(`   ⏭️  ${pattern.name}: Already exists`);
        this.skipped++;
        return;
      }

      const content = this.generateChangelog(pattern);
      fs.writeFileSync(changelogPath, content);

      console.log(`   ✅ ${pattern.name}: Created`);
      this.initialized++;
    });

    console.log('');
    console.log('='.repeat(80));
    console.log('');
    console.log(`✅ Initialized ${this.initialized} changelogs`);
    console.log(`⏭️  Skipped ${this.skipped} existing changelogs`);
    console.log('');
  }
}

function main() {
  const initializer = new ChangelogInitializer();
  initializer.initialize();
  process.exit(0);
}

// Allow running directly or importing for testing
if (require.main === module) {
  main();
}

module.exports = { ChangelogInitializer };
