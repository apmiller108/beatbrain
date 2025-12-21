import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PlaylistDetailView from '@renderer/views/PlaylistDetailView';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock child components
vi.mock('@renderer/components/common/ConfirmationPrompt', () => ({
  default: ({ show, title, onConfirm, onCancel }) => show ? (
    <div data-testid="confirmation-prompt">
      <div data-testid="confirmation-title">{title}</div>
      <button onClick={onConfirm}>Confirm</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ) : null
}));

vi.mock('@renderer/components/common/InlineEditInput', () => ({
  default: ({ value, onSave, children }) => (
    <div data-testid="inline-edit">
      {children}
      <button onClick={() => onSave('New Name')}>Save Name</button>
      <button onClick={() => onSave('New Description')}>Save Desc</button>
    </div>
  )
}));

vi.mock('@renderer/components/playlist/PlaylistTrackItem', () => ({
  default: ({ track, onRemove }) => (
    <tr data-testid={`track-${track.id}`}>
      <td>{track.title}</td>
      <td>
        <button onClick={() => onRemove(track.id)}>Remove</button>
      </td>
    </tr>
  )
}));

vi.mock('@renderer/components/playlist/TrackSearchModal', () => ({
  default: ({ show, onHide, onTracksAdded }) => show ? (
    <div data-testid="track-search-modal">
      <button onClick={onHide}>Close</button>
      <button onClick={() => onTracksAdded([{ id: 201, title: 'New Track' }])}>Add Track</button>
    </div>
  ) : null
}));

// Mock window.api
const mockGetPlaylistById = vi.fn();
const mockUpdatePlaylist = vi.fn();
const mockRemoveTrackFromPlaylist = vi.fn();
const mockAddTracksToPlaylist = vi.fn();
const mockDeletePlaylist = vi.fn();
const mockUpdateTrackPositions = vi.fn();
const mockGetUserPreference = vi.fn();
const mockSetUserPreference = vi.fn();
const mockGetPlatform = vi.fn();
const mockGetSetting = vi.fn();
const mockSaveM3UPlaylist = vi.fn();
const mockSetSetting = vi.fn();

window.api = {
  getPlaylistById: mockGetPlaylistById,
  updatePlaylist: mockUpdatePlaylist,
  removeTrackFromPlaylist: mockRemoveTrackFromPlaylist,
  addTracksToPlaylist: mockAddTracksToPlaylist,
  deletePlaylist: mockDeletePlaylist,
  updateTrackPositions: mockUpdateTrackPositions,
  getUserPreference: mockGetUserPreference,
  setUserPreference: mockSetUserPreference,
  getPlatform: mockGetPlatform,
  getSetting: mockGetSetting,
  saveM3UPlaylist: mockSaveM3UPlaylist,
  setSetting: mockSetSetting,
};

const mockPlaylist = {
  id: 1,
  name: 'Test Playlist',
  description: 'Test Description',
  created_at: '2023-01-01',
  updated_at: '2023-01-02',
  tracks: [
    { id: 101, title: 'Track 1', artist: 'Artist A', duration: 180, bpm: 120, position: 0, source_track_id: 1 },
    { id: 102, title: 'Track 2', artist: 'Artist B', duration: 200, bpm: 125, position: 1, source_track_id: 2 },
  ]
};

describe('PlaylistDetailView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.scrollTo = vi.fn();
    mockGetPlaylistById.mockResolvedValue(mockPlaylist);
    mockGetUserPreference.mockResolvedValue('original');
    mockGetPlatform.mockResolvedValue('linux');
    mockUpdatePlaylist.mockResolvedValue();
    mockRemoveTrackFromPlaylist.mockResolvedValue();
    mockAddTracksToPlaylist.mockResolvedValue();
    mockDeletePlaylist.mockResolvedValue();
    mockUpdateTrackPositions.mockResolvedValue();
    mockSaveM3UPlaylist.mockResolvedValue({ success: true, filePath: '/tmp/playlist.m3u' });
    mockGetSetting.mockResolvedValue('/tmp');
  });

  const renderComponent = (props = {}) => {
    return render(
      <PlaylistDetailView
        playlistId={1}
        onPlaylistDeleted={vi.fn()}
        onPlaylistUpdated={vi.fn()}
        setNotification={vi.fn()}
        {...props}
      />
    );
  };

  it('renders playlist details correctly', async () => {
    renderComponent();

    expect(screen.getByText(/Loading playlist.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Test Playlist')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
      expect(screen.getByText('2 tracks')).toBeInTheDocument();
    });
  });

  it('handles playlist update (name)', async () => {
    const onPlaylistUpdated = vi.fn();
    renderComponent({ onPlaylistUpdated });

    await waitFor(() => expect(screen.getByText('Test Playlist')).toBeInTheDocument());

    // Simulate save from InlineEditInput mock
    const saveButtons = screen.getAllByText('Save Name');
    fireEvent.click(saveButtons[0]);

    await waitFor(() => {
      expect(mockUpdatePlaylist).toHaveBeenCalledWith(1, { name: 'New Name' });
      expect(onPlaylistUpdated).toHaveBeenCalledWith(1, { name: 'New Name' });
    });
  });

  it('handles track removal', async () => {
    const onPlaylistUpdated = vi.fn();
    renderComponent({ onPlaylistUpdated });

    await waitFor(() => expect(screen.getByText('Track 1')).toBeInTheDocument());

    const removeButtons = screen.getAllByText('Remove');
    fireEvent.click(removeButtons[0]); // Remove first track

    // Check confirmation prompt
    expect(screen.getByTestId('confirmation-prompt')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to remove "Track 1"/i)).toBeInTheDocument();

    // Confirm removal
    fireEvent.click(screen.getByText('Confirm'));

    await waitFor(() => {
      expect(mockRemoveTrackFromPlaylist).toHaveBeenCalledWith(1, 101);
      expect(onPlaylistUpdated).toHaveBeenCalledWith(1);
      expect(mockGetPlaylistById).toHaveBeenCalledTimes(2); // Initial + reload
    });
  });

  it('handles playlist deletion', async () => {
    const onPlaylistDeleted = vi.fn();
    renderComponent({ onPlaylistDeleted });

    await waitFor(() => expect(screen.getByText('Test Playlist')).toBeInTheDocument());

    // Find delete button. It has class "btn-danger"
    const buttons = screen.getAllByRole('button');
    const deleteBtn = document.querySelector('.btn-danger');
    fireEvent.click(deleteBtn);

    expect(screen.getByTestId('confirmation-prompt')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete the playlist/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText('Confirm'));

    await waitFor(() => {
      expect(mockDeletePlaylist).toHaveBeenCalledWith(1);
      expect(onPlaylistDeleted).toHaveBeenCalledWith(1);
    });
  });

  it('opens and closes add tracks modal', async () => {
    const onPlaylistUpdated = vi.fn();
    renderComponent({ onPlaylistUpdated });

    await waitFor(() => expect(screen.getByText('Test Playlist')).toBeInTheDocument());

    // Find add tracks button. It has id="add-tracks-btn"
    const addBtn = document.querySelector('#add-tracks-btn');
    fireEvent.click(addBtn);

    expect(screen.getByTestId('track-search-modal')).toBeInTheDocument();

    // Simulate adding tracks
    fireEvent.click(screen.getByText('Add Track'));

    await waitFor(() => {
      expect(mockAddTracksToPlaylist).toHaveBeenCalledWith(1, [{ id: 201, title: 'New Track' }]);
      expect(onPlaylistUpdated).toHaveBeenCalledWith(1);
      expect(mockGetPlaylistById).toHaveBeenCalledTimes(2);
    });
  });

  it('handles export playlist', async () => {
    const setNotification = vi.fn();
    renderComponent({ setNotification });

    await waitFor(() => expect(screen.getByText('Test Playlist')).toBeInTheDocument());

    // Export is primary button
    const exportBtn = document.querySelector('.btn-primary');
    fireEvent.click(exportBtn);

    await waitFor(() => {
      expect(mockSaveM3UPlaylist).toHaveBeenCalled();
      expect(setNotification).toHaveBeenCalledWith(expect.objectContaining({
        type: 'success',
        message: expect.stringContaining('exported successfully')
      }));
    });
  });
});
