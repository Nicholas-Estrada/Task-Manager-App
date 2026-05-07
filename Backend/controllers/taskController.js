const Task = require("../models/Task");

// // GET /api/tasks  — optionally filter by ?date=YYYY-MM-DD or ?month=YYYY-MM
exports.getTasks = async (req, res) => {
  try {
    const { date, month, completed, priority } = req.query;
    const userId = req.user?.id || "demo_user"; // replace with real auth

    const filter = { userId };

    if (date) filter.date = date;
    if (month) filter.date = { $regex: `^${month}` }; // e.g. '2025-06'
    if (completed !== undefined) filter.completed = completed === "true";
    if (priority) filter.priority = priority;

    const tasks = await Task.find(filter).sort({ date: 1, priority: 1 });
    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// // GET /api/tasks/:id
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task)
      return res.status(404).json({ success: false, error: "Task not found" });
    res.json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// // POST /api/tasks
exports.createTask = async (req, res) => {
  try {
    const { title, description, date, priority } = req.body;
    const task = await Task.create({
      title,
      description,
      date,
      priority,
      userId: req.user?.id || "demo_user",
    });
    res.status(201).json({ success: true, data: task });
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res
        .status(400)
        .json({ success: false, error: messages.join(", ") });
    }
    res.status(500).json({ success: false, error: err.message });
  }
};

// // PATCH /api/tasks/:id
exports.updateTask = async (req, res) => {
  try {
    const updates = req.body;
    //     // Set completedAt timestamp when marking complete
    if (updates.completed === true) updates.completedAt = new Date();
    if (updates.completed === false) updates.completedAt = null;

    const task = await Task.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!task)
      return res.status(404).json({ success: false, error: "Task not found" });
    res.json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// // DELETE /api/tasks/:id
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task)
      return res.status(404).json({ success: false, error: "Task not found" });
    res.json({ success: true, message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
