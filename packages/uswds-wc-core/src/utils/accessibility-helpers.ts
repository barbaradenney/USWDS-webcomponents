/**
 * Enhanced Accessibility Utilities for USWDS Web Components
 *
 * Provides comprehensive accessibility support including dynamic ARIA
 * management, keyboard navigation, focus management, and screen reader
 * compatibility utilities.
 */

import type { AccessibilityProps } from '../types/index.js';

/**
 * Dynamic ARIA attribute manager
 */
export class ARIAManager {
  private element: HTMLElement;
  private observers: Map<string, MutationObserver> = new Map();

  constructor(element: HTMLElement) {
    this.element = element;
  }

  /**
   * Set ARIA attribute with validation
   */
  setAttribute<K extends keyof AccessibilityProps>(
    attribute: K,
    value: AccessibilityProps[K]
  ): this {
    if (value !== undefined && value !== null) {
      // Convert boolean values to strings for ARIA attributes
      const stringValue = typeof value === 'boolean' ? value.toString() : String(value);
      this.element.setAttribute(attribute, stringValue);
    } else {
      this.element.removeAttribute(attribute);
    }
    return this;
  }

  /**
   * Get ARIA attribute value
   */
  getAttribute<K extends keyof AccessibilityProps>(attribute: K): AccessibilityProps[K] | null {
    const value = this.element.getAttribute(attribute);
    if (value === null) return null;

    // Convert string back to boolean for boolean ARIA attributes
    if (
      attribute === 'aria-expanded' ||
      attribute === 'aria-selected' ||
      attribute === 'aria-pressed' ||
      attribute === 'aria-hidden' ||
      attribute === 'aria-atomic' ||
      attribute === 'aria-invalid' ||
      attribute === 'aria-required' ||
      attribute === 'aria-disabled'
    ) {
      return (value === 'true') as AccessibilityProps[K];
    }

    return value as AccessibilityProps[K];
  }

  /**
   * Toggle boolean ARIA attribute
   */
  toggleAttribute(
    attribute: 'aria-expanded' | 'aria-selected' | 'aria-pressed' | 'aria-hidden'
  ): boolean {
    const currentValue = this.getAttribute(attribute);
    const newValue = !currentValue;
    this.setAttribute(attribute, newValue);
    return newValue;
  }

  /**
   * Set live region for dynamic content updates
   */
  setLiveRegion(
    politeness: 'off' | 'polite' | 'assertive' = 'polite',
    atomic: boolean = false
  ): this {
    this.setAttribute('aria-live', politeness);
    this.setAttribute('aria-atomic', atomic);
    return this;
  }

  /**
   * Set up dynamic ARIA label based on content
   */
  dynamicLabel(labelSelector?: string, fallback?: string): this {
    const updateLabel = () => {
      let label = fallback || '';

      if (labelSelector) {
        const labelElement = this.element.querySelector(labelSelector);
        if (labelElement) {
          label = labelElement.textContent?.trim() || label;
        }
      }

      if (!label) {
        label = this.element.textContent?.trim() || '';
      }

      if (label) {
        this.setAttribute('aria-label', label);
      }
    };

    // Initial update
    updateLabel();

    // Watch for changes
    const observer = new MutationObserver(updateLabel);
    observer.observe(this.element, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    this.observers.set('label', observer);
    return this;
  }

  /**
   * Set up described-by relationship with dynamic content
   */
  dynamicDescribedBy(descriptionSelector: string, generateId: boolean = true): this {
    const updateDescribedBy = () => {
      const descElement = this.element.querySelector(descriptionSelector);
      if (descElement) {
        let id = descElement.id;
        if (!id && generateId) {
          id = `desc-${Math.random().toString(36).substr(2, 9)}`;
          descElement.id = id;
        }
        if (id) {
          this.setAttribute('aria-describedby', id);
        }
      }
    };

    updateDescribedBy();

    const observer = new MutationObserver(updateDescribedBy);
    observer.observe(this.element, {
      childList: true,
      subtree: true,
    });

    this.observers.set('describedby', observer);
    return this;
  }

  /**
   * Clean up observers
   */
  destroy(): void {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers.clear();
  }
}

/**
 * Focus management utilities
 */
export class FocusManager {
  private element: HTMLElement;
  private focusableElements: HTMLElement[] = [];
  private currentIndex = -1;

  constructor(element: HTMLElement) {
    this.element = element;
    this.updateFocusableElements();
  }

  /**
   * Update list of focusable elements
   */
  updateFocusableElements(): void {
    const selector = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(', ');

    this.focusableElements = Array.from(this.element.querySelectorAll(selector)) as HTMLElement[];

    // Update current index
    const focused = document.activeElement as HTMLElement;
    this.currentIndex = this.focusableElements.indexOf(focused);
  }

  /**
   * Focus first focusable element
   */
  focusFirst(): boolean {
    this.updateFocusableElements();
    if (this.focusableElements.length > 0) {
      this.focusableElements[0].focus();
      this.currentIndex = 0;
      return true;
    }
    return false;
  }

  /**
   * Focus last focusable element
   */
  focusLast(): boolean {
    this.updateFocusableElements();
    if (this.focusableElements.length > 0) {
      const lastIndex = this.focusableElements.length - 1;
      this.focusableElements[lastIndex].focus();
      this.currentIndex = lastIndex;
      return true;
    }
    return false;
  }

  /**
   * Focus next focusable element
   */
  focusNext(): boolean {
    this.updateFocusableElements();
    if (this.focusableElements.length === 0) return false;

    this.currentIndex = (this.currentIndex + 1) % this.focusableElements.length;
    this.focusableElements[this.currentIndex].focus();
    return true;
  }

  /**
   * Focus previous focusable element
   */
  focusPrevious(): boolean {
    this.updateFocusableElements();
    if (this.focusableElements.length === 0) return false;

    this.currentIndex =
      this.currentIndex <= 0 ? this.focusableElements.length - 1 : this.currentIndex - 1;
    this.focusableElements[this.currentIndex].focus();
    return true;
  }

  /**
   * Trap focus within element
   */
  trapFocus(event: KeyboardEvent): boolean {
    if (event.key !== 'Tab') return false;

    this.updateFocusableElements();
    if (this.focusableElements.length === 0) return false;

    const isTabOnly = !event.shiftKey;
    const isShiftTab = event.shiftKey;

    if (isTabOnly && this.currentIndex === this.focusableElements.length - 1) {
      event.preventDefault();
      this.focusFirst();
      return true;
    }

    if (isShiftTab && this.currentIndex === 0) {
      event.preventDefault();
      this.focusLast();
      return true;
    }

    return false;
  }

  /**
   * Get all focusable elements
   */
  getFocusableElements(): HTMLElement[] {
    this.updateFocusableElements();
    return [...this.focusableElements];
  }
}

/**
 * Keyboard navigation handler
 */
export class KeyboardNavigationHandler {
  private element: HTMLElement;
  private keyHandlers: Map<string, (event: KeyboardEvent) => boolean> = new Map();
  private focusManager: FocusManager;

  constructor(element: HTMLElement) {
    this.element = element;
    this.focusManager = new FocusManager(element);
    this.setupEventListeners();
  }

  /**
   * Add keyboard shortcut handler
   */
  addHandler(
    key: string,
    handler: (event: KeyboardEvent) => boolean,
    options?: { ctrl?: boolean; shift?: boolean; alt?: boolean }
  ): this {
    const keyCode = this.normalizeKey(key, options);
    this.keyHandlers.set(keyCode, handler);
    return this;
  }

  /**
   * Remove keyboard shortcut handler
   */
  removeHandler(key: string, options?: { ctrl?: boolean; shift?: boolean; alt?: boolean }): this {
    const keyCode = this.normalizeKey(key, options);
    this.keyHandlers.delete(keyCode);
    return this;
  }

  /**
   * Add standard ARIA keyboard navigation
   */
  addStandardNavigation(): this {
    // Arrow key navigation
    this.addHandler('ArrowDown', () => this.focusManager.focusNext());
    this.addHandler('ArrowUp', () => this.focusManager.focusPrevious());
    this.addHandler('Home', () => this.focusManager.focusFirst());
    this.addHandler('End', () => this.focusManager.focusLast());

    // Tab trapping
    this.addHandler('Tab', (event) => this.focusManager.trapFocus(event));

    return this;
  }

  /**
   * Add escape key handler
   */
  addEscapeHandler(handler: (event: KeyboardEvent) => boolean): this {
    return this.addHandler('Escape', handler);
  }

  /**
   * Add enter/space activation handler
   */
  addActivationHandler(handler: (event: KeyboardEvent) => boolean): this {
    this.addHandler('Enter', handler);
    this.addHandler(' ', handler); // Space key
    return this;
  }

  private normalizeKey(
    key: string,
    options?: { ctrl?: boolean; shift?: boolean; alt?: boolean }
  ): string {
    let normalizedKey = key;
    if (options?.ctrl) normalizedKey = `ctrl+${normalizedKey}`;
    if (options?.shift) normalizedKey = `shift+${normalizedKey}`;
    if (options?.alt) normalizedKey = `alt+${normalizedKey}`;
    return normalizedKey;
  }

  private setupEventListeners(): void {
    this.element.addEventListener('keydown', (event) => {
      const keyCode = this.buildKeyCode(event);
      const handler = this.keyHandlers.get(keyCode);

      if (handler) {
        const handled = handler(event);
        if (handled) {
          event.preventDefault();
          event.stopPropagation();
        }
      }
    });
  }

  private buildKeyCode(event: KeyboardEvent): string {
    let keyCode = event.key;
    if (event.ctrlKey) keyCode = `ctrl+${keyCode}`;
    if (event.shiftKey) keyCode = `shift+${keyCode}`;
    if (event.altKey) keyCode = `alt+${keyCode}`;
    return keyCode;
  }

  /**
   * Destroy keyboard handler
   */
  destroy(): void {
    this.keyHandlers.clear();
  }
}

/**
 * Screen reader utilities
 */
export class ScreenReaderUtils {
  /**
   * Announce message to screen readers
   */
  static announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'usa-sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  /**
   * Create screen reader only text
   */
  static createSROnlyText(text: string): HTMLElement {
    const element = document.createElement('span');
    element.className = 'usa-sr-only';
    element.textContent = text;
    return element;
  }

  /**
   * Update screen reader only text
   */
  static updateSROnlyText(element: HTMLElement, text: string): void {
    element.textContent = text;
  }

  /**
   * Create visually hidden element that's available to screen readers
   */
  static createVisuallyHidden(content: string): HTMLElement {
    const element = document.createElement('span');
    element.className = 'usa-sr-only';
    element.innerHTML = content;
    return element;
  }
}

/**
 * Comprehensive accessibility helper class
 */
export class AccessibilityHelper {
  private element: HTMLElement;
  private ariaManager: ARIAManager;
  private focusManager: FocusManager;
  private keyboardHandler: KeyboardNavigationHandler;

  constructor(element: HTMLElement) {
    this.element = element;
    this.ariaManager = new ARIAManager(element);
    this.focusManager = new FocusManager(element);
    this.keyboardHandler = new KeyboardNavigationHandler(element);
  }

  /**
   * Get ARIA manager
   */
  get aria(): ARIAManager {
    return this.ariaManager;
  }

  /**
   * Get focus manager
   */
  get focus(): FocusManager {
    return this.focusManager;
  }

  /**
   * Get keyboard handler
   */
  get keyboard(): KeyboardNavigationHandler {
    return this.keyboardHandler;
  }

  /**
   * Set up component as interactive element
   */
  setupInteractive(role: string, ariaLabel?: string, tabIndex: number = 0): this {
    this.element.setAttribute('role', role);
    this.element.setAttribute('tabindex', tabIndex.toString());

    if (ariaLabel) {
      this.ariaManager.setAttribute('aria-label', ariaLabel);
    }

    return this;
  }

  /**
   * Set up component as form control
   */
  setupFormControl(
    required: boolean = false,
    invalid: boolean = false,
    describedBy?: string
  ): this {
    this.ariaManager.setAttribute('aria-required', required);
    this.ariaManager.setAttribute('aria-invalid', invalid);

    if (describedBy) {
      this.ariaManager.setAttribute('aria-describedby', describedBy);
    }

    return this;
  }

  /**
   * Set up component as expandable/collapsible
   */
  setupExpandable(expanded: boolean = false, controls?: string): this {
    this.ariaManager.setAttribute('aria-expanded', expanded);

    if (controls) {
      this.ariaManager.setAttribute('aria-controls', controls);
    }

    return this;
  }

  /**
   * Announce change to screen readers
   */
  announceChange(message: string, priority: 'polite' | 'assertive' = 'polite'): this {
    ScreenReaderUtils.announce(message, priority);
    return this;
  }

  /**
   * Clean up all accessibility features
   */
  destroy(): void {
    this.ariaManager.destroy();
    this.keyboardHandler.destroy();
  }
}

/**
 * Factory function for creating accessibility helpers
 */
export function createAccessibilityHelper(element: HTMLElement): AccessibilityHelper {
  return new AccessibilityHelper(element);
}

/**
 * Utility functions for common accessibility patterns
 */
export const a11yUtils = {
  /**
   * Create unique ID for accessibility relationships
   */
  generateId(prefix: string = 'uswds'): string {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Check if element is keyboard focusable
   */
  isFocusable(element: HTMLElement): boolean {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ];

    return focusableSelectors.some((selector) => element.matches(selector));
  },

  /**
   * Get text content suitable for screen readers
   */
  getAccessibleText(element: HTMLElement): string {
    // Try aria-label first
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) return ariaLabel;

    // Try aria-labelledby
    const labelledBy = element.getAttribute('aria-labelledby');
    if (labelledBy) {
      const labelElement = document.getElementById(labelledBy);
      if (labelElement) return labelElement.textContent?.trim() || '';
    }

    // Fall back to text content
    return element.textContent?.trim() || '';
  },

  /**
   * Validate ARIA attributes
   */
  validateAriaAttributes(element: HTMLElement): string[] {
    const errors: string[] = [];
    const role = element.getAttribute('role');

    // Basic validation rules
    if (role === 'button' && !element.hasAttribute('aria-label') && !element.textContent?.trim()) {
      errors.push('Button role requires accessible text');
    }

    if (element.hasAttribute('aria-labelledby')) {
      const labelledBy = element.getAttribute('aria-labelledby');
      if (labelledBy && !document.getElementById(labelledBy)) {
        errors.push(`aria-labelledby references non-existent element: ${labelledBy}`);
      }
    }

    return errors;
  },
};
