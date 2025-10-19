#!/usr/bin/env node

/**
 * Smart Commit Script
 * Automatically generates commit messages based on changed files and runs quality checks
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🤖 Smart Commit - Analyzing changes and creating commit...\n');

function runCommand(command, options = {}) {
  try {
    return execSync(command, { 
      encoding: 'utf8', 
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options 
    }).toString().trim();
  } catch (error) {
    if (!options.ignoreErrors) {
      console.error(`❌ Command failed: ${command}`);
      console.error(error.message);
      process.exit(1);
    }
    return '';
  }
}

function getGitStatus() {
  const status = runCommand('git status --porcelain', { silent: true });
  return status.split('\n').filter(line => line.trim()).map(line => {
    const statusCode = line.substring(0, 2);
    const filePath = line.substring(3);
    return { statusCode, filePath };
  });
}

function analyzeChanges(changes) {
  const analysis = {
    components: new Set(),
    tests: new Set(), 
    stories: new Set(),
    docs: new Set(),
    config: new Set(),
    scripts: new Set(),
    types: new Set()
  };

  changes.forEach(({ filePath }) => {
    if (filePath.includes('src/components/')) {
      const componentMatch = filePath.match(/src\/components\/([^\/]+)/);
      if (componentMatch) {
        analysis.components.add(componentMatch[1]);
      }
      
      if (filePath.includes('.test.ts')) {
        analysis.tests.add(componentMatch?.[1] || 'unknown');
      }
      if (filePath.includes('.stories.ts')) {
        analysis.stories.add(componentMatch?.[1] || 'unknown');
      }
    } else if (filePath.includes('docs/') || filePath.endsWith('.md')) {
      analysis.docs.add(path.basename(filePath));
    } else if (filePath.includes('scripts/')) {
      analysis.scripts.add(path.basename(filePath));
    } else if (filePath.includes('.json') || filePath.includes('.yml') || filePath.includes('.yaml')) {
      analysis.config.add(path.basename(filePath));
    } else if (filePath.includes('.d.ts') || filePath.includes('types/')) {
      analysis.types.add(path.basename(filePath));
    }
  });

  return analysis;
}

function generateCommitMessage(analysis, changes) {
  const components = Array.from(analysis.components);
  const docs = Array.from(analysis.docs);
  const scripts = Array.from(analysis.scripts);
  const config = Array.from(analysis.config);

  let type = 'chore';
  let scope = '';
  let description = '';
  let body = [];

  // Determine commit type and scope
  if (components.length > 0) {
    if (analysis.tests.size > 0) {
      type = 'test';
      scope = components.length === 1 ? components[0] : 'components';
      description = components.length === 1 
        ? `add comprehensive tests for ${components[0]}`
        : `add tests for ${components.length} components`;
    } else if (analysis.stories.size > 0) {
      type = 'docs';
      scope = components.length === 1 ? components[0] : 'storybook';
      description = components.length === 1
        ? `add stories for ${components[0]}`
        : `update storybook stories`;
    } else {
      type = 'feat';
      scope = components.length === 1 ? components[0] : 'components';
      description = components.length === 1
        ? `implement ${components[0]} component`
        : `update ${components.length} components`;
    }
    
    // Add component details to body
    components.forEach(comp => {
      const compChanges = changes.filter(c => c.filePath.includes(`/${comp}/`));
      const hasTests = compChanges.some(c => c.filePath.includes('.test.ts'));
      const hasStories = compChanges.some(c => c.filePath.includes('.stories.ts'));
      const hasReadme = compChanges.some(c => c.filePath.includes('README.md'));
      
      let compDetails = [`- ${comp}:`];
      if (hasTests) compDetails.push('tests');
      if (hasStories) compDetails.push('stories');  
      if (hasReadme) compDetails.push('documentation');
      
      body.push(compDetails.join(' '));
    });

  } else if (docs.length > 0) {
    type = 'docs';
    scope = docs.length === 1 ? 'readme' : 'docs';
    description = docs.length === 1
      ? `update ${docs[0]}`
      : `update ${docs.length} documentation files`;
    
    body.push('Documentation updates:');
    docs.forEach(doc => body.push(`- ${doc}`));

  } else if (scripts.length > 0) {
    type = 'chore';
    scope = 'scripts';
    description = scripts.length === 1
      ? `update ${scripts[0]}`
      : `update build and automation scripts`;
    
    body.push('Script updates:');
    scripts.forEach(script => body.push(`- ${script}`));

  } else if (config.length > 0) {
    type = 'chore';
    scope = 'config';
    description = 'update configuration';
    
    body.push('Configuration updates:');
    config.forEach(conf => body.push(`- ${conf}`));
  }

  // Build commit message
  const scopeString = scope ? `(${scope})` : '';
  const firstLine = `${type}${scopeString}: ${description}`;
  
  let commitMessage = firstLine;
  if (body.length > 0) {
    commitMessage += '\n\n' + body.join('\n');
  }

  // Add automated signature
  commitMessage += '\n\n🤖 Generated with Smart Commit\n\nCo-Authored-By: Smart Commit <noreply@automation.local>';

  return commitMessage;
}

function runQualityChecks() {
  console.log('🔍 Running quality checks...\n');
  
  const checks = [
    { name: 'TypeScript compilation', command: 'npm run typecheck' },
    { name: 'Linting', command: 'npm run lint' },
    { name: 'Tests', command: 'npm run test -- --run' },
    { name: 'Documentation validation', command: 'npm run docs:validate' }
  ];

  for (const check of checks) {
    console.log(`   Running ${check.name}...`);
    try {
      runCommand(check.command, { silent: true });
      console.log(`   ✅ ${check.name} passed`);
    } catch (error) {
      console.log(`   ❌ ${check.name} failed`);
      console.error(`\n💥 Quality check failed: ${check.name}`);
      console.error('Please fix the issues before committing.\n');
      process.exit(1);
    }
  }

  console.log('\n🎉 All quality checks passed!\n');
}

function commitChanges(message, skipChecks = false) {
  if (!skipChecks) {
    runQualityChecks();
  }

  console.log('📝 Committing changes...\n');
  console.log('Commit message:');
  console.log('---');
  console.log(message);
  console.log('---\n');

  // Stage all changes
  runCommand('git add .');
  
  // Create commit with message
  runCommand(`git commit -m "${message.replace(/"/g, '\\"')}"`);
  
  console.log('✅ Changes committed successfully!\n');
  
  // Show git log
  const lastCommit = runCommand('git log -1 --oneline', { silent: true });
  console.log(`📋 Latest commit: ${lastCommit}\n`);
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const skipChecks = args.includes('--skip-checks');
  const customMessage = args.find(arg => arg.startsWith('--message='))?.split('=')[1];

  // Check if there are changes to commit
  const changes = getGitStatus();
  if (changes.length === 0) {
    console.log('ℹ️  No changes to commit.\n');
    process.exit(0);
  }

  console.log(`📋 Found ${changes.length} changed files:\n`);
  changes.forEach(({ statusCode, filePath }) => {
    const status = statusCode.includes('M') ? '📝' : 
                   statusCode.includes('A') ? '➕' : 
                   statusCode.includes('D') ? '❌' : '🔄';
    console.log(`   ${status} ${filePath}`);
  });
  console.log('');

  let commitMessage;
  if (customMessage) {
    commitMessage = customMessage + '\n\n🤖 Generated with Smart Commit\n\nCo-Authored-By: Smart Commit <noreply@automation.local>';
  } else {
    // Analyze changes and generate commit message
    console.log('🤖 Analyzing changes and generating commit message...\n');
    const analysis = analyzeChanges(changes);
    commitMessage = generateCommitMessage(analysis, changes);
  }

  commitChanges(commitMessage, skipChecks);
}

// Handle errors gracefully
process.on('uncaughtException', (error) => {
  console.error('\n💥 Smart commit failed:', error.message);
  process.exit(1);
});

main().catch(error => {
  console.error('\n💥 Smart commit failed:', error);
  process.exit(1);
});