/**
 * Table Live Region Announcements - Cypress Component Tests
 *
 * These tests verify USWDS live region announcement behavior for table sorting.
 * Moved to Cypress due to timing issues with Lit Light DOM rendering in Vitest.
 */

import './index.ts';
import type { USATable } from './usa-table.js';

describe('Table Live Region Announcements', () => {
  const sampleHeaders = [
    { key: 'name', label: 'Name', sortable: true, sortType: 'text' as const },
    { key: 'age', label: 'Age', sortable: true, sortType: 'number' as const },
    { key: 'email', label: 'Email', sortable: false },
  ];

  const sampleData = [
    { name: 'Alice', age: 30, email: 'alice@example.com' },
    { name: 'Bob', age: 25, email: 'bob@example.com' },
    { name: 'Charlie', age: 35, email: 'charlie@example.com' },
  ];

  beforeEach(() => {
    // Clean up any existing elements
    cy.document().then((doc) => {
      doc.body.innerHTML = '';
    });

    // Create element in document first, BEFORE custom element upgrade
    cy.document().then((doc) => {
      const table = doc.createElement('usa-table') as USATable;
      table.id = 'announcement-test';

      // Set properties BEFORE appending to DOM (before connectedCallback/firstUpdated)
      table.headers = sampleHeaders;
      table.data = sampleData;
      table.caption = 'Data table';

      // Now append to DOM to trigger lifecycle
      doc.body.appendChild(table);
    });

    // Wait for USWDS initialization to complete
    cy.get('#announcement-test').should('have.prop', 'initialized', true);
  });

  afterEach(() => {
    // Clean up
    cy.document().then((doc) => {
      const table = doc.getElementById('announcement-test');
      if (table) {
        table.remove();
      }
    });
  });

  it('should have announcement region with correct attributes', () => {
    cy.get('.usa-table').should('exist');

    // Check that live region exists as table.nextElementSibling
    cy.get('.usa-table').then(($table) => {
      const liveRegion = $table[0].nextElementSibling;
      expect(liveRegion).to.exist;
      expect(liveRegion?.classList.contains('usa-table__announcement-region')).to.be.true;
      expect(liveRegion?.getAttribute('aria-live')).to.equal('polite');
      expect(liveRegion?.getAttribute('aria-atomic')).to.equal('true');
    });
  });

  it('should create sort buttons for sortable headers', () => {
    // Debug: Check if sortable headers exist
    cy.get('th[data-sortable]').should('have.length', 2);

    // Debug: Log what's in the headers
    cy.get('th[data-sortable]')
      .first()
      .then(($th) => {
        cy.log('Header HTML:', $th[0].innerHTML);
        cy.log('Header children:', $th[0].children.length);
      });

    // Check that sort buttons were created
    cy.get('.usa-table__header__button').should('have.length', 2);
  });

  it('should announce sort changes to screen readers', () => {
    // Click sort button
    cy.get('.usa-table__header__button').first().click();

    // Wait for USWDS behavior to update live region
    cy.wait(200);

    // Check that announcement was made
    cy.get('.usa-table').then(($table) => {
      const liveRegion = $table[0].nextElementSibling as HTMLElement;
      const announcement = liveRegion?.textContent || '';

      // Should contain sort information
      expect(announcement).to.match(/sorted by .* in (ascending|descending) order/i);
      expect(announcement.trim()).to.not.be.empty;
    });
  });

  it('should include table caption in announcement', () => {
    // Click sort button
    cy.get('.usa-table__header__button').first().click();

    // Wait for USWDS behavior to update live region
    cy.wait(200);

    // Check that caption is included in announcement
    cy.get('.usa-table').then(($table) => {
      const caption = $table.find('caption');
      const captionText = caption.text().trim();

      const liveRegion = $table[0].nextElementSibling as HTMLElement;
      const announcement = liveRegion?.textContent || '';

      // Should contain caption text
      expect(announcement).to.include(captionText);
      expect(announcement).to.match(/The table named ".*" is now sorted by/i);
    });
  });

  it('should update announcement when sorting different columns', () => {
    // Sort first column
    cy.get('.usa-table__header__button').first().click();
    cy.wait(200);

    // Check first announcement
    cy.get('.usa-table').then(($table) => {
      const liveRegion = $table[0].nextElementSibling as HTMLElement;
      const firstAnnouncement = liveRegion?.textContent || '';
      expect(firstAnnouncement).to.include('Name');
    });

    // Sort second column
    cy.get('.usa-table__header__button').eq(1).click();
    cy.wait(200);

    // Check second announcement
    cy.get('.usa-table').then(($table) => {
      const liveRegion = $table[0].nextElementSibling as HTMLElement;
      const secondAnnouncement = liveRegion?.textContent || '';
      expect(secondAnnouncement).to.include('Age');
      expect(secondAnnouncement).to.not.include('Name');
    });
  });

  it('should update announcement when toggling sort direction', () => {
    // First click - ascending
    cy.get('.usa-table__header__button').first().click();
    cy.wait(200);

    // Check first announcement
    cy.get('.usa-table').then(($table) => {
      const liveRegion = $table[0].nextElementSibling as HTMLElement;
      const firstAnnouncement = liveRegion?.textContent || '';
      expect(firstAnnouncement).to.match(/ascending order/i);
    });

    // Second click - descending
    cy.get('.usa-table__header__button').first().click();
    cy.wait(200);

    // Check second announcement
    cy.get('.usa-table').then(($table) => {
      const liveRegion = $table[0].nextElementSibling as HTMLElement;
      const secondAnnouncement = liveRegion?.textContent || '';
      expect(secondAnnouncement).to.match(/descending order/i);
    });
  });

  it('should preserve announcement after component re-renders', () => {
    // Sort table
    cy.get('.usa-table__header__button').first().click();
    cy.wait(200);

    cy.get('.usa-table').then(($table) => {
      const liveRegion = $table[0].nextElementSibling as HTMLElement;
      const announcement = liveRegion?.textContent || '';
      expect(announcement.trim()).to.not.be.empty;

      // Trigger re-render by updating data
      cy.window().then((win) => {
        const table = win.document.getElementById('announcement-test') as USATable;
        table.data = [...sampleData]; // Trigger reactivity
      });

      cy.wait(200);

      // Announcement should still be present
      const announcementAfterRender = liveRegion?.textContent || '';
      expect(announcementAfterRender).to.equal(announcement);
    });
  });

  it('should work with screen reader testing tools', () => {
    // Inject axe before any interactions
    cy.injectAxe();
    cy.wait(100);

    // Sort table
    cy.get('.usa-table__header__button').first().click();
    cy.wait(200);

    // Verify live region is accessible
    cy.get('.usa-table__announcement-region').then(() => {
      cy.checkA11y('.usa-table__announcement-region', {
        rules: {
          // Ensure live region rules are tested
          'aria-valid-attr': { enabled: true },
          'aria-valid-attr-value': { enabled: true },
        },
      });
    });
  });
});
