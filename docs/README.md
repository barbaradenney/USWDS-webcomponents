# USWDS Web Components Documentation

**Complete documentation index and navigation**

---

## 🚀 Quick Start

- **New to the project?** Start with [Getting Started](#getting-started)
- **Need to test?** See [Testing Guide](guides/TESTING_GUIDE.md)
- **USWDS compliance?** See [Compliance Guide](guides/COMPLIANCE_GUIDE.md)
- **Creating components?** See [Component Development](#development-guides)

---

## 📚 Documentation Structure

### Getting Started

Essential documentation for new developers:

- **Installation**: See main `README.md` in repository root
- **Quick Start**: See main `CLAUDE.md` for command reference
- **Component Development**: [COMPONENT_DEVELOPMENT_GUIDE.md](COMPONENT_DEVELOPMENT_GUIDE.md)
- **Component Status**: [COMPONENT_STATUS.md](COMPONENT_STATUS.md)

---

## 📖 Core Guides

### Development Guides

#### Testing
- **[Testing Guide](guides/TESTING_GUIDE.md)** - Comprehensive testing reference
  - Unit testing with Vitest
  - Component testing with Cypress
  - E2E testing
  - Accessibility testing
  - Visual testing
  - Test expectations and best practices

- **[Cypress Guide](guides/CYPRESS_GUIDE.md)** - Complete Cypress testing reference
  - Setup and configuration
  - Writing component tests
  - Pre-commit integration
  - CI/CD workflows

#### USWDS Integration
- **[USWDS Integration Guide](USWDS_INTEGRATION_GUIDE.md)** - Complete USWDS integration reference
  - USWDS JavaScript debugging protocol
  - JavaScript references
  - Class automation
  - Compliance automation
  - Initial value pattern
  - Sync validation
  - Update checklist

- **[Compliance Guide](guides/COMPLIANCE_GUIDE.md)** - Ensuring USWDS compliance
  - Automated compliance checking
  - Class validation
  - Component architecture
  - JavaScript compliance
  - CSS compliance

#### Architecture & Patterns
- **[Architecture Patterns](ARCHITECTURE_PATTERNS.md)** - Comprehensive architecture guide
  - Component architecture
  - Testing strategies
  - Behavioral patterns
  - Browser compatibility


#### JavaScript
- **[JavaScript Guide](JAVASCRIPT_GUIDE.md)** - Complete JavaScript reference
  - Integration strategy
  - Integration validation
  - Validation system
  - Syntax best practices
  - Tree-shaking standards

- **[JavaScript Integration Strategy](JAVASCRIPT_INTEGRATION_STRATEGY.md)** - Core integration approach

#### Quality & Performance
- **[Code Quality Architectural Review](CODE_QUALITY_ARCHITECTURAL_REVIEW.md)** - Automated architectural review (NEW!)
  - Birds-eye view analysis of code approach
  - USWDS integration pattern validation
  - Over-engineering detection
  - Simpler alternative suggestions
  - Architecture decision alignment

- **[Debugging Guide](DEBUGGING_GUIDE.md)** - Comprehensive debugging reference
  - Common issues and solutions
  - Systematic troubleshooting
  - Component debugging
  - USWDS-specific issues

- **[Performance Guide](guides/PERFORMANCE_GUIDE.md)** - Performance optimization
  - Virtual scrolling
  - Memoization system
  - CSS code splitting
  - Bundle optimization
  - Performance monitoring

- **[Regression Prevention Guide](guides/REGRESSION_PREVENTION_GUIDE.md)** - Preventing regressions
  - Regression testing
  - High-risk validation
  - Multi-component prevention
  - Timing regression testing
  - Flaky test detection

---

## 🏗️ Architecture Decisions

Critical architecture decision records:

- **[Script Tag vs Component Init](ARCHITECTURE_DECISION_SCRIPT_TAG_VS_COMPONENT_INIT.md)** - MANDATORY pattern
- **[Accordion Behavior Approach](ARCHITECTURE_DECISION_ACCORDION_BEHAVIOR_APPROACH.md)** - Component-specific decision

---

## 🔧 Standards & Reference

### Code Standards
- **[NPM Scripts Reference](NPM_SCRIPTS_REFERENCE.md)** - All available npm commands
- **[Storybook Guide](guides/STORYBOOK_GUIDE.md)** - Complete Storybook reference
- **[Theming Guide](guides/THEMING_GUIDE.md)** - Component theming
- **[DOM Reference Safety](guides/DOM_REFERENCE_SAFETY_GUIDE.md)** - Safe DOM manipulation
- **[Lit Directive Best Practices](LIT_DIRECTIVE_BEST_PRACTICES.md)** - Lit framework patterns

### USWDS Standards
- **[USWDS Icon Guidelines](guides/USWDS_ICON_GUIDELINES.md)** - Icon usage
- **[USWDS Import Standards](guides/USWDS_IMPORT_STANDARDS.md)** - Import patterns

---

## 🎯 Component-Specific Documentation

Component-specific docs are co-located with components:

### Behavior Contracts (15 Components)

Components with vanilla JS implementations have USWDS behavior contracts:

```
src/components/
├── accordion/           USWDS_ACCORDION_BEHAVIOR_CONTRACT.md
├── banner/              USWDS_BANNER_BEHAVIOR_CONTRACT.md
├── character-count/     USWDS_CHARACTER_COUNT_BEHAVIOR_CONTRACT.md
├── combo-box/           USWDS_COMBO_BOX_BEHAVIOR_CONTRACT.md
├── date-picker/         USWDS_DATE_PICKER_BEHAVIOR_CONTRACT.md
├── file-input/          USWDS_FILE_INPUT_BEHAVIOR_CONTRACT.md
├── footer/              USWDS_FOOTER_BEHAVIOR_CONTRACT.md
├── header/              USWDS_HEADER_BEHAVIOR_CONTRACT.md
├── in-page-navigation/  USWDS_IN-PAGE_NAVIGATION_BEHAVIOR_CONTRACT.md
├── language-selector/   USWDS_LANGUAGE_SELECTOR_BEHAVIOR_CONTRACT.md
├── modal/               USWDS_MODAL_BEHAVIOR_CONTRACT.md
├── search/              USWDS_SEARCH_BEHAVIOR_CONTRACT.md
├── table/               USWDS_TABLE_BEHAVIOR_CONTRACT.md
├── time-picker/         USWDS_TIME_PICKER_BEHAVIOR_CONTRACT.md
└── tooltip/             USWDS_TOOLTIP_BEHAVIOR_CONTRACT.md
```

### Other Component Docs

```
src/components/
├── combo-box/           COMBO_BOX_REGRESSION_PREVENTION.md
├── tooltip/             TOOLTIP_TROUBLESHOOTING_PREVENTION_SYSTEM.md
└── footer/              USWDS_FOOTER_ALIGNMENT_GUIDE.md
```

---

## 📊 Status & Progress

- **[Component Status](COMPONENT_STATUS.md)** - Implementation status and tracking
- **Archived Reports**: See [archived/](archived/) for historical status reports

---

## 🗂️ Documentation Organization

### Active Documentation (66 essential files)
All essential, actively maintained documentation lives in `docs/`.

### Archived Documentation (171+ files)
Historical status reports, completed investigations, and superseded strategies are preserved in `docs/archived/` for reference.

### Component Documentation (8 files)
Component-specific behavior contracts, regression prevention, and troubleshooting guides are co-located in `src/components/[component]/`.

---

## 🔍 Finding What You Need

### I want to...

- **Create a new component** → [Component Development Guide](COMPONENT_DEVELOPMENT_GUIDE.md)
- **Write tests** → [Testing Guide](guides/TESTING_GUIDE.md)
- **Debug an issue** → [Debugging Guide](DEBUGGING_GUIDE.md)
- **Ensure USWDS compliance** → [Compliance Guide](guides/COMPLIANCE_GUIDE.md)
- **Understand architecture** → [Architecture Patterns](ARCHITECTURE_PATTERNS.md)
- **Integrate USWDS** → [USWDS Integration Guide](USWDS_INTEGRATION_GUIDE.md)
- **Write JavaScript** → [JavaScript Guide](JAVASCRIPT_GUIDE.md)
- **Use Cypress** → [Cypress Guide](guides/CYPRESS_GUIDE.md)
- **Optimize performance** → [Performance Guide](guides/PERFORMANCE_GUIDE.md)
- **Prevent regressions** → [Regression Prevention Guide](guides/REGRESSION_PREVENTION_GUIDE.md)
- **Understand code quality review** → [Code Quality Architectural Review](CODE_QUALITY_ARCHITECTURAL_REVIEW.md)

---

## 📝 Contributing to Documentation

### Documentation Standards

1. **Keep docs/ lean** - Aim for ≤70 active files
2. **Archive status reports** - Move completed reports to `archived/` immediately
3. **Co-locate component docs** - Component-specific docs go in `src/components/[component]/`
4. **Consolidate before adding** - Check if content fits in existing guide before creating new file
5. **Update this README** - Keep this index current when adding/moving docs

### Naming Conventions

- Guides: `[TOPIC]_GUIDE.md`
- Architecture: `ARCHITECTURE_DECISION_[NAME].md`
- Patterns: `[TOPIC]_PATTERNS.md`
- Reference: `[TOPIC]_REFERENCE.md`

---

## 🎓 Learning Path

### New Developer Path

1. Read repository root `README.md` (installation and overview)
2. Read `CLAUDE.md` (command reference and architecture overview)
3. Read [Component Development Guide](COMPONENT_DEVELOPMENT_GUIDE.md)
4. Read [Testing Guide](guides/TESTING_GUIDE.md)
5. Read [Debugging Guide](DEBUGGING_GUIDE.md)
6. Review [Component Status](COMPONENT_STATUS.md)
7. Check component-specific docs in `src/components/`

### Testing Path

1. [Testing Guide](guides/TESTING_GUIDE.md) - Overview
2. [Cypress Guide](guides/CYPRESS_GUIDE.md) - Interactive testing
3. [Debugging Guide](DEBUGGING_GUIDE.md) - Troubleshooting tests
4. [Regression Prevention Guide](guides/REGRESSION_PREVENTION_GUIDE.md) - Preventing issues

### USWDS Integration Path

1. [USWDS Integration Guide](USWDS_INTEGRATION_GUIDE.md) - Complete guide
2. [Compliance Guide](guides/COMPLIANCE_GUIDE.md) - Validation
3. [JavaScript Integration Strategy](JAVASCRIPT_INTEGRATION_STRATEGY.md) - Implementation

---

## 📞 Getting Help

- **Component issues?** Check component-specific docs in `src/components/[component]/`
- **Build/test issues?** See [Debugging Guide](DEBUGGING_GUIDE.md)
- **USWDS questions?** See [USWDS Integration Guide](USWDS_INTEGRATION_GUIDE.md)
- **Can't find something?** Check [archived/](archived/) for historical docs

---

## 📈 Recent Updates

### October 2025 - Documentation Consolidation (Phase 2 Complete)

- **55% reduction** in docs files (148 → 66 core files)
- **8 comprehensive guides** created/enhanced:
  - [Testing Guide](guides/TESTING_GUIDE.md) - Replaces 25+ testing docs
  - [Compliance Guide](guides/COMPLIANCE_GUIDE.md) - Replaces 27+ compliance docs
  - [Cypress Guide](guides/CYPRESS_GUIDE.md) - Complete Cypress reference
  - [Architecture Patterns](ARCHITECTURE_PATTERNS.md) - Consolidated patterns
  - [USWDS Integration Guide](USWDS_INTEGRATION_GUIDE.md) - Complete USWDS guide
  - [JavaScript Guide](JAVASCRIPT_GUIDE.md) - Complete JavaScript reference
  - [Performance Guide](guides/PERFORMANCE_GUIDE.md) - Performance optimization
  - [Regression Prevention Guide](guides/REGRESSION_PREVENTION_GUIDE.md) - Regression prevention
- **Component-specific docs** co-located with components
- **171+ historical docs** preserved in archive
- **Clear organization** and navigation structure

See [CONSOLIDATION_SUMMARY.md](CONSOLIDATION_SUMMARY.md) for full details.

---

**Last Updated**: 2025-10-07 (Phase 2 Complete)
**Total Active Docs**: 66 essential files (including 8 consolidated guides)
**Archived Docs**: 171+ files
**Component Docs**: 8 files
