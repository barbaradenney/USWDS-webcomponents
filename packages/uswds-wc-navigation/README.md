# @uswds-wc/navigation

USWDS Navigation Components - Headers, footers, menus, and navigation patterns as Web Components.

## Overview

The `@uswds-wc/navigation` package provides web component versions of all USWDS navigation-related components for site-wide navigation, menus, and wayfinding.

## Installation

```bash
npm install @uswds-wc/navigation lit
```

## Components

### Header (`<usa-header>`)
Site-wide header with navigation menu and mobile menu support.

```html
<usa-header>
  <div slot="logo">
    <a href="/">My Site</a>
  </div>
  <nav slot="navigation">
    <usa-link href="/about">About</usa-link>
    <usa-link href="/services">Services</usa-link>
    <usa-link href="/contact">Contact</usa-link>
  </nav>
</usa-header>
```

### Footer (`<usa-footer>`)
Site-wide footer with multi-level content organization.

```html
<usa-footer size="medium">
  <div slot="primary">
    <!-- Footer links and content -->
  </div>
  <div slot="secondary">
    <!-- Contact info, social links -->
  </div>
</usa-footer>
```

### Breadcrumb (`<usa-breadcrumb>`)
Hierarchical navigation trail.

```html
<usa-breadcrumb>
  <usa-link href="/">Home</usa-link>
  <usa-link href="/section">Section</usa-link>
  <usa-link href="/section/page" current>Current Page</usa-link>
</usa-breadcrumb>
```

### Side Navigation (`<usa-side-navigation>`)
Vertical navigation menu for subsections.

```html
<usa-side-navigation>
  <usa-link href="/docs">Documentation</usa-link>
  <usa-link href="/docs/getting-started">Getting Started</usa-link>
  <usa-link href="/docs/components" current>Components</usa-link>
</usa-side-navigation>
```

### In-Page Navigation (`<usa-in-page-navigation>`)
Sticky navigation for sections within a page.

```html
<usa-in-page-navigation>
  <a href="#section-1">Section 1</a>
  <a href="#section-2">Section 2</a>
  <a href="#section-3">Section 3</a>
</usa-in-page-navigation>
```

### Pagination (`<usa-pagination>`)
Page navigation for multi-page content.

```html
<usa-pagination
  current-page="3"
  total-pages="10">
</usa-pagination>
```

### Language Selector (`<usa-language-selector>`)
Language/locale selection dropdown.

```html
<usa-language-selector>
  <option value="en">English</option>
  <option value="es">Español</option>
  <option value="fr">Français</option>
</usa-language-selector>
```

### Skip Link (`<usa-skip-link>`)
Accessibility skip navigation link.

```html
<usa-skip-link href="#main-content">
  Skip to main content
</usa-skip-link>
```

## Usage Example

### Complete Site Layout

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <script type="module">
    import '@uswds-wc/navigation';
    import '@uswds-wc/actions';
  </script>
</head>
<body>
  <usa-skip-link href="#main">Skip to main content</usa-skip-link>

  <usa-header>
    <div slot="logo">
      <img src="/logo.png" alt="Logo">
      <span>Agency Name</span>
    </div>
    <nav slot="navigation">
      <usa-link href="/">Home</usa-link>
      <usa-link href="/about">About</usa-link>
      <usa-link href="/services">Services</usa-link>
    </nav>
  </usa-header>

  <usa-breadcrumb>
    <usa-link href="/">Home</usa-link>
    <usa-link href="/section">Section</usa-link>
    <usa-link current>Current Page</usa-link>
  </usa-breadcrumb>

  <main id="main">
    <aside>
      <usa-side-navigation>
        <usa-link href="/docs">Documentation</usa-link>
        <usa-link href="/docs/components" current>Components</usa-link>
        <usa-link href="/docs/patterns">Patterns</usa-link>
      </usa-side-navigation>
    </aside>

    <article>
      <usa-in-page-navigation>
        <a href="#overview">Overview</a>
        <a href="#usage">Usage</a>
        <a href="#examples">Examples</a>
      </usa-in-page-navigation>

      <h1 id="overview">Overview</h1>
      <!-- Content -->

      <h2 id="usage">Usage</h2>
      <!-- Content -->

      <h2 id="examples">Examples</h2>
      <!-- Content -->
    </article>
  </main>

  <usa-footer size="medium">
    <div slot="primary">
      <h3>Agency Name</h3>
      <p>Contact information and links</p>
    </div>
  </usa-footer>
</body>
</html>
```

## Bundle Size

Gzipped: ~60 KB

## Features

- **Complete Navigation Suite** - All USWDS navigation patterns
- **Responsive Design** - Mobile-first with automatic breakpoints
- **Accessibility** - Full ARIA support and keyboard navigation
- **Sticky Navigation** - In-page navigation with scroll tracking
- **Mobile Menus** - Automatic hamburger menu for small screens
- **TypeScript** - Full type definitions included

## Common Patterns

### Header with Search

```html
<usa-header>
  <div slot="logo">Logo</div>
  <nav slot="navigation">
    <usa-link href="/page1">Page 1</usa-link>
    <usa-link href="/page2">Page 2</usa-link>
  </nav>
  <usa-search slot="search"></usa-search>
</usa-header>
```

### Multi-level Side Navigation

```html
<usa-side-navigation>
  <usa-link href="/docs">Documentation</usa-link>
  <ul>
    <li><usa-link href="/docs/intro">Introduction</usa-link></li>
    <li><usa-link href="/docs/setup">Setup</usa-link></li>
  </ul>
  <usa-link href="/api">API Reference</usa-link>
</usa-side-navigation>
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES2020+ required
- Web Components v1 spec

## Dependencies

- `@uswds-wc/core` - Core utilities and base components
- `@uswds-wc/actions` - Button and link components
- `@uswds-wc/feedback` - Banner component (used in header)
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

[USWDS Web Components Monorepo](https://github.com/barbaradenney/USWDS-webcomponents/tree/main/packages/uswds-wc-navigation)

## Related Packages

- [@uswds-wc/all](../uswds-wc) - Complete package bundle
- [@uswds-wc/actions](../uswds-wc-actions) - Button and link components
- [@uswds-wc/feedback](../uswds-wc-feedback) - Alert and banner components

## Contributing

See the [main repository](https://github.com/barbaradenney/USWDS-webcomponents) for contribution guidelines.
