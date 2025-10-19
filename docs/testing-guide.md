# GASでの動作確認ガイド

Google Apps Scriptでの動作確認方法を説明します。

## 方法1: Apps Script Editorで個別関数をテスト

### 1. Apps Script Editorを開く

```bash
clasp open
```

または https://script.google.com で直接開く

### 2. 関数を選択して実行

1. 上部のツールバーで実行したい関数を選択
   - 例: `isAuthenticated`、`fetchUserIssues`など
2. 「実行」ボタン（▶️）をクリック
3. 初回は権限の承認が必要

### 3. 実行ログを確認

- 左サイドバーの「実行数」をクリック
- または `Ctrl+Enter` / `Cmd+Enter` でログビューを開く
- `Logger.log()` の出力が表示される

### テスト可能な関数

```javascript
// 認証状態を確認
function testAuth() {
  const isAuth = isAuthenticated();
  Logger.log('認証状態: ' + isAuth);

  if (!isAuth) {
    const authUrl = getAuthorizationUrl();
    Logger.log('認証URL: ' + authUrl);
  }
}

// issue一覧を取得
function testFetchIssues() {
  const issues = fetchUserIssues();
  Logger.log('取得したissue数: ' + (issues ? issues.length : 0));
  if (issues && issues.length > 0) {
    Logger.log('最初のissue: ' + JSON.stringify(issues[0], null, 2));
  }
}

// UIを確認
function testUI() {
  const card = buildMainCard();
  Logger.log('Card作成完了: ' + (card ? 'OK' : 'NG'));
}
```

これらのテスト関数を `src/Main.js` や新しいファイルに追加できます。

## 方法2: テストデプロイでGUI確認

### 1. テストデプロイを作成

Apps Script Editor で:
1. 右上の「デプロイ」> 「デプロイをテスト」
2. 「インストール」をクリック

### 2. Google Calendarで確認

1. https://calendar.google.com を開く
2. 右サイドバーにアドオンアイコンが表示される
3. クリックして動作を確認

### 3. リアルタイム更新

- コードを変更したら `clasp push`
- テストデプロイは自動的に最新コードを反映
- ブラウザでリロード（Cmd+R / Ctrl+R）

## 方法3: デバッガーを使用

### ブレークポイントの設定

1. Apps Script Editorでコードの行番号をクリック
2. ブレークポイント（赤丸）が設定される
3. 「実行」ボタンでデバッグ実行
4. ブレークポイントで一時停止し、変数を確認可能

### 変数の確認

デバッグ中に:
- 左サイドバーで変数の値を確認
- ステップ実行（F10）で1行ずつ実行
- ステップイン（F11）で関数内部に入る

## 方法4: Stackdriver Logging

### ログの確認

1. Apps Script Editor > 左サイドバー > 「実行数」
2. 各実行をクリックして詳細を表示
3. エラーやログメッセージを確認

### より詳細なログ

`console.log()` も使用可能（V8ランタイム）:

```javascript
console.log('詳細なデバッグ情報', {
  issues: issues.length,
  authenticated: isAuthenticated()
});
```

## トラブルシューティング

### "未定義の関数" エラー

- `clasp push` でコードをアップロードしたか確認
- ブラウザをリロード

### 権限エラー

- Apps Script Editor > 歯車アイコン > 「プロジェクトの設定」
- マニフェストファイル（appsscript.json）で必要なスコープを確認

### OAuth2エラー

- スクリプトプロパティが正しく設定されているか確認
- GitHub OAuth Appの設定を確認

## 推奨テストフロー

1. **個別関数のテスト** (Apps Script Editor)
   ```
   testAuth() → 認証状態を確認
   testFetchIssues() → API呼び出しを確認
   testUI() → UI構築を確認
   ```

2. **統合テスト** (Test Deploy)
   ```
   Google Calendarでアドオンを開く
   認証フローをテスト
   issue一覧表示を確認
   ```

3. **エラー確認**
   ```
   実行ログでエラーメッセージを確認
   必要に応じてコードを修正
   clasp push して再テスト
   ```

## 便利なTips

### 開発サイクルを高速化

```bash
# 変更を監視して自動プッシュ
clasp push --watch
```

### ログを継続的に確認

```bash
# リアルタイムでログを表示
clasp logs --watch
```

### 認証をリセットしてテスト

Apps Script Editorで実行:
```javascript
function resetAuth() {
  resetGitHubAuth();
  Logger.log('認証をリセットしました');
}
```
