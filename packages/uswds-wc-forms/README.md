# @uswds-wc/forms

USWDS Form Components - Complete form inputs and controls as Web Components.

## Overview

The `@uswds-wc/forms` package provides web component versions of all USWDS form-related components, including inputs, pickers, validation, and more.

## Installation

```bash
npm install @uswds-wc/forms lit
```

## Components

### Text Input (`<usa-text-input>`)
Standard text input with validation support.

### Textarea (`<usa-textarea>`)
Multi-line text input.

### Select (`<usa-select>`)
Dropdown selection with native semantics.

### Checkbox (`<usa-checkbox>`)
Checkbox input with tile variant.

### Radio (`<usa-radio>`)
Radio button input with tile variant.

### Date Picker (`<usa-date-picker>`)
Calendar-based date selection with USWDS JavaScript behavior.

### Date Range Picker (`<usa-date-range-picker>`)
Select start and end dates with calendar interface.

### Time Picker (`<usa-time-picker>`)
Time selection with dropdown list of times.

### Combo Box (`<usa-combo-box>`)
Searchable select with autocomplete.

### File Input (`<usa-file-input>`)
File upload with drag-and-drop support.

### Character Count (`<usa-character-count>`)
Text input/textarea with live character counter.

### Range Slider (`<usa-range-slider>`)
Slider input for numeric ranges.

### Memorable Date (`<usa-memorable-date>`)
Three-part date input (month/day/year) for memorable dates.

### Input Prefix/Suffix (`<usa-input-prefix-suffix>`)
Text input with prefix or suffix text.

### Validation (`<usa-validation>`)
Form validation feedback component.

## Usage Example

```javascript
import '@uswds-wc/forms';

// Basic text input
const input = document.createElement('usa-text-input');
input.label = 'Email Address';
input.type = 'email';
input.required = true;
```

### Comprehensive Form Example

```html
<form>
  <usa-text-input
    label="Full Name"
    name="fullName"
    required>
  </usa-text-input>

  <usa-text-input
    label="Email Address"
    type="email"
    name="email"
    required>
  </usa-text-input>

  <usa-date-picker
    label="Date of Birth"
    name="dob">
  </usa-date-picker>

  <usa-select
    label="State"
    name="state"
    required>
    <option value="">- Select -</option>
    <option value="CA">California</option>
    <option value="NY">New York</option>
    <option value="TX">Texas</option>
  </usa-select>

  <usa-checkbox
    label="I agree to the terms"
    name="terms"
    required>
  </usa-checkbox>

  <usa-button type="submit">Submit Form</usa-button>
</form>
```

### With Validation

```html
<usa-character-count
  label="Message"
  maxlength="500"
  name="message">
</usa-character-count>

<usa-combo-box
  label="Select a fruit"
  name="fruit">
  <option value="apple">Apple</option>
  <option value="banana">Banana</option>
  <option value="orange">Orange</option>
</usa-combo-box>

<usa-file-input
  label="Upload resume"
  accept=".pdf,.doc,.docx"
  name="resume">
</usa-file-input>
```

## Bundle Size

Gzipped: ~80 KB (largest package due to complex form controls)

## Features

- **Complete Form Suite** - All 15 USWDS form components
- **Native Form Integration** - Works with standard HTML forms
- **Built-in Validation** - HTML5 validation + custom USWDS validation
- **Accessibility** - Full keyboard navigation and screen reader support
- **Date/Time Pickers** - Complex USWDS JavaScript behaviors fully implemented
- **File Upload** - Drag-and-drop with preview support
- **TypeScript** - Full type definitions included

## Form Integration

All form components work seamlessly with native HTML forms:

```javascript
const form = document.querySelector('form');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  console.log(Object.fromEntries(formData));
});
```

## Validation Example

```html
<usa-text-input
  label="Password"
  type="password"
  name="password"
  required
  minlength="8"
  pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
  hint="Must be at least 8 characters with uppercase, lowercase, and number">
</usa-text-input>

<usa-validation
  for="password"
  error-message="Password does not meet requirements">
</usa-validation>
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES2020+ required
- Web Components v1 spec

## Dependencies

- `@uswds-wc/core` - Core utilities and base components
- `lit` ^3.0.0 (peer dependency)

## Development

```bash
# Build the package
pnpm run build

# Run tests
pnpm test

# Type checking
pnpm run typecheck

# Linting
pnpm run lint
```

## Storybook

View live examples and interactive documentation:

[USWDS Web Components Storybook](https://barbaradenney.github.io/USWDS-webcomponents/)

## License

MIT

## Repository

[USWDS Web Components Monorepo](https://github.com/barbaradenney/USWDS-webcomponents/tree/main/packages/uswds-wc-forms)

## Related Packages

- [@uswds-wc/all](../uswds-wc) - Complete package bundle
- [@uswds-wc/actions](../uswds-wc-actions) - Button and action components
- [@uswds-wc/navigation](../uswds-wc-navigation) - Navigation components

## Contributing

See the [main repository](https://github.com/barbaradenney/USWDS-webcomponents) for contribution guidelines.
