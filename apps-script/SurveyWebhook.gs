/**
 * SKYSEF 2026 Questionnaire + Certificate backend
 * Deploy as Web app:
 *   Execute as: Me
 *   Who has access: Anyone
 */
const CONFIG = {
  SPREADSHEET_ID: '1xMvjC6CKuLVrc9AkisQMHkBmxmOsIPkn9Yu0IGAUZlY',
  SHEET_NAME: 'QuestionnaireResponses',
  DRIVE_FOLDER_ID: '1-n452WCDY7syLZgEOKTvsjp3JsWthOZi',
  EVENT_NAME: 'SKYSEF 2026',
  LOGO_SKYSEF_URL: 'https://szkssh00-bit.github.io/skysef_certification/assets/skysef-logo.jpeg',
  LOGO_SCHOOL_URL: 'https://szkssh00-bit.github.io/skysef_certification/assets/shizuoka-logo.png',
  SEAL_URL: 'https://szkssh00-bit.github.io/skysef_certification/assets/principal-seal.png'
};

const EVENT_DATES = [
  { value: '2026-08-02', label: 'August 2, 2026', short: 'Aug. 2' },
  { value: '2026-08-03', label: 'August 3, 2026', short: 'Aug. 3' },
  { value: '2026-08-04', label: 'August 4, 2026', short: 'Aug. 4' },
  { value: '2026-08-05', label: 'August 5, 2026', short: 'Aug. 5' }
];

const HEADERS = [
  'serverAcceptedAt', 'submissionId', 'event', 'name', 'school', 'country', 'position', 'positionOther', 'email', 'accommodationUse',
  'participationStart', 'participationEnd', 'participationPeriodText',
  'Q1 Opening Ceremony',
  'Q2 Keynote Address',
  'Q3 Welcome Dinner',
  'Q4 Cultural Performance',
  'Q5 Poster Session',
  'Q6 Oral Presentation',
  'Q7 International Joint Project',
  'Q8 Guided Tour',
  'Q9 Teachers Session',
  'Q10 Commendation Ceremony',
  'Q11 Closing Ceremony',
  'Q12 Accommodation/Home Stay',
  'Q13 Transportation',
  'Q14 Schedule',
  'Liked Item 1', 'Liked Item 2', 'Liked Item 3',
  'Improved Item 1', 'Improved Item 2', 'Improved Item 3',
  'A1 Inspired to engage more',
  'A1 Inspired by whom',
  'A1 How inspired',
  'A2 Communication satisfactory',
  'A2 Reason',
  'A3 Presentation satisfactory',
  'A3 Reason',
  'A4 Long-lasting friendship',
  'A5 Science and society chance',
  'A6 Keep thinking science and society',
  'A7 Learn English scientific expression',
  'A8 Acquire international scientific skills',
  'A9 Preferred period',
  'A9 Other period',
  'A10 Teacher: student performance',
  'A10 How satisfactory',
  'A11 Teacher emphasis',
  'Comments',
  'driveFileId', 'driveFileName', 'driveFileUrl', 'status', 'errorMessage', 'lastUpdatedAt'
];

const HEADER_MAP = {
  'Q1 Opening Ceremony': 'program_1_score',
  'Q2 Keynote Address': 'program_2_score',
  'Q3 Welcome Dinner': 'program_3_score',
  'Q4 Cultural Performance': 'program_4_score',
  'Q5 Poster Session': 'program_5_score',
  'Q6 Oral Presentation': 'program_6_score',
  'Q7 International Joint Project': 'program_7_score',
  'Q8 Guided Tour': 'program_8_score',
  'Q9 Teachers Session': 'program_9_score',
  'Q10 Commendation Ceremony': 'program_10_score',
  'Q11 Closing Ceremony': 'program_11_score',
  'Q12 Accommodation/Home Stay': 'program_12_score',
  'Q13 Transportation': 'program_13_score',
  'Q14 Schedule': 'program_14_score',
  'Liked Item 1': 'liked_1',
  'Liked Item 2': 'liked_2',
  'Liked Item 3': 'liked_3',
  'Improved Item 1': 'improved_1',
  'Improved Item 2': 'improved_2',
  'Improved Item 3': 'improved_3',
  'A1 Inspired to engage more': 'learning_1_score',
  'A1 Inspired by whom': 'inspired_by',
  'A1 How inspired': 'inspired_how',
  'A2 Communication satisfactory': 'learning_2_score',
  'A2 Reason': 'communication_reason',
  'A3 Presentation satisfactory': 'learning_3_score',
  'A3 Reason': 'presentation_reason',
  'A4 Long-lasting friendship': 'learning_4_score',
  'A5 Science and society chance': 'learning_5_score',
  'A6 Keep thinking science and society': 'learning_6_score',
  'A7 Learn English scientific expression': 'learning_7_score',
  'A8 Acquire international scientific skills': 'learning_8_score',
  'A9 Preferred period': 'preferredPeriod',
  'A9 Other period': 'preferredPeriodOther',
  'A10 Teacher: student performance': 'teacher_1_score',
  'A10 How satisfactory': 'teacher_performance_reason',
  'A11 Teacher emphasis': 'teacher_emphasis',
  'Comments': 'comments'
};

function doGet() {
  return json_({ ok: true, message: 'SKYSEF questionnaire endpoint is active.' });
}

function doPost(e) {
  const started = new Date();
  let data = {};
  let rowNumber = null;

  try {
    const raw = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    data = JSON.parse(raw);
    const mode = data.mode || 'recordOnly';

    validateParticipant_(data);
    data.serverAcceptedAt = data.serverAcceptedAt || started.toISOString();
    data.lastUpdatedAt = new Date().toISOString();
    data.event = CONFIG.EVENT_NAME;
    data.participationPeriodText = makeParticipationPeriodText_(data.participationStart, data.participationEnd);

    const sheet = getSheet_();
    ensureHeaders_(sheet);

    const lock = LockService.getScriptLock();
    try {
      lock.waitLock(30000);
      rowNumber = findSubmissionRow_(sheet, data.submissionId);
      if (!rowNumber) {
        data.status = mode === 'createPdf' ? 'certificate_preparing' : 'questionnaire_received';
        data.errorMessage = '';
        rowNumber = appendRowPartial_(sheet, data);
      } else {
        data.status = mode === 'createPdf' ? 'certificate_preparing' : 'questionnaire_received';
        data.errorMessage = '';
        updateRowPartial_(sheet, rowNumber, data);
      }
      SpreadsheetApp.flush();
    } finally {
      try { lock.releaseLock(); } catch (err) {}
    }

    if (mode === 'recordOnly') {
      return json_({
        ok: true,
        mode: 'recordOnly',
        submissionId: data.submissionId,
        accepted: true,
        participationPeriodText: data.participationPeriodText
      });
    }

    if (mode !== 'createPdf') {
      throw new Error('Invalid mode: ' + mode);
    }

    const pdf = createCertificatePdf_(data);
    const file = savePdfToDrive_(pdf.blob, pdf.fileName);

    const pdfData = {
      submissionId: data.submissionId,
      driveFileId: file.getId(),
      driveFileName: pdf.fileName,
      driveFileUrl: file.getUrl(),
      status: 'certificate_completed',
      errorMessage: '',
      lastUpdatedAt: new Date().toISOString()
    };

    const lock2 = LockService.getScriptLock();
    try {
      lock2.waitLock(30000);
      rowNumber = findSubmissionRow_(sheet, data.submissionId) || rowNumber || appendRowPartial_(sheet, data);
      updateRowPartial_(sheet, rowNumber, pdfData);
      SpreadsheetApp.flush();
    } finally {
      try { lock2.releaseLock(); } catch (err) {}
    }

    return json_({
      ok: true,
      mode: 'createPdf',
      submissionId: data.submissionId,
      fileName: pdf.fileName,
      mimeType: 'application/pdf',
      driveFileId: file.getId(),
      pdfBase64: Utilities.base64Encode(pdf.blob.getBytes())
    });
  } catch (err) {
    const message = String(err && err.message ? err.message : err);
    try {
      if (data && data.submissionId) {
        const sheet = getSheet_();
        ensureHeaders_(sheet);
        rowNumber = findSubmissionRow_(sheet, data.submissionId);
        if (rowNumber) {
          updateRowPartial_(sheet, rowNumber, { submissionId: data.submissionId, status: 'error', errorMessage: message, lastUpdatedAt: new Date().toISOString() });
        }
      }
    } catch (ignored) {}
    console.error(err && err.stack ? err.stack : err);
    return json_({ ok: false, retryable: true, error: message });
  }
}

function validateParticipant_(data) {
  const required = ['submissionId', 'name', 'school', 'country', 'position', 'participationStart', 'participationEnd'];
  const missing = required.filter(function(key) { return !String(data[key] || '').trim(); });
  if (missing.length) throw new Error('Missing required fields: ' + missing.join(', '));
  if (String(data.participationStart) > String(data.participationEnd)) throw new Error('Participation start date must be before or equal to the end date.');
  const allowed = getServerSelectableDateValues_();
  if (allowed.indexOf(String(data.participationStart)) === -1 || allowed.indexOf(String(data.participationEnd)) === -1) {
    throw new Error('Selected participation date is not available today. Please reload the page and select again.');
  }
}

function getServerSelectableDateValues_() {
  const tz = Session.getScriptTimeZone() || 'Asia/Tokyo';
  const today = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
  const eventStart = EVENT_DATES[0].value;
  const eventEnd = EVENT_DATES[EVENT_DATES.length - 1].value;
  let upper = eventEnd;
  if (today >= eventStart && today <= eventEnd) upper = today;
  if (today > eventEnd) upper = eventEnd;
  return EVENT_DATES.filter(function(d) { return d.value <= upper; }).map(function(d) { return d.value; });
}

function makeParticipationPeriodText_(start, end) {
  const s = EVENT_DATES.filter(function(d) { return d.value === start; })[0] || EVENT_DATES[0];
  const e = EVENT_DATES.filter(function(d) { return d.value === end; })[0] || s;
  if (s.value === e.value) return s.label;
  return s.short + ' to ' + e.short + ', 2026';
}

function getSheet_() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(CONFIG.SHEET_NAME);
  return sheet;
}

function ensureHeaders_(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
    return;
  }
  const current = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0].map(String);
  const missing = HEADERS.filter(function(h) { return current.indexOf(h) === -1; });
  if (missing.length) sheet.getRange(1, current.filter(String).length + 1, 1, missing.length).setValues([missing]);
}

function findSubmissionRow_(sheet, submissionId) {
  if (!submissionId || sheet.getLastRow() < 2) return null;
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String);
  const col = headers.indexOf('submissionId') + 1;
  if (col < 1) return null;
  const values = sheet.getRange(2, col, sheet.getLastRow() - 1, 1).getValues().flat().map(String);
  const index = values.indexOf(String(submissionId));
  return index >= 0 ? index + 2 : null;
}

function appendRowPartial_(sheet, data) {
  ensureHeaders_(sheet);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String);
  const row = headers.map(function(header) { return valueForHeader_(header, data); });
  sheet.appendRow(row);
  return sheet.getLastRow();
}

function updateRowPartial_(sheet, rowNumber, data) {
  ensureHeaders_(sheet);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String);
  const existing = sheet.getRange(rowNumber, 1, 1, headers.length).getValues()[0];
  const row = headers.map(function(header, i) {
    const newValue = valueForHeader_(header, data);
    if (newValue === '' || newValue == null) return existing[i];
    return newValue;
  });
  sheet.getRange(rowNumber, 1, 1, row.length).setValues([row]);
}

function valueForHeader_(header, data) {
  const key = HEADER_MAP[header] || header;
  return data[key] == null ? '' : data[key];
}

function savePdfToDrive_(blob, fileName) {
  const folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
  return folder.createFile(blob).setName(fileName);
}

function createCertificatePdf_(data) {
  const name = clean_(data.name, 'Name');
  const school = clean_(data.school, 'School');
  const period = clean_(data.participationPeriodText || makeParticipationPeriodText_(data.participationStart, data.participationEnd), 'August 2 to 5, 2026');
  const fileName = 'SKYSEF2026_Certificate_' + fileSafe_(name) + '_' + fileSafe_(period).substring(0, 28) + '.pdf';
  const html = certificateHtml_(name, school, period);
  const blob = Utilities.newBlob(html, 'text/html', fileName.replace(/\.pdf$/i, '.html')).getAs(MimeType.PDF).setName(fileName);
  return { blob: blob, fileName: fileName };
}

function certificateHtml_(name, school, period) {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
  @page { size: A4 portrait; margin: 0; }
  html, body { margin:0; padding:0; width:210mm; height:297mm; background:#fff; }
  .page { position:relative; width:210mm; height:297mm; overflow:hidden; color:#111827; background:linear-gradient(180deg,#ffffff 0%,#f7fbff 100%); font-family:"Segoe UI","Noto Sans",Arial,sans-serif; }
  .page:before { content:""; position:absolute; inset:12mm; border:.8mm solid rgba(16,36,63,.86); border-radius:1.5mm; box-sizing:border-box; }
  .page:after { content:""; position:absolute; inset:16mm; border:.35mm solid rgba(197,160,87,.75); box-sizing:border-box; }
  .accent-top { position:absolute; top:-46mm; right:-34mm; width:142mm; height:96mm; border-radius:0 0 0 58mm; background:linear-gradient(135deg,rgba(24,166,200,.95),rgba(16,36,63,.98)); transform:rotate(-4deg); }
  .accent-top:after { content:""; position:absolute; left:8mm; bottom:-8mm; width:112mm; height:18mm; border-radius:999px; background:rgba(197,160,87,.90); transform:rotate(-8deg); }
  .accent-bottom { position:absolute; left:-54mm; bottom:-56mm; width:142mm; height:104mm; border-radius:0 72mm 0 0; background:linear-gradient(135deg,rgba(16,36,63,.96),rgba(19,95,159,.78)); transform:rotate(-3deg); }
  .content { position:relative; z-index:1; height:100%; padding:28mm 26mm 25mm; text-align:center; box-sizing:border-box; }
  .logo-row { width:100%; text-align:left; }
  .skysef { width:58mm; max-height:24mm; object-fit:contain; }
  .kicker { margin:22mm 0 0; color:#135f9f; text-transform:uppercase; font-size:10.5pt; letter-spacing:.15em; font-weight:900; }
  h1 { margin:4mm 0 0; color:#10243f; line-height:1; letter-spacing:-.02em; }
  h1 .big { display:block; font-family:Georgia,Cambria,serif; font-size:40pt; font-weight:700; }
  h1 .small { display:block; margin-top:2mm; font-size:16pt; text-transform:uppercase; letter-spacing:.28em; color:#c5a057; font-weight:900; }
  .awarded { margin:14mm 0 0; font-family:Georgia,Cambria,serif; font-size:13.8pt; color:#4b607a; }
  .recipient { width:150mm; margin:6mm auto 0; padding:5mm 5mm 4.5mm; border-top:.35mm solid rgba(197,160,87,.72); border-bottom:.35mm solid rgba(197,160,87,.72); background:rgba(255,255,255,.72); }
  .name { min-height:14mm; font-size:30pt; line-height:1.1; font-weight:900; color:#071a31; word-wrap:break-word; }
  .school { min-height:8mm; margin-top:1.5mm; font-size:13.8pt; line-height:1.25; color:#33506d; font-weight:800; word-wrap:break-word; }
  .desc { margin:11mm auto 0; width:148mm; font-family:Georgia,Cambria,serif; font-size:13.8pt; line-height:1.72; color:#18314f; }
  .footer { position:absolute; left:27mm; right:27mm; bottom:25mm; display:table; width:156mm; }
  .col { display:table-cell; width:50%; vertical-align:bottom; }
  .org { text-align:left; padding-left:3mm; }
  .school-logo { width:25mm; height:auto; margin-bottom:4mm; }
  .org-name { font-size:11.2pt; line-height:1.28; font-weight:900; color:#18314f; }
  .sig { position:relative; text-align:center; padding-right:4mm; height:40mm; }
  .sig-line { position:absolute; left:12mm; right:12mm; bottom:24mm; height:.35mm; background:rgba(16,36,63,.70); }
  .principal { position:absolute; left:0; right:0; bottom:7mm; }
  .principal-name { font-size:16.5pt; line-height:1.1; font-weight:900; color:#10243f; }
  .principal-title { margin-top:1mm; font-size:11.5pt; line-height:1.1; font-weight:800; color:#304b6e; }
  .seal { position:absolute; width:22mm; height:23mm; right:5mm; bottom:6mm; opacity:.84; }
</style>
</head>
<body>
  <div class="page">
    <div class="accent-top"></div><div class="accent-bottom"></div>
    <div class="content">
      <div class="logo-row"><img class="skysef" src="${CONFIG.LOGO_SKYSEF_URL}"></div>
      <div class="kicker">Shizuoka Kita Youth Science Engineering Forum 2026</div>
      <h1><span class="big">Certificate</span><span class="small">of Participation</span></h1>
      <p class="awarded">This certificate is proudly awarded to</p>
      <div class="recipient"><div class="name">${escapeHtml_(name)}</div><div class="school">${escapeHtml_(school)}</div></div>
      <p class="desc">for participating in the Shizuoka Kita Youth Science Engineering Forum 2026,<br>held from ${escapeHtml_(period)},<br>hosted and organized by Shizuoka Kita Junior and Senior High School</p>
      <div class="footer">
        <div class="col org"><img class="school-logo" src="${CONFIG.LOGO_SCHOOL_URL}"><div class="org-name">Shizuoka Kita Junior and Senior High<br>School</div></div>
        <div class="col sig"><div class="sig-line"></div><div class="principal"><div class="principal-name">Hisao Ohashi</div><div class="principal-title">Principal</div></div><img class="seal" src="${CONFIG.SEAL_URL}"></div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
function clean_(value, fallback) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  return text || fallback;
}
function fileSafe_(value) {
  return clean_(value, 'certificate').replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, '_').substring(0, 80);
}
function escapeHtml_(value) {
  return String(value == null ? '' : value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
