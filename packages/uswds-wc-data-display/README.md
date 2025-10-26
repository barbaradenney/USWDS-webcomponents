# @uswds-wc/data-display

USWDS Data Display Components - Cards, tables, lists, and content presentation as Web Components.

## Overview

The `@uswds-wc/data-display` package provides web component versions of USWDS components for displaying structured data and content.

## Installation

```bash
npm install @uswds-wc/data-display lit
```

## Components

### Card (`<usa-card>`)
Versatile content container with header, media, and footer support.

```html
<usa-card>
  <img slot="media" src="/image.jpg" alt="Description">
  <h3 slot="header">Card Title</h3>
  <p>Card content goes here.</p>
  <usa-button slot="footer">Learn More</usa-button>
</usa-card>

<usa-card variant="flag">
  <!-- Horizontal layout card -->
</usa-card>
```

**Variants:**
- `default` - Vertical card
- `flag` - Horizontal layout
- `media-right` - Media on right side

### Collection (`<usa-collection>`)
Display a collection of related items with consistent formatting.

```html
<usa-collection>
  <usa-card>Item 1</usa-card>
  <usa-card>Item 2</usa-card>
  <usa-card>Item 3</usa-card>
</usa-collection>
```

### Table (`<usa-table>`)
Responsive data table with sorting and styling options.

```html
<usa-table sortable>
  <table>
    <thead>
      <tr>
        <th data-sortable>Name</th>
        <th data-sortable>Age</th>
        <th>Location</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>John Doe</td>
        <td>32</td>
        <td>New York</td>
      </tr>
    </tbody>
  </table>
</usa-table>
```

**Properties:**
- `sortable` - Enable column sorting
- `borderless` - Remove table borders
- `striped` - Alternating row colors
- `scrollable` - Horizontal scroll for narrow viewports

### Icon (`<usa-icon>`)
USWDS icon system with automatic sprite loading.

```html
<usa-icon name="check"></usa-icon>
<usa-icon name="close" size="3"></usa-icon>
<usa-icon name="search" aria-label="Search"></usa-icon>
```

**Properties:**
- `name` - Icon name from USWDS icon set
- `size` - Size multiplier (3, 4, 5, 6, 7, 8, 9)
- `aria-label` - Accessibility label

### Icon List (`<usa-icon-list>`)
List with icons for each item.

```html
<usa-icon-list>
  <li>
    <usa-icon name="check" slot="icon"></usa-icon>
    <div>First item with checkmark</div>
  </li>
  <li>
    <usa-icon name="close" slot="icon"></usa-icon>
    <div>Second item with X</div>
  </li>
</usa-icon-list>
```

### List (`<usa-list>`)
Styled ordered and unordered lists.

```html
<usa-list type="unordered">
  <li>First item</li>
  <li>Second item</li>
  <li>Third item</li>
</usa-list>

<usa-list type="ordered">
  <li>Step one</li>
  <li>Step two</li>
  <li>Step three</li>
</usa-list>
```

**Properties:**
- `type`: `'ordered' | 'unordered'`
- `unstyled` - Remove default list styling

### Tag (`<usa-tag>`)
Labeled tags for categorization and metadata.

```html
<usa-tag>Default</usa-tag>
<usa-tag variant="big">Big Tag</usa-tag>
```

**Variants:**
- `default` - Standard size tag
- `big` - Larger tag

### Summary Box (`<usa-summary-box>`)
Highlighted summary or key information box.

```html
<usa-summary-box>
  <h3 slot="heading">Key Takeaways</h3>
  <ul>
    <li>Important point one</li>
    <li>Important point two</li>
    <li>Important point three</li>
  </ul>
</usa-summary-box>
```

## Usage Example

### Data Table with Sorting

```javascript
import '@uswds-wc/data-display';

const table = document.querySelector('usa-table');
table.addEventListener('sort', (e) => {
  console.log('Sort column:', e.detail.column);
  console.log('Sort direction:', e.detail.direction);
});
```

### Card Grid Layout

```html
<div class="usa-card-group">
  <usa-card>
    <img slot="media" src="/img1.jpg" alt="Image 1">
    <h3 slot="header">Card 1</h3>
    <p>Description of card 1</p>
    <usa-button slot="footer">View Details</usa-button>
  </usa-card>

  <usa-card>
    <img slot="media" src="/img2.jpg" alt="Image 2">
    <h3 slot="header">Card 2</h3>
    <p>Description of card 2</p>
    <usa-button slot="footer">View Details</usa-button>
  </usa-card>

  <usa-card>
    <img slot="media" src="/img3.jpg" alt="Image 3">
    <h3 slot="header">Card 3</h3>
    <p>Description of card 3</p>
    <usa-button slot="footer">View Details</usa-button>
  </usa-card>
</div>
```

### Icon List Example

```html
<usa-icon-list>
  <li>
    <usa-icon name="check" slot="icon"></usa-icon>
    <div>
      <h4>Feature Available</h4>
      <p>This feature is included in your plan.</p>
    </div>
  </li>
  <li>
    <usa-icon name="close" slot="icon"></usa-icon>
    <div>
      <h4>Feature Not Available</h4>
      <p>Upgrade to access this feature.</p>
    </div>
  </li>
</usa-icon-list>
```

## Bundle Size

Gzipped: ~40 KB

## Features

- **Flexible Layouts** - Cards, tables, and lists with multiple variants
- **Responsive Tables** - Automatic mobile-friendly table behavior
- **Sortable Tables** - Built-in column sorting with USWDS behavior
- **Icon System** - Complete USWDS icon library integration
- **Accessibility** - Semantic HTML with proper ARIA attributes
- **TypeScript** - Full type definitions included

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

[USWDS Web Components Monorepo](https://github.com/barbaradenney/uswds-wc/tree/main/packages/uswds-wc-data-display)

## Related Packages

- [@uswds-wc/all](../uswds-wc) - Complete package bundle
- [@uswds-wc/layout](../uswds-wc-layout) - Layout components
- [@uswds-wc/actions](../uswds-wc-actions) - Button and action components

## Contributing

See the [main repository](https://github.com/barbaradenney/uswds-wc) for contribution guidelines.
