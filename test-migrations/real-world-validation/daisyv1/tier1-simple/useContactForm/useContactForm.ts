import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import container from "@presentation/di";

import type { IContactUseCase } from "@/app/application/interfaces/IContactUseCase";
import { ContactRequest } from "@/app/application/models/ContactRequest";
import { ContactResponse } from "@/app/application/models/ContactResponse";
import { handleApiError } from "./handleApiError";

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