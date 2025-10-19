# Component-Based Testing

## Overview

This project now includes a component-based test runner that breaks up the large test suite (2301+ tests) into smaller, manageable chunks organized by component. This provides:

- **Real-time progress tracking**: See which component is currently being tested
- **Better visibility**: Know exactly where tests fail
- **Faster feedback**: Don't wait 2+ hours to see results
- **Detailed reporting**: Get a summary report of all component test results

## Why We Need This

The full test suite with vitest runs all 2301+ tests in a single process, which:
- Takes 2+ hours to complete
- Provides minimal real-time progress feedback
- Makes it hard to identify which specific component has failures
- Difficult to debug when tests hang or fail

## Usage

### Run All Components

```bash
npm run test:by-component
# or
npm run test:chunked
```

This will:
1. Discover all component directories in `src/components/`
2. Run tests for each component sequentially
3. Display real-time progress (`[3/46] Testing: accordion`)
4. Show pass/fail status for each component
5. Generate a detailed report in `test-reports/component-test-results.txt`

### Run a Single Component

```bash
npm test -- component-name
```

Example:
```bash
npm test -- character-count
npm test -- button
npm test -- accordion
```

## Output Example

```
========================================
Component-Based Test Runner
Total Components: 46
========================================

[1/46] Testing: accordion
  Found 2 test file(s)
  ✓ PASSED

[2/46] Testing: alert
  Found 2 test file(s)
  ✓ PASSED

[3/46] Testing: button
  Found 3 test file(s)
  ✓ PASSED

...

========================================
Test Summary
========================================
Total Components: 46
Passed: 44
Failed: 2

Failed Components:
  - character-count
  - time-picker

Full report: test-reports/component-test-results.txt
```

## Benefits

### 1. Progress Tracking
- See exactly which component is being tested
- Know how many components remain
- Estimate completion time based on progress

### 2. Early Failure Detection
- Identify failing components immediately
- Don't wait for full suite to complete
- Fix issues component-by-component

### 3. Parallel Development
- Run tests for specific components you're working on
- Faster iteration cycle
- Better development workflow

### 4. Debugging
- Easier to reproduce failures (run single component)
- Smaller scope for troubleshooting
- Less noise in test output

## Technical Details

### Script Location
- **Script**: `scripts/test-by-component.sh`
- **Report**: `test-reports/component-test-results.txt`

### How It Works

1. **Discovery**: Finds all component directories using `find src/components`
2. **Filtering**: Checks each directory for `*.test.ts` files
3. **Execution**: Runs `npm test -- component-name` for each component
4. **Tracking**: Maintains counters for passed/failed components
5. **Reporting**: Generates detailed report with all results

### Exit Codes

- `0`: All component tests passed
- `1`: One or more component tests failed

### Report Format

The report includes:
- Timestamp of test run
- Component-by-component results
- Summary statistics
- List of failed components (if any)

## Comparison: Full Suite vs Component-Based

| Aspect | Full Suite (`npm test`) | Component-Based (`npm run test:by-component`) |
|--------|-------------------------|----------------------------------------------|
| **Progress Visibility** | Minimal (only at suite completion) | Real-time per component |
| **Total Time** | 60-90 seconds (single component) to 2+ hours (all) | Same total, but better tracking |
| **Failure Identification** | Must search through output | Immediate component-level feedback |
| **Debugging** | Run full suite again | Run single component |
| **CI/CD** | Good for final validation | Good for development workflow |

## Recommendations

### Development Workflow
1. **Working on a component**: Use `npm test -- component-name`
2. **Pre-commit check**: Use `npm run test:by-component` to verify all components
3. **CI/CD**: Use `npm test` for final validation

### Troubleshooting
1. **Test hangs**: Component-based runner helps identify which component is hanging
2. **Intermittent failures**: Run specific component multiple times
3. **Performance issues**: See which components take longest to test

## Future Enhancements

Potential improvements:
- **Parallel execution**: Run multiple components in parallel
- **Smart ordering**: Run fastest components first
- **Retry logic**: Auto-retry failed components
- **HTML reports**: Generate visual reports
- **Watch mode**: Re-run tests on file changes

## Related Documentation

- [Testing Guide](./TESTING_GUIDE.md) - Complete testing documentation
- [Debugging Guide](./DEBUGGING_GUIDE.md) - Troubleshooting help
- [Component Templates](./COMPONENT_TEMPLATES.md) - Test templates
