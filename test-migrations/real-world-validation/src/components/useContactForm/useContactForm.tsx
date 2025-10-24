/**
 * useContactForm - Configurator V2 Component
 *
 * Component useContactForm from useContactForm.ts
 *
 * @migrated from DAISY v1
 */

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import container from "@presentation/di";

import type { IContactUseCase } from "@/app/application/interfaces/IContactUseCase";
import { ContactRequest } from "@/app/application/models/ContactRequest";
import { ContactResponse } from "@/app/application/models/ContactResponse";
import { handleApiError } from "./handleApiError";

  /**
   * BUSINESS LOGIC: useContactForm
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements useContactForm logic
   * 2. Calls helper functions: useState, useMutation, container.resolve, contactFormService.submitContactForm, console.log, setData, handleApiError, console.error, setData
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - useState() - Function call
   * - useMutation() - Function call
   * - container.resolve() - Function call
   * - contactFormService.submitContactForm() - Function call
   * - console.log() - Function call
   * - setData() - Function call
   * - handleApiError() - Function call
   * - console.error() - Function call
   * - setData() - Function call
   *
   * WHY IT CALLS THEM:
   * - useState: Required functionality
   * - useMutation: Required functionality
   * - container.resolve: Required functionality
   * - contactFormService.submitContactForm: Required functionality
   * - console.log: Debugging output
   * - setData: State update
   * - handleApiError: Required functionality
   * - console.error: Error logging
   * - setData: State update
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls useState, useMutation, container.resolve to process data
   * Output: Computed value or side effect
   *
   */
export const useContactForm = () => {
    const [data, setData] = useState<ContactResponse| null>(null);

    const contactForm = useMutation<
        ContactResponse,
        Error,
        { token: string; payload: ContactRequest }
    >({
        mutationFn: async ({ token, payload }) => {
            const contactFormService = container.resolve<IContactUseCase>(
                "IContactUseCase"
            );
            return await contactFormService.submitContactForm(token, payload);
        },
        onSuccess: (response) => {
            console.log("Support ticket sent to contact center", response);
            setData(response); // Update the data state with the response
        },
        onError: async (error: Error) => {
            await handleApiError(error);
            console.error("Error in sending support ticket to contact center:", error);
            setData(null); // Reset the data state on error
        },
    });

    return {
        contactForm,
        data,
    };
};