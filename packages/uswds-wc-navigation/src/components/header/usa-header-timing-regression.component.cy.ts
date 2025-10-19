/**
 * @fileoverview Header Timing and Initialization Regression Tests
 *
 * These tests specifically target timing issues that could affect the header component:
 * 1. Double-click requirement (requestAnimationFrame timing fix)
 * 2. Race condition in initialization
 * 3. USWDS mobile menu toggle timing
 *
 * These tests run in a real browser with actual USWDS JavaScript, catching issues
 * that unit tests in jsdom cannot detect.
 */

import './index.ts';

describe('Header Timing and Initialization Regression Tests', () => {
  describe('Single-Click Requirement (Mobile Menu Toggle)', () => {
    it('should toggle mobile menu on FIRST click of menu button', () => {
      cy.mount(`
        <usa-header>
          <div class="usa-navbar">
            <button type="button" class="usa-menu-btn">Menu</button>
          </div>
          <nav class="usa-nav">
            <button type="button" class="usa-nav__close">
              <img src="/close.svg" role="img" alt="Close" />
            </button>
            <ul class="usa-nav__primary usa-accordion">
              <li class="usa-nav__primary-item">
                <a href="#" class="usa-nav__link">
                  <span>Home</span>
                </a>
              </li>
              <li class="usa-nav__primary-item">
                <a href="#" class="usa-nav__link">
                  <span>About</span>
                </a>
              </li>
            </ul>
          </nav>
        </usa-header>
      `);

      // Wait for component to initialize and USWDS to set up event handlers
      cy.wait(500);

      // Verify menu button exists
      cy.get('.usa-menu-btn').should('exist');

      // CRITICAL: First click should immediately work
      cy.get('.usa-menu-btn').click();

      // Give USWDS time to toggle navigation
      cy.wait(200);

      // Navigation should be visible after FIRST click (not second)
      cy.get('.usa-nav').should('be.visible');
      cy.get('.usa-nav').should('have.attr', 'aria-hidden', 'false');
    });

    it('should work immediately after component initialization', () => {
      cy.mount(`
        <usa-header>
          <div class="usa-navbar">
            <button type="button" class="usa-menu-btn">Menu</button>
          </div>
          <nav class="usa-nav">
            <button type="button" class="usa-nav__close">
              <img src="/close.svg" role="img" alt="Close" />
            </button>
            <ul class="usa-nav__primary usa-accordion">
              <li class="usa-nav__primary-item">
                <a href="#" class="usa-nav__link">
                  <span>Quick Test</span>
                </a>
              </li>
            </ul>
          </nav>
        </usa-header>
      `);

      // Minimal wait - component should be ready quickly
      cy.wait(100);

      // Click immediately after initialization
      cy.get('.usa-menu-btn').click();

      // Should work on first try
      cy.wait(200);
      cy.get('.usa-nav').should('be.visible');
    });

    it('should toggle correctly on each click (no skipped clicks)', () => {
      cy.mount(`
        <usa-header>
          <div class="usa-navbar">
            <button type="button" class="usa-menu-btn">Menu</button>
          </div>
          <nav class="usa-nav">
            <button type="button" class="usa-nav__close">
              <img src="/close.svg" role="img" alt="Close" />
            </button>
            <ul class="usa-nav__primary usa-accordion">
              <li class="usa-nav__primary-item">
                <a href="#" class="usa-nav__link">
                  <span>Toggle Test</span>
                </a>
              </li>
            </ul>
          </nav>
        </usa-header>
      `);

      cy.wait(200);

      // Click 1: Should open
      cy.get('.usa-menu-btn').click();
      cy.wait(100);
      cy.get('.usa-nav').should('be.visible');

      // Click 2: Close button should work
      cy.get('.usa-nav__close').click();
      cy.wait(100);
      cy.get('.usa-nav').should('not.be.visible');

      // Click 3: Should open again
      cy.get('.usa-menu-btn').click();
      cy.wait(100);
      cy.get('.usa-nav').should('be.visible');
    });
  });

  describe('Initialization Verification', () => {
    it('should initialize USWDS after DOM is ready', () => {
      cy.mount(`
        <usa-header>
          <div class="usa-navbar">
            <button type="button" class="usa-menu-btn">Menu</button>
          </div>
          <nav class="usa-nav">
            <ul class="usa-nav__primary usa-accordion">
              <li class="usa-nav__primary-item">
                <a href="#" class="usa-nav__link">
                  <span>Init Test</span>
                </a>
              </li>
            </ul>
          </nav>
        </usa-header>
      `);

      cy.wait(200);

      // After initialization, menu button should have proper attributes
      cy.get('.usa-menu-btn').should('have.attr', 'aria-controls');
      cy.get('.usa-menu-btn').should('have.attr', 'aria-expanded');
    });

    it('should not duplicate event handlers on rapid property changes', () => {
      cy.mount(`
        <usa-header id="rapid-test">
          <div class="usa-navbar">
            <button type="button" class="usa-menu-btn">Menu</button>
          </div>
          <nav class="usa-nav">
            <ul class="usa-nav__primary usa-accordion">
              <li class="usa-nav__primary-item">
                <a href="#" class="usa-nav__link">
                  <span>Rapid Test</span>
                </a>
              </li>
            </ul>
          </nav>
        </usa-header>
      `);

      cy.wait(200);

      // Rapidly change properties
      cy.get('#rapid-test').then(($header) => {
        const header = $header[0] as any;
        header.setAttribute('data-test', '1');
        header.setAttribute('data-test', '2');
        header.setAttribute('data-test', '3');
      });

      cy.wait(100);

      // Menu should still work correctly (no duplicate handlers)
      cy.get('.usa-menu-btn').click();
      cy.wait(100);
      cy.get('.usa-nav').should('be.visible');

      // Close should work
      cy.get('.usa-nav__close').click();
      cy.wait(100);
      cy.get('.usa-nav').should('not.be.visible');

      // Open should work again
      cy.get('.usa-menu-btn').click();
      cy.wait(100);
      cy.get('.usa-nav').should('be.visible');
    });
  });

  describe('Accessibility Validation', () => {
    it('should have correct ARIA attributes', () => {
      cy.mount(`
        <usa-header>
          <div class="usa-navbar">
            <button type="button" class="usa-menu-btn">Menu</button>
          </div>
          <nav class="usa-nav">
            <button type="button" class="usa-nav__close">
              <img src="/close.svg" role="img" alt="Close" />
            </button>
            <ul class="usa-nav__primary usa-accordion">
              <li class="usa-nav__primary-item">
                <a href="#" class="usa-nav__link">
                  <span>Accessibility Test</span>
                </a>
              </li>
            </ul>
          </nav>
        </usa-header>
      `);

      cy.wait(200);

      // Menu button should have proper ARIA attributes
      cy.get('.usa-menu-btn').should('have.attr', 'aria-controls');
      cy.get('.usa-menu-btn').should('have.attr', 'aria-expanded', 'false');

      // Navigation should have aria-hidden
      cy.get('.usa-nav').should('have.attr', 'aria-hidden', 'true');

      // Click to open
      cy.get('.usa-menu-btn').click();
      cy.wait(100);

      // ARIA attributes should update
      cy.get('.usa-menu-btn').should('have.attr', 'aria-expanded', 'true');
      cy.get('.usa-nav').should('have.attr', 'aria-hidden', 'false');
    });

    it('should be keyboard navigable', () => {
      cy.mount(`
        <usa-header>
          <div class="usa-navbar">
            <button type="button" class="usa-menu-btn">Menu</button>
          </div>
          <nav class="usa-nav">
            <button type="button" class="usa-nav__close">
              <img src="/close.svg" role="img" alt="Close" />
            </button>
            <ul class="usa-nav__primary usa-accordion">
              <li class="usa-nav__primary-item">
                <a href="#" class="usa-nav__link">
                  <span>Keyboard Test</span>
                </a>
              </li>
            </ul>
          </nav>
        </usa-header>
      `);

      cy.wait(200);

      // Focus menu button with keyboard
      cy.get('.usa-menu-btn').focus();
      cy.get('.usa-menu-btn').should('have.focus');

      // Press Enter to open
      cy.get('.usa-menu-btn').type('{enter}');
      cy.wait(100);
      cy.get('.usa-nav').should('be.visible');

      // Focus close button
      cy.get('.usa-nav__close').focus();
      cy.get('.usa-nav__close').should('have.focus');

      // Press Enter to close
      cy.get('.usa-nav__close').type('{enter}');
      cy.wait(100);
      cy.get('.usa-nav').should('not.be.visible');
    });
  });

  describe('Responsive Behavior', () => {
    it('should handle viewport resize correctly', () => {
      cy.mount(`
        <usa-header>
          <div class="usa-navbar">
            <button type="button" class="usa-menu-btn">Menu</button>
          </div>
          <nav class="usa-nav">
            <ul class="usa-nav__primary usa-accordion">
              <li class="usa-nav__primary-item">
                <a href="#" class="usa-nav__link">
                  <span>Resize Test</span>
                </a>
              </li>
            </ul>
          </nav>
        </usa-header>
      `);

      cy.wait(200);

      // Test mobile viewport
      cy.viewport(375, 667);
      cy.wait(100);

      // Menu button should be functional on mobile
      cy.get('.usa-menu-btn').click();
      cy.wait(100);
      cy.get('.usa-nav').should('be.visible');

      // Test desktop viewport
      cy.viewport(1280, 720);
      cy.wait(100);

      // Navigation state should persist or reset appropriately
      cy.get('.usa-navbar').should('exist');
    });
  });
});
