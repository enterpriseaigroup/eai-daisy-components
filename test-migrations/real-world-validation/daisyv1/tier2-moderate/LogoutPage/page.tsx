'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getMsalInstance } from '@/app/(presentation)/components/auth/config';
import { resetForLogout } from '@/app/(presentation)/store/utils/sessionUtils';

export default function LogoutPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const logout = async () => {
            const internal = searchParams.get('internal');
            if (internal !== 'true') {
                console.warn('[LogoutPage] Unauthorized logout attempt. Redirecting...');
                router.replace('/');
                return;
            }
            console.log('[LogoutPage] Running logout logic...');
            try {
                // 1. Reset in-memory stores (Zustand etc)
                resetForLogout();
                // 2. Clear browser storage
                sessionStorage.clear();
                localStorage.clear();
                // 3. Trigger MSAL logout redirect
                const msalInstance = getMsalInstance();
                await msalInstance.logoutRedirect();
            } catch (err) {
                console.error('[LogoutPage] Logout failed:', err);
                router.replace('/');
            }
        };
        logout();
    }, [router, searchParams]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-90">
            <div className="text-center">
                <div className="inline-block w-20 h-20 mb-4 border-t-2 border-b-2 border-gray-500 rounded-full animate-spin"></div>
                <p className="mt-4 font-semibold text-gray-600 text-[14px] font-geist">
                Logging you out...
                </p>
            </div>
        </div>
    );
}