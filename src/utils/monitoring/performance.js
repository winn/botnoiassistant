export class PerformanceMonitor {
  static measures = new Map();

  static startMeasure(name) {
    if (typeof performance === 'undefined') return;
    
    performance.mark(`${name}-start`);
  }

  static endMeasure(name) {
    if (typeof performance === 'undefined') return;

    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);

    const entries = performance.getEntriesByName(name);
    const duration = entries[entries.length - 1].duration;
    
    this.measures.set(name, duration);
    return duration;
  }

  static getMetrics() {
    return {
      measures: Object.fromEntries(this.measures),
      memory: this.getMemoryUsage(),
      navigation: this.getNavigationTiming(),
      resources: this.getResourceTiming()
    };
  }

  static getMemoryUsage() {
    if (!performance?.memory) return null;
    
    return {
      jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
      totalJSHeapSize: performance.memory.totalJSHeapSize,
      usedJSHeapSize: performance.memory.usedJSHeapSize
    };
  }

  static getNavigationTiming() {
    if (typeof performance === 'undefined') return null;

    const timing = performance.getEntriesByType('navigation')[0];
    if (!timing) return null;

    return {
      dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
      tcpConnection: timing.connectEnd - timing.connectStart,
      serverResponse: timing.responseEnd - timing.requestStart,
      domLoad: timing.domContentLoadedEventEnd - timing.responseEnd,
      fullPageLoad: timing.loadEventEnd - timing.navigationStart
    };
  }

  static getResourceTiming() {
    if (typeof performance === 'undefined') return null;

    return performance.getEntriesByType('resource').map(entry => ({
      name: entry.name,
      type: entry.initiatorType,
      duration: entry.duration,
      size: entry.transferSize
    }));
  }

  static clearMeasures() {
    if (typeof performance === 'undefined') return;
    
    performance.clearMarks();
    performance.clearMeasures();
    this.measures.clear();
  }
}