/*
  SKYSEF questionnaire and certificate generator.
  Privacy by design:
  - The certificate PDF is generated on the participant's browser.
  - The PDF is not uploaded to GitHub Pages.
  - Other participants cannot see or download the generated PDF from this site.
  - If SURVEY_ENDPOINT is configured, only questionnaire data are sent to that private endpoint.
*/
const SURVEY_ENDPOINT = ""; // Example: "https://script.google.com/macros/s/XXXXX/exec"

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
  {
    text: "I was inspired to engage more in the discussion.",
    sub: [
      { name: "inspired_by", label: "Whom were you inspired by?" },
      { name: "inspired_how", label: "How were you inspired?" }
    ]
  },
  {
    text: "My communication with the other participating students was satisfactory.",
    sub: [{ name: "communication_reason", label: "Why do you feel so?" }]
  },
  {
    text: "My presentation(s) was/were satisfactory.",
    sub: [{ name: "presentation_reason", label: "Why do you feel so?" }]
  },
  { text: "I gained the friendship with the other participating students that would last long.", sub: [] },
  { text: "I had a chance to think about the relationship between science and the society.", sub: [] },
  { text: "I would like to keep thinking about the relationship between science and the society.", sub: [] },
  { text: "I would like to learn English expression of scientific items more.", sub: [] },
  { text: "I would like to acquire scientific skills and abilities to participate in the scientific activities in an international setting.", sub: [] }
];

const PERIOD_OPTIONS = [
  "The bottom of July",
  "The top of August",
  "The bottom of August",
  "Other period"
];

const TEACHER_QUESTIONS = [
  {
    text: "FOR TEACHERS: The performance of my students is satisfactory.",
    sub: [{ name: "teacher_performance_reason", label: "How was it satisfactory?" }]
  },
  {
    text: "FOR TEACHERS: What would you like to put an emphasis on in order for your student to demonstrate their abilities in science in an international science conference like SKYSEF 2025?",
    textareaOnly: true,
    name: "teacher_emphasis"
  }
];

const $ = (id) => document.getElementById(id);

function safeText(value, fallback) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  return text || fallback;
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
  const programBox = $("programQuestions");
  const learningBox = $("learningQuestions");
  const teacherBox = $("teacherQuestions");
  const periodBox = $("periodQuestion");

  PROGRAM_QUESTIONS.forEach((q, i) => {
    const isTeacherOnly = i === 7 || i === 8;
    const item = makeRatingQuestion(q, `program_${i + 1}`, !isTeacherOnly, `(${i + 1}) `);
    if (isTeacherOnly) item.classList.add("teacher-program-question");
    programBox.appendChild(item);
  });

  LEARNING_QUESTIONS.forEach((q, i) => {
    const item = makeRatingQuestion(q.text, `learning_${i + 1}`, true, `(${i + 1}) `);
    appendSubQuestions(item, q.sub);
    learningBox.appendChild(item);
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
    periodBox.appendChild(label);
  });
  const otherLabel = document.createElement("label");
  otherLabel.className = "block-label other-period-label";
  otherLabel.textContent = "Other period detail";
  const otherInput = document.createElement("input");
  otherInput.name = "preferredPeriodOther";
  otherInput.type = "text";
  otherInput.placeholder = "Please specify";
  otherLabel.appendChild(otherInput);
  periodBox.appendChild(otherLabel);

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
    teacherBox.appendChild(item);
  });
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

function applyCertificateText() {
  const name = safeText($("inputName").value, "Name");
  const school = safeText($("inputSchool").value, "School");
  $("name").textContent = name;
  $("school").textContent = school;
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

  document.querySelectorAll(".teacher-program-question input").forEach((input) => {
    input.required = isTeacher;
  });
}

function syncCountryFromSchool() {
  const selected = SCHOOLS.find((item) => item.school === $("inputSchool").value);
  if (selected && selected.country !== "Other") {
    $("inputCountry").value = selected.country;
  }
  applyCertificateText();
}

function collectFormData() {
  const form = $("surveyForm");
  const fd = new FormData(form);
  const data = {
    submittedAt: new Date().toISOString(),
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

async function sendSurveyData(data) {
  if (!SURVEY_ENDPOINT) return { skipped: true };
  await fetch(SURVEY_ENDPOINT, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(data)
  });
  return { skipped: false };
}

function sanitizeFileName(text) {
  return String(text || "certificate")
    .normalize("NFKC")
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/\s+/g, "_")
    .slice(0, 80);
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function withTimeout(promise, ms, message) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(message || "The operation timed out.")), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

async function waitForImages(root) {
  const images = Array.from(root.querySelectorAll("img"));
  await Promise.all(images.map((img) => {
    if (img.complete && img.naturalWidth > 0) return Promise.resolve();
    return new Promise((resolve) => {
      const done = () => resolve();
      img.onload = done;
      img.onerror = done;
      setTimeout(done, 5000);
    });
  }));
  if (document.fonts && document.fonts.ready) {
    await withTimeout(document.fonts.ready, 5000, "Font loading timed out.").catch(() => {});
  }
}

async function buildPdfBlob() {
  applyCertificateText();
  const page = $("certificatePage");
  if (!window.html2canvas || !window.jspdf) {
    throw new Error("PDF libraries are not loaded. Use Save as PDF instead.");
  }

  document.body.classList.add("pdf-rendering");
  try {
    await waitForImages(page);
    await delay(100);
    const scale = Math.min(2, Math.max(1.5, window.devicePixelRatio || 1.5));
    const canvas = await withTimeout(html2canvas(page, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      scrollX: 0,
      scrollY: 0,
      windowWidth: page.scrollWidth,
      windowHeight: page.scrollHeight
    }), 20000, "PDF image creation took too long.");

    const imageData = canvas.toDataURL("image/jpeg", 0.95);
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
    pdf.addImage(imageData, "JPEG", 0, 0, 210, 297);
    return pdf.output("blob");
  } finally {
    document.body.classList.remove("pdf-rendering");
  }
}

async function withPdfStatus(message, task) {
  const downloadButton = $("downloadPdfButton");
  const openButton = $("openPdfButton");
  const status = $("pdfStatus");
  const oldDownload = downloadButton.textContent;
  const oldOpen = openButton.textContent;
  downloadButton.disabled = true;
  openButton.disabled = true;
  status.textContent = message;
  try {
    return await task();
  } catch (error) {
    console.error(error);
    status.textContent = "Automatic PDF generation did not finish. The browser print/save dialog will open instead. Choose 'Save as PDF' or 'Save to Files'.";
    await delay(400);
    printCertificate();
  } finally {
    downloadButton.disabled = false;
    openButton.disabled = false;
    downloadButton.textContent = oldDownload;
    openButton.textContent = oldOpen;
  }
}

function printCertificate() {
  applyCertificateText();
  $("pdfStatus").textContent = "The print dialog will open. Select 'Save as PDF' on PC, or use Share / Print / Save to Files on a smartphone.";
  document.body.classList.add("print-certificate-only");
  setTimeout(() => {
    window.print();
    setTimeout(() => document.body.classList.remove("print-certificate-only"), 800);
  }, 150);
}

async function downloadCertificatePdf() {
  await withPdfStatus("Generating PDF...", async () => {
    const blob = await buildPdfBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SKYSEF2025_Certificate_${sanitizeFileName($("inputName").value)}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    $("pdfStatus").textContent = "PDF generation completed. Please check your download folder or browser download list.";
  });
}

async function openCertificatePdf() {
  // This button is intentionally print-based because it is more reliable on iPhone / Android than blob downloads.
  printCertificate();
}

function showCertificateView() {
  applyCertificateText();
  $("questionnaireView").hidden = true;
  $("questionnaireView").classList.remove("is-active");
  $("certificateView").hidden = false;
  $("certificateView").classList.add("is-active");
  window.scrollTo({ top: 0, behavior: "smooth" });
  history.replaceState(null, "", "#certificate");
}

function showQuestionnaireView() {
  $("certificateView").hidden = true;
  $("certificateView").classList.remove("is-active");
  $("questionnaireView").hidden = false;
  $("questionnaireView").classList.add("is-active");
  window.scrollTo({ top: 0, behavior: "smooth" });
  history.replaceState(null, "", window.location.pathname + window.location.search);
}

function init() {
  renderSelectOptions();
  renderQuestions();
  applyCertificateText();
  toggleConditionalBlocks();

  $("inputName").addEventListener("input", applyCertificateText);
  $("inputSchool").addEventListener("change", syncCountryFromSchool);
  $("position").addEventListener("change", toggleConditionalBlocks);
  $("downloadPdfButton").addEventListener("click", downloadCertificatePdf);
  $("openPdfButton").addEventListener("click", openCertificatePdf);
  $("backToFormButton").addEventListener("click", showQuestionnaireView);

  $("surveyForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    applyCertificateText();
    const status = $("submitStatus");
    const data = collectFormData();
    status.textContent = "Submitting questionnaire...";
    try {
      await sendSurveyData(data);
      sessionStorage.setItem("skysefCertificateReady", "1");
      sessionStorage.setItem("skysefCertificateName", data.name);
      sessionStorage.setItem("skysefCertificateSchool", data.school);
      status.textContent = "Completed. Moving to your certificate page...";
      showCertificateView();
    } catch (error) {
      console.error(error);
      sessionStorage.setItem("skysefCertificateReady", "1");
      status.textContent = "The response endpoint could not be reached. Moving to the certificate page on this device.";
      showCertificateView();
    }
  });

  if (window.location.hash === "#certificate" && sessionStorage.getItem("skysefCertificateReady") === "1") {
    if (sessionStorage.getItem("skysefCertificateName")) $("inputName").value = sessionStorage.getItem("skysefCertificateName");
    if (sessionStorage.getItem("skysefCertificateSchool")) $("inputSchool").value = sessionStorage.getItem("skysefCertificateSchool");
    applyCertificateText();
    showCertificateView();
  } else {
    showQuestionnaireView();
  }
}

document.addEventListener("DOMContentLoaded", init);
