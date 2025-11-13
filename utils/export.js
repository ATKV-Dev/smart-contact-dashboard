const fs = require('fs');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

function exportCalls(callLog) {
  const filePath = path.join(__dirname, '../data/call_export.csv');
  const csvWriter = createCsvWriter({
    path: filePath,
    header: [
      { id: 'number', title: 'Number' },
      { id: 'agent', title: 'Agent' },
      { id: 'date', title: 'Date' }
    ]
  });

  csvWriter.writeRecords(callLog);
  return filePath;
}

module.exports = { exportCalls };
