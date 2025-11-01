import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import './usa-icon-list.ts';
import type { USAIconList, IconListItem } from './usa-icon-list.js';
import {
  testComponentAccessibility,
  USWDS_A11Y_CONFIG,
} from '@uswds-wc/test-utils/accessibility-utils.js';
import { validateComponentJavaScript } from '@uswds-wc/test-utils/test-utils.js';

describe('USAIconList', () => {
  let element: USAIconList;
  let container: HTMLDivElement;

  const sampleItems: IconListItem[] = [
    { icon: 'check_circle', content: 'First item' },
    { icon: 'star', content: 'Second item' },
    { icon: 'flag', content: 'Third item' },
  ];

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container?.remove();
  });

  describe('Component Initialization', () => {
    beforeEach(() => {
      element = document.createElement('usa-icon-list') as USAIconList;
      container.appendChild(element);
    });

    it('should create icon list element', () => {
      expect(element).toBeInstanceOf(HTMLElement);
      expect(element.tagName).toBe('USA-ICON-LIST');
    });

    it('should have default properties', () => {
      expect(element.items).toEqual([]);
      expect(element.color).toBe('');
      expect(element.size).toBe('');
    });

    it('should render light DOM for USWDS compatibility', () => {
      expect(element.shadowRoot).toBeNull();
    });
  });

  describe('USWDS HTML Structure and Classes', () => {
    beforeEach(async () => {
      element = document.createElement('usa-icon-list') as USAIconList;
      element.items = sampleItems;
      container.appendChild(element);
      await element.updateComplete;
    });

    it('should have usa-icon-list class', async () => {
      await element.updateComplete;
      const ul = element.querySelector('ul');
      expect(ul?.classList.contains('usa-icon-list')).toBe(true);
    });

    it('should render list items', async () => {
      await element.updateComplete;
      const listItems = element.querySelectorAll('li.usa-icon-list__item');
      expect(listItems.length).toBe(3);
    });

    it('should render icons in list items', async () => {
      await element.updateComplete;
      const icons = element.querySelectorAll('usa-icon');
      expect(icons.length).toBe(3);
    });

    it('should render content in list items', async () => {
      await element.updateComplete;
      const contents = element.querySelectorAll('.usa-icon-list__content');
      expect(contents.length).toBe(3);
      expect(contents[0].textContent?.trim()).toBe('First item');
      expect(contents[1].textContent?.trim()).toBe('Second item');
      expect(contents[2].textContent?.trim()).toBe('Third item');
    });

    it('should apply color class when specified', async () => {
      element.color = 'primary';
      await element.updateComplete;

      const ul = element.querySelector('ul');
      expect(ul?.classList.contains('usa-icon-list--primary')).toBe(true);
    });

    it('should apply size class when specified', async () => {
      element.size = 'lg';
      await element.updateComplete;

      const ul = element.querySelector('ul');
      expect(ul?.classList.contains('usa-icon-list--size-lg')).toBe(true);
    });

    it('should combine color and size classes', async () => {
      element.color = 'success';
      element.size = 'xl';
      await element.updateComplete;

      const ul = element.querySelector('ul');
      expect(ul?.classList.contains('usa-icon-list')).toBe(true);
      expect(ul?.classList.contains('usa-icon-list--success')).toBe(true);
      expect(ul?.classList.contains('usa-icon-list--size-xl')).toBe(true);
    });
  });

  describe('Icon Properties', () => {
    beforeEach(async () => {
      element = document.createElement('usa-icon-list') as USAIconList;
      container.appendChild(element);
    });

    it('should render icons with decorative attribute', async () => {
      element.items = sampleItems;
      await element.updateComplete;

      const icons = element.querySelectorAll('usa-icon');
      icons.forEach((icon) => {
        expect(icon.getAttribute('decorative')).toBe('true');
      });
    });

    it('should apply icon color classes when specified', async () => {
      element.items = [
        { icon: 'check_circle', content: 'Success', iconColor: 'text-success' },
        { icon: 'error', content: 'Error', iconColor: 'text-error' },
      ];
      await element.updateComplete;

      const iconContainers = element.querySelectorAll('.usa-icon-list__icon');
      expect(iconContainers[0].classList.contains('text-success')).toBe(true);
      expect(iconContainers[1].classList.contains('text-error')).toBe(true);
    });
  });

  describe('Dynamic Updates', () => {
    beforeEach(async () => {
      element = document.createElement('usa-icon-list') as USAIconList;
      element.items = sampleItems;
      container.appendChild(element);
      await element.updateComplete;
    });

    it('should update when items change', async () => {
      const newItems: IconListItem[] = [
        { icon: 'info', content: 'New item 1' },
        { icon: 'help', content: 'New item 2' },
      ];

      element.items = newItems;
      await element.updateComplete;

      const listItems = element.querySelectorAll('li.usa-icon-list__item');
      expect(listItems.length).toBe(2);

      const contents = element.querySelectorAll('.usa-icon-list__content');
      expect(contents[0].textContent?.trim()).toBe('New item 1');
      expect(contents[1].textContent?.trim()).toBe('New item 2');
    });

    it('should handle empty items array', async () => {
      element.items = [];
      await element.updateComplete;

      const listItems = element.querySelectorAll('li.usa-icon-list__item');
      expect(listItems.length).toBe(0);
    });

    it('should update when color changes', async () => {
      element.color = 'primary';
      await element.updateComplete;

      const ul = element.querySelector('ul');
      expect(ul?.classList.contains('usa-icon-list--primary')).toBe(true);

      element.color = 'secondary';
      await element.updateComplete;

      expect(ul?.classList.contains('usa-icon-list--secondary')).toBe(true);
      expect(ul?.classList.contains('usa-icon-list--primary')).toBe(false);
    });

    it('should update when size changes', async () => {
      element.size = 'lg';
      await element.updateComplete;

      const ul = element.querySelector('ul');
      expect(ul?.classList.contains('usa-icon-list--size-lg')).toBe(true);

      element.size = 'xl';
      await element.updateComplete;

      expect(ul?.classList.contains('usa-icon-list--size-xl')).toBe(true);
      expect(ul?.classList.contains('usa-icon-list--size-lg')).toBe(false);
    });
  });

  describe('Slot Support', () => {
    it('should support slotted content', async () => {
      element = document.createElement('usa-icon-list') as USAIconList;
      element.items = sampleItems;

      const slottedItem = document.createElement('li');
      slottedItem.className = 'usa-icon-list__item';
      slottedItem.textContent = 'Slotted item';
      element.appendChild(slottedItem);

      container.appendChild(element);
      await element.updateComplete;

      const ul = element.querySelector('ul');
      expect(ul?.querySelector('slot')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    beforeEach(async () => {
      element = document.createElement('usa-icon-list') as USAIconList;
      element.items = sampleItems;
      container.appendChild(element);
      await element.updateComplete;
    });

    it('should pass comprehensive accessibility tests', async () => {
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });

    it('should render semantic list structure', async () => {
      const ul = element.querySelector('ul');
      expect(ul?.tagName).toBe('UL');

      const listItems = element.querySelectorAll('li');
      expect(listItems.length).toBeGreaterThan(0);
    });

    it('should have decorative icons', async () => {
      const icons = element.querySelectorAll('usa-icon');
      icons.forEach((icon) => {
        expect(icon.getAttribute('decorative')).toBe('true');
      });
    });
  });

  describe('JavaScript Implementation Validation', () => {
    it('should pass JavaScript implementation validation', async () => {
      const componentPath = `${process.cwd()}/src/components/icon-list/usa-icon-list.ts`;
      const validation = validateComponentJavaScript(componentPath, 'icon-list');

      if (!validation.isValid) {
        console.warn('JavaScript validation issues:', validation.issues);
      }

      // JavaScript validation should pass for critical integration patterns
      expect(validation.score).toBeGreaterThan(50); // Allow some non-critical issues

      // Critical USWDS integration should be present
      const criticalIssues = validation.issues.filter((issue) =>
        issue.includes('Missing USWDS JavaScript integration')
      );
      expect(criticalIssues.length).toBe(0);
    });
  });

  describe('Government Use Cases', () => {
    it('should support feature lists', async () => {
      element = document.createElement('usa-icon-list') as USAIconList;
      element.items = [
        { icon: 'check_circle', content: 'Secure and encrypted' },
        { icon: 'check_circle', content: 'Mobile-friendly' },
        { icon: 'check_circle', content: 'Accessible to all' },
      ];
      element.color = 'success';
      container.appendChild(element);
      await element.updateComplete;

      const ul = element.querySelector('ul');
      expect(ul?.classList.contains('usa-icon-list--success')).toBe(true);

      const listItems = element.querySelectorAll('li.usa-icon-list__item');
      expect(listItems.length).toBe(3);
    });

    it('should support requirements lists', async () => {
      element = document.createElement('usa-icon-list') as USAIconList;
      element.items = [
        { icon: 'error', content: 'Password must be 12+ characters', iconColor: 'text-error' },
        { icon: 'check_circle', content: 'Contains uppercase letter', iconColor: 'text-success' },
        { icon: 'error', content: 'Contains special character', iconColor: 'text-error' },
      ];
      container.appendChild(element);
      await element.updateComplete;

      const listItems = element.querySelectorAll('li.usa-icon-list__item');
      expect(listItems.length).toBe(3);

      const iconContainers = element.querySelectorAll('.usa-icon-list__icon');
      expect(iconContainers[0].classList.contains('text-error')).toBe(true);
      expect(iconContainers[1].classList.contains('text-success')).toBe(true);
    });

    it('should support information lists', async () => {
      element = document.createElement('usa-icon-list') as USAIconList;
      element.items = [
        { icon: 'info', content: 'Processing time: 2-3 weeks' },
        { icon: 'info', content: 'Fee: $50' },
        { icon: 'info', content: 'Valid for: 5 years' },
      ];
      element.color = 'info';
      element.size = 'lg';
      container.appendChild(element);
      await element.updateComplete;

      const ul = element.querySelector('ul');
      expect(ul?.classList.contains('usa-icon-list--info')).toBe(true);
      expect(ul?.classList.contains('usa-icon-list--size-lg')).toBe(true);
    });
  });

  describe('Component Lifecycle Stability', () => {
    beforeEach(() => {
      element = document.createElement('usa-icon-list') as USAIconList;
      document.body.appendChild(element);
    });

    afterEach(() => {
      element?.remove();
    });

    it('should remain in DOM after property updates', async () => {
      element.items = sampleItems;
      element.color = 'primary';
      element.size = 'lg';
      await element.updateComplete;

      expect(document.body.contains(element)).toBe(true);

      element.color = 'secondary';
      element.size = 'xl';
      await element.updateComplete;

      expect(document.body.contains(element)).toBe(true);

      const ul = element.querySelector('ul');
      expect(ul?.classList.contains('usa-icon-list')).toBe(true);
    });

    it('should handle rapid property updates', async () => {
      const propertySets = [
        { color: 'primary' as const, size: 'lg' as const },
        { color: 'secondary' as const, size: 'xl' as const },
        { color: 'success' as const, size: '' as const },
        { color: '' as const, size: 'lg' as const },
      ];

      element.items = sampleItems;
      await element.updateComplete;

      for (const props of propertySets) {
        Object.assign(element, props);
        await element.updateComplete;

        expect(document.body.contains(element)).toBe(true);
        const ul = element.querySelector('ul');
        expect(ul?.classList.contains('usa-icon-list')).toBe(true);
      }
    });
  });
});
