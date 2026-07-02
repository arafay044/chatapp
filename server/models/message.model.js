import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // kept for 1:1 backward compatibility / quick lookups
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      enum: ["text", "image", "voice", "file"],
      default: "text",
    },
    text: {
      type: String,
    },
    image: {
      type: String,
    },
    audioUrl: {
      type: String,
    },
    duration: {
      type: Number,
    },
    fileUrl: {
      type: String,
    },
    fileName: {
      type: String,
    },
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    reactions: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        emoji: { type: String },
      },
    ],
    seenBy: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        seenAt: { type: Date, default: Date.now },
      },
    ],
    editedAt: {
      type: Date,
      default: null,
    },
    deletedFor: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    linkPreview: {
      url: String,
      title: String,
      description: String,
      image: String,
    },
  },
  { timestamps: true }
);

messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ text: "text" });

const Message = mongoose.model("Message", messageSchema);

export default Message;
