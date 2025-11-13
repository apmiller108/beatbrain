import { useState, useEffect } from 'react'
import { Card, Spinner, Alert, Badge, Table, Button } from 'react-bootstrap'
import { Clock, MusicNote, Calendar, BoxArrowDown, Trash3, ExclamationTriangleFill } from 'react-bootstrap-icons'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'
import propTypes from 'prop-types'
import { formatDuration } from '../utilities'
import ConfirmationPrompt from '../components/common/ConfirmationPrompt'

const PlaylistDetailView = ({ playlistId, onPlaylistDeleted }) => {
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
      <Alert variant="danger">
        <Alert.Heading>Error Loading Playlist</Alert.Heading>
        <p>{error}</p>
      </Alert>
    )
  }

  return (
    <div className="playlist-detail-view">
      { playlistError && (
        <Alert variant="warning" className="c-alert py-2 mb-2" onClose={() => setPlaylistError(null)} dismissible>
          <div className="d-flex align-items-center">
            <ExclamationTriangleFill className="me-2" size={16} />
            <small>
              <strong>{playlistError}</strong>
            </small>
          </div>
        </Alert>
      )}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h2 className="mb-3">{playlist.name}</h2>
              {playlist.description && (
                <p className="text-muted mb-3">{playlist.description}</p>
              )}

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
                <div className="d-flex align-items-center">
                  <Calendar className="me-2" />
                  <span>Created {new Date(playlist.created_at).toLocaleDateString()}</span>
                </div>
                {playlistStats.avgBpm > 0 && (
                  <div>
                    <Badge bg="info">Avg BPM: {playlistStats.avgBpm}</Badge>
                  </div>
                )}
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
                  <tr key={track.id}>
                    <td className="text-muted">{index + 1}</td>
                    <td>
                      <strong>{track.title || 'Unknown Title'}</strong>
                    </td>
                    <td>{track.artist || 'Unknown Artist'}</td>
                    <td className="text-muted">{track.album || '-'}</td>
                    <td>
                      {track.bpm ? (
                        <Badge bg="secondary">{Math.round(track.bpm)}</Badge>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>
                      {track.key ? (
                        <Badge bg="primary">{track.key}</Badge>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="text-muted">
                      {track.duration ? formatDuration(track.duration) : '-'}
                    </td>
                    <td>
                      {/* Action buttons will go here */}
                    </td>
                  </tr>
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
  playlistId: propTypes.number.isRequired
}

export default PlaylistDetailView
