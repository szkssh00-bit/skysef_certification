/*
  SKYSEF questionnaire -> Apps Script -> PDF -> certificate screen.
  - No html2canvas.
  - No print dialog.
  - The page transitions only after the server confirms that the response was recorded and the PDF was generated.
  - The PDF is returned as base64 for private download and is also saved in the configured Google Drive folder by Apps Script.
*/
const SURVEY_ENDPOINT = ""; // Paste your deployed Apps Script Web App URL here.

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
const PROGRAM_QUESTIONS = [
  "Opening Ceremony (Jul. 30)",
  "Keynote Address (Jul. 30)",
  "Welcome Dinner (Jul. 30)",
  "Cultural Performance (Jul. 30, Aug. 2)",
  "Poster Session (Jul. 31)",
  "Oral Presentation (Jul. 31)",
  "International Joint Project (Aug. 1 and Aug. 2)",
  "For teacher, guided tour (Aug. 1)",
  "For teacher, Teachers’ Session (Aug. 1)",
  "Commendation Ceremony (Aug. 2)",
  "Closing Ceremony (Aug. 2)",
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
  { text: "FOR TEACHERS: What would you like to put an emphasis on in order for your student to demonstrate their abilities in science in an international science conference like SKYSEF 2025?", textareaOnly: true, name: "teacher_emphasis" }
];

let latestPdf = null; // {base64, fileName, mimeType}
const $ = (id) => document.getElementById(id);

function safeText(value, fallback) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  return text || fallback;
}
function makeSubmissionId() {
  const rand = new Uint32Array(2);
  crypto.getRandomValues(rand);
  return `skysef-${Date.now()}-${Array.from(rand).map((v) => v.toString(16)).join("")}`;
}
function sanitizeFileName(text) {
  return String(text || "certificate").normalize("NFKC").replace(/[\\/:*?"<>|]/g, "_").replace(/\s+/g, "_").slice(0, 80);
}
function setStatus(message, type = "") {
  const el = $("submitStatus");
  el.className = `submit-status ${type}`.trim();
  el.textContent = message || "";
}
function applyCertificateText() {
  $("name").textContent = safeText($("inputName").value, "Name");
  $("school").textContent = safeText($("inputSchool").value, "School");
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
  a.download = latestPdf.fileName || `SKYSEF2025_Certificate_${sanitizeFileName($("inputName").value)}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
  $("pdfStatus").textContent = "PDF download started. Please check your browser download list.";
}
function openLatestPdf() {
  if (!latestPdf || !latestPdf.base64) {
    $("pdfStatus").textContent = "PDF data is not available. Please submit the questionnaire again.";
    return;
  }
  const blob = base64ToBlob(latestPdf.base64, latestPdf.mimeType || "application/pdf");
  const url = URL.createObjectURL(blob);
  const opened = window.open(url, "_blank", "noopener,noreferrer");
  if (!opened) {
    $("pdfStatus").textContent = "The browser blocked the PDF tab. Please use Download PDF again.";
  } else {
    $("pdfStatus").textContent = "PDF opened in a new tab. Use the browser share or download button to save it.";
  }
  setTimeout(() => URL.revokeObjectURL(url), 120000);
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
    const isTeacherOnly = i === 7 || i === 8;
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
    event: "SKYSEF 2025",
    name: fd.get("name") || "",
    school: fd.get("school") || "",
    country: fd.get("country") || "",
    position: fd.get("position") || "",
    positionOther: fd.get("positionOther") || "",
    email: fd.get("email") || "",
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
async function postWithRetry(data, attempts = 4) {
  if (!SURVEY_ENDPOINT) {
    throw new Error("SURVEY_ENDPOINT is not configured. Paste the deployed Apps Script Web App URL into public/assets/survey-certificate.js.");
  }
  let lastError = null;
  for (let i = 0; i < attempts; i++) {
    try {
      const response = await fetch(SURVEY_ENDPOINT, {
        method: "POST",
        redirect: "follow",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(data)
      });
      const text = await response.text();
      let json;
      try { json = JSON.parse(text); } catch (e) { throw new Error(`Server did not return JSON: ${text.slice(0, 120)}`); }
      if (!response.ok || !json.ok) throw new Error(json.error || `Server error: ${response.status}`);
      return json;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 900 * Math.pow(2, i)));
    }
  }
  throw lastError;
}
function showCertificateView(serverResult) {
  applyCertificateText();
  latestPdf = {
    base64: serverResult.pdfBase64,
    fileName: serverResult.fileName || `SKYSEF2025_Certificate_${sanitizeFileName($("inputName").value)}.pdf`,
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
  renderQuestions();
  applyCertificateText();
  toggleConditionalBlocks();
  $("inputName").addEventListener("input", applyCertificateText);
  $("inputSchool").addEventListener("change", syncCountryFromSchool);
  $("position").addEventListener("change", toggleConditionalBlocks);
  $("downloadPdfButton").addEventListener("click", downloadLatestPdf);
  $("openPdfButton").addEventListener("click", openLatestPdf);
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
