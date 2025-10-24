/**
 * useAuthStore - Configurator V2 Component
 *
 * Component useAuthStore from useAuthStore.ts
 *
 * @migrated from DAISY v1
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface AuthStore {
  accessToken: string | null;
  anonToken: string | null;
  anonTokenExpiry: string | null;
  entraOrgId: string | null;
  setAccessToken: (token: string) => void;
  setAnonToken: (token: string) => void;
  setAnonTokenExpiry: (expiry: string) => void;
  setEntraOrgId: (orgId: string) => void;
  clearTokens: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      accessToken: null,
      anonToken: null,
      anonTokenExpiry: null,
      entraOrgId: null,
      setAccessToken: (token: string) => set({ accessToken: token }),
      setAnonToken: (token: string) => set({ anonToken: token }),
      setAnonTokenExpiry: (expiry: string) => set({ anonTokenExpiry: expiry }),
      setEntraOrgId: (orgId: string) => set({ entraOrgId: orgId }),
      clearTokens: () => set({ accessToken: null, anonToken: null, anonTokenExpiry: null, entraOrgId: null }),
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => sessionStorage), // or localStorage if you want it longer lived
      partialize: (state: AuthStore) => ({
        accessToken: state.accessToken,
        anonToken: state.anonToken,
        anonTokenExpiry: state.anonTokenExpiry,
        entraOrgId: state.entraOrgId,
      }),
    }
  )
);