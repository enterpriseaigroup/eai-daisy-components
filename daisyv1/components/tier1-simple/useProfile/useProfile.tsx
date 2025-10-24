'use client';

import { useContext } from "react";
import { ProfileContextProps, ProfileContext } from "./ProfileContext";


export const useProfile = (): ProfileContextProps => {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error("useProfile must be used within a ProfileProvider");
    }
    return context;
};
