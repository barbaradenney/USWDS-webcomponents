// Component tests for usa-select
import './index.ts';

describe('USA Select Component Tests', () => {
  const basicOptions = [
    { value: '', label: 'Select an option' },
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  const stateOptions = [
    { value: '', label: 'Select a state' },
    { value: 'AL', label: 'Alabama' },
    { value: 'CA', label: 'California' },
    { value: 'FL', label: 'Florida' },
    { value: 'NY', label: 'New York' },
    { value: 'TX', label: 'Texas' },
  ];

  it('should render select with default properties', () => {
    cy.mount(`<usa-select id="test-select"></usa-select>`);
    cy.get('usa-select').should('exist');
    cy.get('usa-select select').should('have.class', 'usa-select');
  });

  it('should render options when provided', () => {
    cy.mount(`<usa-select id="test-select"></usa-select>`);

    cy.window().then((win) => {
      const select = win.document.getElementById('test-select') as any;
      select.options = basicOptions;
    });

    cy.get('select option').should('have.length', 4);
    cy.get('select option').first().should('contain.text', 'Select an option');
    cy.get('select option').last().should('contain.text', 'Option 3');
  });

  it('should handle option selection', () => {
    cy.mount(`<usa-select id="test-select"></usa-select>`);

    cy.window().then((win) => {
      const select = win.document.getElementById('test-select') as any;
      select.options = stateOptions;
    });

    // Select California
    cy.get('select').select('CA');
    cy.get('select').should('have.value', 'CA');

    // Select Florida
    cy.get('select').select('FL');
    cy.get('select').should('have.value', 'FL');
  });

  it('should emit change events', () => {
    cy.mount(`<usa-select id="test-select"></usa-select>`);

    cy.window().then((win) => {
      const select = win.document.getElementById('test-select') as any;
      select.options = stateOptions;

      const changeSpy = cy.stub();
      select.addEventListener('change', changeSpy);

      cy.get('select').select('NY');
      cy.then(() => {
        expect(changeSpy).to.have.been.called;
      });
    });
  });

  it('should handle disabled state', () => {
    cy.mount(`<usa-select id="test-select" disabled></usa-select>`);

    cy.window().then((win) => {
      const select = win.document.getElementById('test-select') as any;
      select.options = basicOptions;
    });

    cy.get('select').should('be.disabled');
    cy.get('select').should('have.class', 'usa-select--disabled');
  });

  it('should handle required state', () => {
    cy.mount(`<usa-select id="test-select" required></usa-select>`);

    cy.window().then((win) => {
      const select = win.document.getElementById('test-select') as any;
      select.options = stateOptions;
    });

    cy.get('select').should('have.attr', 'required');
    cy.get('select').should('have.attr', 'aria-required', 'true');
  });

  it('should handle error state', () => {
    cy.mount(`
      <usa-select 
        id="test-select" 
        error
        error-message="Please select a valid state">
      </usa-select>
    `);

    cy.window().then((win) => {
      const select = win.document.getElementById('test-select') as any;
      select.options = stateOptions;
    });

    cy.get('select').should('have.class', 'usa-select--error');
    cy.get('select').should('have.attr', 'aria-invalid', 'true');
    cy.get('.usa-error-message').should('contain.text', 'Please select a valid state');
  });

  it('should handle success state', () => {
    cy.mount(`<usa-select id="test-select" success></usa-select>`);

    cy.window().then((win) => {
      const select = win.document.getElementById('test-select') as any;
      select.options = stateOptions;
      select.value = 'CA';
    });

    cy.get('select').should('have.class', 'usa-select--success');
  });

  it('should handle small size variant', () => {
    cy.mount(`<usa-select id="test-select" size="small"></usa-select>`);

    cy.window().then((win) => {
      const select = win.document.getElementById('test-select') as any;
      select.options = basicOptions;
    });

    cy.get('select').should('have.class', 'usa-select--small');
  });

  it('should handle large size variant', () => {
    cy.mount(`<usa-select id="test-select" size="large"></usa-select>`);

    cy.window().then((win) => {
      const select = win.document.getElementById('test-select') as any;
      select.options = basicOptions;
    });

    cy.get('select').should('have.class', 'usa-select--large');
  });

  it('should handle multiple selection', () => {
    const colorOptions = [
      { value: '', label: 'Select colors' },
      { value: 'red', label: 'Red' },
      { value: 'blue', label: 'Blue' },
      { value: 'green', label: 'Green' },
    ];

    cy.mount(`<usa-select id="test-select" multiple></usa-select>`);

    cy.window().then((win) => {
      const select = win.document.getElementById('test-select') as any;
      select.options = colorOptions;
    });

    cy.get('select').should('have.attr', 'multiple');

    // Select multiple options (Cypress handles this automatically for multi-select)
    cy.get('select').select(['red', 'blue']);
    cy.get('select').should('have.value', 'red'); // First selected value
  });

  it('should handle option groups', () => {
    const groupedOptions = [
      { value: '', label: 'Select a location' },
      {
        optgroup: 'West Coast',
        options: [
          { value: 'ca', label: 'California' },
          { value: 'or', label: 'Oregon' },
        ],
      },
      {
        optgroup: 'East Coast',
        options: [
          { value: 'ny', label: 'New York' },
          { value: 'fl', label: 'Florida' },
        ],
      },
    ];

    cy.mount(`<usa-select id="test-select"></usa-select>`);

    cy.window().then((win) => {
      const select = win.document.getElementById('test-select') as any;
      select.options = groupedOptions;
    });

    cy.get('optgroup').should('have.length', 2);
    cy.get('optgroup').first().should('have.attr', 'label', 'West Coast');
    cy.get('optgroup').last().should('have.attr', 'label', 'East Coast');
  });

  it('should handle disabled options', () => {
    const planOptions = [
      { value: '', label: 'Select a plan' },
      { value: 'basic', label: 'Basic Plan' },
      { value: 'premium', label: 'Premium Plan', disabled: true },
      { value: 'enterprise', label: 'Enterprise Plan' },
    ];

    cy.mount(`<usa-select id="test-select"></usa-select>`);

    cy.window().then((win) => {
      const select = win.document.getElementById('test-select') as any;
      select.options = planOptions;
    });

    cy.get('option[value="premium"]').should('have.attr', 'disabled');
  });

  it('should be keyboard accessible', () => {
    cy.mount(`<usa-select id="test-select"></usa-select>`);

    cy.window().then((win) => {
      const select = win.document.getElementById('test-select') as any;
      select.options = stateOptions;
    });

    // Tab to select
    cy.get('select').focus();
    cy.focused().should('have.attr', 'id', 'test-select');

    // Arrow down to navigate options (browser behavior)
    cy.focused().type('{downarrow}');

    // Space or Enter to open dropdown (browser behavior)
    cy.focused().type(' ');
  });

  it('should handle search/type-ahead functionality', () => {
    cy.mount(`<usa-select id="test-select"></usa-select>`);

    cy.window().then((win) => {
      const select = win.document.getElementById('test-select') as any;
      select.options = stateOptions;
    });

    // Focus and type to find option starting with 'C'
    cy.get('select').focus();
    cy.focused().type('c'); // Should select California
    cy.get('select').should('have.value', 'CA');

    // Type 'f' to find Florida
    cy.focused().type('f');
    cy.get('select').should('have.value', 'FL');
  });

  it('should handle form integration', () => {
    cy.mount(`
      <form id="test-form">
        <usa-select id="test-select" name="user-state" required></usa-select>
        <button type="submit">Submit</button>
      </form>
    `);

    cy.window().then((win) => {
      const select = win.document.getElementById('test-select') as any;
      select.options = stateOptions;

      const form = win.document.getElementById('test-form') as HTMLFormElement;
      const submitSpy = cy.stub();
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        submitSpy(formData.get('user-state'));
      });

      // Select an option and submit
      cy.get('select').select('TX');
      cy.get('button[type="submit"]').click();

      cy.then(() => {
        expect(submitSpy).to.have.been.calledWith('TX');
      });
    });
  });

  it('should handle custom option rendering', () => {
    const priorityOptions = [
      { value: '', label: 'Select priority' },
      { value: 'low', label: '🟢 Low Priority' },
      { value: 'medium', label: '🟡 Medium Priority' },
      { value: 'high', label: '🔴 High Priority' },
    ];

    cy.mount(`<usa-select id="test-select"></usa-select>`);

    cy.window().then((win) => {
      const select = win.document.getElementById('test-select') as any;
      select.options = priorityOptions;
    });

    cy.get('option[value="low"]').should('contain.text', '🟢 Low Priority');
    cy.get('option[value="high"]').should('contain.text', '🔴 High Priority');
  });

  it('should handle aria attributes', () => {
    cy.mount(`
      <div>
        <label id="select-label">State of Residence</label>
        <span id="select-hint">Choose the state where you currently live</span>
        <usa-select 
          id="test-select"
          aria-labelledby="select-label"
          aria-describedby="select-hint">
        </usa-select>
      </div>
    `);

    cy.window().then((win) => {
      const select = win.document.getElementById('test-select') as any;
      select.options = stateOptions;
    });

    cy.get('select')
      .should('have.attr', 'aria-labelledby', 'select-label')
      .should('have.attr', 'aria-describedby', 'select-hint');
  });

  it('should handle focus and blur events', () => {
    cy.mount(`<usa-select id="test-select"></usa-select>`);

    cy.window().then((win) => {
      const select = win.document.getElementById('test-select') as any;
      select.options = basicOptions;

      const focusSpy = cy.stub();
      const blurSpy = cy.stub();
      select.addEventListener('focus', focusSpy);
      select.addEventListener('blur', blurSpy);

      cy.get('select').focus();
      cy.get('select').blur();

      cy.then(() => {
        expect(focusSpy).to.have.been.called;
        expect(blurSpy).to.have.been.called;
      });
    });
  });

  it('should handle validation on blur', () => {
    cy.mount(`<usa-select id="test-select" required validate-on-blur></usa-select>`);

    cy.window().then((win) => {
      const select = win.document.getElementById('test-select') as any;
      select.options = stateOptions;
    });

    // Focus and blur without selecting (should trigger validation)
    cy.get('select').focus().blur();
    cy.get('select').should('have.attr', 'aria-invalid', 'true');

    // Select an option and blur (should clear validation)
    cy.get('select').select('CA').blur();
    cy.get('select').should('not.have.attr', 'aria-invalid', 'true');
  });

  it('should be accessible', () => {
    cy.mount(`
      <form>
        <label for="state-select">State</label>
        <usa-select 
          id="state-select"
          name="state"
          required
          aria-describedby="state-hint">
        </usa-select>
        <div id="state-hint">Select your state of residence</div>
      </form>
    `);

    cy.window().then((win) => {
      const select = win.document.getElementById('state-select') as any;
      select.options = stateOptions;
    });

    cy.injectAxe();
    cy.checkAccessibility();
  });

  it('should handle custom CSS classes', () => {
    cy.mount(`<usa-select id="test-select" class="custom-select-class"></usa-select>`);

    cy.window().then((win) => {
      const select = win.document.getElementById('test-select') as any;
      select.options = basicOptions;
    });

    cy.get('usa-select').should('have.class', 'custom-select-class');
    cy.get('select').should('have.class', 'usa-select');
  });

  it('should handle dynamic option updates', () => {
    cy.mount(`<usa-select id="test-select"></usa-select>`);

    cy.window().then((win) => {
      const select = win.document.getElementById('test-select') as any;

      // Initial options
      select.options = basicOptions;
      cy.get('select option').should('have.length', 4);

      // Update options
      select.options = stateOptions;
      cy.get('select option').should('have.length', 6);
    });
  });

  it('should handle placeholder option correctly', () => {
    cy.mount(`<usa-select id="test-select" placeholder="Choose an option"></usa-select>`);

    cy.window().then((win) => {
      const select = win.document.getElementById('test-select') as any;
      select.options = basicOptions.slice(1); // Remove empty option since placeholder handles it
    });

    cy.get('select option').first().should('contain.text', 'Choose an option');
    cy.get('select option').first().should('have.attr', 'value', '');
    cy.get('select option').first().should('be.disabled');
  });

  // Responsive Layout Tests
  describe('Mobile Responsive Behavior', () => {
    beforeEach(() => {
      cy.viewport(375, 667); // iPhone SE
    });

    it('should display properly on mobile with touch targets', () => {
      cy.mount(`
        <div class="usa-form-group">
          <label class="usa-label" for="mobile-select">State</label>
          <usa-select id="mobile-select" name="state"></usa-select>
        </div>
      `);

      cy.window().then((win) => {
        const select = win.document.getElementById('mobile-select') as any;
        select.options = stateOptions;
      });

      // Select should be at least 44px high for touch targets
      cy.get('select')
        .should('be.visible')
        .and(($select) => {
          const height = $select.outerHeight();
          expect(height).to.be.at.least(44);
        });
    });

    it('should handle mobile form layout', () => {
      cy.mount(`
        <form class="usa-form">
          <div class="usa-form-group">
            <label class="usa-label" for="mobile-state">State</label>
            <usa-select id="mobile-state" name="state" required></usa-select>
          </div>
          <div class="usa-form-group">
            <label class="usa-label" for="mobile-city">City</label>
            <usa-select id="mobile-city" name="city"></usa-select>
          </div>
        </form>
      `);

      cy.window().then((win) => {
        const stateSelect = win.document.getElementById('mobile-state') as any;
        const citySelect = win.document.getElementById('mobile-city') as any;
        stateSelect.options = stateOptions;
        citySelect.options = [
          { value: '', label: 'Select a city' },
          { value: 'nyc', label: 'New York City' },
          { value: 'la', label: 'Los Angeles' },
        ];
      });

      // Form should stack vertically on mobile
      cy.get('.usa-form-group').should('have.length', 2);
      cy.get('.usa-form-group').each(($group) => {
        cy.wrap($group)
          .should('have.css', 'width')
          .and('match', /375px|100%/);
      });
    });

    it('should handle touch interactions properly', () => {
      cy.mount(`<usa-select id="touch-select"></usa-select>`);

      cy.window().then((win) => {
        const select = win.document.getElementById('touch-select') as any;
        select.options = stateOptions;
      });

      // Touch events should work on mobile
      cy.get('select').trigger('touchstart').trigger('touchend').should('be.focused');
    });

    it('should handle mobile error states', () => {
      cy.mount(`
        <div class="usa-form-group usa-form-group--error">
          <label class="usa-label usa-label--error" for="error-select">State</label>
          <usa-select id="error-select" error error-message="Please select a state"></usa-select>
        </div>
      `);

      cy.window().then((win) => {
        const select = win.document.getElementById('error-select') as any;
        select.options = stateOptions;
      });

      cy.get('.usa-error-message').should('be.visible');
      cy.get('select').should('have.class', 'usa-select--error');
    });

    it('should handle mobile success states', () => {
      cy.mount(`
        <div class="usa-form-group">
          <label class="usa-label" for="success-select">State</label>
          <usa-select id="success-select" success></usa-select>
        </div>
      `);

      cy.window().then((win) => {
        const select = win.document.getElementById('success-select') as any;
        select.options = stateOptions;
        select.value = 'CA';
      });

      cy.get('select').should('have.class', 'usa-select--success');
    });
  });

  describe('Tablet Responsive Behavior', () => {
    beforeEach(() => {
      cy.viewport(768, 1024); // iPad
    });

    it('should display form in two-column layout on tablet', () => {
      cy.mount(`
        <form class="usa-form usa-form--large">
          <div class="grid-row grid-gap">
            <div class="tablet:grid-col-6">
              <label class="usa-label" for="tablet-state">State</label>
              <usa-select id="tablet-state" name="state"></usa-select>
            </div>
            <div class="tablet:grid-col-6">
              <label class="usa-label" for="tablet-city">City</label>
              <usa-select id="tablet-city" name="city"></usa-select>
            </div>
          </div>
        </form>
      `);

      cy.window().then((win) => {
        const stateSelect = win.document.getElementById('tablet-state') as any;
        const citySelect = win.document.getElementById('tablet-city') as any;
        stateSelect.options = stateOptions;
        citySelect.options = [
          { value: '', label: 'Select a city' },
          { value: 'nyc', label: 'New York City' },
          { value: 'la', label: 'Los Angeles' },
        ];
      });

      // Check grid layout on tablet
      cy.get('.tablet\\:grid-col-6').should('have.length', 2);
      cy.get('.tablet\\:grid-col-6').each(($col) => {
        cy.wrap($col).should('have.css', 'width').and('not.equal', '768px');
      });
    });

    it('should handle tablet touch and hover states', () => {
      cy.mount(`<usa-select id="tablet-select"></usa-select>`);

      cy.window().then((win) => {
        const select = win.document.getElementById('tablet-select') as any;
        select.options = stateOptions;
      });

      // Should work with both touch and mouse
      cy.get('select').trigger('touchstart').trigger('touchend').should('be.focused');

      cy.get('select').trigger('mouseover').should('have.focus');
    });

    it('should handle tablet large size variant', () => {
      cy.mount(`<usa-select id="tablet-large" size="large"></usa-select>`);

      cy.window().then((win) => {
        const select = win.document.getElementById('tablet-large') as any;
        select.options = stateOptions;
      });

      cy.get('select').should('have.class', 'usa-select--large');
    });
  });

  describe('Desktop Responsive Behavior', () => {
    beforeEach(() => {
      cy.viewport(1200, 800); // Desktop
    });

    it('should display full desktop form layout', () => {
      cy.mount(`
        <form class="usa-form usa-form--large">
          <div class="grid-row grid-gap-lg">
            <div class="desktop:grid-col-4">
              <label class="usa-label" for="desktop-state">State</label>
              <usa-select id="desktop-state" name="state"></usa-select>
            </div>
            <div class="desktop:grid-col-4">
              <label class="usa-label" for="desktop-city">City</label>
              <usa-select id="desktop-city" name="city"></usa-select>
            </div>
            <div class="desktop:grid-col-4">
              <label class="usa-label" for="desktop-zip">ZIP Code</label>
              <usa-select id="desktop-zip" name="zip"></usa-select>
            </div>
          </div>
        </form>
      `);

      cy.window().then((win) => {
        const stateSelect = win.document.getElementById('desktop-state') as any;
        const citySelect = win.document.getElementById('desktop-city') as any;
        const zipSelect = win.document.getElementById('desktop-zip') as any;

        stateSelect.options = stateOptions;
        citySelect.options = [
          { value: '', label: 'Select a city' },
          { value: 'nyc', label: 'New York City' },
          { value: 'la', label: 'Los Angeles' },
        ];
        zipSelect.options = [
          { value: '', label: 'Select ZIP' },
          { value: '10001', label: '10001' },
          { value: '90210', label: '90210' },
        ];
      });

      // Check three-column layout on desktop
      cy.get('.desktop\\:grid-col-4').should('have.length', 3);
    });

    it('should handle keyboard navigation efficiently on desktop', () => {
      cy.mount(`
        <div>
          <usa-select id="first-select"></usa-select>
          <usa-select id="second-select"></usa-select>
          <usa-select id="third-select"></usa-select>
        </div>
      `);

      cy.window().then((win) => {
        const selects = ['first-select', 'second-select', 'third-select'];
        selects.forEach((id) => {
          const select = win.document.getElementById(id) as any;
          select.options = stateOptions;
        });
      });

      // Tab through selects
      cy.get('select').first().focus();
      cy.focused()
        .should('have.attr', 'id')
        .and('match', /first-select/);

      cy.focused().tab();
      cy.focused()
        .should('have.attr', 'id')
        .and('match', /second-select/);

      cy.focused().tab();
      cy.focused()
        .should('have.attr', 'id')
        .and('match', /third-select/);
    });

    it('should handle desktop hover states', () => {
      cy.mount(`<usa-select id="hover-select"></usa-select>`);

      cy.window().then((win) => {
        const select = win.document.getElementById('hover-select') as any;
        select.options = stateOptions;
      });

      cy.get('select').trigger('mouseover').should('have.css', 'cursor', 'pointer');
    });

    it('should handle desktop focus indicators', () => {
      cy.mount(`<usa-select id="focus-select"></usa-select>`);

      cy.window().then((win) => {
        const select = win.document.getElementById('focus-select') as any;
        select.options = stateOptions;
      });

      cy.get('select')
        .focus()
        .should('have.focus')
        .should('have.css', 'outline-width')
        .and('not.equal', '0px');
    });
  });

  describe('Large Desktop Responsive Behavior', () => {
    beforeEach(() => {
      cy.viewport(1440, 900); // Large Desktop
    });

    it('should maintain proper spacing on large screens', () => {
      cy.mount(`
        <div class="grid-container">
          <form class="usa-form usa-form--large">
            <div class="grid-row grid-gap-lg">
              <div class="desktop:grid-col-3">
                <label class="usa-label" for="large-state">State</label>
                <usa-select id="large-state" name="state"></usa-select>
              </div>
              <div class="desktop:grid-col-3">
                <label class="usa-label" for="large-city">City</label>
                <usa-select id="large-city" name="city"></usa-select>
              </div>
              <div class="desktop:grid-col-3">
                <label class="usa-label" for="large-zip">ZIP</label>
                <usa-select id="large-zip" name="zip"></usa-select>
              </div>
              <div class="desktop:grid-col-3">
                <label class="usa-label" for="large-country">Country</label>
                <usa-select id="large-country" name="country"></usa-select>
              </div>
            </div>
          </form>
        </div>
      `);

      cy.window().then((win) => {
        const selects = ['large-state', 'large-city', 'large-zip', 'large-country'];
        selects.forEach((id) => {
          const select = win.document.getElementById(id) as any;
          select.options = stateOptions;
        });
      });

      // Should have proper four-column layout
      cy.get('.desktop\\:grid-col-3').should('have.length', 4);

      // Container should be properly centered
      cy.get('.grid-container').should('have.css', 'max-width');
    });
  });

  describe('Responsive Edge Cases', () => {
    it('should handle viewport transitions smoothly', () => {
      cy.mount(`
        <div class="grid-row grid-gap">
          <div class="tablet:grid-col-6 desktop:grid-col-4">
            <usa-select id="transition-select"></usa-select>
          </div>
        </div>
      `);

      cy.window().then((win) => {
        const select = win.document.getElementById('transition-select') as any;
        select.options = stateOptions;
      });

      // Test mobile to tablet transition
      cy.viewport(375, 667);
      cy.get('usa-select').should('be.visible');

      cy.viewport(768, 1024);
      cy.get('usa-select').should('be.visible');

      cy.viewport(1200, 800);
      cy.get('usa-select').should('be.visible');
    });

    it('should handle long option text at different screen sizes', () => {
      const longOptions = [
        { value: '', label: 'Select a very long option name that might wrap' },
        { value: 'long1', label: 'This is a very long option name that might cause layout issues' },
        { value: 'long2', label: 'Another extremely long option text that could break layouts' },
      ];

      cy.mount(`<usa-select id="long-text-select"></usa-select>`);

      cy.window().then((win) => {
        const select = win.document.getElementById('long-text-select') as any;
        select.options = longOptions;
      });

      // Test at different viewports
      const viewports = [
        [320, 568], // Small mobile
        [768, 1024], // Tablet
        [1200, 800], // Desktop
      ];

      viewports.forEach(([width, height]) => {
        cy.viewport(width, height);
        cy.get('select').should('be.visible');

        // Should not cause horizontal overflow
        cy.get('select').then(($select) => {
          expect($select[0].scrollWidth).to.be.at.most($select[0].clientWidth + 5);
        });
      });
    });

    it('should handle dynamic content updates at different screen sizes', () => {
      cy.mount(`<usa-select id="dynamic-select"></usa-select>`);

      const scenarios = [
        { viewport: [375, 667], options: basicOptions },
        { viewport: [768, 1024], options: stateOptions },
        { viewport: [1200, 800], options: [...stateOptions, ...basicOptions] },
      ];

      scenarios.forEach(({ viewport, options }) => {
        cy.viewport(viewport[0], viewport[1]);

        cy.window().then((win) => {
          const select = win.document.getElementById('dynamic-select') as any;
          select.options = options;
        });

        cy.get('select option').should('have.length', options.length);
        cy.get('select').should('be.visible');
      });
    });

    it('should maintain accessibility at all screen sizes', () => {
      cy.mount(`
        <div>
          <label for="accessible-select">Accessible Select</label>
          <usa-select id="accessible-select" aria-describedby="select-hint"></usa-select>
          <div id="select-hint">This is a hint for the select</div>
        </div>
      `);

      cy.window().then((win) => {
        const select = win.document.getElementById('accessible-select') as any;
        select.options = stateOptions;
      });

      const viewports = [
        [375, 667], // Mobile
        [768, 1024], // Tablet
        [1200, 800], // Desktop
      ];

      viewports.forEach(([width, height]) => {
        cy.viewport(width, height);

        cy.injectAxe();
        cy.checkAccessibility();

        // Check focus indicators work at all sizes
        cy.get('select')
          .focus()
          .should('have.focus')
          .should('have.css', 'outline-width')
          .and('not.equal', '0px');
      });
    });
  });
});
