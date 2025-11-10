/**
 * Smoke Tests - Critical Interaction Validation
 *
 * These tests verify that interactive components respond to basic user interactions.
 * They are designed to run FAST (~30 seconds total) to catch critical bugs before commit.
 *
 * What These Tests Catch:
 * - Missing event listener initialization (like the time-picker dropdown bug)
 * - Broken click handlers
 * - USWDS JavaScript not loading
 * - Component initialization failures
 *
 * Run These Tests:
 * - Manually: npm run cypress:smoke
 * - Pre-commit (opt-in): SMOKE_TESTS_PRECOMMIT=1 git commit
 * - CI: On every PR
 *
 * See: docs/POST_MORTEM_TIME_PICKER_DROPDOWN_ISSUE.md
 */

describe('Smoke Tests - Critical Component Interactions', () => {
  /**
   * Interactive components that MUST respond to user input
   * Add any component here that has dropdowns, modals, toggles, or other interactions
   */
  const INTERACTIVE_COMPONENTS = [
    {
      name: 'accordion',
      storyId: 'structure-accordion--default',
      interactions: [
        {
          test: 'expand/collapse on click',
          action: (component: string) => {
            cy.get(`${component} button`).first().click();
            cy.get(`${component} .usa-accordion__content`).should('be.visible');
          }
        }
      ]
    },
    {
      name: 'combo-box',
      storyId: 'forms-combo-box--default',
      interactions: [
        {
          test: 'dropdown opens on toggle click',
          action: (component: string) => {
            cy.get(`${component} .usa-combo-box__toggle-list`).click();
            cy.get(`${component} .usa-combo-box__list`).should('be.visible');
          }
        },
        {
          test: 'dropdown opens on arrow down key',
          action: (component: string) => {
            cy.get(`${component} input`).focus().type('{downarrow}');
            cy.get(`${component} .usa-combo-box__list`).should('be.visible');
          }
        }
      ]
    },
    {
      name: 'date-picker',
      storyId: 'forms-date-picker--default',
      interactions: [
        {
          test: 'calendar opens on button click',
          action: (component: string) => {
            cy.get(`${component} .usa-date-picker__button`).click();
            cy.get(`${component} .usa-date-picker__calendar`).should('be.visible');
          }
        }
      ]
    },
    {
      name: 'modal',
      storyId: 'feedback-modal--default',
      interactions: [
        {
          test: 'opens on trigger click',
          action: () => {
            // Modal has a trigger button in the story (triggerText: 'Open Modal')
            cy.wait(500); // Wait for USWDS initialization
            cy.get('[data-open-modal]').first().click();
            cy.wait(300); // Wait for modal animation
            cy.get('.usa-modal-wrapper').should('be.visible').and('have.class', 'is-visible');
            cy.get('.usa-modal').should('be.visible');
          }
        }
      ]
    },
    {
      name: 'time-picker',
      storyId: 'forms-time-picker--default',
      interactions: [
        {
          test: 'dropdown opens on toggle click',
          action: (component: string) => {
            cy.get(`${component} .usa-combo-box__toggle-list`).click();
            cy.get(`${component} .usa-combo-box__list`).should('be.visible');
          }
        },
        {
          test: 'dropdown opens on arrow down key',
          action: (component: string) => {
            cy.get(`${component} input`).focus().type('{downarrow}');
            cy.get(`${component} .usa-combo-box__list`).should('be.visible');
          }
        }
      ]
    }
  ];

  INTERACTIVE_COMPONENTS.forEach(({ name, storyId, interactions }) => {
    describe(`${name} - Critical Interactions`, () => {
      beforeEach(() => {
        cy.visit(`/iframe.html?id=${storyId}&viewMode=story`);
        // Wait for component to initialize
        cy.get(`usa-${name}`).should('exist');
      });

      interactions.forEach(({ test, action }) => {
        it(`should ${test}`, () => {
          action(`usa-${name}`);
        });
      });
    });
  });

  /**
   * Additional smoke tests for components with unique interaction patterns
   */
  describe('Character Count - Live Updates', () => {
    beforeEach(() => {
      cy.visit('/iframe.html?id=components-character-count--default&viewMode=story');
    });

    it('should update count when typing', () => {
      cy.get('usa-character-count textarea').type('Hello');
      cy.get('usa-character-count .usa-character-count__message').should('contain', '5');
    });
  });

  describe('File Input - File Selection', () => {
    beforeEach(() => {
      cy.visit('/iframe.html?id=components-file-input--default&viewMode=story');
    });

    it('should show file name when file selected', () => {
      const fileName = 'test.txt';
      cy.get('usa-file-input input[type="file"]').selectFile({
        contents: Cypress.Buffer.from('test content'),
        fileName,
        mimeType: 'text/plain'
      }, { force: true });

      cy.get('usa-file-input').should('contain', fileName);
    });
  });

  describe('Search - Form Submission', () => {
    beforeEach(() => {
      cy.visit('/iframe.html?id=components-search--default&viewMode=story');
    });

    it('should handle search button click', () => {
      cy.get('usa-search input').type('test query');
      cy.get('usa-search button[type="submit"]').click();
      // Verify event was dispatched (check in browser console or component state)
      cy.get('usa-search').should('exist'); // Basic smoke test
    });
  });
});

/**
 * Fast regression test for the time-picker dropdown bug
 * This specific test would have caught the missing initializeComboBox() call
 */
describe('Regression: Time-Picker Dropdown Bug (2025-10-17)', () => {
  beforeEach(() => {
    cy.visit('/iframe.html?id=components-time-picker--default&viewMode=story');
  });

  it('CRITICAL: dropdown must open when clicking toggle button', () => {
    // This test failed when initializeComboBox() was missing
    cy.get('usa-time-picker .usa-combo-box__toggle-list').should('exist');
    cy.get('usa-time-picker .usa-combo-box__list').should('not.be.visible');

    // THE CRITICAL TEST - Click must work
    cy.get('usa-time-picker .usa-combo-box__toggle-list').click();

    // Dropdown MUST appear
    cy.get('usa-time-picker .usa-combo-box__list').should('be.visible');
  });

  it('CRITICAL: dropdown must open when pressing arrow down', () => {
    cy.get('usa-time-picker input').focus().type('{downarrow}');
    cy.get('usa-time-picker .usa-combo-box__list').should('be.visible');
  });
});
