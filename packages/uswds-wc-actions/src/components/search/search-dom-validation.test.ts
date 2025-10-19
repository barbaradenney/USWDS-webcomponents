import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import './usa-search.ts';
import type { USASearch } from './usa-search.js';
/**
 * Search DOM Structure Validation Tests
 *
 * Catches visual/structural issues like:
 * - Rendering as plain input without search button
 * - Missing search button
 * - Incorrect form structure
 */

describe('Search DOM Structure Validation', () => {
  let element: USASearch;
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    element = document.createElement('usa-search') as USASearch;
    container.appendChild(element);
  });

  afterEach(() => {
    container.remove();
  });

  describe('Basic DOM Structure', () => {
    it('should have search form', async () => {
      await element.updateComplete;

      const form = element.querySelector('form.usa-search');
      expect(form).toBeTruthy();
    });

    it('should have search input', async () => {
      await element.updateComplete;

      const input = element.querySelector('input.usa-input');
      expect(input).toBeTruthy();
      expect(input?.getAttribute('type')).toBe('search');
    });

    it('should have search button', async () => {
      await element.updateComplete;

      const button = element.querySelector('button.usa-button');
      expect(button).toBeTruthy();
      expect(button?.getAttribute('type')).toBe('submit');
    });

    it('should NOT render as plain input', async () => {
      await element.updateComplete;

      const plainInput = element.querySelector('input[type="search"]:only-child');
      expect(plainInput).toBeFalsy();
    });
  });

  describe('Size Variants', () => {
    it('should have small class when size is small', async () => {
      element.size = 'small';
      await element.updateComplete;

      const search = element.querySelector('.usa-search');
      expect(search?.classList.contains('usa-search--small')).toBe(true);
    });

    it('should have big class when size is big', async () => {
      element.size = 'big';
      await element.updateComplete;

      const search = element.querySelector('.usa-search');
      expect(search?.classList.contains('usa-search--big')).toBe(true);
    });
  });

  describe('Accessibility Structure', () => {
    it('should have role on form', async () => {
      await element.updateComplete;

      const form = element.querySelector('form');
      expect(form?.getAttribute('role')).toBe('search');
    });

    it('should have label for input', async () => {
      await element.updateComplete;

      const label = element.querySelector('label');
      const input = element.querySelector('input');
      expect(label?.getAttribute('for')).toBe(input?.getAttribute('id'));
    });
  });
});
