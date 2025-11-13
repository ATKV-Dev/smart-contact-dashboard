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

async function loadCallLog() {
  spinner.classList.add('visible');

  try {
    const res = await fetch('/api/calls');
    const data = await res.json();
    const list = document.getElementById('callLogList');
    list.innerHTML = '';

    data.calls.forEach(call => {
      const li = document.createElement('li');
      li.textContent = `${call.phone_number} - ${call.created_time}`;
      list.appendChild(li);
    });
  } catch (err) {
    console.error('Failed to load call log:', err.message);
    document.getElementById('callLogList').innerHTML = '<li>Error loading call log</li>';
  }

  spinner.classList.remove('visible');
}

async function filterCalls() {
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

  spinner.classList.add('visible');

  try {
    const res = await fetch(`/api/calls/filter?${params.toString()}`);
    const data = await res.json();
    displayCalls(data);
  } catch (err) {
    console.error('Failed to filter calls:', err.message);
  }

  spinner.classList.remove('visible');
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

async function distributeCalls() {
  spinner.classList.add('visible');

  try {
    const res = await fetch('/api/calls/distribute');
    const data = await res.json();

        const tbody = document.querySelector('#distributionTable tbody');
    tbody.innerHTML = '';

    data.forEach(call => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${call.number}</td>
        <td>${call.agent}</td>
        <td>${new Date(call.date).toLocaleString()}</td>
      `;
      tbody.appendChild(row);
    });

    openModal();
  } catch (err) {
    console.error('Failed to distribute calls:', err.message);
    alert('❌ Failed to distribute calls');
  }

  spinner.classList.remove('visible');
}

function openModal() {
  document.getElementById('distributionModal').style.display = 'block';
}

function closeModal() {
  document.getElementById('distributionModal').style.display = 'none';
}

function addToDNC() {
  const number = document.getElementById('dncNumber').value;
  if (!number) {
    alert(translations[currentLang].enterNumber);
    return;
  }

  alert(`${number} ${translations[currentLang].dncAdded}`);
}

loadDashboard();
