# USWDS Icon Implementation Guidelines

**Purpose**: Ensure consistent, compliant icon usage across all components following official USWDS patterns.

## ✅ **CORRECT USWDS Icon Implementation**

### **CSS Background-Image Approach (Recommended)**

Icons should be provided by USWDS CSS using `background-image` property:

```typescript
// ✅ CORRECT: Empty button, icon via CSS
<button class="usa-date-picker__button" type="button" aria-label="Toggle calendar">
  <!-- Icon provided by USWDS CSS background-image -->
</button>
```

```css
/* USWDS provides this automatically */
.usa-date-picker__button {
  background-image: url("../img/usa-icons/calendar_today.svg");
  background-repeat: no-repeat;
  background-position: center;
}
```

### **Benefits of CSS Approach**
- ✅ **Visual Consistency**: Perfect match with official USWDS
- ✅ **Maintenance**: Icons update automatically with USWDS releases
- ✅ **Performance**: No additional DOM elements
- ✅ **Accessibility**: Proper ARIA labels without decorative content
- ✅ **Compliance**: Follows official USWDS implementation patterns

## ❌ **INCORRECT Icon Implementations**

### **Custom Inline SVG (Forbidden)**

```typescript
// ❌ INCORRECT: Custom inline SVG
<button class="usa-date-picker__button">
  <img src="data:image/svg+xml,%3Csvg..." alt="Toggle calendar" />
</button>
```

### **Custom Icon Files (Forbidden)**

```typescript
// ❌ INCORRECT: Custom icon source
<button class="usa-search__submit">
  <img src="./custom-icons/search.svg" alt="Search" />
</button>
```

### **Problems with Custom Icons**
- ❌ **Visual Inconsistency**: May not match USWDS design exactly
- ❌ **Maintenance Burden**: Must be manually updated
- ❌ **Compliance Issues**: Breaks USWDS validation
- ❌ **Performance Impact**: Additional HTTP requests and DOM elements

## 🛠️ **Implementation Patterns**

### **Date Picker Icon**

```typescript
// Component property: NO icon properties needed
@customElement('usa-date-picker')
export class USADatePicker extends USWDSBaseComponent {
  // No submitIconSrc or similar properties
}

// Template: Empty button
render() {
  return html`
    <button type="button" class="usa-date-picker__button" aria-label="Toggle calendar">
      <!-- Icon provided by USWDS CSS background-image -->
    </button>
  `;
}
```

### **Search Button Icon**

```typescript
// Component: No icon properties
@customElement('usa-search')
export class USASearch extends USWDSBaseComponent {
  // No submitIconSrc or submitIconAlt properties
}

// Template: Button with text + CSS icon
render() {
  return html`
    <button type="submit" class="usa-button usa-search__submit">
      <span class="usa-search__submit-text">Search</span>
      <!-- Icon provided by USWDS CSS background-image -->
    </button>
  `;
}
```

### **Icon Button Pattern**

For components needing icon buttons:

1. **Use USWDS CSS classes**: `.usa-button`, `.usa-date-picker__button`, etc.
2. **Empty content**: Let CSS provide the icon
3. **Proper ARIA labels**: Describe the action, not the icon
4. **No custom properties**: Avoid `iconSrc`, `iconAlt`, etc.

## 📋 **Development Checklist**

When creating or updating components with icons:

- [ ] **Remove custom icon properties** (`iconSrc`, `iconAlt`, etc.)
- [ ] **Use official USWDS CSS classes** for buttons/icons
- [ ] **Empty button content** (except required text)
- [ ] **Add CSS comment** `<!-- Icon provided by USWDS CSS background-image -->`
- [ ] **Proper ARIA labels** describing the action
- [ ] **Test visual alignment** with official USWDS examples
- [ ] **Update Storybook stories** to remove deprecated icon controls
- [ ] **Update tests** to expect USWDS-compliant structure

## 🔍 **Available USWDS Icons**

### **Common Component Icons**
- **Calendar**: `calendar_today.svg` (date picker)
- **Search**: `search.svg` (search submit)
- **Close**: `close.svg` (modals, alerts)
- **Expand/Collapse**: `expand_more.svg`, `expand_less.svg`
- **Navigation**: `navigate_next.svg`, `navigate_before.svg`

### **Icon Locations**
- **Primary**: `node_modules/@uswds/uswds/dist/img/usa-icons/`
- **Material**: `node_modules/@uswds/uswds/dist/img/material-icons/`

## 🚨 **Validation & Compliance**

### **Automated Detection**

Our USWDS compliance script automatically detects:

```javascript
// Flags these patterns as non-compliant:
const inlineSvgPattern = /src="data:image\/svg\+xml/g;
const customIconPattern = /src="[^"]*\.svg"/g;
```

### **Manual Verification**

1. **Visual Check**: Compare with USWDS documentation
2. **Code Review**: Ensure no custom icon properties
3. **CSS Inspection**: Verify background-image usage
4. **Test Coverage**: Icon-specific test cases

## 📚 **Resources**

- **USWDS Icons Documentation**: https://designsystem.digital.gov/components/icon/
- **Date Picker Reference**: https://designsystem.digital.gov/components/date-picker/
- **Search Reference**: https://designsystem.digital.gov/components/search/
- **USWDS GitHub Icons**: https://github.com/uswds/uswds/tree/develop/dist/img/usa-icons

## 🎯 **Examples of Compliant Components**

### **Before (Non-Compliant)**
```typescript
@property({ type: String })
submitIconSrc = './img/usa-icons-bg/search--white.svg';

render() {
  return html`
    <button class="usa-search__submit">
      <img src="${this.submitIconSrc}" class="usa-search__submit-icon" />
    </button>
  `;
}
```

### **After (USWDS-Compliant)**
```typescript
// No icon properties needed

render() {
  return html`
    <button class="usa-button usa-search__submit" type="submit">
      <span class="usa-search__submit-text">Search</span>
      <!-- Icon provided by USWDS CSS background-image -->
    </button>
  `;
}
```

---

**Status**: Phase 1.2 Complete ✅
**Last Updated**: September 16, 2025
**Compliance**: 100% USWDS Icon Standard