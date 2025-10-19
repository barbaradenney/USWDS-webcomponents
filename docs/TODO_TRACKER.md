# TODO Tracker
**Generated:** 2025-10-09
**Total Items:** 12

This document tracks all TODO/FIXME comments in the codebase for better issue management.

---

## Priority 1: Missing Features (7 items)

### Search Component Icon Properties

**Status:** Feature Request
**Impact:** Medium
**Effort:** Small

Multiple test files reference unimplemented properties for search icon customization:

**Files:**
- `src/components/search/usa-search.test.ts:233`
- `src/components/search/usa-search.test.ts:253`
- `src/components/search/usa-search.test.ts:255`
- `src/components/search/usa-search.test.ts:574`
- `src/components/search/usa-search.test.ts:576`
- `src/components/search/usa-search.test.ts:690`

**TODOs:**
```typescript
// TODO: Implement submitIconSrc property
// TODO: Implement submitIconAlt property
```

**Action Items:**
1. Add `submitIconSrc` property to usa-search component
2. Add `submitIconAlt` property to usa-search component
3. Update tests to verify properties work
4. Update Storybook stories with examples

**Estimated Time:** 2 hours

**GitHub Issue:** TBD

---

### Combo Box Custom Option Rendering

**File:** `src/components/combo-box/usa-combo-box.component.cy.ts:322`

**TODO:**
```typescript
// TODO: Implement custom option rendering test
```

**Status:** Test Coverage Gap
**Impact:** Low
**Effort:** Small

**Description:**
Cypress test placeholder for custom option rendering functionality.

**Action Items:**
1. Implement custom option rendering test in Cypress
2. Verify component supports custom rendering
3. Add Storybook story demonstrating custom rendering

**Estimated Time:** 1 hour

**GitHub Issue:** TBD

---

## Priority 2: Design Questions (2 items)

### Focus Trap Default Behavior

**File:** `src/utils/focus-trap.ts:169`

**TODO:**
```typescript
// TODO: is this desirable behavior? Should the trap always do this by default or should
```

**Status:** Design Decision Needed
**Impact:** Medium
**Effort:** Small (decision + documentation)

**Context:**
Question about focus trap default behavior. Need to decide on expected behavior and document decision.

**Action Items:**
1. Review USWDS guidance on focus traps
2. Test current behavior with screen readers
3. Document decision in code
4. Update tests if behavior changes

**Estimated Time:** 30 minutes (research) + implementation time if needed

**GitHub Issue:** TBD

---

### Accordion Multiselectable Opt-in

**File:** `src/components/accordion/usa-accordion-behavior.ts:102`

**Comment:**
```typescript
// XXX multiselectable is opt-in, to preserve legacy behavior
```

**Status:** Design Documentation
**Impact:** Low
**Effort:** None (already implemented)

**Context:**
This is actually a **documentation comment**, not a TODO. The `XXX` indicates important behavior to note.

**Action Items:**
1. Consider changing comment style from `XXX` to `NOTE:` or `IMPORTANT:`
2. Add to component README explaining why opt-in

**Estimated Time:** 5 minutes (documentation)

**GitHub Issue:** TBD (low priority)

---

## Priority 3: Code Quality (2 items)

### Duplicated Method

**File:** `src/components/section/usa-section.ts:162`

**TODO:**
```typescript
// TODO: This method is duplicated in
```

**Status:** Refactoring Opportunity
**Impact:** Low (code quality)
**Effort:** Small

**Context:**
Method appears to be duplicated across components. Should be extracted to shared utility.

**Action Items:**
1. Find all locations where method is duplicated
2. Extract to shared utility (likely in `src/utils/`)
3. Update all components to use shared method
4. Add tests for shared utility

**Estimated Time:** 1 hour

**GitHub Issue:** TBD

---

### Search Context Constant

**File:** `src/components/search/usa-search-behavior.ts:25`

**Comment:**
```typescript
const CONTEXT = 'header'; // XXX
```

**Status:** Design Documentation
**Impact:** Low
**Effort:** Small

**Context:**
Hardcoded context value that should be configurable or documented why it's fixed.

**Action Items:**
1. Determine if context should be configurable
2. If fixed, document why in comment
3. If configurable, add property to component

**Estimated Time:** 30 minutes

**GitHub Issue:** TBD

---

## Priority 4: Test Placeholder (1 item)

### Location Mock

**File:** `src/components/language-selector/usa-language-selector.test.ts:172`

**TODO:**
```typescript
// const locationMock = vi.fn(); // TODO: Use this if needed
```

**Status:** Test Cleanup
**Impact:** None (commented out)
**Effort:** Trivial

**Context:**
Commented-out code that might be needed for testing. Should either use it or remove it.

**Action Items:**
1. Determine if location mocking is needed for language selector tests
2. If yes, implement the mock
3. If no, remove the commented code

**Estimated Time:** 10 minutes

**GitHub Issue:** TBD

---

## Summary by Category

| Category | Count | Total Effort |
|----------|-------|--------------|
| Missing Features | 7 | ~3 hours |
| Design Questions | 2 | ~30 min + TBD |
| Code Quality | 2 | ~1.5 hours |
| Test Cleanup | 1 | ~10 min |
| **TOTAL** | **12** | **~5 hours** |

---

## Recommended Action Plan

### Phase 1: Quick Wins (1 hour)
1. ✅ Implement combo box custom rendering test (1 hour)
2. ✅ Clean up commented location mock (10 min)
3. ✅ Update accordion comment style (5 min)
4. ✅ Document search context decision (30 min)

### Phase 2: Features (3 hours)
1. 🔧 Add search icon properties (2 hours)
2. 🔧 Extract duplicated section method (1 hour)

### Phase 3: Design Review (30+ min)
1. 🤔 Review focus trap default behavior (research needed)

---

## Converting to GitHub Issues

To convert these to trackable GitHub issues:

```bash
# Create labels
gh label create "tech-debt" --description "Technical debt and code quality"
gh label create "missing-feature" --description "Feature gaps in components"
gh label create "design-question" --description "Design decisions needed"

# Create issues (example)
gh issue create --title "Search: Add submitIconSrc and submitIconAlt properties" \
  --body "See docs/TODO_TRACKER.md - Missing Features section" \
  --label "missing-feature"

gh issue create --title "Refactor: Extract duplicated method from section component" \
  --body "See docs/TODO_TRACKER.md - Code Quality section" \
  --label "tech-debt"
```

---

## Maintenance

**Review Frequency:** Monthly
**Next Review:** November 2025

**Guidelines:**
1. **Complete TODOs** - Remove from code when done
2. **Convert to Issues** - Create GitHub issues for tracking
3. **Document Decisions** - Replace TODOs with explanatory comments
4. **Avoid Adding TODOs** - Create issues immediately instead

---

## Notes

- Most TODOs are minor and low impact
- No critical functionality blocked
- Good candidates for "good first issue" labels
- Several items are actually documentation notes, not action items

**Last Updated:** 2025-10-09
