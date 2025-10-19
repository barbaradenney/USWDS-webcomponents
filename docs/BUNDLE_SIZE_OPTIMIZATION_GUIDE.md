# Bundle Size Optimization Guide

This guide helps users optimize their bundle size when using USWDS Web Components.

## Quick Stats

**Current Bundle Sizes (brotli compressed):**
- Full bundle (all 46 components): **67 KB**
- CSS (optimized with PurgeCSS): **24 KB**
- **Total**: **91 KB** (brotli) / **120 KB** (gzip)

**Individual Component Sizes:**
- Accordion: ~2 KB (brotli)
- Button: ~1.5 KB (brotli)
- Alert: ~1 KB (brotli)
- Most components: 1-3 KB (brotli)

---

## Import Strategies

### Strategy 1: Full Bundle (Easiest)

**Use when**: You need 10+ components or don't know which components you'll use.

```typescript
// Import all components (auto-registers)
import 'uswds-webcomponents';

// Use in your HTML
<usa-button>Click me</usa-button>
<usa-alert>Alert message</usa-alert>
```

**Bundle Impact**: ~91 KB (brotli) / ~120 KB (gzip)

---

### Strategy 2: Selective Imports (Recommended)

**Use when**: You only need a few specific components.

```typescript
// Import only what you need
import 'uswds-webcomponents/components/button';
import 'uswds-webcomponents/components/alert';
import 'uswds-webcomponents/components/accordion';

// Use in your HTML
<usa-button>Click me</usa-button>
<usa-alert>Alert message</usa-alert>
<usa-accordion>...</usa-accordion>
```

**Bundle Impact**: ~5-10 KB (brotli) for 3 components + shared dependencies

---

### Strategy 3: Manual Registration (Maximum Control)

**Use when**: You want complete control over when components are registered.

```typescript
// Import without auto-registration
import { USAButton } from 'uswds-webcomponents/components/button';
import { USAAlert } from 'uswds-webcomponents/components/alert';

// Register manually when needed
customElements.define('usa-button', USAButton);
customElements.define('usa-alert', USAAlert);
```

**Bundle Impact**: Same as Strategy 2, but with more control

---

## Tree-Shaking Tips

### 1. Use ES Module Imports

```typescript
// ✅ GOOD - Enables tree-shaking
import { USAButton } from 'uswds-webcomponents/components/button';

// ❌ BAD - No tree-shaking
const { USAButton } = require('uswds-webcomponents/components/button');
```

### 2. Import Individual Components

```typescript
// ✅ GOOD - Only loads button component
import 'uswds-webcomponents/components/button';

// ❌ BAD - Loads all components
import 'uswds-webcomponents';
```

### 3. Use Vite/Rollup/Webpack with ES Modules

Modern bundlers automatically tree-shake unused code when using ES modules.

---

## Lazy Loading Components

### Dynamic Imports

Load components only when needed:

```typescript
// Load component dynamically
async function loadAccordion() {
  await import('uswds-webcomponents/components/accordion');
  // Component is now available
}

// Load on user interaction
button.addEventListener('click', async () => {
  await loadAccordion();
  // Now render accordion
});
```

### Code-Splitting with Routes

```typescript
// router.ts
const routes = [
  {
    path: '/dashboard',
    component: () => import('./pages/Dashboard'),
    // Load dashboard-specific components
    beforeEnter: async () => {
      await import('uswds-webcomponents/components/accordion');
      await import('uswds-webcomponents/components/card');
    }
  },
  {
    path: '/form',
    component: () => import('./pages/Form'),
    // Load form-specific components
    beforeEnter: async () => {
      await import('uswds-webcomponents/components/text-input');
      await import('uswds-webcomponents/components/button');
    }
  }
];
```

---

## CSS Optimization

### Option 1: Use Full CSS (Simplest)

```typescript
// Import optimized CSS (already purged, 24 KB brotli)
import 'uswds-webcomponents/dist/uswds-webcomponents.css';
```

**Size**: 24 KB (brotli) / 31 KB (gzip)

### Option 2: Use Your Own PurgeCSS

If you want even more control:

```javascript
// postcss.config.js
module.exports = {
  plugins: [
    require('@fullhuman/postcss-purgecss')({
      content: [
        './src/**/*.{html,js,ts,jsx,tsx}',
        './node_modules/uswds-webcomponents/**/*.js',
      ],
      safelist: {
        standard: [/^usa-/],
        deep: [/^usa-.*$/],
      },
    }),
  ],
};
```

---

## Bundle Analysis

### View Bundle Composition

```bash
# Build with visualizer
npm run build:analyze:visual

# Opens dist/stats.html with interactive treemap
```

### Monitor Bundle Size

```bash
# Check current bundle sizes
npm run build:optimize

# View gzip and brotli sizes
```

---

## Compression Strategies

### 1. Enable Brotli on Your Server

Brotli provides 25-35% better compression than gzip:

```nginx
# Nginx
http {
  brotli on;
  brotli_types text/css application/javascript;
  brotli_comp_level 6;
}
```

```apache
# Apache
<IfModule mod_brotli.c>
  AddOutputFilterByType BROTLI_COMPRESS text/css application/javascript
</IfModule>
```

### 2. Pre-compressed Files

We generate `.br` and `.gz` files during build:

```
dist/index.js      (475 KB)
dist/index.js.gz   (86 KB)   ← Serve if supported
dist/index.js.br   (67 KB)   ← Serve if supported (best)
```

---

## Real-World Examples

### Small App (1-3 Components)

```typescript
// Only import what you need
import 'uswds-webcomponents/components/button';
import 'uswds-webcomponents/components/alert';
import 'uswds-webcomponents/dist/uswds-webcomponents.css';
```

**Result**: ~28 KB (brotli) total

### Medium App (5-10 Components)

```typescript
// Import specific components
import 'uswds-webcomponents/components/button';
import 'uswds-webcomponents/components/alert';
import 'uswds-webcomponents/components/accordion';
import 'uswds-webcomponents/components/modal';
import 'uswds-webcomponents/components/table';
import 'uswds-webcomponents/dist/uswds-webcomponents.css';
```

**Result**: ~40-50 KB (brotli) total

### Large App (20+ Components)

```typescript
// Just use the full bundle
import 'uswds-webcomponents';
import 'uswds-webcomponents/dist/uswds-webcomponents.css';
```

**Result**: ~91 KB (brotli) total

---

## Performance Best Practices

### 1. Load CSS in `<head>`

```html
<link rel="stylesheet" href="/uswds-webcomponents.css">
```

### 2. Load JS with `type="module"`

```html
<script type="module" src="/your-app.js"></script>
```

### 3. Use HTTP/2 or HTTP/3

Modern HTTP protocols allow efficient parallel loading.

### 4. Consider CDN

```html
<!-- Future CDN support -->
<script type="module" src="https://cdn.example.com/uswds-webcomponents@1.0.0/index.js"></script>
```

---

## Monitoring Tools

### bundlesize (CI/CD Integration)

```json
// package.json
{
  "bundlesize": [
    {
      "path": "./dist/index.js",
      "maxSize": "95 KB",
      "compression": "gzip"
    },
    {
      "path": "./dist/uswds-webcomponents.css",
      "maxSize": "32 KB",
      "compression": "gzip"
    }
  ]
}
```

### webpack-bundle-analyzer

```bash
npm install -D webpack-bundle-analyzer
```

### Vite Bundle Visualizer (Built-in)

```bash
npm run build:analyze:visual
```

---

## FAQ

### Q: How much does the full bundle weigh?

**A**: 91 KB (brotli) / 120 KB (gzip) for all 46 components + CSS.

### Q: Can I use only one component?

**A**: Yes! Import only what you need: `import 'uswds-webcomponents/components/button'`

### Q: Does this include the CSS?

**A**: No, CSS must be imported separately (24 KB brotli).

### Q: What about browser support?

**A**: Modern browsers with Web Components support (Chrome, Firefox, Safari, Edge).

### Q: Can I use this with React/Vue/Angular?

**A**: Yes! Web Components work with all frameworks.

---

## Support

- Bundle analyzer: `npm run build:analyze:visual`
- Documentation: `docs/`
- Issues: [GitHub Issues](https://github.com/your-org/uswds-webcomponents/issues)
