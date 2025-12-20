import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import TrackSearchModal from '@renderer/components/playlist/TrackSearchModal';
import { MixxxStatsContext } from '@renderer/contexts/MixxxStatsContext';

// Mock window.api
const mockGetAvailableKeys = vi.fn(() => Promise.resolve([]));
const mockGetAvailableCrates = vi.fn(() => Promise.resolve([]));
const mockGetAvailableGenres = vi.fn(() => Promise.resolve([]));
const mockGetTracks = vi.fn(() => Promise.resolve([{ id: 1, title: 'Track A' }]));
const mockGetUserPreference = vi.fn(() => Promise.resolve('camelot'));
const mockGetSetting = vi.fn(() => Promise.resolve(null));
const mockSaveSearchFilters = vi.fn(() => Promise.resolve());

window.api = {
  mixxx: {
    getAvailableKeys: mockGetAvailableKeys,
    getAvailableCrates: mockGetAvailableCrates,
    getAvailableGenres: mockGetAvailableGenres,
    getTracks: mockGetTracks,
  },
  getUserPreference: mockGetUserPreference,
  getSetting: mockGetSetting,
  saveSearchFilters: mockSaveSearchFilters,
};

const mockMixxxStatsContextValue = {
  bpmRange: { minBpm: 100, maxBpm: 180 },
};

const renderComponent = () => {
  render(
    <MixxxStatsContext.Provider value={mockMixxxStatsContextValue}>
      <TrackSearchModal show={true} onHide={vi.fn()} onTracksAdded={vi.fn()} />
    </MixxxStatsContext.Provider>
  );
};

describe('TrackSearchModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('fetches initial filter data but does not search on mount', async () => {
    renderComponent();

    await waitFor(() => {
      expect(mockGetAvailableKeys).toHaveBeenCalled();
      expect(mockGetAvailableCrates).toHaveBeenCalled();
      expect(mockGetAvailableGenres).toHaveBeenCalled();
      expect(mockGetSetting).toHaveBeenCalled();
    });

    // Should NOT search on initial mount due to isInitialMount.current check
    expect(mockGetTracks).not.toHaveBeenCalled();
  });

  it('searches when user types in search input (debounced)', async () => {
    renderComponent();
    const searchInput = screen.getByTestId('track-search-input');

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'test query' } });
      await vi.advanceTimersByTimeAsync(200); // Before debounce
    });
    expect(mockGetTracks).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100); // Past debounce
    });
    expect(mockGetTracks).toHaveBeenCalledTimes(1);
    expect(mockGetTracks).toHaveBeenCalledWith(expect.objectContaining({ query: 'test query' }));
  });

  it('searches when filters change (debounced)', async () => {
    renderComponent();
    const filterButton = screen.getByTestId('mock-filter-change');

    await act(async () => {
      fireEvent.click(filterButton);
      await vi.advanceTimersByTimeAsync(200); // Before debounce
    });
    expect(mockGetTracks).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100); // Past debounce
    });
    expect(mockGetTracks).toHaveBeenCalledTimes(1);
    expect(mockGetTracks).toHaveBeenCalledWith(expect.objectContaining({ genres: expect.any(Array) }));
  });

  it('calls onTracksAdded with selected tracks and closes', async () => {
    const onTracksAdded = vi.fn();
    const onHide = vi.fn();
    mockGetTracks.mockResolvedValueOnce([
      { id: 1, title: 'Track A' },
      { id: 2, title: 'Track B' },
    ]);

    render(
      <MixxxStatsContext.Provider value={mockMixxxStatsContextValue}>
        <TrackSearchModal show={true} onHide={onHide} onTracksAdded={onTracksAdded} />
      </MixxxStatsContext.Provider>
    );

    // Let the initial search run
    await act(async () => {
      const searchInput = screen.getByTestId('track-search-input');
      fireEvent.change(searchInput, { target: { value: 'test' } });
      await vi.runAllTimersAsync();
    });

    // await waitFor(async () => {
    // const checkboxes = await screen.findAllByRole('checkbox');
    // console.log('Checkboxes found:', checkboxes.length);
    // await act(async () => {
    //   fireEvent.click(checkboxes[0]);
    // });
    // });

    const addButton = screen.getByRole('button', { name: /Add 1 Selected Tracks/i });
    await act(async () => {
      fireEvent.click(addButton);
    });

    expect(onTracksAdded).toHaveBeenCalledWith([expect.objectContaining({ id: 1, title: 'Track A' })]);
    expect(onHide).toHaveBeenCalled();
  });
});
