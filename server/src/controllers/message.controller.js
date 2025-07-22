import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import Group from "../models/group.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getGroupsForSidebar = async (req, res) => {
  try {
    const userId = req.user.id;
    const groups = await Group.find({ membersId: userId }).select("name groupPic adminId");
    if (!groups) return res.status(404).json({ error: "No groups found" });
    res.status(200).json(groups);
  } catch (error) {
    console.error("Error fetching user groups:", error.message);
    res.status(500).json({ error: "Failed to fetch groups" });
  }
}

export const getMessages = async (req, res) => {
  try {
    const { id } = req.params; // could be userId or groupId
    const myId = req.user._id;
    const { isGroup } = req.query; // boolean flag

    let messages;
    if (isGroup === "true") {
      // Fetch group messages
      messages = await Message.find({ groupId: id })
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
    const { text, image, isGroup=false } = req.body;
    const { id } = req.params; // either receiverId or groupId
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    // Create a new message
    let newMessage;
    if (isGroup){
      // For group messages
      const group = await Group.findById(id);
      if (!group) return res.status(404).json({ error: "Group not found" });
      // Check if the user is a member of the group
      if (!group.membersId.includes(senderId)) return res.status(403).json({ error: "You are not a member of this group" });
      newMessage = new Message({
        senderId,
        groupId: id,
        text,
        image: imageUrl,
      });
      await newMessage.save();
      // Emit the message to all group members
      group.membersId.forEach(memberId => {
        const receiverSocketId = getReceiverSocketId(memberId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("newGroupMessage", newMessage);
        }
      });
    } else{
      newMessage = new Message({
        senderId,
        id,
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
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
