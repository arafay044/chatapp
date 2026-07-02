import { memo, useState } from "react";
import { Check, CheckCheck, CornerUpLeft, MoreHorizontal, Pencil, SmilePlus, Trash2, X } from "lucide-react";
import Avatar from "./Avatar";
import VoicePlayer from "./VoicePlayer";
import LinkPreviewCard from "./LinkPreviewCard";
import { formatMessageTime } from "../lib/utils";

const QUICK_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

const groupReactions = (reactions = []) => {
  const groups = {};
  reactions.forEach((r) => {
    groups[r.emoji] = (groups[r.emoji] || 0) + 1;
  });
  return groups;
};

const MessageBubble = ({
  message,
  isOwn,
  isGroup,
  showSenderInfo,
  senderName,
  senderAvatar,
  otherParticipantCount,
  onReply,
  onEdit,
  onDelete,
  onReact,
  onImageClick,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(message.text || "");

  if (message.isDeleted) {
    return (
      <div className={`flex ${isOwn ? "justify-end" : "justify-start"} px-4 py-1`}>
        <div className="italic text-sm text-[var(--color-text-muted)] px-3 py-2 rounded-xl bg-[var(--color-surface-hover)]">
          This message was deleted
        </div>
      </div>
    );
  }

  const reactionGroups = groupReactions(message.reactions);
  const seenCount = (message.seenBy || []).filter((s) => s.userId !== message.senderId).length;
  const isFullySeen = isGroup ? seenCount >= otherParticipantCount : seenCount > 0;

  const submitEdit = () => {
    if (draft.trim() && draft !== message.text) onEdit(message._id, draft.trim());
    setIsEditing(false);
  };

  return (
    <div className={`group flex gap-2 px-4 py-1 ${isOwn ? "justify-end" : "justify-start"}`}>
      {!isOwn && isGroup && (
        <div className="w-7 shrink-0">{showSenderInfo && <Avatar src={senderAvatar} name={senderName} size="sm" />}</div>
      )}

      <div className={`flex items-center gap-1 max-w-[75%] ${isOwn ? "flex-row-reverse" : ""}`}>
        {/* hover actions */}
        <div className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 ${isOwn ? "flex-row-reverse" : ""}`}>
          <button onClick={() => onReply(message)} className="p-1.5 rounded-full hover:bg-[var(--color-surface-hover)]" aria-label="Reply">
            <CornerUpLeft size={14} />
          </button>
          <div className="relative">
            <button onClick={() => setPickerOpen((v) => !v)} className="p-1.5 rounded-full hover:bg-[var(--color-surface-hover)]" aria-label="React">
              <SmilePlus size={14} />
            </button>
            {pickerOpen && (
              <div
                onMouseLeave={() => setPickerOpen(false)}
                className={`absolute z-10 top-full mt-1 flex gap-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full px-2 py-1 shadow-lg ${isOwn ? "right-0" : "left-0"}`}
              >
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => { onReact(message._id, emoji); setPickerOpen(false); }}
                    className="hover:scale-125 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
          {isOwn && (
            <div className="relative">
              <button onClick={() => setMenuOpen((v) => !v)} className="p-1.5 rounded-full hover:bg-[var(--color-surface-hover)]" aria-label="More">
                <MoreHorizontal size={14} />
              </button>
              {menuOpen && (
                <div
                  onMouseLeave={() => setMenuOpen(false)}
                  className="absolute z-10 top-full mt-1 right-0 w-36 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-lg py-1"
                >
                  {message.type === "text" && (
                    <button
                      onClick={() => { setIsEditing(true); setMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-[var(--color-surface-hover)]"
                    >
                      <Pencil size={13} /> Edit
                    </button>
                  )}
                  <button
                    onClick={() => { onDelete(message._id, true); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-[var(--color-surface-hover)] text-red-500"
                  >
                    <Trash2 size={13} /> Delete for everyone
                  </button>
                  <button
                    onClick={() => { onDelete(message._id, false); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-[var(--color-surface-hover)]"
                  >
                    <Trash2 size={13} /> Delete for me
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="min-w-0">
          {isGroup && !isOwn && showSenderInfo && (
            <p className="text-xs font-semibold text-[var(--color-accent)] px-1 mb-0.5">{senderName}</p>
          )}

          <div
            className="relative rounded-2xl px-3 py-2 text-sm"
            style={{
              backgroundColor: isOwn ? "var(--color-bubble-out)" : "var(--color-bubble-in)",
              color: "var(--color-text)",
            }}
          >
            {message.replyTo && (
              <div className="mb-1.5 pl-2 border-l-2 border-current opacity-60 text-xs line-clamp-2">
                {message.replyTo.type === "image" ? "📷 Photo" : message.replyTo.text || "Message"}
              </div>
            )}

            {isEditing ? (
              <div className="flex items-center gap-1">
                <input
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submitEdit();
                    if (e.key === "Escape") setIsEditing(false);
                  }}
                  className="bg-transparent outline-none border-b border-current text-sm min-w-[120px]"
                />
                <button onClick={submitEdit} className="text-xs opacity-70">✓</button>
                <button onClick={() => setIsEditing(false)} className="text-xs opacity-70"><X size={12} /></button>
              </div>
            ) : (
              <>
                {message.type === "image" && message.image && (
                  <img
                    src={message.image}
                    alt="sent"
                    loading="lazy"
                    onClick={() => onImageClick(message.image)}
                    className="max-w-[240px] rounded-lg cursor-pointer"
                  />
                )}
                {message.type === "voice" && message.audioUrl && (
                  <VoicePlayer src={message.audioUrl} duration={message.duration} />
                )}
                {message.text && <p className="whitespace-pre-wrap break-words">{message.text}</p>}
                {message.linkPreview && <LinkPreviewCard preview={message.linkPreview} />}
              </>
            )}

            <div className="flex items-center justify-end gap-1 mt-1 select-none">
              {message.editedAt && <span className="text-[10px] opacity-50">edited</span>}
              <span className="text-[10px] opacity-50">{formatMessageTime(message.createdAt)}</span>
              {isOwn && (isFullySeen ? <CheckCheck size={13} className="text-blue-500" /> : <Check size={13} className="opacity-50" />)}
            </div>

            {Object.keys(reactionGroups).length > 0 && (
              <div className={`absolute -bottom-3 flex gap-0.5 ${isOwn ? "right-1" : "left-1"}`}>
                {Object.entries(reactionGroups).map(([emoji, count]) => (
                  <button
                    key={emoji}
                    onClick={() => onReact(message._id, emoji)}
                    className="text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full px-1.5 py-0.5 shadow-sm"
                  >
                    {emoji} {count > 1 && count}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(MessageBubble);
