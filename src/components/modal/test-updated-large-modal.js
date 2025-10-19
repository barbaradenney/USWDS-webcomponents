#!/usr/bin/env node

import puppeteer from 'puppeteer';

async function testUpdatedLargeModal() {
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

    // Check modal dimensions
    const modalInfo = await frame.evaluate(() => {
      const modal = document.querySelector('.usa-modal--lg');
      if (!modal) return { error: 'No large modal found' };

      const rect = modal.getBoundingClientRect();
      const computedStyles = window.getComputedStyle(modal);
      const table = modal.querySelector('.usa-table');
      const tableRect = table ? table.getBoundingClientRect() : null;

      return {
        modal: {
          width: rect.width,
          maxWidth: computedStyles.maxWidth,
          classes: modal.className
        },
        table: tableRect ? {
          width: tableRect.width,
          height: tableRect.height
        } : null,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      };
    });

    console.log('Modal Dimensions:', JSON.stringify(modalInfo, null, 2));

    // Compare with default modal
    console.log('\n--- Comparing with default modal ---');

    // Close current modal
    await frame.keyboard.press('Escape');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Navigate to default modal
    await page.goto('http://localhost:6006/?path=/story/components-modal--default', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 3000));

    const defaultFrame = page.frames().find(f => f.name() === 'storybook-preview-iframe');
    if (defaultFrame) {
      await defaultFrame.click('button[data-open-modal]');
      await new Promise(resolve => setTimeout(resolve, 2000));

      const defaultModalInfo = await defaultFrame.evaluate(() => {
        const modal = document.querySelector('.usa-modal');
        if (!modal) return { error: 'No modal found' };

        const rect = modal.getBoundingClientRect();
        const computedStyles = window.getComputedStyle(modal);

        return {
          modal: {
            width: rect.width,
            maxWidth: computedStyles.maxWidth,
            classes: modal.className
          }
        };
      });

      console.log('Default Modal Dimensions:', JSON.stringify(defaultModalInfo, null, 2));

      // Calculate difference
      if (modalInfo.modal && defaultModalInfo.modal) {
        const widthDifference = modalInfo.modal.width - defaultModalInfo.modal.width;
        console.log(`\n📏 Width Difference: ${widthDifference.toFixed(2)}px`);
        console.log(`   Large Modal: ${modalInfo.modal.width.toFixed(2)}px`);
        console.log(`   Default Modal: ${defaultModalInfo.modal.width.toFixed(2)}px`);

        if (widthDifference > 50) {
          console.log('✅ Large modal is significantly wider than default modal');
        } else {
          console.log('⚠️  Large modal is not much wider than default modal');
        }
      }
    }

  } catch (error) {
    console.error('Error:', error);
  }

  console.log('Test complete - browser left open for inspection');
}

testUpdatedLargeModal().catch(console.error);