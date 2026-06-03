# Git公開手順

リポジトリをGitHubで新規作成した後、このフォルダで次を実行してください。

```powershell
cd "C:\path\to\skysef-certificate-system"
git init
git branch -M main
git add .
git commit -m "Add SKYSEF certificate system"
git remote add origin https://github.com/<user>/<repository>.git
git push -u origin main
```

PowerShellスクリプトを使う場合は次の通りです。

```powershell
cd "C:\path\to\skysef-certificate-system"
.\scripts\push-to-github.ps1 -RemoteUrl "https://github.com/<user>/<repository>.git"
```

GitHub Pagesは、`Settings > Pages > Build and deployment > Source` で `GitHub Actions` を選んでください。
