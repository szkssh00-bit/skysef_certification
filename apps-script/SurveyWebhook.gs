/**
 * SKYSEF Questionnaire Webhook for Google Apps Script.
 * Deploy this file as a Web App and paste its URL into SURVEY_ENDPOINT
 * in public/assets/survey-certificate.js.
 *
 * Deployment settings:
 * - Execute as: Me
 * - Who has access: Anyone
 */
const SHEET_NAME = 'QuestionnaireResponses';

function doPost(e) {
  const sheet = getOrCreateSheet_();
  const data = JSON.parse(e.postData && e.postData.contents ? e.postData.contents : '{}');
  appendObject_(sheet, data);
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return ContentService
    .createTextOutput('SKYSEF questionnaire endpoint is active.')
    .setMimeType(ContentService.MimeType.TEXT);
}

function getOrCreateSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  return sheet;
}

function appendObject_(sheet, obj) {
  const keys = Object.keys(obj);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(keys);
  }
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const missing = keys.filter((key) => !headers.includes(key));
  if (missing.length) {
    sheet.getRange(1, headers.length + 1, 1, missing.length).setValues([missing]);
  }
  const updatedHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const row = updatedHeaders.map((key) => obj[key] ?? '');
  sheet.appendRow(row);
}
