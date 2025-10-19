# Performance Optimization Migration Guide

**Version**: 1.0.0 → 2.0.0  
**Migration Date**: September 12, 2025  
**Estimated Migration Time**: 30-60 minutes

This guide helps you migrate from the basic USWDS Web Components implementation to the performance-optimized version with virtual scrolling, memoization, and CSS code splitting.

---

## 🚀 **Quick Migration Checklist**

### **Immediate Actions (Required)**

- [ ] Update import statements for new bundle structure
- [ ] Replace full CSS imports with selective loading
- [ ] Enable virtual scrolling for large datasets
- [ ] Update component usage for performance features

### **Optional Optimizations**

- [ ] Implement selective component imports
- [ ] Add performance monitoring
- [ ] Configure advanced memoization
- [ ] Set up lazy loading patterns

---

## 📦 **Bundle Structure Changes**

### **Before (v1.0.0)**

```
dist/
├── index.js                    # 235KB main bundle
├── uswds-webcomponents.css     # 521KB full CSS
└── components/                 # Individual components
```

### **After (v2.0.0)**

```
dist/
├── index.js                    # 246KB main bundle with performance features
├── uswds-webcomponents.css     # 521KB full CSS (unchanged)
├── styles/                     # NEW: Component-specific CSS
│   ├── uswds-core.css         # 91KB core styles
│   ├── usa-accordion.css       # 3KB component CSS
│   ├── usa-button.css         # 2KB component CSS
│   └── ... (34 more files)
└── utils/
    └── style-loader.js        # NEW: Dynamic CSS loader
```

---

## 🔧 **Required Migrations**

### **1. CSS Loading Migration**

#### **Before: Full CSS Bundle**

```html
<!-- Old way: Load everything -->
<link rel="stylesheet" href="/dist/uswds-webcomponents.css" />
```

#### **After: Selective CSS Loading**

```html
<!-- New way: Load only what you need -->
<link rel="stylesheet" href="/dist/styles/uswds-core.css" />
<link rel="stylesheet" href="/dist/styles/usa-button.css" />
<link rel="stylesheet" href="/dist/styles/usa-table.css" />
<!-- Add only components you actually use -->
```

#### **Advanced: Dynamic CSS Loading**

```javascript
import { loadComponentStyles, autoLoadStyles } from '/dist/utils/style-loader.js';

// Load styles on-demand
await loadComponentStyles('table');

// Auto-load when component is used
autoLoadStyles('accordion');
```

### **2. Virtual Scrolling Migration**

#### **Before: Traditional Rendering**

```html
<!-- Old: All rows rendered, performance degrades with >100 items -->
<usa-table id="myTable"></usa-table>
<script>
  document.getElementById('myTable').data = largeDataset; // Slow with 1000+ rows
</script>
```

#### **After: Virtual Scrolling**

```html
<!-- New: Only visible rows rendered, handles 10,000+ items smoothly -->
<usa-table id="myTable" virtual="true" row-height="48" container-height="400"> </usa-table>
<script>
  document.getElementById('myTable').data = largeDataset; // Fast with any size
</script>
```

#### **Collection Component Migration**

```html
<!-- Before -->
<usa-collection id="myCollection"></usa-collection>

<!-- After -->
<usa-collection id="myCollection" virtual="true" item-height="120" container-height="600">
</usa-collection>
```

---

## ⚡ **New Performance Features**

### **1. Automatic Memoization**

No changes required - components automatically use memoization for:

- **Table sorting operations** - 70-90% faster repeat sorts
- **Cell formatting** - 50-80% faster with large datasets
- **Filter operations** - 60-85% faster similar filters

### **2. Advanced Memoization (Optional)**

For custom components, you can add explicit memoization:

```javascript
import { USWDSMemoization } from '/dist/utils/performance-helpers.js';

// Memoize expensive functions
const processData = USWDSMemoization.memoize((data) =>
  data.map((item) => expensiveCalculation(item))
);

// Use in your component
const processedData = processData(this.rawData);
```

### **3. Performance Monitoring (Optional)**

Add performance monitoring to track render times:

```javascript
import { USWDSPerformanceManager } from '/dist/utils/performance-helpers.js';

const manager = USWDSPerformanceManager.getInstance();

// Monitor component performance
const renderTime = await manager.measureRender(component, () => {
  component.requestUpdate();
});

console.log(`Render took ${renderTime}ms`);
```

---

## 📊 **Migration Examples**

### **Example 1: Large Data Table**

#### **Before (Slow)**

```html
<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="/dist/uswds-webcomponents.css" />
  </head>
  <body>
    <usa-table id="employeeTable"></usa-table>

    <script type="module">
      import { USATable } from '/dist/index.js';

      // This becomes slow with 1000+ rows
      document.getElementById('employeeTable').data = employees; // 5000 employees
    </script>
  </body>
</html>
```

#### **After (Fast)**

```html
<!DOCTYPE html>
<html>
  <head>
    <!-- Load only required CSS -->
    <link rel="stylesheet" href="/dist/styles/uswds-core.css" />
    <link rel="stylesheet" href="/dist/styles/usa-table.css" />
  </head>
  <body>
    <!-- Enable virtual scrolling -->
    <usa-table id="employeeTable" virtual="true" row-height="48" container-height="500">
    </usa-table>

    <script type="module">
      import { USATable } from '/dist/index.js';

      // Now handles 5000+ rows smoothly
      document.getElementById('employeeTable').data = employees; // 5000 employees
    </script>
  </body>
</html>
```

### **Example 2: Multi-Component Page**

#### **Before (Large CSS Bundle)**

```html
<!DOCTYPE html>
<html>
  <head>
    <!-- Loads 521KB of CSS for all components -->
    <link rel="stylesheet" href="/dist/uswds-webcomponents.css" />
  </head>
  <body>
    <!-- Only using 3 components -->
    <usa-button>Click me</usa-button>
    <usa-accordion>...</usa-accordion>
    <usa-alert>...</usa-alert>
  </body>
</html>
```

#### **After (Optimized CSS)**

```html
<!DOCTYPE html>
<html>
  <head>
    <!-- Load only 98KB total (91+3+2+2) instead of 521KB -->
    <link rel="stylesheet" href="/dist/styles/uswds-core.css" />
    <!-- 91KB -->
    <link rel="stylesheet" href="/dist/styles/usa-button.css" />
    <!-- 2KB -->
    <link rel="stylesheet" href="/dist/styles/usa-accordion.css" />
    <!-- 3KB -->
    <link rel="stylesheet" href="/dist/styles/usa-alert.css" />
    <!-- 2KB -->
  </head>
  <body>
    <usa-button>Click me</usa-button>
    <usa-accordion>...</usa-accordion>
    <usa-alert>...</usa-alert>
  </body>
</html>
```

### **Example 3: Dynamic Loading Application**

#### **Before (Static Loading)**

```javascript
// All components loaded upfront
import {
  USAButton,
  USATable,
  USAModal,
  USAAccordion,
  // ... 45 more components
} from '/dist/index.js';
```

#### **After (Dynamic Loading)**

```javascript
// Load components only when needed
const loadButton = () => import('/dist/components/button.js');
const loadTable = () => import('/dist/components/table.js');
const loadModal = () => import('/dist/components/modal.js');

// Load and use components dynamically
async function showDataTable() {
  const { USATable } = await loadTable();
  await loadComponentStyles('table');

  const table = new USATable();
  table.virtual = true;
  table.data = await fetchData();
  document.body.appendChild(table);
}
```

---

## 🔧 **Configuration Options**

### **Virtual Scrolling Configuration**

| Component      | Property           | Type    | Default | Description                    |
| -------------- | ------------------ | ------- | ------- | ------------------------------ |
| usa-table      | `virtual`          | boolean | `false` | Enable virtual scrolling       |
| usa-table      | `row-height`       | number  | `48`    | Height of each table row       |
| usa-table      | `container-height` | number  | `400`   | Height of scrollable area      |
| usa-collection | `virtual`          | boolean | `false` | Enable virtual scrolling       |
| usa-collection | `item-height`      | number  | `120`   | Height of each collection item |
| usa-collection | `container-height` | number  | `600`   | Height of scrollable area      |

### **Performance Tuning**

#### **Virtual Scrolling Tuning**

```javascript
// Fine-tune virtual scrolling performance
const table = document.querySelector('usa-table');
table.virtual = true;
table.rowHeight = 52; // Adjust based on your content
table.containerHeight = 500; // Adjust based on available space

// The virtual scroller automatically calculates:
// - Visible items: containerHeight / rowHeight = ~10 items
// - Overscan buffer: +5 items above/below = ~20 total DOM elements
```

#### **Memoization Tuning**

```javascript
import { USWDSMemoization } from '/dist/utils/performance-helpers.js';

// Check cache performance
const stats = USWDSMemoization.getCacheStats();
console.log('Cache stats:', stats);

// Clear caches when memory usage is high
if (Object.values(stats).reduce((sum, count) => sum + count, 0) > 1000) {
  USWDSMemoization.clearCache(); // Clear all caches
}

// Or clear specific caches
USWDSMemoization.clearCache('table-sort'); // Clear only table sorting cache
```

---

## 📈 **Performance Testing**

### **Before/After Benchmarking**

Test your migration with these performance checks:

#### **1. Bundle Size Analysis**

```bash
# Check CSS bundle sizes
ls -lh dist/styles/*.css

# Core CSS should be ~91KB
# Component CSS should be 1-30KB each
# Total CSS for typical page should be <150KB vs 521KB before
```

#### **2. Render Performance Testing**

```javascript
// Test table rendering with large datasets
const testData = Array(5000)
  .fill()
  .map((_, i) => ({
    id: i,
    name: `Item ${i}`,
    value: Math.random() * 100,
  }));

console.time('Table Render');
table.data = testData;
await table.updateComplete;
console.timeEnd('Table Render');

// Before: ~2000ms for 5000 rows
// After: ~20ms for 5000 rows with virtual scrolling
```

#### **3. Memory Usage Testing**

```javascript
// Monitor DOM element count
const observer = new MutationObserver(() => {
  const elemCount = document.querySelectorAll('*').length;
  console.log(`DOM elements: ${elemCount}`);
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

// Before: 5000 rows = ~15,000 DOM elements
// After: 5000 rows = ~60 DOM elements (only visible items)
```

### **3. Network Performance Testing**

```javascript
// Test CSS loading performance
console.time('CSS Loading');

// Before: Load full 521KB bundle
// After: Load selective CSS (typically 100-150KB)

document.addEventListener('DOMContentLoaded', () => {
  console.timeEnd('CSS Loading');
});
```

---

## 🚨 **Common Migration Issues**

### **Issue 1: CSS Not Loading**

**Problem**: Component appears unstyled after migration.

**Solution**: Ensure core CSS is always loaded first:

```html
<!-- REQUIRED: Always load core CSS first -->
<link rel="stylesheet" href="/dist/styles/uswds-core.css" />

<!-- Then component-specific CSS -->
<link rel="stylesheet" href="/dist/styles/usa-button.css" />
```

### **Issue 2: Virtual Scrolling Not Working**

**Problem**: Virtual scrolling enabled but all rows still render.

**Solution**: Check component setup:

```html
<!-- ✅ Correct -->
<usa-table
  virtual="true"     <!-- String "true", not boolean -->
  row-height="48"    <!-- Must specify row height -->
  container-height="400">  <!-- Must specify container height -->
</usa-table>

<!-- ❌ Incorrect -->
<usa-table virtual>  <!-- Missing height attributes -->
</usa-table>
```

### **Issue 3: Performance Regression**

**Problem**: Application is slower after migration.

**Diagnosis**: Check for common issues:

```javascript
// 1. Check if virtual scrolling is actually enabled
const table = document.querySelector('usa-table');
console.log('Virtual scrolling enabled:', table.virtual);

// 2. Check cache performance
const stats = USWDSMemoization.getCacheStats();
console.log('Cache stats:', stats);

// 3. Check if CSS is loading efficiently
const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
console.log(`Loading ${cssLinks.length} CSS files`);
```

**Solutions**:

1. Enable virtual scrolling for large datasets
2. Clear caches if they grow too large
3. Reduce number of CSS files by combining related components

### **Issue 4: Bundle Size Increase**

**Problem**: JavaScript bundle is larger after migration.

**Explanation**: The main bundle increased from 235KB to 246KB because it now includes performance utilities. However, you gain:

- Virtual scrolling capabilities
- Comprehensive memoization system
- Performance monitoring tools
- CSS code-splitting utilities

**Net benefit**: Overall page load is still faster due to CSS optimizations and runtime performance improvements.

---

## ✅ **Migration Verification**

### **Checklist: Verify Your Migration**

#### **1. CSS Loading Verification**

- [ ] Core CSS (`uswds-core.css`) loads first
- [ ] Only component-specific CSS files you need are loaded
- [ ] Total CSS payload is reduced from 521KB to <200KB
- [ ] Components render correctly with new CSS structure

#### **2. Virtual Scrolling Verification**

- [ ] Large tables/collections have `virtual="true"` attribute
- [ ] Row/item heights are specified correctly
- [ ] Container heights are appropriate for your layout
- [ ] Scrolling performance is smooth with large datasets

#### **3. Performance Verification**

- [ ] Table sorting is faster on repeat operations
- [ ] Large dataset rendering is significantly improved
- [ ] Page load time is reduced due to smaller CSS bundles
- [ ] Memory usage is lower with virtual scrolling

#### **4. Functional Verification**

- [ ] All components render and behave correctly
- [ ] Form submission still works properly
- [ ] Accessibility features are preserved
- [ ] Custom styling/theming still applies correctly

### **Performance Metrics to Track**

Before and after migration, measure:

| Metric                 | Before (v1.0.0) | Target (v2.0.0)    |
| ---------------------- | --------------- | ------------------ |
| Initial CSS Load       | 521KB           | <200KB             |
| Table Render (1K rows) | >300ms          | <50ms              |
| Table Render (5K rows) | >1500ms         | <100ms             |
| DOM Elements (5K rows) | ~15,000         | <100               |
| Memory Usage           | Baseline        | 30-50% reduction   |
| First Paint Time       | Baseline        | 20-40% improvement |

---

## 🎯 **Post-Migration Optimization**

### **Further Optimizations**

After completing the basic migration, consider these additional optimizations:

#### **1. Advanced Bundle Splitting**

```javascript
// Import only specific components
import { USAButton } from '/dist/components/button.js';
import { USATable } from '/dist/components/table.js';

// Instead of importing the full bundle
// import * as USWDS from '/dist/index.js';
```

#### **2. Preloading Critical Resources**

```html
<!-- Preload CSS for above-the-fold components -->
<link rel="preload" href="/dist/styles/uswds-core.css" as="style" />
<link rel="preload" href="/dist/styles/usa-button.css" as="style" />

<!-- Preload JavaScript for critical components -->
<link rel="preload" href="/dist/components/button.js" as="script" />
```

#### **3. Service Worker Caching**

```javascript
// Cache component files aggressively
const CACHE_NAME = 'uswds-components-v2';
const urlsToCache = [
  '/dist/styles/uswds-core.css',
  '/dist/styles/usa-button.css',
  '/dist/styles/usa-table.css',
  '/dist/components/button.js',
  '/dist/components/table.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)));
});
```

---

## 📚 **Additional Resources**

### **Documentation**

- [Performance Guide](./PERFORMANCE_GUIDE.md) - Comprehensive performance documentation
- [API Reference](./API_REFERENCE.md) - Complete API documentation
- [Component Examples](../examples/) - Working examples with performance optimizations

### **Tools**

- [Bundle Analyzer](../scripts/bundle-analyzer.js) - Analyze your bundle size
- [Performance Profiler](../scripts/performance-profiler.js) - Profile component performance
- [Migration Checker](../scripts/migration-checker.js) - Verify migration completeness

### **Support**

- [GitHub Issues](https://github.com/uswds/web-components/issues) - Report migration issues
- [Discussions](https://github.com/uswds/web-components/discussions) - Get help from community
- [Performance FAQ](./PERFORMANCE_FAQ.md) - Common questions and answers

---

**Migration Support**: If you encounter issues during migration, please file an issue with:

1. Your current implementation (before)
2. The migration steps you've taken
3. The specific problem you're experiencing
4. Browser and environment information

**Last Updated**: September 12, 2025  
**Next Review**: October 12, 2025
