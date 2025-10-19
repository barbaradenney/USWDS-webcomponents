#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

/**
 * Extract all USWDS CSS classes from SCSS source files
 * This creates a comprehensive list including all official USWDS classes
 */
function extractUSWDSClassesFromSCSS() {
  console.log('🔍 Extracting USWDS classes from SCSS source files...');

  const classSet = new Set();
  const uswdsPath = path.join(projectRoot, 'node_modules', '@uswds', 'uswds');

  // Find all SCSS files in the USWDS package
  function findFiles(dir, extensions) {
    const files = [];
    if (!fs.existsSync(dir)) {
      console.warn(`⚠️  Directory not found: ${dir}`);
      return files;
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...findFiles(fullPath, extensions));
      } else if (entry.isFile() && extensions.some((ext) => entry.name.endsWith(ext))) {
        files.push(fullPath);
      }
    }

    return files;
  }

  // Extract classes from SCSS content with improved patterns
  function extractClassesFromContent(content, _filePath) {
    const classes = new Set();

    // Improved patterns for USWDS classes
    const patterns = [
      // Standard class definitions: .usa-component, .usa-component__element, .usa-component--modifier
      /\.usa-[a-z0-9]+(?:-[a-z0-9]+)*(?:__[a-z0-9]+(?:-[a-z0-9]+)*)*(?:--[a-z0-9]+(?:-[a-z0-9]+)*)*/g,
      // Classes in selectors before pseudo-classes, combinators, etc.
      /\.usa-[a-z0-9]+(?:-[a-z0-9]+)*(?:__[a-z0-9]+(?:-[a-z0-9]+)*)*(?:--[a-z0-9]+(?:-[a-z0-9]+)*)*(?=[:.,\s\n&>+~[\]()])/g,
      // Classes with underscores (double underscores for BEM elements)
      /\.usa-[a-z0-9_-]+/g,
    ];

    for (const pattern of patterns) {
      const matches = content.match(pattern) || [];
      for (let match of matches) {
        // Clean up the match to extract just the class name
        match = match.trim();

        if (match.startsWith('.usa-') && match.length > 5) {
          // Remove any trailing characters that aren't part of the class name
          match = match.replace(/[^a-z0-9_-]+$/, '');
          if (match.length > 5) {
            classes.add(match);
          }
        }
      }
    }

    return classes;
  }

  // Get all SCSS files
  const scssFiles = findFiles(uswdsPath, ['.scss']);
  console.log(`📁 Found ${scssFiles.length} SCSS files to scan`);

  let processedFiles = 0;
  let totalClasses = 0;

  // Process each SCSS file
  for (const file of scssFiles) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const fileClasses = extractClassesFromContent(content, file);

      for (const cls of fileClasses) {
        classSet.add(cls);
      }

      if (fileClasses.size > 0) {
        const relativePath = path.relative(uswdsPath, file);
        console.log(`  📄 ${relativePath}: ${fileClasses.size} classes`);
        totalClasses += fileClasses.size;
      }

      processedFiles++;
    } catch (error) {
      console.warn(`⚠️  Error reading ${file}: ${error.message}`);
    }
  }

  console.log(`✅ SCSS: Processed ${processedFiles} files, found ${totalClasses} class instances`);
  console.log(`🎯 SCSS: Unique classes found: ${classSet.size}`);

  return classSet;
}

/**
 * Extract USWDS classes from JavaScript files where they're defined programmatically
 */
function extractUSWDSClassesFromJS() {
  console.log('🔍 Extracting USWDS classes from JavaScript source files...');

  const classSet = new Set();
  const uswdsPath = path.join(projectRoot, 'node_modules', '@uswds', 'uswds');

  // Find all JS files in the USWDS package
  function findFiles(dir, extensions) {
    const files = [];
    if (!fs.existsSync(dir)) {
      console.warn(`⚠️  Directory not found: ${dir}`);
      return files;
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...findFiles(fullPath, extensions));
      } else if (entry.isFile() && extensions.some((ext) => entry.name.endsWith(ext))) {
        files.push(fullPath);
      }
    }

    return files;
  }

  // Extract classes from JavaScript content
  function extractClassesFromJSContent(content, _filePath) {
    const classes = new Set();

    // Patterns for classes defined in JavaScript
    const patterns = [
      // Variables containing class strings: const INPUT = `.${PREFIX}-character-count__field`;
      /["'`]\.?usa-[a-z0-9_-]+(?:__[a-z0-9_-]+)*(?:--[a-z0-9_-]+)*["'`]/g,
      // Template literals with usa- classes
      /\$\{PREFIX\}-[a-z0-9_-]+(?:__[a-z0-9_-]+)*(?:--[a-z0-9_-]+)*/g,
      // Direct class references
      /usa-[a-z0-9_-]+(?:__[a-z0-9_-]+)*(?:--[a-z0-9_-]+)*/g,
    ];

    for (const pattern of patterns) {
      const matches = content.match(pattern) || [];
      for (let match of matches) {
        // Clean up the match
        match = match.replace(/["'`]/g, ''); // Remove quotes
        match = match.replace(/\$\{PREFIX\}-/, 'usa-'); // Replace template literal prefix

        if (!match.startsWith('.')) {
          match = '.' + match; // Ensure it starts with a dot
        }

        if (match.startsWith('.usa-') && match.length > 5) {
          classes.add(match);
        }
      }
    }

    return classes;
  }

  // Get all JS files
  const jsFiles = findFiles(uswdsPath, ['.js']);
  console.log(`📁 Found ${jsFiles.length} JavaScript files to scan`);

  let processedFiles = 0;
  let totalClasses = 0;

  // Process each JS file
  for (const file of jsFiles) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const fileClasses = extractClassesFromJSContent(content, file);

      for (const cls of fileClasses) {
        classSet.add(cls);
      }

      if (fileClasses.size > 0) {
        const relativePath = path.relative(uswdsPath, file);
        console.log(`  📄 ${relativePath}: ${fileClasses.size} classes`);
        totalClasses += fileClasses.size;
      }

      processedFiles++;
    } catch (error) {
      console.warn(`⚠️  Error reading ${file}: ${error.message}`);
    }
  }

  console.log(`✅ JS: Processed ${processedFiles} files, found ${totalClasses} class instances`);
  console.log(`🎯 JS: Unique classes found: ${classSet.size}`);

  return classSet;
}

/**
 * Also extract classes from the compiled CSS for comparison
 */
function extractClassesFromCompiledCSS() {
  console.log('📊 Extracting classes from compiled CSS for comparison...');

  const cssPath = path.join(projectRoot, 'src', 'styles', 'styles.css');
  if (!fs.existsSync(cssPath)) {
    console.warn('⚠️  Compiled CSS not found, skipping comparison');
    return new Set();
  }

  const content = fs.readFileSync(cssPath, 'utf8');
  const pattern = /\.usa-[a-z0-9_-]+(?:__[a-z0-9_-]+)*(?:--[a-z0-9_-]+)*/g;
  const matches = content.match(pattern) || [];

  const classes = new Set(matches);
  console.log(`📄 Compiled CSS contains ${classes.size} unique USWDS classes`);

  return classes;
}

/**
 * Load the current class list for comparison
 */
function loadCurrentClassList() {
  const classesFile = '/tmp/uswds_classes.txt';
  if (!fs.existsSync(classesFile)) {
    console.log('📋 No current class list found');
    return new Set();
  }

  const classes = new Set(
    fs
      .readFileSync(classesFile, 'utf8')
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => (line.startsWith('.') ? line : `.${line}`))
  );

  console.log(`📋 Current class list contains ${classes.size} classes`);
  return classes;
}

/**
 * Main execution
 */
function main() {
  console.log('🚀 Starting comprehensive USWDS class extraction...\n');

  // Extract from all sources
  const scssClasses = extractUSWDSClassesFromSCSS();
  const jsClasses = extractUSWDSClassesFromJS();
  const cssClasses = extractClassesFromCompiledCSS();
  const currentClasses = loadCurrentClassList();

  // Combine all classes
  const allClasses = new Set([...scssClasses, ...jsClasses, ...cssClasses]);

  console.log('\n📊 Comparison Results:');
  console.log(`  SCSS source files: ${scssClasses.size} classes`);
  console.log(`  JavaScript files:  ${jsClasses.size} classes`);
  console.log(`  Compiled CSS:      ${cssClasses.size} classes`);
  console.log(`  Current list:      ${currentClasses.size} classes`);
  console.log(`  Combined total:    ${allClasses.size} classes`);

  // Find missing classes
  const missingFromCurrent = new Set([...allClasses].filter((cls) => !currentClasses.has(cls)));
  const onlyInCurrent = new Set([...currentClasses].filter((cls) => !allClasses.has(cls)));

  console.log(`\n🔍 Analysis:`);
  console.log(`  Missing from current list: ${missingFromCurrent.size} classes`);
  console.log(`  Only in current list:      ${onlyInCurrent.size} classes`);

  // Show some examples of missing classes
  if (missingFromCurrent.size > 0) {
    console.log('\n❌ Examples of missing classes:');
    const examples = [...missingFromCurrent].slice(0, 10);
    examples.forEach((cls) => console.log(`    ${cls}`));
    if (missingFromCurrent.size > 10) {
      console.log(`    ... and ${missingFromCurrent.size - 10} more`);
    }
  }

  // Check for the specific classes we know are missing
  const knownMissing = [
    '.usa-character-count__field',
    '.usa-step-indicator__heading-counter',
    '.usa-step-indicator__heading-text',
  ];

  console.log('\n🎯 Checking known missing classes:');
  for (const cls of knownMissing) {
    const inScss = scssClasses.has(cls);
    const inCss = cssClasses.has(cls);
    const inCurrent = currentClasses.has(cls);

    console.log(`  ${cls}:`);
    console.log(
      `    SCSS: ${inScss ? '✅' : '❌'}  CSS: ${inCss ? '✅' : '❌'}  Current: ${inCurrent ? '✅' : '❌'}`
    );
  }

  // Create updated class list
  const sortedClasses = [...allClasses].sort();
  const outputPath = '/tmp/uswds_classes_complete.txt';
  const productionPath = '/tmp/uswds_classes.txt';

  fs.writeFileSync(outputPath, sortedClasses.join('\n') + '\n');
  console.log(`\n✅ Complete class list written to: ${outputPath}`);
  console.log(`📊 Total classes: ${sortedClasses.length}`);

  // Also create a backup of the current list
  if (currentClasses.size > 0) {
    const backupPath = '/tmp/uswds_classes_backup.txt';
    const currentArray = [...currentClasses].sort();
    fs.writeFileSync(backupPath, currentArray.join('\n') + '\n');
    console.log(`💾 Current class list backed up to: ${backupPath}`);
  }

  // If running in automation mode, update the production file
  const autoUpdate = process.argv.includes('--auto-update') || process.env.USWDS_AUTO_UPDATE === 'true';
  if (autoUpdate) {
    fs.writeFileSync(productionPath, sortedClasses.join('\n') + '\n');
    console.log(`🔄 Production class list updated: ${productionPath}`);

    // Create a summary of changes
    const addedClasses = missingFromCurrent.size;
    const removedClasses = onlyInCurrent.size;

    console.log(`\n📈 Update Summary:`);
    console.log(`   Classes added: ${addedClasses}`);
    console.log(`   Classes removed: ${removedClasses}`);
    console.log(`   Net change: ${addedClasses - removedClasses > 0 ? '+' : ''}${addedClasses - removedClasses}`);
    console.log(`   Total classes: ${sortedClasses.length}`);

    // Return status for automation scripts
    process.exit(0);
  }

  console.log('\n🎉 Class extraction complete!');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { extractUSWDSClassesFromSCSS, extractClassesFromCompiledCSS };
