import Group from "../models/group.model.js";
import cloudinary from "../lib/cloudinary.js";

export const createGroup = async (req, res) => {
  try {
    const { name, groupPic } = req.body;
    const adminId = req.user.id;

    let imageUrl = "";
    if (groupPic) {
      const uploadResponse = await cloudinary.uploader.upload(groupPic);
      imageUrl = uploadResponse.secure_url;
    }

    const newGroup = await Group.create({
      name,
      adminId,
      membersId: [adminId], // Admin is also a member
      groupPic: imageUrl, // Save uploaded pic (or blank if none)
    });

    res.status(201).json(newGroup);
  } catch (error) {
    console.error("Error creating group:", error.message);
    res.status(500).json({ error: "Failed to create group" });
  }
};

export const addGroupMember = async (req, res) => {
  try {
    const groupId = req.params.id;
    const { memberIds } = req.body; //array of user IDs to add
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });
    // Check if the user is an admin
    if (group.adminId.toString() !== req.user.id)
      return res.status(403).json({ error: "Only admin can add members" });
    // Add members to the group
    const uniqueNewMembers = memberIds.filter(
      (id) => !group.membersId.includes(id)
    );
    group.membersId.push(...uniqueNewMembers);
    await group.save();
    res.status(200).json({ message: "Members added", group });
  } catch (error) {
    console.error("Error adding group members:", error.message);
    res.status(500).json({ error: "Failed to add members" });
  }
};

export const removeGroupMember = async (req, res) => {
  try {
    const groupId = req.params.id;
    const { memberIds } = req.body; // ID of the user to remove
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });
    // Check if the user is an admin
    if (group.adminId.toString() !== req.user.id)
      return res.status(403).json({ error: "Only admin can add members" });
    // Remove members from the group
    group.membersId = group.membersId.filter(
      (id) => !memberIds.includes(id.toString())
    );
    await group.save();
    res.status(200).json({ message: "Members removed", group });
  } catch (error) {
    console.error("Error removing group members:", error.message);
    res.status(500).json({ error: "Failed to remove members" });
  }
};

export const updateGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    const { name, groupPic } = req.body;
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });
    // Check if the user is an admin
    if (group.adminId.toString() !== req.user.id)
      return res.status(403).json({ error: "Only admin can update group" });
    // Update group details
    const updateData = {};
    if (name) updateData.name = name;
    if (groupPic) {
      const uploadResponse = await cloudinary.uploader.upload(groupPic);
      updateData.groupPic = uploadResponse.secure_url;
    }
    const updatedGroup = await Group.findByIdAndUpdate(groupId, updateData, {
      new: true,
    });
    res.status(200).json(updatedGroup);
  } catch (error) {
    console.error("Error updating group:", error.message);
    res.status(500).json({ error: "Failed to update group" });
  }
};

export const getGroupsForSidebar = async (req, res) => {
  try {
    const userId = req.user.id;
    const groups = await Group.find({ membersId: userId }).select(
      "name groupPic adminId"
    );
    if (!groups.length) {
      return res.status(404).json({ error: "No groups found" });
    }
    res.status(200).json(groups);
  } catch (error) {
    console.error("Error fetching user groups:", error.message);
    res.status(500).json({ error: "Failed to fetch groups" });
  }
};

export const getGroupDetails = async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.user.id;
    const group = await Group.findById(groupId)
      .populate("membersId", "name profilePic")
      .populate("adminId", "name profilePic");
    if (!group) return res.status(404).json({ error: "Group not found" });
    // Check if the user is a member of the group
    if (!group.membersId.includes(userId))
      return res
        .status(403)
        .json({ error: "You are not a member of this group" });
    // Return group details
    res.status(200).json(group);
  } catch (error) {
    console.error("Error fetching group details:", error.message);
    res.status(500).json({ error: "Failed to fetch group details" });
  }
};
