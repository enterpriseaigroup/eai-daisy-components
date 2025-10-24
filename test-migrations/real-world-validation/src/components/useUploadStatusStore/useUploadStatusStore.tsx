/**
 * useUploadStatusStore - Configurator V2 Component
 *
 * Component useUploadStatusStore from uploadStatusStore.ts
 *
 * @migrated from DAISY v1
 */

import { create } from 'zustand';
import { UploadStatus } from '../components/MiddleColumn/useDocumentTable';

interface UploadStatusState {
  statuses: Record<string, UploadStatus[]>;
  setStatuses: (newStatuses: Record<string, UploadStatus[]>) => void;
  updateStatus: (docId: string, statuses: UploadStatus[]) => void;
  updateFileStatus: (docId: string, fileIndex: number, status: Partial<UploadStatus>) => void;
  resetStatuses: () => void;
}

export const useUploadStatusStore = create<UploadStatusState>((set) => ({
  statuses: {},
  setStatuses: (newStatuses) => {
    console.log('setStatuses called with:', JSON.stringify(newStatuses));
    set({ statuses: { ...newStatuses } });
  },
  updateStatus: (docId, statuses) => {
    console.log(`updateStatus called for docId: ${docId}, statuses:`, JSON.stringify(statuses));
    set((state) => ({
      statuses: {
        ...state.statuses,
        [docId]: [...statuses],
      },
    }));
  },
  updateFileStatus: (docId, fileIndex, statusUpdate) => {
    set((state) => {
      const current = state.statuses[docId] || [];
      const updated = current.map((s, idx) =>
        idx === fileIndex ? { ...s, ...statusUpdate } : s
      );
      return { statuses: { ...state.statuses, [docId]: updated } };
    });
  },
  resetStatuses: () => {
    console.log('resetStatuses called');
    set({ statuses: {} });
  },
}));