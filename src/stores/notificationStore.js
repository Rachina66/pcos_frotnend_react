import { create } from "zustand";
import axiosClient from "../api/axiosClient";

const useNotificationStore = create((set) => ({
  notifications: [],
  newAppointments: 0,
  cancelledAppointments: 0,
  newUsers: 0,
  newPredictions: 0,

  // ── Fetch from DB ──
  fetchNotifications: async () => {
    try {
      const res = await axiosClient.get("/notifications");
      const data = res.data?.data ?? [];
      console.log("[Store] notifications fetched:", data.length);
      console.log(
        "[Store] types:",
        data.map((n) => n.type),
      );

      const unread = data.filter((n) => !n.read);
      console.log("[Store] unread:", unread.length);
      console.log(
        "[Store] cancelled unread:",
        unread.filter((n) => n.type === "APPOINTMENT_CANCELLED").length,
      );

      set({ notifications: data });
      set({
        newAppointments: unread.filter((n) => n.type === "APPOINTMENT_NEW")
          .length,
        cancelledAppointments: unread.filter(
          (n) => n.type === "APPOINTMENT_CANCELLED",
        ).length,
        newUsers: unread.filter((n) => n.type === "USER_REGISTERED").length,
        newPredictions: unread.filter((n) => n.type === "PREDICTION_NEW")
          .length,
      });
    } catch (e) {
      console.error("[Notifications] fetch failed", e);
    }
  },

  // ── Mark one as read ──
  markAsRead: async (id) => {
    try {
      await axiosClient.patch(`/notifications/${id}/read`);
      set((s) => ({
        notifications: s.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n,
        ),
      }));
    } catch (e) {
      console.error("[Notifications] markAsRead failed", e);
    }
  },

  // ── Mark all as read ──
  markAllAsRead: async () => {
    try {
      await axiosClient.patch("/notifications/read-all");
      set((s) => ({
        notifications: s.notifications.map((n) => ({ ...n, read: true })),
        newAppointments: 0,
        cancelledAppointments: 0,
        newUsers: 0,
        newPredictions: 0,
      }));
    } catch (e) {
      console.error("[Notifications] markAllAsRead failed", e);
    }
  },

  // ── Live socket increments ──
  increment: (key) => set((s) => ({ [key]: s[key] + 1 })),
  reset: (key) => set({ [key]: 0 }),
  resetAll: () =>
    set({
      newAppointments: 0,
      cancelledAppointments: 0,
      newUsers: 0,
      newPredictions: 0,
    }),

  // ── Add live notification to top of list ──
  addLive: (notification) =>
    set((s) => ({ notifications: [notification, ...s.notifications] })),
}));

export default useNotificationStore;
