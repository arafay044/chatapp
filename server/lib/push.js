import webpush from "web-push";

const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_CONTACT_EMAIL } = process.env;

export const pushEnabled = Boolean(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY);

if (pushEnabled) {
    webpush.setVapidDetails(
        `mailto:${VAPID_CONTACT_EMAIL || "admin@example.com"}`,
        VAPID_PUBLIC_KEY,
        VAPID_PRIVATE_KEY
    );
}

export const sendPushNotification = async (subscription, payload) => {
    if (!pushEnabled || !subscription) return;
    try {
        await webpush.sendNotification(subscription, JSON.stringify(payload));
    } catch (error) {
        console.log("Push notification failed:", error.message);
    }
};

export default webpush;
