# Test Failures Roadmap

## Overview

This document tracks all discovered test failures and the plan to address them.

---

## Phase 1: CI Blockers (CURRENT PRIORITY)

**Status:** 🔴 IN PROGRESS
**Target:** Get CI passing
**Timeline:** 4-6 hours
**Document:** `ACTUAL_CI_FAILURES_ANALYSIS.md`

### Failures to Fix

#### 1. Cypress Component Tests (40 failures)
- **Total Tests:** 458
- **Failing:** 40 (9%)
- **Exit Code:** 40

**Failing Test Files:**
1. `storybook-navigation-test.cy.ts` - 2 failures
2. `summary-box-content.cy.ts` - 4 failures
3. `time-picker-interactions.cy.ts` - 6 failures
4. 6 more test files - 28 failures

**Action Plan:**
- [x] Document failures
- [ ] Run Cypress tests locally
- [ ] Download CI screenshots
- [ ] Fix test issues
- [ ] Verify locally
- [ ] Push fix

**Commands:**
```bash
# Run locally
pnpm run test:cypress:component

# Download screenshots
gh run download 19509786946 -n cypress-screenshots
```

---

#### 2. Playwright Cross-Browser Timeouts (2 jobs)
- **Desktop:** Timed out after 45 minutes
- **Webkit + A11y:** Timed out after 45 minutes

**Action Plan:**
- [x] Document timeout
- [ ] Download Playwright reports
- [ ] Analyze slow tests
- [ ] Choose fix strategy:
  - **Option A:** Increase timeout to 60 min (quick fix)
  - **Option B:** Optimize slow tests (better)
  - **Option C:** Split test suite (best long-term)
- [ ] Implement fix
- [ ] Push fix

**Commands:**
```bash
# Download reports
gh run download 19509786946 -n playwright-report-desktop
gh run download 19509786946 -n playwright-test-results-desktop

# Analyze timing
cat playwright-test-results-desktop/results.json | jq '.suites[].specs[] | {name:.title, duration:.duration}'
```

---

## Phase 2: Comprehensive Test Suite (FUTURE)

**Status:** 📝 DOCUMENTED FOR LATER
**Target:** Improve overall test coverage and quality
**Timeline:** TBD (after CI is green)
**Document:** `COMPREHENSIVE_TEST_FAILURE_ANALYSIS.md`

### Background

While investigating CI failures, we ran `playwright.comprehensive.config.ts` locally and discovered **169 failures** in a comprehensive test suite that is **NOT part of the normal CI pipeline**. These tests provide additional coverage but are not blocking CI.

### Failures Discovered

**Total:** 169 failures out of 440 tests (38% failure rate)

#### 1. Progressive Enhancement Tests (52 failures - 31%)
**Test File:** `tests/progressive-enhancement/component-enhancement.spec.ts`

**Issue:** Tests expect components to work without JavaScript, but:
- Storybook requires JS to load
- Web components fundamentally require JS
- Tests timeout after 10+ seconds

**Categories:**
- No JavaScript Fallback (24 failures across 3 browsers)
  - Button, Accordion, Navigation without JS
- Limited Browser API Support (18 failures across 3 browsers)
  - Components without modern APIs
  - Date picker without JS date APIs
- Accessibility Preferences (9 failures across 3 browsers)
  - Screen reader navigation
  - High contrast mode
- Feature Detection (1 failure)

**Recommendation:** Skip these tests or implement server-side rendering for true progressive enhancement.

---

#### 2. Visual Regression Tests (81 failures - 48%)
**Test Files:**
- `tests/visual/responsive-theme.spec.ts` (34 failures)
- `tests/visual/components/character-count-visual.spec.ts` (13 failures)
- `tests/visual/uswds-compliance.spec.ts` (18 failures)
- `tests/visual/component-variants.spec.ts` (14 failures)
- `tests/visual/components/icon-visual.spec.ts` (9 failures)

**Issue:** Missing baseline screenshots (first-time run)

**Example Error:**
```
Error: A snapshot doesn't exist at tests/visual/responsive-theme.spec.ts-snapshots/header-mobile-visual-regression-darwin.png, writing actual.
```

**Affected Components:**
- Header, Footer, Navigation (all responsive breakpoints)
- Form Elements, Button Group, Table (all breakpoints)
- Character Count (13 variants)
- Icons (9 variants)
- USWDS Compliance (18 components)

**Fix:** Accept baseline screenshots
```bash
npx playwright test --update-snapshots --grep "visual|responsive"
git add tests/**/*.spec.ts-snapshots/
```

---

#### 3. API Contract Tests (12 failures - 7%)
**Test File:** `tests/api-contracts/component-contracts.spec.ts`

**Issue:** `querySelector()` returns `null` - components not found

**Example Error:**
```typescript
const button = document.querySelector('usa-button'); // Returns null
expect(buttonContract).toBeTruthy(); // FAILS
```

**Failing Tests:**
- Button Component API (4 tests)
  - Property API, Method API, Events, CSS custom properties
- Text Input Component API (2 tests)
- Accordion Component API (2 tests)
- Backward Compatibility (2 tests)
- TypeScript Interface Compliance (1 test)
- API Stability (1 test)

**Root Causes:**
- Components not registered when test runs
- Selector mismatch
- Timing issues (need `waitForSelector`)

**Fix:** Add `waitForSelector` and verify component registration
```typescript
await page.waitForSelector('usa-button');
await page.waitForFunction(() => customElements.get('usa-button') !== undefined);
```

---

#### 4. Other Tests (24 failures - 14%)

**Error Recovery Tests** (5 failures)
`tests/error-recovery/component-error-scenarios.spec.ts`

**Integration Tests** (7 failures)
- `tests/integration/form-integration.spec.ts` (4 failures)
- `tests/integration/component-interaction.spec.ts` (3 failures)

**Performance Tests** (4 failures)
- `tests/performance/component-performance.spec.ts` (3 failures)
- `tests/performance/performance-tests.spec.ts` (1 failure)

**Security Tests** (1 failure)
`tests/security/component-security.spec.ts`

**Status:** Need error details to diagnose

---

## Summary

### Immediate Priority (Phase 1)
✅ **40 Cypress failures** - Blocking CI
✅ **2 Playwright timeouts** - Blocking CI

### Future Work (Phase 2)
📝 **52 Progressive Enhancement failures** - Documented
📝 **81 Visual Regression failures** - Documented
📝 **12 API Contract failures** - Documented
📝 **24 Other failures** - Documented

---

## Time Estimates

### Phase 1 (CI Blockers)
- Cypress tests: 2-3 hours
- Playwright timeouts: 1-2 hours
- Testing & verification: 1 hour
- **Total: 4-6 hours**

### Phase 2 (Comprehensive Tests)
- Progressive Enhancement: Skip or 4-8 hours (if implementing SSR)
- Visual Regression: 30 minutes (accept baselines)
- API Contracts: 1-2 hours
- Other tests: 2-3 hours
- **Total: 4-14 hours** (depending on progressive enhancement approach)

---

## Progress Tracking

### Phase 1 Checklist
- [x] Identify CI failures
- [x] Document Cypress failures
- [x] Document Playwright timeouts
- [ ] Run Cypress tests locally
- [ ] Fix Cypress failures
- [ ] Download Playwright reports
- [ ] Fix Playwright timeouts
- [ ] Test all fixes locally
- [ ] Push comprehensive fix
- [ ] Verify CI passes

### Phase 2 Checklist
- [x] Document all comprehensive test failures
- [x] Categorize failures by type
- [x] Create fix strategies for each category
- [ ] Decide on progressive enhancement approach
- [ ] Accept visual regression baselines
- [ ] Fix API contract tests
- [ ] Fix remaining tests
- [ ] Verify all comprehensive tests pass

---

## Notes

**Important Discovery:**
The comprehensive test suite (`playwright.comprehensive.config.ts`) runs 440 tests that are NOT part of the normal CI pipeline. These provide additional coverage but are not required for CI to pass. We discovered these while trying to find all potential CI failures upfront.

**Benefit:**
Even though these tests aren't blocking CI, we now have a complete roadmap of all test suite improvements needed. This allows us to:
1. Fix CI blockers immediately (Phase 1)
2. Improve overall test quality systematically (Phase 2)
3. Avoid "surprise" test failures in the future

**Files:**
- This roadmap: `TEST_FAILURES_ROADMAP.md`
- CI blockers analysis: `ACTUAL_CI_FAILURES_ANALYSIS.md`
- Comprehensive tests analysis: `COMPREHENSIVE_TEST_FAILURE_ANALYSIS.md`
- Local CI simulation script: `scripts/ci-simulation.sh`
- Strategy documentation: `LOCAL_CI_SIMULATION_STRATEGY.md`
