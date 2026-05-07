const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/notificationController');

router.post('/subscribe',   ctrl.subscribe);    // Save push token
router.post('/unsubscribe', ctrl.unsubscribe);  // Remove push token
router.post('/test',        ctrl.testPush);     // Send test notification

module.exports = router;