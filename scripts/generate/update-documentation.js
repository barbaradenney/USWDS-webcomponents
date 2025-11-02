#!/usr/bin/env node

/**
 * Documentation Generator
 *
 * Generates documentation files from templates using centralized project metadata.
 *
 * This ensures all documentation stays in sync and eliminates manual placeholder updates.
 *
 * Usage:
 *   node scripts/generate/update-documentation.js
 *   npm run docs:generate
 *
 * Configuration:
 *   - Metadata: .project-metadata.json
 *   - Templates: .templates/*.template.md
 *   - Output: Root directory (CONTRIBUTING.md, SECURITY.md, etc.)
 */

const fs = require('fs');
const path = require('path');

// Paths
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const METADATA_FILE = path.join(PROJECT_ROOT, '.project-metadata.json');
const TEMPLATES_DIR = path.join(PROJECT_ROOT, '.templates');

/**
 * Simple Handlebars-like template engine
 * Supports:
 * - {{variable}} - Simple variable replacement
 * - {{nested.property}} - Nested property access
 * - {{#each array}}...{{/each}} - Array iteration
 * - {{#if condition}}...{{/if}} - Conditional rendering
 */
class TemplateEngine {
  constructor(data) {
    this.data = data;
  }

  /**
   * Get nested property from object using dot notation
   * Example: getProperty(data, 'project.name') => data.project.name
   */
  getProperty(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Render a template string with data
   */
  render(template) {
    let result = template;

    // Handle {{#each array}}...{{/each}} blocks
    result = result.replace(/\{\{#each\s+([^\}]+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, arrayPath, content) => {
      const array = this.getProperty(this.data, arrayPath.trim());
      if (!Array.isArray(array)) {
        console.warn(`Warning: ${arrayPath} is not an array or doesn't exist`);
        return '';
      }
      return array.map(item => {
        // For simple values (strings), {{this}} refers to the item
        // For objects, {{property}} refers to item.property
        const itemContent = content.replace(/\{\{this\}\}/g, typeof item === 'object' ? '' : item);
        return this.renderWithContext(itemContent, item);
      }).join('');
    });

    // Handle {{#if condition}}...{{/if}} blocks
    result = result.replace(/\{\{#if\s+([^\}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, condition, content) => {
      const value = this.getProperty(this.data, condition.trim());
      return value ? content : '';
    });

    // Handle simple {{variable}} replacements
    result = result.replace(/\{\{([^\}#\/]+)\}\}/g, (match, variable) => {
      const value = this.getProperty(this.data, variable.trim());
      return value !== undefined && value !== null ? String(value) : match;
    });

    return result;
  }

  /**
   * Render template with additional context (for nested loops)
   */
  renderWithContext(template, context) {
    let result = template;

    // Replace {{property}} with context[property]
    result = result.replace(/\{\{([^\}#\/]+)\}\}/g, (match, variable) => {
      const trimmed = variable.trim();
      if (trimmed === 'this') return String(context);

      // Check context first, then fall back to main data
      const contextValue = this.getProperty(context, trimmed);
      if (contextValue !== undefined && contextValue !== null) {
        return String(contextValue);
      }

      const dataValue = this.getProperty(this.data, trimmed);
      return dataValue !== undefined && dataValue !== null ? String(dataValue) : match;
    });

    return result;
  }
}

/**
 * Load project metadata
 */
function loadMetadata() {
  try {
    const content = fs.readFileSync(METADATA_FILE, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`❌ Failed to load metadata from ${METADATA_FILE}:`);
    console.error(error.message);
    process.exit(1);
  }
}

/**
 * Get all template files
 */
function getTemplateFiles() {
  try {
    const files = fs.readdirSync(TEMPLATES_DIR);
    return files
      .filter(file => file.endsWith('.template.md'))
      .map(file => ({
        templatePath: path.join(TEMPLATES_DIR, file),
        outputPath: path.join(PROJECT_ROOT, file.replace('.template.md', '.md')),
        name: file.replace('.template.md', '.md')
      }));
  } catch (error) {
    console.error(`❌ Failed to read templates directory ${TEMPLATES_DIR}:`);
    console.error(error.message);
    process.exit(1);
  }
}

/**
 * Generate documentation file from template
 */
function generateFile(templateInfo, metadata) {
  const { templatePath, outputPath, name } = templateInfo;

  try {
    // Read template
    const template = fs.readFileSync(templatePath, 'utf8');

    // Render template with metadata
    const engine = new TemplateEngine(metadata);
    const rendered = engine.render(template);

    // Write output
    fs.writeFileSync(outputPath, rendered, 'utf8');

    console.log(`✅ Generated ${name}`);
  } catch (error) {
    console.error(`❌ Failed to generate ${name}:`);
    console.error(error.message);
    throw error;
  }
}

/**
 * Validate that generated files don't contain placeholders
 */
function validateGenerated(outputPath, name) {
  const content = fs.readFileSync(outputPath, 'utf8');

  // Check for common placeholder patterns
  const placeholders = [
    /\[INSERT EMAIL\]/gi,
    /\[UPDATE THIS\]/gi,
    /security@example\.com/gi,
    /conduct@example\.com/gi,
    /\{\{[^\}]+\}\}/g  // Any remaining template syntax
  ];

  const found = [];
  placeholders.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      found.push(...matches);
    }
  });

  if (found.length > 0) {
    console.warn(`⚠️  Warning: ${name} still contains placeholders:`);
    found.forEach(placeholder => console.warn(`   - ${placeholder}`));
    console.warn(`   → Update .project-metadata.json with real values`);
  }
}

/**
 * Main execution
 */
function main() {
  console.log('📝 Documentation Generator\n');

  // Load metadata
  console.log(`📖 Loading metadata from ${path.relative(PROJECT_ROOT, METADATA_FILE)}...`);
  const metadata = loadMetadata();
  console.log(`   Project: ${metadata.project.name} v${metadata.project.version}`);
  console.log(`   Author: ${metadata.author.name}\n`);

  // Get template files
  console.log(`📂 Finding templates in ${path.relative(PROJECT_ROOT, TEMPLATES_DIR)}...`);
  const templateFiles = getTemplateFiles();
  console.log(`   Found ${templateFiles.length} template(s)\n`);

  if (templateFiles.length === 0) {
    console.log('⚠️  No templates found. Nothing to generate.');
    return;
  }

  // Generate files
  console.log('🔨 Generating documentation files...\n');
  let successCount = 0;
  let errorCount = 0;

  templateFiles.forEach(templateInfo => {
    try {
      generateFile(templateInfo, metadata);
      validateGenerated(templateInfo.outputPath, templateInfo.name);
      successCount++;
    } catch (error) {
      errorCount++;
    }
  });

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`\n✨ Documentation Generation Complete!\n`);
  console.log(`   ✅ ${successCount} file(s) generated`);
  if (errorCount > 0) {
    console.log(`   ❌ ${errorCount} file(s) failed`);
  }
  console.log('\n💡 Next Steps:');
  console.log('   1. Review generated files for accuracy');
  console.log('   2. Update .project-metadata.json with real contact emails');
  console.log('   3. Run docs:generate again to update all files');
  console.log('   4. Commit the changes\n');

  process.exit(errorCount > 0 ? 1 : 0);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { TemplateEngine, loadMetadata, generateFile };
