#!/usr/bin/env node

/**
 * Testing Documentation Manager
 * Analyzes test files and generates detailed TESTING.mdx documentation
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COMPONENTS_DIR = path.join(__dirname, '..', 'src', 'components');

console.log('📋 Testing Documentation Manager');
console.log('=================================');
console.log('');

/**
 * Parse test file to extract test descriptions and structure
 */
function parseTestFile(testFilePath) {
  if (!fs.existsSync(testFilePath)) {
    return { tests: [], totalTests: 0, testSuites: [] };
  }

  const content = fs.readFileSync(testFilePath, 'utf8');
  const tests = [];
  const testSuites = [];
  let currentSuite = null;

  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Detect test suites (describe blocks)
    const suiteMatch = line.match(/describe\(['"`]([^'"`]+)['"`]/);
    if (suiteMatch) {
      currentSuite = {
        name: suiteMatch[1],
        tests: [],
        line: i + 1,
      };
      testSuites.push(currentSuite);
    }

    // Detect individual tests (it blocks)
    const testMatch = line.match(/it\(['"`]([^'"`]+)['"`]/);
    if (testMatch) {
      const testName = testMatch[1];
      const test = {
        name: testName,
        suite: currentSuite?.name || 'General Tests',
        line: i + 1,
        description: generateTestDescription(testName),
      };

      tests.push(test);
      if (currentSuite) {
        currentSuite.tests.push(test);
      }
    }
  }

  return {
    tests,
    totalTests: tests.length,
    testSuites,
  };
}

/**
 * Generate human-readable description from test name
 */
function generateTestDescription(testName) {
  // Common test patterns and their descriptions
  const patterns = [
    // Basic functionality
    {
      pattern: /should render with default properties/,
      desc: 'Validates component renders with correct default property values',
    },
    {
      pattern: /should render (.+) by default/,
      desc: (match) => `Ensures component renders ${match[1]} element by default`,
    },
    {
      pattern: /should render (.+) when (.+)/,
      desc: (match) => `Verifies ${match[1]} renders correctly when ${match[2]}`,
    },

    // Property testing
    {
      pattern: /should update (.+) property/,
      desc: (match) => `Tests ${match[1]} property updates and reflects changes`,
    },
    {
      pattern: /should handle (.+) property changes/,
      desc: (match) => `Validates ${match[1]} property changes are handled correctly`,
    },
    {
      pattern: /should set (.+) attribute/,
      desc: (match) => `Ensures ${match[1]} attribute is set properly on element`,
    },

    // Event testing
    {
      pattern: /should emit (.+) event/,
      desc: (match) => `Verifies ${match[1]} event is emitted correctly`,
    },
    {
      pattern: /should handle (.+) event/,
      desc: (match) => `Tests ${match[1]} event handling and response`,
    },
    {
      pattern: /should dispatch (.+) when (.+)/,
      desc: (match) => `Ensures ${match[1]} event is dispatched when ${match[2]}`,
    },

    // State testing
    {
      pattern: /should be (.+) when (.+)/,
      desc: (match) => `Validates component is ${match[1]} when ${match[2]}`,
    },
    {
      pattern: /should have (.+) class when (.+)/,
      desc: (match) => `Checks ${match[1]} CSS class is applied when ${match[2]}`,
    },
    {
      pattern: /should not (.+) when (.+)/,
      desc: (match) => `Ensures component does not ${match[1]} when ${match[2]}`,
    },

    // Accessibility
    {
      pattern: /should have correct aria attributes/,
      desc: 'Validates all ARIA attributes are set correctly for accessibility',
    },
    {
      pattern: /should be accessible/,
      desc: 'Ensures component meets accessibility standards and guidelines',
    },
    {
      pattern: /should handle keyboard/,
      desc: 'Tests keyboard navigation and interaction functionality',
    },
    { pattern: /should focus/, desc: 'Validates focus management and focus state handling' },

    // Form integration
    {
      pattern: /should validate (.+)/,
      desc: (match) => `Tests ${match[1]} validation logic and error handling`,
    },
    {
      pattern: /should submit (.+)/,
      desc: (match) => `Verifies ${match[1]} submission process and data handling`,
    },
    { pattern: /should reset (.+)/, desc: (match) => `Tests ${match[1]} reset functionality` },

    // Edge cases
    {
      pattern: /should handle empty (.+)/,
      desc: (match) => `Tests behavior with empty ${match[1]} values`,
    },
    {
      pattern: /should handle invalid (.+)/,
      desc: (match) => `Validates handling of invalid ${match[1]} input`,
    },
    {
      pattern: /should throw error when (.+)/,
      desc: (match) => `Ensures proper error is thrown when ${match[1]}`,
    },
  ];

  for (const { pattern, desc } of patterns) {
    const match = testName.match(pattern);
    if (match) {
      return typeof desc === 'function' ? desc(match) : desc;
    }
  }

  // Fallback: capitalize first letter and add period
  return (
    testName.charAt(0).toUpperCase() +
    testName.slice(1).replace(/^should /, 'Verifies that component ') +
    '.'
  );
}

/**
 * Update TESTING.mdx file with test analysis
 */
function updateTestingDoc(componentName, testAnalysis) {
  const testingPath = path.join(COMPONENTS_DIR, componentName, 'TESTING.mdx');

  if (!fs.existsSync(testingPath)) {
    console.log(`⚠️  No TESTING.mdx found for ${componentName}, skipping test analysis update`);
    return false;
  }

  let content = fs.readFileSync(testingPath, 'utf8');
  const today = new Date().toISOString().split('T')[0];

  // Update test count
  content = content.replace(
    /✅ \*\*\d+ unit tests\*\* implemented/,
    `✅ **${testAnalysis.totalTests} unit tests** implemented`
  );

  // Update last updated date
  content = content.replace(
    /\*\*Last Updated\*\*: \d{4}-\d{2}-\d{2}/,
    `**Last Updated**: ${today}`
  );

  // Generate detailed test descriptions section
  let testDescriptionsSection = `

## 📋 Detailed Unit Test Coverage

The following ${testAnalysis.totalTests} unit tests ensure comprehensive validation of the component:

`;

  testAnalysis.testSuites.forEach((suite) => {
    if (suite.tests.length > 0) {
      testDescriptionsSection += `### ${suite.name}\n`;
      suite.tests.forEach((test) => {
        testDescriptionsSection += `- **${test.name}**: ${test.description}\n`;
      });
      testDescriptionsSection += '\n';
    }
  });

  // If no suites, list all tests under General Tests
  if (testAnalysis.testSuites.length === 0 && testAnalysis.tests.length > 0) {
    testDescriptionsSection += `### General Tests\n`;
    testAnalysis.tests.forEach((test) => {
      testDescriptionsSection += `- **${test.name}**: ${test.description}\n`;
    });
    testDescriptionsSection += '\n';
  }

  // Insert or replace the detailed test coverage section
  const sectionStart = content.indexOf('## 📋 Detailed Unit Test Coverage');
  const nextSectionStart = content.indexOf('\n## ', sectionStart + 1);

  if (sectionStart !== -1) {
    // Replace existing section
    const endPos = nextSectionStart !== -1 ? nextSectionStart : content.length;
    content = content.slice(0, sectionStart) + testDescriptionsSection + content.slice(endPos);
  } else {
    // Insert new section before testing gaps
    const gapsIndex = content.indexOf('## 🚨 Testing Gaps & Recommendations');
    if (gapsIndex !== -1) {
      content = content.slice(0, gapsIndex) + testDescriptionsSection + content.slice(gapsIndex);
    } else {
      // Append at end
      content += testDescriptionsSection;
    }
  }

  fs.writeFileSync(testingPath, content, 'utf8');
  console.log(
    `✅ Updated test documentation for ${componentName} (${testAnalysis.totalTests} tests)`
  );
  return true;
}

/**
 * Get components that have test file changes
 */
function getChangedTestComponents(fromCommit = 'HEAD~1', toCommit = 'HEAD') {
  try {
    const diffOutput = execSync(`git diff --name-status ${fromCommit} ${toCommit}`, {
      encoding: 'utf8',
    });

    const changedFiles = diffOutput.split('\n').filter(Boolean);
    const componentsWithTestChanges = new Set();

    changedFiles.forEach((line) => {
      const [, file] = line.split('\t');
      const match = file?.match(/^src\/components\/([^/]+)\/.*\.test\.ts$/);

      if (match) {
        componentsWithTestChanges.add(match[1]);
      }
    });

    return Array.from(componentsWithTestChanges);
  } catch (error) {
    console.warn('⚠️  Could not get changed test components from git:', error.message);
    return [];
  }
}

/**
 * Process commit and update test documentation
 */
function processCommit(commitHash, commitMessage) {
  console.log(`🔍 Processing commit: ${commitHash?.substring(0, 8)}`);
  console.log(`   Message: ${commitMessage}`);

  const changedComponents = getChangedTestComponents(`${commitHash}~1`, commitHash);

  if (changedComponents.length === 0) {
    console.log('   No test file changes detected');
    return;
  }

  console.log(`   Components with test changes: ${changedComponents.join(', ')}`);

  changedComponents.forEach((componentName) => {
    const testFilePath = path.join(COMPONENTS_DIR, componentName, `usa-${componentName}.test.ts`);
    const testAnalysis = parseTestFile(testFilePath);

    console.log(`   Analyzing ${testAnalysis.totalTests} tests for ${componentName}`);
    updateTestingDoc(componentName, testAnalysis);
  });
}

/**
 * Initialize or update all testing documentation
 */
function updateAllTestingDocs() {
  console.log('🔍 Updating all component testing documentation...\n');

  const components = fs
    .readdirSync(COMPONENTS_DIR, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  let updated = 0;

  components.forEach((componentName) => {
    const testFilePath = path.join(COMPONENTS_DIR, componentName, `usa-${componentName}.test.ts`);
    const testingPath = path.join(COMPONENTS_DIR, componentName, 'TESTING.mdx');

    if (fs.existsSync(testFilePath) && fs.existsSync(testingPath)) {
      const testAnalysis = parseTestFile(testFilePath);
      if (updateTestingDoc(componentName, testAnalysis)) {
        updated++;
      }
    }
  });

  console.log(`\n✅ Updated testing documentation for ${updated} components`);
}

const command = process.argv[2];
const commitHash = process.argv[3];
const commitMessage = process.argv[4];

if (!command) {
  console.error(
    'Usage: node manage-testing-docs.js <update|process-commit|update-all> [commitHash] [commitMessage]'
  );
  process.exit(1);
}

if (command === 'update' || command === 'process-commit') {
  processCommit(commitHash, commitMessage);
} else if (command === 'update-all') {
  updateAllTestingDocs();
} else if (command === 'init') {
  console.log('✅ Testing documentation manager initialized');
} else {
  console.error(`Unknown command: ${command}`);
  process.exit(1);
}
