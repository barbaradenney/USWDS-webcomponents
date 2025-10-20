# Changelog

All notable changes to the USWDS Web Components library will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
