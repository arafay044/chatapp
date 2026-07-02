import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { getPublicKey, subscribe, unsubscribe } from "../controllers/notification.controller.js";

const notificationRouter = express.Router();

notificationRouter.get("/public-key", getPublicKey);
notificationRouter.post("/subscribe", protectRoute, subscribe);
notificationRouter.post("/unsubscribe", protectRoute, unsubscribe);

export default notificationRouter;
