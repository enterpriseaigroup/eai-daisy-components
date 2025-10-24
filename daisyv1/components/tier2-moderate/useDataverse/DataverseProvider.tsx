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

export const DataverseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
export const useDataverse = (): DataverseContextProps => {
  const context = useContext(DataverseContext);
  if (!context) {
    throw new Error("useDataverse must be used within a DataverseProvider");
  }
  return context;
};