/**
 * CouncilSubmissionCards - Configurator V2 Component
 *
 * Component CouncilSubmissionCards from CouncilSubmissionCards.tsx
 *
 * @migrated from DAISY v1
 */

'use client';

import React from "react";
import { useProfileStore } from "../../store/useProfileStore";
import { councilConfig } from "../../constants/councilMappings";
import { StageType } from "@domain/entities/ApplicationStage";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export interface CouncilCardProps {
    activeCard: "CDC" | "EXEMPT" | null;
    previousStage: StageType | null;
    goBackToStage: (stage: StageType) => void;
}

  /**
   * BUSINESS LOGIC: CouncilSubmissionCards
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements CouncilSubmissionCards logic
   * 2. Calls helper functions: useProfileStore, getProfileData, .find, .includes, name.toLowerCase, councilName.toLowerCase, Object.keys, .map, goBackToStage
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - useProfileStore() - Function call
   * - getProfileData() - Function call
   * - .find() - Function call
   * - .includes() - Function call
   * - name.toLowerCase() - Function call
   * - councilName.toLowerCase() - Function call
   * - Object.keys() - Function call
   * - .map() - Function call
   * - goBackToStage() - Function call
   *
   * WHY IT CALLS THEM:
   * - useProfileStore: Required functionality
   * - getProfileData: Required functionality
   * - .find: Required functionality
   * - .includes: Required functionality
   * - name.toLowerCase: Required functionality
   * - councilName.toLowerCase: Required functionality
   * - Object.keys: Required functionality
   * - .map: Required functionality
   * - goBackToStage: Required functionality
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls useProfileStore, getProfileData, .find to process data
   * Output: Computed value or side effect
   *
   */
export default function CouncilSubmissionCards({
    activeCard,
    previousStage,
    goBackToStage,
}: CouncilCardProps) {
    const { getProfileData } = useProfileStore();
    const councilName = getProfileData()?.user_config?.project?.council_name || "";
    const councilKey = Object.keys(councilConfig).find((name) =>
        councilName.toLowerCase().includes(name.toLowerCase())
    );
    const councilData = councilKey ? councilConfig[councilKey] : null;

    return (
        // GARETH: Added mt-4, mb-4
        <div className="flex flex-col h-full w-full max-w-[767px] px-2 mt-4 mb-4">
            {/* CDC or EXEMPT Info Card */}
            {(activeCard === "CDC" || activeCard === "EXEMPT") && councilData && (
                <Card className="w-full p-6 mb-0 rounded shadow-none">
                    <div className="flex flex-col">
                        {/* Title */}
                        <div className="mb-4 text-xl font-semibold text-foreground">
                        {activeCard === "CDC"
                            ? "Complying Development Certificate"
                            : "Exempt Development"}
                        </div>
                        {/* Description */}
                        {activeCard === "CDC" ? (
                        <p
                            className="mb-6 text-base font-normal leading-relaxed cdc-description text-foreground"
                            dangerouslySetInnerHTML={{ __html: councilData.cdcDescription }}
                        />
                        ) : (
                        <p className="mb-6 text-base font-normal leading-relaxed text-foreground">
                            Based on the information you have provided, the development you are proposing may be exempt. You&apos;ll need to confirm this with council. Please select the link below to view more details about exempt developments or feel free to continue asking DAISY questions.
                        </p>
                        )}
                        {/* Action Buttons - align left */}
                        <div className="flex flex-col items-start gap-2 sm:flex-row lg:items-start lg:justify-start">
                            {(activeCard === "CDC"
                                ? councilData.certificationLinks
                                : [{ label: "Council Website", href: councilData.exemptLink }]
                            ).map((link, idx) => (
                                <a
                                key={idx}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                >
                                <Button
                                    variant="outline"
                                    className="h-10 px-4 py-2 text-sm font-medium border rounded-md border-input text-foreground bg-background hover:bg-muted"
                                >
                                    {link.label}
                                </Button>
                                </a>
                            ))}
                        </div>
                    </div>
                </Card>
            )}
            <div className="flex items-center justify-between w-full mt-6">
                <Button
                    onClick={() => previousStage && goBackToStage(previousStage)}
                    variant="outline"
                    className="justify-center text-base font-medium"
                >
                    <ArrowRight className="w-5 h-5 rotate-180" />
                    Back
                </Button>
            </div>
        </div>
    );
}