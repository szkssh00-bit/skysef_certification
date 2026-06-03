# Push this complete package as a new/rebuilt repository.
# Run this script after extracting the ZIP.

$RepoUrl = "https://github.com/szkssh00-bit/skysef_certification.git"
$SourcePath = Split-Path -Parent $MyInvocation.MyCommand.Path
$PackageRoot = Split-Path -Parent $SourcePath

Set-Location $PackageRoot

if (!(Test-Path ".git")) {
  git init
}

git branch -M main
git remote remove origin 2>$null
git remote add origin $RepoUrl
git add .
git commit -m "Deploy complete SKYSEF questionnaire and certificate system"
git push -u origin main

Write-Host "Done. Check GitHub Actions." -ForegroundColor Green
Write-Host "https://szkssh00-bit.github.io/skysef_certification/" -ForegroundColor Green
