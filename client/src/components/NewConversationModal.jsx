import { useState } from "react";
import { createPortal } from "react-dom";
import { Search, Users, X } from "lucide-react";
import Avatar from "./Avatar";
import { useSearchUsers } from "../hooks/useUsers";
import { useOpenOneToOne } from "../hooks/useConversations";
import { useCreateGroup } from "../hooks/useGroups";
import { useUIStore } from "../store/useUIStore";
import { useConversationStore } from "../store/useConversationStore";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket } from "../lib/socket";

const NewConversationModal = () => {
  const [query, setQuery] = useState("");
  const [groupMode, setGroupMode] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState("");

  const closeNewConversation = useUIStore((s) => s.closeNewConversation);
  const selectConversation = useConversationStore((s) => s.selectConversation);
  const openOneToOne = useOpenOneToOne();
  const createGroup = useCreateGroup();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useSearchUsers(query);

  const openConversation = (conversation) => {
    selectConversation(conversation);
    getSocket()?.emit("joinConversation", conversation._id);
    queryClient.invalidateQueries({ queryKey: ["conversations"] });
    closeNewConversation();
  };

  const handlePickUser = async (user) => {
    if (groupMode) {
      setSelectedUsers((prev) =>
        prev.some((u) => u._id === user._id) ? prev.filter((u) => u._id !== user._id) : [...prev, user]
      );
      return;
    }
    const conversation = await openOneToOne(user._id);
    openConversation(conversation);
  };

  const handleCreateGroup = async () => {
    const conversation = await createGroup.mutateAsync({
      groupName,
      participantIds: selectedUsers.map((u) => u._id),
    });
    openConversation(conversation);
  };

  return createPortal(
    <div className="fixed inset-0 z-40 bg-black/40 flex items-start sm:items-center justify-center p-4">
      <div className="w-full max-w-md bg-[var(--color-surface)] rounded-2xl shadow-xl overflow-hidden mt-10 sm:mt-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
          <p className="font-medium">{groupMode ? "New group" : "New conversation"}</p>
          <button onClick={closeNewConversation} aria-label="Close" className="p-1 rounded-full hover:bg-[var(--color-surface-hover)]">
            <X size={18} />
          </button>
        </div>

        <div className="px-4 pt-3">
          <button
            onClick={() => setGroupMode((v) => !v)}
            className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-full mb-2 ${
              groupMode ? "bg-[var(--color-accent)] text-white" : "bg-[var(--color-bg-subtle)]"
            }`}
          >
            <Users size={14} /> {groupMode ? "Group mode on" : "Create a group instead"}
          </button>

          {groupMode && (
            <input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Group name"
              className="w-full mb-2 px-3 py-2 rounded-lg bg-[var(--color-bg-subtle)] outline-none text-sm"
            />
          )}

          {groupMode && selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {selectedUsers.map((u) => (
                <span key={u._id} className="text-xs bg-[var(--color-accent)]/15 text-[var(--color-accent)] px-2 py-1 rounded-full">
                  {u.fullName}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 bg-[var(--color-bg-subtle)] rounded-full px-3 py-2 mb-3">
            <Search size={16} className="text-[var(--color-text-muted)]" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or email"
              className="bg-transparent outline-none text-sm flex-1"
            />
          </div>
        </div>

        <div className="max-h-72 overflow-y-auto px-2 pb-2">
          {isLoading && <p className="text-center text-sm text-[var(--color-text-muted)] py-4">Searching...</p>}
          {!isLoading && query && users?.length === 0 && (
            <p className="text-center text-sm text-[var(--color-text-muted)] py-4">No users found</p>
          )}
          {users?.map((user) => (
            <button
              key={user._id}
              onClick={() => handlePickUser(user)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--color-surface-hover)] ${
                selectedUsers.some((u) => u._id === user._id) ? "bg-[var(--color-surface-hover)]" : ""
              }`}
            >
              <Avatar src={user.profilePic} name={user.fullName} size="sm" />
              <div className="text-left">
                <p className="text-sm font-medium">{user.fullName}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{user.email}</p>
              </div>
            </button>
          ))}
        </div>

        {groupMode && (
          <div className="p-3 border-t border-[var(--color-border)]">
            <button
              onClick={handleCreateGroup}
              disabled={!groupName || selectedUsers.length < 2 || createGroup.isPending}
              className="w-full py-2.5 rounded-xl bg-[var(--color-accent)] text-white font-medium disabled:opacity-50"
            >
              Create group ({selectedUsers.length} members)
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default NewConversationModal;
