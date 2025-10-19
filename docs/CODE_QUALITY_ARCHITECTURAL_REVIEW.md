# Code Quality Architectural Review

**Automated birds-eye view analysis to ensure cleanest code approach**

## Overview

The pre-commit code quality review includes architectural analysis that evaluates whether the approach taken to fix an issue is the cleanest and most appropriate solution. This goes beyond checking code patterns to assess the overall architectural decisions.

## What It Checks

### 1. USWDS Integration Pattern Validation

**Purpose**: Ensures components use the correct integration pattern based on complexity

**Rules**:
- **Complex components** (accordion, modal, date-picker, time-picker, combo-box, tooltip, character-count, table, file-input):
  - Should use USWDS-mirrored behavior pattern for better control
  - Warns if using direct integration pattern
  - References: `ARCHITECTURE_DECISION_ACCORDION_BEHAVIOR_APPROACH.md`

- **Simple components** (button, alert, card, etc.):
  - Should use direct USWDS integration (`initializeUSWDSComponent`)
  - Warns if using mirrored behavior pattern (over-engineering)
  - References: `JAVASCRIPT_INTEGRATION_STRATEGY.md`

**Example Warning**:
```
⚠️  usa-modal.ts: Complex component using direct integration - consider USWDS-mirrored
    behavior pattern for better control (see ARCHITECTURE_DECISION_ACCORDION_BEHAVIOR_APPROACH.md)
```

### 2. Over-Engineering Detection

**Purpose**: Identifies custom implementations that duplicate USWDS functionality

**Patterns Detected**:

#### Custom Event Handlers
```typescript
// ❌ DETECTED: Custom event handler with substantial logic
private handleClick(event: Event) {
  event.preventDefault();
  // 50+ lines of custom logic
}
```
**Warning**: "Custom event handlers with substantial logic - USWDS should handle most behavior"

#### Custom Toggle Logic
```typescript
// ❌ DETECTED: Custom toggle implementation
private toggleExpanded() {
  // 30+ lines of custom toggle logic
}
```
**Warning**: "Custom toggle logic - verify USWDS doesn't provide this functionality"

#### Manual Class Manipulation
```typescript
// ❌ DETECTED: More than 5 classList operations
element.classList.add('usa-accordion__button--open');
element.classList.remove('usa-accordion__button--collapsed');
// ... 3+ more operations
```
**Warning**: "Manual class manipulation detected - USWDS typically manages classes automatically (8 occurrences - threshold: 5)"

#### Manual ARIA Management
```typescript
// ❌ DETECTED: More than 3 manual ARIA attribute changes
element.setAttribute('aria-expanded', 'true');
element.setAttribute('aria-hidden', 'false');
element.setAttribute('aria-controls', controlId);
// ... 1+ more
```
**Warning**: "Manual ARIA attribute management - USWDS should handle accessibility (4 occurrences - threshold: 3)"

### 3. Simpler Alternative Suggestions

**Purpose**: Recommends simpler patterns when complexity is detected

#### Multiple event.preventDefault()
```typescript
// ❌ DETECTED: More than 3 preventDefault calls
function handleClick(event: Event) {
  event.preventDefault(); // Call 1
}
function handleKeyDown(event: Event) {
  event.preventDefault(); // Call 2
}
// ... 2+ more calls
```
**Warning**: "Multiple event.preventDefault() calls (5) - may be reimplementing browser/USWDS behavior"

#### Custom State Management
```typescript
// ❌ DETECTED: Custom state properties when using direct integration
private isOpen = false;
private isExpanded = false;
private isActive = false;
```
**Warning**: "Custom state property 'private isOpen' - USWDS manages component state automatically"

#### Complex Lifecycle Logic
```typescript
// ❌ DETECTED: firstUpdated with >20 lines without mirrored behavior
override firstUpdated(changedProperties: Map<string, any>) {
  super.firstUpdated(changedProperties);
  // 25 lines of complex initialization
}
```
**Warning**: "firstUpdated() has 25 lines - consider if all initialization logic is necessary"

### 4. Unnecessary Abstraction Detection

**Purpose**: Identifies abstraction layers that add complexity without value

```typescript
// ❌ DETECTED: Helper/util/manager methods
private accordionHelper() { /* ... */ }
private stateManager() { /* ... */ }
private renderUtil() { /* ... */ }
```
**Warning**: "Helper/util/manager methods detected (3) - may indicate over-abstraction for a wrapper component"

### 5. Architecture Decision Alignment

**Purpose**: Verifies implementation matches documented architecture decisions

**Check**: Looks for `ARCHITECTURE_DECISION_*.md` files in component directory

**If found**:
```
✅ usa-accordion.ts: Has architecture decision document - verify implementation aligns with documented approach
```

**Developer Action**: Manually verify that implementation matches the documented decision

### 6. Code Pattern Analysis

**Purpose**: Detects code patterns that suggest alternative approaches

#### Excessive DOM Queries
```typescript
// ❌ DETECTED: More than 8 querySelector calls
const button = this.querySelector('.usa-accordion__button');
const content = this.querySelector('.usa-accordion__content');
// ... 7+ more queries
```
**Warning**: "Excessive DOM queries (10) - consider using refs or restructuring component"

**Suggestion**: Use Lit's `@query` decorator or restructure component

#### Timing Dependencies
```typescript
// ❌ DETECTED: More than 4 setTimeout/setInterval calls
setTimeout(() => { /* ... */ }, 100);
setTimeout(() => { /* ... */ }, 200);
setInterval(() => { /* ... */ }, 1000);
// ... 2+ more
```
**Warning**: "Multiple setTimeout/setInterval calls (6) - may indicate race conditions or timing dependencies that need better architecture"

**Suggestion**: Consider using promises, async/await, or MutationObserver

## How It Works

### Pre-Commit Integration

**Automatic execution** during pre-commit validation:

```bash
git commit -m "fix: improve accordion behavior"

# Pre-commit hook runs:
# Stage 6a/9: Code quality review
#   ├─ Pattern checks (complexity, security, etc.)
#   └─ Architectural approach review (NEW)
```

### Review Process

1. **File Detection**: Identifies modified component files
2. **Context Gathering**: Reads commit message and diff statistics
3. **Pattern Analysis**: Runs 15+ quality checks including architectural review
4. **Issue Classification**:
   - **Errors** (blocking): Must fix before commit
   - **Warnings** (informational): Consider addressing

### Output Format

```
🔍 Code Quality Review

ℹ️  Commit: fix(accordion): improve toggle behavior
ℹ️  Reviewing 1 component file(s)...

📄 usa-accordion.ts
⚠️  usa-accordion.ts: Custom event handlers with substantial logic - USWDS should handle most behavior
⚠️  usa-accordion.ts: Multiple setTimeout/setInterval calls (5) - may indicate race conditions
✅ usa-accordion.ts: Has architecture decision document - verify implementation aligns with documented approach

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  Code Quality: GOOD (with warnings)
   3 warning(s) - consider addressing
```

## Exemptions and Exclusions

### Excluded Components

**Mirrored behavior components** are exempt from certain checks:

- **Allowed**: Custom event handlers (accordion, modal)
- **Allowed**: Complex `firstUpdated()` logic when using mirrored behavior
- **Excluded**: Behavior files (`-behavior.ts`) skip most architectural checks

**Rationale**: Mirrored behavior files intentionally replicate USWDS source code exactly

### Non-Blocking Warnings

All architectural review issues are **warnings**, not errors:

- Commit is **not blocked**
- Developer **should consider** addressing
- Judgment call based on specific situation

## Decision Framework

Use this framework when architectural warnings appear:

```
Architectural warning triggered?
├─ Is this a complex component?
│  ├─ Yes → Should use mirrored behavior pattern ✅
│  └─ No → Should use direct integration ✅
│
├─ Does USWDS provide this functionality?
│  ├─ Yes → Delegate to USWDS, don't reimplement ✅
│  └─ No → Custom logic may be justified ✅
│
├─ Is complexity justified?
│  ├─ Yes → Document rationale in comments/ADR ✅
│  └─ No → Simplify implementation ✅
│
└─ Does approach match architecture decisions?
   ├─ Yes → Proceed ✅
   ├─ No → Update implementation or ADR ✅
   └─ No ADR exists → Consider creating one ✅
```

## When to Create Architecture Decision Records

Create an ADR (`ARCHITECTURE_DECISION_*.md`) when:

1. ✅ Choosing between direct integration vs mirrored behavior
2. ✅ Implementing non-standard USWDS integration
3. ✅ Adding substantial custom logic beyond USWDS
4. ✅ Deviating from established patterns with good reason
5. ✅ Making decisions that future developers should understand

**Example**: `docs/ARCHITECTURE_DECISION_ACCORDION_BEHAVIOR_APPROACH.md`

## Best Practices

### Respond to Architectural Warnings

**DON'T ignore warnings** - they indicate potential issues:
- Over-engineering
- Pattern violations
- Simpler alternatives available

**DO evaluate each warning**:
1. Read the warning message
2. Check referenced documentation
3. Evaluate if approach is justified
4. Simplify if possible OR document reasoning

### Document Non-Standard Approaches

If architectural warning is justified:

```typescript
/**
 * Custom event handler required for web component lifecycle
 *
 * ARCHITECTURAL NOTE: This deviates from standard USWDS delegation because
 * we need to integrate with Lit's update lifecycle. Standard USWDS event
 * handling conflicts with Lit's property observation.
 *
 * See: ARCHITECTURE_DECISION_COMPONENT_BEHAVIOR.md
 */
private handleCustomEvent(event: Event) {
  // Custom logic with documented rationale
}
```

### Use Architecture Decision Records

For significant decisions, create ADR in component folder:

```markdown
# Architecture Decision: Component Behavior Approach

## Context
[Why this decision was necessary]

## Decision
[What approach was chosen]

## Alternatives Considered
[Other approaches evaluated]

## Consequences
[Trade-offs and implications]
```

## Manual Execution

Run architectural review independently:

```bash
# Review all staged component changes
node scripts/validate/code-quality-review.cjs

# Review specific component (stage it first)
git add src/components/accordion/usa-accordion.ts
node scripts/validate/code-quality-review.cjs
```

## Configuration

### Thresholds

Configurable thresholds in `scripts/validate/code-quality-review.cjs`:

```javascript
// Complex component list
const complexComponents = [
  'accordion', 'modal', 'date-picker', 'time-picker',
  'combo-box', 'tooltip', 'character-count', 'table', 'file-input'
];

// Pattern thresholds
const thresholds = {
  classListOperations: 5,      // Warn if >5 classList operations
  ariaAttributes: 3,             // Warn if >3 aria setAttribute calls
  preventDefaultCalls: 3,        // Warn if >3 preventDefault calls
  firstUpdatedLines: 20,         // Warn if >20 lines in firstUpdated
  domQueries: 8,                 // Warn if >8 querySelector calls
  timingCalls: 4                 // Warn if >4 setTimeout/setInterval
};
```

### Exclusions

Modify exclusion lists for specific patterns:

```javascript
// Exclude components from specific checks
const overEngineeredPatterns = [
  {
    pattern: /private\s+handle(Click|Focus|Blur)\s*\(/,
    msg: 'Custom event handlers...',
    exclude: ['accordion', 'modal'] // These are allowed
  }
];
```

## Integration with CI/CD

Pre-commit hook (`Stage 6a/9`):

```bash
# In .husky/pre-commit
echo "   ├─ 6a. Code quality review..."
node scripts/validate/code-quality-review.cjs || {
  echo "      ❌ Code quality issues detected!"
  exit 1
}
```

**Result**: Architectural warnings don't block commits, but errors do

## Related Documentation

- **[JAVASCRIPT_INTEGRATION_STRATEGY.md](JAVASCRIPT_INTEGRATION_STRATEGY.md)** - Direct vs mirrored behavior patterns
- **[ARCHITECTURE_DECISION_ACCORDION_BEHAVIOR_APPROACH.md](ARCHITECTURE_DECISION_ACCORDION_BEHAVIOR_APPROACH.md)** - Example ADR
- **[DEBUGGING_GUIDE.md](DEBUGGING_GUIDE.md)** - Troubleshooting approaches
- **[USWDS_INTEGRATION_GUIDE.md](USWDS_INTEGRATION_GUIDE.md)** - USWDS integration patterns

## Summary

The architectural review ensures:

✅ **Correct patterns** - Right integration approach for component complexity
✅ **Minimal custom code** - Delegate to USWDS when possible
✅ **Justified complexity** - Document when deviations are necessary
✅ **Consistent decisions** - Align with architecture decision records
✅ **Continuous improvement** - Suggest simpler alternatives proactively

**Goal**: Maintain clean, maintainable codebase that leverages USWDS effectively while minimizing custom complexity.
