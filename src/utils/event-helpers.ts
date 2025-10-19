/**
 * USWDS Event Handling Utilities
 *
 * Provides standardized event handling patterns, keyboard navigation,
 * and focus management for USWDS components.
 */

export type USWDSKeyboardKey =
  | 'Enter'
  | 'Space'
  | 'Escape'
  | 'ArrowUp'
  | 'ArrowDown'
  | 'ArrowLeft'
  | 'ArrowRight'
  | 'Tab'
  | 'Home'
  | 'End';

export interface USWDSKeyboardHandler {
  key: USWDSKeyboardKey | string;
  handler: (event: KeyboardEvent) => void;
  preventDefault?: boolean;
  stopPropagation?: boolean;
}

export interface USWDSFocusableElement {
  element: Element;
  tabIndex?: number;
  disabled?: boolean;
}

/**
 * Event Manager for standardized event handling and cleanup
 */
export class USWDSEventManager {
  private listeners: Map<
    Element | Document | Window,
    Array<{ event: string; handler: EventListener; options?: AddEventListenerOptions }>
  > = new Map();
  private keyboardHandlers: Map<Element, USWDSKeyboardHandler[]> = new Map();

  /**
   * Add an event listener with automatic cleanup tracking
   */
  addEventListener<T extends Element | Document | Window>(
    target: T,
    event: string,
    handler: EventListener,
    options?: AddEventListenerOptions
  ): void {
    target.addEventListener(event, handler, options);

    // Track for cleanup
    if (!this.listeners.has(target)) {
      this.listeners.set(target, []);
    }
    this.listeners.get(target)!.push({ event, handler, options });
  }

  /**
   * Remove a specific event listener
   */
  removeEventListener<T extends Element | Document | Window>(
    target: T,
    event: string,
    handler: EventListener,
    options?: AddEventListenerOptions
  ): void {
    target.removeEventListener(event, handler, options);

    // Remove from tracking
    const targetListeners = this.listeners.get(target);
    if (targetListeners) {
      const index = targetListeners.findIndex((l) => l.event === event && l.handler === handler);
      if (index !== -1) {
        targetListeners.splice(index, 1);
      }
    }
  }

  /**
   * Add keyboard event handlers with standardized key handling
   */
  addKeyboardHandlers(element: Element, handlers: USWDSKeyboardHandler[]): void {
    const keydownHandler = (event: KeyboardEvent) => {
      handlers.forEach(({ key, handler, preventDefault, stopPropagation }) => {
        if (this.matchesKey(event, key)) {
          if (preventDefault !== false) event.preventDefault();
          if (stopPropagation) event.stopPropagation();
          handler(event);
        }
      });
    };

    this.addEventListener(element, 'keydown', keydownHandler as EventListener);
    this.keyboardHandlers.set(element, handlers);
  }

  /**
   * Remove keyboard handlers for an element
   */
  removeKeyboardHandlers(element: Element): void {
    this.keyboardHandlers.delete(element);
    // Cleanup is handled automatically by cleanup() method
  }

  /**
   * Clean up all event listeners
   */
  cleanup(): void {
    // Remove all tracked event listeners
    this.listeners.forEach((listeners, target) => {
      listeners.forEach(({ event, handler, options }) => {
        target.removeEventListener(event, handler, options);
      });
    });

    this.listeners.clear();
    this.keyboardHandlers.clear();
  }

  /**
   * Create a debounced event handler
   */
  debounce<T extends any[]>(handler: (...args: T) => void, delay: number): (...args: T) => void {
    let timeoutId: number | undefined;

    return (...args: T) => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => handler(...args), delay);
    };
  }

  /**
   * Create a throttled event handler
   */
  throttle<T extends any[]>(handler: (...args: T) => void, delay: number): (...args: T) => void {
    let lastCall = 0;

    return (...args: T) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        handler(...args);
      }
    };
  }

  // Private helper methods

  private matchesKey(event: KeyboardEvent, key: string): boolean {
    // Handle special key mappings
    const keyMap: Record<string, string> = {
      Space: ' ',
      Escape: 'Escape',
      Enter: 'Enter',
      ArrowUp: 'ArrowUp',
      ArrowDown: 'ArrowDown',
      ArrowLeft: 'ArrowLeft',
      ArrowRight: 'ArrowRight',
      Tab: 'Tab',
      Home: 'Home',
      End: 'End',
    };

    const mappedKey = keyMap[key] || key;
    return event.key === mappedKey;
  }
}

/**
 * Focus Management Utilities for USWDS Components
 */
export class USWDSFocusManager {
  private static trapStack: Element[] = [];

  /**
   * Get all focusable elements within a container
   */
  static getFocusableElements(container: Element): USWDSFocusableElement[] {
    const focusableSelectors = [
      'a[href]',
      'area[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'button:not([disabled])',
      'iframe',
      'object',
      'embed',
      '[contenteditable]',
      '[tabindex]:not([tabindex^="-"])',
      // USWDS-specific interactive elements
      '.usa-button:not([disabled])',
      '.usa-accordion__button:not([disabled])',
      '.usa-nav__link',
      '.usa-menu__item',
    ];

    return Array.from(container.querySelectorAll(focusableSelectors.join(', ')))
      .map((element) => ({
        element,
        tabIndex: parseInt(element.getAttribute('tabindex') || '0'),
        disabled:
          element.hasAttribute('disabled') || element.getAttribute('aria-disabled') === 'true',
      }))
      .filter((item) => !item.disabled)
      .sort((a, b) => a.tabIndex - b.tabIndex);
  }

  /**
   * Set focus trap within an element (for modals, menus, etc.)
   */
  static trapFocus(container: Element): () => void {
    const focusableElements = this.getFocusableElements(container);

    if (focusableElements.length === 0) return () => {};

    const firstElement = focusableElements[0].element as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1].element as HTMLElement;

    // Add to trap stack
    this.trapStack.push(container);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          // Shift+Tab - going backwards
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab - going forwards
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Focus the first element
    firstElement.focus();

    // Return cleanup function
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      const index = this.trapStack.indexOf(container);
      if (index !== -1) {
        this.trapStack.splice(index, 1);
      }
    };
  }

  /**
   * Navigate focus within a container using arrow keys
   */
  static setupArrowNavigation(
    container: Element,
    options: {
      direction?: 'horizontal' | 'vertical' | 'both';
      wrap?: boolean;
      selector?: string;
    } = {}
  ): () => void {
    const { direction = 'both', wrap = true, selector } = options;

    const getNavigableElements = (): HTMLElement[] => {
      const elements = selector
        ? Array.from(container.querySelectorAll(selector))
        : this.getFocusableElements(container).map((item) => item.element);

      return elements.filter((el) => el instanceof HTMLElement) as HTMLElement[];
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const elements = getNavigableElements();
      if (elements.length === 0) return;

      const currentIndex = elements.findIndex((el) => el === document.activeElement);
      if (currentIndex === -1) return;

      let newIndex = currentIndex;

      switch (event.key) {
        case 'ArrowRight':
          if (direction === 'horizontal' || direction === 'both') {
            newIndex = wrap
              ? (currentIndex + 1) % elements.length
              : Math.min(currentIndex + 1, elements.length - 1);
            event.preventDefault();
          }
          break;
        case 'ArrowLeft':
          if (direction === 'horizontal' || direction === 'both') {
            newIndex = wrap
              ? (currentIndex - 1 + elements.length) % elements.length
              : Math.max(currentIndex - 1, 0);
            event.preventDefault();
          }
          break;
        case 'ArrowDown':
          if (direction === 'vertical' || direction === 'both') {
            newIndex = wrap
              ? (currentIndex + 1) % elements.length
              : Math.min(currentIndex + 1, elements.length - 1);
            event.preventDefault();
          }
          break;
        case 'ArrowUp':
          if (direction === 'vertical' || direction === 'both') {
            newIndex = wrap
              ? (currentIndex - 1 + elements.length) % elements.length
              : Math.max(currentIndex - 1, 0);
            event.preventDefault();
          }
          break;
        case 'Home':
          newIndex = 0;
          event.preventDefault();
          break;
        case 'End':
          newIndex = elements.length - 1;
          event.preventDefault();
          break;
      }

      if (newIndex !== currentIndex) {
        elements[newIndex].focus();
      }
    };

    container.addEventListener('keydown', handleKeyDown as EventListener);

    return () => {
      container.removeEventListener('keydown', handleKeyDown as EventListener);
    };
  }

  /**
   * Restore focus to a previously focused element
   */
  static restoreFocus(element: HTMLElement): void {
    try {
      element.focus();
    } catch (error) {
      // Element might not be focusable anymore
      console.debug('Could not restore focus to element:', element);
    }
  }

  /**
   * Find the next/previous focusable element
   */
  static findNextFocusable(
    current: Element,
    direction: 'next' | 'previous' = 'next'
  ): HTMLElement | null {
    const focusableElements = this.getFocusableElements(document.body).map(
      (item) => item.element
    ) as HTMLElement[];

    const currentIndex = focusableElements.indexOf(current as HTMLElement);
    if (currentIndex === -1) return null;

    const nextIndex =
      direction === 'next'
        ? (currentIndex + 1) % focusableElements.length
        : (currentIndex - 1 + focusableElements.length) % focusableElements.length;

    return focusableElements[nextIndex] || null;
  }
}

/**
 * Common USWDS Event Patterns
 */
export class USWDSEventPatterns {
  /**
   * Set up standard button interaction (click + keyboard)
   */
  static setupButtonInteraction(
    button: Element,
    handler: (event: Event) => void,
    options: { disabled?: () => boolean } = {}
  ): () => void {
    const eventManager = new USWDSEventManager();

    const wrappedHandler = (event: Event) => {
      if (options.disabled && options.disabled()) {
        event.preventDefault();
        return;
      }
      handler(event);
    };

    eventManager.addEventListener(button, 'click', wrappedHandler);
    eventManager.addKeyboardHandlers(button, [
      {
        key: 'Enter',
        handler: (event) => wrappedHandler(event),
      },
      {
        key: 'Space',
        handler: (event) => wrappedHandler(event),
      },
    ]);

    return () => eventManager.cleanup();
  }

  /**
   * Set up standard form input interaction
   */
  static setupInputInteraction(
    input: Element,
    handlers: {
      onChange?: (event: Event) => void;
      onFocus?: (event: FocusEvent) => void;
      onBlur?: (event: FocusEvent) => void;
    }
  ): () => void {
    const eventManager = new USWDSEventManager();

    if (handlers.onChange) {
      eventManager.addEventListener(input, 'change', handlers.onChange);
      eventManager.addEventListener(input, 'input', handlers.onChange);
    }

    if (handlers.onFocus) {
      eventManager.addEventListener(input, 'focus', handlers.onFocus as EventListener);
    }

    if (handlers.onBlur) {
      eventManager.addEventListener(input, 'blur', handlers.onBlur as EventListener);
    }

    return () => eventManager.cleanup();
  }

  /**
   * Set up toggle/disclosure pattern (accordion, menu, etc.)
   */
  static setupToggleInteraction(
    trigger: Element,
    target: Element,
    options: {
      closeOnEscape?: boolean;
      closeOnOutsideClick?: boolean;
    } = {}
  ): () => void {
    const { closeOnEscape = true, closeOnOutsideClick = true } = options;
    const eventManager = new USWDSEventManager();

    let isOpen = false;

    const toggle = () => {
      isOpen = !isOpen;
      target.setAttribute('aria-hidden', String(!isOpen));
      trigger.setAttribute('aria-expanded', String(isOpen));

      if (isOpen) {
        target.classList.add('is-visible');
      } else {
        target.classList.remove('is-visible');
      }
    };

    // Set up trigger interaction
    eventManager.addKeyboardHandlers(trigger, [
      {
        key: 'Enter',
        handler: toggle,
      },
      {
        key: 'Space',
        handler: toggle,
      },
    ]);

    eventManager.addEventListener(trigger, 'click', toggle);

    // Set up close behaviors
    if (closeOnEscape) {
      eventManager.addKeyboardHandlers(document.body, [
        {
          key: 'Escape',
          handler: () => {
            if (isOpen) {
              isOpen = false;
              toggle();
              (trigger as HTMLElement).focus();
            }
          },
        },
      ]);
    }

    if (closeOnOutsideClick) {
      eventManager.addEventListener(document, 'click', (event) => {
        if (
          isOpen &&
          !trigger.contains(event.target as Node) &&
          !target.contains(event.target as Node)
        ) {
          isOpen = false;
          toggle();
        }
      });
    }

    return () => eventManager.cleanup();
  }
}
