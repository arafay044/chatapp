import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Search, X } from "lucide-react";
import { useConversationStore } from "../store/useConversationStore";
import { useUIStore } from "../store/useUIStore";
import { useSearchMessages } from "../hooks/useMessages";
import { formatMessageTime, formatDateSeparator } from "../lib/utils";

const SearchOverlay = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const selectedConversation = useConversationStore((s) => s.selectedConversation);
  const closeSearchOverlay = useUIStore((s) => s.closeSearchOverlay);
  const search = useSearchMessages(selectedConversation?._id);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (query.trim()) {
        const messages = await search.mutateAsync(query.trim());
        setResults(messages);
      } else {
        setResults([]);
      }
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return createPortal(
    <div className="fixed inset-0 z-40 bg-black/40 flex items-start justify-center p-4">
      <div className="w-full max-w-md bg-[var(--color-surface)] rounded-2xl shadow-xl overflow-hidden mt-10">
        <div className="flex items-center gap-2 px-3 py-3 border-b border-[var(--color-border)]">
          <Search size={16} className="text-[var(--color-text-muted)]" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search in this conversation"
            className="flex-1 bg-transparent outline-none text-sm"
          />
          <button onClick={closeSearchOverlay} aria-label="Close" className="p-1 rounded-full hover:bg-[var(--color-surface-hover)]">
            <X size={18} />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {search.isPending && <p className="text-center text-sm text-[var(--color-text-muted)] py-4">Searching...</p>}
          {!search.isPending && query && results.length === 0 && (
            <p className="text-center text-sm text-[var(--color-text-muted)] py-4">No messages found</p>
          )}
          {results.map((message) => (
            <div key={message._id} className="px-4 py-2.5 border-b border-[var(--color-border)] last:border-0">
              <p className="text-sm truncate">{message.text}</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                {formatDateSeparator(message.createdAt)} · {formatMessageTime(message.createdAt)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SearchOverlay;
