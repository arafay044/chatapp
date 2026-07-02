import User from "../models/user.model.js";
import { pushEnabled } from "../lib/push.js";

export const getPublicKey = (req, res) => {
    res.json({ success: true, publicKey: process.env.VAPID_PUBLIC_KEY || null, enabled: pushEnabled });
};

export const subscribe = async (req, res) => {
    try {
        const { subscription } = req.body;
        await User.findByIdAndUpdate(req.user._id, { pushSubscription: subscription });
        res.json({ success: true });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

export const unsubscribe = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user._id, { pushSubscription: null });
        res.json({ success: true });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};
