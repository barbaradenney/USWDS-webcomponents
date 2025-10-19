// Component tests for usa-card
import './index.ts';

describe('USA Card Component Tests', () => {
  it('should render card with default properties', () => {
    cy.mount(`<usa-card id="test-card"></usa-card>`);
    
    cy.get('usa-card').should('exist');
    cy.get('.usa-card__container').should('exist');
    cy.get('usa-card').should('have.class', 'usa-card');
  });

  it('should render heading with correct level', () => {
    cy.mount(`
      <usa-card 
        id="test-card" 
        heading="Test Card Title"
        heading-level="2">
      </usa-card>
    `);
    
    cy.get('.usa-card__header').should('exist');
    cy.get('.usa-card__heading').should('contain.text', 'Test Card Title');
    cy.get('h2.usa-card__heading').should('exist');
  });

  it('should render body text', () => {
    cy.mount(`
      <usa-card 
        id="test-card" 
        text="This is the card body text content.">
      </usa-card>
    `);
    
    cy.get('.usa-card__body').should('exist');
    cy.get('.usa-card__body p').should('contain.text', 'This is the card body text content.');
  });

  it('should render footer text', () => {
    cy.mount(`
      <usa-card 
        id="test-card" 
        footer-text="Card footer information">
      </usa-card>
    `);
    
    cy.get('.usa-card__footer').should('exist');
    cy.get('.usa-card__footer p').should('contain.text', 'Card footer information');
  });

  it('should render complete card with all content', () => {
    cy.mount(`
      <usa-card 
        id="test-card" 
        heading="Complete Card"
        text="This card has all content types."
        footer-text="Footer information"
        heading-level="1">
      </usa-card>
    `);
    
    cy.get('h1.usa-card__heading').should('contain.text', 'Complete Card');
    cy.get('.usa-card__body p').should('contain.text', 'This card has all content types.');
    cy.get('.usa-card__footer p').should('contain.text', 'Footer information');
  });

  it('should render image media', () => {
    cy.mount(`
      <usa-card 
        id="test-card" 
        media-type="image"
        media-src="/img/test-image.jpg"
        media-alt="Test image description">
      </usa-card>
    `);
    
    cy.get('.usa-card__media').should('exist');
    cy.get('.usa-card__img').should('exist');
    cy.get('.usa-card__img img')
      .should('have.attr', 'src', '/img/test-image.jpg')
      .should('have.attr', 'alt', 'Test image description')
      .should('have.attr', 'loading', 'lazy');
  });

  it('should render video media', () => {
    cy.mount(`
      <usa-card 
        id="test-card" 
        media-type="video"
        media-src="/videos/test-video.mp4"
        media-alt="Test video description">
      </usa-card>
    `);
    
    cy.get('.usa-card__media').should('exist');
    cy.get('.usa-card__video').should('exist');
    cy.get('.usa-card__video video')
      .should('have.attr', 'src', '/videos/test-video.mp4')
      .should('have.attr', 'controls')
      .should('have.attr', 'aria-label', 'Test video description');
  });

  it('should handle different media positions', () => {
    const positions = ['inset', 'exdent', 'right'];
    
    positions.forEach(position => {
      cy.mount(`
        <usa-card 
          id="test-card" 
          media-type="image"
          media-src="/img/test.jpg"
          media-position="${position}"
          heading="Media Position Test">
        </usa-card>
      `);
      
      if (position === 'right') {
        cy.get('usa-card').should('have.class', 'usa-card--media-right');
      } else {
        cy.get('.usa-card__media').should('have.class', `usa-card__media--${position}`);
      }
    });
  });

  it('should handle flag layout', () => {
    cy.mount(`
      <usa-card 
        id="test-card" 
        heading="Flag Layout Card"
        text="This card uses flag layout."
        flag-layout>
      </usa-card>
    `);
    
    cy.get('usa-card').should('have.class', 'usa-card--flag');
  });

  it('should handle header-first layout', () => {
    cy.mount(`
      <usa-card 
        id="test-card" 
        heading="Header First Card"
        text="Header appears first."
        media-type="image"
        media-src="/img/test.jpg"
        header-first>
      </usa-card>
    `);
    
    cy.get('usa-card').should('have.class', 'usa-card--header-first');
    
    // Verify order: header should come before media
    cy.get('.usa-card__container').children().first().should('have.class', 'usa-card__header');
  });

  it('should handle actionable cards', () => {
    cy.mount(`
      <usa-card 
        id="test-card" 
        heading="Actionable Card"
        text="This card is clickable."
        actionable
        href="/test-page">
      </usa-card>
    `);
    
    cy.get('usa-card')
      .should('have.attr', 'role', 'button')
      .should('have.attr', 'tabindex', '0');
    cy.get('.usa-card__container').should('have.class', 'usa-card__container--actionable');
  });

  it('should emit card-click events when clicked', () => {
    cy.mount(`
      <usa-card 
        id="test-card" 
        heading="Clickable Card"
        actionable
        href="/clicked-page">
      </usa-card>
    `);
    
    cy.window().then((win) => {
      const card = win.document.getElementById('test-card') as any;
      const clickSpy = cy.stub();
      card.addEventListener('card-click', clickSpy);
      
      // Stub window navigation for testing
      cy.stub(win, 'location').value({ href: '' });
      
      cy.get('usa-card').click();
      
      cy.then(() => {
        expect(clickSpy).to.have.been.calledWith(
          Cypress.sinon.match({
            detail: Cypress.sinon.match({
              heading: 'Clickable Card',
              href: '/clicked-page'
            })
          })
        );
      });
    });
  });

  it('should handle keyboard interaction on actionable cards', () => {
    cy.mount(`
      <usa-card 
        id="test-card" 
        heading="Keyboard Card"
        actionable>
      </usa-card>
    `);
    
    cy.window().then((win) => {
      const card = win.document.getElementById('test-card') as any;
      const clickSpy = cy.stub();
      card.addEventListener('card-click', clickSpy);
      
      // Test Enter key
      cy.get('usa-card').focus().type('{enter}');
      
      cy.then(() => {
        expect(clickSpy).to.have.been.called;
      });
      
      // Test Space key
      cy.get('usa-card').focus().type(' ');
      
      cy.then(() => {
        expect(clickSpy).to.have.been.calledTwice;
      });
    });
  });

  it('should handle target="_blank" for actionable cards', () => {
    cy.mount(`
      <usa-card 
        id="test-card" 
        heading="External Link Card"
        actionable
        href="https://example.com"
        target="_blank">
      </usa-card>
    `);
    
    cy.window().then((win) => {
      // Stub window.open for testing
      cy.stub(win, 'open').as('windowOpen');
      
      cy.get('usa-card').click();
      
      cy.get('@windowOpen').should('have.been.calledWith', 'https://example.com', '_blank');
    });
  });

  it('should handle custom slotted content', () => {
    cy.mount(`
      <usa-card id="test-card" heading="Custom Content Card">
        <div slot="body">
          <p>Custom body content with <strong>HTML</strong>.</p>
          <button type="button">Custom Button</button>
        </div>
        <div slot="footer">
          <p>Custom footer with <a href="/link">links</a>.</p>
        </div>
      </usa-card>
    `);
    
    cy.get('.usa-card__body').should('contain.text', 'Custom body content with HTML');
    cy.get('.usa-card__body button').should('contain.text', 'Custom Button');
    cy.get('.usa-card__footer').should('contain.text', 'Custom footer with links');
    cy.get('.usa-card__footer a').should('have.attr', 'href', '/link');
  });

  it('should handle completely custom content with default slot', () => {
    cy.mount(`
      <usa-card id="test-card">
        <div class="custom-card-content">
          <h2>Completely Custom Card</h2>
          <p>This content is not using the standard card structure.</p>
        </div>
      </usa-card>
    `);
    
    cy.get('.custom-card-content').should('exist');
    cy.get('.custom-card-content h2').should('contain.text', 'Completely Custom Card');
  });

  it('should handle media-right with non-flag layout', () => {
    cy.mount(`
      <usa-card 
        id="test-card" 
        heading="Media Right Card"
        text="Media appears on the right side."
        media-type="image"
        media-src="/img/right-image.jpg"
        media-position="right">
      </usa-card>
    `);
    
    cy.get('usa-card').should('have.class', 'usa-card--media-right');
    cy.get('usa-card').should('not.have.class', 'usa-card--flag');
  });

  it('should handle flag layout with media right', () => {
    cy.mount(`
      <usa-card 
        id="test-card" 
        heading="Flag Media Right"
        text="Flag layout with right media."
        media-type="image"
        media-src="/img/flag-right.jpg"
        media-position="right"
        flag-layout>
      </usa-card>
    `);
    
    cy.get('usa-card')
      .should('have.class', 'usa-card--flag')
      .should('have.class', 'usa-card--media-right');
  });

  it('should handle different heading levels', () => {
    const levels = ['1', '2', '3', '4', '5', '6'];
    
    levels.forEach(level => {
      cy.mount(`
        <usa-card 
          id="test-card" 
          heading="Heading Level ${level}"
          heading-level="${level}">
        </usa-card>
      `);
      
      cy.get(`h${level}.usa-card__heading`).should('contain.text', `Heading Level ${level}`);
    });
  });

  it('should not render sections without content', () => {
    cy.mount(`<usa-card id="test-card"></usa-card>`);
    
    // Should not render header, body, or footer when empty
    cy.get('.usa-card__header').should('not.exist');
    cy.get('.usa-card__body').should('not.exist');
    cy.get('.usa-card__footer').should('not.exist');
    cy.get('.usa-card__media').should('not.exist');
  });

  it('should update classes when properties change', () => {
    cy.mount(`<usa-card id="test-card" heading="Dynamic Card"></usa-card>`);
    
    cy.window().then((win) => {
      const card = win.document.getElementById('test-card') as any;
      
      // Initially not flag layout
      cy.get('usa-card').should('not.have.class', 'usa-card--flag');
      
      // Change to flag layout
      card.flagLayout = true;
      cy.get('usa-card').should('have.class', 'usa-card--flag');
      
      // Change to actionable
      card.actionable = true;
      cy.get('usa-card').should('have.attr', 'role', 'button');
      cy.get('.usa-card__container').should('have.class', 'usa-card__container--actionable');
      
      // Change to header first
      card.headerFirst = true;
      cy.get('usa-card').should('have.class', 'usa-card--header-first');
    });
  });

  it('should handle complex card with all features', () => {
    cy.mount(`
      <usa-card 
        id="complex-card" 
        heading="Complex Government Service Card"
        text="This card demonstrates all available features and options."
        footer-text="Updated: March 2024"
        media-type="image"
        media-src="/img/service-image.jpg"
        media-alt="Government service illustration"
        media-position="inset"
        heading-level="2"
        actionable
        href="/services/detailed"
        flag-layout>
        <div slot="body">
          <p>Additional custom content can be added via slots.</p>
          <ul>
            <li>Online applications available</li>
            <li>24/7 customer support</li>
            <li>Multi-language assistance</li>
          </ul>
        </div>
      </usa-card>
    `);
    
    // Verify all elements are rendered correctly
    cy.get('usa-card').should('have.class', 'usa-card--flag');
    cy.get('usa-card').should('have.attr', 'role', 'button');
    cy.get('h2.usa-card__heading').should('contain.text', 'Complex Government Service Card');
    cy.get('.usa-card__media--inset').should('exist');
    cy.get('.usa-card__body').should('contain.text', 'This card demonstrates all available features');
    cy.get('.usa-card__body ul').should('exist');
    cy.get('.usa-card__footer').should('contain.text', 'Updated: March 2024');
  });

  it('should handle accessibility correctly', () => {
    cy.mount(`
      <usa-card 
        id="accessible-card" 
        heading="Accessible Card"
        text="This card follows accessibility best practices."
        media-type="image"
        media-src="/img/accessible.jpg"
        media-alt="Descriptive alternative text for screen readers"
        actionable
        href="/accessible-page">
      </usa-card>
    `);
    
    // Check actionable accessibility
    cy.get('usa-card')
      .should('have.attr', 'role', 'button')
      .should('have.attr', 'tabindex', '0');
    
    // Check image accessibility
    cy.get('.usa-card__img img')
      .should('have.attr', 'alt', 'Descriptive alternative text for screen readers');
    
    // Check keyboard navigation
    cy.get('usa-card').focus();
    cy.focused().should('be.visible');
  });

  it('should handle focus and hover states', () => {
    cy.mount(`
      <usa-card 
        id="interactive-card" 
        heading="Interactive Card"
        text="This card responds to user interaction."
        actionable>
      </usa-card>
    `);
    
    // Test focus
    cy.get('usa-card').focus();
    cy.focused().should('have.class', 'usa-card');
    
    // Test hover (trigger hover event)
    cy.get('usa-card').trigger('mouseover');
    cy.get('usa-card').should('be.visible');
  });

  it('should cleanup event listeners on disconnect', () => {
    cy.mount(`
      <div id="card-container">
        <usa-card 
          id="cleanup-card" 
          heading="Cleanup Test"
          actionable>
        </usa-card>
      </div>
    `);
    
    cy.window().then((win) => {

      // Verify card is interactive
      cy.get('usa-card').should('have.attr', 'role', 'button');
      
      // Remove card from DOM
      container!.removeChild(card);
      
      // Should not cause errors when removed
      cy.get('body').click();
    });
  });

  it('should handle non-actionable cards correctly', () => {
    cy.mount(`
      <usa-card 
        id="static-card" 
        heading="Static Card"
        text="This card is not actionable.">
      </usa-card>
    `);
    
    cy.get('usa-card')
      .should('not.have.attr', 'role')
      .should('not.have.attr', 'tabindex');
    cy.get('.usa-card__container').should('not.have.class', 'usa-card__container--actionable');
    
    // Click should not emit events
    cy.window().then((win) => {
      const card = win.document.getElementById('static-card') as any;
      const clickSpy = cy.stub();
      card.addEventListener('card-click', clickSpy);
      
      cy.get('usa-card').click();
      
      cy.then(() => {
        expect(clickSpy).not.to.have.been.called;
      });
    });
  });

  it('should handle responsive behavior', () => {
    cy.mount(`
      <usa-card 
        id="responsive-card" 
        heading="Responsive Card"
        text="This card adapts to different screen sizes."
        media-type="image"
        media-src="/img/responsive.jpg"
        media-position="right"
        flag-layout>
      </usa-card>
    `);
    
    // Set mobile viewport
    cy.viewport(375, 667);
    
    cy.get('.usa-card').should('be.visible');
    cy.get('.usa-card__heading').should('be.visible');
    cy.get('.usa-card__body').should('be.visible');
    cy.get('.usa-card__media').should('be.visible');
    
    // Set desktop viewport
    cy.viewport(1200, 800);
    
    cy.get('.usa-card').should('be.visible');
    cy.get('usa-card').should('have.class', 'usa-card--flag');
    cy.get('usa-card').should('have.class', 'usa-card--media-right');
  });

  it('should be accessible', () => {
    cy.mount(`
      <div>
        <h1>Government Services</h1>
        <div class="usa-card-group">
          <usa-card 
            id="service-card-1" 
            heading="Online Applications"
            text="Apply for government services online through our secure portal."
            media-type="image"
            media-src="/img/online-services.jpg"
            media-alt="Person using computer for online government services"
            actionable
            href="/services/online">
          </usa-card>
          <usa-card 
            id="service-card-2" 
            heading="In-Person Assistance"
            text="Visit our offices for personalized help with your applications."
            footer-text="Office hours: Mon-Fri 9AM-5PM"
            media-type="image"
            media-src="/img/office-help.jpg"
            media-alt="Government office worker helping a citizen">
          </usa-card>
        </div>
      </div>
    `);
    
    cy.injectAxe();
    cy.checkAccessibility();
  });

  it('should handle custom CSS classes', () => {
    cy.mount(`
      <usa-card 
        id="custom-card" 
        heading="Custom Styled Card"
        class="custom-card-class special-styling">
      </usa-card>
    `);
    
    cy.get('usa-card')
      .should('have.class', 'custom-card-class')
      .should('have.class', 'special-styling')
      .should('have.class', 'usa-card');
  });
});