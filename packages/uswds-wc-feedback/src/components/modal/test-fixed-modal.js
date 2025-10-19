#!/usr/bin/env node

import puppeteer from 'puppeteer';

async function testFixedModal() {
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    defaultViewport: { width: 1200, height: 800 }
  });
  const page = await browser.newPage();

  try {
    // Test 1: Large modal content rendering
    console.log('=== TEST 1: Large Modal Content ===');
    const url = 'http://localhost:6006/?path=/story/components-modal--large-modal';
    await page.goto(url, { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 3000));

    const frame = page.frames().find(f => f.name() === 'storybook-preview-iframe');
    if (!frame) {
      console.log('❌ Could not find storybook iframe');
      return;
    }

    // Open large modal
    await frame.click('button[data-open-modal]');
    await new Promise(resolve => setTimeout(resolve, 1000));

    const largeModalContent = await frame.evaluate(() => {
      const modal = document.querySelector('.usa-modal--lg');
      if (!modal) return { error: 'No large modal found' };

      return {
        modalExists: !!modal,
        tableExists: !!modal.querySelector('table'),
        tableRows: modal.querySelectorAll('table tr').length,
        modalWidth: modal.getBoundingClientRect().width,
        hasAlertBox: !!modal.querySelector('.usa-alert'),
        hasGridRows: !!modal.querySelector('.usa-grid-row')
      };
    });

    console.log('Large Modal Content:', JSON.stringify(largeModalContent, null, 2));

    if (largeModalContent.tableExists) {
      console.log('✅ Table content is now rendering!');
    } else {
      console.log('❌ Table content still not rendering');
    }

    // Test 2: Modal reopening
    console.log('\n=== TEST 2: Modal Reopening ===');

    // Close modal with escape
    await frame.keyboard.press('Escape');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Try to open again
    await frame.click('button[data-open-modal]');
    await new Promise(resolve => setTimeout(resolve, 1000));

    const reopenTest = await frame.evaluate(() => {
      const wrapper = document.querySelector('.usa-modal-wrapper');
      return {
        wrapperExists: !!wrapper,
        wrapperVisible: wrapper?.classList.contains('is-visible'),
        bodyHasModalClass: document.body.classList.contains('usa-js-modal--active')
      };
    });

    console.log('Reopen Test:', JSON.stringify(reopenTest, null, 2));

    if (reopenTest.wrapperVisible) {
      console.log('✅ Modal reopens successfully!');
    } else {
      console.log('❌ Modal still not reopening');
    }

    // Test 3: Multiple open/close cycles
    console.log('\n=== TEST 3: Multiple Open/Close Cycles ===');

    for (let i = 1; i <= 3; i++) {
      console.log(`Cycle ${i}:`);

      // Close
      await frame.keyboard.press('Escape');
      await new Promise(resolve => setTimeout(resolve, 500));

      // Open
      await frame.click('button[data-open-modal]');
      await new Promise(resolve => setTimeout(resolve, 500));

      const cycleTest = await frame.evaluate(() => {
        const wrapper = document.querySelector('.usa-modal-wrapper');
        return wrapper?.classList.contains('is-visible') || false;
      });

      console.log(`  Cycle ${i}: ${cycleTest ? '✅ Opened' : '❌ Failed'}`);
    }

  } catch (error) {
    console.error('Error:', error);
  }

  console.log('\nTest complete - browser left open for manual inspection');
}

testFixedModal().catch(console.error);