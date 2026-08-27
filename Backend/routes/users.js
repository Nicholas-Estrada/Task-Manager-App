const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ success: true, data: [] });
});

router.post('/', (req, res) => {
  const { email, name } = req.body || {};
  res.status(201).json({
    success: true,
    data: {
      _id: 'demo-user',
      email: email || 'demo@example.com',
      name: name || 'Demo User',
    },
  });
});

module.exports = router;
