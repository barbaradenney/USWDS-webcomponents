#!/usr/bin/env node

import puppeteer from 'puppeteer';

async function testModalCSS() {
  const browser = await puppeteer.launch({ headless: false, devtools: true });
  const page = await browser.newPage();

  // Enable console logging
  page.on('console', msg => {
    console.log(`BROWSER: ${msg.text()}`);
  });

  try {
    const url = 'http://localhost:6006/?path=/story/components-modal--large-modal';
    console.log('Loading:', url);

    await page.goto(url, { waitUntil: 'networkidle0' });
    console.log('✅ Page loaded');

    // Wait for Storybook to load
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Check the iframe
    const frame = page.frames().find(f => f.name() === 'storybook-preview-iframe');
    if (!frame) {
      console.log('❌ Could not find storybook iframe');
      return;
    }

    console.log('✅ Found storybook iframe');

    // Click the button to open modal
    await frame.click('button[data-open-modal]');
    console.log('✅ Clicked open button');

    // Wait for modal to open
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check CSS styles and computed styles
    const styleInfo = await frame.evaluate(() => {
      const modal = document.querySelector('.usa-modal--lg');
      if (!modal) return { error: 'No .usa-modal--lg element found' };

      const computedStyles = window.getComputedStyle(modal);

      // Check for specific CSS rules
      const cssRules = [];
      for (let i = 0; i < document.styleSheets.length; i++) {
        try {
          const sheet = document.styleSheets[i];
          for (let j = 0; j < sheet.cssRules.length; j++) {
            const rule = sheet.cssRules[j];
            if (rule.selectorText && rule.selectorText.includes('usa-modal--lg')) {
              cssRules.push({
                selector: rule.selectorText,
                cssText: rule.cssText
              });
            }
          }
        } catch (e) {
          // Skip CORS-blocked stylesheets
        }
      }

      return {
        elementExists: !!modal,
        classes: modal.className,
        computedWidth: computedStyles.width,
        computedMaxWidth: computedStyles.maxWidth,
        computedMinWidth: computedStyles.minWidth,
        cssRules: cssRules,
        allStylesheets: document.styleSheets.length,
        modalRect: modal.getBoundingClientRect()
      };
    });

    console.log('CSS Analysis:', JSON.stringify(styleInfo, null, 2));

    // Also check for regular modal to compare
    console.log('\n--- Comparing with default modal ---');

    // Close current modal first
    await frame.keyboard.press('Escape');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Navigate to default modal
    await page.goto('http://localhost:6006/?path=/story/components-modal--default', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 3000));

    const defaultFrame = page.frames().find(f => f.name() === 'storybook-preview-iframe');
    if (defaultFrame) {
      await defaultFrame.click('button[data-open-modal]');
      await new Promise(resolve => setTimeout(resolve, 2000));

      const defaultStyleInfo = await defaultFrame.evaluate(() => {
        const modal = document.querySelector('.usa-modal');
        if (!modal) return { error: 'No modal found' };

        const computedStyles = window.getComputedStyle(modal);
        return {
          classes: modal.className,
          computedWidth: computedStyles.width,
          computedMaxWidth: computedStyles.maxWidth,
          modalRect: modal.getBoundingClientRect()
        };
      });

      console.log('Default Modal CSS:', JSON.stringify(defaultStyleInfo, null, 2));
    }

  } catch (error) {
    console.error('Error:', error);
  }

  console.log('Test complete - browser left open for inspection');
}

testModalCSS().catch(console.error);