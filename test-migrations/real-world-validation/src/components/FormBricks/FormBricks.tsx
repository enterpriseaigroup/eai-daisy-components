/**
 * FormBricks - Configurator V2 Component
 *
 * Component FormBricks from formBricks.tsx
 *
 * @migrated from DAISY v1
 */

// app/formBricks.tsx
'use client';

import { useEffect } from 'react';
import formbricks from "@formbricks/js";
import { useProfileStore } from './(presentation)/store/useProfileStore';

  /**
   * BUSINESS LOGIC: FormBricks
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements FormBricks logic
   * 2. Calls helper functions: useProfileStore, useEffect, console.log, console.log, console.log, setFormBricksInitialized, formbricks.setup, setInterval, document.getElementById, console.warn, setFormBricksInitialized, clearInterval, console.log, setFormBricksInitialized, clearInterval, console.error, setFormBricksInitialized
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - useProfileStore() - Function call
   * - useEffect() - Function call
   * - console.log() - Function call
   * - console.log() - Function call
   * - console.log() - Function call
   * - setFormBricksInitialized() - Function call
   * - formbricks.setup() - Function call
   * - setInterval() - Function call
   * - document.getElementById() - Function call
   * - console.warn() - Function call
   * - setFormBricksInitialized() - Function call
   * - clearInterval() - Function call
   * - console.log() - Function call
   * - setFormBricksInitialized() - Function call
   * - clearInterval() - Function call
   * - console.error() - Function call
   * - setFormBricksInitialized() - Function call
   *
   * WHY IT CALLS THEM:
   * - useProfileStore: Required functionality
   * - useEffect: Required functionality
   * - console.log: Debugging output
   * - console.log: Debugging output
   * - console.log: Debugging output
   * - setFormBricksInitialized: State update
   * - formbricks.setup: State update
   * - setInterval: State update
   * - document.getElementById: Required functionality
   * - console.warn: Warning notification
   * - setFormBricksInitialized: State update
   * - clearInterval: Required functionality
   * - console.log: Debugging output
   * - setFormBricksInitialized: State update
   * - clearInterval: Required functionality
   * - console.error: Error logging
   * - setFormBricksInitialized: State update
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls useProfileStore, useEffect, console.log to process data
   * Output: Computed value or side effect
   *
   */
export default function FormBricks() {
    const setFormBricksInitialized = useProfileStore((state) => state.setFormBricksInitialized);
      /**
       * BUSINESS LOGIC: Side Effect
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Monitors setFormBricksInitialized for changes
       * 2. Executes console.log, console.log, console.log, setFormBricksInitialized, formbricks.setup, setInterval, document.getElementById, console.warn, setFormBricksInitialized, clearInterval, console.log, setFormBricksInitialized, clearInterval, console.error, setFormBricksInitialized functions
       * 3. Runs side effect logic
       *
       * WHAT IT CALLS:
       * - console.log() - Function call
       * - console.log() - Function call
       * - console.log() - Function call
       * - setFormBricksInitialized() - Function call
       * - formbricks.setup() - Function call
       * - setInterval() - Function call
       * - document.getElementById() - Function call
       * - console.warn() - Function call
       * - setFormBricksInitialized() - Function call
       * - clearInterval() - Function call
       * - console.log() - Function call
       * - setFormBricksInitialized() - Function call
       * - clearInterval() - Function call
       * - console.error() - Function call
       * - setFormBricksInitialized() - Function call
       *
       * WHY IT CALLS THEM:
       * - console.log: Debugging output
       * - console.log: Debugging output
       * - console.log: Debugging output
       * - setFormBricksInitialized: State update
       * - formbricks.setup: State update
       * - setInterval: State update
       * - document.getElementById: Required functionality
       * - console.warn: Warning notification
       * - setFormBricksInitialized: State update
       * - clearInterval: Required functionality
       * - console.log: Debugging output
       * - setFormBricksInitialized: State update
       * - clearInterval: Required functionality
       * - console.error: Error logging
       * - setFormBricksInitialized: State update
       *
       * DATA FLOW:
       * Input: setFormBricksInitialized state/props
       * Processing: Calls console.log, console.log, console.log to process data
       * Output: Side effects executed, cleanup registered
       *
       * DEPENDENCIES:
       * - setFormBricksInitialized: Triggers when setFormBricksInitialized changes
       *
       */
    useEffect(() => {
        const url = process.env.NEXT_PUBLIC_FORMBRICKS_URL;
        const envId = process.env.NEXT_PUBLIC_FORMBRICKS_ENV_ID;
        // Only initialize if we have both URL and Environment ID configured
        if (typeof window !== 'undefined' && url && envId) {
            try {
                formbricks.setup({
                    environmentId: envId,
                    appUrl: url,
                });
                // ✅ Robust DOM presence check with polling
                let attempt = 0;
                const maxAttempts = 10;
                const interval = setInterval(() => {
                    const container = document.getElementById('formbricks-app-container');
                    const isPopulated = container && container.children.length > 0;
                    if (isPopulated) {
                        console.log('FormBricks container rendered.');
                        setFormBricksInitialized(true);
                        clearInterval(interval);
                    } else if (++attempt >= maxAttempts) {
                        console.warn('FormBricks container not populated after retries.');
                        setFormBricksInitialized(false);
                        clearInterval(interval);
                    }
                }, 300); // retry every 300ms
            } catch (error) {
                console.error('Failed to initialize FormBricks:', error);
                setFormBricksInitialized(false);
            }
        } else {
            console.log('FormBricks skipped: Missing URL, Environment ID, or not in browser environment');
            if (!url) console.log('NEXT_PUBLIC_FORMBRICKS_URL not configured');
            if (!envId) console.log('NEXT_PUBLIC_FORMBRICKS_ENV_ID not configured');
            setFormBricksInitialized(false);
        }
    }, [setFormBricksInitialized]);
    return null;
}