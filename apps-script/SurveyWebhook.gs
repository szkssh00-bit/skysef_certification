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
  'serverAcceptedAt', 'submissionId', 'event', 'name', 'school', 'country', 'position', 'positionOther', 'email',
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

  'driveFileId', 'driveFileName', 'driveFileUrl', 'status', 'errorMessage'
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
    validate_(data);
    data.serverAcceptedAt = started.toISOString();
    data.participationPeriodText = makeParticipationPeriodText_(data.participationStart, data.participationEnd);
    data.status = 'accepted';

    const sheet = getSheet_();
    ensureHeaders_(sheet);

    const lock = LockService.getScriptLock();
    try {
      lock.waitLock(30000);
      const existingRow = findSubmissionRow_(sheet, data.submissionId);
      if (existingRow) {
        rowNumber = existingRow;
      } else {
        rowNumber = appendAcceptedRow_(sheet, data);
      }
      SpreadsheetApp.flush();
    } finally {
      try { lock.releaseLock(); } catch (err) {}
    }

    const pdf = createCertificatePdf_(data);
    const file = savePdfToDrive_(pdf.blob, pdf.fileName);
    data.driveFileId = file.getId();
    data.driveFileName = pdf.fileName;
    data.driveFileUrl = file.getUrl();
    data.status = 'completed';

    updateRow_(sheet, rowNumber, data);
    SpreadsheetApp.flush();

    return json_({
      ok: true,
      submissionId: data.submissionId,
      fileName: pdf.fileName,
      mimeType: 'application/pdf',
      driveFileId: file.getId(),
      pdfBase64: Utilities.base64Encode(pdf.blob.getBytes())
    });
  } catch (err) {
    const message = String(err && err.message ? err.message : err);
    try {
      if (rowNumber) {
        data.status = 'error';
        data.errorMessage = message;
        updateRow_(getSheet_(), rowNumber, data);
      }
    } catch (ignored) {}
    console.error(err && err.stack ? err.stack : err);
    return json_({ ok: false, retryable: true, error: message });
  }
}

function validate_(data) {
  const required = ['submissionId', 'name', 'school', 'country', 'position', 'participationStart', 'participationEnd'];
  const missing = required.filter((key) => !String(data[key] || '').trim());
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

function appendAcceptedRow_(sheet, data) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String);
  const row = headers.map(function(key) { return valueForHeader_(key, data); });
  sheet.appendRow(row);
  return sheet.getLastRow();
}

function updateRow_(sheet, rowNumber, data) {
  ensureHeaders_(sheet);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String);
  const row = headers.map(function(key) { return valueForHeader_(key, data); });
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
  const blob = Utilities
    .newBlob(html, 'text/html', fileName.replace(/\.pdf$/i, '.html'))
    .getAs(MimeType.PDF)
    .setName(fileName);
  return { blob: blob, fileName: fileName };
}

function certificateHtml_(name, school, period) {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
  @page { size: A4 portrait; margin: 0; }
  html, body { margin:0; padding:0; background:#fff; width:210mm; height:297mm; }
  .page { position:relative; width:210mm; height:297mm; overflow:hidden; color:#112236; font-family:"Segoe UI", "Noto Sans", sans-serif; background: radial-gradient(circle at 50% 18%, #ffffff 0%, #f7fafc 100%); }
  .page:before { content:""; position:absolute; inset:9mm; border:2.1mm solid #123a68; border-radius:6mm; box-sizing:border-box; }
  .page:after { content:""; position:absolute; inset:15mm; border:.55mm solid #b99a55; border-radius:4mm; box-sizing:border-box; }
  .corner1, .corner2 { position:absolute; width:35mm; height:35mm; border:1.1mm solid rgba(185,154,85,.70); transform:rotate(45deg); box-sizing:border-box; }
  .corner1 { left:22mm; top:22mm; border-right:0; border-bottom:0; }
  .corner2 { right:22mm; bottom:22mm; border-left:0; border-top:0; }
  .content { position:relative; z-index:1; height:100%; padding:25mm 27mm 24mm; text-align:center; box-sizing:border-box; }
  .skysef { width:90mm; max-height:35mm; height:auto; margin:0 auto 9mm; display:block; }
  h1 { margin:0; color:#123a68; font-family:Georgia, Cambria, serif; font-size:31pt; line-height:1.08; font-weight:700; letter-spacing:.01em; }
  h1 span { font-size:35pt; }
  .awarded { margin:14mm 0 0; font-family:Georgia, Cambria, serif; font-size:16.5pt; color:#283d59; }
  .recipient { margin:7mm auto 0; padding-bottom:5mm; border-bottom:.55mm solid rgba(185,154,85,.85); width:156mm; }
  .name { min-height:13mm; font-size:25pt; line-height:1.12; font-weight:800; color:#091d35; letter-spacing:.01em; word-wrap:break-word; }
  .school { min-height:8mm; margin-top:1.5mm; font-size:14.2pt; line-height:1.25; color:#304b6e; font-weight:700; word-wrap:break-word; }
  .desc { margin:11mm auto 0; max-width:148mm; font-family:Georgia, Cambria, serif; font-size:15.4pt; line-height:1.55; color:#18314f; }
  .footer { position:absolute; left:27mm; right:27mm; bottom:25mm; display:table; width:156mm; }
  .col { display:table-cell; width:50%; vertical-align:bottom; }
  .org { text-align:left; padding-left:3mm; }
  .school-logo { width:29mm; height:auto; margin-bottom:4mm; }
  .org-name { font-size:12.5pt; line-height:1.28; font-weight:800; color:#18314f; }
  .sig { position:relative; text-align:center; padding-right:4mm; height:42mm; }
  .principal { position:absolute; left:0; right:0; bottom:9mm; }
  .principal-name { font-size:17pt; line-height:1.1; font-weight:800; }
  .principal-title { margin-top:1mm; font-size:12.5pt; line-height:1.1; font-weight:700; color:#304b6e; }
  .seal { position:absolute; width:23mm; height:24mm; right:5mm; bottom:8mm; opacity:.84; }
</style>
</head>
<body>
  <div class="page">
    <div class="corner1"></div><div class="corner2"></div>
    <div class="content">
      <img class="skysef" src="${CONFIG.LOGO_SKYSEF_URL}">
      <h1>Certificate of<br><span>Participation</span></h1>
      <p class="awarded">This Certificate is awarded to</p>
      <div class="recipient">
        <div class="name">${escapeHtml_(name)}</div>
        <div class="school">${escapeHtml_(school)}</div>
      </div>
      <p class="desc">
        for participating in the Shizuoka Kita Youth Science Engineering Forum 2026,<br>
        held from ${escapeHtml_(period)},<br>
        hosted and organized by Shizuoka Kita Junior and Senior High School
      </p>
      <div class="footer">
        <div class="col org">
          <img class="school-logo" src="${CONFIG.LOGO_SCHOOL_URL}">
          <div class="org-name">Shizuoka Kita Junior and Senior High<br>School</div>
        </div>
        <div class="col sig">
          <div class="principal">
            <div class="principal-name">Hisao Ohashi</div>
            <div class="principal-title">Principal</div>
          </div>
          <img class="seal" src="${CONFIG.SEAL_URL}">
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
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
