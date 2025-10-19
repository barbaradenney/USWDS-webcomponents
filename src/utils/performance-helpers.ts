/**
 * USWDS Performance Optimization Helpers
 *
 * Provides utilities for optimizing component performance, including
 * lazy loading, debouncing, throttling, and memory management.
 */

export interface USWDSPerformanceConfig {
  debounceDelay?: number;
  throttleDelay?: number;
  intersectionThreshold?: number;
  rootMargin?: string;
  enableLazyLoading?: boolean;
  enableVirtualization?: boolean;
}

export interface USWDSLazyLoadConfig {
  threshold?: number;
  rootMargin?: string;
  onLoad?: (element: Element) => void;
  onError?: (element: Element, error: Error) => void;
}

export interface USWDSVirtualizationConfig {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  onRender?: (startIndex: number, endIndex: number) => void;
}

/**
 * Performance monitoring and optimization utilities
 */
export class USWDSPerformanceManager {
  private static instance?: USWDSPerformanceManager;
  private observers = new Map<string, IntersectionObserver>();
  private timers = new Map<string, number>();
  private performanceMarks = new Map<string, number>();

  static getInstance(): USWDSPerformanceManager {
    if (!this.instance) {
      this.instance = new USWDSPerformanceManager();
    }
    return this.instance;
  }

  /**
   * Create a debounced function that delays execution until after wait milliseconds
   */
  debounce<T extends (...args: any[]) => any>(func: T, wait: number, immediate = false): T {
    let timeoutId: number | undefined;
    const debounced = (...args: Parameters<T>) => {
      const later = () => {
        timeoutId = undefined;
        if (!immediate) func(...args);
      };

      const callNow = immediate && !timeoutId;
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(later, wait);

      if (callNow) func(...args);
    };

    return debounced as T;
  }

  /**
   * Create a throttled function that executes at most once per wait milliseconds
   */
  throttle<T extends (...args: any[]) => any>(func: T, wait: number): T {
    let inThrottle: boolean;
    let lastResult: ReturnType<T>;

    return ((...args: Parameters<T>) => {
      if (!inThrottle) {
        lastResult = func(...args);
        inThrottle = true;
        setTimeout(() => {
          inThrottle = false;
        }, wait);
      }
      return lastResult;
    }) as T;
  }

  /**
   * Create a lazy-loading intersection observer
   */
  createLazyLoader(elements: Element[], config: USWDSLazyLoadConfig = {}): IntersectionObserver {
    const { threshold = 0.1, rootMargin = '50px', onLoad, onError } = config;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target;

            try {
              // Trigger loading behavior
              element.setAttribute('data-loaded', 'true');

              if (onLoad) {
                onLoad(element);
              }

              // Dispatch custom event
              element.dispatchEvent(
                new CustomEvent('lazy-load', {
                  bubbles: true,
                  detail: { element },
                })
              );

              observer.unobserve(element);
            } catch (error) {
              if (onError) {
                onError(element, error as Error);
              }
            }
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    elements.forEach((element) => observer.observe(element));
    return observer;
  }

  /**
   * Optimize DOM updates using requestAnimationFrame batching
   */
  batchDOMUpdates(updates: (() => void)[]): Promise<void> {
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        updates.forEach((update) => {
          try {
            update();
          } catch (error) {
            console.warn('DOM update failed:', error);
          }
        });
        resolve();
      });
    });
  }

  /**
   * Memory-efficient event delegation
   */
  createEventDelegator(
    container: Element,
    eventType: string,
    selector: string,
    handler: (event: Event, target: Element) => void
  ): () => void {
    const delegatedHandler = (event: Event) => {
      const target = (event.target as Element)?.closest(selector);
      if (target && container.contains(target)) {
        handler(event, target);
      }
    };

    container.addEventListener(eventType, delegatedHandler);

    return () => {
      container.removeEventListener(eventType, delegatedHandler);
    };
  }

  /**
   * Performance timing utilities
   */
  startTiming(label: string): void {
    this.performanceMarks.set(label, performance.now());
  }

  endTiming(label: string): number | null {
    const startTime = this.performanceMarks.get(label);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.performanceMarks.delete(label);
      return duration;
    }
    return null;
  }

  /**
   * Monitor component render performance
   */
  measureRender<T extends HTMLElement>(component: T, callback: () => void): Promise<number> {
    return new Promise((resolve) => {
      const label = `render-${component.tagName.toLowerCase()}`;
      this.startTiming(label);

      // Use MutationObserver to detect when DOM changes complete
      const observer = new MutationObserver(() => {
        // Wait for next frame to ensure all updates are complete
        requestAnimationFrame(() => {
          const duration = this.endTiming(label);
          observer.disconnect();
          resolve(duration || 0);
        });
      });

      observer.observe(component, {
        childList: true,
        subtree: true,
        attributes: true,
      });

      callback();
    });
  }

  /**
   * Clean up all performance monitoring resources
   */
  cleanup(): void {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers.clear();

    this.timers.forEach((timerId) => clearTimeout(timerId));
    this.timers.clear();

    this.performanceMarks.clear();
  }
}

/**
 * Virtual scrolling implementation for large lists
 */
export class USWDSVirtualScroller {
  private container: HTMLElement;
  private config: USWDSVirtualizationConfig;
  private visibleRange = { start: 0, end: 0 };
  private totalItems = 0;

  constructor(container: HTMLElement, config: USWDSVirtualizationConfig) {
    this.container = container;
    this.config = { overscan: 5, ...config };
    this.setupVirtualization();
  }

  private setupVirtualization(): void {
    this.container.style.overflowY = 'auto';
    this.container.style.height = `${this.config.containerHeight}px`;

    this.container.addEventListener('scroll', this.handleScroll.bind(this));
  }

  private handleScroll = USWDSPerformanceManager.getInstance().throttle(() => {
    this.updateVisibleRange();
  }, 16); // ~60fps

  private updateVisibleRange(): void {
    const scrollTop = this.container.scrollTop;
    const { itemHeight, overscan = 5 } = this.config;

    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleItems = Math.ceil(this.config.containerHeight / itemHeight);
    const endIndex = Math.min(this.totalItems - 1, startIndex + visibleItems + overscan * 2);

    if (startIndex !== this.visibleRange.start || endIndex !== this.visibleRange.end) {
      this.visibleRange = { start: startIndex, end: endIndex };

      if (this.config.onRender) {
        this.config.onRender(startIndex, endIndex);
      }

      this.renderVisibleItems();
    }
  }

  private renderVisibleItems(): void {
    const { start, end } = this.visibleRange;
    const { itemHeight } = this.config;

    // Clear existing content
    this.container.innerHTML = '';

    // Create spacer for items before visible range
    if (start > 0) {
      const spacer = document.createElement('div');
      spacer.style.height = `${start * itemHeight}px`;
      this.container.appendChild(spacer);
    }

    // Dispatch event for rendering visible items
    this.container.dispatchEvent(
      new CustomEvent('virtual-render', {
        detail: { startIndex: start, endIndex: end },
      })
    );

    // Create spacer for items after visible range
    if (end < this.totalItems - 1) {
      const spacer = document.createElement('div');
      spacer.style.height = `${(this.totalItems - end - 1) * itemHeight}px`;
      this.container.appendChild(spacer);
    }
  }

  setTotalItems(count: number): void {
    this.totalItems = count;
    this.updateVisibleRange();
  }

  scrollToIndex(index: number): void {
    const scrollTop = index * this.config.itemHeight;
    this.container.scrollTop = scrollTop;
    this.updateVisibleRange();
  }

  destroy(): void {
    this.container.removeEventListener('scroll', this.handleScroll);
  }
}

/**
 * Resource preloading utilities
 */
export class USWDSResourcePreloader {
  private static loadedResources = new Set<string>();
  private static loadingResources = new Map<string, Promise<void>>();

  /**
   * Preload CSS resources
   */
  static preloadCSS(href: string): Promise<void> {
    if (this.loadedResources.has(href)) {
      return Promise.resolve();
    }

    if (this.loadingResources.has(href)) {
      return this.loadingResources.get(href)!;
    }

    const promise = new Promise<void>((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = href;

      link.onload = () => {
        this.loadedResources.add(href);
        this.loadingResources.delete(href);
        resolve();
      };

      link.onerror = () => {
        this.loadingResources.delete(href);
        reject(new Error(`Failed to preload CSS: ${href}`));
      };

      document.head.appendChild(link);
    });

    this.loadingResources.set(href, promise);
    return promise;
  }

  /**
   * Preload JavaScript modules
   */
  static preloadModule(src: string): Promise<void> {
    if (this.loadedResources.has(src)) {
      return Promise.resolve();
    }

    if (this.loadingResources.has(src)) {
      return this.loadingResources.get(src)!;
    }

    const promise = new Promise<void>((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'modulepreload';
      link.href = src;

      link.onload = () => {
        this.loadedResources.add(src);
        this.loadingResources.delete(src);
        resolve();
      };

      link.onerror = () => {
        this.loadingResources.delete(src);
        reject(new Error(`Failed to preload module: ${src}`));
      };

      document.head.appendChild(link);
    });

    this.loadingResources.set(src, promise);
    return promise;
  }
}

/**
 * Component lifecycle optimization helpers
 */
export class USWDSLifecycleOptimizer {
  /**
   * Optimize component updates by comparing property changes
   */
  static shouldUpdate<T>(
    changedProperties: Map<string, any>,
    significantProps: (keyof T)[]
  ): boolean {
    return significantProps.some((prop) => changedProperties.has(prop as string));
  }

  /**
   * Batch multiple property updates
   */
  static batchPropertyUpdates<T extends HTMLElement>(
    element: T,
    updates: Partial<T>
  ): Promise<void> {
    return new Promise((resolve) => {
      // Apply all updates synchronously
      Object.entries(updates).forEach(([key, value]) => {
        (element as any)[key] = value;
      });

      // Wait for next frame for updates to complete
      requestAnimationFrame(() => resolve());
    });
  }

  /**
   * Create a memory-efficient resize observer
   */
  static createResizeObserver(
    callback: (entries: ResizeObserverEntry[]) => void,
    debounceMs = 100
  ): ResizeObserver {
    const debouncedCallback = USWDSPerformanceManager.getInstance().debounce(callback, debounceMs);

    return new ResizeObserver(debouncedCallback);
  }
}

/**
 * Memoization utility for expensive computations
 */
export class USWDSMemoization {
  private static caches = new Map<string, Map<string, any>>();

  /**
   * Create a memoized version of a function
   */
  static memoize<TArgs extends any[], TReturn>(
    fn: (...args: TArgs) => TReturn,
    keyFn?: (...args: TArgs) => string,
    cacheKey = 'default'
  ): (...args: TArgs) => TReturn {
    if (!this.caches.has(cacheKey)) {
      this.caches.set(cacheKey, new Map());
    }

    const cache = this.caches.get(cacheKey)!;

    return (...args: TArgs): TReturn => {
      const key = keyFn ? keyFn(...args) : JSON.stringify(args);

      if (cache.has(key)) {
        return cache.get(key);
      }

      const result = fn(...args);
      cache.set(key, result);

      return result;
    };
  }

  /**
   * Memoize sorting operations
   */
  static memoizeSort<T>(
    data: T[],
    sortKey: string,
    direction: 'asc' | 'desc' = 'asc',
    sortType: 'text' | 'number' | 'date' = 'text'
  ): T[] {
    const cacheKey = `sort-${sortKey}-${direction}-${sortType}`;
    const dataKey = JSON.stringify(data.map((item) => (item as any)[sortKey]));

    if (!this.caches.has(cacheKey)) {
      this.caches.set(cacheKey, new Map());
    }

    const cache = this.caches.get(cacheKey)!;

    if (cache.has(dataKey)) {
      return cache.get(dataKey);
    }

    const sortedData = [...data].sort((a, b) => {
      let aVal = (a as any)[sortKey];
      let bVal = (b as any)[sortKey];

      // Convert values based on sort type
      switch (sortType) {
        case 'number':
          aVal = parseFloat(String(aVal)) || 0;
          bVal = parseFloat(String(bVal)) || 0;
          break;
        case 'date':
          aVal = new Date(aVal).getTime();
          bVal = new Date(bVal).getTime();
          break;
        default:
          aVal = String(aVal).toLowerCase();
          bVal = String(bVal).toLowerCase();
      }

      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    cache.set(dataKey, sortedData);
    return sortedData;
  }

  /**
   * Memoize filtering operations
   */
  static memoizeFilter<T>(data: T[], filterFn: (item: T) => boolean, filterKey = 'default'): T[] {
    const cacheKey = `filter-${filterKey}`;
    const dataKey = JSON.stringify(data);

    if (!this.caches.has(cacheKey)) {
      this.caches.set(cacheKey, new Map());
    }

    const cache = this.caches.get(cacheKey)!;

    if (cache.has(dataKey)) {
      return cache.get(dataKey);
    }

    const filteredData = data.filter(filterFn);
    cache.set(dataKey, filteredData);

    return filteredData;
  }

  /**
   * Memoize DOM calculations
   */
  static memoizeCalculation<T>(
    calculationFn: () => T,
    dependencies: any[],
    cacheKey = 'calculation'
  ): T {
    if (!this.caches.has(cacheKey)) {
      this.caches.set(cacheKey, new Map());
    }

    const cache = this.caches.get(cacheKey)!;
    const depKey = JSON.stringify(dependencies);

    if (cache.has(depKey)) {
      return cache.get(depKey);
    }

    const result = calculationFn();
    cache.set(depKey, result);

    return result;
  }

  /**
   * Clear specific cache
   */
  static clearCache(cacheKey?: string): void {
    if (cacheKey) {
      this.caches.delete(cacheKey);
    } else {
      this.caches.clear();
    }
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): Record<string, number> {
    const stats: Record<string, number> = {};

    this.caches.forEach((cache, key) => {
      stats[key] = cache.size;
    });

    return stats;
  }
}

/**
 * Component-specific memoization decorator
 */
export function memoizeMethod<T extends any[]>(keyFn?: (...args: T) => string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const cacheKey = `${target.constructor.name}-${propertyName}`;

    descriptor.value = USWDSMemoization.memoize(originalMethod, keyFn, cacheKey);

    return descriptor;
  };
}

/**
 * Helper to add performance optimizations to components
 */
export function addPerformanceFeatures(
  element: HTMLElement,
  config: USWDSPerformanceConfig = {}
): void {
  const { enableLazyLoading = false, enableVirtualization = false } = config;

  if (enableLazyLoading) {
    // Mark component for lazy initialization
    element.setAttribute('data-lazy', 'true');

    // Defer initialization until component is in viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            element.setAttribute('data-lazy-loaded', 'true');
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(element);
  }

  if (enableVirtualization) {
    // Add virtual scrolling capabilities if component contains lists
    const scrollableElements = element.querySelectorAll('[data-virtualize]');

    scrollableElements.forEach((scrollable) => {
      if (scrollable instanceof HTMLElement) {
        new USWDSVirtualScroller(scrollable, {
          itemHeight: parseInt(scrollable.dataset.itemHeight || '40'),
          containerHeight: parseInt(scrollable.dataset.containerHeight || '300'),
        });
      }
    });
  }
}
