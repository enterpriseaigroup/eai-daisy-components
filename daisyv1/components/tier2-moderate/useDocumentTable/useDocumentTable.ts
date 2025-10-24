import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { useMsal } from "@azure/msal-react";
import { Document } from "@domain/entities/Document";
import { useUploadDocument } from "@presentation/hooks/useUploadDocument";
import { useFileUrlWithSas } from "@presentation/hooks/useFileUrlWithSas";
import { UserConfig } from "@domain/entities/ProfileData";
import { useProfileStore } from "@presentation/store/useProfileStore";
import { useUploadStatusStore } from "../../store/uploadStatusStore";

export interface UploadStatus {
    status: 'idle' | 'not_validated' | 'error' | 'validated' | 'uploading' | 'completed';
    fileUrl?: string;
    fileIndex: number;
    description?: string;
}

type DocumentWithApiFlag = Document & { fromApi?: boolean };

export const useDocumentTable = (user_config: UserConfig) => {
    const { instance, accounts } = useMsal();
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const { data, setData: setUploadDocument, uploadDocument } = useUploadDocument();
    const { data: sasData, setData: setSasData, getFileUrlWithSas } = useFileUrlWithSas();
    const { statuses: uploadStatuses, updateStatus } = useUploadStatusStore();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isUploading = useRef(false);

    const selectedDocId = selectedDoc?.ApplicationDocumentId ?? null;

    const stableUserConfig = useMemo(
        () => ({
            org_id: user_config.org_id,
            project_id: user_config.project_id,
            project: user_config.project,
        }),
        [user_config.org_id, user_config.project_id, user_config.project]
    );

    useEffect(() => {
        const handleUploadCompletion = async () => {
        if (!data || !selectedDoc || uploadDocument.isPending || !accessToken) return;
        const docId = selectedDoc.ApplicationDocumentId;
        const fileIndex = (uploadStatuses[docId]?.length || 0) - 1;
        try {
            await getFileUrlWithSas.mutateAsync({
                token: accessToken,
                payload: { fileUrl: data.file_url || '' },
            });
        } catch (error) {
                console.error('Error retrieving SAS URL:', error);
                const newStatuses: UploadStatus[] = (uploadStatuses[docId] || []).map((s) =>
                    s.fileIndex === fileIndex ? { ...s, status: 'error', description: 'Failed to retrieve SAS URL.' } : s
                );
                console.log(`Updated statuses on SAS error for ${docId}:`, JSON.stringify(newStatuses));
                updateStatus(docId, newStatuses);
                toast.error('Operation Failed', { description: 'Failed to retrieve SAS URL.' });
                setUploadDocument(null);
                setSasData(null);
                setSelectedDoc(null);
                isUploading.current = false;
        }
        };
        handleUploadCompletion();
    }, [data, uploadDocument.isPending, selectedDoc, accessToken, uploadStatuses, updateStatus]);

    useEffect(() => {
        if (!sasData || !selectedDoc) return;
        const docId = selectedDoc.ApplicationDocumentId;
        const currentStatuses = uploadStatuses[docId] || [];
        const inProgressUpload = currentStatuses.find((s) => s.status === 'uploading');
        const fileIndex = inProgressUpload ? inProgressUpload.fileIndex : currentStatuses.length;
        let newStatuses: UploadStatus[];
        if (inProgressUpload) {
            newStatuses = currentStatuses.map((s) =>
                s.fileIndex === fileIndex
                ? { ...s, status: 'completed', fileUrl: sasData.url, description: 'Document is being validated' }
                : s
            );
            console.log("newStatuses sas progress",newStatuses)
        } else {
            newStatuses = [
                ...currentStatuses,
                { status: 'completed', fileUrl: sasData.url, fileIndex, description: 'Document is being validated' } as UploadStatus,
            ].filter((s, idx, arr) => arr.findIndex((x) => x.fileIndex === s.fileIndex) === idx);
        }
        updateStatus(docId, newStatuses);
        console.log("statues",uploadStatuses)
        toast.success('Upload Successful', { description: 'Your document has been uploaded successfully.' });
        setUploadDocument(null);
        setSasData(null);
        setSelectedDoc(null);
        isUploading.current = false;
    }, [sasData, selectedDoc, uploadStatuses, updateStatus]);

    useEffect(() => {
        if (!getFileUrlWithSas.isError || getFileUrlWithSas.isPending || !selectedDoc) return;
        const docId = selectedDoc.ApplicationDocumentId;
        const fileIndex = (uploadStatuses[docId]?.length || 0) - 1;
        console.error('Error retrieving SAS URL:', getFileUrlWithSas.error);
        const currentStatuses = uploadStatuses[docId] || [];
        const newStatuses: UploadStatus[] = currentStatuses.length > 0
        ? currentStatuses.map((s) =>
            s.fileIndex === fileIndex ? { ...s, status: 'error', description: 'Failed to retrieve SAS URL.' } : s
            )
        : [{ status: 'error', fileIndex, description: 'Failed to retrieve SAS URL.' }];
        updateStatus(docId, newStatuses);
        toast.error('Operation Failed', { description: 'There was an error retrieving the SAS URL.' });
        setUploadDocument(null);
        setSasData(null);
        setSelectedDoc(null);
        isUploading.current = false;
    }, [getFileUrlWithSas.isError, getFileUrlWithSas.isPending, getFileUrlWithSas.error, selectedDoc, uploadStatuses, updateStatus]);

    const handleUploadClick = useCallback((doc: Document, fileIndex?: number) => {
        const extendedDoc: DocumentWithApiFlag = {
            ...doc,
            Validated: undefined,
            fromApi: false,
            
        };
        setSelectedDoc(extendedDoc);
        console.log('extendedDoc',extendedDoc)
        console.log('fileIndex',fileIndex)
        if (fileInputRef.current) {
            fileInputRef.current.dataset.fileIndex = fileIndex !== undefined ? fileIndex.toString() : '';
            fileInputRef.current.value = '';
            fileInputRef.current.click();
        } else {
        console.warn('fileInputRef is not initialized');
        }
    }, []);

    const handleFileChange = useCallback(
        async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0 || !selectedDoc || isUploading.current) {
            setSelectedDoc(null);
            return;
        }
        isUploading.current = true;
        const file = event.target.files[0];
        // Safely access profileStoreData
        let profileStoreData: UserConfig | undefined;
        try {
            const storeState = useProfileStore.getState();
            profileStoreData = storeState?.profileData?.user_config;
        } catch (error) {
            console.error('Error accessing profile store:', error);
        }
        // Safeguard for undefined profileStoreData
        if (!profileStoreData) {
            console.error('Profile store data is undefined');
            const docId = selectedDoc.ApplicationDocumentId;
            const fileIndex = (uploadStatuses[docId]?.length || 0) - 1;
            updateStatus(docId, [
                ...(uploadStatuses[docId] || []),
                { status: 'error', fileIndex, description: 'Profile data unavailable.' },
            ]);
            toast.error('Operation Failed', { description: 'Profile data unavailable.' });
            setSelectedDoc(null);
            isUploading.current = false;
            return;
        }
        const effectiveUserConfig = {
            ...stableUserConfig,
            ...profileStoreData,
            project: {
            ...stableUserConfig.project,
            ...profileStoreData?.project,
            },
        };
        const docId = selectedDoc.ApplicationDocumentId;
        const currentStatuses = uploadStatuses[docId] || [];
        let newStatuses: UploadStatus[];
        let fileIndex: number;
        const fileIndexStr = event.target.dataset.fileIndex;
        const isReupload = fileIndexStr !== undefined && fileIndexStr !== '';
        if (isReupload) {
            fileIndex = parseInt(fileIndexStr, 10);
            newStatuses = currentStatuses.map((s) =>
            s.fileIndex === fileIndex
                ? { status: 'uploading', fileUrl: undefined, fileIndex, description: 'Uploading...' }
                : s
            );
           console.log("newStatuses",newStatuses);
        } else {
            const maxFileIndex = currentStatuses.length;
            fileIndex = maxFileIndex;
            newStatuses = [
            ...currentStatuses,
            { status: 'uploading', fileUrl: undefined, fileIndex, description: 'Uploading...' } as UploadStatus,
            ];
        }
        updateStatus(docId, newStatuses);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('groups', effectiveUserConfig.project_id);
        formData.append('orgid', effectiveUserConfig.org_id);
        formData.append('reupload', isReupload ? 'true' : 'false');
        const indexedDocumentId = (fileIndex===0)?`${selectedDoc.EncompassId}`:`${selectedDoc.EncompassId}-${fileIndex}`;
        const metadata = {
            documentId: indexedDocumentId,
            application_name: effectiveUserConfig.project?.application_name || '',
            address: effectiveUserConfig.project?.address || '',
            bh_name: selectedDoc.Document,
        };
        formData.append('metadata', JSON.stringify(metadata));
        try {
            const tokenResponse = await instance.acquireTokenSilent({
            scopes: [
                process.env.NEXT_PUBLIC_MSAL_SCOPE || 'api://32191e63-e253-48de-9ea1-a5337e236fe6/.default',
            ],
            account: accounts[0],
            });
            setAccessToken(tokenResponse.accessToken);
            await uploadDocument.mutateAsync({
            token: tokenResponse.accessToken,
            payload: formData,
            });
        } catch (error: unknown) {
            console.error('Error uploading file:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const updatedStatuses: UploadStatus[] = newStatuses.map((s) =>
                s.fileIndex === fileIndex ? { ...s, status: 'error', description: 'Upload failed.' } : s
            );
            updateStatus(docId, updatedStatuses);
            toast.error('Operation Failed', { description: errorMessage });
            setUploadDocument(null);
            setSasData(null);
            setSelectedDoc(null);
            isUploading.current = false;
        }
        },
        [selectedDoc, uploadStatuses, uploadDocument, stableUserConfig, instance, accounts, updateStatus]
    );

    const getStatusDescription = useCallback(
        (doc: DocumentWithApiFlag, statusInfo: UploadStatus | undefined) => {
            if (!statusInfo || statusInfo.status === 'idle') {
                return doc.Description || 'Please upload your document for validation.';
            }
            if (statusInfo.status === 'uploading') {
                return 'Document is being uploaded';
            }
            if (statusInfo.status === 'completed') {
                return 'Document is being validated';
            }
            if (statusInfo.status === 'error') {
                return 'Please upload your document again for validation.';
            }
            if (statusInfo.status === 'validated') {
                return statusInfo.description || `Document successfully validated with ${doc.confidence || 'high'} confidence.`;
            }
            if (statusInfo.status === 'not_validated') {
                return statusInfo.description || 'Validation failed. Please recheck your document.';
            }
            return doc.Description || 'Please upload your document for validation.';
            },
        []
    );

    return {
        fileInputRef,
        handleFileChange,
        handleUploadClick,
        uploadStatuses,
        getStatusDescription,
        selectedDocId,
    };
};