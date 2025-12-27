# Beatbrain - Project Requirements & Plan

## Project Overview

A cross-platform Electron desktop application that provides an intelligent
interface to Mixxx DJ software's music library for smart playlist generation.

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

### 4\. Playlist Export

  - Generate **Extended M3U format** playlists
  - Include track names and metadata in export
  - Local file system export for manual Mixxx import
  - User-friendly file save dialogs

### 5\. AI Integration (optional AI mode for playlist generation)

  - User-configurable API key storage in application settings
  - Natural language queries about music library content
  - **Intelligent playlist generation** based on user prompts
  - Context-aware responses using actual library data

## Technical Architecture

### Technology Stack

  - **Frontend**: React + Bootstrap
  - **Backend**: Electron main process with Node.js
  - **Database**:
    - SQLite3 with read-only access to Mixxx database
    - SQLite3 with read/write access to application database
  - **AI Integration**: TBD

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
CREATE TABLE playlists (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          track_source TEXT NOT NULL DEFAULT 'mixxx' CHECK (track_source IN ('mixxx', 'rekordbox')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
CREATE TABLE playlist_tracks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          playlist_id INTEGER NOT NULL,
          source_track_id INTERGER NOT NULL,
          file_path TEXT NOT NULL,
          duration FLOAT,
          artist TEXT,
          title TEXT,
          album TEXT,
          genre TEXT,
          bpm FLOAT,
          key TEXT,
          position INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (playlist_id) REFERENCES playlists(id)
        );

```

2. Mixxx database (mixxxdb.sqlite)

    1.  Primary Tables
          - **`library`**: Main track metadata (artist, title, album, BPM, key, genre, etc.)
          - **`track_locations`**: File paths and metadata
          - **`crates`**: User-created track collections
          - **`crate_tracks`**: Track-to-crate relationships
          - **`Playlists`**: User playlists
          - **`PlaylistTracks`**: Playlist contents

    2. Platform-Specific Mixxx Database Locations

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
- react-window

## Dev Dependencies
- eslint
- electron
- electron-rebuild
- electron-vite

## Testing frameworks
- vitest
- playwright

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

2.  2\. Smart playlist Interface

3.  3\. Settings Panel
      - **Database path configuration**
      - **Export preferences**
      - **Application preferences**

## Core Features Specification

### Mixxx Database Operations
Read-only database operations

- getAllTracks()
- getTracksByFilter(criteria)
- getCrates()
- getPlaylists()
- getTrackMetadata(trackId)
- searchLibrary(query)

### Settings management
- Settings management UI - Create interface for API keys and
  database preferences
- Claude AI integration - Add API integration for natural language
  queries
### Playlist generation
- Smart Playlist generation based on user selected criteria
- M3U export functionality - Generate and export playlists in M3U
  format.
- Edit playlists after they are generated. Regenerate playlist.
- Music player to preview tracks
### Library management
- Library table display - Show tracks, crates, and playlists from
  Mixxx database
- Search and filtering - Implement library browsing with sort/filter
  capabilities
- Play audio files

## Error Handling Strategy

### Database Lock Contention (Mixxx database in use)

1.  **User Notification**: Clear error message with suggested actions

### API Failures

1.  **Network Issues**: Retry with timeout
2.  **Authentication**: Clear API key validation messages
3.  **Rate Limiting**: Respect API limits with user feedback
4.  **Service Unavailable**: Offline mode

### File System Issues

1.  **Missing Database**: Guide user to locate file manually

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

  - Library view
  - Implement settings management
  - Smart playlist MVP

### **Phase 3: Advanced Features**

  - Implement M3U export functionality
  - Polish UI/UX and error handling
  - Optional AI mode

### **Phase 4: Testing & Distribution**

  - Cross-platform testing
  - Performance optimization
  - Build and packaging setup

## Success Criteria

  - ✅ Successfully reads Mixxx database across all platforms
  - ✅ Provides intuitive library browsing with search/filter
  - ✅ Generates playlists based on user criteria (bpm, key/harmonic mixing, genres, ...etc)
  - ✅ Exports usable M3U files for Mixxx import
  - ✅ Handles errors gracefully with clear user feedback
  - ✅ Enables natural language queries about music collection

## Questions and considerations

### Logging

### Additional features

1.  Keyboard shortcuts
2.  Dark mode
3.  AI assisted playlist description

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
├── scripts
│   └── schema-dump.js
├── spec
│   ├── e2e
│   │   ├── database-connection.spec.js
│   │   ├── helpers
│   │   │   ├── electronApp.js
│   │   │   ├── sqliteManager.js
│   │   │   └── testDatabase.js
│   │   ├── playlist-creation.spec.js
│   │   ├── playlist-management.spec.js
│   │   └── track-search.spec.js
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
│   │       ├── components
│   │       │   ├── DatabaseConnectionModal.test.jsx
│   │       │   ├── filters
│   │       │   │   └── KeyMultiSelect.spec.jsx
│   │       │   └── playlist
│   │       │       └── TrackSearchModal.spec.jsx
│   │       ├── utilities
│   │       │   ├── formatDuration.spec.js
│   │       │   ├── generateM3UContent.spec.js
│   │       │   └── musicalKeys.spec.js
│   │       └── views
│   │           └── PlaylistDetailView.spec.jsx
│   └── setup.js
├── specifications
│   └── TRACKSEARCH.md
├── src
│   ├── main
│   │   ├── assets
│   │   │   └── beatbrain_logo.png
│   │   ├── database
│   │   │   ├── appDatabase
│   │   │   │   ├── migrationManager.js
│   │   │   │   ├── migrations
│   │   │   │   │   ├── add_filters_to_playlists.js
│   │   │   │   │   └── create_initial_tables.js
│   │   │   │   ├── playlistRepository.js
│   │   │   │   ├── settingsRepository.js
│   │   │   │   └── userPreferenceRepository.js
│   │   │   ├── appDatabase.js
│   │   │   └── mixxxDatabase.js
│   │   ├── index.js
│   │   └── ipc
│   │       ├── appDatabaseHandlers.js
│   │       ├── fileHandlers.js
│   │       └── mixxxDatabaseHandlers.js
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
│           │   ├── common
│           │   │   ├── ConfirmationPrompt.jsx
│           │   │   ├── FlashMessage.jsx
│           │   │   ├── InlineEditInput.jsx
│           │   │   └── ToastNotification.jsx
│           │   ├── DatabaseConnectionModal.jsx
│           │   ├── filters
│           │   │   ├── ArtistMultiSelect.jsx
│           │   │   ├── BpmRangeInput.jsx
│           │   │   ├── CrateMultiSelect.jsx
│           │   │   ├── GenreMultiSelect.jsx
│           │   │   ├── GroupingMultiSelect.jsx
│           │   │   ├── KeyMultiSelect.jsx
│           │   │   ├── selectCustomStyles.js
│           │   │   └── TrackCountInput.jsx
│           │   ├── LibraryStats.jsx
│           │   ├── MixxxDatabaseStatus.jsx
│           │   ├── Navigation
│           │   │   └── PlaylistList.jsx
│           │   ├── Navigation.jsx
│           │   ├── playlist
│           │   │   ├── PlaylistFiltersPopover.jsx
│           │   │   ├── PlaylistForm.jsx
│           │   │   ├── PlaylistTrackItem.jsx
│           │   │   ├── TrackSearchFilters.jsx
│           │   │   ├── TrackSearchInput.jsx
│           │   │   ├── TrackSearchModal.jsx
│           │   │   ├── TrackSearchResultItem.jsx
│           │   │   └── TrackSearchResults.jsx
│           │   ├── StatusBar.jsx
│           │   ├── SystemInformation.jsx
│           │   ├── TrackInfoModal.jsx
│           │   └── TrackList.jsx
│           ├── contexts
│           │   └── LibraryStatsContext.js
│           ├── hooks
│           │   ├── useDebounced.js
│           │   └── useKeyboardShortcut.js
│           ├── main.jsx
│           ├── utilities
│           │   ├── formatDate.js
│           │   ├── formatDuration.js
│           │   ├── formatString.js
│           │   ├── generateM3UContent.js
│           │   ├── keyboard.js
│           │   ├── musicalKeys.js
│           │   └── shuffleArrary.js
│           └── views
│               ├── LibraryView.jsx
│               ├── PlaylistCreationView.jsx
│               ├── PlaylistDetailView.jsx
│               └── SettingsView.jsx
├── structure.sql
└── vitest.config.js

35 directories, 97 files
```

# TODOS
## TODOs for initial project setup
### Setup Electron app
- [x] setup Electron desktop application using React, Bootstrap, and Vite.

## TODOs for Database modules
### create database modules and initialize them on application startup
- [x] Create `appDatabase.js` class with methods for managing settings and user preferences across two tables (`app_settings` and `user_preferences`)
- [x] Created `mixxxDatabase.js` module for connecting and reading from the mixxx database.

## TODOs for Feature: Core Navigation & Status (Phase 1)
### Create view routing system
- [x] Add navigation state management to App.jsx with default view as ‘playlist’
### Create view components directory structure
- [x] Create src/renderer/src/views/ directory with PlaylistView.jsx, LibraryView.jsx, SettingsView.jsx
- [x] Add Navigation.jsx component for view switching
### Implement database status display in status bar
- [x] Add component StatusBar.jsx
- [x] Connect status display to existing mixxxDatabase.js module and show connection state
### Add database connection prompts at startup
- [x] Implement auto-detection logic for Mixxx database on application startup. Update the existing logic to not automatically connect to Mixxx.
- [x] Create DatabaseConnectionModal component - Main dialog for connection prompts
- [x] Show user-friendly connection dialog if database is found. Ask user if they want to connect to the database that was autodetected.
- [x] provide option to manually select the Mixxx database path on local file system.
- [x] If no Mixxx database is auto detected, show option to select database path on local file system
- [x] Have checkbox to "remember my choice" / "do not prompt again", If
      selected, store the choice in the application database and use that to
      autmatically connect to the database.
- [x] Update MixxxDatabaseStatus component to have configure database button. On click, show the modal.
- [x] Make the database icon in the StatusBar component clickable. It brings up modal that contains the MixxxDatabaseStatus component

## TODOS for setting up a test suite
### Setup unit testing framework
- [x] Setup vitest
- [x] Write test for appDatabase.js
- [x] Write test for mixxxDatabase.js
- [x] Write test for DatabaseConnectionModal.jsx
### Setup end-to-end testing
- [x] Setup playwright
- [x] Write basic test to verify the database connection modal is presented

## TODOs continue e2e testing
- [x] figure out how to seed the appDatabase with user preferences and settings
- [x] Cache sqlite3 builds
- [x] write e2e test for configuring the mixxx database

## **TODO List: Playlist Generation (Phase 1: Basic UI - MVP)**
Build interface that allows users to filter the library to a subset of tracks
that should be considered for smart playlist generation. The parametes will be
used to perform a query against the Mixxx dabatase.

### **Setup & Dependencies**
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
- [x] Add method to appDatabase.js: `getAllPlaylists()` - fetch all playlists with metadata (id, name, track_count, duration, created_at, updated_at)
- [x] Add method to appDatabase.js: `getPlaylistById(id)` - fetch single playlist with full metadata
- [x] Add method to appDatabase.js: `getPlaylistTracks(playlistId)` - fetch all tracks for a playlist ordered by position
- [x] Add method to appDatabase.js: `updatePlaylist(id, { name, description })` - update playlist name and updated_at timestamp
- [x] Add method to appDatabase.js: `deletePlaylist(id)` - delete playlist and associated tracks (cascade)
- [x] Add method to appDatabase.js: `updateTrackPosition(playlistId, trackId, newPosition)` - reorder track in playlist
- [x] Add method to appDatabase.js: `removeTrackFromPlaylist(playlistId, trackId)` - remove single track from playlist
- [x] Add method to appDatabase.js: `addTrackToPlaylist(playlistId, trackData)` - add track to playlist (for future manual additions)

### **Navigation Component Updates**
- [x] Update Navigation.jsx: Add state for managing playlist list expansion/collapse
- [x] Update Navigation.jsx: Fetch all playlists on component mount using `getAllPlaylists()`
- [x] Update Navigation.jsx: Render dynamic playlist list under "Playlists" section
- [x] Update Navigation.jsx: Add Bootstrap Collapse component for expandable playlist section
- [x] Update Navigation.jsx: Show playlist count badge (e.g., "Playlists (26)")
- [x] Update Navigation.jsx: Add "+" button next to Playlists header to navigate to PlaylistsView
- [x] Update Navigation.jsx: Highlight active/selected playlist in navigation
- [x] Update Navigation.jsx: Handle click events on playlist items to navigate to detail view
- [x] Update Navigation.jsx: Add loading state while fetching playlists
- [x] Update Navigation.jsx: Add error handling for playlist fetch failures

### **Routing & View Management**
- [x] Update App.jsx: Extend view state to support playlist detail routing (e.g., `{ view: 'playlist-detail', playlistId: 123 }`)
- [x] Update App.jsx: Add navigation handler for playlist selection
- [x] Update App.jsx: Pass playlist navigation functions to Navigation component
- [x] Create view routing logic to render PlaylistDetailView when playlist is selected

### **Playlist List Component**
- [x] Create `src/renderer/src/components/PlaylistList.jsx` - component for rendering playlist items in navigation
- [x] PlaylistList.jsx: Accept playlists array and onSelect callback as props
- [x] PlaylistList.jsx: Render each playlist with icon, name, and track count
- [x] PlaylistList.jsx: Apply active styling to selected playlist
- [x] PlaylistList.jsx: Add hover effects and cursor pointer
- [x] PlaylistList.jsx: Handle empty state (no playlists created yet)

### **Playlist Detail View Component**
- [x] Create `src/renderer/src/views/PlaylistDetailView.jsx` - main view for viewing/editing a playlist
- [x] PlaylistDetailView.jsx: Accept playlistId as prop
- [x] PlaylistDetailView.jsx: Fetch playlist metadata and tracks on mount
- [x] PlaylistDetailView.jsx: Display playlist header with name, created date, track count, total duration
- [x] PlaylistDetailView.jsx: Add Export button (placeholder for now)
- [x] PlaylistDetailView.jsx: Add Delete button with confirmation modal
- [x] PlaylistDetailView.jsx: Add loading state while fetching playlist data
- [x] PlaylistDetailView.jsx: Add error handling for playlist fetch error
- [x] PlaylistDetailView.jsx: Calculate and display playlist statistics (total duration, avg BPM)
- [x] Extract alert component or notification component

### **Playlist Track Item Component**
- [x] Create `src/renderer/src/components/PlaylistTrackItem.jsx` - component for individual track in playlist
- [x] PlaylistTrackItem.jsx: Display track position number
- [x] PlaylistTrackItem.jsx: Display track metadata (title, artist, album, BPM, key, duration)
- [x] PlaylistTrackItem.jsx: Add remove button with confirmation
- [x] PlaylistTrackItem.jsx: Add drag handle for reordering (visual only for now)
- [x] PlaylistTrackItem.jsx: Style with Bootstrap table row or card
- [x] PlaylistTrackItem.jsx: Handle remove track action

### **Playlist Editing Features**
- [x] Implement inline playlist name editing in PlaylistDetailView
- [x] Add validation for playlist name (non-empty, max length)
- [x] Implement track removal with optimistic UI updates
- [x] Add confirmation modal for destructive actions (delete playlist, remove track)
- [x] Update playlist updated_at timestamp on any edit

### **Drag-and-Drop Track Reordering**
- [x] Install drag-and-drop library (use `@dnd-kit/core`)
- [x] Wrap track list in drag-and-drop context
- [x] Make PlaylistTrackItem components draggable
- [x] Implement drop handler to update track positions
- [x] Update playlist_tracks in the app database with their new track positions on drop
- [x] Fix bug where tracks are not reorderd after removal

### **Playlist Export (M3U)**
- [x] Create utility function to generate M3U file content from playlist tracks. Format M3U with extended metadata (#EXTINF). Meta data should be duration, artist and title. Include track file paths from Mixxx database. Encode with UTF-8.
- [x] Implement file save dialog using Electron's dialog API. Use a sensible default export location, like the user's Music folder if it exits, otherwise the user's home directory. This will be depend on the user's OS.
- [x] Add IPC handler for file system write operations
- [x] Add error handling for file write failures
- [x] Show success ToastNotification with the playlist file path after export (can the file path be a link to open the file?)
- [x] Store the export location is user_preferences and recall it when exporting in the future.

### **Polish & UX Enhancements**
- [x] Add info icon for each track that on click shows the full track details (what should the UX be? Modal? expand row item?)
- [x] Add tracks to playlist feature See ./specifications/TRACKSEARCH.md for feature specs

### **Testing**
- [x] Write unit tests for new appDatabase playlist methods
- [x] Write unit test for generateM3UContent
- [x] Write unit test for PlaylistDetailView component
- [x] Write e2e test for complete playlist management workflow
  - [x] create playlist
  - [x] Add track to playlist
  - [x] Remove track from playlist

## TODOs for Feature: Playlist (Phase 3: filter enhancements)
### Implement fields for user to filter tracks eligible for playlist creation and adding tracks to playlist
- [x] Filter by crates
- [x] Filter by Groupings
- [x] Filter by Artists
- [ ] Filter by Albums
- [x] Filter by musical key
- [ ] Filter by Year range
- [ ] Filter by last played date
- [ ] Filter by date added range
- [ ] Filter by times played
- [ ] Filter by rating
- [x] Persist the selected filters on the playlist record.
- [x] Show this data to the user on demand. Use these filters to initialize the add track search filters.
- [x] Selecting filters upon updating the available tracks should constrain the other filters (except for crates)
- [ ] Add missing icons to filter inputs.
- [x] Find a better way to handle alter table operations when initializing the database
### bug fixes
- [ ] Window scrolls all the way up after removing a track. Is is necessary to reload the playlist here?
- [ ] Is it necessary to reload the playlist when adding tracks? Can we do optimistic update to the view. Can the playlist stats be updated asynchronously?
- [ ] Window scrolls all the way up after clicking the mp3 link
- [ ] Change key notation select to something else. It looks like crap.
## TODOs for Feature: Playlist (Phase 4: harmonic mixing engine)
- [ ] Remove limit from DB query
- [ ] Add harmonic mixing select with options none, strict and creative (discuss this)
- [ ] Build harmonic mixing engine that creates a playlist order where tracks are harmonically compatible
## TODOs for Feature: Playlist (Phase 5: Audio Player)
- [ ] enqueue/play single track
- [ ] enqueue/play entire playlist in order
- [ ] show track waveform
## TODOs for Feature: Playlist (Phase 6: UX enhancements)
- [ ] Add option on playlist to set target BPM. Show how much percent the track will need to be pitched up or down next to the BPM value for each track.
- [ ] Show the transposed key next to the track's key based on the target BPM. (eg, the actual musical key expected based on the BPM the track will be played at)
- [ ] Add playlist duplication feature
- [ ] Add playlist combine feature with options to append or prepand other playlists
- [ ] R click on table header to select columns to show/hide
- [ ] Lazy render track list items for better performance for large playlists
- [ ] Add option to create empty playlist. I might want to use the add tracks feature to manually create playlists.
## TODOs for Documentation
- [ ] Update README with playlist management features
- [ ] Document M3U export format and compatibility
- [ ] Add screenshots of playlist views to documentation

## TODOs for Feature: Settings Foundation (Phase 2: API key management)
### Move existing components to Settings view
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
### Resizable Navigation Panel
- [ ] Add drag handle between navigation and main content
- [ ] Implement resize logic with min/max width constraints
- [ ] Persist user's preferred width in app settings
- [ ] Add double-click to reset to default width

# Notes
See also NOTES.md
