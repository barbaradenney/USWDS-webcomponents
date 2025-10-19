/**
 * Rapid Interaction Testing Utilities
 * 
 * These utilities test real-world user behavior that often exposes timing bugs,
 * event listener duplication, and race conditions that unit tests miss.
 */

export interface RapidInteractionTestConfig {
  /** The selector for the interactive element */
  selector: string;
  /** Number of rapid interactions to perform */
  clickCount?: number;
  /** Time to wait after rapid interactions for events to settle */
  settleTime?: number;
  /** Expected final state validation function */
  validateFinalState?: () => void;
  /** Test description */
  description?: string;
}

export interface ComponentStressTestConfig {
  /** Component tag name (e.g., 'usa-button') */
  componentTag: string;
  /** Component properties to set */
  props?: Record<string, any>;
  /** Interactive elements to test */
  interactions: RapidInteractionTestConfig[];
  /** Custom validation after all interactions */
  globalValidation?: () => void;
}

/**
 * Test rapid clicking on an interactive element to catch timing bugs
 */
export function testRapidClicking(config: RapidInteractionTestConfig) {
  const {
    selector,
    clickCount = 10,
    settleTime = 500,
    validateFinalState,
    description = 'rapid clicking'
  } = config;

  it(`should handle ${description} without errors`, () => {
    // Get the interactive element
    cy.get(selector).as('targetElement');
    
    // Perform rapid clicks without waiting between them
    let clickChain = cy.get('@targetElement');
    for (let i = 0; i < clickCount; i++) {
      clickChain = clickChain.click();
    }
    
    // Wait for all events and animations to settle
    cy.wait(settleTime);
    
    // Component should still be functional
    cy.get('@targetElement').should('exist');
    cy.get('@targetElement').should('be.visible');
    
    // Custom validation if provided
    if (validateFinalState) {
      validateFinalState();
    }
    
    // No JavaScript errors should have occurred
    cy.window().then((win) => {
      // Check for any unhandled exceptions
      expect(win.console.error).to.not.have.been.called;
    });
  });
}

/**
 * Test rapid keyboard interactions (Enter, Space, Arrow keys)
 */
export function testRapidKeyboardInteraction(config: RapidInteractionTestConfig & { 
  keys: string[] 
}) {
  const {
    selector,
    keys,
    clickCount = 10,
    settleTime = 500,
    validateFinalState,
    description = 'rapid keyboard interaction'
  } = config;

  it(`should handle ${description} without errors`, () => {
    cy.get(selector).as('targetElement').focus();
    
    // Rapidly send keyboard events
    for (let i = 0; i < clickCount; i++) {
      const key = keys[i % keys.length];
      cy.get('@targetElement').type(key);
    }
    
    cy.wait(settleTime);
    
    // Element should still be functional
    cy.get('@targetElement').should('exist');
    cy.get('@targetElement').should('be.visible');
    
    if (validateFinalState) {
      validateFinalState();
    }
  });
}

/**
 * Test rapid focus changes to catch focus management bugs
 */
export function testRapidFocusChanges(selectors: string[]) {
  it('should handle rapid focus changes without errors', () => {
    // Rapidly change focus between elements
    for (let i = 0; i < 20; i++) {
      const selector = selectors[i % selectors.length];
      cy.get(selector).focus();
    }
    
    cy.wait(500);
    
    // All elements should still be focusable
    selectors.forEach(selector => {
      cy.get(selector).should('exist');
      cy.get(selector).focus().should('be.focused');
    });
  });
}

/**
 * Test component behavior during CSS transitions
 */
export function testInteractionDuringTransitions(config: RapidInteractionTestConfig) {
  const {
    selector,
    settleTime = 1000,
    description = 'interaction during CSS transitions'
  } = config;

  it(`should handle ${description} correctly`, () => {
    cy.get(selector).as('targetElement');
    
    // Click, then immediately click again before transition completes
    cy.get('@targetElement')
      .click()
      .click()  // Immediate second click
      .click(); // And a third for good measure
    
    // Wait longer for transitions to complete
    cy.wait(settleTime);
    
    // Component should be in a consistent state
    cy.get('@targetElement').should('exist');
    cy.get('@targetElement').should('be.visible');
  });
}

/**
 * Test form components with rapid input changes
 */
export function testRapidFormInput(inputSelector: string, values: string[]) {
  it('should handle rapid form input changes without errors', () => {
    cy.get(inputSelector).as('input');
    
    // Rapidly change input values
    values.forEach(value => {
      cy.get('@input').clear().type(value);
    });
    
    cy.wait(500);
    
    // Input should still be functional
    cy.get('@input').should('exist');
    cy.get('@input').should('be.visible');
    cy.get('@input').should('not.be.disabled');
  });
}

/**
 * Comprehensive stress test for a component
 */
export function runComponentStressTest(config: ComponentStressTestConfig) {
  const { componentTag, props = {}, interactions, globalValidation } = config;

  describe(`${componentTag} Stress Testing`, () => {
    beforeEach(() => {
      // Mount component with properties
      const propsStr = Object.entries(props)
        .map(([key, value]) => `${key}="${value}"`)
        .join(' ');
      
      cy.mount(`<${componentTag} ${propsStr}></${componentTag}>`);
      
      // Set up console error tracking
      cy.window().then((win) => {
        cy.stub(win.console, 'error').as('consoleError');
      });
    });

    // Run all interaction tests
    interactions.forEach(interaction => {
      testRapidClicking(interaction);
      testInteractionDuringTransitions(interaction);
    });

    // Global validation
    if (globalValidation) {
      it('should pass global validation after all stress tests', () => {
        globalValidation();
      });
    }

    // Accessibility should still work after stress testing
    it('should maintain accessibility after stress testing', () => {
      cy.injectAxe();
      cy.checkAccessibility();
    });
  });
}

/**
 * Test patterns that commonly reveal timing bugs
 */
export const COMMON_BUG_PATTERNS = {
  /** Event listener duplication - multiple rapid clicks */
  eventDuplication: (selector: string) => testRapidClicking({
    selector,
    clickCount: 15,
    description: 'event listener duplication pattern'
  }),

  /** Race conditions - interaction during state changes */
  raceConditions: (selector: string) => testInteractionDuringTransitions({
    selector,
    settleTime: 1500,
    description: 'race condition pattern'
  }),

  /** Memory leaks - rapid creation/destruction */
  memoryLeaks: (componentTag: string) => {
    it('should handle rapid component mounting/unmounting', () => {
      for (let i = 0; i < 10; i++) {
        cy.mount(`<${componentTag}></${componentTag}>`);
        cy.get(componentTag).should('exist');
        // Cypress automatically cleans up between mounts
      }
    });
  },

  /** Focus management - rapid focus changes */
  focusManagement: (selectors: string[]) => testRapidFocusChanges(selectors),
};