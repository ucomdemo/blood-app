const form = document.getElementById('bloodForm');
const recordList = document.getElementById('recordList');
const clearAllBtn = document.getElementById('clearAllBtn');

const STORAGE_KEY = 'blood-pressure-records';

function getCurrentDateTime() {
  const now = new Date();

  const date = now.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const time = now.toLocaleTimeString('zh-TW', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  return `${date} ${time}`;
}

function getRecords() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
}

function saveRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function getStatusText(systolic, diastolic) {
  const isHigh = systolic >= 140 || diastolic >= 90;
  return isHigh ? '偏高' : '正常';
}

function renderRecords() {
  const records = getRecords();

  if (!records.length) {
    recordList.innerHTML = '<li class="empty-state">目前沒有血壓紀錄。</li>';
    return;
  }

  recordList.innerHTML = records
    .slice()
    .reverse()
    .map(
      (record) => `
        <li class="record-item">
          <div class="record-top">
            <strong>${record.timestamp}</strong>
            <span class="pill ${record.status === '偏高' ? 'warning' : 'normal'}">${record.status}</span>
          </div>
          <div class="record-values">
            <span>收縮壓：${record.systolic} mmHg</span>
            <span>舒張壓：${record.diastolic} mmHg</span>
            <span>脈搏：${record.pulse} bpm</span>
            <span>藥物治療：${record.medication}</span>
          </div>
          <div class="record-meta">備註：${record.notes || '無'}</div>
        </li>
      `
    )
    .join('');
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const systolic = Number(document.getElementById('systolic').value);
  const diastolic = Number(document.getElementById('diastolic').value);
  const pulse = Number(document.getElementById('pulse').value);
  const medication = document.getElementById('medication').value;
  const notes = document.getElementById('notes').value.trim();

  if (!systolic || !diastolic || !pulse || !medication) {
    alert('請完整填寫所有欄位。');
    return;
  }

  const records = getRecords();
  const newRecord = {
    systolic,
    diastolic,
    pulse,
    medication,
    notes,
    status: getStatusText(systolic, diastolic),
    timestamp: getCurrentDateTime(),
  };

  records.push(newRecord);
  saveRecords(records);
  form.reset();
  renderRecords();
});

clearAllBtn.addEventListener('click', () => {
  const confirmed = window.confirm('確定要清除全部血壓紀錄嗎？');
  if (!confirmed) return;

  localStorage.removeItem(STORAGE_KEY);
  renderRecords();
});

renderRecords();
