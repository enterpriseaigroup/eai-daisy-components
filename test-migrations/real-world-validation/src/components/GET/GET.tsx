/**
 * GET - Configurator V2 Component
 *
 * Component GET from route.ts
 *
 * @migrated from DAISY v1
 */

import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import container from "@infrastructure/di";
import { isRedirectError, UnauthorizedError } from "@infrastructure/services/IsRedirectError";
import type { IGetAlertService } from "@/app/application/interfaces/IGetAlertService";
import { triggerServerSideLogout } from "@/app/(infrastructure)/services/BaseApiService";

  /**
   * BUSINESS LOGIC: GET
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements GET logic
   * 2. Calls helper functions: .get, NextResponse.json, container.resolve, alertService.getAlerts, NextResponse.json, triggerServerSideLogout, NextResponse.json, isRedirectError, console.error, NextResponse.json, NextResponse.json
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - .get() - Function call
   * - NextResponse.json() - Function call
   * - container.resolve() - Function call
   * - alertService.getAlerts() - Function call
   * - NextResponse.json() - Function call
   * - triggerServerSideLogout() - Function call
   * - NextResponse.json() - Function call
   * - isRedirectError() - Function call
   * - console.error() - Function call
   * - NextResponse.json() - Function call
   * - NextResponse.json() - Function call
   *
   * WHY IT CALLS THEM:
   * - .get: Required functionality
   * - NextResponse.json: Required functionality
   * - container.resolve: Required functionality
   * - alertService.getAlerts: Required functionality
   * - NextResponse.json: Required functionality
   * - triggerServerSideLogout: Required functionality
   * - NextResponse.json: Required functionality
   * - isRedirectError: Required functionality
   * - console.error: Error logging
   * - NextResponse.json: Required functionality
   * - NextResponse.json: Required functionality
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls .get, NextResponse.json, container.resolve to process data
   * Output: Computed value or side effect
   *
   */
export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        const token = req.headers.get("Authorization") || "";
        if (!token) {
            return NextResponse.json(
                { error: "Authorization token is required" },
                { status: 400 }
            );
        }
        const alertService = container.resolve<IGetAlertService>("IGetAlertService");
        const response = await alertService.getAlerts(token);
        return NextResponse.json(response, { status: 200 });
    } catch (error) {
        // If upstream returned 401, clean up on the server and emit a 401 for the client to react to
        if (error instanceof UnauthorizedError || isRedirectError(error)) {
            try { triggerServerSideLogout(); } catch { /* no-op */ }
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401, headers: { "X-Trigger-Logout": "1" } } // optional hint header
            );
        }
        console.error("[Public Alerts GET Error]:", error);
        if (error instanceof ZodError) {
            return NextResponse.json(
                {
                    error: "Invalid response format",
                    details: error.errors,
                },
                { status: 500 }
            );
        }
        return NextResponse.json(
            { error: "Failed to fetch alerts" },
            { status: 500 }
        );
    }
}