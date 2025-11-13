const express = require('express');
const axios = require('axios');
const router = express.Router();

const FRESHCALLER_API_KEY = process.env.FRESHCALLER_API_KEY;

// Fetch all calls from Freshcaller
const fetchCalls = async () => {
  const response = await axios.get('https://api.freshcaller.com/v2/calls', {
    headers: {
      Authorization: `Token token=${FRESHCALLER_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data.calls;
};

// Filter calls by day/month/year
router.get('/filter', async (req, res) => {
  const { day, month, year } = req.query;

  try {
    const allCalls = await fetchCalls();
    const filtered = allCalls.filter(call => {
      const callDate = new Date(call.created_time);
      const matchesDay = day ? callDate.getDate() === parseInt(day) : true;
      const matchesMonth = month ? callDate.getMonth() + 1 === parseInt(month) : true;
      const matchesYear = year ? callDate.getFullYear() === parseInt(year) : true;
      return matchesDay && matchesMonth && matchesYear;
    });

    res.json(filtered);
  } catch (err) {
    console.error('Error filtering calls:', err.message);
    res.status(500).send('Failed to filter calls');
  }
});

// Distribute calls (mocked logic)
router.get('/distribute', async (req, res) => {
  try {
    const calls = await fetchCalls();
    const agents = ['Jackie', 'Thabo', 'Lerato'];
    const distributed = calls.map((call, index) => ({
      number: call.phone_number,
      agent: agents[index % agents.length],
      date: call.created_time
    }));

    res.json(distributed);
  } catch (err) {
    console.error('Error distributing calls:', err.message);
    res.status(500).send('Failed to distribute calls');
  }
});

// Export calls as CSV (optional)
router.get('/export', async (req, res) => {
  try {
    const calls = await fetchCalls();
    const csv = calls.map(call => `${call.phone_number},${call.created_time}`).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="calls.csv"');
    res.send(csv);
  } catch (err) {
    console.error('Error exporting calls:', err.message);
    res.status(500).send('Failed to export calls');
  }
});

module.exports = router;
