/**
 * useAuthHooks - Configurator V2 Component
 *
 * Component useAuthHooks from useAuthHooks.ts
 *
 * @migrated from DAISY v1
 */

import { useEffect, useState } from "react";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { useRouter } from 'next/navigation';
import axios from "axios";

import { UserConfig } from "./UserConfig";

  /**
   * BUSINESS LOGIC: useAuthHooks
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements useAuthHooks logic
   * 2. Calls helper functions: useRouter, useMsal, useIsAuthenticated, useState, useState, useEffect, instance.handleRedirectPromise, console.log, console.log, instance.getAllAccounts, console.log, router.push, console.log, router.push, console.log, console.error, handleRedirect, useEffect, setLoading, setError, localStorage.getItem, JSON.parse, console.log, setLoading, instance.acquireTokenSilent, axios.post, console.log, localStorage.setItem, JSON.stringify, console.log, setLoading, console.error, setError, fetchProfileData, useEffect, console.error
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - useRouter() - Function call
   * - useMsal() - Function call
   * - useIsAuthenticated() - Function call
   * - useState() - Function call
   * - useState() - Function call
   * - useEffect() - Function call
   * - instance.handleRedirectPromise() - Function call
   * - console.log() - Function call
   * - console.log() - Function call
   * - instance.getAllAccounts() - Function call
   * - console.log() - Function call
   * - router.push() - Function call
   * - console.log() - Function call
   * - router.push() - Function call
   * - console.log() - Function call
   * - console.error() - Function call
   * - handleRedirect() - Function call
   * - useEffect() - Function call
   * - setLoading() - Function call
   * - setError() - Function call
   * - localStorage.getItem() - Function call
   * - JSON.parse() - Function call
   * - console.log() - Function call
   * - setLoading() - Function call
   * - instance.acquireTokenSilent() - Function call
   * - axios.post() - Function call
   * - console.log() - Function call
   * - localStorage.setItem() - Function call
   * - JSON.stringify() - Function call
   * - console.log() - Function call
   * - setLoading() - Function call
   * - console.error() - Function call
   * - setError() - Function call
   * - fetchProfileData() - Function call
   * - useEffect() - Function call
   * - console.error() - Function call
   *
   * WHY IT CALLS THEM:
   * - useRouter: Required functionality
   * - useMsal: Required functionality
   * - useIsAuthenticated: Required functionality
   * - useState: Required functionality
   * - useState: Required functionality
   * - useEffect: Required functionality
   * - instance.handleRedirectPromise: Required functionality
   * - console.log: Debugging output
   * - console.log: Debugging output
   * - instance.getAllAccounts: Required functionality
   * - console.log: Debugging output
   * - router.push: Required functionality
   * - console.log: Debugging output
   * - router.push: Required functionality
   * - console.log: Debugging output
   * - console.error: Error logging
   * - handleRedirect: Required functionality
   * - useEffect: Required functionality
   * - setLoading: State update
   * - setError: State update
   * - localStorage.getItem: Required functionality
   * - JSON.parse: Required functionality
   * - console.log: Debugging output
   * - setLoading: State update
   * - instance.acquireTokenSilent: Required functionality
   * - axios.post: Required functionality
   * - console.log: Debugging output
   * - localStorage.setItem: State update
   * - JSON.stringify: Required functionality
   * - console.log: Debugging output
   * - setLoading: State update
   * - console.error: Error logging
   * - setError: State update
   * - fetchProfileData: Data fetching
   * - useEffect: Required functionality
   * - console.error: Error logging
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls useRouter, useMsal, useIsAuthenticated to process data
   * Output: Computed value or side effect
   *
   */
export const useAuthHooks = () => {
  const router = useRouter();
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


    /**
     * BUSINESS LOGIC: Side Effect
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Monitors error, instance, isAuthenticated, router for changes
     * 2. Executes instance.handleRedirectPromise, console.log, console.log, instance.getAllAccounts, console.log, router.push, console.log, router.push, console.log, console.error, handleRedirect functions
     * 3. Runs side effect logic
     *
     * WHAT IT CALLS:
     * - instance.handleRedirectPromise() - Function call
     * - console.log() - Function call
     * - console.log() - Function call
     * - instance.getAllAccounts() - Function call
     * - console.log() - Function call
     * - router.push() - Function call
     * - console.log() - Function call
     * - router.push() - Function call
     * - console.log() - Function call
     * - console.error() - Function call
     * - handleRedirect() - Function call
     *
     * WHY IT CALLS THEM:
     * - instance.handleRedirectPromise: Required functionality
     * - console.log: Debugging output
     * - console.log: Debugging output
     * - instance.getAllAccounts: Required functionality
     * - console.log: Debugging output
     * - router.push: Required functionality
     * - console.log: Debugging output
     * - router.push: Required functionality
     * - console.log: Debugging output
     * - console.error: Error logging
     * - handleRedirect: Required functionality
     *
     * DATA FLOW:
     * Input: error, instance, isAuthenticated, router state/props
     * Processing: Calls instance.handleRedirectPromise, console.log, console.log to process data
     * Output: Side effects executed, cleanup registered
     *
     * DEPENDENCIES:
     * - error: Triggers when error changes
     * - instance: Triggers when instance changes
     * - isAuthenticated: Triggers when isAuthenticated changes
     * - router: Triggers when router changes
     *
     */
  useEffect(() => {
      /**
       * BUSINESS LOGIC: handleRedirect
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Implements handleRedirect logic
       * 2. Calls helper functions: instance.handleRedirectPromise, console.log, console.log, instance.getAllAccounts, console.log, router.push, console.log, router.push, console.log, console.error
       * 3. Returns computed result
       *
       * WHAT IT CALLS:
       * - instance.handleRedirectPromise() - Function call
       * - console.log() - Function call
       * - console.log() - Function call
       * - instance.getAllAccounts() - Function call
       * - console.log() - Function call
       * - router.push() - Function call
       * - console.log() - Function call
       * - router.push() - Function call
       * - console.log() - Function call
       * - console.error() - Function call
       *
       * WHY IT CALLS THEM:
       * - instance.handleRedirectPromise: Required functionality
       * - console.log: Debugging output
       * - console.log: Debugging output
       * - instance.getAllAccounts: Required functionality
       * - console.log: Debugging output
       * - router.push: Required functionality
       * - console.log: Debugging output
       * - router.push: Required functionality
       * - console.log: Debugging output
       * - console.error: Error logging
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Calls instance.handleRedirectPromise, console.log, console.log to process data
       * Output: Computed value or side effect
       *
       */
    const handleRedirect = async () => {
      try {
        const response = await instance.handleRedirectPromise();
        console.log("Handling redirect response:", response);

        if (response && response.account) {
          console.log("Successfully authenticated");
          router.push("/dashboard");
        } else {
          console.log("No redirect response");
          const accounts = instance.getAllAccounts();
          if (accounts.length > 0) {
            router.push("/dashboard");
          } else {
            console.log("account is invalid")
          }
        }
      } catch (err) {
        console.error("Redirect handling error:", err);
      } finally {
        console.log("Redirect handling completed");
      }
    };

    if (isAuthenticated && !error) {
      handleRedirect();
    }
  }, [error, instance, isAuthenticated, router]);

    /**
     * BUSINESS LOGIC: Side Effect
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Monitors isAuthenticated, instance, accounts, error for changes
     * 2. Executes setLoading, setError, localStorage.getItem, JSON.parse, console.log, setLoading, instance.acquireTokenSilent, axios.post, console.log, localStorage.setItem, JSON.stringify, console.log, setLoading, console.error, setError, fetchProfileData functions
     * 3. Runs side effect logic
     *
     * WHAT IT CALLS:
     * - setLoading() - Function call
     * - setError() - Function call
     * - localStorage.getItem() - Function call
     * - JSON.parse() - Function call
     * - console.log() - Function call
     * - setLoading() - Function call
     * - instance.acquireTokenSilent() - Function call
     * - axios.post() - Function call
     * - console.log() - Function call
     * - localStorage.setItem() - Function call
     * - JSON.stringify() - Function call
     * - console.log() - Function call
     * - setLoading() - Function call
     * - console.error() - Function call
     * - setError() - Function call
     * - fetchProfileData() - Function call
     *
     * WHY IT CALLS THEM:
     * - setLoading: State update
     * - setError: State update
     * - localStorage.getItem: Required functionality
     * - JSON.parse: Required functionality
     * - console.log: Debugging output
     * - setLoading: State update
     * - instance.acquireTokenSilent: Required functionality
     * - axios.post: Required functionality
     * - console.log: Debugging output
     * - localStorage.setItem: State update
     * - JSON.stringify: Required functionality
     * - console.log: Debugging output
     * - setLoading: State update
     * - console.error: Error logging
     * - setError: State update
     * - fetchProfileData: Data fetching
     *
     * DATA FLOW:
     * Input: isAuthenticated, instance, accounts, error state/props
     * Processing: Calls setLoading, setError, localStorage.getItem to process data
     * Output: Side effects executed, cleanup registered
     *
     * DEPENDENCIES:
     * - isAuthenticated: Triggers when isAuthenticated changes
     * - instance: Triggers when instance changes
     * - accounts: Triggers when accounts changes
     * - error: Triggers when error changes
     *
     */
  useEffect(() => {
      /**
       * BUSINESS LOGIC: fetchProfileData
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Implements fetchProfileData logic
       * 2. Calls helper functions: setLoading, setError, localStorage.getItem, JSON.parse, console.log, setLoading, instance.acquireTokenSilent, axios.post, console.log, localStorage.setItem, JSON.stringify, console.log, setLoading, console.error, setError
       * 3. Returns computed result
       *
       * WHAT IT CALLS:
       * - setLoading() - Function call
       * - setError() - Function call
       * - localStorage.getItem() - Function call
       * - JSON.parse() - Function call
       * - console.log() - Function call
       * - setLoading() - Function call
       * - instance.acquireTokenSilent() - Function call
       * - axios.post() - Function call
       * - console.log() - Function call
       * - localStorage.setItem() - Function call
       * - JSON.stringify() - Function call
       * - console.log() - Function call
       * - setLoading() - Function call
       * - console.error() - Function call
       * - setError() - Function call
       *
       * WHY IT CALLS THEM:
       * - setLoading: State update
       * - setError: State update
       * - localStorage.getItem: Required functionality
       * - JSON.parse: Required functionality
       * - console.log: Debugging output
       * - setLoading: State update
       * - instance.acquireTokenSilent: Required functionality
       * - axios.post: Required functionality
       * - console.log: Debugging output
       * - localStorage.setItem: State update
       * - JSON.stringify: Required functionality
       * - console.log: Debugging output
       * - setLoading: State update
       * - console.error: Error logging
       * - setError: State update
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Calls setLoading, setError, localStorage.getItem to process data
       * Output: Computed value or side effect
       *
       */
    const fetchProfileData = async () => {
      setLoading(true);
      setError(null);

      const orgId = "4819a244-9405-4202-af83-3055a0236624"; // Blacktown

      try {
        const storedUserConfig = localStorage.getItem("user_config");
        if (storedUserConfig) {
          const userConfig: UserConfig = JSON.parse(storedUserConfig);
          if (userConfig.org_id === orgId) {
            console.log("Org ID already set, skipping update API call.");
            setLoading(false);
            return;
          }
        }

        const response = await instance.acquireTokenSilent({
          // where ever we are calling acquireTokenSilent to get the token, we need to send this scope
          scopes: [process.env.NEXT_PUBLIC_MSAL_SCOPE || "api://32191e63-e253-48de-9ea1-a5337e236fe6/.default"],
          account: accounts[0],
        });

        const accessToken = response.accessToken;

        const endpoint =
          "https://apim-dev-ae-os-001.azure-api.net/daisy/general/v1/users/entra/update-org-id";
        const body = { org_id: orgId };

        const result = await axios.post(endpoint, body, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });
        // const result = await useUpdateOrgId.mutateAsync({
        //   token: accessToken,
        //   orgId: orgId,
        // });

        console.log("Org ID updated via API");

        if (result.status === 200) {
          const idTokenClaims: Record<string, unknown> | undefined = accounts[0].idTokenClaims;
          const firstName = idTokenClaims?.given_name as string || "";
          const lastName = idTokenClaims?.family_name as string || "";
          const email = idTokenClaims?.email as string || "";

          const newUserConfig: UserConfig = {
            org_id: orgId,
            project_id: "",
            conversation_id: "",
            country: "",
            first_name: firstName,
            last_name: lastName,
            email: email,
            state: "",
            user_id: "",
            workflow: {
              next_action: "",
              chat_migrated: false,
              execution_logs: {},
            },
          };

          localStorage.setItem("user_config", JSON.stringify(newUserConfig));
          console.log("User config updated in local storage:", newUserConfig);
        }
      } catch (err: unknown) {
        console.error("Error acquiring token or updating org ID:", err);
        setError("Failed to update org ID.");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && !error) {
      fetchProfileData();
    }
  }, [isAuthenticated, instance, accounts, error]);

    /**
     * BUSINESS LOGIC: Side Effect
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Monitors error, isAuthenticated, instance, accounts for changes
     * 2. Executes console.error functions
     * 3. Runs side effect logic
     *
     * WHAT IT CALLS:
     * - console.error() - Function call
     *
     * WHY IT CALLS THEM:
     * - console.error: Error logging
     *
     * DATA FLOW:
     * Input: error, isAuthenticated, instance, accounts state/props
     * Processing: Calls console.error to process data
     * Output: Side effects executed, cleanup registered
     *
     * DEPENDENCIES:
     * - error: Triggers when error changes
     * - isAuthenticated: Triggers when isAuthenticated changes
     * - instance: Triggers when instance changes
     * - accounts: Triggers when accounts changes
     *
     */
  useEffect(() => {
    if (error) {
      console.error('Authentication error:', error);
    }
  }, [error, isAuthenticated, instance, accounts]);

  return { isAuthenticated, loading, error, instance };
};