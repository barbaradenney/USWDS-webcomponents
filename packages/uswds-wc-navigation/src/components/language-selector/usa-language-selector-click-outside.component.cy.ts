/**
 * REGRESSION TEST: Click-Outside-to-Close Dropdown
 *
 * Issue #2025-01
 *
 * Bug: Language selector dropdown would only close when clicking the toggle button,
 * not when clicking outside the component.
 *
 * Root Cause:
 * 1. Behavior was initialized with component element instead of document
 * 2. Click detection logic checked for BODY specifically instead of "outside component"
 *
 * Fix:
 * 1. Changed initializeLanguageSelector(this) to initializeLanguageSelector(document)
 * 2. Changed click logic from checking BODY to checking !target.closest(LANGUAGE)
 *
 * These tests ensure the dropdown closes properly when clicking outside.
 */

import '../../../src/components/language-selector/index.ts';

describe('Language Selector - Click Outside to Close (REGRESSION)', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);

    cy.document().then((doc) => {
      // Clear document
      doc.body.innerHTML = '';

      // Create language selector
      const selector = doc.createElement('usa-language-selector');
      selector.setAttribute('variant', 'dropdown');
      selector.setAttribute('current-language', 'en');
      selector.setAttribute('button-text', 'Language');

      // Add some padding so we can click outside
      const container = doc.createElement('div');
      container.style.padding = '100px';
      container.style.minHeight = '500px';
      container.appendChild(selector);
      doc.body.appendChild(container);

      // Set languages via property
      cy.wrap(selector).then(($el) => {
        ($el[0] as any).languages = [
          { code: 'en', name: 'English', nativeName: 'English' },
          { code: 'es', name: 'Spanish', nativeName: 'Español' },
          { code: 'fr', name: 'French', nativeName: 'Français' },
        ];
      });
    });

    // Wait for component to initialize
    cy.wait(200);
  });

  it('REGRESSION: should close dropdown when clicking outside component', () => {
    // Open dropdown
    cy.get('.usa-language__link').click();

    // Verify dropdown is open
    cy.get('.usa-language__link').should('have.attr', 'aria-expanded', 'true');
    cy.get('.usa-language__submenu').should('be.visible');

    // Click outside the component (on body padding area)
    cy.get('body').click(50, 50); // Click in top-left padding

    // Verify dropdown is closed
    cy.get('.usa-language__submenu').should('not.be.visible');
  });

  it('REGRESSION: should close dropdown when clicking on page background', () => {
    // Open dropdown
    cy.get('.usa-language__link').click();
    cy.get('.usa-language__submenu').should('be.visible');

    // Click somewhere else on the page
    cy.get('body').click('bottom');

    // Dropdown should close
    cy.get('.usa-language__submenu').should('not.be.visible');
  });

  it('REGRESSION: should NOT close when clicking inside dropdown menu', () => {
    // Open dropdown
    cy.get('.usa-language__link').click();
    cy.get('.usa-language__submenu').should('be.visible');

    // Click on the dropdown container itself (not a link)
    cy.get('.usa-language__primary').click({ force: true });

    // Dropdown should still be open
    cy.get('.usa-language__submenu').should('be.visible');
  });

  it('REGRESSION: should toggle - open, close by outside click, open again', () => {
    const toggleButton = '.usa-language__link';
    const submenu = '.usa-language__submenu';

    // Open dropdown
    cy.get(toggleButton).click();
    cy.get(submenu).should('be.visible');

    // Close by clicking outside
    cy.get('body').click(50, 50);
    cy.get(submenu).should('not.be.visible');

    // Open again
    cy.get(toggleButton).click();
    cy.get(submenu).should('be.visible');

    // Close by toggle button
    cy.get(toggleButton).click();
    cy.get(submenu).should('not.be.visible');
  });

  it('REGRESSION: should close on Escape key', () => {
    // Open dropdown
    cy.get('.usa-language__link').click();
    cy.get('.usa-language__submenu').should('be.visible');

    // Press Escape
    cy.get('body').type('{esc}');

    // Dropdown should close
    cy.get('.usa-language__submenu').should('not.be.visible');
  });

  it('REGRESSION: should select language and close dropdown', () => {
    // Open dropdown
    cy.get('.usa-language__link').click();
    cy.get('.usa-language__submenu').should('be.visible');

    // Click on a language option
    cy.get('.usa-language__submenu a').first().click();

    // Dropdown should close after selection
    cy.get('.usa-language__submenu').should('not.be.visible');
  });

  it('REGRESSION: should work with multiple dropdowns on same page', () => {
    // Add second language selector
    cy.document().then((doc) => {
      const selector2 = doc.createElement('usa-language-selector');
      selector2.setAttribute('variant', 'dropdown');
      selector2.setAttribute('current-language', 'en');
      selector2.setAttribute('button-text', 'Language 2');
      selector2.setAttribute('id', 'selector-2');

      doc.body.appendChild(selector2);

      cy.wrap(selector2).then(($el) => {
        ($el[0] as any).languages = [
          { code: 'en', name: 'English', nativeName: 'English' },
          { code: 'de', name: 'German', nativeName: 'Deutsch' },
        ];
      });
    });

    cy.wait(200);

    // Open first dropdown
    cy.get('usa-language-selector').first().find('.usa-language__link').click();
    cy.get('usa-language-selector').first().find('.usa-language__submenu').should('be.visible');

    // Open second dropdown
    cy.get('#selector-2 .usa-language__link').click();
    cy.get('#selector-2 .usa-language__submenu').should('be.visible');

    // Click outside both
    cy.get('body').click(50, 50);

    // Both should close
    cy.get('usa-language-selector').first().find('.usa-language__submenu').should('not.be.visible');
    cy.get('#selector-2 .usa-language__submenu').should('not.be.visible');
  });

  it('REGRESSION: should maintain click-outside behavior after reopening', () => {
    // Open and close multiple times
    for (let i = 0; i < 3; i++) {
      // Open
      cy.get('.usa-language__link').click();
      cy.get('.usa-language__submenu').should('be.visible');

      // Close by clicking outside
      cy.get('body').click(50, 50);
      cy.get('.usa-language__submenu').should('not.be.visible');
    }

    // Should still work correctly
    cy.get('.usa-language__link').click();
    cy.get('.usa-language__submenu').should('be.visible');
    cy.get('body').click(50, 50);
    cy.get('.usa-language__submenu').should('not.be.visible');
  });
});
