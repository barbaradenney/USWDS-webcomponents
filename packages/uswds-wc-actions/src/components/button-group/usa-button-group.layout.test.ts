/**
 * Button Group Layout Tests
 * Prevents regression of button alignment and spacing issues within groups
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../button-group/index.ts';
import type { USAButtonGroup } from './usa-button-group.js';
import { validateComponentJavaScript } from '@uswds-wc/test-utils/test-utils.js';

describe('USAButtonGroup Layout Tests', () => {
  let element: USAButtonGroup;

  beforeEach(() => {
    element = document.createElement('usa-button-group') as USAButtonGroup;
    element.buttons = [
      { text: 'Primary', variant: 'primary' },
      { text: 'Secondary', variant: 'secondary' },
      { text: 'Outline', variant: 'outline' },
      { text: 'Disabled', variant: 'primary', disabled: true },
    ];
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should have correct USWDS button group DOM structure', async () => {
    await element.updateComplete;

    const buttonGroup = element.querySelector('.usa-button-group');
    const buttonItems = element.querySelectorAll('.usa-button-group__item');
    const buttons = element.querySelectorAll('.usa-button');

    expect(buttonGroup, 'Should have button group container').toBeTruthy();
    expect(buttonItems.length, 'Should have button items').toBe(4);
    expect(buttons.length, 'Should have buttons').toBe(4);

    // Check nesting structure
    buttonItems.forEach((item, index) => {
      const button = item.querySelector('.usa-button');
      expect(
        buttonGroup!.contains(item),
        `Button item ${index} should be inside button group`
      ).toBe(true);
      expect(item.contains(button!), `Button ${index} should be inside its item`).toBe(true);
    });
  });

  it('should position buttons correctly within button group items', async () => {
    await element.updateComplete;

    const buttonGroup = element.querySelector('.usa-button-group');
    const buttonItems = element.querySelectorAll('.usa-button-group__item');
    const buttons = element.querySelectorAll('.usa-button');

    expect(buttonGroup!.tagName, 'Button group should be a list element').toBe('UL');

    // Each button should be properly contained within its item
    buttons.forEach((button, index) => {
      const item = buttonItems[index];
      expect(item.contains(button), `Button ${index} should be inside its corresponding item`).toBe(
        true
      );
      expect(item.tagName, `Button item ${index} should be a list item`).toBe('LI');
    });
  });

  it('should handle button variants correctly', async () => {
    await element.updateComplete;

    const buttons = element.querySelectorAll('.usa-button');

    // Check button classes match variants
    expect(
      buttons[0].classList.contains('usa-button'),
      'Primary button should have base class'
    ).toBe(true);
    expect(
      buttons[1].classList.contains('usa-button--secondary'),
      'Secondary button should have secondary class'
    ).toBe(true);
    expect(
      buttons[2].classList.contains('usa-button--outline'),
      'Outline button should have outline class'
    ).toBe(true);
    expect((buttons[3] as HTMLButtonElement).disabled, 'Disabled button should be disabled').toBe(
      true
    );
  });

  it('should handle segmented button group variant correctly', async () => {
    element.type = 'segmented';
    await element.updateComplete;

    const buttonGroup = element.querySelector('.usa-button-group');
    expect(
      buttonGroup!.classList.contains('usa-button-group--segmented'),
      'Should have segmented class when type is segmented'
    ).toBe(true);
  });

  it('should handle default button group correctly', async () => {
    element.type = 'default';
    await element.updateComplete;

    const buttonGroup = element.querySelector('.usa-button-group');
    expect(
      buttonGroup!.classList.contains('usa-button-group--segmented'),
      'Should not have segmented class when type is default'
    ).toBe(false);
  });

  it('should handle slotted content correctly', async () => {
    // Create a new element with slotted content instead of buttons array
    const slottedElement = document.createElement('usa-button-group') as USAButtonGroup;
    slottedElement.innerHTML = `
      <li class="usa-button-group__item">
        <button class="usa-button" type="button">Slotted Button 1</button>
      </li>
      <li class="usa-button-group__item">
        <button class="usa-button usa-button--secondary" type="button">Slotted Button 2</button>
      </li>
    `;
    document.body.appendChild(slottedElement);

    await slottedElement.updateComplete;

    const buttonGroup = slottedElement.querySelector('.usa-button-group');
    const slottedButtons = slottedElement.querySelectorAll('button');

    expect(buttonGroup, 'Should have button group container with slotted content').toBeTruthy();
    expect(slottedButtons.length, 'Should have slotted buttons').toBe(2);

    slottedElement.remove();
    describe('JavaScript Implementation Validation', () => {
      it('should pass JavaScript implementation validation', async () => {
        // Validate USWDS JavaScript implementation patterns
        const componentPath = `${process.cwd()}/src/components/button-group/usa-button-group.ts`;
        const validation = validateComponentJavaScript(componentPath, 'button-group');

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
  });

  describe('Visual Regression Prevention', () => {
    it('should pass visual layout checks for button alignment', async () => {
      await element.updateComplete;

      const buttonGroup = element.querySelector('.usa-button-group') as HTMLElement;
      const buttonItems = element.querySelectorAll(
        '.usa-button-group__item'
      ) as NodeListOf<HTMLElement>;
      const buttons = element.querySelectorAll('.usa-button') as NodeListOf<HTMLElement>;

      const groupRect = buttonGroup.getBoundingClientRect();

      // All button items should be within the button group
      buttonItems.forEach((item, index) => {
        const itemRect = item.getBoundingClientRect();
        expect(
          itemRect.top >= groupRect.top && itemRect.bottom <= groupRect.bottom,
          `Button item ${index} should be vertically within button group`
        ).toBe(true);
      });

      // All buttons should be within their respective items
      buttons.forEach((button, index) => {
        const buttonRect = button.getBoundingClientRect();
        const itemRect = buttonItems[index].getBoundingClientRect();

        expect(
          buttonRect.top >= itemRect.top && buttonRect.bottom <= itemRect.bottom,
          `Button ${index} should be vertically within its item`
        ).toBe(true);

        expect(
          buttonRect.left >= itemRect.left && buttonRect.right <= itemRect.right,
          `Button ${index} should be horizontally within its item`
        ).toBe(true);
      });
    });

    it('should pass visual layout checks for button spacing', async () => {
      await element.updateComplete;

      const buttons = element.querySelectorAll('.usa-button') as NodeListOf<HTMLElement>;

      // Check that buttons are horizontally aligned (same top position within tolerance)
      if (buttons.length > 1) {
        const firstButtonRect = buttons[0].getBoundingClientRect();

        for (let i = 1; i < buttons.length; i++) {
          const buttonRect = buttons[i].getBoundingClientRect();

          // Buttons should be horizontally aligned (within 5px tolerance)
          expect(
            Math.abs(buttonRect.top - firstButtonRect.top) <= 5,
            `Button ${i} should be horizontally aligned with first button`
          ).toBe(true);

          // Each button (except first) should be positioned to the right of previous
          const prevButtonRect = buttons[i - 1].getBoundingClientRect();
          expect(
            buttonRect.left >= prevButtonRect.left,
            `Button ${i} should be positioned at or to the right of previous button`
          ).toBe(true);
        }
      }
    });

    it('should pass visual layout checks for segmented button group', async () => {
      element.type = 'segmented';
      await element.updateComplete;

      const buttonGroup = element.querySelector('.usa-button-group') as HTMLElement;
      const buttons = element.querySelectorAll('.usa-button') as NodeListOf<HTMLElement>;

      const groupRect = buttonGroup.getBoundingClientRect();

      // In segmented button groups, buttons should be more tightly connected
      buttons.forEach((button, index) => {
        const buttonRect = button.getBoundingClientRect();

        expect(
          buttonRect.top >= groupRect.top && buttonRect.bottom <= groupRect.bottom,
          `Segmented button ${index} should be vertically within group`
        ).toBe(true);

        // Check that buttons maintain consistent height in segmented view
        if (index > 0) {
          const firstButtonRect = buttons[0].getBoundingClientRect();
          expect(
            Math.abs(buttonRect.height - firstButtonRect.height) <= 2,
            `Segmented button ${index} should have similar height to other buttons`
          ).toBe(true);
        }
      });
    });

    it('should maintain proper button interaction states', async () => {
      await element.updateComplete;

      const buttons = element.querySelectorAll('.usa-button') as NodeListOf<HTMLButtonElement>;

      // Test button focus states
      buttons.forEach((button, index) => {
        if (!button.disabled) {
          button.focus();
          expect(document.activeElement, `Button ${index} should be focusable`).toBe(button);
        }
      });

      // Test disabled button
      const disabledButton = buttons[3];
      expect(disabledButton.disabled, 'Fourth button should be disabled').toBe(true);

      // Try to focus disabled button - it should not receive focus
      disabledButton.focus();
      expect(document.activeElement, 'Disabled button should not be focusable').not.toBe(
        disabledButton
      );
    });

    it('should handle button click interactions correctly', async () => {
      await element.updateComplete;

      const buttons = element.querySelectorAll('.usa-button') as NodeListOf<HTMLButtonElement>;

      // Set up event listener to test custom events
      let clickEventFired = false;
      let clickEventDetail: any = null;
      element.addEventListener('button-click', (e: any) => {
        clickEventFired = true;
        clickEventDetail = e.detail;
      });

      // Click first button
      buttons[0].click();
      await element.updateComplete;

      expect(clickEventFired, 'Button click event should be fired').toBe(true);
      expect(clickEventDetail.index, 'Event should contain correct button index').toBe(0);
      expect(clickEventDetail.button.text, 'Event should contain correct button data').toBe(
        'Primary'
      );
    });

    it('should handle different button types correctly', async () => {
      // Update buttons with different types
      element.buttons = [
        { text: 'Submit', variant: 'primary', type: 'submit' },
        { text: 'Reset', variant: 'secondary', type: 'reset' },
        { text: 'Button', variant: 'outline', type: 'button' },
      ];
      await element.updateComplete;

      const buttons = element.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;

      expect(buttons[0].type, 'First button should have submit type').toBe('submit');
      expect(buttons[1].type, 'Second button should have reset type').toBe('reset');
      expect(buttons[2].type, 'Third button should have button type').toBe('button');
    });

    it('should maintain layout consistency across different viewport conditions', async () => {
      await element.updateComplete;

      const buttonGroup = element.querySelector('.usa-button-group') as HTMLElement;
      const buttonItems = element.querySelectorAll(
        '.usa-button-group__item'
      ) as NodeListOf<HTMLElement>;

      // Test that button group maintains list semantics
      expect(buttonGroup.tagName, 'Button group should be an unordered list').toBe('UL');
      expect(
        buttonGroup.getAttribute('role'),
        'Button group should not override list role'
      ).toBeNull();

      // Test that all items are proper list items
      buttonItems.forEach((item, index) => {
        expect(item.tagName, `Item ${index} should be a list item`).toBe('LI');
      });
    });

    it('should handle empty button group gracefully', async () => {
      // Test with empty buttons array
      element.buttons = [];
      await element.updateComplete;

      const buttonGroup = element.querySelector('.usa-button-group');
      const buttonItems = element.querySelectorAll('.usa-button-group__item');

      expect(buttonGroup, 'Should still have button group container').toBeTruthy();
      expect(buttonItems.length, 'Should have no button items when empty').toBe(0);
    });
  });
});
