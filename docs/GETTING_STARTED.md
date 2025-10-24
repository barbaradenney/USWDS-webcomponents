# Getting Started with USWDS Web Components

Complete guide for developers to integrate USWDS Web Components into their projects.

## 📦 Installation

### Using npm

```bash
npm install uswds-webcomponents
```

### Using yarn

```bash
yarn add uswds-webcomponents
```

### Using pnpm

```bash
pnpm add uswds-webcomponents
```

## 🚀 Quick Start

### Option 1: Auto-Registration (Easiest)

Import the main package to automatically register all components:

```javascript
// Import all components (auto-registers custom elements)
import 'uswds-webcomponents';
```

Then use components in your HTML:

```html
<usa-button variant="default">Click me</usa-button>
<usa-alert type="success" heading="Success!">
  Your action was completed successfully.
</usa-alert>
```

### Option 2: Category Imports (Recommended)

Import by category for a balance of convenience and bundle size:

```javascript
// Import all components in a category
import 'uswds-webcomponents/actions';      // Button, Link, Search, ButtonGroup
import 'uswds-webcomponents/forms';        // All 15 form components
import 'uswds-webcomponents/feedback';     // Alert, Modal, Tooltip, Banner, SiteAlert

// Or import specific components (best for tree-shaking)
import { USAButton } from 'uswds-webcomponents/actions';
import { USAAlert } from 'uswds-webcomponents/feedback';

// Components are automatically registered when imported
```

Then use in your HTML:

```html
<usa-button variant="default">Click me</usa-button>
<usa-alert type="success" heading="Success!">
  Your action was completed successfully.
</usa-alert>
```

## 🎨 USWDS CSS Setup

USWDS Web Components require the USWDS CSS to be loaded in your application.

### Option 1: CDN (Quickest)

Add to your HTML `<head>`:

```html
<link
  rel="stylesheet"
  href="https://unpkg.com/@uswds/uswds@latest/dist/css/uswds.min.css"
/>
```

### Option 2: NPM Package (Recommended)

Install USWDS:

```bash
npm install @uswds/uswds
```

Import in your application:

```javascript
import '@uswds/uswds/dist/css/uswds.min.css';
```

Or link in your HTML:

```html
<link
  rel="stylesheet"
  href="/node_modules/@uswds/uswds/dist/css/uswds.min.css"
/>
```

### Option 3: Compile Custom USWDS Theme

For advanced customization, compile USWDS from source:

```bash
npm install @uswds/uswds sass
```

Create `styles/uswds-theme.scss`:

```scss
// USWDS theme settings
@use 'uswds-core' with (
  $theme-color-primary: 'blue-60v',
  $theme-color-secondary: 'red-50v'
);
```

Import in your application:

```javascript
import './styles/uswds-theme.scss';
```

## 🔧 Framework Integration

### Vanilla JavaScript

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>USWDS Web Components</title>
    <link
      rel="stylesheet"
      href="https://unpkg.com/@uswds/uswds@latest/dist/css/uswds.min.css"
    />
  </head>
  <body>
    <usa-button variant="default">Click me</usa-button>
    <usa-alert type="success" heading="Success!">
      Your action was completed successfully.
    </usa-alert>

    <script type="module">
      import 'uswds-webcomponents';

      // Access component programmatically
      const button = document.querySelector('usa-button');
      button.addEventListener('click', () => {
        console.log('Button clicked!');
      });
    </script>
  </body>
</html>
```

### React

Web Components work seamlessly with React 19+. For React 18 and below, use refs for events.

#### React 19+ (Recommended)

```jsx
import 'uswds-webcomponents';
import '@uswds/uswds/dist/css/uswds.min.css';

function App() {
  const handleButtonClick = () => {
    console.log('Button clicked!');
  };

  return (
    <div>
      <usa-button variant="default" onClick={handleButtonClick}>
        Click me
      </usa-button>
      <usa-alert type="success" heading="Success!">
        Your action was completed successfully.
      </usa-alert>
    </div>
  );
}

export default App;
```

#### React 18 and Below

```jsx
import { useRef, useEffect } from 'react';
import 'uswds-webcomponents';
import '@uswds/uswds/dist/css/uswds.min.css';

function App() {
  const buttonRef = useRef(null);

  useEffect(() => {
    const button = buttonRef.current;
    if (button) {
      const handleClick = () => {
        console.log('Button clicked!');
      };
      button.addEventListener('click', handleClick);
      return () => button.removeEventListener('click', handleClick);
    }
  }, []);

  return (
    <div>
      <usa-button ref={buttonRef} variant="default">
        Click me
      </usa-button>
      <usa-alert type="success" heading="Success!">
        Your action was completed successfully.
      </usa-alert>
    </div>
  );
}

export default App;
```

#### TypeScript Support

For TypeScript projects, add type definitions:

```typescript
// types/web-components.d.ts
declare namespace JSX {
  interface IntrinsicElements {
    'usa-button': any;
    'usa-alert': any;
    // Add other components as needed
  }
}
```

### Vue.js

Vue 3 has excellent web component support.

#### Vue 3

```vue
<script setup>
import 'uswds-webcomponents';
import '@uswds/uswds/dist/css/uswds.min.css';

const handleButtonClick = () => {
  console.log('Button clicked!');
};
</script>

<template>
  <div>
    <usa-button variant="default" @click="handleButtonClick">
      Click me
    </usa-button>
    <usa-alert type="success" heading="Success!">
      Your action was completed successfully.
    </usa-alert>
  </div>
</template>
```

#### Vue 3 TypeScript

```typescript
// vite.config.ts or vue.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // Treat all tags starting with 'usa-' as custom elements
          isCustomElement: (tag) => tag.startsWith('usa-'),
        },
      },
    }),
  ],
});
```

### Angular

Angular requires configuration to recognize custom elements.

#### Module Setup

```typescript
// app.module.ts
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';

// Import web components
import 'uswds-webcomponents';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Enable custom elements
  bootstrap: [AppComponent],
})
export class AppModule {}
```

#### Component Usage

```typescript
// app.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <usa-button variant="default" (click)="handleButtonClick()">
      Click me
    </usa-button>
    <usa-alert type="success" heading="Success!">
      Your action was completed successfully.
    </usa-alert>
  `,
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  handleButtonClick() {
    console.log('Button clicked!');
  }
}
```

#### Styles Setup

```typescript
// angular.json
{
  "projects": {
    "your-app": {
      "architect": {
        "build": {
          "options": {
            "styles": [
              "node_modules/@uswds/uswds/dist/css/uswds.min.css",
              "src/styles.css"
            ]
          }
        }
      }
    }
  }
}
```

### Svelte

Svelte works great with web components.

```svelte
<script>
  import 'uswds-webcomponents';
  import '@uswds/uswds/dist/css/uswds.min.css';

  function handleButtonClick() {
    console.log('Button clicked!');
  }
</script>

<usa-button variant="default" on:click={handleButtonClick}>
  Click me
</usa-button>
<usa-alert type="success" heading="Success!">
  Your action was completed successfully.
</usa-alert>
```

#### Svelte Configuration

```javascript
// svelte.config.js
export default {
  compilerOptions: {
    customElement: true,
  },
};
```

## 📋 Component Examples

### Buttons

```html
<!-- Default button -->
<usa-button variant="default">Default</usa-button>

<!-- Primary button -->
<usa-button variant="primary">Primary</usa-button>

<!-- Secondary button -->
<usa-button variant="secondary">Secondary</usa-button>

<!-- Accent cool button -->
<usa-button variant="accent-cool">Accent Cool</usa-button>

<!-- Base button -->
<usa-button variant="base">Base</usa-button>

<!-- Disabled button -->
<usa-button variant="default" disabled>Disabled</usa-button>

<!-- Button with icon -->
<usa-button variant="default">
  <usa-icon name="search"></usa-icon>
  Search
</usa-button>
```

### Alerts

```html
<!-- Success alert -->
<usa-alert type="success" heading="Success status">
  You have successfully completed the action.
</usa-alert>

<!-- Warning alert -->
<usa-alert type="warning" heading="Warning status">
  This action requires your attention.
</usa-alert>

<!-- Error alert -->
<usa-alert type="error" heading="Error status">
  There was a problem with your submission.
</usa-alert>

<!-- Info alert -->
<usa-alert type="info" heading="Informative status">
  Here is some information you should know.
</usa-alert>

<!-- Slim alert -->
<usa-alert type="success" slim>Action completed successfully.</usa-alert>

<!-- Alert without heading -->
<usa-alert type="info"> This is an alert without a heading. </usa-alert>
```

### Forms

```html
<!-- Text input -->
<usa-text-input
  label="First name"
  name="first-name"
  type="text"
  required
></usa-text-input>

<!-- Text input with hint -->
<usa-text-input
  label="Email address"
  name="email"
  type="email"
  hint="For example: name@example.com"
  required
></usa-text-input>

<!-- Textarea -->
<usa-textarea
  label="Comments"
  name="comments"
  maxlength="500"
></usa-textarea>

<!-- Select dropdown -->
<usa-select label="State" name="state" required>
  <option value="">- Select -</option>
  <option value="AL">Alabama</option>
  <option value="AK">Alaska</option>
  <option value="AZ">Arizona</option>
</usa-select>

<!-- Checkbox -->
<usa-checkbox label="I agree to the terms" name="terms" required></usa-checkbox>

<!-- Radio buttons -->
<usa-radio name="delivery" value="standard" label="Standard (5-7 days)" checked>
</usa-radio>
<usa-radio name="delivery" value="express" label="Express (2-3 days)"></usa-radio>

<!-- Date picker -->
<usa-date-picker
  label="Appointment date"
  name="appointment"
  required
></usa-date-picker>
```

### Navigation

```html
<!-- Header with navigation -->
<usa-header>
  <div class="usa-nav-container">
    <div class="usa-navbar">
      <usa-logo>
        <em class="usa-logo__text">Project Title</em>
      </usa-logo>
    </div>
    <usa-nav>
      <usa-nav-primary>
        <usa-nav-primary-item>
          <a href="/" class="usa-nav-link"> <span>Home</span> </a>
        </usa-nav-primary-item>
        <usa-nav-primary-item>
          <a href="/about" class="usa-nav-link"> <span>About</span> </a>
        </usa-nav-primary-item>
      </usa-nav-primary>
    </usa-nav>
  </div>
</usa-header>

<!-- Breadcrumb -->
<usa-breadcrumb>
  <usa-breadcrumb-item href="/">Home</usa-breadcrumb-item>
  <usa-breadcrumb-item href="/section">Section</usa-breadcrumb-item>
  <usa-breadcrumb-item current>Current page</usa-breadcrumb-item>
</usa-breadcrumb>

<!-- Side navigation -->
<usa-side-navigation>
  <usa-side-nav-item href="#section-1" current>Section 1</usa-side-nav-item>
  <usa-side-nav-item href="#section-2">Section 2</usa-side-nav-item>
  <usa-side-nav-item href="#section-3">Section 3</usa-side-nav-item>
</usa-side-navigation>
```

### Interactive Components

```html
<!-- Accordion -->
<usa-accordion>
  <usa-accordion-item heading="First Amendment" expanded>
    Congress shall make no law respecting an establishment of religion...
  </usa-accordion-item>
  <usa-accordion-item heading="Second Amendment">
    A well regulated Militia, being necessary to the security of a free State...
  </usa-accordion-item>
</usa-accordion>

<!-- Modal -->
<usa-modal
  id="example-modal"
  heading="Are you sure you want to continue?"
  aria-describedby="modal-description"
>
  <p id="modal-description">This action cannot be undone.</p>
  <usa-button-group slot="footer">
    <usa-button variant="default" data-close-modal>Cancel</usa-button>
    <usa-button variant="primary">Continue</usa-button>
  </usa-button-group>
</usa-modal>

<!-- Button to open modal -->
<usa-button variant="primary" data-open-modal="example-modal">
  Open modal
</usa-button>

<!-- Tooltip -->
<usa-button variant="default" data-tooltip="This is helpful information">
  Hover for tooltip
</usa-button>
```

## 🎯 Working with Component Properties

### Setting Properties via Attributes

Most properties can be set using HTML attributes:

```html
<usa-button variant="primary" size="big" disabled> Big primary button </usa-button>

<usa-alert type="success" heading="Success!" slim no-icon>
  Slim alert without icon
</usa-alert>
```

### Setting Properties via JavaScript

Properties can also be set programmatically:

```javascript
const button = document.querySelector('usa-button');
button.variant = 'secondary';
button.disabled = true;

const alert = document.querySelector('usa-alert');
alert.type = 'warning';
alert.heading = 'Warning!';
```

### Listening to Events

Components emit standard DOM events:

```javascript
const button = document.querySelector('usa-button');
button.addEventListener('click', (event) => {
  console.log('Button clicked!', event);
});

const accordion = document.querySelector('usa-accordion');
accordion.addEventListener('usa-accordion-change', (event) => {
  console.log('Accordion state changed:', event.detail);
});
```

## 🔍 Accessibility

All USWDS Web Components are built with accessibility as a priority:

- **WCAG 2.1 Level AA Compliant** - Meet accessibility standards
- **Section 508 Compliant** - Government accessibility requirements
- **Keyboard Navigation** - All interactive components are keyboard accessible
- **Screen Reader Support** - Proper ARIA labels and semantic HTML
- **Focus Management** - Visible focus indicators and logical focus order

### Accessibility Best Practices

```html
<!-- Always provide labels for form inputs -->
<usa-text-input label="Full name" name="name" required></usa-text-input>

<!-- Use descriptive button text -->
<usa-button variant="primary">Submit application</usa-button>
<!-- Not: <usa-button variant="primary">Click here</usa-button> -->

<!-- Provide alt text for images -->
<img src="logo.png" alt="Company logo" />

<!-- Use semantic HTML -->
<usa-header>
  <nav aria-label="Primary navigation">
    <!-- Navigation items -->
  </nav>
</usa-header>
```

## 📦 Bundle Size Optimization

### Tree Shaking with Category Imports

Import only the component categories you need to reduce bundle size:

```javascript
// ❌ Imports all components (~475 KB)
import 'uswds-webcomponents';

// ✅ Import by category (~50-150 KB depending on category)
import 'uswds-webcomponents/actions';      // Button, Link, Search, ButtonGroup (~12 KB)
import 'uswds-webcomponents/feedback';     // Alert, Modal, Tooltip, Banner, SiteAlert (~45 KB)
import 'uswds-webcomponents/forms';        // All 15 form components (~120 KB)

// ✅ Or import specific components (best tree-shaking)
import { USAButton } from 'uswds-webcomponents/actions';
import { USAAlert } from 'uswds-webcomponents/feedback';
import { USATextInput } from 'uswds-webcomponents/forms';
```

### Lazy Loading Components

Load component categories on-demand:

```javascript
// Load category when needed
async function loadFeedbackComponents() {
  await import('uswds-webcomponents/feedback');  // Loads Modal, Alert, Tooltip, etc.
}

// Or load specific component
async function loadModal() {
  const { USAModal } = await import('uswds-webcomponents/feedback');
  return USAModal;
}

// Use in event handler
document.querySelector('#open-modal-btn').addEventListener('click', async () => {
  await loadFeedbackComponents();
  document.querySelector('usa-modal').open = true;
});
```

### Production Build Optimization

Ensure your bundler is configured for production:

```javascript
// vite.config.js
export default {
  build: {
    minify: 'terser',
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          // Split by category for optimal caching
          'uswds-actions': ['uswds-webcomponents/actions'],
          'uswds-forms': ['uswds-webcomponents/forms'],
          'uswds-feedback': ['uswds-webcomponents/feedback'],
          'uswds-navigation': ['uswds-webcomponents/navigation'],
        },
      },
    },
  },
};
```

## 🐛 Troubleshooting

### Components Not Rendering

**Problem:** Web components don't appear on the page.

**Solutions:**

1. Verify USWDS CSS is loaded:

```html
<link
  rel="stylesheet"
  href="https://unpkg.com/@uswds/uswds@latest/dist/css/uswds.min.css"
/>
```

2. Ensure components are imported:

```javascript
import 'uswds-webcomponents';
```

3. Check browser console for errors

### Styling Issues

**Problem:** Components don't look like USWDS components.

**Solutions:**

1. Ensure USWDS CSS is loaded before components render
2. Check for CSS conflicts with existing styles
3. Verify USWDS version compatibility (3.13.0+)

### TypeScript Errors

**Problem:** TypeScript doesn't recognize web component tags.

**Solution:** Add type definitions:

```typescript
// types/web-components.d.ts
declare namespace JSX {
  interface IntrinsicElements {
    'usa-button': any;
    'usa-alert': any;
    'usa-text-input': any;
    // Add all components you use
  }
}
```

### React Event Handling (React 18-)

**Problem:** Events don't fire in React.

**Solution:** Use refs for event listeners in React 18 and below:

```jsx
import { useRef, useEffect } from 'react';

function Component() {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    const handler = (e) => console.log(e);
    element?.addEventListener('click', handler);
    return () => element?.removeEventListener('click', handler);
  }, []);

  return <usa-button ref={ref}>Click me</usa-button>;
}
```

## 🛠️ Contributing & Development Setup

This project uses a monorepo architecture with pnpm workspaces and Turborepo for optimal development experience.

### Prerequisites

```bash
# Install pnpm globally (required)
npm install -g pnpm
```

### Clone and Setup

```bash
# Clone repository
git clone https://github.com/barbaramiles/USWDS-webcomponents.git
cd USWDS-webcomponents

# Install all dependencies (uses pnpm workspaces)
pnpm install

# Build all packages (uses Turborepo for parallel builds)
pnpm run build
```

### Monorepo Structure

The project is organized into category-based packages:

```
packages/
├── uswds-wc-core/              # @uswds-wc/core - Base classes and utilities
├── uswds-wc-actions/           # @uswds-wc/actions (4 components)
├── uswds-wc-forms/             # @uswds-wc/forms (15 components)
├── uswds-wc-navigation/        # @uswds-wc/navigation (8 components)
├── uswds-wc-data-display/      # @uswds-wc/data-display (8 components)
├── uswds-wc-feedback/          # @uswds-wc/feedback (5 components)
├── uswds-wc-layout/            # @uswds-wc/layout (4 components)
├── uswds-wc-structure/         # @uswds-wc/structure (1 component)
└── uswds-wc/                   # Meta package (re-exports all)
```

### Development Commands

```bash
# Start Storybook for development (recommended)
pnpm run storybook

# Build all packages
pnpm run build

# Build specific package
pnpm --filter @uswds-wc/actions build

# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter @uswds-wc/forms test

# Run visual regression tests
pnpm run test:visual

# Validate USWDS compliance
pnpm run validate:uswds-compliance

# Type checking
pnpm run typecheck

# Linting
pnpm run lint
```

### Adding a New Component

Components should be added to the appropriate category package:

```bash
# Navigate to appropriate package
cd packages/uswds-wc-forms

# Create component directory
mkdir -p src/components/my-input

# Add component files
# - usa-my-input.ts (component implementation)
# - usa-my-input.test.ts (unit tests)
# - usa-my-input.stories.ts (Storybook stories)
# - README.mdx (component documentation)

# Export from package
# Add to src/index.ts
```

### Testing Infrastructure

The project includes comprehensive testing:

- **Unit Tests**: Vitest for component logic and properties
- **Component Tests**: Cypress for interactive behavior
- **Visual Regression**: Playwright + Chromatic for UI consistency
- **USWDS Compliance**: Automated validation of HTML structure and CSS classes
- **Accessibility**: axe-core validation for WCAG 2.1 AA compliance

```bash
# Run all tests
pnpm run test:run -- --all

# Run unit tests only
pnpm test

# Run visual tests
pnpm run test:visual

# Create visual baselines
pnpm run test:visual:baseline

# Run USWDS compliance validation
pnpm run validate:uswds-compliance
```

### Code Quality Tools

Pre-commit hooks ensure code quality:

- **Smart Commit Detection**: Automatically detects commit type (docs-only, code changes)
- **USWDS Validation**: Verifies component structure matches USWDS patterns
- **TypeScript**: Type checking on modified files
- **ESLint**: Code quality and style checking
- **Component Tests**: Runs tests for modified components
- **Visual Testing**: Optional visual regression checks

```bash
# Run full validation suite
pnpm run validate

# Run specific validations
pnpm run lint
pnpm run typecheck
pnpm run validate:uswds-compliance
```

### Pull Request Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Make your changes in appropriate package
4. Write tests (unit, component, visual)
5. Run validation: `pnpm run validate`
6. Commit with conventional commits: `feat(button): add new variant`
7. Push and create pull request

### Conventional Commits

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat(button): add new outline variant
fix(modal): resolve focus trap issue
docs(readme): update installation instructions
test(alert): add accessibility tests
chore(deps): update USWDS to 3.13.0
```

**Types**: `feat`, `fix`, `docs`, `test`, `chore`, `refactor`, `perf`, `ci`, `build`

**Scopes**: Component names (button, modal, alert) or package names

### Development Best Practices

1. **Follow USWDS patterns** - Check official USWDS source code
2. **Write comprehensive tests** - Unit, component, accessibility
3. **Document thoroughly** - Component READMEs, JSDoc comments
4. **Use Light DOM** - No Shadow DOM (for USWDS CSS compatibility)
5. **USWDS CSS only** - No custom styles beyond `:host` display
6. **Accessibility first** - WCAG 2.1 AA compliance required

See [CLAUDE.md](../CLAUDE.md) for complete development guidelines.

## 📚 Additional Resources

### Documentation

- **Component API Reference** - See Storybook documentation for detailed component APIs
- **USWDS Official Documentation** - https://designsystem.digital.gov/
- **Web Components Standard** - https://developer.mozilla.org/en-US/docs/Web/Web_Components
- **Lit Documentation** - https://lit.dev/

### Example Projects

- **Vanilla JS Example** - See `/examples/vanilla` (if available)
- **React Example** - See `/examples/react` (if available)
- **Vue Example** - See `/examples/vue` (if available)

### Support

- **GitHub Issues** - Report bugs or request features
- **Storybook** - Interactive component documentation
- **Component READMEs** - Detailed documentation for each component

## 🚀 Next Steps

1. **Explore Storybook** - Browse all available components and their variants
2. **Read Component READMEs** - Learn detailed usage for specific components
3. **Build Your First Page** - Start with simple components like buttons and alerts
4. **Review Accessibility** - Ensure your implementation meets accessibility standards
5. **Optimize Bundle Size** - Use tree shaking and lazy loading for production

---

**Ready to build accessible, government-compliant web applications with USWDS Web Components!**
