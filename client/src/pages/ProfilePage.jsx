import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BellRing, Camera } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { usePushNotifications } from "../hooks/usePushNotifications";
import Avatar from "../components/Avatar";
import ThemeToggle from "../components/ThemeToggle";

const readFileAsBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const ProfilePage = () => {
  const authUser = useAuthStore((s) => s.authUser);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const { subscribe } = usePushNotifications();
  const navigate = useNavigate();

  const [name, setName] = useState(authUser.fullName);
  const [bio, setBio] = useState(authUser.bio || "");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [pendingImage, setPendingImage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setPendingImage(await readFileAsBase64(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const payload = { fullName: name, bio };
    if (pendingImage) payload.profilePic = pendingImage;
    const ok = await updateProfile(payload);
    setIsSaving(false);
    if (ok) navigate("/");
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-subtle)] px-4 py-8">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate("/")} aria-label="Back" className="p-2 rounded-full hover:bg-[var(--color-surface-hover)]">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-semibold">Edit profile</h1>
          <ThemeToggle className="ml-auto" />
        </div>

        <form onSubmit={handleSubmit} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 flex flex-col gap-5">
          <div className="flex flex-col items-center gap-3">
            <label htmlFor="avatar" className="relative cursor-pointer group">
              <Avatar src={previewUrl || authUser.profilePic} name={name} size="xl" />
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera size={20} className="text-white" />
              </div>
              <input id="avatar" type="file" accept="image/*" hidden onChange={handleImageChange} />
            </label>
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--color-text-muted)]">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full mt-1 p-3 rounded-xl bg-[var(--color-bg-subtle)] border border-[var(--color-border)] outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--color-text-muted)]">Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full mt-1 p-3 rounded-xl bg-[var(--color-bg-subtle)] border border-[var(--color-border)] outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            />
          </div>

          <button
            type="button"
            onClick={subscribe}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[var(--color-border)] text-sm hover:bg-[var(--color-surface-hover)]"
          >
            <BellRing size={16} /> Enable push notifications
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="py-3 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-medium disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
