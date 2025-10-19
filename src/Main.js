/**
 * Main entry point for the Google Calendar Add-on
 * This function is triggered when the add-on is opened in Google Calendar
 */
function onHomepage(e) {
  Logger.log('onHomepage triggered');
  return buildMainCard();
}

/**
 * Builds the main card UI for the sidebar
 * @return {Card} The card to display in the sidebar
 */
function buildMainCard() {
  const card = CardService.newCardBuilder();

  // Check authentication status
  const authenticated = isAuthenticated();

  card.setHeader(
    CardService.newCardHeader()
      .setTitle('GitHub Issues Tracker')
      .setSubtitle(authenticated ? 'Connected' : 'Not Connected')
  );

  const section = CardService.newCardSection();

  if (!authenticated) {
    // Show authentication instructions
    section.addWidget(
      CardService.newTextParagraph()
        .setText('Please authenticate with GitHub to view your issues.')
    );

    const authUrl = getAuthorizationUrl();
    if (authUrl) {
      section.addWidget(
        CardService.newTextButton()
          .setText('Connect to GitHub')
          .setOpenLink(CardService.newOpenLink()
            .setUrl(authUrl)
            .setOpenAs(CardService.OpenAs.OVERLAY))
      );
    }
  } else {
    // Show issues list
    try {
      const issues = fetchUserIssues();

      if (!issues || issues.length === 0) {
        section.addWidget(
          CardService.newTextParagraph()
            .setText('No issues assigned to you.')
        );
      } else {
        section.addWidget(
          CardService.newTextParagraph()
            .setText('<b>Your Issues (' + issues.length + ')</b>')
        );

        // Show first 10 issues
        const displayIssues = issues.slice(0, 10);
        displayIssues.forEach(issue => {
          const issueWidget = CardService.newDecoratedText()
            .setText('<b>#' + issue.number + '</b> ' + issue.title)
            .setBottomLabel(issue.repository)
            .setOpenLink(CardService.newOpenLink().setUrl(issue.url));

          section.addWidget(issueWidget);
        });

        if (issues.length > 10) {
          section.addWidget(
            CardService.newTextParagraph()
              .setText('... and ' + (issues.length - 10) + ' more')
          );
        }
      }

      // Add refresh button
      section.addWidget(
        CardService.newTextButton()
          .setText('Refresh Issues')
          .setOnClickAction(
            CardService.newAction()
              .setFunctionName('onRefreshIssues')
          )
      );

    } catch (error) {
      section.addWidget(
        CardService.newTextParagraph()
          .setText('<font color="#ff0000">Error: ' + error.message + '</font>')
      );
    }
  }

  card.addSection(section);

  return card.build();
}

/**
 * Handles refresh button click
 */
function onRefreshIssues(e) {
  Logger.log('onRefreshIssues triggered');
  // TODO: Implement issue refresh logic
  return buildMainCard();
}
