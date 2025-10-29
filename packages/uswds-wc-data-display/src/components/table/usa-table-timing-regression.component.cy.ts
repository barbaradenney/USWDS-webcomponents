/**
 * @fileoverview Table Timing and Initialization Regression Tests
 *
 * These tests specifically target timing issues that could affect the table component:
 * 1. Sortable header click timing (critical for interactive tables)
 * 2. USWDS initialization timing
 * 3. Sort button creation timing
 * 4. Multiple header interaction timing
 *
 * These tests run in a real browser with actual USWDS JavaScript, catching issues
 * that unit tests in jsdom cannot detect.
 */

import './index.ts';

describe('Table Timing and Initialization Regression Tests', () => {
  describe('Single-Click Requirement (USWDS Integration)', () => {
    it('should sort table on FIRST click of sortable header', () => {
      cy.mount(`
        <usa-table
          id="sort-test"
          caption="Sort Test Table"
        >
          <table class="usa-table">
            <caption>Test Table</caption>
            <thead>
              <tr>
                <th data-sortable scope="col" role="columnheader">Name</th>
                <th data-sortable scope="col" role="columnheader">Age</th>
                <th scope="col" role="columnheader">Email</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">John Doe</th>
                <td>30</td>
                <td>john@example.com</td>
              </tr>
              <tr>
                <th scope="row">Alice Smith</th>
                <td>25</td>
                <td>alice@example.com</td>
              </tr>
              <tr>
                <th scope="row">Bob Johnson</th>
                <td>35</td>
                <td>bob@example.com</td>
              </tr>
            </tbody>
          </table>
        </usa-table>
      `);

      cy.wait(500);

      // CRITICAL: First click should immediately sort
      cy.get('th[data-sortable]').first().find('.usa-table__header__button').click();
      cy.wait(100);

      // Should be sorted (aria-sort attribute set)
      cy.get('th[data-sortable]').first().should('have.attr', 'aria-sort');
    });

    it('should work immediately after component initialization', () => {
      cy.mount(`
        <usa-table
          id="immediate-test"
          caption="Immediate Test"
        >
          <table class="usa-table">
            <caption>Immediate Test</caption>
            <thead>
              <tr>
                <th data-sortable scope="col" role="columnheader">Product</th>
                <th data-sortable scope="col" role="columnheader">Price</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Widget</th>
                <td>$10</td>
              </tr>
              <tr>
                <th scope="row">Gadget</th>
                <td>$20</td>
              </tr>
            </tbody>
          </table>
        </usa-table>
      `);

      // Minimal wait - component should be ready quickly
      cy.wait(300);

      // USWDS should have created sort buttons
      cy.get('.usa-table__header__button').should('exist');

      // Click immediately after initialization
      cy.get('.usa-table__header__button').first().click();
      cy.wait(100);

      // Should work on first try
      cy.get('th[data-sortable]').first().should('have.attr', 'aria-sort');
    });

    it('should toggle sort correctly on each click (no skipped clicks)', () => {
      cy.mount(`
        <usa-table
          id="toggle-test"
          caption="Toggle Test"
        >
          <table class="usa-table">
            <caption>Toggle Test</caption>
            <thead>
              <tr>
                <th data-sortable scope="col" role="columnheader">Item</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Apple</th>
              </tr>
              <tr>
                <th scope="row">Banana</th>
              </tr>
            </tbody>
          </table>
        </usa-table>
      `);

      cy.wait(500);

      const header = cy.get('th[data-sortable]').first();
      const button = cy.get('.usa-table__header__button').first();

      // Click 1: Should sort ascending
      button.click();
      cy.wait(100);
      header.should('have.attr', 'aria-sort', 'ascending');

      // Click 2: Should sort descending
      button.click();
      cy.wait(100);
      header.should('have.attr', 'aria-sort', 'descending');

      // Click 3: Should sort ascending again
      button.click();
      cy.wait(100);
      header.should('have.attr', 'aria-sort', 'ascending');
    });
  });

  describe('Table-Specific Timing Tests', () => {
    it('should create sort buttons on initialization', () => {
      cy.mount(`
        <usa-table
          id="button-test"
          caption="Button Creation Test"
        >
          <table class="usa-table">
            <caption>Button Test</caption>
            <thead>
              <tr>
                <th data-sortable scope="col" role="columnheader">Column A</th>
                <th data-sortable scope="col" role="columnheader">Column B</th>
                <th data-sortable scope="col" role="columnheader">Column C</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Data</th>
                <td>Value</td>
                <td>Info</td>
              </tr>
            </tbody>
          </table>
        </usa-table>
      `);

      cy.wait(500);

      // USWDS should create buttons for all sortable headers
      cy.get('.usa-table__header__button').should('have.length', 3);

      // Buttons should have proper attributes
      cy.get('.usa-table__header__button').first().should('have.attr', 'tabindex', '0');
      cy.get('.usa-table__header__button').first().should('have.attr', 'title');
    });

    it('should update sort labels immediately', () => {
      cy.mount(`
        <usa-table
          id="label-test"
          caption="Label Update Test"
        >
          <table class="usa-table">
            <caption>Label Test</caption>
            <thead>
              <tr>
                <th data-sortable scope="col" role="columnheader">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Active</th>
              </tr>
              <tr>
                <th scope="row">Inactive</th>
              </tr>
            </tbody>
          </table>
        </usa-table>
      `);

      cy.wait(500);

      // Initial state - unsorted
      cy.get('th[data-sortable]')
        .first()
        .should('have.attr', 'aria-label')
        .and('include', 'unsorted');

      // Click to sort
      cy.get('.usa-table__header__button').first().click();
      cy.wait(100);

      // Label should update immediately
      cy.get('th[data-sortable]')
        .first()
        .should('have.attr', 'aria-label')
        .and('include', 'sorted');
    });

    it('should handle multiple sortable headers independently', () => {
      cy.mount(`
        <usa-table
          id="multiple-test"
          caption="Multiple Headers Test"
        >
          <table class="usa-table">
            <caption>Multiple Test</caption>
            <thead>
              <tr>
                <th data-sortable scope="col" role="columnheader">First</th>
                <th data-sortable scope="col" role="columnheader">Second</th>
                <th data-sortable scope="col" role="columnheader">Third</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">A</th>
                <td>1</td>
                <td>X</td>
              </tr>
              <tr>
                <th scope="row">B</th>
                <td>2</td>
                <td>Y</td>
              </tr>
            </tbody>
          </table>
        </usa-table>
      `);

      cy.wait(500);

      // Click first header
      cy.get('.usa-table__header__button').eq(0).click();
      cy.wait(100);

      // First should be sorted, others unsorted
      cy.get('th[data-sortable]').eq(0).should('have.attr', 'aria-sort');
      cy.get('th[data-sortable]').eq(1).should('not.have.attr', 'aria-sort');

      // Click second header
      cy.get('.usa-table__header__button').eq(1).click();
      cy.wait(100);

      // Second should be sorted, first should be reset
      cy.get('th[data-sortable]').eq(1).should('have.attr', 'aria-sort');
      cy.get('th[data-sortable]').eq(0).should('not.have.attr', 'aria-sort');
    });

    it('should visually reorder rows on sort', () => {
      cy.mount(`
        <usa-table
          id="reorder-test"
          caption="Row Reorder Test"
        >
          <table class="usa-table">
            <caption>Reorder Test</caption>
            <thead>
              <tr>
                <th data-sortable scope="col" role="columnheader">Name</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Zebra</th>
              </tr>
              <tr>
                <th scope="row">Apple</th>
              </tr>
              <tr>
                <th scope="row">Mango</th>
              </tr>
            </tbody>
          </table>
        </usa-table>
      `);

      cy.wait(500);

      // Get initial first row
      cy.get('tbody tr').first().find('th').should('contain', 'Zebra');

      // Sort ascending (alphabetically)
      cy.get('.usa-table__header__button').first().click();
      cy.wait(200);

      // First row should now be "Apple" (alphabetically first)
      cy.get('tbody tr').first().find('th').should('contain', 'Apple');

      // Sort descending
      cy.get('.usa-table__header__button').first().click();
      cy.wait(200);

      // First row should now be "Zebra" (alphabetically last)
      cy.get('tbody tr').first().find('th').should('contain', 'Zebra');
    });

    it('should handle numeric sorting', () => {
      cy.mount(`
        <usa-table
          id="numeric-test"
          caption="Numeric Sort Test"
        >
          <table class="usa-table">
            <caption>Numeric Test</caption>
            <thead>
              <tr>
                <th scope="col" role="columnheader">Name</th>
                <th data-sortable scope="col" role="columnheader">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Item A</th>
                <td>100</td>
              </tr>
              <tr>
                <th scope="row">Item B</th>
                <td>25</td>
              </tr>
              <tr>
                <th scope="row">Item C</th>
                <td>5</td>
              </tr>
            </tbody>
          </table>
        </usa-table>
      `);

      cy.wait(500);

      // Click numeric column header
      cy.get('th[data-sortable]').find('.usa-table__header__button').click();
      cy.wait(200);

      // Should sort numerically: 5, 25, 100 (ascending)
      cy.get('tbody tr').eq(0).find('td').should('contain', '5');
      cy.get('tbody tr').eq(1).find('td').should('contain', '25');
      cy.get('tbody tr').eq(2).find('td').should('contain', '100');
    });
  });

  describe('USWDS Initialization Timing', () => {
    it('should initialize USWDS after DOM is ready', () => {
      cy.mount(`
        <usa-table
          id="init-test"
          caption="Initialization Test"
        >
          <table class="usa-table">
            <caption>Init Test</caption>
            <thead>
              <tr>
                <th data-sortable scope="col" role="columnheader">Column</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Data</th>
              </tr>
            </tbody>
          </table>
        </usa-table>
      `);

      // Wait for initialization
      cy.wait(500);

      // USWDS-created elements should exist and be functional
      cy.get('.usa-table__header__button').should('exist');
      cy.get('.usa-table__announcement-region[aria-live="polite"]').should('exist');

      // Sort button should work immediately
      cy.get('.usa-table__header__button').click();
      cy.wait(100);
      cy.get('th[data-sortable]').should('have.attr', 'aria-sort');
    });

    it('should not duplicate event handlers on rapid property changes', () => {
      cy.mount(`
        <usa-table
          id="handler-test"
          caption="Handler Test"
        >
          <table class="usa-table">
            <caption>Handler Test</caption>
            <thead>
              <tr>
                <th data-sortable scope="col" role="columnheader">Test</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Value</th>
              </tr>
            </tbody>
          </table>
        </usa-table>
      `);

      const table = cy.get('#handler-test');

      cy.wait(500);

      // Rapidly change properties (could trigger initialization multiple times)
      table.then(($table) => {
        const tableEl = $table[0] as any;
        tableEl.striped = true;
        tableEl.borderless = true;
        tableEl.striped = false;
        tableEl.borderless = false;
      });

      cy.wait(200);

      // Component should still work correctly (no duplicate handlers)
      cy.get('.usa-table__header__button').click();
      cy.wait(100);
      cy.get('th[data-sortable]').should('have.attr', 'aria-sort');
    });
  });

  describe('Accessibility Features', () => {
    it('should have correct ARIA attributes', () => {
      cy.mount(`
        <usa-table
          id="aria-test"
          caption="ARIA Test"
        >
          <table class="usa-table">
            <caption>ARIA Test</caption>
            <thead>
              <tr>
                <th data-sortable scope="col" role="columnheader">Column</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Data</th>
              </tr>
            </tbody>
          </table>
        </usa-table>
      `);

      cy.wait(500);

      // Header should have aria-label
      cy.get('th[data-sortable]').should('have.attr', 'aria-label');

      // Button should have title
      cy.get('.usa-table__header__button').should('have.attr', 'title');

      // Live region should exist
      cy.get('.usa-table__announcement-region[aria-live="polite"]').should('exist');
    });

    it('should update ARIA attributes when sorted', () => {
      cy.mount(`
        <usa-table
          id="aria-update-test"
          caption="ARIA Update Test"
        >
          <table class="usa-table">
            <caption>ARIA Update</caption>
            <thead>
              <tr>
                <th data-sortable scope="col" role="columnheader">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Active</th>
              </tr>
            </tbody>
          </table>
        </usa-table>
      `);

      cy.wait(500);

      // Initial state - unsorted
      cy.get('th[data-sortable]').should('not.have.attr', 'aria-sort');

      // Sort
      cy.get('.usa-table__header__button').click();
      cy.wait(100);

      // Should update aria-sort
      cy.get('th[data-sortable]').should('have.attr', 'aria-sort', 'ascending');

      // Sort again
      cy.get('.usa-table__header__button').click();
      cy.wait(100);

      // Should update to descending
      cy.get('th[data-sortable]').should('have.attr', 'aria-sort', 'descending');
    });

    it('should announce sort changes to screen readers', () => {
      cy.mount(`
        <usa-table
          id="announce-test"
          caption="Announcement Test"
        >
          <table class="usa-table">
            <caption>Announcement Test</caption>
            <thead>
              <tr>
                <th data-sortable scope="col" role="columnheader">Priority</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">High</th>
              </tr>
            </tbody>
          </table>
        </usa-table>
      `);

      cy.wait(500);

      // Live region should be empty initially
      cy.get('.usa-table__announcement-region').should('have.text', '');

      // Sort
      cy.get('.usa-table__header__button').click();
      cy.wait(200);

      // Live region should contain announcement
      cy.get('.usa-table__announcement-region')
        .invoke('text')
        .should('include', 'sorted')
        .and('include', 'ascending');
    });
  });

  describe('Keyboard Interaction', () => {
    it('should be keyboard navigable', () => {
      cy.mount(`
        <usa-table
          id="keyboard-test"
          caption="Keyboard Test"
        >
          <table class="usa-table">
            <caption>Keyboard Test</caption>
            <thead>
              <tr>
                <th data-sortable scope="col" role="columnheader">Name</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Item</th>
              </tr>
            </tbody>
          </table>
        </usa-table>
      `);

      cy.wait(500);

      // Sort button should be focusable
      cy.get('.usa-table__header__button').should('have.attr', 'tabindex', '0');

      // Focus button
      cy.get('.usa-table__header__button').focus();

      // Should be focused
      cy.get('.usa-table__header__button').should('have.focus');

      // Press Enter to sort
      cy.get('.usa-table__header__button').type('{enter}');
      cy.wait(100);

      // Should sort
      cy.get('th[data-sortable]').should('have.attr', 'aria-sort');
    });
  });

  describe('Data-Sort-Value Attribute', () => {
    it('should respect data-sort-value for custom sort order', () => {
      cy.mount(`
        <usa-table
          id="sort-value-test"
          caption="Sort Value Test"
        >
          <table class="usa-table">
            <caption>Sort Value Test</caption>
            <thead>
              <tr>
                <th data-sortable scope="col" role="columnheader">Size</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row" data-sort-value="3">Large</th>
              </tr>
              <tr>
                <th scope="row" data-sort-value="1">Small</th>
              </tr>
              <tr>
                <th scope="row" data-sort-value="2">Medium</th>
              </tr>
            </tbody>
          </table>
        </usa-table>
      `);

      cy.wait(500);

      // Sort ascending
      cy.get('.usa-table__header__button').click();
      cy.wait(200);

      // Should sort by data-sort-value: 1 (Small), 2 (Medium), 3 (Large)
      cy.get('tbody tr').eq(0).find('th').should('contain', 'Small');
      cy.get('tbody tr').eq(1).find('th').should('contain', 'Medium');
      cy.get('tbody tr').eq(2).find('th').should('contain', 'Large');
    });
  });
});
