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

  card.setHeader(
    CardService.newCardHeader()
      .setTitle('GitHub Issues Tracker')
      .setSubtitle('Loading...')
  );

  const section = CardService.newCardSection();

  section.addWidget(
    CardService.newTextParagraph()
      .setText('Welcome to GitHub Issues Tracker for Google Calendar!')
  );

  section.addWidget(
    CardService.newTextButton()
      .setText('Refresh Issues')
      .setOnClickAction(
        CardService.newAction()
          .setFunctionName('onRefreshIssues')
      )
  );

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
