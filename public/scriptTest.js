// 🌍 Translations
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

let currentLang = localStorage.getItem('language') || 'en';

function setTheme(theme) {
  document.body.classList.remove('light-mode', 'dark-mode');
  document.body.classList.add(`${theme}-mode`);
  localStorage.setItem('theme', theme);
}

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('language', lang);
  updateLabels();
  loadDashboard();
}

function updateLabels() {
  const t = translations[currentLang];

  const safeSet = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  safeSet('callSummaryTitle', t.callSummary);
  safeSet('callLogTitle', t.callLog);
  safeSet('distributionTitle', t.distributionResult);
  safeSet('lastUpdated', `${t.lastUpdated} ${new Date().toLocaleString()}`);

  safeSet('filterBtn', t.filter);
  safeSet('exportBtn', t.downloadCSV);
  safeSet('distributeBtn', t.distribute);
  safeSet('dncBtn', t.addToDNC);
  safeSet('callLogBtn', t.showCallLog);
  safeSet('reportBtn', t.generateReport);
  safeSet('uploadBtn', t.uploadDistribute);

  const placeholders = {
    dayFilter: t.dayPlaceholder,
    monthFilter: t.monthPlaceholder,
    yearFilter: t.yearPlaceholder,
    dncNumber: t.numberPlaceholder,
    callFile: t.uploadPlaceholder
  };

  for (const [id, text] of Object.entries(placeholders)) {
    const el = document.getElementById(id);
    if (el) el.placeholder = text;
  }

  const reportType = document.getElementById('reportType');
  if (reportType && reportType.options.length >= 2) {
    reportType.options[0].text = t.reportDay;
    reportType.options[1].text = t.reportMonth;
  }

  const sections = document.querySelectorAll('section h2');
  if (sections.length >= 8) {
    sections[1].textContent = t.sectionHeaders.filterCalls;
    sections[2].textContent = t.sectionHeaders.exportCalls;
    sections[4].textContent = t.sectionHeaders.dncList;
    sections[6].textContent = t.sectionHeaders.callReport;
    sections[7].textContent = t.sectionHeaders.uploadContacts;
  }
}

function updateTimestamp() {
  const t = translations[currentLang];
  const el = document.getElementById('lastUpdated');
  if (el) el.textContent = `${t.lastUpdated} ${new Date().toLocaleString()}`;
}

async function loadDashboard() {
  const spinner = document.getElementById('spinner');
  if (spinner) spinner.classList.add('visible');

  const today = new Date();
  const [day, month, year] = [today.getDate(), today.getMonth() + 1, today.getFullYear()];

  try {
    const [dayRes, monthRes, yearRes] = await Promise.all([
      fetch(`/api/calls/filter?day=${day}&month=${month}&year=${year}`),
      fetch(`/api/calls/filter?month=${month}&year=${year}`),
      fetch(`/api/calls/filter?year=${year}`)
    ]);

    const [todayCalls, monthCalls, yearCalls] = await Promise.all([
      dayRes.json(), monthRes.json(), yearRes.json()
    ]);

    document.getElementById('todayCount').textContent = todayCalls.length;
    document.getElementById('monthCount').textContent = monthCalls.length;
    document.getElementById('yearCount').textContent = yearCalls.length;
  } catch (err) {
    console.error('Error loading dashboard:', err.message);
  }

  if (spinner) spinner.classList.remove('visible');
  updateTimestamp();
}

function filterCalls() {
  const t = translations[currentLang];
  const day = document.getElementById('dayFilter').value;
  const month = document.getElementById('monthFilter').value;
  const year = document.getElementById('yearFilter').value;

  if (!year) {
    alert(t.pleaseEnterYear);
    return;
  }

  const params = new URLSearchParams({ year });
  if (day) params.append('day', day);
  if (month) params.append('month', month);

  fetch(`/api/calls/filter?${params}`)
    .then(res => res.json())
    .then(displayCalls)
    .catch(err => console.error('Failed to filter calls:', err.message));
}

function displayCalls(calls) {
  const list = document.getElementById('callList');
  if (!list) return;
  list.innerHTML = '';
  calls.forEach(call => {
    const li = document.createElement('li');
    li.textContent = `${call.phone_number} - ${call.created_time}`;
    list.appendChild(li);
  });
}

fetch('/api/freshdesk/contacts')
  .then(res => res.json())
  .then(data => {
    console.log('✅ Freshdesk contacts:', data);
    // Render them in your dashboard
  })
  .catch(err => {
    console.error('❌ Failed to fetch contacts:', err.message);
  });



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
          <thead><tr><th>Number</th><th>Agent</th><th>Date</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      `;
    })
    .catch(err => {
      popup.document.body.innerHTML = `<p>❌ Failed to load data</p>`;
      console.error(err);
    })
    .catch(err => {
      popup.document.body.innerHTML = `<p>❌ Failed to load data</p>`;
      console.error(err);
    });
}

// 🚫 Add number to Do-Not-Call list
function addToDNC() {
  const number = document.getElementById('dncNumber').value.trim();
  const t = translations[currentLang];

  if (!number) {
    alert(t.enterNumber);
    return;
  }

  fetch('/api/calls/block', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ number })
  })
    .then(res => res.json())
    .then(() => alert(t.dncAdded))
    .catch(err => {
      console.error('Failed to add to DNC:', err.message);
      alert('❌ Failed to add number');
    });
}

// 📋 Load call log
function loadCallLog() {
  fetch('/api/calls')
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById('callLogList');
      if (!list) return;
      list.innerHTML = '';
      data.calls.forEach(call => {
        const li = document.createElement('li');
        li.textContent = `${call.phone_number} - ${call.created_time}`;
        list.appendChild(li);
      });
    })
    .catch(err => {
      console.error('Failed to load call log:', err.message);
      const list = document.getElementById('callLogList');
      if (list) list.innerHTML = '<li>Error loading call log</li>';
    });
}

// 📈 Generate report
function generateReport() {
  const type = document.getElementById('reportType').value;

  fetch(`/api/calls/report?type=${type}`)
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById('reportList');
      if (!list) return;
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
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme') || 'light';
  setTheme(savedTheme);

  const lang = localStorage.getItem('language') || 'en';
  setLanguage(lang);

  const resultContainer = document.getElementById('distributedResults');
  const form = document.getElementById('uploadForm');
  const fileInput = document.getElementById('callFile');

  if (form && fileInput && resultContainer) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const file = fileInput.files[0];
      if (!file) {
        alert(translations[currentLang].uploadPlaceholder);
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      resultContainer.innerHTML = '<p>⏳ Uploading and distributing...</p>';

      fetch('/api/upload-distribute', {
        method: 'POST',
        body: formData
      })
        .then(res => {
          if (!res.ok) throw new Error(`❌ Server error: ${res.status}`);
          return res.json();
        })
        .then(data => {
          if (!Array.isArray(data)) {
            alert(data.message || '❌ Unexpected response');
            resultContainer.innerHTML = '';
            return;
          }

          resultContainer.innerHTML = '<h3>Distributed Calls</h3><ul>' +
            data.map(d => `<li>${d.number || 'Unknown'} ➔ ${d.agent || 'Unassigned'} (${d.campaign || 'Unassigned'})</li>`).join('') +
            '</ul>';
        })
        .catch(err => {
          console.error('❌ Upload failed:', err.message);
          alert('❌ Failed to upload and distribute');
          resultContainer.innerHTML = '';
        });
    });
  } else {
    console.warn('⚠️ Upload form elements not found in DOM');
  }

  // 🔒 Safe event binding
  function safeAdd(id, event, handler) {
    const el = document.getElementById(id);
    if (el) el.addEventListener(event, handler);
    else console.warn(`⚠️ Element not found: ${id}`);
  }

  safeAdd('themeSelect', 'change', e => setTheme(e.target.value));
  safeAdd('languageSelect', 'change', e => setLanguage(e.target.value));
  safeAdd('distributeBtn', 'click', distributeCalls);
  safeAdd('filterBtn', 'click', filterCalls);
  safeAdd('exportBtn', 'click', exportCalls);
  safeAdd('dncBtn', 'click', addToDNC);
  safeAdd('callLogBtn', 'click', loadCallLog);
  safeAdd('reportBtn', 'click', generateReport);
});

