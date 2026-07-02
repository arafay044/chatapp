import { createPortal } from "react-dom";
import { Phone, PhoneOff, Video } from "lucide-react";
import Avatar from "./Avatar";
import { useCallStore } from "../store/useCallStore";
import { useWebRTCCall } from "../hooks/useWebRTCCall";

const IncomingCallToast = () => {
  const status = useCallStore((s) => s.status);
  const peerUser = useCallStore((s) => s.peerUser);
  const callType = useCallStore((s) => s.callType);
  const { acceptCall, rejectCall } = useWebRTCCall();

  if (status !== "incoming") return null;

  return createPortal(
    <div className="fixed top-4 right-4 z-50 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-xl p-4 flex items-center gap-3 w-80">
      <Avatar src={peerUser?.profilePic} name={peerUser?.fullName} size="md" />
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{peerUser?.fullName}</p>
        <p className="text-xs text-[var(--color-text-muted)]">Incoming {callType} call...</p>
      </div>
      <button onClick={rejectCall} className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center" aria-label="Decline">
        <PhoneOff size={16} />
      </button>
      <button onClick={acceptCall} className="w-9 h-9 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center" aria-label="Accept">
        {callType === "video" ? <Video size={16} /> : <Phone size={16} />}
      </button>
    </div>,
    document.body
  );
};

export default IncomingCallToast;
