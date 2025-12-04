import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");
    return res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error fetching users for sidebar:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: chatUserId } = req.params;
    const myId = req.user._id;
    const messages = await Message.find({
      $or: [
        { senderId: myId, recieverId: chatUserId },
        { senderId: chatUserId, recieverId: myId },
      ],
    });
    return res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body
    const { id: recieverId } = req.params
    const senderId = req.user._id

    let imageUrl
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image)
      imageUrl = uploadResponse.secure_url
    }

    const newMessage = new Message({
      senderId,
      recieverId,
      text,
      image: imageUrl
    })

    await newMessage.save();
    const recieverSocketId = getReceiverSocketId(recieverId)
    if (recieverSocketId) {
      io.to(recieverSocketId).emit("newMessage", newMessage)
    }
    return res.status(201).json(newMessage)

  } catch (error) {
    console.error("Error sending message:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}