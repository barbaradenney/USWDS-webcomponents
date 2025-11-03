This document tracks all testing coverage for this component to ensure comprehensive validation and accessibility compliance.

**Last Updated**: 2025-10-19  
**Test Coverage**: 90%  
**Accessibility Score**: WCAG AA Compliant ✅

## 🧪 Test Summary

### Unit Tests (Vitest)

✅ **74 unit tests** implemented

- Component rendering, properties, events, and methods tested

### ♿ Accessibility Tests

✅ **ARIA attributes and roles tested**
✅ **Keyboard navigation tested**
✅ **Focus management tested**
✅ **Accessibility documented in Storybook**
✅ **Automated accessibility testing (axe-core)**
✅ **Keyboard interaction testing**

### 🖱️ Interactive Tests (Cypress)

✅ **Component testing** implemented

- User interaction testing
- Keyboard navigation testing
- Responsive behavior testing

### 📱 Responsive & Visual Tests

✅ **Storybook stories** available

- 14 visual test scenarios

### 🔧 E2E Integration Tests

⚠️ **E2E tests recommended** for complex workflows

## 📊 Detailed Accessibility Compliance

### WCAG 2.1 AA Requirements

✅ **ARIA Implementation**: Roles, labels, and descriptions properly set
✅ **Keyboard Navigation**: Tab order and keyboard interactions tested
✅ **Focus Management**: Focus states and indicators working
✅ **Automated Testing**: axe-core accessibility validation integrated

### Screen Reader Compatibility

- ⚠️ **Manual testing needed** with VoiceOver, NVDA, and JAWS
- Component should announce purpose, state, and interactions clearly
- Content should be logically structured for screen readers

## 📋 Detailed Unit Test Coverage

The following 60 unit tests ensure comprehensive validation of the component:

### Default Properties

- **should have correct default properties**: Should have correct default properties.

### Basic Content Rendering

- **should render heading when provided**: Verifies heading renders correctly when provided
- **should render text content when provided**: Verifies text content renders correctly when provided
- **should render footer text when provided**: Verifies footer text renders correctly when provided
- **should not render sections when content is empty**: Ensures component does not render sections when content is empty

### Heading Levels

- **should render different heading levels correctly**: Should render different heading levels correctly.
- **should default to h3 heading level**: Should default to h3 heading level.

### Media Rendering

- **should render image media when configured**: Verifies image media renders correctly when configured
- **should render video media when configured**: Verifies video media renders correctly when configured
- **should not render media when type is none**: Ensures component does not render media when type is none
- **should not render media when src is empty**: Ensures component does not render media when src is empty

### Media Position Classes

- **should apply inset media class**: Should apply inset media class.
- **should apply exdent media class**: Should apply exdent media class.
- **should apply media-right class to card when mediaPosition is right**: Should apply media-right class to card when mediaPosition is right.
- **should automatically enable flag layout when mediaPosition is right**: Should automatically enable flag layout when mediaPosition is right.

### Card Layout Variants

- **should apply flag layout class**: Should apply flag layout class.
- **should apply header-first class**: Should apply header-first class.
- **should apply multiple layout classes together**: Should apply multiple layout classes together.
- **should always have base usa-card class**: Should always have base usa-card class.

### Actionable Cards

- **should add role and tabindex when actionable**: Should add role and tabindex when actionable.
- **should remove role and tabindex when not actionable**: Should remove role and tabindex when not actionable.
- **should apply actionable container class**: Should apply actionable container class.

### Event Handling

- **should dispatch card-click event when actionable card is clicked**: Ensures card-click event event is dispatched when actionable card is clicked
- **should not dispatch card-click event when not actionable**: Ensures component does not dispatch card-click event when not actionable
- **should handle keyboard events on actionable cards**: Tests keyboard event handling and response
- **should not handle keyboard events when not actionable**: Ensures component does not handle keyboard events when not actionable

### Content Order and Layout

- **should render content in default order**: Should render content in default order.
- **should render header first when headerFirst is true**: Verifies header first renders correctly when headerFirst is true
- **should handle media-right non-flag layout differently**: Should handle media-right non-flag layout differently.

### Comprehensive Slotted Content Validation

- **should render body slot content correctly**: Should render body slot content correctly.
- **should render footer slot content correctly**: Should render footer slot content correctly.
- **should render both body and footer slots together**: Should render both body and footer slots together.
- **should work with assertSlottedContentWorks helper**: Should work with assertSlottedContentWorks helper.
- **should handle complex slotted content**: Should handle complex slotted content.
- **should support default slot content**: Should support default slot content.

### USWDS CSS Classes

- **should always have base usa-card class on host**: Should always have base usa-card class on host.
- **should have correct container structure**: Should have correct container structure.
- **should apply proper USWDS structure**: Should apply proper USWDS structure.

### Light DOM Rendering

- **should render in light DOM for USWDS compatibility**: Should render in light DOM for USWDS compatibility.

### Property Updates

- **should update host classes when layout properties change**: Should update host classes when layout properties change.
- **should update content when properties change**: Should update content when properties change.

### Navigation Handling

- **should include href in card-click event when actionable**: Should include href in card-click event when actionable.
- **should handle target \_blank attribute**: Should handle target \_blank attribute.

### Event Listener Management

- **should add event listeners when connected**: Should add event listeners when connected.
- **should remove event listeners when disconnected**: Should remove event listeners when disconnected.

### CRITICAL: Component Lifecycle Stability

- **should remain in DOM after property changes**: Should remain in DOM after property changes.
- **should maintain element stability during card content updates**: Should maintain element stability during card content updates.
- **should preserve DOM connection through layout property changes**: Should preserve DOM connection through layout property changes.

### CRITICAL: Event System Stability

- **should not pollute global event handling**: Should not pollute global event handling.
- **should maintain stability during card click interactions**: Should maintain stability during card click interactions.
- **should maintain stability during actionable state changes**: Should maintain stability during actionable state changes.

### CRITICAL: Card State Management Stability

- **should maintain DOM connection during media configuration changes**: Should maintain DOM connection during media configuration changes.
- **should preserve element stability during complex card updates**: Should preserve element stability during complex card updates.
- **should maintain stability during heading level changes**: Should maintain stability during heading level changes.

### CRITICAL: Storybook Integration

- **should render in Storybook-like environment without auto-dismiss**: Should render in Storybook-like environment without auto-dismiss.
- **should handle Storybook args updates without component removal**: Should handle Storybook args updates without component removal.
- **should maintain stability during complex Storybook interactions**: Should maintain stability during complex Storybook interactions.

### JavaScript Implementation Validation

- **should pass JavaScript implementation validation**: Should pass JavaScript implementation validation.

### Accessibility

- **should pass comprehensive accessibility tests (same as Storybook)**: Should pass comprehensive accessibility tests (same as Storybook).
- **should pass comprehensive USWDS compliance tests (prevents structural issues)**: Should pass comprehensive USWDS compliance tests (prevents structural issues).

## 🚨 Testing Gaps & Recommendations

### ✅ Good Coverage

Component has solid test coverage. Continue maintaining and expanding as needed.

## 📝 Test Maintenance

- Tests are automatically tracked when test files change
- Run `npm run test` for unit tests
- Run `npm run cypress:run` for interactive tests
- View `npm run storybook` for visual tests
- Accessibility tests integrated in CI/CD pipeline

---

_This testing registry is automatically maintained by git hooks and scripts._  
_See `docs/TESTING_DOCUMENTATION.md` for automation details._
