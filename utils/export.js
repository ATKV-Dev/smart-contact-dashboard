const fs = require('fs');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

function exportCalls(callLog) {
  const filePath = path.join(__dirname, '../public/call_export.csv');
  const csvWriter = createCsvWriter({
    path: filePath,
    header: [
      { id: 'number', title: 'Number' },
      { id: 'agent', title: 'Agent' },
      { id: 'date', title: 'Date' }
    ]
  });

  return csvWriter.writeRecords(callLog).then(() => filePath);
}

module.exports = { exportCalls };
