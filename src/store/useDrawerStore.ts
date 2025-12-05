import { create } from "zustand";

interface DrawerState {
  isNotificationDrawerOpen: boolean;
  toggle: () => void;
}

export const useDrawerStore = create<DrawerState>((set) => ({
  isNotificationDrawerOpen: false,
  toggle: () => set((state) => ({
    isNotificationDrawerOpen: !state.isNotificationDrawerOpen,
  }))
}));
