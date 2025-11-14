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
  document.getElementById('callSummaryTitle').textContent = '📊 Call Summary';
  document.getElementById('callLogTitle').textContent = '📋 View Call Log';
  document.getElementById('distributionTitle').textContent = '📦 Distribution Result';
}

function updateTimestamp() {
  const now = new Date().toLocaleString();
  document.getElementById('lastUpdated').textContent = `🔄 Last updated: ${now}`;
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
    alert('Please enter a year');
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
    alert('Please enter a number');
    return;
  }

  fetch('/api/calls/block', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ number })
  })
    .then(res => res.json())
    .then(data => alert(data.message))
    .catch(err => {
      console.error('Failed to add to DNC:', err.message);
      alert('❌ Failed to add number');
    });
}

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

  setLanguage('en');
});
