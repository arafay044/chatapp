import { Moon, Sun } from "lucide-react";
import { useUIStore } from "../store/useUIStore";

const ThemeToggle = ({ className = "" }) => {
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={`p-2 rounded-full hover:bg-[var(--color-surface-hover)] transition-colors ${className}`}
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
};

export default ThemeToggle;
