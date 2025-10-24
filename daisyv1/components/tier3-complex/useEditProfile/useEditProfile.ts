import { useProfileStore } from '@presentation/store/useProfileStore';
import { useAuthStore } from "@presentation/store/useAuthStore";
import type { AuthStore } from '@presentation/store/useAuthStore';
import { useEditUserProfile } from "@presentation/hooks/useEditUserProfile";
import { useEffect, useState } from 'react';
import { toast } from "sonner";

export const useEditProfile = () => {
    const { profileData } = useProfileStore();
    const accessToken = useAuthStore((state: AuthStore) => state.accessToken);
    const { editUserProfile, statusMessage } = useEditUserProfile();

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
    });

    const [showStatus, setShowStatus] = useState(false);

    useEffect(() => {
        if (statusMessage) setShowStatus(true);
    }, [statusMessage]);

    useEffect(() => {
        if (profileData) {
            setFormData({
                firstName: profileData.first_name || "",
                lastName: profileData.last_name || "",
                email: profileData.email_address || "",
            });
        }
    }, [profileData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!accessToken) {
            console.error("Access token is missing. Please log in again.");
            return;
        }
        editUserProfile.mutate(
            {
                token: accessToken,
                data: {
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                },
            },
            {
                onSuccess: () => {
                    toast.success("Profile updated successfully!");
                    setShowStatus(true);
                },
                onError: async (error) => {
                    console.error("❌ Edit profile failed:", error);
                    toast.error("Failed to update profile. Please try again.");
                },
            }
        );
    };

    const handleBack = () => {
        window.history.back();
    };

    return {
        formData,
        handleInputChange,
        handleSubmit,
        handleBack,
        statusMessage,
        isLoading: editUserProfile.isPending,
        editUserProfile,
        showStatus,
        setShowStatus, // expose for closing
    };
}