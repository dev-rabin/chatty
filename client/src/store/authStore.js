import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  isLoggingOut: false,
  isProfileUpdating: false,
  socket: null,
  onlineUsers: [],

  checkAuth: async () => {
    try {
      const response = await axiosInstance.get("/auth/check");
      set({ authUser: response.data });
      get().connectSocket()
    } catch (error) {
      console.log("Auth check failed:", error.message);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signUp: async (data) => {
    set({ isSigningUp: true })
    try {
      const response = await axiosInstance.post("/auth/signup", data)
      set({ authUser: response.data.user })
      toast.success("Account created successfully.")
      get().connectSocket()
    } catch (error) {
      toast.error(error.response.data.message)
    } finally {
      set({ isSigningUp: false })
    }
  },

  logOut: async () => {
    set({ isLoggingOut: true })
    try {
      await axiosInstance.post("/auth/logout")
      set({ authUser: null })
      toast.success("Log out successfully.")
      get().disconnectSocket()
    } catch (error) {
      toast.error(error.response.data.message)
    } finally {
      set({ isLoggingOut: false, })
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true })
    try {
      const response = await axiosInstance.post("/auth/login", data)
      set({ authUser: response.data.user })
      toast.success("Logged in successfully.")
      get().connectSocket()
    } catch (error) {
      toast.error(error.response.data.message)
    } finally {
      set({ isLoggingIn: false })
    }
  },

  updateProfile: async (data) => {
    set({ isProfileUpdating: true })
    try {
      const response = await axiosInstance.put("/auth/update-profile", data)
      set({ authUser: response.data.user })
      toast.success("Profile upadted successfully.")
    } catch (error) {
      toast.error(error.response.data.message)
    } finally {
      set({ isProfileUpdating: false })
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) {
      return
    }
    const socket = io(BASE_URL, {
      query: { userId: authUser._id }
    })
    socket.connect()
    set({ socket: socket })
    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds })
    })
  },

  disconnectSocket: () => {
    if (get().socket.connected) {
      get().socket.disconnect()
    }
  }
}));
