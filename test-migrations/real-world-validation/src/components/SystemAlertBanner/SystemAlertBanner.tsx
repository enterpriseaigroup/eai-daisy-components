/**
 * SystemAlertBanner - Configurator V2 Component
 *
 * Component SystemAlertBanner from SystemAlertBanner.tsx
 *
 * @migrated from DAISY v1
 */

"use client";
import React, { useEffect, useState } from "react";
import { useGetAlert } from '../hooks/useGetAlert';
import { getValidAccessToken } from "./chatbot/utils/auth";
import { useResolvedCouncil } from "./chatbot/hooks/useResolvedCouncil";

  /**
   * BUSINESS LOGIC: SystemAlertBanner
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements SystemAlertBanner logic
   * 2. Calls helper functions: useResolvedCouncil, useState, useEffect, getValidAccessToken, setToken, fetchToken, useGetAlert, Array.isArray, console.warn
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - useResolvedCouncil() - Function call
   * - useState() - Function call
   * - useEffect() - Function call
   * - getValidAccessToken() - Function call
   * - setToken() - Function call
   * - fetchToken() - Function call
   * - useGetAlert() - Function call
   * - Array.isArray() - Function call
   * - console.warn() - Function call
   *
   * WHY IT CALLS THEM:
   * - useResolvedCouncil: Required functionality
   * - useState: Required functionality
   * - useEffect: Required functionality
   * - getValidAccessToken: Required functionality
   * - setToken: State update
   * - fetchToken: Data fetching
   * - useGetAlert: Required functionality
   * - Array.isArray: Required functionality
   * - console.warn: Warning notification
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls useResolvedCouncil, useState, useEffect to process data
   * Output: Computed value or side effect
   *
   */
const SystemAlertBanner = () => {
    const council = useResolvedCouncil();
    const [token, setToken] = useState<string | null>(null);

      /**
       * BUSINESS LOGIC: Side Effect
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Monitors council for changes
       * 2. Executes getValidAccessToken, setToken, fetchToken functions
       * 3. Runs side effect logic
       *
       * WHAT IT CALLS:
       * - getValidAccessToken() - Function call
       * - setToken() - Function call
       * - fetchToken() - Function call
       *
       * WHY IT CALLS THEM:
       * - getValidAccessToken: Required functionality
       * - setToken: State update
       * - fetchToken: Data fetching
       *
       * DATA FLOW:
       * Input: council state/props
       * Processing: Calls getValidAccessToken, setToken, fetchToken to process data
       * Output: Side effects executed, cleanup registered
       *
       * DEPENDENCIES:
       * - council: Triggers when council changes
       *
       */
    useEffect(() => {
          /**
           * BUSINESS LOGIC: fetchToken
           *
           * WHY THIS EXISTS:
           * - Implements business logic requirement
           *
           * WHAT IT DOES:
           * 1. Implements fetchToken logic
           * 2. Calls helper functions: getValidAccessToken, setToken
           * 3. Returns computed result
           *
           * WHAT IT CALLS:
           * - getValidAccessToken() - Function call
           * - setToken() - Function call
           *
           * WHY IT CALLS THEM:
           * - getValidAccessToken: Required functionality
           * - setToken: State update
           *
           * DATA FLOW:
           * Input: Component state and props
           * Processing: Calls getValidAccessToken, setToken to process data
           * Output: Computed value or side effect
           *
           */
        const fetchToken = async () => {
            const validToken = await getValidAccessToken(council);
            setToken(validToken);
        };
        fetchToken();
    }, [council]);

    const { data: alerts, isLoading } = useGetAlert(token || "");

    // If alerts: [], there is no downtime, so we don't show the banner
    if (isLoading || !Array.isArray(alerts) || alerts.length === 0) return null;

    console.warn("[System Alert Banner]:", alerts, "Token:", token);

    return (
        <div className="w-full py-2 px-4 bg-[#fef3c7] border-b z-50">
            <div className="w-full text-sm font-medium text-[#92400e] text-center leading-relaxed">
                System downtime alert: Some features and services may be temporarily unavailable. We’re working to restore full functionality as soon as possible.
            </div>
        </div>
    );
};

export default SystemAlertBanner;