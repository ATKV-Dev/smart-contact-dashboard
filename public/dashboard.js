const spinner = document.getElementById('spinner');
const lastUpdatedEl = document.getElementById('lastUpdated');

const translations = {
  en: {
    lastUpdated: '🔄 Last updated:',
    callSummary: '📊 Call Summary',
    callLog: '📋 View Call Log',
    pleaseEnterYear: 'Please enter a year',
    dncAdded: 'Number added to DNC (mocked)',
    enterNumber: 'Enter a number',
    distributionResult: '📦 Distribution Result'
  },
  af: {
    lastUpdated: '🔄 Laas opgedateer:',
    callSummary: '📊 Oproepopsomming',
    callLog: '📋 Sien Oproeplys',
    pleaseEnterYear: 'Voer asseblief \'n jaar in',
    dncAdded: 'Nommer by DNC gevoeg (gesimuleer)',
    enterNumber: 'Voer \'n nommer in',
    distributionResult: '📦 Verspreidingsresultaat'
  }
};

let currentLang = 'en';

function setLanguage(lang) {
  currentLang = lang;
  updateLabels();
  loadDashboard();
}

function updateLabels() {
  document.getElementById('callSummaryTitle').textContent = translations[currentLang].callSummary;
  document.getElementById('callLogTitle').textContent = translations[currentLang].callLog;
  document.getElementById('distributionTitle').textContent = translations[currentLang].distributionResult;
}

function updateTimestamp() {
  const now = new Date().toLocaleString();
  lastUpdatedEl.textContent = `${translations[currentLang].lastUpdated} ${now}`;
}

async function loadDashboard() {
  spinner.classList.add('visible');

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

  spinner.classList.remove('visible');
  updateTimestamp();
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
  const number = document.getElementById('dncNumber').value;
  if (!number) {
    alert(translations[currentLang].enterNumber);
    return;
  }

  alert(`${number} ${translations[currentLang].dncAdded}`);
}

function loadCallLog() {
  spinner.classList.add('visible');

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
    })
    .finally(() => {
      spinner.classList.remove('visible');
    });
}

// ✅ Wire up all buttons after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('languageSelect').addEventListener('change', e => setLanguage(e.target.value));
  document.getElementById('distributeBtn').addEventListener('click', distributeCalls);
  document.getElementById('filterBtn').addEventListener('click', filterCalls);
  document.getElementById('exportBtn').addEventListener('click', exportCalls);
  document.getElementById('dncBtn').addEventListener('click', addToDNC);
  document.getElementById('callLogBtn').addEventListener('click', loadCallLog);

  // Initial load
  setLanguage('en');
});
