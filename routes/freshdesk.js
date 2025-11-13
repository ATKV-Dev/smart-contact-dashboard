const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/ticket', async (req, res) => {
  const { name, email, subject, description } = req.body;

  try {
    const response = await axios.post(
      `https://${process.env.FRESHDESK_DOMAIN}/api/v2/tickets`,
      { name, email, subject, description, priority: 1, status: 2 },
      {
        auth: {
          username: process.env.FRESHDESK_API_KEY,
          password: 'X'
        },
        headers: { 'Content-Type': 'application/json' }
      }
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).send('Error creating Freshdesk ticket');
  }
});

module.exports = router;
