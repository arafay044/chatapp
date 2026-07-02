// middleware to protect route

import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const protectRoute = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
        if (!token) {
            return res.status(401).json({ success: false, message: "Not authorized" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            return res.status(401).json({ success: false, message: "User not found" });
        }
        req.user = user;
        next();
    } catch (error) {
        console.log(error.message);
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ success: false, message: "Session expired", expired: true });
        }
        return res.status(401).json({ success: false, message: "Not authorized" });
    }
}