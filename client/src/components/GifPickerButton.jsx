import { useState } from "react";
import { Clapperboard } from "lucide-react";
import { useGifSearch } from "../hooks/useGif";

const GifPickerButton = ({ onSelect }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { data, isLoading } = useGifSearch(query);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="p-2 rounded-full hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]"
        aria-label="GIF"
      >
        <Clapperboard size={20} />
      </button>
      {open && (
        <div
          onMouseLeave={() => setOpen(false)}
          className="absolute bottom-full left-0 mb-2 z-20 w-72 max-h-80 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-lg p-2 flex flex-col gap-2"
        >
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search GIFs..."
            className="w-full px-3 py-1.5 rounded-full bg-[var(--color-bg-subtle)] outline-none text-sm"
          />
          <div className="overflow-y-auto grid grid-cols-2 gap-1.5">
            {isLoading && <p className="text-xs text-[var(--color-text-muted)] col-span-2 text-center py-4">Loading...</p>}
            {data?.keyMissing && (
              <p className="text-xs text-[var(--color-text-muted)] col-span-2 text-center py-4 px-2">
                Add a TENOR_API_KEY to the server .env to enable GIF search.
              </p>
            )}
            {data?.results?.map((gif) => (
              <img
                key={gif.id}
                src={gif.preview}
                alt=""
                onClick={() => { onSelect(gif.url); setOpen(false); }}
                className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-80"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GifPickerButton;
