# AI Agent Collaboration Guide
*For Claude Code and other AI development assistants*

## 🎯 Mission Statement
This repository maintains USWDS web components with the highest code quality standards. Every AI agent working here must ensure production-ready, accessible, and maintainable code.

## 🚨 CRITICAL SUCCESS RULES

### Rule #1: NO BROKEN BUILDS
**NEVER commit code that doesn't compile or build.**
```bash
# MANDATORY before ANY changes
npm run typecheck  # Must return 0 errors
npm run build      # Must complete successfully
```

### Rule #2: COMPLETE IMPLEMENTATIONS ONLY
No partial code, incomplete methods, or orphaned statements.
```typescript
// ✅ CORRECT
render() {
  return html`<div class="usa-component">Complete template</div>`;
}

// ❌ WRONG - Will break compilation
render() {
  // Missing return or incomplete template
}
```

### Rule #3: TEST EVERYTHING
All code changes require passing tests.
```bash
npm run test       # Must pass all tests
npm run test:coverage  # Maintain 85%+ coverage
```

## 🔧 Pre-Work Setup

### Essential Reading Order
1. **`docs/DEVELOPMENT_STANDARDS.md`** - Core development rules
2. **`src/components/[component]/README.md`** - Component-specific API docs  
3. **`docs/DEBUGGING_GUIDE.md`** - Troubleshooting patterns
4. **`CLAUDE.md`** - Repository-specific guidance

### Health Check Command
```bash
npm run quality-check  # Comprehensive codebase assessment
```

### Understanding Current State
```bash
# Check compilation status
npm run typecheck

# Understand test status  
npm run test

# Verify build works
npm run build

# Check documentation completeness
npm run storybook
```

## 🏗️ Development Workflow

### 1. Analysis Phase
Before making ANY changes:
```typescript
// Read the component file
const component = await readFile('src/components/[name]/usa-[name].ts');

// Check test patterns
const tests = await readFile('src/components/[name]/usa-[name].test.ts');

// Review documentation  
const readme = await readFile('src/components/[name]/README.md');

// Understand stories structure
const stories = await readFile('src/components/[name]/usa-[name].stories.ts');
```

### 2. Implementation Rules

#### Component Structure Compliance
Every component must have:
```typescript
@customElement('usa-component-name')
export class USAComponentName extends LitElement {
  static styles = css`:host { display: block; }`;
  
  @property({ type: String })
  propertyName = 'default';  // Complete declaration
  
  protected createRenderRoot(): HTMLElement {
    return this as any;  // Light DOM for USWDS
  }
  
  connectedCallback() {
    super.connectedCallback();
    // Complete implementation
  }
  
  render() {
    return html`
      <div class="usa-component-name">
        <!-- Complete template with proper USWDS classes -->
      </div>
    `;
  }
}
```

#### TypeScript Error Prevention
```typescript
// ✅ CORRECT: Variable declarations
this.items.map((item, index) => {  // Include index parameter
  return html`<span>${item.label}</span>`;
});

// ✅ CORRECT: Property definitions  
@property({ type: Boolean })
disabled = false;  // Complete with assignment

// ✅ CORRECT: Method implementations
private handleClick(e: Event): void {
  // Complete function body required
  e.preventDefault();
}
```

### 3. Testing Requirements

#### Unit Test Structure
```typescript
describe('USAComponent', () => {
  let element: USAComponent;

  beforeEach(async () => {
    element = document.createElement('usa-component') as USAComponent;
    document.body.appendChild(element);
    await element.updateComplete;
  });

  afterEach(() => {
    element.remove();
  });

  it('should render correctly', () => {
    expect(element.shadowRoot || element).toBeTruthy();
  });
  
  // Test ALL properties, events, and interactions
});
```

#### Accessibility Testing
```typescript
it('should be accessible', async () => {
  await element.updateComplete;
  
  // Check ARIA attributes
  expect(element.getAttribute('role')).toBe('expected-role');
  
  // Test keyboard navigation
  const button = element.querySelector('button');
  button?.focus();
  expect(document.activeElement).toBe(button);
});
```

### 4. Documentation Maintenance

#### Component README Updates
When modifying components, update:
```markdown
## Properties
| Property | Type | Default | Description |
|----------|------|---------|-------------|
| newProp  | string | 'default' | Description of new property |

## Events  
| Event | Detail | Description |
|-------|--------|-------------|
| component-change | { value: string } | Fired when component changes |
```

#### Storybook Story Updates
```typescript
export const NewVariant: Story = {
  args: {
    property: 'new-value',
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Description of new variant and usage',
      },
    },
  },
};
```

## 🚦 Quality Gates

### Pre-Commit Checklist
- [ ] `npm run typecheck` - 0 errors
- [ ] `npm run lint` - 0 errors  
- [ ] `npm run test` - All tests pass
- [ ] `npm run build` - Completes successfully
- [ ] Component README updated
- [ ] Storybook story updated/verified

### Component Completeness Audit
- [ ] Render method returns complete HTML template
- [ ] All properties have type declarations and defaults
- [ ] All methods have complete implementations
- [ ] Event handlers properly typed and implemented
- [ ] USWDS CSS classes correctly applied
- [ ] Accessibility attributes present (ARIA, roles, etc.)

### Documentation Completeness
- [ ] Component README exists and is complete
- [ ] Storybook stories cover all variants/states
- [ ] USWDS documentation links are working
- [ ] Usage examples are accurate and current

## 🎯 Common Patterns & Solutions

### Pattern: Adding New Component
1. Create component directory: `src/components/new-component/`
2. Implement: `usa-new-component.ts` (complete implementation)
3. Test: `usa-new-component.test.ts` (85%+ coverage)
4. Stories: `usa-new-component.stories.ts` (all variants)
5. Document: `README.md` (with USWDS links)
6. Export: Add to `src/index.ts` and component `index.ts`
7. Verify: Run full quality check

### Pattern: Fixing TypeScript Errors
1. Identify error type from `npm run typecheck`
2. Locate exact file and line number
3. Understand the expected TypeScript pattern
4. Implement complete fix (not partial)
5. Verify compilation succeeds
6. Check no other errors introduced

### Pattern: Debugging Test Failures
1. Run `npm run test:ui` for interactive debugging
2. Identify specific test and failure reason  
3. Check component lifecycle and rendering
4. Verify mock data and DOM structure
5. Ensure async operations complete
6. Test accessibility compliance

### Pattern: Adding New Properties
```typescript
// 1. Add property with complete type info
@property({ type: String })
newProperty = 'default-value';

// 2. Use in render method
render() {
  return html`
    <div class="usa-component ${this.newProperty}">
      Content
    </div>
  `;
}

// 3. Add to TypeScript interface if needed
interface ComponentProperties {
  newProperty: string;
}

// 4. Update tests
it('should handle newProperty correctly', () => {
  element.newProperty = 'test-value';
  expect(element.newProperty).toBe('test-value');
});

// 5. Update Storybook controls
argTypes: {
  newProperty: {
    control: 'text',
    description: 'Description of new property',
  },
}

// 6. Update README documentation
```

## ⚠️ Common Pitfalls & Fixes

### Incomplete Render Methods
```typescript
// ❌ WRONG
render() {
  // Missing return statement
}

// ✅ CORRECT
render() {
  return html`<div class="usa-component">Content</div>`;
}
```

### Missing Variable Declarations
```typescript
// ❌ WRONG
this.items.map((item) => {
  return html`<span data-index="${index}">${item.label}</span>`; // index undefined
});

// ✅ CORRECT  
this.items.map((item, index) => {
  return html`<span data-index="${index}">${item.label}</span>`;
});
```

### Incomplete Property Declarations
```typescript
// ❌ WRONG
@property({ type: String })
label  // Missing assignment

// ✅ CORRECT
@property({ type: String })  
label = 'Default label';
```

### HTML Comments in Template Literals
```typescript
// ❌ WRONG - Breaks compilation
return html`
  <div>
    <!-- HTML comment breaks template -->
  </div>
`;

// ✅ CORRECT
return html`
  <div>
    ${/* JavaScript comment works */}
  </div>
`;
```

## 📞 Emergency Procedures

### If Build is Broken
1. **STOP** - Don't make more changes
2. Run `npm run typecheck` to identify errors
3. Fix errors following patterns in this guide
4. Test fix with `npm run build`
5. Verify tests still pass
6. Commit fix immediately

### If Tests are Failing
1. Run `npm run test:ui` for debugging
2. Identify root cause (component logic vs test setup)
3. Fix following established test patterns
4. Ensure fix doesn't break other tests
5. Verify coverage maintained

### If Documentation is Outdated
1. Check component implementation vs README
2. Update property tables and examples
3. Verify USWDS documentation links
4. Test Storybook stories still work
5. Update any changed APIs or behaviors

## 🎖️ Excellence Standards

### Code Quality Metrics
- TypeScript: 0 compilation errors
- ESLint: 0 linting errors  
- Test Coverage: 85%+ required
- Build: Must complete successfully
- Documentation: 100% component coverage

### Accessibility Standards
- All interactive elements keyboard accessible
- Proper ARIA labels and roles
- Color contrast compliance
- Screen reader compatibility
- Focus management

### Performance Standards  
- Bundle size monitored
- Lazy loading where appropriate
- Efficient rendering patterns
- Memory leak prevention

## 🤝 Collaboration Protocol

### When Working with Other AI Agents
1. **Check current branch status** before starting
2. **Read recent commits** to understand current work
3. **Run quality check** to understand baseline
4. **Coordinate on shared components** to avoid conflicts
5. **Document changes clearly** for handoff

### When Handing Off Work
1. **Run full quality check** and include results
2. **Document what was completed** vs what remains
3. **List any blockers or complex issues** discovered
4. **Provide context** on decisions made
5. **Ensure build is stable** for next agent

This guide ensures consistent, high-quality development across all AI agents working on this USWDS web components library.