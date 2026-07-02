import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Mic, MicOff, PhoneOff, Video, VideoOff } from "lucide-react";
import Avatar from "./Avatar";
import { useCallStore } from "../store/useCallStore";
import { useWebRTCCall } from "../hooks/useWebRTCCall";

const CallModal = () => {
  const status = useCallStore((s) => s.status);
  const callType = useCallStore((s) => s.callType);
  const peerUser = useCallStore((s) => s.peerUser);
  const localStream = useCallStore((s) => s.localStream);
  const remoteStream = useCallStore((s) => s.remoteStream);
  const isMuted = useCallStore((s) => s.isMuted);
  const isCameraOff = useCallStore((s) => s.isCameraOff);
  const toggleMute = useCallStore((s) => s.toggleMute);
  const toggleCamera = useCallStore((s) => s.toggleCamera);
  const { endCall } = useWebRTCCall();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  useEffect(() => {
    localStream?.getAudioTracks().forEach((t) => (t.enabled = !isMuted));
  }, [isMuted, localStream]);

  useEffect(() => {
    localStream?.getVideoTracks().forEach((t) => (t.enabled = !isCameraOff));
  }, [isCameraOff, localStream]);

  if (status !== "outgoing" && status !== "active") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="flex-1 relative flex items-center justify-center">
        {callType === "video" ? (
          <>
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="absolute bottom-24 right-4 w-28 h-40 object-cover rounded-xl border-2 border-white/20"
            />
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 text-white">
            <Avatar src={peerUser?.profilePic} name={peerUser?.fullName} size="xl" />
            <p className="text-xl font-medium">{peerUser?.fullName}</p>
            <p className="text-sm text-white/60">{status === "outgoing" ? "Calling..." : "Connected"}</p>
          </div>
        )}

        {callType === "video" && (
          <div className="absolute top-4 left-4 text-white">
            <p className="font-medium">{peerUser?.fullName}</p>
            <p className="text-sm text-white/60">{status === "outgoing" ? "Calling..." : "Connected"}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-4 py-6">
        <button
          onClick={toggleMute}
          className="w-12 h-12 rounded-full bg-white/15 text-white flex items-center justify-center"
          aria-label="Toggle mute"
        >
          {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
        {callType === "video" && (
          <button
            onClick={toggleCamera}
            className="w-12 h-12 rounded-full bg-white/15 text-white flex items-center justify-center"
            aria-label="Toggle camera"
          >
            {isCameraOff ? <VideoOff size={20} /> : <Video size={20} />}
          </button>
        )}
        <button
          onClick={endCall}
          className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center"
          aria-label="End call"
        >
          <PhoneOff size={22} />
        </button>
      </div>
    </div>,
    document.body
  );
};

export default CallModal;
