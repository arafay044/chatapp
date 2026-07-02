import cloudinary from "../lib/cloudinary.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";

const USER_FIELDS = "-password -pushSubscription";

// list all conversations for the logged in user, newest activity first
export const getMyConversations = async (req, res) => {
    try {
        const userId = req.user._id;
        const conversations = await Conversation.find({ participants: userId })
            .populate("participants", USER_FIELDS)
            .populate("lastMessage")
            .sort({ updatedAt: -1 })
            .lean();

        const unreadCounts = {};
        await Promise.all(
            conversations.map(async (conv) => {
                const count = await Message.countDocuments({
                    conversationId: conv._id,
                    senderId: { $ne: userId },
                    "seenBy.userId": { $ne: userId },
                    isDeleted: false,
                });
                if (count > 0) unreadCounts[conv._id] = count;
            })
        );

        res.json({ success: true, conversations, unreadCounts });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// get (or lazily create) the 1:1 conversation with another user
export const getOrCreateOneToOne = async (req, res) => {
    try {
        const myId = req.user._id;
        const { userId } = req.params;
        if (userId === String(myId)) {
            return res.status(400).json({ success: false, message: "Cannot start a conversation with yourself" });
        }

        let conversation = await Conversation.findOne({
            isGroup: false,
            participants: { $all: [myId, userId], $size: 2 },
        }).populate("participants", USER_FIELDS);

        if (!conversation) {
            conversation = await Conversation.create({
                isGroup: false,
                participants: [myId, userId],
            });
            conversation = await conversation.populate("participants", USER_FIELDS);
        }

        res.json({ success: true, conversation });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// create a group conversation
export const createGroup = async (req, res) => {
    try {
        const myId = req.user._id;
        const { groupName, participantIds, groupIcon } = req.body;

        if (!groupName || !participantIds || participantIds.length < 2) {
            return res.status(400).json({
                success: false,
                message: "Group name and at least 2 other members are required",
            });
        }

        let iconUrl = "";
        if (groupIcon) {
            const upload = await cloudinary.uploader.upload(groupIcon);
            iconUrl = upload.secure_url;
        }

        const participants = [...new Set([String(myId), ...participantIds])];

        const conversation = await Conversation.create({
            isGroup: true,
            groupName,
            groupIcon: iconUrl,
            participants,
            admins: [myId],
        });

        const populated = await conversation.populate("participants", USER_FIELDS);
        res.json({ success: true, conversation: populated });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// rename a group / change its icon
export const updateGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const { groupName, groupIcon } = req.body;
        const conversation = await Conversation.findById(id);
        if (!conversation || !conversation.isGroup) {
            return res.status(404).json({ success: false, message: "Group not found" });
        }
        if (!conversation.admins.some((a) => String(a) === String(req.user._id))) {
            return res.status(403).json({ success: false, message: "Only admins can update the group" });
        }
        if (groupName) conversation.groupName = groupName;
        if (groupIcon) {
            const upload = await cloudinary.uploader.upload(groupIcon);
            conversation.groupIcon = upload.secure_url;
        }
        await conversation.save();
        const populated = await conversation.populate("participants", USER_FIELDS);
        res.json({ success: true, conversation: populated });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// add/remove members of a group
export const updateGroupMembers = async (req, res) => {
    try {
        const { id } = req.params;
        const { add = [], remove = [] } = req.body;
        const conversation = await Conversation.findById(id);
        if (!conversation || !conversation.isGroup) {
            return res.status(404).json({ success: false, message: "Group not found" });
        }
        if (!conversation.admins.some((a) => String(a) === String(req.user._id))) {
            return res.status(403).json({ success: false, message: "Only admins can manage members" });
        }
        const current = new Set(conversation.participants.map(String));
        add.forEach((id) => current.add(String(id)));
        remove.forEach((id) => current.delete(String(id)));
        conversation.participants = [...current];
        conversation.admins = conversation.admins.filter((a) => current.has(String(a)));
        await conversation.save();
        const populated = await conversation.populate("participants", USER_FIELDS);
        res.json({ success: true, conversation: populated });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// mute/unmute a conversation for the logged in user
export const toggleMute = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const conversation = await Conversation.findById(id);
        if (!conversation) {
            return res.status(404).json({ success: false, message: "Conversation not found" });
        }
        const isMuted = conversation.mutedBy.some((u) => String(u) === String(userId));
        if (isMuted) {
            conversation.mutedBy = conversation.mutedBy.filter((u) => String(u) !== String(userId));
        } else {
            conversation.mutedBy.push(userId);
        }
        await conversation.save();
        res.json({ success: true, muted: !isMuted });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};
