# Contributing to USWDS Web Components

Thank you for your interest in contributing to the USWDS Web Components project! This document provides guidelines and instructions for contributing.

## Table of Contents

- [AI-Driven Development](#ai-driven-development)
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Component Development](#component-development)
- [Testing](#testing)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)

## AI-Driven Development

**This is a 100% AI-contributed repository.** We are committed to exploring the capabilities and best practices of AI-assisted software development.

### Contribution Requirement

**All code contributions must be written with AI assistance.** This includes:

- Component implementations
- Tests
- Documentation
- Bug fixes
- Refactoring
- Scripts and tooling

### Recommended AI Tools

We recommend using AI coding assistants such as:

- **Claude Code** (Anthropic) - Our primary development tool
- **GitHub Copilot** (GitHub/OpenAI)
- **Cursor** (AI-first code editor)
- **Claude** (Anthropic) - For design discussions and architecture
- **ChatGPT** (OpenAI) - For code generation and problem-solving

### AI Contribution Guidelines

When contributing with AI:

1. **Be Transparent**: Mention in your PR that code was AI-generated
2. **Review Thoroughly**: AI-generated code should be reviewed and understood by you
3. **Test Comprehensively**: All AI-generated code must pass our test suite
4. **Follow Standards**: AI output must adhere to our coding standards and architecture
5. **Document Decisions**: Explain architectural choices, even if suggested by AI
6. **Iterate**: Use AI to refine and improve code through multiple iterations

### Why AI-Only?

This project serves as:

- **Research**: Understanding AI capabilities in real-world development
- **Best Practices**: Developing patterns for AI-assisted development
- **Quality**: Demonstrating that AI can produce production-quality code
- **Innovation**: Pushing boundaries of what AI can accomplish

### Human Oversight

While all code is AI-generated, human oversight is essential:

- ✅ Code review by maintainers
- ✅ Architecture decisions guided by humans
- ✅ Quality standards enforced by humans
- ✅ Testing validated by humans

**Note**: Manual code contributions that are not AI-assisted will not be accepted. If you prefer to write code manually, we respect that choice, but this particular project maintains its AI-only contribution policy.

## Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to barbaradenney@users.noreply.github.com.

## Getting Started

### Prerequisites


- Node.js 18+ and npm 9+

- Git

- Basic understanding of Web Components and TypeScript

- Familiarity with the U.S. Web Design System (USWDS)


### Initial Setup

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/barbaradenney/USWDS-webcomponents.git
cd uswds-webcomponents

# 3. Add upstream remote
git remote add upstream https://github.com/barbaradenney/USWDS-webcomponents.git

# 4. Install dependencies
npm install

# 5. Compile USWDS CSS (first time only)
npm run build:css

# 6. Start development server
npm run storybook
```

## Development Workflow

### Before Starting Work

1. **Check existing issues** to avoid duplicate work
2. **Create or comment on an issue** describing what you plan to work on
3. **Get feedback** from maintainers before starting significant work

### Branch Strategy

```bash
# Create a feature branch
git checkout -b feature/component-name

# Or for bug fixes
git checkout -b fix/issue-description
```

### Daily Development

```bash
# Start Storybook for visual testing
npm run storybook

# Run tests in watch mode
npm run test:watch

# Run type checking
npm run typecheck

# Run linter
npm run lint
```

## Component Development

### 1. Read the Documentation

**REQUIRED READING** before creating any component:


- CLAUDE.md - Complete development guidelines

- docs/USWDS_INTEGRATION_GUIDE.md - USWDS integration patterns

- docs/COMPONENT_DEVELOPMENT_GUIDE.md - Step-by-step guide

- docs/COMPONENT_TEMPLATES.md - Code templates


### 2. Generate Component Scaffold

```bash
# Interactive generation (recommended)
npm run generate:component -- --interactive

# Or specify directly
npm run generate:component -- --name=my-component
```

### 3. Follow the Architecture

**Key Principles:**

- ✅ Use official USWDS CSS directly (no custom style reimplementation)

- ✅ Keep custom code minimal (only web component behavior)

- ✅ Use Light DOM (no Shadow DOM)

- ✅ Follow Script Tag Pattern for USWDS loading

- ✅ Write comprehensive tests


### 4. Component Checklist

Before submitting a component:

- [ ] Follows USWDS patterns exactly
- [ ] Uses Light DOM (no Shadow DOM)
- [ ] Has comprehensive unit tests (Vitest)
- [ ] Has component tests for interactions (Cypress, if applicable)
- [ ] Has accessibility tests (axe-core validation)
- [ ] Has Storybook stories for all variants
- [ ] Has component README.mdx documentation
- [ ] Passes all pre-commit validation hooks
- [ ] TypeScript types are properly defined
- [ ] No console.log or debug code left in

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific component tests
npm test usa-button

# Run with coverage
npm run test:coverage

# Run browser-dependent tests
npm run test:browser

# Run Cypress component tests
npm run cypress:component
```

### Writing Tests

All components MUST have:

1. **Unit Tests** (Vitest): Test component logic, properties, events
2. **Accessibility Tests**: Automated axe-core validation
3. **Component Tests** (Cypress): Test interactive behavior (if applicable)

Example test structure:

```typescript
describe('USAButton', () => {
  describe('Rendering', () => {
    it('should render with default properties', () => {
      // test
    });
  });

  describe('Accessibility', () => {
    it('should pass axe accessibility tests', async () => {
      // test
    });
  });

  describe('User Interactions', () => {
    it('should handle click events', () => {
      // test
    });
  });
});
```

### Test Requirements

- ✅ All tests must pass before PR
- ✅ No skipped tests without documentation
- ✅ Accessibility tests are mandatory
- ✅ Coverage should not decrease

## Documentation

### Component Documentation

Every component needs:

1. **README.mdx** - User-facing documentation with:
   - Description and purpose
   - Usage examples
   - Props/attributes table
   - Events table
   - Accessibility notes
   - Links to USWDS documentation

2. **Storybook Stories** - Interactive examples showing:
   - Default story
   - All variants and states
   - Interactive controls for all properties

3. **Inline Comments** - Code documentation explaining:
   - Why, not what (code should be self-documenting)
   - Complex logic or USWDS-specific patterns
   - Links to USWDS source code

### Documentation Standards

- Use clear, concise language
- Include code examples
- Link to official USWDS documentation
- Keep documentation in sync with code

## Pull Request Process

### Before Submitting

```bash
# 1. Sync with upstream
git fetch upstream
git rebase upstream/main

# 2. Run all validations
npm run lint
npm run typecheck
npm test
npm run validate:uswds-compliance

# 3. Build successfully
npm run build
```

### PR Guidelines

1. **Title Format**: Use conventional commits
   - `feat(component): add new button variant`
   - `fix(modal): resolve focus trap issue`
   - `docs(readme): update installation instructions`
   - `test(accordion): add keyboard navigation tests`

2. **Description**: Include
   - Summary of changes
   - Issue reference (e.g., "Fixes #123")
   - Testing performed
   - Screenshots/GIFs for UI changes
   - Breaking changes (if any)

3. **Commits**:
   - Keep commits focused and atomic
   - Use meaningful commit messages
   - Squash "fixup" or "WIP" commits before submitting

4. **Size**: Keep PRs reasonably small
   - Large PRs should be discussed first
   - Consider breaking into smaller PRs

### PR Template

```markdown
## Description
Brief description of changes

## Related Issue
Fixes #(issue number)

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Component tests pass (if applicable)
- [ ] Accessibility tests pass
- [ ] Tested in Storybook
- [ ] Manual testing performed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All CI checks passing
```

### Review Process

1. **Automated Checks**: CI must pass (tests, lint, type check, build)
2. **Code Review**: At least one maintainer approval required
3. **Testing**: Reviewers will test changes locally if needed
4. **Discussion**: Address feedback and questions
5. **Merge**: Maintainer will merge when approved

## Coding Standards

### TypeScript Style

- Use TypeScript for all new code
- Properly type all functions and variables
- Use `interface` for public APIs
- Use `type` for internal implementations

### Naming Conventions

- Components: PascalCase (e.g., `USAButton`)
- Files: kebab-case (e.g., `usa-button.ts`)
- Properties: camelCase (e.g., `isDisabled`)
- CSS classes: USWDS classes only (e.g., `usa-button`)

### Code Organization

```
src/components/button/
├── usa-button.ts           # Main component
├── usa-button.stories.ts   # Storybook stories
├── usa-button.test.ts      # Unit tests
├── usa-button.cy.ts        # Component tests (if needed)
├── README.mdx              # Documentation
└── index.ts                # Exports
```

### ESLint & Prettier

- Code is automatically formatted with Prettier on commit
- ESLint enforces code quality rules
- Fix linting errors: `npm run lint:fix`
- Format code: `npm run format`

### Pre-commit Hooks

The project uses Husky to run automated checks before commit:

1. Repository organization cleanup
2. Script organization
3. USWDS script tag validation
4. Layout forcing pattern
5. Component issue detection
6. USWDS compliance validation
7. Linting
8. TypeScript compilation
9. Code quality review
10. AI code quality validation
11. Documentation synchronization

**If pre-commit fails:**
1. Read the error message carefully
2. Fix the issue
3. Re-attempt the commit
4. Don't use `--no-verify` unless absolutely necessary (and document why)

## Component Architecture Guidelines

### USWDS Integration Pattern

Our components follow the **Script Tag Pattern**:

1. USWDS is loaded globally via `<script>` tag
2. Components render HTML structure
3. USWDS JavaScript enhances automatically
4. Components sync with USWDS state

**Never:**
- Remove USWDS script tag
- Use ES module imports for USWDS
- Create custom styles
- Use Shadow DOM
- Override USWDS classes

### Light DOM Requirement

All components MUST use Light DOM:

```typescript
// ✅ CORRECT
protected createRenderRoot() {
  return this; // Light DOM
}

// ❌ WRONG - DO NOT USE SHADOW DOM
// (default LitElement behavior)
```

### Minimal Code Philosophy

Only add code that is necessary for web component functionality:

- Property/attribute bindings
- Event handling
- USWDS state synchronization
- Accessibility enhancements (if missing from USWDS)

## Questions or Need Help?

- **Check documentation**: [CLAUDE.md](CLAUDE.md), [docs/](docs/)
- **Search existing issues**: Someone may have asked the same question
- **Create a discussion**: For design questions or architectural decisions (https://github.com/barbaradenney/USWDS-webcomponents/discussions)
- **Create an issue**: For bugs, feature requests, or specific questions (https://github.com/barbaradenney/USWDS-webcomponents/issues)
- **Ask maintainers**: Tag maintainers in your issue/PR

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to making government websites more accessible and maintainable! 🎉

<!-- Generated from .project-metadata.json on 2025-10-18 -->
