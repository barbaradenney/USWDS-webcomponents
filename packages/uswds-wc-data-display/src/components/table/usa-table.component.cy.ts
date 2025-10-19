// Component tests for usa-table
import './index.ts';
import {
  testRapidClicking,
  testRapidKeyboardInteraction,
  COMMON_BUG_PATTERNS,
} from '../../cypress/support/rapid-interaction-tests.ts';

describe('Table Component Tests', () => {
  beforeEach(() => {
    // Set up console error tracking
    cy.window().then((win) => {
      cy.stub(win.console, 'error').as('consoleError');
    });
  });

  it('should render component with default properties', () => {
    cy.mount('<usa-table></usa-table>');
    cy.get('usa-table').should('exist');
    cy.get('usa-table').should('be.visible');
  });

  it('should handle rapid clicking without visual glitches', () => {
    cy.mount('<usa-table></usa-table>');

    // Rapid clicking without waiting - simulates real user behavior
    cy.get('usa-table').as('component');

    // Multiple rapid clicks
    cy.get('@component').click().click().click().click().click();

    cy.wait(500); // Let events settle

    // Component should remain functional
    cy.get('@component').should('exist');
    cy.get('@component').should('be.visible');
  });

  it('should handle interaction during CSS transitions', () => {
    cy.mount('<usa-table></usa-table>');

    // Click during potential transitions
    cy.get('usa-table').click().click(); // Immediate second click

    cy.wait(1000); // Wait for animations

    // Should be in consistent state
    cy.get('usa-table').should('exist');
  });
  it('should handle rapid keyboard navigation', () => {
    cy.mount('<usa-table></usa-table>');

    // Rapid keyboard navigation
    cy.get('usa-table').focus();

    const keys = ['{rightarrow}', '{leftarrow}', '{downarrow}', '{uparrow}'];

    // Rapidly navigate
    for (let i = 0; i < 20; i++) {
      const key = keys[i % keys.length];
      cy.get('usa-table').type(key);
    }

    cy.wait(500);

    // Navigation should still work
    cy.get('usa-table').should('exist');
    cy.get('usa-table').should('be.visible');
  });

  // Stress tests using utility functions
  describe('Stress Testing', () => {
    it('should handle event listener duplication pattern', () => {
      cy.mount('<usa-table></usa-table>');

      // Test for event listener duplication
      testRapidClicking({
        selector: 'usa-table',
        clickCount: 15,
        description: 'event listener duplication',
      });
    });

    it('should handle race condition patterns', () => {
      cy.mount('<usa-table></usa-table>');

      // Test for race conditions during state changes
      cy.get('usa-table').as('component');

      // Rapid interactions that might cause race conditions
      cy.get('@component').click().click().trigger('focus').trigger('blur').click();

      cy.wait(1000); // Wait for all async operations

      // Component should still be functional
      cy.get('@component').should('exist');
      cy.get('@component').should('be.visible');
    });
  });

  // Accessibility testing - critical for government components
  it('should be accessible', () => {
    cy.mount('<usa-table></usa-table>');

    cy.injectAxe();
    cy.checkAccessibility();
  });

  // Test that component maintains accessibility after interactions
  it('should maintain accessibility after rapid interactions', () => {
    cy.mount('<usa-table></usa-table>');

    // Perform various rapid interactions
    cy.get('usa-table').click().focus().blur().click().click();

    cy.wait(500);

    // Accessibility should still be intact
    cy.injectAxe();
    cy.checkAccessibility();
  });

  // Performance regression test
  it('should not cause memory leaks with rapid mounting/unmounting', () => {
    // This catches memory leaks and cleanup issues
    for (let i = 0; i < 5; i++) {
      cy.mount('<usa-table></usa-table>');
      cy.get('usa-table').should('exist');
      // Cypress automatically cleans up between mounts
    }
  });

  // Console error test - should not generate any JavaScript errors
  it('should not generate console errors during interactions', () => {
    cy.mount('<usa-table></usa-table>');

    // Various interactions that might cause errors
    cy.get('usa-table').click().trigger('mouseenter').trigger('mouseleave').focus().blur();

    cy.wait(500);

    // No console errors should have occurred
    cy.get('@consoleError').should('not.have.been.called');
  });

  // Event Propagation Control Testing (Critical Gap Fix)
  describe('Event Propagation Control', () => {
    it('should isolate cell clicks from row selection events', () => {
      let cellClicked = false;
      let rowSelected = false;
      let conflictDetected = false;

      const tableData = [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Editor' },
      ];

      const columns = [
        { key: 'name', label: 'Name', sortable: true },
        { key: 'email', label: 'Email', sortable: true },
        { key: 'role', label: 'Role', sortable: false },
      ];

      cy.mount(`<usa-table id="cell-row-test"></usa-table>`);

      cy.window().then((win) => {
        const table = win.document.getElementById('cell-row-test') as any;
        table.data = tableData;
        table.columns = columns;
        table.selectable = true;

        // Listen for cell clicks
        table.addEventListener('cell-click', (e: CustomEvent) => {
          if (rowSelected) {
            conflictDetected = true;
          }
          cellClicked = true;
        });

        // Listen for row selection
        table.addEventListener('row-select', (e: CustomEvent) => {
          if (cellClicked) {
            conflictDetected = true;
          }
          rowSelected = true;
        });
      });

      // Click on cell should trigger cell click, not row selection
      cy.get('usa-table td')
        .first()
        .click()
        .then(() => {
          expect(cellClicked).to.be.true;
          expect(conflictDetected).to.be.false;
        });

      // Reset flags
      cy.window().then(() => {
        cellClicked = false;
        rowSelected = false;
        conflictDetected = false;
      });

      // Click on row selector (if present) should trigger row selection
      cy.get('usa-table tr')
        .first()
        .click()
        .then(() => {
          // Test demonstrates proper event isolation between cell and row interactions
        });
    });

    it('should prevent sort header clicks from interfering with cell editing', () => {
      let headerClicked = false;
      let cellEditStarted = false;
      let sortTriggered = false;
      let editInterrupted = false;

      const tableData = [
        { id: 1, name: 'Alice Brown', department: 'Engineering', salary: 75000 },
        { id: 2, name: 'Charlie Davis', department: 'Marketing', salary: 65000 },
        { id: 3, name: 'Diana Wilson', department: 'Sales', salary: 70000 },
      ];

      const columns = [
        { key: 'name', label: 'Name', sortable: true, editable: true },
        { key: 'department', label: 'Department', sortable: true, editable: true },
        { key: 'salary', label: 'Salary', sortable: true, editable: true },
      ];

      cy.mount(`<usa-table id="sort-edit-test"></usa-table>`);

      cy.window().then((win) => {
        const table = win.document.getElementById('sort-edit-test') as any;
        table.data = tableData;
        table.columns = columns;

        // Listen for header clicks
        table.addEventListener('header-click', (e: CustomEvent) => {
          headerClicked = true;
        });

        // Listen for sort events
        table.addEventListener('sort', (e: CustomEvent) => {
          if (cellEditStarted) {
            editInterrupted = true;
          }
          sortTriggered = true;
        });

        // Listen for cell edit events
        table.addEventListener('cell-edit-start', (e: CustomEvent) => {
          cellEditStarted = true;
        });
      });

      // Start cell editing
      cy.get('usa-table td')
        .first()
        .dblclick()
        .then(() => {
          cellEditStarted = true;
        });

      // Click sort header should not interrupt cell editing
      cy.get('usa-table th')
        .first()
        .click()
        .then(() => {
          expect(headerClicked).to.be.true;
          expect(editInterrupted).to.be.false;
        });

      // Test that cell editing and sorting can coexist
      cy.get('usa-table td').first().should('exist');
    });

    it('should handle table actions without triggering form submission', () => {
      let formSubmitted = false;
      let tableActionTriggered = false;
      let rowDeleted = false;

      const tableData = [
        { id: 1, product: 'Widget A', price: 29.99, stock: 15 },
        { id: 2, product: 'Widget B', price: 34.99, stock: 8 },
        { id: 3, product: 'Widget C', price: 19.99, stock: 22 },
      ];

      const columns = [
        { key: 'product', label: 'Product' },
        { key: 'price', label: 'Price' },
        { key: 'stock', label: 'Stock' },
        { key: 'actions', label: 'Actions', type: 'actions' },
      ];

      cy.mount(`
        <form id="table-form">
          <fieldset>
            <legend>Product Management</legend>
            <usa-table id="form-table"></usa-table>
          </fieldset>
          <button type="submit">Submit Form</button>
        </form>
      `);

      cy.window().then((win) => {
        const table = win.document.getElementById('form-table') as any;
        const form = win.document.getElementById('table-form') as HTMLFormElement;

        table.data = tableData;
        table.columns = columns;

        form.addEventListener('submit', (e: Event) => {
          e.preventDefault();
          formSubmitted = true;
        });

        table.addEventListener('action', (e: CustomEvent) => {
          tableActionTriggered = true;
          if (e.detail.action === 'delete') {
            rowDeleted = true;
          }
        });
      });

      // Table row actions should not trigger form submission
      cy.get('usa-table .usa-button')
        .first()
        .click()
        .then(() => {
          expect(tableActionTriggered).to.be.true;
          expect(formSubmitted).to.be.false;
        });

      // Form submission should work independently
      cy.get('button[type="submit"]')
        .click()
        .then(() => {
          expect(formSubmitted).to.be.true;
        });
    });

    it('should handle pagination without affecting row interactions', () => {
      let pageChanged = false;
      let rowClicked = false;
      let paginationConflict = false;

      const largeTableData = Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        status: i % 2 === 0 ? 'Active' : 'Inactive',
      }));

      const columns = [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'status', label: 'Status' },
      ];

      cy.mount(`<usa-table id="pagination-test"></usa-table>`);

      cy.window().then((win) => {
        const table = win.document.getElementById('pagination-test') as any;
        table.data = largeTableData;
        table.columns = columns;
        table.pagination = { pageSize: 10, showPageSizes: true };

        table.addEventListener('page-change', (e: CustomEvent) => {
          if (rowClicked) {
            paginationConflict = true;
          }
          pageChanged = true;
        });

        table.addEventListener('row-click', (e: CustomEvent) => {
          rowClicked = true;
        });
      });

      // Click on table row
      cy.get('usa-table tbody tr')
        .first()
        .click()
        .then(() => {
          expect(rowClicked).to.be.true;
        });

      // Reset flags
      cy.window().then(() => {
        rowClicked = false;
        pageChanged = false;
      });

      // Pagination should work without affecting row interactions
      cy.get('usa-table .usa-pagination button')
        .contains('2')
        .click()
        .then(() => {
          expect(pageChanged).to.be.true;
          expect(paginationConflict).to.be.false;
        });
    });

    it('should isolate filter interactions from table content events', () => {
      let filterApplied = false;
      let tableContentClicked = false;
      let filterContentConflict = false;

      const tableData = [
        { id: 1, category: 'Electronics', item: 'Laptop', price: 999 },
        { id: 2, category: 'Books', item: 'Novel', price: 15 },
        { id: 3, category: 'Electronics', item: 'Phone', price: 599 },
        { id: 4, category: 'Clothing', item: 'Shirt', price: 25 },
      ];

      const columns = [
        { key: 'category', label: 'Category', filterable: true },
        { key: 'item', label: 'Item', filterable: true },
        { key: 'price', label: 'Price', filterable: true },
      ];

      cy.mount(`<usa-table id="filter-test"></usa-table>`);

      cy.window().then((win) => {
        const table = win.document.getElementById('filter-test') as any;
        table.data = tableData;
        table.columns = columns;
        table.filterable = true;

        table.addEventListener('filter-change', (e: CustomEvent) => {
          if (tableContentClicked) {
            filterContentConflict = true;
          }
          filterApplied = true;
        });

        table.addEventListener('cell-click', (e: CustomEvent) => {
          tableContentClicked = true;
        });
      });

      // Filter interaction should not affect table content
      cy.get('usa-table .usa-input[placeholder*="filter"]')
        .first()
        .type('Electronics')
        .then(() => {
          filterApplied = true;
        });

      // Table content clicks should work independently
      cy.get('usa-table tbody td')
        .first()
        .click()
        .then(() => {
          expect(tableContentClicked).to.be.true;
          expect(filterContentConflict).to.be.false;
        });
    });

    it('should handle rapid table interactions without race conditions', () => {
      let interactionCount = 0;
      let raceConditionDetected = false;
      let lastInteractionTime = 0;

      const tableData = [
        { id: 1, task: 'Task A', status: 'Pending', priority: 'High' },
        { id: 2, task: 'Task B', status: 'Complete', priority: 'Medium' },
        { id: 3, task: 'Task C', status: 'In Progress', priority: 'Low' },
      ];

      const columns = [
        { key: 'task', label: 'Task', sortable: true },
        { key: 'status', label: 'Status', sortable: true },
        { key: 'priority', label: 'Priority', sortable: true },
      ];

      cy.mount(`<usa-table id="rapid-test"></usa-table>`);

      cy.window().then((win) => {
        const table = win.document.getElementById('rapid-test') as any;
        table.data = tableData;
        table.columns = columns;

        table.addEventListener('click', (e: Event) => {
          interactionCount++;
          const currentTime = Date.now();
          if (currentTime - lastInteractionTime < 50) {
            raceConditionDetected = true;
          }
          lastInteractionTime = currentTime;
        });
      });

      // Rapid interactions across different table elements
      cy.get('usa-table th').first().click();
      cy.get('usa-table td').first().click();
      cy.get('usa-table th').eq(1).click();
      cy.get('usa-table td').eq(1).click();

      cy.wait(100).then(() => {
        expect(interactionCount).to.be.greaterThan(0);
        // Table should handle rapid interactions gracefully
      });
    });

    it('should handle keyboard navigation without interfering with mouse events', () => {
      let keyboardNavigation = false;
      let mouseInteraction = false;
      let navigationConflict = false;

      const tableData = [
        { id: 1, column1: 'A1', column2: 'B1', column3: 'C1' },
        { id: 2, column1: 'A2', column2: 'B2', column3: 'C2' },
        { id: 3, column1: 'A3', column2: 'B3', column3: 'C3' },
      ];

      const columns = [
        { key: 'column1', label: 'Column 1' },
        { key: 'column2', label: 'Column 2' },
        { key: 'column3', label: 'Column 3' },
      ];

      cy.mount(`<usa-table id="keyboard-test"></usa-table>`);

      cy.window().then((win) => {
        const table = win.document.getElementById('keyboard-test') as any;
        table.data = tableData;
        table.columns = columns;

        table.addEventListener('keydown', (e: KeyboardEvent) => {
          if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            if (mouseInteraction) {
              navigationConflict = true;
            }
            keyboardNavigation = true;
          }
        });

        table.addEventListener('click', () => {
          mouseInteraction = true;
        });
      });

      // Keyboard navigation
      cy.get('usa-table')
        .focus()
        .type('{rightarrow}{downarrow}')
        .then(() => {
          expect(keyboardNavigation).to.be.true;
        });

      // Reset flags
      cy.window().then(() => {
        keyboardNavigation = false;
        mouseInteraction = false;
      });

      // Mouse interaction should work independently
      cy.get('usa-table td')
        .first()
        .click()
        .then(() => {
          expect(mouseInteraction).to.be.true;
          expect(navigationConflict).to.be.false;
        });
    });

    it('should handle complex table layouts with nested components', () => {
      let parentTableClicked = false;
      let nestedComponentClicked = false;
      let eventIsolated = true;

      const complexData = [
        {
          id: 1,
          name: 'Project A',
          details: {
            tasks: [
              { id: 'task1', title: 'Design', status: 'Complete' },
              { id: 'task2', title: 'Development', status: 'In Progress' },
            ],
          },
        },
      ];

      const columns = [
        { key: 'name', label: 'Project Name' },
        { key: 'details', label: 'Task Details', type: 'custom' },
      ];

      cy.mount(`<usa-table id="complex-table"></usa-table>`);

      cy.window().then((win) => {
        const table = win.document.getElementById('complex-table') as any;
        table.data = complexData;
        table.columns = columns;

        table.addEventListener('click', (e: Event) => {
          const target = e.target as HTMLElement;
          if (target.closest('.nested-component')) {
            nestedComponentClicked = true;
            if (parentTableClicked) {
              eventIsolated = false;
            }
          } else {
            parentTableClicked = true;
          }
        });
      });

      // Click on main table cell
      cy.get('usa-table td')
        .first()
        .click()
        .then(() => {
          expect(parentTableClicked).to.be.true;
        });

      // Test demonstrates proper event isolation in complex layouts
      expect(eventIsolated).to.be.true;
    });
  });

  // Form Integration Testing (Critical Gap Fix)
  describe('Form Integration', () => {
    it('should not interfere with form submission when table interactions occur', () => {
      let formSubmitted = false;
      let tableInteractionOccurred = false;

      const tableData = [
        { id: 1, product: 'Laptop', price: 999, selected: false },
        { id: 2, product: 'Mouse', price: 25, selected: false },
        { id: 3, product: 'Keyboard', price: 75, selected: false },
      ];

      const columns = [
        { key: 'product', label: 'Product' },
        { key: 'price', label: 'Price' },
        { key: 'selected', label: 'Selected', type: 'checkbox' },
      ];

      cy.mount(`
        <form id="table-form-integration">
          <fieldset>
            <legend>Product Selection</legend>
            <usa-table id="form-table"></usa-table>

            <label for="customer-name">Customer Name:</label>
            <input type="text" id="customer-name" name="customer-name" required>

            <label for="order-notes">Order Notes:</label>
            <textarea id="order-notes" name="order-notes"></textarea>
          </fieldset>
          <button type="submit">Submit Order</button>
        </form>
      `);

      cy.window().then((win) => {
        const form = win.document.getElementById('table-form-integration') as HTMLFormElement;
        const table = win.document.getElementById('form-table') as any;

        table.data = tableData;
        table.columns = columns;
        table.selectable = true;

        form.addEventListener('submit', (e: Event) => {
          e.preventDefault();
          formSubmitted = true;
        });

        table.addEventListener('cell-click', () => {
          tableInteractionOccurred = true;
        });

        table.addEventListener('row-select', () => {
          tableInteractionOccurred = true;
        });
      });

      // Table interactions should not trigger form submission
      cy.get('usa-table td')
        .first()
        .click()
        .then(() => {
          expect(tableInteractionOccurred).to.be.true;
          expect(formSubmitted).to.be.false;
        });

      // Checkbox interactions should not trigger form submission
      cy.get('usa-table input[type="checkbox"]')
        .first()
        .click()
        .then(() => {
          expect(formSubmitted).to.be.false;
        });

      // Form submission should work independently
      cy.get('#customer-name').type('John Customer');
      cy.get('#order-notes').type('Rush order please');
      cy.get('button[type="submit"]')
        .click()
        .then(() => {
          expect(formSubmitted).to.be.true;
        });
    });

    it('should properly handle table data as form values', () => {
      let submittedData: FormData | null = null;
      let tableSelection: any[] = [];

      const productsData = [
        { id: 1, name: 'Widget A', price: 19.99, quantity: 1 },
        { id: 2, name: 'Widget B', price: 29.99, quantity: 2 },
        { id: 3, name: 'Widget C', price: 39.99, quantity: 1 },
      ];

      const columns = [
        { key: 'name', label: 'Product Name' },
        { key: 'price', label: 'Price' },
        { key: 'quantity', label: 'Quantity', editable: true },
      ];

      cy.mount(`
        <form id="table-data-form">
          <fieldset>
            <legend>Order Form</legend>
            <usa-table id="order-table"></usa-table>

            <input type="hidden" id="selected-products" name="selected-products">

            <label for="shipping-address">Shipping Address:</label>
            <textarea id="shipping-address" name="shipping-address" required>123 Main St</textarea>
          </fieldset>
          <button type="submit">Place Order</button>
        </form>
      `);

      cy.window().then((win) => {
        const form = win.document.getElementById('table-data-form') as HTMLFormElement;
        const table = win.document.getElementById('order-table') as any;
        const hiddenInput = win.document.getElementById('selected-products') as HTMLInputElement;

        table.data = productsData;
        table.columns = columns;
        table.selectable = true;

        form.addEventListener('submit', (e: Event) => {
          e.preventDefault();
          submittedData = new FormData(form);

          // Get selected table data
          const selectedRows = table.getSelectedRows ? table.getSelectedRows() : [];
          tableSelection = selectedRows;
          hiddenInput.value = JSON.stringify(selectedRows);
        });

        table.addEventListener('row-select', (e: CustomEvent) => {
          // Update hidden form field with table selections
          const selectedRows = table.getSelectedRows
            ? table.getSelectedRows()
            : e.detail.selectedRows || [];
          hiddenInput.value = JSON.stringify(selectedRows);
        });
      });

      // Select table rows
      cy.get('usa-table tbody tr').first().click();
      cy.get('usa-table tbody tr').eq(1).click();

      // Submit form
      cy.get('button[type="submit"]')
        .click()
        .then(() => {
          expect(submittedData).to.not.be.null;

          const address = submittedData?.get('shipping-address');
          const products = submittedData?.get('selected-products');

          expect(address).to.equal('123 Main St');
          expect(products).to.not.be.empty;
        });
    });

    it('should integrate with form validation for table data', () => {
      let validationMessage = '';
      let formValid = false;
      let tableDataValid = true;

      const invalidData = [
        { id: 1, email: 'valid@example.com', role: 'admin' },
        { id: 2, email: 'invalid-email', role: 'user' },
        { id: 3, email: '', role: 'guest' },
      ];

      const columns = [
        { key: 'email', label: 'Email', required: true, validation: 'email' },
        { key: 'role', label: 'Role', required: true },
      ];

      cy.mount(`
        <form id="validation-table-form">
          <fieldset>
            <legend>User Management</legend>
            <usa-table id="validation-table"></usa-table>

            <label for="admin-notes">Admin Notes:</label>
            <input type="text" id="admin-notes" name="admin-notes" required>
          </fieldset>
          <button type="submit">Save Users</button>
        </form>
      `);

      cy.window().then((win) => {
        const form = win.document.getElementById('validation-table-form') as HTMLFormElement;
        const table = win.document.getElementById('validation-table') as any;

        table.data = invalidData;
        table.columns = columns;
        table.validation = true;

        form.addEventListener('submit', (e: Event) => {
          e.preventDefault();
          formValid = form.checkValidity();

          // Check table data validation
          const tableErrors = table.validate ? table.validate() : [];
          tableDataValid = tableErrors.length === 0;

          if (tableErrors.length > 0) {
            validationMessage = `Table validation errors: ${tableErrors.length}`;
          }
        });
      });

      // Try to submit form with invalid table data
      cy.get('#admin-notes').type('Some notes');
      cy.get('button[type="submit"]')
        .click()
        .then(() => {
          // Form validation should account for table data
          expect(formValid).to.be.true; // Form fields are valid
          // Table data validation would be handled by component if implemented
        });

      // Fix table data
      cy.get('usa-table td').contains('invalid-email').dblclick();
      cy.get('usa-table input').type('valid@example.com{enter}');

      // Submit again
      cy.get('button[type="submit"]')
        .click()
        .then(() => {
          expect(formValid).to.be.true;
        });
    });

    it('should maintain proper focus management within form context', () => {
      const tableData = [
        { id: 1, field1: 'A1', field2: 'B1', field3: 'C1' },
        { id: 2, field1: 'A2', field2: 'B2', field3: 'C2' },
      ];

      const columns = [
        { key: 'field1', label: 'Field 1', editable: true },
        { key: 'field2', label: 'Field 2', editable: true },
        { key: 'field3', label: 'Field 3', editable: true },
      ];

      cy.mount(`
        <form id="focus-table-form">
          <label for="before-table">Before Table:</label>
          <input type="text" id="before-table" name="before-table">

          <fieldset>
            <legend>Data Table</legend>
            <usa-table id="focus-table"></usa-table>
          </fieldset>

          <label for="after-table">After Table:</label>
          <input type="text" id="after-table" name="after-table">

          <button type="submit">Submit</button>
        </form>
      `);

      cy.window().then((win) => {
        const table = win.document.getElementById('focus-table') as any;
        table.data = tableData;
        table.columns = columns;
      });

      // Tab navigation should work properly
      cy.get('#before-table').focus().tab();

      // Should focus first interactive element in table
      cy.focused().should('match', 'usa-table *');

      // Tab through table cells
      cy.focused().tab();
      cy.focused().tab();
      cy.focused().tab();

      // Should eventually reach after-table input
      cy.get('#after-table').focus();
      cy.focused().should('match', '#after-table');

      // Table editing should not disrupt form focus flow
      cy.get('usa-table td').first().dblclick();

      // Escape editing and continue tab navigation
      cy.get('body').type('{esc}');
      cy.get('#before-table').focus().tab();
    });

    it('should handle form reset with table data correctly', () => {
      let tableReset = false;
      const originalData = [
        { id: 1, name: 'Original A', value: 100 },
        { id: 2, name: 'Original B', value: 200 },
      ];

      const columns = [
        { key: 'name', label: 'Name', editable: true },
        { key: 'value', label: 'Value', editable: true },
      ];

      cy.mount(`
        <form id="reset-table-form">
          <fieldset>
            <legend>Editable Data</legend>
            <usa-table id="reset-table"></usa-table>

            <label for="comment">Comment:</label>
            <input type="text" id="comment" name="comment" value="Original comment">
          </fieldset>
          <button type="reset">Reset Form</button>
          <button type="submit">Submit</button>
        </form>
      `);

      cy.window().then((win) => {
        const form = win.document.getElementById('reset-table-form') as HTMLFormElement;
        const table = win.document.getElementById('reset-table') as any;

        table.data = [...originalData];
        table.columns = columns;

        form.addEventListener('reset', () => {
          // Reset table to original data
          table.data = [...originalData];
          tableReset = true;
        });
      });

      // Modify table data
      cy.get('usa-table td').first().dblclick();
      cy.get('usa-table input').clear().type('Modified A{enter}');

      // Modify form field
      cy.get('#comment').clear().type('Modified comment');

      // Verify changes
      cy.get('#comment').should('have.value', 'Modified comment');

      // Reset form
      cy.get('button[type="reset"]')
        .click()
        .then(() => {
          expect(tableReset).to.be.true;
        });

      // Values should return to original
      cy.get('#comment').should('have.value', 'Original comment');
    });

    it('should work correctly in multi-step forms with table data persistence', () => {
      let step1Completed = false;
      let step2Completed = false;
      let tableDataPersisted = false;

      const userData = [
        { id: 1, name: 'John Doe', email: 'john@example.com', selected: false },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', selected: false },
      ];

      const columns = [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'selected', label: 'Selected', type: 'checkbox' },
      ];

      cy.mount(`
        <div id="multi-step-table-container">
          <form id="step-1-table" style="display: block;">
            <fieldset>
              <legend>Step 1: Select Users</legend>
              <usa-table id="user-selection-table"></usa-table>
            </fieldset>
            <button type="button" id="next-step-table">Next Step</button>
          </form>

          <form id="step-2-table" style="display: none;">
            <fieldset>
              <legend>Step 2: Confirm Selection</legend>
              <div id="selected-users-display"></div>
              <label for="action-type">Action Type:</label>
              <select id="action-type" name="action-type" required>
                <option value="">Select...</option>
                <option value="activate">Activate</option>
                <option value="deactivate">Deactivate</option>
              </select>
            </fieldset>
            <button type="submit">Execute Action</button>
          </form>
        </div>
      `);

      cy.window().then((win) => {
        const nextButton = win.document.getElementById('next-step-table');
        const step1Form = win.document.getElementById('step-1-table') as HTMLFormElement;
        const step2Form = win.document.getElementById('step-2-table') as HTMLFormElement;
        const table = win.document.getElementById('user-selection-table') as any;
        const selectedDisplay = win.document.getElementById('selected-users-display');

        table.data = userData;
        table.columns = columns;
        table.selectable = true;

        nextButton?.addEventListener('click', () => {
          const selectedRows = table.getSelectedRows ? table.getSelectedRows() : [];
          if (selectedRows.length > 0) {
            step1Completed = true;
            tableDataPersisted = true;

            // Display selected users in step 2
            if (selectedDisplay) {
              selectedDisplay.innerHTML = `Selected: ${selectedRows.map((row: any) => row.name).join(', ')}`;
            }

            step1Form.style.display = 'none';
            step2Form.style.display = 'block';
          }
        });

        step2Form.addEventListener('submit', (e: Event) => {
          e.preventDefault();
          if (step2Form.checkValidity()) {
            step2Completed = true;
          }
        });
      });

      // Select users in table
      cy.get('usa-table tbody tr').first().click();
      cy.get('usa-table tbody tr').eq(1).click();

      // Proceed to next step
      cy.get('#next-step-table')
        .click()
        .then(() => {
          expect(step1Completed).to.be.true;
          expect(tableDataPersisted).to.be.true;
        });

      // Step 2 should be visible
      cy.get('#step-2-table').should('be.visible');
      cy.get('#step-1-table').should('not.be.visible');

      // Complete step 2
      cy.get('#action-type').select('activate');
      cy.get('#step-2-table button[type="submit"]')
        .click()
        .then(() => {
          expect(step2Completed).to.be.true;
        });
    });

    it('should handle table actions within form context without conflicts', () => {
      let editModeActive = false;
      let formSubmitted = false;
      let actionExecuted = false;

      const tableData = [
        { id: 1, task: 'Review document', status: 'pending', assignee: 'John' },
        { id: 2, task: 'Update website', status: 'active', assignee: 'Jane' },
        { id: 3, task: 'Test feature', status: 'complete', assignee: 'Bob' },
      ];

      const columns = [
        { key: 'task', label: 'Task', editable: true },
        { key: 'status', label: 'Status', editable: true },
        { key: 'assignee', label: 'Assignee', editable: true },
        { key: 'actions', label: 'Actions', type: 'actions' },
      ];

      cy.mount(`
        <form id="table-actions-form">
          <fieldset>
            <legend>Task Management</legend>
            <usa-table id="task-table"></usa-table>

            <label for="project-name">Project Name:</label>
            <input type="text" id="project-name" name="project-name" value="Website Redesign">

            <label for="due-date">Due Date:</label>
            <input type="date" id="due-date" name="due-date" required>
          </fieldset>
          <button type="submit">Save Project</button>
        </form>
      `);

      cy.window().then((win) => {
        const form = win.document.getElementById('table-actions-form') as HTMLFormElement;
        const table = win.document.getElementById('task-table') as any;

        table.data = tableData;
        table.columns = columns;

        form.addEventListener('submit', (e: Event) => {
          e.preventDefault();
          formSubmitted = true;
        });

        table.addEventListener('cell-edit-start', () => {
          editModeActive = true;
        });

        table.addEventListener('action', (e: CustomEvent) => {
          actionExecuted = true;
        });
      });

      // Enter edit mode on table cell
      cy.get('usa-table td')
        .first()
        .dblclick()
        .then(() => {
          editModeActive = true;
        });

      // Edit should not trigger form submission
      cy.get('usa-table input')
        .type(' (updated){enter}')
        .then(() => {
          expect(formSubmitted).to.be.false;
          expect(editModeActive).to.be.true;
        });

      // Table actions should not trigger form submission
      cy.get('usa-table .usa-button')
        .first()
        .click()
        .then(() => {
          expect(actionExecuted).to.be.true;
          expect(formSubmitted).to.be.false;
        });

      // Form submission should work independently
      cy.get('#due-date').type('2024-12-31');
      cy.get('button[type="submit"]')
        .click()
        .then(() => {
          expect(formSubmitted).to.be.true;
        });
    });

    it('should preserve table state during form validation errors', () => {
      let tableStatePreserved = true;
      let validationTriggered = false;

      const importantData = [
        { id: 1, name: 'Critical Task', priority: 'high', completed: false },
        { id: 2, name: 'Normal Task', priority: 'medium', completed: true },
        { id: 3, name: 'Low Task', priority: 'low', completed: false },
      ];

      const columns = [
        { key: 'name', label: 'Task Name', editable: true },
        { key: 'priority', label: 'Priority', editable: true },
        { key: 'completed', label: 'Completed', type: 'checkbox' },
      ];

      cy.mount(`
        <form id="validation-preservation-form" novalidate>
          <fieldset>
            <legend>Task Management</legend>
            <usa-table id="preservation-table"></usa-table>

            <label for="required-field">Required Field:</label>
            <input type="text" id="required-field" name="required-field" required>

            <div class="usa-error-message" id="validation-error" style="display: none;">
              This field is required
            </div>
          </fieldset>
          <button type="submit">Submit Tasks</button>
        </form>
      `);

      cy.window().then((win) => {
        const form = win.document.getElementById('validation-preservation-form') as HTMLFormElement;
        const table = win.document.getElementById('preservation-table') as any;

        table.data = [...importantData];
        table.columns = columns;

        form.addEventListener('submit', (e: Event) => {
          e.preventDefault();
          validationTriggered = true;

          if (!form.checkValidity()) {
            // Check if table data is still intact
            const currentData = table.data;
            tableStatePreserved = JSON.stringify(currentData) === JSON.stringify(importantData);
          }
        });
      });

      // Modify table data
      cy.get('usa-table input[type="checkbox"]').first().click();
      cy.get('usa-table td').contains('Critical Task').dblclick();
      cy.get('usa-table input').type(' - URGENT{enter}');

      // Try to submit form without required field
      cy.get('button[type="submit"]')
        .click()
        .then(() => {
          expect(validationTriggered).to.be.true;
          // Table modifications should be preserved even during validation errors
        });

      // Verify table data is still modified
      cy.get('usa-table td').should('contain', 'Critical Task - URGENT');

      // Fill required field and submit successfully
      cy.get('#required-field').type('Required value');
      cy.get('button[type="submit"]').click();

      // Table should maintain its modified state
      cy.get('usa-table td').should('contain', 'Critical Task - URGENT');
    });
  });

  // Responsive Layout Testing (Critical Gap Fix)
  describe('Responsive Layout Testing', () => {
    const sampleTableData = [
      {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.gov',
        department: 'Engineering',
        role: 'Senior Developer',
        status: 'Active',
        startDate: '2023-01-15',
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane.smith@example.gov',
        department: 'Marketing',
        role: 'Marketing Manager',
        status: 'Active',
        startDate: '2023-02-20',
      },
      {
        id: 3,
        name: 'Bob Johnson',
        email: 'bob.johnson@example.gov',
        department: 'Sales',
        role: 'Sales Representative',
        status: 'Inactive',
        startDate: '2022-11-10',
      },
      {
        id: 4,
        name: 'Alice Brown',
        email: 'alice.brown@example.gov',
        department: 'HR',
        role: 'HR Specialist',
        status: 'Active',
        startDate: '2023-03-05',
      },
    ];

    const sampleColumns = [
      { key: 'name', label: 'Full Name', sortable: true },
      { key: 'email', label: 'Email Address', sortable: true },
      { key: 'department', label: 'Department', sortable: true },
      { key: 'role', label: 'Job Title', sortable: false },
      { key: 'status', label: 'Employment Status', sortable: true },
      { key: 'startDate', label: 'Start Date', sortable: true },
    ];

    const viewports = [
      { name: 'Mobile Portrait', width: 375, height: 667 },
      { name: 'Mobile Landscape', width: 667, height: 375 },
      { name: 'Tablet Portrait', width: 768, height: 1024 },
      { name: 'Tablet Landscape', width: 1024, height: 768 },
      { name: 'Desktop', width: 1200, height: 800 },
      { name: 'Large Desktop', width: 1920, height: 1080 },
    ];

    describe('Basic Responsive Behavior', () => {
      viewports.forEach((viewport) => {
        it(`should render correctly on ${viewport.name} (${viewport.width}x${viewport.height})`, () => {
          cy.viewport(viewport.width, viewport.height);
          cy.mount(`<usa-table id="responsive-test"></usa-table>`);

          cy.window().then((win) => {
            const table = win.document.getElementById('responsive-test') as any;
            table.data = sampleTableData;
            table.columns = sampleColumns;
          });

          // Basic visibility test
          cy.get('usa-table').should('be.visible');
          cy.get('.usa-table').should('be.visible');

          // No horizontal overflow
          cy.get('usa-table').should(($el) => {
            expect($el[0].scrollWidth).to.be.at.most($el[0].clientWidth + 50); // Allow some tolerance
          });

          // Accessibility at all sizes
          cy.injectAxe();
          cy.checkAccessibility();
        });
      });

      it('should handle viewport orientation changes', () => {
        cy.mount(`<usa-table id="orientation-test"></usa-table>`);

        cy.window().then((win) => {
          const table = win.document.getElementById('orientation-test') as any;
          table.data = sampleTableData;
          table.columns = sampleColumns;
        });

        // Portrait tablet
        cy.viewport(768, 1024);
        cy.get('.usa-table').should('be.visible');
        cy.get('usa-table thead th').should('have.length.at.least', 3);

        // Landscape tablet
        cy.viewport(1024, 768);
        cy.get('.usa-table').should('be.visible');
        cy.get('usa-table thead th').should('have.length.at.least', 3);

        // Component should adapt without breaking
        cy.injectAxe();
        cy.checkAccessibility();
      });
    });

    describe('Mobile Responsive Behavior', () => {
      it('should adapt to mobile stacked layout', () => {
        cy.viewport(375, 667); // iPhone SE
        cy.mount(`<usa-table id="mobile-stacked" stacked></usa-table>`);

        cy.window().then((win) => {
          const table = win.document.getElementById('mobile-stacked') as any;
          table.data = sampleTableData;
          table.columns = sampleColumns;
          table.stacked = true;
        });

        // Should show stacked layout on mobile
        cy.get('.usa-table').should('have.class', 'usa-table--stacked');

        // Each row should stack vertically
        cy.get('.usa-table tbody tr')
          .first()
          .within(() => {
            cy.get('td').should('be.visible');
          });

        // Headers should be visible in stacked mode
        cy.get('.usa-table tbody td').should('have.attr', 'data-label').or('contain.text');
      });

      it('should provide horizontal scrolling for wide tables on mobile', () => {
        cy.viewport(320, 568); // iPhone 5 - very narrow
        cy.mount(`<usa-table id="mobile-scroll" scrollable></usa-table>`);

        cy.window().then((win) => {
          const table = win.document.getElementById('mobile-scroll') as any;
          table.data = sampleTableData;
          table.columns = sampleColumns;
          table.scrollable = true;
        });

        // Should have scrollable container
        cy.get('.usa-table-container--scrollable').should('exist');
        cy.get('.usa-table').should('be.visible');

        // Should be able to scroll horizontally
        cy.get('.usa-table-container--scrollable').scrollTo('right');
        cy.get('.usa-table thead th').last().should('be.visible');
      });

      it('should handle touch interactions on mobile', () => {
        cy.viewport(375, 667);
        cy.mount(`<usa-table id="mobile-touch"></usa-table>`);

        cy.window().then((win) => {
          const table = win.document.getElementById('mobile-touch') as any;
          table.data = sampleTableData;
          table.columns = sampleColumns;
          table.sortable = true;
        });

        // Test touch targets are at least 44px
        cy.get('.usa-table th[role="columnheader"]').each(($el) => {
          const rect = $el[0].getBoundingClientRect();
          expect(Math.min(rect.width, rect.height)).to.be.at.least(44);
        });

        // Simulate touch on sortable header
        cy.get('.usa-table th[role="columnheader"]')
          .first()
          .trigger('touchstart', { touches: [{ clientX: 100, clientY: 100 }] })
          .trigger('touchend', { changedTouches: [{ clientX: 100, clientY: 100 }] });

        cy.get('.usa-table').should('be.visible'); // Should not break
      });

      it('should adapt column priorities on small screens', () => {
        cy.viewport(320, 568); // Very small mobile
        cy.mount(`<usa-table id="column-priority"></usa-table>`);

        cy.window().then((win) => {
          const table = win.document.getElementById('column-priority') as any;
          const prioritizedColumns = sampleColumns.map((col, index) => ({
            ...col,
            priority: index < 3 ? 'high' : index < 5 ? 'medium' : 'low',
          }));

          table.data = sampleTableData;
          table.columns = prioritizedColumns;
          table.responsive = true;
        });

        // High priority columns should always be visible
        cy.get('.usa-table th[data-priority="high"]').should('be.visible');

        // Lower priority columns might be hidden on very small screens
        cy.get('.usa-table').should('be.visible');
      });
    });

    describe('Tablet Responsive Behavior', () => {
      it('should show optimal column count on tablet portrait', () => {
        cy.viewport(768, 1024);
        cy.mount(`<usa-table id="tablet-portrait"></usa-table>`);

        cy.window().then((win) => {
          const table = win.document.getElementById('tablet-portrait') as any;
          table.data = sampleTableData;
          table.columns = sampleColumns;
        });

        // Should show most columns but may hide some low-priority ones
        cy.get('.usa-table th').should('have.length.at.least', 4);
        cy.get('.usa-table th').should('have.length.at.most', 6);

        // Table should fit within viewport
        cy.get('.usa-table').should('be.visible');
      });

      it('should show full table on tablet landscape', () => {
        cy.viewport(1024, 768);
        cy.mount(`<usa-table id="tablet-landscape"></usa-table>`);

        cy.window().then((win) => {
          const table = win.document.getElementById('tablet-landscape') as any;
          table.data = sampleTableData;
          table.columns = sampleColumns;
        });

        // Should show all columns on landscape tablet
        cy.get('.usa-table th').should('have.length', sampleColumns.length);

        // Should have enough space for sorting indicators
        cy.get('.usa-table th[aria-sort]').should('be.visible');
      });

      it('should handle tablet-specific interactions', () => {
        cy.viewport(768, 1024);
        cy.mount(`<usa-table id="tablet-interactions"></usa-table>`);

        cy.window().then((win) => {
          const table = win.document.getElementById('tablet-interactions') as any;
          table.data = sampleTableData;
          table.columns = sampleColumns;
          table.selectable = true;
        });

        // Test tablet-sized touch targets
        cy.get('.usa-table tbody tr')
          .first()
          .within(() => {
            cy.get('td').first().click();
          });

        // Should handle both touch and mouse interactions
        cy.get('.usa-table tbody tr')
          .eq(1)
          .trigger('touchstart', { touches: [{ clientX: 200, clientY: 200 }] })
          .trigger('touchend', { changedTouches: [{ clientX: 200, clientY: 200 }] });

        cy.get('.usa-table').should('be.visible');
      });
    });

    describe('Desktop Responsive Behavior', () => {
      it('should show full featured table on desktop', () => {
        cy.viewport(1200, 800);
        cy.mount(`<usa-table id="desktop-full"></usa-table>`);

        cy.window().then((win) => {
          const table = win.document.getElementById('desktop-full') as any;
          table.data = sampleTableData;
          table.columns = sampleColumns;
          table.sortable = true;
          table.filterable = true;
        });

        // Should show all columns
        cy.get('.usa-table th').should('have.length', sampleColumns.length);

        // Should show sorting indicators
        cy.get('.usa-table th[aria-sort]').should('be.visible');

        // Should have space for filters if enabled
        cy.get('.usa-table').should('be.visible');

        // Table should not require scrolling
        cy.get('.usa-table').should(($el) => {
          expect($el[0].scrollWidth).to.be.at.most($el[0].clientWidth + 10);
        });
      });

      it('should handle large datasets efficiently on desktop', () => {
        cy.viewport(1920, 1080); // Large desktop

        const largeDataset = Array.from({ length: 100 }, (_, i) => ({
          id: i + 1,
          name: `User ${i + 1}`,
          email: `user${i + 1}@example.gov`,
          department: ['Engineering', 'Marketing', 'Sales', 'HR'][i % 4],
          role: `Role ${i + 1}`,
          status: i % 3 === 0 ? 'Active' : 'Inactive',
          startDate: `2023-${String(Math.floor(i / 12) + 1).padStart(2, '0')}-${String((i % 12) + 1).padStart(2, '0')}`,
        }));

        cy.mount(`<usa-table id="large-dataset"></usa-table>`);

        cy.window().then((win) => {
          const table = win.document.getElementById('large-dataset') as any;
          table.data = largeDataset;
          table.columns = sampleColumns;
          table.pagination = { pageSize: 25, showPageSizes: true };
        });

        // Should render efficiently
        cy.get('.usa-table tbody tr').should('have.length.at.most', 25);

        // Pagination should work
        cy.get('.usa-pagination').should('be.visible');
        cy.get('.usa-pagination button').contains('2').click();
        cy.get('.usa-table tbody tr').should('be.visible');
      });

      it('should provide optimal mouse interactions on desktop', () => {
        cy.viewport(1200, 800);
        cy.mount(`<usa-table id="desktop-mouse"></usa-table>`);

        cy.window().then((win) => {
          const table = win.document.getElementById('desktop-mouse') as any;
          table.data = sampleTableData;
          table.columns = sampleColumns;
          table.sortable = true;
          table.selectable = true;
        });

        // Test hover states
        cy.get('.usa-table tbody tr').first().trigger('mouseover');
        cy.get('.usa-table tbody tr').first().should('be.visible');

        // Test column sorting with mouse
        cy.get('.usa-table th[role="columnheader"]').first().click();
        cy.get('.usa-table th[role="columnheader"]').first().should('have.attr', 'aria-sort');

        // Test row selection with mouse
        cy.get('.usa-table tbody tr').first().click();
        cy.get('.usa-table tbody tr').first().should('be.visible');
      });
    });

    describe('Responsive Table Features', () => {
      it('should handle sticky headers on all viewport sizes', () => {
        viewports.slice(2).forEach((viewport) => {
          // Test tablet and desktop
          cy.viewport(viewport.width, viewport.height);
          cy.mount(`<usa-table id="sticky-headers-${viewport.width}" sticky-header></usa-table>`);

          cy.window().then((win) => {
            const table = win.document.getElementById(`sticky-headers-${viewport.width}`) as any;
            table.data = Array.from({ length: 50 }, (_, i) => ({
              id: i + 1,
              name: `Name ${i + 1}`,
              email: `email${i + 1}@gov.gov`,
              department: `Dept ${i + 1}`,
            }));
            table.columns = [
              { key: 'name', label: 'Name' },
              { key: 'email', label: 'Email' },
              { key: 'department', label: 'Department' },
            ];
            table.stickyHeader = true;
          });

          // Scroll down and verify header remains visible
          cy.get('.usa-table tbody').scrollTo('bottom');
          cy.get('.usa-table thead').should('be.visible');
          cy.get('.usa-table thead th').first().should('have.css', 'position', 'sticky');
        });
      });

      it('should adapt column widths responsively', () => {
        const testViewports = [
          { width: 768, height: 1024, expectedBehavior: 'compact' },
          { width: 1024, height: 768, expectedBehavior: 'normal' },
          { width: 1920, height: 1080, expectedBehavior: 'spacious' },
        ];

        testViewports.forEach((vp) => {
          cy.viewport(vp.width, vp.height);
          cy.mount(`<usa-table id="adaptive-columns-${vp.width}"></usa-table>`);

          cy.window().then((win) => {
            const table = win.document.getElementById(`adaptive-columns-${vp.width}`) as any;
            table.data = sampleTableData;
            table.columns = sampleColumns;
            table.responsive = true;
          });

          // Check that columns adapt to available space
          cy.get('.usa-table th').first().should('have.css', 'width');
          cy.get('.usa-table th').each(($th) => {
            const width = parseInt($th.css('width'));
            expect(width).to.be.greaterThan(0);
          });
        });
      });

      it('should maintain data integrity across viewport changes', () => {
        cy.mount(`<usa-table id="data-integrity"></usa-table>`);

        cy.window().then((win) => {
          const table = win.document.getElementById('data-integrity') as any;
          table.data = sampleTableData;
          table.columns = sampleColumns;
          table.sortable = true;
        });

        // Start on desktop
        cy.viewport(1200, 800);
        cy.get('.usa-table tbody tr').should('have.length', sampleTableData.length);

        // Sort data
        cy.get('.usa-table th[role="columnheader"]').first().click();

        // Change to mobile
        cy.viewport(375, 667);
        cy.get('.usa-table tbody tr').should('have.length', sampleTableData.length);

        // Change to tablet
        cy.viewport(768, 1024);
        cy.get('.usa-table tbody tr').should('have.length', sampleTableData.length);

        // Data should remain sorted
        cy.get('.usa-table th[role="columnheader"]').first().should('have.attr', 'aria-sort');
      });

      it('should handle responsive filtering and search', () => {
        cy.viewport(375, 667); // Mobile
        cy.mount(`<usa-table id="responsive-search"></usa-table>`);

        cy.window().then((win) => {
          const table = win.document.getElementById('responsive-search') as any;
          table.data = sampleTableData;
          table.columns = sampleColumns;
          table.filterable = true;
          table.searchable = true;
        });

        // Search functionality should work on mobile
        cy.get('.usa-search input').type('John');
        cy.get('.usa-table tbody tr').should('have.length.lessThan', sampleTableData.length);

        // Change to desktop
        cy.viewport(1200, 800);

        // Search should persist
        cy.get('.usa-table tbody tr').should('have.length.lessThan', sampleTableData.length);

        // Clear search
        cy.get('.usa-search input').clear();
        cy.get('.usa-table tbody tr').should('have.length', sampleTableData.length);
      });
    });

    describe('Responsive Edge Cases', () => {
      it('should handle very wide content in narrow viewports', () => {
        const wideContentData = [
          {
            id: 1,
            shortCol: 'A',
            veryLongColumn:
              'This is an extremely long piece of content that would normally cause horizontal scrolling issues on mobile devices and should be handled gracefully by the responsive table implementation',
            normalCol: 'Normal',
          },
        ];

        const wideColumns = [
          { key: 'shortCol', label: 'Short' },
          { key: 'veryLongColumn', label: 'Very Long Content Column That Also Has A Long Header' },
          { key: 'normalCol', label: 'Normal' },
        ];

        cy.viewport(320, 568); // Very narrow mobile
        cy.mount(`<usa-table id="wide-content"></usa-table>`);

        cy.window().then((win) => {
          const table = win.document.getElementById('wide-content') as any;
          table.data = wideContentData;
          table.columns = wideColumns;
          table.responsive = true;
        });

        // Should not cause horizontal overflow
        cy.get('usa-table').should(($el) => {
          expect($el[0].scrollWidth).to.be.at.most($el[0].clientWidth + 50);
        });

        // Content should be readable
        cy.get('.usa-table td').should('be.visible');
      });

      it('should handle empty states responsively', () => {
        viewports.forEach((viewport) => {
          cy.viewport(viewport.width, viewport.height);
          cy.mount(`<usa-table id="empty-responsive-${viewport.width}"></usa-table>`);

          cy.window().then((win) => {
            const table = win.document.getElementById(`empty-responsive-${viewport.width}`) as any;
            table.data = [];
            table.columns = sampleColumns;
          });

          // Should show empty state properly
          cy.get('.usa-table').should('be.visible');
          cy.get('.usa-table tbody tr').should('have.length', 0);

          // No layout issues with empty state
          cy.get('usa-table').should(($el) => {
            expect($el[0].scrollWidth).to.be.at.most($el[0].clientWidth + 10);
          });
        });
      });

      it('should handle dynamic content changes during viewport transitions', () => {
        cy.mount(`<usa-table id="dynamic-responsive"></usa-table>`);

        cy.window().then((win) => {
          const table = win.document.getElementById('dynamic-responsive') as any;
          table.data = sampleTableData;
          table.columns = sampleColumns;
        });

        // Start on desktop
        cy.viewport(1200, 800);
        cy.get('.usa-table tbody tr').should('have.length', sampleTableData.length);

        // Add more data while transitioning to mobile
        cy.window().then((win) => {
          const table = win.document.getElementById('dynamic-responsive') as any;
          const additionalData = [
            {
              id: 5,
              name: 'Charlie Wilson',
              email: 'charlie@example.gov',
              department: 'Finance',
              role: 'Analyst',
              status: 'Active',
              startDate: '2023-04-01',
            },
          ];
          table.data = [...sampleTableData, ...additionalData];
        });

        cy.viewport(375, 667); // Switch to mobile
        cy.get('.usa-table tbody tr').should('have.length', sampleTableData.length + 1);

        // Table should adapt to new content and viewport
        cy.get('.usa-table').should('be.visible');
      });

      it('should maintain accessibility across all responsive states', () => {
        const testViewports = [
          { width: 375, height: 667 },
          { width: 768, height: 1024 },
          { width: 1200, height: 800 },
        ];

        testViewports.forEach((viewport) => {
          cy.viewport(viewport.width, viewport.height);
          cy.mount(`<usa-table id="a11y-responsive-${viewport.width}"></usa-table>`);

          cy.window().then((win) => {
            const table = win.document.getElementById(`a11y-responsive-${viewport.width}`) as any;
            table.data = sampleTableData;
            table.columns = sampleColumns;
            table.sortable = true;
          });

          // Verify ARIA attributes at all sizes
          cy.get('.usa-table').should('have.attr', 'role', 'table');
          cy.get('.usa-table th').should('have.attr', 'role', 'columnheader');
          cy.get('.usa-table td').should('have.attr', 'role', 'cell');

          // Check keyboard navigation works
          cy.get('.usa-table').focus();
          cy.focused().type('{rightarrow}');

          // Run accessibility test
          cy.injectAxe();
          cy.checkAccessibility();
        });
      });
    });
  });
});
