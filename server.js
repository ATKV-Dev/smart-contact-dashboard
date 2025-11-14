const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const callRoutes = require('./routes/calls');

app.use(express.static('public'));
app.use('/api', callRoutes);

let lastCallCount = 0;

app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const checkForNewCalls = async () => {
    try {
      const response = await axios.get('https://api.freshcaller.com/v2/calls', {
        headers: {
          Authorization: `Token token=${process.env.FRESHCALLER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const currentCount = response.data.calls.length;
      if (currentCount > lastCallCount) {
        lastCallCount = currentCount;
        const payload = JSON.stringify({
          timestamp: new Date().toISOString(),
          message: 'New call detected'
        });
        res.write(`data: ${payload}\n\n`);
      }
    } catch (err) {
      console.error('Error checking calls:', err.message);
    }
  };

  const interval = setInterval(checkForNewCalls, 5000);

  req.on('close', () => {
    clearInterval(interval);
    res.end();
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
