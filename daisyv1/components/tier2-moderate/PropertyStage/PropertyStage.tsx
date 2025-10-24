'use client';

import React, { useState, useEffect } from 'react';
import { Home, FileText, ScrollText, Check, Info } from 'lucide-react';
import { useProfileStore } from '@presentation/store/useProfileStore';
import type { ProfileStoreState } from "@/app/(presentation)/store/useProfileStore";
import { StageType } from '@domain/entities/ApplicationStage';
import { safeUpdateUserConfig } from '../chatbot/utils/safeUpdateUserConfig';
import { Card } from '@/components/ui/card';

interface PropertyStageProps {
  onStageChange?: (stage: StageType) => void;
}

export default function PropertyStage({ }: PropertyStageProps) {
  const [addressStarted, setAddressStarted] = useState(false);

  useEffect(() => {
    const { getProfileData, updateUserConfig } = useProfileStore.getState();
    const profileData = getProfileData();
    if (profileData) {
      safeUpdateUserConfig("user_config.state", "qa", profileData, updateUserConfig);
    }
    const locallyStarted = localStorage.getItem('addressStarted') === 'true';
    if (locallyStarted) {
      setAddressStarted(true);
    }
  }, []);

  const project = useProfileStore((state: ProfileStoreState) => state.getProfileData()?.user_config?.project);

  useEffect(() => {
    const hasBoth = !!project?.address && !!project?.prop_id;
    if (hasBoth && !addressStarted) {
      setAddressStarted(true);
      localStorage.setItem('addressStarted', 'true');
    }
  }, [project?.address, project?.prop_id, addressStarted]);

  // Was previously px-4, added mb-4
  return (
    <div className="flex flex-col w-full px-2 xl:max-w-[767px] 2xl:max-w-[850px] mb-4">
      {/* Intro Card */}
      <Card className="w-full p-4 mb-6 bg-gray-50 rounded outline outline-1 outline-neutral-300 outline-offset-[-1px] shadow-none">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 flex items-center justify-center rounded-full bg-[#f8f8f7]">
            <Info className="w-5 h-5 text-[#585854]" strokeWidth={2} />
          </div>
          <p className="text-base leading-relaxed text-[#1d1d1d] font-[Geist] font-bold">
            Enter your address in the chat and I’ll fetch all the property info you need!
          </p>
        </div>
      </Card>

      {/* Heading */}
      <span className="self-stretch text-lg font-medium leading-7 text-black text-primary mt-[-2px]">
        Four areas DAISY can help you
      </span>

      {/* Card List */}
      {[
        {
          icon: <Home size={20} strokeWidth={1.5} className="text-[#1d1d1d]" />,
          title: "Property",
          desc: "Check your property for restrictions that may impact your development",
        },
        {
          icon: <FileText size={20} strokeWidth={1.5} className="text-[#1d1d1d]" />,
          title: "Identification",
          desc: "Identify an application type for your proposed development",
        },
        {
          icon: <ScrollText size={20} strokeWidth={1.5} className="text-[#1d1d1d]" />,
          title: "Documents",
          desc: "Provide a personalized list of documents required for your application",
        },
        {
          icon: <Check size={20} strokeWidth={1.5} className="text-[#1d1d1d]" />,
          title: "Review",
          desc: "Review your documents for submission to the Planning Portal",
        },
      ].map(({ icon, title, desc }) => (
        <Card key={title} className="w-full gap-2 p-4 mb-2 rounded shadow-none">
            <div className="flex flex-col">
              <div className="flex items-center">
                <div className="w-8 h-8 mr-3 flex items-center justify-center rounded-full bg-[#f2f2f2]">
                  {icon}
                </div>
                <h2 className="text-base font-medium leading-none tracking-wide text-foreground">
                  {title}
                </h2>
              </div>
              <p className="text-base font-normal leading-normal text-foreground ml-11">
                {desc}
              </p>
            </div>
          </Card>
      ))}
    </div>
  );
}