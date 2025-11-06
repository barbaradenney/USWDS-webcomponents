/**
 * Reusable Test Utilities for Slot and Composition Testing
 *
 * Provides helper functions to catch common Light DOM, slot, and composition issues.
 */

import { expect } from 'vitest';

/**
 * Verify slotted content renders correctly in Light DOM
 *
 * @param {HTMLElement} component - The component to verify
 * @param {string|undefined} slotName - The name of the slot to check
 * @param {string} expectedContent - The expected content
 * @returns {Promise<void>}
 *
 * @example
 * ```typescript
 * const select = document.createElement('usa-select');
 * select.innerHTML = '<option value="1">Option 1</option>';
 * document.body.appendChild(select);
 *
 * await verifySlottedContent(select, undefined, 'Option 1');
 * ```
 */
export async function verifySlottedContent(component, slotName, expectedContent) {
  await component.updateComplete;

  const slot = slotName
    ? component.querySelector(`slot[name="${slotName}"]`)
    : component.querySelector('slot');

  if (!slot) {
    throw new Error(`Slot ${slotName || 'default'} not found in component`);
  }

  const assignedNodes = slot.assignedNodes();
  const textContent = assignedNodes
    .map((node) => node.textContent?.trim())
    .filter(Boolean)
    .join(' ');

  expect(textContent).toContain(expectedContent);
}

/**
 * Verify component participates correctly in flex layout
 *
 * Catches issues where components with `display: block` break flex containers.
 *
 * @param {HTMLElement} component - The component to verify
 * @returns {Promise<void>}
 *
 * @example
 * ```typescript
 * const select = document.createElement('usa-select');
 * document.body.appendChild(select);
 * await verifyFlexLayoutParticipation(select);
 * ```
 */
export async function verifyFlexLayoutParticipation(component) {
  const style = window.getComputedStyle(component);

  // Should be inline-block or inline-flex to work in flex containers
  const validDisplayValues = ['inline-block', 'inline-flex', 'inline'];
  expect(validDisplayValues.includes(style.display)).toBe(true);

  // Should fill available width
  expect(style.width).toBe('100%');
}

/**
 * Verify child component rendered and initialized
 *
 * Catches issues where child components don't initialize or render correctly
 * in composed patterns.
 *
 * @param {HTMLElement} parent - The parent component
 * @param {string} selector - CSS selector for the child component
 * @returns {Promise<HTMLElement>}
 *
 * @example
 * ```typescript
 * const pattern = document.createElement('usa-date-of-birth-pattern');
 * document.body.appendChild(pattern);
 * const monthSelect = await verifyChildComponent(pattern, 'usa-select[name="date_of_birth_month"]');
 * ```
 */
export async function verifyChildComponent(parent, selector) {
  const child = parent.querySelector(selector);
  expect(child, `Child component not found: ${selector}`).toBeTruthy();

  // Wait for child component to initialize
  if (child?.updateComplete) {
    await child.updateComplete;
  }

  return child;
}

/**
 * Verify child components are in a horizontal row (flex layout)
 *
 * Catches layout issues where components stack vertically instead of horizontally.
 *
 * @param {HTMLElement} parent - The parent component
 * @param {string[]} childSelectors - Array of CSS selectors for child components
 * @param {number} maxYDifference - Maximum allowed Y-coordinate difference (default: 10)
 * @returns {Promise<void>}
 *
 * @example
 * ```typescript
 * const pattern = document.createElement('usa-date-of-birth-pattern');
 * document.body.appendChild(pattern);
 * await verifyHorizontalLayout(pattern, [
 *   'usa-select[name="date_of_birth_month"]',
 *   'usa-text-input[name="date_of_birth_day"]',
 *   'usa-text-input[name="date_of_birth_year"]'
 * ]);
 * ```
 */
export async function verifyHorizontalLayout(parent, childSelectors, maxYDifference = 10) {
  const children = childSelectors.map((selector) => {
    const child = parent.querySelector(selector);
    expect(child, `Child not found: ${selector}`).toBeTruthy();
    return child;
  });

  // Wait for all children to render
  await Promise.all(
    children.map((child) => child?.updateComplete || Promise.resolve())
  );

  // Get bounding boxes
  const boxes = children.map((child) => child.getBoundingClientRect());

  // Verify all have similar Y coordinates (within maxYDifference pixels)
  const yCoords = boxes.map((box) => box.y);
  const maxY = Math.max(...yCoords);
  const minY = Math.min(...yCoords);

  expect(
    maxY - minY,
    `Components not in horizontal row. Y difference: ${maxY - minY}px (max: ${maxYDifference}px)`
  ).toBeLessThan(maxYDifference);

  // Verify they're in left-to-right order
  for (let i = 0; i < boxes.length - 1; i++) {
    expect(
      boxes[i].x,
      `Component ${i} not left of component ${i + 1}`
    ).toBeLessThan(boxes[i + 1].x);
  }
}

/**
 * Verify USWDS structure compliance
 *
 * Validates that patterns follow official USWDS HTML structure.
 *
 * @param {HTMLElement} pattern - The pattern component to verify
 * @param {Object} config - Configuration object
 * @param {string} [config.fieldsetClass] - Expected fieldset class name
 * @param {string} [config.legendClass] - Expected legend class name
 * @param {string[]} [config.expectedChildren] - Array of expected child selectors
 * @returns {Promise<void>}
 *
 * @example
 * ```typescript
 * await verifyUSWDSStructure(pattern, {
 *   fieldsetClass: 'usa-fieldset',
 *   legendClass: 'usa-legend usa-legend--large',
 *   expectedChildren: [
 *     'usa-select[name="date_of_birth_month"]',
 *     'usa-text-input[name="date_of_birth_day"]',
 *     'usa-text-input[name="date_of_birth_year"]'
 *   ]
 * });
 * ```
 */
export async function verifyUSWDSStructure(pattern, config) {
  const fieldset = pattern.querySelector('fieldset');
  expect(fieldset, 'Fieldset not found').toBeTruthy();

  if (config.fieldsetClass) {
    expect(fieldset?.className).toBe(config.fieldsetClass);
  }

  const legend = fieldset?.querySelector('legend');
  expect(legend, 'Legend not found').toBeTruthy();

  if (config.legendClass) {
    expect(legend?.className).toBe(config.legendClass);
  }

  if (config.expectedChildren) {
    for (const selector of config.expectedChildren) {
      const child = pattern.querySelector(selector);
      expect(child, `Expected child not found: ${selector}`).toBeTruthy();
    }
  }
}

/**
 * Verify property binding creates expected DOM elements
 *
 * Catches issues where property bindings don't work in Light DOM.
 *
 * @param {HTMLElement} component - The component to verify
 * @param {string} containerSelector - CSS selector for the container element
 * @param {string} elementSelector - CSS selector for the elements to count
 * @param {number} expectedCount - Expected number of elements
 * @returns {Promise<void>}
 *
 * @example
 * ```typescript
 * const select = document.createElement('usa-select');
 * select.options = [
 *   { value: '01', text: 'January' },
 *   { value: '02', text: 'February' }
 * ];
 * document.body.appendChild(select);
 *
 * await verifyPropertyBinding(select, 'select', 'option', 2);
 * ```
 */
export async function verifyPropertyBinding(component, containerSelector, elementSelector, expectedCount) {
  await component.updateComplete;

  const container = component.querySelector(containerSelector);
  expect(container, `Container not found: ${containerSelector}`).toBeTruthy();

  const elements = container?.querySelectorAll(elementSelector);
  expect(
    elements?.length,
    `Expected ${expectedCount} ${elementSelector} elements, found ${elements?.length}`
  ).toBe(expectedCount);
}

/**
 * Verify component has no combo-box wrapper
 *
 * Specific test for selects that should NOT have combo-box enhancement.
 *
 * @param {HTMLElement} selectComponent - The select component to verify
 * @returns {Promise<void>}
 *
 * @example
 * ```typescript
 * const select = pattern.querySelector('usa-select[name="date_of_birth_month"]');
 * await verifyNoComboBoxWrapper(select);
 * ```
 */
export async function verifyNoComboBoxWrapper(selectComponent) {
  await selectComponent?.updateComplete;

  // Verify no-combo-box attribute is set
  expect(
    selectComponent.hasAttribute('no-combo-box'),
    'no-combo-box attribute not set'
  ).toBe(true);

  // Verify no combo-box wrapper in DOM
  const comboBox = selectComponent.querySelector('.usa-combo-box');
  expect(comboBox, 'Combo-box wrapper should not exist').toBeFalsy();

  // Verify select is direct child of usa-select component
  const select = selectComponent.querySelector('select.usa-select');
  expect(select, 'Native select not found').toBeTruthy();
}

/**
 * Verify event propagation from child to parent
 *
 * Catches issues where child component events don't bubble correctly.
 *
 * @param {HTMLElement} parent - The parent component
 * @param {string} expectedParentEvent - The event name expected on parent
 * @param {string} childComponentSelector - CSS selector for the child component
 * @param {string} nativeElementSelector - CSS selector for the native element
 * @param {string} nativeEvent - The native event name to dispatch
 * @param {Function} triggerAction - Function to trigger the action
 * @returns {Promise<void>}
 *
 * @example
 * ```typescript
 * const pattern = document.createElement('usa-date-of-birth-pattern');
 * document.body.appendChild(pattern);
 *
 * await verifyEventPropagation(
 *   pattern,
 *   'dob-change',
 *   'usa-select[name="date_of_birth_month"]',
 *   'select',
 *   'change',
 *   (select) => { select.value = '05'; }
 * );
 * ```
 */
export async function verifyEventPropagation(
  parent,
  expectedParentEvent,
  childComponentSelector,
  nativeElementSelector,
  nativeEvent,
  triggerAction
) {
  await parent.updateComplete;

  const events = [];
  parent.addEventListener(expectedParentEvent, (e) => {
    events.push(e.detail);
  });

  const childComponent = parent.querySelector(childComponentSelector);
  expect(childComponent, `Child component not found: ${childComponentSelector}`).toBeTruthy();

  await childComponent?.updateComplete;

  const nativeElement = childComponent?.querySelector(nativeElementSelector);
  expect(nativeElement, `Native element not found: ${nativeElementSelector}`).toBeTruthy();

  // Trigger the action
  triggerAction(nativeElement);

  // Dispatch the event
  nativeElement?.dispatchEvent(new Event(nativeEvent, { bubbles: true }));

  // Verify event was received
  expect(events.length, `No ${expectedParentEvent} event received`).toBeGreaterThan(0);
}

/**
 * Verify component compact mode works correctly
 *
 * Catches issues where compact mode doesn't remove form-group wrappers.
 *
 * @param {HTMLElement} component - The component to verify
 * @returns {Promise<void>}
 *
 * @example
 * ```typescript
 * const input = document.createElement('usa-text-input');
 * input.compact = true;
 * document.body.appendChild(input);
 * await verifyCompactMode(input);
 * ```
 */
export async function verifyCompactMode(component) {
  await component.updateComplete;

  // Verify compact attribute is set
  expect(
    component.hasAttribute('compact'),
    'compact attribute not set'
  ).toBe(true);

  // Verify no form-group wrapper
  const formGroup = component.querySelector('.usa-form-group');
  expect(
    formGroup,
    'Form-group wrapper should not exist in compact mode'
  ).toBeFalsy();

  // Verify label and input are direct children
  const label = component.querySelector('label.usa-label');
  const input = component.querySelector('input.usa-input, select.usa-select, textarea.usa-textarea');

  expect(label, 'Label not found').toBeTruthy();
  expect(input, 'Input not found').toBeTruthy();

  // In Light DOM, label and input should be direct children of the component
  expect(label?.parentElement, 'Label should be direct child').toBe(component);
  expect(input?.parentElement, 'Input should be direct child').toBe(component);
}
