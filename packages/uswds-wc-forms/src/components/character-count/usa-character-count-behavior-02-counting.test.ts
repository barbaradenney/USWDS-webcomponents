/**
 * USWDS Character Count Behavior Contract Tests - Part 2: Character Counting
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
import { waitForBehaviorInit } from '@uswds-wc/test-utils/test-utils.js';
import './usa-character-count.js';
import type { USACharacterCount } from './usa-character-count.js';

describe('USWDS Character Count - Contract 2: Character Counting', () => {
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

  it('should display initial character count', async () => {
    await waitForBehaviorInit(element);

    const message = element.querySelector('.usa-character-count__message') as HTMLElement;
    expect(message.textContent).toContain('50');
    expect(message.textContent).toMatch(/character/i);
  });

  // Skipped in jsdom - requires Cypress for USWDS JavaScript interaction
  // Coverage: Already skipped in usa-character-count.test.ts with Cypress coverage

  it('should use singular "character" for count of 1', async () => {
    element.maxlength = 1;
    await waitForBehaviorInit(element);

    const message = element.querySelector('.usa-character-count__message') as HTMLElement;
    expect(message.textContent).toMatch(/1 character(?!s)/i);
  });

  it('should use plural "characters" for count !== 1', async () => {
    await waitForBehaviorInit(element);

    const message = element.querySelector('.usa-character-count__message') as HTMLElement;
    expect(message.textContent).toMatch(/50 characters/i);
  });

  // Skipped in jsdom - requires Cypress for USWDS JavaScript interaction
  // Coverage: Already skipped in usa-character-count.test.ts with Cypress coverage
});
