require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const parseCSV = require('./utils/csvParser');
const { createContact } = require('./utils/freshdesk');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

app.post('/upload', upload.single('contacts'), async (req, res) => {
  const filePath = req.file.path;
  try {
    const contacts = await parseCSV(filePath);
    for (const contact of contacts) {
      await createContact(contact);
    }
    res.send('? Contacts distributed successfully.');
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).send('? Failed to process contacts.');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`?? Server running on http://localhost:${PORT}`));
