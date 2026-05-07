const mongoose = require("mongoose");

const PushSubscriptionSchema = new mongoose.Schema(
  {
    endpoint: { type: String, required: true },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
  },
  { _id: false },
);

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: { type: String, trim: true, default: "" },
    pushSubscription: {
      type: PushSubscriptionSchema,
      default: null,
    },
    notificationsEnabled: {
      type: Boolean,
      default: true,
    },
    timezone: {
      type: String,
      default: "UTC", // e.g. 'America/New_York'
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", UserSchema);
