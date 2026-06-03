/**
 * SKYSEF Questionnaire + Certificate PDF backend
 *
 * Deploy as a Google Apps Script Web App:
 * - Execute as: Me
 * - Who has access: Anyone
 *
 * The script:
 * 1. accepts questionnaire JSON from GitHub Pages,
 * 2. appends all fields to the specified Spreadsheet,
 * 3. generates an individual certificate PDF,
 * 4. saves the PDF to the specified private Drive folder,
 * 5. returns the PDF as base64 so the participant can download it immediately.
 */
const CONFIG = {
  SPREADSHEET_ID: '1xMvjC6CKuLVrc9AkisQMHkBmxmOsIPkn9Yu0IGAUZlY',
  SHEET_NAME: 'QuestionnaireResponses',
  DRIVE_FOLDER_ID: '1-n452WCDY7syLZgEOKTvsjp3JsWthOZi',
  EVENT_NAME: 'SKYSEF 2025',
  CERTIFICATE_YEAR: '2025',
  LOGO_SKYSEF_URL: 'https://szkssh00-bit.github.io/skysef_certification/assets/skysef-logo.jpeg',
  LOGO_SCHOOL_URL: 'https://szkssh00-bit.github.io/skysef_certification/assets/shizuoka-logo.png',
  SEAL_URL: 'https://szkssh00-bit.github.io/skysef_certification/assets/principal-seal.png'
};

const HEADERS = [
  'serverAcceptedAt', 'submissionId', 'event', 'name', 'school', 'country', 'position', 'positionOther', 'email',
  'program_1_score', 'program_2_score', 'program_3_score', 'program_4_score', 'program_5_score', 'program_6_score', 'program_7_score',
  'program_8_score', 'program_9_score', 'program_10_score', 'program_11_score', 'program_12_score', 'program_13_score', 'program_14_score',
  'liked_1', 'liked_2', 'liked_3', 'improved_1', 'improved_2', 'improved_3',
  'learning_1_score', 'inspired_by', 'inspired_how', 'learning_2_score', 'communication_reason',
  'learning_3_score', 'presentation_reason', 'learning_4_score', 'learning_5_score', 'learning_6_score', 'learning_7_score', 'learning_8_score',
  'preferredPeriod', 'preferredPeriodOther', 'teacher_1_score', 'teacher_performance_reason', 'teacher_emphasis', 'comments',
  'driveFileId', 'driveFileName'
];

function doGet() {
  return json_({ ok: true, message: 'SKYSEF questionnaire endpoint is active.' });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  let locked = false;
  try {
    locked = lock.tryLock(30000);
    if (!locked) {
      return json_({ ok: false, retryable: true, error: 'Server is busy. Please retry.' });
    }

    const raw = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    const data = JSON.parse(raw);
    validate_(data);

    const acceptedAt = new Date().toISOString();
    data.serverAcceptedAt = acceptedAt;

    const pdf = createCertificatePdf_(data);
    const file = savePdfToDrive_(pdf.blob, pdf.fileName);
    data.driveFileId = file.getId();
    data.driveFileName = pdf.fileName;

    const sheet = getSheet_();
    ensureHeaders_(sheet);
    if (!hasSubmissionId_(sheet, data.submissionId)) {
      appendRow_(sheet, data);
      SpreadsheetApp.flush();
    }

    return json_({
      ok: true,
      submissionId: data.submissionId,
      fileName: pdf.fileName,
      mimeType: 'application/pdf',
      driveFileId: file.getId(),
      pdfBase64: Utilities.base64Encode(pdf.blob.getBytes())
    });
  } catch (err) {
    console.error(err && err.stack ? err.stack : err);
    return json_({ ok: false, retryable: false, error: String(err && err.message ? err.message : err) });
  } finally {
    if (locked) lock.releaseLock();
  }
}

function validate_(data) {
  const required = ['submissionId', 'name', 'school', 'country', 'position'];
  const missing = required.filter((key) => !String(data[key] || '').trim());
  if (missing.length) throw new Error('Missing required fields: ' + missing.join(', '));
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
  const lastCol = Math.max(sheet.getLastColumn(), 1);
  const current = sheet.getRange(1, 1, 1, lastCol).getValues()[0].filter(String);
  const missing = HEADERS.filter((h) => current.indexOf(h) === -1);
  if (missing.length) {
    sheet.getRange(1, current.length + 1, 1, missing.length).setValues([missing]);
  }
}

function hasSubmissionId_(sheet, submissionId) {
  if (!submissionId || sheet.getLastRow() < 2) return false;
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const col = headers.indexOf('submissionId') + 1;
  if (col < 1) return false;
  const values = sheet.getRange(2, col, sheet.getLastRow() - 1, 1).getValues().flat();
  return values.indexOf(submissionId) !== -1;
}

function appendRow_(sheet, data) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const row = headers.map((key) => data[key] == null ? '' : data[key]);
  sheet.appendRow(row);
}

function savePdfToDrive_(blob, fileName) {
  const folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
  const file = folder.createFile(blob).setName(fileName);
  // No sharing is set. The file remains private to accounts that already have access to the Drive folder.
  return file;
}

function createCertificatePdf_(data) {
  const name = clean_(data.name, 'Name');
  const school = clean_(data.school, 'School');
  const fileName = 'SKYSEF2025_Certificate_' + fileSafe_(name) + '.pdf';
  const html = certificateHtml_(name, school);
  const blob = Utilities
    .newBlob(html, 'text/html', fileName.replace(/\.pdf$/i, '.html'))
    .getAs(MimeType.PDF)
    .setName(fileName);
  return { blob: blob, fileName: fileName };
}

function certificateHtml_(name, school) {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
  @page { size: A4 portrait; margin: 0; }
  html, body { margin:0; padding:0; background:#fff; }
  body { width:210mm; height:297mm; }
  .page {
    position:relative; width:210mm; height:297mm; overflow:hidden;
    color:#112236; font-family:"Segoe UI", "Noto Sans", sans-serif;
    background: radial-gradient(circle at 50% 20%, #ffffff 0%, #f7fafc 100%);
  }
  .page:before { content:""; position:absolute; inset:10mm; border:2.2mm solid #16375f; border-radius:5mm; }
  .page:after { content:""; position:absolute; inset:15mm; border:.65mm solid #b99a55; border-radius:3.5mm; }
  .corner1, .corner2 { position:absolute; width:36mm; height:36mm; border:1.2mm solid rgba(185,154,85,.75); transform:rotate(45deg); }
  .corner1 { left:21mm; top:21mm; border-right:0; border-bottom:0; }
  .corner2 { right:21mm; bottom:21mm; border-left:0; border-top:0; }
  .content { position:relative; z-index:1; height:248mm; padding:25mm 27mm 24mm; text-align:center; }
  .skysef { width:92mm; height:auto; margin:0 auto 10mm; display:block; }
  h1 { margin:0; color:#16375f; font-family:Georgia, Cambria, serif; font-size:32pt; line-height:1.08; }
  h1 span { font-size:36pt; }
  .awarded { margin:15mm 0 0; font-family:Georgia, Cambria, serif; font-size:17pt; color:#283d59; }
  .recipient { margin:7mm auto 0; padding-bottom:5mm; border-bottom:.55mm solid rgba(185,154,85,.85); width:156mm; }
  .name { min-height:13mm; font-size:25pt; line-height:1.1; font-weight:800; color:#091d35; letter-spacing:.02em; }
  .school { min-height:8mm; margin-top:1.5mm; font-size:14pt; line-height:1.25; color:#304b6e; font-weight:600; }
  .desc { margin:12mm auto 0; max-width:145mm; font-size:17.2pt; line-height:1.48; color:#18314f; font-weight:500; }
  .footer { position:absolute; left:27mm; right:27mm; bottom:27mm; display:table; width:156mm; }
  .col { display:table-cell; width:50%; vertical-align:bottom; }
  .org { text-align:left; padding-left:4mm; }
  .school-logo { width:29mm; height:auto; margin-bottom:4mm; }
  .org-name { font-size:12.7pt; line-height:1.25; font-weight:700; color:#18314f; }
  .sig { position:relative; text-align:center; padding-right:4mm; height:40mm; }
  .principal { position:absolute; left:0; right:0; bottom:9mm; }
  .principal-name { font-size:17pt; line-height:1.1; font-weight:800; }
  .principal-title { margin-top:1mm; font-size:12.5pt; line-height:1.1; font-weight:700; color:#304b6e; }
  .seal { position:absolute; width:23mm; height:24mm; right:4mm; bottom:8mm; opacity:.82; }
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
        for participating in the Shizuoka Kita Youth Science Engineering Forum 2025,<br>
        held from July 30 to August 2, 2025,<br>
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
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
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
