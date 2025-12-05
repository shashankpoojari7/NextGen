import { create } from "zustand";

type NotificationStore = {
  notificationCount: number;
  unreadUsers: string[];
  messageCount: number;

  incrementNotification: () => void;
  resetNotification: () => void;
  setNotificationCount: (val: number) => void;

  addUnreadUser: (userId: string) => void;
  removeUnreadUser: (userId: string) => void;
  resetMessage: () => void;
  setUnreadUsers: (ids: string[]) => void;
};

export const useNotificationStore = create<NotificationStore>((set) => ({
  notificationCount: 0,

  incrementNotification: () =>
    set((state) => ({ notificationCount: state.notificationCount + 1 })),

  resetNotification: () => set({ notificationCount: 0 }),

  setNotificationCount: (val) => set({ notificationCount: val }),
  unreadUsers: [],
  messageCount: 0,
  addUnreadUser: (userId) =>
    set((state) => {
      if (state.unreadUsers.includes(userId)) return state; 
      const updated = [...state.unreadUsers, userId];
      return {
        unreadUsers: updated,
        messageCount: updated.length,
      };
    }),

  removeUnreadUser: (userId) =>
    set((state) => {
      const updated = state.unreadUsers.filter((id) => id !== userId);
      return {
        unreadUsers: updated,
        messageCount: updated.length,
      };
    }),

  resetMessage: () =>
    set({
      unreadUsers: [],
      messageCount: 0,
    }),

  setUnreadUsers: (ids) =>
    set(() => ({
      unreadUsers: ids,
      messageCount: ids.length,
    })),
}));
