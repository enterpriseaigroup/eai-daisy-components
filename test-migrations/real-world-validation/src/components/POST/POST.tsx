/**
 * POST - Configurator V2 Component
 *
 * Component POST from route.ts
 *
 * @migrated from DAISY v1
 */

import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import container from "@infrastructure/di";
import { ContactRequestSchema } from "@/app/application/models/ContactRequest";
import type { IContactService } from "@/app/application/interfaces/IContactService";
import { isRedirectError, UnauthorizedError } from "@infrastructure/services/IsRedirectError";
import { triggerServerSideLogout } from "@/app/(infrastructure)/services/BaseApiService";

  /**
   * BUSINESS LOGIC: POST
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements POST logic
   * 2. Calls helper functions: .get, NextResponse.json, req.json, ContactRequestSchema.parse, container.resolve, contactService.sendContactForm, NextResponse.json, triggerServerSideLogout, NextResponse.json, isRedirectError, NextResponse.json, console.error, NextResponse.json
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - .get() - Function call
   * - NextResponse.json() - Function call
   * - req.json() - Function call
   * - ContactRequestSchema.parse() - Function call
   * - container.resolve() - Function call
   * - contactService.sendContactForm() - Function call
   * - NextResponse.json() - Function call
   * - triggerServerSideLogout() - Function call
   * - NextResponse.json() - Function call
   * - isRedirectError() - Function call
   * - NextResponse.json() - Function call
   * - console.error() - Function call
   * - NextResponse.json() - Function call
   *
   * WHY IT CALLS THEM:
   * - .get: Required functionality
   * - NextResponse.json: Required functionality
   * - req.json: Required functionality
   * - ContactRequestSchema.parse: Required functionality
   * - container.resolve: Required functionality
   * - contactService.sendContactForm: Required functionality
   * - NextResponse.json: Required functionality
   * - triggerServerSideLogout: Required functionality
   * - NextResponse.json: Required functionality
   * - isRedirectError: Required functionality
   * - NextResponse.json: Required functionality
   * - console.error: Error logging
   * - NextResponse.json: Required functionality
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls .get, NextResponse.json, req.json to process data
   * Output: Computed value or side effect
   *
   */
export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const token = req.headers.get("Authorization") || "";
        if (!token) {
            return NextResponse.json(
                { error: "Authorization token is required" },
                { status: 400 }
            );
        }
        const payload = await req.json();
        // Validate the request body
        const validatedPayload = ContactRequestSchema.parse(payload);
        const contactService = container.resolve<IContactService>("IContactService");
        const response = await contactService.sendContactForm(token, validatedPayload);
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
        if (error instanceof ZodError) {
            return NextResponse.json(
                { error: "Invalid request payload", details: error.errors },
                { status: 400 }
            );
        }
        console.error("Error in sending support ticket to contact center:", error);
        return NextResponse.json(
            { error: "Failed to send support ticket to contact center" },
            { status: 500 }
        );
    }
}