/**
 * useDataverse - Configurator V2 Component
 *
 * Component useDataverse from DataverseProvider.tsx
 *
 * @migrated from DAISY v1
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { PublicClientApplication, Configuration, AuthenticationResult } from "@azure/msal-browser";

// MSAL configuration
const msalConfig: Configuration = {
  auth: {
    clientId: "65d53938-6336-478a-aa13-6ee64ba1771c", // Your Azure AD App's Client ID
    authority: "https://login.microsoftonline.com/6a5ef618-53d3-4f7a-8f20-cbf7d8b6aedc", // Tenant ID
    redirectUri: "http://localhost:5180", // Must match Redirect URI in Azure Portal
  },
};

// Initialize MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);

// Context and Provider
interface DataverseContextProps {
  token: string | null;
  loading: boolean;
  error: string | null;
  getToken: () => Promise<void>; // Expose function to refresh the token if needed
}

const DataverseContext = createContext<DataverseContextProps | undefined>(undefined);

  /**
   * BUSINESS LOGIC: DataverseProvider
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements DataverseProvider logic
   * 2. Calls helper functions: useState, useState, useState, useCallback, setLoading, setError, console.log, msalInstance.initialize, msalInstance.getAllAccounts, console.log, console.log, msalInstance.loginRedirect, console.log, console.log, msalInstance.acquireTokenSilent, msalInstance.getAllAccounts, console.log, setToken, setLoading, console.error, setError, useEffect, getToken
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - useState() - Function call
   * - useState() - Function call
   * - useState() - Function call
   * - useCallback() - Function call
   * - setLoading() - Function call
   * - setError() - Function call
   * - console.log() - Function call
   * - msalInstance.initialize() - Function call
   * - msalInstance.getAllAccounts() - Function call
   * - console.log() - Function call
   * - console.log() - Function call
   * - msalInstance.loginRedirect() - Function call
   * - console.log() - Function call
   * - console.log() - Function call
   * - msalInstance.acquireTokenSilent() - Function call
   * - msalInstance.getAllAccounts() - Function call
   * - console.log() - Function call
   * - setToken() - Function call
   * - setLoading() - Function call
   * - console.error() - Function call
   * - setError() - Function call
   * - useEffect() - Function call
   * - getToken() - Function call
   *
   * WHY IT CALLS THEM:
   * - useState: Required functionality
   * - useState: Required functionality
   * - useState: Required functionality
   * - useCallback: Required functionality
   * - setLoading: State update
   * - setError: State update
   * - console.log: Debugging output
   * - msalInstance.initialize: Required functionality
   * - msalInstance.getAllAccounts: Required functionality
   * - console.log: Debugging output
   * - console.log: Debugging output
   * - msalInstance.loginRedirect: Required functionality
   * - console.log: Debugging output
   * - console.log: Debugging output
   * - msalInstance.acquireTokenSilent: Required functionality
   * - msalInstance.getAllAccounts: Required functionality
   * - console.log: Debugging output
   * - setToken: State update
   * - setLoading: State update
   * - console.error: Error logging
   * - setError: State update
   * - useEffect: Required functionality
   * - getToken: Required functionality
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls useState, useState, useState to process data
   * Output: Computed value or side effect
   *
   */
export const DataverseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

    /**
     * BUSINESS LOGIC: getToken
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Handles user interaction or event
     * 2. Calls setLoading, setError, console.log, msalInstance.initialize, msalInstance.getAllAccounts, console.log, console.log, msalInstance.loginRedirect, console.log, console.log, msalInstance.acquireTokenSilent, msalInstance.getAllAccounts, console.log, setToken, setLoading, console.error, setError functions
     * 3. Updates state or triggers effects
     *
     * WHAT IT CALLS:
     * - setLoading() - Function call
     * - setError() - Function call
     * - console.log() - Function call
     * - msalInstance.initialize() - Function call
     * - msalInstance.getAllAccounts() - Function call
     * - console.log() - Function call
     * - console.log() - Function call
     * - msalInstance.loginRedirect() - Function call
     * - console.log() - Function call
     * - console.log() - Function call
     * - msalInstance.acquireTokenSilent() - Function call
     * - msalInstance.getAllAccounts() - Function call
     * - console.log() - Function call
     * - setToken() - Function call
     * - setLoading() - Function call
     * - console.error() - Function call
     * - setError() - Function call
     *
     * WHY IT CALLS THEM:
     * - setLoading: State update
     * - setError: State update
     * - console.log: Debugging output
     * - msalInstance.initialize: Required functionality
     * - msalInstance.getAllAccounts: Required functionality
     * - console.log: Debugging output
     * - console.log: Debugging output
     * - msalInstance.loginRedirect: Required functionality
     * - console.log: Debugging output
     * - console.log: Debugging output
     * - msalInstance.acquireTokenSilent: Required functionality
     * - msalInstance.getAllAccounts: Required functionality
     * - console.log: Debugging output
     * - setToken: State update
     * - setLoading: State update
     * - console.error: Error logging
     * - setError: State update
     *
     * DATA FLOW:
     * Input: Component state and props
     * Processing: Calls setLoading, setError, console.log to process data
     * Output: Event handled, state updated
     *
     * SPECIAL BEHAVIOR:
     * - Memoized for performance optimization
     *
     */
  const getToken = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("Initializing MSAL instance...");
      await msalInstance.initialize(); // Ensure MSAL is initialized

      const accounts = msalInstance.getAllAccounts();
      console.log("Accounts available:", accounts);

      // Trigger login if no account is found
      if (accounts.length === 0) {
        console.log("No accounts found, performing login...");
        await msalInstance.loginRedirect({
          scopes: ["https://eai-powerplat-dev-eastau-001.crm6.dynamics.com/.default"],
        });
        console.log("Login successful.");
      }

      console.log("Acquiring token silently...");
      const tokenResponse: AuthenticationResult = await msalInstance.acquireTokenSilent({
        // where ever we are calling acquireTokenSilent to get the token, we need to send this scope
        scopes: [process.env.NEXT_PUBLIC_MSAL_SCOPE || "api://32191e63-e253-48de-9ea1-a5337e236fe6/.default"],
        account: msalInstance.getAllAccounts()[0], // Get the first account
      });

      const accessToken = tokenResponse.accessToken;
      console.log("Token acquired successfully:", accessToken);
      setToken(accessToken); // Store token in state
    } catch (error: unknown) {
      const errorMessage =
      error instanceof Error ? error.message : "An error occurred.";
      console.error("An error occurred:", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch token on component mount
    /**
     * BUSINESS LOGIC: Side Effect
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Monitors getToken for changes
     * 2. Executes getToken functions
     * 3. Runs side effect logic
     *
     * WHAT IT CALLS:
     * - getToken() - Function call
     *
     * WHY IT CALLS THEM:
     * - getToken: Required functionality
     *
     * DATA FLOW:
     * Input: getToken state/props
     * Processing: Calls getToken to process data
     * Output: Side effects executed, cleanup registered
     *
     * DEPENDENCIES:
     * - getToken: Triggers when getToken changes
     *
     */
  useEffect(() => {
    getToken();
  }, [getToken]);

  return (
    <DataverseContext.Provider value={{ token, loading, error, getToken }}>
      {children}
    </DataverseContext.Provider>
  );
};

// Custom hook to access the context
  /**
   * BUSINESS LOGIC: useDataverse
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements useDataverse logic
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
export const useDataverse = (): DataverseContextProps => {
  const context = useContext(DataverseContext);
  if (!context) {
    throw new Error("useDataverse must be used within a DataverseProvider");
  }
  return context;
};