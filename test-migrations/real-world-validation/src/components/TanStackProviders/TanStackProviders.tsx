/**
 * TanStackProviders - Configurator V2 Component
 *
 * Component TanStackProviders from tanstack-provider.tsx
 *
 * @migrated from DAISY v1
 */

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

  /**
   * BUSINESS LOGIC: TanStackProviders
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements TanStackProviders logic
   * 2. Calls helper functions: useState
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - useState() - Function call
   *
   * WHY IT CALLS THEM:
   * - useState: Required functionality
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls useState to process data
   * Output: Computed value or side effect
   *
   */
export function TanStackProviders({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}