#!/usr/bin/env node

/**
 * Interactive Monorepo CLI
 * Provides guided workflows for common monorepo tasks
 */

import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import readline from 'readline';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '../..');
const packagesDir = join(rootDir, 'packages');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

// Get all packages
function getPackages() {
  return readdirSync(packagesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => {
      const pkgPath = join(packagesDir, dirent.name, 'package.json');
      try {
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
        return {
          dir: dirent.name,
          name: pkg.name,
          version: pkg.version,
          private: pkg.private || false
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

async function main() {
  console.clear();
  console.log('\n🎮 USWDS Web Components - Monorepo CLI\n');
  console.log('═'.repeat(60));
  console.log('\n');

  console.log('What would you like to do?\n');
  console.log('1. Build packages');
  console.log('2. Run tests');
  console.log('3. Create changeset (version bump)');
  console.log('4. View package health');
  console.log('5. Generate dependency graph');
  console.log('6. Clean caches');
  console.log('7. Check bundle sizes');
  console.log('8. Run validation');
  console.log('9. Exit');
  console.log('');

  const choice = await question('Enter your choice (1-9): ');

  switch (choice.trim()) {
    case '1':
      await buildPackages();
      break;
    case '2':
      await runTests();
      break;
    case '3':
      await createChangeset();
      break;
    case '4':
      await viewPackageHealth();
      break;
    case '5':
      await generateDependencyGraph();
      break;
    case '6':
      await cleanCaches();
      break;
    case '7':
      await checkBundleSizes();
      break;
    case '8':
      await runValidation();
      break;
    case '9':
      console.log('\n👋 Goodbye!\n');
      rl.close();
      return;
    default:
      console.log('\n❌ Invalid choice. Please try again.\n');
      await main();
  }
}

async function buildPackages() {
  console.log('\n🔨 Build Packages\n');
  console.log('═'.repeat(60));
  console.log('\n');

  const packages = getPackages();
  console.log('Available packages:\n');
  console.log('0. All packages');
  packages.forEach((pkg, i) => {
    console.log(`${i + 1}. ${pkg.name}`);
  });

  console.log('');
  const choice = await question('Which package(s) to build? (0 for all, or package number): ');

  try {
    if (choice.trim() === '0') {
      console.log('\n📦 Building all packages...\n');
      execSync('pnpm turbo build', { stdio: 'inherit', cwd: rootDir });
    } else {
      const index = parseInt(choice.trim()) - 1;
      const pkg = packages[index];
      if (!pkg) {
        console.log('\n❌ Invalid package number\n');
      } else {
        console.log(`\n📦 Building ${pkg.name}...\n`);
        execSync(`pnpm --filter "${pkg.name}" build`, { stdio: 'inherit', cwd: rootDir });
      }
    }
    console.log('\n✅ Build complete!\n');
  } catch (e) {
    console.log('\n❌ Build failed!\n');
  }

  await continuePrompt();
}

async function runTests() {
  console.log('\n🧪 Run Tests\n');
  console.log('═'.repeat(60));
  console.log('\n');

  console.log('Test options:\n');
  console.log('1. All tests');
  console.log('2. Unit tests only');
  console.log('3. Specific package');
  console.log('');

  const choice = await question('Choose test scope (1-3): ');

  try {
    if (choice.trim() === '1') {
      console.log('\n🧪 Running all tests...\n');
      execSync('pnpm test', { stdio: 'inherit', cwd: rootDir });
    } else if (choice.trim() === '2') {
      console.log('\n🧪 Running unit tests...\n');
      execSync('pnpm run test:run:unit', { stdio: 'inherit', cwd: rootDir });
    } else if (choice.trim() === '3') {
      const packages = getPackages();
      console.log('\nAvailable packages:\n');
      packages.forEach((pkg, i) => {
        console.log(`${i + 1}. ${pkg.name}`);
      });
      console.log('');
      const pkgChoice = await question('Which package? ');
      const index = parseInt(pkgChoice.trim()) - 1;
      const pkg = packages[index];

      if (!pkg) {
        console.log('\n❌ Invalid package number\n');
      } else {
        console.log(`\n🧪 Running tests for ${pkg.name}...\n`);
        execSync(`pnpm --filter "${pkg.name}" test`, { stdio: 'inherit', cwd: rootDir });
      }
    }
    console.log('\n✅ Tests complete!\n');
  } catch (e) {
    console.log('\n❌ Tests failed!\n');
  }

  await continuePrompt();
}

async function createChangeset() {
  console.log('\n📝 Create Changeset\n');
  console.log('═'.repeat(60));
  console.log('\n');

  console.log('This will launch the interactive changeset creation tool.\n');
  console.log('You will be asked:');
  console.log('  - Which packages changed');
  console.log('  - What type of change (major/minor/patch)');
  console.log('  - A summary of the changes\n');

  const confirm = await question('Continue? (y/n): ');

  if (confirm.toLowerCase() === 'y') {
    try {
      execSync('pnpm changeset add', { stdio: 'inherit', cwd: rootDir });
      console.log('\n✅ Changeset created!\n');
      console.log('💡 Next steps:');
      console.log('   1. Commit the changeset file');
      console.log('   2. Push to your branch');
      console.log('   3. When merged to main, Changesets will create a release PR\n');
    } catch (e) {
      console.log('\n❌ Changeset creation cancelled or failed\n');
    }
  }

  await continuePrompt();
}

async function viewPackageHealth() {
  console.log('\n🏥 Package Health Dashboard\n');
  console.log('═'.repeat(60));
  console.log('\n');

  try {
    execSync('node scripts/maintenance/package-health-dashboard.js', {
      stdio: 'inherit',
      cwd: rootDir
    });
  } catch (e) {
    console.log('\n❌ Failed to generate health dashboard\n');
  }

  await continuePrompt();
}

async function generateDependencyGraph() {
  console.log('\n📊 Generate Dependency Graph\n');
  console.log('═'.repeat(60));
  console.log('\n');

  try {
    execSync('node scripts/maintenance/generate-dependency-graph.js', {
      stdio: 'inherit',
      cwd: rootDir
    });
  } catch (e) {
    console.log('\n❌ Failed to generate dependency graph\n');
  }

  await continuePrompt();
}

async function cleanCaches() {
  console.log('\n🧹 Clean Caches\n');
  console.log('═'.repeat(60));
  console.log('\n');

  console.log('What would you like to clean?\n');
  console.log('1. Turborepo cache');
  console.log('2. Node modules cache');
  console.log('3. Storybook cache');
  console.log('4. All caches');
  console.log('');

  const choice = await question('Choose what to clean (1-4): ');

  try {
    switch (choice.trim()) {
      case '1':
        console.log('\n🧹 Cleaning Turborepo cache...\n');
        execSync('pnpm turbo clean', { stdio: 'inherit', cwd: rootDir });
        break;
      case '2':
        console.log('\n🧹 Cleaning node_modules cache...\n');
        execSync('rm -rf node_modules/.cache', { stdio: 'inherit', cwd: rootDir });
        break;
      case '3':
        console.log('\n🧹 Cleaning Storybook cache...\n');
        execSync('pnpm run storybook:clean', { stdio: 'inherit', cwd: rootDir });
        break;
      case '4':
        console.log('\n🧹 Cleaning all caches...\n');
        execSync('pnpm turbo clean', { stdio: 'inherit', cwd: rootDir });
        execSync('rm -rf node_modules/.cache', { stdio: 'inherit', cwd: rootDir });
        execSync('pnpm run storybook:clean', { stdio: 'inherit', cwd: rootDir });
        break;
      default:
        console.log('\n❌ Invalid choice\n');
    }
    console.log('\n✅ Cache cleaned!\n');
  } catch (e) {
    console.log('\n❌ Failed to clean cache\n');
  }

  await continuePrompt();
}

async function checkBundleSizes() {
  console.log('\n📦 Check Bundle Sizes\n');
  console.log('═'.repeat(60));
  console.log('\n');

  try {
    execSync('pnpm run size:packages', { stdio: 'inherit', cwd: rootDir });
  } catch (e) {
    console.log('\n❌ Failed to check bundle sizes\n');
  }

  await continuePrompt();
}

async function runValidation() {
  console.log('\n✅ Run Validation\n');
  console.log('═'.repeat(60));
  console.log('\n');

  console.log('Validation options:\n');
  console.log('1. Full validation (all checks)');
  console.log('2. USWDS compliance only');
  console.log('3. TypeScript only');
  console.log('4. Linting only');
  console.log('');

  const choice = await question('Choose validation scope (1-4): ');

  try {
    switch (choice.trim()) {
      case '1':
        console.log('\n✅ Running full validation...\n');
        execSync('pnpm run validate', { stdio: 'inherit', cwd: rootDir });
        break;
      case '2':
        console.log('\n✅ Running USWDS compliance check...\n');
        execSync('pnpm run validate:uswds', { stdio: 'inherit', cwd: rootDir });
        break;
      case '3':
        console.log('\n✅ Running TypeScript check...\n');
        execSync('pnpm run typecheck', { stdio: 'inherit', cwd: rootDir });
        break;
      case '4':
        console.log('\n✅ Running linting...\n');
        execSync('pnpm turbo lint', { stdio: 'inherit', cwd: rootDir });
        break;
      default:
        console.log('\n❌ Invalid choice\n');
    }
  } catch (e) {
    console.log('\n❌ Validation failed!\n');
  }

  await continuePrompt();
}

async function continuePrompt() {
  console.log('');
  const answer = await question('Return to main menu? (y/n): ');

  if (answer.toLowerCase() === 'y') {
    await main();
  } else {
    console.log('\n👋 Goodbye!\n');
    rl.close();
  }
}

main().catch(err => {
  console.error('Error:', err);
  rl.close();
});
