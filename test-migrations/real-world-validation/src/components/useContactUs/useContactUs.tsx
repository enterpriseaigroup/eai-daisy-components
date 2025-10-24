/**
 * useContactUs - Configurator V2 Component
 *
 * Component useContactUs from useContactUs.ts
 *
 * @migrated from DAISY v1
 */

import { useState } from "react";
import { toast } from "sonner";
import { useContactForm } from "../../hooks/useContactForm";
import type { ContactRequest } from "@/app/application/models/ContactRequest";
import { useProfileStore } from "../../store/useProfileStore";
import { getValidAccessToken } from "../../components/chatbot/utils/auth";
import { isUserLoggedIn } from "../../components/chatbot/utils/storeHelpers";
import { useResolvedCouncil } from "../../components/chatbot/hooks/useResolvedCouncil";

  /**
   * BUSINESS LOGIC: useContactUs
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements useContactUs logic
   * 2. Calls helper functions: useState, useProfileStore, useContactForm, useResolvedCouncil, useState, useState, isUserLoggedIn, .back, setFormData, e.preventDefault, toast.error, title.trim, description.trim, getValidAccessToken, toast.error, toast.error, first_name.trim, last_name.trim, email.trim, toast.error, setIsSubmitting, contactForm.mutateAsync, toast.success, setFormData, setIsSubmitting, console.error, toast.error
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - useState() - Function call
   * - useProfileStore() - Function call
   * - useContactForm() - Function call
   * - useResolvedCouncil() - Function call
   * - useState() - Function call
   * - useState() - Function call
   * - isUserLoggedIn() - Function call
   * - .back() - Function call
   * - setFormData() - Function call
   * - e.preventDefault() - Function call
   * - toast.error() - Function call
   * - title.trim() - Function call
   * - description.trim() - Function call
   * - getValidAccessToken() - Function call
   * - toast.error() - Function call
   * - toast.error() - Function call
   * - first_name.trim() - Function call
   * - last_name.trim() - Function call
   * - email.trim() - Function call
   * - toast.error() - Function call
   * - setIsSubmitting() - Function call
   * - contactForm.mutateAsync() - Function call
   * - toast.success() - Function call
   * - setFormData() - Function call
   * - setIsSubmitting() - Function call
   * - console.error() - Function call
   * - toast.error() - Function call
   *
   * WHY IT CALLS THEM:
   * - useState: Required functionality
   * - useProfileStore: Required functionality
   * - useContactForm: Required functionality
   * - useResolvedCouncil: Required functionality
   * - useState: Required functionality
   * - useState: Required functionality
   * - isUserLoggedIn: Required functionality
   * - .back: Required functionality
   * - setFormData: State update
   * - e.preventDefault: Required functionality
   * - toast.error: Required functionality
   * - title.trim: Required functionality
   * - description.trim: Required functionality
   * - getValidAccessToken: Required functionality
   * - toast.error: Required functionality
   * - toast.error: Required functionality
   * - first_name.trim: Required functionality
   * - last_name.trim: Required functionality
   * - email.trim: Required functionality
   * - toast.error: Required functionality
   * - setIsSubmitting: State update
   * - contactForm.mutateAsync: Required functionality
   * - toast.success: Required functionality
   * - setFormData: State update
   * - setIsSubmitting: State update
   * - console.error: Error logging
   * - toast.error: Required functionality
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls useState, useProfileStore, useContactForm to process data
   * Output: Computed value or side effect
   *
   */
export const useContactUs = () => {
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        title: "",
        description: "",
    });
    const profileData = useProfileStore((state) => state.profileData);
    const { contactForm } = useContactForm();
    const council = useResolvedCouncil();
    const [responseMessage, setResponseMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isLoggedIn = isUserLoggedIn();
      /**
       * BUSINESS LOGIC: handleBack
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Implements handleBack logic
       * 2. Calls helper functions: .back
       * 3. Returns computed result
       *
       * WHAT IT CALLS:
       * - .back() - Function call
       *
       * WHY IT CALLS THEM:
       * - .back: Required functionality
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Calls .back to process data
       * Output: Computed value or side effect
       *
       */
    const handleBack = () => {
        window.history.back();
    };
      /**
       * BUSINESS LOGIC: handleInputChange
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Implements handleInputChange logic
       * 2. Calls helper functions: setFormData
       * 3. Returns computed result
       *
       * WHAT IT CALLS:
       * - setFormData() - Function call
       *
       * WHY IT CALLS THEM:
       * - setFormData: State update
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Calls setFormData to process data
       * Output: Computed value or side effect
       *
       */
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };
      /**
       * BUSINESS LOGIC: handleSubmit
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Implements handleSubmit logic
       * 2. Calls helper functions: e.preventDefault, toast.error, title.trim, description.trim, getValidAccessToken, toast.error, toast.error, first_name.trim, last_name.trim, email.trim, toast.error, setIsSubmitting, contactForm.mutateAsync, toast.success, setFormData, setIsSubmitting, console.error, toast.error
       * 3. Returns computed result
       *
       * WHAT IT CALLS:
       * - e.preventDefault() - Function call
       * - toast.error() - Function call
       * - title.trim() - Function call
       * - description.trim() - Function call
       * - getValidAccessToken() - Function call
       * - toast.error() - Function call
       * - toast.error() - Function call
       * - first_name.trim() - Function call
       * - last_name.trim() - Function call
       * - email.trim() - Function call
       * - toast.error() - Function call
       * - setIsSubmitting() - Function call
       * - contactForm.mutateAsync() - Function call
       * - toast.success() - Function call
       * - setFormData() - Function call
       * - setIsSubmitting() - Function call
       * - console.error() - Function call
       * - toast.error() - Function call
       *
       * WHY IT CALLS THEM:
       * - e.preventDefault: Required functionality
       * - toast.error: Required functionality
       * - title.trim: Required functionality
       * - description.trim: Required functionality
       * - getValidAccessToken: Required functionality
       * - toast.error: Required functionality
       * - toast.error: Required functionality
       * - first_name.trim: Required functionality
       * - last_name.trim: Required functionality
       * - email.trim: Required functionality
       * - toast.error: Required functionality
       * - setIsSubmitting: State update
       * - contactForm.mutateAsync: Required functionality
       * - toast.success: Required functionality
       * - setFormData: State update
       * - setIsSubmitting: State update
       * - console.error: Error logging
       * - toast.error: Required functionality
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Calls e.preventDefault, toast.error, title.trim to process data
       * Output: Computed value or side effect
       *
       */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const { first_name, last_name, email, title, description } = formData;
        if (!title.trim() || !description.trim()) {
            toast.error("Please fill in both the title and message fields.");
            return;
        }
        const token = await getValidAccessToken(council);
        if (!token) {
            toast.error("Unable to get access token. Please try again.");
            return;
        }
        let user_config;
        if (isLoggedIn) {
            const userProfile = profileData?.user_config;
            if (
                !userProfile?.first_name ||
                !userProfile?.last_name ||
                !userProfile?.email ||
                !userProfile?.org_id
            ) {
                toast.error("Your profile is incomplete. Please update your details.");
                return;
            }
            user_config = {
                first_name: userProfile.first_name,
                last_name: userProfile.last_name,
                email: userProfile.email,
                org_id: userProfile.org_id,
            };
        } else {
            if (!first_name.trim() || !last_name.trim() || !email.trim()) {
                toast.error("Please provide your full name and email.");
                return;
            }
            const userProfile = profileData?.user_config;
            user_config = {
                first_name,
                last_name,
                email,
                org_id: userProfile?.org_id ?? "anonymous-org",
            };
        }
        const payload: ContactRequest = {
            title,
            description,
            user_config,
        };
        try {
            setIsSubmitting(true);
            await contactForm.mutateAsync({ token, payload });
            toast.success("Your message has been received!");
            setFormData({
                first_name: "",
                last_name: "",
                email: "",
                title: "",
                description: "",
            });
        } catch (error) {
            console.error("❌ Error in contact form submission:", error);
            toast.error("Something went wrong. Please try again later.");
        } finally {
            setIsSubmitting(false);
        }
    };
    const isProfileReady = !!profileData?.user_config?.first_name &&
        !!profileData?.user_config?.last_name &&
        !!profileData?.user_config?.email &&
        !!profileData?.user_config?.org_id;
    return {
        formData,
        handleInputChange,
        handleSubmit,
        handleBack,
        responseMessage,
        setResponseMessage,
        error: contactForm.error,
        isProfileReady,
        isSubmitting,
        isLoggedIn,
    };
};