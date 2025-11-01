#!/usr/bin/env node

import puppeteer from 'puppeteer';

async function testModalContent() {
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    defaultViewport: { width: 1200, height: 800 }, // Set larger viewport
  });
  const page = await browser.newPage();

  try {
    const url = 'http://localhost:6006/?path=/story/components-modal--large-modal';
    console.log('Loading:', url);

    await page.goto(url, { waitUntil: 'networkidle0' });
    console.log('✅ Page loaded');

    // Wait for Storybook to load
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const frame = page.frames().find((f) => f.name() === 'storybook-preview-iframe');
    if (!frame) {
      console.log('❌ Could not find storybook iframe');
      return;
    }

    console.log('✅ Found storybook iframe');

    // Click the button to open modal
    await frame.click('button[data-open-modal]');
    console.log('✅ Clicked open button');

    // Wait for modal to open
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Check what content actually exists in the modal
    const contentInfo = await frame.evaluate(() => {
      const modal = document.querySelector('.usa-modal--lg');
      if (!modal) return { error: 'No large modal found' };

      return {
        modalExists: !!modal,
        modalHTML: modal.innerHTML.substring(0, 500),
        tableExists: !!modal.querySelector('table'),
        tableHTML: modal.querySelector('table')?.outerHTML?.substring(0, 200) || 'No table found',
        proseExists: !!modal.querySelector('.usa-prose'),
        allElements: Array.from(modal.querySelectorAll('*'))
          .map((el) => el.tagName.toLowerCase())
          .slice(0, 20),
        modalRect: modal.getBoundingClientRect(),
      };
    });

    console.log('Modal Content Analysis:', JSON.stringify(contentInfo, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }

  console.log('Test complete - browser left open for inspection');
}

testModalContent().catch(console.error);
