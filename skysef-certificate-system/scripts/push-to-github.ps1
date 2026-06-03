param(
  [Parameter(Mandatory=$true)]
  [string]$RemoteUrl,
  [string]$Branch = "main"
)

git init
git branch -M $Branch
git add .
git commit -m "Add SKYSEF certificate system"
git remote remove origin 2>$null
git remote add origin $RemoteUrl
git push -u origin $Branch
