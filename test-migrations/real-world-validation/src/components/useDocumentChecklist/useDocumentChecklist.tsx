/**
 * useDocumentChecklist - Configurator V2 Component
 *
 * Component useDocumentChecklist from useDocumentChecklist.ts
 *
 * @migrated from DAISY v1
 */

import { UserConfig } from "@domain/entities/ProfileData";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { useMsal } from "@azure/msal-react";
import { Document } from "@domain/entities/Document";
import { useWebPubSubConnection } from "@/api/socketApi/SocketApi";
import type { FetchDocumentChecklistRequest } from "@application/models/FetchDocumentChecklistRequest";
import { useFetchDocumentChecklist } from "@presentation/hooks/useFetchDocumentChecklist";
import { useCreateSecurityGroup } from "@presentation/hooks/useCreateSecurityGroup";
import { useCreateApplicationRecord } from "@presentation/hooks/useCreateApplicationRecord";
import { useFetchUploadedDocuments } from "@presentation/hooks/useFetchUploadedDocuments";
import { FetchUploadedDocumentsResponse } from "@/app/application/models/FetchUploadedDocumentsResponse";
import { useAuthStore } from "@presentation/store/useAuthStore";
import { useProfileStore } from "@presentation/store/useProfileStore";
import { safeUpdateUserConfig } from "../chatbot/utils/safeUpdateUserConfig";
import { useUploadStatusStore } from "../../store/uploadStatusStore";
import { UploadStatus } from "./useDocumentTable";
import { useFileUrlWithSas } from "../../hooks/useFileUrlWithSas";

interface DocumentWithApiFlag extends Document {
  fromApi?: boolean;
}

interface Metadata {
  confidencepercent?: string;
  explanation?: string;
  documentId?: string;
  document_name?: string;
  [key: string]: unknown;
}

interface QueuedMessage {
  docId: string;
  metadata: Metadata & {
    documentId?: string;
    document_name?: string;
    confidencepercent: string;
    explanation?: string;
  };
  isValidated?: boolean;
  fileUrl?: string;
}

  /**
   * BUSINESS LOGIC: useDocumentChecklist
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements useDocumentChecklist logic
   * 2. Calls helper functions: useState, useState, useState, useState, useState, useMsal, useFetchDocumentChecklist, useFetchUploadedDocuments, useUploadStatusStore, useCreateSecurityGroup, useCreateApplicationRecord, useAuthStore, useProfileStore, useRef, useRef, useRef, useFileUrlWithSas, useRef, useRef, useMemo, useRef, useRef, useCallback, docs1.every, useCallback, docs1.every, useCallback, instance.acquireTokenSilent, console.log, instance.acquireTokenPopup, useEffect, acquireMsalToken, setMsalToken, console.error, setMsalToken, toast.error, fetchToken, useCallback, reqValue.toLowerCase, useCallback, console.error, toast.error, useCallback, .every, documents.filter, isRequiredDoc, useCallback, toast.error, toast.error, toast.info, getFileUrlWithSas.mutateAsync, window.open, .add, console.error, toast.error, useCallback, console.log, console.log, JSON.stringify, docId.match, console.log, console.warn, .push, console.warn, fetchDocumentChecklist.mutate, console.log, console.error, handleApiError, documents.find, console.warn, .push, console.log, .match, parseInt, console.log, existingStatuses.find, console.log, JSON.stringify, console.log, .push, parseFloat, fileUrl.includes, console.log, JSON.stringify, .sort, existingStatuses.filter, console.log, JSON.stringify, updateStatus, setDocuments, prevDocuments.map, console.log, JSON.stringify, useEffect, .filter, docId.match, documents.find, .match, parseInt, existingStatuses.find, messagesToProcess.forEach, console.log, handleDocumentUpdate, .filter, messagesToProcess.includes, useWebPubSubConnection, useEffect, localStorage.removeItem, useEffect, console.log, areDocumentsEqual, console.log, areDocumentsEqual, console.log, safeUpdateUserConfig, useEffect, fetchUploadedDocuments.mutate, handleApiError, useEffect, .sort, .localeCompare, setDocuments, setLoading, useEffect, console.log, JSON.stringify, documents.map, .filter, .toLowerCase, .toLowerCase, matchingDocs.reduce, parseFloat, documents.find, console.log, setDocuments, JSON.stringify, JSON.stringify, .forEach, documents.find, .toLowerCase, .toLowerCase, .match, parseInt, parseFloat, currentStatuses.find, console.log, .includes, .sort, .sort, parseInt, .match, parseInt, .match, .forEach, .sort, currentStatuses.filter, .includes, statuses.some, console.log, JSON.stringify, updateStatus, JSON.stringify, JSON.stringify, Object.entries, console.log, areUploadedDocumentsEqual, console.log, areUploadedDocumentsEqual, console.log, safeUpdateUserConfig, useEffect, setUserConfig, safeUpdateUserConfig, useEffect, console.log, localStorage.setItem, value.toLowerCase, ensureBoolean, ensureBoolean, ensureBoolean, ensureBoolean, ensureBoolean, fetchDocumentChecklist.mutate, console.log, localStorage.removeItem, console.error, handleApiError, setLoading, localStorage.removeItem, console.error, handleApiError, setLoading, fetchChecklistImmediately, useEffect, handleApiError, setDocChecklistBlocked, setLoading, useCallback, setLoading, acquireMsalToken, value.toLowerCase, ensureBoolean, ensureBoolean, ensureBoolean, ensureBoolean, ensureBoolean, fetchDocumentChecklist.mutate, fetchUploadedDocuments.mutate, handleApiError, setLoading, handleApiError, setLoading
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - useState() - Function call
   * - useState() - Function call
   * - useState() - Function call
   * - useState() - Function call
   * - useState() - Function call
   * - useMsal() - Function call
   * - useFetchDocumentChecklist() - Function call
   * - useFetchUploadedDocuments() - Function call
   * - useUploadStatusStore() - Function call
   * - useCreateSecurityGroup() - Function call
   * - useCreateApplicationRecord() - Function call
   * - useAuthStore() - Function call
   * - useProfileStore() - Function call
   * - useRef() - Function call
   * - useRef() - Function call
   * - useRef() - Function call
   * - useFileUrlWithSas() - Function call
   * - useRef() - Function call
   * - useRef() - Function call
   * - useMemo() - Function call
   * - useRef() - Function call
   * - useRef() - Function call
   * - useCallback() - Function call
   * - docs1.every() - Function call
   * - useCallback() - Function call
   * - docs1.every() - Function call
   * - useCallback() - Function call
   * - instance.acquireTokenSilent() - Function call
   * - console.log() - Function call
   * - instance.acquireTokenPopup() - Function call
   * - useEffect() - Function call
   * - acquireMsalToken() - Function call
   * - setMsalToken() - Function call
   * - console.error() - Function call
   * - setMsalToken() - Function call
   * - toast.error() - Function call
   * - fetchToken() - Function call
   * - useCallback() - Function call
   * - reqValue.toLowerCase() - Function call
   * - useCallback() - Function call
   * - console.error() - Function call
   * - toast.error() - Function call
   * - useCallback() - Function call
   * - .every() - Function call
   * - documents.filter() - Function call
   * - isRequiredDoc() - Function call
   * - useCallback() - Function call
   * - toast.error() - Function call
   * - toast.error() - Function call
   * - toast.info() - Function call
   * - getFileUrlWithSas.mutateAsync() - Function call
   * - window.open() - Function call
   * - .add() - Function call
   * - console.error() - Function call
   * - toast.error() - Function call
   * - useCallback() - Function call
   * - console.log() - Function call
   * - console.log() - Function call
   * - JSON.stringify() - Function call
   * - docId.match() - Function call
   * - console.log() - Function call
   * - console.warn() - Function call
   * - .push() - Function call
   * - console.warn() - Function call
   * - fetchDocumentChecklist.mutate() - Function call
   * - console.log() - Function call
   * - console.error() - Function call
   * - handleApiError() - Function call
   * - documents.find() - Function call
   * - console.warn() - Function call
   * - .push() - Function call
   * - console.log() - Function call
   * - .match() - Function call
   * - parseInt() - Function call
   * - console.log() - Function call
   * - existingStatuses.find() - Function call
   * - console.log() - Function call
   * - JSON.stringify() - Function call
   * - console.log() - Function call
   * - .push() - Function call
   * - parseFloat() - Function call
   * - fileUrl.includes() - Function call
   * - console.log() - Function call
   * - JSON.stringify() - Function call
   * - .sort() - Function call
   * - existingStatuses.filter() - Function call
   * - console.log() - Function call
   * - JSON.stringify() - Function call
   * - updateStatus() - Function call
   * - setDocuments() - Function call
   * - prevDocuments.map() - Function call
   * - console.log() - Function call
   * - JSON.stringify() - Function call
   * - useEffect() - Function call
   * - .filter() - Function call
   * - docId.match() - Function call
   * - documents.find() - Function call
   * - .match() - Function call
   * - parseInt() - Function call
   * - existingStatuses.find() - Function call
   * - messagesToProcess.forEach() - Function call
   * - console.log() - Function call
   * - handleDocumentUpdate() - Function call
   * - .filter() - Function call
   * - messagesToProcess.includes() - Function call
   * - useWebPubSubConnection() - Function call
   * - useEffect() - Function call
   * - localStorage.removeItem() - Function call
   * - useEffect() - Function call
   * - console.log() - Function call
   * - areDocumentsEqual() - Function call
   * - console.log() - Function call
   * - areDocumentsEqual() - Function call
   * - console.log() - Function call
   * - safeUpdateUserConfig() - Function call
   * - useEffect() - Function call
   * - fetchUploadedDocuments.mutate() - Function call
   * - handleApiError() - Function call
   * - useEffect() - Function call
   * - .sort() - Function call
   * - .localeCompare() - Function call
   * - setDocuments() - Function call
   * - setLoading() - Function call
   * - useEffect() - Function call
   * - console.log() - Function call
   * - JSON.stringify() - Function call
   * - documents.map() - Function call
   * - .filter() - Function call
   * - .toLowerCase() - Function call
   * - .toLowerCase() - Function call
   * - matchingDocs.reduce() - Function call
   * - parseFloat() - Function call
   * - documents.find() - Function call
   * - console.log() - Function call
   * - setDocuments() - Function call
   * - JSON.stringify() - Function call
   * - JSON.stringify() - Function call
   * - .forEach() - Function call
   * - documents.find() - Function call
   * - .toLowerCase() - Function call
   * - .toLowerCase() - Function call
   * - .match() - Function call
   * - parseInt() - Function call
   * - parseFloat() - Function call
   * - currentStatuses.find() - Function call
   * - console.log() - Function call
   * - .includes() - Function call
   * - .sort() - Function call
   * - .sort() - Function call
   * - parseInt() - Function call
   * - .match() - Function call
   * - parseInt() - Function call
   * - .match() - Function call
   * - .forEach() - Function call
   * - .sort() - Function call
   * - currentStatuses.filter() - Function call
   * - .includes() - Function call
   * - statuses.some() - Function call
   * - console.log() - Function call
   * - JSON.stringify() - Function call
   * - updateStatus() - Function call
   * - JSON.stringify() - Function call
   * - JSON.stringify() - Function call
   * - Object.entries() - Function call
   * - console.log() - Function call
   * - areUploadedDocumentsEqual() - Function call
   * - console.log() - Function call
   * - areUploadedDocumentsEqual() - Function call
   * - console.log() - Function call
   * - safeUpdateUserConfig() - Function call
   * - useEffect() - Function call
   * - setUserConfig() - Function call
   * - safeUpdateUserConfig() - Function call
   * - useEffect() - Function call
   * - console.log() - Function call
   * - localStorage.setItem() - Function call
   * - value.toLowerCase() - Function call
   * - ensureBoolean() - Function call
   * - ensureBoolean() - Function call
   * - ensureBoolean() - Function call
   * - ensureBoolean() - Function call
   * - ensureBoolean() - Function call
   * - fetchDocumentChecklist.mutate() - Function call
   * - console.log() - Function call
   * - localStorage.removeItem() - Function call
   * - console.error() - Function call
   * - handleApiError() - Function call
   * - setLoading() - Function call
   * - localStorage.removeItem() - Function call
   * - console.error() - Function call
   * - handleApiError() - Function call
   * - setLoading() - Function call
   * - fetchChecklistImmediately() - Function call
   * - useEffect() - Function call
   * - handleApiError() - Function call
   * - setDocChecklistBlocked() - Function call
   * - setLoading() - Function call
   * - useCallback() - Function call
   * - setLoading() - Function call
   * - acquireMsalToken() - Function call
   * - value.toLowerCase() - Function call
   * - ensureBoolean() - Function call
   * - ensureBoolean() - Function call
   * - ensureBoolean() - Function call
   * - ensureBoolean() - Function call
   * - ensureBoolean() - Function call
   * - fetchDocumentChecklist.mutate() - Function call
   * - fetchUploadedDocuments.mutate() - Function call
   * - handleApiError() - Function call
   * - setLoading() - Function call
   * - handleApiError() - Function call
   * - setLoading() - Function call
   *
   * WHY IT CALLS THEM:
   * - useState: Required functionality
   * - useState: Required functionality
   * - useState: Required functionality
   * - useState: Required functionality
   * - useState: Required functionality
   * - useMsal: Required functionality
   * - useFetchDocumentChecklist: Data fetching
   * - useFetchUploadedDocuments: Data fetching
   * - useUploadStatusStore: Required functionality
   * - useCreateSecurityGroup: Required functionality
   * - useCreateApplicationRecord: Required functionality
   * - useAuthStore: Required functionality
   * - useProfileStore: Required functionality
   * - useRef: Required functionality
   * - useRef: Required functionality
   * - useRef: Required functionality
   * - useFileUrlWithSas: Required functionality
   * - useRef: Required functionality
   * - useRef: Required functionality
   * - useMemo: Required functionality
   * - useRef: Required functionality
   * - useRef: Required functionality
   * - useCallback: Required functionality
   * - docs1.every: Required functionality
   * - useCallback: Required functionality
   * - docs1.every: Required functionality
   * - useCallback: Required functionality
   * - instance.acquireTokenSilent: Required functionality
   * - console.log: Debugging output
   * - instance.acquireTokenPopup: Required functionality
   * - useEffect: Required functionality
   * - acquireMsalToken: Required functionality
   * - setMsalToken: State update
   * - console.error: Error logging
   * - setMsalToken: State update
   * - toast.error: Required functionality
   * - fetchToken: Data fetching
   * - useCallback: Required functionality
   * - reqValue.toLowerCase: Required functionality
   * - useCallback: Required functionality
   * - console.error: Error logging
   * - toast.error: Required functionality
   * - useCallback: Required functionality
   * - .every: Required functionality
   * - documents.filter: Required functionality
   * - isRequiredDoc: Required functionality
   * - useCallback: Required functionality
   * - toast.error: Required functionality
   * - toast.error: Required functionality
   * - toast.info: Required functionality
   * - getFileUrlWithSas.mutateAsync: Required functionality
   * - window.open: Required functionality
   * - .add: Required functionality
   * - console.error: Error logging
   * - toast.error: Required functionality
   * - useCallback: Required functionality
   * - console.log: Debugging output
   * - console.log: Debugging output
   * - JSON.stringify: Required functionality
   * - docId.match: Required functionality
   * - console.log: Debugging output
   * - console.warn: Warning notification
   * - .push: Required functionality
   * - console.warn: Warning notification
   * - fetchDocumentChecklist.mutate: Data fetching
   * - console.log: Debugging output
   * - console.error: Error logging
   * - handleApiError: Required functionality
   * - documents.find: Required functionality
   * - console.warn: Warning notification
   * - .push: Required functionality
   * - console.log: Debugging output
   * - .match: Required functionality
   * - parseInt: Required functionality
   * - console.log: Debugging output
   * - existingStatuses.find: Required functionality
   * - console.log: Debugging output
   * - JSON.stringify: Required functionality
   * - console.log: Debugging output
   * - .push: Required functionality
   * - parseFloat: Required functionality
   * - fileUrl.includes: Required functionality
   * - console.log: Debugging output
   * - JSON.stringify: Required functionality
   * - .sort: Required functionality
   * - existingStatuses.filter: Required functionality
   * - console.log: Debugging output
   * - JSON.stringify: Required functionality
   * - updateStatus: Required functionality
   * - setDocuments: State update
   * - prevDocuments.map: Required functionality
   * - console.log: Debugging output
   * - JSON.stringify: Required functionality
   * - useEffect: Required functionality
   * - .filter: Required functionality
   * - docId.match: Required functionality
   * - documents.find: Required functionality
   * - .match: Required functionality
   * - parseInt: Required functionality
   * - existingStatuses.find: Required functionality
   * - messagesToProcess.forEach: Required functionality
   * - console.log: Debugging output
   * - handleDocumentUpdate: Required functionality
   * - .filter: Required functionality
   * - messagesToProcess.includes: Required functionality
   * - useWebPubSubConnection: Required functionality
   * - useEffect: Required functionality
   * - localStorage.removeItem: Required functionality
   * - useEffect: Required functionality
   * - console.log: Debugging output
   * - areDocumentsEqual: Required functionality
   * - console.log: Debugging output
   * - areDocumentsEqual: Required functionality
   * - console.log: Debugging output
   * - safeUpdateUserConfig: Required functionality
   * - useEffect: Required functionality
   * - fetchUploadedDocuments.mutate: Data fetching
   * - handleApiError: Required functionality
   * - useEffect: Required functionality
   * - .sort: Required functionality
   * - .localeCompare: Required functionality
   * - setDocuments: State update
   * - setLoading: State update
   * - useEffect: Required functionality
   * - console.log: Debugging output
   * - JSON.stringify: Required functionality
   * - documents.map: Required functionality
   * - .filter: Required functionality
   * - .toLowerCase: Required functionality
   * - .toLowerCase: Required functionality
   * - matchingDocs.reduce: Required functionality
   * - parseFloat: Required functionality
   * - documents.find: Required functionality
   * - console.log: Debugging output
   * - setDocuments: State update
   * - JSON.stringify: Required functionality
   * - JSON.stringify: Required functionality
   * - .forEach: Required functionality
   * - documents.find: Required functionality
   * - .toLowerCase: Required functionality
   * - .toLowerCase: Required functionality
   * - .match: Required functionality
   * - parseInt: Required functionality
   * - parseFloat: Required functionality
   * - currentStatuses.find: Required functionality
   * - console.log: Debugging output
   * - .includes: Required functionality
   * - .sort: Required functionality
   * - .sort: Required functionality
   * - parseInt: Required functionality
   * - .match: Required functionality
   * - parseInt: Required functionality
   * - .match: Required functionality
   * - .forEach: Required functionality
   * - .sort: Required functionality
   * - currentStatuses.filter: Required functionality
   * - .includes: Required functionality
   * - statuses.some: Required functionality
   * - console.log: Debugging output
   * - JSON.stringify: Required functionality
   * - updateStatus: Required functionality
   * - JSON.stringify: Required functionality
   * - JSON.stringify: Required functionality
   * - Object.entries: Required functionality
   * - console.log: Debugging output
   * - areUploadedDocumentsEqual: Required functionality
   * - console.log: Debugging output
   * - areUploadedDocumentsEqual: Required functionality
   * - console.log: Debugging output
   * - safeUpdateUserConfig: Required functionality
   * - useEffect: Required functionality
   * - setUserConfig: State update
   * - safeUpdateUserConfig: Required functionality
   * - useEffect: Required functionality
   * - console.log: Debugging output
   * - localStorage.setItem: State update
   * - value.toLowerCase: Required functionality
   * - ensureBoolean: Required functionality
   * - ensureBoolean: Required functionality
   * - ensureBoolean: Required functionality
   * - ensureBoolean: Required functionality
   * - ensureBoolean: Required functionality
   * - fetchDocumentChecklist.mutate: Data fetching
   * - console.log: Debugging output
   * - localStorage.removeItem: Required functionality
   * - console.error: Error logging
   * - handleApiError: Required functionality
   * - setLoading: State update
   * - localStorage.removeItem: Required functionality
   * - console.error: Error logging
   * - handleApiError: Required functionality
   * - setLoading: State update
   * - fetchChecklistImmediately: Data fetching
   * - useEffect: Required functionality
   * - handleApiError: Required functionality
   * - setDocChecklistBlocked: State update
   * - setLoading: State update
   * - useCallback: Required functionality
   * - setLoading: State update
   * - acquireMsalToken: Required functionality
   * - value.toLowerCase: Required functionality
   * - ensureBoolean: Required functionality
   * - ensureBoolean: Required functionality
   * - ensureBoolean: Required functionality
   * - ensureBoolean: Required functionality
   * - ensureBoolean: Required functionality
   * - fetchDocumentChecklist.mutate: Data fetching
   * - fetchUploadedDocuments.mutate: Data fetching
   * - handleApiError: Required functionality
   * - setLoading: State update
   * - handleApiError: Required functionality
   * - setLoading: State update
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls useState, useState, useState to process data
   * Output: Computed value or side effect
   *
   */
export const useDocumentChecklist = (userConfig: UserConfig) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [user_config, setUserConfig] = useState<UserConfig>(userConfig);
  const [msalToken, setMsalToken] = useState<string | null>(null);
  const [docChecklistBlocked, setDocChecklistBlocked] = useState(false);
  const { instance, accounts } = useMsal();
  const { data: documentCheckList, fetchDocumentChecklist } = useFetchDocumentChecklist();
  const { data: uploadedDocuments, fetchUploadedDocuments } = useFetchUploadedDocuments();
  const { updateStatus, statuses: uploadStatuses } = useUploadStatusStore();
  const { data: securityGroup, createSecurityGroup } = useCreateSecurityGroup();
  const { createApplicationRecord } = useCreateApplicationRecord();
  const { accessToken } = useAuthStore();
  const { profileData, updateUserConfig } = useProfileStore();
  const initialized = useRef(false);
  const lastFetchedConfig = useRef<{ org_id: string; project_id: string } | null>(null);
  const isMounted = useRef(true);
  const { getFileUrlWithSas } = useFileUrlWithSas();
  const openedDocsRef = useRef<Set<string>>(new Set());
  const queuedMessages = useRef<QueuedMessage[]>([]);

    /**
     * BUSINESS LOGIC: memoizedUserConfig
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
  const memoizedUserConfig = useMemo(() => user_config, [user_config.org_id, user_config.project_id, user_config.project]);

  const lastSyncedDocuments = useRef<Document[] | null>(null);
  const lastSyncedUploadedDocuments = useRef<FetchUploadedDocumentsResponse[] | null>(null);

    /**
     * BUSINESS LOGIC: areDocumentsEqual
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Handles user interaction or event
     * 2. Calls docs1.every functions
     * 3. Updates state or triggers effects
     *
     * WHAT IT CALLS:
     * - docs1.every() - Function call
     *
     * WHY IT CALLS THEM:
     * - docs1.every: Required functionality
     *
     * DATA FLOW:
     * Input: Component state and props
     * Processing: Calls docs1.every to process data
     * Output: Event handled, state updated
     *
     * SPECIAL BEHAVIOR:
     * - Memoized for performance optimization
     *
     */
  const areDocumentsEqual = useCallback((docs1: Document[], docs2: Document[]): boolean => {
    if (docs1.length !== docs2.length) return false;
    return docs1.every((doc1, index) => {
      const doc2 = docs2[index];
      return (
        doc1.EncompassId === doc2.EncompassId &&
        doc1.ApplicationDocumentId === doc2.ApplicationDocumentId &&
        doc1.Document === doc2.Document &&
        doc1.Validated === doc2.Validated &&
        doc1.URL === doc2.URL &&
        doc1.Description === doc2.Description &&
        doc1.confidence === doc2.confidence &&
        (doc1 as DocumentWithApiFlag).fromApi === (doc2 as DocumentWithApiFlag).fromApi
      );
    });
  }, []);

    /**
     * BUSINESS LOGIC: areUploadedDocumentsEqual
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Handles user interaction or event
     * 2. Calls docs1.every functions
     * 3. Updates state or triggers effects
     *
     * WHAT IT CALLS:
     * - docs1.every() - Function call
     *
     * WHY IT CALLS THEM:
     * - docs1.every: Required functionality
     *
     * DATA FLOW:
     * Input: Component state and props
     * Processing: Calls docs1.every to process data
     * Output: Event handled, state updated
     *
     * SPECIAL BEHAVIOR:
     * - Memoized for performance optimization
     *
     */
  const areUploadedDocumentsEqual = useCallback(
    (docs1: FetchUploadedDocumentsResponse[], docs2: FetchUploadedDocumentsResponse[]): boolean => {
      if (docs1.length !== docs2.length) return false;
      return docs1.every((doc1, index) => {
        const doc2 = docs2[index];
        return (
          doc1.documentId === doc2.documentId &&
          doc1.bh_name === doc2.bh_name &&
          doc1.blob_url === doc2.blob_url &&
          doc1.confidencepercent === doc2.confidencepercent &&
          doc1.explanation === doc2.explanation &&
          doc1.last_modified === doc2.last_modified
        );
      });
    },
    []
  );

    /**
     * BUSINESS LOGIC: acquireMsalToken
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Handles user interaction or event
     * 2. Calls instance.acquireTokenSilent, console.log, instance.acquireTokenPopup functions
     * 3. Updates state or triggers effects
     *
     * WHAT IT CALLS:
     * - instance.acquireTokenSilent() - Function call
     * - console.log() - Function call
     * - instance.acquireTokenPopup() - Function call
     *
     * WHY IT CALLS THEM:
     * - instance.acquireTokenSilent: Required functionality
     * - console.log: Debugging output
     * - instance.acquireTokenPopup: Required functionality
     *
     * DATA FLOW:
     * Input: instance, accounts state/props
     * Processing: Calls instance.acquireTokenSilent, console.log, instance.acquireTokenPopup to process data
     * Output: Event handled, state updated
     *
     * DEPENDENCIES:
     * - instance: Triggers when instance changes
     * - accounts: Triggers when accounts changes
     *
     * SPECIAL BEHAVIOR:
     * - Memoized for performance optimization
     *
     */
  const acquireMsalToken = useCallback(async () => {
    try {
      if (!accounts[0]) throw new Error('No account found');
      const scope = process.env.NEXT_PUBLIC_MSAL_SCOPE || 'api://32191e63-e253-48de-9ea1-a5337e236fe6/.default';
      if (!scope) throw new Error('MSAL scope not configured');
      const tokenResponse = await instance.acquireTokenSilent({
        scopes: [scope],
        account: accounts[0],
      });
      return tokenResponse.accessToken;
    } catch (error) {
      try {
        console.log(error);
        const tokenResponse = await instance.acquireTokenPopup({
          scopes: [process.env.NEXT_PUBLIC_MSAL_SCOPE || 'api://32191e63-e253-48de-9ea1-a5337e236fe6/.default'],
        });
        return tokenResponse.accessToken;
      } catch (popupError) {
        throw new Error(`Failed to acquire MSAL token: ${popupError}`);
      }
    }
  }, [instance, accounts]);

    /**
     * BUSINESS LOGIC: Side Effect
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Monitors acquireMsalToken for changes
     * 2. Executes acquireMsalToken, setMsalToken, console.error, setMsalToken, toast.error, fetchToken functions
     * 3. Runs side effect logic
     *
     * WHAT IT CALLS:
     * - acquireMsalToken() - Function call
     * - setMsalToken() - Function call
     * - console.error() - Function call
     * - setMsalToken() - Function call
     * - toast.error() - Function call
     * - fetchToken() - Function call
     *
     * WHY IT CALLS THEM:
     * - acquireMsalToken: Required functionality
     * - setMsalToken: State update
     * - console.error: Error logging
     * - setMsalToken: State update
     * - toast.error: Required functionality
     * - fetchToken: Data fetching
     *
     * DATA FLOW:
     * Input: acquireMsalToken state/props
     * Processing: Calls acquireMsalToken, setMsalToken, console.error to process data
     * Output: Side effects executed, cleanup registered
     *
     * DEPENDENCIES:
     * - acquireMsalToken: Triggers when acquireMsalToken changes
     *
     */
  useEffect(() => {
      /**
       * BUSINESS LOGIC: fetchToken
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Implements fetchToken logic
       * 2. Calls helper functions: acquireMsalToken, setMsalToken, console.error, setMsalToken, toast.error
       * 3. Returns computed result
       *
       * WHAT IT CALLS:
       * - acquireMsalToken() - Function call
       * - setMsalToken() - Function call
       * - console.error() - Function call
       * - setMsalToken() - Function call
       * - toast.error() - Function call
       *
       * WHY IT CALLS THEM:
       * - acquireMsalToken: Required functionality
       * - setMsalToken: State update
       * - console.error: Error logging
       * - setMsalToken: State update
       * - toast.error: Required functionality
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Calls acquireMsalToken, setMsalToken, console.error to process data
       * Output: Computed value or side effect
       *
       */
    const fetchToken = async () => {
      try {
        const token = await acquireMsalToken();
        setMsalToken(token);
      } catch (error) {
        console.error('Error acquiring MSAL token:', error);
        setMsalToken(null);
        toast.error('Authentication Error', { description: 'Failed to acquire access token.' });
      }
    };
    fetchToken();
  }, [acquireMsalToken]);

    /**
     * BUSINESS LOGIC: isRequiredDoc
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Handles user interaction or event
     * 2. Calls reqValue.toLowerCase functions
     * 3. Updates state or triggers effects
     *
     * WHAT IT CALLS:
     * - reqValue.toLowerCase() - Function call
     *
     * WHY IT CALLS THEM:
     * - reqValue.toLowerCase: Required functionality
     *
     * DATA FLOW:
     * Input: Component state and props
     * Processing: Calls reqValue.toLowerCase to process data
     * Output: Event handled, state updated
     *
     * SPECIAL BEHAVIOR:
     * - Memoized for performance optimization
     *
     */
  const isRequiredDoc = useCallback((reqValue: string | undefined): boolean => {
    if (!reqValue) return false;
    const req = reqValue.toLowerCase();
    return req === 'required' || req === 'conditionally required';
  }, []);

    /**
     * BUSINESS LOGIC: handleApiError
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Handles user interaction or event
     * 2. Calls console.error, toast.error functions
     * 3. Updates state or triggers effects
     *
     * WHAT IT CALLS:
     * - console.error() - Function call
     * - toast.error() - Function call
     *
     * WHY IT CALLS THEM:
     * - console.error: Error logging
     * - toast.error: Required functionality
     *
     * DATA FLOW:
     * Input: Component state and props
     * Processing: Calls console.error, toast.error to process data
     * Output: Event handled, state updated
     *
     * SPECIAL BEHAVIOR:
     * - Memoized for performance optimization
     *
     */
  const handleApiError = useCallback((error: unknown, title: string, message: string) => {
    console.error(`${title}:`, error);
    toast.error(title, { description: message });
  }, []);

    /**
     * BUSINESS LOGIC: allDocumentsValidated
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Handles user interaction or event
     * 2. Calls .every, documents.filter, isRequiredDoc functions
     * 3. Updates state or triggers effects
     *
     * WHAT IT CALLS:
     * - .every() - Function call
     * - documents.filter() - Function call
     * - isRequiredDoc() - Function call
     *
     * WHY IT CALLS THEM:
     * - .every: Required functionality
     * - documents.filter: Required functionality
     * - isRequiredDoc: Required functionality
     *
     * DATA FLOW:
     * Input: documents, isRequiredDoc state/props
     * Processing: Calls .every, documents.filter, isRequiredDoc to process data
     * Output: Event handled, state updated
     *
     * DEPENDENCIES:
     * - documents: Triggers when documents changes
     * - isRequiredDoc: Triggers when isRequiredDoc changes
     *
     * SPECIAL BEHAVIOR:
     * - Memoized for performance optimization
     *
     */
  const allDocumentsValidated = useCallback(
    () => documents.filter((d) => isRequiredDoc(d.Requirement)).every((doc) => doc.Validated === true),
    [documents, isRequiredDoc]
  );

    /**
     * BUSINESS LOGIC: createUploadStatus
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
  const createUploadStatus = useCallback(
    (isValidated: boolean, fileUrl: string | undefined, fileIndex: number, description: string | undefined): UploadStatus => ({
      status: isValidated ? 'validated' : 'not_validated',
      fileUrl,
      fileIndex,
      description
    }),
    []
  );

    /**
     * BUSINESS LOGIC: handleDocumentLinkClick
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Implements handleDocumentLinkClick logic
     * 2. Calls helper functions: toast.error, toast.error, toast.info, getFileUrlWithSas.mutateAsync, window.open, .add, console.error, toast.error
     * 3. Returns computed result
     *
     * WHAT IT CALLS:
     * - toast.error() - Function call
     * - toast.error() - Function call
     * - toast.info() - Function call
     * - getFileUrlWithSas.mutateAsync() - Function call
     * - window.open() - Function call
     * - .add() - Function call
     * - console.error() - Function call
     * - toast.error() - Function call
     *
     * WHY IT CALLS THEM:
     * - toast.error: Required functionality
     * - toast.error: Required functionality
     * - toast.info: Required functionality
     * - getFileUrlWithSas.mutateAsync: Required functionality
     * - window.open: Required functionality
     * - .add: Required functionality
     * - console.error: Error logging
     * - toast.error: Required functionality
     *
     * DATA FLOW:
     * Input: Component state and props
     * Processing: Calls toast.error, toast.error, toast.info to process data
     * Output: Computed value or side effect
     *
     */
  const handleDocumentLinkClick = async (doc: DocumentWithApiFlag) => {
    if (!doc.URL) {
      toast.error("Document URL missing", {
        description: "Unable to open the document. No blob URL found.",
      });
      return;
    }
    if (!doc.EncompassId) {
      toast.error("Document ID missing", {
        description: "Cannot identify the document to open.",
      });
      return;
    }

    toast.info("Preparing document", {
      description: "Generating secure link for document access.",
    });
    try {
      const response = await getFileUrlWithSas.mutateAsync({
        token: accessToken || '',
        payload: {
          fileUrl: doc.URL,
        },
      });
      if (response?.url) {
        window.open(response.url, '_blank');
        openedDocsRef.current.add(doc.EncompassId);
      } else {
        throw new Error("SAS URL missing from API response");
      }
    } catch (err) {
      console.error("SAS generation error", err);
      toast.error("Failed to open document", {
        description: "There was a problem generating the secure link.",
      });
    }
  };

  /**
   * BUSINESS LOGIC: handleDocumentUpdate
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Handles user interaction or event
   * 2. Calls console.log, console.log, JSON.stringify, docId.match, console.log, console.warn, .push, console.warn, fetchDocumentChecklist.mutate, console.log, console.error, handleApiError, documents.find, console.warn, .push, console.log, .match, parseInt, console.log, existingStatuses.find, console.log, JSON.stringify, console.log, .push, parseFloat, fileUrl.includes, console.log, JSON.stringify, .sort, existingStatuses.filter, console.log, JSON.stringify, updateStatus, setDocuments, prevDocuments.map, console.log, JSON.stringify functions
   * 3. Updates state or triggers effects
   *
   * WHAT IT CALLS:
   * - console.log() - Function call
   * - console.log() - Function call
   * - JSON.stringify() - Function call
   * - docId.match() - Function call
   * - console.log() - Function call
   * - console.warn() - Function call
   * - .push() - Function call
   * - console.warn() - Function call
   * - fetchDocumentChecklist.mutate() - Function call
   * - console.log() - Function call
   * - console.error() - Function call
   * - handleApiError() - Function call
   * - documents.find() - Function call
   * - console.warn() - Function call
   * - .push() - Function call
   * - console.log() - Function call
   * - .match() - Function call
   * - parseInt() - Function call
   * - console.log() - Function call
   * - existingStatuses.find() - Function call
   * - console.log() - Function call
   * - JSON.stringify() - Function call
   * - console.log() - Function call
   * - .push() - Function call
   * - parseFloat() - Function call
   * - fileUrl.includes() - Function call
   * - console.log() - Function call
   * - JSON.stringify() - Function call
   * - .sort() - Function call
   * - existingStatuses.filter() - Function call
   * - console.log() - Function call
   * - JSON.stringify() - Function call
   * - updateStatus() - Function call
   * - setDocuments() - Function call
   * - prevDocuments.map() - Function call
   * - console.log() - Function call
   * - JSON.stringify() - Function call
   *
   * WHY IT CALLS THEM:
   * - console.log: Debugging output
   * - console.log: Debugging output
   * - JSON.stringify: Required functionality
   * - docId.match: Required functionality
   * - console.log: Debugging output
   * - console.warn: Warning notification
   * - .push: Required functionality
   * - console.warn: Warning notification
   * - fetchDocumentChecklist.mutate: Data fetching
   * - console.log: Debugging output
   * - console.error: Error logging
   * - handleApiError: Required functionality
   * - documents.find: Required functionality
   * - console.warn: Warning notification
   * - .push: Required functionality
   * - console.log: Debugging output
   * - .match: Required functionality
   * - parseInt: Required functionality
   * - console.log: Debugging output
   * - existingStatuses.find: Required functionality
   * - console.log: Debugging output
   * - JSON.stringify: Required functionality
   * - console.log: Debugging output
   * - .push: Required functionality
   * - parseFloat: Required functionality
   * - fileUrl.includes: Required functionality
   * - console.log: Debugging output
   * - JSON.stringify: Required functionality
   * - .sort: Required functionality
   * - existingStatuses.filter: Required functionality
   * - console.log: Debugging output
   * - JSON.stringify: Required functionality
   * - updateStatus: Required functionality
   * - setDocuments: State update
   * - prevDocuments.map: Required functionality
   * - console.log: Debugging output
   * - JSON.stringify: Required functionality
   *
   * DATA FLOW:
   * Input: updateStatus, uploadStatuses, documents, msalToken, memoizedUserConfig, fetchDocumentChecklist, handleApiError state/props
   * Processing: Calls console.log, console.log, JSON.stringify to process data
   * Output: Event handled, state updated
   *
   * DEPENDENCIES:
   * - updateStatus: Triggers when updateStatus changes
   * - uploadStatuses: Triggers when uploadStatuses changes
   * - documents: Triggers when documents changes
   * - msalToken: Triggers when msalToken changes
   * - memoizedUserConfig: Triggers when memoizedUserConfig changes
   * - fetchDocumentChecklist: Triggers when fetchDocumentChecklist changes
   * - handleApiError: Triggers when handleApiError changes
   *
   * SPECIAL BEHAVIOR:
   * - Memoized for performance optimization
   *
   */
const handleDocumentUpdate = useCallback(
  (
    docId: string,
    metadata: Metadata & {
      documentId?: string;
      document_name?: string;
      confidencepercent: string;
      explanation?: string;
    },
    isValidated: boolean | undefined,
    fileUrl?: string
  ) => {
    console.log('WebSocket Message Received:', { docId, metadata, isValidated, fileUrl });
    console.log('Current uploadStatuses:', JSON.stringify(uploadStatuses));
    const docIdMatch = docId.match(/^(\d+)/);
    const cleanDocId = docIdMatch ? docIdMatch[1] : docId;
    console.log('Cleaned docId:', cleanDocId);

    if (documents.length > 0) {
      const targetDoc = documents.find((doc) => doc.EncompassId === cleanDocId);
      if (!targetDoc) {
        console.warn(`No document found with EncompassId: ${cleanDocId}. Queuing message.`);
        queuedMessages.current.push({ docId, metadata, isValidated, fileUrl });
        return;
      }

      const applicationDocumentId = targetDoc.ApplicationDocumentId || '';
      console.log('ApplicationDocumentId:', applicationDocumentId);

      const fileIndexMatch = metadata.documentId?.match(/-(\d+)$/) || ['', '0'];
      const fileIndex = parseInt(fileIndexMatch[1], 10);
      console.log('File Index:', fileIndex);

      const existingStatuses = uploadStatuses[applicationDocumentId] || [];
      const existingStatus = existingStatuses.find((s) => s.fileIndex === fileIndex);
      console.log('Existing Status for fileIndex:', JSON.stringify(existingStatus));

      if (existingStatus?.status === 'uploading') {
        console.log(`Document ${cleanDocId} at fileIndex ${fileIndex} is in 'uploading' state. Queuing message.`);
        queuedMessages.current.push({ docId, metadata, isValidated, fileUrl });
        return;
      }

      const confidence = parseFloat(metadata.confidencepercent || '0');
      const effectiveIsValidated = isValidated !== undefined ? isValidated : confidence >= 60;

      const expectedDocumentId = fileIndex === 0 ? cleanDocId : `${cleanDocId}-${fileIndex}`;
      const isCorrectFileUrl = fileUrl?.includes(`${expectedDocumentId}.pdf`);

      const newStatus: UploadStatus = {
        status: effectiveIsValidated ? 'validated' : 'not_validated',
        fileUrl: isCorrectFileUrl ? fileUrl || existingStatus?.fileUrl : existingStatus?.fileUrl,
        fileIndex,
        description: metadata.explanation || 'Document processed.',
      };
      console.log('New Status:', JSON.stringify(newStatus));

      const updatedStatuses: UploadStatus[] = [
        ...existingStatuses.filter((s) => s.fileIndex !== fileIndex),
        newStatus,
      ].sort((a, b) => a.fileIndex - b.fileIndex);
      console.log('Updated uploadStatuses:', JSON.stringify(updatedStatuses));
      updateStatus(applicationDocumentId, updatedStatuses);

      setDocuments((prevDocuments) => {
        const newDocuments = prevDocuments.map((doc) =>
          doc.EncompassId === cleanDocId
            ? {
                ...doc,
                Validated: effectiveIsValidated,
                Description: typeof metadata?.explanation === 'string' ? metadata.explanation : undefined,
                confidence: metadata.confidencepercent,
                URL: isCorrectFileUrl ? fileUrl || doc.URL : doc.URL,
                fromApi: true,
              }
            : doc
        );

        console.log('New Documents:', JSON.stringify(newDocuments));
        return newDocuments;
      });
    } else {
      console.warn('Documents array is empty. Queuing message and triggering fetchDocumentChecklist.');
      queuedMessages.current.push({ docId, metadata, isValidated, fileUrl });

      if (msalToken && memoizedUserConfig.org_id) {
        const payload: FetchDocumentChecklistRequest = {
          user_config: {
            org_id: memoizedUserConfig.org_id,
            project: {
              development_type: memoizedUserConfig.project?.development_type || '',
              planning_pathway: memoizedUserConfig.project?.planning_pathway || '',
              is_bushfire_zone: memoizedUserConfig.project?.is_bushfire_zone || false,
              is_heritage_zone: memoizedUserConfig.project?.is_heritage_zone || false,
              is_flood_zone: memoizedUserConfig.project?.is_flood_zone || false,
              is_battle_axe_lot: memoizedUserConfig.project?.is_battle_axe_lot || false,
              is_corner_lot: memoizedUserConfig.project?.is_corner_lot || false,
            },
          },
        };
        fetchDocumentChecklist.mutate(
          { token: msalToken, payload },
          {
            onSuccess: (data) => {
              console.log('Document checklist fetched successfully in handleDocumentUpdate:', data);
            },
            onError: (error) => {
              console.error('Failed to fetch document checklist in handleDocumentUpdate:', error);
              handleApiError(error, 'Fetch Error', 'Failed to fetch document checklist.');
              queuedMessages.current = [];
            },
          }
        );
      } else {
        console.warn('Cannot fetch document checklist: msalToken or org_id missing.', {
          msalToken,
          org_id: memoizedUserConfig.org_id,
        });
        queuedMessages.current = [];
      }
    }
  },
  [updateStatus, uploadStatuses, documents, msalToken, memoizedUserConfig, fetchDocumentChecklist, handleApiError]
);

  /**
   * BUSINESS LOGIC: Side Effect
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Monitors documents, uploadStatuses, handleDocumentUpdate for changes
   * 2. Executes .filter, docId.match, documents.find, .match, parseInt, existingStatuses.find, messagesToProcess.forEach, console.log, handleDocumentUpdate, .filter, messagesToProcess.includes functions
   * 3. Runs side effect logic
   *
   * WHAT IT CALLS:
   * - .filter() - Function call
   * - docId.match() - Function call
   * - documents.find() - Function call
   * - .match() - Function call
   * - parseInt() - Function call
   * - existingStatuses.find() - Function call
   * - messagesToProcess.forEach() - Function call
   * - console.log() - Function call
   * - handleDocumentUpdate() - Function call
   * - .filter() - Function call
   * - messagesToProcess.includes() - Function call
   *
   * WHY IT CALLS THEM:
   * - .filter: Required functionality
   * - docId.match: Required functionality
   * - documents.find: Required functionality
   * - .match: Required functionality
   * - parseInt: Required functionality
   * - existingStatuses.find: Required functionality
   * - messagesToProcess.forEach: Required functionality
   * - console.log: Debugging output
   * - handleDocumentUpdate: Required functionality
   * - .filter: Required functionality
   * - messagesToProcess.includes: Required functionality
   *
   * DATA FLOW:
   * Input: documents, uploadStatuses, handleDocumentUpdate state/props
   * Processing: Calls .filter, docId.match, documents.find to process data
   * Output: Side effects executed, cleanup registered
   *
   * DEPENDENCIES:
   * - documents: Triggers when documents changes
   * - uploadStatuses: Triggers when uploadStatuses changes
   * - handleDocumentUpdate: Triggers when handleDocumentUpdate changes
   *
   */
useEffect(() => {
  if (queuedMessages.current.length === 0) return;

  const messagesToProcess = queuedMessages.current.filter(({ docId, metadata }) => {
    if (documents.length === 0) return false;

    const docIdMatch = docId.match(/^(\d+)/);
    const cleanDocId = docIdMatch ? docIdMatch[1] : docId;
    const targetDoc = documents.find((doc) => doc.EncompassId === cleanDocId);
    if (!targetDoc) return false;

    const applicationDocumentId = targetDoc.ApplicationDocumentId || '';
    const fileIndexMatch = metadata.documentId?.match(/-(\d+)$/) || ['', '0'];
    const fileIndex = parseInt(fileIndexMatch[1], 10);
    const existingStatuses = uploadStatuses[applicationDocumentId] || [];
    const existingStatus = existingStatuses.find((s) => s.fileIndex === fileIndex);

    return !existingStatus || existingStatus.status === 'completed';
  });

  if (messagesToProcess.length > 0) {
    messagesToProcess.forEach(({ docId, metadata, isValidated, fileUrl }) => {
      console.log(`Processing queued message for docId: ${docId}, fileIndex: ${metadata.documentId}`);
      handleDocumentUpdate(docId, metadata, isValidated, fileUrl);
    });

    queuedMessages.current = queuedMessages.current.filter(
      (msg) => !messagesToProcess.includes(msg)
    );
  }
}, [documents, uploadStatuses, handleDocumentUpdate]);

useWebPubSubConnection(msalToken, handleDocumentUpdate);

  /**
   * BUSINESS LOGIC: Side Effect
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Executes localStorage.removeItem functions
   * 2. Runs side effect logic
   *
   * WHAT IT CALLS:
   * - localStorage.removeItem() - Function call
   *
   * WHY IT CALLS THEM:
   * - localStorage.removeItem: Required functionality
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls localStorage.removeItem to process data
   * Output: Side effects executed, cleanup registered
   *
   * SPECIAL BEHAVIOR:
   * - Runs only on component mount
   *
   */
useEffect(() => {
  return () => {
    isMounted.current = false;
    // Clean up localStorage flag when component unmounts
    localStorage.removeItem("documentChecklistFetchStarted");
  };
}, []);

  /**
   * BUSINESS LOGIC: Side Effect
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Monitors documents, profileData, updateUserConfig, areDocumentsEqual for changes
   * 2. Executes console.log, areDocumentsEqual, console.log, areDocumentsEqual, console.log, safeUpdateUserConfig functions
   * 3. Runs side effect logic
   *
   * WHAT IT CALLS:
   * - console.log() - Function call
   * - areDocumentsEqual() - Function call
   * - console.log() - Function call
   * - areDocumentsEqual() - Function call
   * - console.log() - Function call
   * - safeUpdateUserConfig() - Function call
   *
   * WHY IT CALLS THEM:
   * - console.log: Debugging output
   * - areDocumentsEqual: Required functionality
   * - console.log: Debugging output
   * - areDocumentsEqual: Required functionality
   * - console.log: Debugging output
   * - safeUpdateUserConfig: Required functionality
   *
   * DATA FLOW:
   * Input: documents, profileData, updateUserConfig, areDocumentsEqual state/props
   * Processing: Calls console.log, areDocumentsEqual, console.log to process data
   * Output: Side effects executed, cleanup registered
   *
   * DEPENDENCIES:
   * - documents: Triggers when documents changes
   * - profileData: Triggers when profileData changes
   * - updateUserConfig: Triggers when updateUserConfig changes
   * - areDocumentsEqual: Triggers when areDocumentsEqual changes
   *
   */
useEffect(() => {
  if (documents?.length > 0 && profileData) {
    const currentDocs = profileData.user_config?.project?.documents || [];

    if (lastSyncedDocuments.current && areDocumentsEqual(documents, lastSyncedDocuments.current)) {
      console.log('Documents unchanged, skipping sync');
      return;
    }

    if (areDocumentsEqual(documents, currentDocs)) {
      console.log('Documents match profileData, skipping sync');
      lastSyncedDocuments.current = documents;
      return;
    }

    console.log('Syncing documents with profileData');
    safeUpdateUserConfig('user_config.project.documents', documents, profileData, updateUserConfig);
    lastSyncedDocuments.current = documents;
  }
}, [documents, profileData, updateUserConfig, areDocumentsEqual]);

  /**
   * BUSINESS LOGIC: Side Effect
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Monitors accessToken, fetchUploadedDocuments, handleApiError for changes
   * 2. Executes fetchUploadedDocuments.mutate, handleApiError functions
   * 3. Runs side effect logic
   *
   * WHAT IT CALLS:
   * - fetchUploadedDocuments.mutate() - Function call
   * - handleApiError() - Function call
   *
   * WHY IT CALLS THEM:
   * - fetchUploadedDocuments.mutate: Data fetching
   * - handleApiError: Required functionality
   *
   * DATA FLOW:
   * Input: accessToken, fetchUploadedDocuments, handleApiError state/props
   * Processing: Calls fetchUploadedDocuments.mutate, handleApiError to process data
   * Output: Side effects executed, cleanup registered
   *
   * DEPENDENCIES:
   * - accessToken: Triggers when accessToken changes
   * - fetchUploadedDocuments: Triggers when fetchUploadedDocuments changes
   * - handleApiError: Triggers when handleApiError changes
   *
   */
useEffect(() => {
  if (!accessToken || !memoizedUserConfig.org_id || !memoizedUserConfig.project_id) {
    return;
  }

  const currentConfig = {
    org_id: memoizedUserConfig.org_id,
    project_id: memoizedUserConfig.project_id,
  };

  if (
    lastFetchedConfig.current &&
    lastFetchedConfig.current.org_id === currentConfig.org_id &&
    lastFetchedConfig.current.project_id === currentConfig.project_id
  ) {
    return;
  }

  lastFetchedConfig.current = currentConfig;
  fetchUploadedDocuments.mutate(
    {
      token: accessToken,
      payload: { user_config: currentConfig },
    },
    {
      onError: (error) => {
        lastFetchedConfig.current = null;
        handleApiError(error, 'Error', 'Failed to fetch uploaded documents.');
      },
    }
  );
}, [accessToken, memoizedUserConfig.org_id, memoizedUserConfig.project_id, fetchUploadedDocuments, handleApiError]);

  /**
   * BUSINESS LOGIC: Side Effect
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Monitors documentCheckList for changes
   * 2. Executes .sort, .localeCompare, setDocuments, setLoading functions
   * 3. Runs side effect logic
   *
   * WHAT IT CALLS:
   * - .sort() - Function call
   * - .localeCompare() - Function call
   * - setDocuments() - Function call
   * - setLoading() - Function call
   *
   * WHY IT CALLS THEM:
   * - .sort: Required functionality
   * - .localeCompare: Required functionality
   * - setDocuments: State update
   * - setLoading: State update
   *
   * DATA FLOW:
   * Input: documentCheckList state/props
   * Processing: Calls .sort, .localeCompare, setDocuments to process data
   * Output: Side effects executed, cleanup registered
   *
   * DEPENDENCIES:
   * - documentCheckList: Triggers when documentCheckList changes
   *
   */
useEffect(() => {
  if (documentCheckList) {
    const sortedDocuments = [...documentCheckList].sort((a: Document, b: Document) =>
      (a.Document || '').localeCompare(b.Document || '')
    );
    setDocuments(sortedDocuments);
    setLoading(false);
  }
}, [documentCheckList]);

  /**
   * BUSINESS LOGIC: Side Effect
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Monitors uploadedDocuments, documents, createUploadStatus, updateStatus, profileData, updateUserConfig, uploadStatuses, areUploadedDocumentsEqual for changes
   * 2. Executes console.log, JSON.stringify, documents.map, .filter, .toLowerCase, .toLowerCase, matchingDocs.reduce, parseFloat, documents.find, console.log, setDocuments, JSON.stringify, JSON.stringify, .forEach, documents.find, .toLowerCase, .toLowerCase, .match, parseInt, parseFloat, currentStatuses.find, console.log, .includes, .sort, .sort, parseInt, .match, parseInt, .match, .forEach, .sort, currentStatuses.filter, .includes, statuses.some, console.log, JSON.stringify, updateStatus, JSON.stringify, JSON.stringify, Object.entries, console.log, areUploadedDocumentsEqual, console.log, areUploadedDocumentsEqual, console.log, safeUpdateUserConfig functions
   * 3. Runs side effect logic
   *
   * WHAT IT CALLS:
   * - console.log() - Function call
   * - JSON.stringify() - Function call
   * - documents.map() - Function call
   * - .filter() - Function call
   * - .toLowerCase() - Function call
   * - .toLowerCase() - Function call
   * - matchingDocs.reduce() - Function call
   * - parseFloat() - Function call
   * - documents.find() - Function call
   * - console.log() - Function call
   * - setDocuments() - Function call
   * - JSON.stringify() - Function call
   * - JSON.stringify() - Function call
   * - .forEach() - Function call
   * - documents.find() - Function call
   * - .toLowerCase() - Function call
   * - .toLowerCase() - Function call
   * - .match() - Function call
   * - parseInt() - Function call
   * - parseFloat() - Function call
   * - currentStatuses.find() - Function call
   * - console.log() - Function call
   * - .includes() - Function call
   * - .sort() - Function call
   * - .sort() - Function call
   * - parseInt() - Function call
   * - .match() - Function call
   * - parseInt() - Function call
   * - .match() - Function call
   * - .forEach() - Function call
   * - .sort() - Function call
   * - currentStatuses.filter() - Function call
   * - .includes() - Function call
   * - statuses.some() - Function call
   * - console.log() - Function call
   * - JSON.stringify() - Function call
   * - updateStatus() - Function call
   * - JSON.stringify() - Function call
   * - JSON.stringify() - Function call
   * - Object.entries() - Function call
   * - console.log() - Function call
   * - areUploadedDocumentsEqual() - Function call
   * - console.log() - Function call
   * - areUploadedDocumentsEqual() - Function call
   * - console.log() - Function call
   * - safeUpdateUserConfig() - Function call
   *
   * WHY IT CALLS THEM:
   * - console.log: Debugging output
   * - JSON.stringify: Required functionality
   * - documents.map: Required functionality
   * - .filter: Required functionality
   * - .toLowerCase: Required functionality
   * - .toLowerCase: Required functionality
   * - matchingDocs.reduce: Required functionality
   * - parseFloat: Required functionality
   * - documents.find: Required functionality
   * - console.log: Debugging output
   * - setDocuments: State update
   * - JSON.stringify: Required functionality
   * - JSON.stringify: Required functionality
   * - .forEach: Required functionality
   * - documents.find: Required functionality
   * - .toLowerCase: Required functionality
   * - .toLowerCase: Required functionality
   * - .match: Required functionality
   * - parseInt: Required functionality
   * - parseFloat: Required functionality
   * - currentStatuses.find: Required functionality
   * - console.log: Debugging output
   * - .includes: Required functionality
   * - .sort: Required functionality
   * - .sort: Required functionality
   * - parseInt: Required functionality
   * - .match: Required functionality
   * - parseInt: Required functionality
   * - .match: Required functionality
   * - .forEach: Required functionality
   * - .sort: Required functionality
   * - currentStatuses.filter: Required functionality
   * - .includes: Required functionality
   * - statuses.some: Required functionality
   * - console.log: Debugging output
   * - JSON.stringify: Required functionality
   * - updateStatus: Required functionality
   * - JSON.stringify: Required functionality
   * - JSON.stringify: Required functionality
   * - Object.entries: Required functionality
   * - console.log: Debugging output
   * - areUploadedDocumentsEqual: Required functionality
   * - console.log: Debugging output
   * - areUploadedDocumentsEqual: Required functionality
   * - console.log: Debugging output
   * - safeUpdateUserConfig: Required functionality
   *
   * DATA FLOW:
   * Input: uploadedDocuments, documents, createUploadStatus, updateStatus, profileData, updateUserConfig, uploadStatuses, areUploadedDocumentsEqual state/props
   * Processing: Calls console.log, JSON.stringify, documents.map to process data
   * Output: Side effects executed, cleanup registered
   *
   * DEPENDENCIES:
   * - uploadedDocuments: Triggers when uploadedDocuments changes
   * - documents: Triggers when documents changes
   * - createUploadStatus: Triggers when createUploadStatus changes
   * - updateStatus: Triggers when updateStatus changes
   * - profileData: Triggers when profileData changes
   * - updateUserConfig: Triggers when updateUserConfig changes
   * - uploadStatuses: Triggers when uploadStatuses changes
   * - areUploadedDocumentsEqual: Triggers when areUploadedDocumentsEqual changes
   *
   */
useEffect(() => {
  if (!uploadedDocuments || documents.length === 0) return;

  console.log('Processing uploadedDocuments:', JSON.stringify(uploadedDocuments));

  const newDocuments = documents.map((doc: Document): DocumentWithApiFlag => {
    const matchingDocs = (uploadedDocuments as FetchUploadedDocumentsResponse[]).filter(
      (u) => u.bh_name?.toLowerCase() === doc.Document?.toLowerCase()
    );

    if (matchingDocs.length === 0) return doc;

    const latestDoc = matchingDocs.reduce((latest, current) =>
      new Date(current.last_modified || 0) > new Date(latest.last_modified || 0) ? current : latest
    );
    const confidence = parseFloat(latestDoc.confidencepercent || '0');
    const isValidated = !!latestDoc.confidencepercent && confidence >= 60;

    const currentDoc = documents.find((d) => d.EncompassId === doc.EncompassId);
    const isSame =
      currentDoc?.Validated === isValidated &&
      currentDoc?.URL === latestDoc.blob_url &&
      currentDoc?.confidence === latestDoc.confidencepercent;

    if (isSame) {
      return doc;
    }

    return {
      ...doc,
      Validated: isValidated,
      URL: latestDoc.blob_url,
      confidence: latestDoc.confidencepercent,
      fromApi: true,
      Description: latestDoc.explanation,
    };
  });

  if (JSON.stringify(newDocuments) !== JSON.stringify(documents)) {
    console.log('Updating documents from uploadedDocuments');
    setDocuments(newDocuments);
  }

  const statusesToUpdate: Record<string, UploadStatus[]> = {};
  [...(uploadedDocuments as FetchUploadedDocumentsResponse[])]
    .sort((a, b) => {
      const aIndex = parseInt(a.documentId?.match(/-(\d+)$/)?.[1] || '0', 10);
      const bIndex = parseInt(b.documentId?.match(/-(\d+)$/)?.[1] || '0', 10);
      return aIndex - bIndex;
    })
    .forEach((u) => {
      const doc = documents.find((d) => d.Document?.toLowerCase() === u.bh_name?.toLowerCase());
      if (doc) {
        const fileIndexMatch = u.documentId?.match(/-(\d+)$/) || ['', '0'];
        const fileIndex = parseInt(fileIndexMatch[1], 10);
        const confidence = parseFloat(u.confidencepercent || '0');
        const isValidated = !!u.confidencepercent && confidence >= 60;
        const status: UploadStatus = {
          status: isValidated ? 'validated' : 'not_validated',
          fileUrl: u.blob_url,
          fileIndex,
          description: u.explanation,
        };
        const docId = doc.ApplicationDocumentId;
        const currentStatuses = uploadStatuses[docId] || [];
        const existingStatus = currentStatuses.find((s) => s.fileIndex === fileIndex);
        if (existingStatus && ['uploading', 'completed'].includes(existingStatus.status)) {
          console.log(`Skipping update for docId: ${docId}, fileIndex: ${fileIndex}, status: ${existingStatus.status}`);
          return; // Preserve in-progress statuses
        }
        statusesToUpdate[docId] = [...(statusesToUpdate[docId] || []), status].sort((a, b) => a.fileIndex - b.fileIndex);
      }
    });

  Object.entries(statusesToUpdate).forEach(([docId, statuses]) => {
    const currentStatuses = uploadStatuses[docId] || [];
    const mergedStatuses = [
      ...currentStatuses.filter(
        (s) => ['uploading', 'completed'].includes(s.status) || !statuses.some((ns) => ns.fileIndex === s.fileIndex)
      ),
      ...statuses,
    ].sort((a, b) => a.fileIndex - b.fileIndex);
    if (JSON.stringify(mergedStatuses) !== JSON.stringify(currentStatuses)) {
      console.log(`Updating statuses for docId: ${docId}, new statuses:`, JSON.stringify(mergedStatuses));
      updateStatus(docId, mergedStatuses);
    }
  });

  if (profileData) {
    const currentUploadedDocs = profileData.user_config?.project?.uploaded_documents || [];
    if (
      lastSyncedUploadedDocuments.current &&
      areUploadedDocumentsEqual(uploadedDocuments as FetchUploadedDocumentsResponse[], lastSyncedUploadedDocuments.current)
    ) {
      console.log('Uploaded documents unchanged, skipping sync');
      return;
    }
    if (areUploadedDocumentsEqual(uploadedDocuments as FetchUploadedDocumentsResponse[], currentUploadedDocs)) {
      console.log('Uploaded documents match profileData, skipping sync');
      lastSyncedUploadedDocuments.current = uploadedDocuments as FetchUploadedDocumentsResponse[];
      return;
    }
    console.log('Syncing uploaded documents with profileData');
    safeUpdateUserConfig('user_config.project.uploaded_documents', uploadedDocuments, profileData, updateUserConfig);
    lastSyncedUploadedDocuments.current = uploadedDocuments as FetchUploadedDocumentsResponse[];
  }
}, [uploadedDocuments, documents, createUploadStatus, updateStatus, profileData, updateUserConfig, uploadStatuses, areUploadedDocumentsEqual]);

  /**
   * BUSINESS LOGIC: Side Effect
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Monitors securityGroup, profileData, updateUserConfig, memoizedUserConfig for changes
   * 2. Executes setUserConfig, safeUpdateUserConfig functions
   * 3. Runs side effect logic
   *
   * WHAT IT CALLS:
   * - setUserConfig() - Function call
   * - safeUpdateUserConfig() - Function call
   *
   * WHY IT CALLS THEM:
   * - setUserConfig: State update
   * - safeUpdateUserConfig: Required functionality
   *
   * DATA FLOW:
   * Input: securityGroup, profileData, updateUserConfig, memoizedUserConfig state/props
   * Processing: Calls setUserConfig, safeUpdateUserConfig to process data
   * Output: Side effects executed, cleanup registered
   *
   * DEPENDENCIES:
   * - securityGroup: Triggers when securityGroup changes
   * - profileData: Triggers when profileData changes
   * - updateUserConfig: Triggers when updateUserConfig changes
   * - memoizedUserConfig: Triggers when memoizedUserConfig changes
   *
   */
useEffect(() => {
  if (securityGroup) {
    const updatedConfig = { ...memoizedUserConfig, project_id: securityGroup.id };
    setUserConfig(updatedConfig);
    if (profileData) {
      safeUpdateUserConfig('user_config.project_id', securityGroup.id, profileData, updateUserConfig);
    }
  }
}, [securityGroup, profileData, updateUserConfig, memoizedUserConfig]);

// ✅ CHANGED: Fetch document checklist immediately when we have the required data
// Don't wait for project_id (security group creation)
  /**
   * BUSINESS LOGIC: Side Effect
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Monitors msalToken, fetchDocumentChecklist, handleApiError for changes
   * 2. Executes console.log, localStorage.setItem, value.toLowerCase, ensureBoolean, ensureBoolean, ensureBoolean, ensureBoolean, ensureBoolean, fetchDocumentChecklist.mutate, console.log, localStorage.removeItem, console.error, handleApiError, setLoading, localStorage.removeItem, console.error, handleApiError, setLoading, fetchChecklistImmediately functions
   * 3. Runs side effect logic
   *
   * WHAT IT CALLS:
   * - console.log() - Function call
   * - localStorage.setItem() - Function call
   * - value.toLowerCase() - Function call
   * - ensureBoolean() - Function call
   * - ensureBoolean() - Function call
   * - ensureBoolean() - Function call
   * - ensureBoolean() - Function call
   * - ensureBoolean() - Function call
   * - fetchDocumentChecklist.mutate() - Function call
   * - console.log() - Function call
   * - localStorage.removeItem() - Function call
   * - console.error() - Function call
   * - handleApiError() - Function call
   * - setLoading() - Function call
   * - localStorage.removeItem() - Function call
   * - console.error() - Function call
   * - handleApiError() - Function call
   * - setLoading() - Function call
   * - fetchChecklistImmediately() - Function call
   *
   * WHY IT CALLS THEM:
   * - console.log: Debugging output
   * - localStorage.setItem: State update
   * - value.toLowerCase: Required functionality
   * - ensureBoolean: Required functionality
   * - ensureBoolean: Required functionality
   * - ensureBoolean: Required functionality
   * - ensureBoolean: Required functionality
   * - ensureBoolean: Required functionality
   * - fetchDocumentChecklist.mutate: Data fetching
   * - console.log: Debugging output
   * - localStorage.removeItem: Required functionality
   * - console.error: Error logging
   * - handleApiError: Required functionality
   * - setLoading: State update
   * - localStorage.removeItem: Required functionality
   * - console.error: Error logging
   * - handleApiError: Required functionality
   * - setLoading: State update
   * - fetchChecklistImmediately: Data fetching
   *
   * DATA FLOW:
   * Input: msalToken, fetchDocumentChecklist, handleApiError state/props
   * Processing: Calls console.log, localStorage.setItem, value.toLowerCase to process data
   * Output: Side effects executed, cleanup registered
   *
   * DEPENDENCIES:
   * - msalToken: Triggers when msalToken changes
   * - fetchDocumentChecklist: Triggers when fetchDocumentChecklist changes
   * - handleApiError: Triggers when handleApiError changes
   *
   */
useEffect(() => {
  if (initialized.current) return;
  const shouldFetchChecklist = (
    memoizedUserConfig?.org_id &&
    memoizedUserConfig?.project?.development_type &&
    msalToken
  );
  if (!shouldFetchChecklist) return;
  initialized.current = true;

    /**
     * BUSINESS LOGIC: fetchChecklistImmediately
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Implements fetchChecklistImmediately logic
     * 2. Calls helper functions: console.log, localStorage.setItem, value.toLowerCase, ensureBoolean, ensureBoolean, ensureBoolean, ensureBoolean, ensureBoolean, fetchDocumentChecklist.mutate, console.log, localStorage.removeItem, console.error, handleApiError, setLoading, localStorage.removeItem, console.error, handleApiError, setLoading
     * 3. Returns computed result
     *
     * WHAT IT CALLS:
     * - console.log() - Function call
     * - localStorage.setItem() - Function call
     * - value.toLowerCase() - Function call
     * - ensureBoolean() - Function call
     * - ensureBoolean() - Function call
     * - ensureBoolean() - Function call
     * - ensureBoolean() - Function call
     * - ensureBoolean() - Function call
     * - fetchDocumentChecklist.mutate() - Function call
     * - console.log() - Function call
     * - localStorage.removeItem() - Function call
     * - console.error() - Function call
     * - handleApiError() - Function call
     * - setLoading() - Function call
     * - localStorage.removeItem() - Function call
     * - console.error() - Function call
     * - handleApiError() - Function call
     * - setLoading() - Function call
     *
     * WHY IT CALLS THEM:
     * - console.log: Debugging output
     * - localStorage.setItem: State update
     * - value.toLowerCase: Required functionality
     * - ensureBoolean: Required functionality
     * - ensureBoolean: Required functionality
     * - ensureBoolean: Required functionality
     * - ensureBoolean: Required functionality
     * - ensureBoolean: Required functionality
     * - fetchDocumentChecklist.mutate: Data fetching
     * - console.log: Debugging output
     * - localStorage.removeItem: Required functionality
     * - console.error: Error logging
     * - handleApiError: Required functionality
     * - setLoading: State update
     * - localStorage.removeItem: Required functionality
     * - console.error: Error logging
     * - handleApiError: Required functionality
     * - setLoading: State update
     *
     * DATA FLOW:
     * Input: Component state and props
     * Processing: Calls console.log, localStorage.setItem, value.toLowerCase to process data
     * Output: Computed value or side effect
     *
     */
  const fetchChecklistImmediately = async () => {
    try {
      console.log("🚀 Fetching document checklist immediately (before security group creation)");
      // Signal that document fetch has started
      localStorage.setItem("documentChecklistFetchStarted", "true");
      // Helper function to ensure boolean values for early fetch
        /**
         * BUSINESS LOGIC: ensureBoolean
         *
         * WHY THIS EXISTS:
         * - Implements business logic requirement
         *
         * WHAT IT DOES:
         * 1. Implements ensureBoolean logic
         * 2. Calls helper functions: value.toLowerCase
         * 3. Returns computed result
         *
         * WHAT IT CALLS:
         * - value.toLowerCase() - Function call
         *
         * WHY IT CALLS THEM:
         * - value.toLowerCase: Required functionality
         *
         * DATA FLOW:
         * Input: Component state and props
         * Processing: Calls value.toLowerCase to process data
         * Output: Computed value or side effect
         *
         */
      const ensureBoolean = (value: unknown): boolean => {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') {
          const lowerValue = value.toLowerCase();
          return lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes';
        }
        return false; // Default to false if undefined, null, or other types
      };

      const payload: FetchDocumentChecklistRequest = {
        user_config: {
          org_id: memoizedUserConfig.org_id,
          project: {
            development_type: memoizedUserConfig.project?.development_type || '',
            planning_pathway: memoizedUserConfig.project?.planning_pathway || '',
            is_bushfire_zone: ensureBoolean(memoizedUserConfig.project?.is_bushfire_zone),
            is_heritage_zone: ensureBoolean(memoizedUserConfig.project?.is_heritage_zone),
            is_flood_zone: ensureBoolean(memoizedUserConfig.project?.is_flood_zone),
            is_battle_axe_lot: ensureBoolean(memoizedUserConfig.project?.is_battle_axe_lot),
            is_corner_lot: ensureBoolean(memoizedUserConfig.project?.is_corner_lot),
          },
        },
      };

      fetchDocumentChecklist.mutate(
        { token: msalToken, payload },
        {
          onSuccess: (data) => {
            console.log('✅ Document checklist fetched successfully (early fetch):', data);
            // Clear the flag since fetch completed
            localStorage.removeItem("documentChecklistFetchStarted");
          },
          onError: (error) => {
            console.error('❌ Failed to fetch document checklist (early fetch):', error);
            handleApiError(error, 'Initialization Error', 'Failed to fetch document checklist.');
            setLoading(false);
            // Clear the flag since fetch failed
            localStorage.removeItem("documentChecklistFetchStarted");
          },
        }
      );
    } catch (error) {
      console.error('❌ Early checklist fetch error:', error);
      handleApiError(error, 'Initialization Error', 'Failed to initialize document checklist.');
      setLoading(false);
    }
  };
  fetchChecklistImmediately();
}, [memoizedUserConfig?.org_id, memoizedUserConfig?.project?.development_type, memoizedUserConfig.project?.planning_pathway, memoizedUserConfig.project?.is_bushfire_zone, memoizedUserConfig.project?.is_heritage_zone, memoizedUserConfig.project?.is_flood_zone, memoizedUserConfig.project?.is_battle_axe_lot, memoizedUserConfig.project?.is_corner_lot, msalToken, fetchDocumentChecklist, handleApiError]);

  /**
   * BUSINESS LOGIC: Side Effect
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Monitors handleApiError for changes
   * 2. Executes handleApiError, setDocChecklistBlocked, setLoading functions
   * 3. Runs side effect logic
   *
   * WHAT IT CALLS:
   * - handleApiError() - Function call
   * - setDocChecklistBlocked() - Function call
   * - setLoading() - Function call
   *
   * WHY IT CALLS THEM:
   * - handleApiError: Required functionality
   * - setDocChecklistBlocked: State update
   * - setLoading: State update
   *
   * DATA FLOW:
   * Input: handleApiError state/props
   * Processing: Calls handleApiError, setDocChecklistBlocked, setLoading to process data
   * Output: Side effects executed, cleanup registered
   *
   * DEPENDENCIES:
   * - handleApiError: Triggers when handleApiError changes
   *
   */
useEffect(() => {
  if (fetchDocumentChecklist.isError) {
    handleApiError(
      fetchDocumentChecklist.error,
      'No Matching Documents',
      'Development type may not be supported for this council or council may not have document requirements configured in the system'
    );
    setDocChecklistBlocked(true);
    setLoading(false);
  }
}, [fetchDocumentChecklist.isError, fetchDocumentChecklist.error, handleApiError]);

  /**
   * BUSINESS LOGIC: handleRefreshClick
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Handles user interaction or event
   * 2. Calls setLoading, acquireMsalToken, value.toLowerCase, ensureBoolean, ensureBoolean, ensureBoolean, ensureBoolean, ensureBoolean, fetchDocumentChecklist.mutate, fetchUploadedDocuments.mutate, handleApiError, setLoading, handleApiError, setLoading functions
   * 3. Updates state or triggers effects
   *
   * WHAT IT CALLS:
   * - setLoading() - Function call
   * - acquireMsalToken() - Function call
   * - value.toLowerCase() - Function call
   * - ensureBoolean() - Function call
   * - ensureBoolean() - Function call
   * - ensureBoolean() - Function call
   * - ensureBoolean() - Function call
   * - ensureBoolean() - Function call
   * - fetchDocumentChecklist.mutate() - Function call
   * - fetchUploadedDocuments.mutate() - Function call
   * - handleApiError() - Function call
   * - setLoading() - Function call
   * - handleApiError() - Function call
   * - setLoading() - Function call
   *
   * WHY IT CALLS THEM:
   * - setLoading: State update
   * - acquireMsalToken: Required functionality
   * - value.toLowerCase: Required functionality
   * - ensureBoolean: Required functionality
   * - ensureBoolean: Required functionality
   * - ensureBoolean: Required functionality
   * - ensureBoolean: Required functionality
   * - ensureBoolean: Required functionality
   * - fetchDocumentChecklist.mutate: Data fetching
   * - fetchUploadedDocuments.mutate: Data fetching
   * - handleApiError: Required functionality
   * - setLoading: State update
   * - handleApiError: Required functionality
   * - setLoading: State update
   *
   * DATA FLOW:
   * Input: acquireMsalToken, memoizedUserConfig, fetchDocumentChecklist, fetchUploadedDocuments, handleApiError state/props
   * Processing: Calls setLoading, acquireMsalToken, value.toLowerCase to process data
   * Output: Event handled, state updated
   *
   * DEPENDENCIES:
   * - acquireMsalToken: Triggers when acquireMsalToken changes
   * - memoizedUserConfig: Triggers when memoizedUserConfig changes
   * - fetchDocumentChecklist: Triggers when fetchDocumentChecklist changes
   * - fetchUploadedDocuments: Triggers when fetchUploadedDocuments changes
   * - handleApiError: Triggers when handleApiError changes
   *
   * SPECIAL BEHAVIOR:
   * - Memoized for performance optimization
   *
   */
const handleRefreshClick = useCallback(async () => {
  try {
    setLoading(true);
    lastFetchedConfig.current = null;
    const token = await acquireMsalToken();
    // Helper function to ensure boolean values for refresh
      /**
       * BUSINESS LOGIC: ensureBoolean
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Implements ensureBoolean logic
       * 2. Calls helper functions: value.toLowerCase
       * 3. Returns computed result
       *
       * WHAT IT CALLS:
       * - value.toLowerCase() - Function call
       *
       * WHY IT CALLS THEM:
       * - value.toLowerCase: Required functionality
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Calls value.toLowerCase to process data
       * Output: Computed value or side effect
       *
       */
    const ensureBoolean = (value: unknown): boolean => {
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') {
        const lowerValue = value.toLowerCase();
        return lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes';
      }
      return false; // Default to false if undefined, null, or other types
    };
    const payload: FetchDocumentChecklistRequest = {
      user_config: {
        org_id: memoizedUserConfig.org_id,
        project: {
          development_type: memoizedUserConfig.project?.development_type || '',
          planning_pathway: memoizedUserConfig.project?.planning_pathway || '',
          is_bushfire_zone: ensureBoolean(memoizedUserConfig.project?.is_bushfire_zone),
          is_heritage_zone: ensureBoolean(memoizedUserConfig.project?.is_heritage_zone),
          is_flood_zone: ensureBoolean(memoizedUserConfig.project?.is_flood_zone),
          is_battle_axe_lot: ensureBoolean(memoizedUserConfig.project?.is_battle_axe_lot),
          is_corner_lot: ensureBoolean(memoizedUserConfig.project?.is_corner_lot),
        },
      },
    };

    fetchDocumentChecklist.mutate({ token, payload });
    fetchUploadedDocuments.mutate(
      {
        token,
        payload: {
          user_config: {
            org_id: memoizedUserConfig.org_id || '',
            project_id: memoizedUserConfig.project_id || '',
          },
        },
      },
      {
        onError: (error) => {
          handleApiError(error, 'Error', 'Failed to fetch uploaded documents.');
          setLoading(false);
        },
      }
    );
  } catch (error) {
    handleApiError(
      error,
      'Refresh Error',
      error instanceof Error ? error.message : 'Failed to refresh document checklist.'
    );
    setLoading(false);
  }
}, [acquireMsalToken, memoizedUserConfig, fetchDocumentChecklist, fetchUploadedDocuments, handleApiError]);

return {
  documents,
  loading,
  user_config: memoizedUserConfig,
  setUserConfig,
  isRequiredDoc,
  createSecurityGroup,
  createApplicationRecord,
  allDocumentsValidated,
  handleRefreshClick,
  docChecklistBlocked,
  handleDocumentLinkClick,
};
};