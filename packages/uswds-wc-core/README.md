# @uswds-wc/core

Core utilities and base components for USWDS Web Components.

## Overview

The `@uswds-wc/core` package provides the foundational building blocks for all USWDS Web Components. It includes base classes, utilities, and shared functionality that other packages depend on.

## Installation

```bash
npm install @uswds-wc/core lit
```

**Note**: This package is typically installed as a dependency of other `@uswds-wc/*` packages and doesn't need to be installed directly unless you're building custom USWDS components.

## What's Included

### Base Components

- `USWDSBaseComponent` - Base class for all USWDS web components
  - Automatic Light DOM rendering
  - USWDS initialization lifecycle
  - Consistent component behavior

### Utilities

- **Accessibility utilities** - ARIA helpers, focus management
- **DOM utilities** - Element manipulation, class management
- **Event utilities** - Custom event helpers
- **Validation utilities** - Form validation helpers

### USWDS Styles

The package includes compiled USWDS CSS that can be imported:

```javascript
import '@uswds-wc/core/styles.css';
```

## Usage

### Extending USWDSBaseComponent

```typescript
import { USWDSBaseComponent } from '@uswds-wc/core';
import { html } from 'lit';

export class MyCustomComponent extends USWDSBaseComponent {
  render() {
    return html`
      <div class="usa-component">
        <!-- Your USWDS markup -->
      </div>
    `;
  }

  override firstUpdated() {
    super.firstUpdated();
    this.initializeUSWDSComponent();
  }
}
```

### Using Utilities

```typescript
import { setAriaLabel, manageFocus } from '@uswds-wc/core/utils/accessibility';
import { toggleClass } from '@uswds-wc/core/utils/dom';
```

## Features

- **Light DOM** - All components render without Shadow DOM for maximum USWDS compatibility
- **USWDS Integration** - Automatic initialization of USWDS JavaScript behaviors
- **TypeScript Support** - Full type definitions included
- **Tree Shakeable** - Import only what you need

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES2020+ required
- Web Components v1 spec

## Dependencies

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

## License

MIT

## Repository

[USWDS Web Components Monorepo](https://github.com/barbaradenney/USWDS-webcomponents/tree/main/packages/uswds-wc-core)

## Related Packages

- [@uswds-wc/actions](../uswds-wc-actions) - Action components (Button, Link, Search)
- [@uswds-wc/forms](../uswds-wc-forms) - Form components
- [@uswds-wc/navigation](../uswds-wc-navigation) - Navigation components
- [@uswds-wc/data-display](../uswds-wc-data-display) - Data display components
- [@uswds-wc/feedback](../uswds-wc-feedback) - Feedback components
- [@uswds-wc/layout](../uswds-wc-layout) - Layout components
- [@uswds-wc/structure](../uswds-wc-structure) - Structure components
- [@uswds-wc/all](../uswds-wc) - Complete package bundle

## Contributing

See the [main repository](https://github.com/barbaradenney/USWDS-webcomponents) for contribution guidelines.
