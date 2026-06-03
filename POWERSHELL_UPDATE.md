# PowerShell update

```powershell
$ZipPath = "C:\Users\SSH2026\Downloads\skysef_certification_complete_v3.zip"
$RepoPath = "C:\Users\SSH2026\Downloads\skysef_certification"
$TempPath = "C:\Users\SSH2026\Downloads\skysef_certification_complete_v3_temp"
$RepoUrl = "https://github.com/szkssh00-bit/skysef_certification.git"

if (Test-Path $TempPath) { Remove-Item $TempPath -Recurse -Force }
Expand-Archive -Path $ZipPath -DestinationPath $TempPath -Force

if (!(Test-Path $RepoPath)) {
  Set-Location "C:\Users\SSH2026\Downloads"
  git clone $RepoUrl "skysef_certification"
}

$SourceRoot = Get-ChildItem -Path $TempPath -Directory | Select-Object -First 1
Set-Location $RepoPath

Remove-Item ".\public" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item ".\apps-script" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item ".\docs" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item ".\scripts" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item ".\README.md" -Force -ErrorAction SilentlyContinue
Remove-Item ".\POWERSHELL_UPDATE.md" -Force -ErrorAction SilentlyContinue

Copy-Item -Path "$($SourceRoot.FullName)\public" -Destination ".\public" -Recurse -Force
Copy-Item -Path "$($SourceRoot.FullName)\apps-script" -Destination ".\apps-script" -Recurse -Force
Copy-Item -Path "$($SourceRoot.FullName)\docs" -Destination ".\docs" -Recurse -Force
Copy-Item -Path "$($SourceRoot.FullName)\scripts" -Destination ".\scripts" -Recurse -Force
Copy-Item -Path "$($SourceRoot.FullName)\README.md" -Destination ".\README.md" -Force
Copy-Item -Path "$($SourceRoot.FullName)\POWERSHELL_UPDATE.md" -Destination ".\POWERSHELL_UPDATE.md" -Force

New-Item -ItemType Directory -Force -Path ".github\workflows" | Out-Null
Copy-Item -Path "$($SourceRoot.FullName)\.github\workflows\pages.yml" -Destination ".\.github\workflows\pages.yml" -Force

git add .
git commit -m "Update SKYSEF questionnaire and certificate v3"
git push
```
