import { useState, useEffect } from 'react'
import { Button, Alert, Spinner } from 'react-bootstrap'
import PropTypes from 'prop-types'
import { MusicNoteList } from 'react-bootstrap-icons'
import PlaylistFilters from '../components/PlaylistFilters'

const PlaylistsView = ({ mixxxStats, mixxxStatus, handleShowConnectionModal }) => {
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
    window.api.saveTrackFilters(filters)
  }, [filters])

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

  return (
    <div>
      <h2 className="mb-4 d-flex justify-content-start align-items-center">
        <MusicNoteList className="me-2" />
        Playlists
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
            <PlaylistFilters
              filters={filters}
              onFiltersChange={setFilters}
              maxTrackCount={maxCount}
              bpmRange={bpmRange}
              availableGenres={genres}
            />
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
