import type { Preview } from '@storybook/web-components-vite';

/**
 * USWDS elements that should be cleaned up outside storybook-root
 * These are created by USWDS and moved outside the story container
 */
const USWDS_CLEANUP_SELECTORS = [
  '.usa-date-picker__calendar',
  '.usa-combo-box__list',
  '.usa-tooltip__body',
] as const;

/**
 * USWDS body classes that should be removed between stories
 */
const USWDS_BODY_CLASSES = [
  'usa-js-modal--active',
  'usa-modal--open',
  'usa-js-loading',
] as const;

/**
 * Helper to remove USWDS elements created outside storybook-root
 */
const removeOutsideElements = (selector: string): void => {
  document.querySelectorAll(selector).forEach((element) => {
    if (!element.closest('#storybook-root')) {
      element.remove();
    }
  });
};

/**
 * Force browser layout recalculation for Storybook root
 * Fixes: After Storybook navigation, Lit components had zero BoundingClientRect
 * despite having correct computed styles (display: block, proper height)
 *
 * Root Cause: Storybook navigation doesn't fully reset DOM/layout state
 * Solution: Force browser to recalculate layout by toggling display
 */
const forceLayoutRecalculation = (): void => {
  const storybookRoot = document.getElementById('storybook-root');
  if (!storybookRoot) return;

  const originalDisplay = storybookRoot.style.display;
  storybookRoot.style.display = 'none';
  void storybookRoot.offsetHeight; // Force reflow
  storybookRoot.style.display = originalDisplay || '';
  void storybookRoot.offsetHeight; // Force reflow again
};

/**
 * Clean up USWDS-created DOM elements between story renders
 * This prevents conflicts when navigating between stories
 */
const cleanupUSWDSElements = (): void => {
  // Clean up modal wrappers (USWDS creates these outside storybook-root)
  document.querySelectorAll('.usa-modal-wrapper').forEach((wrapper) => wrapper.remove());

  // Clean up other USWDS elements moved outside storybook-root
  USWDS_CLEANUP_SELECTORS.forEach(removeOutsideElements);

  // Remove USWDS body classes that might persist
  document.body.classList.remove(...USWDS_BODY_CLASSES);

  // Reset body styles that USWDS might have added
  document.body.style.paddingRight = '';
  document.body.style.overflow = '';
};

/**
 * Track if iframe resize listener has been set up
 * Prevents duplicate event listeners in docs mode
 */
let iframeResizeListenerAdded = false;

/**
 * Setup iframe height auto-adjustment for docs mode
 * Handles both accordion/banner expansion and absolutely-positioned dropdowns
 */
const setupDocsIframeResize = (): void => {
  // Only run in iframe context (docs mode)
  if (window.self === window.top) return;

  // Only add listener once per iframe
  if (iframeResizeListenerAdded) return;
  iframeResizeListenerAdded = true;

  console.log('🔧 setupDocsIframeResize() initialized');
  console.log(`📍 Context:
    isIframe: ${window.self !== window.top}
    pathname: ${window.location.pathname}
    search: ${window.location.search}
    hasIframeHtml: ${window.location.pathname.includes('/iframe.html')}
    viewMode: ${new URLSearchParams(window.location.search).get('viewMode')}
    storyId: ${new URLSearchParams(window.location.search).get('id')}`
  );

  /**
   * Trigger iframe resize
   * Storybook listens for 'resize' events to adjust iframe height
   */
  const triggerResize = () => {
    window.dispatchEvent(new Event('resize'));
  };

  // Listen for clicks on interactive elements (accordion, banner)
  document.addEventListener('click', (e) => {
    const target = e.target as Element;

    // Check if click is on accordion or banner button
    if (target?.closest?.('.usa-accordion__button') || target?.closest?.('.usa-banner__button')) {
      console.log('🎯 Accordion/Banner button clicked');
      // Wait for animation/transition to complete
      setTimeout(triggerResize, 350);
    }

    // Check if click is on combo-box toggle or date-picker button
    if (target?.closest?.('.usa-combo-box__toggle-list') ||
        target?.closest?.('.usa-date-picker__button') ||
        target?.closest?.('.usa-time-picker__button')) {
      console.log('🎯 Dropdown/Calendar toggle clicked');
      // Wait for dropdown/calendar to render
      setTimeout(triggerResize, 100);
    }
  });

  // Watch for USWDS dropdown/calendar elements being added to DOM
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node instanceof Element) {
          // Check if added node is a USWDS dropdown/popup element
          if (node.classList.contains('usa-combo-box__list') ||
              node.classList.contains('usa-date-picker__calendar') ||
              node.classList.contains('usa-time-picker__list') ||
              node.classList.contains('usa-tooltip__body')) {
            console.log('🎯 USWDS popup element added:', node.className);
            // Trigger resize when dropdown appears
            setTimeout(triggerResize, 50);
          }
        }
      }
    }
  });

  // Observe the entire document for USWDS popups (they're often moved outside #storybook-root)
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  console.log('✅ Dynamic iframe resize enabled for dropdowns and calendars');
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'padded',
    docs: {
      // Disable inline rendering to ensure proper iframe isolation for Web Components
      // This fixes issues with component reuse across stories in docs mode
      inlineStories: false,
      story: {
        // Allow iframe to resize dynamically based on content
        // The manager-head.html script will adjust height automatically
        iframeHeight: 'auto',
      },
      extractComponentDescription: (_component: unknown, { notes }: { notes?: unknown }) => {
        if (notes) {
          const notesObj = notes;
          return typeof notes === 'string' ? notes : notesObj.markdown || notesObj.text;
        }
        return null;
      },
    },
    // Add accessibility testing to all stories
    a11y: {
      config: {},
      options: {},
      manual: true,
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },

  globalTypes: {
    theme: {
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: ['light', 'dark'],
        dynamicTitle: true,
      },
    },
  },

  decorators: [
    (story) => {
      // Clean up USWDS-created DOM elements that might persist
      cleanupUSWDSElements();

      // Force layout recalculation to fix zero BoundingClientRect issue
      forceLayoutRecalculation();

      // Setup iframe height auto-adjustment for docs mode
      setupDocsIframeResize();

      // Let Storybook handle the rendering naturally
      return story();
    },
  ],

  tags: ['autodocs'],
};

export default preview;
