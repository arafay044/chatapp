import { lazy, Suspense, useState } from "react";
import { Smile } from "lucide-react";
import { useUIStore } from "../store/useUIStore";

const EmojiPicker = lazy(() => import("emoji-picker-react"));

const EmojiPickerButton = ({ onSelect }) => {
  const [open, setOpen] = useState(false);
  const theme = useUIStore((s) => s.theme);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="p-2 rounded-full hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]"
        aria-label="Emoji"
      >
        <Smile size={20} />
      </button>
      {open && (
        <div className="absolute bottom-full left-0 mb-2 z-20">
          <Suspense fallback={<div className="w-[300px] h-[300px] bg-[var(--color-surface)] rounded-xl" />}>
            <EmojiPicker
              theme={theme}
              onEmojiClick={(emojiData) => {
                onSelect(emojiData.emoji);
                setOpen(false);
              }}
            />
          </Suspense>
        </div>
      )}
    </div>
  );
};

export default EmojiPickerButton;
