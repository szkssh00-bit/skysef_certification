# Use this when the current Git repository is:
# C:\Users\SSH2026\Downloads\skysef-certificate-system
# and the package contents are one level below it.

$RepoRoot = "C:\Users\SSH2026\Downloads\skysef-certificate-system"
$SourceRoot = "C:\Users\SSH2026\Downloads\skysef-certificate-system\skysef-certificate-system"

Set-Location $RepoRoot

Copy-Item -Path "$SourceRoot\public" -Destination "$RepoRoot\public" -Recurse -Force
Copy-Item -Path "$SourceRoot\apps-script" -Destination "$RepoRoot\apps-script" -Recurse -Force
Copy-Item -Path "$SourceRoot\docs" -Destination "$RepoRoot\docs" -Recurse -Force
Copy-Item -Path "$SourceRoot\README.md" -Destination "$RepoRoot\README.md" -Force

@'
name: Deploy static site to GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Pages
        uses: actions/configure-pages@v5
      - name: Add nojekyll
        run: touch ./public/.nojekyll
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./public
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
'@ | Set-Content -Path "$RepoRoot\.github\workflows\pages.yml" -Encoding UTF8

git add .
git commit -m "Update SKYSEF questionnaire and certificate generator"
git push
