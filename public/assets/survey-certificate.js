/* SKYSEF questionnaire -> Apps Script -> private PDF. */
const SURVEY_ENDPOINT = "https://script.google.com/macros/s/AKfycbyktwUSn6GrAK-UBxM6IUzkJQN99Q6G8ALYLr6M_vuhBW0zen9oMV0jcD4sQRWM0eM/exec";

const SCHOOLS = [
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
const COUNTRIES = ["Australia", "Guam", "Indonesia", "Japan", "Macau", "Taiwan", "Thailand", "Other"];
const EVENT_DATES = [
  { value: "2026-08-02", label: "August 2, 2026", short: "Aug. 2" },
  { value: "2026-08-03", label: "August 3, 2026", short: "Aug. 3" },
  { value: "2026-08-04", label: "August 4, 2026", short: "Aug. 4" },
  { value: "2026-08-05", label: "August 5, 2026", short: "Aug. 5" }
];
const TIMELINE = {
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
const PROGRAM_QUESTIONS = [
  "Opening Ceremony (Aug. 2)",
  "Keynote Address (Aug. 2)",
  "Welcome Reception / Cultural Performance I (Aug. 2)",
  "Cultural Performance II (Aug. 5)",
  "Poster Session (Aug. 3)",
  "Oral Presentation (Aug. 3)",
  "International Joint Project (Aug. 4 and Aug. 5)",
  "For teachers: Guided Tour (Aug. 4)",
  "For teachers: Teachers’ Session (Aug. 4)",
  "Commendation Ceremony (Aug. 5)",
  "Closing Ceremony (Aug. 5)",
  "Accommodation / Home Stay",
  "Transportation",
  "Schedule"
];
const LEARNING_QUESTIONS = [
  { text: "I was inspired to engage more in the discussion.", sub: [
    { name: "inspired_by", label: "Whom were you inspired by?" },
    { name: "inspired_how", label: "How were you inspired?" }
  ] },
  { text: "My communication with the other participating students was satisfactory.", sub: [{ name: "communication_reason", label: "Why do you feel so?" }] },
  { text: "My presentation(s) was/were satisfactory.", sub: [{ name: "presentation_reason", label: "Why do you feel so?" }] },
  { text: "I gained the friendship with the other participating students that would last long.", sub: [] },
  { text: "I had a chance to think about the relationship between science and the society.", sub: [] },
  { text: "I would like to keep thinking about the relationship between science and the society.", sub: [] },
  { text: "I would like to learn English expression of scientific items more.", sub: [] },
  { text: "I would like to acquire scientific skills and abilities to participate in the scientific activities in an international setting.", sub: [] }
];
const PERIOD_OPTIONS = ["The bottom of July", "The top of August", "The bottom of August", "Other period"];
const TEACHER_QUESTIONS = [
  { text: "FOR TEACHERS: The performance of my students is satisfactory.", sub: [{ name: "teacher_performance_reason", label: "How was it satisfactory?" }] },
  { text: "FOR TEACHERS: What would you like to put an emphasis on in order for your student to demonstrate their abilities in science in an international science conference like SKYSEF 2026?", textareaOnly: true, name: "teacher_emphasis" }
];

let latestPdf = null;
const $ = (id) => document.getElementById(id);

function safeText(value, fallback) { return String(value || "").replace(/\s+/g, " ").trim() || fallback; }
function makeSubmissionId() {
  const rand = new Uint32Array(2);
  crypto.getRandomValues(rand);
  return `skysef-${Date.now()}-${Array.from(rand).map((v) => v.toString(16)).join("")}`;
}
function sanitizeFileName(text) { return String(text || "certificate").normalize("NFKC").replace(/[\\/:*?"<>|]/g, "_").replace(/\s+/g, "_").slice(0, 80); }
function setStatus(message, type = "") {
  const el = $("submitStatus");
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
  // Before the event, keep all dates selectable so that administrators can test the form.
  return EVENT_DATES.filter((d) => d.value <= upper);
}
function getParticipationPeriodText() {
  const start = $("participationStart").value;
  const end = $("participationEnd").value;
  if (!start || !end) return "August 2 to 5, 2026";
  if (start === end) return selectedDateLabel(start);
  return `${selectedDateShort(start)} to ${selectedDateShort(end)}, 2026`;
}
function updatePeriodPreview() {
  const start = $("participationStart").value;
  const end = $("participationEnd").value;
  if (start && end && start > end) {
    $("participationEnd").value = start;
  }
  const text = getParticipationPeriodText();
  $("certificatePeriodPreview").textContent = `Certificate text: held from ${text}`;
  $("certificateDescription").innerHTML = `for participating in the Shizuoka Kita Youth Science Engineering Forum 2026,<br>held from ${text},<br>hosted and organized by Shizuoka Kita Junior and Senior High School`;
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
  if (!latestPdf || !latestPdf.base64) {
    $("pdfStatus").textContent = "PDF data is not available. Please submit the questionnaire again.";
    return;
  }
  const blob = base64ToBlob(latestPdf.base64, latestPdf.mimeType || "application/pdf");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = latestPdf.fileName || `SKYSEF2026_Certificate_${sanitizeFileName($("inputName").value)}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
  $("pdfStatus").textContent = "PDF download started. Please check your browser download list.";
}
function renderSelectOptions() {
  const schoolSelect = $("inputSchool");
  SCHOOLS.forEach(({ school }) => {
    const option = document.createElement("option");
    option.value = school;
    option.textContent = school;
    schoolSelect.appendChild(option);
  });
  const countrySelect = $("inputCountry");
  COUNTRIES.forEach((country) => {
    const option = document.createElement("option");
    option.value = country;
    option.textContent = country;
    countrySelect.appendChild(option);
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
function renderTimeline(dateValue = "2026-08-02") {
  const panel = $("timelinePanel");
  const rows = TIMELINE[dateValue] || [];
  panel.innerHTML = `<table><thead><tr><th>Time</th><th>Program</th><th>Venue</th></tr></thead><tbody>${rows.map((row) => `<tr><td>${row[0]}</td><td>${row[1]}</td><td>${row[2]}</td></tr>`).join("")}</tbody></table>`;
  document.querySelectorAll(".timeline-tab").forEach((button) => button.classList.toggle("is-active", button.dataset.date === dateValue));
}
function renderTimelineTabs() {
  const tabs = $("timelineTabs");
  EVENT_DATES.forEach((d) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "timeline-tab";
    button.dataset.date = d.value;
    button.textContent = d.short;
    button.addEventListener("click", () => renderTimeline(d.value));
    tabs.appendChild(button);
  });
  renderTimeline("2026-08-02");
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
  PROGRAM_QUESTIONS.forEach((q, i) => {
    const isTeacherOnly = q.toLowerCase().includes("for teachers");
    const item = makeRatingQuestion(q, `program_${i + 1}`, !isTeacherOnly, `(${i + 1}) `);
    if (isTeacherOnly) item.classList.add("teacher-program-question");
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
  document.querySelectorAll(".teacher-program-question input").forEach((input) => { input.required = isTeacher; });
}
function syncCountryFromSchool() {
  const selected = SCHOOLS.find((item) => item.school === $("inputSchool").value);
  if (selected && selected.country !== "Other") $("inputCountry").value = selected.country;
  applyCertificateText();
}
function collectFormData() {
  const fd = new FormData($("surveyForm"));
  const data = {
    submissionId: makeSubmissionId(),
    submittedAtClient: new Date().toISOString(),
    event: "SKYSEF 2026",
    name: fd.get("name") || "",
    school: fd.get("school") || "",
    country: fd.get("country") || "",
    position: fd.get("position") || "",
    positionOther: fd.get("positionOther") || "",
    email: fd.get("email") || "",
    participationStart: fd.get("participationStart") || "",
    participationEnd: fd.get("participationEnd") || "",
    participationPeriodText: getParticipationPeriodText(),
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
    data[`program_${i + 1}_question`] = q;
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
async function postWithRetry(data, attempts = 5) {
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
      if (!response.ok || !json.ok) {
        const message = json.error || `Server error: ${response.status}`;
        const err = new Error(message);
        err.retryable = json.retryable !== false;
        throw err;
      }
      return json;
    } catch (error) {
      lastError = error;
      const wait = Math.min(12000, 1000 * Math.pow(1.8, i));
      await new Promise((resolve) => setTimeout(resolve, wait));
    }
  }
  throw lastError;
}
function showCertificateView(serverResult) {
  applyCertificateText();
  latestPdf = {
    base64: serverResult.pdfBase64,
    fileName: serverResult.fileName || `SKYSEF2026_Certificate_${sanitizeFileName($("inputName").value)}.pdf`,
    mimeType: serverResult.mimeType || "application/pdf"
  };
  $("questionnaireView").hidden = true;
  $("questionnaireView").classList.remove("is-active");
  $("certificateView").hidden = false;
  $("certificateView").classList.add("is-active");
  $("pdfStatus").textContent = serverResult.driveFileId ? "PDF was generated and saved privately to Drive." : "PDF was generated.";
  window.scrollTo({ top: 0, behavior: "smooth" });
  history.replaceState(null, "", "#certificate");
  setTimeout(downloadLatestPdf, 250);
}
function showQuestionnaireView() {
  $("certificateView").hidden = true;
  $("certificateView").classList.remove("is-active");
  $("questionnaireView").hidden = false;
  $("questionnaireView").classList.add("is-active");
  window.scrollTo({ top: 0, behavior: "smooth" });
  history.replaceState(null, "", window.location.pathname + window.location.search);
}
function setSubmitting(isSubmitting) {
  const button = $("submitButton");
  button.disabled = isSubmitting;
  button.textContent = isSubmitting ? "Recording and creating PDF..." : "Submit and create PDF";
  document.querySelectorAll("#surveyForm input, #surveyForm select, #surveyForm textarea, #surveyForm button").forEach((el) => {
    if (el.id !== "submitButton") el.disabled = isSubmitting;
  });
}
function init() {
  renderSelectOptions();
  renderTimelineTabs();
  renderQuestions();
  applyCertificateText();
  toggleConditionalBlocks();
  $("inputName").addEventListener("input", applyCertificateText);
  $("inputSchool").addEventListener("change", syncCountryFromSchool);
  $("position").addEventListener("change", toggleConditionalBlocks);
  $("participationStart").addEventListener("change", updatePeriodPreview);
  $("participationEnd").addEventListener("change", updatePeriodPreview);
  $("downloadPdfButton").addEventListener("click", downloadLatestPdf);
  $("backToFormButton").addEventListener("click", showQuestionnaireView);
  $("surveyForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) {
      setStatus("Please complete the required fields.", "error");
      return;
    }
    applyCertificateText();
    const data = collectFormData();
    setSubmitting(true);
    setStatus("Submitting your response and generating your private PDF. Please do not close this page.");
    try {
      const result = await postWithRetry(data);
      setStatus("Completed. Moving to your certificate page...", "ok");
      showCertificateView(result);
    } catch (error) {
      console.error(error);
      setStatus(`Submission failed: ${error.message}. Your response has not been accepted yet. Please try again.`, "error");
    } finally {
      setSubmitting(false);
    }
  });
  showQuestionnaireView();
}
document.addEventListener("DOMContentLoaded", init);
