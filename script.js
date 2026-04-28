const form = document.getElementById("bp-form");
const recordList = document.getElementById("record-list");
const recordTemplate = document.getElementById("record-template");
const recordCount = document.getElementById("record-count");
const emptyTip = document.getElementById("empty-tip");
const formError = document.getElementById("form-error");

// ── Theme ──
const themeToggleBtn = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");
const themeLabel = document.getElementById("theme-label");

function applyTheme(dark) {
  document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  themeIcon.textContent = dark ? "🌙" : "☀️";
  themeLabel.textContent = dark ? "深色" : "淺色";
}

const savedTheme = localStorage.getItem("theme");
const VALID_THEMES = ["dark", "light"];
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
let isDark = VALID_THEMES.includes(savedTheme) ? savedTheme === "dark" : prefersDark;
applyTheme(isDark);

themeToggleBtn.addEventListener("click", () => {
  isDark = !isDark;
  applyTheme(isDark);
  localStorage.setItem("theme", isDark ? "dark" : "light");
});

const records = [];

const timeFormatter = new Intl.DateTimeFormat("zh-TW", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

function renderRecords() {
  recordList.innerHTML = "";

  records
    .slice()
    .reverse()
    .forEach((record) => {
      const item = recordTemplate.content.firstElementChild.cloneNode(true);
      item.querySelector(".record-pressure").textContent = `${record.systolic} / ${record.diastolic} mmHg`;
      item.querySelector(".record-pulse").textContent = `脈搏：${record.pulse} bpm`;
      item.querySelector(".medication-badge").textContent = record.medication;
      item.querySelector(".record-time").textContent = `記錄時間：${record.recordedAt}`;
      item.querySelector(".record-note").textContent = record.note ? `備註：${record.note}` : "";
      recordList.appendChild(item);
    });

  recordCount.textContent = String(records.length);
  emptyTip.textContent = records.length === 0 ? "尚未新增紀錄" : `共 ${records.length} 筆資料`;
}

const ALLOWED_MEDICATIONS = ["無", "已服藥", "未服藥"];
const SYSTOLIC_MIN = 60;
const SYSTOLIC_MAX = 250;
const DIASTOLIC_MIN = 40;
const DIASTOLIC_MAX = 150;
const PULSE_MIN = 30;
const PULSE_MAX = 220;
const NOTE_MAX_LENGTH = 500;

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const systolic = Number(formData.get("systolic"));
  const diastolic = Number(formData.get("diastolic"));
  const pulse = Number(formData.get("pulse"));

  if (!systolic || !diastolic || !pulse) {
    return;
  }

  if (systolic < SYSTOLIC_MIN || systolic > SYSTOLIC_MAX) {
    formError.textContent = `收縮壓數值超出合理範圍（${SYSTOLIC_MIN}–${SYSTOLIC_MAX} mmHg）`;
    return;
  }

  if (diastolic < DIASTOLIC_MIN || diastolic > DIASTOLIC_MAX) {
    formError.textContent = `舒張壓數值超出合理範圍（${DIASTOLIC_MIN}–${DIASTOLIC_MAX} mmHg）`;
    return;
  }

  if (pulse < PULSE_MIN || pulse > PULSE_MAX) {
    formError.textContent = `脈搏數值超出合理範圍（${PULSE_MIN}–${PULSE_MAX} bpm）`;
    return;
  }

  const medication = String(formData.get("medication"));
  if (!ALLOWED_MEDICATIONS.includes(medication)) {
    formError.textContent = "藥物治療欄位包含無效的值";
    return;
  }

  formError.textContent = "";

  const note = String(formData.get("note")).trim().slice(0, NOTE_MAX_LENGTH);

  records.push({
    systolic,
    diastolic,
    pulse,
    medication,
    note,
    recordedAt: timeFormatter.format(new Date()),
  });

  renderRecords();
  form.reset();
  form.elements.medication.value = "無";
  form.elements.systolic.focus();
});

renderRecords();
