import { useRef, useState } from "react";
import { Mic, Send, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const blobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

const VoiceRecorderButton = ({ onRecorded }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      if (typeof MediaRecorder === "undefined") {
        toast.error("Voice messages aren't supported in this browser");
        return;
      }
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setSeconds(0);
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      toast.error("Microphone access denied");
    }
  };

  const stopRecording = (send) => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;
    clearInterval(intervalRef.current);
    const finalSeconds = seconds;
    recorder.onstop = async () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (send && chunksRef.current.length) {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const base64 = await blobToBase64(blob);
        onRecorded(base64, finalSeconds);
      }
      setIsRecording(false);
      setSeconds(0);
    };
    recorder.stop();
  };

  if (isRecording) {
    return (
      <div className="flex items-center gap-2 bg-[var(--color-bg-subtle)] rounded-full px-3 py-1.5">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <span className="text-xs tabular-nums w-8">{seconds}s</span>
        <button onClick={() => stopRecording(false)} aria-label="Cancel recording" className="p-1 text-red-500">
          <Trash2 size={16} />
        </button>
        <button onClick={() => stopRecording(true)} aria-label="Send recording" className="p-1 text-[var(--color-accent)]">
          <Send size={16} />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={startRecording}
      className="p-2 rounded-full hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]"
      aria-label="Record voice message"
    >
      <Mic size={20} />
    </button>
  );
};

export default VoiceRecorderButton;
