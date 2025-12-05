import { create } from "zustand";

interface LoaderStore {
  loading: boolean;
  show: () => void;
  hide: () => void;
}

export const useGlobalLoader = create<LoaderStore>((set) => ({
  loading: false,
  show: () => set({ loading: true }),
  hide: () => set({ loading: false }),
}));
