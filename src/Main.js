/**
 * Main entry point for the Google Calendar Add-on
 * This function is triggered when the add-on is opened in Google Calendar
 * @param {Object} e - Event object from Calendar add-on
 * @return {Card} The card to display in the sidebar
 */
function onHomepage(e) {
  Logger.log('onHomepage triggered');
  return buildMainCard();
}

/**
 * Builds the main card UI for the sidebar
 * @param {boolean} isLoading - Whether to show loading state
 * @return {Card} The card to display in the sidebar
 */
function buildMainCard(isLoading) {
  const card = CardService.newCardBuilder();

  // Check authentication status
  const authenticated = isAuthenticated();

  // Build header
  const header = CardService.newCardHeader()
    .setTitle('GitHub Issues Tracker');

  if (isLoading) {
    header.setSubtitle('Loading...');
  } else {
    header.setSubtitle(authenticated ? 'Connected' : 'Not Connected');
  }

  card.setHeader(header);

  const section = CardService.newCardSection();

  // Show loading state
  if (isLoading) {
    section.addWidget(
      CardService.newTextParagraph()
        .setText('🔄 Loading your issues from GitHub...')
    );
    card.addSection(section);
    return card.build();
  }

  // Show authentication required
  if (!authenticated) {
    section.addWidget(
      CardService.newTextParagraph()
        .setText('🔐 Please authenticate with GitHub to view your issues.')
    );

    const authUrl = getAuthorizationUrl();
    if (authUrl) {
      section.addWidget(
        CardService.newTextButton()
          .setText('Connect to GitHub')
          .setOpenLink(CardService.newOpenLink()
            .setUrl(authUrl)
            .setOpenAs(CardService.OpenAs.OVERLAY))
          .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
      );
    }
  } else {
    // Show issues list
    try {
      const issues = fetchUserIssues();

      if (!issues || issues.length === 0) {
        section.addWidget(
          CardService.newTextParagraph()
            .setText('📭 No issues assigned to you.')
        );
      } else {
        // Show issue count
        section.addWidget(
          CardService.newDecoratedText()
            .setText('<b>Your Issues</b>')
            .setBottomLabel(issues.length + ' open issue' + (issues.length !== 1 ? 's' : ''))
            .setWrapText(false)
        );

        section.addWidget(CardService.newDivider());

        // Show first 10 issues
        const displayIssues = issues.slice(0, 10);
        displayIssues.forEach((issue, index) => {
          const issueWidget = CardService.newDecoratedText()
            .setText('<b>#' + issue.number + '</b> ' + issue.title)
            .setBottomLabel('📁 ' + issue.repository)
            .setOpenLink(CardService.newOpenLink().setUrl(issue.url))
            .setWrapText(true);

          section.addWidget(issueWidget);

          // Add divider between issues (but not after the last one)
          if (index < displayIssues.length - 1) {
            section.addWidget(CardService.newDivider());
          }
        });

        if (issues.length > 10) {
          section.addWidget(CardService.newDivider());
          section.addWidget(
            CardService.newTextParagraph()
              .setText('<i>... and ' + (issues.length - 10) + ' more issue' +
                      (issues.length - 10 !== 1 ? 's' : '') + '</i>')
          );
        }
      }

      // Add refresh button
      section.addWidget(CardService.newDivider());
      section.addWidget(
        CardService.newTextButton()
          .setText('🔄 Refresh Issues')
          .setOnClickAction(
            CardService.newAction()
              .setFunctionName('onRefreshIssues')
          )
          .setTextButtonStyle(CardService.TextButtonStyle.TEXT)
      );

    } catch (error) {
      Logger.log('Error in buildMainCard: ' + error.message);
      Logger.log('Error stack: ' + error.stack);

      section.addWidget(
        CardService.newTextParagraph()
          .setText('❌ <b>Error loading issues</b>')
      );
      section.addWidget(
        CardService.newTextParagraph()
          .setText('<font color="#d93025">' + error.message + '</font>')
      );
      section.addWidget(CardService.newDivider());
      section.addWidget(
        CardService.newTextButton()
          .setText('🔄 Try Again')
          .setOnClickAction(
            CardService.newAction()
              .setFunctionName('onRefreshIssues')
          )
          .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
      );
    }
  }

  card.addSection(section);

  return card.build();
}

/**
 * Handles refresh button click
 * Shows a loading state while fetching new data
 * @param {Object} e - Event object
 * @return {ActionResponse} Response with updated card
 */
function onRefreshIssues(e) {
  Logger.log('onRefreshIssues triggered');

  // Build action response with updated card
  const navigation = CardService.newNavigation()
    .updateCard(buildMainCard(false));

  return CardService.newActionResponseBuilder()
    .setNavigation(navigation)
    .build();
}
