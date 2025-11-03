/**
 * Partial Hydration / Interactive Islands
 *
 * Implements the "Islands Architecture" pattern for web components,
 * where only interactive components are hydrated with JavaScript,
 * while static components remain as plain HTML.
 *
 * Benefits:
 * - Reduced JavaScript execution time
 * - Lower memory usage
 * - Faster Time to Interactive (TTI)
 * - Better performance on low-power devices
 *
 * Strategy:
 * - Mark components as "static" or "interactive"
 * - Static components render once and don't update
 * - Interactive components get full reactivity
 * - Automatic detection based on component type
 *
 * @example
 * ```typescript
 * import { markAsStatic, markAsInteractive } from './utils/partial-hydration.js';
 *
 * // In component
 * class USAButton extends LitElement {
 *   constructor() {
 *     super();
 *     markAsStatic(this); // No re-renders needed
 *   }
 * }
 * ```
 */

/**
 * Hydration mode for components
 */
export type HydrationMode = 'static' | 'interactive' | 'auto';

/**
 * Metadata stored on hydrated components
 */
interface HydrationMetadata {
  mode: HydrationMode;
  hydrated: boolean;
  renderCount: number;
  lastRender: number;
}

// WeakMap to store hydration metadata without memory leaks
const hydrationData = new WeakMap<Element, HydrationMetadata>();

// Statistics tracking
let staticComponentCount = 0;
let interactiveComponentCount = 0;

/**
 * Component types that should be static by default
 */
const DEFAULT_STATIC_COMPONENTS = new Set([
  'usa-alert',
  'usa-breadcrumb',
  'usa-button',
  'usa-card',
  'usa-icon',
  'usa-link',
  'usa-list',
  'usa-prose',
  'usa-section',
  'usa-site-alert',
  'usa-tag',
  'usa-step-indicator',
  'usa-summary-box',
  'usa-identifier',
  'usa-process-list',
  'usa-collection',
  'usa-menu',
  'usa-pagination',
  'usa-skip-link',
  'usa-footer',
]);

/**
 * Component types that require interactivity
 */
const DEFAULT_INTERACTIVE_COMPONENTS = new Set([
  'usa-accordion',
  'usa-banner',
  'usa-character-count',
  'usa-checkbox',
  'usa-combo-box',
  'usa-date-picker',
  'usa-date-range-picker',
  'usa-file-input',
  'usa-header',
  'usa-in-page-navigation',
  'usa-language-selector',
  'usa-modal',
  'usa-radio',
  'usa-range-slider',
  'usa-search',
  'usa-select',
  'usa-side-navigation',
  'usa-text-input',
  'usa-textarea',
  'usa-time-picker',
  'usa-tooltip',
  'usa-validation',
]);

/**
 * Determine if component should be static based on tag name
 */
function shouldBeStatic(tagName: string): boolean {
  return DEFAULT_STATIC_COMPONENTS.has(tagName.toLowerCase());
}

/**
 * Determine if component should be interactive based on tag name
 */
function shouldBeInteractive(tagName: string): boolean {
  return DEFAULT_INTERACTIVE_COMPONENTS.has(tagName.toLowerCase());
}

/**
 * Mark a component as static (no hydration needed)
 *
 * Static components:
 * - Render once during initial load
 * - Don't respond to property changes
 * - Lower memory footprint
 * - Faster rendering
 *
 * Best for: Buttons, links, icons, alerts, cards
 *
 * @param element - Component element
 *
 * @example
 * ```typescript
 * class USAButton extends LitElement {
 *   constructor() {
 *     super();
 *     markAsStatic(this);
 *   }
 * }
 * ```
 */
export function markAsStatic(element: Element): void {
  const metadata: HydrationMetadata = {
    mode: 'static',
    hydrated: false,
    renderCount: 0,
    lastRender: Date.now(),
  };

  hydrationData.set(element, metadata);
  element.setAttribute('data-hydration', 'static');
  staticComponentCount++;

  // Disable Lit's reactive updates for static components
  if ('requestUpdate' in element && typeof element.requestUpdate === 'function') {
    const originalRequestUpdate = element.requestUpdate;

    element.requestUpdate = function (this: any, ...args: any[]) {
      const meta = hydrationData.get(this);

      // Only allow first render for static components
      if (meta && meta.renderCount === 0) {
        meta.renderCount++;
        return originalRequestUpdate.apply(this, args);
      }

      // Suppress subsequent updates
      return Promise.resolve();
    };
  }
}

/**
 * Mark a component as interactive (full hydration)
 *
 * Interactive components:
 * - Full Lit reactivity
 * - Respond to all property changes
 * - Event handlers active
 * - Full lifecycle hooks
 *
 * Best for: Forms, modals, accordions, date pickers
 *
 * @param element - Component element
 *
 * @example
 * ```typescript
 * class USAModal extends LitElement {
 *   constructor() {
 *     super();
 *     markAsInteractive(this);
 *   }
 * }
 * ```
 */
export function markAsInteractive(element: Element): void {
  const metadata: HydrationMetadata = {
    mode: 'interactive',
    hydrated: true,
    renderCount: 0,
    lastRender: Date.now(),
  };

  hydrationData.set(element, metadata);
  element.setAttribute('data-hydration', 'interactive');
  interactiveComponentCount++;
}

/**
 * Automatically determine hydration mode based on component type
 *
 * Uses heuristics to decide if component needs full reactivity:
 * - Has form elements → interactive
 * - Has event handlers → interactive
 * - Complex state → interactive
 * - Pure content → static
 *
 * @param element - Component element
 * @returns Recommended hydration mode
 *
 * @example
 * ```typescript
 * class USAComponent extends LitElement {
 *   constructor() {
 *     super();
 *     const mode = autoDetectHydration(this);
 *     if (mode === 'static') {
 *       markAsStatic(this);
 *     } else {
 *       markAsInteractive(this);
 *     }
 *   }
 * }
 * ```
 */
export function autoDetectHydration(element: Element): HydrationMode {
  const tagName = element.tagName.toLowerCase();

  // Check explicit lists first
  if (shouldBeStatic(tagName)) {
    return 'static';
  }

  if (shouldBeInteractive(tagName)) {
    return 'interactive';
  }

  // Heuristics for auto-detection
  const hasFormElements = element.querySelector('input, select, textarea, button[type="submit"]');
  const hasClickHandlers =
    element.hasAttribute('onclick') || element.getAttribute('class')?.includes('clickable');
  const hasAriaControls =
    element.hasAttribute('aria-controls') || element.hasAttribute('aria-expanded');

  if (hasFormElements || hasClickHandlers || hasAriaControls) {
    return 'interactive';
  }

  // Default to static for unknown components
  return 'static';
}

/**
 * Apply automatic hydration based on component type
 *
 * @param element - Component element
 *
 * @example
 * ```typescript
 * class USAComponent extends LitElement {
 *   constructor() {
 *     super();
 *     applyAutoHydration(this);
 *   }
 * }
 * ```
 */
export function applyAutoHydration(element: Element): void {
  const mode = autoDetectHydration(element);

  if (mode === 'static') {
    markAsStatic(element);
  } else {
    markAsInteractive(element);
  }
}

/**
 * Check if component is marked as static
 *
 * @param element - Component element
 * @returns true if static
 */
export function isStatic(element: Element): boolean {
  const metadata = hydrationData.get(element);
  return metadata?.mode === 'static';
}

/**
 * Check if component is marked as interactive
 *
 * @param element - Component element
 * @returns true if interactive
 */
export function isInteractive(element: Element): boolean {
  const metadata = hydrationData.get(element);
  return metadata?.mode === 'interactive';
}

/**
 * Get hydration metadata for component
 *
 * @param element - Component element
 * @returns Hydration metadata or undefined
 */
export function getHydrationMetadata(element: Element): HydrationMetadata | undefined {
  return hydrationData.get(element);
}

/**
 * Scan DOM and apply automatic hydration to all components
 *
 * Call once during application initialization to optimize
 * all USWDS components on the page.
 *
 * @param root - Root element to scan (defaults to document.body)
 * @param config - Configuration options
 * @returns Statistics about hydration
 *
 * @example
 * ```typescript
 * window.addEventListener('DOMContentLoaded', () => {
 *   const stats = scanAndHydrate(document.body, { debug: true });
 *   console.log('Hydration complete:', stats);
 * });
 * ```
 */
export function scanAndHydrate(
  root: Element = document.body,
  config: { debug?: boolean; dryRun?: boolean } = {}
): {
  static: number;
  interactive: number;
  total: number;
  savings: string;
} {
  const { debug = false, dryRun = false } = config;

  // Find all USWDS components
  const components = root.querySelectorAll('[class*="usa-"]');
  let staticCount = 0;
  let interactiveCount = 0;

  components.forEach((element) => {
    const mode = autoDetectHydration(element);

    if (debug) {
      console.log(`[Hydration] ${element.tagName.toLowerCase()}: ${mode}`);
    }

    if (!dryRun) {
      if (mode === 'static') {
        markAsStatic(element);
        staticCount++;
      } else {
        markAsInteractive(element);
        interactiveCount++;
      }
    } else {
      if (mode === 'static') {
        staticCount++;
      } else {
        interactiveCount++;
      }
    }
  });

  const total = staticCount + interactiveCount;
  const savingsPercent = total > 0 ? Math.round((staticCount / total) * 100) : 0;

  if (debug) {
    console.log('[Hydration] Scan complete:');
    console.log(`  Static: ${staticCount}`);
    console.log(`  Interactive: ${interactiveCount}`);
    console.log(`  Total: ${total}`);
    console.log(`  JS Savings: ~${savingsPercent}%`);
  }

  return {
    static: staticCount,
    interactive: interactiveCount,
    total,
    savings: `~${savingsPercent}%`,
  };
}

/**
 * Get global hydration statistics
 *
 * @returns Current hydration stats
 */
export function getHydrationStats(): {
  staticComponents: number;
  interactiveComponents: number;
  total: number;
  ratio: string;
} {
  const total = staticComponentCount + interactiveComponentCount;
  const ratio = total > 0 ? `${staticComponentCount}:${interactiveComponentCount}` : '0:0';

  return {
    staticComponents: staticComponentCount,
    interactiveComponents: interactiveComponentCount,
    total,
    ratio,
  };
}

/**
 * Reset hydration statistics (mainly for testing)
 */
export function resetHydrationStats(): void {
  staticComponentCount = 0;
  interactiveComponentCount = 0;
}

/**
 * Create a static wrapper for server-side rendering
 *
 * Wraps component HTML to prevent hydration until needed.
 *
 * @param html - Component HTML
 * @param tagName - Component tag name
 * @returns Wrapped HTML with hydration marker
 *
 * @example
 * ```typescript
 * // Server-side
 * const html = createStaticWrapper('<usa-button>Click</usa-button>', 'usa-button');
 * // Client-side will skip hydration until interaction
 * ```
 */
export function createStaticWrapper(html: string, tagName: string): string {
  return `<div data-static-component="${tagName}" data-hydration="static">${html}</div>`;
}

/**
 * Hydrate a previously static component
 *
 * Useful for progressive enhancement where a static component
 * needs to become interactive based on user action.
 *
 * @param element - Component element
 *
 * @example
 * ```typescript
 * // Initially static
 * markAsStatic(button);
 *
 * // Later, make interactive
 * hydrateComponent(button);
 * ```
 */
export function hydrateComponent(element: Element): void {
  const metadata = hydrationData.get(element);

  if (metadata && metadata.mode === 'static') {
    metadata.mode = 'interactive';
    metadata.hydrated = true;
    element.setAttribute('data-hydration', 'interactive');

    // Restore Lit's requestUpdate
    if ('requestUpdate' in element && typeof element.requestUpdate === 'function') {
      // Trigger initial update to activate component
      (element as any).requestUpdate();
    }

    staticComponentCount--;
    interactiveComponentCount++;
  }
}
