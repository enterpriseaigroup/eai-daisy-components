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

  const memoizedUserConfig = useMemo(() => user_config, [user_config.org_id, user_config.project_id, user_config.project]);

  const lastSyncedDocuments = useRef<Document[] | null>(null);
  const lastSyncedUploadedDocuments = useRef<FetchUploadedDocumentsResponse[] | null>(null);

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

  useEffect(() => {
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

  const isRequiredDoc = useCallback((reqValue: string | undefined): boolean => {
    if (!reqValue) return false;
    const req = reqValue.toLowerCase();
    return req === 'required' || req === 'conditionally required';
  }, []);

  const handleApiError = useCallback((error: unknown, title: string, message: string) => {
    console.error(`${title}:`, error);
    toast.error(title, { description: message });
  }, []);

  const allDocumentsValidated = useCallback(
    () => documents.filter((d) => isRequiredDoc(d.Requirement)).every((doc) => doc.Validated === true),
    [documents, isRequiredDoc]
  );

  const createUploadStatus = useCallback(
    (isValidated: boolean, fileUrl: string | undefined, fileIndex: number, description: string | undefined): UploadStatus => ({
      status: isValidated ? 'validated' : 'not_validated',
      fileUrl,
      fileIndex,
      description
    }),
    []
  );

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

useEffect(() => {
  return () => {
    isMounted.current = false;
    // Clean up localStorage flag when component unmounts
    localStorage.removeItem("documentChecklistFetchStarted");
  };
}, []);

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

useEffect(() => {
  if (documentCheckList) {
    const sortedDocuments = [...documentCheckList].sort((a: Document, b: Document) =>
      (a.Document || '').localeCompare(b.Document || '')
    );
    setDocuments(sortedDocuments);
    setLoading(false);
  }
}, [documentCheckList]);

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
useEffect(() => {
  if (initialized.current) return;
  const shouldFetchChecklist = (
    memoizedUserConfig?.org_id &&
    memoizedUserConfig?.project?.development_type &&
    msalToken
  );
  if (!shouldFetchChecklist) return;
  initialized.current = true;

  const fetchChecklistImmediately = async () => {
    try {
      console.log("🚀 Fetching document checklist immediately (before security group creation)");
      // Signal that document fetch has started
      localStorage.setItem("documentChecklistFetchStarted", "true");
      // Helper function to ensure boolean values for early fetch
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

const handleRefreshClick = useCallback(async () => {
  try {
    setLoading(true);
    lastFetchedConfig.current = null;
    const token = await acquireMsalToken();
    // Helper function to ensure boolean values for refresh
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