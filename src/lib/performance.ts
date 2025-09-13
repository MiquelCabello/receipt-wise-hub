// Performance utilities and monitoring

// Critical rendering path optimization
export const preloadCriticalResources = () => {
  // Preload critical fonts
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = '/fonts/inter.woff2';
  link.as = 'font';
  link.type = 'font/woff2';
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
};

// Measure and report Core Web Vitals
export const measureWebVitals = () => {
  if ('web-vital' in window || typeof window === 'undefined') return;

  // FCP - First Contentful Paint
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry) => {
      console.log(`${entry.name}: ${entry.startTime}ms`);
    });
  });

  observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });

  // CLS - Cumulative Layout Shift
  let cumulativeLayoutShiftScore = 0;
  const clsObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!(entry as any).hadRecentInput) {
        cumulativeLayoutShiftScore += (entry as any).value;
      }
    }
    console.log('CLS Score:', cumulativeLayoutShiftScore);
  });

  try {
    clsObserver.observe({ type: 'layout-shift', buffered: true });
  } catch (e) {
    // Layout shift API not supported
  }
};

// Image loading optimization
export const lazyLoadImages = () => {
  const images = document.querySelectorAll('img[data-src]');
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        img.src = img.dataset.src!;
        img.classList.remove('lazy');
        imageObserver.unobserve(img);
      }
    });
  });

  images.forEach(img => imageObserver.observe(img));
};

// Bundle size monitoring
export const reportBundleSize = () => {
  if ('navigator' in window && 'connection' in navigator) {
    const connection = (navigator as any).connection;
    console.log('Network Info:', {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    });
  }
};

// Memory usage monitoring
export const monitorMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    console.log('Memory Usage:', {
      used: `${Math.round(memory.usedJSHeapSize / 1048576)} MB`,
      total: `${Math.round(memory.totalJSHeapSize / 1048576)} MB`,
      limit: `${Math.round(memory.jsHeapSizeLimit / 1048576)} MB`
    });
  }
};

// Initialize performance monitoring
export const initPerformanceMonitoring = () => {
  if (typeof window === 'undefined') return;

  preloadCriticalResources();
  measureWebVitals();
  
  // Run after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      lazyLoadImages();
      reportBundleSize();
      monitorMemoryUsage();
    }, 0);
  });
};