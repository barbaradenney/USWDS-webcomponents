# USWDS Web Components - Theming Guide

This guide explains how to customize the visual appearance of USWDS Web Components using the official USWDS settings system while maintaining full compliance with the U.S. Web Design System.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [USWDS Settings System](#uswds-settings-system)
- [Theme Configuration](#theme-configuration)
- [Creating Custom Themes](#creating-custom-themes)
- [Component-Specific Theming](#component-specific-theming)
- [Advanced Theming](#advanced-theming)
- [Troubleshooting](#troubleshooting)

## Overview

The USWDS Web Components library uses the **official USWDS settings system** for theming:

**USWDS Settings** - Build-time theming using official USWDS configuration

This approach provides:

- ✅ Full USWDS compliance and compatibility
- ✅ Access to all USWDS design tokens and variables
- ✅ Native USWDS theming capabilities
- ✅ Automatic updates with USWDS releases
- ✅ Complete control over component appearance

## Quick Start

### 1. Customize USWDS Settings

Edit the USWDS settings file to customize your theme:

**File: `src/styles/uswds-settings.scss`**

```scss
// Primary brand colors
$theme-color-primary-family: 'blue' !default;
$theme-color-primary: 'blue-60v' !default;

// Secondary colors
$theme-color-secondary-family: 'red' !default;
$theme-color-secondary: 'red-50' !default;

// Typography
$theme-font-type-sans: 'source-sans-pro' !default;
$theme-font-type-serif: 'merriweather' !default;
$theme-font-type-mono: 'roboto-mono' !default;
```

### 2. Compile CSS

Run the build command to compile your custom theme:

```bash
npm run build:css
```

This generates `src/styles/styles.css` with your custom USWDS theme.

### 3. Use in Components

All USWDS Web Components automatically use your compiled theme:

```html
<usa-button>Themed Button</usa-button>
<usa-alert type="success">Themed Alert</usa-alert>
<usa-header agency-name="My Agency"></usa-header>
```

## USWDS Settings System

The theming system uses the official USWDS settings configuration to customize component appearance at build time. This approach provides full USWDS compliance and access to all design tokens.

### Available Theme Variables

#### Primary Brand Colors

```css
--theme-color-primary: #005ea2; /* Main brand color */
--theme-color-primary-light: #73b3e7; /* Lighter variant */
--theme-color-primary-lighter: #a9c9ec; /* Even lighter */
--theme-color-primary-lightest: #dfe1e2; /* Subtle background */
--theme-color-primary-dark: #1a4480; /* Darker variant */
--theme-color-primary-darker: #162e51; /* Even darker */
--theme-color-primary-darkest: #0f1419; /* High contrast */
```

#### Typography

```css
--theme-font-family-sans: 'Source Sans Pro', sans-serif;
--theme-font-family-serif: 'Merriweather', serif;
--theme-font-family-mono: 'Roboto Mono', monospace;
--theme-font-weight-normal: 400;
--theme-font-weight-bold: 700;
```

#### State Colors

```css
--theme-color-success: #00a91c; /* Success green */
--theme-color-warning: #ffbe2e; /* Warning yellow */
--theme-color-error: #d63031; /* Error red */
--theme-color-info: #2491ff; /* Info blue */
```

#### Spacing and Layout

```css
--theme-spacing-1: 0.25rem; /* 4px */
--theme-spacing-2: 0.5rem; /* 8px */
--theme-spacing-4: 1rem; /* 16px */
--theme-spacing-8: 2rem; /* 32px */
```

#### Interactive States

```css
--theme-focus-color: #2491ff; /* Focus outline color */
--theme-focus-width: 0.25rem; /* Focus outline width */
--theme-link-color: var(--theme-color-primary);
--theme-link-hover-color: var(--theme-color-primary-dark);
```

For a complete list, see [`src/styles/theme-overrides.css`](../src/styles/theme-overrides.css).

## Theme Configuration

### Basic Theme Override

Create a custom theme by overriding variables in your application CSS:

```css
/* Custom agency theme */
:root {
  /* Brand colors */
  --theme-color-primary: #1e3a8a; /* Navy blue */
  --theme-color-primary-dark: #1e40af;
  --theme-color-secondary: #f59e0b; /* Amber */

  /* Typography */
  --theme-font-family-sans: 'Inter', sans-serif;

  /* Interactive states */
  --theme-link-color: #1e3a8a;
  --theme-focus-color: #3b82f6;
}
```

### Component-Specific CSS

Target specific components for custom styling:

```css
/* Custom button styling */
.usa-button--primary {
  background-color: var(--theme-color-primary);
  border-color: var(--theme-color-primary);
}

.usa-button--primary:hover {
  background-color: var(--theme-color-primary-dark);
  border-color: var(--theme-color-primary-dark);
}

/* Custom alert styling */
.usa-alert--info {
  border-left-color: var(--theme-color-info);
  background-color: var(--theme-color-info-lightest);
}
```

## Built-in Themes

The theme system includes several pre-built theme classes:

### High Contrast Theme

```html
<body class="theme-high-contrast">
  <!-- All components will use high contrast colors -->
  <usa-button>High Contrast Button</usa-button>
</body>
```

### Dark Theme

```html
<body class="theme-dark">
  <!-- All components will use dark theme colors -->
  <usa-header agency-name="Dark Theme Agency"></usa-header>
</body>
```

### Agency Themes

```html
<!-- Blue agency theme -->
<div class="theme-agency-blue">
  <usa-button>Blue Agency Button</usa-button>
</div>

<!-- Green agency theme -->
<div class="theme-agency-green">
  <usa-button>Green Agency Button</usa-button>
</div>

<!-- Red agency theme -->
<div class="theme-agency-red">
  <usa-button>Red Agency Button</usa-button>
</div>
```

## Creating Custom Themes

### CSS Class-Based Themes

Create reusable themes using CSS classes:

```css
/* Winter theme */
.theme-winter {
  --theme-color-primary: #1e3a8a; /* Deep blue */
  --theme-color-secondary: #0ea5e9; /* Sky blue */
  --theme-color-accent-cool: #06b6d4; /* Cyan */
  --theme-color-base-lightest: #f8fafc; /* Light blue-gray */
}

/* Summer theme */
.theme-summer {
  --theme-color-primary: #dc2626; /* Red */
  --theme-color-secondary: #f59e0b; /* Amber */
  --theme-color-accent-warm: #f97316; /* Orange */
  --theme-color-base-lightest: #fef7f0; /* Light orange */
}

/* Professional theme */
.theme-professional {
  --theme-color-primary: #374151; /* Gray */
  --theme-color-secondary: #6366f1; /* Indigo */
  --theme-font-family-sans: 'Inter', sans-serif;
  --theme-border-radius-md: 0.375rem; /* Rounded corners */
}
```

### Usage in HTML

```html
<!-- Apply theme to entire page -->
<body class="theme-winter">
  <usa-header agency-name="Winter Agency"></usa-header>
  <main>
    <usa-button>Winter Button</usa-button>
  </main>
</body>

<!-- Apply theme to specific sections -->
<section class="theme-summer">
  <usa-alert type="info">Summer themed alert</usa-alert>
</section>
```

## Component-Specific Theming

### Individual Component Styling

Target specific component instances:

```css
/* Custom navigation header */
.my-custom-header {
  --theme-color-primary: #10b981; /* Green */
  --theme-font-family-sans: 'Roboto', sans-serif;
}

/* Custom form section */
.my-form-section {
  --theme-color-primary: #7c3aed; /* Purple */
  --theme-focus-color: #8b5cf6;
  --theme-border-radius-md: 0.5rem;
}
```

```html
<usa-header class="my-custom-header" agency-name="Custom Agency"></usa-header>

<section class="my-form-section">
  <usa-button>Custom Form Button</usa-button>
  <usa-text-input label="Custom Input"></usa-text-input>
</section>
```

### Utility Classes

Use built-in utility classes for quick theming:

```html
<!-- Apply theme colors directly -->
<div class="theme-bg-primary theme-color-white">Primary background with white text</div>

<p class="theme-color-secondary">Secondary color text</p>

<div class="theme-bg-success">
  <usa-alert type="success">Success background</usa-alert>
</div>
```

## JavaScript Theme Switching

### Runtime Theme Changes

Change themes dynamically with JavaScript:

```javascript
// Change individual variables
document.documentElement.style.setProperty('--theme-color-primary', '#dc2626');
document.documentElement.style.setProperty('--theme-color-secondary', '#f59e0b');

// Apply theme class
document.body.className = 'theme-dark';

// Toggle between themes
function toggleTheme() {
  const isDark = document.body.classList.contains('theme-dark');
  document.body.className = isDark ? 'theme-light' : 'theme-dark';
}

// System preference detection
if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.body.classList.add('theme-dark');
}
```

### Theme Persistence

Save theme preferences:

```javascript
// Save theme preference
function setTheme(themeName) {
  document.body.className = themeName;
  localStorage.setItem('theme', themeName);
}

// Load saved theme
function loadTheme() {
  const savedTheme = localStorage.getItem('theme') || 'theme-default';
  document.body.className = savedTheme;
}

// Initialize on page load
loadTheme();
```

### React Integration

Example React hook for theme management:

```jsx
import { useState, useEffect } from 'react';

function useTheme() {
  const [theme, setTheme] = useState('theme-default');

  useEffect(() => {
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'theme-default';
    setTheme(savedTheme);
    document.body.className = savedTheme;
  }, []);

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    document.body.className = newTheme;
    localStorage.setItem('theme', newTheme);
  };

  return { theme, changeTheme };
}

// Usage in component
function App() {
  const { theme, changeTheme } = useTheme();

  return (
    <div>
      <select onChange={(e) => changeTheme(e.target.value)} value={theme}>
        <option value="theme-default">Default</option>
        <option value="theme-dark">Dark</option>
        <option value="theme-high-contrast">High Contrast</option>
        <option value="theme-agency-blue">Agency Blue</option>
      </select>

      <usa-button>Themed Button</usa-button>
    </div>
  );
}
```

## Advanced Theming

### Responsive Themes

Create themes that adapt to screen size:

```css
.theme-responsive {
  --theme-spacing-4: 1rem;
  --theme-font-size-base: 1rem;
}

@media (max-width: 640px) {
  .theme-responsive {
    --theme-spacing-4: 0.75rem; /* Tighter spacing on mobile */
    --theme-font-size-base: 0.875rem; /* Smaller text on mobile */
  }
}

@media (min-width: 1024px) {
  .theme-responsive {
    --theme-spacing-4: 1.25rem; /* Looser spacing on desktop */
    --theme-font-size-base: 1.125rem; /* Larger text on desktop */
  }
}
```

### Accessibility-Aware Theming

Respect user accessibility preferences:

```css
/* High contrast mode */
@media (prefers-contrast: high) {
  :root {
    --theme-focus-width: 0.125rem; /* Thicker focus outlines */
    --theme-border-width: 2px; /* Thicker borders */
    --theme-color-primary: #000000; /* Higher contrast colors */
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  :root {
    --theme-transition-duration: 0.01ms; /* Disable animations */
  }
}

/* Dark mode preference */
@media (prefers-color-scheme: dark) {
  :root {
    --theme-color-base-lightest: #1b1b1b;
    --theme-color-base-lighter: #2d2d2d;
    --theme-text-color: #ffffff;
    --theme-link-color: #73b3e7;
  }
}
```

### Print Themes

Optimize themes for printing:

```css
@media print {
  :root {
    --theme-color-primary: #000000; /* Black ink for print */
    --theme-color-secondary: #666666; /* Gray for secondary */
    --theme-background-color: #ffffff; /* White background */
    --theme-text-color: #000000; /* Black text */
  }

  /* Hide decorative elements */
  .usa-banner,
  .usa-header,
  .usa-footer {
    display: none;
  }
}
```

## Migration from SCSS Settings

If you were previously using SCSS settings, migrate to CSS custom properties:

### Before (SCSS Settings)

```scss
// uswds-settings.scss
$theme-color-primary: 'blue-60v';
$theme-font-family-sans: 'source-sans-pro';
```

### After (CSS Custom Properties)

```css
/* your-theme.css */
:root {
  --theme-color-primary: #005ea2; /* blue-60v equivalent */
  --theme-font-family-sans: 'Source Sans Pro', sans-serif;
}
```

### Migration Benefits

- ✅ No build system changes required
- ✅ Runtime theme switching enabled
- ✅ JavaScript integration possible
- ✅ Easier debugging and development
- ✅ Better performance (no recompilation)

## Troubleshooting

### Common Issues

#### Theme Variables Not Applied

**Problem**: CSS custom properties not taking effect

**Solution**: Check specificity and import order

```css
/* Ensure theme overrides come after base styles */
@import 'uswds-webcomponents/styles.css';
@import 'uswds-webcomponents/theme-overrides.css';
@import 'your-custom-theme.css'; /* Your overrides last */
```

#### Components Not Updating

**Problem**: Components don't reflect theme changes

**Solution**: Ensure theme variables are properly scoped

```css
/* Wrong - too specific */
.usa-button.usa-button--primary {
  background: #005ea2; /* Hard-coded color */
}

/* Right - uses theme variable */
.usa-button--primary {
  background: var(--theme-color-primary);
}
```

#### Theme Switching Not Working

**Problem**: JavaScript theme switching has no effect

**Solution**: Check class application and CSS cascade

```javascript
// Ensure class is applied to correct element
document.body.className = 'theme-dark'; // Correct
document.documentElement.className = 'theme-dark'; // Alternative

// Check that theme CSS is loaded
const hasThemeCSS = document.querySelector('link[href*="theme-overrides"]');
if (!hasThemeCSS) {
  console.error('Theme CSS not loaded');
}
```

### Debugging Tools

#### Browser DevTools

1. Open DevTools → Elements
2. Select `:root` element
3. Check Computed styles for `--theme-*` variables
4. Verify values are applied correctly

#### CSS Validation

```css
/* Add temporary debug styles */
:root {
  --debug-primary: var(--theme-color-primary, red); /* Shows red if undefined */
}

.debug-theme::before {
  content: 'Primary: ' var(--theme-color-primary);
  position: fixed;
  top: 0;
  left: 0;
  background: white;
  padding: 0.5rem;
  z-index: 9999;
}
```

### Performance Considerations

#### CSS Custom Properties Performance

- ✅ CSS variables are fast and don't trigger reflow
- ✅ Runtime changes are immediate
- ✅ No build system overhead

#### Best Practices

- Use CSS custom properties for theme values
- Avoid excessive nesting of themed classes
- Group related theme changes together
- Test theme performance with browser DevTools

## Resources

- [USWDS Design Tokens](https://designsystem.digital.gov/design-tokens/)
- [CSS Custom Properties (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [USWDS Theming Documentation](https://designsystem.digital.gov/documentation/settings/)
- [Source Code: theme-overrides.css](../src/styles/theme-overrides.css)
- [Source Code: uswds-settings.scss](../src/styles/uswds-settings.scss)

## Examples

See the `/examples` directory for complete theming examples:

- Basic theme override
- Multi-theme application
- JavaScript theme switcher
- React theme integration
- Accessibility-compliant themes
