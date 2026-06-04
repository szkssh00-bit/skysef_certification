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

    if (mode === 'uploadPdf') {
      const uploaded = saveUploadedPdf_(data);
      const pdfData = {
        submissionId: data.submissionId,
        driveFileId: uploaded.getId(),
        driveFileName: uploaded.getName(),
        driveFileUrl: uploaded.getUrl(),
        status: 'certificate_uploaded',
        errorMessage: '',
        lastUpdatedAt: new Date().toISOString()
      };
      const lockUpload = LockService.getScriptLock();
      try {
        lockUpload.waitLock(30000);
        rowNumber = findSubmissionRow_(sheet, data.submissionId) || rowNumber || appendRowPartial_(sheet, data);
        updateRowPartial_(sheet, rowNumber, pdfData);
        SpreadsheetApp.flush();
      } finally {
        try { lockUpload.releaseLock(); } catch (err) {}
      }
      return json_({
        ok: true,
        mode: 'uploadPdf',
        submissionId: data.submissionId,
        driveFileId: uploaded.getId(),
        driveFileUrl: uploaded.getUrl(),
        fileName: uploaded.getName()
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

function saveUploadedPdf_(data) {
  if (!data.pdfBase64) throw new Error('No PDF data was received.');
  const bytes = Utilities.base64Decode(String(data.pdfBase64));
  const fileName = fileSafe_(data.fileName || ('SKYSEF2026_Certificate_' + data.name + '.pdf'));
  const blob = Utilities.newBlob(bytes, data.mimeType || MimeType.PDF, fileName);
  const folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
  return folder.createFile(blob).setName(fileName);
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
  body { font-family:"Segoe UI","Noto Sans",Arial,sans-serif; color:#102033; }
  .page { position:relative; width:210mm; height:297mm; overflow:hidden; color:#102033; background:radial-gradient(circle at 18% 16%,rgba(15,143,167,.07),transparent 34%),linear-gradient(180deg,#fff 0%,#f8fbff 100%); }
  .page:before { content:""; position:absolute; inset:12mm; border:.7mm solid rgba(18,40,74,.80); border-radius:1.5mm; box-sizing:border-box; }
  .page:after { content:""; position:absolute; inset:16mm; border:.32mm solid rgba(198,161,91,.78); box-sizing:border-box; }
  .accent-top { position:absolute; top:-44mm; right:-34mm; width:134mm; height:88mm; border-radius:0 0 0 56mm; background:linear-gradient(135deg,rgba(17,136,161,.96),rgba(18,40,74,.98)); transform:rotate(-4deg); }
  .accent-top:after { content:""; position:absolute; left:7mm; bottom:-7mm; width:108mm; height:15mm; border-radius:999px; background:rgba(198,161,91,.88); transform:rotate(-8deg); }
  .accent-bottom { position:absolute; left:-52mm; bottom:-56mm; width:136mm; height:100mm; border-radius:0 70mm 0 0; background:linear-gradient(135deg,rgba(18,40,74,.96),rgba(18,102,154,.76)); transform:rotate(-3deg); }
  .content { position:relative; z-index:1; height:100%; padding:26mm 25mm 22mm; text-align:center; box-sizing:border-box; display:flex; flex-direction:column; align-items:center; }
  .logo-row { width:100%; text-align:left; min-height:22mm; }
  .skysef { width:58mm; max-height:22mm; object-fit:contain; }
  .kicker { margin:18mm 0 0; color:#12669a; text-transform:uppercase; font-size:10.5pt; letter-spacing:.13em; font-weight:800; line-height:1.35; }
  h1 { margin:5mm 0 0; color:#12284a; line-height:1; letter-spacing:-.02em; }
  h1 .big { display:block; font-family:"Segoe UI","Noto Sans",Arial,sans-serif; font-size:42pt; font-weight:900; letter-spacing:-.025em; }
  h1 .small { display:block; margin-top:2mm; font-family:"Segoe UI","Noto Sans",Arial,sans-serif; font-size:15.2pt; text-transform:uppercase; letter-spacing:.28em; color:#c6a15b; font-weight:900; }
  .awarded { margin:15mm 0 0; font-size:14.5pt; line-height:1.35; color:#516173; font-weight:500; }
  .recipient { width:150mm; margin:6mm auto 0; padding:5mm 5mm 4.8mm; border-top:.35mm solid rgba(198,161,91,.78); border-bottom:.35mm solid rgba(198,161,91,.78); background:rgba(255,255,255,.74); }
  .name { min-height:13mm; font-size:31pt; line-height:1.08; font-weight:900; color:#071a31; word-wrap:break-word; }
  .school { min-height:8mm; margin-top:1.5mm; font-size:14pt; line-height:1.25; color:#33506d; font-weight:800; word-wrap:break-word; }
  .desc { margin:11mm auto 0; width:150mm; font-size:15.4pt; line-height:1.62; color:#18314f; font-weight:500; }
  .footer { width:150mm; margin-top:auto; padding-bottom:4mm; display:flex; justify-content:flex-end; align-items:flex-end; }
  .footer-right { width:82mm; text-align:right; display:flex; flex-direction:column; align-items:flex-end; gap:5mm; }
  .org { display:grid; grid-template-columns:20mm 1fr; align-items:center; column-gap:3.5mm; width:82mm; }
  .school-logo { width:19mm; height:auto; object-fit:contain; justify-self:end; }
  .org-name { font-size:9.8pt; line-height:1.25; letter-spacing:.04em; text-transform:uppercase; font-weight:800; color:#18314f; }
  .sig { position:relative; width:78mm; min-height:29mm; display:flex; flex-direction:column; align-items:center; justify-content:flex-end; padding-bottom:2mm; }
  .sig-line { width:62mm; height:.28mm; background:rgba(16,36,63,.62); margin-bottom:3mm; }
  .principal-name { position:relative; z-index:2; font-size:16pt; line-height:1.1; font-weight:900; color:#10243f; text-align:center; }
  .principal-title { position:relative; z-index:2; margin-top:1mm; font-size:10.8pt; line-height:1.1; font-weight:800; color:#304b6e; text-align:center; }
  .seal { position:absolute; z-index:3; width:22mm; height:23mm; right:3mm; bottom:2mm; object-fit:contain; opacity:.78; }
</style>
</head>
<body>
  <div class="page">
    <div class="accent-top"></div>
    <div class="accent-bottom"></div>
    <div class="content">
      <div class="logo-row"><img class="skysef" src="${CONFIG.LOGO_SKYSEF_URL}"></div>
      <div class="kicker">Shizuoka Kita Youth Science Engineering Forum 2026</div>
      <h1><span class="big">Certificate</span><span class="small">of Participation</span></h1>
      <p class="awarded">This certificate is proudly awarded to</p>
      <div class="recipient"><div class="name">${escapeHtml_(name)}</div><div class="school">${escapeHtml_(school)}</div></div>
      <p class="desc">for participating in the Shizuoka Kita Youth Science Engineering Forum 2026, held from ${escapeHtml_(period)}, hosted and organized by Shizuoka Kita Junior and Senior High School</p>
      <div class="footer">
        <div class="footer-right">
          <div class="org"><img class="school-logo" src="${CONFIG.LOGO_SCHOOL_URL}"><div class="org-name">Shizuoka Kita Junior and Senior High School</div></div>
          <div class="sig"><div class="sig-line"></div><div class="principal-name">Hisao Ohashi</div><div class="principal-title">Principal</div><img class="seal" src="${CONFIG.SEAL_URL}"></div>
        </div>
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
