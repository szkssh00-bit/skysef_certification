/* SKYSEF questionnaire -> background certificate PDF -> final record. */
const SURVEY_ENDPOINT = "https://script.google.com/macros/s/AKfycbz-jiOmdy81v1rjuN8xuOlHr4waH1i6VGzsmnpEK3_609oOW3_zhfgpC4ERa7KZOuP4/exec";
const ADMIN_PASSWORD_CLIENT = "set";
let remoteConfigLoaded = false;

let SCHOOLS = [
  { school: "West Moreton Anglican College", country: "Australia" },
  { school: "St. John's School", country: "Guam" },
  { school: "Mentari Intercultural School", country: "Indonesia" },
  { school: "Hyogo Prefectural Tatsuno High School", country: "Japan" },
  { school: "Yasuda Gakuen Junior and Senior High School", country: "Japan" },
  { school: "Osaka Prefectural Senri High School", country: "Japan" },
  { school: "Shizuoka Prefectural Yaizu Chuo High School", country: "Japan" },
  { school: "Takada Junior & Senior High School", country: "Japan" },
  { school: "Shizuoka Agriculture High School", country: "Japan" },
  { school: "Shizuoka Kita Junior High School", country: "Japan" },
  { school: "Shizuoka Kita High School", country: "Japan" },
  { school: "Pui Ching Middle School", country: "Macau" },
  { school: "The Affiliated Senior High School of National Chi-Nan University", country: "Taiwan" },
  { school: "Taichung Municipal HUI-WEN High School", country: "Taiwan" },
  { school: "National Lan-Yang Girls' Senior High School", country: "Taiwan" },
  { school: "Taichung Municipal Taichung First Senior High School", country: "Taiwan" },
  { school: "Chia-Yi Senior High School", country: "Taiwan" },
  { school: "Princess Chulabhorn Science High School Loei", country: "Thailand" },
  { school: "Holy Redeemer North Eastern Region School", country: "Thailand" },
  { school: "Holy Redeemer School Khon Kaen", country: "Thailand" },
  { school: "Other", country: "Other" }
];
let COUNTRIES = ["Australia", "Guam", "Indonesia", "Japan", "Macau", "Taiwan", "Thailand", "Other"];
let EVENT_DATES = [
  { value: "2026-08-02", label: "August 2, 2026", short: "Aug. 2" },
  { value: "2026-08-03", label: "August 3, 2026", short: "Aug. 3" },
  { value: "2026-08-04", label: "August 4, 2026", short: "Aug. 4" },
  { value: "2026-08-05", label: "August 5, 2026", short: "Aug. 5" }
];
let TIMELINE = {
  "2026-08-02": [
    ["13:00-13:30", "Registration 受付", "Conference Hall - Winds, 11F / 会議ホール・風"],
    ["13:40-14:05", "Opening Ceremony", "Conference Hall - Winds, 11F"],
    ["14:20-15:20", "Keynote Address 基調講演", "Conference Hall - Winds, 11F / 会議ホール・風"],
    ["15:45-17:45", "Welcome Reception, Cultural Performance I 歓迎レセプション・文化交流I", "Conference Rooms 1001-1 and 1001-2, 10F"]
  ],
  "2026-08-03": [
    ["09:00", "GRANSHIP opens", "GRANSHIP"],
    ["09:30-12:00", "Oral Presentation 口頭発表", "Room 904, 9F / Room 908, 9F / Room 1001-1, 10F / Room 1001-2, 10F / Room 1002, 10F"],
    ["12:00-14:00", "Lunch", "-"],
    ["14:00-14:30", "Poster Setup ポスター準備", "Main Hall - Ocean, 1F / 大ホール・海"],
    ["14:30-17:00", "Poster Session ポスターセッション", "Main Hall - Ocean, 1F"]
  ],
  "2026-08-04": [
    ["09:00", "GRANSHIP opens", "GRANSHIP"],
    ["09:30-12:00", "International Joint Project / For Teachers: Guided Tour", "Main Hall - Ocean, 1F / Meet at the entrance of GRANSHIP"],
    ["12:00-14:00", "Lunch", "-"],
    ["14:00-17:00", "International Joint Project", "Main Hall - Ocean, 1F"]
  ],
  "2026-08-05": [
    ["09:00", "GRANSHIP opens", "GRANSHIP"],
    ["09:30-11:00", "International Joint Project", "Main Hall - Ocean, 1F"],
    ["11:00-13:00", "Lunch", "-"],
    ["13:00-15:00", "Cultural Performance II", "Main Hall - Ocean, 1F"],
    ["15:00-15:30", "Questionnaire and Certificate of Participation", "Main Hall - Ocean, 1F"],
    ["15:30-15:45", "Commendation Ceremony 表彰式", "Main Hall - Ocean, 1F"],
    ["15:45-16:00", "Closing Ceremony 閉会式", "Main Hall - Ocean, 1F"]
  ]
};

const DEFAULT_TIMELINE = JSON.parse(JSON.stringify(TIMELINE));
let PROGRAM_QUESTIONS = [
  { text: "Opening Ceremony (Aug. 2)", dates: ["2026-08-02"], teacherOnly: false },
  { text: "Keynote Address (Aug. 2)", dates: ["2026-08-02"], teacherOnly: false },
  { text: "Welcome Reception / Cultural Performance I (Aug. 2)", dates: ["2026-08-02"], teacherOnly: false },
  { text: "Cultural Performance II (Aug. 5)", dates: ["2026-08-05"], teacherOnly: false },
  { text: "Poster Session (Aug. 3)", dates: ["2026-08-03"], teacherOnly: false },
  { text: "Oral Presentation (Aug. 3)", dates: ["2026-08-03"], teacherOnly: false },
  { text: "International Joint Project (Aug. 4 and Aug. 5)", dates: ["2026-08-04", "2026-08-05"], teacherOnly: false },
  { text: "For teachers: Guided Tour (Aug. 4)", dates: ["2026-08-04"], teacherOnly: true },
  { text: "For teachers: Teachers’ Session (Aug. 4)", dates: ["2026-08-04"], teacherOnly: true },
  { text: "Commendation Ceremony (Aug. 5)", dates: ["2026-08-05"], teacherOnly: false },
  { text: "Closing Ceremony (Aug. 5)", dates: ["2026-08-05"], teacherOnly: false },
  { text: "Accommodation / Home Stay", dates: ["2026-08-02", "2026-08-03", "2026-08-04", "2026-08-05"], teacherOnly: false, general: true, accommodationOnly: true },
  { text: "Transportation", dates: ["2026-08-02", "2026-08-03", "2026-08-04", "2026-08-05"], teacherOnly: false, general: true },
  { text: "Schedule", dates: ["2026-08-02", "2026-08-03", "2026-08-04", "2026-08-05"], teacherOnly: false, general: true }
];
let ITEM_EXTRA_OPTIONS = ["Research discussion", "Scientific English communication", "International exchange", "Friendship and networking", "Venue and facilities", "Food and reception", "Other"];
let LEARNING_QUESTIONS = [
  { text: "I was inspired to engage more in the discussion.", sub: [{ name: "inspired_by", label: "Whom were you inspired by?" }, { name: "inspired_how", label: "How were you inspired?" }] },
  { text: "My communication with the other participating students was satisfactory.", sub: [{ name: "communication_reason", label: "Why do you feel so?" }] },
  { text: "My presentation(s) was/were satisfactory.", sub: [{ name: "presentation_reason", label: "Why do you feel so?" }] },
  { text: "I gained the friendship with the other participating students that would last long.", sub: [] },
  { text: "I had a chance to think about the relationship between science and the society.", sub: [] },
  { text: "I would like to keep thinking about the relationship between science and the society.", sub: [] },
  { text: "I would like to learn English expression of scientific items more.", sub: [] },
  { text: "I would like to acquire scientific skills and abilities to participate in the scientific activities in an international setting.", sub: [] }
];
let PERIOD_OPTIONS = ["The bottom of July", "The top of August", "The bottom of August", "Other period"];
let TEACHER_QUESTIONS = [
  { text: "FOR TEACHERS: The performance of my students is satisfactory.", sub: [{ name: "teacher_performance_reason", label: "How was it satisfactory?" }] },
  { text: "FOR TEACHERS: What would you like to put an emphasis on in order for your student to demonstrate their abilities in science in an international science conference like SKYSEF 2026?", textareaOnly: true, name: "teacher_emphasis" }
];

let submissionId = null;
let latestPdf = null;
let pdfPromise = null;
let uploadPromise = null;
let recordPromise = null;
let participantDataSnapshot = null;
const $ = (id) => document.getElementById(id);

function safeText(value, fallback) { return String(value || "").replace(/\s+/g, " ").trim() || fallback; }
function makeSubmissionId() {
  const rand = new Uint32Array(2);
  crypto.getRandomValues(rand);
  return `skysef-${Date.now()}-${Array.from(rand).map((v) => v.toString(16)).join("")}`;
}
function sanitizeFileName(text) { return String(text || "certificate").normalize("NFKC").replace(/[\\/:*?"<>|]/g, "_").replace(/\s+/g, "_").slice(0, 80); }
function setStatus(id, message, type = "") {
  const el = $(id);
  el.className = `submit-status ${type}`.trim();
  el.textContent = message || "";
}
function selectedDateLabel(value) { return (EVENT_DATES.find((d) => d.value === value) || EVENT_DATES[0]).label; }
function selectedDateShort(value) { return (EVENT_DATES.find((d) => d.value === value) || EVENT_DATES[0]).short; }
function todayIsoLocal() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function getSelectableEventDates() {
  const eventStart = EVENT_DATES[0].value;
  const eventEnd = EVENT_DATES[EVENT_DATES.length - 1].value;
  const today = todayIsoLocal();
  let upper = eventEnd;
  if (today >= eventStart && today <= eventEnd) upper = today;
  if (today > eventEnd) upper = eventEnd;
  return EVENT_DATES.filter((d) => d.value <= upper);
}
function getParticipationPeriodText() {
  const start = $("participationStart").value;
  const end = $("participationEnd").value;
  if (!start || !end) return "August 2 to 5, 2026";
  if (start === end) return selectedDateLabel(start);
  return `${selectedDateShort(start)} to ${selectedDateShort(end)}, 2026`;
}
function isDateInSelectedPeriod(dateValue) {
  const start = $("participationStart").value;
  const end = $("participationEnd").value;
  if (!start || !end) return true;
  return dateValue >= start && dateValue <= end;
}
function isProgramVisible(question) {
  const isTeacher = $("position").value === "Teacher";
  if (question.teacherOnly && !isTeacher) return false;
  if (question.accommodationOnly && $("accommodationUse").value !== "Yes") return false;
  return question.dates.some(isDateInSelectedPeriod);
}
function setQuestionEnabled(item, enabled, required) {
  item.hidden = !enabled;
  item.classList.toggle("is-question-hidden", !enabled);
  item.querySelectorAll("input, textarea, select").forEach((control) => {
    control.disabled = !enabled;
    if (control.type === "radio") control.required = enabled && required;
  });
}
function updateItemSelectOptions() {
  const options = [];
  PROGRAM_QUESTIONS.forEach((q) => { if (isProgramVisible(q)) options.push(q.text); });
  ITEM_EXTRA_OPTIONS.forEach((label) => { if (!options.includes(label)) options.push(label); });
  document.querySelectorAll("select.item-select").forEach((select) => {
    const current = select.value;
    select.innerHTML = '<option value="">Select item</option>' + options.map((label) => `<option value="${escapeOption(label)}">${label}</option>`).join("");
    if ([...select.options].some((option) => option.value === current)) select.value = current;
  });
}
function escapeOption(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function updateDynamicQuestionnaire() {
  document.querySelectorAll(".program-question").forEach((item) => {
    const index = Number(item.dataset.index);
    const q = PROGRAM_QUESTIONS[index];
    const visible = isProgramVisible(q);
    setQuestionEnabled(item, visible, visible);
  });
  updateItemSelectOptions();
}
function updatePeriodPreview() {
  const start = $("participationStart").value;
  const end = $("participationEnd").value;
  if (start && end && start > end) $("participationEnd").value = start;
  const text = getParticipationPeriodText();
  $("certificatePeriodPreview").textContent = `Certificate text: held from ${text}`;
  $("certificateDescription").textContent = `for participating in the Shizuoka Kita Youth Science Engineering Forum 2026, held from ${text}, hosted and organized by Shizuoka Kita Junior and Senior High School`;
  updateDynamicQuestionnaire();
}
function applyCertificateText() {
  $("name").textContent = safeText($("inputName").value, "Name");
  $("school").textContent = safeText($("inputSchool").value, "School");
  updatePeriodPreview();
}
function base64ToBlob(base64, mimeType = "application/pdf") {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mimeType });
}
function downloadLatestPdf() {
  if (!latestPdf || !latestPdf.blob) {
    $("pdfStatus").textContent = "Preparing the certificate PDF in this browser.";
    return;
  }
  const url = latestPdf.url || URL.createObjectURL(latestPdf.blob);
  latestPdf.url = url;
  const a = document.createElement("a");
  a.href = url;
  a.download = latestPdf.fileName || `SKYSEF2026_Certificate_${sanitizeFileName($("inputName").value)}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  $("pdfStatus").textContent = "PDF is ready. If the download did not start, press Download PDF again.";
}
function renderSelectOptions() {
  $("inputSchool").innerHTML = '<option value="">Select your school</option>';
  $("inputCountry").innerHTML = '<option value="">Select country / region</option>';
  SCHOOLS.forEach(({ school }) => {
    const option = document.createElement("option");
    option.value = school;
    option.textContent = school;
    $("inputSchool").appendChild(option);
  });
  COUNTRIES.forEach((country) => {
    const option = document.createElement("option");
    option.value = country;
    option.textContent = country;
    $("inputCountry").appendChild(option);
  });
  const selectableDates = getSelectableEventDates();
  ["participationStart", "participationEnd"].forEach((id) => {
    const select = $(id);
    select.innerHTML = "";
    selectableDates.forEach((d) => {
      const option = document.createElement("option");
      option.value = d.value;
      option.textContent = d.label;
      select.appendChild(option);
    });
  });
  $("participationStart").value = selectableDates[0].value;
  $("participationEnd").value = selectableDates[selectableDates.length - 1].value;
}
function normalizeTimelineRow(row) {
  if (Array.isArray(row)) return [row[0] || "", row[1] || "", row[2] || ""];
  if (row && typeof row === "object") return [row.time || "", row.program || row.content || "", row.venue || ""];
  return ["", String(row || ""), ""];
}
function timelineRowsForDate(dateValue) {
  const rows = Array.isArray(TIMELINE[dateValue]) ? TIMELINE[dateValue] : [];
  if (rows.length) return rows.map(normalizeTimelineRow).filter((r) => r.some(Boolean));
  const fallback = Array.isArray(DEFAULT_TIMELINE[dateValue]) ? DEFAULT_TIMELINE[dateValue] : [];
  return fallback.map(normalizeTimelineRow).filter((r) => r.some(Boolean));
}
function renderTimeline(dateValue = "2026-08-02") {
  const panel = $("timelinePanel");
  let rows = timelineRowsForDate(dateValue);
  if (!rows.length) {
    rows = Object.keys(DEFAULT_TIMELINE).flatMap((date) => timelineRowsForDate(date).map((row) => [selectedDateShort(date), ...row]));
    panel.innerHTML = `<table><thead><tr><th>Date</th><th>Time</th><th>Program</th><th>Venue</th></tr></thead><tbody>${rows.map((row) => `<tr><td>${row[0]}</td><td>${row[1]}</td><td>${row[2]}</td><td>${row[3]}</td></tr>`).join("")}</tbody></table>`;
  } else {
    panel.innerHTML = `<table><thead><tr><th>Time</th><th>Program</th><th>Venue</th></tr></thead><tbody>${rows.map((row) => `<tr><td>${row[0]}</td><td>${row[1]}</td><td>${row[2]}</td></tr>`).join("")}</tbody></table>`;
  }
  document.querySelectorAll(".timeline-tab").forEach((button) => button.classList.toggle("is-active", button.dataset.date === dateValue));
}
function renderTimelineTabs() {
  const tabs = $("timelineTabs");
  tabs.innerHTML = "";
  const dates = EVENT_DATES.length ? EVENT_DATES : Object.keys(DEFAULT_TIMELINE).map((value) => ({ value, short: selectedDateShort(value) }));
  dates.forEach((d) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "timeline-tab";
    button.dataset.date = d.value;
    button.textContent = d.short || d.label || d.value;
    button.addEventListener("click", () => renderTimeline(d.value));
    tabs.appendChild(button);
  });
  renderTimeline((dates[0] || { value: "2026-08-02" }).value);
}
function makeRatingQuestion(question, name, required = true, indexLabel = "") {
  const wrapper = document.createElement("div");
  wrapper.className = "question-item";
  const header = document.createElement("div");
  header.className = "question-title";
  header.textContent = `${indexLabel}${question}`;
  wrapper.appendChild(header);
  const row = document.createElement("div");
  row.className = "rating-row";
  row.setAttribute("role", "radiogroup");
  row.setAttribute("aria-label", question);
  [5, 4, 3, 2, 1].forEach((score) => {
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.type = "radio";
    input.name = name;
    input.value = String(score);
    if (required) input.required = true;
    label.appendChild(input);
    label.appendChild(document.createTextNode(String(score)));
    row.appendChild(label);
  });
  wrapper.appendChild(row);
  return wrapper;
}
function appendSubQuestions(wrapper, subQuestions) {
  if (!subQuestions || !subQuestions.length) return;
  const box = document.createElement("div");
  box.className = "sub-question-box";
  subQuestions.forEach((item) => {
    const label = document.createElement("label");
    label.textContent = item.label;
    const textarea = document.createElement("textarea");
    textarea.name = item.name;
    textarea.rows = 3;
    label.appendChild(textarea);
    box.appendChild(label);
  });
  wrapper.appendChild(box);
}
function renderQuestions() {
  $("programQuestions").innerHTML = "";
  $("learningQuestions").innerHTML = "";
  $("periodQuestion").innerHTML = "";
  $("teacherQuestions").innerHTML = "";
  PROGRAM_QUESTIONS.forEach((q, i) => {
    const item = makeRatingQuestion(q.text, `program_${i + 1}`, !q.teacherOnly, `(${i + 1}) `);
    item.classList.add("program-question");
    item.dataset.index = String(i);
    if (q.teacherOnly) item.classList.add("teacher-program-question");
    $("programQuestions").appendChild(item);
  });
  LEARNING_QUESTIONS.forEach((q, i) => {
    const item = makeRatingQuestion(q.text, `learning_${i + 1}`, true, `(${i + 1}) `);
    appendSubQuestions(item, q.sub);
    $("learningQuestions").appendChild(item);
  });
  PERIOD_OPTIONS.forEach((labelText) => {
    const label = document.createElement("label");
    label.className = "period-option";
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "preferredPeriod";
    input.value = labelText;
    input.required = true;
    label.appendChild(input);
    label.appendChild(document.createTextNode(labelText));
    $("periodQuestion").appendChild(label);
  });
  const otherLabel = document.createElement("label");
  otherLabel.className = "block-label other-period-label";
  otherLabel.textContent = "Other period detail";
  const otherInput = document.createElement("input");
  otherInput.name = "preferredPeriodOther";
  otherInput.type = "text";
  otherInput.placeholder = "Please specify";
  otherLabel.appendChild(otherInput);
  $("periodQuestion").appendChild(otherLabel);
  TEACHER_QUESTIONS.forEach((q, i) => {
    let item;
    if (q.textareaOnly) {
      item = document.createElement("div");
      item.className = "question-item teacher-question";
      const title = document.createElement("div");
      title.className = "question-title";
      title.textContent = `(${i + 10}) ${q.text}`;
      const label = document.createElement("label");
      label.className = "block-label";
      const textarea = document.createElement("textarea");
      textarea.name = q.name;
      textarea.rows = 5;
      label.appendChild(textarea);
      item.appendChild(title);
      item.appendChild(label);
    } else {
      item = makeRatingQuestion(q.text, `teacher_${i + 1}`, false, `(${i + 10}) `);
      item.classList.add("teacher-question");
      appendSubQuestions(item, q.sub);
    }
    $("teacherQuestions").appendChild(item);
  });
}
function setRequiredIn(containerSelector, required) {
  document.querySelectorAll(`${containerSelector} input, ${containerSelector} textarea, ${containerSelector} select`).forEach((input) => {
    if (input.type !== "hidden") input.required = required;
  });
}
function toggleConditionalBlocks() {
  const position = $("position").value;
  const isTeacher = position === "Teacher";
  const isOther = position === "Other";
  $("teacherOnlyBlock").hidden = !isTeacher;
  setRequiredIn("#teacherOnlyBlock", isTeacher);
  $("otherPositionLabel").hidden = !isOther;
  $("positionOther").required = isOther;
  document.querySelectorAll(".teacher-program-question input").forEach((input) => { input.required = isTeacher && !input.closest(".program-question").hidden; });
  updateDynamicQuestionnaire();
}
function syncCountryFromSchool() {
  const selected = SCHOOLS.find((item) => item.school === $("inputSchool").value);
  if (selected && selected.country !== "Other") $("inputCountry").value = selected.country;
  applyCertificateText();
}
function collectParticipantData() {
  const fd = new FormData($("participantForm"));
  return {
    submissionId,
    submittedAtClient: new Date().toISOString(),
    event: "SKYSEF 2026",
    name: fd.get("name") || "",
    school: fd.get("school") || "",
    country: fd.get("country") || "",
    position: fd.get("position") || "",
    positionOther: fd.get("positionOther") || "",
    email: fd.get("email") || "",
    accommodationUse: fd.get("accommodationUse") || "",
    participationStart: fd.get("participationStart") || "",
    participationEnd: fd.get("participationEnd") || "",
    participationPeriodText: getParticipationPeriodText()
  };
}
function collectQuestionnaireData() {
  const fd = new FormData($("surveyForm"));
  const data = {
    liked_1: fd.get("liked_1") || "",
    liked_2: fd.get("liked_2") || "",
    liked_3: fd.get("liked_3") || "",
    improved_1: fd.get("improved_1") || "",
    improved_2: fd.get("improved_2") || "",
    improved_3: fd.get("improved_3") || "",
    inspired_by: fd.get("inspired_by") || "",
    inspired_how: fd.get("inspired_how") || "",
    communication_reason: fd.get("communication_reason") || "",
    presentation_reason: fd.get("presentation_reason") || "",
    preferredPeriod: fd.get("preferredPeriod") || "",
    preferredPeriodOther: fd.get("preferredPeriodOther") || "",
    teacher_performance_reason: fd.get("teacher_performance_reason") || "",
    teacher_emphasis: fd.get("teacher_emphasis") || "",
    comments: fd.get("comments") || ""
  };
  PROGRAM_QUESTIONS.forEach((q, i) => {
    data[`program_${i + 1}_question`] = q.text;
    data[`program_${i + 1}_score`] = fd.get(`program_${i + 1}`) || "";
  });
  LEARNING_QUESTIONS.forEach((q, i) => {
    data[`learning_${i + 1}_question`] = q.text;
    data[`learning_${i + 1}_score`] = fd.get(`learning_${i + 1}`) || "";
  });
  data.teacher_1_question = TEACHER_QUESTIONS[0].text;
  data.teacher_1_score = fd.get("teacher_1") || "";
  return data;
}
function collectFullData() {
  return { ...(participantDataSnapshot || collectParticipantData()), ...collectQuestionnaireData() };
}
async function postWithRetry(data, attempts = 4) {
  if (!SURVEY_ENDPOINT) throw new Error("SURVEY_ENDPOINT is not configured.");
  let lastError = null;
  for (let i = 0; i < attempts; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 65000);
      const response = await fetch(SURVEY_ENDPOINT, {
        method: "POST",
        redirect: "follow",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(data),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const text = await response.text();
      let json;
      try { json = JSON.parse(text); } catch (e) { throw new Error(`Server did not return JSON: ${text.slice(0, 120)}`); }
      if (!response.ok || !json.ok) throw new Error(json.error || `Server error: ${response.status}`);
      return json;
    } catch (error) {
      lastError = error;
      const wait = Math.min(12000, 1000 * Math.pow(1.8, i));
      await new Promise((resolve) => setTimeout(resolve, wait));
    }
  }
  throw lastError;
}
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
function waitForImages(root) {
  const images = Array.from(root.querySelectorAll("img"));
  return Promise.all(images.map((img) => {
    if (img.complete && img.naturalWidth > 0) return Promise.resolve();
    return new Promise((resolve) => {
      img.onload = resolve;
      img.onerror = resolve;
    });
  }));
}
function setDownloadReadyState(ready) {
  const button = $("downloadPdfButton");
  if (!button) return;
  button.disabled = !ready;
  button.textContent = ready ? "Download PDF" : "Preparing PDF...";
}
async function generatePdfInBrowser() {
  if (!window.html2canvas || !window.jspdf || !window.jspdf.jsPDF) {
    throw new Error("PDF libraries are still loading. Please wait a moment.");
  }
  applyCertificateText();
  const source = $("certificatePage");
  const clone = source.cloneNode(true);
  clone.id = "certificatePageForPdf";
  clone.classList.add("pdf-render");
  clone.style.width = "210mm";
  clone.style.height = "297mm";
  clone.style.maxWidth = "none";
  clone.style.transform = "none";
  const holder = document.createElement("div");
  holder.className = "pdf-render-host";
  holder.style.position = "fixed";
  holder.style.left = "-10000px";
  holder.style.top = "0";
  holder.style.width = "210mm";
  holder.style.height = "297mm";
  holder.style.background = "#ffffff";
  holder.appendChild(clone);
  document.body.appendChild(holder);
  await waitForImages(holder);
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  const canvas = await html2canvas(clone, {
    scale: Math.min(2.4, window.devicePixelRatio || 2),
    backgroundColor: "#ffffff",
    useCORS: true,
    allowTaint: true,
    logging: false
  });
  holder.remove();
  const imgData = canvas.toDataURL("image/jpeg", 0.96);
  const pdf = new window.jspdf.jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
  pdf.addImage(imgData, "JPEG", 0, 0, 210, 297);
  const fileName = `SKYSEF2026_Certificate_${sanitizeFileName(participantDataSnapshot.name)}_${sanitizeFileName(participantDataSnapshot.participationPeriodText)}.pdf`;
  const blob = pdf.output("blob");
  return { blob, fileName, mimeType: "application/pdf" };
}
async function uploadPdfToDrive(pdf) {
  const pdfBase64 = await blobToBase64(pdf.blob);
  return postWithRetry({
    ...participantDataSnapshot,
    mode: "uploadPdf",
    pdfBase64,
    fileName: pdf.fileName,
    mimeType: pdf.mimeType
  }, 3);
}
function startBackgroundPdf() {
  latestPdf = null;
  setDownloadReadyState(false);
  pdfPromise = generatePdfInBrowser()
    .then((pdf) => {
      latestPdf = { ...pdf, url: URL.createObjectURL(pdf.blob) };
      setDownloadReadyState(true);
      if ($("pdfStatus")) $("pdfStatus").textContent = "PDF is ready.";
      uploadPromise = uploadPdfToDrive(pdf).catch((error) => {
        console.error(error);
        if ($("pdfStatus")) $("pdfStatus").textContent = "PDF is ready in this browser. Drive upload is still retrying.";
        throw error;
      });
      return pdf;
    })
    .catch((error) => {
      console.error(error);
      setStatus("participantStatus", `Certificate PDF preparation is delayed: ${error.message}`, "error");
      if ($("pdfStatus")) $("pdfStatus").textContent = `PDF preparation is delayed: ${error.message}`;
      throw error;
    });
}
function showView(viewId) {
  ["participantView", "questionnaireView", "certificateView", "adminView"].forEach((id) => {
    const el = $(id);
    const active = id === viewId;
    el.hidden = !active;
    el.classList.toggle("is-active", active);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function showQuestionnaireView() {
  showView("questionnaireView");
  history.replaceState(null, "", "#questionnaire");
}
function showCertificateView() {
  applyCertificateText();
  showView("certificateView");
  history.replaceState(null, "", "#certificate");
}
function setButtonBusy(button, busy, busyText, normalText) {
  button.disabled = busy;
  button.textContent = busy ? busyText : normalText;
}
async function handleNext(event) {
  event.preventDefault();
  if (!$("participantForm").reportValidity()) {
    setStatus("participantStatus", "Please complete the required fields.", "error");
    return;
  }
  submissionId = submissionId || makeSubmissionId();
  participantDataSnapshot = collectParticipantData();
  applyCertificateText();
  updateDynamicQuestionnaire();
  setButtonBusy($("nextButton"), true, "Preparing certificate...", "Next");
  setStatus("participantStatus", "Preparing the certificate in the background. You can proceed to the questionnaire.", "ok");
  startBackgroundPdf();
  setTimeout(() => {
    setButtonBusy($("nextButton"), false, "Preparing certificate...", "Next");
    showQuestionnaireView();
  }, 250);
}
async function handleSubmit(event) {
  event.preventDefault();
  if (!$("surveyForm").reportValidity()) {
    setStatus("submitStatus", "Please complete the required fields.", "error");
    return;
  }
  setButtonBusy($("submitButton"), true, "Submitting...", "Submit");
  const data = collectFullData();
  showCertificateView();
  setDownloadReadyState(!!(latestPdf && latestPdf.blob));
  $("pdfStatus").textContent = latestPdf ? "PDF is ready." : "Preparing the PDF in this browser.";
  recordPromise = postWithRetry({ ...data, mode: "recordOnly" }, 5)
    .then(() => {
      $("pdfStatus").textContent = latestPdf ? "Response recorded. PDF is ready." : "Response recorded. Preparing the PDF in this browser.";
      return true;
    })
    .catch((error) => {
      console.error(error);
      $("pdfStatus").textContent = `The certificate is available in this browser, but questionnaire recording failed: ${error.message}. Please contact SKYSEF staff.`;
      return false;
    });
  if (!latestPdf && pdfPromise) {
    pdfPromise.then(() => {
      setDownloadReadyState(true);
      $("pdfStatus").textContent = "PDF is ready.";
    }).catch((error) => {
      $("pdfStatus").textContent = `PDF preparation is delayed: ${error.message}`;
    });
  }
  setButtonBusy($("submitButton"), false, "Submitting...", "Submit");
}

function csvLinesToSchools(text) {
  return String(text || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
    const parts = line.split(",");
    return { school: (parts[0] || "").trim(), country: (parts.slice(1).join(",") || "Other").trim() || "Other" };
  }).filter((item) => item.school);
}
function schoolsToCsvLines(list) {
  return (list || []).map((item) => `${item.school}, ${item.country || "Other"}`).join("\n");
}
function fallbackDateParts(value) {
  const m = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return { label: String(value || ""), short: String(value || "") };
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const monthShort = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."];
  const y = m[1];
  const mo = Number(m[2]);
  const d = String(Number(m[3]));
  return { label: `${monthNames[mo - 1]} ${d}, ${y}`, short: `${monthShort[mo - 1]} ${d}` };
}
function normalizeEventDateItem(item) {
  const value = String(item && item.value ? item.value : "").trim();
  const fallback = fallbackDateParts(value);
  let label = String(item && item.label ? item.label : fallback.label).trim();
  let short = String(item && item.short ? item.short : fallback.short).trim();
  if (/^\d{4}$/.test(short) || !short || short === label) short = fallback.short;
  if (!/,\s*\d{4}$/.test(label) && /^\d{4}-\d{2}-\d{2}$/.test(value)) label = fallback.label;
  return { ...item, value, label, short };
}
function csvLinesToEventDates(text) {
  return String(text || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
    const parts = line.split(",").map((p) => p.trim());
    const value = parts.shift() || "";
    const short = parts.length > 1 ? parts.pop() : "";
    const label = parts.join(", ") || "";
    return normalizeEventDateItem({ value, label, short });
  }).filter((item) => item.value);
}
function eventDatesToCsvLines(list) {
  return (list || []).map((item) => `${item.value}, ${item.label}, ${item.short}`).join("\n");
}
function optionsToLines(list) { return (list || []).join("\n"); }
function linesToOptions(text) { return String(text || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean); }
function rebuildInteractiveContent() {
  renderSelectOptions();
  renderTimelineTabs();
  renderQuestions();
  applyCertificateText();
  toggleConditionalBlocks();
}
async function loadRemoteConfig() {
  try {
    const json = await postWithRetry({ mode: "getConfig", adminPassword: "" }, 2);
    if (json && json.ok && json.config) {
      applyRemoteConfig(json.config);
      remoteConfigLoaded = true;
    }
  } catch (error) {
    console.warn("Remote config could not be loaded. Using bundled defaults.", error);
  }
}
function applyRemoteConfig(config) {
  if (!config || typeof config !== "object") return;
  if (Array.isArray(config.schools) && config.schools.length) SCHOOLS = config.schools;
  if (Array.isArray(config.countries) && config.countries.length) COUNTRIES = config.countries;
  if (Array.isArray(config.eventDates) && config.eventDates.length) EVENT_DATES = config.eventDates.map(normalizeEventDateItem);
  if (config.timeline && typeof config.timeline === "object") {
    const hasRows = Object.keys(config.timeline).some((key) => Array.isArray(config.timeline[key]) && config.timeline[key].length);
    if (hasRows) TIMELINE = config.timeline;
  }
  if (Array.isArray(config.programQuestions) && config.programQuestions.length) PROGRAM_QUESTIONS = config.programQuestions;
  if (Array.isArray(config.itemExtraOptions) && config.itemExtraOptions.length) ITEM_EXTRA_OPTIONS = config.itemExtraOptions;
  if (Array.isArray(config.periodOptions) && config.periodOptions.length) PERIOD_OPTIONS = config.periodOptions;
}
function fillAdminEditor(config = null) {
  const c = config || {
    eventName: "SKYSEF 2026",
    organizerName: "Shizuoka Kita Junior and Senior High School",
    schools: SCHOOLS,
    eventDates: EVENT_DATES,
    timeline: TIMELINE,
    programQuestions: PROGRAM_QUESTIONS,
    itemExtraOptions: ITEM_EXTRA_OPTIONS
  };
  $("adminEventName").value = c.eventName || "SKYSEF 2026";
  $("adminOrganizerName").value = c.organizerName || "Shizuoka Kita Junior and Senior High School";
  $("adminSchools").value = schoolsToCsvLines(c.schools || SCHOOLS);
  $("adminEventDates").value = eventDatesToCsvLines(c.eventDates || EVENT_DATES);
  $("adminTimeline").value = JSON.stringify(c.timeline || TIMELINE, null, 2);
  $("adminProgramQuestions").value = JSON.stringify(c.programQuestions || PROGRAM_QUESTIONS, null, 2);
  $("adminItemOptions").value = optionsToLines(c.itemExtraOptions || ITEM_EXTRA_OPTIONS);
}
function collectAdminConfig() {
  return {
    eventName: $("adminEventName").value.trim() || "SKYSEF 2026",
    organizerName: $("adminOrganizerName").value.trim() || "Shizuoka Kita Junior and Senior High School",
    schools: csvLinesToSchools($("adminSchools").value),
    countries: Array.from(new Set(csvLinesToSchools($("adminSchools").value).map((item) => item.country).filter(Boolean).concat(["Other"]))),
    eventDates: csvLinesToEventDates($("adminEventDates").value),
    timeline: JSON.parse($("adminTimeline").value || "{}"),
    programQuestions: JSON.parse($("adminProgramQuestions").value || "[]"),
    itemExtraOptions: linesToOptions($("adminItemOptions").value)
  };
}
let adminUnlocked = false;

async function openAdminEditor(password) {
  if (password !== ADMIN_PASSWORD_CLIENT) {
    setStatus("adminLoginStatus", "Incorrect password.", "error");
    return false;
  }
  adminUnlocked = true;
  $("adminPassword").value = password;
  $("adminLoginForm").hidden = true;
  $("adminEditorForm").hidden = false;
  setStatus("adminSaveStatus", "Loading admin data...", "ok");
  try {
    const json = await postWithRetry({ mode: "getConfig", adminPassword: password }, 2);
    const config = json.config || {};
    applyRemoteConfig(config);
    fillAdminEditor(config);
    rebuildInteractiveContent();
    setStatus("adminSaveStatus", "Admin editor opened.", "ok");
  } catch (error) {
    fillAdminEditor();
    setStatus("adminSaveStatus", `Admin editor opened with bundled data. ${error.message}`, "error");
  }
  return true;
}
async function handleAdminLogin(event) {
  event.preventDefault();
  await openAdminEditor($("adminPassword").value);
}

async function requestAdminAccess() {
  if (adminUnlocked) {
    showView("adminView");
    history.replaceState(null, "", "#admin");
    return true;
  }

  const password = window.prompt("Admin password");

  if (password === null) {
    history.replaceState(null, "", location.pathname + location.search);
    showView("participantView");
    return false;
  }

  if (password !== ADMIN_PASSWORD_CLIENT) {
    window.alert("Incorrect password.");
    history.replaceState(null, "", location.pathname + location.search);
    showView("participantView");
    return false;
  }

  // Do not reveal the admin screen before the password has been checked.
  await openAdminEditor(password);
  showView("adminView");
  history.replaceState(null, "", "#admin");
  return true;
}
async function handleAdminSave(event) {
  event.preventDefault();
  const password = $("adminPassword").value;
  if (password !== ADMIN_PASSWORD_CLIENT) {
    setStatus("adminSaveStatus", "Incorrect password.", "error");
    return;
  }
  let config;
  try {
    config = collectAdminConfig();
  } catch (error) {
    setStatus("adminSaveStatus", `Invalid JSON: ${error.message}`, "error");
    return;
  }
  setButtonBusy($("adminSaveButton"), true, "Saving...", "Save settings");
  try {
    const json = await postWithRetry({ mode: "updateConfig", adminPassword: password, config }, 3);
    applyRemoteConfig(json.config || config);
    rebuildInteractiveContent();
    setStatus("adminSaveStatus", "Settings saved to the spreadsheet database.", "ok");
  } catch (error) {
    setStatus("adminSaveStatus", `Save failed: ${error.message}`, "error");
  } finally {
    setButtonBusy($("adminSaveButton"), false, "Saving...", "Save settings");
  }
}
async function handleAdminReload() {
  const password = $("adminPassword").value;
  setStatus("adminSaveStatus", "Reloading...", "ok");
  try {
    const json = await postWithRetry({ mode: "getConfig", adminPassword: password }, 2);
    applyRemoteConfig(json.config || {});
    fillAdminEditor(json.config || {});
    rebuildInteractiveContent();
    setStatus("adminSaveStatus", "Reloaded from the spreadsheet database.", "ok");
  } catch (error) {
    setStatus("adminSaveStatus", `Reload failed: ${error.message}`, "error");
  }
}

function showAdminView() {
  requestAdminAccess();
}
function routeByHash() {
  if (location.hash === "#admin") requestAdminAccess();
}
async function init() {
  renderSelectOptions();
  renderTimelineTabs();
  renderQuestions();
  applyCertificateText();
  toggleConditionalBlocks();
  $("inputName").addEventListener("input", applyCertificateText);
  $("inputSchool").addEventListener("change", syncCountryFromSchool);
  $("inputCountry").addEventListener("change", applyCertificateText);
  $("position").addEventListener("change", toggleConditionalBlocks);
  $("accommodationUse").addEventListener("change", updateDynamicQuestionnaire);
  $("participationStart").addEventListener("change", updatePeriodPreview);
  $("participationEnd").addEventListener("change", updatePeriodPreview);
  $("downloadPdfButton").addEventListener("click", downloadLatestPdf);
  $("backToQuestionnaireButton").addEventListener("click", showQuestionnaireView);
  $("participantForm").addEventListener("submit", handleNext);
  $("surveyForm").addEventListener("submit", handleSubmit);
  $("adminNavLink").addEventListener("click", (event) => { event.preventDefault(); requestAdminAccess(); });
  $("adminLoginForm").addEventListener("submit", handleAdminLogin);
  $("adminEditorForm").addEventListener("submit", handleAdminSave);
  $("adminReloadButton").addEventListener("click", handleAdminReload);
  window.addEventListener("hashchange", routeByHash);
  if (location.hash === "#admin") requestAdminAccess(); else showView("participantView");
  loadRemoteConfig().then(() => {
    rebuildInteractiveContent();
    if (location.hash === "#admin" && adminUnlocked) fillAdminEditor();
  }).catch((error) => console.warn("Remote config load failed.", error));
}
window.SKYSEFShowAdmin = requestAdminAccess;
document.addEventListener("DOMContentLoaded", init);
