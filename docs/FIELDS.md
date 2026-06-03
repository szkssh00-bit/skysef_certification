# フォーム項目名の対応

Apps Scriptは、Googleフォームの質問タイトルから値を取り出します。
初期設定では、次の候補名に対応しています。

| 内部項目 | Googleフォーム項目名の候補 |
|---|---|
| name | Name, 氏名, Participant Name, 参加者氏名 |
| school | School, 学校名, Affiliation, 所属校 |
| email | Email, メールアドレス, E-mail, 連絡先メールアドレス |

フォームの項目名が異なる場合は、`apps-script/FormWebhook.gs` の `FIELD_MAP` を変更してください。
