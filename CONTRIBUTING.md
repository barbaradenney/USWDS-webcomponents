# Contributing to USWDS Web Components

Thank you for your interest in contributing to USWDS Web Components! This document provides guidelines and instructions for contributing to this project.

## 🔥 Quick Start

**New to this project?** Start here:

1. **📖 [Git Workflow Guide](docs/GIT_WORKFLOW.md)** - REQUIRED READING
   - Branching strategy (main vs feature branches)
   - Pull request process
   - Release workflow
   - Common scenarios and best practices

2. **Read this guide** (CONTRIBUTING.md) for development standards

3. **Check [CLAUDE.md](CLAUDE.md)** for component-specific guidelines

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Git Workflow](#git-workflow)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Documentation](#documentation)
- [Getting Help](#getting-help)

## Code of Conduct

This project follows the [Contributor Covenant](https://www.contributor-covenant.org/) Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## Git Workflow

**⚠️ IMPORTANT**: This project uses GitHub Flow with protected `main` branch.

### Key Rules

1. **Never commit directly to `main`** - All changes via pull requests
2. **Create feature branches** - Use descriptive names with prefixes
3. **Keep PRs focused** - One feature/fix per PR (200-400 lines ideal)
4. **All tests must pass** - Pre-commit hooks enforce quality standards
5. **Get code review** - At least 1 approval required

### Quick Workflow

```bash
# 1. Create branch from main
git checkout main && git pull origin main
git checkout -b feature/123-my-feature

# 2. Make changes and commit
git add .
git commit -m "feat(component): add feature"

# 3. Push and create PR
git push -u origin feature/123-my-feature
gh pr create --base main

# 4. After merge, clean up
git checkout main && git pull origin main
git branch -d feature/123-my-feature
```

### Branch Naming

Use these prefixes:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation
- `refactor/` - Code refactoring
- `test/` - Test additions
- `chore/` - Maintenance
- `hotfix/` - Urgent production fixes

**See [Git Workflow Guide](docs/GIT_WORKFLOW.md) for complete details**, including:
- Branching strategy
- PR process
- Release workflow
- Hotfix procedures
- Branch protection rules
- Common scenarios

## Getting Started

### Prerequisites

- **Node.js**: v18 or higher
- **pnpm**: v10.15.0 (required for monorepo)
- **Git**: Latest version recommended

### Quick Start

```bash
# 1. Fork the repository on GitHub
# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/USWDS-webcomponents.git
cd USWDS-webcomponents

# 3. Add upstream remote
git remote add upstream https://github.com/barbaradenney/USWDS-webcomponents.git

# 4. Install dependencies
pnpm install

# 5. Create a feature branch
git checkout -b feature/my-new-feature
```

## Development Setup

### Installation

```bash
# Install all dependencies (uses pnpm workspaces)
pnpm install

# Install USWDS dependencies
pnpm run uswds:init

# Compile USWDS styles
pnpm run uswds:compile
```

### Available Scripts

```bash
# Development
pnpm run dev                  # Start development server
pnpm run storybook            # Start Storybook (port 6006)

# Building
pnpm run build                # Build all packages
pnpm run build:css            # Compile USWDS CSS

# Testing
pnpm test                     # Run unit tests
pnpm run test:visual          # Run visual regression tests
pnpm run test:browser         # Run browser tests (Playwright)
pnpm run cypress:open         # Open Cypress for component testing

# Quality Checks
pnpm run lint                 # Check linting
pnpm run typecheck            # Check TypeScript
pnpm run validate             # Run all validations

# Component Generation
pnpm run generate:component --interactive  # Generate new component
```

### Monorepo Structure

This is a pnpm workspace monorepo:

```
packages/
├── uswds-wc-core/          # Core utilities and base components
├── uswds-wc-actions/       # Action components (buttons, links)
├── uswds-wc-forms/         # Form components
├── uswds-wc-navigation/    # Navigation components
├── uswds-wc-data-display/  # Data display components
├── uswds-wc-feedback/      # Feedback components (alerts, modals)
├── uswds-wc-layout/        # Layout components
├── uswds-wc-structure/     # Structure components (accordion)
└── uswds-wc-test-utils/    # Shared test utilities
```

## Making Changes

> **Note**: See [Git Workflow Guide](docs/GIT_WORKFLOW.md) for complete branching strategy and workflow details.

### Component Development

#### Creating a New Component

```bash
# Interactive mode (recommended)
pnpm run generate:component --interactive

# Follow prompts to select:
# - Component name
# - Category (forms, actions, navigation, etc.)
# - Template (basic, form, interactive)
```

Generated files:
```
packages/uswds-wc-[category]/src/components/[component]/
├── usa-[component].ts              # Component implementation
├── usa-[component].test.ts         # Unit tests
├── usa-[component].stories.ts      # Storybook stories
├── README.mdx                      # Component documentation
└── index.ts                        # Exports
```

#### Component Requirements

All components MUST:

1. **Extend `USWDSBaseComponent`** or `LitElement`
2. **Use Light DOM** (no Shadow DOM)
3. **Follow USWDS HTML structure** exactly
4. **Use USWDS CSS classes** directly (no custom CSS beyond `:host`)
5. **Include comprehensive tests**
6. **Have Storybook stories**
7. **Include component README.mdx**

Example component structure:

```typescript
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { USWDSBaseComponent } from '@uswds-wc/core';

@customElement('usa-button')
export class USAButton extends USWDSBaseComponent {
  @property({ type: String }) variant: 'primary' | 'secondary' = 'primary';

  protected render() {
    return html`
      <button class="usa-button usa-button--${this.variant}">
        <slot></slot>
      </button>
    `;
  }
}
```

## Pull Request Process

### Before Submitting

1. **Run all checks**:
   ```bash
   pnpm test                  # All tests must pass
   pnpm run lint              # No linting errors
   pnpm run typecheck         # No TypeScript errors
   pnpm run validate          # All validations pass
   ```

2. **Update documentation**:
   - Component README.mdx
   - CHANGELOG.md (if significant change)
   - Storybook stories

3. **Add tests**:
   - Unit tests for all new functionality
   - Visual regression tests (if UI changes)
   - Cypress tests (if interactive behavior)

### Submitting a PR

1. **Push your branch**:
   ```bash
   git push origin feature/my-new-feature
   ```

2. **Create Pull Request** on GitHub
   - Use the PR template (auto-populated)
   - Link to any related issues
   - Add screenshots/videos for UI changes
   - Mark as draft if work-in-progress

3. **Wait for CI/CD checks**:
   - ✅ Visual regression tests (Chromatic)
   - ✅ Unit tests
   - ✅ Linting and TypeScript
   - ✅ Browser tests (Playwright)
   - ✅ Component tests (Cypress)

4. **Address feedback**:
   - Respond to review comments
   - Make requested changes
   - Request re-review when ready

5. **Merge**:
   - Maintainers will merge once approved
   - Your PR will be squashed into a single commit

### Versioning and Releases

This project uses [Changesets](https://github.com/changesets/changesets) for automated versioning and changelog generation.

#### Creating a Changeset

When making changes that affect the public API, add a changeset:

```bash
# Interactive mode (recommended)
pnpm changeset

# Follow prompts to:
# 1. Select packages affected
# 2. Choose version bump type (major/minor/patch)
# 3. Write a summary of changes
```

**When to create changesets:**
- **major**: Breaking changes (incompatible API changes)
- **minor**: New features (backwards-compatible)
- **patch**: Bug fixes (backwards-compatible)

**Example changeset** (`.changeset/my-feature.md`):
```markdown
---
"@uswds-wc/forms": minor
"@uswds-wc/core": patch
---

Add new text-area component with auto-resize feature
```

#### Release Process

Releases are **fully automated**:

1. **Merge PR**: When PR with changeset merges to `main`
2. **Release PR**: Changesets bot creates "Version Packages" PR
3. **Changelog**: Automatically generated from changesets
4. **Publish**: Merging release PR publishes to npm automatically

**Maintainers only**: The Release PR:
- Updates package versions
- Updates CHANGELOG.md files
- Can accumulate multiple changesets
- Publishes to npm when merged

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict type checking
- Avoid `any` types
- Properly type all function parameters and return values

### Code Style

We use ESLint and Prettier for consistent code style:

```bash
# Check formatting
pnpm run lint

# Auto-fix formatting issues
pnpm run lint:fix

# Format with Prettier
pnpm run format
```

**Key conventions:**
- Use 2 spaces for indentation
- Use single quotes for strings
- Add trailing commas
- Max line length: 120 characters
- Use arrow functions for callbacks

### Component Patterns

**✅ DO:**
- Use USWDS CSS classes directly
- Follow USWDS HTML structure
- Compose from other USWDS components
- Use Light DOM
- Include ARIA attributes
- Support keyboard navigation

**❌ DON'T:**
- Create custom CSS (beyond `:host` display)
- Use Shadow DOM
- Duplicate component HTML inline
- Override USWDS styles
- Add unnecessary JavaScript

## Testing Requirements

### Test Types

All changes must include appropriate tests:

#### 1. Unit Tests (Vitest)

Located: `*.test.ts` files

```typescript
import { describe, it, expect } from 'vitest';
import './usa-button.js';

describe('USAButton', () => {
  it('should render with primary variant', async () => {
    const button = document.createElement('usa-button');
    button.variant = 'primary';
    document.body.appendChild(button);

    await button.updateComplete;

    expect(button.querySelector('.usa-button--primary')).toBeTruthy();
  });
});
```

#### 2. Visual Regression Tests (Playwright)

For UI changes, add/update visual tests:

```bash
# Run visual tests
pnpm run test:visual

# Update snapshots (after verifying changes)
pnpm run test:visual:baseline
```

#### 3. Component Tests (Cypress)

For interactive behavior:

```bash
# Open Cypress
pnpm run cypress:open

# Run tests headless
pnpm run cypress:run
```

### Coverage Requirements

- **Minimum coverage**: 80% for new code
- **Critical paths**: 100% coverage
- Run `pnpm run test:coverage` to check

## Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding/updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

### Scope

The package or component affected:
- `button`
- `modal`
- `forms`
- `ci`
- `docs`

### Examples

```
feat(button): add size variant support

- Add small, medium, and large size options
- Update Storybook stories
- Add tests for all sizes

Closes #123
```

```
fix(modal): correct keyboard trap behavior

- Fix focus management in modal
- Ensure Escape key closes modal
- Add regression test

Fixes #456
```

## Documentation

### Component Documentation

Each component must have `README.mdx`:

```markdown
# USA Button

## Usage

\`\`\`html
<usa-button variant="primary">Click Me</usa-button>
\`\`\`

## Properties

| Property  | Type     | Default     | Description        |
|-----------|----------|-------------|--------------------|
| variant   | string   | 'primary'   | Button style       |

## Events

| Event     | Detail   | Description           |
|-----------|----------|-----------------------|
| click     | none     | Fired when clicked    |

## Accessibility

- Supports keyboard navigation
- Proper ARIA labels
- Focus visible
```

### Storybook Stories

All components need stories:

```typescript
import type { Meta, StoryObj } from '@storybook/web-components';
import './usa-button.js';

const meta: Meta = {
  title: 'Actions/Button',
  component: 'usa-button',
  parameters: { layout: 'padded' },
};

export default meta;

export const Primary: StoryObj = {
  args: { variant: 'primary' },
  render: (args) => html`
    <usa-button variant="${args.variant}">
      Click Me
    </usa-button>
  `,
};
```

## Getting Help

### Resources

- **Documentation**: See `docs/` directory
- **Architecture**: `docs/ARCHITECTURE_PATTERNS.md`
- **Testing Guide**: `docs/TESTING_GUIDE.md`
- **USWDS Integration**: `docs/USWDS_INTEGRATION_GUIDE.md`

### Communication

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and ideas
- **Pull Requests**: For code contributions

### Questions?

- Check existing documentation first
- Search existing issues
- Create a new issue if needed
- Tag with `question` label

## Recognition

Contributors will be recognized in:
- CHANGELOG.md
- GitHub Contributors page
- Release notes

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (see LICENSE file).

---

Thank you for contributing to USWDS Web Components! 🎉
