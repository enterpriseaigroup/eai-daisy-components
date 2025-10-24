// app/formBricks.tsx
'use client';

import { useEffect } from 'react';
import formbricks from "@formbricks/js";
import { useProfileStore } from './(presentation)/store/useProfileStore';

export default function FormBricks() {
    const setFormBricksInitialized = useProfileStore((state) => state.setFormBricksInitialized);
    useEffect(() => {
        const url = process.env.NEXT_PUBLIC_FORMBRICKS_URL;
        const envId = process.env.NEXT_PUBLIC_FORMBRICKS_ENV_ID;
        // Only initialize if we have both URL and Environment ID configured
        if (typeof window !== 'undefined' && url && envId) {
            try {
                formbricks.setup({
                    environmentId: envId,
                    appUrl: url,
                });
                // ✅ Robust DOM presence check with polling
                let attempt = 0;
                const maxAttempts = 10;
                const interval = setInterval(() => {
                    const container = document.getElementById('formbricks-app-container');
                    const isPopulated = container && container.children.length > 0;
                    if (isPopulated) {
                        console.log('FormBricks container rendered.');
                        setFormBricksInitialized(true);
                        clearInterval(interval);
                    } else if (++attempt >= maxAttempts) {
                        console.warn('FormBricks container not populated after retries.');
                        setFormBricksInitialized(false);
                        clearInterval(interval);
                    }
                }, 300); // retry every 300ms
            } catch (error) {
                console.error('Failed to initialize FormBricks:', error);
                setFormBricksInitialized(false);
            }
        } else {
            console.log('FormBricks skipped: Missing URL, Environment ID, or not in browser environment');
            if (!url) console.log('NEXT_PUBLIC_FORMBRICKS_URL not configured');
            if (!envId) console.log('NEXT_PUBLIC_FORMBRICKS_ENV_ID not configured');
            setFormBricksInitialized(false);
        }
    }, [setFormBricksInitialized]);
    return null;
}