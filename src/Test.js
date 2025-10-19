/**
 * Test functions for development and debugging
 * Execute these functions in Apps Script Editor to verify functionality
 */

/**
 * Test: Check authentication status
 */
function testAuth() {
  Logger.log('=== Testing Authentication ===');

  try {
    const isAuth = isAuthenticated();
    Logger.log('認証状態: ' + isAuth);

    if (!isAuth) {
      const authUrl = getAuthorizationUrl();
      Logger.log('認証URL: ' + authUrl);
      Logger.log('ブラウザでこのURLを開いて認証してください');
    } else {
      Logger.log('✓ 認証済みです');
    }
  } catch (error) {
    Logger.log('❌ エラー: ' + error.message);
  }
}

/**
 * Test: Fetch user issues from GitHub
 */
function testFetchIssues() {
  Logger.log('=== Testing Fetch Issues ===');

  try {
    const issues = fetchUserIssues();

    if (!issues) {
      Logger.log('❌ 認証されていません');
      return;
    }

    Logger.log('取得したissue数: ' + issues.length);

    if (issues.length > 0) {
      Logger.log('\n最初のissue:');
      Logger.log(JSON.stringify(issues[0], null, 2));

      Logger.log('\n全issue一覧:');
      issues.forEach((issue, index) => {
        Logger.log((index + 1) + '. #' + issue.number + ' - ' + issue.title);
        Logger.log('   Repository: ' + issue.repository);
        Logger.log('   URL: ' + issue.url);
      });
    } else {
      Logger.log('アサインされたissueがありません');
    }
  } catch (error) {
    Logger.log('❌ エラー: ' + error.message);
  }
}

/**
 * Test: Build main card UI
 */
function testUI() {
  Logger.log('=== Testing UI ===');

  try {
    const card = buildMainCard();
    Logger.log('✓ Card作成成功 (通常)');
    Logger.log('Card object: ' + (card ? 'OK' : 'NG'));

    const loadingCard = buildMainCard(true);
    Logger.log('✓ Card作成成功 (ローディング)');
    Logger.log('Loading Card object: ' + (loadingCard ? 'OK' : 'NG'));
  } catch (error) {
    Logger.log('❌ エラー: ' + error.message);
    Logger.log('Stack: ' + error.stack);
  }
}

/**
 * Test: Simulate refresh action
 */
function testRefresh() {
  Logger.log('=== Testing Refresh Action ===');

  try {
    const response = onRefreshIssues({});
    Logger.log('✓ Refresh action実行成功');
    Logger.log('Response object: ' + (response ? 'OK' : 'NG'));
  } catch (error) {
    Logger.log('❌ エラー: ' + error.message);
    Logger.log('Stack: ' + error.stack);
  }
}

/**
 * Test: Create a test issue (use with caution)
 */
function testCreateIssue() {
  Logger.log('=== Testing Create Issue ===');

  const owner = PropertiesService.getScriptProperties().getProperty('GITHUB_REPO_OWNER');
  const repo = PropertiesService.getScriptProperties().getProperty('GITHUB_REPO_NAME');

  if (!owner || !repo) {
    Logger.log('❌ GITHUB_REPO_OWNER と GITHUB_REPO_NAME をスクリプトプロパティに設定してください');
    return;
  }

  try {
    const testIssue = createGitHubIssue(
      owner,
      repo,
      '[TEST] テストissue from GAS',
      'これはGoogle Apps Scriptからのテスト作成です。\n\n作成日時: ' + new Date().toISOString()
    );

    Logger.log('✓ Issue作成成功');
    Logger.log('Issue #' + testIssue.number);
    Logger.log('URL: ' + testIssue.url);
  } catch (error) {
    Logger.log('❌ エラー: ' + error.message);
  }
}

/**
 * Test: Check script properties configuration
 */
function testConfig() {
  Logger.log('=== Testing Configuration ===');

  const properties = PropertiesService.getScriptProperties();
  const clientId = properties.getProperty('GITHUB_CLIENT_ID');
  const clientSecret = properties.getProperty('GITHUB_CLIENT_SECRET');
  const owner = properties.getProperty('GITHUB_REPO_OWNER');
  const repo = properties.getProperty('GITHUB_REPO_NAME');

  Logger.log('GITHUB_CLIENT_ID: ' + (clientId ? '✓ 設定済み' : '❌ 未設定'));
  Logger.log('GITHUB_CLIENT_SECRET: ' + (clientSecret ? '✓ 設定済み' : '❌ 未設定'));
  Logger.log('GITHUB_REPO_OWNER: ' + (owner ? '✓ ' + owner : '⚠️ 未設定（任意）'));
  Logger.log('GITHUB_REPO_NAME: ' + (repo ? '✓ ' + repo : '⚠️ 未設定（任意）'));

  if (!clientId || !clientSecret) {
    Logger.log('\n⚠️ 必須のスクリプトプロパティが未設定です');
    Logger.log('プロジェクトの設定 > スクリプトプロパティ で設定してください');
  }
}

/**
 * Test: Reset authentication (for testing)
 */
function testResetAuth() {
  Logger.log('=== Resetting Authentication ===');

  try {
    resetGitHubAuth();
    Logger.log('✓ 認証をリセットしました');
    Logger.log('再度認証するには testAuth() を実行してください');
  } catch (error) {
    Logger.log('❌ エラー: ' + error.message);
  }
}

/**
 * Run all tests
 */
function runAllTests() {
  Logger.log('========================================');
  Logger.log('  Google Calendar GitHub Tracker Tests');
  Logger.log('========================================\n');

  testConfig();
  Logger.log('\n');

  testAuth();
  Logger.log('\n');

  testFetchIssues();
  Logger.log('\n');

  testUI();
  Logger.log('\n');

  testRefresh();

  Logger.log('\n========================================');
  Logger.log('  Tests Complete');
  Logger.log('========================================');
}
