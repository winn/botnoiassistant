import { useRef, useEffect, useCallback } from 'react';

interface AccessibilityOptions {
  ariaLabel?: string;
  ariaLive?: 'off' | 'polite' | 'assertive';
  ariaAtomic?: boolean;
  focusOnMount?: boolean;
  trapFocus?: boolean;
}

export function useAccessibility({
  ariaLabel,
  ariaLive = 'polite',
  ariaAtomic = true,
  focusOnMount = false,
  trapFocus = false
}: AccessibilityOptions = {}) {
  const elementRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (focusOnMount && elementRef.current) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      elementRef.current.focus();
    }

    return () => {
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [focusOnMount]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!trapFocus || !elementRef.current) return;

    const focusableElements = elementRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (e.key === 'Tab') {
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
    }
  }, [trapFocus]);

  useEffect(() => {
    const element = elementRef.current;
    if (trapFocus && element) {
      element.addEventListener('keydown', handleKeyDown);
      return () => element.removeEventListener('keydown', handleKeyDown);
    }
  }, [trapFocus, handleKeyDown]);

  return {
    elementRef,
    ariaProps: {
      'aria-label': ariaLabel,
      'aria-live': ariaLive,
      'aria-atomic': ariaAtomic
    }
  };
}