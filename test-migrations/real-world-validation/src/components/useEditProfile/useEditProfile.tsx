/**
 * useEditProfile - Configurator V2 Component
 *
 * Component useEditProfile from useEditProfile.ts
 *
 * @migrated from DAISY v1
 */

import { useProfileStore } from '@presentation/store/useProfileStore';
import { useAuthStore } from "@presentation/store/useAuthStore";
import type { AuthStore } from '@presentation/store/useAuthStore';
import { useEditUserProfile } from "@presentation/hooks/useEditUserProfile";
import { useEffect, useState } from 'react';
import { toast } from "sonner";

  /**
   * BUSINESS LOGIC: useEditProfile
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements useEditProfile logic
   * 2. Calls helper functions: useProfileStore, useAuthStore, useEditUserProfile, useState, useState, useEffect, setShowStatus, useEffect, setFormData, setFormData, e.preventDefault, console.error, editUserProfile.mutate, toast.success, setShowStatus, console.error, toast.error, .back
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - useProfileStore() - Function call
   * - useAuthStore() - Function call
   * - useEditUserProfile() - Function call
   * - useState() - Function call
   * - useState() - Function call
   * - useEffect() - Function call
   * - setShowStatus() - Function call
   * - useEffect() - Function call
   * - setFormData() - Function call
   * - setFormData() - Function call
   * - e.preventDefault() - Function call
   * - console.error() - Function call
   * - editUserProfile.mutate() - Function call
   * - toast.success() - Function call
   * - setShowStatus() - Function call
   * - console.error() - Function call
   * - toast.error() - Function call
   * - .back() - Function call
   *
   * WHY IT CALLS THEM:
   * - useProfileStore: Required functionality
   * - useAuthStore: Required functionality
   * - useEditUserProfile: Required functionality
   * - useState: Required functionality
   * - useState: Required functionality
   * - useEffect: Required functionality
   * - setShowStatus: State update
   * - useEffect: Required functionality
   * - setFormData: State update
   * - setFormData: State update
   * - e.preventDefault: Required functionality
   * - console.error: Error logging
   * - editUserProfile.mutate: Required functionality
   * - toast.success: Required functionality
   * - setShowStatus: State update
   * - console.error: Error logging
   * - toast.error: Required functionality
   * - .back: Required functionality
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls useProfileStore, useAuthStore, useEditUserProfile to process data
   * Output: Computed value or side effect
   *
   */
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

      /**
       * BUSINESS LOGIC: Side Effect
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Monitors statusMessage for changes
       * 2. Executes setShowStatus functions
       * 3. Runs side effect logic
       *
       * WHAT IT CALLS:
       * - setShowStatus() - Function call
       *
       * WHY IT CALLS THEM:
       * - setShowStatus: State update
       *
       * DATA FLOW:
       * Input: statusMessage state/props
       * Processing: Calls setShowStatus to process data
       * Output: Side effects executed, cleanup registered
       *
       * DEPENDENCIES:
       * - statusMessage: Triggers when statusMessage changes
       *
       */
    useEffect(() => {
        if (statusMessage) setShowStatus(true);
    }, [statusMessage]);

      /**
       * BUSINESS LOGIC: Side Effect
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Monitors profileData for changes
       * 2. Executes setFormData functions
       * 3. Runs side effect logic
       *
       * WHAT IT CALLS:
       * - setFormData() - Function call
       *
       * WHY IT CALLS THEM:
       * - setFormData: State update
       *
       * DATA FLOW:
       * Input: profileData state/props
       * Processing: Calls setFormData to process data
       * Output: Side effects executed, cleanup registered
       *
       * DEPENDENCIES:
       * - profileData: Triggers when profileData changes
       *
       */
    useEffect(() => {
        if (profileData) {
            setFormData({
                firstName: profileData.first_name || "",
                lastName: profileData.last_name || "",
                email: profileData.email_address || "",
            });
        }
    }, [profileData]);

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
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

      /**
       * BUSINESS LOGIC: handleSubmit
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Implements handleSubmit logic
       * 2. Calls helper functions: e.preventDefault, console.error, editUserProfile.mutate, toast.success, setShowStatus, console.error, toast.error
       * 3. Returns computed result
       *
       * WHAT IT CALLS:
       * - e.preventDefault() - Function call
       * - console.error() - Function call
       * - editUserProfile.mutate() - Function call
       * - toast.success() - Function call
       * - setShowStatus() - Function call
       * - console.error() - Function call
       * - toast.error() - Function call
       *
       * WHY IT CALLS THEM:
       * - e.preventDefault: Required functionality
       * - console.error: Error logging
       * - editUserProfile.mutate: Required functionality
       * - toast.success: Required functionality
       * - setShowStatus: State update
       * - console.error: Error logging
       * - toast.error: Required functionality
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Calls e.preventDefault, console.error, editUserProfile.mutate to process data
       * Output: Computed value or side effect
       *
       */
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