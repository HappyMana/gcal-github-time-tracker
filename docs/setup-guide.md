# セットアップガイド

このガイドでは、Google Calendar GitHub Projects Trackerをセットアップして動作確認するまでの手順を説明します。

## 前提条件

- Google アカウント
- GitHub アカウント
- GitHubリポジトリへのアクセス権限
- clasp (Google Apps Script CLI) がインストール済み

## セットアップ手順

### 1. OAuth2 for Apps Script ライブラリの追加

`appsscript.json`に既に設定されていますが、確認してください：

```json
"libraries": [
  {
    "userSymbol": "OAuth2",
    "libraryId": "1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF",
    "version": "43"
  }
]
```

### 2. コードをGoogle Apps Scriptにデプロイ

```bash
# プロジェクトディレクトリで実行
clasp push

# Apps Script Editorを開く
clasp open
```

### 3. GitHub OAuth Appの作成

1. https://github.com/settings/developers にアクセス
2. 「New OAuth App」をクリック
3. 以下の情報を入力：
   - **Application name**: Google Calendar GitHub Tracker (任意)
   - **Homepage URL**: `https://script.google.com`
   - **Authorization callback URL**: `https://script.google.com/macros/d/{YOUR_SCRIPT_ID}/usercallback`
     - `{YOUR_SCRIPT_ID}`は`clasp open`で開いたURLから取得できます
4. 「Register application」をクリック
5. Client IDとClient Secretをコピーして保存

### 4. 環境変数の設定

プロジェクトのルートディレクトリに`.env`ファイルを作成（`.env.example`を参考に）：

```bash
cp .env.example .env
```

`.env`ファイルに以下の値を設定：

```
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here
GITHUB_REPO_OWNER=your_github_username
GITHUB_REPO_NAME=your_repo_name
```

**重要**: `.env`ファイルは`.gitignore`に含まれており、Gitにコミットされません。

### 5. スクリプトプロパティの設定

Apps Script Editor で以下の手順を実行：

1. 左サイドバーの「プロジェクトの設定」（歯車アイコン）をクリック
2. 「スクリプトプロパティ」セクションまでスクロール
3. 「スクリプト プロパティを追加」をクリックして`.env`ファイルの値を追加：

| プロパティ | 値 |
|----------|-----|
| `GITHUB_CLIENT_ID` | `.env`の`GITHUB_CLIENT_ID`の値 |
| `GITHUB_CLIENT_SECRET` | `.env`の`GITHUB_CLIENT_SECRET`の値 |
| `GITHUB_REPO_OWNER` | `.env`の`GITHUB_REPO_OWNER`の値（任意） |
| `GITHUB_REPO_NAME` | `.env`の`GITHUB_REPO_NAME`の値（任意） |

### 6. テストデプロイ

1. Apps Script Editor で「デプロイ」> 「デプロイをテスト」をクリック
2. 「インストール」をクリック
3. Google Calendar (https://calendar.google.com) を開く
4. 右サイドバーにアドオンアイコンが表示されることを確認

### 7. GitHub認証

1. サイドバーのアドオンアイコンをクリック
2. "GitHub Issues Tracker" が表示される
3. "Connect to GitHub" ボタンをクリック
4. GitHub認証画面でアプリケーションを承認
5. 認証成功後、サイドバーに自分にアサインされたissueが表示される

## 動作確認

### 認証が成功した場合

- サイドバーのヘッダーに "Connected" と表示される
- 自分にアサインされたGitHub issueの一覧が表示される
- 各issueは以下の情報を含む：
  - issue番号とタイトル
  - リポジトリ名
  - クリックでGitHubのissueページに遷移

### 認証が必要な場合

- サイドバーのヘッダーに "Not Connected" と表示される
- "Connect to GitHub" ボタンが表示される

### エラーが発生した場合

- エラーメッセージが赤色で表示される
- Apps Script Editorの「実行ログ」で詳細を確認できる

## トラブルシューティング

### "GitHub OAuth credentials not configured" エラー

スクリプトプロパティが正しく設定されているか確認してください。

### 認証画面が表示されない

OAuth CallbackのURLが正しく設定されているか確認してください：
- GitHub OAuth App の設定で以下のURLを確認：
  ```
  https://script.google.com/macros/d/{YOUR_SCRIPT_ID}/usercallback
  ```

### issueが表示されない

- GitHubで自分にアサインされたissueが存在するか確認
- GitHub APIのレート制限に達していないか確認
- Apps Script Editorの実行ログでAPIレスポンスを確認

## 次のステップ

認証とissue一覧の表示が確認できたら、Phase 1 Task 3 (GitHub REST APIでissue一覧を取得) は完了です。

次はPhase 1 Task 4でCardServiceを使った本格的なUIを構築します。
