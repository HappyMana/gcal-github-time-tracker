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
          // Create button for event creation
          const createEventButton = CardService.newTextButton()
            .setText('📅 予定作成')
            .setOnClickAction(
              CardService.newAction()
                .setFunctionName('onCreateEventFromIssue')
                .setParameters({
                  'issueNumber': String(issue.number),
                  'issueTitle': issue.title,
                  'issueUrl': issue.url,
                  'repository': issue.repository
                })
            );

          const issueWidget = CardService.newDecoratedText()
            .setText('<b>#' + issue.number + '</b> ' + issue.title)
            .setBottomLabel('📁 ' + issue.repository)
            .setOpenLink(CardService.newOpenLink().setUrl(issue.url))
            .setWrapText(true)
            .setButton(createEventButton);

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

/**
 * Handles create event button click from issue
 * Shows event creation form
 * @param {Object} e - Event object with issue parameters
 * @return {ActionResponse} Response with event creation card
 */
function onCreateEventFromIssue(e) {
  Logger.log('onCreateEventFromIssue triggered');

  const params = e.parameters;
  const issueNumber = params.issueNumber;
  const issueTitle = params.issueTitle;
  const issueUrl = params.issueUrl;
  const repository = params.repository;

  Logger.log('Creating event for issue #' + issueNumber);

  // Build event creation card
  const card = buildEventCreationCard(issueNumber, issueTitle, issueUrl, repository);

  const navigation = CardService.newNavigation()
    .pushCard(card);

  return CardService.newActionResponseBuilder()
    .setNavigation(navigation)
    .build();
}

/**
 * Builds the event creation form card
 * @param {string} issueNumber - Issue number
 * @param {string} issueTitle - Issue title
 * @param {string} issueUrl - Issue URL
 * @param {string} repository - Repository name
 * @return {Card} Event creation card
 */
function buildEventCreationCard(issueNumber, issueTitle, issueUrl, repository) {
  const card = CardService.newCardBuilder();

  card.setHeader(
    CardService.newCardHeader()
      .setTitle('📅 予定を作成')
      .setSubtitle('Issue #' + issueNumber)
  );

  const section = CardService.newCardSection();

  // Issue info display
  section.addWidget(
    CardService.newDecoratedText()
      .setText('<b>' + issueTitle + '</b>')
      .setBottomLabel('📁 ' + repository)
  );

  section.addWidget(CardService.newDivider());

  // Event title input (pre-filled with issue info)
  const defaultTitle = '[#' + issueNumber + '] ' + issueTitle;
  section.addWidget(
    CardService.newTextInput()
      .setFieldName('eventTitle')
      .setTitle('予定タイトル')
      .setValue(defaultTitle)
  );

  // Duration selection
  section.addWidget(
    CardService.newSelectionInput()
      .setType(CardService.SelectionInputType.DROPDOWN)
      .setTitle('作業時間')
      .setFieldName('duration')
      .addItem('30分', '0.5', false)
      .addItem('1時間', '1', true)
      .addItem('1.5時間', '1.5', false)
      .addItem('2時間', '2', false)
      .addItem('3時間', '3', false)
      .addItem('4時間', '4', false)
  );

  // Event description (pre-filled with issue URL)
  const defaultDescription = 'Issue: ' + issueUrl + '\n\nリポジトリ: ' + repository;
  section.addWidget(
    CardService.newTextInput()
      .setFieldName('eventDescription')
      .setTitle('説明')
      .setValue(defaultDescription)
      .setMultiline(true)
  );

  section.addWidget(CardService.newDivider());

  // Create button
  section.addWidget(
    CardService.newTextButton()
      .setText('📅 予定を作成')
      .setOnClickAction(
        CardService.newAction()
          .setFunctionName('onSubmitCreateEvent')
          .setParameters({
            'issueNumber': issueNumber,
            'issueUrl': issueUrl
          })
      )
      .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
  );

  card.addSection(section);

  return card.build();
}

/**
 * Handles event creation form submission
 * Creates calendar event with the provided data
 * @param {Object} e - Event object with form inputs
 * @return {ActionResponse} Response with notification
 */
function onSubmitCreateEvent(e) {
  Logger.log('onSubmitCreateEvent triggered');

  try {
    const formInputs = e.formInput;
    const params = e.parameters;

    const eventTitle = formInputs.eventTitle;
    const duration = parseFloat(formInputs.duration);
    const eventDescription = formInputs.eventDescription;
    const issueNumber = params.issueNumber;
    const issueUrl = params.issueUrl;

    Logger.log('Creating event: ' + eventTitle + ', duration: ' + duration + 'h');

    // Get default calendar
    const calendar = CalendarApp.getDefaultCalendar();

    // Set start time to now
    const startTime = new Date();

    // Set end time based on duration
    const endTime = new Date(startTime.getTime() + (duration * 60 * 60 * 1000));

    // Create event
    const event = calendar.createEvent(eventTitle, startTime, endTime, {
      description: eventDescription
    });

    Logger.log('Event created successfully: ' + event.getId());

    // Show success notification and return to main card
    const notification = CardService.newNotification()
      .setText('✅ 予定を作成しました');

    const navigation = CardService.newNavigation()
      .popCard();

    return CardService.newActionResponseBuilder()
      .setNotification(notification)
      .setNavigation(navigation)
      .build();

  } catch (error) {
    Logger.log('Error creating event: ' + error.message);
    Logger.log('Error stack: ' + error.stack);

    const notification = CardService.newNotification()
      .setText('❌ エラー: ' + error.message);

    return CardService.newActionResponseBuilder()
      .setNotification(notification)
      .build();
  }
}
