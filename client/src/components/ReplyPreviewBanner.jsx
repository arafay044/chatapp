import { X } from "lucide-react";

const ReplyPreviewBanner = ({ message, onCancel }) => {
  if (!message) return null;
  return (
    <div className="flex items-center justify-between gap-2 px-4 py-2 border-t border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
      <div className="flex-1 min-w-0 border-l-2 border-[var(--color-accent)] pl-2">
        <p className="text-xs font-medium text-[var(--color-accent)]">Replying to</p>
        <p className="text-sm truncate opacity-80">
          {message.type === "image" ? "📷 Photo" : message.text || "Message"}
        </p>
      </div>
      <button onClick={onCancel} aria-label="Cancel reply" className="p-1 rounded-full hover:bg-[var(--color-surface-hover)]">
        <X size={16} />
      </button>
    </div>
  );
};

export default ReplyPreviewBanner;
