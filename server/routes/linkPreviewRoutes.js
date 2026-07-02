import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { fetchLinkPreview } from "../lib/linkPreview.js";

const linkPreviewRouter = express.Router();

linkPreviewRouter.get("/", protectRoute, async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ success: false, message: "url is required" });
    const preview = await fetchLinkPreview(url);
    res.json({ success: true, preview });
});

export default linkPreviewRouter;
