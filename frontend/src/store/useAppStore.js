import { create } from 'zustand';

export const useAppStore = create((set) => ({
  appName: 'Workflow Orchestrator',
  setAppName: (appName) => set({ appName }),
}));
