import { create } from "zustand"
import { devtools } from "zustand/middleware";

interface OnlineStore {
  onlineUsers: Set<String>,
  setOnlineList: (list: string[]) => void,
  addOnlineUser: (userId: string) => void,
  removeOnlineUser: (userId: string) => void,
}

const onlineStore = (set: any): OnlineStore => ({
  onlineUsers: new Set(),

  setOnlineList: (list: string[]) =>
    set(() => ({ onlineUsers: new Set(list) }), false, "setOnlineList"),

  addOnlineUser: (userId: string) =>
    set((state: OnlineStore) => {
      const updated = new Set(state.onlineUsers);
      updated.add(userId);
      return { onlineUsers: updated };
    }, false, "addOnlineUser"),

  removeOnlineUser: (userId: string) =>
    set((state: OnlineStore) => {
      const updated = new Set(state.onlineUsers);
      updated.delete(userId);
      return { onlineUsers: updated };
    }, false, "removeOnlineUser"),
});

export const useOnlineStore = create<OnlineStore>()(
  devtools(onlineStore)
);