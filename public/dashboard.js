const spinner = document.getElementById('spinner');
const lastUpdatedEl = document.getElementById('lastUpdated');

function updateTimestamp() {
  const now = new Date().toLocaleString();
  lastUpdatedEl.textContent = `?? Last updated: ${now}`;
}

async function loadDashboard() {
  spinner.classList.add('visible');

  // Simulated call counts (replace with real API logic if needed)
  const todayCount = Math.floor(Math.random() * 10);
  const monthCount = Math.floor(Math.random() * 100);
  const yearCount = Math.floor(Math.random() * 1000);

  document.getElementById('todayCount').textContent = todayCount;
  document.getElementById('monthCount').textContent = monthCount;
  document.getElementById('yearCount').textContent = yearCount;

  spinner.classList.remove('visible');
  updateTimestamp();
}

const eventSource = new EventSource('/events');
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Update received:', data.message);
  loadDashboard();
};

loadDashboard();
