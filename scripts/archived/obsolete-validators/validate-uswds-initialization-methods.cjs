#!/usr/bin/env node

/**
 * USWDS Initialization Method Validator
 *
 * Automatically detects the correct initialization method for each USWDS component
 * by examining the official USWDS source code and validating our implementation.
 *
 * This prevents issues like the combo-box toggle button problem where components
 * were using the wrong initialization method (.on() vs .init()).
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Starting USWDS Initialization Method Validation...');

// Known USWDS components and their correct initialization patterns
const USWDS_INIT_PATTERNS = {
  // Components that require .init() method (create DOM transformations)
  'init': [
    'modal',
    'date-picker',
    'combo-box',
    'file-input', // Creates drag-drop UI
    'time-picker' // Transforms to combo-box
  ],

  // Components that use .on() method (enhance existing structure)
  'on': [
    'accordion',
    'header',
    'footer',
    'search',
    'character-count',
    'tooltip',
    'table',
    'skip-link'
  ]
};

/**
 * Auto-detect initialization method by examining USWDS source
 */
async function detectUSWDSInitMethod(componentName) {
  const uswdsPackagePath = path.join(
    __dirname,
    '../node_modules/@uswds/uswds/packages',
    `usa-${componentName}`,
    'src/index.js'
  );

  if (!fs.existsSync(uswdsPackagePath)) {
    return { method: 'unknown', reason: 'USWDS package not found' };
  }

  try {
    const content = fs.readFileSync(uswdsPackagePath, 'utf8');

    // Look for behavior export pattern and initialization method
    const hasInitMethod = content.includes('init(') && (content.includes('init,') || content.includes('init }'));
    const hasOnMethod = content.includes('.on(') || content.includes('on:') || content.includes('on,');

    // Check for DOM transformation patterns (indicates init() needed)
    const hasTransformation = content.includes('enhanceComboBox') ||
                             content.includes('enhanceComponent') ||
                             content.includes('createDatePicker') ||
                             content.includes('createElement') ||
                             content.includes('insertBefore') ||
                             content.includes('replaceWith') ||
                             content.includes('appendChild') ||
                             content.includes('innerHTML') ||
                             content.includes('cloneNode');

    // Enhanced pattern detection for known components
    const isComboBox = componentName === 'combo-box' && content.includes('enhanceComboBox');
    const isDatePicker = componentName === 'date-picker' && content.includes('calendar');
    const isModal = componentName === 'modal' && content.includes('focusTrap');
    const isFileInput = componentName === 'file-input' && content.includes('drag');

    // console.log(`    Debug: hasInitMethod=${hasInitMethod}, hasOnMethod=${hasOnMethod}, hasTransformation=${hasTransformation}`);
    // console.log(`    Debug: isComboBox=${isComboBox}, isDatePicker=${isDatePicker}, isModal=${isModal}`);

    // Special cases for known components
    if (isComboBox || isDatePicker || isModal || isFileInput) {
      return {
        method: 'init',
        reason: `Known ${componentName} component with DOM transformation`,
        confidence: 'high'
      };
    }

    if (hasInitMethod && hasTransformation) {
      return {
        method: 'init',
        reason: 'Has init() method and DOM transformation patterns',
        confidence: 'high'
      };
    } else if (hasOnMethod && !hasTransformation) {
      return {
        method: 'on',
        reason: 'Has on() method without DOM transformation',
        confidence: 'high'
      };
    } else if (hasInitMethod) {
      return {
        method: 'init',
        reason: 'Has init() method',
        confidence: 'medium'
      };
    } else if (hasOnMethod) {
      return {
        method: 'on',
        reason: 'Has on() method',
        confidence: 'medium'
      };
    } else {
      return {
        method: 'on',
        reason: 'Default to on() method (no clear pattern detected)',
        confidence: 'low'
      };
    }
  } catch (error) {
    return { method: 'unknown', reason: `Error reading file: ${error.message}` };
  }
}

/**
 * Validate our loader configuration against USWDS source
 */
async function validateLoaderConfiguration() {
  const loaderPath = path.join(__dirname, '../src/utils/uswds-loader.ts');
  const loaderContent = fs.readFileSync(loaderPath, 'utf8');

  // Extract current init() components from our loader
  // Look for the specific condition pattern for init() components
  const initConditionMatch = loaderContent.match(/if \(moduleName === '[^']+' \|\| moduleName === '[^']+' \|\| moduleName === '[^']+'\)/);
  const currentInitComponents = [];

  if (initConditionMatch) {
    const condition = initConditionMatch[0];
    // Extract all quoted strings from the condition
    const components = condition.match(/'([^']+)'/g);
    if (components) {
      currentInitComponents.push(...components.map(c => c.replace(/'/g, '')));
    }
  } else {
    // Fallback: look for simpler patterns
    const simplePattern = loaderContent.match(/moduleName === '([^']+)'/g);
    if (simplePattern) {
      currentInitComponents.push(...simplePattern.map(match => match.match(/'([^']+)'/)[1]));
    }
  }

  console.log('📋 Current loader configuration:');
  console.log(`   init() components: ${currentInitComponents.join(', ')}`);

  let issues = 0;
  const recommendations = [];

  // Check each component we know about
  const allComponents = [
    ...USWDS_INIT_PATTERNS.init,
    ...USWDS_INIT_PATTERNS.on
  ];

  console.log('\n🔍 Validating each component...');

  for (const component of allComponents) {
    const detection = await detectUSWDSInitMethod(component);
    const isCurrentlyInit = currentInitComponents.includes(component);
    const shouldBeInit = detection.method === 'init';

    console.log(`\n📦 ${component}:`);
    console.log(`   Detected method: ${detection.method} (${detection.confidence} confidence)`);
    console.log(`   Reason: ${detection.reason}`);
    console.log(`   Current config: ${isCurrentlyInit ? 'init()' : 'on()'}`);

    if (shouldBeInit !== isCurrentlyInit) {
      issues++;
      const recommendation = shouldBeInit
        ? `❌ ISSUE: ${component} should use init() but currently uses on()`
        : `❌ ISSUE: ${component} should use on() but currently uses init()`;

      console.log(`   ${recommendation}`);
      recommendations.push({
        component,
        currentMethod: isCurrentlyInit ? 'init' : 'on',
        recommendedMethod: detection.method,
        reason: detection.reason,
        confidence: detection.confidence
      });
    } else {
      console.log(`   ✅ Correct configuration`);
    }
  }

  return { issues, recommendations };
}

/**
 * Generate fix recommendations
 */
function generateFixRecommendations(recommendations) {
  if (recommendations.length === 0) {
    console.log('\n✅ All components are correctly configured!');
    return;
  }

  console.log('\n📋 Fix Recommendations:');
  console.log('='.repeat(50));

  const initComponents = recommendations
    .filter(r => r.recommendedMethod === 'init')
    .map(r => r.component);

  const onComponents = recommendations
    .filter(r => r.recommendedMethod === 'on')
    .map(r => r.component);

  if (initComponents.length > 0) {
    console.log('\n🔧 Components that should use init():');
    initComponents.forEach(component => {
      console.log(`   - ${component}`);
    });
  }

  if (onComponents.length > 0) {
    console.log('\n🔧 Components that should use on():');
    onComponents.forEach(component => {
      console.log(`   - ${component}`);
    });
  }

  console.log('\n📝 To fix, update src/utils/uswds-loader.ts:');
  const allInitComponents = [
    ...USWDS_INIT_PATTERNS.init,
    ...initComponents
  ].filter((v, i, a) => a.indexOf(v) === i); // dedupe

  console.log(`\nUpdate the condition to:`);
  console.log(`if (moduleName === '${allInitComponents.join("' || moduleName === '")}') {`);
}

/**
 * Main validation function
 */
async function main() {
  try {
    const { issues, recommendations } = await validateLoaderConfiguration();

    console.log('\n' + '='.repeat(80));
    console.log('📊 USWDS Initialization Method Validation Results');
    console.log('='.repeat(80));

    if (issues === 0) {
      console.log('✅ VALIDATION PASSED - All components use correct initialization methods');
    } else {
      console.log(`❌ VALIDATION FAILED - Found ${issues} configuration issues`);
      generateFixRecommendations(recommendations);
    }

    console.log(`\n📈 Summary:`);
    console.log(`   Components checked: ${USWDS_INIT_PATTERNS.init.length + USWDS_INIT_PATTERNS.on.length}`);
    console.log(`   Issues found: ${issues}`);
    console.log(`   Confidence: Based on USWDS source code analysis`);

    // Exit with error code if issues found
    process.exit(issues > 0 ? 1 : 0);

  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  detectUSWDSInitMethod,
  validateLoaderConfiguration,
  USWDS_INIT_PATTERNS
};