#!/usr/bin/env node
/* eslint-disable */

/**
 * Interactive API Documentation Generator
 * 
 * Generates comprehensive, interactive API documentation for USWDS components
 * with live examples, code snippets, and accessibility testing.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Interactive documentation template
const interactiveDocTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{COMPONENT_TITLE}} - USWDS Web Components API</title>
  
  <!-- USWDS Styles -->
  <link rel="stylesheet" href="../src/styles/styles.css">
  
  <!-- Documentation Styles -->
  <link rel="stylesheet" href="./assets/docs.css">
  
  <!-- Syntax Highlighting -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
  
  <!-- Component -->
  <script type="module" src="../src/components/{{COMPONENT_NAME}}/index.ts"></script>
</head>
<body class="docs-page">
  <header class="usa-header usa-header--basic docs-header">
    <div class="usa-nav-container">
      <div class="usa-navbar">
        <div class="usa-logo">
          <em class="usa-logo__text">
            <a href="../docs/index.html" title="USWDS Web Components">USWDS Web Components</a>
          </em>
        </div>
      </div>
    </div>
  </header>

  <main class="docs-main">
    <div class="grid-container">
      <div class="grid-row">
        <!-- Navigation Sidebar -->
        <aside class="grid-col-3 docs-sidebar">
          <nav class="docs-nav">
            <h3>Components</h3>
            <ul class="usa-sidenav">
              {{COMPONENT_NAVIGATION}}
            </ul>
          </nav>
        </aside>

        <!-- Main Content -->
        <div class="grid-col-9 docs-content">
          <div class="docs-component-header">
            <h1>{{COMPONENT_TITLE}}</h1>
            <p class="docs-description">{{COMPONENT_DESCRIPTION}}</p>
            
            <div class="docs-badges">
              <span class="usa-tag">USWDS Compliant</span>
              <span class="usa-tag usa-tag--accent-cool">TypeScript</span>
              <span class="usa-tag usa-tag--accent-warm">Accessible</span>
              {{COMPONENT_BADGES}}
            </div>
          </div>

          <!-- Live Example -->
          <section class="docs-section">
            <h2>Live Example</h2>
            <div class="docs-example">
              <div class="docs-example-demo">
                {{LIVE_EXAMPLE}}
              </div>
              <div class="docs-example-controls">
                <h4>Customize Example</h4>
                {{INTERACTIVE_CONTROLS}}
              </div>
            </div>
          </section>

          <!-- Code Examples -->
          <section class="docs-section">
            <h2>Code Examples</h2>
            
            <div class="docs-tabs">
              <button class="docs-tab active" data-tab="html">HTML</button>
              <button class="docs-tab" data-tab="typescript">TypeScript</button>
              <button class="docs-tab" data-tab="react">React</button>
            </div>

            <div class="docs-tab-content active" data-tab="html">
              <pre><code class="language-html">{{HTML_EXAMPLE}}</code></pre>
            </div>

            <div class="docs-tab-content" data-tab="typescript">
              <pre><code class="language-typescript">{{TYPESCRIPT_EXAMPLE}}</code></pre>
            </div>

            <div class="docs-tab-content" data-tab="react">
              <pre><code class="language-tsx">{{REACT_EXAMPLE}}</code></pre>
            </div>
          </section>

          <!-- API Reference -->
          <section class="docs-section">
            <h2>API Reference</h2>
            
            <!-- Properties -->
            <div class="docs-api-section">
              <h3>Properties</h3>
              <div class="docs-table-container">
                <table class="usa-table usa-table--striped">
                  <thead>
                    <tr>
                      <th>Property</th>
                      <th>Type</th>
                      <th>Default</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {{PROPERTIES_TABLE}}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Events -->
            <div class="docs-api-section">
              <h3>Events</h3>
              <div class="docs-table-container">
                <table class="usa-table usa-table--striped">
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>Detail Type</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {{EVENTS_TABLE}}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- CSS Custom Properties -->
            <div class="docs-api-section">
              <h3>CSS Custom Properties</h3>
              <div class="docs-table-container">
                <table class="usa-table usa-table--striped">
                  <thead>
                    <tr>
                      <th>Property</th>
                      <th>Description</th>
                      <th>Default</th>
                    </tr>
                  </thead>
                  <tbody>
                    {{CSS_PROPERTIES_TABLE}}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <!-- Accessibility -->
          <section class="docs-section">
            <h2>Accessibility</h2>
            
            <div class="docs-accessibility">
              <div class="docs-accessibility-features">
                <h3>Accessibility Features</h3>
                <ul class="usa-list">
                  {{ACCESSIBILITY_FEATURES}}
                </ul>
              </div>

              <div class="docs-accessibility-test">
                <h3>Live Accessibility Test</h3>
                <button class="usa-button" id="accessibility-test-btn">
                  Run Accessibility Test
                </button>
                <div id="accessibility-results" class="docs-test-results"></div>
              </div>

              <div class="docs-keyboard-nav">
                <h3>Keyboard Navigation</h3>
                <div class="docs-keyboard-table">
                  <table class="usa-table">
                    <thead>
                      <tr>
                        <th>Key</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {{KEYBOARD_NAVIGATION_TABLE}}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          <!-- Usage Guidelines -->
          <section class="docs-section">
            <h2>Usage Guidelines</h2>
            
            <div class="docs-guidelines">
              <div class="docs-do-dont">
                <div class="docs-do">
                  <h4>✅ Do</h4>
                  <ul class="usa-list">
                    {{DO_GUIDELINES}}
                  </ul>
                </div>
                <div class="docs-dont">
                  <h4>❌ Don't</h4>
                  <ul class="usa-list">
                    {{DONT_GUIDELINES}}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <!-- USWDS Links -->
          <section class="docs-section">
            <h2>USWDS Documentation</h2>
            <div class="docs-uswds-links">
              <a href="https://designsystem.digital.gov/components/{{COMPONENT_NAME}}/" class="usa-button usa-button--outline">
                Component Documentation
              </a>
              <a href="https://designsystem.digital.gov/components/{{COMPONENT_NAME}}/#guidance" class="usa-button usa-button--outline">
                Design Guidance
              </a>
              <a href="https://designsystem.digital.gov/components/{{COMPONENT_NAME}}/#accessibility" class="usa-button usa-button--outline">
                Accessibility Guide
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  </main>

  <footer class="usa-footer usa-footer--slim docs-footer">
    <div class="grid-container usa-footer__return-to-top">
      <a href="#top">Return to top</a>
    </div>
  </footer>

  <!-- Interactive Documentation Scripts -->
  <script src="./assets/docs.js"></script>
  <script>
    // Component-specific interactive features
    document.addEventListener('DOMContentLoaded', () => {
      // Initialize syntax highlighting
      hljs.highlightAll();
      
      // Initialize interactive controls
      initializeInteractiveControls('{{COMPONENT_NAME}}');
      
      // Initialize accessibility testing
      initializeAccessibilityTesting();
      
      // Initialize tab switching
      initializeTabSwitching();
    });
  </script>
</body>
</html>`;

// Documentation CSS
const docsCSSTemplate = `/* Interactive Documentation Styles */

:root {
  --docs-primary: #1b1b1b;
  --docs-secondary: #71767a;
  --docs-accent: #005ea2;
  --docs-background: #ffffff;
  --docs-border: #dfe1e2;
  --docs-code-background: #f6f8fa;
  --docs-success: #00a91c;
  --docs-warning: #ffbe2e;
  --docs-error: #d63384;
}

.docs-page {
  font-family: 'Source Sans Pro', system-ui, sans-serif;
  line-height: 1.6;
}

.docs-header {
  border-bottom: 1px solid var(--docs-border);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.docs-main {
  min-height: 80vh;
  padding: 2rem 0;
}

.docs-sidebar {
  background: #f8f9fa;
  border-right: 1px solid var(--docs-border);
  min-height: 80vh;
  padding: 1.5rem;
}

.docs-nav h3 {
  margin-top: 0;
  color: var(--docs-primary);
  font-size: 1.125rem;
  font-weight: 600;
}

.docs-content {
  padding: 0 2rem;
}

.docs-component-header {
  border-bottom: 1px solid var(--docs-border);
  padding-bottom: 2rem;
  margin-bottom: 3rem;
}

.docs-component-header h1 {
  margin: 0 0 1rem 0;
  color: var(--docs-primary);
  font-size: 2.5rem;
  font-weight: 700;
}

.docs-description {
  font-size: 1.25rem;
  color: var(--docs-secondary);
  margin-bottom: 1.5rem;
}

.docs-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.docs-section {
  margin-bottom: 4rem;
}

.docs-section h2 {
  color: var(--docs-primary);
  font-size: 1.875rem;
  font-weight: 600;
  margin: 0 0 1.5rem 0;
  border-bottom: 2px solid var(--docs-accent);
  padding-bottom: 0.5rem;
}

/* Live Example Styles */
.docs-example {
  border: 1px solid var(--docs-border);
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.docs-example-demo {
  padding: 2rem;
  border-bottom: 1px solid var(--docs-border);
  background: #fafafa;
}

.docs-example-controls {
  padding: 1.5rem;
  background: white;
}

.docs-example-controls h4 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
}

.docs-control {
  margin-bottom: 1rem;
}

.docs-control label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 500;
  font-size: 0.875rem;
}

.docs-control input,
.docs-control select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--docs-border);
  border-radius: 4px;
}

/* Code Examples */
.docs-tabs {
  display: flex;
  border-bottom: 1px solid var(--docs-border);
  margin-bottom: 1rem;
}

.docs-tab {
  background: none;
  border: none;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  font-weight: 500;
  color: var(--docs-secondary);
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
}

.docs-tab:hover {
  color: var(--docs-accent);
}

.docs-tab.active {
  color: var(--docs-accent);
  border-bottom-color: var(--docs-accent);
}

.docs-tab-content {
  display: none;
}

.docs-tab-content.active {
  display: block;
}

.docs-tab-content pre {
  background: var(--docs-code-background);
  border: 1px solid var(--docs-border);
  border-radius: 6px;
  padding: 1rem;
  overflow-x: auto;
  margin: 0;
}

.docs-tab-content code {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 0.875rem;
  line-height: 1.45;
}

/* API Tables */
.docs-table-container {
  overflow-x: auto;
  margin: 1rem 0;
}

.docs-api-section {
  margin-bottom: 2rem;
}

.docs-api-section h3 {
  color: var(--docs-primary);
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
}

/* Accessibility Section */
.docs-accessibility {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 1rem;
}

.docs-accessibility-test {
  border: 1px solid var(--docs-border);
  border-radius: 6px;
  padding: 1.5rem;
  background: #f8f9fa;
}

.docs-test-results {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 4px;
  background: white;
  border: 1px solid var(--docs-border);
  min-height: 100px;
  font-family: monospace;
  font-size: 0.875rem;
}

.docs-test-results.success {
  border-color: var(--docs-success);
  background: #f0f9ff;
}

.docs-test-results.error {
  border-color: var(--docs-error);
  background: #fef2f2;
}

/* Guidelines */
.docs-do-dont {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 1rem;
}

.docs-do,
.docs-dont {
  border: 1px solid var(--docs-border);
  border-radius: 6px;
  padding: 1.5rem;
}

.docs-do {
  border-left: 4px solid var(--docs-success);
}

.docs-dont {
  border-left: 4px solid var(--docs-error);
}

.docs-do h4,
.docs-dont h4 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
}

/* USWDS Links */
.docs-uswds-links {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

/* Footer */
.docs-footer {
  margin-top: 4rem;
  border-top: 1px solid var(--docs-border);
}

/* Responsive Design */
@media (max-width: 768px) {
  .docs-main .grid-row {
    flex-direction: column;
  }
  
  .docs-sidebar {
    min-height: auto;
    border-right: none;
    border-bottom: 1px solid var(--docs-border);
  }
  
  .docs-content {
    padding: 2rem 1rem;
  }
  
  .docs-accessibility,
  .docs-do-dont {
    grid-template-columns: 1fr;
  }
}`;

// Interactive documentation JavaScript
const docsJSTemplate = `/**
 * Interactive Documentation JavaScript
 * Provides live examples, accessibility testing, and interactive controls
 */

// Global state for interactive controls
let currentComponent = null;
let currentInstance = null;

/**
 * Initialize interactive controls for a component
 */
function initializeInteractiveControls(componentName) {
  currentComponent = componentName;
  currentInstance = document.querySelector(\`usa-\${componentName}\`);
  
  if (!currentInstance) {
    console.warn(\`Component usa-\${componentName} not found for interactive controls\`);
    return;
  }

  // Set up property controls
  setupPropertyControls();
  
  // Set up event monitoring
  setupEventMonitoring();
  
  // Set up live code updates
  setupLiveCodeUpdates();
}

/**
 * Set up property controls based on component definition
 */
function setupPropertyControls() {
  const controls = document.querySelectorAll('.docs-control input, .docs-control select');
  
  controls.forEach(control => {
    const property = control.dataset.property;
    if (!property) return;
    
    // Set initial value
    if (control.type === 'checkbox') {
      control.checked = currentInstance[property] || false;
    } else {
      control.value = currentInstance[property] || '';
    }
    
    // Listen for changes
    control.addEventListener('change', (e) => {
      updateComponentProperty(property, e.target.value, e.target.type === 'checkbox' ? e.target.checked : e.target.value);
    });
  });
}

/**
 * Update component property and refresh example
 */
function updateComponentProperty(property, value, actualValue) {
  if (!currentInstance) return;
  
  try {
    if (typeof actualValue === 'boolean') {
      currentInstance[property] = actualValue;
    } else if (typeof currentInstance[property] === 'number') {
      currentInstance[property] = Number(value);
    } else {
      currentInstance[property] = value;
    }
    
    // Update code examples
    updateCodeExamples();
    
    // Log change for debugging
    console.log(\`Updated \${property} to:\`, actualValue || value);
    
  } catch (error) {
    console.error(\`Error updating property \${property}:\`, error);
  }
}

/**
 * Set up event monitoring to show events in real-time
 */
function setupEventMonitoring() {
  if (!currentInstance) return;
  
  const eventLog = createEventLog();
  
  // Monitor common events
  const eventsToMonitor = ['change', 'input', 'click', 'focus', 'blur', 'select'];
  
  eventsToMonitor.forEach(eventType => {
    currentInstance.addEventListener(eventType, (e) => {
      logEvent(eventLog, eventType, e);
    });
  });
}

/**
 * Create event log display
 */
function createEventLog() {
  const existingLog = document.getElementById('event-log');
  if (existingLog) return existingLog;
  
  const logContainer = document.createElement('div');
  logContainer.className = 'docs-event-log';
  logContainer.innerHTML = \`
    <h4>Event Log</h4>
    <div id="event-log" class="docs-event-display"></div>
    <button type="button" class="usa-button usa-button--outline usa-button--small" onclick="clearEventLog()">
      Clear Log
    </button>
  \`;
  
  const controlsSection = document.querySelector('.docs-example-controls');
  if (controlsSection) {
    controlsSection.appendChild(logContainer);
  }
  
  return document.getElementById('event-log');
}

/**
 * Log an event to the event display
 */
function logEvent(logElement, eventType, event) {
  const timestamp = new Date().toLocaleTimeString();
  const detail = event.detail ? JSON.stringify(event.detail) : '';
  
  const logEntry = document.createElement('div');
  logEntry.className = 'docs-event-entry';
  logEntry.innerHTML = \`
    <span class="docs-event-time">\${timestamp}</span>
    <span class="docs-event-type">\${eventType}</span>
    \${detail ? \`<span class="docs-event-detail">\${detail}</span>\` : ''}
  \`;
  
  logElement.insertBefore(logEntry, logElement.firstChild);
  
  // Keep only last 10 events
  while (logElement.children.length > 10) {
    logElement.removeChild(logElement.lastChild);
  }
}

/**
 * Clear event log
 */
function clearEventLog() {
  const logElement = document.getElementById('event-log');
  if (logElement) {
    logElement.innerHTML = '';
  }
}

/**
 * Update code examples based on current component state
 */
function updateCodeExamples() {
  updateHTMLExample();
  updateTypeScriptExample();
  updateReactExample();
}

/**
 * Update HTML code example
 */
function updateHTMLExample() {
  const htmlTab = document.querySelector('[data-tab="html"] code');
  if (!htmlTab || !currentInstance) return;
  
  const attributes = [];
  
  // Collect current attributes
  for (const attr of currentInstance.attributes) {
    if (attr.name !== 'class' && attr.name !== 'id') {
      attributes.push(\`\${attr.name}="\${attr.value}"\`);
    }
  }
  
  const attributeString = attributes.length > 0 ? ' ' + attributes.join(' ') : '';
  const content = currentInstance.textContent || currentInstance.innerHTML;
  
  const htmlExample = \`<usa-\${currentComponent}\${attributeString}>
  \${content}
</usa-\${currentComponent}>\`;
  
  htmlTab.textContent = htmlExample;
  hljs.highlightElement(htmlTab);
}

/**
 * Update TypeScript code example
 */
function updateTypeScriptExample() {
  const tsTab = document.querySelector('[data-tab="typescript"] code');
  if (!tsTab || !currentInstance) return;
  
  const className = currentComponent.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('');
  
  const tsExample = \`import { USA\${className} } from '@your-org/uswds-web-components';

const \${currentComponent.replace(/-([a-z])/g, (g) => g[1].toUpperCase())} = document.querySelector('usa-\${currentComponent}') as USA\${className};

// Set properties
\${Object.entries(currentInstance).filter(([key]) => !key.startsWith('_')).map(([key, value]) => 
  \`\${currentComponent.replace(/-([a-z])/g, (g) => g[1].toUpperCase())}.\${key} = \${JSON.stringify(value)};\`
).join('\\n')}

// Listen for events
\${currentComponent.replace(/-([a-z])/g, (g) => g[1].toUpperCase())}.addEventListener('change', (event) => {
  console.log('Component changed:', event.detail);
});\`;
  
  tsTab.textContent = tsExample;
  hljs.highlightElement(tsTab);
}

/**
 * Update React code example
 */
function updateReactExample() {
  const reactTab = document.querySelector('[data-tab="react"] code');
  if (!reactTab || !currentInstance) return;
  
  const className = currentComponent.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('');
  
  const reactExample = \`import React, { useRef, useEffect } from 'react';
import '@your-org/uswds-web-components';

function \${className}Example() {
  const componentRef = useRef<any>(null);
  
  useEffect(() => {
    const component = componentRef.current;
    if (component) {
      component.addEventListener('change', handleChange);
      return () => component.removeEventListener('change', handleChange);
    }
  }, []);
  
  const handleChange = (event: CustomEvent) => {
    console.log('Component changed:', event.detail);
  };
  
  return (
    <usa-\${currentComponent}
      ref={componentRef}
\${Object.entries(currentInstance).filter(([key]) => !key.startsWith('_')).map(([key, value]) => 
  \`      \${key}={\${JSON.stringify(value)}}\`
).join('\\n')}
    >
      \${currentInstance.textContent || 'Component Content'}
    </usa-\${currentComponent}>
  );
}\`;
  
  reactTab.textContent = reactExample;
  hljs.highlightElement(reactTab);
}

/**
 * Set up live code updates
 */
function setupLiveCodeUpdates() {
  // Update examples immediately
  updateCodeExamples();
  
  // Set up mutation observer to watch for changes
  const observer = new MutationObserver(() => {
    updateCodeExamples();
  });
  
  if (currentInstance) {
    observer.observe(currentInstance, {
      attributes: true,
      attributeOldValue: true,
      childList: true,
      subtree: true
    });
  }
}

/**
 * Initialize accessibility testing
 */
function initializeAccessibilityTesting() {
  const testButton = document.getElementById('accessibility-test-btn');
  const resultsDiv = document.getElementById('accessibility-results');
  
  if (!testButton || !resultsDiv) return;
  
  testButton.addEventListener('click', async () => {
    testButton.disabled = true;
    testButton.textContent = 'Running Test...';
    resultsDiv.innerHTML = 'Running accessibility analysis...';
    resultsDiv.className = 'docs-test-results';
    
    try {
      const results = await runAccessibilityTest();
      displayAccessibilityResults(results, resultsDiv);
    } catch (error) {
      resultsDiv.innerHTML = \`Error running accessibility test: \${error.message}\`;
      resultsDiv.className = 'docs-test-results error';
    } finally {
      testButton.disabled = false;
      testButton.textContent = 'Run Accessibility Test';
    }
  });
}

/**
 * Run accessibility test using axe-core (if available)
 */
async function runAccessibilityTest() {
  // Check if axe is available
  if (typeof axe === 'undefined') {
    throw new Error('axe-core is not loaded. Please include the axe-core library for accessibility testing.');
  }
  
  const results = await axe.run(currentInstance || document.querySelector('.docs-example-demo'));
  return results;
}

/**
 * Display accessibility test results
 */
function displayAccessibilityResults(results, resultsDiv) {
  const violations = results.violations || [];
  const passes = results.passes || [];
  
  if (violations.length === 0) {
    resultsDiv.innerHTML = \`
      <div style="color: var(--docs-success); font-weight: bold;">✅ Accessibility Test Passed</div>
      <div>No violations found (\${passes.length} checks passed)</div>
    \`;
    resultsDiv.className = 'docs-test-results success';
  } else {
    resultsDiv.innerHTML = \`
      <div style="color: var(--docs-error); font-weight: bold;">❌ Accessibility Issues Found</div>
      <div>\${violations.length} violation(s), \${passes.length} checks passed</div>
      <details style="margin-top: 1rem;">
        <summary>View Details</summary>
        <ul style="margin: 0.5rem 0; padding-left: 1rem;">
          \${violations.map(v => \`<li><strong>\${v.impact}:</strong> \${v.description}</li>\`).join('')}
        </ul>
      </details>
    \`;
    resultsDiv.className = 'docs-test-results error';
  }
}

/**
 * Initialize tab switching
 */
function initializeTabSwitching() {
  const tabs = document.querySelectorAll('.docs-tab');
  const tabContents = document.querySelectorAll('.docs-tab-content');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;
      
      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Update active content
      tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.dataset.tab === targetTab) {
          content.classList.add('active');
        }
      });
    });
  });
}`;

/**
 * Generate interactive documentation for a component
 */
function generateComponentDocs(componentName) {
  const componentDir = join(process.cwd(), 'src', 'components', componentName);
  const docsDir = join(process.cwd(), 'docs', 'components');
  const assetsDir = join(process.cwd(), 'docs', 'assets');
  
  // Create directories
  [docsDir, assetsDir].forEach(dir => {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  });
  
  // Check if component exists
  if (!existsSync(componentDir)) {
    console.error(`❌ Component ${componentName} not found at ${componentDir}`);
    return false;
  }
  
  // Read component information
  const componentInfo = extractComponentInfo(componentDir, componentName);
  
  // Generate documentation
  const docHTML = generateDocumentationHTML(componentInfo);
  
  // Write files
  writeFileSync(join(docsDir, `${componentName}.html`), docHTML);
  
  // Write assets if they don't exist
  if (!existsSync(join(assetsDir, 'docs.css'))) {
    writeFileSync(join(assetsDir, 'docs.css'), docsCSSTemplate);
  }
  
  if (!existsSync(join(assetsDir, 'docs.js'))) {
    writeFileSync(join(assetsDir, 'docs.js'), docsJSTemplate);
  }
  
  console.log(`✅ Generated interactive documentation for ${componentName}`);
  console.log(`   📄 ${docsDir}/${componentName}.html`);
  
  return true;
}

/**
 * Extract component information from source files
 */
function extractComponentInfo(componentDir, componentName) {
  const componentFile = join(componentDir, `usa-${componentName}.ts`);
  const readmeFile = join(componentDir, 'README.md');
  
  const info = {
    name: componentName,
    title: componentName.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' '),
    description: 'A USWDS-compliant web component.',
    properties: [],
    events: [],
    examples: {},
    accessibility: [],
    guidelines: { do: [], dont: [] }
  };
  
  // Extract from TypeScript file
  if (existsSync(componentFile)) {
    const content = readFileSync(componentFile, 'utf8');
    info.properties = extractProperties(content);
    info.events = extractEvents(content);
    info.description = extractDescription(content) || info.description;
  }
  
  // Extract from README
  if (existsSync(readmeFile)) {
    const readmeContent = readFileSync(readmeFile, 'utf8');
    info.accessibility = extractAccessibilityFeatures(readmeContent);
    info.guidelines = extractGuidelines(readmeContent);
  }
  
  return info;
}

/**
 * Generate HTML documentation from component info
 */
function generateDocumentationHTML(info) {
  const replacements = {
    '{{COMPONENT_NAME}}': info.name,
    '{{COMPONENT_TITLE}}': info.title,
    '{{COMPONENT_DESCRIPTION}}': info.description,
    '{{COMPONENT_NAVIGATION}}': generateComponentNavigation(),
    '{{COMPONENT_BADGES}}': generateComponentBadges(info),
    '{{LIVE_EXAMPLE}}': generateLiveExample(info),
    '{{INTERACTIVE_CONTROLS}}': generateInteractiveControls(info),
    '{{HTML_EXAMPLE}}': generateHTMLExample(info),
    '{{TYPESCRIPT_EXAMPLE}}': generateTypeScriptExample(info),
    '{{REACT_EXAMPLE}}': generateReactExample(info),
    '{{PROPERTIES_TABLE}}': generatePropertiesTable(info.properties),
    '{{EVENTS_TABLE}}': generateEventsTable(info.events),
    '{{CSS_PROPERTIES_TABLE}}': generateCSSPropertiesTable(info),
    '{{ACCESSIBILITY_FEATURES}}': generateAccessibilityFeatures(info.accessibility),
    '{{KEYBOARD_NAVIGATION_TABLE}}': generateKeyboardNavigationTable(info),
    '{{DO_GUIDELINES}}': generateGuidelinesList(info.guidelines.do),
    '{{DONT_GUIDELINES}}': generateGuidelinesList(info.guidelines.dont),
  };
  
  return Object.entries(replacements).reduce((html, [key, value]) => {
    return html.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
  }, interactiveDocTemplate);
}

// Helper functions for extracting information from source files
function extractProperties(content) {
  const propertyRegex = /@property\([^)]+\)\s+(\w+):\s*([^=;]+)(?:\s*=\s*([^;]+))?/g;
  const properties = [];
  let match;
  
  while ((match = propertyRegex.exec(content)) !== null) {
    properties.push({
      name: match[1],
      type: match[2].trim(),
      default: match[3] ? match[3].trim() : 'undefined'
    });
  }
  
  return properties;
}

function extractEvents(content) {
  const eventRegex = /@fires\s+(\w+)\s*-\s*([^\n]+)/g;
  const events = [];
  let match;
  
  while ((match = eventRegex.exec(content)) !== null) {
    events.push({
      name: match[1],
      description: match[2].trim()
    });
  }
  
  return events;
}

function extractDescription(content) {
  const descriptionMatch = content.match(/\/\*\*[\s\S]*?\*\s*([^\n*]+)/);
  return descriptionMatch ? descriptionMatch[1].trim() : null;
}

function extractAccessibilityFeatures(readmeContent) {
  const accessibilitySection = readmeContent.match(/## Accessibility[\s\S]*?(?=## |$)/);
  if (!accessibilitySection) return [];
  
  const features = accessibilitySection[0].match(/- ([^\n]+)/g);
  return features ? features.map(f => f.substring(2)) : [];
}

function extractGuidelines(readmeContent) {
  const guidelines = { do: [], dont: [] };
  
  const doSection = readmeContent.match(/✅ Do[\s\S]*?(?=❌|## |$)/);
  if (doSection) {
    const doItems = doSection[0].match(/- ([^\n]+)/g);
    guidelines.do = doItems ? doItems.map(item => item.substring(2)) : [];
  }
  
  const dontSection = readmeContent.match(/❌ Don't[\s\S]*?(?=✅|## |$)/);
  if (dontSection) {
    const dontItems = dontSection[0].match(/- ([^\n]+)/g);
    guidelines.dont = dontItems ? dontItems.map(item => item.substring(2)) : [];
  }
  
  return guidelines;
}

// Helper functions for generating HTML content
function generateComponentNavigation() {
  const componentsDir = join(process.cwd(), 'src', 'components');
  if (!existsSync(componentsDir)) return '';
  
  const components = readdirSync(componentsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .sort();
  
  return components.map(component => 
    `<li class="usa-sidenav__item">
      <a href="${component}.html">${component.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')}</a>
    </li>`
  ).join('\\n              ');
}

function generateComponentBadges(info) {
  const badges = [];
  
  if (info.properties.some(p => p.name === 'variant')) {
    badges.push('<span class="usa-tag usa-tag--success">Multiple Variants</span>');
  }
  
  if (info.events.length > 0) {
    badges.push('<span class="usa-tag usa-tag--info">Interactive</span>');
  }
  
  return badges.join('\\n              ');
}

function generateLiveExample(info) {
  const attributes = info.properties.filter(p => p.default !== 'undefined')
    .map(p => \`\${p.name}="\${p.default.replace(/['"]/g, '')}"\`)
    .join(' ');
  
  return \`<usa-\${info.name} \${attributes}>
    \${info.title} Example
  </usa-\${info.name}>\`;
}

function generateInteractiveControls(info) {
  return info.properties.map(prop => {
    const inputType = getInputTypeForProperty(prop);
    return \`
    <div class="docs-control">
      <label for="control-\${prop.name}">\${prop.name}</label>
      <\${inputType} 
        id="control-\${prop.name}" 
        data-property="\${prop.name}"
        \${generateInputAttributes(prop)}
      >
        \${generateInputOptions(prop)}
      </\${inputType}>
    </div>\`;
  }).join('\\n                ');
}

function getInputTypeForProperty(prop) {
  if (prop.type.includes('boolean')) return 'input type="checkbox"';
  if (prop.type.includes('|')) return 'select';
  if (prop.type.includes('number')) return 'input type="number"';
  return 'input type="text"';
}

function generateInputAttributes(prop) {
  const attributes = [];
  
  if (prop.type.includes('boolean')) {
    if (prop.default === 'true') attributes.push('checked');
  } else {
    attributes.push(\`value="\${prop.default.replace(/['"]/g, '')}"\`);
  }
  
  return attributes.join(' ');
}

function generateInputOptions(prop) {
  if (!prop.type.includes('|')) return '';
  
  const options = prop.type.split('|').map(option => option.trim().replace(/['"]/g, ''));
  return options.map(option => 
    \`<option value="\${option}">\${option}</option>\`
  ).join('\\n        ');
}

function generateHTMLExample(info) {
  return \`<usa-\${info.name}>
  \${info.title} Content
</usa-\${info.name}>\`;
}

function generateTypeScriptExample(info) {
  const className = info.name.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('');
  
  return \`import { USA\${className} } from '@your-org/uswds-web-components';

const \${info.name.replace(/-([a-z])/g, (g) => g[1].toUpperCase())} = document.querySelector('usa-\${info.name}') as USA\${className};

// Set properties
\${info.properties.map(prop => 
  \`\${info.name.replace(/-([a-z])/g, (g) => g[1].toUpperCase())}.\${prop.name} = \${prop.default};\`
).join('\\n')}

// Listen for events
\${info.events.map(event => 
  \`\${info.name.replace(/-([a-z])/g, (g) => g[1].toUpperCase())}.addEventListener('\${event.name}', (e) => {
  console.log('\${event.description}', e.detail);
});\`
).join('\\n\\n')}\`;
}

function generateReactExample(info) {
  const className = info.name.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('');
  
  return \`import React, { useRef, useEffect } from 'react';

function \${className}Example() {
  const componentRef = useRef<any>(null);
  
  useEffect(() => {
    const component = componentRef.current;
    if (component) {
      \${info.events.map(event =>
        \`component.addEventListener('\${event.name}', handle\${event.name.charAt(0).toUpperCase() + event.name.slice(1)});\`
      ).join('\\n      ')}
      
      return () => {
        \${info.events.map(event =>
          \`component.removeEventListener('\${event.name}', handle\${event.name.charAt(0).toUpperCase() + event.name.slice(1)});\`
        ).join('\\n        ')}
      };
    }
  }, []);
  
  \${info.events.map(event =>
    \`const handle\${event.name.charAt(0).toUpperCase() + event.name.slice(1)} = (event: CustomEvent) => {
    console.log('\${event.description}', event.detail);
  };\`
  ).join('\\n  ')}
  
  return (
    <usa-\${info.name} ref={componentRef}>
      \${info.title} Content
    </usa-\${info.name}>
  );
}\`;
}

function generatePropertiesTable(properties) {
  return properties.map(prop => \`
    <tr>
      <td><code>\${prop.name}</code></td>
      <td><code>\${prop.type}</code></td>
      <td><code>\${prop.default}</code></td>
      <td>Property description for \${prop.name}</td>
    </tr>
  \`).join('');
}

function generateEventsTable(events) {
  return events.map(event => \`
    <tr>
      <td><code>\${event.name}</code></td>
      <td><code>CustomEvent</code></td>
      <td>\${event.description}</td>
    </tr>
  \`).join('');
}

function generateCSSPropertiesTable(info) {
  return \`
    <tr>
      <td><code>--usa-\${info.name}-color</code></td>
      <td>Text color</td>
      <td>inherited</td>
    </tr>
    <tr>
      <td><code>--usa-\${info.name}-background</code></td>
      <td>Background color</td>
      <td>inherited</td>
    </tr>
  \`;
}

function generateAccessibilityFeatures(features) {
  return features.map(feature => \`<li>\${feature}</li>\`).join('\\n                  ');
}

function generateKeyboardNavigationTable(info) {
  const keyboardMap = {
    button: [
      { key: 'Enter', action: 'Activate button' },
      { key: 'Space', action: 'Activate button' }
    ],
    input: [
      { key: 'Tab', action: 'Move focus to next element' },
      { key: 'Shift + Tab', action: 'Move focus to previous element' }
    ]
  };
  
  const keys = keyboardMap[info.name.includes('button') ? 'button' : 'input'] || [];
  
  return keys.map(({ key, action }) => \`
    <tr>
      <td><kbd>\${key}</kbd></td>
      <td>\${action}</td>
    </tr>
  \`).join('');
}

function generateGuidelinesList(guidelines) {
  return guidelines.map(guideline => \`<li>\${guideline}</li>\`).join('\\n                    ');
}

/**
 * Generate documentation for all components
 */
function generateAllComponentDocs() {
  const componentsDir = join(process.cwd(), 'src', 'components');
  if (!existsSync(componentsDir)) {
    console.error('❌ Components directory not found');
    return;
  }
  
  const components = readdirSync(componentsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  console.log(\`📖 Generating interactive documentation for \${components.length} components...\`);
  
  let successful = 0;
  components.forEach(component => {
    if (generateComponentDocs(component)) {
      successful++;
    }
  });
  
  // Generate index page
  generateIndexPage(components);
  
  console.log(\`\\n✅ Generated documentation for \${successful}/\${components.length} components\`);
  console.log(\`📄 View at: docs/index.html\`);
}

/**
 * Generate documentation index page
 */
function generateIndexPage(components) {
  const indexHTML = \`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>USWDS Web Components - Interactive Documentation</title>
  <link rel="stylesheet" href="../src/styles/styles.css">
  <link rel="stylesheet" href="./assets/docs.css">
</head>
<body class="docs-page">
  <header class="usa-header usa-header--basic docs-header">
    <div class="usa-nav-container">
      <div class="usa-navbar">
        <div class="usa-logo">
          <em class="usa-logo__text">
            <a href="#" title="USWDS Web Components">USWDS Web Components</a>
          </em>
        </div>
      </div>
    </div>
  </header>

  <main class="docs-main">
    <div class="grid-container">
      <div class="docs-component-header">
        <h1>USWDS Web Components</h1>
        <p class="docs-description">
          Interactive documentation for USWDS-compliant web components built with Lit and TypeScript.
        </p>
      </div>

      <section class="docs-section">
        <h2>Available Components</h2>
        <div class="grid-row grid-gap">
          \${components.map(component => {
            const title = component.split('-').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
            
            return \`
            <div class="grid-col-6 grid-col-md-4">
              <div class="usa-card">
                <div class="usa-card__container">
                  <div class="usa-card__header">
                    <h3 class="usa-card__heading">\${title}</h3>
                  </div>
                  <div class="usa-card__body">
                    <p>Interactive documentation with live examples and API reference.</p>
                  </div>
                  <div class="usa-card__footer">
                    <a href="./components/\${component}.html" class="usa-button">
                      View Documentation
                    </a>
                  </div>
                </div>
              </div>
            </div>
            \`;
          }).join('')}
        </div>
      </section>
    </div>
  </main>
</body>
</html>\`;
  
  const docsDir = join(process.cwd(), 'docs');
  writeFileSync(join(docsDir, 'index.html'), indexHTML);
}

// CLI interface
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('📖 Interactive API Documentation Generator\\n');
  console.log('Usage:');
  console.log('  node scripts/generate-api-docs.js <component-name>  # Generate docs for specific component');
  console.log('  node scripts/generate-api-docs.js --all             # Generate docs for all components');
  console.log('\\n💡 Examples:');
  console.log('  node scripts/generate-api-docs.js button');
  console.log('  node scripts/generate-api-docs.js text-input');
  console.log('  node scripts/generate-api-docs.js --all');
  process.exit(1);
}

if (args[0] === '--all') {
  generateAllComponentDocs();
} else {
  const componentName = args[0];
  if (generateComponentDocs(componentName)) {
    console.log(\`\\n🌐 View documentation at: docs/components/\${componentName}.html\`);
  }
}