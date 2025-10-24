import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import container from "@infrastructure/di";
import { isRedirectError, UnauthorizedError } from "@infrastructure/services/IsRedirectError";
import type { IGetAlertService } from "@/app/application/interfaces/IGetAlertService";
import { triggerServerSideLogout } from "@/app/(infrastructure)/services/BaseApiService";

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