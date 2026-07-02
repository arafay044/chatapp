import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Activity, ArrowLeft, Phone, Search, Video } from "lucide-react";
import Avatar from "./Avatar";
import MessageBubble from "./MessageBubble";
import MessageComposer from "./MessageComposer";
import TypingIndicator from "./TypingIndicator";
import ImageLightbox from "./ImageLightbox";
import { useMessages, flattenMessagePages, useEditMessage, useDeleteMessage, useReactToMessage } from "../hooks/useMessages";
import { useConversationStore } from "../store/useConversationStore";
import { useAuthStore } from "../store/useAuthStore";
import { useUIStore } from "../store/useUIStore";
import { useWebRTCCall } from "../hooks/useWebRTCCall";
import { formatDateSeparator, formatLastSeen } from "../lib/utils";

const ChatWindow = () => {
  const selectedConversation = useConversationStore((s) => s.selectedConversation);
  const clearSelectedConversation = useConversationStore((s) => s.clearSelectedConversation);
  const setReplyingTo = useConversationStore((s) => s.setReplyingTo);
  const typingByConversation = useConversationStore((s) => s.typingByConversation);
  const authUser = useAuthStore((s) => s.authUser);
  const onlineUsers = useAuthStore((s) => s.onlineUsers);
  const toggleInfoPanel = useUIStore((s) => s.toggleInfoPanel);
  const openSearchOverlay = useUIStore((s) => s.openSearchOverlay);
  const { startCall } = useWebRTCCall();

  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const topSentinelRef = useRef(null);
  const prevScrollHeightRef = useRef(0);
  const isNearBottomRef = useRef(true);
  const [lightboxSrc, setLightboxSrc] = useState(null);

  const conversationId = selectedConversation?._id;
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useMessages(conversationId);
  const editMessage = useEditMessage();
  const deleteMessage = useDeleteMessage();
  const reactToMessage = useReactToMessage();

  const messages = flattenMessagePages(data);

  const otherUser = selectedConversation && !selectedConversation.isGroup
    ? selectedConversation.participants.find((p) => p._id !== authUser._id)
    : null;
  const isOnline = otherUser && onlineUsers.includes(otherUser._id);
  const typingUserIds = [...(typingByConversation[conversationId] || [])].filter((id) => id !== authUser._id);

  // scroll to bottom whenever the conversation changes
  useEffect(() => {
    if (conversationId) {
      isNearBottomRef.current = true;
      requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: "auto" }));
    }
  }, [conversationId]);

  // auto-scroll on new messages if user is already near the bottom
  useLayoutEffect(() => {
    if (isNearBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  // preserve scroll offset when older messages are prepended
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || !isFetchingNextPage) return;
    prevScrollHeightRef.current = container.scrollHeight;
  }, [isFetchingNextPage]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || !prevScrollHeightRef.current) return;
    const diff = container.scrollHeight - prevScrollHeightRef.current;
    if (diff > 0) {
      container.scrollTop += diff;
      prevScrollHeightRef.current = 0;
    }
  }, [messages.length]);

  useEffect(() => {
    const sentinel = topSentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { root: containerRef.current, threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, conversationId]);

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    isNearBottomRef.current = distanceFromBottom < 150;
  };

  if (!selectedConversation) {
    return (
      <div className="hidden md:flex flex-col items-center justify-center h-full gap-3 text-[var(--color-text-muted)]">
        <div className="w-16 h-16 rounded-full bg-[var(--color-surface-hover)] flex items-center justify-center">
          <Activity size={28} />
        </div>
        <p className="text-sm">Select a conversation to start chatting</p>
      </div>
    );
  }

  const title = selectedConversation.isGroup ? selectedConversation.groupName : otherUser?.fullName;
  const subtitle = selectedConversation.isGroup
    ? `${selectedConversation.participants.length} members`
    : isOnline
      ? "Online"
      : otherUser?.lastSeen
        ? `Last seen ${formatLastSeen(otherUser.lastSeen)}`
        : "";

  let lastDate = null;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-[var(--color-border)]">
        <button onClick={clearSelectedConversation} className="md:hidden p-1" aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <button onClick={toggleInfoPanel} className="flex items-center gap-3 min-w-0 flex-1 text-left">
          <Avatar
            src={selectedConversation.isGroup ? selectedConversation.groupIcon : otherUser?.profilePic}
            name={title}
            size="md"
            online={isOnline}
          />
          <div className="min-w-0">
            <p className="font-medium truncate">{title}</p>
            {subtitle && <p className="text-xs text-[var(--color-text-muted)] truncate">{subtitle}</p>}
          </div>
        </button>
        <div className="flex items-center gap-1">
          {!selectedConversation.isGroup && (
            <>
              <button onClick={() => startCall(otherUser, "audio")} className="p-2 rounded-full hover:bg-[var(--color-surface-hover)]" aria-label="Voice call">
                <Phone size={18} />
              </button>
              <button onClick={() => startCall(otherUser, "video")} className="p-2 rounded-full hover:bg-[var(--color-surface-hover)]" aria-label="Video call">
                <Video size={18} />
              </button>
            </>
          )}
          <button onClick={openSearchOverlay} className="p-2 rounded-full hover:bg-[var(--color-surface-hover)]" aria-label="Search messages">
            <Search size={18} />
          </button>
        </div>
      </div>

      <div ref={containerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto py-2">
        <div ref={topSentinelRef} />
        {isFetchingNextPage && (
          <p className="text-center text-xs text-[var(--color-text-muted)] py-2">Loading older messages...</p>
        )}
        {isLoading && <p className="text-center text-sm text-[var(--color-text-muted)] mt-6">Loading...</p>}

        {messages.map((message, index) => {
          const messageDate = formatDateSeparator(message.createdAt);
          const showDateSeparator = messageDate !== lastDate;
          lastDate = messageDate;

          const isOwn = (message.senderId?._id || message.senderId) === authUser._id;
          const prevMessage = messages[index - 1];
          const showSenderInfo =
            !prevMessage ||
            (prevMessage.senderId?._id || prevMessage.senderId) !== (message.senderId?._id || message.senderId) ||
            showDateSeparator;

          const sender = selectedConversation.isGroup
            ? selectedConversation.participants.find((p) => p._id === (message.senderId?._id || message.senderId))
            : null;

          return (
            <div key={message._id}>
              {showDateSeparator && (
                <div className="flex justify-center my-3">
                  <span className="text-xs px-3 py-1 rounded-full bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]">
                    {messageDate}
                  </span>
                </div>
              )}
              <MessageBubble
                message={message}
                isOwn={isOwn}
                isGroup={selectedConversation.isGroup}
                showSenderInfo={showSenderInfo}
                senderName={sender?.fullName}
                senderAvatar={sender?.profilePic}
                otherParticipantCount={selectedConversation.participants.length - 1}
                onReply={setReplyingTo}
                onEdit={(id, text) => editMessage.mutate({ id, text })}
                onDelete={(id, forEveryone) => deleteMessage.mutate({ id, forEveryone })}
                onReact={(id, emoji) => reactToMessage.mutate({ id, emoji })}
                onImageClick={setLightboxSrc}
              />
            </div>
          );
        })}

        {typingUserIds.length > 0 && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      <MessageComposer conversationId={conversationId} />
      <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
    </div>
  );
};

export default ChatWindow;
