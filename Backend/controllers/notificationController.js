const User = require("../models/User");
const pushService = require("../services/pushService");

// // POST /api/notifications/subscribe
exports.subscribe = async (req, res) => {
  try {
    const { subscription, userId } = req.body;
    //     // subscription = { endpoint, keys: { p256dh, auth } }

    const user = await User.findByIdAndUpdate(
      userId,
      { pushSubscription: subscription, notificationsEnabled: true },
      { new: true },
    );
    if (!user)
      return res.status(404).json({ success: false, error: "User not found" });

    //     // Send welcome notification
    await pushService.send(subscription, {
      title: "🔔 Tempus Notifications Active",
      body: "You'll receive daily reminders at 8:00 AM.",
      icon: "/icon.png",
    });

    res.json({ success: true, message: "Push subscription saved" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// // POST /api/notifications/unsubscribe
exports.unsubscribe = async (req, res) => {
  try {
    const { userId } = req.body;
    await User.findByIdAndUpdate(userId, {
      pushSubscription: null,
      notificationsEnabled: false,
    });
    res.json({
      success: true,
      message: "Unsubscribed from push notifications",
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// // POST /api/notifications/test  — send a test push to a user
exports.testPush = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user?.pushSubscription) {
      return res
        .status(400)
        .json({ success: false, error: "No push subscription found" });
    }
    await pushService.send(user.pushSubscription, {
      title: "🧪 Test Notification",
      body: "Your Tempus push notifications are working!",
    });
    res.json({ success: true, message: "Test notification sent" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
