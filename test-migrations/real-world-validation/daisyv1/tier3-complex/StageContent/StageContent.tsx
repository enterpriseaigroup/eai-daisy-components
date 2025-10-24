'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { StageType } from '@domain/entities/ApplicationStage';
import type { IStageService } from '@application/interfaces/IStageService';
import PropertyStage from '../stages/PropertyStage';
import PlanningStage from '../stages/PlanningStage';
import DocumentStage from '../stages/DocumentStage';
import SubmissionStage from '../stages/SubmissionStage';
import Daisy from '../chatbot/Daisy';
import { useStageContent } from './useStageContent';
import { useProfileStore } from '../../store/useProfileStore';
import PropertyReportModal from './PropertyReportModal';
import { StageProgress } from './StageProgress';
import DevelopmentSummaryCard from '../LeftColumn/DevelopmentSummaryCard';
import PropertyInfoCard from '../LeftColumn/PropertyInfoCard';
import type { Project } from '@/app/domain/entities/ProfileData';
import { MessageSquareText, X, Home, HomeIcon } from 'lucide-react';
import { useIsMobile } from './useIsMobile';

interface StageContentProps {
  stage: StageType;
  stageService: IStageService;
  onStageChange: (stage: StageType) => void;
}

export function StageContent({ stage, stageService, onStageChange }: StageContentProps) {
  const {
    instance,
    isAuthenticated,
    hasValue,
    propertyReportLink,
    address,
    propId,
    projectData,
    showBotNotification,
    setShowBotNotification,
  } = useStageContent(stageService, onStageChange);

  const profileData = useProfileStore(s => s.profileData);
  const applicationName = useProfileStore(s => {
    const raw = s.profileData?.user_config?.project?.application_name;
    return s.isAnonymous ? 'My project' : raw?.trim() || 'My project';
  });
  const [showReportModal, setShowReportModal] = useState(false);
  const [mobileView, setMobileView] = useState<'home' | 'property'>('home');
  const isMobile = useIsMobile();
  // Toggle for mobile chatbot visibility
  const [showMobileBot, setShowMobileBot] = useState(false);
  const [chatMessageCount, setChatMessageCount] = useState(0);

  const handleNotificationClose = useCallback(() => {
    setShowBotNotification(false);
  }, [setShowBotNotification]);

  const handleMobileChatToggle = useCallback(() => {
    setShowMobileBot(prev => !prev);
    // Clear notification when opening mobile chat
    if (!showMobileBot && showBotNotification) {
      setShowBotNotification(false);
      setChatMessageCount(0); // Reset counter when chat opens
    }
  }, [showMobileBot, showBotNotification, setShowBotNotification]);

  useEffect(() => {
    const handleNewMessage = (event: MessageEvent) => {
      if (event.data === "newMessageFromChatbot") {
        // Only show notification if on mobile and chat bubble is closed
        if (isMobile && !showMobileBot) {
          setChatMessageCount(prev => prev + 1);
          setShowBotNotification(true);
        }
      }
    };
    window.addEventListener("message", handleNewMessage);
    return () => window.removeEventListener("message", handleNewMessage);
  }, [isMobile, showMobileBot, setShowBotNotification]);

  const renderStageComponent = useMemo(() => {
    switch (stage) {
      case 'property': return <PropertyStage onStageChange={onStageChange} />;
      case 'project': return <PlanningStage onStageChange={onStageChange} />;
      case 'documents': return <DocumentStage onStageChange={onStageChange} />;
      case 'application': return <SubmissionStage onStageChange={onStageChange} />;
      default: return <div>Unknown stage</div>;
    }
  }, [stage, onStageChange, isMobile]);

  if (stageService.isAuthenticationRequired(stage) && !isAuthenticated) {
    instance.loginRedirect({
      scopes: ["openid", "profile", "email"],
      prompt: 'create'
    });
    return <div>Redirecting to login...</div>;
  }

  return (
    <>
      {/* DESKTOP VIEW */}
      <div className="hidden xl:flex flex-col w-full h-screen overflow-hidden xl:flex-row 2xl:max-w-[1536px] xl:max-w-[1280px] xl:mx-auto xl:gap-2 mt-4 mb-4 scrollbar-hidden">
        {/* Left Panel */}
        <div className="xl:w-80 2xl:w-[340px] overflow-y-auto scrollbar-hidden">
          <PropertyInfoCard
            address={address}
            propId={propId}
            projectData={projectData as Project}
            hasValue={hasValue as (val: unknown) => boolean}
            propertyReportLink={propertyReportLink}
            setShowReportModal={setShowReportModal}
          />
          {(stage === 'project' || stage === 'documents' || stage === 'application') && (
            <DevelopmentSummaryCard {...{ applicationName, project: profileData?.user_config?.project as Project }} />
          )}
        </div>

        {/* Center Panel */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 max-w-[767px] 2xl:max-w-[850px] bg-white rounded scrollbar-hidden">
          <div className="sticky top-0 z-10 pt-4 pb-2 bg-white">
            <StageProgress {...{ currentStage: stage, onStageSelect: onStageChange, stageService }} />
          </div>
          {/* Desktop notification banner - only show on desktop */}
          {showBotNotification && (
            <div className="mt-4 px-4 py-3 flex items-center justify-between gap-3 text-black rounded-md outline outline-1 outline-[#E4E4E7] animate-fade-in">
              <div className="flex items-center gap-2">
                <MessageSquareText className="w-5 h-5" strokeWidth={1.75} />
                <p className="text-sm font-medium">You have a new message from DAISY</p>
              </div>
              <button onClick={handleNotificationClose} className="p-1 text-gray-500 hover:text-gray-700">
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          )}
          <div className="relative">
            {showReportModal ? (
              <PropertyReportModal show={showReportModal} onClose={() => setShowReportModal(false)} reportUrl={propertyReportLink} />
            ) : (
              renderStageComponent
            )}
          </div>
        </div>

        {/* Chat Panel */}
        <div className="xl:w-80 2xl:w-[340px] xl:h-full xl:overflow-y-auto">
          <Daisy isOpen={true} setIsOpen={() => {}} onStageChange={onStageChange} />
        </div>
      </div>

      {/* MOBILE VIEW */}
      <div className="w-full h-screen overflow-hidden bg-white xl:hidden">
        {mobileView === 'home' && (
          <div className="flex flex-col w-full h-full pb-20">
            <div className="sticky top-0 z-10 px-2 pt-4 pb-2 bg-white">
              <StageProgress {...{ currentStage: stage, onStageSelect: onStageChange, stageService }} />
            </div>
            {/* Remove mobile notification banner - notification will show as badge on chat icon instead */}
            <div className="flex-1 px-2 overflow-y-auto">
              {showReportModal ? (
                <PropertyReportModal show={showReportModal} onClose={() => setShowReportModal(false)} reportUrl={propertyReportLink} />
              ) : (
                renderStageComponent
              )}
            </div>
          </div>
        )}

        {mobileView === 'property' && (
          <div className="w-full h-full px-4 pt-4 pb-20 overflow-y-auto">
            <PropertyInfoCard
              address={address}
              propId={propId}
              projectData={projectData as Project}
              hasValue={hasValue as (val: unknown) => boolean}
              propertyReportLink={propertyReportLink}
              setShowReportModal={setShowReportModal}
            />
            {(stage === 'project' || stage === 'documents' || stage === 'application') && (
              <DevelopmentSummaryCard {...{ applicationName, project: profileData?.user_config?.project as Project }} />
            )}
          </div>
        )}
      </div>

      {/* Mobile full-screen chatbot overlay - hard override to ensure sliding */}
      <div
        style={{
          zIndex: 999999, // ensure above Formbricks
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '80%',
          maxWidth: '24rem', // matches max-w-sm
          transform: showMobileBot ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 300ms ease-in-out',
          backgroundColor: 'white',
          borderLeft: '1px solid #e5e7eb', // Tailwind border-gray-200
          boxShadow: '0 0 10px rgba(0,0,0,0.1)',
          willChange: 'transform',
          pointerEvents: 'auto',
        }}
      >
        <div className="flex flex-col w-full h-full">
          <div className="flex-1 overflow-hidden">
            <Daisy isOpen={showMobileBot} setIsOpen={setShowMobileBot} onStageChange={onStageChange} />
          </div>
        </div>
      </div>

      {/* Floating chatbot toggle button on mobile with notification badge */}
      {!showMobileBot && (
        <div className="fixed z-50 xl:hidden bottom-28 right-2">
          <button
            className="relative p-3 text-white bg-black rounded-full shadow-lg"
            onClick={handleMobileChatToggle}
            aria-label="Toggle Daisy Chat"
          >
            <MessageSquareText className="w-5 h-5" />
            {showBotNotification && chatMessageCount > 0 && (
              <span className="absolute flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full -top-1 -right-1">
                {chatMessageCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="fixed bottom-0 left-0 z-40 flex items-center justify-between w-full px-24 py-2 bg-white border-t xl:hidden">
        {(['home', 'property'] as const).map(view => {
          const isSelected = mobileView === view;
          const label = view.charAt(0).toUpperCase() + view.slice(1);
          return (
            <button
              key={view}
              onClick={() => setMobileView(view)}
              className="inline-flex flex-col items-center justify-center gap-1"
            >
              {view === 'home' ? (
                // Home icon with filled/unfilled variants
                isSelected ? (
                  <HomeIcon className="w-6 h-6 text-black fill-black" />
                ) : (
                  <Home className="w-6 h-6 text-zinc-500" />
                )
              ) : (
                // Property icon - custom implementation for filled effect
                <div className="relative flex items-center justify-center w-6 h-6">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    isSelected 
                      ? 'bg-black border-black' 
                      : 'bg-transparent border-zinc-500'
                  }`}>
                    <span className={`text-sm font-bold ${
                      isSelected ? 'text-white' : 'text-zinc-500'
                    }`}>
                      i
                    </span>
                  </div>
                </div>
              )}
              <span className={`text-sm font-['Geist'] leading-normal ${
                isSelected ? 'font-semibold text-black' : 'font-normal text-zinc-500'
              }`}>
                {label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}