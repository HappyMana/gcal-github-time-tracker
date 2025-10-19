/**
 * GitHub API integration module
 * Handles authentication and API calls to GitHub
 */

/**
 * Gets the GitHub OAuth2 service
 * Uses OAuth2 for Apps Script library (1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF)
 * @return {OAuth2.Service} The OAuth2 service
 */
function getGitHubService() {
  const clientId = PropertiesService.getScriptProperties().getProperty('GITHUB_CLIENT_ID');
  const clientSecret = PropertiesService.getScriptProperties().getProperty('GITHUB_CLIENT_SECRET');

  if (!clientId || !clientSecret) {
    throw new Error('GitHub OAuth credentials not configured. Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in Script Properties.');
  }

  return OAuth2.createService('github')
    .setAuthorizationBaseUrl('https://github.com/login/oauth/authorize')
    .setTokenUrl('https://github.com/login/oauth/access_token')
    .setClientId(clientId)
    .setClientSecret(clientSecret)
    .setCallbackFunction('authCallback')
    .setPropertyStore(PropertiesService.getUserProperties())
    .setScope('repo user');
}

/**
 * Handles the OAuth callback
 */
function authCallback(request) {
  const service = getGitHubService();
  const authorized = service.handleCallback(request);

  if (authorized) {
    return HtmlService.createHtmlOutput('Success! You can close this tab and return to Google Calendar.');
  } else {
    return HtmlService.createHtmlOutput('Authorization failed. Please try again.');
  }
}

/**
 * Gets the authorization URL for GitHub OAuth
 * @return {string} The authorization URL
 */
function getAuthorizationUrl() {
  const service = getGitHubService();
  if (!service.hasAccess()) {
    return service.getAuthorizationUrl();
  }
  return null;
}

/**
 * Checks if the user is authenticated with GitHub
 * @return {boolean} True if authenticated
 */
function isAuthenticated() {
  const service = getGitHubService();
  return service.hasAccess();
}

/**
 * Resets the OAuth service (for testing/debugging)
 */
function resetGitHubAuth() {
  const service = getGitHubService();
  service.reset();
  Logger.log('GitHub authentication reset');
}

/**
 * Fetches issues assigned to the authenticated user
 * @return {Array} Array of issue objects
 */
function fetchUserIssues() {
  const service = getGitHubService();

  if (!service.hasAccess()) {
    Logger.log('Not authenticated with GitHub');
    return null;
  }

  try {
    const url = 'https://api.github.com/issues?filter=assigned&state=open&per_page=100';
    const response = UrlFetchApp.fetch(url, {
      headers: {
        'Authorization': 'Bearer ' + service.getAccessToken(),
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Google-Apps-Script'
      },
      muteHttpExceptions: true
    });

    const statusCode = response.getResponseCode();
    if (statusCode !== 200) {
      Logger.log('GitHub API error: ' + statusCode + ' - ' + response.getContentText());
      throw new Error('Failed to fetch issues from GitHub (Status: ' + statusCode + ')');
    }

    const issues = JSON.parse(response.getContentText());
    Logger.log('Fetched ' + issues.length + ' issues from GitHub');

    return issues.map(issue => ({
      number: issue.number,
      title: issue.title,
      url: issue.html_url,
      state: issue.state,
      repository: issue.repository_url.split('/').slice(-2).join('/'),
      createdAt: issue.created_at,
      updatedAt: issue.updated_at
    }));

  } catch (error) {
    Logger.log('Error fetching issues: ' + error.message);
    throw error;
  }
}

/**
 * Creates a new issue in the specified repository
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} title - Issue title
 * @param {string} body - Issue body
 * @return {Object} The created issue object
 */
function createGitHubIssue(owner, repo, title, body) {
  const service = getGitHubService();

  if (!service.hasAccess()) {
    Logger.log('Not authenticated with GitHub');
    throw new Error('Not authenticated with GitHub');
  }

  try {
    const url = 'https://api.github.com/repos/' + owner + '/' + repo + '/issues';
    const payload = {
      title: title,
      body: body || ''
    };

    const response = UrlFetchApp.fetch(url, {
      method: 'post',
      headers: {
        'Authorization': 'Bearer ' + service.getAccessToken(),
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Google-Apps-Script',
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });

    const statusCode = response.getResponseCode();
    if (statusCode !== 201) {
      Logger.log('GitHub API error: ' + statusCode + ' - ' + response.getContentText());
      throw new Error('Failed to create issue on GitHub (Status: ' + statusCode + ')');
    }

    const issue = JSON.parse(response.getContentText());
    Logger.log('Created issue #' + issue.number + ' in ' + owner + '/' + repo);

    return {
      number: issue.number,
      title: issue.title,
      url: issue.html_url,
      state: issue.state
    };

  } catch (error) {
    Logger.log('Error creating issue: ' + error.message);
    throw error;
  }
}
