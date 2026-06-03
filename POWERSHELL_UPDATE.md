# PowerShell update procedure

If the local Git folder still exists:

```powershell
Set-Location "C:\Users\SSH2026\Downloads\skysef-certificate-system"

git pull
```

If the local Git folder was deleted:

```powershell
Set-Location "C:\Users\SSH2026\Downloads"
git clone https://github.com/szkssh00-bit/skysef_certification.git skysef-certificate-system
```

To replace the repository contents with this ZIP package, extract the ZIP and run:

```powershell
Set-Location "C:\Users\SSH2026\Downloads\skysef_certification_complete\scripts"
.\replace-local-repo-and-push.ps1
```

GitHub Pages URL:

```text
https://szkssh00-bit.github.io/skysef_certification/
```
