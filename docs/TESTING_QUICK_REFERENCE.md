# Testing Quick Reference - USWDS Web Components

## Essential Commands

### Development Testing
```bash
npm run test                    # Unit tests (fast feedback)
npm run test:ui                # Interactive test runner
npm run test -- --watch        # Watch mode for development
npm run storybook              # Visual component testing
```

### Quality Validation
```bash
npm run test:comprehensive:fast    # Quick comprehensive check
npm run test:comprehensive         # Full test suite
npm run lint                       # Code quality check
npm run typecheck                  # TypeScript validation
```

### Component-Specific Testing
```bash
npm run test -- src/components/button/  # Test specific component
npm run cypress:open                    # Interactive component testing
npm run test:accessibility             # Accessibility-focused tests
```

### AI-Powered Testing (Phase 5)
```bash
npm run test:predict:fast          # Smart test selection (30% tests)
npm run test:recommend             # Get test improvement suggestions
npm run test:chaos:low             # Basic resilience testing
npm run ai:analyze                 # AI-powered test analysis
npm run test:gaps                  # Quick gap analysis
```

### CI/CD and Monitoring
```bash
npm run test:monitor               # Real-time test monitoring
npm run test:comprehensive:ci      # CI-optimized testing
npm run test:comprehensive:report  # Detailed HTML reports
```

## Testing Workflow

### 🚀 Quick Start (New Contributors)
1. `npm install` - Install dependencies
2. `npm run test` - Verify environment
3. `npm run storybook` - Start visual development
4. `npm run test:comprehensive:fast` - Validate before commits

### 🔧 Component Development Workflow
1. **Write failing test** → `npm run test -- --watch`
2. **Implement component** → Use Storybook for visual feedback
3. **Add stories** → All variants and states
4. **Validate** → `npm run test:comprehensive:fast`
5. **Commit** → Pre-commit hooks run automatically

### 🎯 Pre-Commit Checklist
- [ ] `npm run test` - All unit tests pass
- [ ] `npm run typecheck` - No TypeScript errors
- [ ] `npm run lint` - No linting errors
- [ ] Component has comprehensive Storybook stories
- [ ] Accessibility tests included and passing

## Test Requirements by Component Type

### All Components (Mandatory)
- ✅ Unit tests with 90%+ coverage
- ✅ Storybook stories for all variants
- ✅ Accessibility tests (100% compliance)
- ✅ USWDS CSS class validation

### Interactive Components (Additional)
- ✅ Cypress component tests
- ✅ Keyboard navigation tests
- ✅ Event handling validation
- ✅ Form integration tests (if applicable)

### Complex Components (Additional)
- ✅ Integration tests with Playwright
- ✅ Cross-browser compatibility tests
- ✅ Performance impact assessment

## Quality Gates

### Automated Thresholds
- **Test Pass Rate**: 100% (zero failures allowed)
- **Code Coverage**: 90% minimum line coverage
- **Accessibility**: 100% WCAG 2.1 AA compliance
- **Performance**: <100ms render time, <10KB bundle impact
- **Security**: Zero vulnerabilities

### Manual Review Points
- USWDS specification compliance
- Component API consistency
- Documentation completeness
- Cross-browser compatibility

## Common Test Patterns

### Unit Test Template (Copy & Modify)
```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import './usa-component.ts';
import type { USAComponent } from './usa-component.js';
import { testComponentAccessibility, USWDS_A11Y_CONFIG } from '../../../__tests__/accessibility-utils.js';

describe('USAComponent', () => {
  let element: USAComponent;

  beforeEach(() => {
    element = document.createElement('usa-component') as USAComponent;
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should have default properties', () => {
    expect(element.variant).toBe('primary');
  });

  it('should update classes when properties change', async () => {
    element.variant = 'secondary';
    await element.updateComplete;
    expect(element.className).toContain('usa-component--secondary');
  });

  it('should pass accessibility tests', async () => {
    await element.updateComplete;
    await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
  });
});
```

### Storybook Story Template (Copy & Modify)
```typescript
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './index.ts';
import type { USAComponent } from './usa-component.js';

const meta: Meta<USAComponent> = {
  title: 'Components/Component',
  component: 'usa-component',
  parameters: { layout: 'padded' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary'],
    },
  },
};

export default meta;
type Story = StoryObj<USAComponent>;

export const Default: Story = {
  args: { variant: 'primary' },
};

export const AllVariants: Story = {
  render: () => html`
    <usa-component variant="primary">Primary</usa-component>
    <usa-component variant="secondary">Secondary</usa-component>
  `,
};
```

## Troubleshooting Quick Fixes

### "Tests failing in CI but pass locally"
```bash
# Check environment consistency
node --version    # Should match CI
npm run test:ci   # Run in CI mode locally
```

### "Accessibility tests failing"
```bash
# Debug accessibility issues
npm run test:accessibility    # Focused accessibility testing
# Check: ARIA attributes, keyboard navigation, color contrast
```

### "Coverage threshold not met"
```bash
npm run test:coverage        # See coverage report
# Add tests for: uncovered lines, edge cases, error conditions
```

### "Storybook not rendering component"
```bash
# Verify imports and registration
npm run storybook
# Check: import paths, component registration, story structure
```

## Test File Locations

```
src/components/[component]/
├── usa-[component].ts              # Component implementation
├── usa-[component].test.ts         # Unit tests (mandatory)
├── usa-[component].stories.ts      # Storybook stories (mandatory)
├── usa-[component].component.cy.ts # Component tests (interactive)
└── README.mdx                      # Documentation (mandatory)

__tests__/
├── accessibility-utils.ts          # Accessibility test helpers
├── test-utils.ts                   # General test utilities
└── layout-validation-utils.ts     # Layout testing helpers

tests/
├── accessibility/                  # Cross-browser a11y tests
├── security/                      # Security validation tests
├── performance/                   # Performance impact tests
└── integration/                   # End-to-end workflow tests
```

## Documentation Updates

When creating/modifying components, also update:

- [ ] `src/components/[component]/README.mdx` - Component documentation
- [ ] `src/components/[component]/CHANGELOG.mdx` - Version history
- [ ] Component exports in `src/index.ts`
- [ ] This quick reference if new patterns emerge

## Monitoring and Reports

### Real-time Monitoring
```bash
npm run test:monitor
# Opens dashboard at http://localhost:3001
# Shows: test results, coverage trends, quality metrics
```

### Generate Reports
```bash
npm run test:comprehensive:report
# Creates: ./test-reports/comprehensive-report.html
# Includes: detailed results, trends, recommendations
```

### Quality Metrics Dashboard
- **Test Pass Rate**: Current percentage passing
- **Coverage Trends**: Historical coverage data
- **Performance Impact**: Bundle size and runtime metrics
- **Accessibility Score**: WCAG compliance percentage
- **Security Status**: Vulnerability count and severity

## Need Help?

1. **Component Examples**: Check existing components for patterns
2. **Testing Utilities**: Review `__tests__/` directory for helpers
3. **USWDS Documentation**: Component README files link to official docs
4. **Comprehensive Guide**: See `docs/COMPREHENSIVE_TESTING_GUIDE.md`
5. **Complete Guide**: See [`docs/TESTING_GUIDE.md`](./guides/TESTING_GUIDE.md) for comprehensive testing documentation

---

**Remember**: Quality gates are automated and strictly enforced. Run `npm run test:comprehensive:fast` before every commit to avoid CI failures.