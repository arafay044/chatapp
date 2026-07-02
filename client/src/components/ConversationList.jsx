import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical, Search, SquarePen, LogOut, UserRound } from "lucide-react";
import ConversationListItem from "./ConversationListItem";
import Avatar from "./Avatar";
import ThemeToggle from "./ThemeToggle";
import { useConversations } from "../hooks/useConversations";
import { useConversationStore } from "../store/useConversationStore";
import { useAuthStore } from "../store/useAuthStore";
import { useUIStore } from "../store/useUIStore";
import { getSocket } from "../lib/socket";
import { useQueryClient } from "@tanstack/react-query";

const ConversationList = () => {
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useConversations();
  const authUser = useAuthStore((s) => s.authUser);
  const onlineUsers = useAuthStore((s) => s.onlineUsers);
  const logout = useAuthStore((s) => s.logout);
  const selectedConversation = useConversationStore((s) => s.selectedConversation);
  const selectConversation = useConversationStore((s) => s.selectConversation);
  const openNewConversation = useUIStore((s) => s.openNewConversation);

  const unreadCounts = data?.unreadCounts || {};

  const filtered = useMemo(() => {
    const conversations = data?.conversations || [];
    if (!search.trim()) return conversations;
    const q = search.toLowerCase();
    return conversations.filter((c) => {
      const title = c.isGroup
        ? c.groupName
        : c.participants.find((p) => p._id !== authUser._id)?.fullName || "";
      return title.toLowerCase().includes(q);
    });
  }, [data, search, authUser._id]);

  const handleSelect = (conversation) => {
    selectConversation(conversation);
    getSocket()?.emit("joinConversation", conversation._id);
    queryClient.setQueryData(["conversations"], (old) => {
      if (!old) return old;
      const unreadCounts = { ...old.unreadCounts };
      delete unreadCounts[conversation._id];
      return { ...old, unreadCounts };
    });
  };

  return (
    <div className="h-full flex flex-col bg-[var(--color-bg)]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
        <h1 className="text-xl font-bold">Pulse</h1>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            onClick={openNewConversation}
            aria-label="New conversation"
            className="p-2 rounded-full hover:bg-[var(--color-surface-hover)] transition-colors"
          >
            <SquarePen size={18} />
          </button>
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menu"
              className="p-2 rounded-full hover:bg-[var(--color-surface-hover)] transition-colors"
            >
              <MoreVertical size={18} />
            </button>
            {menuOpen && (
              <div
                onMouseLeave={() => setMenuOpen(false)}
                className="absolute right-0 top-full mt-1 w-44 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-lg py-1 z-20"
              >
                <button
                  onClick={() => { setMenuOpen(false); navigate("/profile"); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-[var(--color-surface-hover)]"
                >
                  <UserRound size={16} /> Profile
                </button>
                <button
                  onClick={() => { setMenuOpen(false); logout(); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-[var(--color-surface-hover)]"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-3 py-2">
        <div className="flex items-center gap-2 bg-[var(--color-bg-subtle)] rounded-full px-3 py-2">
          <Search size={16} className="text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search conversations"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm flex-1 placeholder-[var(--color-text-muted)]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <p className="text-center text-sm text-[var(--color-text-muted)] mt-6">Loading...</p>
        )}
        {!isLoading && filtered.length === 0 && (
          <div className="text-center text-sm text-[var(--color-text-muted)] mt-10 px-6">
            No conversations yet. Tap the compose icon to start chatting.
          </div>
        )}
        {filtered.map((conversation) => {
          const otherUser = conversation.isGroup
            ? null
            : conversation.participants.find((p) => p._id !== authUser._id);
          return (
            <ConversationListItem
              key={conversation._id}
              conversation={conversation}
              authUser={authUser}
              isOnline={otherUser && onlineUsers.includes(otherUser._id)}
              unreadCount={unreadCounts[conversation._id] || 0}
              isSelected={selectedConversation?._id === conversation._id}
              onClick={() => handleSelect(conversation)}
            />
          );
        })}
      </div>

      <div className="flex items-center gap-2 px-4 py-3 border-t border-[var(--color-border)]">
        <Avatar src={authUser.profilePic} name={authUser.fullName} size="sm" />
        <p className="text-sm font-medium truncate">{authUser.fullName}</p>
      </div>
    </div>
  );
};

export default ConversationList;
