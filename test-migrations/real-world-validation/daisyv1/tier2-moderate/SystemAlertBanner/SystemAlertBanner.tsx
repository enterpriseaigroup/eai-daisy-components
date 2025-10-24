"use client";
import React, { useEffect, useState } from "react";
import { useGetAlert } from '../hooks/useGetAlert';
import { getValidAccessToken } from "./chatbot/utils/auth";
import { useResolvedCouncil } from "./chatbot/hooks/useResolvedCouncil";

const SystemAlertBanner = () => {
    const council = useResolvedCouncil();
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const fetchToken = async () => {
            const validToken = await getValidAccessToken(council);
            setToken(validToken);
        };
        fetchToken();
    }, [council]);

    const { data: alerts, isLoading } = useGetAlert(token || "");

    // If alerts: [], there is no downtime, so we don't show the banner
    if (isLoading || !Array.isArray(alerts) || alerts.length === 0) return null;

    console.warn("[System Alert Banner]:", alerts, "Token:", token);

    return (
        <div className="w-full py-2 px-4 bg-[#fef3c7] border-b z-50">
            <div className="w-full text-sm font-medium text-[#92400e] text-center leading-relaxed">
                System downtime alert: Some features and services may be temporarily unavailable. We’re working to restore full functionality as soon as possible.
            </div>
        </div>
    );
};

export default SystemAlertBanner;