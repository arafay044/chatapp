import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import { useAuthStore } from "./store/useAuthStore";
import { useRealtimeSync } from "./hooks/useRealtimeSync";
import CallModal from "./components/CallModal";
import IncomingCallToast from "./components/IncomingCallToast";

const App = () => {
  const authUser = useAuthStore((s) => s.authUser);
  const isLoading = useAuthStore((s) => s.isLoading);
  const checkAuth = useAuthStore((s) => s.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useRealtimeSync();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--color-bg)]">
        <div className="h-8 w-8 rounded-full border-2 border-[var(--color-accent)] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[var(--color-bg)] text-[var(--color-text)]">
      <Toaster
        position="top-center"
        toastOptions={{
          className: "",
          style: {
            background: "var(--color-surface)",
            color: "var(--color-text)",
            border: "1px solid var(--color-border)",
          },
          duration: 3000,
        }}
      />

      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/login" element={!authUser ? <AuthPage /> : <Navigate to="/" />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
      </Routes>

      {authUser && (
        <>
          <CallModal />
          <IncomingCallToast />
        </>
      )}
    </div>
  );
};

export default App;
