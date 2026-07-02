import express from "express";
import { protectRoute } from "../middleware/auth.js";
import {
    createGroup,
    getMyConversations,
    getOrCreateOneToOne,
    toggleMute,
    updateGroup,
    updateGroupMembers,
} from "../controllers/conversation.controller.js";

const conversationRouter = express.Router();

conversationRouter.get("/", protectRoute, getMyConversations);
conversationRouter.get("/with/:userId", protectRoute, getOrCreateOneToOne);
conversationRouter.post("/group", protectRoute, createGroup);
conversationRouter.put("/group/:id", protectRoute, updateGroup);
conversationRouter.put("/group/:id/members", protectRoute, updateGroupMembers);
conversationRouter.put("/:id/mute", protectRoute, toggleMute);

export default conversationRouter;
