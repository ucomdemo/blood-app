const form = document.getElementById("bp-form");
const recordList = document.getElementById("record-list");
const recordTemplate = document.getElementById("record-template");
const recordCount = document.getElementById("record-count");
const emptyTip = document.getElementById("empty-tip");

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

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const systolic = Number(formData.get("systolic"));
  const diastolic = Number(formData.get("diastolic"));
  const pulse = Number(formData.get("pulse"));

  if (!systolic || !diastolic || !pulse) {
    return;
  }

  records.push({
    systolic,
    diastolic,
    pulse,
    medication: String(formData.get("medication")),
    note: String(formData.get("note")).trim(),
    recordedAt: timeFormatter.format(new Date()),
  });

  renderRecords();
  form.reset();
  form.elements.medication.value = "無";
  form.elements.systolic.focus();
});

renderRecords();
