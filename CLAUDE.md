# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This project is a Google Workspace add-on that integrates Google Calendar with GitHub Projects to streamline task management and time tracking. The add-on displays as a sidebar in Google Calendar, showing GitHub issues with their status and accumulated time from calendar events.

**Key functionality:**
- Display GitHub issues in Calendar sidebar with status and total logged time
- Create calendar events linked to GitHub issues
- Create new GitHub issues from calendar events
- Aggregate time spent on issues from calendar entries
- Either manual refresh (Phase 3A) or automatic updates via webhooks (Phase 3B)

## Technology Stack

- **Language:** JavaScript (Google Apps Script)
- **Runtime:** Google Apps Script (GAS)
- **UI Framework:** CardService (Google Workspace add-on cards)
- **APIs:**
  - Google Calendar API (via `CalendarApp` service)
  - GitHub REST API v3
  - GitHub GraphQL API v4 (for GitHub Projects V2)
- **Authentication:** OAuth2 for Apps Script (for GitHub API access)

## Project Structure

```
/src          - Source code (Google Apps Script files: .gs or .js)
/docs         - Documentation including PRD/TRD (prd-trd.md)
```

## Development Setup

This project uses Google Apps Script, which requires specific tooling:

**Using clasp (Google Apps Script CLI):**
```bash
# Install clasp globally
npm install -g @google/clasp

# Login to Google account
clasp login

# Create new project (if not already created)
clasp create --type standalone --title "Google Calendar GitHub Projects Add-on"

# Push code to Google Apps Script
clasp push

# Pull latest code from Google Apps Script
clasp pull

# Open project in browser
clasp open
```

**Manual deployment via Apps Script Editor:**
1. Visit https://script.google.com
2. Create new project or open existing
3. Copy/paste code files
4. Configure `appsscript.json` manifest

## Configuration Files

**appsscript.json** - Manifest file for Google Workspace add-on:
- Define add-on scopes (Calendar, external API access)
- Configure add-on homepage and context triggers
- Set up OAuth2 credentials for GitHub API

Required OAuth2 scopes:
- `https://www.googleapis.com/auth/calendar.events` - Read/write calendar events
- `https://www.googleapis.com/auth/script.external_request` - Call GitHub API

## Architecture

### Core Components

1. **UI Layer (CardService)**
   - Main sidebar view: Issue list with status, total time, refresh button
   - Action handlers: Create event, create issue buttons
   - Uses CardService to build Google Workspace add-on cards

2. **GitHub Integration**
   - OAuth2 library for authentication
   - REST API: Fetch issue list, create issues
   - GraphQL API: Fetch issue status from GitHub Projects V2, update custom fields
   - Key data: Issue title, number, status, project fields (e.g., "Actual Hours")

3. **Calendar Integration**
   - CalendarApp service to search events by issue number
   - Parse event descriptions to identify linked issues
   - Calculate total duration from multiple calendar events
   - Create new events with pre-filled issue information

4. **Data Flow**
   - User opens sidebar → Trigger `onHomepage()` or `onRefresh()`
   - Fetch issues from GitHub (GraphQL for status + custom fields)
   - For each issue: Search calendar events, sum durations
   - Render card with issue info + calculated time
   - User actions trigger specific handlers (create event, create issue)

### Alternative Implementations (Phase 3)

**Option A: Manual Refresh (Simpler)**
- User clicks refresh button to update issue list and times
- No webhook setup required
- Suitable for personal use or limited repository access

**Option B: Webhook Automation (Advanced)**
- GitHub webhook triggers GAS on issue close
- Automatically aggregates time and updates "Actual Hours" field in GitHub Projects
- Requires webhook configuration permissions on repository
- GAS must be deployed as web app with `doPost(e)` handler

## Development Workflow

Since this is Google Apps Script:

**Testing:**
```bash
# View logs in browser
clasp open
# Then navigate to: View > Logs or Executions
```

**Local development:**
- Edit .gs or .js files in `/src`
- Use `clasp push` to upload changes
- Test in Apps Script editor or deploy as test add-on

**Debugging:**
- Use `Logger.log()` for debugging
- View execution logs in Apps Script editor
- Test UI cards using add-on test deployment

## Key Implementation Notes

### Issue-Calendar Linking

Issues are linked to calendar events through:
- Event description containing GitHub issue URL or number
- Standardized format to parse issue identifiers
- Search pattern: `#<issue-number>` or full GitHub URL

### Time Calculation

1. Search calendar events by issue identifier
2. Extract start/end times for each matching event
3. Sum total duration (handle multi-day events appropriately)
4. Display in sidebar and/or write to GitHub Projects custom field

### GitHub Projects V2 GraphQL

Projects V2 uses different API structure:
- Items are referenced by node IDs (not issue numbers directly)
- Custom fields require field ID and project ID
- Mutation example: `updateProjectV2ItemFieldValue`

**Important:** Document project ID, field IDs during implementation

### Error Handling

- Handle API rate limits (GitHub: 5000 requests/hour authenticated)
- Validate OAuth2 token freshness
- Graceful degradation if GitHub or Calendar API fails
- User-friendly error messages in sidebar cards

## Phase-Based Development

Development follows 4 phases outlined in `/docs/prd-trd.md`:

**Phase 1 (3-5 days):** GAS project setup, GitHub OAuth2, basic issue fetching, simple sidebar UI

**Phase 2 (4-6 days):** Calendar event creation from issues, new issue creation from calendar

**Phase 3 (4-7 days):** Time aggregation + status display (choose Option A or B)

**Phase 4 (2-4 days):** Error handling, UX improvements, testing

Refer to prd-trd.md for detailed task breakdowns per phase.

## Language Note

Documentation (PRD/TRD) is in Japanese. Code comments and variable names should follow standard English conventions for maintainability.
