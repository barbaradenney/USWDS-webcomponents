#!/usr/bin/env node

/**
 * Accessibility Report Generator
 *
 * Generates comprehensive accessibility reports using axe-core and Playwright.
 * Tests all Storybook components and creates detailed HTML/JSON reports.
 *
 * Usage:
 *   node scripts/test/generate-accessibility-report.js
 */

const { chromium } = require('playwright');
const { injectAxe, checkA11y, getViolations } = require('axe-playwright');
const fs = require('fs');
const path = require('path');

// Configuration
const STORYBOOK_URL = process.env.STORYBOOK_URL || 'http://localhost:6006';
const REPORT_DIR = path.join(__dirname, '../../reports/accessibility');
const HTML_REPORT = path.join(REPORT_DIR, 'accessibility-report.html');
const JSON_REPORT = path.join(REPORT_DIR, 'accessibility-results.json');

// Ensure report directory exists
if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

// ANSI colors
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';

async function generateAccessibilityReport() {
  console.log('\n' + BOLD + BLUE + '♿ Accessibility Report Generator' + RESET);
  console.log(BLUE + '═'.repeat(80) + RESET + '\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const allResults = [];
  let totalViolations = 0;
  let totalPasses = 0;
  let totalComponents = 0;

  try {
    // Navigate to Storybook
    console.log(`📖 Connecting to Storybook: ${STORYBOOK_URL}`);
    await page.goto(STORYBOOK_URL, { waitUntil: 'networkidle', timeout: 30000 });

    // Get all stories from Storybook
    const stories = await page.evaluate(() => {
      const iframe = document.querySelector('#storybook-preview-iframe');
      if (!iframe) return [];

      // Get all stories from the sidebar
      const storyLinks = Array.from(document.querySelectorAll('[data-item-id]'));
      return storyLinks
        .filter(link => !link.getAttribute('data-item-id').includes('--docs'))
        .map(link => ({
          id: link.getAttribute('data-item-id'),
          title: link.textContent.trim()
        }));
    });

    console.log(`\n✅ Found ${stories.length} component stories\n`);

    // Test each story
    for (const story of stories) {
      totalComponents++;
      console.log(`\n${BOLD}Testing: ${story.title}${RESET}`);
      console.log(`Story ID: ${story.id}`);

      try {
        // Navigate to story
        const storyUrl = `${STORYBOOK_URL}/iframe.html?id=${story.id}&viewMode=story`;
        await page.goto(storyUrl, { waitUntil: 'networkidle', timeout: 15000 });

        // Wait for component to render
        await page.waitForTimeout(1000);

        // Inject axe-core
        await injectAxe(page);

        // Run accessibility checks
        const results = await checkA11y(page, null, {
          detailedReport: true,
          detailedReportOptions: {
            html: true
          }
        });

        const violations = await getViolations(page);

        const componentResult = {
          story: story.title,
          storyId: story.id,
          violations: violations.length,
          passes: results ? results.passes?.length || 0 : 0,
          issues: violations.map(v => ({
            id: v.id,
            impact: v.impact,
            description: v.description,
            help: v.help,
            helpUrl: v.helpUrl,
            nodes: v.nodes.length,
            tags: v.tags
          }))
        };

        allResults.push(componentResult);
        totalViolations += violations.length;
        totalPasses += componentResult.passes;

        if (violations.length === 0) {
          console.log(`  ${GREEN}✅ No violations${RESET}`);
        } else {
          console.log(`  ${RED}❌ ${violations.length} violation(s)${RESET}`);
          violations.forEach(v => {
            console.log(`     ${YELLOW}▸${RESET} ${v.impact?.toUpperCase() || 'UNKNOWN'}: ${v.description}`);
          });
        }
      } catch (error) {
        console.log(`  ${RED}❌ Error testing story: ${error.message}${RESET}`);
        allResults.push({
          story: story.title,
          storyId: story.id,
          error: error.message,
          violations: 0,
          passes: 0,
          issues: []
        });
      }
    }

  } catch (error) {
    console.error(`${RED}Error during testing: ${error.message}${RESET}`);
    throw error;
  } finally {
    await browser.close();
  }

  // Generate reports
  console.log('\n' + BLUE + '═'.repeat(80) + RESET);
  console.log(BOLD + '📊 Generating Reports' + RESET + '\n');

  // Save JSON report
  fs.writeFileSync(JSON_REPORT, JSON.stringify({
    summary: {
      totalComponents,
      totalViolations,
      totalPasses,
      timestamp: new Date().toISOString()
    },
    results: allResults
  }, null, 2));

  console.log(`${GREEN}✅${RESET} JSON report: ${JSON_REPORT}`);

  // Generate HTML report
  const htmlReport = generateHTMLReport(allResults, { totalComponents, totalViolations, totalPasses });
  fs.writeFileSync(HTML_REPORT, htmlReport);

  console.log(`${GREEN}✅${RESET} HTML report: ${HTML_REPORT}`);

  // Summary
  console.log('\n' + BLUE + '═'.repeat(80) + RESET);
  console.log(BOLD + '📈 Summary' + RESET + '\n');
  console.log(`  Total Components: ${totalComponents}`);
  console.log(`  Total Passes: ${GREEN}${totalPasses}${RESET}`);
  console.log(`  Total Violations: ${totalViolations > 0 ? RED : GREEN}${totalViolations}${RESET}`);

  const componentsWithViolations = allResults.filter(r => r.violations > 0).length;
  console.log(`  Components with Violations: ${componentsWithViolations > 0 ? RED : GREEN}${componentsWithViolations}${RESET}`);

  console.log('\n' + BLUE + '═'.repeat(80) + RESET + '\n');

  // Exit with error if violations found
  if (totalViolations > 0) {
    console.log(`${YELLOW}⚠️  Accessibility violations detected!${RESET}`);
    console.log(`   Review the HTML report for details: ${HTML_REPORT}\n`);
    process.exit(1);
  } else {
    console.log(`${GREEN}✅ No accessibility violations detected!${RESET}\n`);
  }
}

function generateHTMLReport(results, summary) {
  const violationsHTML = results
    .filter(r => r.violations > 0)
    .map(r => `
      <div class="component">
        <h3>${r.story}</h3>
        <div class="stats">
          <span class="violations">${r.violations} violation(s)</span>
          <span class="passes">${r.passes} passes</span>
        </div>
        ${r.issues.map(issue => `
          <div class="issue ${issue.impact}">
            <div class="issue-header">
              <span class="impact">${issue.impact?.toUpperCase() || 'UNKNOWN'}</span>
              <span class="id">${issue.id}</span>
            </div>
            <div class="description">${issue.description}</div>
            <div class="help">
              <strong>How to fix:</strong> ${issue.help}
              <a href="${issue.helpUrl}" target="_blank" class="more-info">Learn more →</a>
            </div>
            <div class="meta">
              <span>${issue.nodes} affected element(s)</span>
              <span class="tags">${issue.tags.join(', ')}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `).join('');

  const passesHTML = results
    .filter(r => r.violations === 0 && !r.error)
    .map(r => `
      <div class="pass-item">
        <span class="pass-icon">✅</span>
        <span class="pass-name">${r.story}</span>
        <span class="pass-count">${r.passes} checks passed</span>
      </div>
    `).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accessibility Report - USWDS Web Components</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f5f5;
      padding: 2rem;
      line-height: 1.6;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    header {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }
    h1 { color: #1a1a1a; margin-bottom: 0.5rem; }
    .timestamp { color: #666; font-size: 0.9rem; }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .summary-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .summary-card h3 { font-size: 0.9rem; color: #666; margin-bottom: 0.5rem; }
    .summary-card .value { font-size: 2rem; font-weight: bold; }
    .summary-card.violations .value { color: #d32f2f; }
    .summary-card.passes .value { color: #388e3c; }
    .component {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 1.5rem;
    }
    .component h3 { color: #1a1a1a; margin-bottom: 1rem; }
    .stats {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      font-size: 0.9rem;
    }
    .stats .violations { color: #d32f2f; font-weight: 600; }
    .stats .passes { color: #388e3c; }
    .issue {
      border-left: 4px solid #ccc;
      padding: 1rem;
      margin-bottom: 1rem;
      background: #fafafa;
    }
    .issue.critical { border-left-color: #d32f2f; background: #ffebee; }
    .issue.serious { border-left-color: #f57c00; background: #fff3e0; }
    .issue.moderate { border-left-color: #fbc02d; background: #fffde7; }
    .issue.minor { border-left-color: #1976d2; background: #e3f2fd; }
    .issue-header {
      display: flex;
      gap: 1rem;
      margin-bottom: 0.5rem;
      align-items: center;
    }
    .impact {
      font-weight: bold;
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      background: #333;
      color: white;
    }
    .issue.critical .impact { background: #d32f2f; }
    .issue.serious .impact { background: #f57c00; }
    .issue.moderate .impact { background: #fbc02d; color: #333; }
    .issue.minor .impact { background: #1976d2; }
    .id { font-family: monospace; font-size: 0.85rem; color: #666; }
    .description { margin-bottom: 0.5rem; font-weight: 500; }
    .help { margin: 0.5rem 0; padding: 0.75rem; background: white; border-radius: 4px; }
    .more-info {
      color: #1976d2;
      text-decoration: none;
      margin-left: 0.5rem;
    }
    .more-info:hover { text-decoration: underline; }
    .meta {
      display: flex;
      gap: 1rem;
      margin-top: 0.5rem;
      font-size: 0.85rem;
      color: #666;
    }
    .tags { font-style: italic; }
    .passes-section {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-top: 2rem;
    }
    .passes-section h2 { margin-bottom: 1rem; color: #388e3c; }
    .pass-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.5rem;
      border-bottom: 1px solid #eee;
    }
    .pass-item:last-child { border-bottom: none; }
    .pass-name { flex: 1; }
    .pass-count { color: #666; font-size: 0.9rem; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>♿ Accessibility Report</h1>
      <p class="timestamp">Generated: ${new Date().toLocaleString()}</p>
    </header>

    <div class="summary">
      <div class="summary-card">
        <h3>Total Components</h3>
        <div class="value">${summary.totalComponents}</div>
      </div>
      <div class="summary-card violations">
        <h3>Total Violations</h3>
        <div class="value">${summary.totalViolations}</div>
      </div>
      <div class="summary-card passes">
        <h3>Total Passes</h3>
        <div class="value">${summary.totalPasses}</div>
      </div>
      <div class="summary-card">
        <h3>Components with Issues</h3>
        <div class="value">${results.filter(r => r.violations > 0).length}</div>
      </div>
    </div>

    ${summary.totalViolations > 0 ? `
      <h2 style="margin-bottom: 1rem; color: #d32f2f;">❌ Components with Violations</h2>
      ${violationsHTML}
    ` : ''}

    <div class="passes-section">
      <h2>✅ Components Passing All Checks</h2>
      ${passesHTML || '<p>No components passed all checks.</p>'}
    </div>
  </div>
</body>
</html>
  `;
}

// Run the report generator
generateAccessibilityReport().catch(error => {
  console.error(`${RED}Fatal error: ${error.message}${RESET}`);
  process.exit(1);
});
