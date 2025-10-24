'use client';

import { useState } from 'react';
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
    TooltipProvider,
} from "@/components/ui/tooltip";
import { Card } from '@/components/ui/card';
import { ChevronDown } from 'lucide-react';
import { Project } from '@domain/entities/ProfileData';

interface Props {
    applicationName: string;
    project: Project;
}

export default function DevelopmentSummaryCard({ applicationName, project }: Props) {
    const [open, setOpen] = useState(true);
    const TRACKED_FIELDS: { key: keyof Project; label: string }[] = [
        { key: "development_type", label: "Development Type" },
        { key: "project_size", label: "Project Size" },
        { key: "front_setback", label: "Front Setback" },
        { key: "side_setback", label: "Side Setback" },
        { key: "rear_setback", label: "Rear Setback" },
        { key: "building_height", label: "Building Height" },
        { key: "sub_division", label: "Subdivision" },
    ];
    const fields = TRACKED_FIELDS
        .map(({ key, label }) => {
            const rawValue = project[key];
            const value = typeof rawValue === "string" || typeof rawValue === "number" ? rawValue.toString() : "";
            return { label, value };
        })
        .filter((field) => field.value.trim() !== "");

    return (
        // GARETH: Added mb-0
        <Card className="w-full gap-2 px-2 py-4 my-2 mt-0 mb-0 bg-white border-none rounded shadow-none">
            {/* Header */}
            <div className="flex items-start justify-between">
                <TooltipProvider delayDuration={100}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <h2 className="self-stretch text-lg font-medium leading-tight text-primary">
                                {applicationName}
                            </h2>
                        </TooltipTrigger>
                        <TooltipContent
                            side="top"
                            align="center"
                            sideOffset={4}
                            className="z-50 max-w-[200px] px-3 py-2 text-xs break-words whitespace-normal"
                        >
                            {applicationName}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <button
                    onClick={() => setOpen(!open)}
                    className="p-1 !min-h-0 bg-white border border-gray-300 rounded-md hover:bg-gray-100"
                    aria-label="Toggle details"
                >
                <ChevronDown
                    className={`w-4 h-4 text-black transition-transform ${open ? 'rotate-180' : ''}`}
                />
                </button>
            </div>
            {/* Collapsible Content */}
            {open && (
                <div className="mt-3 space-y-2 text-base">
                    {fields.length === 0 ? (
                        <p className="text-gray-600">
                            As you answer DAISY’s questions, answers will populate here.
                        </p>
                    ) : (
                        fields.map(({ label, value }) => (
                        <div key={label} className="flex flex-col">
                            <span className="text-base text-gray-500">{label}</span>
                            <span className="text-sm text-black">{value}</span>
                        </div>
                        ))
                    )}
                </div>
            )}
        </Card>
    );
}