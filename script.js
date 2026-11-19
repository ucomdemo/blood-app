"use strict";

const STORAGE_KEY = "daily-blood-pressure-records";
const form = document.querySelector("#record-form");
const recordsList = document.querySelector("#records-list");
const recordCount = document.querySelector("#record-count");
const formMessage = document.querySelector("#form-message");
const themeToggle = document.querySelector("#theme-toggle");
const themeValue = document.querySelector("#theme-value");
const themeMessage = document.querySelector("#theme-message");
const themeColor = document.querySelector('meta[name="theme-color"]');
const measurementFields = ["systolic", "diastolic", "pulse"];
const THEME_STORAGE_KEY = "daily-blood-pressure-theme";
const themeInitialization = window.themeInitialization;

function showThemeMessage(message) {
  themeMessage.textContent = message;
  themeMessage.classList.toggle("is-error", Boolean(message));
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeToggle.checked = theme === "dark";
  themeValue.textContent = theme === "dark" ? "深色" : "淺色";
  themeColor.content = theme === "dark" ? "#111827" : "#f6f7fb";
}

applyTheme(themeInitialization.theme);
if (themeInitialization.error === "read") {
  showThemeMessage("無法讀取主題偏好，已使用淺色主題。");
} else if (themeInitialization.error === "invalid") {
  showThemeMessage("已儲存的主題偏好無效，已使用淺色主題。");
}

themeToggle.addEventListener("change", () => {
  const theme = themeToggle.checked ? "dark" : "light";
  applyTheme(theme);

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    showThemeMessage("");
  } catch {
    showThemeMessage("無法儲存主題偏好，重新開啟後可能還原為淺色");
  }
});

function showMessage(message, isError) {
  formMessage.textContent = message;
  formMessage.classList.toggle("is-error", isError);
}

function loadRecords() {
  try {
    const savedRecords = localStorage.getItem(STORAGE_KEY);
    if (!savedRecords) {
      return [];
    }

    const parsedRecords = JSON.parse(savedRecords);
    if (!Array.isArray(parsedRecords)) {
      throw new Error("紀錄資料格式不正確。");
    }

    return parsedRecords;
  } catch (error) {
    showMessage("無法讀取已儲存的紀錄，請確認瀏覽器儲存空間後重新整理。", true);
    return [];
  }
}

let records = loadRecords();

function makeElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) {
    element.className = className;
  }
  if (text !== undefined) {
    element.textContent = text;
  }
  return element;
}

function createReading(value, label, unit) {
  const reading = makeElement("div", "reading");
  reading.append(
    makeElement("span", "reading-value", String(value)),
    makeElement("span", "reading-label", label),
    makeElement("span", "reading-unit", unit)
  );
  return reading;
}

function createRecordCard(record) {
  const card = makeElement("article", "record-card");
  const topLine = makeElement("div", "record-topline");
  const time = makeElement("p", "record-time");
  const timeIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  timeIcon.setAttribute("viewBox", "0 0 20 20");
  timeIcon.setAttribute("fill", "none");
  timeIcon.setAttribute("aria-hidden", "true");
  const timeCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  timeCircle.setAttribute("cx", "10");
  timeCircle.setAttribute("cy", "10");
  timeCircle.setAttribute("r", "7");
  timeCircle.setAttribute("stroke", "currentColor");
  timeCircle.setAttribute("stroke-width", "1.5");
  const timeHands = document.createElementNS("http://www.w3.org/2000/svg", "path");
  timeHands.setAttribute("d", "M10 6v4l2.5 1.5");
  timeHands.setAttribute("stroke", "currentColor");
  timeHands.setAttribute("stroke-linecap", "round");
  timeHands.setAttribute("stroke-width", "1.5");
  timeIcon.append(timeCircle, timeHands);

  const timestamp = new Date(record.createdAt);
  const formattedTime = Number.isNaN(timestamp.getTime())
    ? "時間不明"
    : new Intl.DateTimeFormat("zh-TW", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      }).format(timestamp);
  time.append(timeIcon, document.createTextNode(formattedTime));

  const medication = makeElement("span", "medication-tag", record.medication);
  medication.dataset.status = record.medication;
  topLine.append(time, medication);

  const values = makeElement("div", "record-values");
  values.append(
    createReading(record.systolic, "收縮壓", "mmHg"),
    createReading(record.diastolic, "舒張壓", "mmHg"),
    createReading(record.pulse, "脈搏", "次／分鐘")
  );
  card.append(topLine, values);

  if (record.notes) {
    const notes = makeElement("p", "record-notes");
    notes.append(makeElement("strong", "", "備註"), document.createTextNode(record.notes));
    card.append(notes);
  }

  return card;
}

function renderRecords() {
  recordsList.replaceChildren();
  recordCount.textContent = String(records.length);

  if (records.length === 0) {
    const emptyState = makeElement("div", "empty-state");
    const icon = makeElement("div", "empty-icon");
    icon.setAttribute("aria-hidden", "true");
    icon.innerHTML = '<svg viewBox="0 0 20 20" fill="none"><path d="M10 2.5S4 9 4 12.8a6 6 0 0 0 12 0C16 9 10 2.5 10 2.5Z" stroke="currentColor" stroke-width="1.5"/><path d="M7.5 13c.2 1.4 1 2.2 2.4 2.4" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"/></svg>';
    emptyState.append(icon, makeElement("p", "", "還沒有紀錄，儲存第一筆測量吧"));
    recordsList.append(emptyState);
    return;
  }

  const fragment = document.createDocumentFragment();
  records.forEach((record) => fragment.append(createRecordCard(record)));
  recordsList.append(fragment);
}

function validateMeasurements() {
  let firstInvalidField = null;
  let isValid = true;

  measurementFields.forEach((fieldName) => {
    const input = form.elements.namedItem(fieldName);
    const error = document.querySelector(`#${fieldName}-error`);
    const value = input.value.trim();
    const valid = /^[1-9]\d*$/.test(value);

    input.setAttribute("aria-invalid", String(!valid));
    error.textContent = valid ? "" : "請輸入正整數";

    if (!valid) {
      isValid = false;
      firstInvalidField = firstInvalidField || input;
    }
  });

  if (firstInvalidField) {
    firstInvalidField.focus();
  }
  return isValid;
}

form.addEventListener("input", (event) => {
  if (measurementFields.includes(event.target.name) && event.target.getAttribute("aria-invalid") === "true") {
    const error = document.querySelector(`#${event.target.name}-error`);
    if (/^[1-9]\d*$/.test(event.target.value.trim())) {
      event.target.setAttribute("aria-invalid", "false");
      error.textContent = "";
    }
  }
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  showMessage("", false);

  if (!validateMeasurements()) {
    showMessage("請修正欄位中的錯誤後再儲存。", true);
    return;
  }

  const record = {
    systolic: Number(form.elements.namedItem("systolic").value.trim()),
    diastolic: Number(form.elements.namedItem("diastolic").value.trim()),
    pulse: Number(form.elements.namedItem("pulse").value.trim()),
    medication: form.elements.namedItem("medication").value,
    notes: form.elements.namedItem("notes").value.trim(),
    createdAt: new Date().toISOString()
  };
  const updatedRecords = [record, ...records];

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecords));
  } catch (error) {
    showMessage("無法儲存紀錄，請確認瀏覽器儲存空間後再試一次。", true);
    return;
  }

  records = updatedRecords;
  renderRecords();
  form.reset();
  measurementFields.forEach((fieldName) => {
    form.elements.namedItem(fieldName).setAttribute("aria-invalid", "false");
    document.querySelector(`#${fieldName}-error`).textContent = "";
  });
  showMessage("紀錄已儲存。", false);
});

renderRecords();
