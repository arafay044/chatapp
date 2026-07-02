import { createPortal } from "react-dom";
import { X } from "lucide-react";

const ImageLightbox = ({ src, onClose }) => {
  if (!src) return null;
  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
    >
      <button onClick={onClose} className="absolute top-4 right-4 text-white" aria-label="Close">
        <X size={28} />
      </button>
      <img src={src} alt="" className="max-w-full max-h-full object-contain rounded" onClick={(e) => e.stopPropagation()} />
    </div>,
    document.body
  );
};

export default ImageLightbox;
