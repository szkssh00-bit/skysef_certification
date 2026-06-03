# Privacy and deployment notes

## Certificate PDF

The PDF certificate is generated in the participant's browser after questionnaire submission. The PDF is not uploaded to GitHub Pages, not written into the repository, and not assigned a public URL. This design prevents other participants from accessing another participant's generated certificate from the public site.

## Questionnaire data

Questionnaire data are sent to a server only when `SURVEY_ENDPOINT` is set in `public/assets/survey-certificate.js`. If `SURVEY_ENDPOINT` is empty, questionnaire completion and certificate generation work locally on the participant's device, but responses are not stored.

## Smartphone PDF saving

The certificate screen provides two options:

- `Download PDF`: saves the generated file directly when the browser supports file download.
- `Open PDF`: opens the generated PDF in a new tab. This is useful on iOS and Android browsers because participants can use the browser share/save menu.

## Page transition

The first visible screen is the questionnaire. After successful form validation and optional response submission, the page transitions to the certificate screen. Direct access to `#certificate` does not expose another participant's certificate because the certificate values are stored only in the current browser session.
