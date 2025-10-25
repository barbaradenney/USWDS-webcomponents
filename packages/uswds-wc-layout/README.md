# @uswds-wc/layout

USWDS Layout Components - Page structure and content organization as Web Components.

## Overview

The `@uswds-wc/layout` package provides web component versions of USWDS components for organizing page content and creating structured layouts.

## Installation

```bash
npm install @uswds-wc/layout lit
```

## Components

### Identifier (`<usa-identifier>`)
Standard government website identifier footer section.

```html
<usa-identifier>
  <div slot="logos">
    <img src="/logo.png" alt="Agency Logo">
  </div>
  <div slot="required-links">
    <usa-link href="/about">About</usa-link>
    <usa-link href="/accessibility">Accessibility</usa-link>
    <usa-link href="/privacy">Privacy Policy</usa-link>
  </div>
  <div slot="agency">
    <p>An official website of the Agency Name</p>
  </div>
</usa-identifier>
```

**Features:**
- Government logo placement
- Required links section
- Agency information
- Responsive layout

### Process List (`<usa-process-list>`)
Numbered list for step-by-step processes or instructions.

```html
<usa-process-list>
  <li>
    <h4>Step 1: Review Requirements</h4>
    <p>Read through all the requirements carefully.</p>
  </li>
  <li>
    <h4>Step 2: Complete Application</h4>
    <p>Fill out the application form completely.</p>
  </li>
  <li>
    <h4>Step 3: Submit Documents</h4>
    <p>Upload all required supporting documents.</p>
  </li>
  <li>
    <h4>Step 4: Wait for Review</h4>
    <p>Your application will be reviewed within 5 business days.</p>
  </li>
</usa-process-list>
```

**Variants:**
- `default` - Standard numbered circles
- `small` - Smaller circle size

### Prose (`<usa-prose>`)
Structured content wrapper for long-form text with USWDS typography.

```html
<usa-prose>
  <h1>Article Title</h1>
  <p class="usa-intro">This is an introductory paragraph.</p>

  <h2>Section Heading</h2>
  <p>Regular paragraph content with proper spacing and typography.</p>

  <ul>
    <li>List item one</li>
    <li>List item two</li>
    <li>List item three</li>
  </ul>

  <h3>Subsection</h3>
  <p>More content here.</p>
</usa-prose>
```

**Features:**
- Automatic USWDS typography styles
- Proper vertical rhythm
- Responsive font sizing
- Accessible heading hierarchy

### Step Indicator (`<usa-step-indicator>`)
Visual progress indicator for multi-step processes.

```html
<usa-step-indicator current-step="2">
  <usa-step-indicator-step status="complete">
    Personal Information
  </usa-step-indicator-step>
  <usa-step-indicator-step status="current">
    Household Status
  </usa-step-indicator-step>
  <usa-step-indicator-step>
    Supporting Documents
  </usa-step-indicator-step>
  <usa-step-indicator-step>
    Signature
  </usa-step-indicator-step>
  <usa-step-indicator-step>
    Review and Submit
  </usa-step-indicator-step>
</usa-step-indicator>
```

**Properties:**
- `current-step` - Current step number (1-indexed)
- `counters`: `'default' | 'small'` - Step counter size
- `no-labels` - Hide step labels on mobile
- `no-counters` - Hide step numbers

**Step Status:**
- `complete` - Completed step
- `current` - Active step
- (no status) - Future step

## Usage Example

### Multi-step Form with Progress

```html
<usa-step-indicator current-step="1">
  <usa-step-indicator-step status="current">
    Basic Info
  </usa-step-indicator-step>
  <usa-step-indicator-step>
    Details
  </usa-step-indicator-step>
  <usa-step-indicator-step>
    Review
  </usa-step-indicator-step>
</usa-step-indicator>

<form id="step-1">
  <usa-text-input label="Full Name" required></usa-text-input>
  <usa-text-input label="Email" type="email" required></usa-text-input>

  <usa-button-group>
    <usa-button type="submit">Next Step</usa-button>
  </usa-button-group>
</form>
```

### Process List with Icons

```html
<usa-process-list>
  <li>
    <h4>
      <usa-icon name="check"></usa-icon>
      Create Account
    </h4>
    <p>Sign up for a new account using your email address.</p>
  </li>
  <li>
    <h4>
      <usa-icon name="mail"></usa-icon>
      Verify Email
    </h4>
    <p>Check your email and click the verification link.</p>
  </li>
  <li>
    <h4>
      <usa-icon name="settings"></usa-icon>
      Complete Profile
    </h4>
    <p>Fill out your profile information to get started.</p>
  </li>
</usa-process-list>
```

### Identifier Footer

```html
<footer>
  <usa-identifier>
    <div slot="logos">
      <img src="/logo.png" alt="Department Logo" class="usa-identifier__logo-img">
    </div>

    <div slot="required-links">
      <h4>Important Links</h4>
      <usa-link href="/about">About Us</usa-link>
      <usa-link href="/accessibility">Accessibility Support</usa-link>
      <usa-link href="/foia">FOIA Requests</usa-link>
      <usa-link href="/privacy">Privacy Policy</usa-link>
    </div>

    <div slot="agency">
      <p><strong>Agency Name</strong></p>
      <p>123 Government St, Washington, DC 20001</p>
    </div>
  </usa-identifier>
</footer>
```

## Bundle Size

Gzipped: ~30 KB

## Features

- **Content Structure** - Organized layouts for government websites
- **Progress Tracking** - Visual step indicators
- **Typography** - USWDS-styled prose content
- **Accessibility** - Semantic HTML and ARIA support
- **Responsive** - Mobile-first responsive design
- **TypeScript** - Full type definitions included

## Common Patterns

### Step Indicator with Form Navigation

```javascript
import '@uswds-wc/layout';

const stepIndicator = document.querySelector('usa-step-indicator');
let currentStep = 1;

function nextStep() {
  if (currentStep < totalSteps) {
    currentStep++;
    stepIndicator.currentStep = currentStep;
    // Update form visibility
  }
}

function prevStep() {
  if (currentStep > 1) {
    currentStep--;
    stepIndicator.currentStep = currentStep;
    // Update form visibility
  }
}
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

[USWDS Web Components Monorepo](https://github.com/barbaradenney/USWDS-webcomponents/tree/main/packages/uswds-wc-layout)

## Related Packages

- [@uswds-wc/all](../uswds-wc) - Complete package bundle
- [@uswds-wc/navigation](../uswds-wc-navigation) - Header and footer components
- [@uswds-wc/data-display](../uswds-wc-data-display) - Data display components

## Contributing

See the [main repository](https://github.com/barbaradenney/USWDS-webcomponents) for contribution guidelines.
