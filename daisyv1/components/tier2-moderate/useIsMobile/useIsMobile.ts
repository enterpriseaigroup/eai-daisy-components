// hooks/useIsMobile.ts
'use client';

import { useState, useEffect } from 'react';

/**
 * Detects if the screen width is smaller than Tailwind's xl breakpoint (1280px)
 * Uses matchMedia to track layout changes even during zoom.
 */
export function useIsMobile(): boolean {
    const [isMobile, setIsMobile] = useState(() =>
        typeof window !== 'undefined' ? !window.matchMedia('(min-width: 1280px)').matches : false
    );
    useEffect(() => {
        const mediaQuery = window.matchMedia('(min-width: 1280px)');
        const handleChange = (e: MediaQueryListEvent) => {
            setIsMobile(!e.matches);
        };
        // Set initial value
        setIsMobile(!mediaQuery.matches);
        // Listen for changes
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);
    return isMobile;
}