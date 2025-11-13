async function filterCalls() {
  const day = document.getElementById('dayFilter').value;
  const month = document.getElementById('monthFilter').value;
  const year = document.getElementById('yearFilter').value;

  const params = new URLSearchParams();
  if (day) params.append('day', day);
  if (month) params.append('month', month);
  if (year) params.append('year', year);

  const res = await fetch(`/api/calls/filter?${params.toString()}`);
  const data = await res.json();
  displayCalls(data);
}

async function exportCalls() {
  window.location.href = '/api/calls/export';
}

async function distributeCalls() {
  const res = await fetch('/api/calls/distribute');
  const data = await res.json();
  document.getElementById('distributionResult').innerText = JSON.stringify(data, null, 2);
}

async function addToDNC() {
  const number = document.getElementById('dncNumber').value;
  if (!number) return alert('Enter a number');

  // You’d POST this to a real DNC endpoint in production
  alert(`Number ${number} added to DNC (mocked)`);
}

function displayCalls(calls) {
  const list = document.getElementById('callList');
  list.innerHTML = '';
  calls.forEach(call => {
    const item = document.createElement('li');
    item.textContent = `${call.number} - ${call.date}`;
    list.appendChild(item);
  });
}
