# Google Apps Script setup

1. Open the target Google Spreadsheet.
2. Open **Extensions** → **Apps Script**.
3. Delete the default code.
4. Paste the full contents of `apps-script/Code.gs`.
5. Save the script.
6. Click **Deploy** → **New deployment**.
7. Select **Web app**.
8. Use the following settings:
   - Execute as: **Me**
   - Who has access: **Anyone**
9. Deploy and authorize the script.
10. Copy the Web App URL ending in `/exec`.
11. Paste it into `public/assets/survey-certificate.js`.

```js
const SURVEY_ENDPOINT = "https://script.google.com/macros/s/XXXXX/exec";
```

After updating the endpoint, commit and push the repository again.

```powershell
git add .
git commit -m "Set Apps Script endpoint"
git push
```

# Privacy

The PDF file is created by Apps Script and saved in the specified Drive folder without public sharing settings. The participant receives the PDF data directly as a response to their own submission. GitHub Pages does not store PDF files.

# Access-load handling

The backend uses `LockService` to serialize spreadsheet writes. The front end disables the submit button during processing and retries failed submissions. The page does not transition to the certificate screen until the backend confirms that the response was accepted.
