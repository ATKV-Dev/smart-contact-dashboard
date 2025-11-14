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

// ✅ Show confirmation modal
function showUploadModal() {
  document.getElementById('uploadModal').style.display = 'block';
}

function closeUploadModal() {
  document.getElementById('uploadModal').style.display = 'none';
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
      showUploadModal();
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

  window.addEventListener('click', function(event) {
    const modal = document.getElementById('uploadModal');
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });

  setLanguage(currentLang);
});

