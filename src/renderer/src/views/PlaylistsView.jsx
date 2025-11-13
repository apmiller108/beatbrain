import { useState, useEffect } from 'react'
import { Button, Alert, Spinner, Badge, Toast, ToastContainer } from 'react-bootstrap'
import PropTypes from 'prop-types'
import { MusicNoteList, ExclamationTriangleFill, CheckCircleFill, ExclamationCircleFill } from 'react-bootstrap-icons'
import PlaylistForm from '../components/PlaylistForm'

const PlaylistsView = ({ mixxxStats, mixxxStatus, onPlaylistCreated, handleShowConnectionModal }) => {
  const [loading, setLoading] = useState(true)
  const [maxCount, setMaxCount] = useState(100)
  const [bpmRange, setBpmRange] = useState({ minBpm: 0, maxBpm: 300 })
  const [genres, setGenres] = useState([])
  const [filters, setFilters] = useState({
    trackCount: 25,
    minBpm: null,
    maxBpm: null,
    genres: [],
  })
  const [filteredTracks, setFilteredTracks] = useState([])
  const [notification, setNotification] = useState({
    show: false,
    type: 'success', // 'success' or 'error'
    message: '',
    details: ''
  })

  useEffect(() => {
    const loadSavedFilters = async () => {
      try {
        const savedFilters = await window.api.getTrackFilters()
        if (savedFilters) {
          const parsedFilters = JSON.parse(savedFilters)
          setFilters(parsedFilters)
        }
        setLoading(false)
      } catch (error) {
        console.error('Error loading saved filters:', error)
      } finally {
        setLoading(false)
      }
    }
    loadSavedFilters()
  }, [])

  useEffect(() => {
    // TODO remove this. Debug logging for filters during development
    console.log('Filters updated:', JSON.stringify(filters, null, 2))

    const getTracks = async () => {
      try {
        const tracks = await window.api.mixxx.getTracks(filters)
        setFilteredTracks(tracks)
      } catch (error) {
        console.error('Error fetching tracks:', error)
      }
    }

    window.api.saveTrackFilters(filters)

    if (mixxxStatus?.isConnected) {
      getTracks()
    }
  }, [filters, mixxxStatus])

  useEffect(() => {
    const getGenres = async () => {
      const availableGenres = await window.api.mixxx.getGenres() || []
      setGenres(availableGenres)
    }

    if (mixxxStatus?.isConnected) {
      getGenres()
    }

    if (mixxxStats) {
      setMaxCount(mixxxStats.totalTracks)
      setBpmRange({
        minBpm: Math.floor(mixxxStats.bpmRange.minBpm),
        maxBpm: Math.ceil(mixxxStats.bpmRange.maxBpm)
      })
    }
  }, [mixxxStats, mixxxStatus])

  // Track count indicator logic
  const filteredCount = filteredTracks.length
  const desiredCount = filters.trackCount
  const isCountSufficient = filteredCount >= desiredCount

  // Is the form valid for generating a playlist
  const canGeneratePlaylist = mixxxStatus?.isConnected && !loading && isCountSufficient

  const showNotification = (type, message, details = '') => {
    setNotification({
      show: true,
      type,
      message,
      details
    })
  }

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, show: false }))
  }

  const onGeneratePlaylist = async () => {
    try {
      setLoading(true)

      const name = `Playlist ${new Date().toLocaleString()}`
      const playlist = await window.api.createPlaylist({
        name,
        description: 'A playlist created from Mixxx tracks',
      }, filteredTracks)

      onPlaylistCreated(playlist.id)
    } catch (error) {
      console.error('Error generating playlist:', error)
      showNotification(
        'error',
        'Failed to create playlist',
        error.message || 'An unexpected error occurred. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const TrackCountStatus = () => {
    if (!mixxxStatus?.isConnected || loading) return null

    return (
      <div className="mb-3">
        <div className="d-flex align-items-center mb-2">
          <Badge
            bg={isCountSufficient ? 'success' : 'danger'}
            className="me-2"
          >
            {filteredCount} tracks found
          </Badge>
          {!isCountSufficient && (
            <small className="text-muted">
              (need {desiredCount} for playlist)
            </small>
          )}
        </div>

        {!isCountSufficient && (
          <Alert variant="warning" className="py-2 mb-0">
            <div className="d-flex align-items-center">
              <ExclamationTriangleFill className="me-2" size={16} />
              <small>
                <strong>Not enough tracks found.</strong> Try adjusting your filters or lowering the track count.
              </small>
            </div>
          </Alert>
        )}
      </div>
    )
  }

  return (
    <div>
      <h2 className="mb-4 d-flex justify-content-start align-items-center">
        <MusicNoteList className="me-2" />
        Playlists
      </h2>

      {/* Toast Notification */}
      <ToastContainer position="top-center"
                      className="p-3"
                      style={{ position: 'fixed', zIndex: 9999 }}>
        <Toast
          show={notification.show}
          onClose={hideNotification}
          delay={5000}
          autohide
          bg={notification.type === 'success' ? 'success' : 'danger'}
        >
          <Toast.Header closeButton={true}>
            {notification.type === 'success' ? (
              <CheckCircleFill className="me-2" size={16} />
            ) : (
              <ExclamationCircleFill className="me-2" size={16} />
            )}
            <strong className="me-auto">
              {notification.type === 'success' ? 'Success' : 'Error'}
            </strong>
          </Toast.Header>
          <Toast.Body className="text-white">
            <div className="mb-1"><strong>{notification.message}</strong></div>
            {notification.details && (
              <small>{notification.details}</small>
            )}
          </Toast.Body>
        </Toast>
      </ToastContainer>

      {loading ? (
        <div className="d-flex justify-content-center align-items-center py-4">
          <Spinner animation="border" role="status" className="me-2">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <span>Loading filters...</span>
        </div>
      ) : (
        <>
          {mixxxStatus?.isConnected === true ? (
            <>
              <TrackCountStatus />
              <PlaylistForm
                filters={filters}
                onFiltersChange={setFilters}
                maxTrackCount={maxCount}
                bpmRange={bpmRange}
                availableGenres={genres}
                onGeneratePlaylist={onGeneratePlaylist}
                isValid={canGeneratePlaylist}
              />
            </>
          ) : (
            <Alert variant="warning" className="d-flex align-items-center justify-content-between">
              <div>
                <Alert.Heading className="h6 mb-1">Database Not Connected</Alert.Heading>
                <p className="mb-0">
                  Connect to your Mixxx database to start creating playlists.
                </p>
              </div>
              <Button
                variant="primary"
                onClick={handleShowConnectionModal}
                className="ms-3"
              >
                Configure Database
              </Button>
            </Alert>
          )}
        </>
      )}
    </div>
  )
}

PlaylistsView.propTypes = {
  mixxxStats: PropTypes.shape({
    totalTracks: PropTypes.number,
    bpmRange: PropTypes.shape({
      minBpm: PropTypes.number,
      maxBpm: PropTypes.number,
    })
  }),
  mixxxStatus: PropTypes.shape({
    isConnected: PropTypes.bool.isRequired,
  }),
  handleShowConnectionModal: PropTypes.func.isRequired
}

export default PlaylistsView
