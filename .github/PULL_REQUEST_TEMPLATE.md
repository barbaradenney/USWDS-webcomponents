## Description

<!-- Provide a clear and concise description of your changes -->

**Workflow Note:** This PR follows the [Git Workflow Guide](../docs/GIT_WORKFLOW.md). Claude (AI) creates PRs → User reviews and approves → Either can merge after approval and CI passes.

## Related Issue

<!-- Link to the related issue. Use "Fixes #123" or "Closes #456" to auto-close issues -->

Fixes #

## Type of Change

<!-- Mark the relevant option with an "x" -->

- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 🧩 New component (USWDS component implementation)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📚 Documentation update
- [ ] ♻️ Code refactoring (no functional changes)
- [ ] ✅ Test improvements
- [ ] 🔧 Build/tooling changes

## AI-Assisted Development

<!-- This is a 100% AI-contributed project -->

**AI Tool Used:**
<!-- e.g., Claude Code, GitHub Copilot, Cursor, ChatGPT, etc. -->

**Approach:**
<!-- Briefly describe how you used AI to implement this change -->
<!-- Example:
- Used Claude Code to analyze USWDS source code
- Generated initial component structure with GitHub Copilot
- Refined tests with iterative AI assistance
-->

## Changes Made

<!-- Provide a detailed list of changes -->

-
-
-

## USWDS Compliance

<!-- For component changes - verify USWDS alignment -->

- [ ] Follows USWDS patterns exactly
- [ ] Uses official USWDS CSS classes (no custom styles)
- [ ] Uses Light DOM (no Shadow DOM)
- [ ] Implements all USWDS variants
- [ ] Matches USWDS JavaScript behavior
- [ ] Includes USWDS documentation links in component README

<!-- Link to USWDS component (if applicable) -->
**USWDS Reference:** https://designsystem.digital.gov/components/...

## Testing

<!-- Describe the testing you performed -->

### Test Coverage

- [ ] Unit tests added/updated (Vitest)
- [ ] Component tests added/updated (Cypress, if interactive)
- [ ] Accessibility tests added/updated (axe-core)
- [ ] Tested in Storybook
- [ ] All existing tests pass (`pnpm test`)

### Manual Testing

<!-- Describe manual testing performed -->

**Browsers Tested:**
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

**Test Scenarios:**
<!-- Describe key scenarios tested -->
1.
2.
3.

## Screenshots/Videos

<!-- If applicable, add screenshots or videos demonstrating the changes -->
<!-- Drag and drop images here or paste image URLs -->

## Accessibility

<!-- Verify accessibility compliance -->

- [ ] Keyboard navigation works correctly
- [ ] Screen reader compatible (tested with NVDA/JAWS/VoiceOver)
- [ ] ARIA attributes properly implemented
- [ ] Color contrast meets WCAG 2.1 AA standards
- [ ] Focus indicators are visible
- [ ] Passes axe-core accessibility tests

## Documentation

<!-- Ensure documentation is complete -->

- [ ] Component README.mdx updated
- [ ] Storybook stories added/updated with all variants
- [ ] JSDoc comments added to public APIs
- [ ] CHANGELOG.md updated (if applicable)
- [ ] Migration guide provided (if breaking change)

## Pre-submission Checklist

<!-- All items must be checked before submitting -->

### Code Quality

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] No console.log or debug code left in
- [ ] ESLint passes (`pnpm run lint`)
- [ ] TypeScript compiles without errors (`pnpm run typecheck`)
- [ ] All pre-commit hooks pass

### Architecture

- [ ] Follows Script Tag Pattern (if component)
- [ ] Follows Light DOM requirement
- [ ] Minimal wrapper pattern (no custom CSS beyond essential host styles)
- [ ] Uses composition from other USWDS components (not inline HTML duplication)
- [ ] USWDS compliance validation passes (`pnpm run validate:uswds-compliance`)

### Testing

- [ ] All tests pass (`pnpm test`)
- [ ] Test coverage is adequate
- [ ] No skipped tests without documentation
- [ ] Regression tests added (if fixing a bug)

### Build

- [ ] Project builds successfully (`pnpm run build`)
- [ ] No build warnings
- [ ] Bundle size impact is acceptable

### AI Contribution

- [ ] Code was written with AI assistance (required)
- [ ] AI-generated code has been reviewed and understood
- [ ] Code quality meets project standards
- [ ] All architectural decisions are documented

## Breaking Changes

<!-- If this is a breaking change, describe the impact and migration path -->

**Impact:**
<!-- What will break? -->

**Migration Path:**
<!-- How should users update their code? -->

```typescript
// Before
// ...

// After
// ...
```

## Additional Notes

<!-- Any additional information that reviewers should know -->

## Checklist for Reviewer (User)

<!-- For the User during review - this is your approval checklist -->

**Code Quality:**
- [ ] Code review completed
- [ ] Architecture aligns with project guidelines
- [ ] No unnecessary complexity or over-engineering
- [ ] Follows established patterns from GIT_WORKFLOW.md

**Testing & Validation:**
- [ ] All CI checks pass (required before merge)
- [ ] Tests are comprehensive and passing
- [ ] No security concerns identified
- [ ] USWDS compliance verified (if applicable)

**Documentation:**
- [ ] Documentation is clear and accurate
- [ ] Changes are well-explained in PR description
- [ ] Breaking changes are documented (if applicable)

**Final Approval:**
- [ ] Ready to approve and merge
- [ ] Will approve this PR after review
- [ ] Can merge after approval + CI passes

---

**Thank you for contributing to USWDS Web Components!** 🎉

Remember: This project maintains 100% USWDS compliance and is built entirely with AI assistance. Your contributions help push the boundaries of AI-driven development while making government websites more accessible.
