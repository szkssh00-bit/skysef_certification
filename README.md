# SKYSEF Certification System v12

This package keeps the fast user-facing algorithm from v11 and updates only the certificate layout and matching GAS fallback template.

## Main changes

- Keeps the fast flow: Participant information -> Next -> browser-side certificate PDF preparation -> Questionnaire -> Submit -> immediate certificate view.
- Redesigns the certificate using a cleaner modern portrait layout.
- Removes unnecessary line breaks in the certificate description.
- Moves the school logo and school name to the lower-right signature area.
- Places Hisao Ohashi / Principal below the school block with the seal over the signature area.
- Reduces mixed font use for a more consistent visual tone.

## Required GAS update

Paste `apps-script/Code.gs` into Apps Script and deploy a new version.

## GitHub update

Use `scripts/replace-local-repo-and-push.ps1` or the PowerShell commands provided in ChatGPT.
