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

// Listen for real-time updates
const eventSource = new EventSource('/events');
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Update received:', data.message);
  loadDashboard();
};

// Initial load
loadDashboard();
