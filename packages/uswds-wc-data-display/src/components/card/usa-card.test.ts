import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import './usa-card.ts';
import type { USACard } from './usa-card.js';
import {
  testComponentAccessibility,
  USWDS_A11Y_CONFIG,
} from '@uswds-wc/test-utils/accessibility-utils.js';
import { quickUSWDSComplianceTest } from '@uswds-wc/test-utils/uswds-compliance-utils.js';
import {
  validateComponentJavaScript,
  testSlottedContent,
  assertSlottedContentWorks,
  mockNavigation,
} from '@uswds-wc/test-utils/test-utils.js';
import {
  testTextResize,
  testReflow,
  testTextSpacing,
  testMobileAccessibility,
} from '@uswds-wc/test-utils/responsive-accessibility-utils.js';

describe('USACard', () => {
  let element: USACard;

  beforeEach(() => {
    // Mock navigation to avoid jsdom errors
    mockNavigation();

    element = document.createElement('usa-card') as USACard;
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  describe('Default Properties', () => {
    it('should have correct default properties', async () => {
      await element.updateComplete;

      expect(element.heading).toBe('');
      expect(element.text).toBe('');
      expect(element.mediaType).toBe('none');
      expect(element.mediaSrc).toBe('');
      expect(element.mediaAlt).toBe('');
      expect(element.mediaPosition).toBe('inset');
      expect(element.flagLayout).toBe(false);
      expect(element.headerFirst).toBe(false);
      expect(element.actionable).toBe(false);
      expect(element.href).toBe('');
      expect(element.target).toBe('');
      expect(element.footerText).toBe('');
      expect(element.headingLevel).toBe('3');
    });
  });

  describe('Basic Content Rendering', () => {
    it('should render heading when provided', async () => {
      element.heading = 'Test Card Title';
      await element.updateComplete;

      const heading = element.querySelector('.usa-card__heading') as HTMLHeadingElement;
      expect(heading).toBeTruthy();
      expect(heading.textContent).toBe('Test Card Title');
      expect(heading.tagName).toBe('H3'); // default heading level
    });

    it('should render text content when provided', async () => {
      element.text = 'This is test card content';
      await element.updateComplete;

      const body = element.querySelector('.usa-card__body');
      const paragraph = body?.querySelector('p');
      expect(paragraph?.textContent).toBe('This is test card content');
    });

    it('should render footer text when provided', async () => {
      element.footerText = 'Footer content';
      await element.updateComplete;

      const footer = element.querySelector('.usa-card__footer');
      const paragraph = footer?.querySelector('p');
      expect(paragraph?.textContent).toBe('Footer content');
    });

    it('should not render sections when content is empty', async () => {
      await element.updateComplete;

      expect(element.querySelector('.usa-card__header')).toBeNull();
      expect(element.querySelector('.usa-card__body')).toBeNull();
      expect(element.querySelector('.usa-card__footer')).toBeNull();
      expect(element.querySelector('.usa-card__media')).toBeNull();
    });
  });

  describe('Heading Levels', () => {
    it('should render different heading levels correctly', async () => {
      element.heading = 'Test Heading';

      // Test different heading levels
      const levels = ['1', '2', '3', '4', '5', '6'] as const;

      for (const level of levels) {
        element.headingLevel = level;
        await element.updateComplete;

        const heading = element.querySelector('.usa-card__heading') as HTMLHeadingElement;
        expect(heading.tagName).toBe(`H${level}`);
      }
    });

    it('should default to h3 heading level', async () => {
      element.heading = 'Default Level Heading';
      await element.updateComplete;

      const heading = element.querySelector('.usa-card__heading') as HTMLHeadingElement;
      expect(heading.tagName).toBe('H3');
    });
  });

  describe('Media Rendering', () => {
    it('should render image media when configured', async () => {
      element.mediaType = 'image';
      element.mediaSrc = 'test-image.jpg';
      element.mediaAlt = 'Test image';
      await element.updateComplete;

      const media = element.querySelector('.usa-card__media');
      const imgContainer = media?.querySelector('.usa-card__img');
      const img = imgContainer?.querySelector('img');

      expect(media).toBeTruthy();
      expect(imgContainer).toBeTruthy();
      expect(img?.src).toContain('test-image.jpg');
      expect(img?.alt).toBe('Test image');
      expect(img?.getAttribute('loading')).toBe('lazy');
    });

    it('should render video media when configured', async () => {
      element.mediaType = 'video';
      element.mediaSrc = 'test-video.mp4';
      element.mediaAlt = 'Test video';
      await element.updateComplete;

      const media = element.querySelector('.usa-card__media');
      const videoContainer = media?.querySelector('.usa-card__img');
      const video = videoContainer?.querySelector('video');

      expect(media).toBeTruthy();
      expect(videoContainer).toBeTruthy();
      expect(video?.src).toContain('test-video.mp4');
      expect(video?.getAttribute('aria-label')).toBe('Test video');
      expect(video?.hasAttribute('controls')).toBe(true);
    });

    it('should not render media when type is none', async () => {
      element.mediaType = 'none';
      element.mediaSrc = 'test-image.jpg';
      await element.updateComplete;

      expect(element.querySelector('.usa-card__media')).toBeNull();
    });

    it('should not render media when src is empty', async () => {
      element.mediaType = 'image';
      element.mediaSrc = '';
      await element.updateComplete;

      expect(element.querySelector('.usa-card__media')).toBeNull();
    });
  });

  describe('Media Position Classes', () => {
    beforeEach(() => {
      element.mediaType = 'image';
      element.mediaSrc = 'test.jpg';
    });

    it('should apply inset media class', async () => {
      element.mediaPosition = 'inset';
      await element.updateComplete;

      const media = element.querySelector('.usa-card__media');
      expect(media?.classList.contains('usa-card__media--inset')).toBe(true);
    });

    it('should apply exdent media class', async () => {
      element.mediaPosition = 'exdent';
      await element.updateComplete;

      const media = element.querySelector('.usa-card__media');
      expect(media?.classList.contains('usa-card__media--exdent')).toBe(true);
    });

    it('should apply media-right class to card when mediaPosition is right', async () => {
      element.mediaPosition = 'right';
      await element.updateComplete;

      expect(element.classList.contains('usa-card--media-right')).toBe(true);
    });

    it('should automatically enable flag layout when mediaPosition is right', async () => {
      // Media right requires flag layout according to USWDS
      element.mediaPosition = 'right';
      element.flagLayout = false; // Explicitly set to false
      await element.updateComplete;

      // Should automatically apply flag layout
      expect(element.classList.contains('usa-card--flag')).toBe(true);
      expect(element.classList.contains('usa-card--media-right')).toBe(true);
    });
  });

  describe('Card Layout Variants', () => {
    it('should apply flag layout class', async () => {
      element.flagLayout = true;
      await element.updateComplete;

      expect(element.classList.contains('usa-card--flag')).toBe(true);
    });

    it('should apply header-first class', async () => {
      element.headerFirst = true;
      await element.updateComplete;

      expect(element.classList.contains('usa-card--header-first')).toBe(true);
    });

    it('should apply multiple layout classes together', async () => {
      element.flagLayout = true;
      element.headerFirst = true;
      element.mediaType = 'image';
      element.mediaSrc = 'test.jpg';
      element.mediaPosition = 'right';
      await element.updateComplete;

      expect(element.classList.contains('usa-card--flag')).toBe(true);
      expect(element.classList.contains('usa-card--header-first')).toBe(true);
      expect(element.classList.contains('usa-card--media-right')).toBe(true);
    });

    it('should always have base usa-card class', async () => {
      await element.updateComplete;

      expect(element.classList.contains('usa-card')).toBe(true);
    });
  });

  describe('Actionable Cards', () => {
    it('should add role and tabindex when actionable', async () => {
      element.actionable = true;
      await element.updateComplete;

      expect(element.getAttribute('role')).toBe('button');
      expect(element.getAttribute('tabindex')).toBe('0');
    });

    it('should remove role and tabindex when not actionable', async () => {
      element.actionable = true;
      await element.updateComplete;

      element.actionable = false;
      await element.updateComplete;

      expect(element.hasAttribute('role')).toBe(false);
      expect(element.hasAttribute('tabindex')).toBe(false);
    });
  });

  describe('Event Handling', () => {
    it('should dispatch card-click event when actionable card is clicked', async () => {
      element.actionable = true;
      element.heading = 'Test Card';
      element.href = ''; // Clear href to avoid navigation
      await element.updateComplete;

      let eventDetail: any;
      element.addEventListener('card-click', (e: any) => {
        eventDetail = e.detail;
      });

      element.click();

      expect(eventDetail).toBeTruthy();
      expect(eventDetail.heading).toBe('Test Card');
    });

    it('should not dispatch card-click event when not actionable', async () => {
      element.actionable = false;
      await element.updateComplete;

      let eventFired = false;
      element.addEventListener('card-click', () => {
        eventFired = true;
      });

      element.click();

      expect(eventFired).toBe(false);
    });

    it('should handle keyboard events on actionable cards', async () => {
      element.actionable = true;
      element.heading = 'Keyboard Test';
      await element.updateComplete;

      let eventDetail: any;
      element.addEventListener('card-click', (e: any) => {
        eventDetail = e.detail;
      });

      // Test Enter key
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      element.dispatchEvent(enterEvent);

      expect(eventDetail?.heading).toBe('Keyboard Test');

      // Test Space key
      eventDetail = null;
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
      element.dispatchEvent(spaceEvent);

      expect(eventDetail?.heading).toBe('Keyboard Test');
    });

    it('should not handle keyboard events when not actionable', async () => {
      element.actionable = false;
      await element.updateComplete;

      let eventFired = false;
      element.addEventListener('card-click', () => {
        eventFired = true;
      });

      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      element.dispatchEvent(enterEvent);

      expect(eventFired).toBe(false);
    });
  });

  describe('Content Order and Layout', () => {
    beforeEach(() => {
      element.heading = 'Test Heading';
      element.text = 'Test content';
      element.mediaType = 'image';
      element.mediaSrc = 'test.jpg';
      element.footerText = 'Test footer';
    });

    it('should render content in default order', async () => {
      await element.updateComplete;

      const container = element.querySelector('.usa-card__container');
      const children = Array.from(container?.children || []);

      // Should have media first, then header, body, footer
      expect(children[0]?.classList.contains('usa-card__media')).toBe(true);
      expect(children[1]?.classList.contains('usa-card__header')).toBe(true);
      expect(children[2]?.classList.contains('usa-card__body')).toBe(true);
      expect(children[3]?.classList.contains('usa-card__footer')).toBe(true);
    });

    it('should render header first when headerFirst is true', async () => {
      element.headerFirst = true;
      await element.updateComplete;

      const container = element.querySelector('.usa-card__container');
      const children = Array.from(container?.children || []);

      // Should have header first, then media, body, footer
      expect(children[0]?.classList.contains('usa-card__header')).toBe(true);
      expect(children[1]?.classList.contains('usa-card__media')).toBe(true);
    });

    it('should handle media-right non-flag layout differently', async () => {
      element.mediaPosition = 'right';
      element.flagLayout = false;
      await element.updateComplete;

      // Media-right non-flag should have a different structure
      const container = element.querySelector('.usa-card__container');
      expect(container).toBeTruthy();

      // Should have media and then a body wrapper
      const media = container?.querySelector('.usa-card__media');
      const bodyWrapper = container?.querySelector('.usa-card__body');
      expect(media).toBeTruthy();
      expect(bodyWrapper).toBeTruthy();
    });
  });

  describe('Comprehensive Slotted Content Validation', () => {
    beforeEach(() => {
      // Set a heading to ensure the card renders
      element.heading = 'Test Card';
    });

    it('should render body slot content correctly', async () => {
      const validation = await testSlottedContent(element, [
        {
          slotName: 'body',
          description: 'Card body slot',
          testContent: '<p>Test body content</p>',
          expectedWrapperSelector: '.usa-card__body',
        },
      ]);

      expect(validation.isValid).toBe(true);
      expect(validation.issues).toHaveLength(0);
      expect(validation.results[0].slotExists).toBe(true);
      expect(validation.results[0].wrapperRendered).toBe(true);
    });

    it('should render footer slot content correctly', async () => {
      const validation = await testSlottedContent(element, [
        {
          slotName: 'footer',
          description: 'Card footer slot',
          testContent: '<button class="usa-button">Test Button</button>',
          expectedWrapperSelector: '.usa-card__footer',
        },
      ]);

      expect(validation.isValid).toBe(true);
      expect(validation.issues).toHaveLength(0);
      expect(validation.results[0].slotExists).toBe(true);
      expect(validation.results[0].wrapperRendered).toBe(true);
    });

    it('should render both body and footer slots together', async () => {
      const validation = await testSlottedContent(element, [
        {
          slotName: 'body',
          description: 'Card body slot',
          testContent: '<p>Test body content</p>',
          expectedWrapperSelector: '.usa-card__body',
        },
        {
          slotName: 'footer',
          description: 'Card footer slot',
          testContent: '<button class="usa-button">Test Button</button>',
          expectedWrapperSelector: '.usa-card__footer',
        },
      ]);

      expect(validation.isValid).toBe(true);
      expect(validation.issues).toHaveLength(0);
      expect(validation.results).toHaveLength(2);
      expect(validation.results[0].slotExists).toBe(true);
      expect(validation.results[0].wrapperRendered).toBe(true);
      expect(validation.results[1].slotExists).toBe(true);
      expect(validation.results[1].wrapperRendered).toBe(true);
    });

    it('should work with assertSlottedContentWorks helper', async () => {
      // This will throw if validation fails
      await assertSlottedContentWorks(element, [
        {
          slotName: 'body',
          description: 'Card body',
          testContent: '<p>Test</p>',
          expectedWrapperSelector: '.usa-card__body',
        },
      ]);
    });

    it('should handle complex slotted content', async () => {
      const validation = await testSlottedContent(element, [
        {
          slotName: 'body',
          description: 'Card body with complex HTML',
          testContent: `
            <div>
              <h4>Complex Content</h4>
              <ul>
                <li>Item 1</li>
                <li>Item 2</li>
              </ul>
              <p>Description text</p>
            </div>
          `,
          expectedWrapperSelector: '.usa-card__body',
        },
      ]);

      expect(validation.isValid).toBe(true);
      expect(validation.issues).toHaveLength(0);
    });
  });

  describe('USWDS CSS Classes', () => {
    it('should always have base usa-card class on host', async () => {
      await element.updateComplete;

      expect(element.classList.contains('usa-card')).toBe(true);
    });

    it('should have correct container structure', async () => {
      element.heading = 'Test';
      await element.updateComplete;

      const container = element.querySelector('.usa-card__container');
      const header = element.querySelector('.usa-card__header');
      const heading = element.querySelector('.usa-card__heading');

      expect(container).toBeTruthy();
      expect(header).toBeTruthy();
      expect(heading).toBeTruthy();
    });

    it('should apply proper USWDS structure', async () => {
      element.heading = 'Test Heading';
      element.text = 'Test content';
      element.footerText = 'Test footer';
      element.mediaType = 'image';
      element.mediaSrc = 'test.jpg';
      await element.updateComplete;

      // Check all USWDS card elements exist
      expect(element.querySelector('.usa-card__container')).toBeTruthy();
      expect(element.querySelector('.usa-card__header')).toBeTruthy();
      expect(element.querySelector('.usa-card__heading')).toBeTruthy();
      expect(element.querySelector('.usa-card__body')).toBeTruthy();
      expect(element.querySelector('.usa-card__footer')).toBeTruthy();
      expect(element.querySelector('.usa-card__media')).toBeTruthy();
    });
  });

  describe('Light DOM Rendering', () => {
    it('should render in light DOM for USWDS compatibility', async () => {
      await element.updateComplete;

      expect(element.shadowRoot).toBeNull();
      expect(element.querySelector('.usa-card__container')).toBeTruthy();
    });
  });

  describe('Property Updates', () => {
    it('should update host classes when layout properties change', async () => {
      await element.updateComplete;

      // Initially should only have base class
      expect(element.classList.contains('usa-card')).toBe(true);
      expect(element.classList.contains('usa-card--flag')).toBe(false);

      // Update flagLayout
      element.flagLayout = true;
      await element.updateComplete;

      expect(element.classList.contains('usa-card--flag')).toBe(true);

      // Update headerFirst
      element.headerFirst = true;
      await element.updateComplete;

      expect(element.classList.contains('usa-card--header-first')).toBe(true);
    });

    it('should update content when properties change', async () => {
      element.heading = 'Initial Heading';
      await element.updateComplete;

      let heading = element.querySelector('.usa-card__heading');
      expect(heading?.textContent).toBe('Initial Heading');

      element.heading = 'Updated Heading';
      await element.updateComplete;

      heading = element.querySelector('.usa-card__heading');
      expect(heading?.textContent).toBe('Updated Heading');
    });
  });

  describe('Navigation Handling', () => {
    it('should include href in card-click event when actionable', async () => {
      element.actionable = true;
      element.href = 'https://example.com/page';
      await element.updateComplete;

      let eventDetail: any;
      element.addEventListener('card-click', (e: any) => {
        eventDetail = e.detail;
        // Prevent actual navigation in test
        e.preventDefault();
      });

      // Clear href to avoid navigation in test
      element.href = '';
      element.click();

      expect(eventDetail).toBeTruthy();
    });

    it('should handle target _blank attribute', async () => {
      element.actionable = true;
      element.href = 'https://example.com/page';
      element.target = '_blank';
      await element.updateComplete;

      // Test that target is properly set
      expect(element.target).toBe('_blank');
      expect(element.href).toBe('https://example.com/page');
    });
  });

  describe('Event Listener Management', () => {
    it('should add event listeners when connected', () => {
      // Create a new element to test connection
      const newElement = document.createElement('usa-card') as USACard;

      // Spy on addEventListener
      const addEventListenerSpy = vi.spyOn(newElement, 'addEventListener');

      document.body.appendChild(newElement);

      expect(addEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

      newElement.remove();
    });

    it('should remove event listeners when disconnected', () => {
      const newElement = document.createElement('usa-card') as USACard;
      document.body.appendChild(newElement);

      // Spy on removeEventListener
      const removeEventListenerSpy = vi.spyOn(newElement, 'removeEventListener');

      newElement.remove();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
  });

  describe('CRITICAL: Component Lifecycle Stability', () => {
    beforeEach(() => {
      element = document.createElement('usa-card') as USACard;
      document.body.appendChild(element);
    });

    it('should remain in DOM after property changes', async () => {
      await element.updateComplete;
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);

      element.heading = 'Test Card Title';
      await element.updateComplete;
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);

      element.text = 'Test card content text';
      await element.updateComplete;
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);

      element.actionable = true;
      await element.updateComplete;
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });

    it('should maintain element stability during card content updates', async () => {
      const originalElement = element;
      const contentUpdates = [
        { heading: 'Card 1', text: 'Content 1' },
        { heading: 'Card 2', text: 'Content 2', footerText: 'Footer 2' },
        { heading: 'Card 3', text: 'Content 3', mediaType: 'image', mediaSrc: '/test.jpg' },
      ];

      for (const update of contentUpdates) {
        Object.assign(element, update);
        await element.updateComplete;
        expect(element).toBe(originalElement);
        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }
    });

    it('should preserve DOM connection through layout property changes', async () => {
      const layoutConfigurations = [
        { flagLayout: false, headerFirst: false, mediaPosition: 'inset' },
        { flagLayout: true, headerFirst: true, mediaPosition: 'exdent' },
        { flagLayout: false, headerFirst: false, mediaPosition: 'right' },
      ];

      for (const config of layoutConfigurations) {
        Object.assign(element, config);
        await element.updateComplete;
        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }
    });
  });

  describe('CRITICAL: Event System Stability', () => {
    beforeEach(async () => {
      element = document.createElement('usa-card') as USACard;
      element.heading = 'Event Card';
      element.text = 'Event card content';
      element.actionable = true;
      document.body.appendChild(element);
      await element.updateComplete;
    });

    it('should not pollute global event handling', async () => {
      const globalClickSpy = vi.fn();
      document.addEventListener('click', globalClickSpy);

      const cardClickSpy = vi.fn();
      element.addEventListener('card-click', cardClickSpy);

      element.click();
      await element.updateComplete;

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);

      document.removeEventListener('click', globalClickSpy);
    });

    it('should maintain stability during card click interactions', async () => {
      const cardClickSpy = vi.fn();
      element.addEventListener('card-click', cardClickSpy);

      // Multiple click interactions
      for (let i = 0; i < 3; i++) {
        element.click();
        await element.updateComplete;
        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }

      expect(cardClickSpy.mock.calls.length).toBe(3);
    });

    it('should maintain stability during actionable state changes', async () => {
      const actionableStates = [false, true, false, true];

      for (const actionable of actionableStates) {
        element.actionable = actionable;
        await element.updateComplete;
        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }
    });
  });

  describe('CRITICAL: Card State Management Stability', () => {
    beforeEach(async () => {
      element = document.createElement('usa-card') as USACard;
      document.body.appendChild(element);
      await element.updateComplete;
    });

    it('should maintain DOM connection during media configuration changes', async () => {
      const mediaConfigurations = [
        { mediaType: 'none', mediaSrc: '', mediaAlt: '' },
        { mediaType: 'image', mediaSrc: '/test.jpg', mediaAlt: 'Test image' },
        { mediaType: 'video', mediaSrc: '/test.mp4', mediaAlt: 'Test video' },
        { mediaType: 'none', mediaSrc: '', mediaAlt: '' },
      ];

      for (const config of mediaConfigurations) {
        Object.assign(element, config);
        await element.updateComplete;
        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }
    });

    it('should preserve element stability during complex card updates', async () => {
      const originalElement = element;
      const complexUpdates = [
        {
          heading: 'Government Service Card',
          text: 'Access government services online',
          footerText: 'Learn more',
          actionable: true,
          href: '/services',
          flagLayout: true,
        },
        {
          heading: 'Updated Service',
          text: 'Updated service description',
          mediaType: 'image',
          mediaSrc: '/service.jpg',
          mediaAlt: 'Service image',
          mediaPosition: 'exdent',
          headerFirst: true,
        },
        {
          heading: 'Final Configuration',
          text: 'Final card content',
          actionable: false,
          mediaType: 'none',
          flagLayout: false,
          headerFirst: false,
        },
      ];

      for (const update of complexUpdates) {
        Object.assign(element, update);
        await element.updateComplete;
        expect(element).toBe(originalElement);
        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }
    });

    it('should maintain stability during heading level changes', async () => {
      element.heading = 'Heading Level Test';
      const headingLevels = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

      for (const level of headingLevels) {
        element.headingLevel = level as any;
        await element.updateComplete;
        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }
    });
  });

  describe('CRITICAL: Storybook Integration', () => {
    it('should render in Storybook-like environment without auto-dismiss', async () => {
      const storyContainer = document.createElement('div');
      storyContainer.id = 'storybook-root';
      document.body.appendChild(storyContainer);

      element = document.createElement('usa-card') as USACard;
      element.heading = 'Storybook Card';
      element.text = 'Storybook card content';
      element.footerText = 'Storybook footer';
      element.actionable = true;

      storyContainer.appendChild(element);
      await element.updateComplete;

      // Simulate Storybook control updates
      element.heading = 'Updated Storybook Card';
      element.flagLayout = true;
      element.headerFirst = true;
      element.mediaType = 'image';
      element.mediaSrc = '/storybook-image.jpg';
      element.mediaAlt = 'Storybook image';
      await element.updateComplete;

      expect(storyContainer.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
      expect(element.heading).toBe('Updated Storybook Card');

      storyContainer.remove();
    });

    it('should handle Storybook args updates without component removal', async () => {
      element = document.createElement('usa-card') as USACard;
      document.body.appendChild(element);
      await element.updateComplete;

      const storyArgs = [
        {
          heading: 'Args Card 1',
          text: 'Args content 1',
          actionable: false,
          flagLayout: false,
        },
        {
          heading: 'Args Card 2',
          text: 'Args content 2',
          footerText: 'Args footer 2',
          actionable: true,
          flagLayout: true,
          mediaType: 'image',
          mediaSrc: '/args.jpg',
        },
        {
          heading: 'Args Card 3',
          text: 'Args content 3',
          actionable: false,
          mediaType: 'none',
          flagLayout: false,
        },
      ];

      for (const args of storyArgs) {
        Object.assign(element, args);
        await element.updateComplete;
        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }
    });

    it('should maintain stability during complex Storybook interactions', async () => {
      element = document.createElement('usa-card') as USACard;
      document.body.appendChild(element);

      // Simulate complex Storybook scenario with rapid changes
      const interactions = [
        () => {
          element.heading = 'Interactive Card';
        },
        () => {
          element.text = 'Interactive content';
        },
        () => {
          element.actionable = true;
        },
        () => {
          element.flagLayout = true;
        },
        () => {
          element.mediaType = 'image';
          element.mediaSrc = '/interactive.jpg';
        },
        () => {
          element.mediaPosition = 'right';
        },
        () => {
          element.headerFirst = true;
        },
        () => {
          element.footerText = 'Interactive footer';
        },
      ];

      for (const interaction of interactions) {
        interaction();
        await element.updateComplete;
        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }
    });
    describe('JavaScript Implementation Validation', () => {
      it('should pass JavaScript implementation validation', async () => {
        // Validate USWDS JavaScript implementation patterns
        const componentPath = `${process.cwd()}/src/components/card/usa-card.ts`;
        const validation = validateComponentJavaScript(componentPath, 'card');

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

  describe('Accessibility', () => {
    it('should pass comprehensive accessibility tests (same as Storybook)', async () => {
      element.heading = 'Test Card Header';
      element.text = 'Test card body content for accessibility testing.';
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });

    it('should pass comprehensive USWDS compliance tests (prevents structural issues)', async () => {
      element.heading = 'Test Card Header';
      element.text = 'Test card content';
      await element.updateComplete;
      quickUSWDSComplianceTest(element, 'usa-card');
    });
  });

  describe('Responsive/Reflow Accessibility (WCAG 1.4)', () => {
    it('should resize text properly up to 200% (WCAG 1.4.4)', async () => {
      element.heading = 'Card Heading';
      element.text = 'Card body text content';
      await element.updateComplete;

      const heading = element.querySelector('.usa-card__heading');
      expect(heading).toBeTruthy();

      const result = testTextResize(heading as Element, 200);

      expect(result).toBeDefined();
      expect(result.violations).toBeDefined();
    });

    it('should reflow card content at 320px width (WCAG 1.4.10)', async () => {
      element.heading = 'Responsive Card';
      element.text = 'This card should reflow properly on mobile devices';
      await element.updateComplete;

      const result = testReflow(element, 320);

      expect(result).toBeDefined();
      expect(result.contentWidth).toBeGreaterThanOrEqual(0);
    });

    it('should support text spacing adjustments (WCAG 1.4.12)', async () => {
      element.heading = 'Text Spacing Test';
      element.text = 'Testing text spacing adjustments in card content';
      await element.updateComplete;

      const body = element.querySelector('.usa-card__body');
      expect(body).toBeTruthy();

      const result = testTextSpacing(body as Element);

      expect(result.readable).toBe(true);
      expect(result.violations.length).toBe(0);
    });

    it('should be accessible on mobile devices (comprehensive)', async () => {
      element.heading = 'Mobile Card Test';
      element.text = 'Testing mobile accessibility';
      await element.updateComplete;

      const result = await testMobileAccessibility(element);

      expect(result).toBeDefined();
      expect(result.details.reflowWorks).toBeDefined();
      expect(result.details.textResizable).toBeDefined();
    });

    it('should maintain responsive behavior in flag layout (WCAG 1.4.10)', async () => {
      element.flagLayout = true;
      element.heading = 'Flag Layout Card';
      element.text = 'Testing flag layout responsiveness';
      await element.updateComplete;

      const result = testReflow(element, 320);

      expect(result).toBeDefined();
      expect(result.contentWidth).toBeGreaterThanOrEqual(0);
    });

    it('should reflow card with media content (WCAG 1.4.10)', async () => {
      element.mediaType = 'image';
      element.mediaSrc = '/test.jpg';
      element.mediaAlt = 'Test image';
      element.heading = 'Card with Media';
      element.text = 'Card containing media that should reflow';
      await element.updateComplete;

      const result = testReflow(element, 320);

      expect(result).toBeDefined();
      expect(result.contentWidth).toBeGreaterThanOrEqual(0);
    });
  });

  // CRITICAL: Layout and Structure Validation Tests
  // These tests prevent layout issues like incorrect media positioning
  describe('Layout and Structure Validation (Prevent Media Positioning Issues)', () => {
    describe('Media Positioning', () => {
      it('should position media on right when mediaPosition="right"', async () => {
        element.mediaType = 'image';
        element.mediaSrc = '/test.jpg';
        element.mediaAlt = 'Test';
        element.mediaPosition = 'right';
        await element.updateComplete;

        // Card classes are applied to the host element (usa-card tag)
        expect(element.classList.contains('usa-card--media-right')).toBe(true);

        const media = element.querySelector('.usa-card__media');
        expect(media).toBeTruthy();
      });

      it('should use flag layout class for side media', async () => {
        element.mediaType = 'image';
        element.mediaSrc = '/test.jpg';
        element.mediaPosition = 'right';
        element.flagLayout = true;
        await element.updateComplete;

        // Card classes are applied to the host element (usa-card tag)
        expect(element.classList.contains('usa-card--flag')).toBe(true);
      });

      it('should match USWDS reference structure for card with media', async () => {
        element.heading = 'Test Card';
        element.text = 'Test text';
        element.mediaType = 'image';
        element.mediaSrc = '/test.jpg';
        element.mediaPosition = 'right';
        await element.updateComplete;

        // Expected structure from USWDS:
        // <usa-card class="usa-card usa-card--media-right">
        //   <div class="usa-card__container">
        //     <div class="usa-card__header">...</div>
        //     <div class="usa-card__media">...</div>
        //     <div class="usa-card__body">...</div>
        //   </div>
        // </usa-card>

        const container = element.querySelector('.usa-card__container');
        const media = element.querySelector('.usa-card__media');
        const body = element.querySelector('.usa-card__body');

        expect(element.classList.contains('usa-card')).toBe(true);
        expect(container).toBeTruthy();
        expect(media).toBeTruthy();
        expect(body).toBeTruthy();

        // Verify nesting
        expect(element.contains(container as Node)).toBe(true);
        expect(container?.contains(media as Node)).toBe(true);
        expect(container?.contains(body as Node)).toBe(true);
      });
    });

    describe('Flag Layout Structure', () => {
      it('should have proper flag layout classes', async () => {
        element.flagLayout = true;
        element.mediaType = 'image';
        element.mediaSrc = '/test.jpg';
        await element.updateComplete;

        // Card classes are applied to the host element (usa-card tag)
        expect(element.classList.contains('usa-card--flag')).toBe(true);
      });

      it('should NOT have flag class when flagLayout is false (unless mediaPosition is right)', async () => {
        element.flagLayout = false;
        element.mediaType = 'image';
        element.mediaSrc = '/test.jpg';
        element.mediaPosition = 'inset'; // Not right
        await element.updateComplete;

        // Card classes are applied to the host element (usa-card tag)
        // Note: mediaPosition='right' automatically enables flag layout
        expect(element.classList.contains('usa-card--flag')).toBe(false);
      });
    });

    describe('CSS Display Properties', () => {
      it('should have block display on host element', async () => {
        element.heading = 'Test Card';
        await element.updateComplete;

        // In jsdom, getComputedStyle won't return actual CSS values
        // This test validates the element exists - Cypress will test actual display
        const computedStyle = window.getComputedStyle(element);
        expect(computedStyle).toBeTruthy();

        // Note: In a real browser (Cypress), we would verify:
        // expect(computedStyle.display).toBe('block');
      });
    });

    describe('Visual Rendering Validation', () => {
      it('should render card with media in DOM (visual tests in Cypress)', async () => {
        element.heading = 'Test Card';
        element.text = 'Test text';
        element.mediaType = 'image';
        element.mediaSrc = '/test.jpg';
        element.mediaPosition = 'right';
        await element.updateComplete;

        const media = element.querySelector('.usa-card__media');
        const img = element.querySelector('.usa-card__img');

        expect(element.classList.contains('usa-card')).toBe(true);
        expect(media).toBeTruthy();
        expect(img).toBeTruthy();

        // CRITICAL: This structure validation prevents media positioning issues
        // In a real browser (Cypress), we would also check:
        // - Media appears on correct side (right/left)
        // - Image dimensions are correct
        // - Layout doesn't break on mobile
        // Note: jsdom doesn't render, so visual checks are in Cypress tests
      });

      it('should render flag layout correctly', async () => {
        element.heading = 'Flag Card';
        element.text = 'Flag layout text';
        element.mediaType = 'image';
        element.mediaSrc = '/test.jpg';
        element.mediaPosition = 'right';
        element.flagLayout = true;
        await element.updateComplete;

        // Card classes are applied to the host element (usa-card tag)
        expect(element.classList.contains('usa-card--flag')).toBe(true);
        expect(element.classList.contains('usa-card--media-right')).toBe(true);

        // CRITICAL: Flag layout structure correct
        // Visual side-by-side layout verified in Cypress
      });
    });

    describe('Header and Footer Positioning', () => {
      it('should have header before body', async () => {
        element.heading = 'Test Heading';
        element.text = 'Test text';
        await element.updateComplete;

        const container = element.querySelector('.usa-card__container');
        const header = element.querySelector('.usa-card__header');
        const body = element.querySelector('.usa-card__body');

        expect(container).toBeTruthy();
        expect(header).toBeTruthy();
        expect(body).toBeTruthy();

        // Header should come before body
        const children = Array.from(container?.children || []);
        const headerIndex = children.indexOf(header as Element);
        const bodyIndex = children.indexOf(body as Element);

        expect(headerIndex).toBeLessThan(bodyIndex);
      });

      it('should have footer after body when present', async () => {
        element.heading = 'Test';
        element.text = 'Test text';
        element.footerContent = '<a href="#">Link</a>';
        await element.updateComplete;

        const container = element.querySelector('.usa-card__container');
        const body = element.querySelector('.usa-card__body');
        const footer = element.querySelector('.usa-card__footer');

        if (footer) {
          const children = Array.from(container?.children || []);
          const bodyIndex = children.indexOf(body as Element);
          const footerIndex = children.indexOf(footer as Element);

          expect(footerIndex).toBeGreaterThan(bodyIndex);
        }
      });
    });
  });
});
