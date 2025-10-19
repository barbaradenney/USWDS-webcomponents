#!/usr/bin/env node

/**
 * Interactive Commit Helper
 * Helps generate conventional commit messages and automates common commit patterns
 */

import { execSync } from 'child_process';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🤖 Interactive Commit Helper\n');

const COMMIT_TYPES = {
  feat: 'A new feature',
  fix: 'A bug fix',
  docs: 'Documentation only changes',
  style: 'Changes that do not affect the meaning of the code',
  refactor: 'A code change that neither fixes a bug nor adds a feature',
  perf: 'A code change that improves performance',
  test: 'Adding missing tests or correcting existing tests',
  chore: 'Changes to the build process or auxiliary tools',
  ci: 'Changes to CI configuration files and scripts',
  build: 'Changes that affect the build system or dependencies'
};

function runCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8' }).toString().trim();
  } catch (error) {
    return '';
  }
}

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer.trim());
    });
  });
}

function getChangedFiles() {
  const status = runCommand('git status --porcelain');
  return status.split('\n').filter(line => line.trim()).map(line => {
    const statusCode = line.substring(0, 2);
    const filePath = line.substring(3);
    return { statusCode, filePath };
  });
}

function suggestScope(changes) {
  const suggestions = new Set();
  
  changes.forEach(({ filePath }) => {
    if (filePath.includes('src/components/')) {
      const componentMatch = filePath.match(/src\/components\/([^\/]+)/);
      if (componentMatch) {
        suggestions.add(componentMatch[1]);
      }
    } else if (filePath.includes('docs/')) {
      suggestions.add('docs');
    } else if (filePath.includes('scripts/')) {
      suggestions.add('scripts');
    } else if (filePath.includes('.github/')) {
      suggestions.add('ci');
    } else if (filePath.includes('package.json')) {
      suggestions.add('deps');
    }
  });

  return Array.from(suggestions).slice(0, 3);
}

function displayCommitTypes() {
  console.log('\n📋 Available commit types:\n');
  Object.entries(COMMIT_TYPES).forEach(([type, description]) => {
    console.log(`   ${type.padEnd(10)} - ${description}`);
  });
  console.log('');
}

function displayChangedFiles(changes) {
  console.log('\n📝 Changed files:\n');
  changes.forEach(({ statusCode, filePath }) => {
    const status = statusCode.includes('M') ? '📝 Modified' : 
                   statusCode.includes('A') ? '➕ Added' : 
                   statusCode.includes('D') ? '❌ Deleted' : '🔄 Changed';
    console.log(`   ${status.padEnd(12)} ${filePath}`);
  });
  console.log('');
}

async function buildCommitMessage() {
  const changes = getChangedFiles();
  
  if (changes.length === 0) {
    console.log('ℹ️  No changes to commit.\n');
    process.exit(0);
  }

  displayChangedFiles(changes);
  displayCommitTypes();

  // Get commit type
  const type = await question('🏷️  Enter commit type: ');
  if (!COMMIT_TYPES[type]) {
    console.log('❌ Invalid commit type. Please use one of the listed types.');
    process.exit(1);
  }

  // Suggest and get scope
  const suggestedScopes = suggestScope(changes);
  if (suggestedScopes.length > 0) {
    console.log(`\n💡 Suggested scopes: ${suggestedScopes.join(', ')}`);
  }
  const scope = await question('🎯 Enter scope (optional): ');

  // Get description
  const description = await question('📝 Enter description: ');
  if (!description) {
    console.log('❌ Description is required.');
    process.exit(1);
  }

  // Get optional body
  const body = await question('📄 Enter body (optional, press Enter to skip): ');

  // Get optional breaking changes
  const breaking = await question('⚠️  Any breaking changes? (optional, press Enter to skip): ');

  // Build commit message
  const scopeString = scope ? `(${scope})` : '';
  let commitMessage = `${type}${scopeString}: ${description}`;

  if (body) {
    commitMessage += `\n\n${body}`;
  }

  if (breaking) {
    commitMessage += `\n\nBREAKING CHANGE: ${breaking}`;
  }

  // Add automated signature
  commitMessage += '\n\n🤖 Generated with Commit Helper\n\nCo-Authored-By: Commit Helper <noreply@automation.local>';

  return commitMessage;
}

async function confirmCommit(message) {
  console.log('\n📋 Commit message preview:\n');
  console.log('---');
  console.log(message);
  console.log('---\n');

  const confirm = await question('✅ Commit with this message? (y/N): ');
  return confirm.toLowerCase() === 'y' || confirm.toLowerCase() === 'yes';
}

async function runQualityChecks() {
  console.log('\n🔍 Running quality checks...\n');
  
  const checks = [
    { name: 'TypeScript', command: 'npm run typecheck' },
    { name: 'Linting', command: 'npm run lint' },
    { name: 'Tests', command: 'npm run test -- --run' }
  ];

  for (const check of checks) {
    process.stdout.write(`   ${check.name}... `);
    try {
      execSync(check.command, { stdio: 'pipe' });
      console.log('✅');
    } catch (error) {
      console.log('❌');
      console.error(`\n💥 ${check.name} failed. Please fix issues before committing.\n`);
      const skipChecks = await question('⚠️  Skip quality checks and commit anyway? (y/N): ');
      if (skipChecks.toLowerCase() !== 'y') {
        process.exit(1);
      }
      break;
    }
  }

  console.log('\n🎉 Quality checks passed!\n');
}

async function performCommit(message) {
  try {
    // Stage all changes
    execSync('git add .', { stdio: 'inherit' });
    
    // Create commit
    execSync(`git commit -m "${message.replace(/"/g, '\\"')}"`, { stdio: 'inherit' });
    
    console.log('\n✅ Changes committed successfully!\n');
    
    // Show last commit
    const lastCommit = runCommand('git log -1 --oneline');
    console.log(`📋 Latest commit: ${lastCommit}\n`);
    
    // Ask about pushing
    const push = await question('🚀 Push to remote? (y/N): ');
    if (push.toLowerCase() === 'y') {
      console.log('\n📤 Pushing to remote...\n');
      execSync('git push', { stdio: 'inherit' });
      console.log('\n✅ Changes pushed successfully!\n');
    }
    
  } catch (error) {
    console.error('\n❌ Commit failed:', error.message);
    process.exit(1);
  }
}

// Main execution
async function main() {
  try {
    const commitMessage = await buildCommitMessage();
    
    if (await confirmCommit(commitMessage)) {
      await runQualityChecks();
      await performCommit(commitMessage);
    } else {
      console.log('\n❌ Commit cancelled.\n');
    }
    
  } catch (error) {
    console.error('\n💥 Commit helper failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();