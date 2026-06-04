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
  SEAL_URL: 'https://szkssh00-bit.github.io/skysef_certification/assets/principal-seal.png',
  ADMIN_PASSWORD: 'set'
};

const EVENT_DATES = [
  { value: '2026-08-02', label: 'August 2, 2026', short: 'Aug. 2' },
  { value: '2026-08-03', label: 'August 3, 2026', short: 'Aug. 3' },
  { value: '2026-08-04', label: 'August 4, 2026', short: 'Aug. 4' },
  { value: '2026-08-05', label: 'August 5, 2026', short: 'Aug. 5' }
];

const DEFAULT_SCHOOLS = [
  { school: 'West Moreton Anglican College', country: 'Australia' },
  { school: "St. John's School", country: 'Guam' },
  { school: 'Mentari Intercultural School', country: 'Indonesia' },
  { school: 'Hyogo Prefectural Tatsuno High School', country: 'Japan' },
  { school: 'Yasuda Gakuen Junior and Senior High School', country: 'Japan' },
  { school: 'Osaka Prefectural Senri High School', country: 'Japan' },
  { school: 'Shizuoka Prefectural Yaizu Chuo High School', country: 'Japan' },
  { school: 'Takada Junior & Senior High School', country: 'Japan' },
  { school: 'Shizuoka Agriculture High School', country: 'Japan' },
  { school: 'Shizuoka Kita Junior High School', country: 'Japan' },
  { school: 'Shizuoka Kita High School', country: 'Japan' },
  { school: 'Pui Ching Middle School', country: 'Macau' },
  { school: 'The Affiliated Senior High School of National Chi-Nan University', country: 'Taiwan' },
  { school: 'Taichung Municipal HUI-WEN High School', country: 'Taiwan' },
  { school: "National Lan-Yang Girls' Senior High School", country: 'Taiwan' },
  { school: 'Taichung Municipal Taichung First Senior High School', country: 'Taiwan' },
  { school: 'Chia-Yi Senior High School', country: 'Taiwan' },
  { school: 'Princess Chulabhorn Science High School Loei', country: 'Thailand' },
  { school: 'Holy Redeemer North Eastern Region School', country: 'Thailand' },
  { school: 'Holy Redeemer School Khon Kaen', country: 'Thailand' },
  { school: 'Other', country: 'Other' }
];

const DEFAULT_TIMELINE = {
  '2026-08-02': [
    ['13:00-13:30', 'Registration 受付', 'Conference Hall - Winds, 11F / 会議ホール・風'],
    ['13:40-14:05', 'Opening Ceremony', 'Conference Hall - Winds, 11F'],
    ['14:20-15:20', 'Keynote Address 基調講演', 'Conference Hall - Winds, 11F / 会議ホール・風'],
    ['15:45-17:45', 'Welcome Reception, Cultural Performance I 歓迎レセプション・文化交流I', 'Conference Rooms 1001-1 and 1001-2, 10F']
  ],
  '2026-08-03': [
    ['09:00', 'GRANSHIP opens', 'GRANSHIP'],
    ['09:30-12:00', 'Oral Presentation 口頭発表', 'Room 904, 9F / Room 908, 9F / Room 1001-1, 10F / Room 1001-2, 10F / Room 1002, 10F'],
    ['12:00-14:00', 'Lunch', '-'],
    ['14:00-14:30', 'Poster Setup ポスター準備', 'Main Hall - Ocean, 1F / 大ホール・海'],
    ['14:30-17:00', 'Poster Session ポスターセッション', 'Main Hall - Ocean, 1F']
  ],
  '2026-08-04': [
    ['09:00', 'GRANSHIP opens', 'GRANSHIP'],
    ['09:30-12:00', 'International Joint Project / For Teachers: Guided Tour', 'Main Hall - Ocean, 1F / Meet at the entrance of GRANSHIP'],
    ['12:00-14:00', 'Lunch', '-'],
    ['14:00-17:00', 'International Joint Project', 'Main Hall - Ocean, 1F']
  ],
  '2026-08-05': [
    ['09:00', 'GRANSHIP opens', 'GRANSHIP'],
    ['09:30-11:00', 'International Joint Project', 'Main Hall - Ocean, 1F'],
    ['11:00-13:00', 'Lunch', '-'],
    ['13:00-15:00', 'Cultural Performance II', 'Main Hall - Ocean, 1F'],
    ['15:00-15:30', 'Questionnaire and Certificate of Participation', 'Main Hall - Ocean, 1F'],
    ['15:30-15:45', 'Commendation Ceremony 表彰式', 'Main Hall - Ocean, 1F'],
    ['15:45-16:00', 'Closing Ceremony 閉会式', 'Main Hall - Ocean, 1F']
  ]
};

const DEFAULT_PROGRAM_QUESTIONS = [
  { text: 'Opening Ceremony (Aug. 2)', dates: ['2026-08-02'], teacherOnly: false },
  { text: 'Keynote Address (Aug. 2)', dates: ['2026-08-02'], teacherOnly: false },
  { text: 'Welcome Reception / Cultural Performance I (Aug. 2)', dates: ['2026-08-02'], teacherOnly: false },
  { text: 'Cultural Performance II (Aug. 5)', dates: ['2026-08-05'], teacherOnly: false },
  { text: 'Poster Session (Aug. 3)', dates: ['2026-08-03'], teacherOnly: false },
  { text: 'Oral Presentation (Aug. 3)', dates: ['2026-08-03'], teacherOnly: false },
  { text: 'International Joint Project (Aug. 4 and Aug. 5)', dates: ['2026-08-04', '2026-08-05'], teacherOnly: false },
  { text: 'For teachers: Guided Tour (Aug. 4)', dates: ['2026-08-04'], teacherOnly: true },
  { text: 'For teachers: Teachers’ Session (Aug. 4)', dates: ['2026-08-04'], teacherOnly: true },
  { text: 'Commendation Ceremony (Aug. 5)', dates: ['2026-08-05'], teacherOnly: false },
  { text: 'Closing Ceremony (Aug. 5)', dates: ['2026-08-05'], teacherOnly: false },
  { text: 'Accommodation / Home Stay', dates: ['2026-08-02', '2026-08-03', '2026-08-04', '2026-08-05'], teacherOnly: false, general: true, accommodationOnly: true },
  { text: 'Transportation', dates: ['2026-08-02', '2026-08-03', '2026-08-04', '2026-08-05'], teacherOnly: false, general: true },
  { text: 'Schedule', dates: ['2026-08-02', '2026-08-03', '2026-08-04', '2026-08-05'], teacherOnly: false, general: true }
];

const DEFAULT_ITEM_OPTIONS = ['Research discussion', 'Scientific English communication', 'International exchange', 'Friendship and networking', 'Venue and facilities', 'Food and reception', 'Other'];
const DEFAULT_PERIOD_OPTIONS = ['The bottom of July', 'The top of August', 'The bottom of August', 'Other period'];


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

    if (mode === 'getConfig') {
      return json_({ ok: true, mode: mode, config: getConfig_() });
    }

    if (mode === 'updateConfig') {
      validateAdmin_(data);
      const savedConfig = updateConfig_(data.config || {});
      return json_({ ok: true, mode: mode, config: savedConfig });
    }

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


function validateAdmin_(data) {
  if (String(data.adminPassword || '') !== CONFIG.ADMIN_PASSWORD) {
    throw new Error('Invalid admin password.');
  }
}

function getConfig_() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  ensureConfigSheets_(ss);

  const schools = readRows_(ss, 'Config_Schools').map(function (r) {
    return { school: r[0], country: r[1] || 'Other' };
  }).filter(function (x) { return x.school; });

  const eventDates = readRows_(ss, 'Config_EventDates').map(function (r) {
    return { value: r[0], label: r[1] || r[0], short: r[2] || r[1] || r[0] };
  }).filter(function (x) { return x.value; });

  const timeline = {};
  readRows_(ss, 'Config_Timeline').forEach(function (r) {
    const date = r[0];
    if (!date) return;
    if (!timeline[date]) timeline[date] = [];
    timeline[date].push([r[1] || '', r[2] || '', r[3] || '']);
  });

  const programQuestions = readRows_(ss, 'Config_ProgramQuestions').map(function (r) {
    return {
      text: r[0],
      dates: parseJsonSafe_(r[1], []),
      teacherOnly: toBool_(r[2]),
      accommodationOnly: toBool_(r[3]),
      general: toBool_(r[4])
    };
  }).filter(function (x) { return x.text; });

  const itemExtraOptions = readRows_(ss, 'Config_ItemOptions').map(function (r) { return r[0]; }).filter(String);
  const textRows = readRows_(ss, 'Config_Texts');
  const texts = {};
  textRows.forEach(function (r) { if (r[0]) texts[r[0]] = r[1] || ''; });

  const countries = Array.from(new Set(schools.map(function (s) { return s.country || 'Other'; }).concat(['Other'])));

  return {
    eventName: texts.eventName || CONFIG.EVENT_NAME,
    organizerName: texts.organizerName || 'Shizuoka Kita Junior and Senior High School',
    schools: schools.length ? schools : DEFAULT_SCHOOLS,
    countries: countries,
    eventDates: eventDates.length ? eventDates : EVENT_DATES,
    timeline: Object.keys(timeline).length ? timeline : DEFAULT_TIMELINE,
    programQuestions: programQuestions.length ? programQuestions : DEFAULT_PROGRAM_QUESTIONS,
    itemExtraOptions: itemExtraOptions.length ? itemExtraOptions : DEFAULT_ITEM_OPTIONS,
    periodOptions: DEFAULT_PERIOD_OPTIONS
  };
}

function updateConfig_(config) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  ensureConfigSheets_(ss);

  writeSheet_(ss, 'Config_Texts', ['key', 'value'], [
    ['eventName', config.eventName || CONFIG.EVENT_NAME],
    ['organizerName', config.organizerName || 'Shizuoka Kita Junior and Senior High School']
  ]);

  writeSheet_(ss, 'Config_Schools', ['school', 'country'], (config.schools || DEFAULT_SCHOOLS).map(function (s) {
    return [s.school || '', s.country || 'Other'];
  }));

  writeSheet_(ss, 'Config_EventDates', ['value', 'label', 'short'], (config.eventDates || EVENT_DATES).map(function (d) {
    return [d.value || '', d.label || d.value || '', d.short || d.label || d.value || ''];
  }));

  const timelineRows = [];
  const timeline = config.timeline || DEFAULT_TIMELINE;
  Object.keys(timeline).forEach(function (date) {
    (timeline[date] || []).forEach(function (row) {
      timelineRows.push([date, row[0] || '', row[1] || '', row[2] || '']);
    });
  });
  writeSheet_(ss, 'Config_Timeline', ['date', 'time', 'program', 'venue'], timelineRows);

  writeSheet_(ss, 'Config_ProgramQuestions', ['text', 'datesJson', 'teacherOnly', 'accommodationOnly', 'general'], (config.programQuestions || DEFAULT_PROGRAM_QUESTIONS).map(function (q) {
    return [q.text || '', JSON.stringify(q.dates || []), !!q.teacherOnly, !!q.accommodationOnly, !!q.general];
  }));

  writeSheet_(ss, 'Config_ItemOptions', ['label'], (config.itemExtraOptions || DEFAULT_ITEM_OPTIONS).map(function (label) {
    return [label];
  }));

  return getConfig_();
}

function ensureConfigSheets_(ss) {
  const sheets = {
    Config_Texts: { header: ['key', 'value'], rows: [['eventName', CONFIG.EVENT_NAME], ['organizerName', 'Shizuoka Kita Junior and Senior High School']] },
    Config_Schools: { header: ['school', 'country'], rows: DEFAULT_SCHOOLS.map(function (s) { return [s.school, s.country]; }) },
    Config_EventDates: { header: ['value', 'label', 'short'], rows: EVENT_DATES.map(function (d) { return [d.value, d.label, d.short]; }) },
    Config_Timeline: { header: ['date', 'time', 'program', 'venue'], rows: timelineDefaultRows_() },
    Config_ProgramQuestions: { header: ['text', 'datesJson', 'teacherOnly', 'accommodationOnly', 'general'], rows: DEFAULT_PROGRAM_QUESTIONS.map(function (q) { return [q.text, JSON.stringify(q.dates || []), !!q.teacherOnly, !!q.accommodationOnly, !!q.general]; }) },
    Config_ItemOptions: { header: ['label'], rows: DEFAULT_ITEM_OPTIONS.map(function (x) { return [x]; }) }
  };

  Object.keys(sheets).forEach(function (name) {
    let sheet = ss.getSheetByName(name);
    if (!sheet) sheet = ss.insertSheet(name);
    if (sheet.getLastRow() === 0) {
      writeSheet_(ss, name, sheets[name].header, sheets[name].rows);
    }
  });
}

function timelineDefaultRows_() {
  const rows = [];
  Object.keys(DEFAULT_TIMELINE).forEach(function (date) {
    DEFAULT_TIMELINE[date].forEach(function (row) {
      rows.push([date, row[0], row[1], row[2]]);
    });
  });
  return rows;
}

function readRows_(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 2) return [];
  return sheet.getRange(2, 1, sheet.getLastRow() - 1, Math.max(1, sheet.getLastColumn())).getValues();
}

function writeSheet_(ss, sheetName, header, rows) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);
  sheet.clearContents();
  sheet.getRange(1, 1, 1, header.length).setValues([header]);
  if (rows && rows.length) {
    sheet.getRange(2, 1, rows.length, header.length).setValues(rows);
  }
  sheet.setFrozenRows(1);
}

function parseJsonSafe_(text, fallback) {
  try { return JSON.parse(String(text || '')); } catch (err) { return fallback; }
}

function toBool_(value) {
  return value === true || String(value).toLowerCase() === 'true' || String(value) === '1';
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
  .page { position:relative; width:210mm; height:297mm; overflow:hidden; color:#102033; background:linear-gradient(180deg,#fff 0%,#f8fbff 100%); }
  .page:before { content:""; position:absolute; inset:12mm; border:.7mm solid rgba(16,36,63,.78); border-radius:1.4mm; box-sizing:border-box; }
  .page:after { content:""; position:absolute; inset:16mm; border:.30mm solid rgba(197,160,87,.72); box-sizing:border-box; }
  .accent-top { position:absolute; top:-46mm; right:-38mm; width:126mm; height:84mm; border-radius:0 0 0 55mm; background:linear-gradient(135deg,rgba(24,166,200,.95),rgba(16,36,63,.98)); transform:rotate(-4deg); }
  .accent-top:after { content:""; position:absolute; left:14mm; bottom:-8mm; width:96mm; height:12mm; border-radius:999px; background:rgba(197,160,87,.88); transform:rotate(-8deg); }
  .accent-bottom { position:absolute; left:-54mm; bottom:-58mm; width:132mm; height:98mm; border-radius:0 70mm 0 0; background:linear-gradient(135deg,rgba(16,36,63,.96),rgba(19,95,159,.76)); transform:rotate(-3deg); }
  .content { position:relative; z-index:1; height:100%; padding:26mm 25mm 22mm; text-align:center; box-sizing:border-box; display:flex; flex-direction:column; align-items:center; }
  .logo-row { width:100%; text-align:left; min-height:24mm; }
  .skysef { width:58mm; max-height:23mm; object-fit:contain; background:#fff; padding:1.5mm 2mm; border-radius:1.5mm; }
  .kicker { margin:16mm 0 0; color:#135f9f; text-transform:uppercase; font-size:10.4pt; letter-spacing:.13em; font-weight:800; line-height:1.35; }
  h1 { margin:5mm 0 0; color:#10243f; line-height:1; letter-spacing:-.02em; }
  h1 .big { display:block; font-size:42pt; font-weight:900; letter-spacing:-.025em; }
  h1 .small { display:block; margin-top:2mm; font-size:15.2pt; text-transform:uppercase; letter-spacing:.28em; color:#c5a057; font-weight:900; }
  .awarded { margin:14mm 0 0; font-size:14.5pt; line-height:1.35; color:#516173; font-weight:500; }
  .recipient { width:150mm; margin:6mm auto 0; padding:5mm 5mm 4.8mm; border-top:.35mm solid rgba(197,160,87,.72); border-bottom:.35mm solid rgba(197,160,87,.72); background:rgba(255,255,255,.82); }
  .name { min-height:13mm; display:flex; align-items:center; justify-content:center; font-size:31pt; line-height:1.08; font-weight:900; color:#071a31; word-wrap:break-word; }
  .school { min-height:8mm; display:flex; align-items:center; justify-content:center; margin-top:1.5mm; font-size:14pt; line-height:1.25; color:#33506d; font-weight:800; word-wrap:break-word; }
  .desc { margin:10.5mm auto 0; width:150mm; font-size:15.2pt; line-height:1.58; color:#18314f; font-weight:500; }
  .footer { width:150mm; margin-top:auto; padding-bottom:2mm; display:flex; justify-content:flex-end; align-items:flex-end; }
  .footer-right { width:92mm; text-align:right; display:flex; flex-direction:column; align-items:flex-end; gap:4.2mm; }
  .org { width:92mm; display:flex; justify-content:flex-end; align-items:center; gap:3.2mm; }
  .school-logo { order:2; width:19mm; height:auto; object-fit:contain; flex:0 0 auto; }
  .org-name { order:1; max-width:66mm; font-size:9.6pt; line-height:1.24; letter-spacing:.05em; text-transform:uppercase; font-weight:900; color:#18314f; }
  .sig { position:relative; width:78mm; min-height:24mm; display:flex; flex-direction:column; align-items:flex-end; justify-content:flex-end; padding:0 8mm 1.5mm 0; }
  .sig-line { display:none; }
  .principal-name { position:relative; z-index:2; font-size:15.6pt; line-height:1.08; font-weight:900; color:#10243f; text-align:right; }
  .principal-title { position:relative; z-index:2; margin-top:1mm; font-size:10.2pt; line-height:1.1; font-weight:800; color:#304b6e; text-align:right; }
  .seal { position:absolute; z-index:3; width:21mm; height:22mm; right:0; bottom:.5mm; object-fit:contain; opacity:.76; }
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
      <div class="footer"><div class="footer-right">
        <div class="org"><img class="school-logo" src="${CONFIG.LOGO_SCHOOL_URL}"><div class="org-name">Shizuoka Kita Junior and Senior High School</div></div>
        <div class="sig"><div class="sig-line"></div><div class="principal-name">Hisao Ohashi</div><div class="principal-title">Principal</div><img class="seal" src="${CONFIG.SEAL_URL}"></div>
      </div></div>
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
