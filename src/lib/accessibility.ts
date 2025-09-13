// Accessibility utilities and helpers

export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.setAttribute('class', 'sr-only');
  
  document.body.appendChild(announcement);
  
  // Add message after element is in DOM
  setTimeout(() => {
    announcement.textContent = message;
  }, 100);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 3000);
};

export const trapFocus = (element: HTMLElement) => {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  ) as NodeListOf<HTMLElement>;
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };
  
  element.addEventListener('keydown', handleTabKey);
  firstElement?.focus();
  
  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
};

export const getAccessibleLabel = (element: HTMLElement): string => {
  return (
    element.getAttribute('aria-label') ||
    element.getAttribute('aria-labelledby') ||
    element.textContent ||
    element.getAttribute('title') ||
    'No accessible label found'
  );
};

export const checkColorContrast = (foreground: string, background: string): number => {
  // Simplified contrast calculation
  // In production, use a proper color contrast library
  const getLuminance = (color: string): number => {
    // This is a simplified calculation
    // Real implementation would parse hex, rgb, hsl colors properly
    return 0.5; // Placeholder
  };
  
  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
};

// Keyboard navigation helpers
export const addKeyboardNavigation = (container: HTMLElement, onActivate?: (element: HTMLElement) => void) => {
  const items = container.querySelectorAll('[role="menuitem"], [role="option"], button') as NodeListOf<HTMLElement>;
  let currentIndex = 0;
  
  const updateFocus = () => {
    items.forEach((item, index) => {
      item.setAttribute('tabindex', index === currentIndex ? '0' : '-1');
    });
    items[currentIndex]?.focus();
  };
  
  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        currentIndex = (currentIndex + 1) % items.length;
        updateFocus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        currentIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
        updateFocus();
        break;
      case 'Home':
        e.preventDefault();
        currentIndex = 0;
        updateFocus();
        break;
      case 'End':
        e.preventDefault();
        currentIndex = items.length - 1;
        updateFocus();
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        onActivate?.(items[currentIndex]);
        break;
    }
  };
  
  container.addEventListener('keydown', handleKeyDown);
  updateFocus();
  
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
};