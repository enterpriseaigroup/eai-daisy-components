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

export const MSALProvider = ({ children, instance }: MSALProviderProps) => {
  const msalInstance = instance || getMsalInstance();
  return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
};