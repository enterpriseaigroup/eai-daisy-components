import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useMsal } from "@azure/msal-react";
import { useDocumentDownload } from "@presentation/hooks/useDocumentDownload";
import { UserConfig } from "@domain/entities/ProfileData";

import './DocumentDownloadPanel.css';
import { useProfileStore } from "../../store/useProfileStore";

// const API_URL = "http://localhost:8000/api/";

export const useDocDownload = (userConfig: UserConfig | null) => {
    const [loading, setLoading] = useState(false);
    const { instance, accounts } = useMsal();
    const {
        downloadDocuments,
        setData,
        data,
    } = useDocumentDownload();
    const { currentProject } = useProfileStore();

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