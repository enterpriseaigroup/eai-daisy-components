'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useProfileStore } from '@presentation/store/useProfileStore';
import MatchedRows from '@presentation/components/planning/MatchedRows';
import StaticDocumentChecklist from '@presentation/components/planning/StaticDocumentChecklist';
import { MatchedRow } from '@domain/entities/ProfileData';
import { isUserLoggedIn } from '../chatbot/utils/storeHelpers';
import { LoginLoader } from '../loader/LoginLoader';
import { useClickOutside } from '../../hooks/useClickOutside';
import { StageType } from '@domain/entities/ApplicationStage';
import { useStageService } from '../../hooks/useStageService';
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { safeUpdateUserConfig } from '../chatbot/utils/safeUpdateUserConfig';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Info } from "lucide-react";
import { Card } from '@/components/ui/card';
interface PlanningStageProps {
  onStageChange: (stage: StageType) => void;
}

export default function PlanningStage({ onStageChange }: PlanningStageProps) {
  const stageService = useStageService;
  const [hasPathways, setHasPathways] = useState(false);
  const [matchedPathways, setMatchedPathways] = useState<MatchedRow[]>([]);
  const [showReport, setShowReport] = useState(false);
  const [showStaticChecklist, setShowStaticChecklist] = useState(false);
  const [selectedPlanningPathway, setSelectedPlanningPathway] = useState<string | null>('');
  const [pendingPathway, setPendingPathway] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { profileData, updateUserConfig, setSelectedPlanningPathwayInAnonymous, selectedPlanningPathwayInAnonymous } = useProfileStore();
  const modalRef = useRef<HTMLDivElement>(null);
  useClickOutside(modalRef, () => setShowLoginModal(false));
  const { instance } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  const goToStage = (stage: StageType) => {
    stageService.setStage(stage);  // ✅ now tracks previous stage internally
    onStageChange(stage);
  };

  // Function to handle pathway selection
  const handlePathwaySelection = (pathway: string) => {
    if (!isUserLoggedIn()) {
      // For non-logged in users, don't show the login modal immediately
      // setShowLoginModal(true);
      // Remember intent, but don't hide MatchedRows yet
      setPendingPathway(pathway);
      // Use the store method instead of localStorage
      if (setSelectedPlanningPathwayInAnonymous) {
        setSelectedPlanningPathwayInAnonymous(pathway);
      }
      console.info(`Stored pathway in anonymous store: ${pathway}`);
      // Handle Development Application pathway - show static document checklist first
      if (pathway === "Development Application") {
        setShowStaticChecklist(true);
      }
    } else {
      // For logged in users, directly set the pathway
      setSelectedPlanningPathway(pathway);
      // ✅ Always update planning_pathway for logged-in users
      if (profileData) {
        safeUpdateUserConfig(
          'user_config.project.planning_pathway',
          pathway,
          profileData,
          updateUserConfig
        );
      }
      // Handle Development Application pathway - show static document checklist first
      if (pathway === "Development Application") {
        setShowStaticChecklist(true);
      }
    }
  };

  useEffect(() => {
    stageService.setStage("project"); // Register this stage as current
    if (profileData?.user_config?.state !== 'planning_pathway' && profileData) {
      safeUpdateUserConfig(
        'user_config.state',
        'planning_pathway',
        profileData,
        useProfileStore.getState().updateUserConfig
      );
    }
  }, []);

  // Handle the login process using the hook's handleLogin function
  // TODO: When we are logging in, looks like we are losing the profileData and its giving us a default value
  // TODO: When we fix this issue, in login flow, based on profileData.state, we will set the stage
  // TODO: CRUCIAL - REDIRECTION BACK TO PROJECT STAGE!!! - DONE!
  const processLogin = () => {
    setShowLoginModal(false);
    // Save current stage so we can go back after login completes (on next load)
    const prev = stageService.getStage(); // This is current stage before redirect
    stageService.setStage("project");   // fallback stage if login fails or not resumed
    stageService.setPreviousStage(prev);  // we need to store it manually if we don't complete login
    instance.loginRedirect({
      scopes: ["openid", "profile", "email"],
      prompt: 'create'
    }).then(() => {
      console.log("login done in processLogin")
      if (pendingPathway) {
        setSelectedPlanningPathway(pendingPathway);
        setPendingPathway(null);
      }
      // If we're showing static checklist or have Development Application selected, go to documents
      if (showStaticChecklist || selectedPlanningPathway === "Development Application" || pendingPathway === "Development Application") {
        goToStage("documents");
        return;
      }
      const prev = stageService.getPreviousStage();
      console.log("prev", prev)
      if (prev) {
        goToStage(prev); // restore user to 'project'
      } else {
        console.log("in else")
        goToStage("project"); // fallback
      }
    })
    .catch(() => {
      goToStage("project");
    });
  };

  // Handle proceeding from static checklist to login modal or documents stage
  const handleProceedFromChecklist = () => {
    // Since users only reach the static checklist through "Development Application" pathway,
    // we can reuse the existing pathway selection logic
    handlePathwaySelection("Development Application");
    // If user is logged in, they should go directly to documents stage
    if (isUserLoggedIn()) {
      goToStage("documents");
    } else {
      // If user is not logged in, show login modal
      setShowLoginModal(true);
    }
  };

  // Check for stored pathway after login
  useEffect(() => {
    if (isUserLoggedIn()) {
      const storedPathway = selectedPlanningPathwayInAnonymous;
      if (storedPathway) {
        setSelectedPlanningPathway(storedPathway);
        // ✅ Always update planning_pathway for logged-in users
        if (profileData) {
          safeUpdateUserConfig(
            'user_config.project.planning_pathway',
            storedPathway,
            profileData,
            updateUserConfig
          );
        }
        // Clear the stored value after retrieving it
        if (setSelectedPlanningPathwayInAnonymous) {
          setSelectedPlanningPathwayInAnonymous(null);
        }
        // If it's Development Application, the user has already seen the checklist
        // and clicked "Document upload", so go directly to documents stage
        if (storedPathway === "Development Application") {
          goToStage("documents");
        }
      }
    }
  }, []);

  // 🔁 Trigger stage change when card is shown
  // TODO: There can be 2 flows here: If logged in, then we can directly move to application stage via onStageChange("application")
  // TODO: If not logged in, we need to trigger login first and then move to application stage via onStageChange("application")
  useEffect(() => {
    if (!selectedPlanningPathway) return;
    const isCDCOrExempt = ["Complying Development", "Exempt Development"].includes(selectedPlanningPathway);
    const isLoggedIn = isUserLoggedIn();
    if (isLoggedIn && isCDCOrExempt) {
      // Update project planning_pathway first
      if (profileData) {
        safeUpdateUserConfig(
          'user_config.project.planning_pathway',
          selectedPlanningPathway,
          profileData,
          updateUserConfig
        );
      }
      // Then move to application stage
      goToStage("application");
    }
  }, [selectedPlanningPathway]);

  useEffect(() => {
    if (profileData?.user_config?.project) {
      const project = profileData.user_config?.project;
      const matched_pathways = project?.matched_pathways || [];
      if (matched_pathways && matched_pathways.length > 0) {
        setMatchedPathways(matched_pathways);
        setHasPathways(true);
        setShowReport(false); // Hide report when pathways data is ready
      }
    }
  }, [profileData?.user_config?.project]);

  // 📩 Listen for chatbot triggering report display
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SHOW_PROPERTY_REPORT') {
        setShowReport(true);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // #1061 - TODO see if we need to remove !profileData.current_org_id as we have a scenario of it being null
  if (isAuthenticated && (!profileData || !profileData.current_org_id)) {
    return <LoginLoader />;
  }

  return (
    // GARETH: Removed py-6 extra padding
    <div className="relative text-center">
      {/* 🎥 Video Fallback */}
      {!hasPathways && !showReport && (
        <div id="planningPathwayDaisy" className="flex flex-col items-center w-full pb-6 mt-4">
          {/* Section Heading */}
          <div className="self-stretch text-left text-primary text-lg font-medium font-['Geist'] leading-7 mb-0">
            Application Identification
          </div>
          {/* Daisy intro card */}
          <Card className="w-full max-w-4xl p-4 mb-4 bg-[#f8f8f8] rounded border border-neutral-300 shadow-none">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 flex items-center justify-center rounded-full bg-[#f8f8f7]">
                <Info className="w-5 h-5 text-[#585854]" strokeWidth={2} />
              </div>
              <p className="text-[#1d1d1d] text-base leading-normal font-['Geist'] text-left">
                <span className="font-bold">
                  DAISY will ask you a series of questions to identify which application type may work best for your project.{" "}
                </span>
                  Want to better understand the different development application types? Watch the video below to learn more!
              </p>
            </div>
          </Card>
          {/* 🎥 YouTube Video */}
          <div className="relative w-full max-w-4xl overflow-hidden rounded-lg aspect-video">
            <iframe
              className="absolute top-0 left-0 w-full h-full border-none"
              src="https://www.youtube-nocookie.com/embed/io9NDt66HeM"
              title="Planning Pathway Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* ✅ Pathways UI */}
      {hasPathways && !showReport && !showStaticChecklist && (
        <MatchedRows
          matchedRows={matchedPathways}
          // nonMatches={failedPathways}
          selectedPlanningPathway={selectedPlanningPathway || ""}
          setSelectedPlanningPathway={handlePathwaySelection}
        />
      )}

      {/* 📋 Static Document Checklist */}
      {showStaticChecklist && profileData?.user_config && (
        <StaticDocumentChecklist
          userConfig={profileData.user_config}
          onShowLoginModal={handleProceedFromChecklist}
          selectedPlanningPathwayInAnonymous={selectedPlanningPathwayInAnonymous}
        />
      )}

      {/* Login Modal */}
      <Dialog open={showLoginModal} onOpenChange={(isOpen) => setShowLoginModal(isOpen)}>
        <DialogContent
          ref={modalRef}
          className="w-[90%] max-w-sm rounded-lg bg-white px-6 py-6 shadow-xl"
        >
          <DialogTitle className="mb-3 text-left text-base font-medium leading-normal text-foreground font-['Geist']">
            Save your progress
          </DialogTitle>
          <p className="mb-3 text-left text-base font-normal leading-normal text-foreground font-['Geist']">
            To move to the next step and access the document checklist, please login. This will ensure:
          </p>
          <div className="mb-6 space-y-2 text-left text-base font-normal leading-normal text-foreground font-['Geist']">
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 mt-0.5 text-foreground" strokeWidth={2} />
              <span>Your progress and data will be saved</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 mt-0.5 text-foreground" strokeWidth={2} />
              <span>You can return anytime to continue</span>
            </div>
          </div>
          <Button onClick={processLogin} className="w-full text-base font-normal leading-normal font-['Geist']">
            Login and continue
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}