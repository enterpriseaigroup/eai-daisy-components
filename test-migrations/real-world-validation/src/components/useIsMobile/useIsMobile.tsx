/**
 * useIsMobile - Configurator V2 Component
 *
 * Component useIsMobile from useIsMobile.ts
 *
 * @migrated from DAISY v1
 */

// hooks/useIsMobile.ts
'use client';

import { useState, useEffect } from 'react';

/**
 * Detects if the screen width is smaller than Tailwind's xl breakpoint (1280px)
 * Uses matchMedia to track layout changes even during zoom.
 */
  /**
   * BUSINESS LOGIC: useIsMobile
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements useIsMobile logic
   * 2. Calls helper functions: useState, window.matchMedia, useEffect, window.matchMedia, setIsMobile, setIsMobile, mediaQuery.addEventListener, mediaQuery.removeEventListener
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - useState() - Function call
   * - window.matchMedia() - Function call
   * - useEffect() - Function call
   * - window.matchMedia() - Function call
   * - setIsMobile() - Function call
   * - setIsMobile() - Function call
   * - mediaQuery.addEventListener() - Function call
   * - mediaQuery.removeEventListener() - Function call
   *
   * WHY IT CALLS THEM:
   * - useState: Required functionality
   * - window.matchMedia: Required functionality
   * - useEffect: Required functionality
   * - window.matchMedia: Required functionality
   * - setIsMobile: State update
   * - setIsMobile: State update
   * - mediaQuery.addEventListener: Required functionality
   * - mediaQuery.removeEventListener: Required functionality
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls useState, window.matchMedia, useEffect to process data
   * Output: Computed value or side effect
   *
   */
export function useIsMobile(): boolean {
    const [isMobile, setIsMobile] = useState(() =>
        typeof window !== 'undefined' ? !window.matchMedia('(min-width: 1280px)').matches : false
    );
      /**
       * BUSINESS LOGIC: Side Effect
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Executes window.matchMedia, setIsMobile, setIsMobile, mediaQuery.addEventListener, mediaQuery.removeEventListener functions
       * 2. Runs side effect logic
       *
       * WHAT IT CALLS:
       * - window.matchMedia() - Function call
       * - setIsMobile() - Function call
       * - setIsMobile() - Function call
       * - mediaQuery.addEventListener() - Function call
       * - mediaQuery.removeEventListener() - Function call
       *
       * WHY IT CALLS THEM:
       * - window.matchMedia: Required functionality
       * - setIsMobile: State update
       * - setIsMobile: State update
       * - mediaQuery.addEventListener: Required functionality
       * - mediaQuery.removeEventListener: Required functionality
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Calls window.matchMedia, setIsMobile, setIsMobile to process data
       * Output: Side effects executed, cleanup registered
       *
       * SPECIAL BEHAVIOR:
       * - Runs only on component mount
       *
       */
    useEffect(() => {
        const mediaQuery = window.matchMedia('(min-width: 1280px)');
          /**
           * BUSINESS LOGIC: handleChange
           *
           * WHY THIS EXISTS:
           * - Implements business logic requirement
           *
           * WHAT IT DOES:
           * 1. Implements handleChange logic
           * 2. Calls helper functions: setIsMobile
           * 3. Returns computed result
           *
           * WHAT IT CALLS:
           * - setIsMobile() - Function call
           *
           * WHY IT CALLS THEM:
           * - setIsMobile: State update
           *
           * DATA FLOW:
           * Input: Component state and props
           * Processing: Calls setIsMobile to process data
           * Output: Computed value or side effect
           *
           */
        const handleChange = (e: MediaQueryListEvent) => {
            setIsMobile(!e.matches);
        };
        // Set initial value
        setIsMobile(!mediaQuery.matches);
        // Listen for changes
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);
    return isMobile;
}