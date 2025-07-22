import express from "express";
import { createGroup, addGroupMember, removeGroupMember, updateGroup, getGroupDetails } from "../controllers/group.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/create-group", protectRoute, createGroup);
router.put("/:id/add-member", protectRoute, addGroupMember);
router.put("/:id/remove-member", protectRoute, removeGroupMember);
router.put("/:id/update-group", protectRoute, updateGroup);

router.get("/:id", protectRoute, getGroupDetails);

export default router;