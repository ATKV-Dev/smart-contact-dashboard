const spinner = document.getElementById('spinner');
const lastUpdatedEl = document.getElementById('lastUpdated');

// Update timestamp display
function updateTimestamp() {
  const now = new Date().toLocaleString();
  lastUpdatedEl.textContent = `🔄 Last updated: ${now}`;
}

// Load dashboard summary (simulated counts)
async function loadDashboard() {
  spinner.classList.add('visible');

  // Simulated call counts — replace with real API logic if needed
  const todayCount = Math.floor(Math.random() * 10);
  const monthCount = Math.floor(Math.random() * 100);
  const yearCount = Math.floor(Math.random() * 1000);

  document.getElementById('todayCount').textContent = todayCount;
  document.getElementById('monthCount').textContent = monthCount;
  document.getElementById('yearCount').textContent = yearCount;

  spinner.classList.remove('visible');
  updateTimestamp();
}

// Load full call log from backend
async function loadCallLog() {
  spinner.classList.add('visible');

  try {
    const res = await fetch('/api/freshcaller/calls');
    const data = await res.json();
    const list = document.getElementById('callLogList');
    list.innerHTML = '';

    data.calls.slice(0, 50).forEach(call => {
      const li = document.createElement('li');
      li.textContent = `${call.phone_number} - ${call.created_time}`;
      list.appendChild(li);
    });
  } catch (err) {
    console.error('Failed to load call log:', err);
    const list = document.getElementById('callLogList');
    list.innerHTML = '<li>Error loading call log</li>';
  }

  spinner.classList.remove('visible');
}

// Filter calls by date
async function filterCalls() {
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

  spinner.classList.add('visible');

  try {
    const res = await fetch(`/api/calls/filter?${params.toString()}`);
    const data = await res.json();
    displayCalls(data);
  } catch (err) {
    console.error('Failed to filter calls:', err);
  }

  spinner.classList.remove('visible');
}

// Display filtered calls
function displayCalls(calls) {
  const list = document.getElementById('callList');
  list.innerHTML = '';
  calls.forEach(call => {
    const item = document.createElement('li');
    item.textContent = `${call.number} - ${call.date}`;
    list.appendChild(item);
  });
}

// Export calls as CSV
function exportCalls() {
  window.location.href = '/api/calls/export';
}

// Distribute calls
async function distributeCalls() {
  spinner.classList.add('visible');

  try {
    const res = await fetch('/api/calls/distribute');
    const data = await res.json();
    const resultDiv = document.getElementById('distributionResult');
    resultDiv.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    console.error('Failed to distribute calls:', err);
  }

  spinner.classList.remove('visible');
}

// Add number to Do-Not-Call list
function addToDNC() {
  const number = document.getElementById('dncNumber').value;
  if (!number) {
    alert('Enter a number');
    return;
  }

  // You’d POST this to a real DNC endpoint in production
  alert(`Number ${number} added to DNC (mocked)`);
}

// Listen for real-time updates
const eventSource = new EventSource('/events');
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Update received:', data.message);
  loadDashboard();
};

// Initial load
loadDashboard();
