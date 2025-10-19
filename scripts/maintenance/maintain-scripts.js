#!/usr/bin/env node

/**
 * Script and Package.json Maintenance Tool
 * Automatically detects and reports unused scripts, orphaned package.json commands,
 * and provides cleanup recommendations.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const scriptsDir = path.join(__dirname);
const packageJsonPath = path.join(projectRoot, 'package.json');

class ScriptMaintainer {
  constructor() {
    this.packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    this.issues = [];
    this.recommendations = [];
  }

  /**
   * Get all script files in the scripts directory
   */
  getScriptFiles() {
    return fs.readdirSync(scriptsDir)
      .filter(file => file.endsWith('.js'))
      .map(file => path.basename(file, '.js'));
  }

  /**
   * Get all npm script commands from package.json
   */
  getNpmScripts() {
    const scripts = this.packageJson.scripts || {};
    return Object.entries(scripts).filter(([key]) => !key.startsWith('//'));
  }

  /**
   * Find npm scripts that reference non-existent script files
   */
  findOrphanedNpmScripts() {
    const scriptFiles = this.getScriptFiles();
    const npmScripts = this.getNpmScripts();
    
    const orphaned = npmScripts.filter(([key, command]) => {
      if (command.includes('node scripts/')) {
        const scriptName = command.match(/node scripts\/([^.\s]+)\.js/)?.[1];
        return scriptName && !scriptFiles.includes(scriptName);
      }
      return false;
    });

    if (orphaned.length > 0) {
      this.issues.push({
        type: 'orphaned-npm-scripts',
        count: orphaned.length,
        items: orphaned.map(([key, command]) => ({ key, command }))
      });
    }
  }

  /**
   * Find script files that aren't referenced by any npm script
   */
  findUnusedScriptFiles() {
    const scriptFiles = this.getScriptFiles();
    const npmScripts = this.getNpmScripts();
    
    const referencedScripts = new Set();
    npmScripts.forEach(([key, command]) => {
      const scriptName = command.match(/node scripts\/([^.\s]+)\.js/)?.[1];
      if (scriptName) {
        referencedScripts.add(scriptName);
      }
    });

    const unusedScripts = scriptFiles.filter(script => !referencedScripts.has(script));
    
    if (unusedScripts.length > 0) {
      this.issues.push({
        type: 'unused-script-files',
        count: unusedScripts.length,
        items: unusedScripts
      });
    }
  }

  /**
   * Check for duplicate or similar npm scripts
   */
  findDuplicateScripts() {
    const npmScripts = this.getNpmScripts();
    const commandGroups = {};
    
    npmScripts.forEach(([key, command]) => {
      const normalizedCommand = command.replace(/\s+/g, ' ').trim();
      if (!commandGroups[normalizedCommand]) {
        commandGroups[normalizedCommand] = [];
      }
      commandGroups[normalizedCommand].push(key);
    });

    const duplicates = Object.entries(commandGroups)
      .filter(([command, keys]) => keys.length > 1)
      .map(([command, keys]) => ({ command, keys }));

    if (duplicates.length > 0) {
      this.issues.push({
        type: 'duplicate-scripts',
        count: duplicates.length,
        items: duplicates
      });
    }
  }

  /**
   * Check for scripts with naming inconsistencies
   */
  checkNamingConsistency() {
    const npmScripts = this.getNpmScripts();
    const namingIssues = [];

    npmScripts.forEach(([key, command]) => {
      // Check for inconsistent separators (: vs -)
      if (key.includes('-') && key.includes(':')) {
        namingIssues.push({
          script: key,
          issue: 'Mixed separators (- and :)',
          suggestion: key.replace(/-/g, ':')
        });
      }
      
      // Check for very long script names
      if (key.length > 25) {
        namingIssues.push({
          script: key,
          issue: 'Very long name',
          suggestion: 'Consider shortening'
        });
      }
    });

    if (namingIssues.length > 0) {
      this.issues.push({
        type: 'naming-inconsistencies',
        count: namingIssues.length,
        items: namingIssues
      });
    }
  }

  /**
   * Generate cleanup recommendations
   */
  generateRecommendations() {
    if (this.issues.length === 0) {
      this.recommendations.push('✅ No maintenance issues found! Scripts are well-organized.');
      return;
    }

    this.recommendations.push('🔧 MAINTENANCE RECOMMENDATIONS:');
    this.recommendations.push('');

    this.issues.forEach(issue => {
      switch (issue.type) {
        case 'orphaned-npm-scripts':
          this.recommendations.push(`❌ Remove ${issue.count} orphaned npm script(s):`);
          issue.items.forEach(item => {
            this.recommendations.push(`   - "${item.key}": "${item.command}"`);
          });
          this.recommendations.push('');
          break;

        case 'unused-script-files':
          this.recommendations.push(`🗑️  Consider removing ${issue.count} unused script file(s):`);
          issue.items.forEach(script => {
            this.recommendations.push(`   - scripts/${script}.js`);
          });
          this.recommendations.push('');
          break;

        case 'duplicate-scripts':
          this.recommendations.push(`🔄 Found ${issue.count} duplicate script command(s):`);
          issue.items.forEach(dup => {
            this.recommendations.push(`   Command: "${dup.command}"`);
            this.recommendations.push(`   Scripts: ${dup.keys.join(', ')}`);
          });
          this.recommendations.push('');
          break;

        case 'naming-inconsistencies':
          this.recommendations.push(`📝 Fix ${issue.count} naming inconsistency(ies):`);
          issue.items.forEach(item => {
            this.recommendations.push(`   - "${item.script}": ${item.issue}`);
            if (item.suggestion) {
              this.recommendations.push(`     Suggestion: "${item.suggestion}"`);
            }
          });
          this.recommendations.push('');
          break;
      }
    });
  }

  /**
   * Run all maintenance checks
   */
  async runMaintenance() {
    console.log('🔍 Running Scripts Maintenance Check...\n');

    this.findOrphanedNpmScripts();
    this.findUnusedScriptFiles();
    this.findDuplicateScripts();
    this.checkNamingConsistency();
    this.generateRecommendations();

    // Display results
    console.log('📊 MAINTENANCE REPORT');
    console.log('='.repeat(50));
    console.log(`Scripts Directory: ${this.getScriptFiles().length} files`);
    console.log(`NPM Scripts: ${this.getNpmScripts().length} commands`);
    console.log(`Issues Found: ${this.issues.length}`);
    console.log('');

    this.recommendations.forEach(rec => console.log(rec));

    if (this.issues.length > 0) {
      console.log('💡 TIP: Run "npm run scripts:clean" to automatically fix some issues.');
      console.log('💡 TIP: Add this check to your CI/CD pipeline for continuous maintenance.');
    }

    return this.issues.length === 0;
  }

  /**
   * Auto-fix some issues (when --fix flag is used)
   */
  async autoFix() {
    console.log('🔧 Auto-fixing issues...\n');

    let fixed = 0;

    // Remove orphaned npm scripts
    const orphanedIssue = this.issues.find(i => i.type === 'orphaned-npm-scripts');
    if (orphanedIssue) {
      orphanedIssue.items.forEach(item => {
        delete this.packageJson.scripts[item.key];
        console.log(`✅ Removed orphaned script: "${item.key}"`);
        fixed++;
      });
    }

    // Save updated package.json
    if (fixed > 0) {
      fs.writeFileSync(packageJsonPath, JSON.stringify(this.packageJson, null, 2) + '\n');
      console.log(`\n🎉 Fixed ${fixed} issue(s) automatically.`);
      console.log('📝 Updated package.json saved.');
    } else {
      console.log('ℹ️  No auto-fixable issues found.');
    }

    return fixed;
  }
}

// CLI interface
async function main() {
  const maintainer = new ScriptMaintainer();
  const shouldFix = process.argv.includes('--fix');

  if (shouldFix) {
    await maintainer.runMaintenance();
    console.log('\n' + '='.repeat(50));
    await maintainer.autoFix();
  } else {
    const isClean = await maintainer.runMaintenance();
    process.exit(isClean ? 0 : 1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default ScriptMaintainer;