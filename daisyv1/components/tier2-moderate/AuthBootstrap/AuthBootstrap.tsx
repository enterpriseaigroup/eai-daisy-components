'use client';

import { useTokenAndProfile } from '@presentation/hooks/useTokenAndProfile';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

export default function AuthBootstrap() {
    const searchParams = useSearchParams();
    const queryParams = useMemo(() => {
        const decoded: Record<string, string> = {};
        for (const [key, value] of searchParams.entries()) {
            decoded[key] = decodeURIComponent(value);
        }
        return decoded;
    }, [searchParams]);

    useTokenAndProfile({
        autoFetch: true,
        queryParams,
        onTokenAcquired: (token) => {
            console.log('[AuthBootstrap] Token acquired:', token);
        },
        onProfileFetched: (profile) => {
            console.log('[AuthBootstrap] Profile fetched:', profile);
        },
        onError: (err) => {
            console.error('[AuthBootstrap] Error fetching:', err);
        },
    });

    return null;
}