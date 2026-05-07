// ============================================================
//  TEMPUS TASK MANAGER — BACKEND (Node.js + Express)
//  Phase 2 Starter Code
//  Stack: Express · Mongoose (MongoDB) · node-cron · web-push
// ============================================================
//
//  FILE STRUCTURE (create these files):
//
//  backend/
//  ├── server.js           ← entry point (this file)
//  ├── .env                ← environment variables
//  ├── models/
//  │   ├── Task.js
//  │   └── User.js
//  ├── routes/
//  │   ├── tasks.js
//  │   ├── users.js
//  │   └── notifications.js
//  ├── controllers/
//  │   ├── taskController.js
//  │   └── notificationController.js
//  ├── jobs/
//  │   └── reminderJob.js
//  └── services/
//      └── pushService.js
//
// ============================================================


// ── INSTALL DEPENDENCIES ──────────────────────────────────────
//  npm init -y
//  npm install express mongoose dotenv cors node-cron web-push
//  npm install --save-dev nodemon


// ════════════════════════════════════════════════════════════
//  .env  (create this file at backend/.env)
// ════════════════════════════════════════════════════════════



// ════════════════════════════════════════════════════════════
//  server.js  —  Entry Point
// ════════════════════════════════════════════════════════════

const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const cron     = require('node-cron');
require('dotenv').config();

const app = express();

// ── Middleware ──
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// ── Routes ──
app.use('/api/tasks',         require('./routes/tasks'));
app.use('/api/users',         require('./routes/users'));
app.use('/api/notifications', require('./routes/notifications'));

// ── Health check ──
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// ── Connect MongoDB & Start Server ──
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

    // Start scheduled jobs AFTER DB is ready
    require('./jobs/reminderJob');
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

module.exports = app;


// ════════════════════════════════════════════════════════════
//  models/Task.js
// ════════════════════════════════════════════════════════════


// ════════════════════════════════════════════════════════════
//  models/User.js
// ═══════════════════════════════════════════════════════════


// ════════════════════════════════════════════════════════════
//  routes/tasks.js
// ════════════════════════════════════════════════════════════


// ════════════════════════════════════════════════════════════
//  controllers/taskController.js
// ════════════════════════════════════════════════════════════


// ════════════════════════════════════════════════════════════
//  routes/notifications.js
// ════════════════════════════════════════════════════════════


// ════════════════════════════════════════════════════════════
//  controllers/notificationController.js
// ════════════════════════════════════════════════════════════


// ════════════════════════════════════════════════════════════
//  services/pushService.js
// ════════════════════════════════════════════════════════════


// ════════════════════════════════════════════════════════════
//  jobs/reminderJob.js  —  Daily Cron Scheduler
// ════════════════════════════════════════════════════════════


// ════════════════════════════════════════════════════════════
//  public/sw.js  —  Service Worker (goes in frontend/public/)
// ════════════════════════════════════════════════════════════





// ════════════════════════════════════════════════════════════
//  package.json scripts
// ════════════════════════════════════════════════════════════


// ════════════════════════════════════════════════════════════
//  QUICK START GUIDE
// ════════════════════════════════════════════════════════════
//
//  1. Create the folder structure above
//  2. Copy each section into the corresponding file
//     (the sections are commented out above — uncomment them
//      in the actual separate files)
//  3. Create your .env file with your MongoDB URI + VAPID keys
//  4. Install MongoDB locally OR create a free MongoDB Atlas cluster
//  5. Generate VAPID keys:
//       node -e "const wp=require('web-push'); console.log(wp.generateVAPIDKeys())"
//  6. Run:
//       npm run dev
//  7. Test the API:
//       curl http://localhost:5000/api/health
//       curl -X POST http://localhost:5000/api/tasks \
//         -H "Content-Type: application/json" \
//         -d '{"title":"Test task","date":"2025-06-15","priority":"high","userId":"demo"}'
//
// ════════════════════════════════════════════════════════════