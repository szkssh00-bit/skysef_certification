# SKYSEF Certificate System

SKYSEF 2026 の参加証明書を HTML + CSS で管理し、GitHub Pagesでプレビューし、Googleフォーム送信を契機にPDFを生成するためのテンプレートです。

## 構成

```text
public/                     GitHub Pagesで公開する証明書プレビュー
public/assets/              CSS、ロゴ、賞状枠、印影画像
functions/                  Cloud Run functions / Cloud Functions 用PDF生成API
apps-script/FormWebhook.gs  Googleフォーム送信時のWebhook連携スクリプト
.github/workflows/pages.yml GitHub Pages自動公開
```

## できること

1. `public/index.html` で証明書デザインを確認できます。
2. URLパラメータで氏名と学校名を差し替えられます。

```text
https://<ユーザー名>.github.io/<リポジトリ名>/?name=Taro%20Yamada&school=Example%20High%20School
```

3. `functions/` をGoogle Cloudへデプロイすると、JSONからPDFを生成できます。
4. Apps ScriptからCloud Functionへ送信し、返却されたPDFをメール添付できます。

## ローカル確認

```bash
cd functions
npm install
npm run start
```

別ターミナルから次を実行します。

```bash
curl -X POST http://localhost:8080 \
  -H "Content-Type: application/json" \
  -d '{"name":"Taro Yamada","school":"Example High School"}' \
  --output certificate.pdf
```

## GitHub Pages公開

1. このフォルダをGitHubリポジトリへpushします。
2. GitHubの `Settings > Pages` で `GitHub Actions` を選びます。
3. `main` ブランチにpushすると、`.github/workflows/pages.yml` により `public/` が公開されます。

## Cloud Functions / Cloud Run functions デプロイ

```bash
cd functions
npm install
gcloud functions deploy generateCertificate \
  --gen2 \
  --runtime=nodejs22 \
  --region=asia-northeast1 \
  --source=. \
  --entry-point=generateCertificate \
  --trigger-http \
  --allow-unauthenticated \
  --set-env-vars WEBHOOK_API_KEY="任意の長いランダム文字列"
```

SendGridでCloud Function側から直接メール送信する場合は、次も設定します。

```bash
--set-env-vars WEBHOOK_API_KEY="...",SENDGRID_API_KEY="...",MAIL_FROM="..."
```

Apps Script側でPDFを受け取り、MailAppで送信する場合は、SendGrid設定は不要です。

## Googleフォーム連携

1. Googleフォームの回答先スプレッドシートを開きます。
2. `拡張機能 > Apps Script` を開きます。
3. `apps-script/FormWebhook.gs` の内容を貼り付けます。
4. スクリプトプロパティに `FUNCTION_URL` と `WEBHOOK_API_KEY` を設定します。
5. インストール型トリガーで `onFormSubmit` を「フォーム送信時」に設定します。

フォームの項目名が異なる場合は、`FIELD_MAP` を修正してください。
