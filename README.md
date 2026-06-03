# SKYSEF Questionnaire and Certificate System

This repository publishes a SKYSEF questionnaire page and generates an individual certificate of participation after questionnaire submission.

## Main functions

- The first screen is the questionnaire form.
- After submission, the page transitions to the certificate screen.
- The participant's name and school name are inserted into the certificate.
- The certificate can be downloaded as a PDF.
- An additional **Open PDF** button is included for smartphone browsers, so participants can open the PDF and save/share it from the mobile browser menu.
- The generated PDF is not uploaded to GitHub Pages and is not stored as a public file.
- Questionnaire responses can optionally be sent to Google Apps Script and saved in a private spreadsheet.

## Privacy design

The certificate PDF is generated on the participant's device. It is not saved in this repository, not uploaded to GitHub Pages, and no public URL for the generated PDF is created. Therefore, another participant cannot access someone else's generated certificate from the public site.

If response collection is needed, set a private endpoint in `public/assets/survey-certificate.js`:

```js
const SURVEY_ENDPOINT = "";
```

Example:

```js
const SURVEY_ENDPOINT = "https://script.google.com/macros/s/XXXXX/exec";
```

## GitHub Pages

The public site is in:

```text
public/
```

The workflow file is:

```text
.github/workflows/pages.yml
```

After pushing to GitHub, set:

```text
Settings → Pages → Source → GitHub Actions
```

## Google Apps Script response collection

1. Create a Google Spreadsheet.
2. Open Extensions → Apps Script.
3. Paste `apps-script/SurveyWebhook.gs`.
4. Deploy as a Web App.
5. Set access to `Anyone`.
6. Copy the Web App URL.
7. Paste it into `SURVEY_ENDPOINT` in `public/assets/survey-certificate.js`.

## Local preview

Open `public/index.html` in a browser, or serve it with a local web server.


## Complete ZIP notes

This package is a complete repository. It includes:

- `public/` for GitHub Pages
- `.github/workflows/pages.yml` for automatic deployment
- `apps-script/SurveyWebhook.gs` for optional Google Spreadsheet collection
- `functions/` for an optional server-side PDF generation approach
- `scripts/` for PowerShell deployment

The current public workflow publishes only `public/`.
