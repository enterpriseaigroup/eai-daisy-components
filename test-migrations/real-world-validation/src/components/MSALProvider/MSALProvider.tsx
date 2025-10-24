/**
 * MSALProvider - Configurator V2 Component
 *
 * Component MSALProvider from MSALAuthProvider.tsx
 *
 * @migrated from DAISY v1
 */

'use client';

import React from "react";
import { MsalProvider } from "@azure/msal-react";
import { PublicClientApplication } from "@azure/msal-browser";
import { getMsalInstance } from "./config";

interface MSALProviderProps {
  children: React.ReactNode;
  instance?: PublicClientApplication;
}

// OLD ONE!
// export const MSALProvider = ({ children, instance }: MSALProviderProps) => {
//   const [isInitialized, setIsInitialized] = useState(false);
//   const msalInstance = instance || getMsalInstance();
//   useEffect(() => {
//     const initializeMsal = async () => {
//       try {
//         await msalInstance.initialize();
//         setIsInitialized(true);
//         console.log("MSAL initialized successfully", isInitialized);
//       } catch (error) {
//         console.error("Failed to initialize MSAL:", error);
//       }
//     };
//     initializeMsal();
//   }, [msalInstance, isInitialized]);
//   // if (!isInitialized) {
//   //   return <LoginLoader />;
//   // }
//   return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
// };

  /**
   * BUSINESS LOGIC: MSALProvider
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements MSALProvider logic
   * 2. Calls helper functions: getMsalInstance
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - getMsalInstance() - Function call
   *
   * WHY IT CALLS THEM:
   * - getMsalInstance: Required functionality
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls getMsalInstance to process data
   * Output: Computed value or side effect
   *
   */
export const MSALProvider = ({ children, instance }: MSALProviderProps) => {
  const msalInstance = instance || getMsalInstance();
  return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
};