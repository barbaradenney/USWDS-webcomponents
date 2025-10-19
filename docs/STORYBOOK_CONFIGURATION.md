# Storybook Configuration Guide

## Overview

This document describes the Storybook 9 configuration for the USWDS Web Components library. Our setup is optimized for:
- Web Components development with Lit
- USWDS integration and testing
- Comprehensive accessibility testing
- Documentation generation
- Visual regression testing capabilities

## Configuration Files

### Required Files

#### `.storybook/main.ts` (Main Configuration)
**Purpose**: Core Storybook configuration - framework, addons, build settings

**Key Features**:
- Framework: `@storybook/web-components-vite`
- Stories pattern: `../src/**/*.stories.@(ts|mdx)`
- Addons: a11y, vitest, coverage, docs
- Vite optimization for Lit and USWDS modules
- CommonJS handling for USWDS dependencies
- Lit deduplication to prevent version conflicts

**Configuration Highlights**:
```typescript
{
  framework: '@storybook/web-components-vite',
  stories: ['../src/**/*.stories.@(ts|mdx)', './*.mdx'],
  staticDirs: ['../public'],
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
    '@storybook/addon-coverage',
    '@storybook/addon-docs'
  ],
  docs: { defaultName: 'Docs' },
  typescript: { check: false }
}
```

#### `.storybook/preview.ts` (Story Rendering Configuration)
**Purpose**: Global decorators, parameters, and story rendering behavior

**Key Features**:
- USWDS cleanup between story navigations
- Layout recalculation fix for Lit components
- Accordion/Banner iframe resize handling
- Accessibility testing configuration
- Theme toolbar integration
- Non-inline story rendering for Web Components isolation

**Configuration Highlights**:
```typescript
{
  parameters: {
    layout: 'padded',
    docs: { inlineStories: false },
    a11y: { test: 'todo' }
  },
  decorators: [
    // USWDS cleanup
    // Layout recalculation
    // Iframe resize handling
  ]
}
```

#### `.storybook/preview-head.html` (Preview iframe `<head>`)
**Purpose**: Scripts and styles injected into the preview iframe

**Key Features**:
- USWDS debug configuration
- Iframe height adjustment documentation
- Modal flash prevention styles

**Note**: USWDS global script loading is currently disabled to prevent double initialization. Components use module-based USWDS initialization instead.

### Optional Files

#### `.storybook/manager-head.html` (Manager UI `<head>`)
**Purpose**: Customize the Storybook manager UI (sidebar, toolbar, etc.)

**Current Status**: Minimal configuration (placeholder comments)

#### `.storybook/test-runner.ts` (Test Runner Configuration)
**Purpose**: Playwright-based test runner configuration for automated story testing

#### `.storybook/vitest.setup.ts` (Vitest Integration)
**Purpose**: Integration between Storybook and Vitest for in-browser testing

## File Loading Priority

**CRITICAL**: Storybook loads configuration files in this order:
1. `.js` files have priority over `.ts` files
2. TypeScript files are transpiled at build time

**What This Means**:
- ✅ Use EITHER `preview.js` OR `preview.ts` - never both
- ✅ Use EITHER `main.js` OR `main.ts` - never both
- ⚠️ If both exist, `.js` file wins and `.ts` is ignored!

**Our Setup**:
- ✅ `main.ts` only (correct)
- ✅ `preview.ts` only (correct - removed conflicting `preview.js`)

## Best Practices

### 1. Configuration File Management

**DO**:
- ✅ Use TypeScript (`.ts`) for type safety
- ✅ Keep one configuration file per purpose
- ✅ Document complex configurations with comments
- ✅ Use environment variables for different environments

**DON'T**:
- ❌ Have both `.js` and `.ts` versions of the same config
- ❌ Put business logic in configuration files
- ❌ Hardcode environment-specific values

### 2. Story Organization

**File Structure**:
```
src/components/button/
  ├── usa-button.ts                  # Component implementation
  ├── usa-button.stories.ts          # Co-located stories
  ├── usa-button.test.ts             # Unit tests
  ├── usa-button.component.cy.ts     # Component tests (Cypress)
  └── README.mdx                     # Component documentation
```

**Story Pattern**:
```typescript
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './index.ts';
import type { USAButton } from './usa-button.js';

const meta: Meta<USAButton> = {
  title: 'Components/Button',
  component: 'usa-button',
  parameters: {
    layout: 'padded',
    docs: {
      story: {
        inline: false,  // Required for Web Components
        iframeHeight: 200  // Set when needed for dropdowns
      }
    }
  }
};

export default meta;
type Story = StoryObj<USAButton>;

export const Default: Story = {
  args: { label: 'Button' }
};
```

### 3. iframe Height Management

**Problem**: Storybook Docs mode doesn't support dynamic iframe resizing for absolutely-positioned elements (combo box dropdowns, tooltips, etc.)

**Solution**: Automated iframe resize system using CSS animation technique from [The Iframe Tango](https://blog.damato.design/posts/storybook-iframe-tango/)

#### Implementation

The iframe resize system is implemented in `.storybook/manager-head.html` and works automatically for all components:

**Key Features**:
- **CSS Animation Detection**: Uses CSS animation to detect iframe insertion without DOM polling
- **Comprehensive Height Calculation**: Uses `getBoundingClientRect()` to measure absolutely-positioned elements
- **MutationObserver**: Watches for DOM changes to trigger resize (dropdowns, calendars, etc.)
- **Automatic Resize**: No manual `iframeHeight` parameters needed
- **Respects Manual Heights**: Skips auto-resize if manual `iframeHeight` is set

**How It Works**:
1. CSS animation triggers when iframe is inserted into DOM
2. `animationend` event handler captures iframe and sets up observers
3. MutationObserver watches iframe content for changes
4. When changes detected, calculates actual height including absolutely-positioned elements
5. Sets both iframe and parent container heights dynamically

**No Story Configuration Required**: Just use `inline: false`:

```typescript
export const Default: Story = {
  parameters: {
    docs: {
      story: {
        inline: false,  // Auto-resize handles everything
      }
    }
  }
};
```

**Components with Automatic Resize**:
- All components with dropdowns (combo-box, date-picker, time-picker)
- Components with tooltips
- Components with dynamic content (accordion, banner)
- Any component with absolutely-positioned elements

### 4. USWDS Integration

**Pattern Used**: Module-based initialization with cleanup

**Why**:
- Avoids double initialization conflicts
- Provides better control over component lifecycle
- Prevents USWDS elements from persisting between stories

**Implementation**:
```typescript
// In preview.ts decorator
const cleanupUSWDSElements = (): void => {
  // Remove modal wrappers
  document.querySelectorAll('.usa-modal-wrapper').forEach(wrapper => wrapper.remove());

  // Clean up absolutely-positioned elements
  USWDS_CLEANUP_SELECTORS.forEach(removeOutsideElements);

  // Remove body classes
  document.body.classList.remove(...USWDS_BODY_CLASSES);
};
```

### 5. Accessibility Testing

**Configuration**:
```typescript
a11y: {
  config: {},
  options: {},
  manual: true,
  test: 'todo'  // Show violations, don't fail build
}
```

**Levels**:
- `'todo'` - Show violations in test UI only (development)
- `'error'` - Fail CI on violations (production)
- `'off'` - Skip a11y checks (not recommended)

## Troubleshooting

### Issue: Stories not updating
**Solution**: Clear Storybook cache
```bash
npm run storybook:clean
```

### Issue: Duplicate configuration files
**Solution**: Remove `.js` versions if `.ts` exists
```bash
rm .storybook/preview.js  # If preview.ts exists
rm .storybook/main.js     # If main.ts exists
```

### Issue: USWDS components not initializing
**Solution**: Check for:
1. Module loader in component `firstUpdated()`
2. USWDS cleanup in preview.ts decorator
3. Proper story isolation (`inlineStories: false`)

### Issue: Iframe height too small for dropdowns
**Solution**: The automated iframe resize system handles this automatically. No action needed.

If you need to verify the system is working:
1. Check browser console for resize logs: `📏 Iframe resized: 400px → XXXpx`
2. Verify `.storybook/manager-head.html` contains the resize script
3. Ensure story uses `inline: false` (required for iframe isolation)

If auto-resize is not working, you can temporarily use manual height:
```typescript
parameters: {
  docs: {
    story: {
      inline: false,
      iframeHeight: 600  // Skips auto-resize
    }
  }
}
```

## Migration Notes

### From Storybook 8 to Storybook 9

**Key Changes**:
1. Essential addons (actions, controls) now built into core
2. Improved TypeScript support
3. Better Vite integration
4. Enhanced a11y testing

**No Breaking Changes in Our Setup** - Configuration is compatible.

## Performance Optimization

### Vite Configuration

**Optimizations Applied**:
- Lit deduplication to prevent multiple versions
- USWDS module pre-bundling
- Fast HMR with 2-second timeout
- Source maps enabled for debugging
- Aggressive caching strategy

### Development Server

**Settings**:
- Fast file watching (100ms interval)
- Native file system events (no polling)
- Overlay for HMR errors
- Strict mode disabled for flexibility

## References

- [Storybook 9 Documentation](https://storybook.js.org/docs)
- [Web Components Framework](https://storybook.js.org/docs/web-components/get-started/introduction)
- [Vite Configuration](https://storybook.js.org/docs/configure/integration/vite)
- [USWDS Documentation](https://designsystem.digital.gov/)

## Change Log

### 2025-10-18
- ✅ Removed duplicate `preview.js` that was overriding `preview.ts`
- ✅ Consolidated all preview configuration in TypeScript
- ✅ Implemented automated iframe resize system using CSS animation technique
- ✅ Removed fixed iframe heights - now handled automatically
- ✅ Enhanced height calculation using `getBoundingClientRect()` for absolutely-positioned elements
- ✅ Added MutationObserver for dynamic content changes (dropdowns, calendars)
- ✅ Created comprehensive configuration documentation

---

**Last Updated**: October 10, 2025
**Storybook Version**: 9.1.10
**Framework**: @storybook/web-components-vite
