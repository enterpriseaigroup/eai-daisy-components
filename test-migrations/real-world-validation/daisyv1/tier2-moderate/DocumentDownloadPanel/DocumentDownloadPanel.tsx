'use client';

import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { Info, ArrowRight } from 'lucide-react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useDocDownload } from './useDocDownload';
import { useFetchUploadedDocuments } from '@presentation/hooks/useFetchUploadedDocuments';
import { useAuthStore } from '@presentation/store/useAuthStore';
import type { FetchUploadedDocumentsResponse } from '@application/models/FetchUploadedDocumentsResponse';
import { StageType } from '@domain/entities/ApplicationStage';
import { UserConfig } from '@domain/entities/ProfileData';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { safeUpdateUserConfig } from '../chatbot/utils/safeUpdateUserConfig';
import { useProfileStore } from '../../store/useProfileStore';

interface Props {
  userConfig: UserConfig | null;
  previousStage: StageType | null;
  goBackToStage: (stage: StageType) => void;
}

export default function DocumentDownloadPanel({
  userConfig,
  previousStage,
  goBackToStage,
}: Props) {
  const { data: documents, fetchUploadedDocuments } = useFetchUploadedDocuments();
  const { accessToken } = useAuthStore();
  const { handleDownload, loading } = useDocDownload(userConfig);
  const [acceptRenames, setAcceptRenames] = useState(false);
  const { updateUserConfig, profileData } = useProfileStore();
  const FALLBACK_PREVIOUS_STAGE: StageType = "documents";
  const effectivePreviousStage = previousStage ?? FALLBACK_PREVIOUS_STAGE;

  // ✅ NEW: Filter out documents with confidence score of 0 aka not validated documents #1331
  const filteredDocuments = useMemo(() => {
    if (!documents) return [];
    return documents.filter((doc: FetchUploadedDocumentsResponse) => {
      const confidence = parseFloat(doc.confidencepercent || '0');
      return confidence > 0;
    });
  }, [documents]);

  useEffect(() => {
    if (accessToken && userConfig?.org_id && userConfig?.project_id) {
      fetchUploadedDocuments.mutate({
        token: accessToken,
        payload: {
          user_config: {
            org_id: userConfig.org_id,
            project_id: userConfig.project_id,
          },
        },
      });
    }
  }, [accessToken, userConfig?.org_id, userConfig?.project_id]);

  useEffect(() => {
    if (documents && documents.length > 0 && profileData) {
      safeUpdateUserConfig(
        'user_config.project.uploaded_documents',
        documents,
        profileData,
        updateUserConfig
      );
    }
  }, [documents, profileData, updateUserConfig]);

  // Had px-4
  // GARETH: Added mt-4, mb-4
  return (
    <div className="w-full xl:max-w-[767px] 2xl:max-w-[850px] mx-auto space-y-6 mt-4 mb-4">
      {/* Info Banner */}
      <Card className="w-full p-4 mb-4 bg-[#f8f8f8] rounded outline outline-1 outline-neutral-300 outline-offset-[-1px] shadow-none rounded">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 flex items-center justify-center rounded-full bg-[#f8f8f7]">
            <Info className="w-5 h-5 text-[#585854]" strokeWidth={2} />
          </div>
          <div className="text-base font-normal text-left text-[#1d1d1d] leading-normal font-['Geist']">
            <span className="font-bold">
              Your documents have been successfully checked and validated. You may now download them below, and upload them into the{' '}
              <Link
                href="https://www.planningportal.nsw.gov.au/"
                target="_blank"
                className="text-[#506dcf] underline hover:text-[#506dcf]"
              >
                NSW Planning Portal
              </Link>{' '}
              for submission.
            </span>
            <br /><br />
            The validation checks DAISY has made do not guarantee approval of your application, and the council may come back and request changes after submission.
          </div>
        </div>
      </Card>

      {/* Renamed Documents Table */}
      <div className="mb-1 text-sm">
        <h3 className="mb-0 text-base font-semibold text-black">Renamed documents</h3>
        <div className="overflow-x-auto">
          <Card className="w-full p-0 border border-gray-200 rounded shadow-none">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4 py-2 text-sm font-normal text-muted-foreground">Document name</TableHead>
                  <TableHead className="px-4 py-2 text-sm font-normal text-center text-muted-foreground">Uploaded date</TableHead>
                  <TableHead className="px-4 py-2 text-sm font-normal text-muted-foreground">Renamed file</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* ✅ CHANGED: Use filteredDocuments instead of documents */}
                {filteredDocuments && filteredDocuments.length > 0 ? (
                  filteredDocuments.map((doc: FetchUploadedDocumentsResponse) => (
                    <TableRow key={doc.documentId} className="hover:bg-gray-50">
                      <TableCell className="px-4 py-3 max-w-[160px] truncate">
                        <TooltipProvider delayDuration={100}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="cursor-pointer">{doc.document_name}</span>
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              align="start"
                              sideOffset={4}
                              className="z-50 max-w-xs px-3 py-2 text-xs text-white bg-black rounded shadow-md"
                            >
                              {doc.document_name}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center whitespace-nowrap">
                        {new Date(doc.last_modified).toLocaleDateString('en-AU', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center max-w-[220px] truncate">
                        <TooltipProvider delayDuration={100}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="cursor-pointer">{doc.filename}</span>
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              align="start"
                              sideOffset={4}
                              className="z-50 max-w-xs px-3 py-2 text-xs text-white bg-black rounded shadow-md"
                            >
                              {doc.filename}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="py-6 text-center text-muted-foreground">
                      No documents found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>
      {/* Checkbox + Button Row */}
      <label className={`flex items-center gap-2 text-sm ${filteredDocuments.length === 0 ? 'text-muted-foreground/50 cursor-not-allowed' : 'text-muted-foreground'}`}>
        <Checkbox
          checked={acceptRenames}
          onCheckedChange={(checked) => setAcceptRenames(!!checked)}
          disabled={filteredDocuments.length === 0}
          style={{ minHeight: '0px' }}
        />
        I confirm that all information is correct
      </label>
      <div className="flex items-center justify-between w-full mt-6">
        <Button
          onClick={() => goBackToStage(effectivePreviousStage)}
          variant="outline"
          className="flex items-center h-10 gap-2 px-4 py-2 text-sm font-medium border border-input text-foreground bg-background hover:bg-muted"
        >
          <ArrowRight className="w-5 h-5 rotate-180" />
          Back
        </Button>
        <Button
          onClick={handleDownload}
          disabled={!acceptRenames || loading || filteredDocuments.length === 0}
          className="flex items-center h-10 gap-2 px-4 py-2 text-sm font-medium border border-transparent text-white bg-[#1d1d1d] hover:bg-[#2a2a2a] rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Downloading...' : 'Download planning portal pack'}
        </Button>
      </div>
    </div>
  );
}