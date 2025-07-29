import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import Group from "../models/group.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

// Controller to get users for the sidebar
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


// Controller to get messages for a user or group
export const getMessages = async (req, res) => {
  try {
    const { id } = req.params; // could be userId or groupId
    const myId = req.user._id;
    const { isGroup } = req.query; // boolean flag

    let messages;

    if (isGroup === "true") {
      messages = await Message.find({ groupId: id }).populate(
        "senderId",
        "fullName profilePic"
      );
    } else {
      messages = await Message.find({
        $or: [
          { senderId: myId, receiverId: id },
          { senderId: id, receiverId: myId },
        ],
      }).populate("senderId", "fullName profilePic");
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
    const { id } = req.params;  // could be userId or groupId
    const senderId = req.user._id;

    // Upload image if present
    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    let newMessage;

    if (isGroup) {
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
      await newMessage.populate("senderId", "fullName profilePic");

      group.membersId.forEach((memberId) => {
        if (memberId.toString() !== senderId.toString()) {
          const receiverSocketId = getReceiverSocketId(memberId);
          if (receiverSocketId) {
            io.to(receiverSocketId).emit("newGroupMessage", newMessage);
          }
        }
      });
    } else {
      newMessage = new Message({
        senderId,
        receiverId: id,
        text,
        image: imageUrl,
      });
      await newMessage.save();
      await newMessage.populate("senderId", "fullName profilePic");

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
