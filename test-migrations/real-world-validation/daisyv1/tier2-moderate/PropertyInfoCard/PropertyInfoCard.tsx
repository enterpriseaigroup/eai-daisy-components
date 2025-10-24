'use client';

import Image from 'next/image';
import dynamic from 'next/dynamic';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import infoIcon from '@public/images/information.png';
import fireActiveIcon from '@public/images/fire_active.svg';
import fireNotActiveIcon from '@public/images/fire_not_active.svg';
import floodActiveIcon from '@public/images/flood_active.svg';
import floodNotActiveIcon from '@public/images/flood_not_active.svg';
import heritageActiveIcon from '@public/images/heritage_active.svg';
import heritageNotActiveIcon from '@public/images/heritage_not_active.svg';
import { Loader2, ChevronDown, Info } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Project } from '@/app/domain/entities/ProfileData';
import { getCouncilNameByEntraId, getCouncilByName } from '../../constants/councilMappings';
import { useProfileStore } from '../../store/useProfileStore';

const MapBox = dynamic(() => import('../mapbox/MapBox'), { ssr: false });

interface Props {
    address: string;
    propId: string | null;
    projectData: Project;
    hasValue: (val: unknown) => boolean;
    propertyReportLink?: string;
    setShowReportModal: (val: boolean) => void;
}

export default function PropertyInfoCard({
    address,
    propId,
    projectData,
    hasValue,
    propertyReportLink,
    setShowReportModal,
}: Props) {
    const [open, setOpen] = useState(true);
    const { profileData } = useProfileStore();
    // Safely resolve council name from project or org ID
    const resolvedCouncil = getCouncilByName(projectData.council_name, profileData?.current_org_id);
    const resolvedCouncilName = resolvedCouncil?.name || getCouncilNameByEntraId(profileData?.current_org_id);
    // TODO: #810 Remove Flood for WSC & CC
    const isSupportedCouncil = resolvedCouncilName?.toLowerCase().includes('cumberland') || resolvedCouncilName?.toLowerCase().includes('wingecarribee');

    return (
        // GARETH: Removed borders via border-none, changed text-xs to text-sm, tooltip changes for min_lot_size
        // 18 heading text-lg - 16 content text-base - 14 button text-sm
        <Card className="w-full gap-2 px-2 py-4 my-2 mt-0 bg-white border-none rounded shadow-none">
            {/* Header */}
            <div className="flex items-start justify-between">
                <TooltipProvider delayDuration={100}>
                <Tooltip>
                    <TooltipTrigger asChild>
                    <h2 className="self-stretch text-lg font-medium leading-tight text-primary">
                        {address ? address : 'Your property'}
                    </h2>
                    </TooltipTrigger>
                    <TooltipContent
                        side="top"
                        align="center"
                        sideOffset={4}
                        className="z-50 max-w-[200px] px-3 py-2 text-xs break-words whitespace-normal"
                    >
                        {address ? address : 'Search your property address'}
                    </TooltipContent>
                </Tooltip>
                </TooltipProvider>
                <button
                    onClick={() => setOpen(!open)}
                    className="p-1 !min-h-0 bg-white border border-gray-300 rounded-md hover:bg-gray-100"
                    aria-label="Toggle details"
                >
                    <ChevronDown className={`w-4 h-4 text-black transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>
            </div>
            {/* Collapsible Content */}
            {open && (
                <div>
                {!address ? (
                    <div className="flex flex-col w-full gap-4 mt-2">
                        <div className="w-full p-4 bg-[#f8f8f8] rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-300 flex items-start gap-2">
                            {/* Info icon (single circle only) */}
                            <div className="w-8 h-8 rounded-full bg-[#f8f8f7] flex items-center justify-center">
                                <Info className="w-5 h-5 text-[#585854]" strokeWidth={2} />
                            </div>
                            {/* Message and CTA */}
                            <div className="flex flex-col items-start justify-center flex-1 gap-2">
                                <p className="text-[#1d1d1d] text-base font-normal leading-normal pt-1">
                                    Search for an address so we can provide more information about your property
                                </p>
                                <Button
                                    variant="outline"
                                    className="h-10 px-4 py-2 text-sm font-medium outline outline-1 outline-offset-[-1px] outline-gray-300 bg-white rounded-md"
                                    onClick={() => {
                                        useProfileStore.getState().setTriggerAddressCard(true);
                                    }}
                                >
                                    Search for your address
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div>
                        {/* MapBox: flush under header, full width, no border radius */}
                        <div className="w-full h-64 mb-3">
                            <MapBox
                            selectedAddress={address}
                            propID={propId}
                            onLotSizeUpdate={({ lotSize, gisLotWidth }) => {
                                console.log('Received from MapBox:', lotSize, gisLotWidth);
                            }}
                            isVisible={true}
                            />
                        </div>
                        {/* Status Icons: pills, outlined */}
                        {/* // TODO: #810 Remove Flood */}
                        <div className={`grid ${isSupportedCouncil ? 'grid-cols-2' : 'grid-cols-3'} gap-2 my-3 text-center`}>
                            {/* Fire Zone */}
                            <TooltipProvider delayDuration={100}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                <div className="flex flex-col items-center justify-center p-2 border rounded-md">
                                    {!hasValue(projectData.is_bushfire_zone) ? (
                                    <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                                    ) : (
                                    <div
                                    className={`w-8 h-8 flex items-center justify-center rounded-full ${
                                        projectData.is_bushfire_zone ? 'bg-[#FECACA]' : 'bg-[#f8f8f7]'
                                    }`}
                                    >
                                    <Image
                                        src={projectData.is_bushfire_zone ? fireActiveIcon : fireNotActiveIcon}
                                        alt={projectData.is_bushfire_zone ? "Fire Zone" : "No Fire Zone"}
                                        width={28}
                                        height={28}
                                        style={{
                                        filter: projectData.is_bushfire_zone
                                            ? ''
                                            : 'grayscale(100%) brightness(80%)',
                                        }}
                                    />
                                    </div>
                                    )}
                                    <p className="mt-1 text-sm text-center">
                                    {!hasValue(projectData.is_bushfire_zone)
                                        ? "No fire"
                                        : projectData.is_bushfire_zone
                                        ? "Fire"
                                        : "No fire"}
                                    </p>
                                </div>
                                </TooltipTrigger>
                                <TooltipContent
                                    side="top"
                                    align="center"
                                    sideOffset={4}
                                    className="z-50 max-w-[200px] px-3 py-2 text-xs break-words whitespace-normal"
                                >
                                {!hasValue(projectData.is_bushfire_zone)
                                    ? "Loading bushfire zone information..."
                                    : `Based on available data, this property is ${projectData.is_bushfire_zone ? '' : 'not '}in a bushfire zone.`}
                                </TooltipContent>
                            </Tooltip>
                            </TooltipProvider>
                            {/* Flood Zone */}
                            {/* // TODO: #810 Remove Flood */}
                            {!isSupportedCouncil && (
                            <TooltipProvider delayDuration={100}>
                                <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex flex-col items-center justify-center p-2 border rounded-md">
                                    {!hasValue(projectData.is_flood_zone) ? (
                                        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                                    ) : (
                                    <div
                                    className={`w-8 h-8 flex items-center justify-center rounded-full ${
                                        projectData.is_flood_zone ? 'bg-[#eff9fc]' : 'bg-[#f8f8f7]'
                                    }`}
                                    >
                                    <Image
                                        src={projectData.is_flood_zone ? floodActiveIcon : floodNotActiveIcon}
                                        alt={projectData.is_flood_zone ? "Flood Zone" : "No Flood"}
                                        width={28}
                                        height={28}
                                        style={{
                                        filter: projectData.is_flood_zone ? '' : 'grayscale(100%) brightness(80%)',
                                        }}
                                    />
                                    </div>
                                    )}
                                    <p className="mt-1 text-sm text-center">
                                        {!hasValue(projectData.is_flood_zone)
                                        ? "No flood"
                                        : projectData.is_flood_zone
                                        ? "Flood"
                                        : "No flood"}
                                    </p>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent
                                    side="top"
                                    align="center"
                                    sideOffset={4}
                                    className="z-50 max-w-[200px] px-3 py-2 text-xs break-words whitespace-normal"
                                >
                                    {!hasValue(projectData.is_flood_zone)
                                    ? "Loading flood zone information..."
                                    : `Based on available data, this property is ${projectData.is_flood_zone ? '' : 'not '}in a flood zone.`}
                                </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            )}
                            {/* Heritage Zone */}
                            <TooltipProvider delayDuration={100}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                <div className="flex flex-col items-center justify-center p-2 border rounded-md">
                                    {!hasValue(projectData.is_heritage_zone) ? (
                                    <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                                    ) : (
                                    <div
                                    className={`w-8 h-8 flex items-center justify-center rounded-full ${
                                        projectData.is_heritage_zone ? 'bg-[#fefae7]' : 'bg-[#f8f8f7]'
                                    }`}
                                    >
                                    <Image
                                        src={projectData.is_heritage_zone ? heritageActiveIcon : heritageNotActiveIcon}
                                        alt={projectData.is_heritage_zone ? "Heritage" : "No Heritage"}
                                        width={28}
                                        height={28}
                                        style={{
                                        filter: projectData.is_heritage_zone
                                            ? ''
                                            : 'grayscale(100%) brightness(80%)',
                                        }}
                                    />
                                    </div>
                                    )}
                                    <p className="mt-1 text-sm text-center">
                                    {!hasValue(projectData.is_heritage_zone)
                                        ? "Not heritage"
                                        : projectData.is_heritage_zone
                                        ? "Heritage"
                                        : "Not heritage"}
                                    </p>
                                </div>
                                </TooltipTrigger>
                                <TooltipContent
                                    side="top"
                                    align="center"
                                    sideOffset={4}
                                    className="z-50 max-w-[200px] px-3 py-2 text-xs break-words whitespace-normal"
                                >
                                {!hasValue(projectData.is_heritage_zone)
                                    ? "Loading heritage zone information..."
                                    : `Based on available data, this property is ${projectData.is_heritage_zone ? '' : 'not '}in a heritage zone.`}
                                </TooltipContent>
                            </Tooltip>
                            </TooltipProvider>
                        </div>
                        {/* Zone and attributes */}
                        <div className="mt-3 space-y-2">
                            {/* Zone */}
                            <div>
                            <p className="text-base text-gray-500">Zone</p>
                            {!hasValue(projectData.zone) ? (
                                <p className="flex items-center text-sm text-black">
                                <Loader2 className="w-3 h-3 mr-2 text-gray-500 animate-spin" />
                                <span>Loading...</span>
                                </p>
                            ) : (
                                (() => {
                                const zone = projectData.zone;
                                const desc = projectData.zone_description;
                                if (hasValue(desc)) {
                                    const cleanedDesc = desc!.replace(`${zone}: `, '');
                                    return (
                                    <p className="text-sm text-black">{zone}: {cleanedDesc}</p>
                                    );
                                } else {
                                    return <p className="text-sm text-black">{zone}</p>;
                                }
                                })()
                            )}
                            </div>
                            {/* Property Size */}
                            <div>
                            <p className="text-base text-gray-500">Property Size</p>
                            {!hasValue(projectData.lot_size) ? (
                                <p className="flex items-center text-sm text-black">
                                <Loader2 className="w-3 h-3 mr-2 text-gray-500 animate-spin" />
                                <span>Loading...</span>
                                </p>
                            ) : (
                                <p className="text-sm text-black">{projectData.lot_size}</p>
                            )}
                            </div>
                            {/* Lot Width */}
                            <div>
                            {projectData.lot_width === undefined ? (
                                <div>
                                    <p className="text-base text-gray-500">Lot Width</p>
                                    <p className="flex items-center text-sm text-black">
                                    <Loader2 className="w-3 h-3 mr-2 text-gray-500 animate-spin" />
                                    <span>Loading...</span>
                                    </p>
                                </div>
                                ) : hasValue(projectData.lot_width) ? (
                                <div>
                                    <p className="text-base text-gray-500">Lot Width</p>
                                    <p className="text-sm text-black">{projectData.lot_width}</p>
                                </div>
                            ) : null}
                            </div>
                            {/* Max Building Height */}
                            <div>
                            {projectData.max_building_height === undefined ? (
                                <div>
                                    <p className="text-base text-gray-500">Max Building Height</p>
                                    <p className="flex items-center text-sm text-black">
                                    <Loader2 className="w-3 h-3 mr-2 text-gray-500 animate-spin" />
                                    <span>Loading...</span>
                                    </p>
                                </div>
                                ) : hasValue(projectData.max_building_height) ? (
                                <div>
                                    <p className="text-base text-gray-500">Max Building Height</p>
                                    <p className="text-sm text-black">{projectData.max_building_height}</p>
                                </div>
                            ) : null}
                            </div>
                            {/* Min Lot Size */}
                            <div>
                            <div className="flex items-center">
                                <div className="flex-1">
                                {projectData.min_lot_size === undefined ? (
                                    <div>
                                        <p className="text-base text-gray-500">Min Lot Size</p>
                                        <p className="flex items-center text-sm text-black">
                                        <Loader2 className="w-3 h-3 mr-2 text-gray-500 animate-spin" />
                                        <span>Loading...</span>
                                        </p>
                                    </div>
                                    ) : hasValue(projectData.min_lot_size) ? (
                                    <div>
                                        <p className="text-base text-gray-500">Min Lot Size</p>
                                        <p className="flex items-center text-sm text-black">
                                        {projectData.min_lot_size}
                                            <TooltipProvider delayDuration={100}>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                <Image
                                                    src={infoIcon}
                                                    alt="Info"
                                                    width={14}
                                                    height={14}
                                                    className="ml-2 cursor-pointer mt-[2px]"
                                                    style={{ filter: 'brightness(0) saturate(100%)' }}
                                                />
                                                </TooltipTrigger>
                                                <TooltipContent
                                                    side="top"
                                                    align="center"
                                                    sideOffset={4}
                                                    className="z-50 max-w-[200px] px-3 py-2 text-xs break-words whitespace-normal"
                                                >
                                                    This is the minimum lot size allowed in your area. Your property must be at least 2× this size in order to subdivide.
                                                </TooltipContent>
                                            </Tooltip>
                                            </TooltipProvider>
                                        </p>
                                    </div>
                                ) : null}
                                </div>
                            </div>
                            </div>
                        </div>
                        {/* Report Button */}
                        {propertyReportLink && (
                            <Button
                            variant="outline"
                            className="w-full mt-2 text-sm"
                            onClick={() => setShowReportModal(true)}
                            >
                            View property report
                            </Button>
                        )}
                        </div>
                    </>
                )}
                </div>
            )}
        </Card>
    );
}
