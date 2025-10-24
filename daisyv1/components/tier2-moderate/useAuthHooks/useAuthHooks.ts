import { useEffect, useState } from "react";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { useRouter } from 'next/navigation';
import axios from "axios";

import { UserConfig } from "./UserConfig";

export const useAuthHooks = () => {
  const router = useRouter();
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
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

  useEffect(() => {
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

  useEffect(() => {
    if (error) {
      console.error('Authentication error:', error);
    }
  }, [error, isAuthenticated, instance, accounts]);

  return { isAuthenticated, loading, error, instance };
};