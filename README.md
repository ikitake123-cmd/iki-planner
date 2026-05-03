# 壱岐島 GW旅程プランナー

Google Gemini AIを使った壱岐島旅行プランナーです。

## ファイル構成

```
iki-planner/
├── index.html      # フロントエンド
├── api/
│   └── plan.js     # Gemini APIを呼ぶサーバー関数
└── vercel.json     # Vercel設定
```

## デプロイ手順

### 1. Gemini APIキーを取得
https://aistudio.google.com/apikey にアクセスして無料で取得

### 2. GitHubにアップロード
1. https://github.com/new でリポジトリを作成（例: iki-planner）
2. このフォルダの中身を全部アップロード

### 3. Vercelにデプロイ
1. https://vercel.com でGitHubアカウントでログイン
2. 「Add New Project」→ GitHubのリポジトリを選択
3. 「Environment Variables」に追加:
   - Name: `GEMINI_API_KEY`
   - Value: 取得したAPIキー（AIza...）
4. 「Deploy」ボタンを押す → 完成！

### 4. 独自ドメインを設定（任意）
Vercelのダッシュボード → Domains → お名前.comなどで取得したドメインを設定
