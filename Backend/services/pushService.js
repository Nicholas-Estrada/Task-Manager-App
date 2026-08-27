const webpush = require("web-push");
require("dotenv").config();

const vapidEmail = process.env.VAPID_EMAIL;
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

const hasValidVapidKeys =
  vapidEmail &&
  vapidPublicKey &&
  vapidPrivateKey &&
  vapidPublicKey !== "your_public_vapid_key_here" &&
  vapidPrivateKey !== "your_private_vapid_key_here";

if (hasValidVapidKeys) {
  webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);
} else {
  console.warn("⚠️ Web push VAPID keys are not configured. Push notifications are disabled for this local prototype.");
}

// /**
//  * Send a push notification to a single subscription
//  * @param {Object} subscription  — { endpoint, keys: { p256dh, auth } }
//  * @param {Object} payload       — { title, body, icon?, badge?, data? }
//  */
exports.send = async (subscription, payload) => {
  if (!hasValidVapidKeys) {
    return { status: "disabled", message: "Push notifications are disabled until VAPID keys are configured." };
  }

  const stringifiedPayload = JSON.stringify(payload);
  return webpush.sendNotification(subscription, stringifiedPayload);
};

// /**
//  * Broadcast to an array of subscriptions; collect failures
//  */
exports.broadcast = async (subscriptions, payload) => {
  const results = await Promise.allSettled(
    subscriptions.map((sub) => exports.send(sub, payload)),
  );
  const failed = results.filter((r) => r.status === "rejected");
  if (failed.length) {
    console.warn(`⚠️ ${failed.length} push notification(s) failed`);
  }
  return results;
};
