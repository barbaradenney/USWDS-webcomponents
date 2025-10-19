#!/usr/bin/env node

/**
 * Phase 5: Enhanced Developer Experience Tools
 * Command-line interface for development tools and debugging features
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';

const execAsync = promisify(exec);

const tools = {
  storybook: {
    name: 'Storybook with Enhanced Dev Tools',
    description:
      'Launch Storybook with performance profiling, visual debugging, and accessibility tools',
    command: 'npm run storybook',
    features: [
      '📊 Performance profiler for render times',
      '🎨 Visual debugging (measure, outline, backgrounds)',
      '♿ Enhanced accessibility auditing',
      '📱 Responsive testing viewports',
      '🔥 Optimized hot reload',
    ],
  },

  'storybook-test': {
    name: 'Storybook Test Runner',
    description: 'Run automated tests on all stories with accessibility validation',
    command: 'npm run test:storybook',
    features: [
      '✅ Automated story testing',
      '♿ Accessibility compliance checks',
      '📊 Coverage reporting',
      '🔍 Visual regression detection',
    ],
  },

  'performance-analysis': {
    name: 'Performance Analysis',
    description: 'Comprehensive performance testing and bundle analysis',
    command: 'npm run test:performance',
    features: [
      '📦 Bundle size analysis',
      '⚡ Runtime performance metrics',
      '🎯 Performance regression detection',
      '📈 Render time profiling',
    ],
  },

  'accessibility-audit': {
    name: 'Accessibility Audit',
    description: 'Run comprehensive accessibility tests across all components',
    command: 'npm run test:comprehensive -- --specific accessibility',
    features: [
      '♿ WCAG 2.1 AA compliance checking',
      '⌨️  Keyboard navigation testing',
      '🔍 Screen reader compatibility',
      '🎨 Color contrast validation',
    ],
  },

  quality: {
    name: 'Quality Assurance Suite',
    description: 'Run all quality checks (tests, linting, type checking)',
    command: 'npm run quality:check',
    features: [
      '🧪 Unit and integration tests',
      '📝 TypeScript type checking',
      '🎨 Code formatting and linting',
      '✅ Pre-commit validation',
    ],
  },
};

function printHeader() {
  console.log(chalk.blue.bold('\n🛠️  USWDS Web Components - Phase 5 Developer Tools\n'));
  console.log(
    chalk.gray('Enhanced development experience with integrated debugging and performance tools\n')
  );
}

function printToolsList() {
  console.log(chalk.yellow.bold('Available Tools:\n'));

  Object.entries(tools).forEach(([_key, tool], index) => {
    console.log(chalk.cyan.bold(`${index + 1}. ${tool.name}`));
    console.log(chalk.gray(`   ${tool.description}`));
    console.log(chalk.green(`   Command: ${tool.command}`));
    console.log(chalk.white('   Features:'));
    tool.features.forEach((feature) => {
      console.log(chalk.gray(`   ${feature}`));
    });
    console.log('');
  });
}

function printUsageHelp() {
  console.log(chalk.yellow.bold('Usage Examples:\n'));

  console.log(chalk.cyan('# Launch Storybook with all development tools'));
  console.log(chalk.gray('node scripts/dev-tools.js storybook\n'));

  console.log(chalk.cyan('# Run performance analysis'));
  console.log(chalk.gray('node scripts/dev-tools.js performance-analysis\n'));

  console.log(chalk.cyan('# Quick accessibility audit'));
  console.log(chalk.gray('node scripts/dev-tools.js accessibility-audit\n'));

  console.log(chalk.cyan('# Run complete quality assurance'));
  console.log(chalk.gray('node scripts/dev-tools.js quality\n'));

  console.log(chalk.yellow.bold('Storybook Development Features:\n'));
  console.log(chalk.white('Once Storybook is running, access these features:'));
  console.log(chalk.green('• Performance Tab: Measure component render times'));
  console.log(chalk.green('• Accessibility Tab: Real-time a11y validation'));
  console.log(chalk.green('• Measure Tool: Press "M" or use toolbar to inspect layouts'));
  console.log(chalk.green('• Outline Tool: Toggle element outlines via toolbar'));
  console.log(chalk.green('• Viewport Tool: Test responsive behavior'));
  console.log(chalk.green('• Backgrounds Tool: Test component contrast'));
}

async function runTool(toolName) {
  const tool = tools[toolName];

  if (!tool) {
    console.error(chalk.red(`❌ Unknown tool: ${toolName}`));
    console.log(chalk.yellow('Available tools:'), Object.keys(tools).join(', '));
    process.exit(1);
  }

  console.log(chalk.blue.bold(`🚀 Starting: ${tool.name}\n`));
  console.log(chalk.gray(`Description: ${tool.description}`));
  console.log(chalk.green(`Command: ${tool.command}\n`));

  if (toolName === 'storybook') {
    console.log(chalk.yellow.bold('📋 Development Tools Available:\n'));
    tool.features.forEach((feature) => {
      console.log(chalk.gray(`${feature}`));
    });
    console.log('\n' + chalk.cyan('🌐 Storybook will open at http://localhost:6006'));
    console.log(chalk.gray('✨ All development tools are pre-configured and ready to use!'));
    console.log('');
  }

  try {
    const { stdout, stderr } = await execAsync(tool.command);
    if (stdout) console.log(stdout);
    if (stderr) console.error(chalk.yellow(stderr));
  } catch (error) {
    console.error(chalk.red(`❌ Failed to run ${tool.name}:`));
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}

function main() {
  const args = process.argv.slice(2);

  printHeader();

  if (args.length === 0) {
    printToolsList();
    printUsageHelp();
    return;
  }

  const command = args[0];

  if (command === '--help' || command === '-h') {
    printToolsList();
    printUsageHelp();
    return;
  }

  runTool(command);
}

// Handle process interruption gracefully
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n👋 Development tools interrupted. Goodbye!'));
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log(chalk.yellow('\n👋 Development tools terminated. Goodbye!'));
  process.exit(0);
});

main();
