import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  groups: [],

  selectedUser: null,
  selectedGroup: null,

  isUsersLoading: false,
  isGroupsLoading: false,
  isMessagesLoading: false,

  // Get 1-on-1 users
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  // Get groups user is part of
  getGroups: async () => {
    set({ isGroupsLoading: true });
    try {
      const res = await axiosInstance.get("/groups/sidebar");
      set({ groups: res.data });
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to fetch groups");
    } finally {
      set({ isGroupsLoading: false });
    }
  },

  // Fetch messages for user or group
  getMessages: async (id, isGroup = false) => {
    if (!id) return;
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${id}?isGroup=${isGroup}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  // Send message to user
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    if (!selectedUser?._id) return toast.error("No user selected");

    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        { ...messageData, isGroup: false }
      );
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  // Send message to group
  sendGroupMessage: async (messageData) => {
    const { selectedGroup, messages } = get();
    if (!selectedGroup?._id) return toast.error("No group selected");

    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedGroup._id}`,
        { ...messageData, isGroup: true }
      );
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send group message");
    }
  },

  // Subscribe to socket messages
  subscribeToMessages: () => {
    const { selectedUser, selectedGroup } = get();
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    get().unsubscribeFromMessages(); // Clean up previous listeners

    if (selectedUser) {
      socket.on("newMessage", (newMessage) => {
        if (newMessage.senderId !== selectedUser._id) return;
        set({ messages: [...get().messages, newMessage] });
      });
    }

    if (selectedGroup) {
      socket.on("newGroupMessage", (newMessage) => {
        if (newMessage.groupId !== selectedGroup._id) return;
        set({ messages: [...get().messages, newMessage] });
      });
    }
  },

  // Unsubscribe from all socket events
  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("newMessage");
    socket.off("newGroupMessage");
  },

  // Select user (clear group selection)
  setSelectedUser: (user) => {
    if (get().selectedUser?._id === user._id) return; // Avoid reselecting same user
    set({ selectedUser: user, selectedGroup: null, messages: [] });
    get().getMessages(user._id, false);
  },

  // Select group (clear user selection)
  setSelectedGroup: (group) => {
    if (get().selectedGroup?._id === group._id) return; // Avoid reselecting same group
    set({ selectedGroup: group, selectedUser: null, messages: [] });
    get().getMessages(group._id, true);
  },
}));
