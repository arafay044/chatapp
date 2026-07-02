import { getInitials, colorFromString, cloudinaryThumb } from "../lib/utils";

const SIZES = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-lg",
  xl: "w-24 h-24 text-2xl",
};

const Avatar = ({ src, name = "?", size = "md", online, className = "" }) => {
  const dimension = SIZES[size] || SIZES.md;

  return (
    <div className={`relative shrink-0 ${className}`}>
      {src ? (
        <img
          src={cloudinaryThumb(src, { w: 200, h: 200 })}
          alt={name}
          loading="lazy"
          className={`${dimension} rounded-full object-cover`}
        />
      ) : (
        <div
          className={`${dimension} rounded-full flex items-center justify-center font-semibold text-white`}
          style={{ backgroundColor: colorFromString(name) }}
        >
          {getInitials(name) || "?"}
        </div>
      )}
      {online && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[var(--color-accent)] ring-2 ring-[var(--color-surface)]" />
      )}
    </div>
  );
};

export default Avatar;
