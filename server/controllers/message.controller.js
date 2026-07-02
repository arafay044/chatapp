import cloudinary from "../lib/cloudinary.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import { io, userSocketMap } from "../server.js";
import { fetchLinkPreview, extractFirstUrl } from "../lib/linkPreview.js";
import { sendPushNotification } from "../lib/push.js";

const assertMember = async (conversationId, userId) => {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.some((p) => String(p) === String(userId))) {
        return null;
    }
    return conversation;
};

// paginated message history for a conversation (cursor = message id to page before)
export const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { before, limit = 30 } = req.query;
        const myId = req.user._id;

        const conversation = await assertMember(conversationId, myId);
        if (!conversation) {
            return res.status(403).json({ success: false, message: "Not a member of this conversation" });
        }

        const query = { conversationId, isDeleted: false, deletedFor: { $ne: myId } };
        if (before) query._id = { $lt: before };

        const messages = await Message.find(query)
            .sort({ _id: -1 })
            .limit(Number(limit))
            .populate("replyTo", "text image type senderId")
            .lean();

        await Message.updateMany(
            { conversationId, senderId: { $ne: myId }, "seenBy.userId": { $ne: myId } },
            { $push: { seenBy: { userId: myId, seenAt: new Date() } } }
        );

        io.to(String(conversationId)).emit("messagesSeen", { conversationId, userId: myId });

        res.json({
            success: true,
            messages: messages.reverse(),
            hasMore: messages.length === Number(limit),
        });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// send a message (text / image / voice / file) into a conversation
export const sendMessage = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { text, image, audioUrl, duration, replyTo, type } = req.body;
        const senderId = req.user._id;

        const conversation = await assertMember(conversationId, senderId);
        if (!conversation) {
            return res.status(403).json({ success: false, message: "Not a member of this conversation" });
        }

        let imageUrl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        let resolvedAudioUrl;
        if (audioUrl) {
            const uploadResponse = await cloudinary.uploader.upload(audioUrl, { resource_type: "video" });
            resolvedAudioUrl = uploadResponse.secure_url;
        }

        let linkPreview;
        if (text) {
            const url = extractFirstUrl(text);
            if (url) linkPreview = await fetchLinkPreview(url);
        }

        const receiverId = !conversation.isGroup
            ? conversation.participants.find((p) => String(p) !== String(senderId))
            : undefined;

        const newMessage = await Message.create({
            conversationId,
            senderId,
            receiverId,
            type: type || (imageUrl ? "image" : resolvedAudioUrl ? "voice" : "text"),
            text,
            image: imageUrl,
            audioUrl: resolvedAudioUrl,
            duration,
            replyTo: replyTo || null,
            linkPreview,
            seenBy: [{ userId: senderId, seenAt: new Date() }],
        });

        conversation.lastMessage = newMessage._id;
        await conversation.save();

        const populated = await newMessage.populate("replyTo", "text image type senderId");

        io.to(String(conversationId)).emit("newMessage", populated);

        // notify offline recipients via web push
        const offlineRecipients = conversation.participants.filter(
            (p) => String(p) !== String(senderId) && !userSocketMap[String(p)]
        );
        if (offlineRecipients.length > 0) {
            const recipients = await User.find({ _id: { $in: offlineRecipients } }).select("pushSubscription");
            const preview = text || (imageUrl ? "📷 Photo" : resolvedAudioUrl ? "🎤 Voice message" : "New message");
            recipients.forEach((r) => {
                if (r.pushSubscription) {
                    sendPushNotification(r.pushSubscription, {
                        title: req.user.fullName,
                        body: preview,
                        conversationId: String(conversationId),
                    });
                }
            });
        }

        res.json({ success: true, message: populated });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// edit a text message (only by its sender)
export const editMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;
        const message = await Message.findById(id);
        if (!message) return res.status(404).json({ success: false, message: "Message not found" });
        if (String(message.senderId) !== String(req.user._id)) {
            return res.status(403).json({ success: false, message: "You can only edit your own messages" });
        }
        message.text = text;
        message.editedAt = new Date();
        await message.save();
        io.to(String(message.conversationId)).emit("messageEdited", message);
        res.json({ success: true, message });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// soft-delete a message (for everyone if sender, else just for me)
export const deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { forEveryone } = req.query;
        const message = await Message.findById(id);
        if (!message) return res.status(404).json({ success: false, message: "Message not found" });

        if (forEveryone === "true") {
            if (String(message.senderId) !== String(req.user._id)) {
                return res.status(403).json({ success: false, message: "You can only delete your own messages for everyone" });
            }
            message.isDeleted = true;
            message.text = "";
            message.image = undefined;
            message.audioUrl = undefined;
            await message.save();
            io.to(String(message.conversationId)).emit("messageDeleted", { _id: message._id, conversationId: message.conversationId });
        } else {
            message.deletedFor.push(req.user._id);
            await message.save();
        }

        res.json({ success: true });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// toggle an emoji reaction on a message
export const reactToMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { emoji } = req.body;
        const userId = req.user._id;
        const message = await Message.findById(id);
        if (!message) return res.status(404).json({ success: false, message: "Message not found" });

        const existingIndex = message.reactions.findIndex(
            (r) => String(r.userId) === String(userId) && r.emoji === emoji
        );
        if (existingIndex >= 0) {
            message.reactions.splice(existingIndex, 1);
        } else {
            message.reactions = message.reactions.filter((r) => String(r.userId) !== String(userId));
            message.reactions.push({ userId, emoji });
        }
        await message.save();
        io.to(String(message.conversationId)).emit("messageReaction", {
            _id: message._id,
            conversationId: message.conversationId,
            reactions: message.reactions,
        });
        res.json({ success: true, reactions: message.reactions });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// full-text search of messages within a conversation
export const searchMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { q } = req.query;
        const myId = req.user._id;

        const conversation = await assertMember(conversationId, myId);
        if (!conversation) {
            return res.status(403).json({ success: false, message: "Not a member of this conversation" });
        }
        if (!q) return res.json({ success: true, messages: [] });

        const messages = await Message.find({
            conversationId,
            isDeleted: false,
            $text: { $search: q },
        })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        res.json({ success: true, messages });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};
