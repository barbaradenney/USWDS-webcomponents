# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-10-23

### 🚀 **MAJOR RELEASE: Monorepo Migration**

This release represents a significant architectural evolution - migrating from a single-package structure to a modern pnpm workspace monorepo with category-based packages.

### ⚠️ **BREAKING CHANGES**

#### Package Structure
- **Old**: Single package `uswds-webcomponents`
- **New**: Monorepo with category-based packages:
  - `@uswds-wc/core` - Core utilities and shared functionality
  - `@uswds-wc/actions` - Button, button-group, link, search
  - `@uswds-wc/data-display` - Table, card, collection, list, icon-list, summary-box, tag, icon
  - `@uswds-wc/feedback` - Alert, site-alert, modal, tooltip, banner
  - `@uswds-wc/forms` - All 15 form components
  - `@uswds-wc/layout` - Prose, process-list, step-indicator, identifier
  - `@uswds-wc/navigation` - Header, footer, breadcrumb, pagination, side-nav, in-page-nav, skip-link, language-selector
  - `@uswds-wc/structure` - Accordion
  - `@uswds-wc/test-utils` - Shared test utilities

#### Import Changes
**Before (v1.x)**:
```javascript
import 'uswds-webcomponents/forms';
import { USAButton } from 'uswds-webcomponents/actions';
```

**After (v2.0)**:
```javascript
import '@uswds-wc/forms';
import { USAButton } from '@uswds-wc/actions';
```

### ✨ **New Features**

#### Workspace Architecture
- **pnpm Workspaces**: Modern monorepo management with workspace protocol
- **Category-Based Packages**: Each USWDS category is now its own publishable package
- **Independent Versioning**: Packages can be versioned independently (prepared for future)
- **Optimized Dependencies**: Shared dependencies through workspace protocol
- **Better Tree-Shaking**: Import only the categories you need

#### Developer Experience
- **Faster Installs**: pnpm's efficient dependency management
- **Better IDE Support**: Clearer package boundaries and imports
- **Isolated Testing**: Test packages independently
- **Modular Builds**: Build individual packages or entire monorepo
- **Improved Type Checking**: Per-package type definitions

### 🔧 **Infrastructure Improvements**

#### Build System
- Updated Storybook configuration for monorepo structure
- Added Rollup aliases for cross-package CSS imports
- Optimized build performance with package-level builds
- Enhanced Vite configuration for monorepo compatibility

#### Validation & Testing
- Updated all validation scripts for monorepo structure:
  - `validate-attribute-mapping.js` - Scans all packages
  - `validate-story-styles.js` - Finds stories across packages
  - `validate-component-javascript.js` - Cross-package validation
  - `validate-no-skipped-tests.cjs` - Updated paths
  - `auto-detect-component-issues.js` - Performance optimized (2min vs hanging)
  - `validate-image-links.js` - Fixed glob imports

#### Quality Assurance
- All 11 pre-commit validation stages updated and passing
- Linting configuration updated for monorepo (258 errors → 0)
- TypeScript compilation verified across all packages
- Documentation sync validation for monorepo structure

### 🐛 **Bug Fixes**

- Fixed button layout test icon imports for cross-package boundaries
- Removed duplicate `firstUpdated` in date-range-picker
- Fixed component issue detection hanging (O(n²) → O(n) optimization)
- Updated glob imports for CommonJS compatibility
- Fixed cross-package component imports in tests

### 📚 **Documentation**

- Comprehensive monorepo migration guide in `docs/MONOREPO_MIGRATION_GUIDE.md`
- Updated all package README files
- Updated component count validation (45 components)
- Updated npm package references to `uswds-webcomponents-monorepo`

### 🎯 **Migration Guide**

For existing users upgrading from v1.x to v2.0:

1. **Update package references**:
   ```bash
   # Before
   npm install uswds-webcomponents

   # After
   npm install @uswds-wc/actions @uswds-wc/forms @uswds-wc/navigation
   # (install only the categories you need)
   ```

2. **Update imports** in your code:
   ```javascript
   // Before
   import { USAButton } from 'uswds-webcomponents/actions';

   // After
   import { USAButton } from '@uswds-wc/actions';
   ```

3. **Review dependencies**: Check that all required category packages are installed

### 📦 **Package Information**

- **Monorepo Root**: `uswds-webcomponents-monorepo@2.0.0`
- **Category Packages**: All versioned at `2.0.0`
- **Package Manager**: pnpm >=8.0.0 required
- **Node Version**: >=18.0.0 required

### ⚙️ **Technical Details**

- **Workspace Protocol**: Uses `workspace:*` for internal dependencies
- **Build Tool**: Vite with enhanced monorepo support
- **Test Runner**: Vitest with monorepo test discovery
- **Components**: All 45 USWDS components maintained
- **Test Coverage**: 2299/2301 tests passing (99.9%)
- **USWDS Compliance**: 100% maintained

### 🔮 **Future Roadmap**

This monorepo structure enables:
- Independent package versioning
- Scoped npm publishing (@uswds-wc/* packages)
- Better dependency management
- Easier contribution workflow
- Potential for additional packages (templates, patterns, utilities)

---

## [1.0.2] - 2025-10-20

### 🐛 Bug Fixes

**Light DOM Slot Handling** - Fixed slotted content bugs across 5 components by migrating to proven light DOM slot pattern:
- **summary-box**: Applied proven slot pattern, fixed 2 failing tests (39/39 tests passing)
- **tag**: Migrated to proven pattern (52/52 tests passing)
- **site-alert**: Migrated to proven pattern (57/57 tests passing)
- **process-list**: Migrated with always-render-container fix (53/53 tests passing)
- **side-navigation**: Migrated with always-render-container fix (36/36 tests passing)

**Pattern Details**:
- CSS hide rule for duplicate slotted elements: `:host > [slot] { display: none !important; }`
- Manual slot projection in `moveSlottedContent()` method
- DocumentFragment for safe DOM manipulation
- Always render container elements to prevent HierarchyRequestError

**Test Coverage**: 378/379 tests passing (99.7%) - Modal's 1 failure is pre-existing

### 🔧 Improvements

**Release Process Automation**:
- Added NPM_TOKEN verification to release workflow (fails fast if missing)
- Updated release documentation to emphasize automated workflow is REQUIRED
- Added guide for republishing missed versions
- Deprecated manual release process

**Validation System**:
- Fixed CSS validation to strip comments before parsing
- Added exception for `:host > [slot]` selector (essential light DOM functionality)

### 📚 Documentation

- Updated RELEASE_PROCESS.md with mandatory automated workflow guidance
- Added "Republishing Missed Versions" section
- Clarified NPM token setup requirements
- Improved release workflow troubleshooting

## [1.0.0] - 2025-10-18

### 🎉 Initial Release

The first production-ready release of USWDS Web Components - a comprehensive, fully-tested library of all 45 USWDS components as modern web components.

### ✨ Features

#### Components (45 Total)
- **Forms & Inputs (15)**: text-input, textarea, checkbox, radio, select, file-input, date-picker, date-range-picker, time-picker, memorable-date, combo-box, range-slider, character-count, validation, input-prefix-suffix
- **Navigation (8)**: header, footer, breadcrumb, pagination, side-navigation, in-page-navigation, skip-link, language-selector
- **Data Display (8)**: table, collection, card, list, icon-list, summary-box, tag, icon
- **Feedback (5)**: alert, site-alert, modal, tooltip, banner
- **Actions (4)**: button, button-group, link, search
- **Layout (4)**: prose, process-list, step-indicator, identifier
- **Structure (1)**: accordion

#### Architecture & Developer Experience
- **MUI-Style Package Organization**: Category-based imports (forms, navigation, data-display, feedback, actions, layout, structure)
- **Enhanced Tree-Shaking**: Import by category or individual components
- **TypeScript Support**: Full type definitions with named imports
- **Multiple Import Patterns**:
  - Individual: `import 'uswds-webcomponents/components/button'`
  - Category: `import 'uswds-webcomponents/forms'`
  - Named: `import { USAButton } from 'uswds-webcomponents/actions'`
- **Optimized Bundles**: Category bundles range from 0.12 KB to 0.47 KB
- **Future-Ready**: Prepared for multi-package evolution (v2.0+)

#### Quality & Testing
- **2301/2301 Tests Passing**: 100% test success rate
- **Zero Test Failures**: Maintained with automated monitoring
- **4-Layer Testing**: Unit, component, accessibility, USWDS compliance
- **Comprehensive Coverage**: All components fully tested
- **Accessibility**: WCAG 2.1 AA compliant

#### USWDS Compliance
- **100% USWDS 3.13.0 Compliance**: True 1:1 functionality
- **Official CSS Only**: Zero custom styles, pure USWDS implementation
- **Progressive Enhancement**: Works as HTML, enhances with USWDS JS
- **Light DOM**: Maximum USWDS compatibility
- **Script Tag Pattern**: Global USWDS loading for consistency

#### Documentation
- **Component Catalog**: Complete COMPONENTS.md reference
- **README with Examples**: Category-organized with code samples
- **Storybook Documentation**: Interactive examples for all components
- **Component READMEs**: Individual documentation per component

### 🔧 Infrastructure

- Automated pre-commit validation (11 stages)
- AI code quality validation
- Documentation lifecycle management
- Bundle size optimization
- Service worker support
- CSS tree-shaking
- NPM package ready for distribution

### 📦 Distribution

- Package: `uswds-webcomponents@1.0.0`
- Repository: https://github.com/barbaramiles/USWDS-webcomponents
- License: Apache-2.0
- Dependencies: `lit` (peer dependency)
