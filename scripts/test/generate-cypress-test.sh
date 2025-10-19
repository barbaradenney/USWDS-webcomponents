#!/bin/bash
# Cypress Test Generator Script
# Generates comprehensive Cypress component test files from template

set -e

COMPONENT_NAME=$1
COMPONENT_DIR="src/components/${COMPONENT_NAME}"

# Usage help
if [ -z "$COMPONENT_NAME" ]; then
  echo "Usage: ./scripts/generate-cypress-test.sh <component-name>"
  echo ""
  echo "Example: ./scripts/generate-cypress-test.sh modal"
  echo "         ./scripts/generate-cypress-test.sh combo-box"
  echo ""
  exit 1
fi

# Validate component directory exists
if [ ! -d "$COMPONENT_DIR" ]; then
  echo "❌ Component directory not found: $COMPONENT_DIR"
  echo "Please create the component first before generating tests."
  exit 1
fi

# Check if Cypress test already exists
if [ -f "${COMPONENT_DIR}/usa-${COMPONENT_NAME}.component.cy.ts" ]; then
  echo "⚠️  Cypress test already exists: ${COMPONENT_DIR}/usa-${COMPONENT_NAME}.component.cy.ts"
  read -p "Overwrite existing test? (y/N): " confirm
  if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "❌ Cancelled - test file not modified"
    exit 0
  fi
fi

# Convert kebab-case to PascalCase for component name
COMPONENT_PASCAL=$(echo "$COMPONENT_NAME" | sed -r 's/(^|-)([a-z])/\U\2/g')

echo "🧪 Generating Cypress test for: $COMPONENT_NAME"
echo "   Component directory: $COMPONENT_DIR"
echo "   Component class: USA${COMPONENT_PASCAL}"
echo ""

# Generate comprehensive test file from template
cat > "${COMPONENT_DIR}/usa-${COMPONENT_NAME}.component.cy.ts" << 'EOF'
import { html } from 'lit';
import './index.js';

describe('USA [COMPONENT_PASCAL] - Cypress Component Tests', () => {
  beforeEach(() => {
    cy.mount(html`<usa-[COMPONENT_NAME]></usa-[COMPONENT_NAME]>`);
    cy.waitForStorybook(); // Wait for USWDS initialization
  });

  describe('Rendering', () => {
    it('should render component', () => {
      cy.get('usa-[COMPONENT_NAME]').should('exist');
    });

    it('should render with default properties', () => {
      cy.get('usa-[COMPONENT_NAME]').should('be.visible');
      // TODO: Add property-specific assertions
    });

    it('should render all variants', () => {
      // TODO: Test each component variant
      // Example:
      // cy.mount(html`<usa-[COMPONENT_NAME] variant="primary"></usa-[COMPONENT_NAME]>`);
      // cy.get('usa-[COMPONENT_NAME]').should('have.class', 'usa-[COMPONENT_NAME]--primary');
    });
  });

  describe('Accessibility', () => {
    it('should pass axe accessibility tests', () => {
      cy.injectAxe();
      cy.checkA11y('usa-[COMPONENT_NAME]');
    });

    it('should have correct ARIA attributes', () => {
      // TODO: Verify component-specific ARIA attributes
      // Example:
      // cy.get('usa-[COMPONENT_NAME]').should('have.attr', 'role', 'button');
    });

    it('should be keyboard navigable', () => {
      cy.get('usa-[COMPONENT_NAME]').focus();
      cy.focused().should('have.prop', 'tagName', 'USA-[COMPONENT_NAME_UPPER]');

      // TODO: Add keyboard navigation tests
      // Example:
      // cy.realPress('Tab');
      // cy.realPress('Enter');
    });

    it('should have proper focus management', () => {
      // TODO: Test focus states and focus trapping if applicable
      cy.get('usa-[COMPONENT_NAME]').focus();
      cy.get('usa-[COMPONENT_NAME]').should('have.focus');
    });
  });

  describe('User Interactions', () => {
    it('should handle click events', () => {
      // TODO: Test click interactions
      // Example:
      // cy.get('usa-[COMPONENT_NAME]').click();
      // Verify expected behavior
    });

    it('should handle keyboard events', () => {
      // TODO: Test keyboard interactions
      // Example:
      // cy.get('usa-[COMPONENT_NAME]').type('{enter}');
    });

    it('should emit custom events', () => {
      cy.get('usa-[COMPONENT_NAME]').then($el => {
        const el = $el[0];
        const eventSpy = cy.spy();

        // TODO: Add component-specific event listeners
        // Example:
        // el.addEventListener('component-change', eventSpy);

        // Trigger interaction
        cy.wrap($el).click();

        // TODO: Verify event was emitted
        // cy.wrap(eventSpy).should('have.been.called');
      });
    });
  });

  describe('Form Integration', () => {
    it('should work in a form', () => {
      cy.mount(html`
        <form>
          <usa-[COMPONENT_NAME] name="test"></usa-[COMPONENT_NAME]>
        </form>
      `);

      // TODO: Test form integration
      cy.get('usa-[COMPONENT_NAME]').should('exist');
    });

    it('should validate input', () => {
      // TODO: Test validation if applicable
      // Example:
      // cy.mount(html`<usa-[COMPONENT_NAME] required></usa-[COMPONENT_NAME]>`);
      // Verify validation behavior
    });

    it('should show error states', () => {
      // TODO: Test error display if applicable
      // Example:
      // cy.mount(html`<usa-[COMPONENT_NAME] error="Error message"></usa-[COMPONENT_NAME]>`);
      // cy.get('.usa-error-message').should('contain', 'Error message');
    });
  });

  describe('Responsive Behavior', () => {
    it('should work on mobile viewport', () => {
      cy.viewport('iphone-x');
      cy.get('usa-[COMPONENT_NAME]').should('be.visible');
      // TODO: Test mobile-specific behavior
    });

    it('should work on tablet viewport', () => {
      cy.viewport('ipad-2');
      cy.get('usa-[COMPONENT_NAME]').should('be.visible');
      // TODO: Test tablet-specific behavior
    });

    it('should work on desktop viewport', () => {
      cy.viewport(1920, 1080);
      cy.get('usa-[COMPONENT_NAME]').should('be.visible');
      // TODO: Test desktop-specific behavior
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty state', () => {
      cy.mount(html`<usa-[COMPONENT_NAME]></usa-[COMPONENT_NAME]>`);
      cy.get('usa-[COMPONENT_NAME]').should('exist');
      // TODO: Test empty state behavior
    });

    it('should handle long content', () => {
      // TODO: Test overflow behavior
      const longContent = 'Lorem ipsum '.repeat(100);
      cy.mount(html`<usa-[COMPONENT_NAME]>${longContent}</usa-[COMPONENT_NAME]>`);
      // Verify overflow handling
    });

    it('should handle disabled state', () => {
      cy.mount(html`<usa-[COMPONENT_NAME] disabled></usa-[COMPONENT_NAME]>`);
      cy.get('usa-[COMPONENT_NAME]').should('have.attr', 'disabled');
      // TODO: Verify disabled behavior
    });
  });
});
EOF

# Replace placeholders with actual component names
sed -i '' "s/\[COMPONENT_PASCAL\]/${COMPONENT_PASCAL}/g" "${COMPONENT_DIR}/usa-${COMPONENT_NAME}.component.cy.ts"
sed -i '' "s/\[COMPONENT_NAME\]/${COMPONENT_NAME}/g" "${COMPONENT_DIR}/usa-${COMPONENT_NAME}.component.cy.ts"
sed -i '' "s/\[COMPONENT_NAME_UPPER\]/${COMPONENT_NAME^^}/g" "${COMPONENT_DIR}/usa-${COMPONENT_NAME}.component.cy.ts"

echo "✅ Generated Cypress test: ${COMPONENT_DIR}/usa-${COMPONENT_NAME}.component.cy.ts"
echo ""
echo "Next steps:"
echo "1. Review the generated test file"
echo "2. Replace TODO comments with component-specific tests"
echo "3. Run tests: npm run cypress:open"
echo "4. Verify all tests pass"
echo ""
