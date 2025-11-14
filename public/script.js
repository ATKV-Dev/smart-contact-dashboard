const translations = {
  en: {
    lastUpdated: '🔄 Last updated:',
    callSummary: '📊 Call Summary',
    callLog: '📋 View Call Log',
    distributionResult: '📦 Distribution Result',
    pleaseEnterYear: 'Please enter a year',
    enterNumber: 'Enter a number',
    dncAdded: 'Number added to DNC',
    filter: 'Filter',
    downloadCSV: 'Download CSV',
    distribute: 'Distribute',
    addToDNC: 'Add to DNC',
    showCallLog: 'Show Call Log',
    generateReport: 'Generate Report',
    uploadDistribute: 'Upload & Distribute',
    reportDay: 'Per Day',
    reportMonth: 'Per Month',
    uploadPlaceholder: 'Select Excel file',
    dayPlaceholder: 'Day (e.g. 01)',
    monthPlaceholder: 'Month (e.g. 03)',
    yearPlaceholder: 'Year (e.g. 2025)',
    numberPlaceholder: 'Enter number',
    sectionHeaders: {
      filterCalls: '🔍 Filter Calls',
      exportCalls: '📤 Export Calls',
      dncList: '🚫 Do-Not-Call List',
      callReport: '📈 Call Report',
      uploadContacts: '📥 Upload & Distribute Contacts'
    }
  },
  af: {
    lastUpdated: '🔄 Laas opgedateer:',
    callSummary: '📊 Oproepopsomming',
    callLog: '📋 Sien Oproeplys',
    distributionResult: '📦 Verspreidingsresultaat',
    pleaseEnterYear: 'Voer asseblief \'n jaar in',
    enterNumber: 'Voer \'n nommer in',
    dncAdded: 'Nommer by DNC gevoeg',
    filter: 'Filtreer',
    downloadCSV: 'Laai CSV af',
    distribute: 'Versprei',
    addToDNC: 'Voeg by DNC',
    showCallLog: 'Wys Oproeplys',
    generateReport: 'Genereer Verslag',
    uploadDistribute: 'Laai op & Versprei',
    reportDay: 'Per Dag',
    reportMonth: 'Per Maand',
    uploadPlaceholder: 'Kies Excel-lêer',
    dayPlaceholder: 'Dag (bv. 01)',
    monthPlaceholder: 'Maand (bv. 03)',
    yearPlaceholder: 'Jaar (bv. 2025)',
    numberPlaceholder: 'Voer nommer in',
    sectionHeaders: {
      filterCalls: '🔍 Filtreer Oproepe',
      exportCalls: '📤 Voer Oproepe Uit',
      dncList: '🚫 Moenie-Bel Lys',
      callReport: '📈 Oproepverslag',
      uploadContacts: '📥 Laai Kontakte op & Versprei'
    }
  }
};

let currentLang = 'en';

function setTheme(theme) {
  document.body.classList.remove('light-mode', 'dark-mode');
  document.body.classList.add(`${theme}-mode`);
  localStorage.setItem('theme', theme);
}

function setLanguage(lang) {
  currentLang = lang;
  updateLabels();
  loadDashboard();
}

function updateLabels() {
  const t = translations[currentLang];

  document.getElementById('callSummaryTitle').textContent = t.callSummary;
  document.getElementById('callLogTitle').textContent = t.callLog;
  document.getElementById('distributionTitle').textContent = t.distributionResult;
  document.getElementById('lastUpdated').textContent = `${t.lastUpdated} ${new Date().toLocaleString()}`;

  document.getElementById('filterBtn').textContent = t.filter;
  document.getElementById('exportBtn').textContent = t.downloadCSV;
  document.getElementById('distributeBtn').textContent = t.distribute;
  document.getElementById('dncBtn').textContent = t.addToDNC;
  document.getElementById('callLogBtn').textContent = t.showCallLog;
  document.getElementById('reportBtn').textContent = t.generateReport;
  document.getElementById('uploadBtn').textContent = t.uploadDistribute;

  document.getElementById('dayFilter').placeholder = t.dayPlaceholder;
  document.getElementById('monthFilter').placeholder = t.monthPlaceholder;
  document.getElementById('yearFilter').placeholder = t.yearPlaceholder;
  document.getElementById('dncNumber').placeholder = t.numberPlaceholder;
  document.getElementById('excelFile').title = t.uploadPlaceholder;

  const reportType = document.getElementById('reportType');
  reportType.options[0].text = t.reportDay;
  reportType.options[1].text = t.reportMonth;

  document.querySelector('section:nth-of-type(2) h2').textContent = t.sectionHeaders.filterCalls;
  document.querySelector('section:nth-of-type(3) h2').textContent = t.sectionHeaders.exportCalls;
  document.querySelector('section:nth-of-type(5) h2').textContent = t.sectionHeaders.dncList;
  document.querySelector('section:nth-of-type(7) h2').textContent = t.sectionHeaders.callReport;
  document.querySelector('section:nth-of-type(8) h2').textContent = t.sectionHeaders.uploadContacts;
}

function updateTimestamp() {
  document.getElementById('lastUpdated').textContent = `${translations[currentLang].lastUpdated} ${new Date().toLocaleString()}`;
}

async function loadDashboard() {
  document.getElementById('spinner').classList.add('visible');

  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();

  try {
    const [dayRes, monthRes, yearRes] = await Promise.all([
      fetch(`/api/calls/filter?day=${day}&month=${month}&year=${year}`),
      fetch(`/api/calls/filter?month=${month}&year=${year}`),
      fetch(`/api/calls/filter?year=${year}`)
    ]);

    const todayCalls = await dayRes.json();
    const monthCalls = await monthRes.json();
    const yearCalls = await yearRes.json();

    document.getElementById('todayCount').textContent = todayCalls.length;
    document.getElementById('monthCount').textContent = monthCalls.length;
    document.getElementById('yearCount').textContent = yearCalls.length;
  } catch (err) {
    console.error('Error loading dashboard:', err.message);
  }

  document.getElementById('spinner').classList.remove('visible');
  updateTimestamp();
}

function filterCalls() {
  const day = document.getElementById('dayFilter').value;
  const month = document.getElementById('monthFilter').value;
  const year = document.getElementById('yearFilter').value;

  if (!year) {
    alert(translations[currentLang].pleaseEnterYear);
    return;
  }

  const params = new URLSearchParams();
  if (day) params.append('day', day);
  if (month) params.append('month', month);
  params.append('year', year);

  fetch(`/api/calls/filter?${params.toString()}`)
    .then(res => res.json())
    .then(displayCalls)
    .catch(err => console.error('Failed to filter calls:', err.message));
}

function displayCalls(calls) {
  const list = document.getElementById('callList');
  list.innerHTML = '';
  calls.forEach(call => {
    const item = document.createElement('li');
    item.textContent = `${call.phone_number} - ${call.created_time}`;
    list.appendChild(item);
  });
}

function exportCalls() {
  window.location.href = '/api/calls/export';
}

function distributeCalls() {
  const popup = window.open('', '_blank', 'width=800,height=600');
  if (!popup) {
    alert('❌ Popup blocked. Please allow popups for this site.');
    return;
  }

  popup.document.write('<p>Loading...</p>');
  popup.document.close();

  fetch('/api/calls/distribute')
    .then(res => res.json())
    .then(data => {
      const rows = data.map(call => `
        <tr>
          <td>${call.number}</td>
          <td>${call.agent}</td>
          <td>${new Date(call.date).toLocaleString()}</td>
        </tr>
      `).join('');

      popup.document.body.innerHTML = `
        <h2>📦 Distributed Calls</h2>
        <table border="1" cellpadding="8">
          <thead>
            <tr><th>Number</th><th>Agent</th><th>Date</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      `;
    })
    .catch(err => {
      popup.document.body.innerHTML = `<p>❌ Failed to load data</p>`;
      console.error(err);
    });
}

function addToDNC() {
  const number = document.getElementById('dncNumber').value.trim();

  if (!number) {
    alert('⚠️ Please enter a number');
    return;
  }

  fetch('/api/block', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ number })
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message || '✅ Number added to DNC');
    })
    .catch(err => {
      console.error('❌ Failed to add to DNC:', err.message);
      alert('❌ Network or server error');
    });
}

// 📋 Load call log
function loadCallLog() {
  fetch('/api/calls')
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById('callLogList');
      list.innerHTML = '';
      data.calls.forEach(call => {
        const li = document.createElement('li');
        li.textContent = `${call.phone_number} - ${call.created_time}`;
        list.appendChild(li);
      });
    })
    .catch(err => {
      console.error('Failed to load call log:', err.message);
      document.getElementById('callLogList').innerHTML = '<li>Error loading call log</li>';
    });
}

// 📈 Generate report
function generateReport() {
  const type = document.getElementById('reportType').value;

  fetch(`/api/calls/report?type=${type}`)
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById('reportList');
      list.innerHTML = '';
      Object.entries(data).forEach(([key, count]) => {
        const li = document.createElement('li');
        li.textContent = `${key}: ${count} calls`;
        list.appendChild(li);
      });
    })
    .catch(err => {
      console.error('Failed to generate report:', err.message);
    });
}

// 📥 Upload and distribute contacts
function uploadAndDistribute() {
  const fileInput = document.getElementById('excelFile');
  const file = fileInput.files[0];

  if (!file) {
    alert('Please select an Excel file');
    return;
  }

  const formData = new FormData();
  formData.append('file', file);

  fetch('/api/calls/upload-distribute', {
    method: 'POST',
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById('uploadResults');
      list.innerHTML = '';
      data.forEach(entry => {
        const li = document.createElement('li');
        li.textContent = `${entry.number} → ${entry.agent}`;
        list.appendChild(li);
      });
    })
    .catch(err => {
      console.error('Upload failed:', err.message);
      alert('❌ Failed to distribute contacts');
    });
}

// 🚀 Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme') || 'light';
  setTheme(savedTheme);
  document.getElementById('themeSelect').value = savedTheme;

  document.getElementById('themeSelect').addEventListener('change', e => setTheme(e.target.value));
  document.getElementById('languageSelect').addEventListener('change', e => setLanguage(e.target.value));
  document.getElementById('distributeBtn').addEventListener('click', distributeCalls);
  document.getElementById('filterBtn').addEventListener('click', filterCalls);
  document.getElementById('exportBtn').addEventListener('click', exportCalls);
  document.getElementById('dncBtn').addEventListener('click', addToDNC);
  document.getElementById('callLogBtn').addEventListener('click', loadCallLog);
  document.getElementById('reportBtn').addEventListener('click', generateReport);
  document.getElementById('uploadBtn').addEventListener('click', uploadAndDistribute);

  setLanguage(currentLang);
});
