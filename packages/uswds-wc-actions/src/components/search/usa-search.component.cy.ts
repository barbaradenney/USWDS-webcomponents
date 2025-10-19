// Component tests for usa-search
import './index.ts';

describe('USA Search Component Tests', () => {
  it('should render search component with default properties', () => {
    cy.mount(`<usa-search id="test-search"></usa-search>`);
    cy.get('usa-search').should('exist');
    cy.get('.usa-search').should('exist');
    cy.get('.usa-search__input').should('exist');
    cy.get('.usa-search__submit').should('exist');
  });

  it('should handle text input', () => {
    cy.mount(`<usa-search id="test-search"></usa-search>`);

    // Type search query
    cy.get('.usa-search__input').type('government services');
    cy.get('.usa-search__input').should('have.value', 'government services');

    // Clear and try different query
    cy.get('.usa-search__input').clear().type('benefits application');
    cy.get('.usa-search__input').should('have.value', 'benefits application');
  });

  it('should handle form submission', () => {
    cy.mount(`<usa-search id="test-search" name="search-query"></usa-search>`);

    cy.window().then((win) => {
      const search = win.document.getElementById('test-search') as any;
      const submitSpy = cy.stub();
      search.addEventListener('submit', (e: CustomEvent) => {
        e.preventDefault();
        submitSpy(e.detail.query);
      });

      // Enter query and submit with button
      cy.get('.usa-search__input').type('tax forms');
      cy.get('.usa-search__submit').click();

      cy.then(() => {
        expect(submitSpy).to.have.been.calledWith('tax forms');
      });
    });
  });

  it('should handle form submission with Enter key', () => {
    cy.mount(`<usa-search id="test-search"></usa-search>`);

    cy.window().then((win) => {
      const search = win.document.getElementById('test-search') as any;
      const submitSpy = cy.stub();
      search.addEventListener('submit', submitSpy);

      // Enter query and submit with Enter key
      cy.get('.usa-search__input').type('healthcare.gov{enter}');

      cy.then(() => {
        expect(submitSpy).to.have.been.called;
      });
    });
  });

  it('should handle big variant', () => {
    cy.mount(`<usa-search id="test-search" size="big"></usa-search>`);

    cy.get('.usa-search').should('have.class', 'usa-search--big');
    cy.get('.usa-search__input').should('have.class', 'usa-search__input--big');
    cy.get('.usa-search__submit').should('have.class', 'usa-search__submit--big');
  });

  it('should handle small variant', () => {
    cy.mount(`<usa-search id="test-search" size="small"></usa-search>`);

    cy.get('.usa-search').should('have.class', 'usa-search--small');
    cy.get('.usa-search__input').should('have.class', 'usa-search__input--small');
    cy.get('.usa-search__submit').should('have.class', 'usa-search__submit--small');
  });

  it('should handle disabled state', () => {
    cy.mount(`<usa-search id="test-search" disabled></usa-search>`);

    cy.get('.usa-search__input').should('be.disabled');
    cy.get('.usa-search__submit').should('be.disabled');
    cy.get('.usa-search').should('have.class', 'usa-search--disabled');
  });

  it('should handle placeholder text', () => {
    cy.mount(`
      <usa-search 
        id="test-search" 
        placeholder="Search government services...">
      </usa-search>
    `);

    cy.get('.usa-search__input').should(
      'have.attr',
      'placeholder',
      'Search government services...'
    );
  });

  it('should handle custom button text', () => {
    cy.mount(`
      <usa-search 
        id="test-search" 
        button-text="Find">
      </usa-search>
    `);

    cy.get('.usa-search__submit').should('contain.text', 'Find');
  });

  it('should handle search suggestions/autocomplete', () => {
    cy.mount(`<usa-search id="test-search" show-suggestions></usa-search>`);

    cy.window().then((win) => {
      const search = win.document.getElementById('test-search') as any;
      search.suggestions = [
        'social security benefits',
        'social security card replacement',
        'social security office locations',
      ];
    });

    // Type to trigger suggestions
    cy.get('.usa-search__input').type('social');
    cy.get('.usa-search__suggestions').should('be.visible');
    cy.get('.usa-search__suggestion').should('have.length', 3);
    cy.get('.usa-search__suggestion').first().should('contain.text', 'social security benefits');
  });

  it('should handle suggestion selection', () => {
    cy.mount(`<usa-search id="test-search" show-suggestions></usa-search>`);

    cy.window().then((win) => {
      const search = win.document.getElementById('test-search') as any;
      search.suggestions = ['veterans benefits', 'veterans affairs', 'veterans hospital'];
    });

    // Type and select suggestion
    cy.get('.usa-search__input').type('vet');
    cy.get('.usa-search__suggestion').contains('veterans benefits').click();

    cy.get('.usa-search__input').should('have.value', 'veterans benefits');
    cy.get('.usa-search__suggestions').should('not.be.visible');
  });

  it('should handle keyboard navigation in suggestions', () => {
    cy.mount(`<usa-search id="test-search" show-suggestions></usa-search>`);

    cy.window().then((win) => {
      const search = win.document.getElementById('test-search') as any;
      search.suggestions = [
        'medicare enrollment',
        'medicare benefits',
        'medicare card replacement',
      ];
    });

    // Type to show suggestions
    cy.get('.usa-search__input').type('med');
    cy.get('.usa-search__suggestions').should('be.visible');

    // Arrow down to navigate
    cy.get('.usa-search__input').type('{downarrow}');
    cy.get('.usa-search__suggestion--highlighted').should('contain.text', 'medicare enrollment');

    // Arrow down to next
    cy.get('.usa-search__input').type('{downarrow}');
    cy.get('.usa-search__suggestion--highlighted').should('contain.text', 'medicare benefits');

    // Enter to select
    cy.get('.usa-search__input').type('{enter}');
    cy.get('.usa-search__input').should('have.value', 'medicare benefits');
  });

  it('should handle search history', () => {
    cy.mount(`<usa-search id="test-search" show-history></usa-search>`);

    cy.window().then((win) => {
      const search = win.document.getElementById('test-search') as any;

      // Add to history programmatically
      search.addToHistory('tax refund status');
      search.addToHistory('passport renewal');
    });

    // Focus input to show history
    cy.get('.usa-search__input').focus();
    cy.get('.usa-search__history').should('be.visible');
    cy.get('.usa-search__history-item').should('have.length', 2);
    cy.get('.usa-search__history-item').first().should('contain.text', 'passport renewal');
  });

  it('should handle clear search functionality', () => {
    cy.mount(`<usa-search id="test-search" show-clear></usa-search>`);

    // Type search query
    cy.get('.usa-search__input').type('immigration forms');

    // Clear button should be visible
    cy.get('.usa-search__clear').should('be.visible');

    // Click clear button
    cy.get('.usa-search__clear').click();
    cy.get('.usa-search__input').should('have.value', '');
    cy.get('.usa-search__clear').should('not.be.visible');
  });

  it('should handle search filters', () => {
    cy.mount(`<usa-search id="test-search" show-filters></usa-search>`);

    cy.window().then((win) => {
      const search = win.document.getElementById('test-search') as any;
      search.filters = [
        { key: 'type', label: 'Content Type', options: ['Forms', 'Articles', 'Services'] },
        { key: 'agency', label: 'Agency', options: ['SSA', 'IRS', 'VA'] },
      ];
    });

    // Should show filter toggle
    cy.get('.usa-search__filters-toggle').should('be.visible');

    // Click to show filters
    cy.get('.usa-search__filters-toggle').click();
    cy.get('.usa-search__filters').should('be.visible');

    // Should have filter options
    cy.get('.usa-search__filter').should('have.length', 2);
    cy.get('.usa-search__filter').first().should('contain.text', 'Content Type');
  });

  it('should emit input events', () => {
    cy.mount(`<usa-search id="test-search"></usa-search>`);

    cy.window().then((win) => {
      const search = win.document.getElementById('test-search') as any;
      const inputSpy = cy.stub();
      search.addEventListener('input', inputSpy);

      cy.get('.usa-search__input').type('government');

      cy.then(() => {
        expect(inputSpy).to.have.been.called;
      });
    });
  });

  it('should handle form integration', () => {
    cy.mount(`
      <form id="search-form" action="/search" method="GET">
        <usa-search id="site-search" name="query"></usa-search>
        <button type="submit">Search Site</button>
      </form>
    `);

    cy.window().then((win) => {
      const form = win.document.getElementById('search-form') as HTMLFormElement;
      const submitSpy = cy.stub();
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        submitSpy(formData.get('query'));
      });

      // Enter search and submit form
      cy.get('.usa-search__input').type('federal jobs');
      cy.get('button[type="submit"]').click();

      cy.then(() => {
        expect(submitSpy).to.have.been.calledWith('federal jobs');
      });
    });
  });

  it('should handle search validation', () => {
    cy.mount(`
      <usa-search 
        id="test-search" 
        required
        min-length="3">
      </usa-search>
    `);

    cy.window().then((win) => {
      const search = win.document.getElementById('test-search') as any;
      const errorSpy = cy.stub();
      search.addEventListener('validation-error', errorSpy);

      // Try to submit empty search
      cy.get('.usa-search__submit').click();
      cy.then(() => {
        expect(errorSpy).to.have.been.called;
      });

      // Try to submit search that's too short
      cy.get('.usa-search__input').type('ab');
      cy.get('.usa-search__submit').click();
      cy.then(() => {
        expect(errorSpy).to.have.been.called;
      });
    });
  });

  it('should handle keyboard shortcuts', () => {
    cy.mount(`<usa-search id="test-search" keyboard-shortcut="ctrl+k"></usa-search>`);

    // Focus should move to search on keyboard shortcut
    cy.get('body').type('{ctrl+k}');
    cy.focused().should('have.class', 'usa-search__input');
  });

  it('should handle mobile responsive behavior', () => {
    cy.mount(`<usa-search id="test-search" mobile-optimized></usa-search>`);

    // Set mobile viewport
    cy.viewport(375, 667);

    cy.get('.usa-search').should('have.class', 'usa-search--mobile');

    // Search button might be icon only on mobile
    cy.get('.usa-search__submit .usa-icon').should('exist');
  });

  it('should handle voice search when supported', () => {
    cy.mount(`<usa-search id="test-search" voice-search></usa-search>`);

    // Should show microphone button
    cy.get('.usa-search__voice').should('be.visible');
    cy.get('.usa-search__voice .usa-icon-mic').should('exist');

    // Click voice search button
    cy.get('.usa-search__voice').click();
    // Note: Actual voice recognition would require browser permissions
  });

  it('should be keyboard accessible', () => {
    cy.mount(`<usa-search id="test-search"></usa-search>`);

    // Tab to search input
    cy.get('.usa-search__input').focus();
    cy.focused().should('have.class', 'usa-search__input');

    // Tab to search button
    cy.focused().tab();
    cy.focused().should('have.class', 'usa-search__submit');

    // Enter on button should submit
    cy.focused().type('{enter}');
  });

  it('should handle aria attributes correctly', () => {
    cy.mount(`
      <div>
        <label id="search-label">Site Search</label>
        <usa-search 
          id="test-search"
          aria-labelledby="search-label"
          aria-describedby="search-hint">
        </usa-search>
        <div id="search-hint">Search our government services and information</div>
      </div>
    `);

    cy.get('.usa-search__input')
      .should('have.attr', 'role', 'searchbox')
      .should('have.attr', 'aria-labelledby', 'search-label')
      .should('have.attr', 'aria-describedby', 'search-hint');

    cy.get('.usa-search__submit')
      .should('have.attr', 'type', 'submit')
      .should('have.attr', 'aria-label', 'Search');
  });

  it('should handle focus and blur events', () => {
    cy.mount(`<usa-search id="test-search"></usa-search>`);

    cy.window().then((win) => {
      const search = win.document.getElementById('test-search') as any;
      const focusSpy = cy.stub();
      const blurSpy = cy.stub();
      search.addEventListener('focus', focusSpy);
      search.addEventListener('blur', blurSpy);

      cy.get('.usa-search__input').focus();
      cy.get('.usa-search__input').blur();

      cy.then(() => {
        expect(focusSpy).to.have.been.called;
        expect(blurSpy).to.have.been.called;
      });
    });
  });

  it('should be accessible', () => {
    cy.mount(`
      <form role="search">
        <label for="site-search">Search our site</label>
        <usa-search 
          id="site-search"
          aria-describedby="search-instructions">
        </usa-search>
        <div id="search-instructions">Enter keywords to search government services</div>
      </form>
    `);

    cy.injectAxe();
    cy.checkAccessibility();
  });

  it('should handle custom CSS classes', () => {
    cy.mount(`
      <usa-search 
        id="test-search" 
        class="custom-search-class">
      </usa-search>
    `);

    cy.get('usa-search').should('have.class', 'custom-search-class');
    cy.get('.usa-search').should('exist');
  });

  it('should handle programmatic search', () => {
    cy.mount(`<usa-search id="test-search"></usa-search>`);

    cy.window().then((win) => {
      const search = win.document.getElementById('test-search') as any;

      // Set search query programmatically
      search.value = 'social security';
      cy.get('.usa-search__input').should('have.value', 'social security');

      // Trigger search programmatically
      search.performSearch();
    });
  });

  it('should handle search result highlighting', () => {
    cy.mount(`<usa-search id="test-search" highlight-results></usa-search>`);

    cy.window().then((win) => {
      const search = win.document.getElementById('test-search') as any;
      const highlightSpy = cy.stub();
      search.addEventListener('highlight-results', highlightSpy);

      cy.get('.usa-search__input').type('benefits');
      cy.get('.usa-search__submit').click();

      cy.then(() => {
        expect(highlightSpy).to.have.been.called;
      });
    });
  });

  it('should handle search analytics tracking', () => {
    cy.mount(`<usa-search id="test-search" track-analytics></usa-search>`);

    cy.window().then((win) => {
      const search = win.document.getElementById('test-search') as any;
      const analyticsSpy = cy.stub();
      search.addEventListener('search-analytics', analyticsSpy);

      cy.get('.usa-search__input').type('tax forms');
      cy.get('.usa-search__submit').click();

      cy.then(() => {
        expect(analyticsSpy).to.have.been.calledWith(
          Cypress.sinon.match.hasNested('detail.query', 'tax forms')
        );
      });
    });
  });

  // Responsive Layout Tests
  describe('Mobile Responsive Behavior', () => {
    beforeEach(() => {
      cy.viewport(375, 667); // iPhone SE
    });

    it('should display mobile-optimized search layout', () => {
      cy.mount(`
        <div class="usa-header">
          <usa-search
            id="mobile-search"
            mobile-optimized
            placeholder="Search gov services">
          </usa-search>
        </div>
      `);

      cy.get('.usa-search').should('have.class', 'usa-search--mobile');

      // Input should fill available mobile width
      cy.get('.usa-search__input').should(($input) => {
        const width = $input.outerWidth();
        expect(width).to.be.greaterThan(250);
      });

      // Search button should be appropriately sized for touch
      cy.get('.usa-search__submit').should(($button) => {
        const height = $button.outerHeight();
        expect(height).to.be.at.least(44);
      });
    });

    it('should handle mobile search suggestions', () => {
      cy.mount(`
        <usa-search
          id="mobile-suggestions"
          show-suggestions
          placeholder="Search services">
        </usa-search>
      `);

      cy.window().then((win) => {
        const search = win.document.getElementById('mobile-suggestions') as any;
        search.suggestions = [
          'social security benefits',
          'medicare enrollment',
          'passport application',
          'tax refund status',
          'unemployment benefits',
        ];
      });

      cy.get('.usa-search__input').type('social');

      // Suggestions should be visible and properly sized for mobile
      cy.get('.usa-search__suggestions').should('be.visible');
      cy.get('.usa-search__suggestion').should('have.length.at.least', 1);

      // Touch target size for suggestions
      cy.get('.usa-search__suggestion').each(($suggestion) => {
        cy.wrap($suggestion).should(($el) => {
          const height = $el.outerHeight();
          expect(height).to.be.at.least(44);
        });
      });
    });

    it('should handle mobile voice search', () => {
      cy.mount(`
        <usa-search
          id="mobile-voice"
          voice-search
          size="big">
        </usa-search>
      `);

      // Voice button should be visible and touch-friendly
      cy.get('.usa-search__voice').should('be.visible');
      cy.get('.usa-search__voice').should(($voice) => {
        const height = $voice.outerHeight();
        expect(height).to.be.at.least(44);
      });

      cy.get('.usa-search__voice .usa-icon-mic').should('exist');
    });

    it('should handle mobile search filters', () => {
      cy.mount(`
        <usa-search
          id="mobile-filters"
          show-filters>
        </usa-search>
      `);

      cy.window().then((win) => {
        const search = win.document.getElementById('mobile-filters') as any;
        search.filters = [
          { key: 'category', label: 'Category', options: ['Benefits', 'Forms', 'Services'] },
          { key: 'agency', label: 'Agency', options: ['SSA', 'IRS', 'VA'] },
        ];
      });

      // Filter toggle should be visible
      cy.get('.usa-search__filters-toggle').should('be.visible');

      // Open filters on mobile
      cy.get('.usa-search__filters-toggle').click();
      cy.get('.usa-search__filters').should('be.visible');

      // Filters should stack vertically on mobile
      cy.get('.usa-search__filter').should('have.length', 2);
    });

    it('should handle mobile search with clear button', () => {
      cy.mount(`
        <usa-search
          id="mobile-clear"
          show-clear
          placeholder="Search benefits">
        </usa-search>
      `);

      cy.get('.usa-search__input').type('veterans benefits');

      // Clear button should be visible and touch-friendly
      cy.get('.usa-search__clear').should('be.visible');
      cy.get('.usa-search__clear').should(($clear) => {
        const height = $clear.outerHeight();
        expect(height).to.be.at.least(44);
      });

      cy.get('.usa-search__clear').click();
      cy.get('.usa-search__input').should('have.value', '');
    });

    it('should handle mobile keyboard behavior', () => {
      cy.mount(`
        <usa-search
          id="mobile-keyboard"
          placeholder="Search government">
        </usa-search>
      `);

      // Focus should work with touch
      cy.get('.usa-search__input').trigger('touchstart').trigger('touchend').should('be.focused');

      // Search button should be accessible
      cy.get('.usa-search__submit').click();
    });
  });

  describe('Tablet Responsive Behavior', () => {
    beforeEach(() => {
      cy.viewport(768, 1024); // iPad
    });

    it('should display tablet search layout with filters', () => {
      cy.mount(`
        <div class="usa-header">
          <div class="grid-row">
            <div class="tablet:grid-col-8">
              <usa-search
                id="tablet-search"
                show-filters
                show-suggestions
                size="big">
              </usa-search>
            </div>
            <div class="tablet:grid-col-4">
              <nav>Navigation items</nav>
            </div>
          </div>
        </div>
      `);

      cy.window().then((win) => {
        const search = win.document.getElementById('tablet-search') as any;
        search.filters = [
          { key: 'content', label: 'Content Type', options: ['Forms', 'Articles', 'News'] },
        ];
        search.suggestions = ['healthcare enrollment', 'tax forms', 'social security'];
      });

      cy.get('.usa-search').should('have.class', 'usa-search--big');

      // Check that search takes appropriate width on tablet
      cy.get('.tablet\\:grid-col-8').should('contain', 'usa-search');
    });

    it('should handle tablet search suggestions layout', () => {
      cy.mount(`
        <usa-search
          id="tablet-suggestions"
          show-suggestions
          placeholder="Search for services">
        </usa-search>
      `);

      cy.window().then((win) => {
        const search = win.document.getElementById('tablet-suggestions') as any;
        search.suggestions = [
          'medicare benefits and enrollment',
          'social security disability application',
          'federal employment opportunities',
          'passport renewal and application',
          'tax refund status and information',
        ];
      });

      cy.get('.usa-search__input').type('med');

      // Suggestions should be properly spaced for tablet
      cy.get('.usa-search__suggestions').should('be.visible');
      cy.get('.usa-search__suggestion').should('have.length.at.least', 1);

      // Should handle both touch and hover
      cy.get('.usa-search__suggestion')
        .first()
        .trigger('mouseover')
        .should('have.class', 'usa-search__suggestion--highlighted');
    });

    it('should handle tablet voice search and filters', () => {
      cy.mount(`
        <usa-search
          id="tablet-voice-filters"
          voice-search
          show-filters
          show-clear>
        </usa-search>
      `);

      cy.window().then((win) => {
        const search = win.document.getElementById('tablet-voice-filters') as any;
        search.filters = [
          {
            key: 'agency',
            label: 'Agency',
            options: [
              'Department of Veterans Affairs',
              'Social Security Administration',
              'Internal Revenue Service',
            ],
          },
        ];
      });

      // All features should be visible on tablet
      cy.get('.usa-search__voice').should('be.visible');
      cy.get('.usa-search__filters-toggle').should('be.visible');

      // Test voice search button
      cy.get('.usa-search__voice').click();

      // Test filters
      cy.get('.usa-search__filters-toggle').click();
      cy.get('.usa-search__filters').should('be.visible');
    });

    it('should handle tablet form integration', () => {
      cy.mount(`
        <form class="usa-search-form">
          <div class="grid-row">
            <div class="tablet:grid-col-10">
              <usa-search
                id="tablet-form-search"
                name="query"
                placeholder="Search federal services">
              </usa-search>
            </div>
            <div class="tablet:grid-col-2">
              <button type="submit" class="usa-button">Search</button>
            </div>
          </div>
        </form>
      `);

      cy.get('.usa-search__input').type('federal jobs');
      cy.get('button[type="submit"]').click();

      cy.get('.usa-search__input').should('have.value', 'federal jobs');
    });
  });

  describe('Desktop Responsive Behavior', () => {
    beforeEach(() => {
      cy.viewport(1200, 800); // Desktop
    });

    it('should display full desktop search with all features', () => {
      cy.mount(`
        <header class="usa-header">
          <div class="grid-container">
            <div class="grid-row">
              <div class="desktop:grid-col-6">
                <div class="usa-logo">Government Site</div>
              </div>
              <div class="desktop:grid-col-6">
                <usa-search
                  id="desktop-search"
                  size="big"
                  show-suggestions
                  show-filters
                  voice-search
                  show-clear
                  show-history>
                </usa-search>
              </div>
            </div>
          </div>
        </header>
      `);

      cy.window().then((win) => {
        const search = win.document.getElementById('desktop-search') as any;
        search.suggestions = [
          'social security benefits calculator',
          'medicare enrollment deadlines',
          'federal tax forms and publications',
          'passport application requirements',
          'veterans disability compensation',
        ];
        search.filters = [
          {
            key: 'type',
            label: 'Content Type',
            options: ['Forms', 'Articles', 'Services', 'News'],
          },
          {
            key: 'agency',
            label: 'Government Agency',
            options: ['SSA', 'CMS', 'IRS', 'State Dept', 'VA'],
          },
        ];
      });

      // All features should be visible and properly spaced
      cy.get('.usa-search').should('have.class', 'usa-search--big');
      cy.get('.usa-search__voice').should('be.visible');
      cy.get('.usa-search__filters-toggle').should('be.visible');
    });

    it('should handle desktop search suggestions with keyboard navigation', () => {
      cy.mount(`
        <usa-search
          id="desktop-suggestions"
          show-suggestions
          keyboard-shortcut="ctrl+k">
        </usa-search>
      `);

      cy.window().then((win) => {
        const search = win.document.getElementById('desktop-suggestions') as any;
        search.suggestions = [
          'federal employment opportunities',
          'federal student aid applications',
          'federal tax preparation resources',
          'federal housing assistance programs',
        ];
      });

      // Test keyboard shortcut
      cy.get('body').type('{ctrl+k}');
      cy.focused().should('have.class', 'usa-search__input');

      // Type to show suggestions
      cy.get('.usa-search__input').type('federal');
      cy.get('.usa-search__suggestions').should('be.visible');

      // Test keyboard navigation
      cy.get('.usa-search__input').type('{downarrow}');
      cy.get('.usa-search__suggestion--highlighted').should('exist');

      cy.get('.usa-search__input').type('{downarrow}');
      cy.get('.usa-search__input').type('{enter}');

      // Should select the highlighted suggestion
      cy.get('.usa-search__input').should('not.have.value', 'federal');
    });

    it('should handle desktop advanced filters', () => {
      cy.mount(`
        <usa-search
          id="desktop-filters"
          show-filters
          size="big">
        </usa-search>
      `);

      cy.window().then((win) => {
        const search = win.document.getElementById('desktop-filters') as any;
        search.filters = [
          {
            key: 'type',
            label: 'Content Type',
            options: [
              'Forms and Documents',
              'Articles and Guides',
              'Services and Tools',
              'News and Updates',
            ],
          },
          {
            key: 'agency',
            label: 'Government Agency',
            options: [
              'Social Security Administration',
              'Department of Veterans Affairs',
              'Internal Revenue Service',
              'Department of Health and Human Services',
            ],
          },
          {
            key: 'audience',
            label: 'Intended Audience',
            options: ['Citizens', 'Businesses', 'Government Employees', 'Researchers'],
          },
        ];
      });

      // Open filters
      cy.get('.usa-search__filters-toggle').click();
      cy.get('.usa-search__filters').should('be.visible');

      // Should display filters in organized layout
      cy.get('.usa-search__filter').should('have.length', 3);
      cy.get('.usa-search__filter').first().should('contain.text', 'Content Type');

      // Test filter selection
      cy.get('.usa-search__filter').first().find('select, input').first().click();
    });

    it('should handle desktop search with autocomplete and history', () => {
      cy.mount(`
        <usa-search
          id="desktop-autocomplete"
          show-suggestions
          show-history
          show-clear>
        </usa-search>
      `);

      cy.window().then((win) => {
        const search = win.document.getElementById('desktop-autocomplete') as any;
        search.suggestions = [
          'healthcare.gov enrollment',
          'social security statement',
          'tax transcript request',
          'passport status check',
        ];

        // Add search history
        search.addToHistory('veterans benefits application');
        search.addToHistory('medicare enrollment periods');
      });

      // Focus to show history
      cy.get('.usa-search__input').focus();
      cy.get('.usa-search__history').should('be.visible');
      cy.get('.usa-search__history-item').should('have.length', 2);

      // Type to show suggestions
      cy.get('.usa-search__input').type('health');
      cy.get('.usa-search__suggestions').should('be.visible');
      cy.get('.usa-search__history').should('not.be.visible');

      // Clear should work
      cy.get('.usa-search__clear').should('be.visible');
    });

    it('should handle desktop voice search integration', () => {
      cy.mount(`
        <usa-search
          id="desktop-voice"
          voice-search
          show-suggestions
          size="big">
        </usa-search>
      `);

      // Voice button should be properly positioned
      cy.get('.usa-search__voice').should('be.visible');
      cy.get('.usa-search__voice .usa-icon-mic').should('exist');

      // Should handle hover states
      cy.get('.usa-search__voice').trigger('mouseover').should('have.css', 'cursor', 'pointer');

      // Click voice search
      cy.get('.usa-search__voice').click();
    });
  });

  describe('Large Desktop Responsive Behavior', () => {
    beforeEach(() => {
      cy.viewport(1440, 900); // Large Desktop
    });

    it('should maintain proper spacing on large screens', () => {
      cy.mount(`
        <div class="grid-container">
          <header class="usa-header usa-header--extended">
            <div class="grid-row">
              <div class="desktop:grid-col-4">
                <div class="usa-logo">
                  <em class="usa-logo__text">Government Portal</em>
                </div>
              </div>
              <div class="desktop:grid-col-8">
                <usa-search
                  id="large-desktop-search"
                  size="big"
                  show-suggestions
                  show-filters
                  voice-search
                  show-clear
                  show-history
                  placeholder="Search all government services and information">
                </usa-search>
              </div>
            </div>
          </header>
        </div>
      `);

      cy.window().then((win) => {
        const search = win.document.getElementById('large-desktop-search') as any;
        search.suggestions = [
          'comprehensive tax preparation and filing resources',
          'social security benefits and retirement planning',
          'medicare enrollment and healthcare coverage options',
          'veterans affairs benefits and disability compensation',
          'federal employment opportunities and career resources',
        ];
      });

      // Container should be properly centered
      cy.get('.grid-container').should('have.css', 'max-width');

      // Search should have adequate width
      cy.get('.usa-search__input').should(($input) => {
        const width = $input.outerWidth();
        expect(width).to.be.greaterThan(400);
      });
    });

    it('should handle large desktop advanced search features', () => {
      cy.mount(`
        <usa-search
          id="large-advanced-search"
          size="big"
          show-suggestions
          show-filters
          voice-search
          show-history
          highlight-results
          track-analytics>
        </usa-search>
      `);

      cy.window().then((win) => {
        const search = win.document.getElementById('large-advanced-search') as any;
        search.suggestions = [
          'federal student financial aid and loan programs',
          'small business administration resources and funding',
          'environmental protection agency regulations and compliance',
          'department of homeland security travel advisories',
          'centers for disease control health guidelines and recommendations',
        ];
        search.filters = [
          {
            key: 'relevance',
            label: 'Sort by Relevance',
            options: ['Most Relevant', 'Most Recent', 'Alphabetical', 'Most Popular'],
          },
          {
            key: 'date',
            label: 'Publication Date',
            options: ['Past Week', 'Past Month', 'Past Year', 'All Time'],
          },
        ];
      });

      // All advanced features should be accessible
      cy.get('.usa-search__voice').should('be.visible');
      cy.get('.usa-search__filters-toggle').should('be.visible');

      // Test comprehensive search workflow
      cy.get('.usa-search__input').type('student');
      cy.get('.usa-search__suggestions').should('be.visible');

      // Select suggestion
      cy.get('.usa-search__suggestion').first().click();
      cy.get('.usa-search__input').should('contain.value', 'student');
    });
  });

  describe('Responsive Edge Cases', () => {
    it('should handle viewport transitions smoothly', () => {
      cy.mount(`
        <div class="grid-row">
          <div class="tablet:grid-col-8 desktop:grid-col-6">
            <usa-search
              id="transition-search"
              show-suggestions
              voice-search>
            </usa-search>
          </div>
        </div>
      `);

      cy.window().then((win) => {
        const search = win.document.getElementById('transition-search') as any;
        search.suggestions = ['government services', 'federal benefits', 'tax information'];
      });

      // Test mobile viewport
      cy.viewport(375, 667);
      cy.get('.usa-search__input').type('gov').should('be.visible');

      // Test tablet viewport
      cy.viewport(768, 1024);
      cy.get('.usa-search__input').should('be.visible').should('have.value', 'gov');

      // Test desktop viewport
      cy.viewport(1200, 800);
      cy.get('.usa-search__input').should('be.visible').should('have.value', 'gov');
    });

    it('should handle long search queries and suggestions', () => {
      const longQuery =
        'federal government benefits and services for veterans with disabilities and their families';
      const longSuggestions = [
        'comprehensive guide to federal employment opportunities for recent college graduates',
        'social security disability insurance application process and eligibility requirements',
        'medicare supplemental insurance plans and enrollment deadlines for seniors',
        'department of veterans affairs healthcare benefits and regional medical centers',
      ];

      cy.mount(`
        <usa-search
          id="long-content-search"
          show-suggestions>
        </usa-search>
      `);

      cy.window().then((win) => {
        const search = win.document.getElementById('long-content-search') as any;
        search.suggestions = longSuggestions;
      });

      // Test at different viewports
      const viewports = [
        [320, 568], // Small mobile
        [768, 1024], // Tablet
        [1200, 800], // Desktop
      ];

      viewports.forEach(([width, height]) => {
        cy.viewport(width, height);

        cy.get('.usa-search__input').clear().type(longQuery.substring(0, 50));
        cy.get('.usa-search__suggestions').should('be.visible');

        // Should not cause horizontal overflow
        cy.get('.usa-search').then(($search) => {
          expect($search[0].scrollWidth).to.be.at.most($search[0].clientWidth + 10);
        });
      });
    });

    it('should handle dynamic filter and suggestion updates', () => {
      cy.mount(`
        <usa-search
          id="dynamic-search"
          show-suggestions
          show-filters>
        </usa-search>
      `);

      const scenarios = [
        {
          viewport: [375, 667],
          suggestions: ['mobile search result'],
          filters: [{ key: 'mobile', label: 'Mobile Filter', options: ['Option 1'] }],
        },
        {
          viewport: [768, 1024],
          suggestions: ['tablet search result 1', 'tablet search result 2'],
          filters: [
            { key: 'tablet1', label: 'Tablet Filter 1', options: ['Option A', 'Option B'] },
            { key: 'tablet2', label: 'Tablet Filter 2', options: ['Option C'] },
          ],
        },
        {
          viewport: [1200, 800],
          suggestions: [
            'desktop search result 1',
            'desktop search result 2',
            'desktop search result 3',
          ],
          filters: [
            { key: 'desktop1', label: 'Desktop Filter 1', options: ['Option X', 'Option Y'] },
            { key: 'desktop2', label: 'Desktop Filter 2', options: ['Option Z'] },
          ],
        },
      ];

      scenarios.forEach(({ viewport, suggestions, filters }) => {
        cy.viewport(viewport[0], viewport[1]);

        cy.window().then((win) => {
          const search = win.document.getElementById('dynamic-search') as any;
          search.suggestions = suggestions;
          search.filters = filters;
        });

        cy.get('.usa-search__input').clear().type('test');
        cy.get('.usa-search__suggestions').should('be.visible');
        cy.get('.usa-search__suggestion').should('have.length', suggestions.length);
      });
    });

    it('should maintain accessibility at all screen sizes', () => {
      cy.mount(`
        <div>
          <label for="accessible-search">Government Search</label>
          <usa-search
            id="accessible-search"
            aria-describedby="search-hint"
            show-suggestions
            voice-search>
          </usa-search>
          <div id="search-hint">Search for government services and information</div>
        </div>
      `);

      const viewports = [
        [375, 667], // Mobile
        [768, 1024], // Tablet
        [1200, 800], // Desktop
      ];

      viewports.forEach(([width, height]) => {
        cy.viewport(width, height);

        cy.injectAxe();
        cy.checkAccessibility();

        // Check ARIA attributes
        cy.get('.usa-search__input')
          .should('have.attr', 'role', 'searchbox')
          .should('have.attr', 'aria-describedby', 'search-hint');

        // Check keyboard navigation
        cy.get('.usa-search__input').focus().should('have.focus');
        cy.get('.usa-search__input').tab();
        cy.focused().should('have.class', 'usa-search__submit');
      });
    });

    it('should handle search performance at different screen sizes', () => {
      cy.mount(`
        <usa-search
          id="performance-search"
          show-suggestions
          show-filters
          voice-search
          track-analytics>
        </usa-search>
      `);

      cy.window().then((win) => {
        const search = win.document.getElementById('performance-search') as any;
        // Large dataset to test performance
        search.suggestions = Array.from({ length: 100 }, (_, i) => `government service ${i + 1}`);
        search.filters = [
          {
            key: 'perf1',
            label: 'Performance Filter 1',
            options: Array.from({ length: 50 }, (_, i) => `Option ${i + 1}`),
          },
        ];
      });

      const viewports = [
        [375, 667], // Mobile
        [768, 1024], // Tablet
        [1200, 800], // Desktop
      ];

      viewports.forEach(([width, height]) => {
        cy.viewport(width, height);

        const startTime = performance.now();

        cy.get('.usa-search__input').clear().type('government');
        cy.get('.usa-search__suggestions').should('be.visible');

        // Should render within reasonable time
        cy.then(() => {
          const endTime = performance.now();
          expect(endTime - startTime).to.be.lessThan(1000); // Less than 1 second
        });
      });
    });
  });
});
