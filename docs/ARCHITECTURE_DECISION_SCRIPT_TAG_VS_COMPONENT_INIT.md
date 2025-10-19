# Architecture Decision: Script Tag vs Component-Level USWDS Initialization

**Date**: 2025-10-01
**Status**: Proposal
**Decision Needed**: Should we migrate all components to script tag initialization?

---

## Context

We currently have **two conflicting architectural patterns**:

1. **Current Reality** (29 components): Component-level initialization via `initializeUSWDS()`
2. **Option B Validation** (enforced by pre-commit): Global `.on(document)` initialization
3. **Script Tag Approach** (just implemented for modal): Load USWDS via `<script>` tag

The modal fix revealed that the script tag approach solves critical problems that other approaches don't address.

---

## The Problem We Solved

### Modal Wasn't Working
- **Symptom**: Modal content visible when it should be hidden, no wrapper creation
- **Console Error**: `⚠️ USWDS global object not found for modal`
- **Root Cause**: `window.USWDS` global object didn't exist
- **Why**: ES module imports don't create global objects

### The Fix
```html
<!-- .storybook/preview-head.html -->
<script>
  function loadUSWDS() {
    const script = document.createElement('script');
    script.src = '/node_modules/@uswds/uswds/dist/js/uswds.min.js';
    script.onload = function() {
      if (typeof window.USWDS !== 'undefined') {
        console.log('✅ USWDS global bundle loaded successfully');
        window.uswdsPresent = true;
      }
    };
    document.head.appendChild(script);
  }
</script>
```

**Result**: Modal works perfectly ✅

---

## Comparison of Approaches

### 1. Component-Level Init (Current - 29 Components)

```typescript
// Each component does this
private async initializeUSWDS() {
  const module = await import('@uswds/uswds/js/usa-component');
  module.default.on(this);
}
```

**Pros:**
- ✅ Self-contained components
- ✅ Only loads modules components actually use
- ✅ TypeScript-friendly imports

**Cons:**
- ❌ Doesn't create `window.USWDS` global (modal needs this)
- ❌ Each component loads independently (timing issues)
- ❌ 29 components each doing dynamic imports
- ❌ Complex loader logic in `uswds-loader.ts`

### 2. Option B - Global `.on(document)` (Validation Wants This)

```html
<script type="module">
  window.__USWDS_MODULES__ = {};

  const datePickerModule = await import('/node_modules/.vite/deps/@uswds_uswds_js_usa-date-picker.js');
  window.__USWDS_MODULES__['date-picker'] = datePickerModule.default;

  // Repeat for all 15+ components

  datePickerModule.default.on(document);
  // ... register all components
</script>
```

**Pros:**
- ✅ Event delegation from USWDS receptor pattern
- ✅ Central initialization point
- ✅ Theoretical performance benefits

**Cons:**
- ❌ Still doesn't create `window.USWDS` global
- ❌ Must manually maintain list of all components
- ❌ Vite pre-bundle paths fragile (404 errors)
- ❌ Requires `window.__USWDS_MODULES__` custom system
- ❌ More complex than needed

### 3. Script Tag Approach (Just Implemented for Modal)

```html
<script>
  // Load USWDS bundle via script tag
  const script = document.createElement('script');
  script.src = '/node_modules/@uswds/uswds/dist/js/uswds.min.js';
  document.head.appendChild(script);
</script>
```

**Pros:**
- ✅ Creates `window.USWDS` global (modal requirement)
- ✅ Single load point - loads once, all components benefit
- ✅ Matches official USWDS usage pattern
- ✅ Simple, no custom loader logic needed
- ✅ **Proven working** (modal confirmed fixed)
- ✅ Automatic USWDS initialization on page load
- ✅ All components enhanced automatically

**Cons:**
- ⚠️ Loads full USWDS bundle (but we need most components anyway)
- ⚠️ Changes architectural pattern (but current pattern has problems)
- ⚠️ Conflicts with Option B validation (but Option B doesn't work for modal)

---

## Analysis: Why Script Tag is Better

### 1. **It Matches USWDS Official Usage**

From USWDS documentation:
```html
<!-- This is how USWDS is meant to be used -->
<script src="path/to/uswds.min.js"></script>
```

We're fighting against the framework by trying to use ES modules.

### 2. **It Solves Real Problems**

- Modal **requires** `window.USWDS.modal.init()` - only script tag provides this
- Other components may have similar requirements we haven't discovered yet
- Date picker, combo box, file input all use USWDS global object

### 3. **It Simplifies Our Code**

**Current complexity** (uswds-loader.ts - 413 lines):
- Dynamic imports with fallbacks
- Module name normalization
- Pre-loaded module checks
- Error handling for multiple scenarios
- Special cases for modal, combo-box, etc.

**With script tag** (could be ~50 lines):
- USWDS loads once globally
- Components just render HTML
- USWDS enhances automatically
- No custom loader needed

### 4. **It's More Reliable**

- ✅ No dynamic import timing issues
- ✅ No Vite pre-bundle path dependencies
- ✅ No module resolution failures
- ✅ USWDS controls its own initialization

### 5. **Bundle Size is Negligible**

The full USWDS bundle is ~180KB minified. We're already using:
- accordion
- date-picker
- modal
- combo-box
- time-picker
- header
- file-input
- tooltip
- character-count
- pagination
- search
- etc.

We'd load 90% of the bundle anyway via individual imports.

---

## Recommendation

### **✅ Adopt Script Tag Approach for All Components**

**Why:**
1. **It works** - Modal is now functioning correctly
2. **It's simpler** - Removes 300+ lines of complex loader code
3. **It's official** - Matches USWDS recommended usage
4. **It's reliable** - No timing or module resolution issues
5. **It's maintainable** - Less custom code to debug

### Migration Plan

#### Phase 1: Update Storybook (Already Done)
- ✅ Load USWDS via script tag in preview-head.html
- ✅ Add CSS to prevent modal flash
- ✅ Update cleanup decorator

#### Phase 2: Simplify Components (To Do)
```typescript
// BEFORE (complex)
private async initializeUSWDS() {
  const module = await import('@uswds/uswds/js/usa-modal');
  await this.updateComplete;
  if (module?.default?.on) {
    module.default.on(this);
  }
}

// AFTER (simple)
override connectedCallback() {
  super.connectedCallback();
  // USWDS automatically enhances via global initialization
  // No manual init needed
}
```

#### Phase 3: Update Documentation
- Update ARCHITECTURE comments in components
- Update guides/STORYBOOK_GUIDE.md#uswds-integration
- Update component READMEs
- Archive Option B documentation

#### Phase 4: Update Validation
- Remove Option B validation from pre-commit
- Add validation that script tag exists in preview-head.html
- Verify `window.USWDS` is available

#### Phase 5: Production Setup
```html
<!-- index.html or app entry point -->
<script src="https://cdn.example.com/uswds/uswds.min.js"></script>
<!-- OR -->
<script src="/assets/uswds.min.js"></script>
```

---

## Addressing Concerns

### "But Option B uses event delegation!"

**Reality**: Script tag approach ALSO uses event delegation.

When USWDS loads via script tag, it:
1. Calls `.on(document)` internally for all components
2. Registers event delegation handlers
3. Enhances elements as they're added to DOM

We get the same event delegation without manually managing it.

### "But we want tree-shaking!"

**Reality**: We use 15+ USWDS components. The bundle includes them all anyway.

Even with individual imports, the total size is nearly the same as the full bundle.

### "But components should be self-contained!"

**Reality**: USWDS components are NOT designed to be self-contained.

They're designed to work with a global USWDS object. Fighting this creates problems (like the modal issue we just fixed).

---

## Decision Matrix

| Criteria | Component Init | Option B | Script Tag |
|----------|---------------|----------|------------|
| **Works for Modal** | ❌ No | ❌ No | ✅ Yes |
| **Simplicity** | ⚠️ Medium | ❌ Complex | ✅ Simple |
| **Reliability** | ⚠️ Timing issues | ⚠️ Path issues | ✅ Reliable |
| **Maintainability** | ⚠️ 413 lines | ❌ Manual list | ✅ Minimal code |
| **Official Pattern** | ❌ Custom | ❌ Custom | ✅ Official |
| **Bundle Size** | ✅ Same | ✅ Same | ✅ Same |
| **Event Delegation** | ✅ Yes | ✅ Yes | ✅ Yes |

**Winner**: 🏆 Script Tag Approach

---

## Implementation Checklist

- [x] Load USWDS via script tag in Storybook
- [x] Add CSS to prevent modal flash
- [x] Update uswds-loader.ts to use window.USWDS
- [x] Document the solution
- [ ] Simplify remaining 28 components
- [ ] Remove Option B validation
- [ ] Add script tag validation
- [ ] Update all component documentation
- [ ] Add production index.html example

---

## Conclusion

The script tag approach is:
- **Proven working** (modal fix confirmed)
- **Simpler** (removes complex loader logic)
- **Official** (matches USWDS usage)
- **Reliable** (no timing/import issues)

We should update our validation to match this reality rather than blocking a working solution.

**Recommendation: Approve migration to script tag approach for all components.**
