import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./authStore";

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    isUsersLoading: false,
    isMessagesLoading: false,
    selectedUser: null,

    getUsers: async () => {
        set({ isUsersLoading: true })
        try {
            const response = await axiosInstance.get("/messages/users")
            set({ users: response.data })
        } catch (error) {
            toast.error(error.response.data.message)
        } finally {
            set({ isUsersLoading: false })
        }
    },

    getMessages: async (userId) => {
        set({ isMessagesLoading: true })
        try {
            const response = await axiosInstance.get(`/messages/${userId}`)
            set({ messages: response.data })

        } catch (error) {
            toast.error("Something went wrong!")
        } finally {
            set({ isMessagesLoading: false })
        }
    },

    sendMessage: async (messageData) => {
        const { messages, selectedUser } = get()
        try {
            const response = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData)
            set({ messages: [...messages, response.data] })
        } catch (error) {
            toast.error(error.message)
        }
    },


    subscribeToMessage: () => {
        const { selectedUser } = get()
        if (!selectedUser) {
            return;
        }
        const socket = useAuthStore.getState().socket

        // Optimise this later
        socket.on("newMessage", (newMessage) => {
            const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id
            if (!isMessageSentFromSelectedUser) {
                return
            }
            set({ messages: [...get().messages, newMessage] })
        })
    },

    unsubscribeFromMessage: () => {
        const socket = useAuthStore.getState().socket
        socket.off("newMessage")
    },

    // Todo: optimize later
    setSelectedUser: (selectedUser) => set({ selectedUser }),
}))