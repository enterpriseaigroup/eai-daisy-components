import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import container from "@infrastructure/di";
import { ContactRequestSchema } from "@/app/application/models/ContactRequest";
import type { IContactService } from "@/app/application/interfaces/IContactService";
import { isRedirectError, UnauthorizedError } from "@infrastructure/services/IsRedirectError";
import { triggerServerSideLogout } from "@/app/(infrastructure)/services/BaseApiService";

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