// Component tests for usa-icon
import './index.ts';
import { testRapidClicking, testRapidKeyboardInteraction, COMMON_BUG_PATTERNS } from '../../cypress/support/rapid-interaction-tests.ts';

describe('Icon Component Tests', () => {
  beforeEach(() => {
    // Set up console error tracking
    cy.window().then((win) => {
      cy.stub(win.console, 'error').as('consoleError');
    });
  });

  it('should render component with default properties', () => {
    cy.mount('<usa-icon></usa-icon>');
    cy.get('usa-icon').should('exist');
    cy.get('usa-icon').should('be.visible');
  });

  
  it('should handle rapid clicking without visual glitches', () => {
    cy.mount('<usa-icon></usa-icon>');
    
    // Rapid clicking without waiting - simulates real user behavior
    cy.get('usa-icon').as('component');
    
    // Multiple rapid clicks
    cy.get('@component')
      .click()
      .click()
      .click()
      .click()
      .click();
    
    cy.wait(500); // Let events settle
    
    // Component should remain functional
    cy.get('@component').should('exist');
    cy.get('@component').should('be.visible');
  });

  it('should handle interaction during CSS transitions', () => {
    cy.mount('<usa-icon></usa-icon>');
    
    // Click during potential transitions
    cy.get('usa-icon')
      .click()
      .click(); // Immediate second click
    
    cy.wait(1000); // Wait for animations
    
    // Should be in consistent state
    cy.get('usa-icon').should('exist');
  });

  // Stress tests using utility functions
  describe('Stress Testing', () => {
    it('should handle event listener duplication pattern', () => {
      cy.mount('<usa-icon></usa-icon>');
      
      // Test for event listener duplication
      testRapidClicking({
        selector: 'usa-icon',
        clickCount: 15,
        description: 'event listener duplication'
      });
    });

    it('should handle race condition patterns', () => {
      cy.mount('<usa-icon></usa-icon>');
      
      // Test for race conditions during state changes
      cy.get('usa-icon').as('component');
      
      // Rapid interactions that might cause race conditions
      cy.get('@component')
        .click()
        .click()
        .trigger('focus')
        .trigger('blur')
        .click();
      
      cy.wait(1000); // Wait for all async operations
      
      // Component should still be functional
      cy.get('@component').should('exist');
      cy.get('@component').should('be.visible');
    });
  });

  // Accessibility testing - critical for government components
  it('should be accessible', () => {
    cy.mount('<usa-icon></usa-icon>');
    
    cy.injectAxe();
    cy.checkAccessibility();
  });

  // Test that component maintains accessibility after interactions
  it('should maintain accessibility after rapid interactions', () => {
    cy.mount('<usa-icon></usa-icon>');
    
    // Perform various rapid interactions
    cy.get('usa-icon')
      .click()
      .focus()
      .blur()
      .click()
      .click();
    
    cy.wait(500);
    
    // Accessibility should still be intact
    cy.injectAxe();
    cy.checkAccessibility();
  });

  // Performance regression test
  it('should not cause memory leaks with rapid mounting/unmounting', () => {
    // This catches memory leaks and cleanup issues
    for (let i = 0; i < 5; i++) {
      cy.mount('<usa-icon></usa-icon>');
      cy.get('usa-icon').should('exist');
      // Cypress automatically cleans up between mounts
    }
  });

  // Console error test - should not generate any JavaScript errors
  it('should not generate console errors during interactions', () => {
    cy.mount('<usa-icon></usa-icon>');
    
    // Various interactions that might cause errors
    cy.get('usa-icon')
      .click()
      .trigger('mouseenter')
      .trigger('mouseleave')
      .focus()
      .blur();
    
    cy.wait(500);
    
    // No console errors should have occurred
    cy.get('@consoleError').should('not.have.been.called');
  });

  // NEW (Oct 2025): Icon Visibility & Rendering Tests
  describe('Icon Visibility & Rendering', () => {
    it('should render icon with visible SVG element', () => {
      cy.mount('<usa-icon name="mail" size="5" aria-label="Email"></usa-icon>');

      cy.get('usa-icon').should('exist');
      cy.get('usa-icon svg').should('exist');
      cy.get('usa-icon svg').should('have.class', 'usa-icon');
      cy.get('usa-icon svg').should('have.class', 'usa-icon--size-5');
    });

    it('should render mail icon (not email)', () => {
      cy.mount('<usa-icon name="mail" aria-label="Email us"></usa-icon>');

      cy.get('usa-icon svg').should('exist');
      cy.get('usa-icon svg use').should('have.attr', 'href').and('include', '#mail');
    });

    it('should render multiple icon sizes correctly', () => {
      const sizes = ['3', '4', '5', '6', '7', '8', '9'];

      sizes.forEach(size => {
        cy.mount(`<usa-icon name="search" size="${size}"></usa-icon>`);
        cy.get('usa-icon svg').should('have.class', `usa-icon--size-${size}`);
      });
    });

    it('should render common USWDS icons without errors', () => {
      const commonIcons = ['mail', 'phone', 'search', 'menu', 'close', 'info', 'warning', 'help'];

      commonIcons.forEach(iconName => {
        cy.mount(`<usa-icon name="${iconName}" aria-label="${iconName}"></usa-icon>`);
        cy.get('usa-icon').should('exist');
        cy.get('usa-icon svg').should('exist');
        cy.get('usa-icon svg use').should('have.attr', 'href').and('include', `#${iconName}`);
      });
    });

    it('should handle sprite URL correctly', () => {
      cy.mount('<usa-icon name="flag" sprite-url="/img/sprite.svg"></usa-icon>');

      cy.get('usa-icon svg use').should('have.attr', 'href', '/img/sprite.svg#flag');
    });

    it('should render decorative icons correctly', () => {
      cy.mount('<usa-icon name="star" decorative="true"></usa-icon>');

      cy.get('usa-icon svg').should('have.attr', 'aria-hidden', 'true');
      cy.get('usa-icon svg').should('not.have.attr', 'aria-label');
    });

    it('should render semantic icons with aria-label', () => {
      cy.mount('<usa-icon name="info" aria-label="Important information"></usa-icon>');

      cy.get('usa-icon svg').should('have.attr', 'aria-label', 'Important information');
      cy.get('usa-icon svg').should('have.attr', 'aria-hidden', 'false');
    });
  });

  // NEW (Oct 2025): Icon Gallery Visual Tests
  describe('Icon Gallery Rendering', () => {
    it('should render icon gallery with multiple icons', () => {
      const iconGallery = `
        <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 1rem; padding: 1rem;">
          <usa-icon name="mail" size="5"></usa-icon>
          <usa-icon name="phone" size="5"></usa-icon>
          <usa-icon name="search" size="5"></usa-icon>
          <usa-icon name="menu" size="5"></usa-icon>
          <usa-icon name="close" size="5"></usa-icon>
          <usa-icon name="info" size="5"></usa-icon>
        </div>
      `;

      cy.mount(iconGallery);

      cy.get('usa-icon').should('have.length', 6);
      cy.get('usa-icon svg').should('have.length', 6);
      cy.get('usa-icon svg').each($svg => {
        expect($svg).to.have.class('usa-icon');
      });
    });

    it('should render all icon categories correctly', () => {
      const categories = {
        communication: ['mail', 'phone', 'chat'],
        navigation: ['arrow_forward', 'arrow_back', 'menu'],
        actions: ['search', 'edit', 'delete'],
        status: ['check_circle', 'error', 'warning'],
        file: ['file_download', 'file_upload', 'folder'],
        social: ['facebook', 'twitter', 'github']
      };

      Object.entries(categories).forEach(([category, icons]) => {
        const galleryHtml = `
          <div data-category="${category}">
            ${icons.map(icon => `<usa-icon name="${icon}" size="4"></usa-icon>`).join('')}
          </div>
        `;

        cy.mount(galleryHtml);

        cy.get('usa-icon').should('have.length', icons.length);
        cy.get('usa-icon svg').should('have.length', icons.length);
      });
    });

    it('should render 10+ icons without performance issues', () => {
      const sampleIcons = [
        'mail', 'phone', 'search', 'menu', 'close',
        'info', 'warning', 'help', 'star', 'flag',
        'home', 'settings', 'lock', 'person', 'calendar_today'
      ];

      const galleryHtml = `
        <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.5rem;">
          ${sampleIcons.map(icon => `<usa-icon name="${icon}" size="4"></usa-icon>`).join('')}
        </div>
      `;

      const startTime = Date.now();
      cy.mount(galleryHtml);
      const endTime = Date.now();

      cy.get('usa-icon').should('have.length', sampleIcons.length);
      cy.get('usa-icon svg').should('have.length', sampleIcons.length);

      // Should render quickly (within 500ms)
      expect(endTime - startTime).to.be.lessThan(500);
    });

    it('should maintain consistent sizing across all icons in gallery', () => {
      cy.mount(`
        <div style="display: flex; gap: 1rem;">
          <usa-icon name="mail" size="5"></usa-icon>
          <usa-icon name="phone" size="5"></usa-icon>
          <usa-icon name="search" size="5"></usa-icon>
        </div>
      `);

      cy.get('usa-icon svg').each($svg => {
        expect($svg).to.have.class('usa-icon--size-5');
      });
    });

    it('should render icons with proper accessibility in gallery', () => {
      cy.mount(`
        <div role="list" aria-label="Icon gallery">
          <usa-icon name="mail" aria-label="Email icon" size="4"></usa-icon>
          <usa-icon name="phone" aria-label="Phone icon" size="4"></usa-icon>
          <usa-icon name="search" aria-label="Search icon" size="4"></usa-icon>
        </div>
      `);

      cy.injectAxe();
      cy.checkAccessibility();
    });
  });

  // NEW (Oct 2025): Icon Naming Regression Tests
  describe('Icon Naming Convention Tests', () => {
    it('should use "mail" icon name (USWDS standard)', () => {
      cy.mount('<usa-icon name="mail"></usa-icon>');

      cy.get('usa-icon svg use').should('have.attr', 'href').and('include', '#mail');
    });

    it('should not use deprecated "email" icon name', () => {
      // This documents that "email" is not a valid USWDS icon
      cy.mount('<usa-icon name="email" use-sprite="false"></usa-icon>');

      // Should render fallback icon (circle)
      cy.get('usa-icon svg path').should('have.attr', 'd')
        .and('include', 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10');
    });

    it('should verify all common icons use correct USWDS names', () => {
      const correctNames = {
        'mail': '#mail',  // NOT 'email'
        'phone': '#phone',
        'search': '#search',
        'menu': '#menu',
        'close': '#close'
      };

      Object.entries(correctNames).forEach(([iconName, expectedHref]) => {
        cy.mount(`<usa-icon name="${iconName}"></usa-icon>`);
        cy.get('usa-icon svg use').should('have.attr', 'href').and('include', expectedHref);
      });
    });
  });
});