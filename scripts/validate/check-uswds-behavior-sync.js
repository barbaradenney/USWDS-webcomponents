#!/usr/bin/env node

/**
 * USWDS Behavior Sync Checker
 *
 * Compares USWDS-mirrored behavior files with actual USWDS source code
 * from GitHub to detect changes and generate sync reports.
 *
 * Generates: /tmp/uswds-sync-report.md
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// ANSI color codes
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const GREEN = '\x1b[32m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

/**
 * Find all behavior files
 */
function findBehaviorFiles() {
  const componentsDir = path.join(ROOT_DIR, 'src', 'components');
  const behaviorFiles = [];

  if (!fs.existsSync(componentsDir)) {
    return behaviorFiles;
  }

  const componentDirs = fs.readdirSync(componentsDir);

  for (const dir of componentDirs) {
    const componentPath = path.join(componentsDir, dir);
    if (!fs.statSync(componentPath).isDirectory()) continue;

    const behaviorFile = path.join(componentPath, `usa-${dir}-behavior.ts`);
    if (fs.existsSync(behaviorFile)) {
      behaviorFiles.push({
        component: dir,
        path: behaviorFile,
        content: fs.readFileSync(behaviorFile, 'utf-8'),
      });
    }
  }

  return behaviorFiles;
}

/**
 * Extract metadata from behavior file
 */
function extractMetadata(content) {
  const uswdsSourceMatch = content.match(/@uswds-source\s+(.+)/);
  const uswdsVersionMatch = content.match(/@uswds-version\s+(.+)/);
  const lastSyncedMatch = content.match(/@last-synced\s+(\d{4}-\d{2}-\d{2})/);
  const syncStatusMatch = content.match(/@sync-status\s+(.+)/);

  return {
    source: uswdsSourceMatch ? uswdsSourceMatch[1].trim() : null,
    version: uswdsVersionMatch ? uswdsVersionMatch[1].trim() : null,
    lastSynced: lastSyncedMatch ? lastSyncedMatch[1] : null,
    syncStatus: syncStatusMatch ? syncStatusMatch[1].trim() : null,
  };
}

/**
 * Fetch USWDS source from GitHub
 */
async function fetchUSWDSSource(url) {
  return new Promise((resolve, reject) => {
    // Convert GitHub URL to raw content URL
    const rawUrl = url
      .replace('github.com', 'raw.githubusercontent.com')
      .replace('/blob/', '/');

    https
      .get(rawUrl, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          resolve(data);
        });
      })
      .on('error', (err) => {
        reject(err);
      });
  });
}

/**
 * Check if behavior file needs sync
 */
async function checkBehaviorFileSync(file) {
  const metadata = extractMetadata(file.content);
  const result = {
    component: file.component,
    needsSync: false,
    reasons: [],
    metadata,
  };

  // Check if metadata is present
  if (!metadata.source) {
    result.needsSync = true;
    result.reasons.push('Missing @uswds-source metadata');
    return result;
  }

  if (!metadata.lastSynced) {
    result.needsSync = true;
    result.reasons.push('Missing @last-synced date');
    return result;
  }

  // Check sync age
  const lastSynced = new Date(metadata.lastSynced);
  const daysSinceSync = Math.floor((Date.now() - lastSynced.getTime()) / (1000 * 60 * 60 * 24));

  if (daysSinceSync > 90) {
    result.needsSync = true;
    result.reasons.push(`Last synced ${daysSinceSync} days ago (${metadata.lastSynced})`);
  }

  // Try to fetch USWDS source
  try {
    console.log(`  ${BLUE}→${RESET} Fetching USWDS source from GitHub...`);
    const uswdsSource = await fetchUSWDSSource(metadata.source);

    // Simple comparison - check if major structure changed
    // (Full diff would be complex - this is a basic check)
    const behaviorFunctions = (file.content.match(/export\s+function\s+\w+/g) || []).length;
    const uswdsFunctions = (uswdsSource.match(/export\s+function\s+\w+/g) || []).length;

    if (behaviorFunctions !== uswdsFunctions) {
      result.needsSync = true;
      result.reasons.push(
        `Function count mismatch: ${behaviorFunctions} local vs ${uswdsFunctions} USWDS`
      );
    }
  } catch (error) {
    console.log(`  ${YELLOW}⚠${RESET} Could not fetch USWDS source: ${error.message}`);
    result.reasons.push(`Unable to verify against USWDS source (${error.message})`);
  }

  return result;
}

/**
 * Generate markdown report
 */
function generateReport(results) {
  const lines = [];

  lines.push('# USWDS Behavior Sync Report');
  lines.push('');
  lines.push(`**Generated**: ${new Date().toISOString()}`);
  lines.push('');

  lines.push('## Summary');
  lines.push('');
  const needsSync = results.filter((r) => r.needsSync);
  lines.push(`- Total components with mirrored behavior: ${results.length}`);
  lines.push(`- Components in sync: ${results.length - needsSync.length}`);
  lines.push(`- Components needing sync: ${needsSync.length}`);
  lines.push('');

  if (needsSync.length === 0) {
    lines.push('## ✅ All Components In Sync');
    lines.push('');
    lines.push('All USWDS-mirrored behavior files are up to date with USWDS source.');
    lines.push('');
  } else {
    lines.push('## ⚠️ Components Needing Sync');
    lines.push('');

    for (const result of needsSync) {
      lines.push(`### ${result.component}`);
      lines.push('');
      lines.push(`**Metadata**:`);
      lines.push(`- USWDS Source: ${result.metadata.source || 'Not specified'}`);
      lines.push(`- USWDS Version: ${result.metadata.version || 'Not specified'}`);
      lines.push(`- Last Synced: ${result.metadata.lastSynced || 'Never'}`);
      lines.push(`- Sync Status: ${result.metadata.syncStatus || 'Unknown'}`);
      lines.push('');
      lines.push(`**Issues**:`);
      for (const reason of result.reasons) {
        lines.push(`- ${reason}`);
      }
      lines.push('');
    }
  }

  lines.push('## Component Details');
  lines.push('');

  for (const result of results) {
    const status = result.needsSync ? '⚠️ NEEDS SYNC' : '✅ IN SYNC';
    lines.push(`### ${result.component} - ${status}`);
    lines.push('');
    lines.push(`- USWDS Source: ${result.metadata.source || 'Not specified'}`);
    lines.push(`- USWDS Version: ${result.metadata.version || 'Not specified'}`);
    lines.push(`- Last Synced: ${result.metadata.lastSynced || 'Never'}`);
    lines.push('');
  }

  lines.push('## Next Steps');
  lines.push('');
  lines.push('For components needing sync:');
  lines.push('');
  lines.push('1. Visit the USWDS source URL');
  lines.push('2. Review changes in USWDS implementation');
  lines.push('3. Update behavior file to match USWDS source line-by-line');
  lines.push('4. Update @last-synced date');
  lines.push('5. Update @sync-status to ✅ UP TO DATE');
  lines.push('6. Run tests: `npm test -- [component].test.ts`');
  lines.push('7. Verify Cypress: `npm run cypress:run -- --spec "cypress/e2e/[component]-*.cy.ts"`');
  lines.push('');

  return lines.join('\n');
}

/**
 * Main function
 */
async function main() {
  console.log(`${BLUE}=== USWDS Behavior Sync Checker ===${RESET}\n`);

  const behaviorFiles = findBehaviorFiles();

  if (behaviorFiles.length === 0) {
    console.log(`${GREEN}✓${RESET} No USWDS-mirrored behavior files found`);
    console.log(`All components use direct USWDS integration.\n`);
    return 0;
  }

  console.log(`Found ${behaviorFiles.length} USWDS-mirrored behavior file(s)\n`);

  const results = [];

  for (const file of behaviorFiles) {
    console.log(`${BLUE}Checking:${RESET} ${file.component}`);
    const result = await checkBehaviorFileSync(file);
    results.push(result);

    if (result.needsSync) {
      console.log(`  ${YELLOW}⚠ Needs sync:${RESET}`);
      for (const reason of result.reasons) {
        console.log(`    • ${reason}`);
      }
    } else {
      console.log(`  ${GREEN}✓ In sync${RESET}`);
    }
    console.log();
  }

  // Generate report
  const report = generateReport(results);
  const reportPath = '/tmp/uswds-sync-report.md';
  fs.writeFileSync(reportPath, report);

  console.log(`${BLUE}=== Summary ===${RESET}`);
  const needsSync = results.filter((r) => r.needsSync);
  console.log(`Components checked: ${results.length}`);
  console.log(
    `In sync: ${needsSync.length === 0 ? GREEN : RESET}${results.length - needsSync.length}${RESET}`
  );
  console.log(`Needs sync: ${needsSync.length > 0 ? YELLOW : RESET}${needsSync.length}${RESET}\n`);

  console.log(`${BLUE}Report saved:${RESET} ${reportPath}\n`);

  if (needsSync.length > 0) {
    console.log(`${YELLOW}Action required:${RESET}`);
    console.log(`Review ${reportPath} and update behavior files as needed.\n`);
  } else {
    console.log(`${GREEN}✓ All components in sync with USWDS source${RESET}\n`);
  }

  return 0;
}

// Run checker
main().catch((error) => {
  console.error(`${RED}Error:${RESET}`, error);
  process.exit(1);
});
