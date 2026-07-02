import { useState } from "react";
// eslint-disable-next-line no-unused-vars -- `motion` is used via the `motion.form` JSX tag below
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import ThemeToggle from "../components/ThemeToggle";

const AuthPage = () => {
  const [mode, setMode] = useState("login"); // login | signup
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const login = useAuthStore((s) => s.login);
  const isAuthenticating = useAuthStore((s) => s.isAuthenticating);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(mode === "signup" ? "signup" : "login", { fullName, email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-subtle)] px-4 py-10 relative">
      <ThemeToggle className="absolute top-4 right-4" />

      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-accent)] flex items-center justify-center mb-3 shadow-lg shadow-[var(--color-accent)]/20">
            <Activity className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold">Pulse</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Fast, simple, real-time messaging.
          </p>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm p-6 sm:p-8">
          <div className="flex mb-6 bg-[var(--color-bg-subtle)] rounded-full p-1">
            {["login", "signup"].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors ${
                  mode === m
                    ? "bg-[var(--color-accent)] text-white"
                    : "text-[var(--color-text-muted)]"
                }`}
              >
                {m === "login" ? "Log in" : "Sign up"}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              onSubmit={handleSubmit}
              className="flex flex-col gap-3"
            >
              {mode === "signup" && (
                <input
                  type="text"
                  placeholder="Full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoComplete="name"
                  className="p-3 rounded-xl bg-[var(--color-bg-subtle)] border border-[var(--color-border)] outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition"
                />
              )}
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="p-3 rounded-xl bg-[var(--color-bg-subtle)] border border-[var(--color-border)] outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition"
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  className="w-full p-3 rounded-xl bg-[var(--color-bg-subtle)] border border-[var(--color-border)] outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={isAuthenticating}
                className="mt-2 py-3 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] disabled:opacity-60 text-white font-medium transition-colors"
              >
                {isAuthenticating ? "Please wait..." : mode === "signup" ? "Create account" : "Log in"}
              </button>
            </motion.form>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
