const LinkPreviewCard = ({ preview }) => {
  if (!preview?.title) return null;
  return (
    <a
      href={preview.url}
      target="_blank"
      rel="noreferrer"
      className="block mt-2 rounded-lg overflow-hidden border border-black/10 bg-black/5 hover:bg-black/10 transition-colors max-w-xs"
    >
      {preview.image && (
        <img src={preview.image} alt="" loading="lazy" className="w-full h-32 object-cover" />
      )}
      <div className="p-2">
        <p className="text-xs font-semibold line-clamp-1">{preview.title}</p>
        {preview.description && (
          <p className="text-xs opacity-70 line-clamp-2 mt-0.5">{preview.description}</p>
        )}
      </div>
    </a>
  );
};

export default LinkPreviewCard;
