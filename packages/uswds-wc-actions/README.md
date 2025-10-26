# @uswds-wc/actions

USWDS Action Components - Buttons, Links, and Search functionality as Web Components.

## Overview

The `@uswds-wc/actions` package provides web component versions of USWDS action-related components. These components enable user interactions like clicking buttons, following links, and performing searches.

## Installation

```bash
npm install @uswds-wc/actions lit
```

## Components

### Button (`<usa-button>`)

Standard USWDS button with all variants and states.

```html
<usa-button>Default Button</usa-button>
<usa-button variant="secondary">Secondary</usa-button>
<usa-button variant="accent-cool">Accent Cool</usa-button>
<usa-button size="big">Big Button</usa-button>
<usa-button disabled>Disabled</usa-button>
```

**Properties:**
- `variant`: `'default' | 'secondary' | 'accent-cool' | 'accent-warm' | 'base' | 'outline' | 'unstyled'`
- `size`: `'default' | 'big'`
- `disabled`: boolean
- `type`: `'button' | 'submit' | 'reset'`

### Button Group (`<usa-button-group>`)

Groups related buttons together with consistent spacing.

```html
<usa-button-group>
  <usa-button>Button 1</usa-button>
  <usa-button variant="outline">Button 2</usa-button>
  <usa-button variant="outline">Button 3</usa-button>
</usa-button-group>

<usa-button-group segmented>
  <usa-button>Segmented 1</usa-button>
  <usa-button>Segmented 2</usa-button>
</usa-button-group>
```

**Properties:**
- `segmented`: boolean - Creates visually connected buttons

### Link (`<usa-link>`)

USWDS styled links with external link support.

```html
<usa-link href="/page">Internal Link</usa-link>
<usa-link href="https://example.com" external>External Link</usa-link>
<usa-link variant="unstyled" href="/unstyled">Unstyled Link</usa-link>
```

**Properties:**
- `href`: string - Link destination
- `external`: boolean - Adds external link icon and behavior
- `variant`: `'default' | 'unstyled'`

### Search (`<usa-search>`)

USWDS search component with form submission.

```html
<usa-search></usa-search>
<usa-search size="small"></usa-search>
<usa-search size="big"></usa-search>
<usa-search placeholder="Search documentation..."></usa-search>
```

**Properties:**
- `size`: `'default' | 'small' | 'big'`
- `placeholder`: string - Input placeholder text
- `value`: string - Current search value

**Events:**
- `search-submit`: Fired when search is submitted with `{ detail: { value: string } }`

## Usage Example

```javascript
import '@uswds-wc/actions';

// All components are now available
const button = document.createElement('usa-button');
button.textContent = 'Click me';
button.addEventListener('click', () => console.log('Clicked!'));
```

### With Lit

```typescript
import { LitElement, html } from 'lit';
import '@uswds-wc/actions';

class MyApp extends LitElement {
  render() {
    return html`
      <usa-button @click=${this.handleClick}>
        Submit
      </usa-button>

      <usa-search
        @search-submit=${this.handleSearch}
        placeholder="Search...">
      </usa-search>
    `;
  }

  handleClick() {
    console.log('Button clicked');
  }

  handleSearch(e) {
    console.log('Search query:', e.detail.value);
  }
}
```

## Bundle Size

Gzipped: ~30 KB

## Features

- **Full USWDS Compliance** - Matches official USWDS HTML structure and CSS
- **Accessibility** - WCAG 2.1 AA compliant with proper ARIA attributes
- **TypeScript** - Full type definitions included
- **Tree Shakeable** - Import individual components to reduce bundle size
- **Framework Agnostic** - Works with any framework or vanilla JS

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

[USWDS Web Components Monorepo](https://github.com/barbaradenney/uswds-wc/tree/main/packages/uswds-wc-actions)

## Related Packages

- [@uswds-wc/all](../uswds-wc) - Complete package bundle
- [@uswds-wc/forms](../uswds-wc-forms) - Form components
- [@uswds-wc/navigation](../uswds-wc-navigation) - Navigation components

## Contributing

See the [main repository](https://github.com/barbaradenney/uswds-wc) for contribution guidelines.
