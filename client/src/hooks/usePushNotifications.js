import { useCallback } from "react";
import api from "../lib/axios";

const urlBase64ToUint8Array = (base64String) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
};

export const usePushNotifications = () => {
    const subscribe = useCallback(async () => {
        if (!("serviceWorker" in navigator) || !("PushManager" in window)) return false;

        try {
            const { data } = await api.get("/api/notifications/public-key");
            if (!data.enabled || !data.publicKey) return false;

            const registration = await navigator.serviceWorker.ready;
            const permission = await Notification.requestPermission();
            if (permission !== "granted") return false;

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(data.publicKey),
            });

            await api.post("/api/notifications/subscribe", { subscription });
            return true;
        } catch (error) {
            console.warn("Push subscription failed:", error.message);
            return false;
        }
    }, []);

    return { subscribe };
};
