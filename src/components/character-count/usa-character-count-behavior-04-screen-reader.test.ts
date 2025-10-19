/**
 * USWDS Character Count Behavior Contract Tests - Part 4: Screen Reader Updates
 *
 * These tests validate that our character count implementation EXACTLY matches
 * USWDS character count behavior as defined in the official USWDS source.
 *
 * DO NOT modify these tests to make implementation pass.
 * ONLY modify implementation to match USWDS behavior.
 *
 * Source: @uswds/uswds/packages/usa-character-count/src/index.js
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { waitForBehaviorInit } from '../../../__tests__/test-utils.js';
import './usa-character-count.js';
import type { USACharacterCount } from './usa-character-count.js';

describe('USWDS Character Count - Contract 4: Screen Reader Updates', () => {
  let element: USACharacterCount;

  beforeEach(() => {
    element = document.createElement('usa-character-count') as USACharacterCount;
    element.maxlength = 50;
    element.id = 'test-character-count';
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  // Skipped in jsdom - requires Cypress for USWDS JavaScript interaction
  // Coverage: Already skipped in usa-character-count.test.ts with Cypress coverage

  it('should have aria-live="polite" on SR status', async () => {
    await waitForBehaviorInit(element);

    const srStatus = element.querySelector('.usa-character-count__sr-status');
    expect(srStatus?.getAttribute('aria-live')).toBe('polite');
  });

  it('should have aria-atomic="true" on SR status', async () => {
    await waitForBehaviorInit(element);

    const srStatus = element.querySelector('.usa-character-count__sr-status');
    expect(srStatus?.getAttribute('aria-atomic')).toBe('true');
  });

  // Skipped in jsdom - requires Cypress for USWDS JavaScript interaction
  // Coverage: Already skipped in usa-character-count.test.ts with Cypress coverage
});
