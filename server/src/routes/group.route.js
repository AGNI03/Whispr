import express from "express";
import { createGroup, updateGroup, getGroupsForSidebar} from "../controllers/group.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/create-group", protectRoute, createGroup);
router.get("/sidebar", protectRoute, getGroupsForSidebar);
router.put("/:id/update-group", protectRoute, updateGroup);

export default router;