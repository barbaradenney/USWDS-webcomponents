/**
 * USWDS Banner Behavior Contract Tests
 *
 * These tests validate that our banner implementation EXACTLY matches
 * USWDS banner behavior as defined in the official USWDS source.
 *
 * DO NOT modify these tests to make implementation pass.
 * ONLY modify implementation to match USWDS behavior.
 *
 * Source: @uswds/uswds/packages/usa-banner/src/index.js
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { waitForBehaviorInit } from '../../../__tests__/test-utils.js';
import './usa-banner.js';
import type { USABanner } from './usa-banner.js';

describe('USWDS Banner Behavior Contract', () => {
  let element: USABanner;

  beforeEach(() => {
    element = document.createElement('usa-banner') as USABanner;
    document.body.appendChild(element);
  });

  afterEach(async () => {
    // Wait for any pending async operations to complete before cleanup
    // USWDS behavior needs time to fully detach event listeners
    await new Promise(resolve => setTimeout(resolve, 50));
    element.remove();
  });

  describe('Contract 1: Component Structure', () => {
    it('should create banner header with button', async () => {
      await waitForBehaviorInit(element);

      const header = element.querySelector('.usa-banner__header');
      expect(header).not.toBeNull();

      const button = header?.querySelector('[aria-controls]');
      expect(button).not.toBeNull();
    });

    it('should create banner content', async () => {
      await waitForBehaviorInit(element);

      const content = element.querySelector('.usa-banner__content');
      expect(content).not.toBeNull();
    });

    it('should link button to content with aria-controls', async () => {
      await waitForBehaviorInit(element);

      const button = element.querySelector('.usa-banner__header [aria-controls]') as HTMLElement;
      const contentId = button.getAttribute('aria-controls');
      const content = element.querySelector(`#${contentId}`);

      expect(content).not.toBeNull();
    });
  });

  describe('Contract 2: Toggle Behavior', () => {
    it('should start with content hidden', async () => {
      await waitForBehaviorInit(element);

      const button = element.querySelector('.usa-banner__header [aria-controls]') as HTMLElement;
      const contentId = button.getAttribute('aria-controls');
      const content = document.getElementById(contentId!);

      expect(button.getAttribute('aria-expanded')).toBe('false');
      expect(content?.hasAttribute('hidden')).toBe(true);
    });

    it('should expand content when clicking button', async () => {
      await waitForBehaviorInit(element);

      const button = element.querySelector('.usa-banner__header [aria-controls]') as HTMLButtonElement;
      const contentId = button.getAttribute('aria-controls');
      const content = document.getElementById(contentId!);

      button.click();
      await waitForBehaviorInit(element);

      expect(button.getAttribute('aria-expanded')).toBe('true');
      expect(content?.hasAttribute('hidden')).toBe(false);
    });

    it('should collapse content when clicking button again', async () => {
      await waitForBehaviorInit(element);

      const button = element.querySelector('.usa-banner__header [aria-controls]') as HTMLButtonElement;
      const contentId = button.getAttribute('aria-controls');
      const content = document.getElementById(contentId!);

      // Expand
      button.click();
      await waitForBehaviorInit(element);

      expect(button.getAttribute('aria-expanded')).toBe('true');

      // Collapse
      button.click();
      await waitForBehaviorInit(element);

      expect(button.getAttribute('aria-expanded')).toBe('false');
      expect(content?.hasAttribute('hidden')).toBe(true);
    });

    it('should toggle expanded class on header', async () => {
      await waitForBehaviorInit(element);

      const header = element.querySelector('.usa-banner__header') as HTMLElement;
      const button = header.querySelector('[aria-controls]') as HTMLButtonElement;

      expect(header.classList.contains('usa-banner__header--expanded')).toBe(false);

      button.click();
      await waitForBehaviorInit(element);

      expect(header.classList.contains('usa-banner__header--expanded')).toBe(true);

      button.click();
      await waitForBehaviorInit(element);

      expect(header.classList.contains('usa-banner__header--expanded')).toBe(false);
    });
  });

  describe('Contract 3: Accessibility', () => {
    it('should have aria-expanded on button', async () => {
      await waitForBehaviorInit(element);

      const button = element.querySelector('.usa-banner__header [aria-controls]');
      expect(button?.hasAttribute('aria-expanded')).toBe(true);
    });

    it('should have aria-controls linking to content', async () => {
      await waitForBehaviorInit(element);

      const button = element.querySelector('.usa-banner__header [aria-controls]') as HTMLElement;
      const contentId = button.getAttribute('aria-controls');

      expect(contentId).toBeTruthy();
      expect(document.getElementById(contentId!)).not.toBeNull();
    });

    it('should update aria-expanded when toggling', async () => {
      await waitForBehaviorInit(element);

      const button = element.querySelector('.usa-banner__header [aria-controls]') as HTMLButtonElement;

      expect(button.getAttribute('aria-expanded')).toBe('false');

      button.click();
      await waitForBehaviorInit(element);

      expect(button.getAttribute('aria-expanded')).toBe('true');
    });

    it('should hide content with hidden attribute', async () => {
      await waitForBehaviorInit(element);

      const button = element.querySelector('.usa-banner__header [aria-controls]') as HTMLButtonElement;
      const contentId = button.getAttribute('aria-controls');
      const content = document.getElementById(contentId!);

      // Initially hidden
      expect(content?.hasAttribute('hidden')).toBe(true);

      // Show
      button.click();
      await waitForBehaviorInit(element);

      expect(content?.hasAttribute('hidden')).toBe(false);

      // Hide again
      button.click();
      await waitForBehaviorInit(element);

      expect(content?.hasAttribute('hidden')).toBe(true);
    });
  });

  describe('Contract 4: Event Handling', () => {
    it('should prevent default on button click', async () => {
      await waitForBehaviorInit(element);

      const button = element.querySelector('.usa-banner__header [aria-controls]') as HTMLButtonElement;
      let defaultPrevented = false;

      button.addEventListener('click', (event) => {
        defaultPrevented = event.defaultPrevented;
      });

      button.click();
      await waitForBehaviorInit(element);

      expect(defaultPrevented).toBe(true);
    });

    it('should use event delegation for click handling', async () => {
      await waitForBehaviorInit(element);

      const button = element.querySelector('.usa-banner__header [aria-controls]') as HTMLButtonElement;
      const contentId = button.getAttribute('aria-controls');
      const content = document.getElementById(contentId!);

      // Click button
      button.click();
      await waitForBehaviorInit(element);

      expect(content?.hasAttribute('hidden')).toBe(false);
    });
  });

  describe('Prohibited Behaviors (must NOT be present)', () => {
    it('should NOT use display:none for hiding content', async () => {
      await waitForBehaviorInit(element);

      const button = element.querySelector('.usa-banner__header [aria-controls]') as HTMLButtonElement;
      const contentId = button.getAttribute('aria-controls');
      const content = document.getElementById(contentId!) as HTMLElement;

      // Should use hidden attribute, not display:none
      expect(content.style.display).toBe('');
      expect(content.hasAttribute('hidden')).toBe(true);
    });

    it('should NOT modify USWDS class names', async () => {
      await waitForBehaviorInit(element);

      const header = element.querySelector('.usa-banner__header');
      const content = element.querySelector('.usa-banner__content');

      expect(header).not.toBeNull();
      expect(content).not.toBeNull();
    });
  });
});
