# @uswds-wc/all

Complete U.S. Web Design System (USWDS) components as Web Components.

## Overview

The `@uswds-wc/all` package is a convenience package that includes **all** USWDS Web Components in a single bundle. Perfect for projects that need the complete component library without managing individual package imports.

## Installation

```bash
npm install @uswds-wc/all lit
```

## What's Included

This package exports all components from:

- **@uswds-wc/core** - Core utilities and base components
- **@uswds-wc/actions** - Buttons, links, search (4 components)
- **@uswds-wc/forms** - Form inputs and controls (15 components)
- **@uswds-wc/navigation** - Headers, footers, menus (8 components)
- **@uswds-wc/data-display** - Cards, tables, lists, icons (8 components)
- **@uswds-wc/feedback** - Alerts, modals, banners (5 components)
- **@uswds-wc/layout** - Page structure and organization (4 components)
- **@uswds-wc/structure** - Accordions and content structure (1 component)

**Total: 45+ Components**

## Quick Start

```javascript
// Import everything
import '@uswds-wc/all';

// Now all components are available
const button = document.createElement('usa-button');
const input = document.createElement('usa-text-input');
const card = document.createElement('usa-card');
```

### HTML Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>USWDS Web Components</title>

  <script type="module">
    import '@uswds-wc/all';
  </script>
</head>
<body>
  <usa-header>
    <div slot="logo">My Site</div>
    <nav slot="navigation">
      <usa-link href="/">Home</usa-link>
      <usa-link href="/about">About</usa-link>
    </nav>
  </usa-header>

  <main>
    <usa-alert type="info">
      <h4 slot="heading">Welcome!</h4>
      This site uses USWDS Web Components.
    </usa-alert>

    <usa-card>
      <h3 slot="header">Get Started</h3>
      <p>Start building with USWDS components today.</p>
      <usa-button slot="footer">Learn More</usa-button>
    </usa-card>

    <form>
      <usa-text-input
        label="Full Name"
        name="name"
        required>
      </usa-text-input>

      <usa-text-input
        label="Email"
        type="email"
        name="email"
        required>
      </usa-text-input>

      <usa-button type="submit">Submit</usa-button>
    </form>
  </main>

  <usa-footer>
    <div slot="primary">
      <p>Footer content</p>
    </div>
  </usa-footer>
</body>
</html>
```

## Component Categories

### Actions
```javascript
import '@uswds-wc/all';

// Button, Button Group, Link, Search
<usa-button variant="primary">Click me</usa-button>
<usa-search placeholder="Search..."></usa-search>
```

### Forms
```javascript
// Text Input, Textarea, Select, Checkbox, Radio,
// Date Picker, Time Picker, Combo Box, File Input,
// Character Count, Range Slider, Memorable Date,
// Input Prefix/Suffix, Date Range Picker, Validation
<usa-text-input label="Name"></usa-text-input>
<usa-date-picker label="Select date"></usa-date-picker>
<usa-combo-box label="Choose option"></usa-combo-box>
```

### Navigation
```javascript
// Header, Footer, Breadcrumb, Side Navigation,
// In-Page Navigation, Pagination, Language Selector, Skip Link
<usa-header>...</usa-header>
<usa-breadcrumb>...</usa-breadcrumb>
<usa-side-navigation>...</usa-side-navigation>
```

### Data Display
```javascript
// Card, Collection, Table, Icon, Icon List,
// List, Tag, Summary Box
<usa-card>...</usa-card>
<usa-table sortable>...</usa-table>
<usa-icon name="check"></usa-icon>
```

### Feedback
```javascript
// Alert, Site Alert, Banner, Modal, Tooltip
<usa-alert type="success">...</usa-alert>
<usa-modal>...</usa-modal>
<usa-tooltip>...</usa-tooltip>
```

### Layout
```javascript
// Identifier, Process List, Prose, Step Indicator
<usa-process-list>...</usa-process-list>
<usa-step-indicator>...</usa-step-indicator>
<usa-prose>...</usa-prose>
```

### Structure
```javascript
// Accordion
<usa-accordion>...</usa-accordion>
```

## Bundle Size

Gzipped: ~200 KB (complete package)

For smaller bundle sizes, consider importing only the packages you need:

```javascript
// Instead of the full bundle
import '@uswds-wc/all';

// Import only what you need
import '@uswds-wc/actions';  // ~30 KB
import '@uswds-wc/forms';    // ~80 KB
```

See individual package documentation for specific bundle sizes.

## When to Use This Package

### ✅ Use `@uswds-wc/all` when:
- Building a complete government website
- You need most/all USWDS components
- Bundle size is not a primary concern
- You want the simplest import setup

### ⚠️ Consider individual packages when:
- Building a small application
- You only need a few components
- Bundle size optimization is critical
- Tree-shaking is important

## Features

- **Complete Component Library** - All 45+ USWDS components
- **Single Import** - One line to import everything
- **USWDS Compliance** - 100% compliant with USWDS 3.x
- **Accessibility** - WCAG 2.1 AA compliant
- **TypeScript** - Full type definitions included
- **Framework Agnostic** - Works with any framework or vanilla JS

## Framework Examples

### Vanilla JavaScript

```javascript
import '@uswds-wc/all';

document.querySelector('#app').innerHTML = `
  <usa-button>Click me</usa-button>
`;
```

### React

```jsx
import '@uswds-wc/all';

function App() {
  return (
    <div>
      <usa-button onClick={() => console.log('Clicked')}>
        Click me
      </usa-button>
    </div>
  );
}
```

### Vue

```vue
<template>
  <div>
    <usa-button @click="handleClick">
      Click me
    </usa-button>
  </div>
</template>

<script setup>
import '@uswds-wc/all';

const handleClick = () => {
  console.log('Clicked');
};
</script>
```

### Lit

```typescript
import { LitElement, html } from 'lit';
import '@uswds-wc/all';

class MyApp extends LitElement {
  render() {
    return html`
      <usa-button @click=${this.handleClick}>
        Click me
      </usa-button>
    `;
  }

  handleClick() {
    console.log('Clicked');
  }
}
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES2020+ required
- Web Components v1 spec

## Dependencies

- `@uswds-wc/core` - Core utilities
- `@uswds-wc/actions` - Action components
- `@uswds-wc/forms` - Form components
- `@uswds-wc/navigation` - Navigation components
- `@uswds-wc/data-display` - Data display components
- `@uswds-wc/feedback` - Feedback components
- `@uswds-wc/layout` - Layout components
- `@uswds-wc/structure` - Structure components
- `lit` ^3.0.0 (peer dependency)

## Development

```bash
# Build the package
pnpm run build

# Type checking
pnpm run typecheck
```

## Documentation

### Storybook
View live examples and interactive documentation:

[USWDS Web Components Storybook](https://barbaradenney.github.io/uswds-wc/)

### Package Documentation
- [@uswds-wc/core](../uswds-wc-core/README.md)
- [@uswds-wc/actions](../uswds-wc-actions/README.md)
- [@uswds-wc/forms](../uswds-wc-forms/README.md)
- [@uswds-wc/navigation](../uswds-wc-navigation/README.md)
- [@uswds-wc/data-display](../uswds-wc-data-display/README.md)
- [@uswds-wc/feedback](../uswds-wc-feedback/README.md)
- [@uswds-wc/layout](../uswds-wc-layout/README.md)
- [@uswds-wc/structure](../uswds-wc-structure/README.md)

## Migration Guide

### From Individual Packages

```javascript
// Before
import '@uswds-wc/actions';
import '@uswds-wc/forms';
import '@uswds-wc/navigation';

// After
import '@uswds-wc/all';
```

### From USWDS Classic

USWDS Web Components use the same HTML structure and CSS classes as USWDS:

```html
<!-- USWDS Classic -->
<button class="usa-button">Click me</button>

<!-- USWDS Web Components -->
<usa-button>Click me</usa-button>

<!-- Both render the same HTML structure! -->
```

## License

MIT

## Repository

[USWDS Web Components Monorepo](https://github.com/barbaradenney/uswds-wc)

## Contributing

See the [main repository](https://github.com/barbaradenney/uswds-wc) for contribution guidelines.

## Support

- [GitHub Issues](https://github.com/barbaradenney/uswds-wc/issues)
- [Storybook Documentation](https://barbaradenney.github.io/uswds-wc/)
- [USWDS Documentation](https://designsystem.digital.gov/)
