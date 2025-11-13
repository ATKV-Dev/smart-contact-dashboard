const express = require('express');
const router = express.Router();

// Dummy call data
const dummyCalls = [
  { phone_number: '+27123456789', created_time: '2025-11-13T08:30:00Z' },
  { phone_number: '+27876543210', created_time: '2025-11-12T14:45:00Z' },
  { phone_number: '+27712345678', created_time: '2025-11-01T09:15:00Z' },
  { phone_number: '+27654321098', created_time: '2025-10-25T11:00:00Z' }
];

// Filter calls by day/month/year
router.get('/filter', (req, res) => {
  const { day, month, year } = req.query;

  const filtered = dummyCalls.filter(call => {
    const callDate = new Date(call.created_time);
    const matchesDay = day ? callDate.getDate() === parseInt(day) : true;
    const matchesMonth = month ? callDate.getMonth() + 1 === parseInt(month) : true;
    const matchesYear = year ? callDate.getFullYear() === parseInt(year) : true;
    return matchesDay && matchesMonth && matchesYear;
  });

  res.json(filtered);
});

// Distribute calls to agents
router.get('/distribute', (req, res) => {
  const agents = ['Jackie', 'Thabo', 'Lerato'];
  const distributed = dummyCalls.map((call, index) => ({
    number: call.phone_number,
    agent: agents[index % agents.length],
    date: call.created_time
  }));

  res.json(distributed);
});

// Export calls as CSV
router.get('/export', (req, res) => {
  const csv = dummyCalls.map(call => `${call.phone_number},${call.created_time}`).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="calls.csv"');
  res.send(csv);
});

// Fetch all calls (for call log)
router.get('/', (req, res) => {
  res.json({ calls: dummyCalls });
});

module.exports = router;
