# @uswds-wc/feedback

USWDS Feedback Components - Alerts, banners, modals, and user feedback as Web Components.

## Overview

The `@uswds-wc/feedback` package provides web component versions of USWDS components for displaying feedback, notifications, and important messages to users.

## Installation

```bash
npm install @uswds-wc/feedback lit
```

## Components

### Alert (`<usa-alert>`)
Contextual feedback messages for user actions.

```html
<usa-alert type="success">
  <h4 slot="heading">Success</h4>
  Your application has been submitted.
</usa-alert>

<usa-alert type="warning">
  <h4 slot="heading">Warning</h4>
  Please review the information below.
</usa-alert>

<usa-alert type="error">
  <h4 slot="heading">Error</h4>
  There was a problem processing your request.
</usa-alert>

<usa-alert type="info">
  <h4 slot="heading">Information</h4>
  Additional details are available.
</usa-alert>
```

**Properties:**
- `type`: `'success' | 'warning' | 'error' | 'info'`
- `slim` - Condensed version without icon
- `no-icon` - Hide the status icon

### Site Alert (`<usa-site-alert>`)
Site-wide emergency or important announcements.

```html
<usa-site-alert type="emergency">
  <h3 slot="heading">Emergency Alert</h3>
  <p>Short description of emergency alert</p>
</usa-site-alert>

<usa-site-alert type="info">
  <h3 slot="heading">Informational Alert</h3>
  <p>General site announcement</p>
</usa-site-alert>
```

**Properties:**
- `type`: `'emergency' | 'info'`
- `slim` - Reduced height version

### Banner (`<usa-banner>`)

Official government website banner.

```html
<usa-banner>
  <!-- Automatically includes "An official website of the United States government" -->
</usa-banner>
```

**Features:**
- Expandable details section
- Automatic HTTPS and .gov domain guidance
- Mobile-responsive

### Modal (`<usa-modal>`)
Overlay dialog for focused user interaction.

```html
<usa-modal id="example-modal">
  <h2 slot="heading">Modal Title</h2>
  <p>Modal content goes here.</p>
  <usa-button slot="footer" variant="secondary" data-close-modal>
    Cancel
  </usa-button>
  <usa-button slot="footer">
    Confirm
  </usa-button>
</usa-modal>

<usa-button data-open-modal="example-modal">
  Open Modal
</usa-button>
```

**Properties:**
- `open` - Control modal visibility
- `size`: `'default' | 'large'`
- `force-action` - Require user interaction (disable close on backdrop click)

**Events:**
- `modal-open` - Fired when modal opens
- `modal-close` - Fired when modal closes

### Tooltip (`<usa-tooltip>`)
Contextual information on hover/focus.

```html
<usa-button aria-describedby="tooltip-1">
  Hover me
</usa-button>

<usa-tooltip id="tooltip-1" position="top">
  This is helpful information
</usa-tooltip>
```

**Properties:**
- `position`: `'top' | 'bottom' | 'left' | 'right'`
- `for` - ID of element to attach tooltip to

## Usage Example

### Alert with Dismissal

```javascript
import '@uswds-wc/feedback';

const alert = document.createElement('usa-alert');
alert.type = 'success';
alert.innerHTML = `
  <h4 slot="heading">Success!</h4>
  Your changes have been saved.
`;

document.body.appendChild(alert);

// Auto-dismiss after 5 seconds
setTimeout(() => {
  alert.remove();
}, 5000);
```

### Modal Dialog

```javascript
// Open modal
const modal = document.querySelector('#example-modal');
modal.open = true;

// Listen for close event
modal.addEventListener('modal-close', () => {
  console.log('Modal closed');
});

// Programmatic close
modal.open = false;
```

### Tooltip Example

```html
<p>
  This feature is
  <span id="beta-feature">
    beta
    <usa-tooltip for="beta-feature" position="top">
      This feature is in beta testing and may change.
    </usa-tooltip>
  </span>
  and subject to changes.
</p>
```

### Site Alert with Action

```html
<usa-site-alert type="info">
  <h3 slot="heading">New Feature Available</h3>
  <p>We've launched a new dashboard. Check it out!</p>
  <usa-button slot="action" variant="outline">
    Learn More
  </usa-button>
</usa-site-alert>
```

## Bundle Size

Gzipped: ~40 KB

## Features

- **User Feedback** - Complete suite of feedback components
- **Accessibility** - ARIA live regions for screen readers
- `focus` Trap** - Modal focus management
- **Keyboard Support** - Full keyboard navigation
- **Responsive** - Mobile-friendly implementations
- **TypeScript** - Full type definitions included

## Accessibility Features

- **Alerts** - Use ARIA live regions for dynamic announcements
- **Modals** - Focus trap, keyboard escape, screen reader announcements
- **Tooltips** - Proper ARIA labeling and describedby relationships
- **Banner** - Semantic HTML with proper disclosure pattern

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

[USWDS Web Components Monorepo](https://github.com/barbaradenney/USWDS-webcomponents/tree/main/packages/uswds-wc-feedback)

## Related Packages

- [@uswds-wc/all](../uswds-wc) - Complete package bundle
- [@uswds-wc/actions](../uswds-wc-actions) - Button components for modal actions
- [@uswds-wc/navigation](../uswds-wc-navigation) - Header uses banner component

## Contributing

See the [main repository](https://github.com/barbaradenney/USWDS-webcomponents) for contribution guidelines.
