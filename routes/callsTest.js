const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const router = express.Router();
const client = require('../freshworksClient');
const upload = multer({ storage: multer.memoryStorage() });

// Example: Fetch Freshdesk contacts
router.get('/freshdesk/contacts', async (req, res) => {
  try {
    const response = await freshdesk.get('/contacts');
    res.json(response.data);
  } catch (err) {
    console.error('❌ Freshdesk error:', err.message);
    res.status(500).json({ message: 'Failed to fetch contacts' });
  }
});

// Example: Fetch Freshdesk tickets
router.get('/freshdesk/tickets', async (req, res) => {
  try {
    const response = await freshdesk.get('/tickets');
    res.json(response.data);
  } catch (err) {
    console.error('❌ Freshdesk error:', err.message);
    res.status(500).json({ message: 'Failed to fetch tickets' });
  }
});

const blockedNumbers = new Set();
const agents = ['Jackie', 'Thabo', 'Lerato','Shipo','Jan','Greg','Happy','Gary'];

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

router.get('/distribute', (req, res) => {
  const distributed = dummyCalls.map((call, index) => ({
    number: call.phone_number,
    agent: agents[index % agents.length],
    date: call.created_time
  }));
  res.json(distributed);
});

router.get('/export', (req, res) => {
  const csv = dummyCalls.map(call => `${call.phone_number},${call.created_time}`).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="calls.csv"');
  res.send(csv);
});

router.get('/', (req, res) => {
  res.json({ calls: dummyCalls });
});

router.get('/report', (req, res) => {
  const { type } = req.query;
  const counts = {};
  dummyCalls.forEach(call => {
    const date = new Date(call.created_time);
    let key;
    if (type === 'day') {
      key = date.toISOString().split('T')[0];
    } else if (type === 'month') {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }
    if (key) {
      counts[key] = (counts[key] || 0) + 1;
    }
  });
  res.json(counts);
});


router.post('/block', express.json(), (req, res) => {
  try {
    const { number } = req.body;

    if (!number || typeof number !== 'string') {
      console.log('❌ Invalid number received:', number);
      return res.status(400).json({ message: '❌ Invalid number format' });
    }

    if (blockedNumbers.has(number)) {
      console.log('⚠️ Duplicate block attempt:', number);
      return res.status(200).json({ message: '⚠️ This number has already been added.' });
    }

    blockedNumbers.add(number);
    console.log(`📵 Blocked number: ${number}`);
    res.status(201).json({ message: '✅ Number added to DNC.' });
  } catch (err) {
    console.error('❌ DNC block failed:', err.message);
    res.status(500).json({ message: '❌ Server error while adding to DNC' });
  }
});

router.post('/upload-distribute', upload.single('file'), (req, res) => {
  if (!req.file) {
    console.log('❌ No file uploaded');
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    console.log('✅ Parsed rows:', data.length);
    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ message: '❌ File is empty or invalid format' });
    }

    const distributed = data.map((row, index) => ({
      number: row.number || row.phone_number || row['Contact Number'],
      agent: agents[index % agents.length],
      campaign: row.campaign || 'Unassigned'
    }));

    console.log('✅ Distributed:', distributed.length);
    res.json(distributed);
  } catch (err) {
    console.error('❌ Excel parsing failed:', err.message);
    res.status(500).json({ message: '❌ Failed to process file' });
  }
});



module.exports = router;
