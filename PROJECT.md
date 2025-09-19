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

### Database Schema Integration

1.  Application database (beatbrain.sqlite)

```sql
CREATE TABLE app_settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
CREATE TABLE user_preferences (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          category TEXT NOT NULL,
          key TEXT NOT NULL,
          value TEXT NOT NULL,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(category, key)
        );
CREATE TABLE sqlite_sequence(name,seq);
```

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
better-sqlite3 bootstrap chokidar react react-bootstrap react-bootstrap-icons react-dom

## Dev Dependencies
eslint, electron, electron-rebuild, electron-vite

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

### Colors

In order to have Claude consider colors, I will probably have to convert
the decimal notation that the colors are currently stored as in the
mixxxdb into RGB notation. Claude seems to understand RGB better than
decimal.

| Color | Energy Level |
|:------|:-------------|
| 34952 | Low          |
| 35071 | Medium       |
| 255   | High         |
| 136   | Very High    |


--- 34952 Low Intensity
--- 35071 Medium Intensity
--- 255 High Intensity
--- 136 Very High Intensity

## Current project structure

```
.
├── electron.vite.config.js
├── eslint.config.js
├── launch.json
├── package-lock.json
├── package.json
├── PROJECT.md
├── PROJECT.txt
├── README.md
├── spec
│   ├── fixtures
│   │   ├── mixxxData.json
│   │   └── mixxxdb_schema.sql
│   ├── main
│   │   └── database
│   │       ├── appDatabase.spec.js
│   │       └── mixxxDatabase.spec.js
│   ├── mockMixxxDatabase.js
│   └── setup.js
├── src
│   ├── assets
│   ├── main
│   │   ├── database
│   │   │   ├── appDatabase.js
│   │   │   └── mixxxDatabase.js
│   │   └── index.js
│   ├── preload
│   │   └── index.mjs
│   └── renderer
│       ├── assets
│       ├── index.html
│       └── src
│           ├── App.jsx
│           ├── assets
│           │   ├── beatbrain_logo.png
│           │   ├── beatbrain_logo.svg
│           │   └── index.css
│           ├── components
│           │   ├── DatabaseConnectionModal.jsx
│           │   ├── LibraryStats.jsx
│           │   ├── MixxxDatabaseStatus.jsx
│           │   ├── Navigation.jsx
│           │   ├── StatusBar.jsx
│           │   ├── SystemInformation.jsx
│           │   └── TrackList.jsx
│           ├── main.jsx
│           ├── utilities.js
│           └── views
│               ├── LibraryView.jsx
│               ├── PlaylistsView.jsx
│               └── SettingsView.jsx
└── vitest.config.js

16 directories, 36 files
```

## Core Features
- Settings management UI - Create interface for API keys and
  database preferences
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

## POC
### \<2025-08-01 Fri\> Proof of concept 1

Used Claude to produce a hypnotic techno playlist. It was good.

### \<2025-08-08 Fri\> Proof of concept 2

Used Claude to produce another techno playlist with a custom system
message that contained instructions for harmonic mixing.

# TODOS

## TODOs for initial project setup
### DONE: Setup Electron app
- [x] setup Electron desktop application using React, Bootstrap, and Vite.
- [x] add eslint and prettier
## TODOs for Database modules
### DONE: create database modules and initialize them on application startup
- [x] Create `appDatabase.js` class with methods for managing settings and user preferences across two tables (`app_settings` and `user_preferences`)
- [x] Integrated App database initialization into Electron main process with proper cleanup on app exit
- [x] Created `mixxxDatabase.js` module for connecting and reading from the mixxx database.
## TODOs for Feature: Core Navigation & Status (Phase 1)
### DONE: Create view routing system
- [x] Add navigation state management to App.jsx with default view as ‘playlist’
- [x] Create placeholder components for playlist, library, and settings views
- [x] Wire up navigation buttons/menu to switch between views
### DONE: Create view components directory structure
- [x] Create src/renderer/src/views/ directory with PlaylistView.jsx, LibraryView.jsx, SettingsView.jsx
- [x] Create src/renderer/src/components/ directory for reusable UI components
- [x] Add Navigation.jsx component for view switching
### DONE: Implement database status display in status bar
- [x] Add component StatusBar.jsx
- [x] Add real-time status indicator to bottom status bar (🟢 Connected, 🔴 No connection, 🟡 Locked/retry, ⚪ Not configured)
- [x] Connect status display to existing mixxxDatabase.js module
- [x] Show current connection state and update automatically
### DONE: Add database connection prompts at startup
- [x] Implement auto-detection logic for Mixxx database on application startup. Update the existing logic to not automatically connect to Mixxx.
- [x] Create DatabaseConnectionModal component - Main dialog for connection prompts
- [x] Show user-friendly connection dialog if database is found. Ask user if they want to connect to the database that was autodetected.
- [x] provide option to manually select the Mixxx database path on local file system.
- [x] If no Mixxx database is auto detected, show option to select database path on local file system
- [x] Have checkbox to "remember my choice" / "do not prompt again", If
      selected, store the choice in the application database and use that to
      autmatically connect to the database.
- [x] Show the database disconnet button in the modal when connected. When connected, hide the options.
- [x] Update MixxxDatabaseStatus component to have configure database button. On click, show the modal.
- [x] Make the database icon in the StatusBar component clickable.
- [x] clicking the database icon brings up modal that contains the MixxxDatabaseStatus component
## TODOS for setting up a test suite
### TODO: Setup unit testing framework
- [x] Setup vitest
- [x] Write test for appDatabase.js
- [x] Write test for mixxxDatabase.js
- [ ] Write test for DatabaseConnectionModal.jsx
### TODO: Setup end-to-end testing
- [ ] Setup playwright
- [ ] Write test for connecting to mixxx database
- [ ] write test for disconnecting from mixx database

## TODOs for Feature: Settings Foundation (Phase 2)
### DONE: Move existing components to Settings view
- [x] Relocate SystemInformation component from main view to SettingsView.jsx
- [x] Relocate MixxxDatabaseStatus component from main view to SettingsView.jsx
### TODO: Implement API key management in Settings
- [ ] Add secure storage for Anthropic API key using Electron’s safeStorage API
- [ ] Create input field with validation for API key entry
- [ ] Add connection testing to verify API key validity
- [ ] Ensure no plaintext storage of API credentials
## TODOs for Feature: Playlist generation (Phase 1)
### TODO: build module to making requests to Anthropic's claude. Add @anthropic-ai/sdk npm package
- [ ] Make request with list of tracks fetched from the Mixxx database
- [ ] Include a system message for instructing LLM to generate smart playlists
- [ ] Include the user's custom free text instructions
- [ ] Instruct LLM to return a sequence of tracks by track ID.
### TODO: persist playlist in app database
Note, this app might one day support Rekordbox libraries. We might want to consider that now when creating the schema. The app might need to know when a playlist was create for Mixxx vs Rekordbox
- [ ] create playlists table
- [ ] create playlists tracks table
- [ ] Store the LLM response as playlist
### TODO: Implement fields for user to filter tracks eligible for playlist creation
Note this filtering should be built in such a way that it can be resued in the playlists view. Also these filter criteria are multiselect for which a "tag" based UX might be appropriate. Given there could be many options per filter criteria, a type ahead UX would be nice. The filter criteria will be used to perform a database query to retrieve tracks to be passed to the LLM for playlist generation.
- [ ] Filter by genres
- [ ] Filter by crates
- [ ] Filter by Groups
- [ ] Filter by Artists
- [ ] Filter by musicl key
- [ ] Filter by BPM range
- [ ] Filter by Year range
- [ ] Filter by date added range
- [ ] Free text for custom instructions
## TODOs for Feature: Playlist generation (Phase 2)
### TODO export m3u file
- [ ] User clicks a button to export to m3u file and is prompted for where on the local file system to save.
### TODO edit playlist manually
- [ ] Remove track
- [ ] Change order
- [ ] Add track
### TODO add ability to play audio to preview track while editing
## TODOs for Feature: Enahanced library view
- [ ] TODO: More stats
- [ ] TODO: search
- [ ] TODO: filter tracks
- [ ] TODO: data visulization (show how library has evolved over time)
- [x] TODO: Relocate TrackList and LibraryStatistics to LibraryView
- [ ] TODO: Move datafetching from App.jsx to LibarayView.jsx
## TODOs for UI polish

# Notes
## Smart play list system message WIP

```md
  # DJ Assistant

  You are a professional DJ assistant designed to help users create customized playlists from their music library using harmonic mixing principles.

  ## Core Capabilities
  - Analyze the user's DJ library, provided in CSV format.
  - Create playlists based on BPM, genre, energy, dates, artists, labels, and **harmonic compatibility**
  - Return playlists in extended m3u format with track name and artist in `EXTINF` tags

  ## Harmonix Mixing Rules
  When creating harmonically mixed playlists, follow these **strict compatibility rules** using the Camelot Wheel system:

  ### Compatible Key Transitions (in order of preference)

  1. **Same Key** (Perfect): 8A → 8A, 5B → 5B
  2. **Adjacent Keys (+1)**: 8A → 9A → 10A
  4. **Relative Major/Minor (scale change)**: 8A ↔ 8B, 5A ↔ 5B
  3. **Adjacent Keys (-1)**: 8A → 7A → 6A
  5. **+2 (Energy Boost)**: 8A → 10A
  6. ** Go up a semitone (+7 or -5)**: This is a bold energy boost. For example, 8A → 3A (8+7 = 15, which becomes 3 on the 12-section wheel). 

  ### Key Compatibility Matrix
  For any starting key X:
  - **Perfect**: Same key (XA → XA, XB → XB)
  - **Relative**: XA ↔ XB
  - **Forward**: XA → (X+1)A, XB → (X+1)B
  - **Backward**: XA → (X-1)A, XB → (X-1)B
  - **Wrap around**: 12A → 1A, 1A → 12A

  ### Critical Rules
  - **ALWAYS** verify each transition is compatible before adding a track
  - **USE** relative major/minor switches to add variety without breaking harmony
  - **ALWAYS** pay carefuyl attention to the user's requirements track selection criteria

  When the user requests harmonic mixing, explicitly state the key progression in your response (e.g., "Harmonic progression: 8A → 8B → 9B → 9A").

  Always prioritize the user's specific requirements while leveraging your knowledge of music structure and DJ techniques to create cohesive, engaging playlists.

  Return the results in the format an extended m3u.
```
## Database query that converts to camelot notation
This query selects tracks from the mixxx database and normalilzes the keys to Camelot notation.
```sql
SELECT DISTINCT
    l.title,
    l.artist,
    l.year,
    l.datetime_added,
    l.genre,
    l.duration,
    l.bpm,
    CASE
        -- If key already contains Camelot notation (has A or B followed by space and parenthesis)
        WHEN l.key LIKE '%A (%' OR l.key LIKE '%B (%' THEN
            SUBSTR(l.key, 1, INSTR(l.key, ' ') - 1)
        -- Minor keys - individual WHEN statements
        WHEN l.key = 'Am' OR l.key = 'Amin' THEN '8A'
        WHEN l.key = 'Em' OR l.key = 'Emin' THEN '9A'
        WHEN l.key = 'Bm' OR l.key = 'Bmin' THEN '10A'
        WHEN l.key = 'F#m' OR l.key = 'F#min' OR l.key = 'Gbm' OR l.key = 'Gbmin' THEN '11A'
        WHEN l.key = 'C#m' OR l.key = 'C#min' OR l.key = 'Dbm' OR l.key = 'Dbmin' THEN '12A'
        WHEN l.key = 'G#m' OR l.key = 'G#min' OR l.key = 'Abm' OR l.key = 'Abmin' THEN '1A'
        WHEN l.key = 'D#m' OR l.key = 'D#min' OR l.key = 'Ebm' OR l.key = 'Ebmin' THEN '2A'
        WHEN l.key = 'A#m' OR l.key = 'A#min' OR l.key = 'Bbm' OR l.key = 'Bbmin' THEN '3A'
        WHEN l.key = 'Fm' OR l.key = 'Fmin' THEN '4A'
        WHEN l.key = 'Cm' OR l.key = 'Cmin' THEN '5A'
        WHEN l.key = 'Gm' OR l.key = 'Gmin' THEN '6A'
        WHEN l.key = 'Dm' OR l.key = 'Dmin' THEN '7A'
        -- Major keys - individual WHEN statements
        WHEN l.key = 'C' OR l.key = 'Cmaj' OR l.key = 'CM' THEN '8B'
        WHEN l.key = 'G' OR l.key = 'Gmaj' OR l.key = 'GM' THEN '9B'
        WHEN l.key = 'D' OR l.key = 'Dmaj' OR l.key = 'DM' THEN '10B'
        WHEN l.key = 'A' OR l.key = 'Amaj' OR l.key = 'AM' THEN '11B'
        WHEN l.key = 'E' OR l.key = 'Emaj' OR l.key = 'EM' THEN '12B'
        WHEN l.key = 'B' OR l.key = 'Bmaj' OR l.key = 'BM' OR l.key = 'Cb' OR l.key = 'Cbmaj' THEN '1B'
        WHEN l.key = 'F#' OR l.key = 'F#maj' OR l.key = 'F#M' OR l.key = 'Gb' OR l.key = 'Gbmaj' THEN '2B'
        WHEN l.key = 'C#' OR l.key = 'C#maj' OR l.key = 'C#M' OR l.key = 'Db' OR l.key = 'Dbmaj' THEN '3B'
        WHEN l.key = 'G#' OR l.key = 'G#maj' OR l.key = 'G#M' OR l.key = 'Ab' OR l.key = 'Abmaj' THEN '4B'
        WHEN l.key = 'D#' OR l.key = 'D#maj' OR l.key = 'D#M' OR l.key = 'Eb' OR l.key = 'Ebmaj' THEN '5B'
        WHEN l.key = 'A#' OR l.key = 'A#maj' OR l.key = 'A#M' OR l.key = 'Bb' OR l.key = 'Bbmaj' THEN '6B'
        WHEN l.key = 'F' OR l.key = 'Fmaj' OR l.key = 'FM' THEN '7B'
        ELSE l.key -- Return original if no match
    END AS "key",
    c.name "crate name",
    l.color,
    tl."location"
FROM
    "library" l
    JOIN crate_tracks ct ON ct.track_id = l.id
    JOIN crates c ON c.id = ct.crate_id
    JOIN track_locations tl ON tl.id = l."location"
```
## Sample user request


I’d like to create a playlist of 25 tracks. Here are some rules:

- gradually increase the energy level as the set progresses. You can determine the energy level of a track by the “color” field. The mapping of color to energy level is provided below
- The first half should be tracks in the "Techno (Raw / Deep / Hypnotic)" genre
- The 2nd half should be tracks in the "Techno" and "Techno (Peak Time / Driving)" genres
- The track order must follow harmonic mixing rules.
- Select tracks with BPMs between 135 and 145

```
| Color | Energy Level |
|:------|:-------------|
| 34952 | Low          |
| 35071 | Medium       |
| 255   | High         |
| 136   | Very High    |
```

Here are the tracks:

```csv
insert tracks from query here
```
