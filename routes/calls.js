const express = require('express');
const { exportCalls } = require('../utils/export');
const router = express.Router();

// Simulated call log
const callLog = [
  { number: '+27123456789', agent: 'Jackie', date: '2025-11-13' },
  { number: '+27876543210', agent: 'Thabo', date: '2025-11-12' }
];

router.get('/export', async (req, res) => {
  try {
    const filePath = await exportCalls(callLog);
    res.download(filePath);
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).send('Failed to export calls');
  }
});

module.exports = router;
