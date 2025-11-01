// Component tests for usa-footer
import './index.ts';

describe('USA Footer Component Tests', () => {
  it('should render footer with default properties', () => {
    cy.mount(`<usa-footer id="test-footer"></usa-footer>`);

    cy.get('usa-footer').should('exist');
    cy.get('.usa-footer').should('exist');
    cy.get('footer').should('have.attr', 'role', 'contentinfo');
  });

  it('should render medium variant by default', () => {
    cy.mount(`<usa-footer id="test-footer"></usa-footer>`);

    cy.get('.usa-footer').should('have.class', 'usa-footer--medium');
  });

  it('should handle different variants', () => {
    const variants = ['slim', 'medium', 'big'];

    variants.forEach((variant) => {
      cy.mount(`<usa-footer id="test-footer" variant="${variant}"></usa-footer>`);
      cy.get('.usa-footer').should('have.class', `usa-footer--${variant}`);
    });
  });

  it('should render footer sections', () => {
    cy.mount(`<usa-footer id="test-footer"></usa-footer>`);

    cy.window().then((win) => {
      const footer = win.document.getElementById('test-footer') as any;
      footer.sections = [
        {
          title: 'Services',
          links: [
            { label: 'Service 1', href: '/service1' },
            { label: 'Service 2', href: '/service2' },
          ],
        },
        {
          title: 'Resources',
          links: [
            { label: 'Documentation', href: '/docs' },
            { label: 'Support', href: '/support' },
          ],
        },
      ];
    });

    cy.get('.usa-footer__nav').should('exist');
    cy.get('.usa-footer__primary-content').should('have.length', 2);
    cy.get('.usa-footer__primary-link').should('contain.text', 'Services');
    cy.get('.usa-footer__primary-link').should('contain.text', 'Resources');
  });

  it('should render footer section links', () => {
    cy.mount(`<usa-footer id="test-footer"></usa-footer>`);

    cy.window().then((win) => {
      const footer = win.document.getElementById('test-footer') as any;
      footer.sections = [
        {
          title: 'Quick Links',
          links: [
            { label: 'About Us', href: '/about' },
            { label: 'Contact', href: '/contact' },
            { label: 'Privacy Policy', href: '/privacy' },
          ],
        },
      ];
    });

    cy.get('.usa-footer__secondary-link').should('have.length', 3);
    cy.get('.usa-footer__secondary-link a').should('contain.text', 'About Us');
    cy.get('.usa-footer__secondary-link a').should('contain.text', 'Contact');
    cy.get('.usa-footer__secondary-link a').should('contain.text', 'Privacy Policy');

    // Check href attributes
    cy.get('.usa-footer__secondary-link a[href="/about"]').should('exist');
    cy.get('.usa-footer__secondary-link a[href="/contact"]').should('exist');
    cy.get('.usa-footer__secondary-link a[href="/privacy"]').should('exist');
  });

  it('should handle footer link clicks', () => {
    cy.mount(`<usa-footer id="test-footer"></usa-footer>`);

    cy.window().then((win) => {
      const footer = win.document.getElementById('test-footer') as any;
      footer.sections = [
        {
          title: 'Links',
          links: [{ label: 'Test Link', href: '/test' }],
        },
      ];

      const linkClickSpy = cy.stub();
      footer.addEventListener('footer-link-click', linkClickSpy);

      cy.get('.usa-footer__secondary-link a').contains('Test Link').click();

      cy.then(() => {
        expect(linkClickSpy).to.have.been.calledWith(
          Cypress.sinon.match({
            detail: Cypress.sinon.match({
              label: 'Test Link',
              href: '/test',
            }),
          })
        );
      });
    });
  });

  it('should render agency identifier', () => {
    cy.mount(`
      <usa-footer 
        id="test-footer" 
        agency-name="Department of Example Services">
      </usa-footer>
    `);

    cy.get('.usa-identifier').should('exist');
    cy.get('.usa-identifier__section--masthead').should('exist');
    cy.get('.usa-identifier__identity-domain').should(
      'contain.text',
      'Department of Example Services'
    );
  });

  it('should render identifier links', () => {
    cy.mount(`<usa-footer id="test-footer"></usa-footer>`);

    cy.window().then((win) => {
      const footer = win.document.getElementById('test-footer') as any;
      footer.identifierLinks = [
        { label: 'About this site', href: '/about-site' },
        { label: 'Accessibility', href: '/accessibility' },
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'FOIA Requests', href: '/foia' },
      ];
    });

    cy.get('.usa-identifier__section--required-links').should('exist');
    cy.get('.usa-identifier__required-links-item').should('have.length', 4);
    cy.get('.usa-identifier__required-link').should('contain.text', 'About this site');
    cy.get('.usa-identifier__required-link').should('contain.text', 'Accessibility');
    cy.get('.usa-identifier__required-link').should('contain.text', 'Privacy Policy');
    cy.get('.usa-identifier__required-link').should('contain.text', 'FOIA Requests');
  });

  it('should handle identifier link clicks', () => {
    cy.mount(`<usa-footer id="test-footer"></usa-footer>`);

    cy.window().then((win) => {
      const footer = win.document.getElementById('test-footer') as any;
      footer.identifierLinks = [{ label: 'Privacy Policy', href: '/privacy' }];

      const linkClickSpy = cy.stub();
      footer.addEventListener('footer-link-click', linkClickSpy);

      cy.get('.usa-identifier__required-link').contains('Privacy Policy').click();

      cy.then(() => {
        expect(linkClickSpy).to.have.been.calledWith(
          Cypress.sinon.match({
            detail: Cypress.sinon.match({
              label: 'Privacy Policy',
              href: '/privacy',
            }),
          })
        );
      });
    });
  });

  it('should handle complete footer structure', () => {
    cy.mount(`
      <usa-footer 
        id="test-footer" 
        variant="big"
        agency-name="U.S. Department of Examples">
      </usa-footer>
    `);

    cy.window().then((win) => {
      const footer = win.document.getElementById('test-footer') as any;
      footer.sections = [
        {
          title: 'Services',
          links: [
            { label: 'Online Services', href: '/services/online' },
            { label: 'In-Person Services', href: '/services/in-person' },
          ],
        },
        {
          title: 'About',
          links: [
            { label: 'Our Mission', href: '/about/mission' },
            { label: 'Leadership', href: '/about/leadership' },
            { label: 'History', href: '/about/history' },
          ],
        },
        {
          title: 'Resources',
          links: [
            { label: 'Publications', href: '/resources/publications' },
            { label: 'Data & Statistics', href: '/resources/data' },
          ],
        },
      ];

      footer.identifierLinks = [
        { label: 'About this site', href: '/about-site' },
        { label: 'Accessibility', href: '/accessibility' },
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'FOIA Requests', href: '/foia' },
        { label: 'No FEAR Act Data', href: '/no-fear' },
        { label: 'Inspector General', href: '/ig' },
      ];
    });

    // Check variant
    cy.get('.usa-footer').should('have.class', 'usa-footer--big');

    // Check sections
    cy.get('.usa-footer__primary-content').should('have.length', 3);
    cy.get('.usa-footer__secondary-link').should('have.length', 7);

    // Check identifier
    cy.get('.usa-identifier__identity-domain').should(
      'contain.text',
      'U.S. Department of Examples'
    );
    cy.get('.usa-identifier__required-links-item').should('have.length', 6);
  });

  it('should handle accessibility attributes correctly', () => {
    cy.mount(`
      <usa-footer 
        id="test-footer" 
        agency-name="Test Agency">
      </usa-footer>
    `);

    cy.window().then((win) => {
      const footer = win.document.getElementById('test-footer') as any;
      footer.identifierLinks = [{ label: 'Accessibility', href: '/accessibility' }];
    });

    // Footer role
    cy.get('footer').should('have.attr', 'role', 'contentinfo');

    // Identifier section accessibility
    cy.get('.usa-identifier__section--masthead').should(
      'have.attr',
      'aria-label',
      'Agency identifier'
    );
    cy.get('.usa-identifier__identity').should('have.attr', 'aria-label', 'Agency description');
    cy.get('.usa-identifier__section--required-links').should(
      'have.attr',
      'aria-label',
      'Important links'
    );
  });

  it('should handle empty footer gracefully', () => {
    cy.mount(`<usa-footer id="test-footer"></usa-footer>`);

    // Should render basic footer structure
    cy.get('.usa-footer').should('exist');
    cy.get('footer').should('have.attr', 'role', 'contentinfo');

    // Should not render nav section when no sections
    cy.get('.usa-footer__nav').should('not.exist');

    // Should not render identifier when no agency or links
    cy.get('.usa-identifier').should('not.exist');
  });

  it('should handle footer with only agency name', () => {
    cy.mount(`
      <usa-footer 
        id="test-footer" 
        agency-name="Minimal Agency">
      </usa-footer>
    `);

    cy.get('.usa-identifier').should('exist');
    cy.get('.usa-identifier__identity-domain').should('contain.text', 'Minimal Agency');
    cy.get('.usa-identifier__section--required-links').should('not.exist');
  });

  it('should handle footer with only identifier links', () => {
    cy.mount(`<usa-footer id="test-footer"></usa-footer>`);

    cy.window().then((win) => {
      const footer = win.document.getElementById('test-footer') as any;
      footer.identifierLinks = [{ label: 'Privacy Policy', href: '/privacy' }];
    });

    cy.get('.usa-identifier').should('exist');
    cy.get('.usa-identifier__section--masthead').should('exist');
    cy.get('.usa-identifier__identity-domain').should('be.empty');
    cy.get('.usa-identifier__section--required-links').should('exist');
  });

  it('should handle custom footer content', () => {
    cy.mount(`
      <usa-footer id="test-footer">
        <div class="custom-footer-content">
          <p>This is custom footer content</p>
          <button type="button">Custom Button</button>
        </div>
      </usa-footer>
    `);

    cy.get('.custom-footer-content').should('contain.text', 'This is custom footer content');
    cy.get('.custom-footer-content button').should('contain.text', 'Custom Button');
  });

  it('should handle responsive grid structure', () => {
    cy.mount(`<usa-footer id="test-footer"></usa-footer>`);

    cy.window().then((win) => {
      const footer = win.document.getElementById('test-footer') as any;
      footer.sections = [
        {
          title: 'Section 1',
          links: [{ label: 'Link 1', href: '/link1' }],
        },
        {
          title: 'Section 2',
          links: [{ label: 'Link 2', href: '/link2' }],
        },
      ];
    });

    // Check grid structure
    cy.get('.usa-footer__nav-container').should('exist');
    cy.get('.grid-container').should('exist');
    cy.get('.grid-row').should('exist');
    cy.get('.grid-gap').should('exist');
    cy.get('.grid-col').should('have.length', 2);
  });

  it('should handle event prevention for custom link handling', () => {
    cy.mount(`<usa-footer id="test-footer"></usa-footer>`);

    cy.window().then((win) => {
      const footer = win.document.getElementById('test-footer') as any;
      footer.sections = [
        {
          title: 'Custom Links',
          links: [{ label: 'Custom Action', href: '/custom' }],
        },
      ];

      // Prevent default navigation
      footer.addEventListener('footer-link-click', (e: any) => {
        e.preventDefault();
      });

      cy.get('.usa-footer__secondary-link a').contains('Custom Action').click();

      // Should not navigate (would need to verify in a different way in real app)
      cy.url().should('not.include', '/custom');
    });
  });

  it('should maintain proper link styling', () => {
    cy.mount(`<usa-footer id="test-footer"></usa-footer>`);

    cy.window().then((win) => {
      const footer = win.document.getElementById('test-footer') as any;
      footer.sections = [
        {
          title: 'Links',
          links: [{ label: 'Test Link', href: '/test' }],
        },
      ];
      footer.identifierLinks = [{ label: 'Identifier Link', href: '/identifier' }];
    });

    // Section links should not have additional classes
    cy.get('.usa-footer__secondary-link a').should('not.have.class', 'usa-link');

    // Identifier links should have usa-link class
    cy.get('.usa-identifier__required-link').should('have.class', 'usa-link');
  });

  it('should handle large number of sections', () => {
    cy.mount(`<usa-footer id="test-footer"></usa-footer>`);

    cy.window().then((win) => {
      const footer = win.document.getElementById('test-footer') as any;
      footer.sections = Array.from({ length: 6 }, (_, i) => ({
        title: `Section ${i + 1}`,
        links: [
          { label: `Link ${i + 1}A`, href: `/link${i + 1}a` },
          { label: `Link ${i + 1}B`, href: `/link${i + 1}b` },
        ],
      }));
    });

    cy.get('.usa-footer__primary-content').should('have.length', 6);
    cy.get('.usa-footer__secondary-link').should('have.length', 12);
  });

  it('should handle keyboard navigation', () => {
    cy.mount(`<usa-footer id="test-footer"></usa-footer>`);

    cy.window().then((win) => {
      const footer = win.document.getElementById('test-footer') as any;
      footer.sections = [
        {
          title: 'Navigation',
          links: [
            { label: 'First Link', href: '/first' },
            { label: 'Second Link', href: '/second' },
          ],
        },
      ];
      footer.identifierLinks = [{ label: 'Privacy', href: '/privacy' }];
    });

    // Tab through footer links
    cy.get('.usa-footer__secondary-link a').first().focus();
    cy.focused().should('contain.text', 'First Link');

    cy.focused().tab();
    cy.focused().should('contain.text', 'Second Link');

    cy.focused().tab();
    cy.focused().should('contain.text', 'Privacy');
  });

  it('should handle mobile responsive behavior', () => {
    cy.mount(`<usa-footer id="test-footer" variant="big"></usa-footer>`);

    cy.window().then((win) => {
      const footer = win.document.getElementById('test-footer') as any;
      footer.sections = [
        {
          title: 'Services',
          links: [
            { label: 'Service 1', href: '/service1' },
            { label: 'Service 2', href: '/service2' },
          ],
        },
      ];
      footer.agencyName = 'Mobile Test Agency';
      footer.identifierLinks = [{ label: 'Accessibility', href: '/accessibility' }];
    });

    // Set mobile viewport
    cy.viewport(375, 667);

    // Footer should still be functional
    cy.get('.usa-footer').should('be.visible');
    cy.get('.usa-footer__primary-link').should('be.visible');
    cy.get('.usa-footer__secondary-link a').should('be.visible');
    cy.get('.usa-identifier__identity-domain').should('be.visible');
    cy.get('.usa-identifier__required-link').should('be.visible');
  });

  it('should handle dynamic content updates', () => {
    cy.mount(`<usa-footer id="test-footer"></usa-footer>`);

    cy.window().then((win) => {
      const footer = win.document.getElementById('test-footer') as any;

      // Initially empty
      cy.get('.usa-footer__nav').should('not.exist');

      // Add sections
      footer.sections = [
        {
          title: 'Dynamic Section',
          links: [{ label: 'Dynamic Link', href: '/dynamic' }],
        },
      ];

      cy.get('.usa-footer__nav').should('exist');
      cy.get('.usa-footer__primary-link').should('contain.text', 'Dynamic Section');

      // Update agency name
      footer.agencyName = 'Updated Agency';
      cy.get('.usa-identifier__identity-domain').should('contain.text', 'Updated Agency');
    });
  });

  it('should be accessible', () => {
    cy.mount(`
      <div>
        <main id="main-content">
          <h1>Government Website</h1>
          <p>Main content of the website.</p>
        </main>
        <usa-footer 
          id="government-footer" 
          variant="big"
          agency-name="U.S. Department of Test Services">
        </usa-footer>
      </div>
    `);

    cy.window().then((win) => {
      const footer = win.document.getElementById('government-footer') as any;
      footer.sections = [
        {
          title: 'Services',
          links: [
            { label: 'Online Services', href: '/services/online' },
            { label: 'Forms & Applications', href: '/services/forms' },
          ],
        },
        {
          title: 'About',
          links: [
            { label: 'Our Mission', href: '/about/mission' },
            { label: 'Leadership', href: '/about/leadership' },
          ],
        },
      ];

      footer.identifierLinks = [
        { label: 'About this site', href: '/about-site' },
        { label: 'Accessibility', href: '/accessibility' },
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'FOIA Requests', href: '/foia' },
      ];
    });

    cy.injectAxe();
    cy.checkAccessibility();
  });

  it('should handle custom CSS classes', () => {
    cy.mount(`
      <usa-footer 
        id="test-footer" 
        class="custom-footer-class">
      </usa-footer>
    `);

    cy.get('usa-footer').should('have.class', 'custom-footer-class');
    cy.get('.usa-footer').should('exist');
  });

  it('should handle link focus and hover states', () => {
    cy.mount(`<usa-footer id="test-footer"></usa-footer>`);

    cy.window().then((win) => {
      const footer = win.document.getElementById('test-footer') as any;
      footer.sections = [
        {
          title: 'Focus Test',
          links: [{ label: 'Focus Link', href: '/focus' }],
        },
      ];
      footer.identifierLinks = [{ label: 'Hover Link', href: '/hover' }];
    });

    // Test focus states
    cy.get('.usa-footer__secondary-link a').focus();
    cy.focused().should('be.visible');

    // Test hover states (trigger hover)
    cy.get('.usa-identifier__required-link').trigger('mouseover');
    cy.get('.usa-identifier__required-link').should('be.visible');
  });
});
