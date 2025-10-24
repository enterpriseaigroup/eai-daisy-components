/**
 * useClickOutside - Configurator V2 Component
 *
 * Component useClickOutside from useClickOutside.ts
 *
 * @migrated from DAISY v1
 */

// hooks/useClickOutside.ts
import { useEffect } from 'react';

type Handler = () => void;

  /**
   * BUSINESS LOGIC: useClickOutside
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements useClickOutside logic
   * 2. Calls helper functions: useEffect, el.contains, handler, document.addEventListener, document.addEventListener, document.removeEventListener, document.removeEventListener
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - useEffect() - Function call
   * - el.contains() - Function call
   * - handler() - Function call
   * - document.addEventListener() - Function call
   * - document.addEventListener() - Function call
   * - document.removeEventListener() - Function call
   * - document.removeEventListener() - Function call
   *
   * WHY IT CALLS THEM:
   * - useEffect: Required functionality
   * - el.contains: Required functionality
   * - handler: Required functionality
   * - document.addEventListener: Required functionality
   * - document.addEventListener: Required functionality
   * - document.removeEventListener: Required functionality
   * - document.removeEventListener: Required functionality
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls useEffect, el.contains, handler to process data
   * Output: Computed value or side effect
   *
   */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  ref: React.RefObject<T>,
  handler: Handler
) {
    /**
     * BUSINESS LOGIC: Side Effect
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Monitors ref, handler for changes
     * 2. Executes el.contains, handler, document.addEventListener, document.addEventListener, document.removeEventListener, document.removeEventListener functions
     * 3. Runs side effect logic
     *
     * WHAT IT CALLS:
     * - el.contains() - Function call
     * - handler() - Function call
     * - document.addEventListener() - Function call
     * - document.addEventListener() - Function call
     * - document.removeEventListener() - Function call
     * - document.removeEventListener() - Function call
     *
     * WHY IT CALLS THEM:
     * - el.contains: Required functionality
     * - handler: Required functionality
     * - document.addEventListener: Required functionality
     * - document.addEventListener: Required functionality
     * - document.removeEventListener: Required functionality
     * - document.removeEventListener: Required functionality
     *
     * DATA FLOW:
     * Input: ref, handler state/props
     * Processing: Calls el.contains, handler, document.addEventListener to process data
     * Output: Side effects executed, cleanup registered
     *
     * DEPENDENCIES:
     * - ref: Triggers when ref changes
     * - handler: Triggers when handler changes
     *
     */
  useEffect(() => {
      /**
       * BUSINESS LOGIC: listener
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Implements listener logic
       * 2. Calls helper functions: el.contains, handler
       * 3. Returns computed result
       *
       * WHAT IT CALLS:
       * - el.contains() - Function call
       * - handler() - Function call
       *
       * WHY IT CALLS THEM:
       * - el.contains: Required functionality
       * - handler: Required functionality
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Calls el.contains, handler to process data
       * Output: Computed value or side effect
       *
       */
    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref?.current;
      if (!el || el.contains(event.target as Node)) return;
      handler(); // Click is outside the ref element
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}