'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Loader2, Info, ChevronDownIcon } from "lucide-react";
import { UserConfig } from "@domain/entities/ProfileData";
import type { Document } from "@domain/entities/Document";
import { useDocumentTable, UploadStatus } from './useDocumentTable';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Types
type DocumentWithApiFlag = Document & { fromApi?: boolean };

export interface DocumentTableProps {
  title: string;
  documents: DocumentWithApiFlag[];
  user_config: UserConfig;
  handleDocumentLinkClick: (doc: DocumentWithApiFlag) => void;
}

// Constants
const MAX_FILE_SIZE_TOOLTIP = "Maximum file size allowed is 40 MB. Supported file types: .pdf, .docx, .jpeg, .jpg, .png.";
const MAX_FILES_PER_DOCUMENT = 5;
const MAX_DOCUMENT_NAME_LENGTH = 25;

// Utility functions
const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

const sanitizeDocumentType = (docType: string): string => {
  return docType.toLowerCase().replace(/\s+/g, '_');
};

const getStatusStyles = (status: string): string => {
  const statusMap: Record<string, string> = {
    uploading: 'bg-purple-100 text-purple-700',
    validating: 'bg-purple-100 text-purple-700',
    validated: 'bg-green-100 text-green-800',
    not_validated: 'bg-red-100 text-red-800',
    error: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-purple-100 text-purple-700',
  };
  return statusMap[status.toLowerCase()] || 'bg-gray-100 text-gray-700';
};

// Custom hook for document operations
const useDocumentOperations = (
  uploadStatuses: Record<string, UploadStatus[]>,
  handleUploadClick: (doc: Document, fileIndex?: number) => void
) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [menuOpen, setMenuOpen] = useState<{ 
    docId: string | null; 
    isChild: boolean; 
    fileIndex?: number 
  }>({ docId: null, isChild: false });
  const [modalOpen, setModalOpen] = useState<string | null>(null);

  // Auto-expand rows when files are uploaded
  useEffect(() => {
    Object.entries(uploadStatuses).forEach(([docId, statuses]) => {
      if (statuses.length > 0) {
        setExpandedRows(prev => new Set([...prev, docId]));
      }
    });
  }, [uploadStatuses]);

  const toggleRow = useCallback((docId: string) => {
    setExpandedRows(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(docId)) {
        newExpanded.delete(docId);
      } else {
        newExpanded.add(docId);
      }
      return newExpanded;
    });
  }, []);

  const handleMenuClick = useCallback((docId: string, isChild: boolean, fileIndex?: number) => {
    setMenuOpen(prev => ({
      docId: prev.docId === docId && prev.isChild === isChild && prev.fileIndex === fileIndex ? null : docId,
      isChild,
      fileIndex,
    }));
  }, []);

  const handleAddFile = useCallback((doc: Document, isMobile: boolean) => {
    const docId = doc.ApplicationDocumentId;
    const currentStatuses = uploadStatuses[docId] || [];
    if (currentStatuses.length >= MAX_FILES_PER_DOCUMENT) {
      alert(`Maximum ${MAX_FILES_PER_DOCUMENT} files allowed per document.`);
      return;
    }

    if (isMobile) {
      setModalOpen(docId);
    } else {
      handleUploadClick(doc);
    }
    setExpandedRows(prev => new Set([...prev, docId]));
    setMenuOpen({ docId: null, isChild: false });
  }, [uploadStatuses, handleUploadClick]);

  const handleReplaceFileClick = useCallback((doc: Document, fileIndex: number) => {
    handleUploadClick(doc, fileIndex);
    setExpandedRows(prev => new Set([...prev, doc.ApplicationDocumentId]));
    setMenuOpen({ docId: null, isChild: false });
  }, [handleUploadClick]);

  return {
    expandedRows,
    menuOpen,
    modalOpen,
    setModalOpen,
    setMenuOpen,
    toggleRow,
    handleMenuClick,
    handleAddFile,
    handleReplaceFileClick,
  };
};

// Status badge component
const StatusBadge: React.FC<{ status: string; isLoading?: boolean }> = React.memo(({ status, isLoading }) => {
  if (isLoading) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-sm font-medium text-purple-700 bg-purple-100 rounded-full">
        <Loader2 className="w-4 h-4 animate-spin" />
        {status === 'uploading' ? 'Uploading' : 'Validating'}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${getStatusStyles(status)}`}>
      {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
    </span>
  );
});

StatusBadge.displayName = 'StatusBadge';

// Document link component
const DocumentLink: React.FC<{
  doc: DocumentWithApiFlag;
  uploadStatus: UploadStatus;
  handleDocumentLinkClick: (doc: DocumentWithApiFlag) => void;
  className?: string;
}> = React.memo(({ doc, uploadStatus, handleDocumentLinkClick, className = "" }) => {
  if (!uploadStatus.fileUrl || !['not_validated', 'validated'].includes(uploadStatus.status)) {
    return null;
  }

  const linkText = `${doc.Document.toLowerCase().replace(/\s+/g, '_')}.pdf`;

  if (doc.fromApi) {
    return (
      <button
        type="button"
        onClick={() => handleDocumentLinkClick(doc)}
        className={`text-left text-[#506dcf] text-sm hover:underline ${className}`}
      >
        {linkText}
      </button>
    );
  }

  return (
    <a
      href={uploadStatus.fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`text-[#506dcf] text-sm hover:underline ${className}`}
    >
      {linkText}
    </a>
  );
});

DocumentLink.displayName = 'DocumentLink';

// Tooltip wrapper component
const TooltipWrapper: React.FC<{
  content: string;
  children: React.ReactNode;
  className?: string;
}> = React.memo(({ content, children, className = "" }) => (
  <TooltipProvider delayDuration={100}>
    <Tooltip>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent
        side="top"
        align="center"
        sideOffset={4}
        className={`z-50 max-w-[200px] px-3 py-2 text-xs break-words whitespace-normal ${className}`}
      >
        {content}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
));

TooltipWrapper.displayName = 'TooltipWrapper';

// Child row component for desktop
const ChildRow = React.memo<{
  doc: DocumentWithApiFlag;
  uploadStatus: UploadStatus;
  index: number;
  docId: string;
  isAnotherUploadInProgress: boolean;
  isSelectedDocUploading:boolean;
  handleMenuClick: (docId: string, isChild: boolean, fileIndex?: number) => void;
  handleReplaceFileClick: (doc: Document, fileIndex: number) => void;
  menuOpen: { docId: string | null; isChild: boolean; fileIndex?: number };
  menuRef: React.RefObject<HTMLDivElement>;
  getStatusDescription: (doc: Document, statusInfo: UploadStatus | undefined) => string;
  handleDocumentLinkClick: (doc: DocumentWithApiFlag) => void;
}>(({
  doc,
  uploadStatus,
  index,
  docId,
  isAnotherUploadInProgress,
  isSelectedDocUploading,
  handleReplaceFileClick,
  getStatusDescription,
  handleDocumentLinkClick,
}) => {
  const sanitizedDocType = sanitizeDocumentType(doc.Document);
  const fileName = `${sanitizedDocType}_${uploadStatus.fileIndex + 1}`;
  const childDescription = getStatusDescription(doc, uploadStatus);
  const isValidated = uploadStatus.status === 'validated';
  const isLoading = ['uploading', 'completed'].includes(uploadStatus.status);
  const isValidating=uploadStatus.status==='completed';
  return (
    <TableRow key={`${docId}-${uploadStatus.fileIndex}-${index}`}>
      <TableCell className="py-4 px-2 w-[3%] min-w-[40px] sm:min-w-[50px]"></TableCell>
      <TableCell className="py-4 px-2 sm:px-4 w-[30%] min-w-[200px] sm:min-w-[250px]">
        <div className="flex flex-col">
          <TooltipWrapper content={fileName}>
            <span className="text-foreground text-sm font-medium font-['Geist'] leading-tight sm:truncate sm:max-w-[220px] inline-block whitespace-normal sm:whitespace-nowrap">
              {truncateText(fileName, MAX_DOCUMENT_NAME_LENGTH)}
            </span>
          </TooltipWrapper>
          <DocumentLink
            doc={doc}
            uploadStatus={uploadStatus}
            handleDocumentLinkClick={handleDocumentLinkClick}
            className="block mt-1 truncate"
          />
        </div>
      </TableCell>
      <TableCell className="py-4 px-2 sm:px-4 text-center w-[20%] min-w-[120px] sm:min-w-[150px]">
        <StatusBadge status={uploadStatus.status} isLoading={isLoading} />
      </TableCell>
      <TableCell className="py-4 px-2 sm:px-4 text-muted-foreground text-sm w-[35%] min-w-[250px] sm:min-w-[300px]">
        <TooltipWrapper content={childDescription}>
          <span className="break-words whitespace-normal sm:max-w-[270px] inline-block">
            {childDescription}
          </span>
        </TooltipWrapper>
      </TableCell>
      <TableCell className="py-4 px-2 sm:px-4 text-center w-[10%] min-w-[80px] sm:min-w-[100px]">
        <div className="flex justify-center">
          {!isValidated && (
            <TooltipWrapper content={MAX_FILE_SIZE_TOOLTIP}>
              <button
                onClick={() => handleReplaceFileClick(doc, uploadStatus.fileIndex)}
                className={`text-sm underline hover:text-muted-foreground focus:outline-none ${
                  isAnotherUploadInProgress || isSelectedDocUploading || isValidating 
                    ? "opacity-50 cursor-not-allowed pointer-events-none" 
                    : ""
                }`}
                data-testid={`replace-file-${docId}-${uploadStatus.fileIndex}`}
              >
                {uploadStatus.status === 'not_validated' ? "Reupload" : "Reupload"}
              </button>
            </TooltipWrapper>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
});

ChildRow.displayName = 'ChildRow';

// Mobile child row component
const MobileChildRow = React.memo<{
  docId: string;
  uploadStatus: UploadStatus;
  index: number;
  sanitizedDocType: string;
}>(({ docId, uploadStatus, index, sanitizedDocType }) => {
  const fileName = `${sanitizedDocType}_${uploadStatus.fileIndex + 1}`;
  const isLoading = ['uploading', 'completed'].includes(uploadStatus.status);

  return (
    <div key={`${docId}-${uploadStatus.fileIndex}-${index}`} className="flex items-center py-0 border-t border-gray-100">
      <div className="w-2 h-6 mr-0" />
      <div className="flex items-center justify-between flex-1">
        <span className="text-sm font-medium">
          {truncateText(fileName, MAX_DOCUMENT_NAME_LENGTH + 5)}
        </span>
        <StatusBadge status={uploadStatus.status} isLoading={isLoading} />
      </div>
    </div>
  );
});

MobileChildRow.displayName = 'MobileChildRow';

// Modal child row component
const ModalChildRow = React.memo<{
  doc: DocumentWithApiFlag;
  docId: string;
  uploadStatus: UploadStatus;
  index: number;
  sanitizedDocType: string;
  handleReplaceFileClick: (doc: DocumentWithApiFlag, fileIndex: number) => void;
  getStatusDescription: (doc: Document, statusInfo: UploadStatus | undefined) => string;
  handleDocumentLinkClick: (doc: DocumentWithApiFlag) => void;
}>(({
  doc,
  docId,
  uploadStatus,
  index,
  sanitizedDocType,
  handleReplaceFileClick,
  getStatusDescription,
  handleDocumentLinkClick,
}) => {
  const fileName = `${sanitizedDocType}_${uploadStatus.fileIndex + 1}`;
  const description = getStatusDescription(doc, uploadStatus);
  const isValidated = uploadStatus.status === 'validated';
  const isLoading = ['uploading', 'completed'].includes(uploadStatus.status);

  return (
    <div key={`${docId}-${uploadStatus.fileIndex}-${index}`} className="w-full mb-6">
      <div className="flex flex-col w-full">
        <div className="w-full mb-2">
          <StatusBadge status={uploadStatus.status} isLoading={isLoading} />
        </div>
        <div className="w-full">
          <TooltipWrapper content={fileName}>
            <span className="block w-full text-sm font-medium break-all">
              {truncateText(fileName, MAX_DOCUMENT_NAME_LENGTH)}
            </span>
          </TooltipWrapper>
        </div>
        <DocumentLink
          doc={doc}
          uploadStatus={uploadStatus}
          handleDocumentLinkClick={handleDocumentLinkClick}
          className="w-full mt-1 break-all"
        />
        <div className="w-full mt-2">
          <p className="text-sm text-gray-600 break-words whitespace-normal">
            <span className="font-medium">Description</span><br />
            {description}
          </p>
        </div>
        {!isValidated && (
          <div className="w-full">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReplaceFileClick(doc, uploadStatus.fileIndex)}
              className="text-[#506dcf] hover:text-blue-800 flex items-center mt-2 self-start"
            >
              Reupload file
            </Button>
          </div>
        )}
      </div>
    </div>
  );
});

ModalChildRow.displayName = 'ModalChildRow';

// Main component
const DocumentTable: React.FC<DocumentTableProps> = ({ 
  title, 
  documents: propDocuments, 
  user_config, 
  handleDocumentLinkClick 
}) => {
  const {
    fileInputRef,
    handleFileChange,
    handleUploadClick,
    uploadStatuses,
    getStatusDescription,
    selectedDocId,
  } = useDocumentTable(user_config);

  const {
    expandedRows,
    menuOpen,
    modalOpen,
    setModalOpen,
    setMenuOpen,
    toggleRow,
    handleMenuClick,
    handleAddFile,
    handleReplaceFileClick,
  } = useDocumentOperations(uploadStatuses, handleUploadClick);

  const menuRef = useRef<HTMLDivElement>(null);

  // Memoize processed documents
  const documents = useMemo(() => {
    return propDocuments.map((doc) => {
      const docId = doc.ApplicationDocumentId;
      const statuses: UploadStatus[] = uploadStatuses[docId] || [];
      const isInProgress = statuses.some(status => status.status === 'uploading');
      if (isInProgress) {
        return { ...doc, Validated: undefined };
      }
      return doc;
    });
  }, [propDocuments, uploadStatuses]);

  // Status calculation functions
  const getSummaryStatus = useCallback((doc: Document, statuses: UploadStatus[]): string => {
    if (statuses.length === 0) return "Ready";
    if (statuses.some(status => status.status === 'uploading')) return "Uploading";
    if (statuses.some(status => status.status === 'completed')) return "Validating";
    const allValidated = statuses.every(status => status.status === 'validated');
    const anyNotValidated = statuses.some(status => status.status === 'not_validated');
    if (allValidated) return "Validated";
    if (anyNotValidated) return "Not validated";
    return "In progress";
  }, []);

  const getSummaryDescription = useCallback((doc: Document, statuses: UploadStatus[]): string => {
    if (statuses.length === 0) return "Upload a file";
    if (statuses.some(status => status.status === 'uploading')) return 'Document is being uploaded';
    if (statuses.some(status => status.status === 'completed')) return 'Document is being validated';
    const validatedCount = statuses.filter(status => status.status === 'validated').length;
    return `${validatedCount}/${statuses.length} files validated`;
  }, []);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen({ docId: null, isChild: false });
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setMenuOpen]);

  // Check if all documents are empty
  const allDocsEmpty = useMemo(() => {
    return documents.length === 0 || documents.every(doc => {
      const statuses = uploadStatuses[doc.ApplicationDocumentId] || [];
      return statuses.length === 0;
    });
  }, [documents, uploadStatuses]);

  return (
    <div className="w-full my-4 bg-white rounded-lg">
      <div className="flex items-center gap-2 py-2 mb-2">
        <h3 className="text-foreground text-base font-medium font-['Geist'] leading-none tracking-wide">
          {title}
        </h3>
        <TooltipWrapper
          content={
            title === 'Required Documents'
              ? 'Documents must be submitted as part of your development application.'
              : 'Depending on your development plans these documents may be required.'
          }
        >
          <Info size={18} className="cursor-pointer text-muted-foreground mt-[1px]" />
        </TooltipWrapper>
      </div>

      {allDocsEmpty && (
        <p className="text-sm text-muted-foreground mb-4 ml-[2px]">
          Please upload your documents to start the validation process.
        </p>
      )}

      {/* Desktop Table */}
      <div className="box-border flex flex-col hidden w-full gap-6 p-0 mx-auto my-4 overflow-x-auto bg-white border border-gray-200 rounded shadow-none md:block text-card-foreground">
        <Table className="w-full table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[3%] min-w-[40px] sm:min-w-[50px]"></TableHead>
              <TableHead className="w-[30%] min-w-[200px] sm:min-w-[250px] text-muted-foreground text-sm font-normal">
                Document name
              </TableHead>
              <TableHead className="w-[20%] min-w-[120px] sm:min-w-[150px] text-center text-muted-foreground text-sm font-normal pr-4">
                Validation Status
              </TableHead>
              <TableHead className="w-[37%] min-w-[250px] sm:min-w-[300px] text-muted-foreground text-sm font-normal pl-4">
                Status Description
              </TableHead>
              <TableHead className="w-[10%] min-w-[80px] sm:min-w-[100px] text-center text-muted-foreground text-sm font-normal">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100">
            {documents.map((doc) => {
              const docId = doc.ApplicationDocumentId;
              const isExpanded = expandedRows.has(docId);
              const docUploadStatuses: UploadStatus[] = uploadStatuses[docId] || [];
              const isAnotherUploadInProgress = !!(
                selectedDocId &&
                selectedDocId !== docId &&
                Object.values(uploadStatuses).flat().some(status => status.status === "uploading")
              );
              const isSelectedDocUploading =!!(
                selectedDocId &&
                selectedDocId === docId &&
                Object.values(uploadStatuses).flat().some(status => status.status === "uploading")
              );

              const summaryStatus = getSummaryStatus(doc, docUploadStatuses);
              const summaryDescription = getSummaryDescription(doc, docUploadStatuses);

              return (
                <React.Fragment key={docId}>
                  <TableRow className="border border-gray-100 bg-gray-50">
                    <TableCell className="py-4 px-2 w-[3%] min-w-[40px] sm:min-w-[50px] text-center">
                      {docUploadStatuses.length > 0 &&  (
                        <button
                          onClick={() => toggleRow(docId)}
                          className="p-1 rounded text-foreground hover:text-muted-foreground focus:outline-none"
                          aria-label={isExpanded ? `Collapse files for ${doc.Document}` : `Expand files for ${doc.Document}`}
                        >
                          <ChevronDownIcon
                            className={`text-muted-foreground pointer-events-none size-4 shrink-0 transition-transform duration-200 ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      )}
                    </TableCell>
                    <TableCell className="py-4 px-2 sm:px-4 w-[30%] min-w-[200px] sm:min-w-[250px]">
                      <div className="flex items-center">
                        <TooltipWrapper content={doc.Document}>
                          <span className="text-foreground text-sm font-medium font-['Geist'] leading-tight sm:truncate sm:max-w-[220px] inline-block whitespace-normal sm:whitespace-nowrap">
                            {truncateText(doc.Document, MAX_DOCUMENT_NAME_LENGTH)}
                          </span>
                        </TooltipWrapper>
                        <TooltipWrapper
                          content={doc.infoDescription?.trim() || doc.Description?.trim() || 'No description available.'}
                        >
                          <Info size={16} className="flex-shrink-0 ml-2 cursor-pointer text-muted-foreground" />
                        </TooltipWrapper>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-2 sm:px-4 text-center w-[20%] min-w-[120px] sm:min-w-[150px]">
                      <StatusBadge status={summaryStatus} />
                    </TableCell>
                    <TableCell className="py-4 px-2 sm:px-4 text-muted-foreground text-sm w-[37%] min-w-[250px] sm:min-w-[300px]">
                      <TooltipWrapper content={summaryDescription}>
                        <span className="break-words whitespace-normal sm:max-w-[270px] inline-block">
                          {summaryDescription}
                        </span>
                      </TooltipWrapper>
                    </TableCell>
                    <TableCell className="py-4 px-2 sm:px-4 text-center w-[10%] min-w-[80px] sm:min-w-[100px]">
                      {docUploadStatuses.length < MAX_FILES_PER_DOCUMENT && (
                        <div className="flex justify-center">
                          <TooltipWrapper content={MAX_FILE_SIZE_TOOLTIP}>
                            <button
                              onClick={() => handleAddFile(doc, false)}
                              className={`text-sm underline hover:text-muted-foreground focus:outline-none ${
                                isAnotherUploadInProgress || isSelectedDocUploading
                                  ? "opacity-50 cursor-not-allowed pointer-events-none"
                                  : ""
                              }`}
                              data-testid={`upload-file-${docId}`}
                            >
                              Upload
                            </button>
                          </TooltipWrapper>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                  {isExpanded &&
                    docUploadStatuses.map((uploadStatus, index) => (
                      <ChildRow
                        key={`${docId}-${uploadStatus.fileIndex}-${index}`}
                        doc={doc}
                        uploadStatus={uploadStatus}
                        index={index}
                        docId={docId}
                        isAnotherUploadInProgress={isAnotherUploadInProgress}
                        isSelectedDocUploading={isSelectedDocUploading}
                        handleMenuClick={handleMenuClick}
                        handleReplaceFileClick={handleReplaceFileClick}
                        menuOpen={menuOpen}
                        menuRef={menuRef}
                        handleDocumentLinkClick={handleDocumentLinkClick}
                        getStatusDescription={getStatusDescription}
                      />
                    ))}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden">
        {documents.map((doc) => {
          const docId = doc.ApplicationDocumentId;
          const docUploadStatuses: UploadStatus[] = uploadStatuses[docId] || [];
          const summaryStatus = getSummaryStatus(doc, docUploadStatuses);
          const sanitizedDocType = sanitizeDocumentType(doc.Document);
          return (
            <div key={docId} className="mb-4">
              <Card className="w-full max-w-full gap-0 text-black bg-white border border-gray-100 rounded-lg">
                <CardHeader className="pb-0">
                  <div className="flex flex-col">
                    <div className="mb-2 text-left">
                      <StatusBadge status={summaryStatus} />
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-6 mr-0" />
                      <div>
                        <CardTitle className="text-base font-medium">{doc.Document}</CardTitle>
                        <CardDescription className="mt-1 text-sm text-gray-600 whitespace-normal">
                          {doc.infoDescription?.trim() || doc.Description?.trim() || 'No description available.'}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="gap-2 pt-2">
                  {docUploadStatuses.map((uploadStatus, index) => (
                    <MobileChildRow
                      key={`${docId}-${uploadStatus.fileIndex}-${index}`}
                      docId={docId}
                      uploadStatus={uploadStatus}
                      index={index}
                      sanitizedDocType={sanitizedDocType}
                    />
                  ))}
                  <div className="mt-4">
                    {docUploadStatuses.length === 0 ? (
                      <Button
                        onClick={() => handleAddFile(doc, true)}
                        size="sm"
                        className="w-full py-2 text-black bg-gray-100 rounded-md hover:bg-gray-200"
                      >
                        Upload
                      </Button>
                    ) : ((
                        <Button
                          onClick={() => setModalOpen(docId)}
                          size="sm"
                          className="w-full py-2 text-black bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                          Manage
                        </Button>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {modalOpen === docId && (
                <Dialog open={modalOpen === docId} onOpenChange={(open) => !open && setModalOpen(null)}>
                  <DialogContent className="md:rounded-t-lg md:max-w-[425px] md:bottom-0 md:translate-y-0 w-full max-w-full h-screen max-h-screen rounded-none p-4 overflow-y-auto overflow-x-hidden bg-white">
                    <DialogHeader className="relative top-0 bg-white">
                      <DialogTitle className="text-base text-left break-words">{doc.Document}</DialogTitle>
                      <span className={`inline-flex items-center justify-center text-sm font-medium px-2 py-1 rounded-full w-28 ${getStatusStyles(summaryStatus)}`}>
                        {summaryStatus}
                      </span>
                      <DialogDescription className="text-sm text-left break-words whitespace-normal">
                        {doc.infoDescription?.trim() || doc.Description?.trim() || 'No description available.'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="w-full mt-4">
                      {docUploadStatuses.map((uploadStatus, index) => (
                        <div key={`${docId}-${uploadStatus.fileIndex}-${index}`} className="w-full">
                          <ModalChildRow
                            doc={doc}
                            docId={docId}
                            uploadStatus={uploadStatus}
                            index={index}
                            sanitizedDocType={sanitizedDocType}
                            handleReplaceFileClick={handleReplaceFileClick}
                            handleDocumentLinkClick={handleDocumentLinkClick}
                            getStatusDescription={getStatusDescription}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="relative bottom-0 w-full pt-4 pb-4 bg-white">
                      <Button
                        onClick={() => handleUploadClick(doc)}
                        className="w-full py-2 text-black bg-gray-100 rounded-md hover:bg-gray-200"
                      >
                        Upload File
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          );
        })}
      </div>

      {/* Hidden file input for uploads */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        accept=".pdf,.docx,.jpeg,.jpg,.png"
        data-testid="file-input"
      />
    </div>
  );
};

export default DocumentTable;