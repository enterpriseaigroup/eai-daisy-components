// app/ClarityProvider.tsx
'use client';

import { useEffect } from 'react';
import clarity from '@microsoft/clarity';

export default function ClarityProvider() {
    useEffect(() => {
        const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;
        // Only initialize if we have a Clarity ID configured
        if (typeof window !== 'undefined' && clarityId) {
            try {
                clarity.init(clarityId);
                console.log('Microsoft Clarity initialized successfully');
            } catch (error) {
                console.error('Failed to initialize Microsoft Clarity:', error);
            }
        } else {
            console.log('Microsoft Clarity skipped: Missing Clarity ID or not in browser environment');
            if (!clarityId) console.log('NEXT_PUBLIC_CLARITY_ID not configured');
        }
    }, []);
    return null;
}