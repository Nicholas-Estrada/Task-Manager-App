const cron = require("node-cron");
const Task = require("../models/Task");
const User = require("../models/User");
const pushService = require("../services/pushService");

// ─── Format: 'minute hour * * *'
// ─── '0 8 * * *'  =  every day at 8:00 AM UTC
// ─── For per-user timezones, a more advanced approach uses
//     separate schedules per TZ or a queue like BullMQ.

cron.schedule(
  "0 8 * * *",
  async () => {
    console.log("⏰ Running daily reminder job:", new Date().toISOString());

    try {
      const today = new Date().toISOString().split("T")[0]; // 'YYYY-MM-DD'

      // Find all incomplete tasks due today
      const tasks = await Task.find({ date: today, completed: false });
      if (tasks.length === 0) {
        console.log("No tasks due today, skipping notifications");
        return;
      }

      // Group by userId
      const tasksByUser = tasks.reduce((acc, task) => {
        const uid = task.userId.toString();
        if (!acc[uid]) acc[uid] = [];
        acc[uid].push(task);
        return acc;
      }, {});

      // Send push to each user with tasks
      const userIds = Object.keys(tasksByUser);
      const users = await User.find({
        _id: { $in: userIds },
        notificationsEnabled: true,
        pushSubscription: { $ne: null },
      });

      for (const user of users) {
        const userTasks = tasksByUser[user._id.toString()];
        const highCount = userTasks.filter((t) => t.priority === "high").length;

        const payload = {
          title: `📋 You have ${userTasks.length} task${userTasks.length > 1 ? "s" : ""} today`,
          body:
            userTasks
              .slice(0, 3)
              .map((t) => `• ${t.title}`)
              .join("\n") +
            (userTasks.length > 3
              ? `\n...and ${userTasks.length - 3} more`
              : "") +
            (highCount > 0 ? `\n🔴 ${highCount} high priority!` : ""),
          icon: "/icon.png",
          badge: "/badge.png",
          data: { url: "/", date: today },
        };

        try {
          await pushService.send(user.pushSubscription, payload);
          console.log(
            `✅ Notified user ${user.email}: ${userTasks.length} tasks`,
          );
        } catch (err) {
          console.error(`❌ Failed to notify ${user.email}:`, err.message);
          // If subscription is expired/invalid, clear it
          if (err.statusCode === 410) {
            await User.findByIdAndUpdate(user._id, { pushSubscription: null });
            console.log(`🧹 Cleared expired subscription for ${user.email}`);
          }
        }
      }

      // Mark tasks as notified
      await Task.updateMany(
        {
          date: today,
          completed: false,
          _id: { $in: tasks.map((t) => t._id) },
        },
        { notifiedAt: new Date() },
      );
    } catch (err) {
      console.error("❌ Reminder job failed:", err.message);
    }
  },
  {
    timezone: "UTC", // Change to your server timezone
  },
);

console.log("📅 Daily reminder job scheduled (8:00 AM UTC)");
