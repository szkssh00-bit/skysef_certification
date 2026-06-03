/**
 * Googleフォーム送信時に実行するApps Scriptです。
 * Cloud FunctionsにJSONを送信し、PDFをBase64で受け取り、参加者へ添付送信します。
 *
 * 事前設定:
 * 1. スクリプトプロパティに FUNCTION_URL を設定
 * 2. 必要に応じて WEBHOOK_API_KEY を設定
 * 3. フォーム回答の項目名を下の FIELD_MAP に合わせる
 */

const FIELD_MAP = {
  name: ['Name', '氏名', 'Participant Name', '参加者氏名'],
  school: ['School', '学校名', 'Affiliation', '所属校'],
  email: ['Email', 'メールアドレス', 'E-mail', '連絡先メールアドレス']
};

function pickValue_(namedValues, candidates) {
  for (const key of candidates) {
    if (namedValues[key] && namedValues[key][0]) return String(namedValues[key][0]).trim();
  }
  return '';
}

function onFormSubmit(e) {
  const props = PropertiesService.getScriptProperties();
  const functionUrl = props.getProperty('FUNCTION_URL');
  const apiKey = props.getProperty('WEBHOOK_API_KEY') || '';
  if (!functionUrl) throw new Error('FUNCTION_URL is not set in Script Properties.');

  const namedValues = e.namedValues || {};
  const name = pickValue_(namedValues, FIELD_MAP.name);
  const school = pickValue_(namedValues, FIELD_MAP.school);
  const email = pickValue_(namedValues, FIELD_MAP.email);

  if (!name || !school || !email) {
    throw new Error('Name, School, and Email are required. Please check FIELD_MAP and form item names.');
  }

  const payload = {
    name,
    school,
    email,
    returnBase64: true
  };

  const response = UrlFetchApp.fetch(functionUrl, {
    method: 'post',
    contentType: 'application/json',
    muteHttpExceptions: true,
    headers: apiKey ? { 'X-Api-Key': apiKey } : {},
    payload: JSON.stringify(payload)
  });

  const status = response.getResponseCode();
  const text = response.getContentText();
  if (status < 200 || status >= 300) {
    throw new Error('Cloud Function error: ' + status + ' ' + text);
  }

  const result = JSON.parse(text);
  const pdfBlob = Utilities.newBlob(
    Utilities.base64Decode(result.base64),
    result.mimeType || 'application/pdf',
    result.filename || 'SKYSEF_Certificate.pdf'
  );

  MailApp.sendEmail({
    to: email,
    subject: 'SKYSEF 2026 Certificate of Participation',
    body: 'Thank you for participating in SKYSEF 2026. Please find your certificate attached.',
    attachments: [pdfBlob]
  });
}

function setScriptPropertiesExample_() {
  PropertiesService.getScriptProperties().setProperties({
    FUNCTION_URL: 'https://REGION-PROJECT_ID.cloudfunctions.net/generateCertificate',
    WEBHOOK_API_KEY: 'change-this-random-string'
  }, true);
}
