const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/calls', async (req, res) => {
  try {
    const response = await axios.get('https://api.freshcaller.com/v1/calls', {
      headers: {
        Authorization: `Token token=${process.env.FRESHCALLER_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).send('Error fetching Freshcaller calls');
  }
});

module.exports = router;
