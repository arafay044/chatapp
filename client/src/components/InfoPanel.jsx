import { useState } from "react";
import { BellOff, LogOut, Users, X } from "lucide-react";
import Avatar from "./Avatar";
import ImageLightbox from "./ImageLightbox";
import { useConversationStore } from "../store/useConversationStore";
import { useAuthStore } from "../store/useAuthStore";
import { useUIStore } from "../store/useUIStore";
import { useMessages, flattenMessagePages } from "../hooks/useMessages";
import { useToggleMute, useUpdateGroupMembers } from "../hooks/useGroups";

const InfoPanel = () => {
  const selectedConversation = useConversationStore((s) => s.selectedConversation);
  const authUser = useAuthStore((s) => s.authUser);
  const closeInfoPanel = useUIStore((s) => s.closeInfoPanel);
  const { data } = useMessages(selectedConversation?._id);
  const toggleMute = useToggleMute();
  const updateMembers = useUpdateGroupMembers();
  const [lightboxSrc, setLightboxSrc] = useState(null);

  if (!selectedConversation) return null;

  const messages = flattenMessagePages(data);
  const media = messages.filter((m) => m.type === "image" && m.image).map((m) => m.image);
  const otherUser = selectedConversation.isGroup
    ? null
    : selectedConversation.participants.find((p) => p._id !== authUser._id);
  const title = selectedConversation.isGroup ? selectedConversation.groupName : otherUser?.fullName;
  const isAdmin = selectedConversation.admins?.some((a) => a === authUser._id || a._id === authUser._id);

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
        <p className="font-medium">Details</p>
        <button onClick={closeInfoPanel} aria-label="Close" className="p-1 rounded-full hover:bg-[var(--color-surface-hover)]">
          <X size={18} />
        </button>
      </div>

      <div className="flex flex-col items-center gap-2 py-6 border-b border-[var(--color-border)]">
        <Avatar
          src={selectedConversation.isGroup ? selectedConversation.groupIcon : otherUser?.profilePic}
          name={title}
          size="xl"
        />
        <p className="text-lg font-semibold">{title}</p>
        {!selectedConversation.isGroup && otherUser?.bio && (
          <p className="text-sm text-[var(--color-text-muted)] text-center px-6">{otherUser.bio}</p>
        )}
      </div>

      <button
        onClick={() => toggleMute.mutate(selectedConversation._id)}
        className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-[var(--color-surface-hover)] border-b border-[var(--color-border)]"
      >
        <BellOff size={16} />
        {selectedConversation.mutedBy?.includes(authUser._id) ? "Unmute conversation" : "Mute conversation"}
      </button>

      {selectedConversation.isGroup && (
        <div className="border-b border-[var(--color-border)] px-4 py-3">
          <p className="text-xs font-semibold uppercase text-[var(--color-text-muted)] mb-2 flex items-center gap-1.5">
            <Users size={13} /> {selectedConversation.participants.length} members
          </p>
          <div className="flex flex-col gap-2">
            {selectedConversation.participants.map((p) => (
              <div key={p._id} className="flex items-center gap-2">
                <Avatar src={p.profilePic} name={p.fullName} size="sm" />
                <p className="text-sm flex-1 truncate">{p.fullName}</p>
                {isAdmin && p._id !== authUser._id && (
                  <button
                    onClick={() => updateMembers.mutate({ id: selectedConversation._id, remove: [p._id] })}
                    className="text-xs text-red-500"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="px-4 py-3">
        <p className="text-xs font-semibold uppercase text-[var(--color-text-muted)] mb-2">
          Shared media ({media.length})
        </p>
        {media.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">No media shared yet</p>
        ) : (
          <div className="grid grid-cols-3 gap-1.5">
            {media.map((url, i) => (
              <img
                key={i}
                src={url}
                alt=""
                loading="lazy"
                onClick={() => setLightboxSrc(url)}
                className="w-full aspect-square object-cover rounded-lg cursor-pointer"
              />
            ))}
          </div>
        )}
      </div>

      <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
    </div>
  );
};

export default InfoPanel;
