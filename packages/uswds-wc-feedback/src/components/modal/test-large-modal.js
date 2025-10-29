#!/usr/bin/env node

import puppeteer from 'puppeteer';

async function testLargeModal() {
  const browser = await puppeteer.launch({ headless: false, devtools: true });
  const page = await browser.newPage();

  // Enable console logging
  page.on('console', (msg) => {
    console.log(`BROWSER: ${msg.text()}`);
  });

  try {
    const url = 'http://localhost:6006/?path=/story/components-modal--large-modal';
    console.log('Loading:', url);

    await page.goto(url, { waitUntil: 'networkidle0' });
    console.log('✅ Page loaded');

    // Wait for Storybook to load
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Check the iframe
    const frame = page.frames().find((f) => f.name() === 'storybook-preview-iframe');
    if (!frame) {
      console.log('❌ Could not find storybook iframe');
      return;
    }

    console.log('✅ Found storybook iframe');

    // Check modal before opening
    const beforeOpen = await frame.evaluate(() => {
      const modal = document.querySelector('usa-modal');
      const modalDiv = modal?.querySelector('.usa-modal');
      return {
        modalExists: !!modal,
        modalId: modal?.id,
        hasLargeAttribute: modal?.hasAttribute('large'),
        largeAttributeValue: modal?.getAttribute('large'),
        modalDivClasses: modalDiv?.className,
        innerHTML: modal?.innerHTML?.substring(0, 200),
      };
    });

    console.log('Before opening:', beforeOpen);

    // Click the button to open modal
    await frame.click('button[data-open-modal]');
    console.log('✅ Clicked open button');

    // Wait for modal to open
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Check modal after opening - look in document body
    const afterOpen = await frame.evaluate(() => {
      // Look for modal in its original location
      const originalModal = document.querySelector('usa-modal');
      const originalDiv = originalModal?.querySelector('.usa-modal');

      // Look for modal that might have been moved to body
      const movedModal = document.querySelector('.usa-modal-wrapper .usa-modal');
      const allModals = Array.from(document.querySelectorAll('.usa-modal'));

      return {
        original: {
          exists: !!originalModal,
          divClasses: originalDiv?.className,
          hasPlaceholder: !!originalModal?.querySelector('[data-placeholder-for]'),
        },
        moved: {
          exists: !!movedModal,
          classes: movedModal?.className,
          parentClasses: movedModal?.parentElement?.className,
        },
        allModals: allModals.map((m) => ({
          classes: m.className,
          id: m.id,
          parent: m.parentElement?.tagName,
        })),
      };
    });

    console.log('After opening:', JSON.stringify(afterOpen, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }

  console.log('Test complete - browser left open for inspection');
}

testLargeModal().catch(console.error);
