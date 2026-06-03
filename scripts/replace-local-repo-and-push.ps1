# Replace the local skysef_certification repository with this complete package and push to GitHub.
# 1. Extract this ZIP to Downloads.
# 2. Run this script from PowerShell.

$Downloads = "C:\Users\SSH2026\Downloads"
$RepoPath = Join-Path $Downloads "skysef-certificate-system"
$SourcePath = Split-Path -Parent $MyInvocation.MyCommand.Path
$PackageRoot = Split-Path -Parent $SourcePath
$RepoUrl = "https://github.com/szkssh00-bit/skysef_certification.git"

if (!(Test-Path $RepoPath)) {
  Set-Location $Downloads
  git clone $RepoUrl skysef-certificate-system
}

Set-Location $RepoPath

# Keep .git, replace actual project files.
Get-ChildItem -Force | Where-Object { $_.Name -ne ".git" } | Remove-Item -Recurse -Force
Copy-Item -Path (Join-Path $PackageRoot "*") -Destination $RepoPath -Recurse -Force

# Ensure workflow exists.
New-Item -ItemType Directory -Force -Path ".github\workflows" | Out-Null

git add .
git commit -m "Update complete SKYSEF questionnaire and certificate system"
git push

Write-Host "Done. Check GitHub Actions." -ForegroundColor Green
Write-Host "https://szkssh00-bit.github.io/skysef_certification/" -ForegroundColor Green
