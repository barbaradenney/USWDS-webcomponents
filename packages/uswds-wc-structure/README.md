# @uswds-wc/structure

USWDS Structure Components - Accordion and content organization as Web Components.

## Overview

The `@uswds-wc/structure` package provides web component versions of USWDS components for structuring and organizing content with expandable/collapsible sections.

## Installation

```bash
npm install @uswds-wc/structure lit
```

## Components

### Accordion (`<usa-accordion>`)
Expandable/collapsible content sections for organizing related information.

```html
<usa-accordion>
  <h4 slot="heading">First Amendment</h4>
  <div slot="content">
    <p>Congress shall make no law respecting an establishment of religion...</p>
  </div>
</usa-accordion>

<usa-accordion>
  <h4 slot="heading">Second Amendment</h4>
  <div slot="content">
    <p>A well regulated Militia, being necessary to the security of a free State...</p>
  </div>
</usa-accordion>

<usa-accordion>
  <h4 slot="heading">Third Amendment</h4>
  <div slot="content">
    <p>No Soldier shall, in time of peace be quartered in any house...</p>
  </div>
</usa-accordion>
```

**Properties:**
- `expanded` - Control accordion expansion state
- `bordered` - Add border around accordion
- `multiselectable` - Allow multiple accordions to be open simultaneously (when grouped)

**Events:**
- `accordion-toggle` - Fired when accordion is opened/closed with `{ detail: { expanded: boolean } }`

## Usage Example

### Basic Accordion

```javascript
import '@uswds-wc/structure';

const accordion = document.createElement('usa-accordion');
accordion.innerHTML = `
  <h4 slot="heading">Click to expand</h4>
  <div slot="content">
    <p>Hidden content that appears when expanded.</p>
  </div>
`;

document.body.appendChild(accordion);
```

### Accordion Group (Single Open)

By default, when you have multiple accordions in a container, USWDS behavior allows only one to be open at a time.

```html
<div class="usa-accordion-group">
  <usa-accordion>
    <h4 slot="heading">Section 1</h4>
    <div slot="content">
      <p>Content for section 1.</p>
    </div>
  </usa-accordion>

  <usa-accordion>
    <h4 slot="heading">Section 2</h4>
    <div slot="content">
      <p>Content for section 2.</p>
    </div>
  </usa-accordion>

  <usa-accordion>
    <h4 slot="heading">Section 3</h4>
    <div slot="content">
      <p>Content for section 3.</p>
    </div>
  </usa-accordion>
</div>
```

### Multiselectable Accordion Group

Allow multiple sections to be open simultaneously:

```html
<div class="usa-accordion-group" data-allow-multiple>
  <usa-accordion multiselectable>
    <h4 slot="heading">Section 1</h4>
    <div slot="content">
      <p>Content for section 1.</p>
    </div>
  </usa-accordion>

  <usa-accordion multiselectable>
    <h4 slot="heading">Section 2</h4>
    <div slot="content">
      <p>Content for section 2.</p>
    </div>
  </usa-accordion>
</div>
```

### Bordered Accordion

```html
<usa-accordion bordered>
  <h4 slot="heading">Important Information</h4>
  <div slot="content">
    <p>Content with border styling for emphasis.</p>
  </div>
</usa-accordion>
```

### Programmatic Control

```javascript
const accordion = document.querySelector('usa-accordion');

// Open accordion
accordion.expanded = true;

// Close accordion
accordion.expanded = false;

// Toggle accordion
accordion.expanded = !accordion.expanded;

// Listen for changes
accordion.addEventListener('accordion-toggle', (e) => {
  console.log('Accordion is now:', e.detail.expanded ? 'open' : 'closed');
});
```

### FAQ Example

```html
<h2>Frequently Asked Questions</h2>

<div class="usa-accordion-group">
  <usa-accordion>
    <h4 slot="heading">How do I apply?</h4>
    <div slot="content">
      <p>You can apply online through our application portal. The process takes approximately 15 minutes to complete.</p>
      <usa-button href="/apply">Start Application</usa-button>
    </div>
  </usa-accordion>

  <usa-accordion>
    <h4 slot="heading">What documents do I need?</h4>
    <div slot="content">
      <ul>
        <li>Government-issued photo ID</li>
        <li>Proof of residency</li>
        <li>Income verification</li>
        <li>Social Security card</li>
      </ul>
    </div>
  </usa-accordion>

  <usa-accordion>
    <h4 slot="heading">How long does processing take?</h4>
    <div slot="content">
      <p>Applications are typically processed within 5-7 business days. You will receive an email notification when your application status changes.</p>
    </div>
  </usa-accordion>

  <usa-accordion>
    <h4 slot="heading">Can I check my application status?</h4>
    <div slot="content">
      <p>Yes, you can check your application status at any time by logging into your account.</p>
      <usa-button variant="outline" href="/login">Check Status</usa-button>
    </div>
  </usa-accordion>
</div>
```

## Bundle Size

Gzipped: ~20 KB

## Features

- **USWDS Behavior** - Exact implementation of USWDS accordion JavaScript
- **Keyboard Navigation** - Full keyboard support (Enter, Space, Arrow keys)
- **Accessibility** - Proper ARIA attributes and roles
- **Smooth Animations** - CSS transitions for expand/collapse
- **Flexible Content** - Support any HTML content in slots
- **Group Behavior** - Single-open or multi-open modes
- **TypeScript** - Full type definitions included

## Accessibility Features

- **ARIA Attributes** - Proper `aria-expanded`, `aria-controls`, `aria-labelledby`
- **Keyboard Support**:
  - `Enter` or `Space` - Toggle accordion
  - `Tab` - Move between accordions
- **Focus Management** - Visible focus indicators
- **Screen Readers** - Announces expansion state changes

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

[USWDS Web Components Storybook](https://barbaradenney.github.io/uswds-wc/)

## License

MIT

## Repository

[USWDS Web Components Monorepo](https://github.com/barbaradenney/uswds-wc/tree/main/packages/uswds-wc-structure)

## Related Packages

- [@uswds-wc/all](../uswds-wc) - Complete package bundle
- [@uswds-wc/layout](../uswds-wc-layout) - Layout and organization components
- [@uswds-wc/data-display](../uswds-wc-data-display) - Data display components

## Contributing

See the [main repository](https://github.com/barbaradenney/uswds-wc) for contribution guidelines.
