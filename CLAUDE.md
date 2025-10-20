# CLAUDE.md

Project instructions for Claude Code when working with this USWDS Web Components library.

## 🚨 Critical Rules

### 🚨 Discovered Issues Policy - MANDATORY CONTRACT

When validation discovers issues unrelated to your current work:

**✅ YOU MUST:**
1. Commit current work using `--no-verify` (if current work is valid)
2. Document discovered issues in commit message (enforced by commit-msg hook)
3. **IMMEDIATELY** fix ALL discovered issues in next commit
4. **CANNOT** start new work until `.git/DISCOVERED_ISSUES.json` is cleared

**✅ ENFORCEMENT:**
- `commit-msg` hook: Validates --no-verify documentation
- `post-commit` hook: Generates `.git/DISCOVERED_ISSUES.json` tracker
- `pre-commit` hook: Blocks new commits if tracker exists
- Tracker auto-clears when validation passes

**Example Valid Workflow:**

```bash
# 1. Try to commit - validation finds unrelated issue
git commit -m "fix(header): add aria-label"
# ❌ Pre-commit fails: character-count missing USWDS integration

# 2. Commit current work with documentation
git commit --no-verify -m "fix(header): add aria-label

Note: Used --no-verify due to pre-existing validation failure
in character-count (missing USWDS JS integration). Will fix next.
"
# ✅ commit-msg validates documentation
# ✅ Commit succeeds
# 🤖 post-commit creates: .git/DISCOVERED_ISSUES.json

# 3. Try to start new work
git commit -m "feat(button): add new variant"
# ❌ pre-commit blocked: "Fix discovered issues first"

# 4. Fix discovered issue
npm run validate  # See what needs fixing
# Fix character-count...
git commit -m "fix(character-count): add USWDS JS integration"
# ✅ Validation passes
# 🗑️  Auto-deletes: .git/DISCOVERED_ISSUES.json

# 5. Now free to work on new features
git commit -m "feat(button): add new variant"
# ✅ Allowed
```

**Why This Works:**
- **Preserves Progress**: Current work isn't blocked by unrelated issues
- **Enforces Quality**: Issues MUST be fixed, not ignored
- **Automated**: Can't bypass without deliberate effort
- **Traceable**: Git history shows issue discovery → fix chain

**Helper Commands:**
- `npm run fix:discovered` - Show current discovered issues
- `npm run validate` - Run all validations
- `npm run validate:uswds-compliance` - USWDS compliance details

### Never Weaken Validation
❌ NEVER make validation less strict, non-blocking, or skip checks
✅ ALWAYS fix the actual underlying issue

## Project Overview

Web components library converting USWDS components to custom elements using Lit. Maintains same HTML, CSS, and structure as USWDS while providing modern web components API. Uses Light DOM for maximum USWDS compatibility.

## Essential Commands

### Development
- `npm run dev` - Start development server
- `npm run storybook` - Start Storybook (port 6006)
- `npm run build` - Build for production

### Testing
See [docs/TESTING_GUIDE.md](docs/TESTING_GUIDE.md) for complete testing documentation.

**Quick commands:**
- `npm test` - Run unit tests
- `npm run test:run` - Consolidated test orchestrator (recommended)
- `npm run validate` - Run all validations
- `npm run lint` - Check code quality
- `npm run typecheck` - Verify TypeScript

### USWDS Management
- `npm run uswds:sync` - Complete USWDS update workflow
- `npm run validate -- --uswds` - Validate USWDS compliance

### Code Generation
- `npm run generate:component -- --name=my-component` - Generate new component
- `npm run generate:component -- --interactive` - Interactive generation

See [docs/COMPONENT_TEMPLATES.md](docs/COMPONENT_TEMPLATES.md) for templates.

## Architecture

### Directory Structure
```
src/
├── components/          # Component implementations
│   ├── button/
│   │   ├── usa-button.ts
│   │   ├── usa-button.stories.ts
│   │   ├── usa-button.test.ts
│   │   ├── README.mdx
│   │   └── index.ts
├── styles/             # USWDS styles
├── utils/              # Shared utilities
└── index.ts           # Main entry with auto-registration
```

### 🏗️ MANDATORY: Script Tag Pattern

ALL components MUST follow the Script Tag Pattern:

1. **Global USWDS Loading**: USWDS loaded via `<script>` in `.storybook/preview-head.html`
2. **Component Implementation**: Components render HTML, USWDS enhances automatically
3. **Storybook Integration**: Global cleanup between stories in `.storybook/preview.ts`

```typescript
override firstUpdated(changedProperties: Map<string, any>) {
  // ARCHITECTURE: Script Tag Pattern
  // USWDS is loaded globally via script tag in .storybook/preview-head.html
  // Components just render HTML - USWDS enhances automatically via window.USWDS

  super.firstUpdated(changedProperties);
  this.initializeUSWDSComponent();
}
```

**Why**: Creates `window.USWDS` global object required by all USWDS components, prevents modal visibility issues, ensures consistent behavior.

**Pre-commit validation enforces this pattern** - commits will fail if USWDS script tag is removed.

### USWDS Integration Patterns

**Pattern 1: Direct USWDS Integration** (Preferred for simple components)
- Use standard USWDS initialization via `initializeUSWDSComponent()`
- For components with static content and simple interactions
- Examples: Button, Tag, Alert, Card

**Pattern 2: USWDS-Mirrored Behavior** (Required for complex components)
- Create separate `usa-[component]-behavior.ts` file
- Exactly replicates USWDS JavaScript from source
- For components with dynamic content, complex interactions, timing issues
- Examples: Accordion, Modal, Date Picker, Time Picker
- See [docs/USWDS_INTEGRATION_GUIDE.md](docs/USWDS_INTEGRATION_GUIDE.md)

### Component Structure Requirements

Each component:
- Extends `USWDSBaseComponent` or `LitElement`
- Uses Light DOM (no Shadow DOM)
- Follows Script Tag Pattern (MANDATORY)
- Uses USWDS CSS classes directly
- **Composes from other USWDS components** (not inline HTML)
- Includes comprehensive tests
- Has co-located Storybook stories
- Provides component README.mdx

### Component Composition Pattern

**Use web components, not inline HTML duplication:**

✅ **Good** - Use actual web component:
```typescript
import '../search/index.js';

render() {
  return html`
    <usa-search
      size="small"
      placeholder="${this.searchPlaceholder}"
      @search-submit="${this.handleSearch}"
    ></usa-search>
  `;
}
```

❌ **Bad** - Duplicate HTML inline:
```typescript
render() {
  return html`
    <form class="usa-search usa-search--small">
      <input class="usa-input" type="search" />
      <button class="usa-button">Search</button>
    </form>
  `;
}
```

**Why**: Prevents code duplication, maintains consistency, enables proper event handling, catches broken paths.

See [docs/ARCHITECTURE_PATTERNS.md](docs/ARCHITECTURE_PATTERNS.md#component-composition-pattern) for complete guide.

## Key Development Principles

### ALWAYS Do
✅ Follow Script Tag Pattern for USWDS loading
✅ Use official USWDS CSS classes directly
✅ Import `../../styles/styles.css` (compiled USWDS CSS)
✅ Use Light DOM (automatic with USWDSBaseComponent)
✅ Write comprehensive tests (MANDATORY)
✅ Let USWDS handle ALL styling and behavior
✅ Check component READMEs first for documentation
✅ Run tests before committing: `npm test && npm run typecheck && npm run lint`
✅ **Use web components for composition** - Compose from other USWDS components instead of duplicating HTML

### NEVER Do
❌ Remove or modify USWDS script tag in `.storybook/preview-head.html`
❌ Use ES module imports for USWDS global bundle
❌ Create custom CSS styles for USWDS components
❌ Use Shadow DOM
❌ Override or "improve" USWDS styles
❌ Use unnecessary inline styles when USWDS classes exist
❌ Commit code without tests or with failing tests
❌ Bypass validation without justification
❌ **Duplicate component HTML** - Never copy/paste another component's markup inline

### CSS Standards

**Priority Hierarchy:**
1. USWDS Classes (first choice)
2. USWDS Utilities (second choice)
3. Functional CSS (essential web component functionality only)
4. CSS Custom Properties (dynamic values)
5. Inline Styles (last resort with justification)

**Prohibited:**
- Unnecessary inline styles when USWDS classes exist
- Cosmetic styles (colors, fonts, spacing) that deviate from USWDS
- Duplicate USWDS functionality

**Permitted:**
- Web component performance optimizations
- Dynamic values based on component state
- Browser behavior control
- Precise positioning (tooltips, dropdowns)

## Component Development

### Quick Start

Use the component generator:
```bash
npm run generate:component -- --interactive
```

### Manual Development

1. Check USWDS JavaScript implementation in `node_modules/@uswds/uswds/packages/usa-[component]/src/`
2. Follow [USWDS Compliance Methodology](docs/USWDS_COMPLIANCE_METHODOLOGY.md)
3. Implement component extending `USWDSBaseComponent`
4. Follow USWDS JavaScript patterns from official source
5. Use `data-default-value` pattern for components with initial values
6. Extract and adapt USWDS CSS
7. Apply USWDS structural patterns
8. Write unit tests with accessibility validation
9. Create co-located Storybook stories
10. Add component README.mdx with USWDS links
11. Write Cypress component tests for interactions
12. Run full test suite
13. Verify in Storybook

See [docs/COMPONENT_TEMPLATES.md](docs/COMPONENT_TEMPLATES.md) for complete templates.

### USWDS JavaScript Debugging Protocol

**MANDATORY: Before attempting ANY component fix:**

1. READ `docs/USWDS_JAVASCRIPT_DEBUGGING_PROTOCOL.md`
2. CHECK USWDS source: `node_modules/@uswds/uswds/packages/usa-[component]/src/index.js`
3. IDENTIFY USWDS patterns (class toggles, exported functions, event handlers)
4. FOLLOW USWDS implementation exactly
5. DOCUMENT USWDS source references in code comments

> "When in doubt, read the USWDS source. When not in doubt, read it anyway."

## Testing

See [docs/TESTING_GUIDE.md](docs/TESTING_GUIDE.md) for complete documentation.

### Quick Testing
```bash
npm test                              # Unit tests
npm run test:run -- --all            # All tests
npm run validate                      # All validations
```

### Test Requirements

All changes must include:
1. Unit tests (Vitest) - Component logic and properties
2. Component tests (Cypress) - Interactive behavior (if applicable)
3. Accessibility tests - axe-core validation
4. USWDS compliance tests - Automated validation

**Test Failure Policy**: Do not commit if any tests fail, types don't check, or linting errors exist.

## Storybook Stories

MANDATORY for all components:

### Requirements
- Co-located at `src/components/[component]/usa-[component].stories.ts`
- Default story with default values
- Stories for all variants and states
- Interactive controls for all properties
- Layout: `padded` (consistent spacing)

### Story Template

See [docs/COMPONENT_TEMPLATES.md](docs/COMPONENT_TEMPLATES.md#storybook-story-template)

## Documentation

### Component READMEs
Each component has comprehensive documentation at `src/components/[component]/README.mdx`:
- USWDS documentation links
- Usage examples
- Properties/attributes table
- Events table
- Accessibility features
- Implementation notes

**ALWAYS check component READMEs first** before modifying or explaining components.

### Documentation Lifecycle Management

**Problem Solved**: Prevents documentation accumulation through **fully automated** categorization, validation, and archival.

**System** (FULLY AUTOMATED):
1. **Pre-commit**: Blocks uncategorized documentation (enforced)
2. **Post-commit**: Automatically archives docs when > 5 ready (configurable)
3. **Weekly GitHub Actions**: Backup cleanup every Monday 9 AM UTC
4. **Categories**: PERMANENT (never archived), TEMPORARY (7 days), STATUS (60 days)

**Zero Manual Work Required** - System handles everything automatically!

**Automation Details**:
- Post-commit hook runs after every commit
- Checks archivable doc count
- If > 5 docs ready, runs cleanup automatically
- Creates automatic commit with archived docs
- Disable: `SKIP_DOC_CLEANUP=1 git commit`

**When Creating Documentation**:
1. Use SCREAMING_SNAKE_CASE naming
2. Use recognized naming patterns for temporary docs (*_SUMMARY.md, *_ANALYSIS.md, *_INVESTIGATION.md, etc.)
3. OR add to PERMANENT_DOCS in cleanup-documentation.cjs for permanent guides
4. Pre-commit blocks uncategorized docs (enforced)

**Manual Commands** (rarely needed):
- `npm run docs:analyze` - Check documentation health
- `npm run docs:cleanup:dry-run` - Preview what will be archived
- `npm run docs:cleanup` - Force manual cleanup

**Files**:
- `.husky/post-commit` - Automatic cleanup hook
- `.github/workflows/docs-maintenance.yml` - Weekly cleanup workflow
- `scripts/maintenance/cleanup-documentation.cjs` - Cleanup engine
- `scripts/validate/validate-documentation-hygiene.cjs` - Pre-commit validation

See [docs/DOCUMENTATION_LIFECYCLE.md](docs/DOCUMENTATION_LIFECYCLE.md) for complete guide.

## Pre-commit Validation

### Smart Commit Detection
Automatically detects commit type and skips unnecessary validations:
- **Docs-only commits**: Skips unit tests and Cypress tests (saves 15-30s)
- **Component commits**: Runs full validation suite
- **Core file commits**: Runs global validations

### Validation Stages

Automated checks run before every commit:
1. **Smart commit type detection** (NEW)
2. Repository organization cleanup
3. Script organization
4. USWDS script tag validation
5. Layout forcing pattern
6. Component issue detection
7. USWDS compliance (includes component composition validation)
   - 4a: Custom USWDS class validation
   - 4b: **Custom CSS validation** (ensures only :host styles)
8. Linting
9. TypeScript compilation
10. Code quality review
11. Component-specific validations
12. **Component unit tests** (7a/9 - NEW)
    - Runs unit tests for modified components first
    - Fast failure detection (~2s per component)
    - Catches logic errors before Cypress
13. **Component Cypress tests** (7b/9 - IMPROVED)
    - Parallel execution for multiple components
    - 3x faster for multi-component commits
    - Full integration testing
14. Test expectations
    - 8a: Component regression tests
    - 8b: Test skip policy enforcement
    - 8c: Cypress test pattern validation
15. USWDS transformation validation
16. Component JavaScript integration
17. Documentation synchronization
    - 11a: **Documentation hygiene** (blocks uncategorized docs)
    - 11b: Documentation placeholders

### Performance Optimizations

**Unit Tests First** (NEW):
- Runs unit tests before Cypress
- Failure detection: 2s (unit) vs 15s (Cypress)
- Better layered testing approach

**Parallel Cypress** (IMPROVED):
- Multiple components tested simultaneously
- 3 components: 15s (parallel) vs 45s (serial)
- 3x faster for multi-component commits

**Smart Detection** (NEW):
- Docs-only commits skip component tests
- Saves 15-30s on documentation changes
- Automatically enabled

**Note**: AI code quality validation moved to post-commit (non-blocking) to prevent false positives from blocking valid commits.

**Component Composition Validation** (included in #6):
- Checks that components use web component tags (`<usa-search>`)
- Detects inline HTML duplication (`class="usa-search"`)
- Prevents architectural violations automatically

**Custom CSS Validation** (stage 4b/9):
- Enforces pure USWDS CSS compliance
- Only allows :host styles for web component functionality
- Blocks cosmetic CSS (colors, padding, margin, fonts)
- Prevents !important overrides and descendant selectors
- See `scripts/validate/validate-no-custom-css.js` for details

### Performance Metrics Dashboard

**NEW**: Real-time performance tracking for validation stages.

**What It Shows**:
```bash
⏱️  Validation Performance:

   Linting:                    5.42s
   TypeScript:                 3.70s
   Component unit tests:       2.15s
   Cypress tests:             12.30s
   ─────────────────────────────────
   Tracked time:              23.57s
   Total time:                   28s
```

**Features**:
- Millisecond-precision timing for each validation stage
- Tracked time vs total wall time comparison
- Automatic metrics logging to `.git/validation-metrics.json`
- Historical performance tracking for optimization
- Bash 3.2 compatible (parallel arrays)
- macOS compatible (Python-based timing)

**Metrics File** (`.git/validation-metrics.json`):
```json
{
  "timestamp": "2025-10-20 14:18:52",
  "total_seconds": 28,
  "tracked_milliseconds": 23570,
  "commit_type": "code-commit",
  "modified_components": 2,
  "stages": {
    "lint": 5420,
    "typescript": 3700,
    "unit_tests": 2150,
    "cypress": 12300
  }
}
```

**Benefits**:
- Identify slow validation stages
- Data-driven performance optimization
- Track performance improvements over time
- Spot performance regressions quickly

## Post-commit Validation

Automated checks run **after** every commit (non-blocking):

1. **Component documentation updates** - Auto-updates README, CHANGELOG, TESTING.md
2. **AI code quality validation** (NEW - non-blocking feedback)
   - Detects common AI anti-patterns
   - Provides feedback without blocking commits
   - Prevents false positives from disrupting workflow
3. **Discovered issues tracking** - Tracks validation bypasses for follow-up

## AI Code Quality System

**Ensures the cleanest, most efficient code possible by detecting common AI code generation anti-patterns.**

### Problem Solved
AI code generation (Claude, GPT, Copilot) often creates patterns that work but are disliked by human developers. This system now runs **post-commit** to provide feedback without blocking valid commits.

### Validation Timing
- **Post-commit (current)**: Non-blocking, provides feedback after commit
- **Rationale**: Pre-existing code can trigger false positives, blocking valid commits
- **Benefit**: Allows progress while still highlighting issues for cleanup

### Common AI Anti-Patterns Detected

**Errors (highlighted for cleanup):**
- ❌ console.log/debugger statements left in code
- ❌ Event listeners without cleanup (memory leaks)
- ❌ setInterval/setTimeout without cleanup
- ❌ Generic error messages ("Error", "Something went wrong")

**Warnings (suggestions):**
- ⚠️ Over-commenting (obvious comments that restate code)
- ⚠️ Overly verbose variable names (>20 chars)
- ⚠️ Magic numbers without constants
- ⚠️ Deep nesting (4+ levels)
- ⚠️ Copy-paste duplication (numbered variables: foo1, foo2)
- ⚠️ TODO/FIXME without issue references
- ⚠️ Over-engineering (unnecessary abstractions)
- ⚠️ Inefficient array operations (filter().map())
- ⚠️ String concatenation in loops

### How It Works

**1. Post-Commit Validation (Automatic)**
- Runs automatically after every commit
- Provides informational feedback
- Does NOT block commits
- Highlights issues for future cleanup

**2. Manual Validation**
```bash
npm run validate:ai-quality      # Check AI patterns
npm run validate:refactoring     # Check refactoring opportunities
npm run validate:clean-code      # Run both
```

**3. When to Act**
- Review post-commit feedback
- Fix highlighted issues in next commit
- Use manual validation before committing for proactive checks

### Code Refactoring Analysis

Analyzes code for refactoring opportunities:
- **Cyclomatic Complexity**: Functions with >10 decision points
- **Function Length**: Functions >50 lines
- **Too Many Parameters**: Functions with >4 parameters
- **Deep Nesting**: >3 levels of nesting
- **Code Duplication**: Repeated code blocks

**Thresholds:**
- **Warning**: Suggests refactoring (informational)
- **Error**: Blocks commit (must fix)

### Best Practices Enforced

**1. Write Code for Humans**
- Use clear, concise names (not overly verbose)
- Comment the "why", not the "what"
- Keep functions small and focused

**2. Clean Up Resources**
- Always remove event listeners
- Clear intervals/timeouts
- Clean up in disconnectedCallback/useEffect cleanup

**3. Handle Errors Properly**
- Specific error messages with context
- Don't silently catch and ignore
- Re-throw or log appropriately

**4. Avoid Over-Engineering**
- Use simplest solution that works
- Add abstractions only when needed (YAGNI)

**5. Follow Existing Patterns**
- Check how codebase handles similar situations
- Be consistent with existing code style

### When to Use

**Always:**
- Before committing code
- When reviewing AI-generated code
- When refactoring existing code

**Bypass Only When:**
- Legitimate console.error/warn for user-facing errors
- Temporary debugging (with TODO + issue reference)
- False positives (rare)

### Configuration

**Adjust Severity:**
Edit `scripts/validate/ai-code-quality-validator.cjs`:
```javascript
const AI_ANTI_PATTERNS = {
  debugStatements: {
    severity: 'error',  // or 'warning'
  }
}
```

**Adjust Thresholds:**
Edit `scripts/validate/code-refactoring-analyzer.cjs`:
```javascript
const THRESHOLDS = {
  cyclomaticComplexity: { warning: 10, error: 20 },
  functionLength: { warning: 50, error: 100 },
}
```

### Documentation

See [docs/AI_CODE_QUALITY_GUIDE.md](docs/AI_CODE_QUALITY_GUIDE.md) for:
- Complete list of detected patterns
- Examples of bad vs good code
- Detailed fixing instructions
- Best practices guide

### Summary

This system ensures you commit **clean, efficient, maintainable code** that human developers will appreciate. It catches common AI patterns early, provides actionable fixes, and enforces best practices automatically.

**Result**: Better code quality, fewer review comments, more maintainable codebase.

## Code Quality & Architecture Review

Automated architectural analysis ensures clean code:
- Verifies correct USWDS integration pattern
- Detects over-engineering and custom implementations
- Suggests simpler alternatives
- Validates alignment with architecture decisions

See [docs/CODE_QUALITY_ARCHITECTURAL_REVIEW.md](docs/CODE_QUALITY_ARCHITECTURAL_REVIEW.md)

## Important Documentation References

- [USWDS Integration Guide](docs/USWDS_INTEGRATION_GUIDE.md) - Complete USWDS patterns
- [USWDS Compliance Methodology](docs/USWDS_COMPLIANCE_METHODOLOGY.md) - Structural requirements
- [USWDS JavaScript Debugging Protocol](docs/USWDS_JAVASCRIPT_DEBUGGING_PROTOCOL.md) - Systematic debugging
- [Testing Guide](docs/TESTING_GUIDE.md) - Complete testing documentation
- [Component Templates](docs/COMPONENT_TEMPLATES.md) - Reusable templates
- [Debugging Guide](docs/DEBUGGING_GUIDE.md) - Troubleshooting
- [Storybook Best Practices](docs/STORYBOOK_BEST_PRACTICES.md) - Story patterns
- [Lit + USWDS Integration Patterns](docs/LIT_USWDS_INTEGRATION_PATTERNS.md) - Critical patterns

## Troubleshooting

- Check component `README.mdx` files first
- See [Debugging Guide](docs/DEBUGGING_GUIDE.md)
- Check USWDS source in `node_modules/@uswds/uswds/packages/`
- Use local USWDS package as primary reference

## 100% USWDS Compliance Achievement

✅ 46/46 components fully USWDS compliant
✅ 2301/2301 tests passing
✅ True 1:1 USWDS functionality with JavaScript behavior
✅ Progressive enhancement - works as HTML, enhances with USWDS JS
✅ Zero custom CSS beyond essential `:host` display styles
✅ Pure USWDS implementation using only official CSS classes
