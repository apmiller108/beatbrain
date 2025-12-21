import { useContext, useState, useEffect } from 'react'
import { MixxxStatsContext } from '../contexts/MixxxStatsContext'
import { Button, Spinner, Badge } from 'react-bootstrap'
import PropTypes from 'prop-types'
import { MusicNoteList } from 'react-bootstrap-icons'
import PlaylistForm from '../components/playlist/PlaylistForm'
import FlashMessage from '../components/common/FlashMessage'

const PlaylistCreationView = ({ mixxxStatus, onPlaylistCreated, handleShowConnectionModal, setNotification }) => {
  const [loading, setLoading] = useState(true)
  const [maxCount, setMaxCount] = useState(100)
  const [filterOptions, setFilterOptions] = useState({
    bpmRange: { minBpm: 0, maxBpm: 300 },
    genres: [],
    crates: [],
    keys: [],
    groupings: []
  })
  const [selectedFilters, setSelectedFilters] = useState({
    trackCount: 25,
    minBpm: null,
    maxBpm: null,
    genres: [],
    crates: [],
    groupings: [],
    keys: []
  })
  const [filteredTracks, setFilteredTracks] = useState([])

  const mixxxStats = useContext(MixxxStatsContext)

  useEffect(() => {
    const loadSavedFilters = async () => {
      try {
        const savedFilters = await window.api.getTrackFilters()
        if (savedFilters) {
          const parsedFilters = JSON.parse(savedFilters)
          setSelectedFilters(prevFilters => ({ ...prevFilters, ...parsedFilters }))
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
    const getTracks = async () => {
      try {
        // Flatten keys array of objects to array of values. This is weird but
        // necessary due to how the KeyMultiSelect component normalizes the
        // select input's values (ie, camelot notation) a single value which
        // can correspond to multiple keys as stored in mixxxdb.
        const keys = selectedFilters.keys.flatMap(key => key.value)
        const crates = selectedFilters.crates.map(crate => crate.value) // Extract crate IDs
        const quereyParams = { ...selectedFilters, keys, crates }
        const tracks = await window.api.mixxx.getTracks(quereyParams)
        setFilteredTracks(tracks)
      } catch (error) {
        console.error('Error fetching tracks:', error)
      }
    }

    window.api.saveTrackFilters(selectedFilters)

    if (mixxxStatus?.isConnected) {
      getTracks()
    }
  }, [selectedFilters, mixxxStatus])

  useEffect(() => {
    const getFilterOptions = async () => {
      const availableGenres = await window.api.mixxx.getAvailableGenres() || []
      const availableCrates = await window.api.mixxx.getAvailableCrates() || []
      const availableKeys = await window.api.mixxx.getAvailableKeys() || []
      const availableGroupings = await window.api.mixxx.getAvailableGroupings() || []

      let bpmRange = { minBpm: 0, maxBpm: 300 }
      if (mixxxStats) {
        bpmRange = {
          minBpm: Math.floor(mixxxStats.bpmRange.minBpm),
          maxBpm: Math.ceil(mixxxStats.bpmRange.maxBpm)
        }
      }

      setFilterOptions(prevOptions => ({
        ...prevOptions,
        bpmRange,
        genres: availableGenres,
        crates: availableCrates,
        keys: availableKeys,
        groupings: availableGroupings
      }))
    }

    if (mixxxStatus?.isConnected) {
      getFilterOptions()
    }
  }, [mixxxStats, mixxxStatus])

  // Track count indicator logic
  const filteredCount = filteredTracks.length
  const desiredCount = selectedFilters.trackCount
  const isCountSufficient = filteredCount >= desiredCount

  // Is the form valid for generating a playlist
  const canGeneratePlaylist = mixxxStatus?.isConnected && !loading && isCountSufficient

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
      setNotification({
        show: true,
        type: 'error',
        message: 'Failed to create playlist',
        details: error.message || 'An unexpected error occurred. Please try again.'
      })
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
          <FlashMessage variant="warning"
                        className="py-2 mb-0"
                        message={<div><strong>Not enough tracks found </strong>Try adjusting your filters or lowering the track count</div>} />
        )}
      </div>
    )
  }

  return (
    <div>
      <h2 className="mb-4 d-flex justify-content-start align-items-center">
        <MusicNoteList className="me-2" />
        Create Playlist
      </h2>

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
                filters={selectedFilters}
                onFiltersChange={setSelectedFilters}
                maxTrackCount={maxCount}
                bpmRange={filterOptions.bpmRange}
                availableGenres={filterOptions.genres}
                availableCrates={filterOptions.crates}
                availableKeys={filterOptions.keys}
                onGeneratePlaylist={onGeneratePlaylist}
                isValid={canGeneratePlaylist}
              />
            </>
          ) : (
            <FlashMessage variant="warning"
                          heading="Database Not Connected"
                          message="Connect to your Mixxx database to start creating playlists."
                          action={
                            <Button
                              variant="primary"
                              onClick={handleShowConnectionModal}
                              className="ms-3"
                            >
                              Configure Database
                            </Button>
                          }/>
          )}
        </>
      )}
    </div>
  )
}

PlaylistCreationView.propTypes = {
  mixxxStatus: PropTypes.shape({
    isConnected: PropTypes.bool.isRequired,
  }),
  handleShowConnectionModal: PropTypes.func.isRequired,
  onPlaylistCreated: PropTypes.func.isRequired,
  setNotification: PropTypes.func.isRequired
}

export default PlaylistCreationView
