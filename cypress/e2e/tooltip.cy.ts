// cypress/e2e/tooltip.cy.ts
describe('USWDS Tooltip E2E Tests', () => {
  beforeEach(() => {
    cy.selectStory('components-tooltip', 'default');
    cy.wait(1000); // Wait for story to load and USWDS to transform
    cy.injectAxe();
  });

  it('should display tooltip on hover', () => {
    // After USWDS transformation, button is inside usa-tooltip
    cy.get('usa-tooltip button').first().trigger('mouseover');
    cy.get('.usa-tooltip__body').should('be.visible');
    cy.get('.usa-tooltip__body').should('contain.text', 'helpful tooltip');
  });

  it('should display tooltip on focus', () => {
    cy.get('usa-tooltip button').first().focus();
    cy.get('.usa-tooltip__body').should('be.visible');
    cy.get('.usa-tooltip__body').should('contain.text', 'helpful tooltip');
  });

  it('should hide tooltip on blur', () => {
    cy.get('usa-tooltip button').first().focus();
    cy.get('.usa-tooltip__body').should('be.visible');
    cy.get('usa-tooltip button').first().blur();
    cy.get('.usa-tooltip__body').should('not.be.visible');
  });

  it('should hide tooltip on escape key', () => {
    cy.get('usa-tooltip button').first().focus();
    cy.get('.usa-tooltip__body').should('be.visible');
    cy.get('body').type('{esc}');
    cy.get('.usa-tooltip__body').should('not.be.visible');
  });

  it('should position tooltip correctly', () => {
    // Test different position stories
    cy.selectStory('components-tooltip', 'top-position');
    cy.wait(1000);
    cy.get('usa-tooltip button').trigger('mouseover');
    cy.get('.usa-tooltip__body--top').should('exist');

    cy.selectStory('components-tooltip', 'bottom-position');
    cy.wait(1000);
    cy.get('usa-tooltip button').trigger('mouseover');
    cy.get('.usa-tooltip__body--bottom').should('exist');

    cy.selectStory('components-tooltip', 'left-position');
    cy.wait(1000);
    cy.get('usa-tooltip button').trigger('mouseover');
    cy.get('.usa-tooltip__body--left').should('exist');

    cy.selectStory('components-tooltip', 'right-position');
    cy.wait(1000);
    cy.get('usa-tooltip button').trigger('mouseover');
    cy.get('.usa-tooltip__body--right').should('exist');
  });

  it('should meet accessibility standards', () => {
    cy.checkAccessibility();

    // Test ARIA attributes after USWDS transformation
    cy.get('usa-tooltip button').first().should('have.attr', 'aria-describedby');
    cy.get('.usa-tooltip__body').should('have.attr', 'role', 'tooltip');
    cy.get('.usa-tooltip__body').should('have.attr', 'aria-hidden', 'true');

    // Test tooltip shows and ARIA updates
    cy.get('usa-tooltip button').first().focus();
    cy.get('.usa-tooltip__body').should('have.attr', 'aria-hidden', 'false');
  });

  it('should handle keyboard navigation', () => {
    cy.get('body').tab();
    cy.focused().should('match', 'button');
    cy.get('.usa-tooltip__body').should('be.visible');
  });

  it('should dispatch custom events', () => {
    cy.window().then((win) => {
      const events: any[] = [];
      win.addEventListener('tooltip-show', (e) => events.push(e));
      win.addEventListener('tooltip-hide', (e) => events.push(e));

      cy.get('usa-tooltip button').first().trigger('mouseover').then(() => {
        expect(events).to.have.length(1);
        expect(events[0].type).to.equal('tooltip-show');
      });

      cy.get('usa-tooltip button').first().trigger('mouseleave').then(() => {
        expect(events).to.have.length(2);
        expect(events[1].type).to.equal('tooltip-hide');
      });
    });
  });

  it('should support visual regression testing', () => {
    // Test different tooltip positions using their stories
    const positions = [
      ['top-position', 'top'],
      ['bottom-position', 'bottom'],
      ['left-position', 'left'],
      ['right-position', 'right']
    ];

    positions.forEach(([story, position]) => {
      cy.selectStory('components-tooltip', story);
      cy.wait(1000);
      cy.get('usa-tooltip button').trigger('mouseover');
      cy.visualTest(`tooltip-${position}`);
      cy.get('usa-tooltip button').trigger('mouseleave');
    });
  });
});