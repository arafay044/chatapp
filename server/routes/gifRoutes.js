import express from "express";
import { protectRoute } from "../middleware/auth.js";

const gifRouter = express.Router();

// thin proxy to Tenor so the API key never reaches the client
gifRouter.get("/search", protectRoute, async (req, res) => {
    const { q = "", limit = 24 } = req.query;
    const apiKey = process.env.TENOR_API_KEY;

    if (!apiKey) {
        return res.json({ success: true, results: [], keyMissing: true });
    }

    try {
        const endpoint = q.trim()
            ? `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(q)}&key=${apiKey}&limit=${limit}&media_filter=gif`
            : `https://tenor.googleapis.com/v2/featured?key=${apiKey}&limit=${limit}&media_filter=gif`;
        const response = await fetch(endpoint);
        const data = await response.json();
        const results = (data.results || []).map((gif) => ({
            id: gif.id,
            preview: gif.media_formats?.tinygif?.url || gif.media_formats?.gif?.url,
            url: gif.media_formats?.gif?.url,
        }));
        res.json({ success: true, results });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message, results: [] });
    }
});

export default gifRouter;
