import { useState, useEffect } from 'react'
import { Card, Spinner, Badge, Table, Button } from 'react-bootstrap'
import { Clock, MusicNote, Calendar, BoxArrowDown, Trash3, Pencil } from 'react-bootstrap-icons'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'
import propTypes from 'prop-types'
import { formatDuration } from '../utilities'
import ConfirmationPrompt from '../components/common/ConfirmationPrompt'
import FlashMessage from '../components/common/FlashMessage'
import PlaylistTrackItem from '../components/PlaylistTrackItem'

const PlaylistDetailView = ({ playlistId, onPlaylistDeleted, onPlaylistUpdated }) => {
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
  const [isEditingName, setIsEditingName] = useState(false)
  const [editingName, setEditingName] = useState('')
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [editingDescription, setEditingDescription] = useState('')

  useEffect(() => {
    loadPlaylist()
  }, [playlistId])

  useEffect(() => {
    calculatePlaylistStats()
    if (playlist) {
      setEditingName(playlist.name)
    }
  }, [playlist])

  const loadPlaylist = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await window.api.getPlaylistById(playlistId)
      setPlaylist(data)
      setEditingName(data.name)
      setEditingDescription(data.description || '')
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

  const onEditingHame = () => {
    setIsEditingName(true)
    // Focus the input after state update
    setTimeout(() => {
      const input = document.querySelector('#playlist-name-input')
      if (input) {
        input.focus()
        input.select()
      }
    }, 0)
  }

  const onEditingDescription = () => {
    setIsEditingDescription(true)
    // Focus the input after state update
    setTimeout(() => {
      const input = document.querySelector('#playlist-description-input')
      if (input) {
        input.focus()
        input.select()
      }
    }, 0)
  }

  const handleSave = async () => {
    if (!editingName.trim()) {
      setPlaylistError('Playlist name cannot be empty.')
      return
    }
    const attributes = {}
    if (isEditingName && editingName !== playlist.name) {
      attributes.name = editingName
    }
    if (isEditingDescription && editingDescription !== (playlist.description || '')) {
      attributes.description = editingDescription
    }
    console.log('Saving playlist attributes:', attributes)
    if (Object.keys(attributes).length === 0) {
      setIsEditingName(false)
      setIsEditingDescription(false)
      return
    }

    try {
      await window.api.updatePlaylist(playlist.id, attributes)
      setPlaylist(prev => ({ ...prev, ...attributes }))
      setIsEditingName(false)
      setIsEditingDescription(false)
      onPlaylistUpdated(playlist.id, attributes)
    } catch (err) {
      console.error('Failed to update playlist:', err)
      setPlaylistError(`Failed to update playlist: ${err.message}`)
    }
  }

  const handleRemoveTrack = (trackId) => {
    const track = playlist.tracks.find(t => t.id === trackId)
    setConfirmationTitle(`Are you sure you want to remove "${track.title}" from the playlist?`)
    setShowConfirmation(true)
    setConfirmationAction(() => async () => {
      try {
        await window.api.removeTrackFromPlaylist(playlistId, trackId)
        // Optimistically update the UI
        setPlaylist(prevPlaylist => ({
          ...prevPlaylist,
          tracks: prevPlaylist.tracks.filter(t => t.id !== trackId)
        }))
        calculatePlaylistStats()
        onPlaylistUpdated(playlistId)
      } catch (err) {
        console.error('Failed to remove track:', err)
        setPlaylistError(`Failed to remove track: ${err.message}`)
      } finally {
        setShowConfirmation(false)
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
              {isEditingName ? (
                <div className="d-flex align-items-center">
                  <input
                    type="text"
                    id="playlist-name-input"
                    className="form-control me-2"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSave()
                      }
                    }}
                    onBlur={handleSave}
                  />
                </div>
              ) : (
                <div className="d-flex align-items-center justify-content-start">
                  <h2 className="mb-0">{playlist.name}</h2>
                  <Button variant="link" onClick={onEditingHame} className="ms-2"><Pencil/></Button>
                </div>
              )}
              <div className="mt-1">
                {isEditingDescription ? (
                  <div className="d-flex flex-column">
                    <input
                      className="form-control mb-2"
                      id="playlist-description-input"
                      value={editingDescription}
                      onChange={(e) => setEditingDescription(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSave()
                        }
                      }}
                      onBlur={handleSave}
                    />
                  </div>
                ) : (
                  <div className="d-flex align-items-center">
                    <p className="text-muted mb-0">
                      {playlist.description || <span className="text-muted fst-italic">No description</span>}
                    </p>
                    <Button variant="link" onClick={onEditingDescription} className="ms-2"><Pencil/></Button>
                  </div>
                )
                }
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

            {/* Action Buttons - Placeholder for now */}
            <div className="d-flex gap-2">
              <OverlayTrigger overlay={<Tooltip>Export Playlist</Tooltip>}>
                <Button variant="primary">
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
          <h5 className="mb-0">Tracks</h5>
        </Card.Header>
        <Card.Body className="p-0">
          {playlist.tracks && playlist.tracks.length > 0 ? (
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
                {playlist.tracks.map((track, index) => (
                  <PlaylistTrackItem
                    key={track.id}
                    track={track}
                    position={index + 1}
                    onRemove={handleRemoveTrack}
                  />
                ))}
              </tbody>
            </Table>
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
