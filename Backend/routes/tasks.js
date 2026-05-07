const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/taskController');
const { auth } = require('../middleware/auth');  // add JWT auth later

router.get('/',       ctrl.getTasks);     // GET  /api/tasks?date=2025-06-15
router.get('/:id',    ctrl.getTask);      // GET  /api/tasks/:id
router.post('/',      ctrl.createTask);   // POST /api/tasks
router.patch('/:id',  ctrl.updateTask);   // PATCH /api/tasks/:id
router.delete('/:id', ctrl.deleteTask);   // DELETE /api/tasks/:id

module.exports = router;