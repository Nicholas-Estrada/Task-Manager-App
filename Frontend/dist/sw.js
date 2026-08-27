self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};
  const options = {
    body: data.body || "You have tasks due today!",
    icon: data.icon || "/icon.png",
    badge: data.badge || "/badge.png",
    vibrate: [200, 100, 200],
    requireInteraction: true, // keeps it in notification center until dismissed
    data: data.data || {},
    actions: [
      { action: "view", title: "👀 View Tasks" },
      { action: "dismiss", title: "✕ Dismiss" },
    ],
  };
  event.waitUntil(
    self.registration.showNotification(
      data.title || "Tempus Reminder",
      options,
    ),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "dismiss") return;
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      const existing = clientList.find((c) => c.url === url && "focus" in c);
      if (existing) return existing.focus();
      return clients.openWindow(url);
    }),
  );
});
