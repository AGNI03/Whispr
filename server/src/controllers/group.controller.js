import Group from "../models/group.model.js";
import cloudinary from "../lib/cloudinary.js";


// Group Creation Controller
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
      membersId: [adminId],
    });

    res.status(201).json(newGroup);
  } catch (error) {
    console.error("Error creating group:", error.message);
    res.status(500).json({ error: "Failed to create group" });
  }
};

// Group Update Controller
export const updateGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    const {
      name,
      groupPic,
      membersToAdd = [], // default to empty array if not provided
      membersToRemove = [],
    } = req.body;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });

    // Only admin can update the group
    if (group.adminId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Only admin can update the group" });
    }

    let hasChanges = false;
    const updateData = {};

    // Check name change
    if (name && name !== group.name) {
      updateData.name = name;
      hasChanges = true;
    }

    // Check groupPic update
    if (groupPic && groupPic !== group.groupPic) {
      const uploadResponse = await cloudinary.uploader.upload(groupPic);
      updateData.groupPic = uploadResponse.secure_url;
      hasChanges = true;
    }

    // Filter and sanitize member arrays
    const safeMembersToAdd = membersToAdd.filter(Boolean).map(String);
    const safeMembersToRemove = membersToRemove.filter(Boolean).map(String);

    // Apply member updates safely
    if (safeMembersToAdd.length > 0 || safeMembersToRemove.length > 0) {
      const updateOps = {};
      if (safeMembersToAdd.length > 0) {
        updateOps.$addToSet = { membersId: { $each: safeMembersToAdd } };
      }
      if (safeMembersToRemove.length > 0) {
        updateOps.$pull = { membersId: { $in: safeMembersToRemove } };
      }

      await Group.findByIdAndUpdate(groupId, updateOps);
      hasChanges = true;
    }

    // Apply name and groupPic if needed
    let updatedGroup = group;
    if (hasChanges && Object.keys(updateData).length > 0) {
      updatedGroup = await Group.findByIdAndUpdate(groupId, updateData, {
        new: true,
      });
    }

    updatedGroup = await Group.findById(groupId)
      .populate("membersId", "name profilePic")
      .populate("adminId", "name profilePic");

    res.status(200).json(updatedGroup);
  } catch (error) {
    console.error("Error updating group:", error.message);
    res.status(500).json({ error: "Failed to update group" });
  }
};

// Get Groups for Sidebar Controller
export const getGroupsForSidebar = async (req, res) => {
  try {
    const userId = req.user.id;
    const groups = await Group.find({ membersId: userId }).select(
      "name groupPic adminId membersId"
    );
    res.status(200).json(groups);
  } catch (error) {
    console.error("Error fetching user groups:", error.message);
    res.status(500).json({ error: "Failed to fetch groups" });
  }
};
