/**
 * Vitest Test Setup
 * Global test configuration and utilities for USWDS Web Components
 */

import { beforeEach, afterEach } from 'vitest';
import { Canvas } from 'canvas';

// Clean up DOM between tests to prevent interference
beforeEach(() => {
  // Clear any existing elements from previous tests
  document.body.innerHTML = '';

  // Reset any global state that might affect tests
  if (window.history?.replaceState) {
    window.history.replaceState({}, '', '/');
  }

  // Reset body classes and styles that components might set
  document.body.className = '';
  document.body.style.cssText = '';

  // Clear any global USWDS state
  if ((window as any).USWDS) {
    delete (window as any).USWDS;
  }
});

afterEach(() => {
  // Clear any timers or intervals that tests might have created FIRST
  const highestTimeoutId = setTimeout(() => {}, 0) as any as number;
  for (let i = 0; i < highestTimeoutId; i++) {
    clearTimeout(i);
    clearInterval(i);
  }

  // Clean up any remaining elements - more aggressive approach
  document.body.innerHTML = '';
  document.head.querySelectorAll('style[data-component]').forEach(el => el.remove());

  // Reset body classes and styles that components might set
  document.body.className = '';
  document.body.style.cssText = '';

  // Reset document classes and styles
  document.documentElement.className = '';
  document.documentElement.style.cssText = '';

  // Clear any global USWDS state (multiple approaches)
  if ((window as any).USWDS) {
    delete (window as any).USWDS;
  }
  if ('USWDS' in window) {
    delete (window as any).USWDS;
  }

  // Clear any Lit-related global state
  if ((window as any).__litReactiveElementVersions) {
    delete (window as any).__litReactiveElementVersions;
  }

  // Clear any Lit template caches
  if ((window as any).litHtml) {
    const litHtml = (window as any).litHtml;
    if (litHtml.render && litHtml.render.cache) {
      litHtml.render.cache.clear?.();
    }
  }

  // Force clear any pending Lit updates or promises
  try {
    if (typeof (window as any).queueMicrotask === 'function') {
      (window as any).queueMicrotask(() => {});
    }
  } catch (e) {
    // Ignore
  }

  // Remove any global event listeners that might persist
  const eventTypes = ['keydown', 'keyup', 'click', 'focus', 'blur', 'resize', 'scroll'];
  eventTypes.forEach(type => {
    try {
      // Try to remove common event listeners (this is a best-effort cleanup)
      document.removeEventListener(type, () => {});
    } catch (e) {
      // Ignore errors from removing non-existent listeners
    }
  });

  // Clear any cached modules or component state
  try {
    // Clear any component initialization flags
    document.querySelectorAll('[data-web-component-managed]').forEach(el => {
      el.removeAttribute('data-web-component-managed');
    });
  } catch (e) {
    // Ignore cleanup errors
  }

  // Clear any pending Lit updates
  try {
    if ((window as any).litHtml) {
      // Clear any cached templates or state
      const litHtml = (window as any).litHtml;
      if (litHtml.render && litHtml.render.cache) {
        litHtml.render.cache.clear?.();
      }
    }
  } catch (e) {
    // Ignore cleanup errors
  }

  // Force garbage collection of any lingering objects
  if (typeof window.gc === 'function') {
    window.gc();
  }
});

// Suppress Lit development mode warnings in test environment
const originalConsoleWarn = console.warn;
console.warn = (...args: any[]) => {
  const message = args.join(' ');

  // Filter out Lit development warnings
  if (
    message.includes('Lit is in dev mode') ||
    message.includes('Not recommended for production') ||
    message.includes('scheduled an update') ||
    message.includes('change-in-update')
  ) {
    return;
  }

  // Let other warnings through
  return originalConsoleWarn.apply(console, args);
};

// Global test utilities
// (Custom assertions can be added here if needed)

// Mock IntersectionObserver for tests that might need it
global.IntersectionObserver = class IntersectionObserver {
  root = null;
  rootMargin = '0px';
  thresholds = [0];

  constructor(_callback: IntersectionObserverCallback) {
    // Mock implementation
  }

  observe() {
    // Mock implementation
  }

  disconnect() {
    // Mock implementation
  }

  unobserve() {
    // Mock implementation
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
} as any;

// Mock ResizeObserver for tests that might need it
global.ResizeObserver = class ResizeObserver {
  constructor(_callback: ResizeObserverCallback) {
    // Mock implementation
  }

  observe() {
    // Mock implementation
  }

  disconnect() {
    // Mock implementation
  }

  unobserve() {
    // Mock implementation
  }
};

// Setup Canvas for HTMLCanvasElement support in JSDOM
// This fixes axe-core color contrast checking which requires canvas operations
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: function (contextType: string) {
    if (contextType === '2d') {
      const canvas = new Canvas(this.width || 300, this.height || 150);
      return canvas.getContext('2d');
    }
    return null;
  },
});

// Setup DragEvent for file input drag and drop testing
if (!global.DragEvent) {
  global.DragEvent = class DragEvent extends Event {
    dataTransfer: any;

    constructor(type: string, eventInitDict?: any) {
      super(type, eventInitDict);
      this.dataTransfer = eventInitDict?.dataTransfer || {
        files: [],
        items: [],
        types: [],
        dropEffect: 'none',
        effectAllowed: 'uninitialized',
      };
    }
  } as any;
}

// Mock window.matchMedia for USWDS JavaScript compatibility
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // deprecated
    removeListener: () => {}, // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock window.getComputedStyle for better CSS testing
const originalGetComputedStyle = window.getComputedStyle;
window.getComputedStyle = (element: Element, pseudoElement?: string | null) => {
  const originalStyles = originalGetComputedStyle(element, pseudoElement);
  // Return a more complete mock if the original fails
  if (!originalStyles) {
    return {
      getPropertyValue: () => '',
      setProperty: () => {},
      removeProperty: () => '',
      cssFloat: '',
      cssText: '',
      length: 0,
      parentRule: null,
      propertyPriority: () => '',
      item: () => '',
    } as any;
  }
  return originalStyles;
};

// Mock window.scrollTo for components that use scrolling
window.scrollTo = () => {};

// Mock window.scroll (alternative API) for components that use scrolling
window.scroll = () => {};

// Mock window.requestAnimationFrame for smooth animations
window.requestAnimationFrame = (callback: FrameRequestCallback) => {
  return setTimeout(() => callback(Date.now()), 16) as any as number;
};

window.cancelAnimationFrame = (id: number) => {
  clearTimeout(id);
};

// Mock navigator.userAgent for browser detection
Object.defineProperty(navigator, 'userAgent', {
  writable: true,
  value: 'Mozilla/5.0 (Node.js) AppleWebKit/537.36 (KHTML, like Gecko) Test/1.0.0',
});

// Mock localStorage for components that might use it
const localStorageMock = {
  getItem: (_key: string) => null,
  setItem: (_key: string, _value: string) => {},
  removeItem: (_key: string) => {},
  clear: () => {},
  length: 0,
  key: (_index: number) => null,
};

Object.defineProperty(window, 'localStorage', {
  writable: true,
  value: localStorageMock,
});

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  writable: true,
  value: localStorageMock,
});

// Mock HTMLFormElement.requestSubmit for JSdom compatibility
if (!HTMLFormElement.prototype.requestSubmit) {
  HTMLFormElement.prototype.requestSubmit = function(submitter?: HTMLElement) {
    // Simulate form submission
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });

    // If a submitter is provided, mark it as the submitter
    if (submitter) {
      Object.defineProperty(submitEvent, 'submitter', {
        value: submitter,
        enumerable: true,
      });
    }

    this.dispatchEvent(submitEvent);
  };
}

console.info('✅ Vitest test environment setup complete');
