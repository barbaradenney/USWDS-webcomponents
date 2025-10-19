/**
 * Dynamic CSS loader for USWDS components
 * Loads component CSS on-demand
 */

const loadedStyles = new Set<string>();

export function loadComponentStyles(componentName: string): Promise<void> {
  if (loadedStyles.has(componentName)) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `/dist/styles/usa-${componentName}.css`;

    link.onload = () => {
      loadedStyles.add(componentName);
      resolve();
    };

    link.onerror = () => {
      reject(new Error(`Failed to load styles for ${componentName}`));
    };

    document.head.appendChild(link);
  });
}

// Auto-load styles when component is used
export function autoLoadStyles(componentName: string): void {
  if (typeof window !== 'undefined' && !loadedStyles.has(componentName)) {
    loadComponentStyles(componentName).catch(console.warn);
  }
}

// Preload core styles
if (typeof window !== 'undefined') {
  loadComponentStyles('core').catch(() => {
    // Core styles might be bundled differently
  });
}
