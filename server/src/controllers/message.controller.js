import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import Group from "../models/group.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id } = req.params; // could be userId or groupId
    const myId = req.user._id;
    const { isGroup } = req.query; // boolean flag
    let messages;
    if (isGroup === "true") {
      // Fetch group messages
      messages = await Message.find({ groupId: id });
    } else {
      // Fetch direct messages between two users
      messages = await Message.find({
        $or: [
          { senderId: myId, receiverId: id },
          { senderId: id, receiverId: myId },
        ],
      });
    }
    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image, isGroup = false } = req.body;
    const { id } = req.params; // id = groupId or receiverId
    const senderId = req.user._id;

    // Upload image if present
    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    let newMessage;

    if (isGroup) {
      // Handle group message
      const group = await Group.findById(id);
      if (!group) return res.status(404).json({ error: "Group not found" });

      if (!group.membersId.includes(senderId)) {
        return res
          .status(403)
          .json({ error: "You are not a member of this group" });
      }

      newMessage = new Message({
        senderId,
        groupId: id,
        text,
        image: imageUrl,
      });
      await newMessage.save();

      // Emit to all group members except sender
      group.membersId.forEach((memberId) => {
        if (memberId.toString() !== senderId.toString()) {
          const receiverSocketId = getReceiverSocketId(memberId);
          if (receiverSocketId) {
            io.to(receiverSocketId).emit("newGroupMessage", newMessage);
          }
        }
      });
    } else {
      // Handle private (1-to-1) message
      newMessage = new Message({
        senderId,
        receiverId: id, // fixed: not "id"
        text,
        image: imageUrl,
      });
      await newMessage.save();

      const receiverSocketId = getReceiverSocketId(id);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", newMessage);
      }
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("❌ Error in sendMessage:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
