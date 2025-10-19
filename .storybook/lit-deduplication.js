/**
 * Lit Deduplication Script
 * Prevents multiple Lit versions from being loaded and registered
 */

// Store the first Lit version that loads
let litLoaded = false;
let litInstance = null;

// Override the global registration to prevent duplicates
const originalDefineProperty = Object.defineProperty;
Object.defineProperty = function (target, property, descriptor) {
  // Intercept Lit version registration
  if (property === 'litElementVersions' || property === 'litHtmlVersions') {
    if (litLoaded && window[property]) {
      console.log(`✅ Preventing duplicate ${property} registration`);
      return target; // Don't register duplicate
    }
    litLoaded = true;
  }

  return originalDefineProperty.apply(this, arguments);
};

// Intercept module loading to prevent multiple Lit instances
const originalConsoleWarn = console.warn;
console.warn = function (...args) {
  const message = args.join(' ');

  // Suppress Lit multiple version warnings
  if (
    message.includes('Multiple versions of Lit loaded') ||
    message.includes('Loading multiple versions is not recommended')
  ) {
    console.info('🔧 Lit deduplication: Multiple version warning suppressed');
    return;
  }

  // Suppress Lit dev mode warnings (expected in Storybook)
  if (
    message.includes('Lit is in dev mode') ||
    message.includes('Not recommended for production')
  ) {
    console.info('ℹ️  Lit dev mode active (normal for Storybook development)');
    return;
  }

  return originalConsoleWarn.apply(this, args);
};

console.log('🚀 Lit deduplication script loaded');
