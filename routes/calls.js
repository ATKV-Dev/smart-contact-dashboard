const express = require('express');
const moment = require('moment');
const { distributeCalls } = require('../utils/distributor');
const { exportCalls } = require('../utils/export');
const dncList = require('../data/dnc.json');
const router = express.Router();

let callLog = []; // Replace with DB in production

router.get('/filter', (req, res) => {
  const { day, month, year } = req.query;
  let filtered = callLog;

  if (day) filtered = filtered.filter(c => moment(c.date).isSame(day, 'day'));
  if (month) filtered = filtered.filter(c => moment(c.date).isSame(month, 'month'));
  if (year) filtered = filtered.filter(c => moment(c.date).isSame(year, 'year'));

  res.json(filtered);
});

router.get('/export', (req, res) => {
  const filePath = exportCalls(callLog);
  res.download(filePath);
});

router.get('/distribute', (req, res) => {
  const assignments = distributeCalls(callLog, dncList);
  res.json(assignments);
});

module.exports = router;
