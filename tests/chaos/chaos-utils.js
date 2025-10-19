
// Chaos Engineering Utilities
export const ChaosUtils = {
  injectNetworkDelay: (delay = 1000) => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      await new Promise(resolve => setTimeout(resolve, delay));
      return originalFetch(...args);
    };
  },

  injectMemoryPressure: (iterations = 1000) => {
    const memoryHog = [];
    for (let i = 0; i < iterations; i++) {
      memoryHog.push(new Array(10000).fill('chaos-test-data'));
    }
    return memoryHog;
  },

  injectDOMCorruption: (element) => {
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
  },

  injectEventDisruption: (element, eventType) => {
    const listeners = element.cloneNode(true);
    element.parentNode.replaceChild(listeners, element);
  }
};
    