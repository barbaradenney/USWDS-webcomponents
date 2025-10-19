// Component tests for usa-pagination
import './index.ts';

describe('USA Pagination Component Tests', () => {
  it('should render pagination with default properties', () => {
    cy.mount(`<usa-pagination id="test-pagination" total-pages="10"></usa-pagination>`);
    cy.get('usa-pagination').should('exist');
    cy.get('.usa-pagination').should('exist');
    cy.get('.usa-pagination__list').should('exist');
  });

  it('should render page numbers correctly', () => {
    cy.mount(`
      <usa-pagination 
        id="test-pagination" 
        total-pages="5" 
        current-page="1">
      </usa-pagination>
    `);

    // Should show page numbers
    cy.get('.usa-pagination__item').should('have.length.at.least', 5);
    cy.get('.usa-pagination__button').contains('1').should('exist');
    cy.get('.usa-pagination__button').contains('5').should('exist');
  });

  it('should handle page navigation', () => {
    cy.mount(`
      <usa-pagination 
        id="test-pagination" 
        total-pages="10" 
        current-page="1">
      </usa-pagination>
    `);

    cy.window().then((win) => {
      const pagination = win.document.getElementById('test-pagination') as any;
      const changeSpy = cy.stub();
      pagination.addEventListener('usa-pagination:change', changeSpy);
      
      // Click page 3
      cy.get('.usa-pagination__button').contains('3').click();
      
      cy.then(() => {
        expect(changeSpy).to.have.been.calledWith(
          Cypress.sinon.match.hasNested('detail.page', 3)
        );
      });
    });
  });

  it('should handle next page navigation', () => {
    cy.mount(`
      <usa-pagination 
        id="test-pagination" 
        total-pages="10" 
        current-page="3">
      </usa-pagination>
    `);

    cy.window().then((win) => {
      const pagination = win.document.getElementById('test-pagination') as any;
      const changeSpy = cy.stub();
      pagination.addEventListener('usa-pagination:change', changeSpy);
      
      // Click next button
      cy.get('.usa-pagination__next-page').click();
      
      cy.then(() => {
        expect(changeSpy).to.have.been.calledWith(
          Cypress.sinon.match.hasNested('detail.page', 4)
        );
      });
    });
  });

  it('should handle previous page navigation', () => {
    cy.mount(`
      <usa-pagination 
        id="test-pagination" 
        total-pages="10" 
        current-page="5">
      </usa-pagination>
    `);

    cy.window().then((win) => {
      const pagination = win.document.getElementById('test-pagination') as any;
      const changeSpy = cy.stub();
      pagination.addEventListener('usa-pagination:change', changeSpy);
      
      // Click previous button
      cy.get('.usa-pagination__previous-page').click();
      
      cy.then(() => {
        expect(changeSpy).to.have.been.calledWith(
          Cypress.sinon.match.hasNested('detail.page', 4)
        );
      });
    });
  });

  it('should disable previous on first page', () => {
    cy.mount(`
      <usa-pagination 
        id="test-pagination" 
        total-pages="10" 
        current-page="1">
      </usa-pagination>
    `);

    cy.get('.usa-pagination__previous-page').should('be.disabled');
    cy.get('.usa-pagination__previous-page').should('have.attr', 'aria-disabled', 'true');
  });

  it('should disable next on last page', () => {
    cy.mount(`
      <usa-pagination 
        id="test-pagination" 
        total-pages="5" 
        current-page="5">
      </usa-pagination>
    `);

    cy.get('.usa-pagination__next-page').should('be.disabled');
    cy.get('.usa-pagination__next-page').should('have.attr', 'aria-disabled', 'true');
  });

  it('should handle overflow with ellipsis', () => {
    cy.mount(`
      <usa-pagination 
        id="test-pagination" 
        total-pages="20" 
        current-page="10">
      </usa-pagination>
    `);

    // Should show ellipsis for large page ranges
    cy.get('.usa-pagination__overflow').should('exist');
    cy.get('.usa-pagination__overflow').should('contain.text', '…');
    
    // Should show current page and surrounding pages
    cy.get('.usa-pagination__button').contains('10').should('exist');
    cy.get('.usa-pagination__button').contains('9').should('exist');
    cy.get('.usa-pagination__button').contains('11').should('exist');
  });

  it('should handle keyboard navigation', () => {
    cy.mount(`
      <usa-pagination 
        id="test-pagination" 
        total-pages="10" 
        current-page="5">
      </usa-pagination>
    `);

    // Tab through pagination items
    cy.get('.usa-pagination__previous-page').focus();
    cy.focused().should('have.class', 'usa-pagination__previous-page');
    
    // Tab to page buttons
    cy.focused().tab();
    cy.focused().should('contain.text', '1');
    
    // Arrow right to navigate between pages
    cy.focused().type('{rightarrow}');
    cy.focused().should('contain.text', '2');
    
    // Enter to select page
    cy.focused().type('{enter}');
  });

  it('should handle compact variant', () => {
    cy.mount(`
      <usa-pagination 
        id="test-pagination" 
        total-pages="10" 
        current-page="5"
        variant="compact">
      </usa-pagination>
    `);

    cy.get('.usa-pagination').should('have.class', 'usa-pagination--compact');
    
    // Compact version shows fewer page numbers
    cy.get('.usa-pagination__item').should('have.length.lessThan', 10);
  });

  it('should handle unbounded variant', () => {
    cy.mount(`
      <usa-pagination 
        id="test-pagination" 
        total-pages="0" 
        current-page="5"
        variant="unbounded">
      </usa-pagination>
    `);

    cy.get('.usa-pagination').should('have.class', 'usa-pagination--unbounded');
    
    // Unbounded shows current page without total
    cy.get('.usa-pagination__current-page').should('contain.text', '5');
  });

  it('should handle page size selection', () => {
    cy.mount(`
      <usa-pagination 
        id="test-pagination" 
        total-pages="10" 
        current-page="1"
        show-page-size>
      </usa-pagination>
    `);

    cy.window().then((win) => {
      const pagination = win.document.getElementById('test-pagination') as any;
      pagination.pageSizeOptions = [10, 25, 50, 100];
    });

    // Should show page size selector
    cy.get('.usa-pagination__page-size').should('exist');
    cy.get('.usa-pagination__page-size select').should('exist');
    
    // Change page size
    cy.get('.usa-pagination__page-size select').select('25');
    cy.get('.usa-pagination__page-size select').should('have.value', '25');
  });

  it('should handle results summary', () => {
    cy.mount(`
      <usa-pagination 
        id="test-pagination" 
        total-pages="10" 
        current-page="2"
        page-size="20"
        total-items="200"
        show-results-summary>
      </usa-pagination>
    `);

    // Should show results summary
    cy.get('.usa-pagination__results').should('exist');
    cy.get('.usa-pagination__results').should('contain.text', 'Showing 21-40 of 200 results');
  });

  it('should handle jump to page functionality', () => {
    cy.mount(`
      <usa-pagination 
        id="test-pagination" 
        total-pages="50" 
        current-page="1"
        show-jump-to-page>
      </usa-pagination>
    `);

    // Should show jump to page input
    cy.get('.usa-pagination__jump').should('exist');
    cy.get('.usa-pagination__jump input').should('exist');
    
    cy.window().then((win) => {
      const pagination = win.document.getElementById('test-pagination') as any;
      const changeSpy = cy.stub();
      pagination.addEventListener('usa-pagination:change', changeSpy);
      
      // Type page number and press Enter
      cy.get('.usa-pagination__jump input').type('25{enter}');
      
      cy.then(() => {
        expect(changeSpy).to.have.been.calledWith(
          Cypress.sinon.match.hasNested('detail.page', 25)
        );
      });
    });
  });

  it('should handle first and last page buttons', () => {
    cy.mount(`
      <usa-pagination 
        id="test-pagination" 
        total-pages="20" 
        current-page="10"
        show-first-last>
      </usa-pagination>
    `);

    // Should show first and last buttons
    cy.get('.usa-pagination__first-page').should('exist');
    cy.get('.usa-pagination__last-page').should('exist');
    
    cy.window().then((win) => {
      const pagination = win.document.getElementById('test-pagination') as any;
      const changeSpy = cy.stub();
      pagination.addEventListener('usa-pagination:change', changeSpy);
      
      // Click first page
      cy.get('.usa-pagination__first-page').click();
      cy.then(() => {
        expect(changeSpy).to.have.been.calledWith(
          Cypress.sinon.match.hasNested('detail.page', 1)
        );
      });
      
      // Click last page
      cy.get('.usa-pagination__last-page').click();
      cy.then(() => {
        expect(changeSpy).to.have.been.calledWith(
          Cypress.sinon.match.hasNested('detail.page', 20)
        );
      });
    });
  });

  it('should handle URL routing integration', () => {
    cy.mount(`
      <usa-pagination 
        id="test-pagination" 
        total-pages="10" 
        current-page="1"
        use-url-params>
      </usa-pagination>
    `);

    cy.window().then((win) => {
      const pagination = win.document.getElementById('test-pagination') as any;
      
      // Should update URL when page changes
      cy.get('.usa-pagination__button').contains('3').click();
      
      // URL should contain page parameter
      cy.url().should('include', 'page=3');
    });
  });

  it('should handle loading state', () => {
    cy.mount(`
      <usa-pagination 
        id="test-pagination" 
        total-pages="10" 
        current-page="1"
        loading>
      </usa-pagination>
    `);

    cy.get('.usa-pagination').should('have.class', 'usa-pagination--loading');
    cy.get('.usa-pagination__button').should('be.disabled');
    
    // Should show loading indicator
    cy.get('.usa-pagination__loading').should('exist');
  });

  it('should handle mobile responsive behavior', () => {
    cy.mount(`
      <usa-pagination 
        id="test-pagination" 
        total-pages="10" 
        current-page="5">
      </usa-pagination>
    `);

    // Set mobile viewport
    cy.viewport(375, 667);
    
    cy.get('.usa-pagination').should('have.class', 'usa-pagination--mobile');
    
    // Should show fewer page numbers on mobile
    cy.get('.usa-pagination__item').should('have.length.lessThan', 7);
  });

  it('should handle programmatic page changes', () => {
    cy.mount(`
      <usa-pagination 
        id="test-pagination" 
        total-pages="10" 
        current-page="1">
      </usa-pagination>
    `);

    cy.window().then((win) => {
      const pagination = win.document.getElementById('test-pagination') as any;
      
      // Set page programmatically
      pagination.currentPage = 7;
      
      cy.get('.usa-pagination__button[aria-current="page"]').should('contain.text', '7');
    });
  });

  it('should handle edge cases with small page counts', () => {
    cy.mount(`
      <usa-pagination 
        id="test-pagination" 
        total-pages="2" 
        current-page="1">
      </usa-pagination>
    `);

    // Should show all pages when total is small
    cy.get('.usa-pagination__button').should('have.length', 2);
    cy.get('.usa-pagination__overflow').should('not.exist');
  });

  it('should handle single page scenario', () => {
    cy.mount(`
      <usa-pagination 
        id="test-pagination" 
        total-pages="1" 
        current-page="1">
      </usa-pagination>
    `);

    // Should disable navigation buttons
    cy.get('.usa-pagination__previous-page').should('be.disabled');
    cy.get('.usa-pagination__next-page').should('be.disabled');
    
    // Should still show current page
    cy.get('.usa-pagination__button').should('contain.text', '1');
    cy.get('.usa-pagination__button[aria-current="page"]').should('exist');
  });

  it('should handle aria attributes correctly', () => {
    cy.mount(`
      <usa-pagination 
        id="test-pagination" 
        total-pages="10" 
        current-page="5"
        aria-label="Search results pagination">
      </usa-pagination>
    `);

    cy.get('.usa-pagination').should('have.attr', 'role', 'navigation');
    cy.get('.usa-pagination').should('have.attr', 'aria-label', 'Search results pagination');
    
    // Current page should have aria-current
    cy.get('.usa-pagination__button[aria-current="page"]').should('contain.text', '5');
    
    // Navigation buttons should have proper labels
    cy.get('.usa-pagination__previous-page').should('have.attr', 'aria-label', 'Previous page');
    cy.get('.usa-pagination__next-page').should('have.attr', 'aria-label', 'Next page');
  });

  it('should handle page validation', () => {
    cy.mount(`
      <usa-pagination 
        id="test-pagination" 
        total-pages="10" 
        current-page="1">
      </usa-pagination>
    `);

    cy.window().then((win) => {
      const pagination = win.document.getElementById('test-pagination') as any;
      
      // Try to set invalid page (too high)
      pagination.currentPage = 15;
      cy.get('.usa-pagination__button[aria-current="page"]').should('contain.text', '10');
      
      // Try to set invalid page (too low)
      pagination.currentPage = -1;
      cy.get('.usa-pagination__button[aria-current="page"]').should('contain.text', '1');
    });
  });

  it('should be accessible', () => {
    cy.mount(`
      <div>
        <h2>Search Results</h2>
        <p>Found 150 results for "government services"</p>
        <usa-pagination 
          id="results-pagination" 
          total-pages="15" 
          current-page="3"
          total-items="150"
          page-size="10"
          show-results-summary
          aria-label="Search results pages">
        </usa-pagination>
      </div>
    `);

    cy.injectAxe();
    cy.checkAccessibility();
  });

  it('should handle custom CSS classes', () => {
    cy.mount(`
      <usa-pagination 
        id="test-pagination" 
        total-pages="10" 
        current-page="1"
        class="custom-pagination-class">
      </usa-pagination>
    `);

    cy.get('usa-pagination').should('have.class', 'custom-pagination-class');
    cy.get('.usa-pagination').should('exist');
  });

  it('should handle dynamic page count updates', () => {
    cy.mount(`
      <usa-pagination 
        id="test-pagination" 
        total-pages="5" 
        current-page="3">
      </usa-pagination>
    `);

    cy.window().then((win) => {
      const pagination = win.document.getElementById('test-pagination') as any;
      
      // Initially 5 pages
      cy.get('.usa-pagination__button').should('have.length', 5);
      
      // Update to 10 pages
      pagination.totalPages = 10;
      cy.get('.usa-pagination__button').should('have.length.greaterThan', 5);
      
      // Update to 2 pages (should adjust current page if needed)
      pagination.totalPages = 2;
      cy.get('.usa-pagination__button[aria-current="page"]').should('contain.text', '2');
    });
  });

  it('should handle touch interactions', () => {
    cy.mount(`
      <usa-pagination 
        id="test-pagination" 
        total-pages="10" 
        current-page="5">
      </usa-pagination>
    `);

    // Touch next button
    cy.get('.usa-pagination__next-page').trigger('touchstart');
    
    // Touch page number
    cy.get('.usa-pagination__button').contains('7').trigger('touchstart');
  });
});