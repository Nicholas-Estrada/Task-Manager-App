const webpush = require("web-push");
require("dotenv").config();

webpush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY,
);

// /**
//  * Send a push notification to a single subscription
//  * @param {Object} subscription  — { endpoint, keys: { p256dh, auth } }
//  * @param {Object} payload       — { title, body, icon?, badge?, data? }
//  */
exports.send = async (subscription, payload) => {
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
