/**
 * useProfile - Configurator V2 Component
 *
 * Component useProfile from useProfile.tsx
 *
 * @migrated from DAISY v1
 */

'use client';

import { useContext } from "react";
import { ProfileContextProps, ProfileContext } from "./ProfileContext";


  /**
   * BUSINESS LOGIC: useProfile
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements useProfile logic
   * 2. Calls helper functions: useContext
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - useContext() - Function call
   *
   * WHY IT CALLS THEM:
   * - useContext: Required functionality
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls useContext to process data
   * Output: Computed value or side effect
   *
   */
export const useProfile = (): ProfileContextProps => {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error("useProfile must be used within a ProfileProvider");
    }
    return context;
};
