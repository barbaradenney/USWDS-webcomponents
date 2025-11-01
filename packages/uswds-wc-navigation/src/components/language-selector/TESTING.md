This document tracks all testing coverage for this component to ensure comprehensive validation and accessibility compliance.

**Last Updated**: 2025-10-19  
**Test Coverage**: 60%  
**Accessibility Score**: WCAG AA Compliant ✅

## 🧪 Test Summary

### Unit Tests (Vitest)

✅ **59 unit tests** implemented

- Component rendering, properties, events, and methods tested

### ♿ Accessibility Tests

✅ **ARIA attributes and roles tested**
✅ **Keyboard navigation tested**
✅ **Accessibility documented in Storybook**

### 🖱️ Interactive Tests (Cypress)

⚠️ **Interactive tests needed**

- User interactions (click, focus, keyboard)
- Form integration testing
- State transition validation

### 📱 Responsive & Visual Tests

✅ **Storybook stories** available

- 5 visual test scenarios

### 🔧 E2E Integration Tests

⚠️ **E2E tests recommended** for complex workflows

## 📊 Detailed Accessibility Compliance

### WCAG 2.1 AA Requirements

✅ **ARIA Implementation**: Roles, labels, and descriptions properly set
✅ **Keyboard Navigation**: Tab order and keyboard interactions tested
⚠️ **Focus Management**: Focus behavior needs validation
⚠️ **Automated Testing**: Recommend axe-core integration for comprehensive a11y testing

### Screen Reader Compatibility

- ⚠️ **Manual testing needed** with VoiceOver, NVDA, and JAWS
- Component should announce purpose, state, and interactions clearly
- Content should be logically structured for screen readers

## 📋 Detailed Unit Test Coverage

The following 55 unit tests ensure comprehensive validation of the component:

### Component Initialization

- **should create language selector element**: Should create language selector element.
- **should have default properties**: Should have default properties.
- **should render light DOM for USWDS compatibility**: Should render light DOM for USWDS compatibility.
- **should render default two-language variant**: Should render default two-language variant.

### USWDS HTML Structure and Classes

- **should have proper USWDS classes for two-language variant**: Should have proper USWDS classes for two-language variant.
- **should apply small variant classes correctly**: Should apply small variant classes correctly.
- **should render proper dropdown structure**: Should render proper dropdown structure.
- **should render unstyled variant correctly**: Should render unstyled variant correctly.

### Language Selection

- **should handle language selection in two-language mode**: Should handle language selection in two-language mode.
- **should handle language selection in dropdown mode**: Should handle language selection in dropdown mode.
- **should dispatch custom events with correct details**: Should dispatch custom events with correct details.
- **should navigate to href when provided**: Should navigate to href when provided.

### Dropdown Functionality

- **should toggle dropdown open/closed**: Should toggle dropdown open/closed.
- **should update aria-expanded attribute**: Should update aria-expanded attribute.
- **should show/hide submenu based on state**: Should show/hide submenu based on state.
- **should close dropdown when language is selected**: Should close dropdown when language is selected.

### Language Management

- **should add new languages**: Should add new languages.
- **should not add duplicate languages**: Should not add duplicate languages.
- **should remove languages**: Should remove languages.
- **should update current language when removed language was current**: Should update current language when removed language was current.
- **should get current language object**: Should get current language object.
- **should set current language by code**: Should set current language by code.

### Public API Methods

- **should provide dropdown control methods**: Should provide dropdown control methods.
- **should only affect dropdown in dropdown variant**: Should only affect dropdown in dropdown variant.

### Variant Auto-Detection

- **should automatically switch to dropdown for multiple languages**: Should automatically switch to dropdown for multiple languages.
- **should respect explicit dropdown variant setting**: Should respect explicit dropdown variant setting.

### Accessibility Features

- **should have proper lang attributes**: Should have proper lang attributes.
- **should mark current language with usa-current class**: Should mark current language with usa-current class.
- **should have proper ARIA controls in dropdown**: Should have proper ARIA controls in dropdown.
- **should prevent default on link clicks**: Should prevent default on link clicks.

### Application Use Cases

- **should handle federal website language requirements**: Should handle federal website language requirements.
- **should support emergency multilingual notifications**: Should support emergency multilingual notifications.
- **should handle immigration services multilingual patterns**: Should handle immigration services multilingual patterns.

### Edge Cases and Error Handling

- **should handle empty language array gracefully**: Tests behavior with empty language array gracefully values
- **should handle invalid current language code**: Validates handling of invalid current language code input
- **should handle setCurrentLanguage with invalid code**: Should handle setCurrentLanguage with invalid code.
- **should handle rapid dropdown toggles**: Should handle rapid dropdown toggles.
- **should maintain functionality after DOM manipulation**: Should maintain functionality after DOM manipulation.

### Performance and Memory

- **should handle large language lists efficiently**: Should handle large language lists efficiently.
- **should clean up event listeners properly**: Should clean up event listeners properly.

### CRITICAL: Component Lifecycle Stability

- **should remain in DOM after property changes**: Should remain in DOM after property changes.
- **should maintain element stability during multiple language updates**: Should maintain element stability during multiple language updates.
- **should preserve DOM connection through variant changes**: Should preserve DOM connection through variant changes.

### CRITICAL: Event System Stability

- **should not pollute global event handling**: Should not pollute global event handling.
- **should maintain event stability across dropdown operations**: Should maintain event stability across dropdown operations.
- **should maintain stability during rapid language selections**: Should maintain stability during rapid language selections.

### CRITICAL: Dropdown State Management Stability

- **should maintain DOM connection during dropdown state changes**: Should maintain DOM connection during dropdown state changes.
- **should preserve element stability during interactive dropdown usage**: Should preserve element stability during interactive dropdown usage.
- **should maintain stability during complex dropdown interactions**: Should maintain stability during complex dropdown interactions.

### CRITICAL: Storybook Integration

- **should render in Storybook-like environment without auto-dismiss**: Should render in Storybook-like environment without auto-dismiss.
- **should handle Storybook args updates without component removal**: Should handle Storybook args updates without component removal.

### JavaScript Implementation Validation

- **should pass JavaScript implementation validation**: Should pass JavaScript implementation validation.

### Accessibility Compliance (CRITICAL)

- **should pass comprehensive accessibility tests (same as Storybook)**: Should pass comprehensive accessibility tests (same as Storybook).
- **should maintain accessibility during language selection**: Should maintain accessibility during language selection.
- **should be accessible in navigation contexts**: Ensures component meets accessibility standards and guidelines

## 🚨 Testing Gaps & Recommendations

### ⚠️ Coverage Below 70%

Current coverage is 60%. Consider adding:

- Interactive testing with Cypress

## 📝 Test Maintenance

- Tests are automatically tracked when test files change
- Run `npm run test` for unit tests
- Run `npm run cypress:run` for interactive tests
- View `npm run storybook` for visual tests
- Accessibility tests integrated in CI/CD pipeline

---

_This testing registry is automatically maintained by git hooks and scripts._  
_See `docs/TESTING_DOCUMENTATION.md` for automation details._
