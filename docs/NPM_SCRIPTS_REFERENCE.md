# NPM Scripts Reference Guide

This document provides a complete reference for all npm scripts available in the USWDS Web Components project. Scripts are organized by category for easy navigation.

## Quick Start Commands

The most commonly used commands for daily development:

```bash
npm run dev          # Start development server
npm run storybook    # Start Storybook for component development
npm run test         # Run unit tests
npm run build        # Build for production
npm run quality:check # Run all quality checks before commit
```

## Complete Script Reference

### 🚀 DEVELOPMENT

Scripts for local development and preview.

| Command             | Description                      | Usage                                     |
| ------------------- | -------------------------------- | ----------------------------------------- |
| `npm run dev`       | Start Vite development server    | Use for local development with hot reload |
| `npm run preview`   | Preview production build locally | Test production build before deployment   |
| `npm run storybook` | Start Storybook on port 6006     | Component development and visual testing  |

### 🏗️ BUILD & COMPILE

Production build and compilation scripts.

| Command                   | Description                                | Usage                                |
| ------------------------- | ------------------------------------------ | ------------------------------------ |
| `npm run build`           | TypeScript compile + Vite production build | Create production bundle             |
| `npm run build:watch`     | Build in watch mode                        | Continuous builds during development |
| `npm run build-storybook` | Build static Storybook site                | Deploy Storybook documentation       |
| `npm run typecheck`       | Run TypeScript type checking               | Verify type safety without building  |

### 🧪 TESTING

Unit testing with Vitest.

| Command                 | Description                   | Usage                      |
| ----------------------- | ----------------------------- | -------------------------- |
| `npm run test`          | Run all unit tests            | Standard test execution    |
| `npm run test:ui`       | Open Vitest UI interface      | Interactive test debugging |
| `npm run test:coverage` | Generate test coverage report | Check test completeness    |
| `npm run test:ci`       | Run tests in CI mode          | For continuous integration |

### ✨ CODE QUALITY

Linting, formatting, and quality checks.

| Command                 | Description                      | Usage                            |
| ----------------------- | -------------------------------- | -------------------------------- |
| `npm run lint`          | Run ESLint on source files       | Check for code issues            |
| `npm run lint:fix`      | Auto-fix ESLint issues           | Fix formatting and simple errors |
| `npm run format`        | Format code with Prettier        | Apply consistent code style      |
| `npm run format:check`  | Check formatting without changes | Verify code style compliance     |
| `npm run quality:check` | Run tests + typecheck + lint     | **Pre-commit quality gate**      |

### 🔬 E2E TESTING

End-to-end testing with Cypress.

| Command                | Description                         | Usage                       |
| ---------------------- | ----------------------------------- | --------------------------- |
| `npm run cypress:open` | Open Cypress interactive runner     | Develop and debug E2E tests |
| `npm run cypress:run`  | Run Cypress tests headlessly        | Run all E2E tests in CI     |
| `npm run e2e`          | Start Storybook + run Cypress tests | Full E2E test suite         |
| `npm run e2e:open`     | Start Storybook + open Cypress      | Interactive E2E development |

### 🎨 USWDS INTEGRATION

USWDS build system integration.

| Command                 | Description                     | Usage                          |
| ----------------------- | ------------------------------- | ------------------------------ |
| `npm run uswds:init`    | Initialize USWDS build setup    | First-time USWDS configuration |
| `npm run uswds:compile` | Compile USWDS styles            | Build USWDS CSS                |
| `npm run uswds:watch`   | Watch and compile USWDS changes | Auto-rebuild USWDS styles      |

### 🔧 COMPONENT GENERATION

Tools for creating new components.

| Command                      | Description                         | Usage                           |
| ---------------------------- | ----------------------------------- | ------------------------------- |
| `npm run generate:component` | Create new component with all files | Interactive component generator |

### 📚 DOCUMENTATION

Documentation generation and validation.

| Command                 | Description                     | Usage                       |
| ----------------------- | ------------------------------- | --------------------------- |
| `npm run docs:help`     | Display documentation locations | Quick reference to all docs |
| `npm run docs:validate` | Validate documentation files    | Check doc consistency       |
| `npm run docs:sync`     | Sync component documentation    | Update component READMEs    |
| `npm run docs:generate` | Generate Storybook docs         | Create MDX documentation    |

### 📝 CHANGELOG MANAGEMENT

Manage component changelogs.

| Command                      | Description                        | Usage                       |
| ---------------------------- | ---------------------------------- | --------------------------- |
| `npm run changelog:init`     | Initialize changelog for component | Create new changelog        |
| `npm run changelog:update`   | Update component changelogs        | Add new entries             |
| `npm run changelog:validate` | Validate changelog format          | Check changelog consistency |

### 🛠️ MAINTENANCE

Scripts and package.json maintenance.

| Command                 | Description                       | Usage                     |
| ----------------------- | --------------------------------- | ------------------------- |
| `npm run scripts:check` | Check for orphaned/unused scripts | Find maintenance issues   |
| `npm run scripts:clean` | Auto-fix script issues            | Clean up orphaned scripts |
| `npm run audit:tests`   | Audit critical test coverage      | Verify test completeness  |
| `npm run quality-check` | Alternative quality check script  | Run comprehensive checks  |

### 💬 COMMIT HELPERS

Tools for creating better commits.

| Command                | Description                   | Usage                          |
| ---------------------- | ----------------------------- | ------------------------------ |
| `npm run commit`       | Interactive commit helper     | Guided commit message creation |
| `npm run commit:smart` | Smart commit with auto-checks | Intelligent commit assistance  |

### 🔄 GIT HOOKS (AUTO-RUN)

These run automatically via Husky - no manual execution needed.

| Command              | Description             | When It Runs        |
| -------------------- | ----------------------- | ------------------- |
| `npm run prepare`    | Install Husky git hooks | After `npm install` |
| `npm run pre-commit` | Run lint-staged         | Before each commit  |

## Script Execution Flow

### Development Workflow

```bash
npm run dev          # Start development
npm run test         # Run tests while developing
npm run storybook    # Visual component testing
```

### Before Committing

```bash
npm run quality:check  # Runs all checks
# OR manually:
npm run test          # Run tests
npm run typecheck     # Check types
npm run lint          # Check code quality
npm run format:check  # Verify formatting
```

### Building for Production

```bash
npm run build         # Create production build
npm run preview       # Test production build locally
```

### Component Development

```bash
npm run generate:component  # Create new component
npm run storybook          # Develop component visually
npm run test:ui            # Test component interactively
```

## Environment Variables

Some scripts may use environment variables:

- `NODE_ENV`: Set automatically by build tools
- `CI`: Set in CI environments for optimized behavior

## Script Categories Explained

### Why Categories?

Scripts are organized into logical categories in package.json with comment headers like `"// DEVELOPMENT": ""`. This makes it easier to:

- Find the right script quickly
- Understand script purposes
- Maintain script organization

### Category Headers

The empty string comments (`"// CATEGORY": ""`) serve as visual separators in package.json. They don't execute but help organize the scripts visually.

## Troubleshooting

### Common Issues

**Script not found**:

- Run `npm install` to ensure all dependencies are installed
- Check if the script exists in package.json

**Permission denied**:

- Some scripts may need execution permissions
- Run `chmod +x scripts/*.js` if needed

**Out of memory**:

- Increase Node memory: `NODE_OPTIONS=--max-old-space-size=4096 npm run build`

**Port already in use**:

- Dev server (5173) or Storybook (6006) ports may be in use
- Kill the process or use a different port

## Related Documentation

- [Script Maintenance Guide](./SCRIPT_MAINTENANCE.md) - How to maintain scripts
- [Development Guide](./COMPONENT_DEVELOPMENT_GUIDE.md) - Component development workflow
- [Testing Documentation](./TESTING_DOCUMENTATION.md) - Testing strategies
- [CLAUDE.md](../CLAUDE.md) - AI assistant guidelines

## Adding New Scripts

When adding new npm scripts:

1. **Choose the right category** - Place under appropriate comment header
2. **Use consistent naming** - Follow `:` separator convention for sub-commands
3. **Keep it simple** - One script = one purpose
4. **Document it** - Update this reference guide
5. **Test it** - Ensure the script works in fresh environments

## Script Maintenance

Run periodic maintenance to keep scripts clean:

```bash
npm run scripts:check  # Weekly check for issues
npm run scripts:clean  # Fix orphaned scripts
```

See [Script Maintenance Guide](./SCRIPT_MAINTENANCE.md) for details.

### 🛠️ COMPONENT GENERATION

Scripts for generating new components with comprehensive scaffolding:

- **`npm run generate:enhanced`** - Enhanced component generator with 6 component types
  - Interactive prompts for component type, name, and configuration
  - Comprehensive test scaffolding (Vitest unit tests, Cypress component tests)
  - Automatic documentation generation (README, CHANGELOG with USWDS links)
  - TypeScript interface generation with design token support
  - Storybook story creation with comprehensive controls and examples
  - 10x faster component development with complete scaffolding

### 📚 DOCUMENTATION GENERATION

Scripts for generating interactive API documentation:

- **`npm run docs:generate`** - Generate interactive API documentation for a specific component
- **`npm run docs:generate:all`** - Generate interactive API documentation for all components
  - Live component documentation with real-time property controls
  - Interactive property manipulation with immediate visual feedback
  - Event monitoring dashboard with real-time event logging
  - Accessibility testing integration with live axe-core validation
  - Component navigation system with automatic discovery

## Quick Reference Card

### Daily Development

- `npm run dev` - Start dev server
- `npm run storybook` - Component development
- `npm run test` - Run tests

### Before Commit

- `npm run quality:check` - All checks
- `npm run commit` - Guided commit

### Production

- `npm run build` - Production build
- `npm run preview` - Test build

### Maintenance

- `npm run scripts:check` - Check health
- `npm run docs:validate` - Check docs
