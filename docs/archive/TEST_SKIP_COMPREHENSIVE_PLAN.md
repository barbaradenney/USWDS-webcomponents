# Comprehensive Test Skip Resolution Plan

**Created:** 2025-10-18
**Last Updated:** 2025-10-18
**Status:** 🟡 Phase 1 Complete - Analysis Done
**Current Skip Count:** 92 total (83 unapproved, 9 approved baseline)
**Goal:** 100% passing tests OR properly documented/approved skips

## Executive Summary

We have **88 skipped tests** across the codebase that are **NOT approved** by the validation script. These need to be either:
1. Fixed to run and pass in Vitest
2. Migrated to Cypress for browser-specific testing
3. Documented and approved as architecturally justified

## Skip Count Analysis

### By Component
| Component | Skips | Primary Reason |
|-----------|-------|----------------|
| Date Picker | 25 | Browser-dependent (calendar UI) |
| File Input | 17 | Browser API (DataTransfer) |
| Modal | 8 | Browser-dependent (focus/DOM) |
| Time Picker | 6 | Browser-dependent (combo-box) |
| In-Page Navigation (behavior) | 4 | Browser-dependent (scroll) |
| Alert | 3 | Browser-dependent (animation) |
| Tooltip | 2+2+1+1=6 | Browser-dependent (positioning) |
| Summary Box | 2 | jsdom limitation |
| Footer | 2 | Architectural decision |
| Character Count | 2 | Browser-dependent (textarea) |
| Button Group | 1 | jsdom limitation |
| Site Alert | 1 | Lit framework limitation |
| Card | 1 | Layout testing |
| Combo Box | 1 | USWDS transformation |
| Header (behavior) | 1 | Browser-dependent |
| Language Selector (behavior) | 1 | Browser-dependent |
| Time Picker (behavior) | 1 | Browser-dependent |
| Tooltip (behavior) | 1 | Browser-dependent |
| Date Picker (layout) | 1 | Browser-dependent |
| Date Picker (behavior) | 1 | Browser-dependent |

### By Category
| Category | Count | Strategy |
|----------|-------|----------|
| Browser-dependent (calendar/dropdown UI) | ~30 | Migrate to Cypress |
| Browser-dependent (focus management) | ~20 | Migrate to Cypress |
| Browser-dependent (scroll behavior) | ~10 | Migrate to Cypress |
| Browser API requirements (DataTransfer) | 17 | Document + Cypress |
| jsdom limitations | ~5 | Document + Cypress |
| Architectural decisions | 2-3 | Document + Approve |
| Framework limitations | 1-2 | Document + Approve |

## Resolution Strategy

### Phase 1: Categorize and Document (Week 1) ⬅️ CURRENT
**Goal:** Create comprehensive inventory

- [x] Count all skipped tests by component
- [x] Identify skip reasons from comments
- [x] Categorize by resolution strategy
- [ ] Create detailed migration plan for each category
- [ ] Update TEST_SKIP_MIGRATION_PLAN.md

**Deliverable:** Complete categorization document

### Phase 2: Quick Wins - Unskip Fixable Tests (Week 2)
**Goal:** Fix tests that can run in Vitest with minor changes

**Target Tests:**
- Modal: "should remain in DOM after property updates"
- Summary Box: Content transition tests
- Any test that just needs better waits/assertions

**Estimated Impact:** 5-10 tests fixed

### Phase 3: Cypress Migration Plan (Week 2-3)
**Goal:** Create comprehensive Cypress migration strategy

**Existing Cypress Tests:** Check `cypress/e2e/` for:
- date-picker-calendar.cy.ts
- header-navigation.cy.ts
- in-page-navigation-scroll.cy.ts
- modal-focus-management.cy.ts
- time-picker-interactions.cy.ts
- tooltip-positioning.cy.ts

**New Cypress Tests Needed:**
- file-input-drag-drop.cy.ts (17 tests)
- alert-animations.cy.ts (3 tests)
- character-count-textarea.cy.ts (2 tests)
- summary-box-content.cy.ts (2 tests)
- button-group-accessibility.cy.ts (1 test)

**Estimated Impact:** 25-30 tests migrated

### Phase 4: Browser API Limitations (Week 3-4)
**Goal:** Document tests that cannot run in Node.js

**Examples:**
- DataTransfer API (file-input: 17 tests)
- Layout calculations (tooltip positioning: 6 tests)
- Scroll behavior (in-page-navigation: 4 tests)
- Focus management (modal: 8 tests)

**Action:**
1. Add detailed comments explaining limitation
2. Reference Cypress test that covers the functionality
3. Add to approved skips list
4. Ensure production verification exists

**Estimated Impact:** 30-35 tests documented and approved

### Phase 5: Architectural Decisions (Week 4)
**Goal:** Formally approve and document intentional skips

**Examples:**
- Footer layout (2 tests) - Design deviation
- Site alert (1 test) - Lit framework edge case
- Combo box transformation (1 test) - USWDS requirement

**Action:**
1. Create architectural decision record (ADR)
2. Get team approval
3. Add to approved skips
4. Verify alternative coverage

**Estimated Impact:** 3-5 tests approved

## Implementation Plan

### Week 1: Assessment & Quick Fixes
```bash
# Day 1-2: Assessment
- Review all 88 skipped tests
- Categorize each by resolution strategy
- Identify quick wins (fixable in Vitest)

# Day 3-5: Fix Quick Wins
- Fix 5-10 tests that can run in Vitest
- Update test assertions/waits
- Verify all pass

# Deliverable: 5-10 fewer skips, clear categorization
```

### Week 2: Cypress Migration Phase 1
```bash
# Day 1-2: Cypress Infrastructure
- Review existing Cypress tests
- Identify migration patterns
- Create migration templates

# Day 3-5: Migrate High-Value Tests
- Migrate date-picker calendar tests (10 tests)
- Migrate modal focus tests (5 tests)
- Migrate file-input drag-drop tests (5 tests)

# Deliverable: 20 tests migrated to Cypress
```

### Week 3: Cypress Migration Phase 2 & Documentation
```bash
# Day 1-3: Continue Migration
- Migrate remaining browser-dependent tests
- Tooltip positioning (6 tests)
- Time picker interactions (6 tests)
- In-page-navigation scroll (4 tests)

# Day 4-5: Document API Limitations
- Add comprehensive skip comments
- Reference Cypress coverage
- Update TEST_SKIP_POLICY.md

# Deliverable: 30 more tests migrated or documented
```

### Week 4: Finalization & Approval
```bash
# Day 1-2: Architectural Decisions
- Create ADRs for intentional skips
- Get team approval
- Update approved skips list

# Day 3-4: Validation & Documentation
- Update TEST_SKIP_MIGRATION_PLAN.md
- Run full test suite
- Verify all skips approved

# Day 5: Final Review
- Team review of all skips
- Update CONTRIBUTING.md
- Celebrate! 🎉

# Deliverable: 0 unapproved skips
```

## Success Criteria

### Phase 1 ✅
- [ ] All 88 tests categorized
- [ ] Resolution strategy documented
- [ ] Team aligned on approach

### Phase 2 ✅
- [ ] 5-10 tests fixed and passing
- [ ] No new skips introduced
- [ ] Validation script updated

### Phase 3 ✅
- [ ] 25-30 tests migrated to Cypress
- [ ] All Cypress tests passing
- [ ] Original Vitest tests removed

### Phase 4 ✅
- [ ] 30-35 API limitation tests documented
- [ ] All have Cypress coverage reference
- [ ] Added to approved skips

### Phase 5 ✅
- [ ] All architectural decisions documented
- [ ] 100% of skips approved
- [ ] Zero unapproved skips in CI

## Final Target

**Ideal Outcome:**
- ✅ 0 unapproved skips
- ✅ ~10-15 approved skips (Browser API limitations)
- ✅ ~60 tests migrated to Cypress
- ✅ ~10 tests fixed to run in Vitest
- ✅ 100% test pass rate

**Metrics:**
- Current: 88 unapproved skips
- Target: 0 unapproved skips
- Timeline: 4 weeks
- Validation: Pre-commit hook enforces zero unapproved skips

## Risk Mitigation

### Risk: Too many tests to migrate
**Mitigation:** Prioritize by business value, batch migrations

### Risk: Cypress infrastructure incomplete
**Mitigation:** Invest in Cypress setup first (Week 1)

### Risk: Some tests genuinely cannot be tested
**Mitigation:** Document thoroughly, ensure manual testing, approve with team

### Risk: Takes longer than 4 weeks
**Mitigation:** Adjust phases, get additional resources if needed

## Next Steps

1. **Immediate (Today):**
   - ✅ Complete categorization
   - [ ] Share plan with team
   - [ ] Get approval to proceed

2. **This Week:**
   - [ ] Fix 5-10 quick wins
   - [ ] Set up Cypress migration infrastructure
   - [ ] Begin Phase 1 migration

3. **This Month:**
   - [ ] Complete all migrations
   - [ ] Document all skips
   - [ ] Achieve 0 unapproved skips

---

**Owner:** Development Team
**Status:** 🔴 In Progress - Phase 1
**Next Review:** End of Week 1
**Success Criteria:** 0 unapproved skips, 100% documentation
