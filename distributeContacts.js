require('dotenv').config();
const fs = require('fs');
const csv = require('csv-parser');
const axios = require('axios');

const FRESHDESK_DOMAIN = process.env.FRESHDESK_DOMAIN;
const API_KEY = process.env.FRESHDESK_API_KEY;

// Replace with actual Freshdesk agent IDs
const RECRUITER_IDS = [123456, 234567, 345678];

let contactList = [];
let recruiterIndex = 0;

function getNextRecruiterId() {
  const id = RECRUITER_IDS[recruiterIndex];
  recruiterIndex = (recruiterIndex + 1) % RECRUITER_IDS.length;
  return id;
}

function createContact(contact) {
  const ownerId = getNextRecruiterId();

  const payload = {
    name: contact.name,
    email: contact.email,
    phone: contact.phone,
    owner_id: ownerId,
    tags: ['auto-assigned', 'campaign_2025']
  };

  return axios.post(`https://${FRESHDESK_DOMAIN}/api/v2/contacts`, payload, {
    auth: {
      username: API_KEY,
      password: 'X' // Freshdesk requires any non-empty password
    }
  });
}

function processContacts() {
  fs.createReadStream('contacts.csv')
    .pipe(csv())
    .on('data', (data) => contactList.push(data))
    .on('end', async () => {
      console.log(`Processing ${contactList.length} contacts...\n`);
      for (const contact of contactList) {
        try {
          const response = await createContact(contact);
          console.log(`? Created: ${response.data.name} ? Recruiter ${response.data.owner_id}`);
        } catch (error) {
          const msg = error.response?.data?.errors || error.message;
          console.error(`? Error creating ${contact.name}:`, msg);
        }
      }
    });
}

processContacts();
