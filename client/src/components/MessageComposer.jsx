import { useRef, useState } from "react";
import { Image as ImageIcon, Send } from "lucide-react";
import toast from "react-hot-toast";
import EmojiPickerButton from "./EmojiPickerButton";
import GifPickerButton from "./GifPickerButton";
import VoiceRecorderButton from "./VoiceRecorderButton";
import ReplyPreviewBanner from "./ReplyPreviewBanner";
import { useSendMessage } from "../hooks/useMessages";
import { useConversationStore } from "../store/useConversationStore";
import { useTypingEmitter } from "../hooks/useTypingEmitter";

const readFileAsBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const MessageComposer = ({ conversationId }) => {
  const [text, setText] = useState("");
  const fileInputRef = useRef(null);
  const { mutateAsync: sendMessage, isPending } = useSendMessage(conversationId);
  const replyingTo = useConversationStore((s) => s.replyingTo);
  const clearReplyingTo = useConversationStore((s) => s.clearReplyingTo);
  const { notifyTyping, notifyStopTyping } = useTypingEmitter(conversationId);

  const handleSendText = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    notifyStopTyping();
    const payload = { text: text.trim(), replyTo: replyingTo?._id };
    setText("");
    clearReplyingTo();
    await sendMessage(payload);
  };

  const handleImage = async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }
    const base64 = await readFileAsBase64(file);
    await sendMessage({ image: base64, replyTo: replyingTo?._id });
    clearReplyingTo();
  };

  const handleVoice = async (base64, duration) => {
    await sendMessage({ audioUrl: base64, duration, type: "voice" });
  };

  const handleGif = async (url) => {
    await sendMessage({ image: url, type: "image" });
  };

  return (
    <div>
      <ReplyPreviewBanner message={replyingTo} onCancel={clearReplyingTo} />
      <form onSubmit={handleSendText} className="flex items-center gap-1 px-3 py-2 border-t border-[var(--color-border)]">
        <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleImage} />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-full hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]"
          aria-label="Attach image"
        >
          <ImageIcon size={20} />
        </button>
        <EmojiPickerButton onSelect={(emoji) => setText((t) => t + emoji)} />
        <GifPickerButton onSelect={handleGif} />

        <input
          type="text"
          value={text}
          onChange={(e) => { setText(e.target.value); if (e.target.value) notifyTyping(); else notifyStopTyping(); }}
          placeholder="Type a message"
          className="flex-1 bg-[var(--color-bg-subtle)] rounded-full px-4 py-2 outline-none text-sm min-w-0"
        />

        {text.trim() ? (
          <button
            type="submit"
            disabled={isPending}
            className="p-2 rounded-full bg-[var(--color-accent)] text-white disabled:opacity-60"
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        ) : (
          <VoiceRecorderButton onRecorded={handleVoice} />
        )}
      </form>
    </div>
  );
};

export default MessageComposer;
