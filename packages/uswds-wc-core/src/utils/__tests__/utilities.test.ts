import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getScrollbarWidth } from '../scrollbar-width.js';
import { selectOrMatches } from '../select-or-matches.js';
import { FocusTrap } from '../focus-trap.js';

describe('USWDS Utilities', () => {
  describe('getScrollbarWidth', () => {
    it('should return scrollbar width as string with px unit', () => {
      const width = getScrollbarWidth();
      expect(width).toMatch(/^\d+px$/);
    });

    it('should return consistent width on multiple calls', () => {
      const width1 = getScrollbarWidth();
      const width2 = getScrollbarWidth();
      expect(width1).toBe(width2);
    });
  });

  describe('selectOrMatches', () => {
    let container: HTMLElement;

    beforeEach(() => {
      container = document.createElement('div');
      container.innerHTML = `
        <button class="usa-button">Button 1</button>
        <button class="usa-button">Button 2</button>
        <a href="#" class="usa-link">Link</a>
      `;
      document.body.appendChild(container);
    });

    afterEach(() => {
      container.remove();
    });

    it('should select elements matching selector', () => {
      const buttons = selectOrMatches('.usa-button', container);
      expect(buttons).toHaveLength(2);
    });

    it('should include context element if it matches selector', () => {
      const div = document.createElement('div');
      div.className = 'usa-button';
      div.innerHTML = '<span>Inner</span>';
      document.body.appendChild(div);

      const elements = selectOrMatches('.usa-button', div);
      expect(elements).toHaveLength(1); // Just the div itself (no inner .usa-button)
      expect(elements[0]).toBe(div);

      div.remove();
    });

    it('should return empty array for non-matching selector', () => {
      const elements = selectOrMatches('.nonexistent', container);
      expect(elements).toHaveLength(0);
    });
  });

  describe('FocusTrap', () => {
    let container: HTMLElement;

    beforeEach(() => {
      container = document.createElement('div');
      container.innerHTML = `
        <button id="first">First</button>
        <button id="middle">Middle</button>
        <button id="last">Last</button>
      `;
      document.body.appendChild(container);
    });

    afterEach(() => {
      container.remove();
    });

    it('should create focus trap controller', () => {
      const trap = FocusTrap(container);
      expect(trap).toHaveProperty('on');
      expect(trap).toHaveProperty('off');
      expect(trap).toHaveProperty('update');
    });

    it('should focus first element on activation', () => {
      const trap = FocusTrap(container);
      trap.on();

      const firstButton = container.querySelector('#first') as HTMLElement;
      expect(document.activeElement).toBe(firstButton);

      trap.off();
    });

    it('should handle escape key when binding provided', () => {
      let escapeCalled = false;
      const trap = FocusTrap(container, {
        Escape: () => {
          escapeCalled = true;
        },
      });

      trap.on();

      // Simulate escape key
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);

      expect(escapeCalled).toBe(true);

      trap.off();
    });

    it('should update state based on parameter', () => {
      const trap = FocusTrap(container);

      trap.update(true);
      const firstButton = container.querySelector('#first') as HTMLElement;
      expect(document.activeElement).toBe(firstButton);

      trap.update(false);
      // Focus trap deactivated
    });
  });
});
