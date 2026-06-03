# SKYSEF Certification System

This repository contains a GitHub Pages front end and a Google Apps Script backend for SKYSEF questionnaires and private certificate PDF generation.

## Main flow

1. Participants first answer the questionnaire.
2. The answer is sent to Google Apps Script.
3. Apps Script writes all answers to the specified Google Spreadsheet.
4. Apps Script generates an individual certificate PDF.
5. The PDF is saved to the specified private Google Drive folder.
6. The PDF is returned to the participant and downloaded on their device.
7. The page then transitions to the certificate screen.

## Important files

- `public/index.html` — Questionnaire and certificate transition page.
- `public/assets/app.css` — SKYSEF-style responsive UI.
- `public/assets/certificate.css` — certificate preview style.
- `public/assets/survey-certificate.js` — client-side form handling and PDF download.
- `apps-script/Code.gs` — Google Apps Script backend.
- `.github/workflows/pages.yml` — GitHub Pages deployment workflow.

## Required Apps Script deployment

Deploy `apps-script/Code.gs` as a Web App.

Deployment settings:

- Execute as: Me
- Who has access: Anyone

Then paste the Web App URL into this line in `public/assets/survey-certificate.js`:

```js
const SURVEY_ENDPOINT = "https://script.google.com/macros/s/XXXXX/exec";
```

## Configured destinations

The Apps Script is already configured to use:

- Spreadsheet ID: `1xMvjC6CKuLVrc9AkisQMHkBmxmOsIPkn9Yu0IGAUZlY`
- Drive folder ID: `1-n452WCDY7syLZgEOKTvsjp3JsWthOZi`

The Google account used to deploy Apps Script must have permission to edit the Spreadsheet and add files to the Drive folder.
