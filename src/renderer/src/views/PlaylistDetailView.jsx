import { useState, useEffect } from 'react'
import { Card, Spinner, Badge, Table, Button } from 'react-bootstrap'
import { Clock, MusicNote, Calendar, BoxArrowDown, Trash3 } from 'react-bootstrap-icons'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'

import propTypes from 'prop-types'
import formatDuration from '../utilities/formatDuration'
import generateM3UContent from '../utilities/generateM3UContent'
import ConfirmationPrompt from '../components/common/ConfirmationPrompt'
import FlashMessage from '../components/common/FlashMessage'
import InlineEditInput from '../components/common/InlineEditInput'
import PlaylistTrackItem from '../components/PlaylistTrackItem'

const PlaylistDetailView = ({ playlistId, onPlaylistDeleted, onPlaylistUpdated, setNotification }) => {
  const [playlist, setPlaylist] = useState(null)
  const [playlistStats, setPlaylistStats] = useState({
    totalDuration: 0,
    avgBpm: 0,
    trackCount: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [confirmationTitle, setConfirmationTitle] = useState('')
  const [confirmationAction, setConfirmationAction] = useState(null)
  const [playlistError , setPlaylistError] = useState(null)
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    loadPlaylist()
  }, [playlistId])

  useEffect(() => {
    calculatePlaylistStats()
  }, [playlist])

  const loadPlaylist = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await window.api.getPlaylistById(playlistId)
      setPlaylist(data)
    } catch (err) {
      console.error('Failed to load playlist:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Calculate playlist statistics
  const calculatePlaylistStats = () => {
    if (!playlist || !playlist.tracks) return null
    const trackCount = playlist.tracks.length

    const totalDuration = playlist.tracks.reduce((sum, track) => sum + (track.duration || 0), 0)
    const avgBpm = trackCount > 0
          ? playlist.tracks.reduce((sum, track) => sum + (track.bpm || 0), 0) / trackCount
          : 0

    setPlaylistStats({
      totalDuration,
      avgBpm: avgBpm.toFixed(1),
      trackCount
    })
  }

  const handleSaveName = async (newName) => {
    if (!newName.trim()) {
      setPlaylistError('Playlist name cannot be empty.')
      return
    }

    if (newName === playlist.name) {
      return
    }

    await updatePlaylist({ name: newName })
  }

  const handleSaveDescription = async (newDescription) => {
    if (newDescription === (playlist.description || '')) {
      return
    }

    await updatePlaylist({ description: newDescription })
  }

  const updatePlaylist = async (attributes) => {
    try {
      await window.api.updatePlaylist(playlist.id, attributes)
      setPlaylist(prev => ({ ...prev, ...attributes }))
      onPlaylistUpdated(playlist.id, attributes)
    } catch (err) {
      console.error('Failed to update playlist:', err)
      setPlaylistError(`Failed to update playlist: ${err.message}`)
    }
  }

  const handleRemoveTrack = (trackId) => {
    const scrollPosition = window.scrollY
    const track = playlist.tracks.find(t => t.id === trackId)
    setConfirmationTitle(`Are you sure you want to remove "${track.title}" from the playlist?`)
    setShowConfirmation(true)
    setConfirmationAction(() => async () => {
      try {
        setIsUpdatingOrder(true)
        await window.api.removeTrackFromPlaylist(playlistId, trackId)
        loadPlaylist()
        onPlaylistUpdated(playlistId)
        // If the window has been scrolled, removing a track re-renders the list and resets scroll.
        // This attempts to restore the scroll position.
        setTimeout(() => {
          requestAnimationFrame(() => {
            window.scrollTo({
              top: scrollPosition,
              behavior: 'instant'
            })
          })
        })
      } catch (err) {
        console.error('Failed to remove track:', err)
        setPlaylistError(`Failed to remove track: ${err.message}`)
      } finally {
        setShowConfirmation(false)
        setIsUpdatingOrder(false)
      }
    })
  }

  const handleDeletePlaylist = () => {
    setConfirmationTitle(`Are you sure you want to delete the playlist "${playlist.name}"?`)
    setShowConfirmation(true)
    setConfirmationAction(() => async () => {
      try {
        await window.api.deletePlaylist(playlist.id)
        onPlaylistDeleted(playlistId)
      } catch (err) {
        console.error('Failed to delete playlist:', err)
        setPlaylistError(`Failed to delete playlist: ${err.message}`)
      } finally {
        setShowConfirmation(false)
      }
    })
  }

  const handleExportPlaylist = async () => {
    setIsExporting(true)

    try {
      const m3uContent = generateM3UContent(playlist)
      const lastExportPath = await window.api.getSetting('playlist_export_path')
      const result = await window.api.saveM3UPlaylist({ content: m3uContent, playlistName: playlist.name, lastExportPath })
      if (result.success) {
        await window.api.setSetting('playlist_export_path', result.exportPath)

        setNotification({
          show: true,
          type: 'success',
          message: `Playlist exported successfully to ${result.fileName}`,
          filePath: result.filePath
        })
      }

      if (!result.success && !result.canceled) {
        throw new Error(result.error?.message || 'Unknown error during export')
      }
    } catch (err) {
      console.error('Failed to export playlist:', err)
      setPlaylistError(`Failed to export playlist: ${err.message}`)
    } finally {
      setIsExporting(false)
    }
  }

  // Track reordering handlers
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }
    const originalTracks = [...playlist.tracks]
    const oldIndex = playlist.tracks.findIndex(track => track.id === active.id)
    const newIndex = playlist.tracks.findIndex(track => track.id === over.id)

    const reorderedTracks = arrayMove(playlist.tracks, oldIndex, newIndex)
          .map((track, index) => ({ ...track, position: index }))

    try {
      // dragging is disabled during update
      setIsUpdatingOrder(true)
      // optimistically update UI
      setPlaylist(prev => ({ ...prev, tracks: reorderedTracks }))
      // Persist positions of tracks that changed position
      const tracksWithChangedPositions = reorderedTracks.filter((track) => {
        const originalTrack = originalTracks.find(t => t.id === track.id)
        return track.position !== originalTrack.position
      })
      await window.api.updateTrackPositions(playlist.id, tracksWithChangedPositions)
    } catch (error) {
      console.error('Failed to reorder tracks:', error)
      setPlaylistError(`Failed to reorder tracks: ${error.message}`)
      setPlaylist(prev => ({ ...prev, tracks: originalTracks })) // revert on error
      return
    } finally {
      setIsUpdatingOrder(false)
      // Remove focus from the dragged item
      document.querySelector(`#track-${active.id}`)?.querySelector('.grip-icon')?.blur()
    }
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
        <p className="mt-3 text-muted">Loading playlist...</p>
      </div>
    )
  }

  if (error) {
    return (
      <FlashMessage variant="danger" heading="Error Loading Playlist" message={error} />
    )
  }

  return (
    <div className="playlist-detail-view">
      { playlistError && (
        <FlashMessage variant='warning' className="py-2 mb-2" onClose={() => setPlaylistError(null)} dismissible={true} message={playlistError}/>
      )}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <InlineEditInput value={playlist.name}
                               onSave={handleSaveName}
                               id="playlist-name-input"
                               slot={ <h2 className="mb-0">{playlist.name}</h2> }/>
              <div className="mt-1">
                <InlineEditInput value={playlist.description}
                                 onSave={handleSaveDescription}
                                 id="playlist-description-input"
                                 slot={
                                   <p className="text-muted mb-0">
                                     {playlist.description || <span className="text-muted fst-italic">No description</span>}
                                   </p>
                                 }/>
              </div>

              {/* Playlist Metadata */}
              <div className="d-flex gap-4 flex-wrap">
                <div className="d-flex align-items-center">
                  <MusicNote className="me-2" />
                  <span>{playlistStats.trackCount} tracks</span>
                </div>
                <div className="d-flex align-items-center">
                  <Clock className="me-2" />
                  <span>{formatDuration(playlistStats.totalDuration)}</span>
                </div>
                {playlistStats.avgBpm > 0 && (
                  <div>
                    <Badge bg="info">Avg BPM: {playlistStats.avgBpm}</Badge>
                  </div>
                )}
                <div className="d-flex align-items-center">
                  <Calendar className="me-2" />
                  <span>Created {new Date(playlist.created_at).toLocaleDateString()}</span>
                </div>
                <div className="d-flex align-items-center">
                  <Calendar className="me-2" />
                  <span>Updated {new Date(playlist.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="d-flex gap-2">
              <OverlayTrigger overlay={<Tooltip>Export Playlist</Tooltip>}>
                <Button variant="primary" onClick={handleExportPlaylist} disabled={isExporting}>
                  <BoxArrowDown />
                </Button>
              </OverlayTrigger>
              <OverlayTrigger overlay={<Tooltip>Delete Playlist</Tooltip>}>
                <Button variant="danger" onClick={handleDeletePlaylist}>
                  <Trash3 />
                </Button>
              </OverlayTrigger>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Track List */}
      <Card className="shadow-sm">
        <Card.Header>
          <h5 className="mb-0">
            Tracks
            {isUpdatingOrder && (
              <small className="text-muted ms-2 fs-6">
                Updating playlist...
              </small>
            )}
          </h5>
        </Card.Header>
        <Card.Body className="p-0">
          {playlist.tracks && playlist.tracks.length > 0 ? (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} autosScroll={!isUpdatingOrder}>
              <SortableContext items={playlist.tracks.map(t => t.id)} strategry={verticalListSortingStrategy}>
                <Table hover responsive className="mb-0">
                  <thead>
                    <tr>
                      <th style={{ width: '50px' }}>#</th>
                      <th>Title</th>
                      <th>Artist</th>
                      <th>Album</th>
                      <th style={{ width: '80px' }}>BPM</th>
                      <th style={{ width: '60px' }}>Key</th>
                      <th style={{ width: '100px' }}>Duration</th>
                      <th style={{ width: '80px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {playlist.tracks.map((track) => (
                      <PlaylistTrackItem
                        key={track.id}
                        track={track}
                        disabled={isUpdatingOrder}
                        onRemove={handleRemoveTrack}
                      />
                    ))}
                  </tbody>
                </Table>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="text-center py-5 text-muted">
              <MusicNote size={48} className="mb-3 opacity-50" />
              <p>This playlist is empty</p>
            </div>
          )}
        </Card.Body>
      </Card>
      <ConfirmationPrompt show={showConfirmation}
                          title={confirmationTitle}
                          onConfirm={confirmationAction}
                          onCancel={() => setShowConfirmation(false)} />
    </div>
  )
}

PlaylistDetailView.propTypes = {
  playlistId: propTypes.number.isRequired,
  onPlaylistDeleted: propTypes.func.isRequired,
  onPlaylistUpdated: propTypes.func.isRequired
}

export default PlaylistDetailView
