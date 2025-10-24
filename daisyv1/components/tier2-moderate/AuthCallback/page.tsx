// app/auth/callback/page.tsx

// Use a single redirect URI (e.g. /auth/callback) and always return there
// In Azure Portal, add this to your list of redirect URIs: http://localhost:3000/auth/callback
// In your MSAL config: redirectUri: 'http://localhost:3000/auth/callback'


// 1. User clicks Login (or lands on /login)
// 2. Redirect to Microsoft Auth
// 3. After login → redirected back to /auth/callback
// 4. In /auth/callback:
//    - acquire token
//    - fetch profile
//    - handle org logic
//    - redirect to /dashboard (or original destination)

'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useIsAuthenticated } from '@azure/msal-react';
import { useTokenAndProfile } from '@presentation/hooks/useTokenAndProfile';

export default function AuthCallback() {
    const router = useRouter();
    const isAuthenticated = useIsAuthenticated();
    const searchParams = useSearchParams();

    const queryParams: Record<string, string> = {};
    for (const [key, value] of searchParams.entries()) {
        queryParams[key] = decodeURIComponent(value);
    }

    const { refetch } = useTokenAndProfile({
            autoFetch: true,
            queryParams,
            onProfileFetched: () => {
            router.replace('/dashboard');
        },
        onError: (err) => {
            console.error('Error completing login:', err);
            router.replace('/login');
        },
    });

    useEffect(() => {
        if (isAuthenticated) {
        refetch();
        }
    }, [isAuthenticated, refetch]);

    return (
        <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg font-medium">Finishing login process...</p>
        </div>
    );
}