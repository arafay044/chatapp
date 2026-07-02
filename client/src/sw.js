import { precacheAndRoute } from "workbox-precaching";

precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener("push", (event) => {
    if (!event.data) return;
    const payload = event.data.json();
    event.waitUntil(
        self.registration.showNotification(payload.title || "Pulse", {
            body: payload.body,
            icon: "/favicon.svg",
            badge: "/favicon.svg",
            data: { conversationId: payload.conversationId },
        })
    );
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    event.waitUntil(
        self.clients.matchAll({ type: "window" }).then((windowClients) => {
            const existing = windowClients.find((c) => c.url.includes(self.location.origin));
            if (existing) return existing.focus();
            return self.clients.openWindow("/");
        })
    );
});
