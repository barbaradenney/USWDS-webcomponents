# AI Code Quality Guide

**Ensures clean, efficient code by detecting common AI code generation anti-patterns that human developers dislike.**

## Overview

This guide documents the automated AI code quality system that runs during pre-commit validation. The system detects common issues that AI code generation tools create and provides actionable fixes.

**Goal**: Ensure the code you commit is the **cleanest, most efficient code possible** - code that human developers will appreciate.

## Problem Solved

AI code generation (including Claude, GPT, Copilot, etc.) often creates code with patterns that work but are disliked by human developers:

❌ **Over-commenting** - Obvious comments that just restate the code
❌ **Overly verbose names** - Variable names that are too long
❌ **Debug leftovers** - console.log statements not cleaned up
❌ **Generic errors** - "Error", "Something went wrong"
❌ **Memory leaks** - Event listeners without cleanup
❌ **Over-engineering** - Unnecessary abstractions
❌ **Magic numbers** - Hard-coded values without constants
❌ **Deep nesting** - 4+ levels of if/for statements
❌ **Copy-paste duplication** - Numbered variables (foo1, foo2)

✅ **Solution**: Automated detection + pre-commit blocking + actionable fixes

## How It Works

### 1. Pre-Commit Validation (Stage 6b/9)

**Automatic**: Runs on every commit
**Blocks**: Console.log, debug code, memory leaks (errors)
**Warns**: Over-commenting, verbose names, generic errors (warnings in strict mode)

```bash
git commit -m "..."
# ↓
🤖 6b/9 AI code quality...
❌ AI code quality issues detected!
```

**Bypass if needed** (not recommended):
```bash
AI_QUALITY_STRICT=0 git commit -m "..."
```

### 2. Manual Validation

```bash
# Check AI code quality
npm run validate:ai-quality

# Check refactoring opportunities
npm run validate:refactoring

# Run both
npm run validate:clean-code
```

### 3. Refactoring Analysis (Opt-in)

```bash
# Enable refactoring suggestions during commit
CODE_REFACTOR_CHECK=1 git commit -m "..."
```

## Common AI Anti-Patterns Detected

### 1. Over-Commenting ⚠️ WARNING

**Problem**: AI adds obvious comments that just restate the code.

❌ **Bad** (AI often generates):
```typescript
// Set the count to 0
const count = 0;

// Get the user from the database
const user = await db.getUser(id);

// Loop through the items
for (const item of items) {
  // Call the process function
  process(item);
}
```

✅ **Good**:
```typescript
const count = 0; // No comment needed - obvious

const user = await db.getUser(id); // Clear from function name

// Process items in batch for performance
for (const item of items) {
  process(item);
}
```

**Fix**: Remove obvious comments. Only comment the "why", not the "what".

### 2. Overly Verbose Variable Names ⚠️ WARNING

**Problem**: AI creates variable names that are too descriptive.

❌ **Bad** (>20 characters):
```typescript
const getUserInformationFromDatabaseById = async (id) => {};
const shouldCheckIfUserIsAuthenticatedAndHasPermission = true;
```

✅ **Good**:
```typescript
const getUser = async (id) => {};  // Context makes it clear
const isAuthorized = true;          // Concise but clear
```

**Fix**: Use concise names. Context provides meaning.

### 3. Debug Code Not Removed ❌ ERROR (blocks commit)

**Problem**: console.log/debugger left in code.

❌ **Bad**:
```typescript
function processData(data) {
  console.log('Processing:', data);  // ← Blocks commit
  debugger;  // ← Blocks commit
  return transform(data);
}
```

✅ **Good**:
```typescript
function processData(data) {
  // Use logger for production-appropriate logging
  logger.debug('Processing data', { size: data.length });
  return transform(data);
}
```

**Fix**: Remove all console.log/debugger before commit.
**Allowed**: console.error(), console.warn()

### 4. Generic Error Messages ⚠️ WARNING

**Problem**: AI uses generic error messages that don't help debugging.

❌ **Bad**:
```typescript
throw new Error('Error');
throw new Error('An error occurred');
throw new Error('Something went wrong');

catch (e) {} // Silent error
```

✅ **Good**:
```typescript
throw new Error(`Failed to load user ${userId}: ${reason}`);
throw new Error('API rate limit exceeded - retry after 60s');

catch (error) {
  logger.error('Failed to save data', { error, context });
  throw error; // Re-throw or handle appropriately
}
```

**Fix**: Provide specific, actionable error messages.

### 5. Memory Leaks ❌ ERROR (blocks commit)

**Problem**: Event listeners, intervals, timeouts without cleanup.

❌ **Bad**:
```typescript
// In component lifecycle
connectedCallback() {
  window.addEventListener('resize', this.handleResize);
  this.interval = setInterval(this.poll, 1000);
}
// ❌ No cleanup - memory leak!
```

✅ **Good**:
```typescript
connectedCallback() {
  window.addEventListener('resize', this.handleResize);
  this.interval = setInterval(this.poll, 1000);
}

disconnectedCallback() {
  window.removeEventListener('resize', this.handleResize);
  clearInterval(this.interval);
}
```

**Fix**: Always clean up in disconnectedCallback/componentWillUnmount/useEffect cleanup.

### 6. Magic Numbers ⚠️ WARNING

**Problem**: Hard-coded numbers without explanation.

❌ **Bad**:
```typescript
setTimeout(callback, 5000);  // What's 5000?
if (count === 429) {}        // What's 429?
array[47]                    // Why 47?
```

✅ **Good**:
```typescript
const DEBOUNCE_DELAY_MS = 5000;
setTimeout(callback, DEBOUNCE_DELAY_MS);

const HTTP_TOO_MANY_REQUESTS = 429;
if (statusCode === HTTP_TOO_MANY_REQUESTS) {}

const HEADER_OFFSET = 47;  // Skip header rows
array[HEADER_OFFSET]
```

**Fix**: Use named constants for all magic numbers.

### 7. Deep Nesting ⚠️ WARNING / ❌ ERROR (>5 levels)

**Problem**: AI loves nesting if statements.

❌ **Bad** (4+ levels):
```typescript
if (user) {
  if (user.isActive) {
    if (user.hasPermission) {
      if (feature.isEnabled) {
        // Finally do the thing
      }
    }
  }
}
```

✅ **Good** (early returns):
```typescript
if (!user) return;
if (!user.isActive) return;
if (!user.hasPermission) throw new UnauthorizedError();
if (!feature.isEnabled) return;

// Do the thing
```

**Fix**: Use early returns, extract to functions, or use logical AND.

### 8. Over-Engineering ⚠️ WARNING

**Problem**: AI adds unnecessary abstractions.

❌ **Bad**:
```typescript
class UserFactory {
  createUser(data) {
    return new User(data);
  }
}

// Usage
const factory = new UserFactory();
const user = factory.createUser(data);
```

✅ **Good**:
```typescript
const user = new User(data); // Direct construction
```

**Fix**: Use the simplest solution that works. Add abstractions only when needed.

### 9. Copy-Paste Duplication ⚠️ WARNING

**Problem**: AI numbers variables when duplicating code.

❌ **Bad**:
```typescript
const handler1 = (e) => console.log(e);
const handler2 = (e) => console.log(e);
const handler3 = (e) => console.log(e);
```

✅ **Good**:
```typescript
const createHandler = (name) => (e) => logger.log(name, e);
const handlers = ['click', 'hover', 'focus'].map(createHandler);
```

**Fix**: Extract common logic to reusable functions.

## Code Refactoring Suggestions

### Function Complexity

**Cyclomatic Complexity**: Measures decision points in code.

- **< 10**: ✅ Good
- **10-20**: ⚠️ Consider refactoring
- **> 20**: ❌ Must refactor

```typescript
// Complexity = 12 (too high)
function processOrder(order) {
  if (order.isPaid) {
    if (order.isShipped) {
      if (order.isDelivered) {
        return 'complete';
      } else if (order.inTransit) {
        return 'shipping';
      } else {
        return 'pending';
      }
    } else if (order.needsPackaging) {
      return 'packaging';
    }
  } else if (order.isExpired) {
    return 'expired';
  }
  // ... more conditions
}
```

**Fix**: Extract conditional logic to separate functions.

### Function Length

- **< 50 lines**: ✅ Good
- **50-100 lines**: ⚠️ Consider splitting
- **> 100 lines**: ❌ Must split

**Fix**: Extract logical blocks to separate functions.

### Too Many Parameters

- **< 4 parameters**: ✅ Good
- **4-7 parameters**: ⚠️ Consider options object
- **> 7 parameters**: ❌ Must use options object

❌ **Bad**:
```typescript
function createUser(name, email, age, address, phone, role, department, manager) {}
```

✅ **Good**:
```typescript
function createUser(userData: {
  name: string;
  email: string;
  age: number;
  contact: ContactInfo;
  role: Role;
  department: string;
  manager?: string;
}) {}
```

## Best Practices

### 1. Write Code for Humans

Code is read 10x more than it's written. Optimize for readability.

### 2. Follow Existing Patterns

Check how the codebase handles similar situations and follow that pattern.

### 3. Use Descriptive Names (But Not Overly Long)

- Functions: `getUser()` not `getUserFromDatabase()` (context is clear)
- Variables: `isActive` not `checkIfUserIsCurrentlyActiveInSystem`
- Constants: `MAX_RETRIES` not `MAXIMUM_NUMBER_OF_RETRY_ATTEMPTS`

### 4. Comment the Why, Not the What

```typescript
// ❌ Bad: Restates code
// Loop through users
for (const user of users) {}

// ✅ Good: Explains reasoning
// Process in batches to avoid rate limiting
for (const user of users) {}
```

### 5. Handle Errors Properly

- Provide specific error messages
- Log with context
- Don't silently catch and ignore

### 6. Clean Up Resources

Always clean up:
- Event listeners
- Intervals/timeouts
- File handles
- Network connections
- Observers

### 7. Keep It Simple

Don't add abstractions until you need them. YAGNI (You Aren't Gonna Need It).

## Commands Reference

```bash
# Pre-commit (automatic)
git commit -m "..."
# AI quality check runs automatically

# Bypass warnings (not recommended)
AI_QUALITY_STRICT=0 git commit -m "..."

# Manual validation
npm run validate:ai-quality       # Check AI quality
npm run validate:refactoring      # Check refactoring opportunities
npm run validate:clean-code       # Run both

# Enable refactoring check during commit (opt-in)
CODE_REFACTOR_CHECK=1 git commit -m "..."
```

## Configuration

### Adjust Strictness

Edit `scripts/validate/ai-code-quality-validator.cjs`:
```javascript
const AI_ANTI_PATTERNS = {
  debugStatements: {
    severity: 'error',  // or 'warning' or 'info'
    patterns: [...]
  }
}
```

### Adjust Refactoring Thresholds

Edit `scripts/validate/code-refactoring-analyzer.cjs`:
```javascript
const THRESHOLDS = {
  cyclomaticComplexity: {
    warning: 10,
    error: 20,
  },
  functionLength: {
    warning: 50,
    error: 100,
  },
}
```

## FAQ

**Q: Why does AI generate these patterns?**
A: AI learns from training data which includes code of varying quality. It optimizes for "working code" not "clean code".

**Q: Can I disable the AI quality check?**
A: Yes: `AI_QUALITY_STRICT=0 git commit`, but not recommended. Fix the issues instead.

**Q: What if I need a console.log for legitimate reasons?**
A: Use a proper logger (logger.debug()) or add a TODO comment with issue reference.

**Q: Are these rules too strict?**
A: They enforce industry best practices. All blocked items (errors) are genuine code issues.

## Related Documentation

- [Code Quality Architectural Review](CODE_QUALITY_ARCHITECTURAL_REVIEW.md) - Architecture patterns
- [Testing Guide](TESTING_GUIDE.md) - Testing best practices
- [USWDS Integration Guide](USWDS_INTEGRATION_GUIDE.md) - USWDS patterns

## Summary

The AI Code Quality system ensures you commit **clean, efficient, maintainable code** that human developers will appreciate. It catches common AI patterns early, provides actionable fixes, and enforces best practices automatically.

**Result**: Better code quality, fewer review comments, more maintainable codebase.
