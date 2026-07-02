// One-time, idempotent backfill: creates a Conversation for every existing
// sender/receiver pair found on legacy Message documents (pre-group-chat schema)
// and stamps conversationId onto those messages. Safe to re-run.
//
// Usage: node scripts/backfillConversations.js

import "dotenv/config";
import mongoose from "mongoose";
import { connectDb } from "../lib/db.js";
import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";

const pairKey = (a, b) => [String(a), String(b)].sort().join(":");

const run = async () => {
    await connectDb();

    const legacyMessages = await Message.find({ conversationId: { $exists: false } });
    console.log(`Found ${legacyMessages.length} legacy messages without a conversationId`);

    const conversationCache = new Map();

    for (const message of legacyMessages) {
        if (!message.senderId || !message.receiverId) continue;
        const key = pairKey(message.senderId, message.receiverId);

        let conversationId = conversationCache.get(key);
        if (!conversationId) {
            let conversation = await Conversation.findOne({
                isGroup: false,
                participants: { $all: [message.senderId, message.receiverId], $size: 2 },
            });
            if (!conversation) {
                conversation = await Conversation.create({
                    isGroup: false,
                    participants: [message.senderId, message.receiverId],
                });
            }
            conversationId = conversation._id;
            conversationCache.set(key, conversationId);
        }

        message.conversationId = conversationId;
        if (message.seen && !message.seenBy?.length) {
            message.seenBy = [{ userId: message.receiverId, seenAt: message.updatedAt || new Date() }];
        }
        await message.save();
    }

    // stamp lastMessage on each backfilled conversation
    for (const conversationId of conversationCache.values()) {
        const last = await Message.findOne({ conversationId }).sort({ createdAt: -1 });
        if (last) {
            await Conversation.findByIdAndUpdate(conversationId, { lastMessage: last._id });
        }
    }

    console.log(`Backfilled ${conversationCache.size} conversations`);
    await mongoose.disconnect();
    process.exit(0);
};

run().catch((error) => {
    console.error(error);
    process.exit(1);
});
