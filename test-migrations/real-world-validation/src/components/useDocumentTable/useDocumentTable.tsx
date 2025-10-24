/**
 * useDocumentTable - Configurator V2 Component
 *
 * Component useDocumentTable from useDocumentTable.ts
 *
 * @migrated from DAISY v1
 */

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

  /**
   * BUSINESS LOGIC: useDocumentTable
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements useDocumentTable logic
   * 2. Calls helper functions: useMsal, useState, useState, useUploadDocument, useFileUrlWithSas, useUploadStatusStore, useRef, useRef, useMemo, useEffect, getFileUrlWithSas.mutateAsync, console.error, .map, console.log, JSON.stringify, updateStatus, toast.error, setUploadDocument, setSasData, setSelectedDoc, handleUploadCompletion, useEffect, currentStatuses.find, .filter, arr.findIndex, currentStatuses.map, console.log, updateStatus, console.log, toast.success, setUploadDocument, setSasData, setSelectedDoc, useEffect, console.error, currentStatuses.map, updateStatus, toast.error, setUploadDocument, setSasData, setSelectedDoc, useCallback, setSelectedDoc, console.log, console.log, console.warn, fileIndex.toString, .click, useCallback, setSelectedDoc, useProfileStore.getState, console.error, console.error, updateStatus, toast.error, setSelectedDoc, parseInt, currentStatuses.map, console.log, updateStatus, formData.append, formData.append, formData.append, formData.append, formData.append, JSON.stringify, instance.acquireTokenSilent, setAccessToken, uploadDocument.mutateAsync, console.error, newStatuses.map, updateStatus, toast.error, setUploadDocument, setSasData, setSelectedDoc, useCallback
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - useMsal() - Function call
   * - useState() - Function call
   * - useState() - Function call
   * - useUploadDocument() - Function call
   * - useFileUrlWithSas() - Function call
   * - useUploadStatusStore() - Function call
   * - useRef() - Function call
   * - useRef() - Function call
   * - useMemo() - Function call
   * - useEffect() - Function call
   * - getFileUrlWithSas.mutateAsync() - Function call
   * - console.error() - Function call
   * - .map() - Function call
   * - console.log() - Function call
   * - JSON.stringify() - Function call
   * - updateStatus() - Function call
   * - toast.error() - Function call
   * - setUploadDocument() - Function call
   * - setSasData() - Function call
   * - setSelectedDoc() - Function call
   * - handleUploadCompletion() - Function call
   * - useEffect() - Function call
   * - currentStatuses.find() - Function call
   * - .filter() - Function call
   * - arr.findIndex() - Function call
   * - currentStatuses.map() - Function call
   * - console.log() - Function call
   * - updateStatus() - Function call
   * - console.log() - Function call
   * - toast.success() - Function call
   * - setUploadDocument() - Function call
   * - setSasData() - Function call
   * - setSelectedDoc() - Function call
   * - useEffect() - Function call
   * - console.error() - Function call
   * - currentStatuses.map() - Function call
   * - updateStatus() - Function call
   * - toast.error() - Function call
   * - setUploadDocument() - Function call
   * - setSasData() - Function call
   * - setSelectedDoc() - Function call
   * - useCallback() - Function call
   * - setSelectedDoc() - Function call
   * - console.log() - Function call
   * - console.log() - Function call
   * - console.warn() - Function call
   * - fileIndex.toString() - Function call
   * - .click() - Function call
   * - useCallback() - Function call
   * - setSelectedDoc() - Function call
   * - useProfileStore.getState() - Function call
   * - console.error() - Function call
   * - console.error() - Function call
   * - updateStatus() - Function call
   * - toast.error() - Function call
   * - setSelectedDoc() - Function call
   * - parseInt() - Function call
   * - currentStatuses.map() - Function call
   * - console.log() - Function call
   * - updateStatus() - Function call
   * - formData.append() - Function call
   * - formData.append() - Function call
   * - formData.append() - Function call
   * - formData.append() - Function call
   * - formData.append() - Function call
   * - JSON.stringify() - Function call
   * - instance.acquireTokenSilent() - Function call
   * - setAccessToken() - Function call
   * - uploadDocument.mutateAsync() - Function call
   * - console.error() - Function call
   * - newStatuses.map() - Function call
   * - updateStatus() - Function call
   * - toast.error() - Function call
   * - setUploadDocument() - Function call
   * - setSasData() - Function call
   * - setSelectedDoc() - Function call
   * - useCallback() - Function call
   *
   * WHY IT CALLS THEM:
   * - useMsal: Required functionality
   * - useState: Required functionality
   * - useState: Required functionality
   * - useUploadDocument: Required functionality
   * - useFileUrlWithSas: Required functionality
   * - useUploadStatusStore: Required functionality
   * - useRef: Required functionality
   * - useRef: Required functionality
   * - useMemo: Required functionality
   * - useEffect: Required functionality
   * - getFileUrlWithSas.mutateAsync: Required functionality
   * - console.error: Error logging
   * - .map: Required functionality
   * - console.log: Debugging output
   * - JSON.stringify: Required functionality
   * - updateStatus: Required functionality
   * - toast.error: Required functionality
   * - setUploadDocument: State update
   * - setSasData: State update
   * - setSelectedDoc: State update
   * - handleUploadCompletion: Required functionality
   * - useEffect: Required functionality
   * - currentStatuses.find: Required functionality
   * - .filter: Required functionality
   * - arr.findIndex: Required functionality
   * - currentStatuses.map: Required functionality
   * - console.log: Debugging output
   * - updateStatus: Required functionality
   * - console.log: Debugging output
   * - toast.success: Required functionality
   * - setUploadDocument: State update
   * - setSasData: State update
   * - setSelectedDoc: State update
   * - useEffect: Required functionality
   * - console.error: Error logging
   * - currentStatuses.map: Required functionality
   * - updateStatus: Required functionality
   * - toast.error: Required functionality
   * - setUploadDocument: State update
   * - setSasData: State update
   * - setSelectedDoc: State update
   * - useCallback: Required functionality
   * - setSelectedDoc: State update
   * - console.log: Debugging output
   * - console.log: Debugging output
   * - console.warn: Warning notification
   * - fileIndex.toString: Required functionality
   * - .click: Required functionality
   * - useCallback: Required functionality
   * - setSelectedDoc: State update
   * - useProfileStore.getState: Required functionality
   * - console.error: Error logging
   * - console.error: Error logging
   * - updateStatus: Required functionality
   * - toast.error: Required functionality
   * - setSelectedDoc: State update
   * - parseInt: Required functionality
   * - currentStatuses.map: Required functionality
   * - console.log: Debugging output
   * - updateStatus: Required functionality
   * - formData.append: Required functionality
   * - formData.append: Required functionality
   * - formData.append: Required functionality
   * - formData.append: Required functionality
   * - formData.append: Required functionality
   * - JSON.stringify: Required functionality
   * - instance.acquireTokenSilent: Required functionality
   * - setAccessToken: State update
   * - uploadDocument.mutateAsync: Required functionality
   * - console.error: Error logging
   * - newStatuses.map: Required functionality
   * - updateStatus: Required functionality
   * - toast.error: Required functionality
   * - setUploadDocument: State update
   * - setSasData: State update
   * - setSelectedDoc: State update
   * - useCallback: Required functionality
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls useMsal, useState, useState to process data
   * Output: Computed value or side effect
   *
   */
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

      /**
       * BUSINESS LOGIC: stableUserConfig
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Implements business logic
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Processes data and applies business logic
       * Output: Computed value or side effect
       *
       * SPECIAL BEHAVIOR:
       * - Memoized for performance optimization
       *
       */
    const stableUserConfig = useMemo(
        () => ({
            org_id: user_config.org_id,
            project_id: user_config.project_id,
            project: user_config.project,
        }),
        [user_config.org_id, user_config.project_id, user_config.project]
    );

      /**
       * BUSINESS LOGIC: Side Effect
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Monitors data, selectedDoc, accessToken, uploadStatuses, updateStatus for changes
       * 2. Executes getFileUrlWithSas.mutateAsync, console.error, .map, console.log, JSON.stringify, updateStatus, toast.error, setUploadDocument, setSasData, setSelectedDoc, handleUploadCompletion functions
       * 3. Runs side effect logic
       *
       * WHAT IT CALLS:
       * - getFileUrlWithSas.mutateAsync() - Function call
       * - console.error() - Function call
       * - .map() - Function call
       * - console.log() - Function call
       * - JSON.stringify() - Function call
       * - updateStatus() - Function call
       * - toast.error() - Function call
       * - setUploadDocument() - Function call
       * - setSasData() - Function call
       * - setSelectedDoc() - Function call
       * - handleUploadCompletion() - Function call
       *
       * WHY IT CALLS THEM:
       * - getFileUrlWithSas.mutateAsync: Required functionality
       * - console.error: Error logging
       * - .map: Required functionality
       * - console.log: Debugging output
       * - JSON.stringify: Required functionality
       * - updateStatus: Required functionality
       * - toast.error: Required functionality
       * - setUploadDocument: State update
       * - setSasData: State update
       * - setSelectedDoc: State update
       * - handleUploadCompletion: Required functionality
       *
       * DATA FLOW:
       * Input: data, selectedDoc, accessToken, uploadStatuses, updateStatus state/props
       * Processing: Calls getFileUrlWithSas.mutateAsync, console.error, .map to process data
       * Output: Side effects executed, cleanup registered
       *
       * DEPENDENCIES:
       * - data: Triggers when data changes
       * - selectedDoc: Triggers when selectedDoc changes
       * - accessToken: Triggers when accessToken changes
       * - uploadStatuses: Triggers when uploadStatuses changes
       * - updateStatus: Triggers when updateStatus changes
       *
       */
    useEffect(() => {
          /**
           * BUSINESS LOGIC: handleUploadCompletion
           *
           * WHY THIS EXISTS:
           * - Implements business logic requirement
           *
           * WHAT IT DOES:
           * 1. Implements handleUploadCompletion logic
           * 2. Calls helper functions: getFileUrlWithSas.mutateAsync, console.error, .map, console.log, JSON.stringify, updateStatus, toast.error, setUploadDocument, setSasData, setSelectedDoc
           * 3. Returns computed result
           *
           * WHAT IT CALLS:
           * - getFileUrlWithSas.mutateAsync() - Function call
           * - console.error() - Function call
           * - .map() - Function call
           * - console.log() - Function call
           * - JSON.stringify() - Function call
           * - updateStatus() - Function call
           * - toast.error() - Function call
           * - setUploadDocument() - Function call
           * - setSasData() - Function call
           * - setSelectedDoc() - Function call
           *
           * WHY IT CALLS THEM:
           * - getFileUrlWithSas.mutateAsync: Required functionality
           * - console.error: Error logging
           * - .map: Required functionality
           * - console.log: Debugging output
           * - JSON.stringify: Required functionality
           * - updateStatus: Required functionality
           * - toast.error: Required functionality
           * - setUploadDocument: State update
           * - setSasData: State update
           * - setSelectedDoc: State update
           *
           * DATA FLOW:
           * Input: Component state and props
           * Processing: Calls getFileUrlWithSas.mutateAsync, console.error, .map to process data
           * Output: Computed value or side effect
           *
           */
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

      /**
       * BUSINESS LOGIC: Side Effect
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Monitors sasData, selectedDoc, uploadStatuses, updateStatus for changes
       * 2. Executes currentStatuses.find, .filter, arr.findIndex, currentStatuses.map, console.log, updateStatus, console.log, toast.success, setUploadDocument, setSasData, setSelectedDoc functions
       * 3. Runs side effect logic
       *
       * WHAT IT CALLS:
       * - currentStatuses.find() - Function call
       * - .filter() - Function call
       * - arr.findIndex() - Function call
       * - currentStatuses.map() - Function call
       * - console.log() - Function call
       * - updateStatus() - Function call
       * - console.log() - Function call
       * - toast.success() - Function call
       * - setUploadDocument() - Function call
       * - setSasData() - Function call
       * - setSelectedDoc() - Function call
       *
       * WHY IT CALLS THEM:
       * - currentStatuses.find: Required functionality
       * - .filter: Required functionality
       * - arr.findIndex: Required functionality
       * - currentStatuses.map: Required functionality
       * - console.log: Debugging output
       * - updateStatus: Required functionality
       * - console.log: Debugging output
       * - toast.success: Required functionality
       * - setUploadDocument: State update
       * - setSasData: State update
       * - setSelectedDoc: State update
       *
       * DATA FLOW:
       * Input: sasData, selectedDoc, uploadStatuses, updateStatus state/props
       * Processing: Calls currentStatuses.find, .filter, arr.findIndex to process data
       * Output: Side effects executed, cleanup registered
       *
       * DEPENDENCIES:
       * - sasData: Triggers when sasData changes
       * - selectedDoc: Triggers when selectedDoc changes
       * - uploadStatuses: Triggers when uploadStatuses changes
       * - updateStatus: Triggers when updateStatus changes
       *
       */
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

      /**
       * BUSINESS LOGIC: Side Effect
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Monitors selectedDoc, uploadStatuses, updateStatus for changes
       * 2. Executes console.error, currentStatuses.map, updateStatus, toast.error, setUploadDocument, setSasData, setSelectedDoc functions
       * 3. Runs side effect logic
       *
       * WHAT IT CALLS:
       * - console.error() - Function call
       * - currentStatuses.map() - Function call
       * - updateStatus() - Function call
       * - toast.error() - Function call
       * - setUploadDocument() - Function call
       * - setSasData() - Function call
       * - setSelectedDoc() - Function call
       *
       * WHY IT CALLS THEM:
       * - console.error: Error logging
       * - currentStatuses.map: Required functionality
       * - updateStatus: Required functionality
       * - toast.error: Required functionality
       * - setUploadDocument: State update
       * - setSasData: State update
       * - setSelectedDoc: State update
       *
       * DATA FLOW:
       * Input: selectedDoc, uploadStatuses, updateStatus state/props
       * Processing: Calls console.error, currentStatuses.map, updateStatus to process data
       * Output: Side effects executed, cleanup registered
       *
       * DEPENDENCIES:
       * - selectedDoc: Triggers when selectedDoc changes
       * - uploadStatuses: Triggers when uploadStatuses changes
       * - updateStatus: Triggers when updateStatus changes
       *
       */
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

      /**
       * BUSINESS LOGIC: handleUploadClick
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Handles user interaction or event
       * 2. Calls setSelectedDoc, console.log, console.log, console.warn, fileIndex.toString, .click functions
       * 3. Updates state or triggers effects
       *
       * WHAT IT CALLS:
       * - setSelectedDoc() - Function call
       * - console.log() - Function call
       * - console.log() - Function call
       * - console.warn() - Function call
       * - fileIndex.toString() - Function call
       * - .click() - Function call
       *
       * WHY IT CALLS THEM:
       * - setSelectedDoc: State update
       * - console.log: Debugging output
       * - console.log: Debugging output
       * - console.warn: Warning notification
       * - fileIndex.toString: Required functionality
       * - .click: Required functionality
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Calls setSelectedDoc, console.log, console.log to process data
       * Output: Event handled, state updated
       *
       * SPECIAL BEHAVIOR:
       * - Memoized for performance optimization
       *
       */
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

      /**
       * BUSINESS LOGIC: handleFileChange
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Handles user interaction or event
       * 2. Calls setSelectedDoc, useProfileStore.getState, console.error, console.error, updateStatus, toast.error, setSelectedDoc, parseInt, currentStatuses.map, console.log, updateStatus, formData.append, formData.append, formData.append, formData.append, formData.append, JSON.stringify, instance.acquireTokenSilent, setAccessToken, uploadDocument.mutateAsync, console.error, newStatuses.map, updateStatus, toast.error, setUploadDocument, setSasData, setSelectedDoc functions
       * 3. Updates state or triggers effects
       *
       * WHAT IT CALLS:
       * - setSelectedDoc() - Function call
       * - useProfileStore.getState() - Function call
       * - console.error() - Function call
       * - console.error() - Function call
       * - updateStatus() - Function call
       * - toast.error() - Function call
       * - setSelectedDoc() - Function call
       * - parseInt() - Function call
       * - currentStatuses.map() - Function call
       * - console.log() - Function call
       * - updateStatus() - Function call
       * - formData.append() - Function call
       * - formData.append() - Function call
       * - formData.append() - Function call
       * - formData.append() - Function call
       * - formData.append() - Function call
       * - JSON.stringify() - Function call
       * - instance.acquireTokenSilent() - Function call
       * - setAccessToken() - Function call
       * - uploadDocument.mutateAsync() - Function call
       * - console.error() - Function call
       * - newStatuses.map() - Function call
       * - updateStatus() - Function call
       * - toast.error() - Function call
       * - setUploadDocument() - Function call
       * - setSasData() - Function call
       * - setSelectedDoc() - Function call
       *
       * WHY IT CALLS THEM:
       * - setSelectedDoc: State update
       * - useProfileStore.getState: Required functionality
       * - console.error: Error logging
       * - console.error: Error logging
       * - updateStatus: Required functionality
       * - toast.error: Required functionality
       * - setSelectedDoc: State update
       * - parseInt: Required functionality
       * - currentStatuses.map: Required functionality
       * - console.log: Debugging output
       * - updateStatus: Required functionality
       * - formData.append: Required functionality
       * - formData.append: Required functionality
       * - formData.append: Required functionality
       * - formData.append: Required functionality
       * - formData.append: Required functionality
       * - JSON.stringify: Required functionality
       * - instance.acquireTokenSilent: Required functionality
       * - setAccessToken: State update
       * - uploadDocument.mutateAsync: Required functionality
       * - console.error: Error logging
       * - newStatuses.map: Required functionality
       * - updateStatus: Required functionality
       * - toast.error: Required functionality
       * - setUploadDocument: State update
       * - setSasData: State update
       * - setSelectedDoc: State update
       *
       * DATA FLOW:
       * Input: selectedDoc, uploadStatuses, uploadDocument, stableUserConfig, instance, accounts, updateStatus state/props
       * Processing: Calls setSelectedDoc, useProfileStore.getState, console.error to process data
       * Output: Event handled, state updated
       *
       * DEPENDENCIES:
       * - selectedDoc: Triggers when selectedDoc changes
       * - uploadStatuses: Triggers when uploadStatuses changes
       * - uploadDocument: Triggers when uploadDocument changes
       * - stableUserConfig: Triggers when stableUserConfig changes
       * - instance: Triggers when instance changes
       * - accounts: Triggers when accounts changes
       * - updateStatus: Triggers when updateStatus changes
       *
       * SPECIAL BEHAVIOR:
       * - Memoized for performance optimization
       *
       */
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

      /**
       * BUSINESS LOGIC: getStatusDescription
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Handles user interaction or event
       * 2. Updates state or triggers effects
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Processes data and applies business logic
       * Output: Event handled, state updated
       *
       * SPECIAL BEHAVIOR:
       * - Memoized for performance optimization
       *
       */
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