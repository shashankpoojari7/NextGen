import { create } from "zustand";

interface ActiveChatState {
  activePeerId: string | null;
  setActivePeer: (id: string | null) => void;
}

export const useActiveChatStore = create<ActiveChatState>((set) => ({
  activePeerId: null,
  setActivePeer: (id) => set({ activePeerId: id }),
}));
