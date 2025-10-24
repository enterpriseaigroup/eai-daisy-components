import { useState } from "react";
import { toast } from "sonner";
import { useContactForm } from "../../hooks/useContactForm";
import type { ContactRequest } from "@/app/application/models/ContactRequest";
import { useProfileStore } from "../../store/useProfileStore";
import { getValidAccessToken } from "../../components/chatbot/utils/auth";
import { isUserLoggedIn } from "../../components/chatbot/utils/storeHelpers";
import { useResolvedCouncil } from "../../components/chatbot/hooks/useResolvedCouncil";

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
    const handleBack = () => {
        window.history.back();
    };
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };
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