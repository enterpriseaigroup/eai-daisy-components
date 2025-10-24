/**
 * useDocDownload - Configurator V2 Component
 *
 * Component useDocDownload from useDocDownload.ts
 *
 * @migrated from DAISY v1
 */

/**
 * MIGRATED: CSS imports removed, replaced with Tailwind classes
 * CONVERSION: Automated by CSS-to-Tailwind transformer
 * DATE: 2025-10-24
 */

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useMsal } from "@azure/msal-react";
import { useDocumentDownload } from "@presentation/hooks/useDocumentDownload";
import { UserConfig } from "@domain/entities/ProfileData";


import { useProfileStore } from "../../store/useProfileStore";

// const API_URL = "http://localhost:8000/api/";

  /**
   * BUSINESS LOGIC: useDocDownload
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements useDocDownload logic
   * 2. Calls helper functions: useState, useMsal, useDocumentDownload, useProfileStore, useEffect, setData, setLoading, console.log, useEffect, setLoading, toast.error, setLoading, instance.acquireTokenSilent, downloadDocuments.mutate, console.error, toast.error, setLoading
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - useState() - Function call
   * - useMsal() - Function call
   * - useDocumentDownload() - Function call
   * - useProfileStore() - Function call
   * - useEffect() - Function call
   * - setData() - Function call
   * - setLoading() - Function call
   * - console.log() - Function call
   * - useEffect() - Function call
   * - setLoading() - Function call
   * - toast.error() - Function call
   * - setLoading() - Function call
   * - instance.acquireTokenSilent() - Function call
   * - downloadDocuments.mutate() - Function call
   * - console.error() - Function call
   * - toast.error() - Function call
   * - setLoading() - Function call
   *
   * WHY IT CALLS THEM:
   * - useState: Required functionality
   * - useMsal: Required functionality
   * - useDocumentDownload: Required functionality
   * - useProfileStore: Required functionality
   * - useEffect: Required functionality
   * - setData: State update
   * - setLoading: State update
   * - console.log: Debugging output
   * - useEffect: Required functionality
   * - setLoading: State update
   * - toast.error: Required functionality
   * - setLoading: State update
   * - instance.acquireTokenSilent: Required functionality
   * - downloadDocuments.mutate: Required functionality
   * - console.error: Error logging
   * - toast.error: Required functionality
   * - setLoading: State update
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls useState, useMsal, useDocumentDownload to process data
   * Output: Computed value or side effect
   *
   */
export const useDocDownload = (userConfig: UserConfig | null) => {
    const [loading, setLoading] = useState(false);
    const { instance, accounts } = useMsal();
    const {
        downloadDocuments,
        setData,
        data,
    } = useDocumentDownload();
    const { currentProject } = useProfileStore();

      /**
       * BUSINESS LOGIC: Side Effect
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Monitors data, setData for changes
       * 2. Executes setData, setLoading, console.log functions
       * 3. Runs side effect logic
       *
       * WHAT IT CALLS:
       * - setData() - Function call
       * - setLoading() - Function call
       * - console.log() - Function call
       *
       * WHY IT CALLS THEM:
       * - setData: State update
       * - setLoading: State update
       * - console.log: Debugging output
       *
       * DATA FLOW:
       * Input: data, setData state/props
       * Processing: Calls setData, setLoading, console.log to process data
       * Output: Side effects executed, cleanup registered
       *
       * DEPENDENCIES:
       * - data: Triggers when data changes
       * - setData: Triggers when setData changes
       *
       */
    useEffect(() => {
        if (data) {
            // const blob = data.file.blob(); // Assuming data.file is a Blob object
            // const url = window.URL.createObjectURL(blob);
            // const a = document.createElement("a");
            // a.href = url;
            // a.download = "validated_documents.zip";
            // document.body.appendChild(a);
            // a.click();
            // a.remove();
            // window.URL.revokeObjectURL(url);

            setData(null); // Clear the data after download
            setLoading(false); // ✅ End loading state after successful download
            console.log("Documents downloaded successfully");
        }
    }, [data, setData]);

    // ✅ NEW: Handle download errors
      /**
       * BUSINESS LOGIC: Side Effect
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Executes setLoading, toast.error functions
       * 2. Runs side effect logic
       *
       * WHAT IT CALLS:
       * - setLoading() - Function call
       * - toast.error() - Function call
       *
       * WHY IT CALLS THEM:
       * - setLoading: State update
       * - toast.error: Required functionality
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Calls setLoading, toast.error to process data
       * Output: Side effects executed, cleanup registered
       *
       * SPECIAL BEHAVIOR:
       * - Runs only on component mount
       *
       */
    useEffect(() => {
        if (downloadDocuments.isError) {
            setLoading(false); // ✅ End loading state on error
            const error = downloadDocuments.error;
            const errorMessage = error instanceof Error ? error.message : "Failed to download documents.";
            toast.error("Download Error", {
                description: errorMessage,
            });
        }
    }, [downloadDocuments.isError, downloadDocuments.error]);

    // Handler for downloading all documents for the current application.
      /**
       * BUSINESS LOGIC: handleDownload
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Implements handleDownload logic
       * 2. Calls helper functions: setLoading, instance.acquireTokenSilent, downloadDocuments.mutate, console.error, toast.error, setLoading
       * 3. Returns computed result
       *
       * WHAT IT CALLS:
       * - setLoading() - Function call
       * - instance.acquireTokenSilent() - Function call
       * - downloadDocuments.mutate() - Function call
       * - console.error() - Function call
       * - toast.error() - Function call
       * - setLoading() - Function call
       *
       * WHY IT CALLS THEM:
       * - setLoading: State update
       * - instance.acquireTokenSilent: Required functionality
       * - downloadDocuments.mutate: Required functionality
       * - console.error: Error logging
       * - toast.error: Required functionality
       * - setLoading: State update
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Calls setLoading, instance.acquireTokenSilent, downloadDocuments.mutate to process data
       * Output: Computed value or side effect
       *
       */
    const handleDownload = async () => {
        setLoading(true);
        try {
            // Acquire token for API call.
            const tokenResponse = await instance.acquireTokenSilent({
                scopes: [process.env.NEXT_PUBLIC_MSAL_SCOPE || "api://32191e63-e253-48de-9ea1-a5337e236fe6/.default"],
                account: accounts[0],
            });

            // API call to download all documents.
            downloadDocuments.mutate({
                token: tokenResponse.accessToken,
                payload: {
                    user_config: {
                        org_id: userConfig?.org_id || "",
                        project_id: userConfig?.project_id || "",
                    },
                },
                currentProject: currentProject || undefined
            });

            // ✅ REMOVED: Don't set loading to false here - let the useEffect handle it
            // The mutation is async, so we need to wait for success/error

        } catch (error: unknown) {
            console.error("Error acquiring token or starting download:", error);
            const errorMessage =
                error instanceof Error ? error.message : "Failed to start download.";
            toast.error("Download Error", {
                description: errorMessage || "An error occurred while starting the download.",
            });
            setLoading(false); // ✅ Only set loading to false for token acquisition errors
        }
        // ✅ REMOVED: finally block that was immediately setting loading to false
    };

    return { handleDownload, loading };
}