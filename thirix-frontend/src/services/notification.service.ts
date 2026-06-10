import api from "../lib/api";


export const getNotifications = async () => {
  try {
    const res = await api.get("/notifications");
    return res.data;
  } catch (error) {
    console.error("getNotifications error:", error);
    return [];
  }
};


export const markAsRead = async (id: string) => {
  try {
    const res = await api.put(`/notifications/${id}/read`);
    return res.data;
  } catch (error) {
    console.error("markAsRead error:", error);
    return null;
  }
};