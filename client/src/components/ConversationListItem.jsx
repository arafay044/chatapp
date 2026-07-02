import { memo } from "react";
import Avatar from "./Avatar";
import { formatLastSeen } from "../lib/utils";

const lastMessagePreview = (message) => {
  if (!message) return "No messages yet";
  if (message.isDeleted) return "This message was deleted";
  if (message.type === "image") return "📷 Photo";
  if (message.type === "voice") return "🎤 Voice message";
  return message.text || "";
};

const ConversationListItem = ({ conversation, authUser, isOnline, unreadCount, isSelected, onClick }) => {
  const otherUser = conversation.isGroup
    ? null
    : conversation.participants.find((p) => p._id !== authUser._id);

  const title = conversation.isGroup ? conversation.groupName : otherUser?.fullName || "Unknown";
  const avatarSrc = conversation.isGroup ? conversation.groupIcon : otherUser?.profilePic;

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
        isSelected ? "bg-[var(--color-surface-hover)]" : "hover:bg-[var(--color-surface-hover)]"
      }`}
    >
      <Avatar src={avatarSrc} name={title} size="lg" online={!conversation.isGroup && isOnline} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-medium truncate">{title}</p>
          {conversation.lastMessage && (
            <span className="text-xs text-[var(--color-text-muted)] shrink-0">
              {formatLastSeen(conversation.lastMessage.createdAt)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className="text-sm text-[var(--color-text-muted)] truncate">
            {lastMessagePreview(conversation.lastMessage)}
          </p>
          {unreadCount > 0 && (
            <span className="shrink-0 min-w-5 h-5 px-1.5 rounded-full bg-[var(--color-accent)] text-white text-xs font-semibold flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

export default memo(ConversationListItem);
