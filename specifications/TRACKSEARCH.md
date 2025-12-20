# UX for Track Search & Add Feature

## **Approach: Modal with Advanced Search**

A **modal dialog** triggered by an "Add Tracks" button in the playlist header. This approach works well because:

1. **Doesn't disrupt the current view** - User stays in context of the playlist
2. **Provides focused search experience** - Modal creates dedicated space for complex filtering
3. **Allows multi-select** - Users can add multiple tracks at once
4. **Familiar pattern** - Similar to your existing DatabaseConnectionModal

---

## **Proposed UX Flow**

### **1. Entry Point**
Add an "Add Tracks" button next to the Export/Delete buttons in the playlist header:

```
[📝 Edit Name] [Avg BPM: 136.7] [➕ Add Tracks] [💾 Export] [🗑️ Delete]
```

### **2. Modal Structure**

```
                           ────────────────────────────────────┐
│  Add Tracks to Playlist                                  [✕] │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  🔍 Quick Search                                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Search by track name, artist, album...                  │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ▼ Advanced Filters (collapsible)                            │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ BPM: [120] - [140]    Key: [Any ▼]                      │ │
│  │ Genre: [House, Techno ▼]    Crate: [Any ▼]              │ │
│  │ Year: [2020] - [2025]    Label: [____________]           │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  📊 Found 47 tracks                                           │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ ☑ Select All                                            │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │ ☐ Murder The Limits - Lewis Fauzi (138 BPM, 8A)        │ │
│  │ ☐ Blood - Phara (140 BPM, 7B)                           │ │
│  │ ☑ End Up Here - Nastia Reigel (140 BPM, 6A)            │ │
│  │ ☐ Machina - Bartig Move (133 BPM, 1A)                   │ │
│  │   ... (scrollable list)                                  │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│                    [Cancel]  [Add 3 Selected Tracks]         │
└─────────────────────────────────────────────────────────────┘
```

---

## **Key UX Features**

### **Two-Tier Search System**

1. **Quick Search (Always Visible)**
   - Single text input with fuzzy search
   - Searches across: track name, artist, album, label
   - Real-time results as user types
   - Most users will use this 90% of the time

2. **Advanced Filters (Collapsible)**
   - Reuse your existing filter components (BpmRangeInput, GenreMultiSelect)
   - Add new filters: Key, Crate, Year Range, Label
   - Filters combine with AND logic
   - Show/hide with chevron icon

### **Results Display**

- **Checkbox list** with track metadata preview
- Show key info: Title, Artist, BPM, Key
- **Virtual scrolling** for large resultuse `react-window`)
- **Select All/None** toggle
- **Result count** badge ("Found 47 tracks")

### **Smart Defaults**

- Pre-populate BPM range based on playlist's average BPM (±10 BPM)
- Pre-select genres already in playlist
- Remember last used filters in session

---

## **Alternative Approaches (Not Recommended)**

### ❌ **Inline Search Panel**
```
Pros: No modal, always visible
Cons: Takes up screen space, clutters playlist view, harder to implement multi-select
```

### ❌ **Sidebar Drawer**
```
Pros: Modern, doesn't block view
Cons: Reduces playlist visibility, awkward on smaller screens
```

### ❌ **Separate "Add Tracks" View**
```
Pros: Maximum space for search
Cons: Loses context of playlist, requires navigation back/forth
```

---

## **Implementation Recommendations**

### **Component Structure**
```
src/renderer/src/components/
├── TrackSearchModal.jsx          # Main modal container
├── TrackSearchInput.jsx        # Quick search input
├── TrackSearchFilters.jsx    # Collapsible filter panel
├── TrackSearchResults.jsx      # Scrollable results list
└── TrackSearchResultItem.jsx   # Individual track checkbox item
```

### **State Management**
```javascript
const [searchQuery, setSearchQuery] = useState('')
const [filters, setFilters] = useState({
  bpmMin: null,
  bpmMax: null,
  genres: [],
  keys: [],
  crates: [],
  yearMin: null,
  yearMax: null,
  label: ''
})
const [results, setResults] = useState([])
const [selectedTracks, setSelectedTracks] = useState(new Set())
```

### **Database Query**
Re-use mixxxDatabse.getTracks(quereyParams)

### **Performance Considerations**
- **Debounce** quick search (300ms)
- **Limit** initial results to 100 tracks
- Use **pagination** or virtual scrolling for large result sets
- **Cache** filter options (genres, crates, keys)

---

## **Bonus UX Enhancements**

1. **Duplicate Detection**: Gray out tracks already in playlist
2. **Keyboard Shortcuts**:
   - `Cmd/Ctrl + F` to open modal
   - `Enter` to add selected tracks
   - `Esc` to close
3. **Drag-to-Reorder After Add**: Newly added tracks appear at bottom, user can drag to position
4. **Undo Add**: Toast notification with "Undo" button after adding tracks

---

## **Why This Approach Works Best**

✅ **Familiar pattern** - Modals are expected for "add" actions
✅ **Flexible** - Supports both simple and complex searches
✅ **Focused** - User isn't distracted by playlist while searching
✅ **Scalable** - Easy to add more filters later
✅ **Mobile-friendly** - Modal adapts well to smaller screens

# Implementation Plan (TODOs)

This plan breaks down the work required to implement the "Add Tracks to Playlist" feature based on the UX recommendations above.

### **Phase 1: Backend & Core Logic**

#### **1. Database Layer (`src/main/database/mixxxDatabase.js`)**
- [x] Update search method: `getTracks(filters)`.
    - `filters` object should support:
        - `query` (for string-based search on artist, title, album)
        - `bpmMin`, `bpmMax`
        - `genres` (array)
        - `keys` (array of harmonic keys that could be the camelot or original key notation)
        - `crates` (array of crate IDs)
- [x] Create methods to fetch options for advanced filters:
    - [x] `getAvailableKeys()` - Return all unique, non-empty keys from the `library` table. Convert to the Camelot key notation, but also return the original notiation.
    - [x] `getAvailableCrates()` - Return all crates (id, name) from the `crates` table.

#### **2. App Database Layer (`src/main/database/appDatabase.js`)**
- [x] Create a new method `addTracksToPlaylist(playlistId, tracks)` that takes an array of Mixxx tracks, and adds them as new entries in the `playlist_tracks` table.

#### **3. Main Process - IPC Handlers**
- [x] In `src/main/ipc/mixxxDatabaseHandlers.js` Add handlers for `mixxx:getAvailableKeys` and `mixxx:getAvailableCrates`.
- [x] In `src/main/ipc/appDatabaseHandlers.js` Add handler for `app:addTracksToPlaylist` that calls `appDatabase.addTracksToPlaylist()`.

#### **4. Preload Script (`src/preload/index.mjs`)**
- [x] Expose the new IPC channels: `getAvailableKeys`, `getAvailableCrates`, and `addTracksToPlaylist` on the `window.api` object.

---

### **Phase 2: Frontend - UI Components**

#### **1. Create New Filter Components (`src/renderer/src/components/filters/`)**
- [x] Create `KeyMultiSelect.jsx` for filtering by musical key, using `react-select`.
- [x] Create `CrateMultiSelect.jsx` for filtering by Mixxx crates, using `react-select`.

#### **2. Create Search Modal Components (`src/renderer/src/components/`)**
- [x] **`TrackSearchModal.jsx`**: The main modal container (`react-bootstrap/Modal`).
    - Manages state for search, filters, results, and selected tracks.
    - Fetches filter options (genres, keys, crates) on mount.
    - Renders the other search components.
    - Contains "Cancel" and "Add X Selected Tracks" buttons.
- [x] **`TrackSearchInput.jsx`**: A simple, debounced text input for the quick search.
- [x] **`TrackSearchFilters.jsx`**: A collapsible section containing:
    - Reused `BpmRangeInput.jsx` and `GenreMultiSelect.jsx`.
    - New `KeyMultiSelect.jsx` and `CrateMultiSelect.jsx`.
- [x] **`TrackSearchResults.jsx`**: Container for the results list.
    - Implements virtual scrolling (e.g., with `react-window`) for performance.
    - Includes "Select All" / "Deselect All" functionality.
- [x] **`TrackSearchResultItem.jsx`**: An individual item in the results list.
    - Displays track info (title, artist, BPM, key).
    - re-use TrackInfoModal for full track details.
    - Has a checkbox for selection.
    - Is disabled/styled differently if the track is already in the current playlist.

---

### **Phase 3: Integration & State Management**

#### **1. `PlaylistDetailView.jsx` Integration**
- [x] Add an "Add Tracks" button to the header, next to the "Export" button.
- [x] Add state to manage the visibility of `TrackSearchModal` (e.g., `const [showTrackSearchModal, setShowTrackSearchModal] = useState(false)`).
- [x] Pass the current playlist's track IDs to `TrackSearchModal` for duplicate detection.
- [x] Pass a handler to `TrackSearchModal` that is called when tracks are added.
    - The handler should call `window.api.addTracksToPlaylist(playlistId, selectedTrackIds)`.
    - On success, it should refresh the playlist data (`loadPlaylist()`) and trigger `onPlaylistUpdated()`.
    - It should also show a success notification/toast.
---

### **Phase 4: Polish & UX**

- [x] Implement debouncing for the quick search input (300ms).
- [x] Display a "Found X tracks" count in the results area.
- [x] Add loading indicators while a search is in progress.
- [x] Disable the "Add Selected Tracks" button if no tracks are selected, and update its text dynamically.
- [x] Add a keyboard shortcut (`Esc`) to close the modal.
- [x] Add a keyboard shortcut CTL/CMD-F to open search modal

---

### **Phase 5: Testing**

#### **Unit Tests**:
- [x]`appDatabase.addTracksToPlaylist()` logic.
- [x] `KeyMultiSelect` component test
- [x] `TrackSearchModal.jsx` component test
- [x] **E2E Test (Playwright)**:
    - Create a test that:
        1. Navigates to a playlist.
        2. Clicks the "Add Tracks" button.
        3. Uses the quick search and an advanced filter.
        4. Selects a few tracks.
        5. Clicks "Add".
        6. Verifies the modal closes and the new tracks appear in the `PlaylistDetailView`.
