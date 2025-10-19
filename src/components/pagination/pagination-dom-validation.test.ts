import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import './usa-pagination.ts';
import type { USAPagination } from './usa-pagination.js';
/**
 * Pagination DOM Structure Validation Tests
 *
 * Catches visual/structural issues like:
 * - Missing pagination items
 * - Disabled states not applying
 * - Current page not marked
 */

describe('Pagination DOM Structure Validation', () => {
  let element: USAPagination;
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    element = document.createElement('usa-pagination') as USAPagination;
    element.currentPage = 1;
    element.totalPages = 5;
    container.appendChild(element);
  });

  afterEach(() => {
    container.remove();
  });

  describe('Basic DOM Structure', () => {
    it('should have pagination nav element', async () => {
      await element.updateComplete;

      const nav = element.querySelector('nav.usa-pagination');
      expect(nav).toBeTruthy();
    });

    it('should have pagination list', async () => {
      await element.updateComplete;

      const list = element.querySelector('.usa-pagination__list');
      expect(list).toBeTruthy();
    });

    it('should have pagination items', async () => {
      await element.updateComplete;

      const items = element.querySelectorAll('.usa-pagination__item');
      expect(items.length).toBeGreaterThan(0);
    });
  });

  describe('Current Page', () => {
    it('should mark current page', async () => {
      element.currentPage = 2;
      await element.updateComplete;

      const currentPage = element.querySelector('.usa-current');
      expect(currentPage).toBeTruthy();
    });
  });

  describe('Navigation Buttons', () => {
    it('should NOT have previous button on first page', async () => {
      element.currentPage = 1;
      await element.updateComplete;

      const prevButton = element.querySelector('.usa-pagination__previous-page');
      expect(prevButton).toBeFalsy();
    });

    it('should have previous button when not on first page', async () => {
      element.currentPage = 3;
      await element.updateComplete;

      const prevButton = element.querySelector('.usa-pagination__previous-page');
      expect(prevButton).toBeTruthy();
    });

    it('should have next button when not on last page', async () => {
      element.currentPage = 3;
      await element.updateComplete;

      const nextButton = element.querySelector('.usa-pagination__next-page');
      expect(nextButton).toBeTruthy();
    });

    it('should NOT have next button on last page', async () => {
      element.currentPage = element.totalPages;
      await element.updateComplete;

      const nextButton = element.querySelector('.usa-pagination__next-page');
      expect(nextButton).toBeFalsy();
    });
  });

  describe('Accessibility Structure', () => {
    it('should have navigation role', async () => {
      await element.updateComplete;

      const nav = element.querySelector('nav');
      expect(nav?.getAttribute('role')).toBeTruthy();
    });

    it('should have aria-label on current page', async () => {
      await element.updateComplete;

      const currentPage = element.querySelector('.usa-current');
      expect(currentPage?.hasAttribute('aria-label') || currentPage?.hasAttribute('aria-current')).toBe(true);
    });
  });
});
