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
  - Read and write access to an application database (also sqlite)

### 2\. Library Management

  - Display tracks, crates, and playlists from Mixxx database
  - **Sortable table interface** with comprehensive track metadata
  - **Search and filtering** capabilities across all library content

### 3\. Smart playlist generation
  - Filter tracks
  - harmonic mixing rules

### 4\. Claude AI Integration (AI mode for playlist generation)

  - User-configurable API key storage in application settings
  - Natural language queries about music library content
  - **Intelligent playlist generation** based on user prompts
  - Context-aware responses using actual library data

### 5\. Playlist Export

  - Generate **Extended M3U format** playlists
  - Include track names and metadata in export
  - Local file system export for manual Mixxx import
  - User-friendly file save dialogs

## Technical Architecture

### Technology Stack

  - **Frontend**: React + Bootstrap
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

2. Mixxx database (mixxxdb.sqlite)

    1.  Primary Tables

          - **`library`**: Main track metadata (artist, title, album,
            BPM, key, genre, etc.)
          - **`track_locations`**: File paths and metadata
          - **`crates`**: User-created track collections
          - **`crate_tracks`**: Track-to-crate relationships
          - **`Playlists`**: User playlists
          - **`PlaylistTracks`**: Playlist contents

### Platform-Specific Database Locations

| Platform    | Default Path                                                                                 |
| ----------- | -------------------------------------------------------------------------------------------- |
| **Windows** | `C:\Users\<Username>\AppData\Local\Mixxx\mixxxdb.sqlite`                                     |
| **macOS**   | `~/Library/Containers/org.mixxx.mixxx/Data/Library/Application Support/Mixxx/mixxxdb.sqlite` |
| **Linux**   | `~/.mixxx/mixxxdb.sqlite`                                                                    |

## Dependencies
- better-sqlite3
- bootstrap
- react
- react-select
- react-bootstrap
- react-bootstrap-icons
- react-dom

## Dev Dependencies
- eslint
- electron
- electron-rebuild
- electron-vite

## User Interface Design

### Proposed Layout Structure

``` example
┌─────────────────────────────────────────────────────────┐
│ Menu Bar (File, Settings, Help)                         │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────┐ ┌─────────────────────────────────┐ │
│ │   Navigation    │ │                                 │ │
│ │   Sidebar       │ │        Main Content Area        │ │
│ │                 │ │                                 │ │
│ │                 │ │   ┌─────────────────────────┐   │ │
│ │ • Library       │ │   │   Library Table         │   │ │
│ │ • Playlists     │ │   │   (Sortable/Filterable) │   │ │
│ │ • Settings      │ │   └─────────────────────────┘   │ │
│ │                 │ │                                 │ │
│ └─────────────────┘ └─────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ Status Bar (DB Status, Connection Status)               │
└─────────────────────────────────────────────────────────┘
```

### Key UI Components

1.  1\. Library Table

      - **Columns**: Artist, Title, Album, BPM, Key, Genre, Duration,
        Rating
      - **Features**: Click-to-sort, multi-column filtering, search bar
      - **Bootstrap Components**: Table, Form controls, Input groups

2.  2\. Smart playlist Interface

      - **custom instructions** for natural language queries
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

## Current project structure

```
.
├── electron.vite.config.js
├── eslint.config.js
├── launch.json
├── NOTES.md
├── package.json
├── package-lock.json
├── playwright.config.js
├── PROJECT.md
├── PROJECT.txt
├── README.md
├── spec
│   ├── e2e
│   │   ├── database-connection.spec.js
│   │   └── helpers
│   │       ├── electronApp.js
│   │       ├── sqliteManager.js
│   │       └── testDatabase.js
│   ├── fixtures
│   │   ├── mixxxData.json
│   │   └── mixxxdb_schema.sql
│   ├── main
│   │   └── database
│   │       ├── appDatabase.spec.js
│   │       └── mixxxDatabase.spec.js
│   ├── mockMixxxDatabase.js
│   ├── renderer
│   │   └── src
│   │       └── components
│   │           └── DatabaseConnectionModal.test.jsx
│   └── setup.js
├── src
│   ├── main
│   │   ├── assets
│   │   │   └── beatbrain_logo.png
│   │   ├── database
│   │   │   ├── appDatabase
│   │   │   │   └── createTables.js
│   │   │   ├── appDatabase.js
│   │   │   └── mixxxDatabase.js
│   │   └── index.js
│   ├── preload
│   │   └── index.mjs
│   └── renderer
│       ├── index.html
│       └── src
│           ├── App.jsx
│           ├── assets
│           │   ├── beatbrain_logo.png
│           │   ├── beatbrain_logo.svg
│           │   └── index.css
│           ├── components
│           │   ├── DatabaseConnectionModal.jsx
│           │   ├── filters
│           │   │   ├── BpmRangeInput.jsx
│           │   │   ├── GenreMultiSelect.jsx
│           │   │   └── TrackCountInput.jsx
│           │   ├── LibraryStats.jsx
│           │   ├── MixxxDatabaseStatus.jsx
│           │   ├── Navigation.jsx
│           │   ├── PlaylistForm.jsx
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

21 directories, 49 files
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
### DONE: Setup unit testing framework
- [x] Setup vitest
- [x] Write test for appDatabase.js
- [x] Write test for mixxxDatabase.js
- [x] Write test for DatabaseConnectionModal.jsx
### DONE: Setup end-to-end testing
- [x] Setup playwright
- [x] Write basic test to verify the database connection modal is presented

## TODOs continue e2e testing
### DONE: figure out how to seed the appDatabase with user preferences and settings
### DONE: Cache sqlite3 builds
### DONE: write e2e test for configuring the mixxx database

## **TODO List: Playlist Generation (Phase 1: Basic UI - MVP)**
Build interface that allows users to filter the library to a subset of tracks
that should be considered for smart playlist generation. The parametes will be
used to perform a query against the Mixxx dabatase.

Note filtering should be built in such a way that it can be resued in the
library view. Also these filter criteria are multiselect for which a "tag"
based UX might be appropriate. Given there could be many options per filter
criteria, a type ahead UX would be nice. The filter criteria will be used to
perform a database query to retrieve tracks to be passed to the LLM for playlist
generation.
### **DONE: Setup & Dependencies**
- [x] Add react-select to project dependencies

### **Database Layer**
- [x] Add method to mixxxDatabase.js: `getAvailableGenres()` - return unique genres from library
- [x] Add method to mixxxDatabase.js: `getBpmRange()` - return min/max BPM values from library
- [x] Add method to mixxxDatabase.js: `getTracks(filters)` - query tracks with genre OR, BPM range, and limit
- [x] Add method to appDatabase.js: `saveTrackFilters(filters)` - store filter settings in app_settings
- [x] Add method to appDatabase.js: `getTrackFilters()` - retrieve saved filter settings

### **Filter Components (Small, Focused Components)**
- [x] Create `src/renderer/src/components/filters/TrackCountInput.jsx` - simple number input with validation
- [x] Create `src/renderer/src/components/filters/BpmRangeInput.jsx` - min/max number inputs with validation
- [x] Create `src/renderer/src/components/filters/GenreMultiSelect.jsx` - react-select wrapper with Bootstrap styling
- [x] Create `src/renderer/src/components/filters/PlaylistFilters.jsx` - container component that combines all filters
- [x] On the PlaylistView, If mixxx database is not connected do not try to render any child components, show a message prompting the user to connect along with the MixxxDatabaseStatus component. Once connected, then show the full PlaylistView
- [x] Update PlaylistsView.jsx: Add state for filter values (trackCount, genres, bpmMin, bpmMax)
- [x] Update PlaylistsView.jsx: Load available genres and BPM range on component mount

### **Filter Persistence**
- [x] Implement auto-save of filter changes to app database
- [x] retrieve bpm range, trackCount and genres from app database to initialize filter values
- [x] Add loading states for filter options while data is being fetched
- [x] Add error handling for filter fetching, log error and use defaults
- [x] Show the count of tracks that the playlist filters are expected to fetch. Update this count when the filters change (debounce this)

### **create app database playlist schema**
- [x] create playlists table. Columns: id, name, description, track_source, created_at, updated_at
- [x] create playlists tracks table. Table should contain data required to generate an m3u file.Columns: id, name, duration, path, position, playlist_id (fk), source_track_id (the mixxx library track id), and other track metadata columns.

### **Basic Playlist Generation**
- [x] Update PlaylistsView.jsx: Add "Generate Playlist" button
- [x] Add appDatabase functions to create playlists / playlist_tracks
- [x] Add function to create playlist to app database API functions
- [x] On clicking button, create insert new playlist. Playlist name can default to Date time in words.
- [x] Show success and error messages

## TODOs for Feature: Playlist Management (Phase 2: View & Edit)
### **Database Layer - Playlist CRUD Operations**
- [ ] Add method to appDatabase.js: `getAllPlaylists()` - fetch all playlists with metadata (id, name, track_count, duration, created_at, updated_at)
- [ ] Add method to appDatabase.js: `getPlaylistById(id)` - fetch single playlist with full metadata
- [ ] Add method to appDatabase.js: `getPlaylistTracks(playlistId)` - fetch all tracks for a playlist ordered by position
- [ ] Add method to appDatabase.js: `updatePlaylistName(id, name)` - update playlist name and updated_at timestamp
- [ ] Add method to appDatabase.js: `deletePlaylist(id)` - delete playlist and associated tracks (cascade)
- [ ] Add method to appDatabase.js: `updateTrackPosition(playlistId, trackId, newPosition)` - reorder track in playlist
- [ ] Add method to appDatabase.js: `removeTrackFromPlaylist(playlistId, trackId)` - remove single track from playlist
- [ ] Add method to appDatabase.js: `addTrackToPlaylist(playlistId, trackData)` - add track to playlist (for future manual additions)

### **Navigation Component Updates**
- [ ] Update Navigation.jsx: Add state for managing playlist list expansion/collapse
- [ ] Update Navigation.jsx: Fetch all playlists on component mount using `getAllPlaylists()`
- [ ] Update Navigation.jsx: Render dynamic playlist list under "Playlists" section
- [ ] Update Navigation.jsx: Add Bootstrap Collapse component for expandable playlist section
- [ ] Update Navigation.jsx: Show playlist count badge (e.g., "Playlists (26)")
- [ ] Update Navigation.jsx: Add "+" button next to Playlists header to navigate to PlaylistsView
- [ ] Update Navigation.jsx: Highlight active/selected playlist in navigation
- [ ] Update Navigation.jsx: Handle click events on playlist items to navigate to detail view
- [ ] Update Navigation.jsx: Add loading state while fetching playlists
- [ ] Update Navigation.jsx: Add error handling for playlist fetch failures

### **Routing & View Management**
- [ ] Update App.jsx: Extend view state to support playlist detail routing (e.g., `{ view: 'playlist-detail', playlistId: 123 }`)
- [ ] Update App.jsx: Add navigation handler for playlist selection
- [ ] Update App.jsx: Pass playlist navigation functions to Navigation component
- [ ] Create view routing logic to render PlaylistDetailView when playlist is selected

### **Playlist List Component**
- [ ] Create `src/renderer/src/components/PlaylistList.jsx` - component for rendering playlist items in navigation
- [ ] PlaylistList.jsx: Accept playlists array and onSelect callback as props
- [ ] PlaylistList.jsx: Render each playlist with icon, name, and track count
- [ ] PlaylistList.jsx: Apply active styling to selected playlist
- [ ] PlaylistList.jsx: Add hover effects and cursor pointer
- [ ] PlaylistList.jsx: Handle empty state (no playlists created yet)

### **Playlist Detail View Component**
- [ ] Create `src/renderer/src/views/PlaylistDetailView.jsx` - main view for viewing/editing a playlist
- [ ] PlaylistDetailView.jsx: Accept playlistId as prop
- [ ] PlaylistDetailView.jsx: Fetch playlist metadata and tracks on mount
- [ ] PlaylistDetailView.jsx: Display playlist header with name, created date, track count, total duration
- [ ] PlaylistDetailView.jsx: Add "Back to Playlists" navigation button
- [ ] PlaylistDetailView.jsx: Add Export button (placeholder for now)
- [ ] PlaylistDetailView.jsx: Add Delete button with confirmation modal
- [ ] PlaylistDetailView.jsx: Render track list using PlaylistTrackItem components
- [ ] PlaylistDetailView.jsx: Add loading state while fetching playlist data
- [ ] PlaylistDetailView.jsx: Add error handling for playlist not found
- [ ] PlaylistDetailView.jsx: Calculate and display playlist statistics (total duration, avg BPM, key distribution)

### **Playlist Track Item Component**
- [ ] Create `src/renderer/src/components/PlaylistTrackItem.jsx` - component for individual track in playlist
- [ ] PlaylistTrackItem.jsx: Display track position number
- [ ] PlaylistTrackItem.jsx: Display track metadata (title, artist, album, BPM, key, duration)
- [ ] PlaylistTrackItem.jsx: Add remove button with confirmation
- [ ] PlaylistTrackItem.jsx: Add drag handle for reordering (visual only for now)
- [ ] PlaylistTrackItem.jsx: Style with Bootstrap table row or card
- [ ] PlaylistTrackItem.jsx: Add hover effects
- [ ] PlaylistTrackItem.jsx: Handle remove track action

### **Playlist Editing Features**
- [ ] Implement inline playlist name editing in PlaylistDetailView
- [ ] Add save/cancel buttons for name editing
- [ ] Add validation for playlist name (non-empty, max length)
- [ ] Implement track removal with optimistic UI updates
- [ ] Add confirmation modal for destructive actions (delete playlist, remove track)
- [ ] Update playlist updated_at timestamp on any edit
- [ ] Show success/error toast notifications for edit actions

### **Drag-and-Drop Track Reordering**
- [ ] Install drag-and-drop library (e.g., `react-beautiful-dnd` or `@dnd-kit/core`)
- [ ] Wrap track list in drag-and-drop context
- [ ] Make PlaylistTrackItem components draggable
- [ ] Implement drop handler to update track positions
- [ ] Update database with new track positions on drop
- [ ] Add visual feedback during drag (ghost element, drop zones)
- [ ] Handle edge cases (drag to same position, drag outside bounds)

### **Playlist Export (M3U)**
- [ ] Create utility function to generate M3U file content from playlist tracks
- [ ] Implement file save dialog using Electron's dialog API
- [ ] Add IPC handler for file system write operations
- [ ] Format M3U with extended metadata (#EXTINF)
- [ ] Include track file paths from Mixxx database
- [ ] Add error handling for file write failures
- [ ] Show success notification with file path after export
- [ ] Add option to choose M3U format (basic vs extended)

### **Polish & UX Enhancements**
- [ ] Add empty state message when playlist has no tracks
- [ ] Add search/filter bar for playlists with many tracks
- [ ] Show loading skeletons while fetching playlist data
- [ ] Add keyboard shortcuts (Delete key to remove track, Esc to cancel editing)
- [ ] Implement undo/redo for track removal (optional)
- [ ] Add playlist duplication feature
- [ ] Add "Add tracks" button to manually add tracks from library (future feature)
- [ ] Style components to match existing Bootstrap theme
- [ ] Ensure responsive design for smaller screens

### **Testing**
- [ ] Write unit tests for new appDatabase playlist methods
- [ ] Write unit tests for PlaylistList component
- [ ] Write unit tests for PlaylistDetailView component
- [ ] Write unit tests for PlaylistTrackItem component
- [ ] Write integration test for playlist navigation flow
- [ ] Write integration test for playlist editing (name, remove tracks)
- [ ] Write integration test for playlist deletion
- [ ] Write e2e test for complete playlist management workflow
- [ ] Write tests for M3U export functionality
- [ ] Test drag-and-drop reordering across different browsers/platforms

### **Documentation**
- [ ] Update README with playlist management features
- [ ] Document M3U export format and compatibility
- [ ] Add screenshots of playlist views to documentation
- [ ] Document keyboard shortcuts for playlist management

## TODOs for Feature: Playlist (Phase 3: filter enhancements)
### TODO: Implement fields for user to filter tracks eligible for playlist creation
- [ ] Filter by crates
- [ ] Filter by Groups
- [ ] Filter by Artists
- [ ] Filter by musicl key
- [ ] Filter by Year range
- [ ] Filter by date added range
## TODOs for Feature: Playlist (Phase 4: harmonic mixing)
## TODOs for Feature: Playlist (Phase 4: Audio Player)

## TODOs for Feature: Settings Foundation (Phase 2: API key management)
### DONE: Move existing components to Settings view
- [x] Relocate SystemInformation component from main view to SettingsView.jsx
- [x] Relocate MixxxDatabaseStatus component from main view to SettingsView.jsx
### TODO: Implement API key management in Settings
- [ ] Add secure storage for Anthropic API key using Electron’s safeStorage API
- [ ] Create input field with validation for API key entry
- [ ] Ensure no plaintext storage of API credentials
### TODO: Write tests for setting feature
- [ ] end to end test

## TODOs for Feature: Playlist generation (Phase 3: AI mode)
### TODO: build module to making requests to Anthropic's claude. Add @anthropic-ai/sdk npm package
- [ ] Make request with list of tracks fetched from the Mixxx database
- [ ] Include a system message for instructing LLM to generate smart playlists
- [ ] Include the user's custom free text instructions
- [ ] Instruct LLM to return a sequence of tracks by track ID.
- [ ] Add connection testing to verify API key validity

## TODOs for Feature: Enahanced library view
- [ ] TODO: More stats
- [ ] TODO: search
- [ ] TODO: filter tracks
- [ ] TODO: data visulization (show how library has evolved over time)
- [x] TODO: Relocate TrackList and LibraryStatistics to LibraryView
- [ ] TODO: Move datafetching from App.jsx to LibarayView.jsx

## TODOs for UI polish

# Notes
See also NOTES.md
