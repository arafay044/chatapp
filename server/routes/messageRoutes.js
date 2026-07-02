import express from "express";
import { protectRoute } from "../middleware/auth.js";
import {
    deleteMessage,
    editMessage,
    getMessages,
    reactToMessage,
    searchMessages,
    sendMessage,
} from "../controllers/message.controller.js";

export const messageRouter = express.Router();

messageRouter.get("/search/:conversationId", protectRoute, searchMessages);
messageRouter.get("/:conversationId", protectRoute, getMessages);
messageRouter.post("/send/:conversationId", protectRoute, sendMessage);
messageRouter.put("/:id", protectRoute, editMessage);
messageRouter.delete("/:id", protectRoute, deleteMessage);
messageRouter.put("/:id/react", protectRoute, reactToMessage);

export default messageRouter;
