#!/usr/bin/env node

/**
 * Slot Story Validator
 *
 * Validates that components with slots have stories demonstrating slot usage.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COMPONENTS_DIR = path.join(process.cwd(), 'src/components');

class SlotStoryValidator {
  constructor() {
    this.results = [];
    this.issues = [];
    this.successes = [];
  }

  async validateAllComponents() {
    console.log('\n🎰 Slot Story Validator\n');
    console.log('=' .repeat(60));

    const components = fs.readdirSync(COMPONENTS_DIR)
      .filter(name => {
        const componentPath = path.join(COMPONENTS_DIR, name);
        return fs.statSync(componentPath).isDirectory();
      });

    for (const component of components) {
      await this.validateComponent(component);
    }

    this.printReport();
  }

  async validateComponent(componentName) {
    const componentPath = path.join(COMPONENTS_DIR, componentName, `usa-${componentName}.ts`);
    const storyPath = path.join(COMPONENTS_DIR, componentName, `usa-${componentName}.stories.ts`);

    // Check if component file exists
    if (!fs.existsSync(componentPath)) {
      return;
    }

    // Check if story file exists
    if (!fs.existsSync(storyPath)) {
      return;
    }

    const componentContent = fs.readFileSync(componentPath, 'utf-8');
    const storyContent = fs.readFileSync(storyPath, 'utf-8');

    // Extract slot information from component
    const slots = this.extractSlots(componentContent);

    if (slots.length === 0) {
      // No slots, no validation needed
      return;
    }

    // Check if story demonstrates slot usage
    const slotUsageInStories = this.checkSlotUsage(storyContent, slots);

    const result = {
      component: componentName,
      slots: slots,
      hasSlotStories: slotUsageInStories.hasUsage,
      missingSlots: slotUsageInStories.missingSlots,
      demonstratedSlots: slotUsageInStories.demonstratedSlots
    };

    this.results.push(result);

    if (slotUsageInStories.missingSlots.length > 0) {
      this.issues.push({
        component: componentName,
        message: `Component has ${slots.length} slot(s) but stories only demonstrate ${slotUsageInStories.demonstratedSlots.length}`,
        slots: slots,
        missing: slotUsageInStories.missingSlots
      });
    } else {
      this.successes.push({
        component: componentName,
        message: `All ${slots.length} slot(s) demonstrated in stories`
      });
    }
  }

  extractSlots(content) {
    const slots = [];

    // Match <slot> tags with optional name attribute
    const defaultSlotRegex = /<slot(?:\s+[^>]*)?><\/slot>/g;
    const namedSlotRegex = /<slot\s+name=["']([^"']+)["'][^>]*>/g;

    // Check for default slot
    const defaultMatches = content.match(defaultSlotRegex);
    if (defaultMatches) {
      // Check if it's not a named slot
      const hasOnlyDefault = !content.match(/<slot\s+name=/);
      if (hasOnlyDefault || defaultMatches.some(m => !m.includes('name='))) {
        slots.push('(default)');
      }
    }

    // Check for named slots
    let match;
    while ((match = namedSlotRegex.exec(content)) !== null) {
      const slotName = match[1];
      if (!slots.includes(slotName)) {
        slots.push(slotName);
      }
    }

    return slots;
  }

  checkSlotUsage(storyContent, slots) {
    const demonstratedSlots = [];
    const missingSlots = [];

    for (const slot of slots) {
      if (slot === '(default)') {
        // Check for content between component tags
        // Match either self-closing tags with > or content between opening/closing tags
        const defaultUsagePattern = /<usa-[a-z-]+[^>]*>\s*(?:<[^>]+>[\s\S]*?<\/[^>]+>|[^<]+)/;
        if (storyContent.match(defaultUsagePattern)) {
          demonstratedSlots.push(slot);
        } else {
          missingSlots.push(slot);
        }
      } else {
        // Check for named slot usage: slot="slotName"
        const namedUsagePattern = new RegExp(`slot=["']${slot}["']`, 'g');
        if (storyContent.match(namedUsagePattern)) {
          demonstratedSlots.push(slot);
        } else {
          missingSlots.push(slot);
        }
      }
    }

    return {
      hasUsage: demonstratedSlots.length > 0,
      demonstratedSlots,
      missingSlots
    };
  }

  printReport() {
    console.log('\n📊 Validation Results:\n');

    // Components with slots
    const componentsWithSlots = this.results.length;
    console.log(`Found ${componentsWithSlots} component(s) with slots\n`);

    // Issues
    if (this.issues.length > 0) {
      console.log('❌ Components Missing Slot Stories:\n');
      this.issues.forEach(issue => {
        console.log(`   ${issue.component}:`);
        console.log(`      Total slots: ${issue.slots.join(', ')}`);
        console.log(`      Missing from stories: ${issue.missing.join(', ')}`);
        console.log(`      Recommendation: Add story demonstrating these slots\n`);
      });
    }

    // Successes
    if (this.successes.length > 0) {
      console.log(`\n✅ Components with Complete Slot Coverage (${this.successes.length}):\n`);
      this.successes.forEach(success => {
        console.log(`   ${success.component}: ${success.message}`);
      });
    }

    // Summary table
    console.log('\n' + '='.repeat(60));
    console.log('\n📋 Component Slot Summary:\n');

    if (this.results.length > 0) {
      console.log('Component'.padEnd(25) + 'Slots'.padEnd(20) + 'Demonstrated'.padEnd(15));
      console.log('-'.repeat(60));

      this.results.forEach(result => {
        const slotsStr = result.slots.length > 0 ? result.slots.join(', ') : 'none';
        const demonstratedStr = result.demonstratedSlots.length > 0
          ? result.demonstratedSlots.join(', ')
          : 'none';

        console.log(
          result.component.padEnd(25) +
          slotsStr.substring(0, 18).padEnd(20) +
          demonstratedStr.substring(0, 13).padEnd(15)
        );
      });
    }

    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log(`\n📈 Summary:`);
    console.log(`   Total components with slots: ${componentsWithSlots}`);
    console.log(`   ✅ Complete slot coverage: ${this.successes.length}`);
    console.log(`   ❌ Missing slot stories: ${this.issues.length}`);

    if (this.issues.length > 0) {
      console.log('\n⚠️  Some components have slots that are not demonstrated in stories.');
      console.log('   Consider adding stories to show slot usage for better documentation.\n');
    } else if (componentsWithSlots > 0) {
      console.log('\n✨ All components with slots have demonstration stories!\n');
    }
  }
}

// Run validation
const validator = new SlotStoryValidator();
validator.validateAllComponents();
