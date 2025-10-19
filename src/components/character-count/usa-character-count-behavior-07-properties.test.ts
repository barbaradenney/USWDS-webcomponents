/**
 * USWDS Character Count Behavior Contract Tests - Part 7: Component Properties
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

describe('USWDS Character Count - Contract 7: Component Properties', () => {
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

  it('should update when maxlength property changes', async () => {
    await waitForBehaviorInit(element);

    const message = element.querySelector('.usa-character-count__message') as HTMLElement;
    expect(message.textContent).toContain('50');

    element.maxlength = 100;
    await waitForBehaviorInit(element);

    expect(message.textContent).toContain('100');
  });

  it('should update input maxlength attribute when property changes', async () => {
    await waitForBehaviorInit(element);

    const input = element.querySelector('textarea, input') as HTMLElement;
    expect(input.getAttribute('maxlength')).toBe('50');

    element.maxlength = 75;
    await waitForBehaviorInit(element);

    expect(input.getAttribute('maxlength')).toBe('75');
  });
});
