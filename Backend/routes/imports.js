const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/importController');
const multer  = require('multer');

// Temporary disk storage for uploads (deleted after processing)
const upload = multer({ dest: 'uploads/' });

// POST /api/imports/upload
router.post('/upload', upload.single('file'), ctrl.upload);

module.exports = router;
