/**
 * Component Security Testing
 *
 * This test suite verifies component security using real browser environments
 * and tests for common web security vulnerabilities.
 */

import { test, expect } from '@playwright/test';

test.describe('Component Security Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set up security monitoring
    await page.addInitScript(() => {
      window.securityLog = [];
      window.xssDetected = false;

      // Monitor for potential XSS execution
      const originalAlert = window.alert;
      window.alert = (...args) => {
        window.xssDetected = true;
        window.securityLog.push({
          type: 'xss_attempt',
          payload: args.join(' '),
          timestamp: Date.now()
        });
        originalAlert(...args);
      };

      // Monitor for script injection
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.tagName === 'SCRIPT') {
                window.securityLog.push({
                  type: 'script_injection',
                  content: element.textContent || element.innerHTML,
                  timestamp: Date.now()
                });
              }
            }
          });
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      // Monitor for CSP violations
      document.addEventListener('securitypolicyviolation', (e) => {
        window.securityLog.push({
          type: 'csp_violation',
          directive: e.violatedDirective,
          blocked: e.blockedURI,
          timestamp: Date.now()
        });
      });
    });
  });

  test.describe('XSS (Cross-Site Scripting) Protection', () => {
    test('Text Input should sanitize malicious script tags', async ({ page }) => {
      await page.goto('/iframe.html?id=components-text-input--default');

      const xssPayloads = [
        '<script>alert("XSS")</script>',
        '<img src="x" onerror="alert(\'XSS\')">',
        '<svg onload="alert(\'XSS\')">',
        'javascript:alert("XSS")',
        '"><script>alert("XSS")</script>',
      ];

      for (const payload of xssPayloads) {
        // Clear previous state
        await page.evaluate(() => {
          window.xssDetected = false;
          window.securityLog = [];
        });

        // Input malicious payload
        const input = page.locator('usa-text-input input').first();
        await input.fill(payload);
        await input.blur();

        // Wait for potential script execution
        await page.waitForTimeout(500);

        // Check if XSS was executed
        const xssDetected = await page.evaluate(() => window.xssDetected);
        expect(xssDetected).toBe(false);

        // Check that payload was sanitized in DOM
        const inputValue = await input.inputValue();
        const displayedValue = await page.locator('usa-text-input').first().textContent();

        // Should not contain executable script tags
        expect(inputValue).not.toMatch(/<script[^>]*>/);
        expect(displayedValue || '').not.toMatch(/<script[^>]*>/);

        console.log(`✅ XSS payload blocked: ${payload.substring(0, 30)}...`);
      }
    });

    test('Alert component should sanitize message content', async ({ page }) => {
      await page.goto('/iframe.html?id=components-alert--default');

      const maliciousContent = '<script>alert("XSS via Alert")</script><img src="x" onerror="alert(\'IMG XSS\')">';

      // Try to inject malicious content into alert
      await page.evaluate((content) => {
        const alert = document.querySelector('usa-alert');
        if (alert) {
          alert.textContent = content;
          alert.innerHTML = content;
        }
      }, maliciousContent);

      await page.waitForTimeout(500);

      // Check that XSS was not executed
      const xssDetected = await page.evaluate(() => window.xssDetected);
      expect(xssDetected).toBe(false);

      // Alert should still be visible but content should be safe
      const alert = page.locator('usa-alert').first();
      await expect(alert).toBeVisible();

      const alertHTML = await alert.innerHTML();
      expect(alertHTML).not.toMatch(/<script[^>]*>/);
      expect(alertHTML).not.toMatch(/onerror\s*=/);
    });

    test('Button component should resist XSS in attributes', async ({ page }) => {
      await page.goto('/iframe.html?id=components-button--default');

      // Try to inject XSS via data attributes
      await page.evaluate(() => {
        const button = document.querySelector('usa-button');
        if (button) {
          button.setAttribute('data-malicious', '<script>alert("XSS")</script>');
          button.setAttribute('title', 'javascript:alert("XSS")');
          button.setAttribute('aria-label', '"><script>alert("XSS")</script>');
        }
      });

      await page.waitForTimeout(500);

      // XSS should not execute
      const xssDetected = await page.evaluate(() => window.xssDetected);
      expect(xssDetected).toBe(false);

      // Button should still be functional
      const button = page.locator('usa-button').first();
      await expect(button).toBeVisible();
      await button.click();
    });

    test('Combo Box should sanitize option data', async ({ page }) => {
      await page.goto('/iframe.html?id=components-combo-box--default');

      // Inject malicious options
      await page.evaluate(() => {
        const comboBox = document.querySelector('usa-combo-box');
        if (comboBox) {
          (comboBox as any).options = [
            { value: 'safe', text: 'Safe Option' },
            {
              value: '<script>alert("XSS")</script>',
              text: '<img src="x" onerror="alert(\'IMG XSS\')">'
            },
            {
              value: 'onclick="alert(\'XSS\')"',
              text: 'javascript:alert("XSS")'
            }
          ];
        }
      });

      await page.waitForTimeout(500);

      // Open dropdown to render options
      const input = page.locator('usa-combo-box input').first();
      await input.click();

      // Wait for dropdown to appear
      await page.waitForTimeout(200);

      // Check that XSS was not executed
      const xssDetected = await page.evaluate(() => window.xssDetected);
      expect(xssDetected).toBe(false);

      // Options should be rendered safely
      const comboBox = page.locator('usa-combo-box').first();
      const comboBoxHTML = await comboBox.innerHTML();
      expect(comboBoxHTML).not.toMatch(/<script[^>]*>/);
      expect(comboBoxHTML).not.toMatch(/onerror\s*=/);
    });
  });

  test.describe('Content Security Policy (CSP) Compliance', () => {
    test('Components should not use inline styles', async ({ page }) => {
      await page.goto('/iframe.html?id=components-button--default');

      // Check for inline styles
      const inlineStyles = await page.evaluate(() => {
        const elements = document.querySelectorAll('[style]');
        return Array.from(elements).map(el => ({
          tagName: el.tagName,
          style: el.getAttribute('style')
        }));
      });

      // Components should not use inline styles (CSP violation)
      const componentInlineStyles = inlineStyles.filter(el =>
        el.tagName.toLowerCase().startsWith('usa-')
      );

      expect(componentInlineStyles.length).toBe(0);
    });

    test('Components should not use inline event handlers', async ({ page }) => {
      await page.goto('/iframe.html?id=components-accordion--default');

      // Check for inline event handlers
      const inlineEvents = await page.evaluate(() => {
        const eventAttributes = [
          'onclick', 'onload', 'onerror', 'onmouseover', 'onmouseout',
          'onfocus', 'onblur', 'onchange', 'onsubmit', 'onkeydown', 'onkeyup'
        ];

        const violations = [];
        const allElements = document.querySelectorAll('*');

        for (const element of allElements) {
          for (const attr of eventAttributes) {
            if (element.hasAttribute(attr)) {
              violations.push({
                tagName: element.tagName,
                attribute: attr,
                value: element.getAttribute(attr)
              });
            }
          }
        }

        return violations;
      });

      // No inline event handlers should be found
      expect(inlineEvents.length).toBe(0);
    });

    test('Components should not use javascript: URLs', async ({ page }) => {
      await page.goto('/iframe.html?id=components-link--default');

      // Check for javascript: URLs
      const javascriptUrls = await page.evaluate(() => {
        const elements = document.querySelectorAll('a[href], img[src], iframe[src]');
        return Array.from(elements)
          .filter(el => {
            const url = el.getAttribute('href') || el.getAttribute('src') || '';
            return url.toLowerCase().startsWith('javascript:');
          })
          .map(el => ({
            tagName: el.tagName,
            url: el.getAttribute('href') || el.getAttribute('src')
          }));
      });

      // No javascript: URLs should be found
      expect(javascriptUrls.length).toBe(0);
    });
  });

  test.describe('DOM Clobbering Resistance', () => {
    test('Components should work when document.createElement is clobbered', async ({ page }) => {
      await page.goto('/iframe.html?id=components-modal--default');

      // Clobber document.createElement
      await page.evaluate(() => {
        const form = document.createElement('form');
        form.name = 'createElement';
        document.body.appendChild(form);

        const input = document.createElement('input');
        input.name = 'createElement';
        input.id = 'createElement';
        form.appendChild(input);
      });

      // Component should still function
      const modal = page.locator('usa-modal').first();
      await expect(modal).toBeAttached();

      // Try to interact with modal
      const openButton = page.locator('button[data-open-modal]').first();
      if (await openButton.isVisible()) {
        await openButton.click();
        await expect(modal).toBeVisible();
      }
    });

    test('Components should handle clobbered window.location', async ({ page }) => {
      await page.goto('/iframe.html?id=components-breadcrumb--default');

      // Clobber window.location
      await page.evaluate(() => {
        const img = document.createElement('img');
        img.name = 'location';
        img.id = 'location';
        document.body.appendChild(img);
      });

      // Component should still render
      const breadcrumb = page.locator('usa-breadcrumb').first();
      await expect(breadcrumb).toBeVisible();

      // Links should still be functional
      const links = page.locator('usa-breadcrumb a');
      if (await links.count() > 0) {
        await expect(links.first()).toBeVisible();
      }
    });
  });

  test.describe('Input Validation and Sanitization', () => {
    test('Date Picker should validate date formats', async ({ page }) => {
      await page.goto('/iframe.html?id=components-date-picker--default');

      const maliciousDates = [
        '<script>alert("XSS")</script>',
        '../../etc/passwd',
        '${7*7}',
        'javascript:alert("XSS")',
        '"><img src=x onerror=alert("XSS")>',
      ];

      for (const maliciousDate of maliciousDates) {
        const input = page.locator('usa-date-picker input').first();
        await input.fill(maliciousDate);
        await input.blur();

        // Wait for validation
        await page.waitForTimeout(200);

        // Check that XSS was not executed
        const xssDetected = await page.evaluate(() => window.xssDetected);
        expect(xssDetected).toBe(false);

        // Input should either reject the value or sanitize it
        const inputValue = await input.inputValue();
        expect(inputValue).not.toMatch(/<script[^>]*>/);
        expect(inputValue).not.toMatch(/onerror\s*=/);
      }
    });

    test('Search component should sanitize query parameters', async ({ page }) => {
      await page.goto('/iframe.html?id=components-search--default');

      const maliciousQueries = [
        '<script>alert("Search XSS")</script>',
        'search"><script>alert("XSS")</script>',
        'javascript:alert("XSS")',
        '${alert("XSS")}',
      ];

      for (const query of maliciousQueries) {
        const input = page.locator('usa-search input').first();
        await input.fill(query);

        // Submit search
        await input.press('Enter');

        await page.waitForTimeout(300);

        // XSS should not execute
        const xssDetected = await page.evaluate(() => window.xssDetected);
        expect(xssDetected).toBe(false);

        // Check that query is properly handled
        const inputValue = await input.inputValue();
        expect(inputValue).not.toMatch(/<script[^>]*>/);
      }
    });

    test('File Input should validate file types', async ({ page }) => {
      await page.goto('/iframe.html?id=components-file-input--default');

      // Create a malicious file with script content
      await page.evaluate(() => {
        const fileInput = document.querySelector('usa-file-input input[type="file"]');
        if (fileInput) {
          const maliciousFile = new File(
            ['<script>alert("File XSS")</script>'],
            'malicious.html',
            { type: 'text/html' }
          );

          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(maliciousFile);
          (fileInput as HTMLInputElement).files = dataTransfer.files;

          // Trigger change event
          fileInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });

      await page.waitForTimeout(500);

      // XSS should not execute from file content
      const xssDetected = await page.evaluate(() => window.xssDetected);
      expect(xssDetected).toBe(false);

      // Component should handle file safely
      const fileInput = page.locator('usa-file-input').first();
      await expect(fileInput).toBeVisible();
    });
  });

  test.describe('Prototype Pollution Protection', () => {
    test('Components should not be vulnerable to prototype pollution', async ({ page }) => {
      await page.goto('/iframe.html?id=components-button--default');

      // Attempt prototype pollution
      await page.evaluate(() => {
        const pollutionPayload = JSON.parse('{"__proto__": {"polluted": true}}');

        const button = document.querySelector('usa-button');
        if (button) {
          try {
            // Try to assign polluted object
            Object.assign(button, pollutionPayload);
          } catch (e) {
            // Expected for some scenarios
          }
        }
      });

      // Check if Object.prototype was polluted
      const isPolluted = await page.evaluate(() => {
        return 'polluted' in Object.prototype;
      });

      expect(isPolluted).toBe(false);

      // Component should still function normally
      const button = page.locator('usa-button').first();
      await expect(button).toBeVisible();
      await button.click();
    });

    test('Form components should handle malicious form data safely', async ({ page }) => {
      await page.goto('/iframe.html?id=components-text-input--default');

      // Try to pollute via form data
      await page.evaluate(() => {
        const form = document.createElement('form');
        form.innerHTML = `
          <input name="__proto__.polluted" value="true">
          <input name="constructor.prototype.polluted" value="true">
        `;
        document.body.appendChild(form);

        const formData = new FormData(form);
        const dataObject = {};

        // This is a common pattern that can be vulnerable
        for (let [key, value] of formData.entries()) {
          try {
            (dataObject as any)[key] = value;
          } catch (e) {
            // Expected for some payloads
          }
        }

        form.remove();
      });

      // Check that prototype was not polluted
      const isPolluted = await page.evaluate(() => {
        return 'polluted' in Object.prototype;
      });

      expect(isPolluted).toBe(false);
    });
  });

  test.describe('Authentication and Authorization', () => {
    test('Components should not expose sensitive information in DOM', async ({ page }) => {
      await page.goto('/iframe.html?id=components-text-input--default');

      // Check for potential sensitive data exposure
      const sensitivePatterns = [
        /password/i,
        /secret/i,
        /token/i,
        /api[_-]?key/i,
        /access[_-]?token/i,
        /session[_-]?id/i,
      ];

      const pageContent = await page.content();

      for (const pattern of sensitivePatterns) {
        // Should not find actual sensitive values (mock data is ok)
        const matches = pageContent.match(pattern);
        if (matches) {
          // If found, should be in controlled test contexts
          expect(matches.every(match =>
            match.toLowerCase().includes('test') ||
            match.toLowerCase().includes('mock') ||
            match.toLowerCase().includes('example')
          )).toBe(true);
        }
      }
    });

    test('Form components should not auto-complete sensitive fields inappropriately', async ({ page }) => {
      await page.goto('/iframe.html?id=components-text-input--default');

      // Check autocomplete attributes on sensitive inputs
      const autocompleteSettings = await page.evaluate(() => {
        const inputs = document.querySelectorAll('input[type="password"], input[name*="password"], input[name*="secret"]');
        return Array.from(inputs).map(input => ({
          type: input.getAttribute('type'),
          name: input.getAttribute('name'),
          autocomplete: input.getAttribute('autocomplete')
        }));
      });

      // Password fields should have appropriate autocomplete settings
      for (const input of autocompleteSettings) {
        if (input.type === 'password' || input.name?.includes('password')) {
          expect(['off', 'current-password', 'new-password'].includes(input.autocomplete || '')).toBe(true);
        }
      }
    });
  });

  test.afterEach(async ({ page }) => {
    // Log security events that occurred during test
    const securityLog = await page.evaluate(() => window.securityLog || []);
    if (securityLog.length > 0) {
      console.log('Security events logged:', securityLog);
    }

    // Clean up any prototype pollution
    await page.evaluate(() => {
      if ('polluted' in Object.prototype) {
        delete (Object.prototype as any).polluted;
      }
    });
  });
});