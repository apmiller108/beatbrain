import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TrackSearchModal from '@renderer/components/playlist/TrackSearchModal';
import { MixxxStatsContext } from '@renderer/contexts/MixxxStatsContext';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock the debounce hook to return the value immediately
vi.mock('@renderer/hooks/useDebounced', () => ({
  default: (value) => value, // Return value immediately without debouncing
}));

// Mock window.api
const mockGetAvailableKeys = vi.fn();
const mockGetAvailableCrates = vi.fn();
const mockGetAvailableGenres = vi.fn();
const mockGetTracks = vi.fn();
const mockGetUserPreference = vi.fn();
const mockGetSetting = vi.fn();
const mockSaveSearchFilters = vi.fn();
const mockGetTrackById = vi.fn();

window.api = {
  mixxx: {
    getAvailableKeys: mockGetAvailableKeys,
    getAvailableCrates: mockGetAvailableCrates,
    getAvailableGenres: mockGetAvailableGenres,
    getTracks: mockGetTracks,
    getTrackById: mockGetTrackById,
  },
  getUserPreference: mockGetUserPreference,
  getSetting: mockGetSetting,
  saveSearchFilters: mockSaveSearchFilters,
};

const mockMixxxStatsContextValue = {
  bpmRange: { minBpm: 100, maxBpm: 180 },
};

const defaultProps = {
  show: true,
  onHide: vi.fn(),
  onTracksAdded: vi.fn(),
  playlistTrackIds: [],
};

const renderComponent = (props = {}) => {
  return render(
    <MixxxStatsContext.Provider value={mockMixxxStatsContextValue}>
      <TrackSearchModal {...defaultProps} {...props} />
    </MixxxStatsContext.Provider>
  );
};

describe('TrackSearchModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default successful responses
    mockGetAvailableKeys.mockResolvedValue(['1A', '2A', '8A']);
    mockGetAvailableCrates.mockResolvedValue([{ id: 1, name: 'Main Crate' }]);
    mockGetAvailableGenres.mockResolvedValue(['House', 'Techno']);
    mockGetTracks.mockResolvedValue([]);
    mockGetUserPreference.mockImplementation((section, key) => {
      if (section === 'ui' && key === 'key_notation') {
        return Promise.resolve('original');
      }
      return Promise.resolve(null);
    });
    mockGetSetting.mockResolvedValue(null);
    mockSaveSearchFilters.mockResolvedValue();
    mockGetTrackById.mockResolvedValue({ id: 101, title: 'Details', artist: 'Artist' });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('renders correctly and loads initial data', async () => {
    renderComponent();

    expect(screen.getByText('Add Tracks to Playlist')).toBeInTheDocument();

    await waitFor(() => {
      expect(mockGetAvailableGenres).toHaveBeenCalled();
      expect(mockGetAvailableKeys).toHaveBeenCalled();
      expect(mockGetAvailableCrates).toHaveBeenCalled();
      expect(mockGetUserPreference).toHaveBeenCalledWith('ui', 'key_notation');
    });
  });

  it('performs a search when filters change', async () => {
    const user = userEvent.setup();

    const mockResults = [
      { id: 101, title: 'Test Track 1', artist: 'Artist A', bpm: 120, key: '1A' }
    ];
    mockGetTracks.mockResolvedValue(mockResults);

    renderComponent();

    // Wait for initial load to complete
    await waitFor(() => {
      expect(mockGetAvailableGenres).toHaveBeenCalled()
      expect(mockGetAvailableKeys).toHaveBeenCalled()
      expect(mockGetAvailableCrates).toHaveBeenCalled()
    });

    const input = screen.getByPlaceholderText(/Search by track name/i);

    // Clear any previous calls
    mockGetTracks.mockClear();

    // Type in the search box
    await user.type(input, 'Test');

    // Wait for the search to be called with the query
    await waitFor(() => {
      expect(mockGetTracks).toHaveBeenCalledWith(
        expect.objectContaining({
          query: 'Test'
        })
      );
    });

    // Wait for results to appear
    await waitFor(() => {
      expect(screen.getByText('Test Track 1')).toBeInTheDocument();
    });

    expect(screen.getByText('Artist A')).toBeInTheDocument();
  });

  it('allows selecting tracks and adding them', async () => {
    const user = userEvent.setup();

    mockGetTracks.mockResolvedValue([
      { id: 101, title: 'Track 1', artist: 'Artist A', bpm: 120, key: '1A' },
      { id: 102, title: 'Track 2', artist: 'Artist B', bpm: 130, key: '2A' }
    ]);

    const onTracksAdded = vi.fn();
    const onHide = vi.fn();

    renderComponent({ onTracksAdded, onHide });

    // Wait for initial load
    await waitFor(() => expect(mockGetAvailableGenres).toHaveBeenCalled());

    // Clear the initial getTracks call
    mockGetTracks.mockClear();

    // Trigger search by typing
    const input = screen.getByPlaceholderText(/Search by track name/i);
    await user.type(input, 'Track');

    // Wait for search results
    await waitFor(() => {
      expect(mockGetTracks).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText('Track 1')).toBeInTheDocument();
    });

    // Find all checkboxes (first one is "Select All", rest are individual tracks)
    const checkboxes = screen.getAllByRole('checkbox');

    // Click the first track's checkbox (index 1, since 0 is Select All)
    await user.click(checkboxes[1]);

    // Verify the Add button shows the count
    await waitFor(() => {
      const addButton = screen.getByRole('button', { name: /Add 1 Selected Tracks/i });
      expect(addButton).toBeEnabled();
    });

    // Click the Add button
    const addButton = screen.getByRole('button', { name: /Add 1 Selected Tracks/i });
    await user.click(addButton);

    // Verify callbacks
    expect(onTracksAdded).toHaveBeenCalledWith([
      expect.objectContaining({ id: 101, title: 'Track 1' })
    ]);
    expect(onHide).toHaveBeenCalled();
  });

  it('disables Add button when no tracks selected', async () => {
    const user = userEvent.setup();

    mockGetTracks.mockResolvedValue([
      { id: 101, title: 'Track 1', artist: 'Artist A', bpm: 120, key: '1A' }
    ]);

    renderComponent();

    await waitFor(() => expect(mockGetAvailableGenres).toHaveBeenCalled());

    mockGetTracks.mockClear();

    const input = screen.getByPlaceholderText(/Search by track name/i);
    await user.type(input, 'Track');

    await waitFor(() => {
      expect(mockGetTracks).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText('Track 1')).toBeInTheDocument();
    });

    // Find the Add button - it should show "Add Selected Tracks" when count is 0
    const addButton = screen.getByRole('button', { name: /Add Selected Tracks/i });
    expect(addButton).toBeDisabled();
  });

  it('handles toggle all functionality', async () => {
    const user = userEvent.setup();

    mockGetTracks.mockResolvedValue([
      { id: 101, title: 'Track 1', artist: 'Artist A', bpm: 120, key: '1A' },
      { id: 102, title: 'Track 2', artist: 'Artist B', bpm: 130, key: '2A' }
    ]);

    renderComponent();

    await waitFor(() => expect(mockGetAvailableGenres).toHaveBeenCalled());

    mockGetTracks.mockClear();

    const input = screen.getByPlaceholderText(/Search by track name/i);
    await user.type(input, 'Track');

    await waitFor(() => expect(mockGetTracks).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByText('Track 1')).toBeInTheDocument());

    const checkboxes = screen.getAllByRole('checkbox');
    const selectAllCheckbox = checkboxes[0];

    // Select all
    await user.click(selectAllCheckbox);

    await waitFor(() => {
      const addButton = screen.getByRole('button', { name: /Add 2 Selected Tracks/i });
      expect(addButton).toBeEnabled();
    });

    // Deselect all
    await user.click(selectAllCheckbox);

    await waitFor(() => {
      const addButton = screen.getByRole('button', { name: /Add Selected Tracks/i });
      expect(addButton).toBeDisabled();
    });
  });

  it('excludes tracks already in playlist from selection', async () => {
    const user = userEvent.setup();

    mockGetTracks.mockResolvedValue([
      { id: 101, title: 'Track 1', artist: 'Artist A', bpm: 120, key: '1A' },
      { id: 102, title: 'Track 2', artist: 'Artist B', bpm: 130, key: '2A' }
    ]);

    // Track 101 is already in the playlist
    renderComponent({ playlistTrackIds: [101] });

    await waitFor(() => expect(mockGetAvailableGenres).toHaveBeenCalled());

    mockGetTracks.mockClear();

    const input = screen.getByPlaceholderText(/Search by track name/i);
    await user.type(input, 'Track');

    await waitFor(() => expect(mockGetTracks).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByText('Track 1')).toBeInTheDocument());

    const checkboxes = screen.getAllByRole('checkbox');

    // The first track's checkbox should be disabled
    expect(checkboxes[1]).toBeDisabled();

    // The second track's checkbox should be enabled
    expect(checkboxes[2]).not.toBeDisabled();
  });
});
