# Mixxx Claude Assistant - Project Requirements & Plan

## Project Overview

A cross-platform Electron desktop application that provides an
intelligent interface to Mixxx DJ software's music library using Claude
AI for playlist generation and music discovery.


App Name: **BeatBrain**

## Core Functionality

### 1\. Database Integration

  - **Read-only access** to `mixxxdb.sqlite`
  - **Auto-detection** of Mixxx database location by platform
  - **Manual file selection** as fallback option
  - **Real-time monitoring** for database changes with automatic refresh
  - **Lock contention handling** with retry logic and user error
    notifications
  - Read and write access to an application database (also sqlite)

### 2\. Library Management

  - Display tracks, crates, and playlists from Mixxx database
  - **Sortable table interface** with comprehensive track metadata
  - **Search and filtering** capabilities across all library content
  - Real-time updates when Mixxx database changes

### 3\. Claude AI Integration

  - User-configurable API key storage in application settings
  - Natural language queries about music library content
  - **Intelligent playlist generation** based on user prompts
  - Context-aware responses using actual library data

### 4\. Playlist Export

  - Generate **Extended M3U format** playlists
  - Include track names and metadata in export
  - Local file system export for manual Mixxx import
  - User-friendly file save dialogs

## Technical Architecture

### Technology Stack

  - **Frontend**: React + Bootstrap for responsive UI
  - **Backend**: Electron main process with Node.js
  - **Database**: SQLite3 with read-only access
  - **AI Integration**: Anthropic Claude API
  - **File Monitoring**: Node.js file system watchers

### Database Schema Integration

1.  Application database

    Schema will depend on the application state that will need to be
    persisted. Specific database schema TBD.

2.  mixxxdb.sqlite

    1.  Primary Tables

          - **`library`**: Main track metadata (artist, title, album,
            BPM, key, genre, etc.)
          - **`track_locations`**: File paths and metadata
          - **`crates`**: User-created track collections
          - **`crate_tracks`**: Track-to-crate relationships
          - **`Playlists`**: User playlists
          - **`PlaylistTracks`**: Playlist contents

    2.  Metadata Available to Claude

          - Track identification (artist, title, album)
          - Technical specs (BPM, key, duration, bitrate)
          - Categorization (genre, year, rating)
          - User organization (crates, playlists)
          - Play statistics (times played, last played)

### Platform-Specific Database Locations

| Platform    | Default Path                                                                                 |
| ----------- | -------------------------------------------------------------------------------------------- |
| **Windows** | `C:\Users\<Username>\AppData\Local\Mixxx\mixxxdb.sqlite`                                     |
| **macOS**   | `~/Library/Containers/org.mixxx.mixxx/Data/Library/Application Support/Mixxx/mixxxdb.sqlite` |
| **Linux**   | `~/.mixxx/mixxxdb.sqlite`                                                                    |

## Dependencies

better-sqlite3 bootstrap chokidar react react-bootstrap react-dom

## User Interface Design

### Proposed Layout Structure

``` example
┌─────────────────────────────────────────────────────────┐
│ Menu Bar (File, Settings, Help)                        │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────┐ ┌─────────────────────────────────┐ │
│ │   Navigation    │ │                                 │ │
│ │   Sidebar       │ │        Main Content Area        │ │
│ │                 │ │                                 │ │
│ │ • Library       │ │   ┌─────────────────────────┐   │ │
│ │ • Crates        │ │   │   Library Table         │   │ │
│ │ • Playlists     │ │   │   (Sortable/Filterable) │   │ │
│ │ • Claude Chat   │ │   └─────────────────────────┘   │ │
│ │                 │ │                                 │ │
│ └─────────────────┘ └─────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ Status Bar (DB Status, Connection Status)              │
└─────────────────────────────────────────────────────────┘
```

### Key UI Components

1.  1\. Library Table

      - **Columns**: Artist, Title, Album, BPM, Key, Genre, Duration,
        Rating
      - **Features**: Click-to-sort, multi-column filtering, search bar
      - **Bootstrap Components**: Table, Form controls, Input groups

2.  2\. Claude Chat Interface

      - **Chat-style interface** for natural language queries
      - **Prompt examples** for playlist generation
      - **Response display** with formatted playlist suggestions
      - **Export buttons** for generated playlists

3.  3\. Settings Panel

      - **API Key management** with secure storage
      - **Database path configuration**
      - **Export preferences**
      - **Application preferences**

## Core Features Specification

### Database Operations

``` javascript
// Read-only database operations
- getAllTracks()
- getTracksByFilter(criteria)
- getCrates()
- getPlaylists()
- getTrackMetadata(trackId)
- searchLibrary(query)
```

### File System Monitoring

``` javascript
// Watch for database changes
- watchDatabaseFile()
- handleDatabaseUpdate()
- refreshLibraryData()
- notifyUserOfChanges()
```

### Claude Integration

``` javascript
// AI interaction methods
- sendQueryToClaude(prompt, libraryContext)
- generatePlaylist(criteria)
- formatPlaylistResponse()
- exportToM3U(playlist)
```

## Error Handling Strategy

### Database Lock Contention

1.  **Retry Logic**: 3 attempts with exponential backoff
2.  **Timeout**: 10-second maximum wait
3.  **User Notification**: Clear error message with suggested actions
4.  **Graceful Degradation**: Show last known data state

### API Failures

1.  **Network Issues**: Retry with timeout
2.  **Authentication**: Clear API key validation messages
3.  **Rate Limiting**: Respect API limits with user feedback
4.  **Service Unavailable**: Offline mode with cached responses

### File System Issues

1.  **Missing Database**: Guide user to locate file manually
2.  **Permission Errors**: Clear instructions for file access
3.  **Corrupted Database**: Validation and recovery suggestions

## Security Considerations

### API Key Management

  - **Encrypted storage** using Electron's safeStorage API
  - **No plaintext storage** of sensitive credentials
  - **Secure transmission** to Anthropic API only

### Database Access

  - **Read-only mode** enforcement
  - **SQL injection prevention** through parameterized queries
  - **File permission validation**

## Development Phases

### **Phase 1: Foundation**

  - Set up Electron + React + Bootstrap boilerplate
  - Implement database auto-detection and manual selection
  - Create basic library table with sorting/filtering

### **Phase 2: Core Features**

  - Add Claude API integration
  - Implement settings management
  - Create chat interface for AI queries

### **Phase 3: Advanced Features**

  - Add real-time database monitoring
  - Implement M3U export functionality
  - Polish UI/UX and error handling

### **Phase 4: Testing & Distribution**

  - Cross-platform testing
  - Performance optimization
  - Build and packaging setup

## Success Criteria

  - ✅ Successfully reads Mixxx database across all platforms
  - ✅ Provides intuitive library browsing with search/filter
  - ✅ Enables natural language queries about music collection
  - ✅ Generates contextually relevant playlist suggestions
  - ✅ Exports usable M3U files for Mixxx import
  - ✅ Handles errors gracefully with clear user feedback
  - ✅ Updates automatically when Mixxx database changes

## Questions and considerations

### Database monitoring

  - How frequently to poll for changes?
  - Consider using SQLite’s PRAGMA user<sub>version</sub> to detect
    schema changes
  - Might want to hash the database file or check modification
    timestamps before doing full refreshes.

### Claude context management

  - How to handle large libraries that may exceed context window?
  - Limit the columns to include to only the ones that would be useful.
  - Could I have users choose which crates, playlists, or genres to
    include in the library context?
  - Use prompt caching
  - Include instructions for harmonic mixing. Include the camelot wheel.

### Logging

### Additional features

1.  Keyboard shortcuts

2.  Dark mode

3.  Playlist description

    Generate a Soundcloud description and tracklist to accompany the
    playlist

### Electron security

  - Should I disable nodejs integration in renderer process?
  - Should I use context isolation?

### Colors

In order to have Claude consider colors, I will probably have to convert
the decimal notation that the colors are currently stored as in the
mixxxdb into RGB notation. Claude seems to understand RGB better than
decimal.

## Current project structure

```
.
├── electron.vite.config.js
├── eslint.config.js
├── launch.json
├── package.json
├── package-lock.json
├── PROJECT.md
├── PROJECT.txt
├── README.md
└── src
    ├── main
    │   ├── database
    │   │   ├── appDatabase.js
    │   │   └── mixxxDatabase.js
    │   └── index.js
    ├── preload
    │   └── index.mjs
    └── renderer
        ├── index.html
        └── src
            ├── App.jsx
            ├── assets
            │   └── index.css
            ├── components
            │   ├── LibraryStats.jsx
            │   ├── MixxxDatabaseStatus.jsx
            │   ├── Navigation.jsx
            │   ├── SystemInformation.jsx
            │   └── TrackList.jsx
            ├── main.jsx
            ├── utilities.js
            └── views
                ├── LibraryView.jsx
                ├── PlaylistsView.jsx
                └── SettingsView.jsx

9 directories, 25 files
```

## Progress

### \<2025-08-01 Fri\> Proof of concept 1

Used Claude to produce a hypinotic techno playlist. It was good.

### \<2025-08-08 Fri\> Proof of concept 2

Used Claude to produce another techno playlist with a custom system
message that contained instructions for harmonic mixing.

### \<2025-08-08 Fri\> Scafolded Electon app

  - setup Electron desktop application using React, Bootstrap, and Vite.
  - resolved several setup issues including missing dependencies
    (@electron-toolkit/utils), file path resolution errors with the
    React entry point, default export problems in the App component, and
    Content Security Policy violations caused by Bootstrap’s inline SVG
    icons in dismissible alerts.
  - The application now runs successfully with a Bootstrap UI

### \<2025-08-10 Sun\> Added ESlint and Prettier

### \<2025-08-10 Sun\> Application Database Setup

- Implemented application SQLite database using better-sqlite3 library
for storing user preferences and settings
- Created AppDatabase class
with methods for managing settings and user preferences across two
tables (app_settings and user_preferences)
- Integrated database initialization into Electron main process with
proper cleanup on app exit

### \<2025-09-04 Fri\> Mixxx Database module
- Created mixxxDatabase.js module for connecting and reading from the mixxx database.

# TODOS

## TODOs for Feature: Core Navigation & Status (Phase 1)
### DONE: Create view routing system
- [x] Add navigation state management to App.jsx with default view as ‘playlist’
- [x] Create placeholder components for playlist, library, and settings views
- [x] Wire up navigation buttons/menu to switch between views
### TODO: Create view components directory structure
- [x] Create src/renderer/src/views/ directory with PlaylistView.jsx, LibraryView.jsx, SettingsView.jsx
- [X] Create src/renderer/src/components/ directory for reusable UI components
- [x] Add Navigation.jsx component for view switching
### TODO: Implement database status display in status bar
- [ ] Add component StatusBar.jsx
- [ ] Add real-time status indicator to bottom status bar (🟢 Connected, 🔴 No connection, 🟡 Locked/retry, ⚪ Not configured)
- [ ] Connect status display to existing mixxxDatabase.js module
- [ ] Show current connection state and update automatically
### TODO: Add database connection prompts at startup
- [ ] Build DatabaseStatus component for connection state display
- [ ] Implement auto-detection logic for Mixxx database on application startup
- [ ] Show user-friendly connection dialog if database is found
- [ ] Guide user to settings view if no database is found
## TODOs for Feature: Settings Foundation (Phase 2)
### TODO: Move existing components to Settings view
- [x] Relocate SystemInformation component from main view to SettingsView.jsx
- [x] Relocate MixxxDatabaseStatus component from main view to SettingsView.jsx
- [ ] Create proper Settings layout with organized sections
### TODO: Update Library view
- [x] Relocate TrackList and LibraryStatistics to LibraryView
- [ ] Move datafetching from App.jsx to LibarayView.jsx
### TODO: Add manual database file selection to Settings
- [ ] Implement file browser dialog for selecting mixxxdb.sqlite manually
- [ ] Add database path validation and connection testing
- [ ] Provide clear feedback on connection success/failure
### TODO: Implement API key management in Settings
- [ ] Add secure storage for Anthropic API key using Electron’s safeStorage API
- [ ] Create input field with validation for API key entry
- [ ] Add connection testing to verify API key validity
- [ ] Ensure no plaintext storage of API credentials
## TODOs for Feature: Playlist generation (Phase 1)
- [ ] TODO: build module to making requests to Anthropic's claude. Add @anthropic-ai/sdk npm package
## TODOs for Feature: Playlist generation (Phase 2)
## TODOs for Feature: Enahanced library view
- [ ] TODO: More stats
- [ ] TODO: search
- [ ] TODO: filter tracks
- [ ] TODO: data visulization (show how library has evolved over time)

# Core Features (Future Phases)

- Real-time database monitoring - Auto-refresh when Mixxx database
  changes
- Settings management UI - Create interface for API keys and
  preferences
- Claude AI integration - Add API integration for natural language
  queries
- Playlist generation - Implement AI-powered playlist creation
- M3U export functionality - Generate and export playlists in M3U
  format. Edit playlists after they are generated. Regenerate playlist.
  Music player to preview tracks
- Library table display - Show tracks, crates, and playlists from
  Mixxx database
- Search and filtering - Implement library browsing with sort/filter
  capabilities
- Play audio files
