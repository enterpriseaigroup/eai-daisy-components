/**
 * useApiStatusStore - Configurator V2 Component
 *
 * Component useApiStatusStore from useApiStatusStore.ts
 *
 * @migrated from DAISY v1
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import logger from "zustand-logger-middleware";

export interface ApiStatus {
  status: "idle" | "loading" | "success" | "error";
  errorMessage?: string;
}

export interface ApiStatusStore {
  apiStatuses: Record<string, ApiStatus>;
  setApiStatus: (apiName: string, status: ApiStatus) => void;
  resetApiStatus: (apiName: string) => void;
  resetAllApiStatuses: () => void;
}

export const useApiStatusStore = create<ApiStatusStore>()(
  logger(
    persist(
      (set) => ({
        apiStatuses: {},

        setApiStatus: (apiName, status) =>
          set((state) => {
            console.log(`Updating API status for ${apiName}:`, status);
            return {
              apiStatuses: {
                ...state.apiStatuses,
                [apiName]: status,
              },
            };
          }),

        resetApiStatus: (apiName: string) =>
          set((state) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [apiName]: _, ...remainingStatuses } = state.apiStatuses;
            return { apiStatuses: remainingStatuses };
          }),

        resetAllApiStatuses: () =>
          set(() => ({
            apiStatuses: {},
          })),
      }),
      {
        name: "api-status-store", // Key for localStorage
        storage: createJSONStorage(() => localStorage), // or localStorage if you want it longer lived
      }
    )
  )
);